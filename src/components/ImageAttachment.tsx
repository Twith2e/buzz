import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ImageAttachmentProps {
  url: string;
  alt?: string;
  className?: string;
}

const ImageAttachment = ({ url, alt, className }: ImageAttachmentProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative inline-block w-[280px] h-[300px] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={url}
            alt={alt || "attachment"}
            className={`cursor-pointer absolute inset-0 w-full h-full object-contain transition-opacity ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${className}`}
            onLoad={() => setIsLoaded(true)}
          />
          {!isLoaded && (
            <div className="absolute inset-0 w-full h-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
          )}
        </div>
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
