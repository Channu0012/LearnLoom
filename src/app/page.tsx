"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { HeroConverterBar } from "@/components/home/HeroConverterBar";

// ─── Intersection Observer hook for scroll-reveal animations ────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCounter(target: number, duration = 1400, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return count;
}

// ─── FAQ accordion item ──────────────────────────────────────────────────────
function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer hover:bg-muted/40 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset"
        aria-expanded={open}
        aria-controls={`faq-answer-${idx}`}
        id={`faq-question-${idx}`}
      >
        <h3 className="font-heading font-bold text-base sm:text-lg text-foreground">{q}</h3>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div
        id={`faq-answer-${idx}`}
        role="region"
        aria-labelledby={`faq-question-${idx}`}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "400px" : "0px" }}
      >
        <p className="font-body text-sm text-muted-foreground leading-relaxed px-5 sm:px-6 pb-5 sm:pb-6">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const disciplines = [
    {
      title: "Full-Stack Web Development",
      description: "Modern Next.js, React, Node.js, and TypeScript production architectures.",
      lessons: "30+ Lessons",
      badge: "Popular",
      query: "nextjs full stack web development",
      iconColor: "text-teal-600 dark:text-teal-400",
      accentBg: "bg-teal-500/10",
      accentBorder: "border-teal-500/20",
      hoverBorder: "hover:border-teal-500/60",
    },
    {
      title: "Artificial Intelligence & LLMs",
      description: "Prompt engineering, LangChain, PyTorch, and fine-tuning neural networks.",
      lessons: "24+ Lessons",
      badge: "Trending",
      query: "python artificial intelligence machine learning",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      accentBg: "bg-indigo-500/10",
      accentBorder: "border-indigo-500/20",
      hoverBorder: "hover:border-indigo-500/60",
    },
    {
      title: "Data Structures & Algorithms",
      description: "Interview-ready algorithm mastery in Java, C++, and Python.",
      lessons: "45+ Lessons",
      badge: "Career Essential",
      query: "data structures and algorithms dsa",
      iconColor: "text-amber-600 dark:text-amber-400",
      accentBg: "bg-amber-500/10",
      accentBorder: "border-amber-500/20",
      hoverBorder: "hover:border-amber-500/60",
    },
    {
      title: "System Design & Cloud",
      description: "High-scale distributed systems, microservices, AWS, and Docker.",
      lessons: "18+ Lessons",
      badge: "Senior Track",
      query: "system design distributed systems cloud",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-500/10",
      accentBorder: "border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/60",
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

  // HowToSteps structured data for SEO
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Turn a YouTube Playlist into a Structured Course on VeySkill",
    step: [
      {
        "@type": "HowToStep",
        name: "Paste a Playlist Link",
        text: "Drop any YouTube tutorial series, university lecture, or coding bootcamp URL into VeySkill's converter.",
      },
      {
        "@type": "HowToStep",
        name: "Study Without Distractions",
        text: "Focused theater playback with no recommendations, no comments. Take AI-powered notes and track your progress.",
      },
      {
        "@type": "HowToStep",
        name: "Earn Your Certificate",
        text: "Complete all lessons, pass the comprehension quiz, and claim a verified Certificate of Completion.",
      },
    ],
  };

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

  // Scroll-reveal refs
  const howItWorksSection = useInView();
  const disciplinesSection = useInView();
  const statsSection = useInView();
  const comparisonSection = useInView();
  const faqSection = useInView();
  const ctaSection = useInView();

  // Animated counters
  const learnersCount = useCounter(12000, 1600, statsSection.inView);
  const coursesCount = useCounter(350, 1400, statsSection.inView);

  const formatCount = useCallback((n: number, suffix = "+") => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k${suffix}`;
    return `${n}${suffix}`;
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-28 pb-14 sm:pb-20"
        aria-labelledby="hero-title"
      >
        {/* Subtle radial background glow — adds depth without distraction */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-teal-500/8 via-emerald-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Trust badge */}
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
            {[
              {
                label: "Zero Distractions",
                color: "text-teal-600 dark:text-teal-400",
              },
              {
                label: "AI Study Notes",
                color: "text-indigo-600 dark:text-indigo-400",
              },
              {
                label: "Quizzes",
                color: "text-amber-600 dark:text-amber-400",
              },
              {
                label: "Verified Certificates",
                color: "text-emerald-600 dark:text-emerald-400",
              },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${color}`} />
                <span className={`font-heading font-semibold text-foreground`}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. How It Works ─────────────────────────────────────────────── */}
      <section
        ref={howItWorksSection.ref as React.RefObject<HTMLElement>}
        className={`py-14 sm:py-20 bg-muted/30 border-y border-border/50 transition-all duration-700 ${
          howItWorksSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
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
            {[
              {
                num: "01",
                title: "Paste a Playlist Link",
                desc: "Drop any YouTube tutorial series, university lecture, or coding bootcamp URL. VeySkill instantly generates a structured course syllabus.",
                footer: "Instant Setup",
                color: "teal",
              },
              {
                num: "02",
                title: "Study Without Distractions",
                desc: "Focused theater playback with no recommendations, no comments, no rabbit holes. Take AI-powered notes and track your progress.",
                footer: "Focused Learning",
                color: "indigo",
              },
              {
                num: "03",
                title: "Earn Your Certificate",
                desc: "Complete all lessons, pass the comprehension quiz, and claim a verified Certificate of Completion with public verification.",
                footer: "Verified Credential",
                color: "emerald",
              },
            ].map(({ num, title, desc, footer, color }, i) => (
              <div
                key={num}
                className={`enterprise-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between group hover:border-${color}-500/40 hover:shadow-md transition-all duration-300`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 flex items-center justify-center mb-4 border border-${color}-500/20 font-heading font-black text-sm`}
                  >
                    {num}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{title}</h3>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
                <div
                  className={`mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold text-${color}-600 dark:text-${color}-400`}
                >
                  {footer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Trending Courses ────────────────────────────────────────── */}
      <section
        ref={disciplinesSection.ref as React.RefObject<HTMLElement>}
        className={`py-14 sm:py-20 transition-all duration-700 ${
          disciplinesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        aria-labelledby="disciplines-title"
      >
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
              className="text-xs sm:text-sm font-heading font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5 flex-shrink-0"
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
                className={`enterprise-card p-5 rounded-xl ${item.hoverBorder} hover:shadow-md transition-all duration-300 flex flex-col justify-between group active:scale-[0.98]`}
                style={{ transitionDelay: `${idx * 60}ms` }}
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

      {/* ── 4. Animated Stats Bar ──────────────────────────────────────── */}
      <section
        ref={statsSection.ref as React.RefObject<HTMLElement>}
        className={`py-10 sm:py-14 bg-muted/30 border-y border-border/50 transition-all duration-700 ${
          statsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              {
                value: `${formatCount(learnersCount)}`,
                label: "Learners",
                sub: "Worldwide",
                color: "text-teal-600 dark:text-teal-400",
              },
              {
                value: "AI",
                label: "Study Notes",
                sub: "Auto-generated",
                color: "text-indigo-600 dark:text-indigo-400",
              },
              {
                value: `${formatCount(coursesCount)}`,
                label: "Courses",
                sub: "& growing",
                color: "text-amber-600 dark:text-amber-400",
              },
              {
                value: "∞",
                label: "Free Forever",
                sub: "No paywalls",
                color: "text-emerald-600 dark:text-emerald-400",
              },
            ].map(({ value, label, sub, color }, i) => (
              <div
                key={label}
                className="enterprise-card p-4 rounded-xl"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className={`${color} font-heading font-black text-2xl sm:text-3xl mb-1 tabular-nums`}
                >
                  {value}
                </div>
                <div className="font-heading font-bold text-xs text-foreground">{label}</div>
                <div className="text-[11px] font-body text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Why VeySkill — Comparison Table ──────────────────────────── */}
      <section
        ref={comparisonSection.ref as React.RefObject<HTMLElement>}
        className={`py-14 sm:py-20 transition-all duration-700 ${
          comparisonSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        aria-labelledby="comparison-title"
      >
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

      {/* ── 6. FAQ Accordion ────────────────────────────────────────────── */}
      <section
        ref={faqSection.ref as React.RefObject<HTMLElement>}
        className={`py-14 sm:py-20 bg-muted/30 border-y border-border/50 transition-all duration-700 ${
          faqSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
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

          <div className="space-y-3" role="list">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} q={faq.q} a={faq.a} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA ───────────────────────────────────────────────── */}
      <section
        ref={ctaSection.ref as React.RefObject<HTMLElement>}
        className={`py-14 sm:py-20 transition-all duration-700 ${
          ctaSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
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
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[52px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 active:scale-95 font-heading font-extrabold rounded-2xl transition-all"
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
              className="btn-secondary text-sm sm:text-base px-7 py-3.5 min-h-[52px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl font-heading font-bold transition-all"
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
