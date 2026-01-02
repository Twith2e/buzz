import SelectedFilePreview from "./SelectedFilePreview";

interface FilePreviewProps {
  selectedImage: {
    images: Array<File> | null;
    currentIndex: number | null;
  };
  selectedDoc: {
    docs: Array<File> | null;
    currentIndex: number | null;
  };
}

export function FilePreview({ selectedImage, selectedDoc }: FilePreviewProps) {
  if (
    selectedImage &&
    selectedImage.images &&
    selectedImage.images.length > 0
  ) {
    return (
      <div className="fixed bottom-0 z-50 p-2 bg-gray-700 w-[500px]">
        <SelectedFilePreview fileType="media" />
      </div>
    );
  }

  if (selectedDoc && selectedDoc.docs && selectedDoc.docs.length > 0) {
    return (
      <div className="fixed bottom-0 z-50 p-2 bg-gray-700 w-[500px]">
        <SelectedFilePreview fileType="doc" />
      </div>
    );
  }

  return null;
}
