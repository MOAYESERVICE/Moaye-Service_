import PartnerMarquee from "./PartnerMarquee";

export default function Partners() {
  return (
    <section className="section" data-reveal data-home-order="partners">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Partenaires</span>
          <h2>Institutions et organisations avec lesquelles nous collaborons</h2>
        </div>
        <PartnerMarquee />
      </div>
    </section>
  );
}