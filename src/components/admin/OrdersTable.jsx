"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Printer,
  Copy,
  Check,
  Phone,
  MapPin,
  ShoppingBag,
  CreditCard,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import OrderDetailModal from "./OrderDetailModal";

export default function OrdersTable({
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

  const getRandomGradient = (name = "") => {
    const gradients = [
      "from-rose-500 to-pink-600 text-white",
      "from-purple-500 to-indigo-600 text-white",
      "from-amber-500 to-orange-600 text-white",
      "from-emerald-500 to-teal-600 text-white",
      "from-sky-500 to-blue-600 text-white",
    ];
    const charCode = name.charCodeAt(0) || 0;
    return gradients[charCode % gradients.length];
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14]/90 shadow-sm backdrop-blur-md transition-all">
        <Table>
          <TableHeader className="bg-stone-50 dark:bg-rose-950/40 border-b border-stone-200 dark:border-rose-900/40">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-rose-200">
                Order ID
              </TableHead>
              <TableHead className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-rose-200">
                Customer Info
              </TableHead>
              <TableHead className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-rose-200">
                Items Summary
              </TableHead>
              <TableHead className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-rose-200">
                Total & Payment
              </TableHead>
              <TableHead className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-rose-200">
                Status
              </TableHead>
              <TableHead className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-rose-200">
                Date
              </TableHead>
              <TableHead className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-right text-stone-600 dark:text-rose-200">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-stone-100 dark:divide-rose-900/30">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="py-4 px-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-stone-400 dark:text-rose-300/60"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShoppingBag className="h-10 w-10 text-stone-300 dark:text-rose-950" />
                    <p className="font-semibold text-base">No orders found</p>
                    <p className="text-xs">Try adjusting your filters or search term.</p>
                  </div>
                </TableCell>
              </TableRow>
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
                  <TableRow
                    key={o._id}
                    className="hover:bg-rose-500/5 dark:hover:bg-rose-900/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(o)}
                  >
                    {/* Order ID */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-stone-100 dark:bg-rose-950 border border-stone-200 dark:border-rose-900/50 text-stone-900 dark:text-rose-100 group-hover:border-rose-400/50 transition-colors">
                          {orderNo}
                        </span>
                        <button
                          onClick={(e) => handleCopyId(e, orderNo)}
                          className="p-1 rounded hover:bg-stone-200 dark:hover:bg-rose-900/60 text-stone-400 hover:text-stone-700 dark:hover:text-rose-200 transition-colors"
                          title="Copy ID"
                        >
                          {copiedId === orderNo ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Customer Info */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full bg-gradient-to-tr ${getRandomGradient(
                            customer.name
                          )} flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                        >
                          {getCustomerInitial(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-stone-900 dark:text-rose-100 truncate">
                            {customer.name || "Guest"}
                          </p>
                          {customer.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-stone-500 dark:text-rose-300/70 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 font-mono transition-colors"
                            >
                              <Phone className="h-3 w-3 shrink-0" />
                              {customer.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Items Summary */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                            {items.length} {items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-rose-200/80 truncate max-w-[200px]" title={items.map((i) => i.name).join(", ")}>
                          {items[0]?.name || "N/A"}
                          {items.length > 1 && (
                            <span className="text-stone-400 dark:text-rose-300/50 font-normal">
                              {" "}
                              +{items.length - 1} more
                            </span>
                          )}
                        </p>
                      </div>
                    </TableCell>

                    {/* Total & Payment */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-stone-900 dark:text-rose-100">
                          ৳ {(pricing.total || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-rose-950 text-stone-600 dark:text-rose-300 border border-stone-200 dark:border-rose-900/40">
                            {payment.method || "COD"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                              payment.status === "paid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {payment.status || "pending"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status Dropdown */}
                    <TableCell
                      className="py-3.5 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        value={o.status}
                        onValueChange={(v) => onUpdateStatus(o._id, v)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950/80 rounded-xl hover:border-rose-400 transition-colors">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              statusStyles[o.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {o.status}
                          </span>
                        </SelectTrigger>

                        <SelectContent className="dark:bg-[#1c1218] dark:border-rose-900/60">
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
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-3.5 px-4 text-xs text-stone-500 dark:text-rose-300/70 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-stone-400" />
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950 text-stone-700 dark:text-rose-200 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-2xs"
                          title="View Order Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
