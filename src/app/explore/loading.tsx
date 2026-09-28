export default function ExploreLoading() {
  return (
    <div
      className="container-page py-10 w-full"
      aria-busy="true"
      aria-label="Loading explore courses"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="skeleton h-8 w-48 mb-2 rounded-xl" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>

      {/* Search bar skeleton */}
      <div className="mb-6">
        <div className="skeleton h-12 w-full max-w-xl rounded-xl" />
      </div>

      {/* Category tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {[80, 110, 95, 140, 90, 125, 105].map((width, idx) => (
          <div
            key={idx}
            className="skeleton h-9 flex-shrink-0 rounded-full"
            style={{ width: `${width}px` }}
          />
        ))}
      </div>

      {/* Grid of courses skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="clay-card p-4 bg-card border border-border">
            <div className="skeleton aspect-video w-full rounded-xl mb-4" />
            <div className="skeleton h-5 w-4/5 mb-2.5 rounded-lg" />
            <div className="skeleton h-3.5 w-1/2 mb-4 rounded-md" />
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="skeleton h-4 w-24 rounded-md" />
              <div className="skeleton h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
