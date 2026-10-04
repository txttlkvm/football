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

export function mountCourse(container: HTMLElement) {
  if (mounted) {
    return;
  }
  mounted = true;
  installInlineHandlerShim();
  const style = document.createElement("style");
  style.textContent = courseCss;
  document.head.appendChild(style);
  // Same centering/background the original page applied to <body>.
  container.style.cssText +=
    ";display:grid;place-items:center;background:#040e19;";
  container.innerHTML = courseBody;
  startCourse();
}
