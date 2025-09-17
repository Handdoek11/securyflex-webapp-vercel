// Finqle API Client

import {
  FinqleConfig,
  FinqleMerchantOnboarding,
  FinqleIdentityVerification,
  FinqleBillingRequest,
  FinqleInvoice,
  FinqlePayment,
  FinqleCreditCheck,
  FinqleTransaction,
  FinqleApiResponse,
  FinqleWeeklyReport,
  FinqleSaaSFees,
  FinqleKYCStatus
} from "./types";

export class FinqleClient {
  private config: FinqleConfig;

  constructor(config: FinqleConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<FinqleApiResponse<T>> {
    const url = `${this.config.apiUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || "UNKNOWN_ERROR",
            message: data.message || "An error occurred",
            details: data.details,
          },
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  }

  // Merchant Onboarding
  async onboardMerchant(
    merchantData: FinqleMerchantOnboarding
  ): Promise<FinqleApiResponse<{ merchantId: string; onboardingUrl: string }>> {
    return this.request("/merchants/onboard", {
      method: "POST",
      body: JSON.stringify(merchantData),
    });
  }

  async verifyIdentity(
    verificationData: FinqleIdentityVerification
  ): Promise<FinqleApiResponse<{ verified: boolean }>> {
    return this.request("/merchants/verify", {
      method: "POST",
      body: JSON.stringify(verificationData),
    });
  }

  async getMerchantKYCStatus(
    merchantId: string
  ): Promise<FinqleApiResponse<FinqleKYCStatus>> {
    return this.request(`/merchants/${merchantId}/kyc-status`);
  }

  // Billing Requests
  async createBillingRequest(
    request: FinqleBillingRequest
  ): Promise<FinqleApiResponse<{ requestId: string; status: string }>> {
    return this.request("/billing/request", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async approveBillingRequest(
    requestId: string,
    approved: boolean = true
  ): Promise<FinqleApiResponse<{ status: string }>> {
    return this.request(`/billing/request/${requestId}/approve`, {
      method: "POST",
      body: JSON.stringify({ approved }),
    });
  }

  // Credit Management
  async checkCredit(
    debtorId: string,
    amount?: number
  ): Promise<FinqleApiResponse<FinqleCreditCheck>> {
    const params = amount ? `?amount=${amount}` : "";
    return this.request(`/credit/check/${debtorId}${params}`);
  }

  async requestDirectPayment(
    merchantId: string,
    amount: number,
    billingRequestId: string
  ): Promise<FinqleApiResponse<{ approved: boolean; paymentId?: string }>> {
    return this.request("/payments/direct", {
      method: "POST",
      body: JSON.stringify({
        merchantId,
        amount,
        billingRequestId,
      }),
    });
  }

  // Invoice Management
  async getInvoice(invoiceId: string): Promise<FinqleApiResponse<FinqleInvoice>> {
    return this.request(`/invoices/${invoiceId}`);
  }

  async listInvoices(
    filters?: {
      status?: string;
      type?: string;
      from?: Date;
      to?: Date;
    }
  ): Promise<FinqleApiResponse<FinqleInvoice[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return this.request(`/invoices?${params.toString()}`);
  }

  // Payment Status
  async getPayment(paymentId: string): Promise<FinqleApiResponse<FinqlePayment>> {
    return this.request(`/payments/${paymentId}`);
  }

  async listPayments(
    filters?: {
      merchantId?: string;
      status?: string;
      from?: Date;
      to?: Date;
    }
  ): Promise<FinqleApiResponse<FinqlePayment[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return this.request(`/payments?${params.toString()}`);
  }

  // Transaction History
  async getTransaction(
    transactionId: string
  ): Promise<FinqleApiResponse<FinqleTransaction>> {
    return this.request(`/transactions/${transactionId}`);
  }

  async listTransactions(
    filters?: {
      type?: string;
      status?: string;
      from?: Date;
      to?: Date;
      limit?: number;
    }
  ): Promise<FinqleApiResponse<FinqleTransaction[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return this.request(`/transactions?${params.toString()}`);
  }

  // Reporting
  async getWeeklyReport(
    weekNumber: number,
    year: number
  ): Promise<FinqleApiResponse<FinqleWeeklyReport>> {
    return this.request(`/reports/weekly/${year}/${weekNumber}`);
  }

  async calculateSaaSFees(
    activeMerchants: number,
    weekVolume: number
  ): Promise<FinqleApiResponse<FinqleSaaSFees>> {
    return this.request("/fees/calculate", {
      method: "POST",
      body: JSON.stringify({
        activeMerchants,
        weekVolume,
      }),
    });
  }

  // Webhook validation
  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    // Implement HMAC signature validation
    // This is a placeholder - actual implementation would use crypto
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(payload)
      .digest("hex");

    return expectedSignature === signature;
  }

  // Utility: Check if direct payment is available
  async isDirectPaymentAvailable(
    debtorId: string,
    amount: number
  ): Promise<boolean> {
    const creditCheck = await this.checkCredit(debtorId, amount);
    if (!creditCheck.success || !creditCheck.data) {
      return false;
    }
    return (
      creditCheck.data.directPaymentEligible &&
      creditCheck.data.creditAvailable >= amount
    );
  }

  // Utility: Calculate factor fee
  calculateFactorFee(amount: number, paymentTermDays: number = 14): number {
    // Based on PDF: 2.9% for 14 days
    const rates: Record<number, number> = {
      14: 0.029,
      30: 0.039,
      60: 0.049,
    };
    const rate = rates[paymentTermDays] || 0.029;
    return Math.round(amount * rate * 100) / 100;
  }
}

// Singleton instance
let finqleClient: FinqleClient | null = null;

export function getFinqleClient(): FinqleClient {
  if (!finqleClient) {
    // In production, these would come from environment variables
    finqleClient = new FinqleClient({
      apiKey: process.env.FINQLE_API_KEY || "",
      apiUrl: process.env.FINQLE_API_URL || "https://api.finqle.com/vendor/v1",
      webhookSecret: process.env.FINQLE_WEBHOOK_SECRET,
    });
  }
  return finqleClient;
}

// Helper functions for common operations
export async function checkDirectPaymentEligibility(
  debtorId: string,
  amount: number
): Promise<boolean> {
  const client = getFinqleClient();
  return client.isDirectPaymentAvailable(debtorId, amount);
}

export async function requestDirectPaymentForShift(
  merchantId: string,
  amount: number,
  billingRequestId: string
): Promise<{ approved: boolean; paymentId?: string }> {
  const client = getFinqleClient();
  const response = await client.requestDirectPayment(
    merchantId,
    amount,
    billingRequestId
  );

  if (!response.success || !response.data) {
    return { approved: false };
  }

  return response.data;
}