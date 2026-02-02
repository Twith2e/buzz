import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Chats from "../components/Chats";
import ChatUI from "../components/ChatUI";
import { useUserContext } from "@/contexts/UserContext";
import { useConversationContext } from "@/contexts/ConversationContext";
import Sidebar from "@/components/Sidebar";
import MediaPermissionUI from "@/components/MediaPermissionUI";
import IncomingCallDialog from "@/components/IncomingCallDialog";
import { Toaster } from "sonner";
import CallScreen from "@/components/CallScreen";
import { useNavigation } from "@/contexts/NavigationContext";
import { Fragment, useEffect, useState } from "react";
import BottomBar from "@/components/BottomBar";
import ChatJoyride from "@/components/ChatJoyride";

export default function Dashboard() {
  const { chatAreaRef, setIsAreaClicked, mediaOnboarded } = useUserContext();
  const { setSelectedImage } = useConversationContext();
  const { current } = useNavigation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mediaDialogOpen, setMediaDialogOpen] =
    useState<boolean>(!mediaOnboarded);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // keep dialog open state in sync with onboarding flag
    setMediaDialogOpen(!mediaOnboarded);
  }, [mediaOnboarded]);

  return (
    <Fragment>
      <ChatJoyride />
      <Toaster position="bottom-right" />
      {/* Permission dialog */}
      <MediaPermissionUI open={mediaDialogOpen} setOpen={setMediaDialogOpen} />

      <IncomingCallDialog />
      <CallScreen />

      <div className="flex h-screen">
        {isMobile ? (
          <>
            {current.name === "chat" ? (
              <div className="w-full h-full bg-background">
                <ChatUI />
              </div>
            ) : (
              <>
                <div
                  className="grow h-full overflow-hidden pb-16"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage({ images: null, currentIndex: null });
                    setIsAreaClicked(true);
                  }}
                >
                  <Chats />
                </div>
                <BottomBar />
              </>
            )}
          </>
        ) : (
          <>
            <Sidebar />
            <PanelGroup
              className="grow"
              autoSaveId="example"
              direction="horizontal"
              ref={chatAreaRef}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage({ images: null, currentIndex: null });
                setIsAreaClicked(true);
              }}
            >
              <Panel maxSize={60} minSize={25}>
                <Chats />
              </Panel>
              <PanelResizeHandle className="border-[#36454F] border-3" />
              <Panel defaultSize={30} minSize={20} className="bg-white">
                <ChatUI />
              </Panel>
            </PanelGroup>
          </>
        )}
      </div>
    </Fragment>
  );
}
