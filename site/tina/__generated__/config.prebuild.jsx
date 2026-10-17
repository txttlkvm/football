// tina/config.ts
import { defineConfig } from "tinacms";

// tina/RichField.tsx
import React from "react";
import { wrapFieldsWithMeta } from "tinacms";

// src/lib/render.mjs
import { marked } from "marked";
var YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
var VM = /vimeo\.com\/(?:video\/)?(\d+)/;
var esc = (s2) => String(s2 ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
var clean = (h) => h.replace(/<\s*(script|style|iframe|object|embed|link|meta)[\s\S]*?(<\/\s*\1\s*>|$)/gi, "").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "$1=$2#$2");
var md = (s2) => clean(marked.parse(String(s2 ?? ""), { breaks: true, async: false }));
var fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
var url = (s2) => {
  const u = String(s2 ?? "").trim();
  return esc(/^\s*(javascript|data|vbscript):/i.test(u) ? "#" : u);
};
var FOCUS = { top: "50% 0%", center: "50% 50%", bottom: "50% 100%", left: "0% 50%", right: "100% 50%", face: "50% 25%" };
var imgStyle = (focus2, ratio2) => {
  const st = [];
  if (ratio2 && ratio2 !== "original") st.push(`aspect-ratio:${esc(ratio2)};object-fit:cover`);
  if (focus2 && FOCUS[focus2]) st.push(`object-position:${FOCUS[focus2]}`);
  return st.length ? ` style="${st.join(";")}"` : "";
};
var E = (ctx, i) => (key, type = "text") => ctx.edit ? ` data-e="blocks.${i}.${esc(key)}" data-t="${type}"` : "";
var btn = (label2, href, cls = "", ed = "") => label2 && href ? `<a class="btn ${cls}" href="${url(href)}"${ed}>${esc(label2)}</a>` : "";
function video(a, ctx = {}) {
  const src = String(a.url || a.file || "").trim();
  if (!src) return "";
  let inner;
  const yt = YT.exec(src), vm = VM.exec(src);
  if (yt) inner = `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(a.caption || "Video")}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  else if (vm) inner = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="${esc(a.caption || "Video")}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  else {
    const poster = ctx.posterFor ? ctx.posterFor(src) : "";
    inner = `<video class="video-file" controls playsinline preload="metadata"${poster ? ` poster="${poster}"` : ""} src="${esc(src)}"></video>`;
  }
  return `<figure class="video-figure">${inner}${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ""}</figure>`;
}
var photo = (a) => a.src ? `<figure class="photo photo-${esc(a.size || "medium")} photo-${esc(a.align || "center")}"><img src="${esc(a.src)}" alt="${esc(a.alt)}" loading="lazy" decoding="async">${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ""}</figure>` : "";
var photoRow = (a) => {
  const imgs = [1, 2, 3].filter((i) => a["photo" + i]).map((i) => `<img src="${esc(a["photo" + i])}" alt="${esc(a["alt" + i])}" loading="lazy" decoding="async">`);
  return imgs.length ? `<div class="photo-row photo-row-${imgs.length}">${imgs.join("")}</div>` : "";
};
var button = (a) => a.url && a.label ? `<p class="btn-wrap btn-${esc(a.align || "left")}"><a class="btn" href="${url(a.url)}">${esc(a.label)}</a></p>` : "";
var embeds = { video, photo, photoRow, button };
function kids(n, ctx) {
  return (n.children || []).map((c) => richNode(c, ctx)).join("");
}
function richNode(n, ctx) {
  switch (n.type) {
    case "text": {
      let t = esc(n.text);
      if (!t) return "";
      if (n.code) t = `<code>${t}</code>`;
      if (n.bold) t = `<strong>${t}</strong>`;
      if (n.italic) t = `<em>${t}</em>`;
      if (n.strikethrough) t = `<s>${t}</s>`;
      if (n.underline) t = `<u>${t}</u>`;
      return t;
    }
    case "p": {
      const k = kids(n, ctx);
      return k.trim() ? `<p>${k}</p>` : "";
    }
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return `<${n.type}>${kids(n, ctx)}</${n.type}>`;
    case "blockquote":
      return `<blockquote>${kids(n, ctx)}</blockquote>`;
    case "hr":
      return "<hr>";
    case "ul":
    case "ol":
      return `<${n.type}>${kids(n, ctx)}</${n.type}>`;
    case "li":
      return `<li>${kids(n, ctx)}</li>`;
    case "lic":
      return kids(n, ctx);
    case "a":
      return `<a href="${url(n.url)}">${kids(n, ctx)}</a>`;
    case "img":
      return n.url ? `<img src="${esc(n.url)}" alt="${esc(n.alt)}">` : "";
    case "break":
      return "<br>";
    case "code_block":
      return `<pre><code>${esc(n.value)}</code></pre>`;
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement":
      return embeds[n.name] ? embeds[n.name](n.props || {}, ctx) : "";
    default:
      return kids(n, ctx);
  }
}
var richText = (ast, ctx = {}) => ast && ast.children ? kids(ast, ctx) : "";
var bgOf = (b) => b.background === "soft" ? "cream" : b.background === "dark" ? "dark" : "";
var section = (b, cls, inner) => `<section class="section blk ${cls} ${bgOf(b)}"><div class="wrap">${inner}</div></section>`;
var card = (p) => `<a class="card" href="/${esc(p.slug)}/">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : '<div class="ph"></div>'}<div class="b">${(p.cats || [])[0] ? `<div class="cat-eyebrow">${esc(p.cats[0])}</div>` : ""}<h3>${esc(p.title)}</h3>${p.excerpt ? `<p class="clamp">${esc(String(p.excerpt).replace(/…+$|\.{3}$/, ""))}</p>` : ""}<div class="meta">${fmtDate(p.date)}</div></div></a>`;
var blockTypes = {
  hero: (b, ctx, i) => {
    const e = E(ctx, i);
    return `<section class="hero hero-${esc(b.height || "tall")}" style="--hero-img:url('${esc(encodeURI(String(b.image || "/img/hero.jpg")).replace(/'/g, "%27"))}');--hero-pos:${FOCUS[b.focus] || "center right"}"${e("image", "img")}><div class="wrap"><h1${e("heading")}>${esc(b.heading)}</h1>${b.text ? `<p${e("text")}>${esc(b.text)}</p>` : ""}${btn(b.buttonLabel, b.buttonUrl, "", e("buttonLabel"))} ${btn(b.button2Label, b.button2Url, "btn-outline", e("button2Label"))}</div></section>`;
  },
  text: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, `blk-text blk-${esc(b.align || "left")} blk-${esc(b.width || "narrow")}`, `${b.heading ? `<h2 class="title"${e("heading")}>${esc(b.heading)}</h2>` : ""}<div class="body"${e("text", "field")}>${md(b.text)}</div>`);
  },
  imageText: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, `blk-imagetext side-${esc(b.imageSide || "left")}`, `<div class="it"><div class="it-img">${b.image ? `<img src="${esc(b.image)}" alt="${esc(b.alt)}" loading="lazy"${imgStyle(b.focus, b.ratio)}${e("image", "img")}>` : ""}</div><div class="it-txt">${b.heading ? `<h2${e("heading")}>${esc(b.heading)}</h2>` : ""}<div class="body"${e("text", "field")}>${md(b.text)}</div>${b.buttonLabel ? `<p>${btn(b.buttonLabel, b.buttonUrl, "", e("buttonLabel"))}</p>` : ""}</div></div>`);
  },
  gallery: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, "blk-gallery", `${b.title ? `<h2 class="title"${e("title")}>${esc(b.title)}</h2>` : ""}<div class="gal gal-${esc(b.perRow || "3")}">${(b.images || []).map((im, j) => im && im.src ? `<figure><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy"${imgStyle(im.focus, b.ratio || "4/3")}${e(`images.${j}.src`, "img")}>${im.caption ? `<figcaption${e(`images.${j}.caption`)}>${esc(im.caption)}</figcaption>` : ""}</figure>` : "").join("")}</div>`);
  },
  feature: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, "blk-feature", `<div class="feature">${b.image ? `<img src="${esc(b.image)}" alt="" loading="lazy"${imgStyle(b.focus, b.ratio)}${e("image", "img")}>` : ""}<div>${b.eyebrow ? `<p class="eyebrow"${e("eyebrow")}>${esc(b.eyebrow)}</p>` : ""}<h2${e("heading")}>${esc(b.heading)}</h2><div class="body"${e("text", "field")}>${md(b.text)}</div><p>${btn(b.buttonLabel, b.buttonUrl, "", e("buttonLabel"))} ${b.linkLabel && b.linkUrl ? `<a class="more" href="${url(b.linkUrl)}"${e("linkLabel")}>${esc(b.linkLabel)}</a>` : ""}</p></div></div>`);
  },
  cta: (b, ctx, i) => {
    const e = E(ctx, i);
    return `<section class="section blk"><div class="wrap"><div class="cta-band cta-${esc(b.style || "pink")}"><h2${e("heading")}>${esc(b.heading)}</h2>${b.text ? `<p${e("text")}>${esc(b.text)}</p>` : ""}${btn(b.buttonLabel, b.buttonUrl, "btn-inv", e("buttonLabel"))}</div></div></section>`;
  },
  video: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, "blk-video", `<div class="blk-narrow"${e("url", "field")}>${video(b, ctx) || '<p class="empty-hint">Click here to add a video</p>'}</div>`);
  },
  quote: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, "blk-quote", `<blockquote><p${e("text")}>${esc(b.text)}</p>${b.author ? `<cite${e("author")}>\u2014 ${esc(b.author)}</cite>` : ""}</blockquote>`);
  },
  postGrid: (b, ctx, i) => {
    const e = E(ctx, i);
    const list = (ctx.posts || []).filter((p) => !b.category || (p.cats || []).includes(b.category)).slice(0, Number(b.count) || 6);
    return list.length ? section(b, "blk-posts", `${b.title ? `<h2 class="title"${e("title")}>${esc(b.title)}</h2>` : ""}<div class="grid">${list.map(card).join("")}</div>`) : "";
  },
  featuredPost: (b, ctx, i) => {
    const e = E(ctx, i);
    const p = (ctx.posts || []).find((x) => x.featured);
    return p ? section(b, "blk-featured", `${b.title ? `<h2 class="title"${e("title")}>${esc(b.title)}</h2>` : ""}<div class="feature">${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy">` : ""}<div><p class="eyebrow">${fmtDate(p.date)}</p><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p><p><a class="btn" href="/${esc(p.slug)}/">Read the post</a></p></div></div>`) : "";
  },
  categoryTiles: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, "blk-cats", `${b.title ? `<h2 class="title"${e("title")}>${esc(b.title)}</h2>` : ""}<div class="grid">${(b.tiles || []).map((c, j) => c && c.slug ? `<a class="card cat" href="/category/${esc(c.slug)}/">${c.image ? `<img src="${esc(c.image)}" alt=""  loading="lazy"${e(`tiles.${j}.image`, "img")}>` : ""}<div class="b"${e(`tiles.${j}.label`)}>${esc(c.label)}</div></a>` : "").join("")}</div>`);
  },
  faq: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, "blk-faq", `${b.title ? `<h2 class="title"${e("title")}>${esc(b.title)}</h2>` : ""}<div class="blk-narrow">${(b.questions || []).map((q, j) => q && q.question ? `<details${ctx.edit ? " open" : ""}><summary${e(`questions.${j}.question`)}>${esc(q.question)}</summary><div class="body"${e(`questions.${j}.answer`, "field")}>${md(q.answer)}</div></details>` : "").join("")}</div>`);
  },
  columns: (b, ctx, i) => {
    const e = E(ctx, i);
    return section(b, "blk-columns", `${b.title ? `<h2 class="title"${e("title")}>${esc(b.title)}</h2>` : ""}<div class="cols cols-${Math.min(4, Math.max(2, (b.points || []).length))}">${(b.points || []).map((c, j) => c ? `<div class="col">${c.icon ? `<div class="ico"${e(`points.${j}.icon`)}>${esc(c.icon)}</div>` : ""}<h3${e(`points.${j}.heading`)}>${esc(c.heading)}</h3><div class="body"${e(`points.${j}.text`, "field")}>${md(c.text)}</div></div>` : "").join("")}</div>`);
  },
  form: (b, ctx, i) => {
    const e = E(ctx, i);
    if (!ctx.formsKey && !ctx.edit) return "";
    return section(b, "blk-form", `<div class="blk-narrow">${b.title ? `<h2 class="title"${e("title")}>${esc(b.title)}</h2>` : ""}${b.intro ? `<p class="form-intro"${e("intro")}>${esc(b.intro)}</p>` : ""}<form class="contact" data-success="${esc(b.successText || "Thank you! Your message was sent.")}" action="https://api.web3forms.com/submit" method="post"><input type="hidden" name="access_key" value="${esc(ctx.formsKey === true ? "" : ctx.formsKey)}"><input type="hidden" name="subject" value="${esc(b.title || "New message from your website")}"><input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off"><label>Your name<input name="name" required autocomplete="name"></label><label>Email<input type="email" name="email" required autocomplete="email"></label><label>Message<textarea name="message" rows="5" required></textarea></label><button class="btn" type="submit"${e("buttonLabel")}>${esc(b.buttonLabel || "Send message")}</button><p class="form-status" role="status"></p></form>${ctx.edit && !ctx.formsKey ? '<p class="empty-hint">Add your form key in Site Settings \u2192 Contact form to make this form work.</p>' : ""}</div>`);
  },
  spacer: (b) => `<div class="spacer spacer-${esc(b.size || "medium")}"></div>`
};
var blocksHtml = (blocks, ctx = {}) => (blocks || []).map((b, i) => {
  if (!b) return "";
  const f = blockTypes[b._template];
  return f ? f(b, ctx, i) : "";
}).join("\n");

