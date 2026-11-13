import type { ChatMessage } from "@/types/chat";

export default function MessageBubble({ m }: { m: ChatMessage }) {
  const marker = "\n\n[[MOAYE_SOURCES]]";
  const markerIndex = m.text.indexOf(marker);
  const answer = (markerIndex === -1 ? m.text : m.text.slice(0, markerIndex))
    .replaceAll("**", "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s*\|(.+)\|\s*$/gm, (_, row: string) =>
      row.split("|").map((cell) => cell.trim()).filter(Boolean).join(" · ")
    );

  return (
    <div className={m.role === "user" ? "bubble-user" : "bubble-ai"}>
      {answer}
    </div>
  );
}
