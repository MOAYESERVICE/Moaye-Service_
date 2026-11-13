export default function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const last = Math.max(values.length - 1, 1);
  const points = values.map((v, i) => `${Math.round((i / last) * 120)},${Math.round(34 - (v / max) * 30)}`).join(" ");
  return (
    <svg viewBox="0 0 120 36" width="100%" height="40" preserveAspectRatio="none" role="img" aria-label="Évolution sur 6 mois">
      <polyline points={points} fill="none" stroke="#1B6B57" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}