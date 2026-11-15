"use client";

import { useEffect, useState } from "react";
import SiteLoadingScreen from "./SiteLoadingScreen";

export default function InitialPageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    if (document.readyState === "complete") {
      hide();
      return;
    }

    const timeout = window.setTimeout(hide, 15000);
    window.addEventListener("load", hide, { once: true });

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("load", hide);
    };
  }, []);

  return visible ? (
    <div className="site-entry-loading">
      <SiteLoadingScreen />
    </div>
  ) : null;
}
