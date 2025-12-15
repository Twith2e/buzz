import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { useWebRTC } from "@/contexts/WebRTCContext";

const IncomingCallDialog = () => {
  const { on } = useSocketContext();
  const { acceptCall } = useWebRTC();

  const [incoming, setIncoming] = useState<{
    from: string;
    offer: RTCSessionDescriptionInit;
  } | null>(null);

  useEffect(() => {
    const off = on("offer", ({ from, offer }) => {
      setIncoming({ from, offer });
    });

    return () => off("offer");
  }, []);

  const closeDialog = () => setIncoming(null);

  return (
    <Dialog open={!!incoming}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">Incoming Call</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-sm text-muted-foreground">{incoming?.from}</div>

          <div className="flex gap-4">
            <Button
              className="bg-sky-300 hover:bg-sky-400 text-black"
              onClick={() => {
                if (!incoming) return;
                acceptCall(incoming.offer, incoming.from);
                closeDialog();
              }}
            >
              <Phone className="mr-2 h-4 w-4" /> Accept
            </Button>

            <Button variant="destructive" onClick={closeDialog}>
              <PhoneOff className="mr-2 h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallDialog;
