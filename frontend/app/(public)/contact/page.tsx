import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import WhatsAppCard from "@/components/contact/WhatsAppCard";

export const metadata = { title: "Contact — MOAYE SERVICE" };

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero contact-hero">
        <div className="wrap stack" style={{ paddingTop: 44, paddingBottom: 44, gap: 12 }}>
          <span className="tag">Contact</span>
          <h1>Parlons de votre projet</h1>
          <p>Les coordonnées directes et l’envoi des formulaires sont en cours de configuration.</p>
        </div>
      </section>

      <div className="wrap contact">
        <ContactForm />
        <aside className="contact-side">
          <WhatsAppCard />
          <ContactInfo />
          <div className="card pad" style={{ gap: 10 }}>
            <strong>Vous hésitez sur votre projet ?</strong>
            <span className="muted">Notre assistant vous aide à préciser vos besoins avant de demander un devis.</span>
            <Link className="btn btn-ghost" href="/assistant" style={{ alignSelf: "flex-start" }}>Ouvrir l&apos;assistant</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}