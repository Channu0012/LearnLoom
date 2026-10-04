declare module "@cashfreepayments/cashfree-js" {
  export interface CashfreeInstance {
    checkout(_options: {
      paymentSessionId: string;
      redirectTarget?: "_modal" | "_self" | "_blank" | "_top" | HTMLElement;
      returnUrl?: string;
    }): Promise<{
      error?: { message: string };
      redirect?: boolean;
      paymentDetails?: unknown;
    }>;
  }

  export function load(_options: { mode: "sandbox" | "production" }): Promise<CashfreeInstance>;
}
