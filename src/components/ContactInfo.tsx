import {
  LucideX,
  LucideUser2,
  LucideBan,
  LucideBell,
  LucideTrash2,
  LucideImage,
  LucideShare2,
  LucidePencil,
  LucideCheck,
  LucideLoader2,
  LucideUsers,
} from "lucide-react";
import { Contact, Conversation, Participant } from "@/utils/types";
import { useUserContext } from "@/contexts/UserContext";
import { useState } from "react";
import { useUpsertContact } from "@/hooks/useUpsertContact";
import { toast } from "sonner";

interface ContactInfoProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: Participant | null;
  conversation: Conversation | null;
  onBlock: (email: string | undefined, block: boolean) => void;
  isGroup: boolean;
}

export default function ContactInfo({
  isOpen,
  onClose,
  otherUser,
  conversation,
  onBlock,
  isGroup,
}: ContactInfoProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const { mutate: upsertContact, isLoading: isUpdating } = useUpsertContact();

  if (!isOpen) return null;

  const { contactList, user } = useUserContext();
  const otherParticipant = contactList?.find(
    (p: Contact) => p?.contactProfile?._id === otherUser?._id,
  );

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto md:z-10 flex flex-col h-full w-full md:w-80 bg-background border-l border-border shadow-lg animate-in slide-in-from-right duration-300">
      <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center p-4 h-16 border-b border-border bg-muted/20">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors mr-3 text-muted-foreground group"
          >
            <LucideX
              size={20}
              className="group-hover:rotate-90 transition-transform duration-200"
            />
          </button>
          <span className="font-semibold text-lg text-foreground">
            {isGroup ? "Group-Info" : "Contact-Info"}
          </span>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center p-8 bg-card border-b border-border">
          <div className="relative group">
            <div className="h-36 w-36 rounded-full bg-sky-100 dark:bg-sky-950/30 flex items-center justify-center border-4 border-background shadow-xl overflow-hidden mb-5 transition-transform duration-300 group-hover:scale-105">
              {isGroup ? (
                <LucideUsers size={70} className="text-sky-500" />
              ) : !otherParticipant?.blockedMe &&
                !otherParticipant?.isBlocked &&
                otherParticipant?.contactProfile?.profilePic ? (
                <img
                  src={otherParticipant.contactProfile.profilePic}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <LucideUser2 size={70} className="text-sky-500" />
              )}
            </div>
            <div className="absolute bottom-6 right-2 bg-sky-500 rounded-full p-2 border-4 border-background text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <LucideImage size={16} />
            </div>
          </div>
          <div className="flex flex-col items-center w-full px-4 mt-5">
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={isUpdating}
                  className="flex-1 bg-muted border border-sky-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50"
                  placeholder="Enter local name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isUpdating) {
                      const email = otherParticipant?.email || otherUser?.email;
                      if (!email) return;
                      upsertContact(
                        { email, firstName: newName },
                        {
                          onSuccess: () => {
                            setIsEditingName(false);
                            toast.success("Contact name updated");
                          },
                        },
                      );
                    }
                  }}
                  autoFocus
                />
                <button
                  disabled={isUpdating}
                  onClick={() => {
                    const email = otherParticipant?.email || otherUser?.email;
                    if (!email) return;
                    upsertContact(
                      { email, firstName: newName },
                      {
                        onSuccess: () => {
                          setIsEditingName(false);
                          toast.success("Contact name updated");
                        },
                      },
                    );
                  }}
                  className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[36px]"
                >
                  {isUpdating ? (
                    <LucideLoader2 size={16} className="animate-spin" />
                  ) : (
                    <LucideCheck size={16} />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 max-w-full justify-center group/name">
                <h2 className="text-xl font-bold text-foreground text-center line-clamp-1">
                  {isGroup
                    ? conversation?.title || "Group Chat"
                    : otherParticipant?.localName ||
                      otherParticipant?.contactProfile?.displayName ||
                      otherUser?.displayName ||
                      otherUser?.email}
                </h2>
                {!isGroup && (
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setNewName(otherParticipant?.localName || "");
                    }}
                    className="p-1.5 opacity-0 group-hover/name:opacity-100 hover:bg-muted rounded-full transition-all"
                  >
                    <LucidePencil size={14} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 font-medium text-center">
              {isGroup
                ? `${conversation?.participants?.length || 0} participants`
                : otherParticipant?.email || otherUser?.email}
            </p>
          </div>
        </div>

        {/* Action List */}
        <div className="flex flex-col gap-1 p-2 pt-4 bg-background">
          <button className="flex items-center gap-4 p-3.5 hover:bg-muted/80 rounded-xl transition-all text-foreground group">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
              <LucideImage size={20} className="text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Media, Links and Docs</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                0 items shared
              </p>
            </div>
            <span className="text-xs font-bold text-sky-500 bg-sky-500/10 px-2 py-1 rounded-full">
              0
            </span>
          </button>
          <button className="flex items-center gap-4 p-3.5 hover:bg-muted/80 rounded-xl transition-all text-foreground group">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
              <LucideBell size={20} className="text-muted-foreground" />
            </div>
            <span className="flex-1 text-sm font-semibold text-left">
              Mute Notifications
            </span>
          </button>
          <button className="flex items-center gap-4 p-3.5 hover:bg-muted/80 rounded-xl transition-all text-foreground group">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
              <LucideShare2 size={20} className="text-muted-foreground" />
            </div>
            <span className="flex-1 text-sm font-semibold text-left">
              Share Contact
            </span>
          </button>
        </div>

        {/* Dangerous Actions */}
        {!isGroup && (
          <div className="mt-8 p-4 bg-muted/5 flex flex-col gap-3">
            <button
              onClick={() => {
                const emailToBlock =
                  otherParticipant?.email || otherUser?.email;
                const isBlocked = otherParticipant?.isBlocked || false;
                onBlock(emailToBlock, !isBlocked);
                console.log(
                  isBlocked ? "Unblocking email:" : "Blocking email:",
                  emailToBlock,
                );
              }}
              className="flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-2xl transition-all w-full border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <LucideBan size={20} />
              </div>
              <span className="text-sm font-bold">
                {otherParticipant?.isBlocked ? "Unblock" : "Block"}{" "}
                {otherParticipant?.localName || "Contact"}
              </span>
            </button>
            <button className="flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-2xl transition-all w-full border border-transparent hover:border-red-200 dark:hover:border-red-900/50">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <LucideTrash2 size={20} />
              </div>
              <span className="text-sm font-bold">
                Report {otherParticipant?.localName || "Contact"}
              </span>
            </button>
          </div>
        )}

        {isGroup && (
          <div className="mt-4 px-4 overflow-hidden">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Group Participants
            </h3>
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              {conversation?.participants.map((p) => {
                const contact = contactList?.find(
                  (c) => c.contactProfile?._id === p._id,
                );
                return (
                  <div
                    key={p._id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {p.profilePic ? (
                        <img
                          src={p.profilePic}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <LucideUser2 size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-none">
                        {p._id === (user as any)?._id
                          ? "You"
                          : contact?.localName || p.displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-1">
                        {p.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="flex items-center gap-4 p-4 mt-6 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-2xl transition-all w-full border border-transparent hover:border-red-200 dark:hover:border-red-900/50">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <LucideBan size={20} />
              </div>
              <span className="text-sm font-bold">Exit Group</span>
            </button>
          </div>
        )}

        <div className="p-8 text-center opacity-40">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
