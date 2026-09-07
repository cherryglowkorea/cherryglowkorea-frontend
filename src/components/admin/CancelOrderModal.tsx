"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  XCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export const CANCELLATION_REASONS = [
  { id: "customer_changed_mind", label: "Customer changed mind", bn: "কাস্টমার মত পরিবর্তন করেছে" },
  { id: "fake_order", label: "Fake / Prank order", bn: "ভুয়া / ফেক অর্ডার" },
  { id: "not_reachable", label: "Customer not reachable / Phone switched off", bn: "ফোন ধরে না / বন্ধ" },
  { id: "out_of_stock", label: "Out of stock", bn: "স্টক শেষ" },
  { id: "duplicate_order", label: "Duplicate order", bn: "ডুপ্লিকেট অর্ডার" },
  { id: "wrong_address", label: "Wrong address / Delivery area issue", bn: "ভুল ঠিকানা / ডেলিভারি সমস্যা" },
  { id: "other", label: "Other reason", bn: "অন্যান্য কারণ" },
];

export default function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState("customer_changed_mind");
  const [customReason, setCustomReason] = useState("");
  const [note, setNote] = useState("");
  const [flagCustomer, setFlagCustomer] = useState(false);
  const [flagStatus, setFlagStatus] = useState<"flagged" | "blacklisted">("flagged");
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const orderNo =
    order.orderNumber ||
    `#ORD-${(order._id || "").toString().slice(-6).toUpperCase()}`;
  const customerName = order.customer?.name || "Guest";
  const customerPhone = order.customer?.phone || "N/A";

  const handleReasonChange = (selectedId: string) => {
    setReason(selectedId);
    // Automatically check flag option if selecting "fake_order"
    if (selectedId === "fake_order") {
      setFlagCustomer(true);
      setFlagStatus("blacklisted");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const selectedPreset = CANCELLATION_REASONS.find((r) => r.id === reason);
    const finalReason =
      reason === "other"
        ? (customReason.trim() || "Other reason")
        : (selectedPreset?.label || "Cancelled by admin");

    try {
      const token = localStorage.getItem("token");
      const API = `${process.env.NEXT_PUBLIC_API_URL}/orders/updateStatus/${order._id}`;

      await axios.patch(
        API,
        {
          status: "cancelled",
          cancellationReason: finalReason,
          cancellationNote: note.trim(),
          flagCustomer,
          flagStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Order ${orderNo} moved to Cancelled tab`);
      if (flagCustomer) {
        toast.info(
          `Customer phone ${customerPhone} marked as ${flagStatus.toUpperCase()}`
        );
      }

      onSuccess?.(order._id, finalReason, note.trim(), flagCustomer ? flagStatus : null);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 rounded-2xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161113] text-stone-900 dark:text-stone-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800/80 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Cancel Order {orderNo}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Customer: <strong>{customerName}</strong> ({customerPhone})
              </DialogDescription>
            </div>
          </div>

          {/* Zero Data Loss Education Banner */}
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong>Order will be preserved:</strong> Moving to the <em>Cancelled</em> tab keeps your sales history, analytics, and customer audit record safe.
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Select Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {CANCELLATION_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    reason === r.id
                      ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 font-semibold text-rose-700 dark:text-rose-300 shadow-2xs"
                      : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={() => handleReasonChange(r.id)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{r.label}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {r.bn}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Input if "other" is selected */}
          {reason === "other" && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Specify Reason
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Customer requested delay, wrong size..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Admin Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span>Admin Note (Internal Audit)</span>
              <span className="text-[10px] font-normal text-stone-400">Optional</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Called customer at 3:30 PM, customer said they ordered by mistake."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] focus:border-rose-500 focus:outline-none resize-none"
            />
          </div>

          {/* Customer Risk & Flagging Option */}
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800 dark:text-stone-200">
              <input
                type="checkbox"
                checked={flagCustomer}
                onChange={(e) => setFlagCustomer(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                Flag or Blacklist this Customer Phone ({customerPhone})
              </span>
            </label>

            {flagCustomer && (
              <div className="pl-6 space-y-2 pt-1 border-t border-stone-200 dark:border-stone-800 animate-fadeIn">
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="flag_type"
                      checked={flagStatus === "flagged"}
                      onChange={() => setFlagStatus("flagged")}
                      className="text-amber-600"
                    />
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      ⚠️ Watchlist (Alert admin only)
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="flag_type"
                      checked={flagStatus === "blacklisted"}
                      onChange={() => setFlagStatus("blacklisted")}
                      className="text-rose-600"
                    />
                    <span className="font-medium text-rose-700 dark:text-rose-400">
                      🚨 Blacklist (Disable COD)
                    </span>
                  </label>
                </div>
                <p className="text-[10px] text-stone-500">
                  {flagStatus === "blacklisted"
                    ? "Customer will not be allowed to place Cash on Delivery orders at checkout."
                    : "Customer can place orders, but admin will be alerted to verify before dispatch."}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              Keep Active
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
