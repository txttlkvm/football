"""Independent rendered-player QA. Does not modify application files.

Serve /workspace/football on port 8000, then run this script. Optional:
  python tools/verify_artwork.py --source-url http://127.0.0.1:8000/
Reports and screenshots go to qa/artwork. The full behavioral suite remains required.
"""
import argparse
import base64
import hashlib
import io
import json
import mimetypes
import tempfile
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlparse

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "qa" / "artwork"
SIZES = [(1440, 810), (1365, 768)]

INVENTORY_JS = """() => {
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
 const active=document.querySelector('.slide.active');
 const list=[...active.querySelectorAll('img')].filter(visible);
 return list.map(img=>{
   const r=img.getBoundingClientRect();const f=img.closest('.field');
   let mirrored=false;
   for(let e=img;e&&e!==active;e=e.parentElement){
     const t=getComputedStyle(e).transform;
     if(t&&t!=='none'){const m=new DOMMatrixReadOnly(t);if(m.a*m.d-m.b*m.c<0)mirrored=!mirrored}
   }
   const fr=f&&f.getBoundingClientRect();
   const fieldClipped=fr&&(r.left<fr.left-1||r.top<fr.top-1||r.right>fr.right+1||r.bottom>fr.bottom+1);
   const owner=img.closest('[role=img]');
   return {src:img.currentSrc||img.src,alt:img.alt,ownerLabel:owner&&owner.getAttribute('aria-label'),
     width:r.width,height:r.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
     complete:img.complete,scene:f&&f.dataset.scene,fieldClipped:!!fieldClipped,mirrored,
     classes:img.className,role:img.closest('.player-actor')?.className||null};
 });
}"""

