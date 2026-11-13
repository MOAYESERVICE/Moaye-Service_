export type Segment = { label: string; value: number; color: string };

export default function Donut({
  segments, centerTop, centerValue, aria,
}: {
  segments: Segment[];
  centerTop: string;
  centerValue: string;
  aria: string;
}) {
  const visible = segments.filter((segment) => segment.value > 0);
  const total = visible.reduce((sum, segment) => sum + segment.value, 0);
  const stops = visible.reduce<{ offset: number; values: string[] }>(
    (result, segment) => {
      const end = result.offset + (segment.value / total) * 100;
      return { offset: end, values: [...result.values, `${segment.color} ${result.offset}% ${end}%`] };
    },
    { offset: 0, values: [] },
  ).values;
  const background = stops.length ? `conic-gradient(${stops.join(", ")})` : "#E3EFE8";
  return (
    <div className="pt-donut" role="img" aria-label={aria} style={{ background }}>
      <div className="pt-donut-in">
        <span style={{ fontSize: 13, color: "#5B726B" }}>{centerTop}</span>
        <span className="pt-big" style={{ fontSize: 24 }}>{centerValue}</span>
      </div>
    </div>
  );
}