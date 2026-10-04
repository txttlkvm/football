import { useFeatureSupport } from "@canva/app-hooks";
import { Button, Rows, Text } from "@canva/app-ui-kit";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { requestOpenExternalUrl } from "@canva/platform";
import * as styles from "styles/components.css";

export const COURSE_URL = "https://two-shares-web.vercel.app/";

export const App = () => {
  const isSupported = useFeatureSupport();
  const addElement = [addElementAtPoint, addElementAtCursor].find((fn) =>
    isSupported(fn),
  );
  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="1u">
        <Text>Finish the Tackle · Coach Lab</Text>
        <Button
          variant="primary"
          disabled={!addElement}
          onClick={() =>
            addElement?.({ type: "embed", url: COURSE_URL })
          }
        >
          Add course to design
        </Button>
        <Button
          variant="secondary"
          onClick={() => requestOpenExternalUrl({ url: COURSE_URL })}
        >
          Open full screen
        </Button>
        <iframe
          title="Finish the Tackle course"
          src={COURSE_URL}
          style={{ width: "100%", height: "420px", border: 0, borderRadius: 8 }}
        />
      </Rows>
    </div>
  );
};
