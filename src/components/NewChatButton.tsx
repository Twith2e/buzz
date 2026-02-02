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
import AddMembers from "./CreateGroup";
import { computedTitle } from "@/lib/utils";
import { MessageResponse } from "@/utils/types";
import api from "@/utils/api";

const NewChatButton = () => {
  const { setIsFetchingMessage, setHasMore, setCursor, setSentMessages } =
    useConversationContext();
  async function fetchConvoMessages(convoId: string) {
    setIsFetchingMessage(true);
    try {
      const response = await api.get<MessageResponse>(
        `/messages/fetch/${convoId}`,
      );
      setHasMore(response.data.hasMore);
      setCursor(response.data.nextCursor);
      setSentMessages(response.data.messages);
    } catch (error) {
      console.error(error);
      setSentMessages([]);
    } finally {
      setIsFetchingMessage(false);
    }
  }

  const { fetchingContactList, contacts } = useContact();
  const { createConversation, setConversationTitle } = useConversationContext();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const { result, handleSearch, isSearching } = useSearchEmail();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="relative" data-coachmark="new-chat">
            <LucidePlus size={24} />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 px-5 pb-5 pt-0 space-y-5 max-h-96 relative bg-background">
          <DropdownMenuGroup className="sticky top-0 left-0 bg-background z-50 pt-3 w-full">
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
                  className="flex gap-2 items-center cursor-pointer hover:bg-accent 
                  p-2"
                  onClick={() => {
                    const title = computedTitle(
                      undefined,
                      contacts.find(
                        (contact) => contact.email === result.user.email,
                      ) || null,
                      result.user,
                    );
                    fetchConvoMessages(result.conversationId);
                    setSentMessages([]);
                    setConversationTitle(title);
                    createConversation(
                      result.user.email || "",
                      result.user._id || "",
                    );
                  }}
                >
                  {result.user.profilePic ? (
                    <img
                      src={result.user.profilePic}
                      alt={result.user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <LucideCircleUserRound />
                  )}
                  <span className="text-sm cursor-pointer">
                    {contacts.find(
                      (contact) => contact.email === result.user.email,
                    )?.localName || result.user.email}
                  </span>
                </div>
              </>
            ) : contacts && contacts.length ? (
              contacts.map((contact) => (
                <DropdownMenuItem className="cursor-pointer" key={contact._id}>
                  <div
                    className="flex gap-2 items-center"
                    onClick={() => {
                      setConversationTitle(
                        computedTitle(
                          undefined,
                          contact,
                          contact.contactProfile,
                        ),
                      );
                      createConversation(
                        contact.email || "",
                        contact._id || "",
                      );
                    }}
                  >
                    {contact.contactProfile?.profilePic ? (
                      <img
                        className="w-8 h-8 rounded-full"
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
