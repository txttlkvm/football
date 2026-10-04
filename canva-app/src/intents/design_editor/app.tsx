import { useFeatureSupport } from "@canva/app-hooks";
import { Button, Rows, Text } from "@canva/app-ui-kit";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { requestOpenExternalUrl } from "@canva/platform";
import { useIntl } from "react-intl";
import * as styles from "styles/components.css";

// The full, unmodified course is hosted here (index.html + original PNG artwork).
// Canva Apps may not contain iframes, so the app adds it to the design as an
// embed element, or opens it full size.
export const COURSE_URL = "https://two-shares-web.vercel.app/";

export const App = () => {
  const intl = useIntl();
  const isSupported = useFeatureSupport();
  const addElement = [addElementAtPoint, addElementAtCursor].find((fn) =>
    isSupported(fn),
  );
  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          {intl.formatMessage({
            defaultMessage: "Finish the Tackle · Coach Lab",
            description: "Name of the interactive coaching course",
          })}
        </Text>
        <Button
          variant="primary"
          disabled={!addElement}
          onClick={() => addElement?.({ type: "embed", url: COURSE_URL })}
        >
          {intl.formatMessage({
            defaultMessage: "Add course to design",
            description: "Button: insert the course as an embed element",
          })}
        </Button>
        <Button
          variant="secondary"
          onClick={() => requestOpenExternalUrl({ url: COURSE_URL })}
        >
          {intl.formatMessage({
            defaultMessage: "Open full size",
            description: "Button: open the course in a new tab",
          })}
        </Button>
      </Rows>
    </div>
  );
};
