import NewChatButton from "./NewChatButton";
import Convo from "./Conversation";
import { useConversationContext } from "@/contexts/ConversationContext";

export default function Chats() {
  const { conversations, isLoading } = useConversationContext();
  return (
    <div className="pt-3 px-2 relative h-screen">
      <div className="sticky">
        <div className="flex items-center justify-between">
          <span className="font-rubik px-1 text-2xl">Messages</span>
          <div className="flex gap-3">
            <NewChatButton />
          </div>
        </div>
      </div>
      <div className="overflow-auto h-[calc(100vh-110px)] lg:h-[calc(100vh-50px)]">
        <div className="overflow-auto h-full lg:h-full">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 font-sans text-black w-full my-1 hover:bg-gray-100 hover:dark:bg-gray-800 p-2 rounded-md"
                >
                  <Convo isLoading={true} />
                </div>
              ))
            : conversations &&
              conversations.length > 0 &&
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  className="flex items-center gap-3 font-sans text-black w-full my-1 hover:bg-gray-100 hover:dark:bg-gray-800 p-2 rounded-md"
                >
                  <Convo conversation={conversation} isLoading={false} />
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
