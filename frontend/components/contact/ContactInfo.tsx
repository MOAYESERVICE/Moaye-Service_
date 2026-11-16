import { whatsappDisplayNumber, whatsappHref } from "@/lib/whatsapp";

export default function ContactInfo() {
  return (
    <div className="card pad" style={{ gap: 18 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Nos coordonnées</h2>
      <p className="muted">WhatsApp et téléphone</p>
      <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label={`Contacter MOAYE SERVICES sur WhatsApp au ${whatsappDisplayNumber}`}>
        {whatsappDisplayNumber}
      </a>
    </div>
  );
}
