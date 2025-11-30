import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogClose } from "./ui/dialog";
import NewGroupFlow from "./NewGroupFlow";
import useContact from "@/hooks/useContact";
import { alphabets } from "@/data/data";
import { useSocketContext } from "@/contexts/SocketContext";
import { Conversation } from "@/utils/types";
import { Loader } from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import { useConversationContext } from "@/contexts/ConversationContext";

const CreateGroup = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { user } = useUserContext();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [step, setStep] = useState(0);
  const { contactList } = useContact();
  const { emit } = useSocketContext();
  const { setConversations } = useConversationContext();

  function handleClick(): void {
    if (step === 0) {
      setStep(1);
    } else {
      const payload = {
        participants: [...selectedContacts, user?._id],
        title,
        creator: user?._id,
      };
      setIsCreating(true);
      console.log("create:group", payload);

      emit(
        "create:group",
        payload,
        (ack: {
          status: string;
          message?: string;
          conversation?: Conversation;
        }) => {
          if (!ack) {
            console.error("");
            return;
          }
          if (ack.status === "error") {
            console.error(ack.message || "");
          }
          if (ack.status === "ok" && ack.conversation) {
            console.log(ack.conversation);
            setIsCreating(false);
            setConversations((prev) => [...prev, ack.conversation]);
            setOpen(false);
          }
        }
      );
    }
  }

  const filterContactsByAlphabet = useCallback(() => {
    alphabets.forEach((alphabet) => {
      alphabet.contacts =
        contactList &&
        contactList.length > 0 &&
        contactList.filter((contact) =>
          contact.localName.toUpperCase().startsWith(alphabet.value)
        );
    });
  }, [contactList]);

  useEffect(() => {
    filterContactsByAlphabet();
  }, [filterContactsByAlphabet]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        hideClose
        className="max-h-[400px] overflow-y-auto p-0 pb-3 bg-slate-100 transition-[height] duration-300 ease-in"
      >
        <div className="sticky top-0 w-full bg-white pt-3 px-3 text-sm">
          <h2 className="text-center">Add members</h2>
          <div className="flex justify-between">
            {step === 0 ? (
              <DialogClose asChild>
                <button
                  type="button"
                  className="text-sm cursor-pointer hover:bg-accent px-1"
                >
                  Cancel
                </button>
              </DialogClose>
            ) : (
              <button
                className="text-sm cursor-pointer hover:bg-accent px-1"
                onClick={() => setStep(0)}
              >
                Back
              </button>
            )}
            <button
              className="disabled:text-gray-300 hover cursor-pointer"
              disabled={selectedContacts.length < 1 || step === 1}
              onClick={() => setStep(1)}
            >
              Next
            </button>
          </div>
        </div>
        <NewGroupFlow
          selectedContacts={selectedContacts}
          setSelectedContacts={setSelectedContacts}
          step={step}
          setTitle={setTitle}
        />
        {step === 1 && (
          <div className="flex gap-2 px-2">
            <button
              className="w-full rounded-lg bg-[#007bff] text-white py-2 disabled:bg-gray-300 cursor-pointer hover:bg-[#0056b3]"
              disabled={!title || isCreating}
              onClick={handleClick}
            >
              {isCreating ? (
                <div className="flex gap-2 items-center justify-center">
                  <span>Creating</span>
                  <Loader className="animate-spin" size={14} />
                </div>
              ) : (
                "Create"
              )}
            </button>
            <button
              className="w-full border rounded-lg"
              onClick={() => {
                setStep(0);
                setSelectedContacts([]);
                setTitle("");
                setOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
