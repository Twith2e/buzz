import { LucideCamera, LucideFile, LucidePaperclip } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChangeEvent } from "react";
import { useConversationContext } from "@/contexts/ConversationContext";
import { DOC_ACCEPT, MEDIA_ACCEPT } from "@/data/data";

const FileModal = ({
  openShare,
  setOpenShare,
}: {
  openShare: boolean;
  setOpenShare: (openShare: boolean) => void;
}) => {
  const { setSelectedImage, setSelectedDoc, selectedDoc } =
    useConversationContext();

  function handleImagePick(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedImage((prev) => {
        const base = Array.isArray(prev?.images) ? prev.images : [];
        console.log([...base, ...Array.from(files)]);
        return {
          images: [...base, ...Array.from(files)],
          currentIndex: prev?.currentIndex ?? 0,
        };
      });
    }
  }
  /**
   * Handles selecting document files and opens the doc preview.
   * Uses the shared SelectedFilePreview by populating ConversationContext.
   */
  function handleDocPick(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedDoc((prev) => {
        const base = Array.isArray(prev?.docs) ? prev.docs : [];
        return {
          docs: [...base, ...Array.from(files)],
          currentIndex: prev?.currentIndex ?? 0,
        };
      });
      setOpenShare(false);
    } else {
      console.log("No document selected");
    }
    console.log("files: ", files);

    console.log(selectedDoc);
  }
  return (
    <Popover open={openShare} onOpenChange={setOpenShare}>
      <PopoverTrigger>
        <div
          className="p-1 rounded-md cursor-pointer hover:bg-sky-300 hover:text-white"
          onClick={() => setOpenShare(!openShare)}
        >
          <LucidePaperclip size={20} />
        </div>
        <PopoverContent className="w-fit p-1 text-sm">
          <label
            htmlFor="media-upload"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:bg-background text-foreground p-2 rounded-sm"
          >
            <LucideCamera size={16} />
            <span>Photo & Video</span>
            <input
              accept={MEDIA_ACCEPT}
              multiple={true}
              type="file"
              name=""
              id="media-upload"
              onChange={handleImagePick}
              hidden
            />
          </label>
          <label
            htmlFor="file-upload"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:bg-background text-foreground p-2 rounded-sm w-full"
          >
            <LucideFile size={16} />
            <span>Document</span>
            <input
              accept={DOC_ACCEPT}
              type="file"
              name=""
              id="file-upload"
              onChange={handleDocPick}
              hidden
            />
          </label>
        </PopoverContent>
      </PopoverTrigger>
    </Popover>
  );
};

export default FileModal;
