import { useEffect, useRef } from "react";
import { mountCourse } from "../../course/mountCourse";

// The original, unmodified course runs as the app experience itself.
// (Canva Apps cannot nest iframes or insert arbitrary pages as embeds.)
export const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      mountCourse(ref.current);
    }
  }, []);
  return (
    <div
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden" }}
    />
  );
};
