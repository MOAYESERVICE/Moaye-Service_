"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="wrap" style={{ padding: "64px 24px" }}>
      <h1>Une erreur est survenue</h1>
      <button className="btn btn-green" onClick={reset}>R?essayer</button>
    </main>
  );
}
