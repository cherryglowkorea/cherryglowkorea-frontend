/**
 * Utility functions for Phone Normalization and Customer Risk Intelligence
 */

export function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";
  let clean = rawPhone.toString().replace(/\D/g, "");
  if (clean.startsWith("880")) clean = clean.slice(2);
  if (clean.startsWith("88")) clean = clean.slice(2);
  if (clean.length === 10 && clean.startsWith("1")) clean = "0" + clean;
  return clean;
}

export interface CustomerRiskInfo {
  status: "blacklisted" | "flagged" | "high-risk" | "normal";
  badgeText: string;
  badgeClass: string;
  isBlacklisted: boolean;
  isFlagged: boolean;
  isHighRisk: boolean;
  totalOrders: number;
  cancelledOrders: number;
  fakeOrders: number;
  deliveredOrders: number;
  cancellationRate: number;
  flagReason?: string;
  flagNotes?: string;
}

export function evaluateCustomerRisk(
  rawPhone: string | undefined,
  phoneStatsMap: Record<string, any> = {},
  flaggedCustomersMap: Record<string, any> = {}
): CustomerRiskInfo {
  const norm = normalizePhone(rawPhone);
  const stats = (norm && phoneStatsMap[norm]) || {
    totalOrders: 0,
    cancelledOrders: 0,
    fakeOrders: 0,
    deliveredOrders: 0,
    cancellationRate: 0,
  };
  const flagRecord = norm ? flaggedCustomersMap[norm] : null;

  // Level 1: Explicitly Blacklisted
  if (flagRecord && flagRecord.status === "blacklisted") {
    return {
      status: "blacklisted",
      badgeText: "Blacklisted",
      badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800",
      isBlacklisted: true,
      isFlagged: true,
      isHighRisk: true,
      totalOrders: stats.totalOrders,
      cancelledOrders: stats.cancelledOrders,
      fakeOrders: stats.fakeOrders,
      deliveredOrders: stats.deliveredOrders,
      cancellationRate: stats.cancellationRate,
      flagReason: flagRecord.reason,
      flagNotes: flagRecord.notes,
    };
  }

  // Level 2: Explicitly Flagged / Watchlist
  if (flagRecord && flagRecord.status === "flagged") {
    return {
      status: "flagged",
      badgeText: "Watchlist",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      isBlacklisted: false,
      isFlagged: true,
      isHighRisk: true,
      totalOrders: stats.totalOrders,
      cancelledOrders: stats.cancelledOrders,
      fakeOrders: stats.fakeOrders,
      deliveredOrders: stats.deliveredOrders,
      cancellationRate: stats.cancellationRate,
      flagReason: flagRecord.reason,
      flagNotes: flagRecord.notes,
    };
  }

  // Level 3: Automatic High-Risk from MongoDB Aggregation (Fake orders or 2+ cancellations)
  if (stats.fakeOrders > 0) {
    return {
      status: "high-risk",
      badgeText: `Fake Order Risk (${stats.fakeOrders})`,
      badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800",
      isBlacklisted: false,
      isFlagged: false,
      isHighRisk: true,
      totalOrders: stats.totalOrders,
      cancelledOrders: stats.cancelledOrders,
      fakeOrders: stats.fakeOrders,
      deliveredOrders: stats.deliveredOrders,
      cancellationRate: stats.cancellationRate,
      flagReason: "Automated alert: Customer has prior orders marked as fake/prank",
    };
  }

  if (stats.cancelledOrders >= 2 && stats.cancellationRate >= 50) {
    return {
      status: "high-risk",
      badgeText: `High Cancellation (${stats.cancelledOrders})`,
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      isBlacklisted: false,
      isFlagged: false,
      isHighRisk: true,
      totalOrders: stats.totalOrders,
      cancelledOrders: stats.cancelledOrders,
      fakeOrders: stats.fakeOrders,
      deliveredOrders: stats.deliveredOrders,
      cancellationRate: stats.cancellationRate,
      flagReason: `High cancellation rate (${stats.cancellationRate}%) across ${stats.totalOrders} orders`,
    };
  }

  // Clean / Normal
  return {
    status: "normal",
    badgeText: stats.deliveredOrders >= 3 ? ` Verified (${stats.deliveredOrders})` : "",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    isBlacklisted: false,
    isFlagged: false,
    isHighRisk: false,
    totalOrders: stats.totalOrders,
    cancelledOrders: stats.cancelledOrders,
    fakeOrders: stats.fakeOrders,
    deliveredOrders: stats.deliveredOrders,
    cancellationRate: stats.cancellationRate,
  };
}
