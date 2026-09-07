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
  ShieldAlert,
  ShieldCheck,
  Phone,
  User,
  ShoppingBag,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { CustomerRiskInfo } from "@/lib/phoneUtils";

export default function FlagCustomerModal({
  isOpen,
  onClose,
  customerName,
  phone,
  riskInfo,
  onStatusChanged,
}: {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  phone: string;
  riskInfo?: CustomerRiskInfo;
  onStatusChanged?: () => void;
}) {
  const [status, setStatus] = useState<"flagged" | "blacklisted" | "normal">(
    riskInfo?.isBlacklisted ? "blacklisted" : riskInfo?.isFlagged ? "flagged" : "flagged"
  );
  const [reason, setReason] = useState(riskInfo?.flagReason || "Repeated fake / cancelled orders");
  const [notes, setNotes] = useState(riskInfo?.flagNotes || "");
  const [submitting, setSubmitting] = useState(false);

  if (!phone) return null;

  const handleSaveFlag = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = `${process.env.NEXT_PUBLIC_API_URL}/orders/flag-customer`;

      await axios.post(
        API,
        {
          phone,
          customerName: customerName || "Customer",
          status,
          reason,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Customer ${phone} marked as ${status.toUpperCase()}`);
      onStatusChanged?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update flag status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFlag = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = `${process.env.NEXT_PUBLIC_API_URL}/orders/flag-customer/${encodeURIComponent(phone)}`;

      await axios.delete(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Flag removed for ${phone}. Customer restored to normal standing.`);
      onStatusChanged?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to remove flag");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 rounded-2xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161113] text-stone-900 dark:text-stone-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Customer Risk & Flag Management
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                {customerName || "Customer"} • {phone}
              </DialogDescription>
            </div>
          </div>

          {/* Aggregated Risk Stats Card */}
          {riskInfo && (
            <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800/60">
                <span className="text-[10px] text-stone-400 block">Total Orders</span>
                <span className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                  {riskInfo.totalOrders}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                <span className="text-[10px] text-rose-500/70 block">Cancelled</span>
                <span className="font-bold text-sm">{riskInfo.cancelledOrders}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <span className="text-[10px] text-emerald-500/70 block">Delivered</span>
                <span className="font-bold text-sm">{riskInfo.deliveredOrders}</span>
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Status Level Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Select Standing / Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("flagged")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  status === "flagged"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200"
                    : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Watchlist
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                  Customer can checkout. Admin receives warning badge to phone-verify before dispatch.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatus("blacklisted")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  status === "blacklisted"
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200"
                    : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" /> Blacklisted
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                  COD is blocked at checkout for this phone. Requires online payment.
                </p>
              </button>
            </div>
          </div>

          {/* Flag Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Reason for Flag
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] focus:border-rose-500 focus:outline-none"
            >
              <option value="Repeated fake / cancelled orders">Repeated fake / cancelled orders</option>
              <option value="Fake / Prank COD order placed">Fake / Prank COD order placed</option>
              <option value="Courier returned - phone switched off">Courier returned - phone switched off</option>
              <option value="Customer refused delivery without reason">Customer refused delivery without reason</option>
              <option value="Abusive or fraudulent behavior">Abusive or fraudulent behavior</option>
              <option value="Other / Manual flag">Other / Manual flag</option>
            </select>
          </div>

          {/* Admin Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex justify-between">
              <span>Admin Notes</span>
              <span className="text-[10px] font-normal text-stone-400">Internal only</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Courier reported customer gave fake address twice..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] focus:border-rose-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            {/* Remove Flag / Restore Customer Button */}
            {(riskInfo?.isFlagged || riskInfo?.isBlacklisted) ? (
              <button
                type="button"
                onClick={handleRemoveFlag}
                disabled={submitting}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer disabled:opacity-50"
                title="Remove flag and restore customer to normal clean standing"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove Flag / Unblacklist
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFlag}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Flag Status"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
