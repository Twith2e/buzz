import { useSocketContext } from "../contexts/SocketContext";
import { useState, useRef, useEffect } from "react";
import { Loader } from "lucide-react";
import { useConversationContext } from "../contexts/ConversationContext";
import { useUserContext } from "@/contexts/UserContext";
import { useTypingContext } from "@/contexts/TypingContext";
import MessageMenu from "./MessageMenu";
import useReadObserver from "@/hooks/useReadObserver";
import { useGetConversations } from "@/services/conversation/conversation";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useWebRTC } from "@/contexts/WebRTCContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { useMessageHandlers } from "@/hooks/useMessageHandlers";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useInputFocus } from "@/hooks/useInputFocus";
import {
  getCloudinarySignature,
  uploadFileToCloudinary,
} from "@/utils/cloudinary";
import { makeClientId } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatForm } from "./ChatForm";
import { FilePreview } from "./FilePreview";
import useChatPagination from "@/hooks/useChatPagination";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";

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
    selectedMessageId,
    setSelectedMessageId,
    selectedImage,
    selectedDoc,
    currentConversation,
    hasMore,
    cursor,
    isFetchingMessage,
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
    setConversations,
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
    selectedTag,
  });

  const { setConversationId } = useTypingContext();

  // Update typing context with current conversation
  useEffect(() => {
    setConversationId(currentConversation?._id || "");
  }, [currentConversation?._id, setConversationId]);

  const { loading: fetchingOlderMessages } = useChatPagination({
    containerRef,
    conversationId: currentConversation?._id || "",
    hasMore,
    cursor,
  });

  useAutoScroll({
    containerRef,
    trigger: roomId,
  });

  useAutoScroll({
    containerRef,
    trigger: sentMessages?.length,
  });

  const { stop } = useVoiceRecorder();

  // Data fetching
  const { data: conversations } = useGetConversations();
  const currentConvo = conversations?.find(
    (c: any) => c._id === roomId || c.roomId === roomId,
  );

  // State derived from data
  const isGroup = false;
  const participantNames = currentConvo
    ? currentConvo.participants.map((p: any) => {
        if (p._id === user._id) return "You";
        const match = (contactList || []).find(
          (c: any) =>
            c.contactProfile?._id === p._id ||
            c._id === p._id ||
            c.email === p.email,
        );
        return match ? match.localName : p.email;
      })
    : [];

  let replyMessage = selectedMessageId
    ? (sentMessages || []).find(
        (m: any) => (m._id || m.id) === selectedMessageId,
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
  const handleSendVoice = async (blobArg?: Blob) => {
    const blob = blobArg || (await stop());

    if (!blob) return;

    const file = new File([blob], "voice-note.webm", {
      type: "audio/webm",
    });

    const signData = await getCloudinarySignature("voice-notes");
    const uploadRes = await uploadFileToCloudinary(file, signData);

    sendMessage("", [
      {
        format: uploadRes.format,
        originalFilename: uploadRes.original_filename,
        bytes: uploadRes.bytes,
        url: uploadRes.secure_url,
        resourceType: uploadRes.resource_type,
        publicId: uploadRes.public_id,
      },
    ]);
  };

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

  // Listen for voice send events dispatched by ChatForm
  useEffect(() => {
    function onSendVoice(e: any) {
      const { file, tempId } = e.detail || {};
      if (!file || !roomId) return;

      const clientTempId = tempId || makeClientId();
      const localUrl = URL.createObjectURL(file);

      const optimistic: any = {
        id: clientTempId,
        tempId: clientTempId,
        conversationId: roomId,
        from: { _id: user?._id },
        message: "",
        ts: new Date().toISOString(),
        status: "sending",
        attachments: [
          {
            url: localUrl,
            format: file.type.split("/")[1] || "webm",
            name: file.name,
            size: file.size,
          },
        ],
      };

      setSentMessages((prev: any) => {
        const base = Array.isArray(prev) ? (prev as any[]) : [];
        return [...base, optimistic];
      });

      // upload then send via sendMessage with skipOptimistic
      (async () => {
        try {
          const sign = await getCloudinarySignature(`chats/${roomId}`);
          const res = await uploadFileToCloudinary(file, sign);
          const url = res.secure_url || res.url;
          const uploaded = [
            {
              url,
              format: res.format || file.type.split("/")[1] || "webm",
              name: file.name,
              bytes: res.bytes || file.size,
            },
          ];

          // call sendMessage to emit and let reconciliation happen; skip optimistic because we added one
          sendMessage("", uploaded, clientTempId, { skipOptimistic: true });
        } catch (err) {
          console.error("voice upload/send failed", err);
        } finally {
          // revoke local URL
          try {
            URL.revokeObjectURL(localUrl);
          } catch (e) {}
        }
      })();
    }

    window.addEventListener("tapo:send-voice" as any, onSendVoice as any);
    return () =>
      window.removeEventListener("tapo:send-voice" as any, onSendVoice as any);
  }, [roomId, sendMessage, setSentMessages, user?._id]);

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
      `div[data-id="${messageId}"]`,
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
            onBack={back}
            onVideoCall={() => {
              startCall(
                currentConversation.participants.find((p) => p._id !== user._id)
                  ?.email,
                "video",
              );
            }}
            onAudioCall={() => {
              startCall(
                currentConversation.participants.find((p) => p._id !== user._id)
                  ?.email,
                "audio",
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
              style={{ top: menu.top, left: menu.left }}>
              <MessageMenu
                message={menu.message}
                setSelectedTag={setSelectedTag}
                setOpen={setMenu}
              />
            </div>
          )}

          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            ref={containerRef}
            onClick={() => menu.open && setMenu({ ...menu, open: false })}>
            {fetchingOlderMessages && (
              <div className="flex items-center justify-center w-full py-2">
                <Loader size={16} className="animate-spin" />
                <span className="ml-2 text-xs text-gray-500">
                  Loading older messages...
                </span>
              </div>
            )}
            <MessageList
              messages={sentMessages}
              isLoading={isFetchingMessage}
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
            onSendVN={handleSendVoice}
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
