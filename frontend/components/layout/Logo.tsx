export default function Logo() {
  return (
    <span className="logo-lockup" aria-hidden="true">
      <svg className="logo-mark" viewBox="0 0 40 48" fill="none">
        <path d="M34.5 5.5C21.7 6.1 12 12 8.6 22.2c-2.1 6.4 1.2 11.5 7 11.5 10 0 17.1-10.6 18.9-28.2Z" stroke="currentColor" strokeWidth="2.7" strokeLinejoin="round" />
        <path d="M12.5 30.5 29 13.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M5 38c5-2.8 9.5-2.8 14 0s9 2.8 14 0M5 44c5-2.8 9.5-2.8 14 0s9 2.8 14 0" stroke="#F2A93B" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="logo-wordmark">
        <span className="logo-name">MOAYE</span>
        <span className="logo-service">SERVICE</span>
      </span>
    </span>
  );
}