const STYLES = {
  pending: "bg-ink-soft/10 text-ink-soft",
  processing: "bg-brass-soft text-brass-dark",
  ready: "bg-sage/10 text-sage",
  failed: "bg-rust/10 text-rust",
};

const LABELS = {
  pending: "Queued",
  processing: "Processing…",
  ready: "Ready",
  failed: "Failed",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STYLES[status] || "bg-ink-soft/10 text-ink-soft"}`}>
      {LABELS[status] || status}
    </span>
  );
}