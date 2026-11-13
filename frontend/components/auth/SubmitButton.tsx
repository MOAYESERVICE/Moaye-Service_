export default function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button className="btn btn-amber" type="submit" disabled={loading}>
      {loading && (
        <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E2A26" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 3a9 9 0 019 9" /></svg>
      )}
      <span>{loading ? loadingLabel : label}</span>
    </button>
  );
}