import MediaPermissionUI from "@/components/MediaPermissionUI";
import IncomingCallDialog from "@/components/IncomingCallDialog";
import CallScreen from "@/components/CallScreen";
import { Toaster } from "sonner";
import { useUserContext } from "@/contexts/UserContext";
import { useState, useEffect } from "react";

export default function GlobalUI() {
  const { mediaOnboarded } = useUserContext();
  const [mediaDialogOpen, setMediaDialogOpen] =
    useState<boolean>(!mediaOnboarded);

  useEffect(() => {
    setMediaDialogOpen(!mediaOnboarded);
  }, [mediaOnboarded]);

  return (
    <>
      <Toaster position="bottom-right" />
      <MediaPermissionUI open={mediaDialogOpen} setOpen={setMediaDialogOpen} />
      <IncomingCallDialog />
      <CallScreen />
    </>
  );
}
