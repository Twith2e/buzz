import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useWebRTC } from "@/contexts/WebRTCContext";

const IncomingCallDialog = () => {
  const { showDialog, incomingCall, peerId, acceptCall, rejectCall } =
    useWebRTC();

  const isOpen = showDialog;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            Incoming {incomingCall?.type === "video" ? "Video" : "Audio"} Call
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-sm text-muted-foreground">
            {incomingCall?.from}
          </div>

          <div className="flex gap-4">
            <Button
              className="bg-sky-300 hover:bg-sky-400 text-black"
              onClick={() => {
                if (!incomingCall) return;
                acceptCall(
                  incomingCall.offer,
                  incomingCall.from,
                  incomingCall.type
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
