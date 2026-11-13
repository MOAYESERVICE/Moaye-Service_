"use client";
import { useEffect, useRef, useState } from "react";
import { askAssistant } from "@/lib/api";
import type { ChatMessage, Conversation } from "@/types/chat";

const KEY = "moaye-chats";
const uid = () => Math.random().toString(36).slice(2, 10);

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const list: Conversation[] = JSON.parse(raw);
        // Load persisted conversations after hydration to keep server-rendered output deterministic.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConversations(list);
        setActiveId(list[0]?.id ?? null);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(conversations));

    } catch {}
  }, [conversations, loaded]);

  const patch = (id: string, fn: (m: ChatMessage[]) => ChatMessage[]) =>
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, messages: fn(c.messages), updatedAt: Date.now() } : c)));

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  const reply = async (id: string, history: ChatMessage[]) => {
    cancel();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const botId = uid();
    let started = false;
    setLoading(true);
    setError("");
    try {
      await askAssistant(
        history,
        (chunk) => {
          if (!started) {
            started = true;
            patch(id, (m) => [...m, { id: botId, role: "assistant", text: chunk }]);
          } else {
            patch(id, (m) => m.map((x) => (x.id === botId ? { ...x, text: x.text + chunk } : x)));
          }
        },
        ctrl.signal

      );
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError")) {
        const message = e instanceof Error ? e.message : "";
        const isNetworkError = /failed to fetch|fetch failed|networkerror|load failed/i.test(message);
        setError(
          isNetworkError
            ? "L’assistant est momentanément inaccessible. Vérifiez votre connexion et réessayez."
            : message || "L’assistant est temporairement indisponible."
        );
      }
    } finally {
      if (abortRef.current === ctrl) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", text };
    const current = conversations.find((c) => c.id === activeId);
    const id = current ? current.id : uid();
    const history = current ? [...current.messages, userMsg] : [userMsg];

    if (current) {
      patch(id, () => history);
    } else {
      setConversations((prev) => [{ id, title: text.slice(0, 42), messages: history, updatedAt: Date.now() }, ...prev]);
      setActiveId(id);
    }
    await reply(id, history);
  };

  const retry = async () => {
    const current = conversations.find((c) => c.id === activeId);
    if (!current || loading) return;
    const msgs = [...current.messages];

    while (msgs.length && msgs[msgs.length - 1].role === "assistant") msgs.pop(); // enlève une réponse incomplète
    patch(current.id, () => msgs);
    await reply(current.id, msgs);
  };

  const newChat = () => {
    cancel();
    setActiveId(null);
    setError("");
  };
  const select = (id: string) => {
    cancel();
    setActiveId(id);
    setError("");
  };
  const remove = (id: string) => {
    if (activeId === id) cancel();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return { conversations, activeId, loading, error, send, retry, newChat, select, remove };
}
