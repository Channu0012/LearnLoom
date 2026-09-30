import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card mt-16 w-full overflow-x-hidden pb-20 md:pb-0">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 hover:opacity-95 transition-opacity"
              aria-label="Vidcura home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.png"
                alt="Vidcura Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain rounded-lg"
              />
              <span className="font-heading font-extrabold text-lg tracking-tight">
                <span className="text-foreground">vid</span>
                <span className="text-[#FE5A50]">cura</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-xs">
              Curate online video playlists into structured, distraction-free courses. Free
              community learning with zero ads or invasive algorithms.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer platform links">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
              Platform
            </p>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href="/explore" className="hover:text-primary-500 transition-colors">
                  Explore courses
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-primary-500 transition-colors">
                  Create a course
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Footer legal links">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-3">
              Legal &amp; Privacy
            </p>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-primary-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/takedown" className="hover:text-primary-500 transition-colors">
                  Takedown Request
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <hr className="border-border my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-body">
          <p>© {year} Vidcura. All rights reserved.</p>
          <p className="text-muted-foreground/80 text-[11px]">
            Vidcura is an independent educational client. All video content belongs to its
            respective original creators.
          </p>
        </div>
      </div>
    </footer>
  );
}
