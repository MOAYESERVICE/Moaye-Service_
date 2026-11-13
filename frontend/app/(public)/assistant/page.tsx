import AssistantExperience from "@/components/assistant/AssistantExperience";

export const metadata = { title: "Assistant agro-pastoral — MOAYE SERVICES" };

export default function Page() {
  return (
    <main>
      <section className="wrap assistant-hero">
        <span className="tag">Accompagnement de projet</span>
        <h1>Votre projet commence par une bonne question</h1>
        <p className="muted">
          Posez vos questions à notre assistant agro-pastoral ou décrivez directement votre projet.
        </p>
      </section>
      <AssistantExperience />
    </main>
  );
}
