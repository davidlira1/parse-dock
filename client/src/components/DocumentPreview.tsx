import { useEffect, useState } from "react";

type DocumentPreviewProps = {
  file: File;
};

export function DocumentPreview({ file }: DocumentPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = file.type === "image/png" || file.type === "image/jpeg";

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <aside className="document-preview" aria-label="Original document">
      <p className="document-preview-name">{file.name}</p>
      <div className="document-preview-frame">
        {url && isImage ? <img src={url} alt={file.name} /> : null}
        {url && !isImage ? <iframe src={url} title={file.name} /> : null}
      </div>
    </aside>
  );
}
