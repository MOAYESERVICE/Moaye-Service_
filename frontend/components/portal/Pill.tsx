import type { Tone } from "@/data/demo";

export default function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`pt-bd ${tone}`}>{children}</span>;
}