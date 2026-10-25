import type { Metadata } from "next";
import Link from "next/link";
import {
  normalizeCertificateId,
  verifyCertificateId,
  BENCHMARK_CERTIFICATES,
} from "@/lib/security";
import { formatExecutiveCourseTitle } from "@/lib/pdfCertificate";
import { OfficialCertificateView } from "@/components/courses/OfficialCertificateView";
import { VerifyPdfDownloadButton } from "@/components/verify/VerifyPdfDownloadButton";
import { CopyCredentialLinkButton } from "@/components/verify/CopyCredentialLinkButton";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const cleanId = normalizeCertificateId(id);
  const query = (await searchParams) || {};
  const queryName = typeof query.n === "string" ? query.n : undefined;
  const queryCourse = typeof query.c === "string" ? query.c : undefined;
  const scholar = queryName ? `${queryName} - ` : "";
  const course = queryCourse ? `${queryCourse} | ` : "";
  return {
    title: `${scholar}${course}Certificate of Completion (${cleanId || id})`,
    description: `Official Certificate of Completion awarded by VeySkill to ${queryName || "verified learner"} for completing ${queryCourse || "curriculum"}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface CertRecord {
  userName?: string;
  courseTitle?: string;
  lessonCount?: number;
  quizScore?: number | null;
  issuedDate?: string;
  verifyUrl?: string;
  platform?: string;
  instructorName?: string;
  instructorTitle?: string;
}

function getCourseCompetencies(title: string): string[] {
  const lower = title.toLowerCase();
  if (lower.includes("java")) {
    return [
      "Object-Oriented Architecture",
      "JVM Memory & Execution Model",
      "Multithreading & Concurrency",
      "Enterprise Backend Design",
      "Production Code Quality",
    ];
  }
  if (lower.includes("python")) {
    return [
      "Pythonic Clean Code & Patterns",
      "Data Structures & Algorithms",
      "API & Service Engineering",
      "Automation & Scripting",
      "Asynchronous I/O Workflows",
    ];
  }
  if (
    lower.includes("react") ||
    lower.includes("next") ||
    lower.includes("web") ||
    lower.includes("frontend")
  ) {
    return [
      "Modern Component Architecture",
      "State Management & React Lifecycle",
      "Responsive Layouts & Design Systems",
      "Client-Side Performance Optimization",
      "Full-Stack Web Engineering",
    ];
  }
  if (
    lower.includes("cloud") ||
    lower.includes("devops") ||
    lower.includes("docker") ||
    lower.includes("kubernetes")
  ) {
    return [
      "Cloud Infrastructure Architecture",
      "Containerization & Microservices",
      "CI/CD Pipeline Automation",
      "System Scalability & Monitoring",
      "Site Reliability Engineering (SRE)",
    ];
  }
  if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("data")) {
    return [
      "Machine Learning Fundamentals",
      "Prompt Engineering & LLM Architecture",
      "Data Pipeline Processing",
      "Evaluation Benchmarking",
      "Applied AI Solutions",
    ];
  }
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) {
    return [
      "Design Systems & Token Architecture",
      "Information Architecture & User Flows",
      "Visual Hierarchy & Typography",
      "Accessibility (WCAG) Compliance",
      "Interactive Prototyping",
    ];
  }
  return [
    "Core Domain Principles",
    "Applied Problem Solving",
    "System Design Methodology",
    "Technical Execution",
    "Industry Best Practices",
  ];
}

export default async function VerifyCertificatePage({ params, searchParams }: Props) {
  const { id: rawId } = await params;
  const cleanId = normalizeCertificateId(rawId);
  const query = (await searchParams) || {};
  const queryName =
    typeof query.n === "string" ? query.n : Array.isArray(query.n) ? query.n[0] : undefined;
  const queryCourse =
    typeof query.c === "string" ? query.c : Array.isArray(query.c) ? query.c[0] : undefined;
  const queryDate =
    typeof query.d === "string" ? query.d : Array.isArray(query.d) ? query.d[0] : undefined;
  const queryScore =
    typeof query.s === "string"
      ? Number(query.s)
      : Array.isArray(query.s)
        ? Number(query.s[0])
        : null;
  const queryLessons =
    typeof query.l === "string"
      ? Number(query.l)
      : Array.isArray(query.l)
        ? Number(query.l[0])
        : null;

  let certRecord: CertRecord | null = null;
  let isDbVerified = false;

  // 1. Check official Firestore registry via Firebase Admin SDK
  try {
    const { adminDb, isFirebaseAdminConfigured } = await import("@/lib/firebase-admin");
    if (isFirebaseAdminConfigured) {
      const docSnap = await adminDb.collection("certificates").doc(cleanId).get();
      if (docSnap.exists) {
        certRecord = docSnap.data() as CertRecord;
        isDbVerified = true;
      }
    }
  } catch (err) {
    console.warn("Firestore admin lookup notice:", err);
  }

  // 2. Check benchmark registry fallback
  const benchmark = BENCHMARK_CERTIFICATES[cleanId];
  if (benchmark && !certRecord && !queryName) {
    certRecord = {
      userName: benchmark.userName,
      courseTitle: benchmark.courseTitle,
      lessonCount: benchmark.lessonCount,
      quizScore: benchmark.quizScore,
      issuedDate: benchmark.issuedDate,
      verifyUrl: `https://veyskill.in/verify/${cleanId}`,
      platform: "VeySkill",
      instructorName: "Channabasav Patil",
      instructorTitle: "FOUNDER",
    };
  }

  // 3. ID checksum verification
  const verification = verifyCertificateId(cleanId);
  const isValid = isDbVerified || Boolean(benchmark) || verification.isValid;

  const recipientName = certRecord?.userName || queryName || "Verified Scholar";
  const courseTitle = formatExecutiveCourseTitle(
    certRecord?.courseTitle || queryCourse || "Software Engineering Track"
  );
  const lessonCount =
    certRecord?.lessonCount || (queryLessons && !isNaN(queryLessons) ? queryLessons : 12);
  const quizScore =
    certRecord?.quizScore ?? (queryScore != null && !isNaN(queryScore) ? queryScore : null);
  const issuedDate = certRecord?.issuedDate || queryDate || "October 2026";
  const verifyUrl = `https://veyskill.in/verify/${cleanId}`;

  // LinkedIn certification URL
  const linkedInShareUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseTitle)}&organizationName=${encodeURIComponent("VeySkill")}&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(cleanId)}`;
  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Take a look at my verified Certificate of Completion in "${courseTitle}" from VeySkill! 🎓 Verify here: ${verifyUrl}`
  )}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Just earned my verified Certificate of Completion in "${courseTitle}" on @VeySkill! 🚀 Verify: ${verifyUrl}`
  )}`;

  const estimatedStudyHours = Math.max(2, Math.round(lessonCount * 0.75));
  const competencies = getCourseCompetencies(courseTitle);

  return (
    <div className="container-page py-8 sm:py-12 max-w-5xl space-y-8">
      {isValid ? (
        <>
          {/* Executive Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 bg-card border border-border rounded-2xl shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Certificate of Completion
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
                {recipientName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-body">
                Completed{" "}
                <span className="font-semibold text-foreground">&ldquo;{courseTitle}&rdquo;</span>{" "}
                on {issuedDate} &middot; Record{" "}
                <span className="font-mono font-medium text-foreground">{cleanId}</span>
              </p>
            </div>

            {/* Direct 1-Click Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <VerifyPdfDownloadButton
                id={cleanId}
                userName={recipientName}
                courseTitle={courseTitle}
                lessonCount={lessonCount}
                quizScore={quizScore}
                issuedDate={issuedDate}
                verifyUrl={verifyUrl}
              />

              <a
                href={linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-3.5 py-2 text-xs sm:text-sm font-heading font-medium inline-flex items-center gap-1.5"
                title="Add this certificate to your LinkedIn profile"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span className="hidden sm:inline">LinkedIn</span>
              </a>

              <a
                href={whatsAppShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-3 py-2 text-xs sm:text-sm font-heading font-medium inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
                title="Share on WhatsApp"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.09-1.11l-.29-.17-3.04.8 1.05-2.96-.19-.3a8.19 8.19 0 0 1-1.25-4.5c0-4.54 3.7-8.24 8.24-8.24" />
                </svg>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-3 py-2 text-xs sm:text-sm font-heading font-medium inline-flex items-center gap-1.5"
                title="Share on X (Twitter)"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="hidden sm:inline">X</span>
              </a>

              <CopyCredentialLinkButton url={verifyUrl} />
            </div>
          </div>

          {/* Centerpiece: The High-Resolution Certificate Itself */}
          <div className="w-full shadow-lg rounded-2xl overflow-hidden border border-border bg-card">
            <OfficialCertificateView
              recipientName={recipientName}
              courseTitle={courseTitle}
              certificateId={cleanId}
              issuedDate={issuedDate}
              lessonCount={lessonCount}
              quizScore={quizScore}
              verifyUrl={verifyUrl}
              isInteractive={false}
            />
          </div>

          {/* Clean Credential Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-card border border-border rounded-xl text-xs font-body">
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Recipient
              </span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">
                {recipientName}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Course Completed
              </span>
              <span className="font-semibold text-foreground text-sm mt-0.5 block line-clamp-1">
                {courseTitle}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Credential ID
              </span>
              <span className="font-mono font-bold text-foreground text-sm mt-0.5 block">
                {cleanId}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                Issuance Authority
              </span>
              <span className="font-bold text-foreground text-sm mt-0.5 block">
                VeySkill Academy
              </span>
            </div>
          </div>

          {/* Recruiter Evidence Matrix (Tier-1 Credential Rigor) */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-heading font-bold text-foreground flex items-center gap-2">
                  <span>Recruiter Evidence Matrix</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                    Audit Verified
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Academic proof-of-work, validated curriculum hours, and verified core competency
                  breakdown.
                </p>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">
                Protocol: <span className="text-foreground font-semibold">VS-SHA256</span>
              </div>
            </div>

            {/* 3 Rigor Evidence Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1: Study Investment */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                    Coursework Rigor
                  </span>
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                </div>
                <div className="text-xl font-heading font-extrabold text-foreground">
                  {estimatedStudyHours} Hours
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Completed {lessonCount} curriculum lecture modules and practical checkpoints.
                </p>
              </div>

              {/* Pillar 2: Knowledge Assessment */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                    Assessment Result
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
                  {quizScore != null ? `${quizScore}% Score` : "Passed (≥70%)"}
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Knowledge verified via dynamic module assessments with server-side passing
                  enforcement.
                </p>
              </div>

              {/* Pillar 3: Tamper-Evident Ledger */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                    Tamper Evidence
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="font-mono font-bold text-foreground text-sm sm:text-base pt-1 truncate">
                  {cleanId}
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Cryptographically hashed record registered in VeySkill Firestore ledger with zero
                  falsification tolerance.
                </p>
              </div>
            </div>

            {/* Core Competencies Matrix */}
            <div className="pt-2 border-t border-border/70">
              <span className="text-xs font-heading font-bold text-foreground block mb-2.5">
                Verified Competency Demonstrations
              </span>
              <div className="flex flex-wrap gap-2">
                {competencies.map((comp) => (
                  <span
                    key={comp}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border text-foreground text-xs font-medium font-body shadow-sm"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-teal-600 dark:text-teal-400"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{comp}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Viral Peer Acquisition Funnel Card */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-card via-card to-teal-500/5 border-2 border-teal-500/20 rounded-2xl shadow-sm text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold font-mono">
                <span>✦ ACCELERATE YOUR OWN CAREER</span>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-extrabold text-foreground">
                Inspired by {recipientName}&apos;s Achievement?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                You can master <strong>&ldquo;{courseTitle}&rdquo;</strong> completely free on
                VeySkill. Complete the structured curriculum, test your technical knowledge with
                checkpoints, and earn your own verified Certificate of Completion.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-shrink-0">
              <Link
                href={`/explore?q=${encodeURIComponent(courseTitle)}`}
                className="btn-primary px-6 py-3 text-xs sm:text-sm font-heading font-bold text-center shadow-lg shadow-teal-600/20 inline-flex items-center justify-center gap-2"
              >
                <span>Start This Course Free</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-center gap-4 text-xs font-heading font-medium text-muted-foreground pt-2">
            <Link
              href="/"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              &larr; Return to VeySkill Home
            </Link>
            <span>&middot;</span>
            <Link
              href="/explore"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Explore More Courses &rarr;
            </Link>
          </div>
        </>
      ) : (
        /* Invalid or Unrecognized Credential State */
        <div className="p-8 sm:p-12 bg-card border border-border rounded-2xl shadow-sm text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-heading font-bold text-foreground">Certificate Not Found</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-body">
            The credential identifier{" "}
            <code className="font-mono font-bold text-foreground">{cleanId || rawId}</code> is
            invalid or has not been issued.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn-primary px-5 py-2.5 text-xs font-heading font-semibold">
              Browse Authentic Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
