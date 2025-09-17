// Finqle API Types based on PDF documentation

export interface FinqleConfig {
  apiKey: string;
  apiUrl: string;
  webhookSecret?: string;
}

// Onboarding Types
export interface FinqleMerchantOnboarding {
  merchantId: string;
  companyName?: string;
  kvkNumber?: string;
  vatNumber?: string;
  bsnNumber?: string; // For non-KVK ZZP'ers
  iban: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export interface FinqleIdentityVerification {
  merchantId: string;
  documentType: "passport" | "id-card" | "drivers-license";
  documentFront: string; // Base64 encoded image
  documentBack?: string; // Base64 encoded image
  selfie: string; // Base64 encoded image
  verified?: boolean;
  verifiedAt?: Date;
}

// Billing Request Types
export interface FinqleBillingRequest {
  debtorId: string; // Opdrachtgever ID
  projectId?: string; // Opdracht ID
  merchantId: string; // ZZP'er/Beveiliger ID
  hours: number;
  hourlyRate: number;
  expenses?: number;
  description?: string;
  periodStart: Date;
  periodEnd: Date;
  tariff?: number; // Platform service fee
}

// Invoice Types
export interface FinqleInvoice {
  id: string;
  invoiceNumber: string;
  type: "merchant" | "platform" | "debtor";
  amount: number;
  vat: number;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  paidAt?: Date;
  reference: string;
  items: FinqleInvoiceItem[];
}

export interface FinqleInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  totalAmount: number;
}

// Payment Types
export interface FinqlePayment {
  id: string;
  type: "direct_payment" | "regular_payment";
  merchantId: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: Date;
  reference: string;
  factorFee?: number; // If direct payment was chosen
}

// Credit Check Types
export interface FinqleCreditCheck {
  debtorId: string;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  directPaymentEligible: boolean;
  lastUpdated: Date;
}

// Transaction Types
export interface FinqleTransaction {
  id: string;
  type: "payment" | "invoice" | "margin" | "direct_payment" | "factor_fee";
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  reference: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

// Webhook Event Types
export interface FinqleWebhookEvent {
  id: string;
  type: FinqleWebhookEventType;
  timestamp: Date;
  data: any;
  signature?: string;
}

export enum FinqleWebhookEventType {
  // Onboarding events
  MERCHANT_ONBOARDED = "merchant.onboarded",
  MERCHANT_VERIFIED = "merchant.verified",
  MERCHANT_REJECTED = "merchant.rejected",

  // Payment events
  PAYMENT_CREATED = "payment.created",
  PAYMENT_COMPLETED = "payment.completed",
  PAYMENT_FAILED = "payment.failed",

  // Invoice events
  INVOICE_CREATED = "invoice.created",
  INVOICE_SENT = "invoice.sent",
  INVOICE_PAID = "invoice.paid",
  INVOICE_OVERDUE = "invoice.overdue",

  // Credit events
  CREDIT_UPDATED = "credit.updated",
  CREDIT_LIMIT_REACHED = "credit.limit_reached",

  // Direct payment events
  DIRECT_PAYMENT_REQUESTED = "direct_payment.requested",
  DIRECT_PAYMENT_APPROVED = "direct_payment.approved",
  DIRECT_PAYMENT_COMPLETED = "direct_payment.completed",
}

// API Response Types
export interface FinqleApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
  };
}

// Reporting Types
export interface FinqleWeeklyReport {
  weekNumber: number;
  year: number;
  totalVolume: number;
  totalTransactions: number;
  totalMerchants: number;
  directPaymentPercentage: number;
  averageTransactionValue: number;
  platformFees: number;
  factorFees: number;
}

// SaaS Fee Calculation (from PDF)
export interface FinqleSaaSFees {
  merchantFee: number; // Fee per active merchant per week
  volumeFee: number; // Percentage of weekly volume
  totalFee: number;
  breakdown: {
    activeMerchants: number;
    weekVolume: number;
    merchantTier: "0-25" | "26-250" | "251-1000" | "1001-2500" | "2501-5000" | "5001+";
    volumeTier: "0-25k" | "25k-250k" | "250k-500k" | "500k-1m" | "1m-2.5m" | "5m+";
  };
}

// Factor Fee Rates (from PDF)
export interface FinqleFactorRates {
  merchantRate: number; // 2.9% for 14 days payment term
  platformRate?: number; // Negotiable for platform margin
  paymentTermDays: 14 | 30 | 60;
}

// KYC Status
export interface FinqleKYCStatus {
  merchantId: string;
  status: "pending" | "in_review" | "approved" | "rejected" | "expired";
  documents: {
    identity: boolean;
    kvk?: boolean;
    bankAccount: boolean;
    contract: boolean;
  };
  completedAt?: Date;
  expiresAt?: Date;
  rejectionReason?: string;
}