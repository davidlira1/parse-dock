type HeaderProps = {
  context?: string;
};

export function Header({ context }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="brand">ParseDock</p>
        <p className="tagline">Business Document Processing</p>
      </div>
      {context ? <p className="header-context">{context}</p> : null}
    </header>
  );
}
