import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Chats from "../components/Chats";
import ChatUI from "../components/ChatUI";
import { useUserContext } from "@/contexts/UserContext";
import { useConversationContext } from "@/contexts/ConversationContext";
import Sidebar from "@/components/Sidebar";
import MediaPermissionUI from "@/components/MediaPermissionUI";
import IncomingCallDialog from "@/components/IncomingCallDialog";

import CallScreen from "@/components/CallScreen";
import { useNavigation } from "@/contexts/NavigationContext";
import { useEffect, useState } from "react";
import BottomBar from "@/components/BottomBar";

export default function Dashboard() {
  const { chatAreaRef, setIsAreaClicked, mediaOnboarded } = useUserContext();
  const { setSelectedImage } = useConversationContext();
  const { current } = useNavigation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Permission dialog */}
      <MediaPermissionUI open={!mediaOnboarded} />

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
                <div className="grow h-full overflow-hidden pb-16">
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
              onClick={() => {
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
    </>
  );
}
