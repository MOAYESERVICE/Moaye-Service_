import PartnerMarquee from "./PartnerMarquee";

export default function PartnersSection() {
  return (
    <section className="section section-mist">
      <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 720 }}>
          <span className="eyebrow">Références et partenaires</span>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,36px)", fontWeight: 700 }}>Organisations avec lesquelles nous collaborons</h2>
        </div>
        <PartnerMarquee />
      </div>
    </section>
  );
}