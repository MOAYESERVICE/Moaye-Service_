"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { summarizeForQuote } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";

export default function QuoteFromChat({ messages }: { messages: ChatMessage[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const hasUser = messages.some((m) => m.role === "user");

  const go = async () => {
    setBusy(true);
    let resume = "";
    try {
      resume = await summarizeForQuote(messages);
    } catch {
      // repli : les messages du visiteur
      resume = messages.filter((m) => m.role === "user").map((m) => m.text).join("\n");
    }
    router.push(`/devis?source=assistant&resume=${encodeURIComponent(resume.slice(0, 600))}`);
  };

  return (
    <button className="btn btn-amber btn-sm" disabled={!hasUser || busy} onClick={go}>
      {busy ? "Préparation du résumé…" : "Demander un devis"}
    </button>
  );
}