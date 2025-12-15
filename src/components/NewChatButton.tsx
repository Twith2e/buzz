import {
  Loader,
  LucideCircleUserRound,
  LucideGroup,
  LucidePlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import useContact from "@/hooks/useContact";
import { useConversationContext } from "@/contexts/ConversationContext";
import NewContactForm from "./NewContactForm";
import useSearchEmail from "@/hooks/useSearchEmail";
import { MessageResponse } from "@/utils/types";
import api from "@/utils/api";
import AddMembers from "./CreateGroup";

const NewChatButton = () => {
  const { fetchingContactList, contacts } = useContact();
  const { createConversation, setSentMessages, roomId, setConversationTitle } =
    useConversationContext();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const { result, handleSearch, isSearching, error } = useSearchEmail();

  async function fetchConvoMessages(convoId: string) {
    try {
      const response = await api.get<MessageResponse>(
        `/messages/fetch/${convoId}`
      );
      setSentMessages(response.data.messages);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="relative">
            <LucidePlus size={24} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 px-5 pb-5 pt-0 space-y-5 max-h-96 relative bg-white">
          <DropdownMenuGroup className="sticky top-0 left-0 bg-white z-50 pt-3 w-full">
            <DropdownMenuLabel>New Chat</DropdownMenuLabel>
            <div className="border-b-2 border-b-sky-300 rounded-md border w-full">
              <input
                className="h-8 px-2 text-sm outline-none w-full"
                placeholder="Search name or email"
                onChange={(e) => handleSearch(e.target.value)}
                type="text"
              />
            </div>
          </DropdownMenuGroup>
          <DropdownMenuGroup className="overflow-y-auto space-y-4">
            <DropdownMenuItem
              onSelect={() => {
                setOpen(true);
              }}
            >
              <div className="flex gap-2 items-center">
                <LucideCircleUserRound />
                <span>New contact</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => {
                setOpenGroup(true);
              }}
            >
              <div className="flex gap-2 items-center">
                <LucideGroup />
                <span>New Group</span>
              </div>
            </DropdownMenuItem>

            <h1>All contacts</h1>
            {fetchingContactList ? (
              <div>Loading...</div>
            ) : isSearching ? (
              <div className="text-center flex items-center justify-center gap-2 text-xs text-accent-dark">
                <Loader className="animate-spin" size={12} />
                <span>Searching...</span>
              </div>
            ) : result ? (
              <>
                <div
                  className="flex gap-2 items-center"
                  onClick={() => {
                    setConversationTitle(result.email || "");
                    createConversation(result.email || "", result._id || "");
                    fetchConvoMessages(roomId || "");
                  }}
                >
                  {result.profilePic ? (
                    <img
                      src={result.profilePic}
                      alt={result.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <LucideCircleUserRound />
                  )}
                  <span className="text-sm">
                    {contacts.find((contact) => contact.email === result.email)
                      ?.localName || result.email}
                  </span>
                </div>
              </>
            ) : contacts && contacts.length ? (
              contacts.map((contact) => (
                <DropdownMenuItem key={contact._id}>
                  <div className="flex gap-2 items-center">
                    {contact.contactProfile?.profilePic ? (
                      <img
                        src={contact.contactProfile?.profilePic}
                        alt={contact.localName}
                      />
                    ) : (
                      <LucideCircleUserRound />
                    )}
                    <span>{contact.localName}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-sm text-gray-300 text-center">
                No contacts found
              </div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewContactForm open={open} setOpen={setOpen} />
      <AddMembers open={openGroup} setOpen={setOpenGroup} />
    </>
  );
};

export default NewChatButton;
