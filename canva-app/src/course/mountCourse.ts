import courseBody from "./courseBody";
import courseCss from "./courseCss";
import { startCourse } from "./courseApp";

let mounted = false;

// Canva's CSP may block inline `onclick="..."` attributes. Run them from a
// capture-phase listener instead (same function, same arguments), and stop the
// event so an allowed inline handler can never fire a second time.
function installInlineHandlerShim() {
  const argRe =
    /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|(this)|(-?\d+(?:\.\d+)?)|(true|false)/g;
  document.addEventListener(
    "click",
    (e) => {
      const el = (e.target as Element | null)?.closest?.("[onclick]");
      const code = el?.getAttribute("onclick")?.trim() ?? "";
      const m = /^([A-Za-z_$][\w$]*)\((.*)\);?$/s.exec(code);
      const name = m?.[1];
      const fn = name
        ? (window as unknown as Record<string, unknown>)[name]
        : undefined;
      if (!el || typeof fn !== "function") {
        return;
      }
      const args = [...(m?.[2] ?? "").matchAll(argRe)].map((a) => {
        if (a[3]) {
          return el;
        }
        if (a[4] !== undefined) {
          return Number(a[4]);
        }
        if (a[5]) {
          return a[5] === "true";
        }
        return a[1] ?? a[2];
      });
      e.stopImmediatePropagation();
      e.preventDefault();
      fn.apply(el, args);
    },
    true,
  );
}

function report(container: HTMLElement, msg: string) {
  const pre = document.createElement("pre");
  pre.style.cssText =
    "position:absolute;left:0;right:0;top:0;z-index:99;margin:0;padding:8px;color:#fff;background:#a00;font:11px monospace;white-space:pre-wrap";
  pre.textContent = msg;
  container.appendChild(pre);
}

// Mounts the original course (markup, CSS, JS) as the app's own page.
export function mountCourse(container: HTMLElement) {
  if (mounted) {
    return;
  }
  mounted = true;
  try {
    installInlineHandlerShim();
    const style = document.createElement("style");
    style.textContent = courseCss;
    document.head.appendChild(style);
    // Same centering/background the original page applied to <body>.
    container.style.cssText +=
      ";display:grid;place-items:center;background:#040e19;";
    container.innerHTML = courseBody;
    startCourse();
    const shell = container.querySelector(".app-shell");
    const r = shell?.getBoundingClientRect();
    const grid = shell ? getComputedStyle(shell).display : "none";
    if (!shell || grid !== "grid" || !r || r.width < 50 || r.height < 50) {
      report(
        container,
        `Course mounted but not visible: shell=${!!shell} display=${grid} size=${r?.width}x${r?.height} viewport=${window.innerWidth}x${window.innerHeight} styles=${document.styleSheets.length}`,
      );
    }
  } catch (err) {
    report(container, "Course failed to start: " + String(err));
  }
}