// tina/RichField.tsx
var KEEP = { B: "strong", STRONG: "strong", I: "em", EM: "em", U: "u", A: "a", BR: "br", P: "p", UL: "ul", OL: "ol", LI: "li" };
function cleanNode(n, out) {
  if (n.nodeType === 3) return out.createTextNode(n.textContent || "");
  if (n.nodeType !== 1) return out.createDocumentFragment();
  const el = n, tag = KEEP[el.tagName];
  const kids2 = (parent) => {
    el.childNodes.forEach((c) => parent.appendChild(cleanNode(c, out)));
    return parent;
  };
  if (["SCRIPT", "STYLE", "META", "LINK"].includes(el.tagName)) return out.createDocumentFragment();
  if (!tag) return kids2(out.createDocumentFragment());
  const e = out.createElement(tag);
  if (tag === "a") {
    const h = el.getAttribute("href") || "";
    if (/^(https?:|mailto:|\/|#)/i.test(h)) e.setAttribute("href", h);
  }
  return tag === "br" ? e : kids2(e);
}
function cleanHtml(html) {
  const src = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html"), out = document.implementation.createHTMLDocument("");
  const box = out.createElement("div");
  src.body.childNodes.forEach((c) => box.appendChild(cleanNode(c, out)));
  return box.innerHTML.replace(/<p><br><\/p>/g, "").trim();
}
var toHtml = (v) => /<[a-z][\s\S]*>/i.test(v) ? v : md(v);
var tb = { font: "inherit", fontSize: 14, minWidth: 32, height: 30, border: "1px solid #d8d8e0", background: "#fff", borderRadius: 6, cursor: "pointer" };
function Inner({ input }) {
  const ref = React.useRef(null);
  const last = React.useRef("");
  React.useEffect(() => {
    const v = String(input.value ?? "");
    if (ref.current && v !== last.current) {
      ref.current.innerHTML = toHtml(v);
      last.current = v;
    }
  }, [input.value]);
  const emit = () => {
    if (!ref.current) return;
    const html = cleanHtml(ref.current.innerHTML);
    last.current = html;
    input.onChange(html);
  };
  const run = (c, arg) => {
    ref.current?.focus();
    document.execCommand(c, false, arg);
    emit();
  };
  const link2 = () => {
    const u = window.prompt("Where should the link go?", "https://");
    if (u) run("createLink", u);
  };
  return React.createElement("div", { style: { border: "1px solid #d8d8e0", borderRadius: 8, background: "#fff", overflow: "hidden" } }, React.createElement("div", { style: { display: "flex", gap: 6, padding: 6, background: "#f6f6f9", borderBottom: "1px solid #e6e6ee", flexWrap: "wrap" } }, React.createElement("button", { type: "button", title: "Bold", "aria-label": "Bold", style: { ...tb, fontWeight: 700 }, onMouseDown: (e) => e.preventDefault(), onClick: () => run("bold") }, "B"), React.createElement("button", { type: "button", title: "Italic", "aria-label": "Italic", style: { ...tb, fontStyle: "italic" }, onMouseDown: (e) => e.preventDefault(), onClick: () => run("italic") }, "I"), React.createElement("button", { type: "button", title: "Add a link", "aria-label": "Add a link", style: tb, onMouseDown: (e) => e.preventDefault(), onClick: link2 }, "\u{1F517}"), React.createElement("button", { type: "button", title: "Bulleted list", "aria-label": "Bulleted list", style: tb, onMouseDown: (e) => e.preventDefault(), onClick: () => run("insertUnorderedList") }, "\u2022 List"), React.createElement("button", { type: "button", title: "Numbered list", "aria-label": "Numbered list", style: tb, onMouseDown: (e) => e.preventDefault(), onClick: () => run("insertOrderedList") }, "1. List"), React.createElement("button", { type: "button", title: "Remove formatting", "aria-label": "Remove formatting", style: tb, onMouseDown: (e) => e.preventDefault(), onClick: () => run("removeFormat") }, "Clear")), React.createElement(
    "div",
    {
      ref,
      contentEditable: true,
      suppressContentEditableWarning: true,
      role: "textbox",
      "aria-multiline": "true",
      onInput: emit,
      onBlur: emit,
      onPaste: (e) => {
        e.preventDefault();
        const t = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain").replace(/</g, "&lt;").replace(/\n/g, "<br>");
        document.execCommand("insertHTML", false, cleanHtml(t));
        emit();
      },
      style: { minHeight: 110, padding: "10px 12px", fontSize: 15, lineHeight: 1.6, outline: "none" }
    }
  ));
}
var RichField = wrapFieldsWithMeta(Inner);

// tina/blocks.ts
var cats = [{ value: "", label: "All posts" }, ...["motherhood", "marriage", "meals", "breakfast", "lunch", "dinner"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))];
var catOnly = cats.slice(1);
function pick0(name, label2, opts = [["center", "Center"], ["top", "Top"], ["bottom", "Bottom"], ["left", "Left"], ["right", "Right"], ["face", "Upper middle (faces)"]]) {
  return { type: "string", name, label: label2, options: opts.map(([value, label3]) => ({ value, label: label3 })) };
}
var s = (name, label2, extra = {}) => ({ type: "string", name, label: label2, ...extra });
var text = (name, label2, hint = "You can use **bold**, *italic* and [links](https://\u2026)") => s(name, label2, { description: hint, ui: { component: "textarea" } });
var rich = (name, label2) => ({ type: "string", name, label: label2, ui: { component: RichField } });
var focus = pick0("focus", "Which part of the photo to keep in view");
var ratio = pick0("ratio", "Photo shape", [["original", "Original"], ["4/3", "Standard (4:3)"], ["1/1", "Square"], ["16/9", "Wide (16:9)"], ["3/4", "Tall (3:4)"]]);
var img = (name, label2) => ({ type: "image", name, label: label2 });
var pick = (name, label2, opts) => s(name, label2, { options: opts.map(([value, label3]) => ({ value, label: label3 })) });
var bg = pick("background", "Background", [["", "White"], ["soft", "Soft color"], ["dark", "Dark"]]);
var label = (_icon, name) => name;
var item = (...keys) => ({ itemProps: (i) => ({ label: keys.map((k) => i?.[k]).find(Boolean) || "Untitled" }) });
var blockTemplates = [
  {
    name: "hero",
    label: label("\u{1F305}", "Big banner"),
    ui: { defaultItem: { heading: "A big, friendly headline", text: "One or two sentences that welcome people.", buttonLabel: "Learn more", buttonUrl: "/", height: "medium", image: "/img/hero.jpg" } },
    fields: [img("image", "Background photo"), focus, s("heading", "Headline"), text("text", "Text under the headline", "Plain text"), s("buttonLabel", "Button 1 text"), s("buttonUrl", "Button 1 link"), s("button2Label", "Button 2 text (optional)"), s("button2Url", "Button 2 link"), pick("height", "Height", [["tall", "Tall"], ["medium", "Medium"], ["short", "Short"]])]
  },
  {
    name: "text",
    label: label("\u{1F4DD}", "Text"),
    ui: { defaultItem: { heading: "A heading", text: "Write something here\u2026", align: "left", width: "narrow" } },
    fields: [s("heading", "Heading (optional)"), rich("text", "Text"), pick("align", "Alignment", [["left", "Left"], ["center", "Centered"]]), pick("width", "Width", [["narrow", "Narrow (easy to read)"], ["wide", "Wide"]]), bg]
  },
  {
    name: "imageText",
    label: label("\u{1F5BC}\uFE0F", "Photo + text side by side"),
    ui: { defaultItem: { heading: "Your heading", text: "Tell the story behind the photo.", imageSide: "left", image: "/img/hero.jpg" } },
    fields: [img("image", "Photo"), focus, ratio, s("alt", "Describe the photo (for blind readers and Google)"), s("heading", "Heading"), rich("text", "Text"), s("buttonLabel", "Button text (optional)"), s("buttonUrl", "Button link"), pick("imageSide", "Photo position", [["left", "Photo on the left"], ["right", "Photo on the right"]]), bg]
  },
  {
    name: "gallery",
    label: label("\u{1F3DE}\uFE0F", "Photo gallery"),
    ui: { defaultItem: { title: "Gallery", perRow: "3", images: [{ src: "/img/hero.jpg", alt: "Add a description" }, { src: "/img/breakfast-table-with-oatmeal-porridge-croissants-and-muffins.jpg", alt: "Add a description" }, { src: "/img/frozen-vegetables-prepared-for-quick-meals.jpg", alt: "Add a description" }] } },
    fields: [s("title", "Title (optional)"), pick("perRow", "Photos per row", [["2", "2"], ["3", "3"], ["4", "4"]]), { type: "object", name: "images", label: "Photos", list: true, ui: item("alt", "caption"), fields: [img("src", "Photo"), focus, s("alt", "Describe the photo"), s("caption", "Caption (optional)")] }, ratio, bg]
  },
  {
    name: "feature",
    label: label("\u2B50", "Highlight card"),
    ui: { defaultItem: { eyebrow: "New", heading: "Something worth sharing", text: "A short description.", buttonLabel: "Learn more", buttonUrl: "/", background: "soft" } },
    fields: [img("image", "Photo"), focus, ratio, s("eyebrow", "Small label above the title"), s("heading", "Title"), rich("text", "Text"), s("buttonLabel", "Button text"), s("buttonUrl", "Button link"), s("linkLabel", "Extra text link (optional)"), s("linkUrl", "Extra link address"), bg]
  },
  {
    name: "cta",
    label: label("\u{1F4E3}", "Call-to-action band"),
    ui: { defaultItem: { heading: "Ready to join us?", text: "One short line.", buttonLabel: "Sign up", buttonUrl: "/", style: "pink" } },
    fields: [s("heading", "Headline"), s("text", "Text"), s("buttonLabel", "Button text"), s("buttonUrl", "Button link"), pick("style", "Color", [["pink", "Accent color"], ["dark", "Dark"], ["soft", "Soft"]])]
  },
  {
    name: "video",
    label: label("\u{1F3AC}", "Video"),
    ui: { defaultItem: { url: "" } },
    fields: [s("url", "Paste a YouTube or Vimeo link"), img("file", "Or upload a short video file"), s("caption", "Caption (optional)"), bg]
  },
  {
    name: "quote",
    label: label("\u{1F4AC}", "Big quote"),
    ui: { defaultItem: { text: "A sentence worth remembering.", author: "" } },
    fields: [text("text", "Quote", "Plain text"), s("author", "Who said it (optional)"), bg]
  },
  {
    name: "postGrid",
    label: label("\u{1F4F0}", "Blog posts grid"),
    ui: { defaultItem: { title: "Latest posts", count: 3 } },
    fields: [s("title", "Title"), { type: "number", name: "count", label: "How many posts" }, s("category", "Only from this category", { options: cats }), bg]
  },
  {
    name: "featuredPost",
    label: label("\u{1F4CC}", "Featured post"),
    ui: { defaultItem: { title: "Featured" } },
    fields: [s("title", "Title"), bg]
  },
  {
    name: "categoryTiles",
    label: label("\u{1F5C2}\uFE0F", "Category tiles"),
    ui: { defaultItem: { title: "Browse by topic", tiles: [{ label: "Motherhood", slug: "motherhood", image: "/img/happy-sweet-black-curly-millennial-mother-with-towel-kissing-little-baby-enjoy-motherhood.jpg" }, { label: "Marriage", slug: "marriage", image: "/img/romantic-mature-black-couple-in-love.jpg" }, { label: "Meals", slug: "meals", image: "/img/frozen-vegetables-prepared-for-quick-meals.jpg" }] } },
    fields: [s("title", "Title"), { type: "object", name: "tiles", label: "Tiles", list: true, ui: item("label"), fields: [s("label", "Name"), s("slug", "Category", { options: catOnly }), img("image", "Photo")] }, bg]
  },
  {
    name: "faq",
    label: label("\u2753", "Questions & answers"),
    ui: { defaultItem: { title: "Good questions", questions: [{ question: "A question people often ask?", answer: "Your friendly answer." }, { question: "Another question?", answer: "Another answer." }] } },
    fields: [s("title", "Title"), { type: "object", name: "questions", label: "Questions", list: true, ui: item("question"), fields: [s("question", "Question"), rich("answer", "Answer")] }, bg]
  },
  {
    name: "columns",
    label: label("\u{1F532}", "Columns (2\u20134 short points)"),
    ui: { defaultItem: { title: "", points: [{ icon: "\u{1F35E}", heading: "First point", text: "A short sentence." }, { icon: "\u{1F963}", heading: "Second point", text: "A short sentence." }, { icon: "\u{1F370}", heading: "Third point", text: "A short sentence." }] } },
    fields: [s("title", "Title (optional)"), { type: "object", name: "points", label: "Columns", list: true, ui: item("heading"), fields: [s("icon", "Emoji (optional)"), s("heading", "Heading"), rich("text", "Text")] }, bg]
  },
  {
    name: "form",
    label: label("\u2709\uFE0F", "Contact form"),
    ui: { defaultItem: { title: "Get in touch", intro: "We would love to hear from you.", buttonLabel: "Send message", successText: "Thank you! Your message was sent." } },
    fields: [s("title", "Title"), s("intro", "Short intro"), s("buttonLabel", "Button text"), s("successText", "Message shown after sending"), bg]
  },
  {
    name: "spacer",
    label: label("\u2195\uFE0F", "Empty space"),
    ui: { defaultItem: { size: "medium" } },
    fields: [pick("size", "Size", [["small", "Small"], ["medium", "Medium"], ["large", "Large"]])]
  }
];
var blocksField = {
  type: "object",
  name: "blocks",
  label: "Page sections (drag to reorder)",
  list: true,
  ui: { itemProps: (i) => ({ label: (i?._template || "") + (i?.heading || i?.title ? " \u2014 " + (i.heading || i.title) : "") }) },
  templates: blockTemplates
};

// tina/Preview.tsx
import React2 from "react";
import { createRoot } from "react-dom/client";
import { useCMS } from "tinacms";
var shell = null;
async function loadShell() {
  if (shell) return shell;
  const [html, posts] = await Promise.all([fetch("/", { cache: "no-store" }).then((r) => r.text()), fetch("/posts.json").then((r) => r.json()).catch(() => [])]);
  const doc = new DOMParser().parseFromString(html, "text/html");
  let head = "";
  doc.querySelectorAll("head link[rel=stylesheet], head style").forEach((el) => head += el.outerHTML);
  shell = {
    head,
    posts,
    announce: (doc.querySelector(".announce")?.outerHTML ?? "").replace(' hidden=""', "").replace(" hidden", ""),
    header: doc.querySelector(".site-header")?.outerHTML ?? "",
    footer: doc.querySelector(".footer")?.outerHTML ?? "",
    main: doc.querySelector("main")?.innerHTML ?? ""
  };
  return shell;
}
var fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : "";
var FOCUS2 = { top: "50% 0%", center: "50% 50%", bottom: "50% 100%", left: "0% 50%", right: "100% 50%", face: "50% 25%" };
var IFRAME_SCRIPT = `(function(){
var send=function(m){parent.postMessage(Object.assign({tinaPreview:1},m),'*')};
var st=document.createElement('style');st.textContent='[data-e]{cursor:pointer}[data-e]:hover{outline:2px dashed #ff66c4;outline-offset:3px}[data-t="text"]:focus{outline:2px solid #ff66c4;outline-offset:3px;cursor:text}';document.head.appendChild(st);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a)e.preventDefault();var el=e.target.closest&&e.target.closest('[data-e]');if(!el)return;var t=el.getAttribute('data-t');if(t==='text')return;e.preventDefault();e.stopPropagation();send({type:t,path:el.getAttribute('data-e')})},true);
document.querySelectorAll('[data-t="text"]').forEach(function(el){
try{el.contentEditable='plaintext-only'}catch(x){el.contentEditable='true'}
el.addEventListener('focus',function(){send({type:'focus'})});
el.addEventListener('input',function(){send({type:'text',path:el.getAttribute('data-e'),value:el.innerText.replace(/\\n/g,' ')})});
el.addEventListener('blur',function(){send({type:'blur'})});
el.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();el.blur()}});
});})();`;
async function build(kind, v) {
  const c = await loadShell();
  const ctx = { posts: c.posts, edit: kind !== "settings", formsKey: true };
  const cover = v.image ? `<img src="${esc(v.image)}" alt="" style="margin:0 auto 1.5em${v.imageFocus && FOCUS2[v.imageFocus] ? ";object-position:" + FOCUS2[v.imageFocus] : ""}" data-e="image" data-t="img">` : `<p class="empty-hint" data-e="image" data-t="img">Click to add a top photo</p>`;
  const article = (meta) => `<article class="article"><div class="narrow">${meta}<h1 data-e="title" data-t="text">${esc(v.title)}</h1>${cover}<div class="body" data-e="body" data-t="field">${richText(v.body, ctx)}</div></div></article>`;
  let content = "";
  if (kind === "post") content = article(`<div class="meta">${fmt(v.date)}</div>`);
  else if (kind === "page") {
    const blocks = blocksHtml(v.blocks, ctx);
    content = v.layout === "blocks" ? blocks : article("") + blocks;
  } else content = c.main;
  let doc = `<!doctype html><html class="js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${location.origin}/" target="_blank">${c.head}<style>*,*::before,*::after{animation:none!important;transition:none!important}.reveal,.js .reveal{opacity:1!important;transform:none!important}.sticky-register{display:none!important}.site-header{position:static}</style></head><body>${c.announce}${c.header}<main>${content}</main>${c.footer}${ctx.edit ? `<script>${IFRAME_SCRIPT}<\/script>` : ""}</body></html>`;
  if (kind === "settings") {
    const d = new DOMParser().parseFromString(doc, "text/html"), t = v.theme || {};
    const st = d.createElement("style");
    st.textContent = `html:root{--pink:${t.accent};--ink:${t.dark};--text:${t.text};--cream:${t.soft};--font-head:"${t.headingFont}",system-ui,sans-serif;--font-body:"${t.bodyFont}",system-ui,sans-serif}`;
    d.head.append(st);
    const fl = d.createElement("link");
    fl.rel = "stylesheet";
    fl.href = `https://fonts.googleapis.com/css2?family=${String(t.headingFont || "").replace(/ /g, "+")}:wght@400;500;600;700&family=${String(t.bodyFont || "").replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    d.head.append(fl);
    const a = d.querySelector(".announce");
    if (a) {
      if (v.announcement?.show === false) a.remove();
      else {
        const b = a.querySelector("strong"), l = a.querySelector("a");
        if (b) b.textContent = v.announcement?.text ?? "";
        if (l) l.textContent = v.announcement?.linkText ?? "";
      }
    }
    d.querySelectorAll(".brand img, .footer img").forEach((i) => v.logo && i.setAttribute("src", v.logo));
    const fp = d.querySelector(".footer p");
    if (fp) fp.innerHTML = `${esc(v.tagline)}<br>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${esc(v.footerText)}`;
    doc = "<!doctype html>" + d.documentElement.outerHTML;
  }
  return doc;
}
var pill = (on) => ({ font: "inherit", fontSize: 13, padding: "5px 12px", borderRadius: 999, border: "1px solid " + (on ? "#ec4815" : "#d8d8e0"), background: on ? "#fff1ec" : "#fff", color: on ? "#b93a10" : "#333", cursor: "pointer" });
function Canvas({ kind, tinaForm, cms, inline }) {
  const ff = tinaForm?.finalForm ?? tinaForm;
  const formId = tinaForm?.id ?? "form";
  const draftKey = "tina-draft:" + formId;
  const [html, setHtml] = React2.useState("");
  const [mode, setMode] = React2.useState(window.innerWidth >= 1e3 ? "desktop" : "phone");
  const [open, setOpen] = React2.useState(window.innerWidth >= 700);
  const [w, setW] = React2.useState(300);
  const [restore, setRestore] = React2.useState(() => {
    try {
      const r = JSON.parse(localStorage.getItem(draftKey) || "null");
      return r && r.t < pageStart && JSON.stringify(r.values) !== JSON.stringify(ff.getState().initialValues) ? r : null;
    } catch {
      return null;
    }
  });
  const wrap = React2.useRef(null);
  const frame = React2.useRef(null);
  const pop = React2.useRef(null);
  const timer = React2.useRef();
  const typing = React2.useRef(false);
  const scroll = React2.useRef(0);
  const latest = React2.useRef("");
  const [auto, setAuto] = React2.useState("");
  const idle = React2.useRef();
  const push = React2.useCallback((doc) => {
    latest.current = doc;
    scroll.current = frame.current?.contentWindow?.scrollY ?? 0;
    setHtml(doc);
    const p = pop.current;
    if (p && !p.closed) p.document.getElementById("f")?.setAttribute("srcdoc", doc);
  }, []);
  const schedule = React2.useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (typing.current) return;
      try {
        push(await build(kind, ff.getState().values));
      } catch (e) {
      }
    }, 300);
  }, [ff, kind, push]);
  React2.useEffect(() => {
    schedule();
    const off = ff.subscribe((s2) => {
      schedule();
      clearTimeout(idle.current);
      const v = s2.values || {};
      const safe = kind === "post" && v.draft === true && tinaForm?.crudType !== "create";
      if (s2.dirty && !s2.submitting && !safe) setAuto("Unsaved \u2014 press Save to publish your changes");
      if (s2.dirty && !s2.submitting && safe) idle.current = setTimeout(async () => {
        if (!navigator.onLine) {
          setAuto("Offline \u2014 your edits are kept on this device");
          return;
        }
        try {
          setAuto("Saving\u2026");
          await ff.submit();
          setAuto(ff.getState().dirty ? "Not saved yet \u2014 your edits are kept on this device" : "Auto-saved \u2713 " + (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
        } catch (e) {
          setAuto("Could not auto-save \u2014 press Save");
        }
      }, 3e4);
      try {
        if (s2.submitSucceeded && !s2.dirty) localStorage.removeItem(draftKey);
        else if (s2.dirty) localStorage.setItem(draftKey, JSON.stringify({ t: Date.now(), values: s2.values }));
      } catch (e) {
      }
    }, { values: true, dirty: true, submitSucceeded: true, submitting: true });
    const guard = (e) => {
      if (ff.getState().dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => {
      off();
      clearTimeout(timer.current);
      clearTimeout(idle.current);
      window.removeEventListener("beforeunload", guard);
    };
  }, [ff, schedule, draftKey]);
  React2.useEffect(() => {
    const onMsg = (e) => {
      const m = e.data;
      if (!m || !m.tinaPreview) return;
      const ok = e.source === frame.current?.contentWindow || pop.current && e.source === pop.current;
      if (!ok) return;
      if (m.type === "focus") typing.current = true;
      else if (m.type === "blur") {
        typing.current = false;
        schedule();
      } else if (m.type === "text") {
        typing.current = true;
        ff.change(m.path, m.value);
      } else if (m.type === "img") cms.media.open({ allowDelete: false, onSelect: (media) => ff.change(m.path, media.src) });
      else if (m.type === "field") cms.dispatch({ type: "forms:set-active-field-name", value: { formId: tinaForm.id, fieldName: m.path } });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [cms, ff, tinaForm, schedule]);
  React2.useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver((e) => setW(Math.max(200, Math.floor(e[0].contentRect.width))));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [open]);
  const popOut = () => {
    const p = window.open("", "site-preview", "width=1280,height=900");
    if (!p) return;
    p.document.open();
    p.document.write('<!doctype html><title>Live preview</title><body style="margin:0;font:14px sans-serif"><div style="padding:8px 14px;background:#222;color:#fff">Live preview \u2014 click text to type, click a photo to swap it. Close this window when you are done.</div><iframe id="f" style="border:0;width:100%;height:calc(100vh - 36px)"></iframe><script>window.addEventListener("message",function(e){if(e.data&&e.data.tinaPreview&&window.opener)window.opener.postMessage(e.data,"*")})<\/script></body>');
    p.document.close();
    pop.current = p;
    p.document.getElementById("f")?.setAttribute("srcdoc", latest.current);
  };
  const doRestore = () => {
    const vals = restore.values;
    Object.keys(vals).forEach((k2) => ff.change(k2, vals[k2]));
    setRestore(null);
  };
  const discard = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch (e) {
    }
    setRestore(null);
  };
  const [vp, setVp] = React2.useState({ w: window.innerWidth, h: window.innerHeight });
  const [tip, setTip] = React2.useState(() => {
    try {
      return !localStorage.getItem("tina-tip-seen");
    } catch {
      return true;
    }
  });
  React2.useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const big = !inline && vp.w >= 1e3;
  const left = 560;
  const cw = big ? vp.w - left - 16 : Math.min(w, vp.w - 32), ch = big ? vp.h - 118 - 76 - 92 : 540;
  const base = big ? mode === "phone" ? 390 : 1100 : Math.max(280, cw), k = Math.min(1, cw / base), h = big ? ch / k : ch;
  const frameEl = React2.createElement("div", { ref: wrap, style: { width: "100%", height: ch, overflow: "hidden", borderRadius: big ? 14 : 8, background: big ? "#ece9f0" : "#f2f2f6", position: "relative" } }, React2.createElement("iframe", { ref: frame, tabIndex: -1, title: "Live preview", srcDoc: html, onLoad: () => {
    try {
      frame.current?.contentWindow?.scrollTo(0, scroll.current);
    } catch (e) {
    }
  }, style: { position: "absolute", left: Math.max(0, (cw - base * k) / 2), top: 0, width: base, height: h, border: 0, background: "#fff", transform: `scale(${k})`, transformOrigin: "top left", boxShadow: mode === "phone" && big ? "0 8px 40px rgba(0,0,0,.18)" : "none" } }));
  const dismiss = () => {
    setTip(false);
    try {
      localStorage.setItem("tina-tip-seen", "1");
    } catch (e) {
    }
  };
  const controls = React2.createElement("div", { style: { boxSizing: "border-box", maxWidth: "100%", padding: 12, background: "#fff", border: "1px solid #e1e1ea", borderRadius: 10 } }, React2.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, React2.createElement("span", { style: { display: "inline-flex", border: "1px solid #e1e1ea", borderRadius: 999, overflow: "hidden" } }, React2.createElement("button", { type: "button", "aria-label": "Phone view", style: { ...pill(mode === "phone"), border: 0, borderRadius: 0 }, onClick: () => setMode("phone") }, "\u{1F4F1} Phone"), React2.createElement("button", { type: "button", "aria-label": "Computer view", style: { ...pill(mode === "desktop"), border: 0, borderRadius: 0 }, onClick: () => setMode("desktop") }, "\u{1F5A5} Computer")), React2.createElement("button", { type: "button", style: pill(false), onClick: popOut }, "Full screen \u2197"), React2.createElement("button", { type: "button", style: pill(false), onClick: () => setOpen(!open) }, open ? "Hide preview" : "Show preview"), React2.createElement("span", { style: { marginLeft: "auto", fontSize: 13, fontWeight: 600, color: auto.startsWith("Could") ? "#b3261e" : "#1b7a3d" } }, auto || (kind === "post" ? "\u25CF Drafts save automatically" : "\u25CF Press Save to publish"))), tip && kind !== "settings" && React2.createElement("div", { style: { marginTop: 10, padding: "8px 12px", background: "#fff1fa", border: "1px solid #ffc2e6", borderRadius: 8, fontSize: 14, color: "#5a1d44" } }, React2.createElement("strong", null, "Tip:"), " click any words on the page to type there, or click a photo to swap it. ", React2.createElement("button", { type: "button", onClick: dismiss, style: { ...pill(false), marginLeft: 6, padding: "2px 10px" } }, "Got it")), restore && React2.createElement("div", { style: { marginTop: 10, padding: "8px 12px", background: "#fff8e6", border: "1px solid #f0d98a", borderRadius: 8, fontSize: 14 } }, React2.createElement("strong", null, "You have unsaved changes from earlier"), " (", new Date(restore.t).toLocaleString(), ").", React2.createElement("span", { style: { marginLeft: 8, display: "inline-flex", gap: 8 } }, React2.createElement("button", { type: "button", style: pill(true), onClick: doRestore }, "Bring them back"), React2.createElement("button", { type: "button", style: pill(false), onClick: discard }, "Throw them away"))));
  if (!big) return React2.createElement("div", { style: { margin: "0 0 22px" } }, controls, open && React2.createElement("div", { style: { marginTop: 10 } }, frameEl));
  return React2.createElement("div", { style: { position: "fixed", left, right: 16, top: 118, bottom: 76, zIndex: 40, display: "flex", flexDirection: "column", gap: 10 } }, controls, open && frameEl);
}
var pageStart = Date.now();
var curForm = null;
var host = null;
var root = null;
var hashAt = "";
var narrowed = [];
var teardown = () => {
  try {
    const f = curForm?.finalForm;
    if (f && f.getState().dirty) f.submit();
  } catch (e) {
  }
  curForm = null;
  if (root) root.unmount();
  host?.remove();
  host = null;
  root = null;
  narrowed.forEach(([el, v]) => {
    el.style.maxWidth = v;
  });
  narrowed = [];
};
if (typeof window !== "undefined") window.addEventListener("hashchange", () => {
  if (host && location.hash !== hashAt) teardown();
});
function Panel({ kind, tinaForm }) {
  const cms = useCMS();
  const anchor = React2.useRef(null);
  const big = window.innerWidth >= 1e3;
  React2.useEffect(() => {
    if (!big) return;
    if (!host) {
      host = document.createElement("div");
      document.body.appendChild(host);
      root = createRoot(host);
    }
    hashAt = location.hash;
    curForm = tinaForm;
    if (!narrowed.length) for (let el = anchor.current?.parentElement ?? null; el && el !== document.body; el = el.parentElement) {
      if (el.offsetWidth > window.innerWidth * 0.8) {
        narrowed.push([el, el.style.maxWidth]);
        el.style.maxWidth = "540px";
      }
    }
    root.render(React2.createElement(Canvas, { key: tinaForm?.id, kind, tinaForm, cms }));
  }, [big, kind, tinaForm, cms]);
  if (big) return React2.createElement("span", { ref: anchor });
  return React2.createElement(Canvas, { kind, tinaForm, cms, inline: true });
}
var previewField = (kind) => ({ type: "string", name: "livePreview", label: "Live preview", ui: { component: (props) => React2.createElement(Panel, { kind, tinaForm: props.tinaForm ?? props.form }) } });

// tina/config.ts
var branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var cats2 = ["motherhood", "marriage", "meals", "breakfast", "lunch", "dinner", "bake-class"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1).replace("-", " ") }));
var RESERVED = ["about-me", "home-chefs", "home-bakery", "home", "category", "rss", "admin", "posts", "sitemap", "404", "index"];
var slugify = (v) => {
  let t = (v?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/-$/, "");
  if (!t) t = "post-" + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return RESERVED.includes(t) ? t + "-post" : t;
};
var embeds2 = [
  {
    name: "video",
    label: "Video",
    match: { start: "{{<", end: ">}}" },
    ui: { defaultItem: { url: "", caption: "" } },
    fields: [
      { type: "string", name: "url", label: "Paste a YouTube or Vimeo link", description: "Easiest for long videos. Or leave this empty and choose a video file below." },
      { type: "image", name: "file", label: "Or upload a short video file (MP4, under about 50 MB)" },
      { type: "string", name: "caption", label: "Caption (optional)" }
    ]
  },
  {
    name: "photo",
    label: "Photo with caption",
    match: { start: "{{<", end: ">}}" },
    fields: [
      { type: "image", name: "src", label: "Photo" },
      { type: "string", name: "alt", label: "Describe the photo (helps blind readers and Google)" },
      { type: "string", name: "caption", label: "Caption (optional)" },
      { type: "string", name: "size", label: "Size", options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "full", label: "Full width" }] },
      { type: "string", name: "align", label: "Position", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] }
    ]
  },
  {
    name: "photoRow",
    label: "Photos side by side (2\u20133)",
    match: { start: "{{<", end: ">}}" },
    fields: [
      { type: "image", name: "photo1", label: "Photo 1" },
      { type: "string", name: "alt1", label: "Describe photo 1" },
      { type: "image", name: "photo2", label: "Photo 2" },
      { type: "string", name: "alt2", label: "Describe photo 2" },
      { type: "image", name: "photo3", label: "Photo 3 (optional)" },
      { type: "string", name: "alt3", label: "Describe photo 3" }
    ]
  },
  {
    name: "button",
    label: "Button",
    match: { start: "{{<", end: ">}}" },
    fields: [
      { type: "string", name: "label", label: "Button text" },
      { type: "string", name: "url", label: "Where it goes (link)" },
      { type: "string", name: "align", label: "Position", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] }
    ]
  }
];
var router = ({ document: document2 }) => `/${document2._sys.filename}/`;
var color = { component: "color", colorFormat: "hex" };
var link = [
  { type: "string", name: "label", label: "Menu text", required: true },
  { type: "string", name: "href", label: "Link (e.g. /about-me/ or https://\u2026)", required: true }
];
var SKIN = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
body,button,input,textarea,select{font-family:'Poppins',system-ui,sans-serif!important}
:root{--tina-color-primary:#ff66c4}
[class*="bg-orange"],[class*="from-orange"],[class*="to-orange"]{background:#ff66c4!important;background-image:none!important;border-color:#ff66c4!important;color:#fff!important}
[class*="text-orange"]{color:#e0359f!important}[class*="border-orange"]{border-color:#ff66c4!important}
[class*="orange"] svg{color:inherit}
input:focus,textarea:focus,select:focus{box-shadow:0 0 0 3px rgba(255,102,196,.25)!important;border-color:#ff66c4!important}`;
var cmsCallback = (cms) => {
  try {
    if (!location.hash || location.hash === "#/") location.hash = "#/collections";
    const st = document.createElement("style");
    st.textContent = SKIN;
    document.head.appendChild(st);
    const l = document.createElement("link");
    l.rel = "manifest";
    l.href = "/admin-manifest.webmanifest";
    document.head.appendChild(l);
    const m = document.createElement("meta");
    m.name = "theme-color";
    m.content = "#ff66c4";
    document.head.appendChild(m);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
    const tidy = () => {
      document.querySelectorAll('[class*="border-amber"]').forEach((e) => {
        if (/local mode/.test(e.textContent || "") && e.textContent.length < 80) e.style.display = "none";
      });
      document.querySelectorAll('[class*="border-blue-"]').forEach((e) => {
        if (/configured search/.test(e.textContent || "")) e.style.display = "none";
      });
      document.querySelectorAll("table").forEach((t) => {
        const heads = [...t.querySelectorAll("thead th")];
        heads.forEach((th, i) => {
          if (/^(Filename|Extension|Template)$/.test(th.textContent.trim())) {
            th.style.display = "none";
            t.querySelectorAll("tbody tr").forEach((r) => {
              const c = r.children[i];
              if (c) c.style.display = "none";
            });
          }
        });
      });
      document.querySelectorAll("a,button").forEach((e) => {
        if (/^Add File$/.test(e.textContent.trim())) {
          const n = [...e.childNodes].find((c) => c.nodeType === 3 && /Add File/.test(c.textContent));
          if (n) n.textContent = "New post / page";
        }
      });
    };
    new MutationObserver(tidy).observe(document.body, { childList: true, subtree: true });
    let ev;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      ev = e;
      const b = document.createElement("button");
      b.textContent = "\u{1F4F1} Install this editor on your phone";
      b.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:99;padding:10px 18px;border-radius:999px;border:0;background:#ff66c4;color:#fff;font:600 14px Poppins,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.2);cursor:pointer";
      b.onclick = () => {
        ev.prompt();
        b.remove();
      };
      document.body.appendChild(b);
    });
  } catch (e) {
  }
  return cms;
};
var config_default = defineConfig({
  cmsCallback,
  branch,
  clientId: "01789bf2-d73e-4861-a4f9-5960dbbd6392",
  token: process.env.TINA_TOKEN,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "img", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "src/content/posts",
        format: "md",
        ui: { filename: { slugify, readonly: true }, router, allowedActions: { createNestedFolder: false } },
        defaultItem: () => ({ date: (/* @__PURE__ */ new Date()).toISOString(), categories: [], draft: true, featured: false }),
        fields: [
          previewField("post"),
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "rich-text", name: "body", label: "Write your post", isBody: true, templates: embeds2, toolbarOverride: ["heading", "link", "image", "quote", "ul", "ol", "bold", "italic", "hr", "embed"] },
          { type: "boolean", name: "draft", label: "Keep this post hidden (draft)", description: "New posts start hidden. Turn this OFF when you are ready for everyone to see it." },
          { type: "datetime", name: "date", label: "Date shown on the post", required: true },
          { type: "string", name: "categories", label: "Categories (tick any)", list: true, options: cats2 },
          { type: "image", name: "image", label: "Cover photo" },
          { type: "string", name: "imageFocus", label: "Which part of the cover photo to keep in view", options: [{ value: "center", label: "Center" }, { value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }, { value: "face", label: "Upper middle (faces)" }] },
          { type: "string", name: "excerpt", label: "Short summary (shown on cards)", ui: { component: "textarea" } },
          { type: "datetime", name: "publishDate", label: "Schedule: hide until this date (optional)", description: "Leave empty to publish immediately. A scheduled post appears the next time the site updates after this date." },
          { type: "string", name: "description", label: "Search-engine description (optional)", ui: { component: "textarea" } },
          { type: "boolean", name: "featured", label: "Feature this post at the top of the home page" }
        ]
      },
      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "md",
        match: { exclude: "home" },
        defaultItem: () => ({ layout: "blocks", blocks: [{ _template: "hero", heading: "Page title", text: "A short welcome.", height: "short", image: "/img/hero.jpg" }, { _template: "text", heading: "About this page", text: "<p>Write something here\u2026</p>", align: "left", width: "narrow" }, { _template: "cta", heading: "Ready to join us?", buttonLabel: "Sign up", buttonUrl: "/", style: "pink" }] }),
        ui: { filename: { slugify }, router, allowedActions: { delete: false, createNestedFolder: false } },
        fields: [
          previewField("page"),
          { type: "string", name: "title", label: "Page title", isTitle: true, required: true },
          { type: "string", name: "layout", label: "Page style", options: [{ value: "article", label: "Article (title, photo and text, then sections below)" }, { value: "blocks", label: "Sections only (like the home page)" }] },
          { type: "image", name: "image", label: "Top photo" },
          { type: "rich-text", name: "body", label: "Page content", isBody: true, templates: embeds2, toolbarOverride: ["heading", "link", "image", "quote", "ul", "ol", "bold", "italic", "hr", "embed"] },
          { type: "boolean", name: "showRegisterCta", label: 'Show the "Register" box and button on this page' },
          { type: "string", name: "description", label: "Search-engine description (optional)", ui: { component: "textarea" } },
          { type: "boolean", name: "draft", label: "Draft \u2014 keep hidden from the website" },
          blocksField
        ]
      },
      {
        name: "home",
        label: "Home Page",
        path: "src/content/pages",
        format: "md",
        match: { include: "home" },
        ui: { router: () => "/", allowedActions: { create: false, delete: false, createNestedFolder: false } },
        fields: [
          previewField("page"),
          blocksField,
          { type: "string", name: "title", label: "Page name (leave as Home)", isTitle: true, required: true },
          { type: "string", name: "layout", label: "Layout", ui: { component: "hidden" } },
          { type: "string", name: "description", label: "Search-engine description", ui: { component: "textarea" } }
        ]
      },
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content",
        format: "json",
        match: { include: "settings" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          previewField("settings"),
          { type: "string", name: "siteTitle", label: "Site name" },
          { type: "image", name: "logo", label: "Logo" },
          { type: "string", name: "tagline", label: "Tagline" },
          { type: "object", name: "theme", label: "Colors & fonts", fields: [
            { type: "string", name: "accent", label: "Accent color (buttons, links)", ui: color },
            { type: "string", name: "dark", label: "Headline color", ui: color },
            { type: "string", name: "text", label: "Body text color", ui: color },
            { type: "string", name: "soft", label: "Soft background color", ui: color },
            { type: "string", name: "headingFont", label: "Headline font", options: ["Outfit", "Poppins", "Montserrat", "Playfair Display", "Lora", "DM Sans"] },
            { type: "string", name: "bodyFont", label: "Body font", options: ["Heebo", "Inter", "Nunito", "Open Sans", "DM Sans", "Lora"] }
          ] },
          { type: "object", name: "nav", label: "Menu", list: true, ui: { itemProps: (i) => ({ label: i?.label }) }, fields: [
            ...link,
            { type: "object", name: "children", label: "Drop-down items", list: true, ui: { itemProps: (i) => ({ label: i?.label }) }, fields: link }
          ] },
          { type: "string", name: "registerUrl", label: "Class sign-up link" },
          { type: "object", name: "announcement", label: "Top announcement bar", fields: [
            { type: "boolean", name: "show", label: "Show the bar" },
            { type: "string", name: "text", label: "Bold text" },
            { type: "string", name: "linkText", label: "Link text" },
            { type: "string", name: "linkUrl", label: "Link goes to (leave empty for the Register page)" }
          ] },
          { type: "object", name: "classCard", label: "Class sign-up box (shown on pages where you turn it on)", fields: [
            { type: "string", name: "label", label: "Small label" },
            { type: "string", name: "text", label: "Description", ui: { component: "textarea" } },
            { type: "string", name: "buttonText", label: "Button text" },
            { type: "string", name: "stickyText", label: "Text on the bottom bar (phones)" }
          ] },
          { type: "string", name: "mobileCta", label: "Phone menu: top button text" },
          { type: "string", name: "formsKey", label: "Contact form key", description: "Free at web3forms.com \u2014 enter your email there, they send you a key. Paste it here to turn on the Contact form section." },
          { type: "string", name: "footerText", label: "Footer text" },
          { type: "object", name: "social", label: "Social links (footer)", list: true, ui: { itemProps: (i) => ({ label: i?.label }) }, fields: [
            { type: "string", name: "label", label: "Name (e.g. Instagram)" },
            { type: "string", name: "url", label: "Link" }
          ] }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
