type ErrorStateProps = {
  message: string;
  onTryAgain: () => void;
};

export function ErrorState({ message, onTryAgain }: ErrorStateProps) {
  return (
    <section className="panel status-panel" aria-live="polite">
      <h1>We couldn't process this document.</h1>
      <p>{message}</p>
      <div className="actions">
        <button type="button" className="button button-primary" onClick={onTryAgain}>
          Try Again
        </button>
      </div>
    </section>
  );
}
