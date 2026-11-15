"use client";

import { useEffect, useState } from "react";
import SiteLoadingScreen from "./SiteLoadingScreen";

export default function InitialPageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startedAt = Date.now();
    let minimumDurationTimer: number | undefined;
    const hide = () => setVisible(false);
    const hideAfterMinimumDuration = () => {
      const remaining = Math.max(0, 1200 - (Date.now() - startedAt));
      minimumDurationTimer = window.setTimeout(hide, remaining);
    };

    const fallbackTimer = window.setTimeout(hide, 15000);

    if (document.readyState === "complete") {
      hideAfterMinimumDuration();
    } else {
      window.addEventListener("load", hideAfterMinimumDuration, { once: true });
    }

    return () => {
      window.clearTimeout(fallbackTimer);
      if (minimumDurationTimer !== undefined) window.clearTimeout(minimumDurationTimer);
      window.removeEventListener("load", hideAfterMinimumDuration);
    };
  }, []);

  return visible ? (
    <div className="site-entry-loading">
      <SiteLoadingScreen />
    </div>
  ) : null;
}
