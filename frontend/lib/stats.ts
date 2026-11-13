import type { DemoOrder } from "@/data/demo";

export type Month = { key: string; label: string };
export type CategoryTotal = { label: string; value: number };

export const CAT_COLORS = ["#1B6B57", "#F2A93B", "#B4501A", "#8FB09F", "#6B8C7A"];

export function live(orders: DemoOrder[]) {
  return orders.filter((order) => order.status !== "cancelled");
}

export function monthsBack(count: number, offset = 0): Month[] {
  if (!Number.isInteger(count) || count <= 0) return [];

  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const formatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end.getFullYear(), end.getMonth() - count + index + 1, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: formatter.format(date).replace(/\.$/, "") };
  });
}

export function revenueIn(orders: DemoOrder[], month: string) {
  return live(orders)
    .filter((order) => order.iso.slice(0, 7) === month)
    .reduce((total, order) => total + order.total, 0);
}

export function countIn(orders: DemoOrder[], month: string) {
  return live(orders).filter((order) => order.iso.slice(0, 7) === month).length;
}

export function byCategory(orders: DemoOrder[]): CategoryTotal[] {
  const totals = new Map<string, number>();

  for (const order of live(orders)) {
    for (const item of order.items) {
      totals.set(item.cat, (totals.get(item.cat) ?? 0) + item.price * item.qty);
    }
  }

  return Array.from(totals, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function kilo(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  }
  if (absolute >= 1_000) {
    return `${(value / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k`;
  }
  return Math.round(value).toLocaleString("fr-FR");
}

export function niceMax(value: number) {
  const max = Math.max(1, value);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const scaled = max / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}

export function ageLabel(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date inconnue";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - date.getTime()) / 86_400_000);

  if (days < 0) return "À venir";
  if (days === 0) return "Aujourd’hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} jours`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
