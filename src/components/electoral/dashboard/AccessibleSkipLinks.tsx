export function AccessibleSkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-0 left-0 z-50 bg-primary text-primary-foreground px-4 py-2 m-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <a
        href="#summary-stats"
        className="fixed top-0 left-24 z-50 bg-primary text-primary-foreground px-4 py-2 m-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to statistics
      </a>
      <a
        href="#charts-section"
        className="fixed top-0 left-48 z-50 bg-primary text-primary-foreground px-4 py-2 m-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to charts
      </a>
    </div>
  );
}
