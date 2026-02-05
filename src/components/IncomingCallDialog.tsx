import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useWebRTC } from "@/contexts/WebRTCContext";
import { useUserContext } from "@/contexts/UserContext";

const IncomingCallDialog = () => {
  const { showDialog, incomingCall, acceptCall, rejectCall } = useWebRTC();
  const { contactList } = useUserContext();

  const isOpen = showDialog;

  const caller = contactList?.find(
    (c) =>
      c.email === incomingCall?.from ||
      c.contactProfile?._id === incomingCall?.from,
  );

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm rounded-3xl p-6 bg-background border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Incoming {incomingCall?.type === "video" ? "Video" : "Audio"} Call
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          <div className="w-24 h-24 rounded-full border-4 border-sky-100 dark:border-sky-900/30 overflow-hidden shadow-lg">
            {caller?.contactProfile?.profilePic ? (
              <img
                src={caller.contactProfile.profilePic}
                alt="caller"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-sky-50 dark:bg-sky-950/20 flex items-center justify-center text-sky-500">
                <Phone size={40} />
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-2xl font-bold text-foreground">
              {caller?.localName || "Unknown Caller"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {caller?.email || incomingCall?.from}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              className="bg-sky-300 hover:bg-sky-400 text-black"
              onClick={() => {
                if (!incomingCall) return;
                acceptCall(
                  incomingCall.offer,
                  incomingCall.from,
                  incomingCall.type,
                );
              }}
            >
              <Phone className="mr-2 h-4 w-4" /> Accept
            </Button>

            <Button variant="destructive" onClick={rejectCall}>
              <PhoneOff className="mr-2 h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallDialog;
