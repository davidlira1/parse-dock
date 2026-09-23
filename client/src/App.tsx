import { useRef, useState } from "react";
import { extractPurchaseOrder, messageForDocumentError } from "./api/documents";
import { ConfirmedState } from "./components/ConfirmedState";
import { DocumentUpload } from "./components/DocumentUpload";
import { ErrorState } from "./components/ErrorState";
import { Header } from "./components/Header";
import { ProcessingState } from "./components/ProcessingState";
import { PurchaseOrderReview } from "./components/PurchaseOrderReview";
import { validateDocumentFile } from "./lib/files";
import type { PurchaseOrder } from "./types/purchase-order";

type WorkflowStatus =
  | "idle"
  | "ready"
  | "processing"
  | "review"
  | "confirmed"
  | "error";

export function App() {
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [draft, setDraft] = useState<PurchaseOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const processingRef = useRef(false);

  function selectFile(file: File) {
    const problem = validateDocumentFile(file);
    if (problem) {
      setSelectedFile(null);
      setValidationMessage(problem);
      setStatus("idle");
      return;
    }

    setSelectedFile(file);
    setValidationMessage(null);
    setErrorMessage(null);
    setStatus("ready");
  }

  function clearFile() {
    setSelectedFile(null);
    setValidationMessage(null);
    setStatus("idle");
  }

  async function processDocument() {
    if (!selectedFile || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setErrorMessage(null);
    setStatus("processing");

    try {
      const extracted = await extractPurchaseOrder(selectedFile);
      setPurchaseOrder(extracted);
      setDraft(structuredClone(extracted));
      setStatus("review");
    } catch (error) {
      setErrorMessage(messageForDocumentError(error));
      setStatus("error");
    } finally {
      processingRef.current = false;
    }
  }

  function tryAgain() {
    setErrorMessage(null);
    setStatus(selectedFile ? "ready" : "idle");
  }

  function resetWorkflow() {
    processingRef.current = false;
    setSelectedFile(null);
    setPurchaseOrder(null);
    setDraft(null);
    setErrorMessage(null);
    setValidationMessage(null);
    setStatus("idle");
  }

  const showUpload = status === "idle" || status === "ready";
  const reviewedOrder = draft ?? purchaseOrder;
  const headerContext =
    status === "review" || status === "confirmed" ? "Purchase Order" : undefined;

  return (
    <div className="app-shell">
      <Header context={headerContext} />
      <main className={status === "review" ? "app-main app-main-wide" : "app-main"}>
        {showUpload ? (
          <DocumentUpload
            file={selectedFile}
            validationMessage={validationMessage}
            onSelectFile={selectFile}
            onClearFile={clearFile}
            onProcess={() => {
              void processDocument();
            }}
          />
        ) : null}
        {status === "processing" && selectedFile ? (
          <ProcessingState filename={selectedFile.name} />
        ) : null}
        {status === "review" && draft && selectedFile ? (
          <PurchaseOrderReview
            file={selectedFile}
            draft={draft}
            onChange={setDraft}
            onConfirm={() => setStatus("confirmed")}
          />
        ) : null}
        {status === "confirmed" && reviewedOrder ? (
          <ConfirmedState purchaseOrder={reviewedOrder} onReset={resetWorkflow} />
        ) : null}
        {status === "error" ? (
          <ErrorState
            message={errorMessage ?? "We couldn't process this document."}
            onTryAgain={tryAgain}
          />
        ) : null}
      </main>
    </div>
  );
}
