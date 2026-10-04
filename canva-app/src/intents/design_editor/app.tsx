import { Button } from "@canva/app-ui-kit";
import { requestOpenExternalUrl } from "@canva/platform";
import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { mountCourse } from "../../course/mountCourse";

// Full-size hosted copy of the same course (the panel is only ~360px wide).
const FULL_URL = "https://two-shares-web.vercel.app/";

// The original, unmodified course runs as the app experience itself.
// (Canva Apps cannot nest iframes or insert arbitrary pages as embeds.)
export const App = () => {
  const intl = useIntl();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      mountCourse(ref.current);
    }
  }, []);
  return (
    <>
      <div
        ref={ref}
        style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden" }}
      />
      <div
        style={{ position: "fixed", left: 8, right: 8, bottom: 8, zIndex: 5 }}
      >
        <Button
          variant="primary"
          stretch
          onClick={() => requestOpenExternalUrl({ url: FULL_URL })}
        >
          {intl.formatMessage({
            defaultMessage: "Open course full size",
            description: "Button: open the full-size course in a new tab",
          })}
        </Button>
      </div>
    </>
  );
};
