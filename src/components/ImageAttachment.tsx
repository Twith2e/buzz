import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImageAttachmentProps {
  url: string;
  alt?: string;
  className?: string;
}

const ImageAttachment = ({ url, alt, className }: ImageAttachmentProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={url}
          alt={alt || "attachment"}
          className={`cursor-pointer ${className}`}
        />
      </DialogTrigger>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-0 border-none bg-transparent shadow-none flex items-center justify-center outline-none"
        hideClose
      >
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <img
          src={url}
          alt={alt || "enlarged attachment"}
          className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl bg-black/50"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageAttachment;
