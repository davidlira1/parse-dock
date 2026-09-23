type ProcessingStateProps = {
  filename: string;
};

export function ProcessingState({ filename }: ProcessingStateProps) {
  return (
    <section className="panel processing" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true" />
      <h1>Processing purchase order...</h1>
      <p className="processing-file">{filename}</p>
      <p className="processing-copy">
        Reading the document, extracting purchase order details, and preparing
        your review.
      </p>
    </section>
  );
}
