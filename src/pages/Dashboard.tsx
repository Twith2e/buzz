import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Chats from "../components/Chats";
import ChatUI from "../components/ChatUI";
import { useUserContext } from "@/contexts/UserContext";
import { useConversationContext } from "@/contexts/ConversationContext";
import Sidebar from "@/components/Sidebar";
import MediaPermissionUI from "@/components/MediaPermissionUI";
import IncomingCallDialog from "@/components/IncomingCallDialog";

import CallScreen from "@/components/CallScreen";

export default function Dashboard() {
  const { chatAreaRef, setIsAreaClicked, mediaOnboarded } = useUserContext();
  const { setSelectedImage } = useConversationContext();

  return (
    <>
      {/* Permission dialog */}
      <MediaPermissionUI open={!mediaOnboarded} />

      <IncomingCallDialog />
      <CallScreen />

      <div className="flex h-screen">
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
      </div>
    </>
  );
}
