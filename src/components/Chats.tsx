import { CiSearch } from "react-icons/ci";
import { BsFilter } from "react-icons/bs";
import NewChatButton from "./NewChatButton";
import Convo from "./Conversation";
import { useConversationContext } from "@/contexts/ConversationContext";

export default function Chats() {
  const { conversations } = useConversationContext();
  return (
    <div className="py-3 px-2 relative h-screen">
      <div className="flex items-center justify-between">
        <span className="font-rubik px-1 text-2xl">Messages</span>
        <div className="flex gap-3">
          <NewChatButton />
          <button>
            <BsFilter size={24} />
          </button>
        </div>
      </div>
      <div
        className="border flex items-center px-3 bg-[#0f1a2b] rounded-xl mx-1 my-3"
        role="search"
      >
        <CiSearch size={20} color="white" />
        <input
          type="text"
          placeholder="Search or start a new chat"
          className="p-2 w-full outline-none bg-[#0f1a2b] text-white"
        />
      </div>
      {conversations &&
        conversations.length > 0 &&
        conversations.map((conversation) => (
          <button
            key={conversation._id}
            className="flex items-center gap-3 font-sans text-black w-full my-1 hover:bg-gray-100 p-2 rounded-md"
          >
            <Convo conversation={conversation} />
          </button>
        ))}
    </div>
  );
}
