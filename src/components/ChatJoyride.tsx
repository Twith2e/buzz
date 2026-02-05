import { steps } from "@/lib/utils";
import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { useUserContext } from "@/contexts/UserContext";
import api from "@/utils/api";

function ChatJoyride() {
  const [run, setRun] = useState(false);
  const { user } = useUserContext();

  useEffect(() => {
    // Check both localStorage and user model
    if (!localStorage.getItem("tour:chat") && user && !user.toured) {
      setRun(true);
    }
  }, [user]);

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showSkipButton
      showProgress
      locale={{ last: "got it!" }}
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
      callback={async (data) => {
        if (["finished", "skipped"].includes(data.status)) {
          localStorage.setItem("tour:chat", "true");
          setRun(false);
          try {
            await api.post("/users/tour", { completed: true });
          } catch (error) {
            console.error("Failed to sync tour status:", error);
          }
        }
      }}
    />
  );
}

export default ChatJoyride;
