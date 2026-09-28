export default function MyCoursesLoading() {
  return (
    <div className="container-page py-10 w-full" aria-busy="true" aria-label="Loading my courses">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="skeleton h-8 w-44 mb-2 rounded-xl" />
          <div className="skeleton h-4 w-60 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="clay-card p-5 bg-card border border-border">
            <div className="skeleton aspect-video w-full rounded-xl mb-4" />
            <div className="skeleton h-5 w-4/5 mb-3 rounded-lg" />
            <div className="skeleton h-4 w-1/2 mb-4 rounded-md" />
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
