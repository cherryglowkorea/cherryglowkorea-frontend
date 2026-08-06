"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import OrderDetailModal from "./OrderDetailModal";

export default function OrdersMobile({
  orders,
  loading,
  onUpdateStatus,
  status,
  statusStyles,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (e, orderNo) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNo);
    setCopiedId(orderNo);
    toast.success("Order ID copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCustomerInitial = (name) => {
    if (!name) return "G";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="grid gap-3.5 sm:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-stone-400 dark:text-rose-300/60 bg-white dark:bg-[#180f14] rounded-2xl border border-stone-200 dark:border-rose-900/40 p-6">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-stone-300 dark:text-rose-950" />
            <p className="font-semibold text-base">No orders found</p>
            <p className="text-xs mt-1">Try adjusting search or status filter.</p>
          </div>
        ) : (
          orders.map((o) => {
            const orderNo =
              o.orderNumber ||
              `#ORD-${(o._id || "").toString().slice(-6).toUpperCase()}`;
            const items = o.items || o.products || [];
            const customer = o.customer || {};
            const pricing = o.pricing || {};
            const payment = o.payment || {};

            return (
              <Card
                key={o._id}
                onClick={() => setSelectedOrder(o)}
                className="p-4 rounded-2xl border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] text-stone-800 dark:text-rose-100 shadow-xs hover:shadow-md transition-all space-y-3 cursor-pointer relative overflow-hidden"
              >
                {/* Top Row: Order ID & Date */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-900/30 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-rose-950 text-stone-900 dark:text-rose-100 border border-stone-200 dark:border-rose-900/50">
                      {orderNo}
                    </span>
                    <button
                      onClick={(e) => handleCopyId(e, orderNo)}
                      className="p-1 rounded hover:bg-stone-100 dark:hover:bg-rose-900/60 text-stone-400"
                    >
                      {copiedId === orderNo ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] text-stone-400 dark:text-rose-300/60 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>

                {/* Main Section: Customer & Total */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {getCustomerInitial(customer.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-rose-100">
                        {customer.name || "Guest"}
                      </h4>
                      {customer.phone && (
                        <a
                          href={`tel:${customer.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-mono hover:underline mt-0.5"
                        >
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-base text-stone-900 dark:text-rose-100">
                      ৳ {(pricing.total || 0).toLocaleString()}
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-rose-950 text-stone-600 dark:text-rose-300">
                      {payment.method || "COD"}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-stone-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-stone-100 dark:border-rose-900/30 flex items-center justify-between text-xs">
                  <div className="truncate pr-2 text-stone-600 dark:text-rose-200/80">
                    <span className="font-semibold text-stone-800 dark:text-rose-100">
                      {items.length} {items.length === 1 ? "item" : "items"}:
                    </span>{" "}
                    {items[0]?.name || "N/A"}
                    {items.length > 1 && ` +${items.length - 1} more`}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(o);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 shrink-0 hover:underline"
                  >
                    Details <Eye className="h-3 w-3" />
                  </button>
                </div>

                {/* Bottom Row: Status Dropdown */}
                <div
                  className="flex items-center justify-between pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs font-medium text-stone-500 dark:text-rose-300/70">
                    Status:
                  </span>
                  <Select
                    value={o.status}
                    onValueChange={(v) => onUpdateStatus(o._id, v)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 rounded-xl">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          statusStyles[o.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {status?.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              statusStyles[s] || ""
                            }`}
                          >
                            {s}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={onUpdateStatus}
          statusList={status}
          statusStyles={statusStyles}
        />
      )}
    </>
  );
}
