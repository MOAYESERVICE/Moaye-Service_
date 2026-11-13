import Link from "next/link";

export default function AssistantBand() {
  return (
    <section className="section" data-reveal data-home-order="assistant">
      <div className="wrap">
        <div className="band-green">
          <div className="band-text">
            <span className="eyebrow" style={{ color: "#F6C77A" }}>Assistant agro-pastoral</span>
            <h2>Posez vos questions, cadrez votre projet</h2>
            <p>Notre assistant vous aide à préciser vos besoins, vous oriente vers les bons services et répond à vos questions sur l&apos;élevage, l&apos;aquaculture, la nutrition animale et la création d&apos;une ferme.</p>
            <div><Link className="btn btn-amber" href="/assistant">Discuter avec l&apos;assistant</Link></div>
            <p className="band-note">Les recommandations de l&apos;IA sont indicatives et peuvent nécessiter la validation d&apos;un expert humain.</p>
          </div>
          <div className="chat-prev">
            <div className="bubble-user">Je veux démarrer une ferme piscicole. Par où commencer ?</div>
            <div className="bubble-ai">Pour bien orienter votre projet, trois questions : quel type de site avez-vous (étang, plan d&apos;eau, terrain nu) ? Quel budget envisagez-vous ? Quelle espèce vous intéresse ?</div>
          </div>
        </div>
      </div>
    </section>
  );
}