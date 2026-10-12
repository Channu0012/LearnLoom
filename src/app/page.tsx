import Link from "next/link";
import { HeroConverterBar } from "@/components/home/HeroConverterBar";
import { PlatformShowcasePreview } from "@/components/home/PlatformShowcasePreview";

export default function HomePage() {
  const disciplines = [
    {
      title: "Full-Stack Web Development",
      description: "Modern Next.js, React, Node.js, and TypeScript production architectures.",
      lessons: "30+ Modules",
      badge: "Popular",
      query: "nextjs full stack web development",
      iconColor: "from-teal-500/20 to-teal-500/5 text-teal-600 dark:text-teal-400",
    },
    {
      title: "Artificial Intelligence & LLMs",
      description: "Prompt engineering, LangChain, PyTorch, and fine-tuning neural networks.",
      lessons: "24+ Modules",
      badge: "Trending",
      query: "python artificial intelligence machine learning",
      iconColor: "from-primary-500/20 to-primary-500/5 text-primary-600 dark:text-primary-400",
    },
    {
      title: "Data Structures & Algorithms",
      description: "Interview-ready algorithm mastery in Java, C++, and Python.",
      lessons: "45+ Modules",
      badge: "Career Essential",
      query: "data structures and algorithms dsa",
      iconColor: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    },
    {
      title: "System Design & Cloud Architecture",
      description: "High-scale distributed systems, microservices, AWS, and Docker.",
      lessons: "18+ Modules",
      badge: "Senior Track",
      query: "system design distributed systems cloud",
      iconColor: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
  ];

  const faqs = [
    {
      q: "How does VeySkill transform YouTube videos?",
      a: "VeySkill wraps educational video series in a focused, distraction-free study environment. We organize playlists into structured chapters with auto-advancing theater playback, AI study scratchpad, and comprehension quizzes.",
    },
    {
      q: "Are the completion certificates verifiable?",
      a: "Yes. Every multi-module certificate carries a unique certificate ID and public verification URL at veyskill.in/verify/[id]. Employers and recruiters can scan the certificate QR code to directly view official completion records.",
    },
    {
      q: "Can I convert any public YouTube playlist?",
      a: "Yes. Simply paste any valid public YouTube playlist or lecture video link into our converter. VeySkill immediately indexes the video chapters and generates your course syllabus in seconds.",
    },
    {
      q: "Is VeySkill free to use for learners?",
      a: "100% free. You can enroll, take notes, maintain study streaks, and complete entire curricula without paying a single rupee. Official verifiable digital certificates of completion can be unlocked for an administrative fee of just ₹29 upon completion.",
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
      {/* ── 1. Hero: Google-Grade Simplicity & Instant Converter ──────────── */}
      <section
        className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16"
        aria-labelledby="hero-title"
      >
        {/* Subtle radial backdrop glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] rounded-full opacity-15 blur-3xl pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle, #0F766E 0%, #14B8A6 35%, #4F46E5 70%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Institutional Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-xs font-heading font-bold mb-6 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-teal-600 dark:text-teal-400 font-extrabold">
              Structured Open Academy · Distraction-Free · Verified Credentials
            </span>
          </div>

          {/* Master Headline */}
          <h1
            id="hero-title"
            className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1.1] mb-5 animate-slide-up"
          >
            Turn Any YouTube Playlist Into A{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Structured Masterclass.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-slide-up">
            Distraction-free theater playback, structured curriculum tracking, comprehension
            quizzes, and public verifiable certificates of completion.
          </p>

          {/* HERO CONVERTER INPUT (Google-Grade Instant Utility) & STREAK BANNER */}
          <div className="mb-8 animate-slide-up">
            <HeroConverterBar />
          </div>

          {/* Institutional Trust Ribbon */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-2.5 px-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border text-xs text-muted-foreground font-body max-w-2xl mx-auto shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span className="font-heading font-semibold text-foreground">Distraction-Free</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="font-heading font-semibold text-foreground">AI Study Notes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="font-heading font-semibold text-foreground">Quiz Gates</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-heading font-semibold text-foreground">
                Verified Credentials
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. The 3-Step Execution Pipeline ─────────────────────────────── */}
      <section
        className="py-12 sm:py-16 bg-muted/20 border-y border-border/50"
        aria-labelledby="pipeline-title"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              The Learning Standard
            </span>
            <h2
              id="pipeline-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mt-1"
            >
              How big companies train modern engineers.
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
                  Import Any Playlist
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Paste any YouTube tutorial series, university lecture track, or coding bootcamp
                  URL. VeySkill instantly indexes chapters into a structured syllabus.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold text-teal-600 dark:text-teal-400">
                <span>Instant Curriculum Generation</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="enterprise-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between group hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 font-heading font-black text-sm">
                  02
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Focus in Theater Mode
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Study without algorithmic feeds, comment distractions, or rabbit holes. Harness
                  structured chapters, time bookmarks, and private study notes.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Distraction-Free Workspace</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="enterprise-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between group hover:border-emerald-500/40 hover:shadow-md transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 font-heading font-black text-sm">
                  03
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Earn Verified Credential
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Pass comprehension assessments with a 70% threshold, build daily streaks, and
                  claim a permanent Certificate of Completion with instant public QR verification.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Public Web Credential Record</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Featured Disciplines & Masterclasses ───────────────────────── */}
      <section className="py-12 sm:py-16" aria-labelledby="disciplines-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                Trending Disciplines
              </span>
              <h2
                id="disciplines-title"
                className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mt-1"
              >
                Curated high-impact curricula.
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-xs sm:text-sm font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5"
            >
              <span>Explore All Masterclasses</span>
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
                className="enterprise-card p-5 rounded-xl hover:border-teal-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                      {item.badge}
                    </span>
                    <span className="text-[11px] font-heading font-semibold text-teal-600 dark:text-teal-400">
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
                  <span>Start Curriculum</span>
                  <span className="text-teal-500 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Showcase Banner (Theater & App Experience) ────────────────── */}
      <section className="py-12 sm:py-16 relative overflow-hidden" aria-labelledby="showcase-title">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-12 blur-3xl pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle, #0F766E 0%, #14B8A6 35%, #4F46E5 70%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            Platform Interface
          </span>
          <h2
            id="showcase-title"
            className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-foreground tracking-tight max-w-3xl mx-auto leading-tight mt-1 mb-4"
          >
            Every lecture. Structured.{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Verified.
            </span>
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Continuous playlist flow, integrated AI study scratchpad, real-time quizzes, and
            employer-ready certification.
          </p>

          {/* Live Platform Workspace Showcase and 3-Step Flow */}
          <PlatformShowcasePreview />

          {/* 4 Stat pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8 text-left">
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-teal-600 dark:text-teal-400 font-heading font-black text-xl mb-1">
                100%
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">Focused</div>
              <div className="text-[11px] font-body text-muted-foreground">Zero distractions</div>
            </div>
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-amber-600 dark:text-amber-400 font-heading font-black text-xl mb-1">
                70%
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">Quiz Gate</div>
              <div className="text-[11px] font-body text-muted-foreground">Prove your mastery</div>
            </div>
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-emerald-600 dark:text-emerald-400 font-heading font-black text-xl mb-1">
                Auto
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">
                Video Sync
              </div>
              <div className="text-[11px] font-body text-muted-foreground">Accurate tracking</div>
            </div>
            <div className="enterprise-card p-4 rounded-xl">
              <div className="text-indigo-600 dark:text-indigo-400 font-heading font-black text-xl mb-1">
                Free
              </div>
              <div className="font-heading font-bold text-xs text-foreground mb-0.5">Forever</div>
              <div className="text-[11px] font-body text-muted-foreground">No paywalls</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Comparison: YouTube vs. VeySkill ────────────────────────────── */}
      <section
        className="py-10 sm:py-14 bg-muted/20 border-y border-border/50"
        aria-labelledby="comparison-title"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-7">
            <h2
              id="comparison-title"
              className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight"
            >
              Where free education meets real discipline.
            </h2>
          </div>

          <div className="overflow-hidden bg-card border border-border rounded-3xl shadow-lg">
            <div className="grid grid-cols-2 bg-muted/60 p-4 border-b border-border text-xs sm:text-sm font-heading font-bold">
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
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
                  "Structured, distraction-free study theater",
                ],
                [
                  "Sidebar distractions & clickbait comments",
                  "Focused syllabus & module progression",
                ],
                ["No comprehension checks", "70% quiz gate per module"],
                ["Lost progress across devices", "Cloud-synced progress & 7-day streak"],
                ["No proof of completion", "Permanent Certificate of Completion + Scannable QR"],
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

      {/* ── 6. Executive FAQ Section ───────────────────────────────────────── */}
      <section className="py-12 sm:py-16" aria-labelledby="faq-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Knowledge Base
            </span>
            <h2
              id="faq-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mt-1"
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-sm"
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

      {/* ── 7. Final Call to Action ────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-muted/30 border-t border-border/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mb-3">
            Ready to learn without distractions?
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            Join thousands of self-directed learners mastering computer science, artificial
            intelligence, and software engineering on VeySkill.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/explore"
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 shadow-xl shadow-teal-500/25 active:scale-95 font-heading font-extrabold rounded-2xl transition-all"
            >
              <span>Explore Masterclasses</span>
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
              className="px-7 py-3.5 min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-card border-2 border-border hover:border-teal-500/50 hover:bg-muted text-foreground text-sm sm:text-base active:scale-95 font-heading font-bold transition-all shadow-sm"
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
