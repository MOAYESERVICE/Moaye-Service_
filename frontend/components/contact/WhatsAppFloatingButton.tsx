"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { whatsappHref } from "@/lib/whatsapp";

export default function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isExpertisePage = pathname.startsWith("/expertise");
  const isRealisationPage = pathname.startsWith("/realisations");
  const showOnPage = pathname === "/" || pathname === "/produits" || isExpertisePage || isRealisationPage;
  const delay = 10_000;

  useEffect(() => {
    setVisible(false);
    if (!showOnPage) return;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay, pathname, showOnPage]);

  if (!showOnPage) return null;

  return (
    <a
      className={`whatsapp-floating-button${visible ? " is-visible" : ""}`}
      href={whatsappHref("Bonjour MOAYE SERVICES, j’aimerais avoir des informations sur vos services.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter MOAYE SERVICES sur WhatsApp"
      title="Contacter MOAYE SERVICES sur WhatsApp"
      tabIndex={visible ? 0 : -1}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a8.8 8.8 0 0 0-7.6 13.2L3.2 21l5-1.3A8.8 8.8 0 1 0 12 3Zm0 15.8a7 7 0 0 1-3.6-1l-.3-.2-3 .8.8-2.9-.2-.3A7 7 0 1 1 12 18.8Zm3.8-5.2c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.6.7-.7.8-.3.2-.5.1a6 6 0 0 1-1.8-1.1 6.7 6.7 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4c0-.1-.5-1.2-.7-1.6s-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3a2.5 2.5 0 0 0-.8 1.9 4.4 4.4 0 0 0 .9 2.3 10.1 10.1 0 0 0 3.9 3.4c.5.2.9.4 1.2.4.5.1 1 .1 1.4 0 .4-.1 1.3-.5 1.5-1s.2-.9.2-1-.2-.2-.4-.3Z" fill="currentColor" />
      </svg>
    </a>
  );
}
