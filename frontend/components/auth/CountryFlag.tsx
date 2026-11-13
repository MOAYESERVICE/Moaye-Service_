export default function CountryFlag({ country }: { country: string }) {
  const common = {
    className: "country-flag-svg",
    viewBox: "0 0 30 20",
    role: "img" as const,
  };

  switch (country) {
    case "CI":
      return <svg {...common} aria-label="Drapeau de la Côte d’Ivoire"><rect width="10" height="20" fill="#F77F00" /><rect x="10" width="10" height="20" fill="#FFF" /><rect x="20" width="10" height="20" fill="#009A44" /></svg>;
    case "BF":
      return <svg {...common} aria-label="Drapeau du Burkina Faso"><rect width="30" height="10" fill="#EF2B2D" /><rect y="10" width="30" height="10" fill="#009E49" /><path d="m15 5 1.18 3.64H20l-3.08 2.24 1.18 3.64L15 12.27l-3.1 2.25 1.18-3.64L10 8.64h3.82z" fill="#FCD116" /></svg>;
    case "BJ":
      return <svg {...common} aria-label="Drapeau du Bénin"><rect width="12" height="20" fill="#008751" /><rect x="12" width="18" height="10" fill="#FCD116" /><rect x="12" y="10" width="18" height="10" fill="#E8112D" /></svg>;
    case "CM":
      return <svg {...common} aria-label="Drapeau du Cameroun"><rect width="10" height="20" fill="#007A5E" /><rect x="10" width="10" height="20" fill="#CE1126" /><rect x="20" width="10" height="20" fill="#FCD116" /><path d="m15 6 1.18 3.64H20l-3.08 2.24 1.18 3.64L15 13.27l-3.1 2.25 1.18-3.64L10 9.64h3.82z" fill="#FCD116" /></svg>;
    case "GH":
      return <svg {...common} aria-label="Drapeau du Ghana"><rect width="30" height="6.67" fill="#CE1126" /><rect y="6.67" width="30" height="6.66" fill="#FCD116" /><rect y="13.33" width="30" height="6.67" fill="#006B3F" /><path d="m15 7 1.18 3.64H20l-3.08 2.24 1.18 3.64L15 14.27l-3.1 2.25 1.18-3.64L10 10.64h3.82z" fill="#111" /></svg>;
    case "GN":
      return <svg {...common} aria-label="Drapeau de la Guinée"><rect width="10" height="20" fill="#CE1126" /><rect x="10" width="10" height="20" fill="#FCD116" /><rect x="20" width="10" height="20" fill="#009460" /></svg>;
    case "LR":
      return <svg {...common} aria-label="Drapeau du Liberia"><rect width="30" height="20" fill="#FFF" /><path d="M0 0h30v2H0zm0 4h30v2H0zm0 8h30v2H0zm0 4h30v2H0z" fill="#BF0A30" /><rect width="12" height="10" fill="#002868" /><path d="m6 2 1.18 3.64H11L7.92 7.88l1.18 3.64L6 9.27l-3.1 2.25 1.18-3.64L1 5.64h3.82z" fill="#FFF" /></svg>;
    case "ML":
      return <svg {...common} aria-label="Drapeau du Mali"><rect width="10" height="20" fill="#14B53A" /><rect x="10" width="10" height="20" fill="#FCD116" /><rect x="20" width="10" height="20" fill="#CE1126" /></svg>;
    case "NE":
      return <svg {...common} aria-label="Drapeau du Niger"><rect width="30" height="6.67" fill="#E15307" /><rect y="6.67" width="30" height="6.66" fill="#FFF" /><rect y="13.33" width="30" height="6.67" fill="#10AF2A" /><circle cx="15" cy="10" r="3.2" fill="#E15307" /></svg>;
    case "NG":
      return <svg {...common} aria-label="Drapeau du Nigeria"><rect width="10" height="20" fill="#008751" /><rect x="10" width="10" height="20" fill="#FFF" /><rect x="20" width="10" height="20" fill="#008751" /></svg>;
    case "SN":
      return <svg {...common} aria-label="Drapeau du Sénégal"><rect width="10" height="20" fill="#00853F" /><rect x="10" width="10" height="20" fill="#FDEF42" /><rect x="20" width="10" height="20" fill="#E31B23" /><path d="m15 6 1.18 3.64H20l-3.08 2.24 1.18 3.64L15 13.27l-3.1 2.25 1.18-3.64L10 9.64h3.82z" fill="#00853F" /></svg>;
    case "SL":
      return <svg {...common} aria-label="Drapeau de la Sierra Leone"><rect width="30" height="6.67" fill="#1EB53A" /><rect y="6.67" width="30" height="6.66" fill="#FFF" /><rect y="13.33" width="30" height="6.67" fill="#0072C6" /></svg>;
    case "TG":
      return <svg {...common} aria-label="Drapeau du Togo"><rect width="30" height="20" fill="#006A4E" /><path d="M0 4h30v4H0zm0 8h30v4H0z" fill="#FFCE00" /><rect width="12" height="10" fill="#D21034" /><path d="m6 2 1.18 3.64H11L7.92 7.88l1.18 3.64L6 9.27l-3.1 2.25 1.18-3.64L1 5.64h3.82z" fill="#FFF" /></svg>;
    case "FR":
      return <svg {...common} aria-label="Drapeau de la France"><rect width="10" height="20" fill="#002395" /><rect x="10" width="10" height="20" fill="#FFF" /><rect x="20" width="10" height="20" fill="#ED2939" /></svg>;
    case "GB":
      return <svg {...common} aria-label="Drapeau du Royaume-Uni"><rect width="30" height="20" fill="#012169" /><path d="M0 0 30 20M30 0 0 20" stroke="#FFF" strokeWidth="5" /><path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" strokeWidth="2" /><path d="M15 0v20M0 10h30" stroke="#FFF" strokeWidth="7" /><path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3" /></svg>;
    case "US":
      return <svg {...common} aria-label="Drapeau des États-Unis"><rect width="30" height="20" fill="#FFF" /><path d="M0 0h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30V7.7H0zm0 3.08h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30v1.54H0zm0 3.08h30V20H0z" fill="#B22234" /><rect width="13" height="10.8" fill="#3C3B6E" /><circle cx="3" cy="2.3" r=".7" fill="#FFF" /><circle cx="7" cy="2.3" r=".7" fill="#FFF" /><circle cx="11" cy="2.3" r=".7" fill="#FFF" /><circle cx="5" cy="5.2" r=".7" fill="#FFF" /><circle cx="9" cy="5.2" r=".7" fill="#FFF" /><circle cx="3" cy="8.1" r=".7" fill="#FFF" /><circle cx="7" cy="8.1" r=".7" fill="#FFF" /><circle cx="11" cy="8.1" r=".7" fill="#FFF" /></svg>;
    case "TZ":
      return <svg {...common} aria-label="Drapeau de la Tanzanie"><rect width="30" height="20" fill="#1EB53A" /><path d="M0 15 30 6v14H0z" fill="#00A3DD" /><path d="m0 12.5 30-9v5L0 17.5z" fill="#FCD116" /><path d="m0 13.8 30-9v2.4L0 16.2z" fill="#000" /></svg>;
    default:
      return null;
  }
}
