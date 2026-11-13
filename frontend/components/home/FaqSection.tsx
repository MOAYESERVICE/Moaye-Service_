"use client";
import { useState } from "react";
import { faq } from "@/data/home";

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section">
      <div className="wrap faq-wrap">
        <div className="head">
          <span className="eyebrow">Questions fréquentes</span>
          <h2 className="h2">Vos questions, nos réponses</h2>
        </div>
        <div className="card faq-card">
          {faq.map((f, i) => (
            <div key={f.q} className="faq-item">
              <button
                id={`faq-question-${i}`}
                className="faq-btn"
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <p id={`faq-answer-${i}`} className="muted faq-answer" role="region" aria-labelledby={`faq-question-${i}`}>
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}