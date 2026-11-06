"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { HeroConverterBar } from "@/components/home/HeroConverterBar";
import { ArenaHomeSection } from "@/components/home/ArenaHomeSection";
import { HomeQuickAccessBar } from "@/components/home/HomeQuickAccessBar";

/* ═══════════════════════════════════════════════════════════════════════════
   SVG Icons — Pure Vector, Zero Emojis (Google / Stripe aesthetic)
   ═══════════════════════════════════════════════════════════════════════════ */

function IconCode({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconSparkles({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function IconCpu({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

function IconCloud({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function IconVideo({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function IconAward({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="6" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function IconCheck({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconFocus({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}

function IconCheckSquare({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconArrowRight({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconLink({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

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
    <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden transition-all">
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
          className={`flex-shrink-0 w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 transition-transform duration-300 ${
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
      Icon: IconCode,
      colorClass: "text-teal-600 dark:text-teal-400",
      bgClass: "bg-teal-500/10",
      borderClass: "border-teal-500/20",
      hoverBorder: "hover:border-teal-500/50",
    },
    {
      title: "Artificial Intelligence & LLMs",
      description: "Prompt engineering, LangChain, PyTorch, and fine-tuning neural networks.",
      lessons: "24+ Lessons",
      badge: "Trending",
      query: "python artificial intelligence machine learning",
      Icon: IconSparkles,
      colorClass: "text-indigo-600 dark:text-indigo-400",
      bgClass: "bg-indigo-500/10",
      borderClass: "border-indigo-500/20",
      hoverBorder: "hover:border-indigo-500/50",
    },
    {
      title: "Data Structures & Algorithms",
      description: "Interview-ready algorithm mastery in Java, C++, and Python.",
      lessons: "45+ Lessons",
      badge: "Core Track",
      query: "data structures and algorithms dsa",
      Icon: IconCpu,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/20",
      hoverBorder: "hover:border-amber-500/50",
    },
    {
      title: "System Design & Cloud",
      description: "High-scale distributed systems, microservices, AWS, and Docker.",
      lessons: "18+ Lessons",
      badge: "Senior Track",
      query: "system design distributed systems cloud",
      Icon: IconCloud,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/50",
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

      {/* ── 1. Hero Section (Google-Style Simplicity) ────────────────────── */}
      <section
        className="relative overflow-hidden pt-14 sm:pt-20 lg:pt-28 pb-12 sm:pb-16"
        aria-labelledby="hero-title"
      >
        {/* Subtle radial background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-gradient-to-b from-teal-500/8 via-emerald-500/4 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Trust badge with crisp vector indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-heading font-semibold mb-6 shadow-xs animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-muted-foreground">Free, Open &amp; Verifiable Learning</span>
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

          {/* Hero Converter Input */}
          <div className="mb-8 animate-slide-up">
            <HeroConverterBar />
          </div>

          {/* Benefit Ribbon with Crisp Vector Icons */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-7 py-2 text-xs text-muted-foreground font-body max-w-2xl mx-auto">
            {[
              {
                label: "Zero Distractions",
                Icon: IconFocus,
                color: "text-teal-600 dark:text-teal-400",
              },
              {
                label: "AI Study Notes",
                Icon: IconSparkles,
                color: "text-indigo-600 dark:text-indigo-400",
              },
              {
                label: "Quizzes",
                Icon: IconCheckSquare,
                color: "text-amber-600 dark:text-amber-400",
              },
              {
                label: "Verified Certificates",
                Icon: IconAward,
                color: "text-emerald-600 dark:text-emerald-400",
              },
            ].map(({ label, Icon, color }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon size={14} className={color} />
                <span className="font-heading font-semibold text-foreground">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 1.5. Student Quick Access Bar (Courses, Arena, Interview, Explore) ── */}
      <HomeQuickAccessBar />

      {/* ── 2. How It Works (Clean 3-Step Architecture) ──────────────────── */}
      <section
        ref={howItWorksSection.ref as React.RefObject<HTMLElement>}
        className={`py-14 sm:py-20 bg-muted/25 border-y border-border/50 transition-all duration-700 ${
          howItWorksSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        aria-labelledby="pipeline-title"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Structured Workflow
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
                footer: "Instant Curriculum Indexing",
                Icon: IconLink,
                badgeBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
                footerColor: "text-teal-600 dark:text-teal-400",
                hoverBorder: "hover:border-teal-500/40",
              },
              {
                num: "02",
                title: "Study Without Distractions",
                desc: "Focused theater playback with no recommendations, no comments, no algorithmic rabbit holes. Take AI-powered notes and track progress.",
                footer: "Theater Player & Checkpoints",
                Icon: IconVideo,
                badgeBg:
                  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
                footerColor: "text-indigo-600 dark:text-indigo-400",
                hoverBorder: "hover:border-indigo-500/40",
              },
              {
                num: "03",
                title: "Earn Your Certificate",
                desc: "Complete all lessons, pass the comprehension quiz, and claim a verified Certificate of Completion with instant public verification URL.",
                footer: "1-Click LinkedIn Endorsement",
                Icon: IconAward,
                badgeBg:
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                footerColor: "text-emerald-600 dark:text-emerald-400",
                hoverBorder: "hover:border-emerald-500/40",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`enterprise-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between group ${step.hoverBorder} hover:shadow-md transition-all duration-300`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${step.badgeBg} flex items-center justify-center border font-heading font-black text-sm`}
                    >
                      {step.num}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      <step.Icon size={16} />
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div
                  className={`mt-5 pt-3 border-t border-border/60 text-xs font-heading font-semibold ${step.footerColor}`}
                >
                  {step.footer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Trending Curated Tracks ──────────────────────────────────── */}
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
                Curated Learning Tracks
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
              <span>Browse All Tracks</span>
              <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {disciplines.map((item, idx) => (
              <Link
                key={idx}
                href={`/explore?q=${encodeURIComponent(item.query)}`}
                className={`enterprise-card p-5 rounded-2xl ${item.hoverBorder} hover:shadow-md transition-all duration-300 flex flex-col justify-between group active:scale-[0.98]`}
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-9 h-9 rounded-xl ${item.bgClass} ${item.colorClass} border ${item.borderClass} flex items-center justify-center`}
                    >
                      <item.Icon size={18} />
                    </div>
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-heading font-bold text-foreground">
                  <span className={item.colorClass}>{item.lessons}</span>
                  <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                    Start <IconArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3.5. Live Arena & Multiplayer Quiz Competitions ───────────── */}
      <ArenaHomeSection />

      {/* ── 4. Animated Stats Bar ──────────────────────────────────────── */}
      <section
        ref={statsSection.ref as React.RefObject<HTMLElement>}
        className={`py-10 sm:py-14 bg-muted/25 border-y border-border/50 transition-all duration-700 ${
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
                sub: "Indexed & structured",
                color: "text-amber-600 dark:text-amber-400",
              },
              {
                value: "100%",
                label: "Free Forever",
                sub: "No paywalls to watch",
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

      {/* ── 5. Comparison Matrix (YouTube vs VeySkill) ─────────────────── */}
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
              Same free content, structured for real retention and professional credentials.
            </p>
          </div>

          <div className="overflow-hidden bg-card border border-border rounded-2xl shadow-xs">
            <div className="grid grid-cols-2 bg-muted/60 p-4 border-b border-border text-xs sm:text-sm font-heading font-bold">
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Standard YouTube</span>
              </div>
              <div className="text-teal-600 dark:text-teal-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>VeySkill Learning Space</span>
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
                  <div className="text-muted-foreground pr-3 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                      ✕
                    </span>
                    <span>{yt}</span>
                  </div>
                  <div className="text-foreground font-semibold flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <IconCheck size={11} />
                    </span>
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
        className={`py-14 sm:py-20 bg-muted/25 border-y border-border/50 transition-all duration-700 ${
          faqSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        aria-labelledby="faq-title"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Frequently Asked Questions
            </span>
            <h2
              id="faq-title"
              className="font-heading font-black text-2xl sm:text-4xl text-foreground tracking-tight mt-2"
            >
              Everything you need to know.
            </h2>
          </div>

          <div className="space-y-3" role="list">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} q={faq.q} a={faq.a} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA (Google-Style Simplicity) ───────────────────────── */}
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
            Join thousands of scholars mastering software engineering, artificial intelligence, and
            computer science on VeySkill.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/explore"
              className="btn-primary text-sm sm:text-base px-8 py-3.5 min-h-[50px] w-full sm:w-auto inline-flex items-center justify-center gap-2 active:scale-95 font-heading font-bold rounded-xl transition-all"
            >
              <span>Explore Courses</span>
              <IconArrowRight size={14} />
            </Link>

            <Link
              href="/create"
              className="btn-secondary text-sm sm:text-base px-7 py-3.5 min-h-[50px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl font-heading font-semibold transition-all"
            >
              <span>Build a Course</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
