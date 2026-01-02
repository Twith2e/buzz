import { useSocketContext } from "../contexts/SocketContext";
import { useState, useRef } from "react";
import { useConversationContext } from "../contexts/ConversationContext";
import { useUserContext } from "@/contexts/UserContext";
import MessageMenu from "./MessageMenu";
import useReadObserver from "@/hooks/useReadObserver";
import { useGetConversations } from "@/services/conversation/conversation";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useWebRTC } from "@/contexts/WebRTCContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useInputFocus } from "@/hooks/useInputFocus";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatForm } from "./ChatForm";
import { FilePreview } from "./FilePreview";
import useChatPagination from "@/hooks/useChatPagination";

export default function ChatUI() {
  const [openShare, setOpenShare] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [menu, setMenu] = useState<{
    open: boolean;
    top: number;
    left: number;
    message: any;
  }>({
    open: false,
    top: 0,
    left: 0,
    message: null,
  });
  const [selectedTag, setSelectedTag] = useState<{
    id: string;
    message: string;
    from: any;
  } | null>(null);

  // Context hooks
  const { user, contactList, isAreaClicked, setIsAreaClicked } =
    useUserContext();
  const { emit, on, connected } = useSocketContext();
  const {
    email,
    contact,
    roomId,
    initialized,
    setSentMessages,
    sentMessages,
    setUsersOnline,
    usersOnline,
    conversationTitle,
    selectedMessageId,
    setSelectedMessageId,
    selectedImage,
    selectedDoc,
    currentConversation,
    hasMore,
    cursor,
    setConversations,
  } = useConversationContext();
  const { startCall, callState } = useWebRTC();
  const { back } = useNavigation();

  // Ref hooks
  const { containerRef, registerMessageRef } = useReadObserver({
    emit,
    roomId,
    userId: user?._id,
  });
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Custom hooks
  useMessageHandlers({
    on,
    roomId,
    emit,
    setSentMessages,
    setUsersOnline,
  });

  const shouldFocus = !(
    !roomId ||
    !initialized ||
    !connected ||
    isAreaClicked ||
    openShare ||
    Boolean(selectedImage) ||
    Boolean(selectedDoc)
  );

  useInputFocus({
    inputRef,
    shouldFocus,
    triggerAfterSend: sentMessages?.length || 0,
  });

  const { loading: fetchingOlderMessages } = useChatPagination({
    containerRef,
    conversationId: currentConversation?._id || "",
    hasMore,
    cursor,
  });

  // useAutoScroll({
  //   containerRef,
  //   trigger: roomId,
  // });

  useAutoScroll({
    containerRef,
    trigger: sentMessages?.length,
  });

  // Data fetching
  const { data: conversations } = useGetConversations();
  const currentConvo = conversations?.find(
    (c: any) => c._id === roomId || c.roomId === roomId
  );

  // State derived from data
  const isGroup = false;
  const isLoadingMessages = !sentMessages || sentMessages.length === 0;
  const participantNames = currentConvo
    ? currentConvo.participants.map((p: any) => {
        if (p._id === user._id) return "You";
        const match = (contactList || []).find(
          (c: any) =>
            c.contactProfile?._id === p._id ||
            c._id === p._id ||
            c.email === p.email
        );
        return match ? match.localName : p.email;
      })
    : [];

  let replyMessage = selectedMessageId
    ? (sentMessages || []).find(
        (m: any) => (m._id || m.id) === selectedMessageId
      )
    : selectedTag;

  function enrichTaggedMessage(tm: any): any {
    if (!tm) return tm;
    const id = (tm as any)?._id || (tm as any)?.id;
    if (!id) return tm;
    const found = (sentMessages || []).find((m: any) => (m._id || m.id) === id);
    if (!found) return tm;
    const att = (found as any).attachment || (found as any).attachments;
    if (!att || att.length === 0) return tm;
    return { ...tm, attachments: att, attachment: att };
  }

  // Send message handler
  const { sendMessage } = useSendMessage({
    emit,
    roomId,
    userId: user?._id,
    initialized,
    connected,
    selectedMessageId,
    selectedTag,
    sentMessages,
    setSentMessages,
    setConversations,
  });

  // Event handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight || 0,
        behavior: "smooth",
      });
    }
    sendMessage(message);
    setMessage("");
    setSelectedMessageId(null);
    setSelectedTag(null);
  };

  const handleMessageRightClick = (e: React.MouseEvent, msg: any) => {
    setMenu({
      open: true,
      top: e.pageY - 40,
      left: e.pageX - 60,
      message: msg,
    });
  };

  const handleTagClick = (messageId: string) => {
    const container = containerRef.current;
    if (!container) return;
    const target = container.querySelector(
      `div[data-id="${messageId}"]`
    ) as HTMLElement | null;
    if (!target) return;
    const tRect = target.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const offset = tRect.top - cRect.top + container.scrollTop;
    container.scrollTo({
      top: offset - 40,
      behavior: "smooth",
    });
    target.classList.add("opacity-70");
    setTimeout(() => {
      target.classList.remove("opacity-70");
    }, 1200);
  };

  const handleClearReply = () => {
    setSelectedMessageId(null);
    setSelectedTag(null);
  };

  const handleReply = (messageData: any) => {
    const { id, message: msgText, from } = messageData;
    setSelectedTag({ id, message: msgText, from });
  };

  const userOnlineInfo = usersOnline.find((u) => u._id === contact);
  const userOnlineStatus = userOnlineInfo?.online;
  const userLastSeen =
    userOnlineInfo?.lastSeen ||
    contactList?.find((c) => c.email === email)?.contactProfile.lastSeen ||
    "";

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {roomId ? (
        <>
          <FilePreview
            selectedImage={selectedImage}
            selectedDoc={selectedDoc}
          />

          <ChatHeader
            conversationTitle={conversationTitle}
            onBack={back}
            onVideoCall={() => {
              startCall(
                currentConversation.participants.find((p) => p._id !== user._id)
                  ?._id,
                "video"
              );
            }}
            onAudioCall={() => {
              startCall(
                currentConversation.participants.find((p) => p._id !== user._id)
                  ?._id,
                "audio"
              );
            }}
            isCallDisabled={callState !== "idle"}
            isGroup={isGroup}
            participantNames={participantNames}
            userOnlineStatus={userOnlineStatus}
            userLastSeen={userLastSeen}
            showBackButton
          />

          {menu.open && (
            <div
              className="fixed z-50 bg-white border shadow rounded text-sm transform -translate-x-full -translate-y-1/2"
              style={{ top: menu.top, left: menu.left }}
            >
              <MessageMenu
                message={menu.message}
                setSelectedTag={setSelectedTag}
                setOpen={setMenu}
              />
            </div>
          )}

          <div
            className="grow overflow-y-auto p-4 flex flex-col gap-3 h-[80%]"
            ref={containerRef}
            onClick={() => menu.open && setMenu({ ...menu, open: false })}
          >
            <MessageList
              messages={sentMessages}
              isLoading={isLoadingMessages}
              roomId={roomId}
              currentUserId={user._id}
              contactList={contactList}
              onMessageRightClick={handleMessageRightClick}
              onTagClick={handleTagClick}
              onReply={handleReply}
              containerRef={containerRef}
              registerMessageRef={registerMessageRef}
              enrichTaggedMessage={enrichTaggedMessage}
              currentConversation={currentConversation}
            />
          </div>

          <ChatForm
            message={message}
            onMessageChange={setMessage}
            onSubmit={handleSendMessage}
            openShare={openShare}
            onOpenShareChange={setOpenShare}
            isAreaClicked={isAreaClicked}
            onIsAreaClickedChange={setIsAreaClicked}
            emojiRef={emojiRef}
            inputRef={inputRef}
            isDisabled={!initialized || !connected}
            replyMessage={replyMessage}
            onClearReply={handleClearReply}
          />
        </>
      ) : (
        <div className="h-[80%] flex items-center justify-center">
          <span className="text-gray-400">
            Please select a contact to start chatting
          </span>
        </div>
      )}
    </div>
  );
}
