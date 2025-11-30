import { LuSendHorizontal } from "react-icons/lu";
import { IoMdCall } from "react-icons/io";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { useSocketContext } from "../contexts/SocketContext";
import { FormEvent, useRef, useState } from "react";
import { useEffect } from "react";
import { useConversationContext } from "../contexts/ConversationContext";
import { useUserContext } from "@/contexts/UserContext";
import Message from "./Message";
import MessageMenu from "./MessageMenu";
import { formatTime, makeClientId } from "@/lib/utils";
import type { ChatMessage } from "@/utils/types";
import useReadObserver from "@/hooks/useReadObserver";
import { useGetConversations } from "@/services/conversation/conversation";
import { LucideX } from "lucide-react";

export default function ChatUI() {
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const { user, contactList } = useUserContext();
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
  } = useConversationContext();
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
  const { containerRef, registerMessageRef } = useReadObserver({
    emit,
    roomId,
    userId: user?._id,
  });
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

  const replyMessage = selectedMessageId
    ? (sentMessages || []).find(
        (m: any) => (m._id || m.id) === selectedMessageId
      )
    : selectedTag;

  function addOptimisticMessage(
    setSentMessages: (val: any) => void,
    { tempId, roomId, user, message }
  ) {
    let tagged: any = null;
    if (selectedMessageId) {
      console.log(sentMessages);

      const found = (sentMessages || []).find(
        (m: any) => (m._id || m.id) === selectedMessageId
      );
      if (found) {
        console.log("found");

        tagged = {
          _id: found._id || found.id,
          message: found.message,
          from:
            typeof found.from === "string" ? { _id: found.from } : found.from,
        };
      }
    }
    if (!tagged && selectedTag) {
      tagged = selectedTag;
    }

    const optimistic: ChatMessage = {
      id: tempId,
      tempId,
      conversationId: roomId,
      from: { _id: user?._id },
      message,
      ts: new Date().toISOString(),
      status: "sending",
      taggedMessage: tagged || undefined,
    };

    setSentMessages((prev: any) => {
      const base = Array.isArray(prev) ? (prev as ChatMessage[]) : [];
      return [...base, optimistic];
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message) return;
    if (!initialized || !roomId) {
      console.error("Initialized or room id does not exist");
      return;
    }
    if (!connected) {
      console.error("Socket not connected");
      return;
    }

    const tempId = makeClientId();

    // scroll to bottom
    messagesRef.current?.scrollTo({
      top: messagesRef.current?.scrollHeight || 0,
      behavior: "smooth",
    });

    addOptimisticMessage(setSentMessages, { tempId, roomId, user, message });

    const payload = {
      id: tempId,
      roomId,
      message,
      from: user._id,
      taggedMessage: selectedMessageId ? selectedMessageId : "",
    };

    console.log("payload: ", payload);

    let ackHandled = false;

    // 3) set a timeout in case the ack never arrives
    const ackTimeout = setTimeout(() => {
      if (!ackHandled) {
        setSentMessages((prev: any) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((m: any) =>
            m.id === tempId ? { ...m, status: "failed" } : m
          );
        });
        console.error("send-message ack timeout (message marked failed)");
      }
    }, 10000);

    emit("send-message", payload, (ack: any) => {
      ackHandled = true;
      clearTimeout(ackTimeout);

      if (!ack) {
        console.error("no ack from server");
        setSentMessages((prev: any) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((m: any) =>
            m.id === tempId ? { ...m, status: "failed" } : m
          );
        });
        return;
      }

      if (ack.status === "error") {
        console.error("send error:", ack.error);
        setSentMessages((prev: any) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((m: any) =>
            m.id === tempId ? { ...m, status: "failed" } : m
          );
        });
        return;
      }

      // success — server payload should include clientId
      const serverPayload = ack.payload;

      console.log("ack-payload: ", serverPayload);

      // Prefer server to include clientId; if not, server could include it in another key
      const clientIdFromServer =
        serverPayload.clientId || serverPayload.tempId || tempId;

      const normalized: ChatMessage =
        serverPayload && typeof serverPayload.from === "string"
          ? {
              id: serverPayload.id || serverPayload._id,
              tempId: clientIdFromServer,
              conversationId: serverPayload.conversationId || roomId,
              from: {
                _id: serverPayload.from,
              },
              message: serverPayload.message,
              ts: serverPayload.ts || new Date().toISOString(),
              status: serverPayload.status || "sent",
            }
          : { ...serverPayload, tempId: clientIdFromServer };

      setSentMessages((prev: any) => {
        if (!Array.isArray(prev)) return [normalized];
        const optimistic = (prev as ChatMessage[]).find(
          (m: any) => m.id === tempId
        );
        const merged = {
          ...normalized,
          taggedMessage:
            (normalized as any).taggedMessage ??
            (optimistic as any)?.taggedMessage,
        } as ChatMessage;
        return (prev as ChatMessage[]).map((m: ChatMessage) =>
          m.id === tempId ? merged : m
        );
      });
    });

    setMessage("");
    setSelectedMessageId(null);
    setSelectedTag(null);
  }

  useEffect(() => {
    if (!on) return;

    const handleIncoming = (incoming: any) => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current?.scrollHeight || 0,
        behavior: "smooth",
      });
      const normalized: ChatMessage =
        incoming && typeof incoming.from === "string"
          ? {
              id: incoming.id || incoming._id,
              conversationId: incoming.conversationId || incoming.conversation,
              from: { _id: incoming.from },
              message: incoming.message,
              ts: incoming.ts,
              status: incoming.status || "sent",
            }
          : incoming;
      setSentMessages((prev: any) => {
        const base = Array.isArray(prev) ? (prev as ChatMessage[]) : [];
        return [...base, normalized];
      });
      console.log("normalized: ", normalized);

      console.log("message:received-roomId:", roomId);

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
    <div className="flex flex-col h-full w-full bg-[#FEFFFC]">
      {roomId ? (
        <>
          {" "}
          <header className="bg-[#28282B] w-full p-3 h-16 flex items-center justify-between text-white">
            <div className="flex flex-col gap-2">
              <span>{conversationTitle}</span>
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
            <div className="flex items-center gap-3">
              <button type="button">
                <HiOutlineVideoCamera />
              </button>
              <button type="button">
                <IoMdCall />
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
                    taggedMessage={m.taggedMessage}
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
                  <span className="text-sm text-gray-800 truncate w-full">
                    {replyMessage.message}
                  </span>
                </div>
              </div>
              <button
                className="text-gray-500 text-sm px-2 cursor-pointer"
                onClick={() => setSelectedMessageId(null)}
              >
                <LucideX size={14} />
              </button>
            </div>
          )}
          <form
            className="border-t border-brandSky px-2 flex items-center h-14 bg-white "
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              className="text-black grow px-2 py-1 h-full outline-none placeholder:text-gray-400"
              placeholder="Type a message"
              value={message || ""}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              aria-label="send message button"
              className="ml-2"
              disabled={!initialized || !connected}
            >
              <LuSendHorizontal size={24} />
            </button>
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
