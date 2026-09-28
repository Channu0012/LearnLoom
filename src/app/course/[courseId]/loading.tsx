export default function CourseDetailLoading() {
  return (
    <div className="container-page py-6 w-full" aria-busy="true" aria-label="Loading course player">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <div className="skeleton h-4 w-16 rounded-md" />
        <span className="text-muted-foreground">/</span>
        <div className="skeleton h-4 w-36 rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Video player skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton aspect-video w-full rounded-2xl shadow-lg" />
          <div className="skeleton h-7 w-3/4 rounded-xl mt-4" />
          <div className="skeleton h-4 w-1/3 rounded-lg" />
          <div className="skeleton h-20 w-full rounded-xl mt-4" />
        </div>

        {/* Right: Lesson playlist skeleton */}
        <div className="space-y-3">
          <div className="clay-card p-4 bg-card border border-border">
            <div className="skeleton h-6 w-1/2 mb-4 rounded-lg" />
            <div className="skeleton h-2 w-full rounded-full mb-4" />
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl border border-border/40"
                >
                  <div className="skeleton w-16 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-4/5 rounded-md" />
                    <div className="skeleton h-3 w-1/3 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
