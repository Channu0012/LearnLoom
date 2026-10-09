"use client";

// ---------------------------------------------------------------------------
// PaymentGate.tsx — VeySkill Official Certificate Payment Gateway Modal
// Unlocks verified certificate for ₹29 via Cashfree Payments (UPI, Cards, NetBanking).
// Features: Dynamic SDK loading, resilient fallback verification, executive UI design.
// ---------------------------------------------------------------------------
import { useState, useCallback } from "react";

interface PaymentGateProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (_orderId: string, _confirmedName?: string) => void;
  courseId: string;
  courseTitle: string;
  lessonCount?: number;
  description?: string;
  duration?: number;
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber?: string | null;
  } | null;
}

export function PaymentGate({
  isOpen,
  onClose,
  onPaymentSuccess,
  courseId,
  courseTitle,
  lessonCount,
  description,
  duration,
  user,
}: PaymentGateProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [legalName, setLegalName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumber?.replace(/[^0-9]/g, "").slice(-10) || ""
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Strict Phone & Name Validation Check
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const isPhoneValid = cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
  const isNameValid = legalName.trim().length >= 2;
  const isFormReady = isNameValid && isPhoneValid;

  // -------------------------------------------------------------------------
  // Verify Payment Status with Server
  // -------------------------------------------------------------------------
  const verifyOrderPayment = useCallback(
    async (orderId: string) => {
      setVerifying(true);
      setError(null);
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            uid: user?.uid,
            courseId,
          }),
        });

        const data = await res.json();
        if (res.ok && data.isPaid) {
          const finalLegalName = legalName.trim() || user?.displayName || "Learner";
          onPaymentSuccess(orderId, finalLegalName);
          return true;
        } else {
          setError(
            data.status === "PENDING"
              ? "Payment is still processing. Please check your UPI app or wait a moment."
              : "Payment verification pending or unsuccessful. If money was deducted, click 'Check Payment Status' below."
          );
          return false;
        }
      } catch (err) {
        console.error("Payment verification failed:", err);
        setError("Network error while verifying payment. Please retry.");
        return false;
      } finally {
        setVerifying(false);
      }
    },
    [user?.uid, user?.displayName, courseId, onPaymentSuccess, legalName]
  );

  // -------------------------------------------------------------------------
  // Initiate Cashfree Payment Checkout
  // -------------------------------------------------------------------------
  const handleInitiatePayment = useCallback(async () => {
    if (!user) {
      setError("Please sign in to proceed with certificate purchase.");
      return;
    }

    if (!isNameValid) {
      setValidationError(
        "Please enter your full legal name as it should appear on your verified certificate."
      );
      return;
    }

    if (!isPhoneValid) {
      setValidationError(
        "Please enter a valid 10-digit mobile number (starts with 6-9) for payment receipt & SMS verification."
      );
      return;
    }

    setValidationError(null);
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on server with confirmed legal details
      const confirmedName = legalName.trim();
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          courseId,
          courseTitle,
          lessonCount,
          description,
          duration,
          customerName: confirmedName,
          customerEmail: user.email || `${user.uid.slice(0, 8)}@veyskill.in`,
          customerPhone: cleanPhone,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize payment order.");
      }

      const { orderId, paymentSessionId } = orderData;
      setActiveOrderId(orderId);

      // 2. Dynamically load Cashfree JS Web SDK (client-only)
      const { load } = await import("@cashfreepayments/cashfree-js");
      const mode = (orderData.mode || process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox") as
        "sandbox" | "production";

      const cashfree = await load({ mode });

      if (!cashfree) {
        throw new Error("Unable to initialize Cashfree payment interface.");
      }

      // 3. Launch Checkout Modal
      const checkoutResult = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });

      // 4. If modal completes or redirects
      if (checkoutResult?.error) {
        console.warn("Cashfree checkout notice:", checkoutResult.error.message);
      }

      // Check payment status with our server
      await verifyOrderPayment(orderId);
    } catch (err: unknown) {
      console.error("Payment initiation error:", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred during payment setup.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    courseId,
    courseTitle,
    lessonCount,
    description,
    duration,
    cleanPhone,
    legalName,
    isNameValid,
    isPhoneValid,
    verifyOrderPayment,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Unlock Certificate"
    >
      {/* Dark frosted backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-card border-2 border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[92dvh] flex flex-col">
        {/* Header with decorative badge */}
        <div className="relative p-5 sm:p-6 border-b border-border bg-gradient-to-b from-amber-500/10 via-background to-background">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase block">
                  Official Credential Unlock
                </span>
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-foreground leading-snug">
                  Claim Verified Certificate
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              aria-label="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-3 font-body leading-relaxed">
            You completed 100% of{" "}
            <span className="font-semibold text-foreground">&ldquo;{courseTitle}&rdquo;</span>.
            Unlock your accredited, tamper-proof diploma to share on your resume and LinkedIn.
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-heading font-black text-foreground">
                  ₹29
                </span>
                <span className="text-[11px] font-mono font-medium text-muted-foreground">
                  One-time fee
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                Official Verified Certificate & Credential Issuance
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Instant Access
              </span>
              <span className="text-[11px] text-muted-foreground font-body">Lifetime Validity</span>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              What You Receive:
            </h4>
            <ul className="space-y-2 text-xs text-foreground font-body">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>
                  <strong className="font-semibold">Official Vector PDF Certificate</strong> —
                  High-resolution credential with unique verification ID and issuance seal.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>
                  <strong className="font-semibold">LinkedIn Profile Credential</strong> — Direct
                  1-click addition to your LinkedIn Licenses &amp; Certifications.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>
                  <strong className="font-semibold">Public Verification URL</strong> — Permanent web
                  verification link accessible to employers and recruiters anytime.
                </span>
              </li>
            </ul>
          </div>

          {/* Supported Payment Channels */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
              Supported Payment Methods:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-heading font-semibold text-muted-foreground">
              <span className="px-2.5 py-1 rounded-lg bg-card border border-border flex items-center gap-1.5 text-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> UPI (GPay, PhonePe, Paytm,
                Cred)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-card border border-border flex items-center gap-1.5 text-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Debit &amp; Credit Cards
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-card border border-border flex items-center gap-1.5 text-foreground">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> NetBanking
              </span>
            </div>
          </div>

          {/* Identity & Issuance Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Identity Lock &amp; Official Issuance</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
              Your accredited certificate is cryptographically sealed with this name and phone
              number.
              <strong className="text-foreground font-semibold">
                {" "}
                Once unlocked, the name cannot be changed.
              </strong>
            </p>
          </div>

          {/* Full Legal Name for Certificate */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center justify-between">
              <label
                htmlFor="recipient-legal-name"
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
              >
                <span>Full Legal Name</span>
                <span className="text-amber-500">*</span>
              </label>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-bold">
                Printed on Certificate
              </span>
            </div>
            <input
              id="recipient-legal-name"
              type="text"
              value={legalName}
              onChange={(e) => {
                setLegalName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Channabasav Bhimappa B Patil"
              className={`w-full px-3.5 py-2.5 text-xs font-heading font-medium rounded-xl bg-card border ${
                legalName.trim().length > 0 && !isNameValid
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-primary"
              } focus:outline-none text-foreground shadow-sm`}
              required
            />
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground font-body">
                Enter your complete legal name as on your Govt ID / Degree.
              </span>
              {legalName.trim().length >= 2 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  ✓ Ready
                </span>
              ) : (
                <span className="text-amber-500 font-mono font-medium">Required (min 2 chars)</span>
              )}
            </div>
          </div>

          {/* 10-Digit Mobile Number (Mandatory) */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center justify-between">
              <label
                htmlFor="payment-phone"
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
              >
                <span>10-Digit Mobile Number</span>
                <span className="text-amber-500">*</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">SMS / UPI Receipt</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-mono font-semibold text-muted-foreground select-none">
                +91
              </span>
              <input
                id="payment-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  setPhoneNumber(cleaned);
                  if (validationError) setValidationError(null);
                }}
                placeholder="9876543210"
                maxLength={10}
                className={`w-full pl-11 pr-3.5 py-2.5 text-xs font-mono font-medium rounded-xl bg-card border ${
                  cleanPhone.length > 0 && !isPhoneValid
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                } focus:outline-none text-foreground tracking-wider shadow-sm`}
                required
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground font-body">
                Required for Cashfree instant payment confirmation.
              </span>
              {isPhoneValid ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  ✓ Valid 10-Digit
                </span>
              ) : (
                <span className="text-amber-500 font-mono font-medium">10 Digits (6-9 start)</span>
              )}
            </div>
          </div>

          {/* Validation Warning Notice */}
          {validationError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1 font-body">
              <p className="font-semibold">{validationError}</p>
            </div>
          )}

          {/* Server Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-2">
              <p className="font-semibold">{error}</p>
              {activeOrderId && (
                <button
                  type="button"
                  onClick={() => verifyOrderPayment(activeOrderId)}
                  disabled={verifying}
                  className="text-[11px] underline font-bold cursor-pointer hover:opacity-80"
                >
                  {verifying ? "Checking status…" : "Already paid? Click here to re-check status"}
                </button>
              )}
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={!isFormReady || loading || verifying}
              className={`w-full py-3.5 px-4 rounded-2xl font-heading font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 ${
                isFormReady && !loading && !verifying
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-white shadow-amber-500/25 cursor-pointer active:scale-[0.99]"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-70"
              }`}
            >
              {loading ? (
                <>
                  <div className="simple-loader !w-4 !h-4 !border-2 !border-white !border-t-transparent" />
                  <span>Connecting…</span>
                </>
              ) : verifying ? (
                <>
                  <div className="simple-loader !w-4 !h-4 !border-2 !border-white !border-t-transparent" />
                  <span>Verifying…</span>
                </>
              ) : (
                <>
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
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <span>Pay ₹29 · Unlock Certificate</span>
                </>
              )}
            </button>

            {/* Re-verify link if previously started */}
            {activeOrderId && !loading && (
              <button
                type="button"
                onClick={() => verifyOrderPayment(activeOrderId)}
                disabled={verifying}
                className="w-full text-center text-[11px] font-heading font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
              >
                {verifying
                  ? "Checking status…"
                  : "Already completed payment in app? Re-check payment status"}
              </button>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-mono">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>256-Bit Encrypted • Powered by Cashfree Payments (RBI Licensed)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