LAYOUT_JS = """() => {
 const s=document.querySelector('.slide.active'), sr=s.getBoundingClientRect(),issues=[];
 const visible=e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&r.height>0};
 for(const e of s.querySelectorAll('button,p,h1,h2,h3,.feedback,.player-actor,img')){
   if(!visible(e))continue;const r=e.getBoundingClientRect();
   if(r.bottom>sr.bottom+1||r.top<sr.top-1||r.left<sr.left-1||r.right>sr.right+1)issues.push('outside slide: '+(e.id||e.className||e.tagName));
   const box=e.closest('.diagnostic-card,.scenario-card,.pose-choice,.decision-panel,.teach-panel');
   if(box){const br=box.getBoundingClientRect();if(r.bottom>br.bottom+1||r.top<br.top-1)issues.push('outside card: '+(e.id||e.className||e.tagName));}
 }
 for(const e of s.querySelectorAll('.feedback,.diagnostic-card,.scenario-card,.decision-panel,.teach-panel,#sortList'))
   if(visible(e)&&e.scrollHeight>e.clientHeight+2)issues.push('overflow: '+(e.id||e.className));
 if(document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth)issues.push('page scroll');
 return issues;
}"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-url", default="http://127.0.0.1:8000/")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    report = {"checks": [], "errors": [], "failed_requests": [], "remote_requests": [], "images": {}, "states": []}

    def check(name, passed, detail=None):
        item = {"check": name, "passed": bool(passed)}
        if detail:
            item["detail"] = detail
        report["checks"].append(item)

    def wire(page, prefix, origin=None):
        page.on("pageerror", lambda e: report["errors"].append({"where": prefix, "error": str(e)}))
        page.on("requestfailed", lambda r: report["failed_requests"].append({"where": prefix, "url": r.url[:200], "error": r.failure}))
        def request(r):
            parsed = urlparse(r.url)
            if parsed.scheme in {"http", "https"} and (not origin or r.url.startswith(origin) is False):
                report["remote_requests"].append({"where": prefix, "url": r.url[:200]})
        page.on("request", request)

    def collect(page, name, capture=True):
        page.wait_for_timeout(100)
        page.locator(".slide.active img").evaluate_all("imgs => Promise.all(imgs.map(i => i.decode().catch(()=>{})))")
        images = page.evaluate(INVENTORY_JS)
        issues = page.evaluate(LAYOUT_JS)
        check(name + " fits fixed stage", not issues, issues)
        for image in images:
            source = image.pop("src")
            key = hashlib.sha256(source.encode()).hexdigest()[:16]
            if key not in report["images"]:
                report["images"][key] = {"url": source[:180], "states": [], "naturalWidth": image["naturalWidth"], "naturalHeight": image["naturalHeight"]}
                inspect_source(source, key, report)
            report["images"][key]["states"].append(name)
            image["imageKey"] = key
        expects_players = page.locator(".slide.active .field, .slide.active .player-actor").count() > 0
        if expects_players:
            check(name + " player artwork present", bool(images))
        check(name + " all images loaded", all(i["complete"] and i["naturalWidth"] > 0 for i in images))
        check(name + " accessible image names", all((i["alt"] or i["ownerLabel"] or "").strip() for i in images))
        check(name + " no image clipping", all(not i["fieldClipped"] for i in images))
        check(name + " no mirrored raster jersey numbers", all(not i["mirrored"] for i in images))
        check(name + " adequate native pixel size", all(i["naturalWidth"] >= i["width"] and i["naturalHeight"] >= i["height"] for i in images))
        report["states"].append({"name": name, "images": images, "layout_issues": issues})
        if capture:
            page.screenshot(path=str(OUT / (name + ".png")))
        return [image["imageKey"] for image in images]

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        page = browser.new_page(viewport={"width": 1440, "height": 810}, device_scale_factor=1)
        wire(page, "source", args.source_url.rstrip("/"))
        page.goto(args.source_url, wait_until="networkidle")
        check("source has 22 slides", page.locator(".slide").count() == 22)
        for width, height in SIZES:
            page.set_viewport_size({"width": width, "height": height})
            page.evaluate("resetCourse()")
            for index in range(22):
                if index:
                    page.locator("#nextButton").click()
                page.wait_for_timeout(330)
                # The completion slide deliberately contains no player artwork.
                if index < 21:
                    collect(page, f"source-{width}x{height}-slide-{index+1:02}")
                else:
                    check(f"source-{width}x{height}-completion fits", not page.evaluate(LAYOUT_JS))
                    page.screenshot(path=str(OUT / f"source-{width}x{height}-slide-22.png"))

            # The changed poses on successful answers and restored poses on retry
            # are the most likely artwork-only regressions beyond initial rendering.
            page.evaluate("resetCourse(); goTo(6)")
            page.wait_for_timeout(330)
            eyes_before = collect(page, f"source-{width}x{height}-eyes-before")
            page.locator("#repChoices button").nth(1).click()
            page.wait_for_timeout(800)
            eyes_correct = collect(page, f"source-{width}x{height}-eyes-correct")
            check(f"{width}x{height} eyes correction changes artwork", eyes_correct != eyes_before)
            page.locator("#replayButton").click()
            eyes_retry = collect(page, f"source-{width}x{height}-eyes-retry")
            check(f"{width}x{height} eyes retry restores original artwork", eyes_retry == eyes_before)
            page.evaluate("goTo(20)")
            page.wait_for_timeout(330)
            game_before = collect(page, f"source-{width}x{height}-game-before")
            for index in range(3):
                page.locator("#gameScenarios .scenario-card").nth(index).locator("button").nth(0).click()
            page.wait_for_timeout(800)
            game_correct = collect(page, f"source-{width}x{height}-game-correct")
            check(f"{width}x{height} Game-Day corrections change artwork", game_correct != game_before)
            page.evaluate("resetCourse(); goTo(20)")
            page.wait_for_timeout(330)
            game_restart = collect(page, f"source-{width}x{height}-game-restart")
            check(f"{width}x{height} restart restores Game-Day artwork", game_restart == game_before)

        offline = browser.new_context(viewport={"width": 1440, "height": 810}, offline=True)
        portable = offline.new_page()
        wire(portable, "standalone")
        portable.set_content((ROOT / "finish-the-tackle.html").read_text(), wait_until="load")
        for index in range(21):
            if index:
                portable.locator("#nextButton").click()
            portable.wait_for_timeout(330)
            collect(portable, f"standalone-offline-slide-{index+1:02}", capture=index in [0, 10, 20])

        with tempfile.TemporaryDirectory(prefix="football-artwork-zip-") as temp:
            with zipfile.ZipFile(ROOT / "finish-the-tackle.zip") as bundle:
                bundle.extractall(temp)
                names = bundle.namelist()
                check("ZIP includes source and standalone", all(name in names for name in ["index.html", "finish-the-tackle.html"]))
                report["zip_image_files"] = [name for name in names if Path(name).suffix.lower() in {".png", ".webp", ".jpg", ".jpeg", ".avif"}]
            zipped = offline.new_page()
            # Managed Chromium blocks file:// navigation. Route the extracted
            # ZIP bytes from a synthetic origin; offline mode still prevents
            # network access, and no server or external request is involved.
            zip_origin = "http://offline-course.invalid/"
            def zip_resource(route):
                relative = unquote(urlparse(route.request.url).path).lstrip("/") or "index.html"
                resource = Path(temp) / relative
                if resource.is_file():
                    route.fulfill(path=str(resource), content_type=mimetypes.guess_type(resource)[0] or "application/octet-stream")
                else:
                    route.fulfill(status=404, body="Missing ZIP asset")
            zipped.route(zip_origin + "**", zip_resource)
            wire(zipped, "zip source", zip_origin)
            zipped.goto(zip_origin + "index.html", wait_until="load")
            for index in [0, 10, 20]:
                zipped.evaluate("i=>goTo(i)", index)
                zipped.wait_for_timeout(330)
                collect(zipped, f"zip-source-offline-slide-{index+1:02}")

        browser.close()

    check("zero JavaScript errors", not report["errors"], report["errors"])
    check("zero failed resource requests", not report["failed_requests"], report["failed_requests"])
    check("zero remote runtime dependencies", not report["remote_requests"], report["remote_requests"])
    inspected_images = [image for image in report["images"].values() if "transparent_background" in image]
    check("rendered player files preserve transparent backgrounds", bool(inspected_images) and all(image["transparent_background"] for image in inspected_images))
    report["passed"] = sum(c["passed"] for c in report["checks"])
    report["failed"] = [c for c in report["checks"] if not c["passed"]]
    (OUT / "artwork-verification.json").write_text(json.dumps(report, indent=2))
    make_contact_sheet()
    print(json.dumps({"passed": report["passed"], "failed": report["failed"], "distinct_images": len(report["images"]), "report": str(OUT / "artwork-verification.json")}, indent=2))
    raise SystemExit(bool(report["failed"]))


def inspect_source(source, key, report):
    """Alpha/padding evidence is informational for the visual reviewer."""
    try:
        if source.startswith("data:image/"):
            header, data = source.split(",", 1)
            stream = io.BytesIO(base64.b64decode(data) if ";base64" in header else unquote(data).encode())
        elif urlparse(source).scheme in {"http", "https"}:
            path = ROOT / unquote(urlparse(source).path).lstrip("/")
            if not path.exists():
                return
            stream = path
        elif source.startswith("file:"):
            stream = Path(unquote(urlparse(source).path))
        else:
            return
        with Image.open(stream) as image:
            alpha = image.convert("RGBA").getchannel("A")
            report["images"][key]["transparent_background"] = alpha.getextrema()[0] == 0
            report["images"][key]["visible_bbox"] = alpha.getbbox()
    except (ValueError, OSError):
        pass


def make_contact_sheet():
    paths = sorted(OUT.glob("source-1440x810-slide-*.png"))
    width, height = 480, 270
    sheet = Image.new("RGB", (width * 4, (height + 25) * ((len(paths) + 3) // 4)), "#091424")
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(paths):
        image = Image.open(path).convert("RGB").resize((width, height))
        left = (index % 4) * width
        top = (index // 4) * (height + 25)
        sheet.paste(image, (left, top))
        draw.text((left + 8, top + height + 5), path.stem, fill="white")
    if paths:
        sheet.save(OUT / "artwork-contact-sheet.jpg", quality=92)
    feedback_paths = [ROOT / "qa" / "after" / f"try-{pair:02}-{state}.png" for pair in range(1, 11) for state in ["wrong", "correct"]]
    if all(path.exists() for path in feedback_paths):
        feedback = Image.new("RGB", (width * 4, (height + 25) * 5), "#091424")
        draw = ImageDraw.Draw(feedback)
        for index, path in enumerate(feedback_paths):
            left = index % 4 * width
            top = index // 4 * (height + 25)
            with Image.open(path) as image:
                feedback.paste(image.convert("RGB").resize((width, height)), (left, top))
            draw.text((left + 8, top + height + 5), path.stem, fill="white")
        feedback.save(OUT / "artwork-feedback-contact-sheet.jpg", quality=92)


if __name__ == "__main__":
    main()
