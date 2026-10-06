export default function GlobalLoading() {
  return (
    <div className="container-page py-8 w-full animate-pulse" aria-hidden="true">
      <div className="h-8 w-44 bg-muted/60 rounded-xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-60 bg-muted/40 rounded-2xl border border-border/30" />
        <div className="h-60 bg-muted/40 rounded-2xl border border-border/30" />
        <div className="h-60 bg-muted/40 rounded-2xl border border-border/30" />
      </div>
    </div>
  );
}
