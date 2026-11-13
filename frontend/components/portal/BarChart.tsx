"use client";
import { Fragment, useState } from "react";
import { niceMax } from "@/lib/stats";

export default function BarChart({
  labels, values, format, axisFormat,
}: {
  labels: string[];
  values: number[];
  format: (v: number) => string;
  axisFormat: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...values, 1));
  const active = hover ?? values.length - 1;
  const gap = values.length > 8 ? 8 : 18;

  return (
    <div>
      <div className="pt-chart">
        {[0, 1, 2, 3, 4].map((i) => (
          <Fragment key={i}>
            <div className="pt-gl" style={{ bottom: `${i * 25}%`, borderTop: i === 0 ? "1.5px solid #C9D8CF" : "1px dashed #E1EAE4" }} />
            <span className="pt-gt" style={{ bottom: `${i * 25}%` }}>{axisFormat((max / 4) * i)}</span>
          </Fragment>
        ))}
        <div className="pt-bars" style={{ gap }}>
          {values.map((v, i) => (
            <div
              key={labels[i]}
              className="pt-bar-col"
              tabIndex={0}
              aria-label={`${labels[i]} : ${format(v)}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <span className="pt-tip" style={{ opacity: i === active ? 1 : 0 }}>{v === 0 ? "" : format(v)}</span>
              <div className="pt-bar" style={{ height: `${(v / max) * 100}%`, minHeight: v === 0 ? 0 : 4, background: i === active ? "#F2A93B" : "#1B6B57" }} />
            </div>
          ))}
        </div>
      </div>
      <div className="pt-xl" style={{ gap }}>
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}