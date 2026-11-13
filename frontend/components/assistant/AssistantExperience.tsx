"use client";

import Link from "next/link";
import { useRef } from "react";
import ChatWindow from "@/components/assistant/ChatWindow";
import HistoryList from "@/components/assistant/HistoryList";
import { useChat } from "@/hooks/useChat";

export default function AssistantExperience() {
  const { conversations, activeId, loading, error, send, retry, newChat, select, remove } = useChat();
  const activeConversation = conversations.find((conversation) => conversation.id === activeId);
  const chatLayoutRef = useRef<HTMLDivElement>(null);

  const selectConversation = (id: string) => {
    select(id);
    if (window.matchMedia("(min-width: 901px)").matches) {
      requestAnimationFrame(() => {
        const layout = chatLayoutRef.current;
        if (!layout) return;
        const header = document.querySelector<HTMLElement>(".hdr");
        const topOffset = (header?.getBoundingClientRect().height ?? 0) + 12;
        const top = layout.getBoundingClientRect().top + window.scrollY - topOffset;
        window.scrollTo({ top, behavior: "smooth" });
      });
    }
  };

  return (
    <>
      <div className="chat-layout" ref={chatLayoutRef}>
        <HistoryList
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={newChat}
          onDelete={remove}
        />
        <ChatWindow
          conversationId={activeId}
          messages={activeConversation?.messages ?? []}
          loading={loading}
          error={error}
          onSend={send}
          onRetry={retry}
        />
      </div>
      <div className="assistant-bottom-actions">
        <Link className="btn btn-ghost" href="/devis">Décrire mon projet</Link>
        <Link className="btn btn-ghost" href="/expertises">Voir nos expertises</Link>
      </div>
    </>
  );
}
