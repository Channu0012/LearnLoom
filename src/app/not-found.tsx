import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <div
        className="text-8xl font-heading font-extrabold text-primary-200 mb-4"
        aria-hidden="true"
      >
        404
      </div>
      <h1 className="font-heading font-bold text-2xl mb-4">This page doesn&apos;t exist</h1>
      <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto">
        The page you&apos;re looking for may have been moved, deleted, or never existed.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/" className="btn-primary">
          Go home
        </Link>
        <Link href="/explore" className="btn-ghost">
          Explore courses
        </Link>
      </div>
    </div>
  );
}
