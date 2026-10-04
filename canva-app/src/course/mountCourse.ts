import courseBody from "./courseBody";
import courseCss from "./courseCss";
import { startCourse } from "./courseApp";

let mounted = false;

// Mounts the original course (markup, CSS, JS) as the app's own page.
export function mountCourse(container: HTMLElement) {
  if (mounted) {
    return;
  }
  mounted = true;
  const style = document.createElement("style");
  style.textContent = courseCss;
  document.head.appendChild(style);
  container.innerHTML = courseBody;
  startCourse();
}
