export default function MyLearningLoading() {
  return (
    <div className="container-page py-10 w-full" aria-busy="true" aria-label="Loading my learning">
      <div className="skeleton h-8 w-44 mb-2 rounded-xl" />
      <div className="skeleton h-4 w-64 mb-8 rounded-lg" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="clay-card p-5 bg-card border border-border">
            <div className="skeleton aspect-video w-full rounded-xl mb-4" />
            <div className="skeleton h-5 w-3/4 mb-3 rounded-lg" />
            <div className="skeleton h-2 w-full rounded-full mb-3" />
            <div className="skeleton h-4 w-1/3 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
