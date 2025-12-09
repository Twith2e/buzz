import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Chats from "../components/Chats";
import ChatUI from "../components/ChatUI";
import { useUserContext } from "@/contexts/UserContext";
import { useConversationContext } from "@/contexts/ConversationContext";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const { chatAreaRef, setIsAreaClicked } = useUserContext();
  const { setSelectedImage } = useConversationContext();

  return (
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
  );
}
