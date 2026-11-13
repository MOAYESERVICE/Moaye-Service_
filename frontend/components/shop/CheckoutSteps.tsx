export default function CheckoutSteps({ current }: { current: 1 | 2 }) {
  const steps = ["Panier", "Commande", "Confirmation"];
  return (
    <ol className="stepper" aria-label="Étapes de la commande">
      {steps.map((label, i) => (
        <li key={label}>
          <span className={i < current ? "sd done" : i === current ? "sd cur" : "sd"}>{i < current ? "✓" : i + 1}</span>
          <span style={{ fontWeight: 600 }}>{label}</span>
          {i < steps.length - 1 && <span className="sline" />}
        </li>
      ))}
    </ol>
  );
}