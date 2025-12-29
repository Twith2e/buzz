import { LuSendHorizontal } from "react-icons/lu";
import { useSocketContext } from "../contexts/SocketContext";
import { useState, useRef } from "react";
import { useEffect } from "react";
import { useConversationContext } from "../contexts/ConversationContext";
import { useUserContext } from "@/contexts/UserContext";
import Message from "./Message";
import MessageMenu from "./MessageMenu";
import { formatAttachments, formatTime } from "@/lib/utils";
import type { ChatMessage } from "@/utils/types";
import useReadObserver from "@/hooks/useReadObserver";
import { useGetConversations } from "@/services/conversation/conversation";
import {
  LucideArrowLeft,
  LucideMic,
  LucidePhone,
  LucideSmile,
  LucideVideo,
  LucideX,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import FileModal from "./FileModal";
import SelectedFilePreview from "./SelectedFilePreview";
import { useSendMessage } from "@/hooks/useSendMessage";
import ConversationTitle from "./ConversationTitle";
import { useWebRTC } from "@/contexts/WebRTCContext";
import { useNavigation } from "@/contexts/NavigationContext";

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
    setConversations,
  } = useConversationContext();
  const { startCall, callState } = useWebRTC();
  const { back } = useNavigation();
  const { containerRef, registerMessageRef } = useReadObserver({
    emit,
    roomId,
    userId: user?._id,
  });
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight || 0,
        behavior: "smooth",
      });
    }
  }, [roomId]);

  useEffect(() => {
    // conditions when we should NOT autofocus
    const shouldSkipFocus =
      !roomId || // no conversation selected
      !initialized || // not initialized yet
      !connected || // socket not connected (optional)
      isAreaClicked || // emoji picker open
      openShare || // file modal open
      Boolean(selectedImage) || // preview open
      Boolean(selectedDoc); // doc preview open

    if (shouldSkipFocus) return;

    // ensure input is mounted/painted
    const id = window.requestAnimationFrame(() => {
      if (inputRef.current) {
        try {
          inputRef.current.focus();
          // move caret to end
          const len = inputRef.current.value?.length || 0;
          inputRef.current.setSelectionRange(len, len);
        } catch (err) {
          // ignore errors on mobile browsers that block focus
        }
      }
    });

    // cleanup
    return () => cancelAnimationFrame(id);
  }, [
    roomId,
    initialized,
    connected,
    isAreaClicked,
    openShare,
    selectedImage,
    selectedDoc,
  ]);

  useEffect(() => {
    if (!inputRef.current) return;
    // focus after message is sent
    const id = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(id);
  }, [sentMessages?.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight || 0,
        behavior: "smooth",
      });
    }
  }, [sentMessages?.length]);
  const { data: conversations } = useGetConversations();
  const currentConvo = conversations?.find(
    (c: any) => c._id === roomId || c.roomId === roomId
  );
  const isGroup = false;
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
    const att = formatAttachments(
      (found as any).attachment || (found as any).attachments
    );
    if (!att || att.length === 0) return tm;
    return { ...tm, attachments: att, attachment: att };
  }

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

  useEffect(() => {
    if (!on) return;

    const handleIncoming = (incoming: any) => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight || 0,
          behavior: "smooth",
        });
      }
      const normalized: ChatMessage =
        incoming && typeof incoming.from === "string"
          ? {
              id: incoming.id || incoming._id,
              conversationId: incoming.conversationId || incoming.conversation,
              from: { _id: incoming.from },
              message: incoming.message,
              ts: incoming.ts,
              status: incoming.status || "sent",
              attachments: formatAttachments(
                incoming.attachment || incoming.attachments
              ),
            }
          : {
              ...incoming,
              attachments: formatAttachments(
                incoming.attachment || incoming.attachments
              ),
            };
      setSentMessages((prev: any) => {
        const base = Array.isArray(prev) ? (prev as ChatMessage[]) : [];
        return [...base, normalized];
      });

      emit("message:received", {
        messageId: normalized.id || normalized._id,
        roomId,
      });
    };

    const off = on("chat-message", handleIncoming);

    return off;
  }, [on, roomId]);

  useEffect(() => {
    const off = on("message:delivered", ({ messageId }) => {
      setSentMessages((prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return (prev as ChatMessage[]).map((m: ChatMessage) =>
          m.id === messageId ? { ...m, status: "delivered" } : m
        );
      });
    });
    return off;
  }, [on]);

  useEffect(() => {
    const off = on("messages:read", ({ conversationId, upToId, readerId }) => {
      if (conversationId !== roomId) return;
      setSentMessages((prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return (prev as ChatMessage[]).map((m: ChatMessage) =>
          m.id === upToId ? { ...m, status: "read" } : m
        );
      });
    });

    return off;
  }, [on]);

  useEffect(() => {
    const off = on(
      "presence:update",
      ({
        userId,
        online,
        lastSeen,
      }: {
        userId: string;
        online: boolean;
        lastSeen?: string;
      }) => {
        setUsersOnline((prev) => {
          const idx = prev.findIndex((u) => u._id === userId);
          if (idx === -1) return [...prev, { _id: userId, online, lastSeen }];
          const next = [...prev];
          next[idx] = { ...next[idx], online, lastSeen };
          return next;
        });
      }
    );

    return off;
  }, [on, setUsersOnline]);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {roomId ? (
        <>
          <header className="bg-background dark:bg-matteBlack text-foreground w-full p-3 h-16 border-b flex items-center justify-between">
            {selectedImage &&
            selectedImage.images &&
            selectedImage.images.length > 0 ? (
              <div className="fixed bottom-0 z-50 p-2 bg-gray-700 w-[500px]">
                <SelectedFilePreview fileType="media" />
              </div>
            ) : selectedDoc &&
              selectedDoc.docs &&
              selectedDoc.docs.length > 0 ? (
              <div className="fixed bottom-0 z-50 p-2 bg-gray-700 w-[500px]">
                <SelectedFilePreview fileType="doc" />
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                onClick={() => back()}
                className="md:hidden text-foreground"
              >
                <LucideArrowLeft size={24} />
              </button>
              <div className="flex flex-col gap-2">
                <span>
                  <ConversationTitle title={conversationTitle} />
                </span>
                <span className="text-xs">
                  {isGroup && participantNames.length > 0
                    ? participantNames.join(", ")
                    : usersOnline.find((u) => u._id === contact)?.online
                    ? "Online"
                    : `Last seen ${formatTime(
                        usersOnline.find((u) => u._id === contact)?.lastSeen ||
                          contactList?.find((c) => c.email === email)
                            ?.contactProfile.lastSeen ||
                          ""
                      )}`}
                </span>
              </div>
            </div>
            <div className="flex flex-row-reverse items-center gap-4 pr-4">
              <button
                className="cursor-pointer hover:text-sky-300"
                type="button"
                onClick={() => {
                  startCall(
                    currentConversation.participants.find(
                      (p) => p._id !== user._id
                    )?._id,
                    "video"
                  );
                }}
              >
                <LucideVideo size={20} />
              </button>
              <button
                className="cursor-pointer hover:text-sky-300"
                type="button"
                disabled={callState !== "idle"}
                onClick={() => {
                  startCall(
                    currentConversation.participants.find(
                      (p) => p._id !== user._id
                    )?._id,
                    "audio"
                  );
                }}
              >
                <LucidePhone size={18} />
              </button>
            </div>
          </header>
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
            {sentMessages &&
              sentMessages.length > 0 &&
              sentMessages.map((m: any) => (
                <div
                  key={m._id || m.id || m.ts}
                  data-id={m._id || m.id || m.ts}
                  data-from={typeof m.from === "string" ? m.from : m.from?._id}
                  data-ts={m.ts}
                  ref={registerMessageRef(m._id || m.id || m.ts)}
                >
                  <Message
                    message={m.message}
                    isUser={
                      typeof m.from === "string"
                        ? m.from === user._id
                        : m.from?._id === user._id
                    }
                    time={m.ts}
                    status={m.status || ""}
                    attachments={m.attachments}
                    taggedMessage={
                      m.taggedMessage
                        ? enrichTaggedMessage(m.taggedMessage)
                        : undefined
                    }
                    taggedUser={(() => {
                      const ownerId =
                        m.taggedMessage &&
                        typeof m.taggedMessage.from === "string"
                          ? m.taggedMessage.from
                          : m.taggedMessage?.from?._id;
                      if (ownerId && ownerId === user._id) return "You";
                      const ownerEmail =
                        typeof m.taggedMessage?.from !== "string"
                          ? m.taggedMessage?.from?.email
                          : undefined;
                      const match = (contactList || []).find(
                        (c: any) =>
                          c.contactProfile?._id === ownerId ||
                          c._id === ownerId ||
                          (!!ownerEmail && c.email === ownerEmail)
                      );
                      if (match) return match.localName;
                      return ownerEmail || ownerId || "";
                    })()}
                    taggedOwnerIsUser={(() => {
                      const ownerId =
                        m.taggedMessage &&
                        typeof m.taggedMessage.from === "string"
                          ? m.taggedMessage.from
                          : m.taggedMessage?.from?._id;
                      return !!ownerId && ownerId === user._id;
                    })()}
                    onTagClick={() => {
                      const id =
                        (m.taggedMessage as any)?._id ||
                        (m.taggedMessage as any)?.id;
                      const container = containerRef.current;
                      if (!id || !container) return;
                      const target = container.querySelector(
                        `div[data-id="${id}"]`
                      ) as HTMLElement | null;
                      if (!target) return;
                      const tRect = target.getBoundingClientRect();
                      const cRect = container.getBoundingClientRect();
                      const offset =
                        tRect.top - cRect.top + container.scrollTop;
                      container.scrollTo({
                        top: offset - 40,
                        behavior: "smooth",
                      });
                      target.classList.add(
                        "ring-2",
                        "ring-blue-400",
                        "bg-blue-50"
                      );
                      setTimeout(() => {
                        target.classList.remove(
                          "ring-2",
                          "ring-blue-400",
                          "bg-blue-50"
                        );
                      }, 1200);
                    }}
                    handleRightClick={(e) => {
                      setMenu({
                        open: true,
                        top: e.pageY - 40,
                        left: e.pageX - 60,
                        message: m,
                      });
                    }}
                    sender={
                      currentConversation.title &&
                      currentConversation?.lastMessage.from
                    }
                  />
                </div>
              ))}
          </div>
          {replyMessage && (
            <div className="px-2 py-1 bg-gray-100 border-t border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-start gap-2 overflow-hidden">
                <div className="w-1 h-8 bg-emerald-400 rounded-sm" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600">Replying to</span>
                  {(() => {
                    const ra =
                      (replyMessage as any)?.attachment ||
                      (replyMessage as any)?.attachments;

                    return ra && ra.length > 0 ? (
                      <div className="flex gap-1 mt-1">
                        {ra.slice(0, 3).map((a: any, i: number) => {
                          const isVideo = /^(mp4|webm|ogg)$/i.test(
                            a.format || ""
                          );
                          const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(
                            a.format || ""
                          );
                          return (
                            <div
                              key={i}
                              className="w-10 h-10 rounded overflow-hidden"
                            >
                              {isImage ? (
                                <img
                                  src={a.url}
                                  alt={a.name || "media"}
                                  className="w-10 h-10 object-cover"
                                />
                              ) : isVideo ? (
                                <video
                                  src={a.url}
                                  className="w-10 h-10 object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 text-[10px] flex items-center justify-center bg-gray-200 text-gray-600">
                                  DOC
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : null;
                  })()}
                  <span className="text-sm text-gray-800 truncate w-full">
                    {replyMessage.message}
                  </span>
                </div>
              </div>
              <button
                className="text-gray-500 text-sm px-2 cursor-pointer"
                onClick={() => {
                  setSelectedMessageId(null);
                  setSelectedTag(null);
                }}
              >
                <LucideX size={14} />
              </button>
            </div>
          )}
          <form
            className="border-t border-sky-300 px-4 flex items-center h-14 bg-background"
            onSubmit={(e) => {
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
            }}
          >
            <div className="flex items-center gap-5 pr-5">
              <button
                className={`p-1 rounded-md cursor-pointer hover:bg-sky-300 hover:text-white grow-0`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAreaClicked(!isAreaClicked);
                }}
                type="button"
              >
                <LucideSmile size={20} />
              </button>
              <div
                ref={emojiRef}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className={`-bottom-[145px] fixed transition-transform duration-500 ease-in-out ${
                  isAreaClicked ? "translate-y-100" : "-translate-y-50"
                }`}
              >
                <EmojiPicker
                  autoFocusSearch
                  lazyLoadEmojis={true}
                  onEmojiClick={(e) => {
                    setMessage((prev) => prev + e.emoji);
                  }}
                />
              </div>
              <FileModal openShare={openShare} setOpenShare={setOpenShare} />
            </div>
            <input
              type="text"
              className="text-foreground grow px-2 py-1 h-full outline-none placeholder:text-gray-400"
              placeholder="Type a message"
              value={message || ""}
              ref={inputRef}
              onChange={(e) => setMessage(e.target.value)}
            />
            {message ? (
              <button
                aria-label="send message button"
                className="ml-2"
                disabled={!initialized || !connected}
              >
                <LuSendHorizontal size={24} />
              </button>
            ) : (
              <button>
                <LucideMic />
              </button>
            )}
          </form>
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
