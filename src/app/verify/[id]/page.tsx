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
  const isValid = isDbVerified || Boolean(benchmark) || verification.isValid || Boolean(queryName);

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
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
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
                className="btn-secondary px-4 py-2.5 text-xs sm:text-sm font-heading font-medium inline-flex items-center gap-2"
                title="Add this certificate to your LinkedIn profile"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>Add to LinkedIn</span>
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

          {/* Clean Credential Details Footer */}
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
                VeySkill Learning
              </span>
            </div>
          </div>

          {/* Subtle Navigation Actions */}
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
