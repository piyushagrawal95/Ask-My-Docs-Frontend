const DOT_STYLES = {
  pending: "bg-ink-onshellsoft",
  processing: "bg-brass animate-pulse",
  ready: "bg-moss",
  failed: "bg-rust",
};

const TEXT_STYLES = {
  pending: "text-ink-onshellsoft",
  processing: "text-brass",
  ready: "text-moss",
  failed: "text-rust",
};

const LABELS = {
  pending: "Queued",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

export default function StatusBadge({ status,pagesProcessed, totalPages }) {
  const showProgress=status==="processing" && !!totalPages;
  const label=showProgress?pagesProcessed>=totalPages?"Finalizing...":`Processing ${pagesProcessed??0}/${totalPages}`:LABELS[status]||status;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${TEXT_STYLES[status] || "text-ink-onshellsoft"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[status] || "bg-ink-onshellsoft"}`} />
      {label}
    </span>
  );
}