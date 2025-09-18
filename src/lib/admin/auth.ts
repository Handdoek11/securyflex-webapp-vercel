import { env } from "@/lib/env";

/**
 * Get admin emails from environment variable
 */
export function getAdminEmails(): string[] {
  const adminEmails = env.ADMIN_EMAILS || "stef@securyflex.com,robert@securyflex.com";
  return adminEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Check if an email is an admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Validate admin tools password for dangerous actions
 */
export function validateAdminPassword(password: string): boolean {
  if (!env.ADMIN_TOOLS_PASSWORD) {
    // If no password is set, allow access in development only
    return env.NODE_ENV === "development";
  }
  return password === env.ADMIN_TOOLS_PASSWORD;
}

/**
 * Get admin dashboard stats query
 */
export const adminQueries = {
  getTotalUsers: `
    SELECT
      role,
      COUNT(*) as count,
      COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_count
    FROM "User"
    GROUP BY role
  `,

  getRecentActivity: `
    SELECT
      eventType,
      email,
      createdAt,
      ipAddress
    FROM "SecurityLog"
    ORDER BY createdAt DESC
    LIMIT 20
  `,

  getLockedAccounts: `
    SELECT
      id,
      email,
      name,
      lockedUntil,
      failedLoginAttempts
    FROM "User"
    WHERE lockedUntil > NOW()
  `,

  getMonthlyRevenue: `
    SELECT
      SUM(totaalBedrag) as total
    FROM "VerzamelFactuur"
    WHERE
      createdAt >= date_trunc('month', CURRENT_DATE)
      AND status IN ('PAID', 'PENDING')
  `,

  getActiveOpdrachten: `
    SELECT
      status,
      COUNT(*) as count
    FROM "Opdracht"
    WHERE status IN ('OPEN', 'TOEGEWEZEN', 'BEZIG')
    GROUP BY status
  `,
};

/**
 * Format number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Export users to CSV format
 */
export function usersToCSV(users: any[]): string {
  const headers = ["ID", "Email", "Name", "Role", "Status", "Created", "Verified"];
  const rows = users.map(user => [
    user.id,
    user.email,
    user.name,
    user.role,
    user.status,
    new Date(user.createdAt).toLocaleDateString("nl-NL"),
    user.emailVerified ? "Yes" : "No",
  ]);

  return [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
}

/**
 * Export transactions to CSV format
 */
export function transactionsToCSV(transactions: any[]): string {
  const headers = ["ID", "Date", "Amount", "Status", "Type", "User"];
  const rows = transactions.map(tx => [
    tx.id,
    new Date(tx.createdAt).toLocaleDateString("nl-NL"),
    tx.bedrag,
    tx.status,
    tx.type,
    tx.userId || "N/A",
  ]);

  return [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
}