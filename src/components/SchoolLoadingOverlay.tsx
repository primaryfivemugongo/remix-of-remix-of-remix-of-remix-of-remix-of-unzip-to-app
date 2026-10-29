import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import classCrest from "@/assets/class-crest.png.asset.json";

/** A sibling of the outlet: loading never remounts the outgoing page. */
export function SchoolLoadingOverlay() {
  const navigationLoading = useRouterState({ select: (state) => state.isLoading });
  const { isLoading: sessionLoading } = useAuth();
  const loading = navigationLoading || sessionLoading;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setVisible(false);
      return;
    }
    // Instant navigation should not flash a loading screen.
    const timer = window.setTimeout(() => setVisible(true), 150);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <div
      className="school-loading-overlay"
      data-visible={visible}
      aria-hidden={!visible}
      role="status"
      aria-live="polite"
      aria-label={visible ? "Loading page" : undefined}
    >
      <div className="school-loading-emblem">
        <div className="school-loading-ring" aria-hidden="true" />
        <img
          src={classCrest.url}
          alt=""
          width={96}
          height={96}
          className="school-loading-crest"
        />
      </div>
      {visible && <span className="sr-only">Loading page</span>}
    </div>
  );
}