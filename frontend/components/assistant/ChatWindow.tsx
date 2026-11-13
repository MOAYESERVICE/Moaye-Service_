"use client";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import Suggestions from "./Suggestions";
import AiDisclaimer from "./AiDisclaimer";
import QuoteFromChat from "./QuoteFromChat";
import { suggestions } from "@/data/assistant";
import type { ChatMessage } from "@/types/chat";

export default function ChatWindow({
  conversationId, messages, loading, error, onSend, onRetry,
}: {
  conversationId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string;
  onSend: (text: string) => void;
  onRetry: () => void;
}) {
  const [text, setText] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const followLatestRef = useRef(true);
  const last = messages[messages.length - 1];

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = 0;
    followLatestRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el && followLatestRef.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, last?.text.length, loading, error]);

  const send = (message: string) => {
    followLatestRef.current = true;
    onSend(message);
  };

  const submit = () => {
    if (!text.trim() || loading) return;
    send(text);
    setText("");
  };

  return (
    <section className="card chat-main" aria-label="Conversation avec l'assistant">
      <div className="chat-head">
        <div className="chat-brand">
          <span className="chat-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F2A93B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21v-8M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3 2-5 6-5 0 3-2 5-6 5z" /></svg>
          </span>
          <div>
            <strong>Assistant MOAYE SERVICE</strong>
            <span>Conseils agro-pastoraux professionnels</span>
          </div>
        </div>
        <QuoteFromChat messages={messages} />
      </div>

      <div
        className="chat-body"
        ref={bodyRef}
        onScroll={(event) => {
          const el = event.currentTarget;
          followLatestRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
        aria-live="polite"
      >
        {messages.length === 0 && (
          <>
            <div className="chat-welcome">
              <strong>Bonjour, je suis l’assistant de MOAYE SERVICE.</strong>
              <p>Je vous accompagne avec respect et professionnalisme dans votre projet agricole, d’élevage ou d’aquaculture. Comment puis-je vous aider ?</p>
            </div>
            <span className="chat-suggestions-label">Questions fréquentes</span>
            <Suggestions onPick={send} items={suggestions.slice(0, 4)} />
          </>
        )}

        {messages.map((m) => <MessageBubble key={m.id} m={m} />)}

        {loading && last?.role !== "assistant" && (
          <div className="typing" aria-label="L'assistant écrit"><i /><i /><i /></div>
        )}

        {error && (
          <div className="alert-error" role="alert">
            <strong>Réponse impossible pour le moment</strong>

            <span>{error || "L’assistant est temporairement indisponible. Réessayez plus tard."}</span>
            <div><button className="btn btn-ghost btn-sm" onClick={onRetry}>Réessayer</button></div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <label htmlFor="chat-text" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Votre message</label>
        <textarea
          id="chat-text"
          rows={1}
          placeholder="Posez votre question…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button className="btn btn-amber" onClick={submit} disabled={loading || !text.trim()}>Envoyer</button>
      </div>
      <AiDisclaimer />
    </section>
  );
}
