import { useRef, useState } from "react";
import { fileKindLabel, formatFileSize } from "../lib/files";

type DocumentUploadProps = {
  file: File | null;
  validationMessage: string | null;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
  onProcess: () => void;
};

export function DocumentUpload({
  file,
  validationMessage,
  onSelectFile,
  onClearFile,
  onProcess,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function chooseFile(next: File | undefined) {
    if (next) {
      onSelectFile(next);
    }
  }

  return (
    <section className="panel intake">
      <div className="panel-intro">
        <h1>Purchase Order Intake</h1>
        <p>Upload a purchase order to extract its details.</p>
      </div>

      <div
        className={dragOver ? "dropzone drag-over" : "dropzone"}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          chooseFile(event.dataTransfer.files[0]);
        }}
      >
        <p className="dropzone-title">Drop purchase order here</p>
        <p className="dropzone-hint">PDF, PNG, or JPEG</p>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={(event) => {
            chooseFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      {validationMessage ? (
        <p className="form-alert" role="alert">
          {validationMessage}
        </p>
      ) : null}

      {file ? (
        <div className="file-summary">
          <div>
            <p className="file-name">{file.name}</p>
            <p className="file-meta">
              {fileKindLabel(file)} • {formatFileSize(file.size)}
            </p>
          </div>
          <button type="button" className="button button-quiet" onClick={onClearFile}>
            Remove
          </button>
        </div>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="button button-primary"
          disabled={file === null}
          onClick={onProcess}
        >
          Process Document
        </button>
      </div>
    </section>
  );
}
