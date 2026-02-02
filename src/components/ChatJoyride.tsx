import { steps } from "@/lib/utils";
import { useEffect, useState } from "react";
import Joyride from "react-joyride";

function ChatJoyride() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("tour:chat")) {
      setRun(true);
    }
  }, []);

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          arrowColor: "hsl(var(--popover))",
          backgroundColor: "hsl(var(--popover))",
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--popover-foreground))",
          overlayColor: "rgba(0, 0, 0, 0.6)",
        },
        tooltip: {
          borderRadius: "var(--radius)",
          fontSize: "14px",
          padding: "1rem",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "var(--radius)",
          outline: "none",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      callback={(data) => {
        if (["finished", "skipped"].includes(data.status)) {
          localStorage.setItem("tour:chat", "true");
          setRun(false);
        }
      }}
    />
  );
}

export default ChatJoyride;
