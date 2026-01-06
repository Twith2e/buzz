import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/UserContext";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function MediaPermissionUI({ open, setOpen }: Props) {
  const { requestMediaDevices } = useUserContext();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sky-700">
            Enable Camera & Microphone
          </DialogTitle>
          <DialogDescription className="text-sky-900">
            We need access to your camera and microphone so you can make calls.
          </DialogDescription>
        </DialogHeader>
        <DialogClose />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={() => {
              requestMediaDevices();
              setOpen(false);
            }}
            className="bg-sky-600 hover:bg-sky-700"
          >
            Enable devices
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
