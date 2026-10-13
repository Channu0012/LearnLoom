import Link from "next/link";
import { HeroConverterBar } from "@/components/home/HeroConverterBar";

export default function HomePage() {
  const disciplines = [
    {
      title: "Full-Stack Web Development",
      description: "Modern Next.js, React, Node.js, and TypeScript production architectures.",
      lessons: "30+ Lessons",
      badge: "Popular",
      query: "nextjs full stack web development",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      title: "Artificial Intelligence & LLMs",
      description: "Prompt engineering, LangChain, PyTorch, and fine-tuning neural networks.",
      lessons: "24+ Lessons",
      badge: "Trending",
      query: "python artificial intelligence machine learning",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Data Structures & Algorithms",
      description: "Interview-ready algorithm mastery in Java, C++, and Python.",
      lessons: "45+ Lessons",
      badge: "Career Essential",
      query: "data structures and algorithms dsa",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "System Design & Cloud",
      description: "High-scale distributed systems, microservices, AWS, and Docker.",
      lessons: "18+ Lessons",
      badge: "Senior Track",
      query: "system design distributed systems cloud",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const faqs = [
    {
      q: "How does VeySkill transform YouTube videos?",
      a: "VeySkill wraps educational video series in a focused, distraction-free study environment. We organize playlists into structured chapters with auto-advancing theater playback, AI study notes, and comprehension quizzes.",
    },
    {
      q: "Are the completion certificates verifiable?",
      a: "Yes. Every certificate carries a unique credential ID and public verification URL at veyskill.in/verify/[id]. Employers and recruiters can verify official completion records instantly.",
    },
    {
      q: "Can I convert any public YouTube playlist?",
      a: "Yes. Simply paste any valid public YouTube playlist or lecture video link into our converter. VeySkill immediately indexes the video chapters and generates your course syllabus in seconds.",
    },
    {
      q: "Is VeySkill free to use?",
      a: "100% free. You can enroll, take notes, maintain study streaks, and complete entire courses without paying a single rupee. Official verifiable certificates of completion can be unlocked for just ₹29 upon completion.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="w-full overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-28 pb-14 sm:pb-20"
        aria-labelledby="hero-title"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Compact trust badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-heading font-semibold mb-6 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-muted-foreground">Trusted by self-learners worldwide</span>
          </div>

          {/* Main Headline */}
          <h1
            id="hero-title"
            className="font-heading font-black text-4xl sm:text-5xl lg:text-7xl text-foreground tracking-tight leading-[1.08] mb-5 animate-slide-up"
          >
            Learn Anything.{" "}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Get Certified.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed animate-slide-up">
            Turn any YouTube playlist into a structured course with focused playback, AI study
            notes, quizzes, and verifiable certificates.
          </p>

          {/* Hero Converter */}
          <div className="mb-8 animate-slide-up">
            <HeroConverterBar />
          </div>

          {/* Benefit Ribbon */}
          <div className="inline-flex flex-wrap items-center justify-center gap-5 sm:gap-8 py-2 text-xs text-muted-foreground font-body max-w-2xl mx-auto">
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-teal-600 dark:text-teal-400"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-heading font-semibold text-foreground">Zero Distractions</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-indigo-600 dark:text-indigo-400"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span className="font-heading font-semibold text-foreground">AI Study Notes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-amber-600 dark:text-amber-400"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span className="font-heading font-semibold text-foreground">Quizzes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-emerald-600 dark:text-emerald-400"
              >
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M7 22h10" />
                <path d="M12 18v4" />
              </svg>
              <span className="font-heading font-semibold text-foreground">
                Verified Certificates
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. How It Works ─────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-20 bg-muted/30 border-y border-border/50"
        aria-labelledby="pipeline-title"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              How It Works
            </span>
            <h2
              id="pipeline-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mt-2"
            >
              Three steps to structured learning.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="enterprise-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between group hover:border-teal-500/40 hover:shadow-md transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 border border-teal-500/20 font-heading font-black text-sm">
                  01
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Paste a Playlist Link
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Drop any YouTube tutorial series, university lecture, or coding bootcamp URL.
                  VeySkill instantly generates a structured course syllabus.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold text-teal-600 dark:text-teal-400">
                Instant Setup
              </div>
            </div>

            {/* Step 2 */}
            <div className="enterprise-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between group hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 font-heading font-black text-sm">
                  02
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Study Without Distractions
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Focused theater playback with no recommendations, no comments, no rabbit holes.
                  Take AI-powered notes and track your progress.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold text-indigo-600 dark:text-indigo-400">
                Focused Learning
              </div>
            </div>

            {/* Step 3 */}
            <div className="enterprise-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between group hover:border-emerald-500/40 hover:shadow-md transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 font-heading font-black text-sm">
                  03
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Earn Your Certificate
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Complete all lessons, pass the comprehension quiz, and claim a verified
                  Certificate of Completion with public verification.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold text-emerald-600 dark:text-emerald-400">
                Verified Credential
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Trending Courses ────────────────────────────────────────── */}
      <section className="py-14 sm:py-20" aria-labelledby="disciplines-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                Popular Right Now
              </span>
              <h2
                id="disciplines-title"
                className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mt-2"
              >
                Start with a trending topic.
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-xs sm:text-sm font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5"
            >
              <span>Browse All Courses</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {disciplines.map((item, idx) => (
              <Link
                key={idx}
                href={`/explore?q=${encodeURIComponent(item.query)}`}
                className="enterprise-card p-5 rounded-xl hover:border-teal-500/60 hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                      {item.badge}
                    </span>
                    <span className={`text-[11px] font-heading font-semibold ${item.iconColor}`}>
                      {item.lessons}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-bold text-foreground">
                  <span>Start Learning</span>
                  <span className="text-teal-500 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Stats Bar ───────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-muted/30 border-y border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-teal-600 dark:text-teal-400 font-heading font-black text-2xl mb-1">
                100%
              </div>
              <div className="font-heading font-bold text-xs text-foreground">Focused</div>
              <div className="text-[11px] font-body text-muted-foreground">No distractions</div>
            </div>
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-indigo-600 dark:text-indigo-400 font-heading font-black text-2xl mb-1">
                AI
              </div>
              <div className="font-heading font-bold text-xs text-foreground">Study Notes</div>
              <div className="text-[11px] font-body text-muted-foreground">Auto-generated</div>
            </div>
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-amber-600 dark:text-amber-400 font-heading font-black text-2xl mb-1">
                70%
              </div>
              <div className="font-heading font-bold text-xs text-foreground">Quiz Gate</div>
              <div className="text-[11px] font-body text-muted-foreground">Prove mastery</div>
            </div>
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-emerald-600 dark:text-emerald-400 font-heading font-black text-2xl mb-1">
                ∞
              </div>
              <div className="font-heading font-bold text-xs text-foreground">Free Forever</div>
              <div className="text-[11px] font-body text-muted-foreground">No paywalls</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Why VeySkill ────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20" aria-labelledby="comparison-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2
              id="comparison-title"
              className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight"
            >
              YouTube is great. VeySkill makes it better.
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              Same free content, but structured for real learning outcomes.
            </p>
          </div>

          <div className="overflow-hidden bg-card border border-border rounded-2xl shadow-sm">
            <div className="grid grid-cols-2 bg-muted/60 p-4 border-b border-border text-xs sm:text-sm font-heading font-bold">
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Standard YouTube</span>
              </div>
              <div className="text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>VeySkill</span>
              </div>
            </div>

            <div className="divide-y divide-border/60 text-xs sm:text-sm font-body">
              {[
                [
                  "Algorithmic rabbit holes & endless feeds",
                  "Structured, distraction-free playback",
                ],
                ["No progress tracking", "Auto-saved progress across devices"],
                [
                  "Sidebar distractions & clickbait comments",
                  "Focused syllabus & module progression",
                ],
                ["No comprehension checks", "70% quiz gate per module"],
                ["No proof of completion", "Verified Certificate of Completion"],
              ].map(([yt, vs], i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 p-3.5 sm:p-4 items-center hover:bg-muted/20 transition-colors"
                >
                  <div className="text-muted-foreground pr-3">{yt}</div>
                  <div className="text-foreground font-semibold flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-teal-600 flex-shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{vs}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Section ─────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-20 bg-muted/30 border-y border-border/50"
        aria-labelledby="faq-title"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              FAQ
            </span>
            <h2
              id="faq-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mt-2"
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <h3 className="font-heading font-bold text-base sm:text-lg text-foreground mb-2">
                  {faq.q}
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA ───────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mb-3">
            Ready to start learning?
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            Join thousands of learners mastering software engineering, AI, and computer science on
            VeySkill.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/explore"
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 active:scale-95 font-heading font-extrabold rounded-2xl transition-all"
            >
              <span>Explore Courses</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <Link
              href="/create"
              className="btn-secondary text-sm sm:text-base px-7 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl font-heading font-bold transition-all"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Build a Course</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
