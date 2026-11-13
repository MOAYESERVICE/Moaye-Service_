import type { ReactNode } from "react";

export type Column<T> = { key: string; label: string; render: (row: T) => ReactNode; align?: "right" };

export default function DataTable<T extends { id: string }>({
  columns, rows, emptyTitle, emptyText,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyTitle: string;
  emptyText?: string;
}) {
  return (
    <div className="pt-panel" style={{ padding: "8px 8px 4px", overflow: "hidden" }}>
      {rows.length === 0 && (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: 20 }}>{emptyTitle}</h3>
          {emptyText && <p className="pt-muted" style={{ marginTop: 8 }}>{emptyText}</p>}
        </div>
      )}
      <div className="pt-data-table-desktop" style={{ overflowX: "auto" }}>
        <table className="pt-tbl">
          <thead>
            <tr>{columns.map((c) => <th key={c.key} style={c.align ? { textAlign: c.align } : undefined}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>{columns.map((c) => <td key={c.key} style={c.align ? { textAlign: c.align } : undefined}>{c.render(r)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-data-cards" role="list" aria-label="Liste des éléments">
        {rows.map((row) => (
          <article className="pt-data-card" role="listitem" key={row.id}>
            {columns.map((column) => (
              <div className={column.key === "actions" ? "pt-data-field actions" : "pt-data-field"} key={column.key}>
                <span className="pt-data-label">{column.label}</span>
                <div className="pt-data-value">{column.render(row)}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
