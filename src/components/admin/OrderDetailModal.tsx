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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Calendar,
  CreditCard,
  ShoppingBag,
  Printer,
  Copy,
  Check,
  Package,
  Clock,
  Sparkles,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  statusList = [],
  statusStyles = {},
}) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const orderNo =
    order.orderNumber ||
    `#ORD-${(order._id || "").toString().slice(-6).toUpperCase()}`;

  const items = order.items || order.products || [];
  const customer = order.customer || {};
  const pricing = order.pricing || {};
  const payment = order.payment || {};

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderNo);
    setCopied(true);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print invoice");
      return;
    }

    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "N/A";

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
          ${
            item.variant
              ? `<div style="font-size: 12px; color: #666;">${item.variant.weight || ""}${item.variant.unit || ""}</div>`
              : ""
          }
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${(item.price || 0).toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">৳${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
      </tr>
    `
      )
      .join("");

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${orderNo}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e11d48; padding-bottom: 20px; margin-bottom: 25px; }
            .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
            .invoice-title { font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .details-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .box { background: #f9fafb; padding: 15px; border-radius: 8px; width: 48%; }
            .box h3 { margin-top: 0; font-size: 14px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .box p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 13px; text-transform: uppercase; }
            .summary { width: 300px; margin-left: auto; background: #f9fafb; padding: 15px; border-radius: 8px; }
            .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
            .summary-row.total { font-weight: bold; font-size: 16px; border-top: 2px solid #1a1a1a; padding-top: 8px; margin-top: 5px; color: #e11d48; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Cherry Glow</div>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: #666;">Premium Beauty & Skincare</p>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">INVOICE</div>
              <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">${orderNo}</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">Date: ${formattedDate}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="box">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> ${customer.name || "N/A"}</p>
              <p><strong>Phone:</strong> ${customer.phone || "N/A"}</p>
              <p><strong>Email:</strong> ${customer.email || "N/A"}</p>
            </div>
            <div class="box">
              <h3>Shipping Address</h3>
              <p><strong>Address:</strong> ${customer.address || customer.streetAddress || "N/A"}</p>
              ${customer.thana || customer.district ? `<p><strong>Area:</strong> ${[customer.thana, customer.district].filter(Boolean).join(", ")}</p>` : ""}
              <p><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: bold;">${order.status}</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>৳${(pricing.subtotal || 0).toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Shipping Fee:</span>
              <span>৳${(pricing.shippingCost ?? pricing.shipping ?? 0).toLocaleString()}</span>
            </div>
            ${
              pricing.discount
                ? `
            <div class="summary-row" style="color: #16a34a;">
              <span>Discount:</span>
              <span>-৳${pricing.discount.toLocaleString()}</span>
            </div>
            `
                : ""
            }
            <div class="summary-row total">
              <span>Total Payable:</span>
              <span>৳${(pricing.total || 0).toLocaleString()}</span>
            </div>
            <div class="summary-row" style="font-size: 12px; color: #666; margin-top: 8px;">
              <span>Payment Method:</span>
              <span>${payment.method || "Cash On Delivery"}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Cherry Glow!</p>
            <p>For support, contact us at support@cherryglow.com</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] text-stone-800 dark:text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800/80 relative">
          <div className="flex flex-wrap items-center justify-between gap-4 pr-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-stone-900 text-white dark:bg-stone-800 dark:text-stone-100">
                  {orderNo}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-md hover:bg-stone-200 dark:hover:bg-white/10 text-stone-500 dark:text-stone-400 transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "N/A"}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold mt-2 text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Order Details
                {order.source === "admin" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                    Admin Created
                  </span>
                )}
              </DialogTitle>
            </div>

            {/* Actions: Print & Quick Status Changer */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-800 bg-white dark:bg-[#0d0709] text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all shadow-xs"
              >
                <Printer className="h-4 w-4 text-rose-500" />
                Print Invoice
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500 dark:text-rose-300/70">
                  Status:
                </span>
                <Select
                  value={order.status}
                  onValueChange={(val) => onUpdateStatus(order._id, val)}
                >
                  <SelectTrigger className="h-8 border-stone-300 dark:border-rose-800/60 rounded-xl px-2.5 text-xs bg-white dark:bg-rose-950">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        statusStyles[order.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {statusList.map((s) => (
                      <SelectItem key={s} value={s}>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
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
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Customer & Address Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-rose-900/40 bg-stone-50/70 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm border-b border-stone-200 dark:border-rose-900/40 pb-2">
                <User className="h-4 w-4" /> Customer Information
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-stone-900 dark:text-rose-100">
                  {customer.name || "Guest Customer"}
                </p>

                {customer.phone && (
                  <p className="flex items-center gap-2 text-stone-600 dark:text-rose-200/80">
                    <Phone className="h-3.5 w-3.5 text-stone-400" />
                    <a
                      href={`tel:${customer.phone}`}
                      className="hover:underline text-rose-600 dark:text-rose-300 font-medium"
                    >
                      {customer.phone}
                    </a>
                  </p>
                )}

                {customer.email && (
                  <p className="flex items-center gap-2 text-stone-600 dark:text-rose-200/80">
                    <Mail className="h-3.5 w-3.5 text-stone-400" />
                    {customer.email}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-rose-900/40 bg-stone-50/70 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm border-b border-stone-200 dark:border-rose-900/40 pb-2">
                <MapPin className="h-4 w-4" /> Shipping & Delivery
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="text-stone-700 dark:text-rose-200">
                  {customer.address || customer.streetAddress || "No address provided"}
                </p>
                {(customer.thana || customer.district) && (
                  <p className="text-xs text-stone-500 dark:text-rose-300/70 font-medium">
                    {[customer.thana, customer.district].filter(Boolean).join(", ")}
                  </p>
                )}
                {customer.note && (
                  <div className="mt-2 text-xs p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                    <strong className="block font-semibold">Note:</strong> {customer.note}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-rose-100 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-rose-500" /> Ordered Items ({items.length})
            </h4>

            <div className="border border-stone-200 dark:border-rose-900/40 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 dark:bg-rose-950/60 text-stone-600 dark:text-rose-200/70 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-rose-900/30">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-rose-900/20">
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-900 dark:text-rose-100">
                          {item.name}
                        </div>
                        {item.variant && (
                          <span className="text-xs text-stone-500 dark:text-rose-300/70">
                            Variant: {item.variant.weight} {item.variant.unit}
                          </span>
                        )}
                        {item.brand && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-stone-200 dark:bg-rose-900/50 text-stone-600 dark:text-rose-300">
                            {item.brand}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-stone-700 dark:text-rose-200">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-stone-600 dark:text-rose-300">
                        ৳ {(item.price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-stone-900 dark:text-rose-100">
                        ৳ {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Payment Details */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-rose-900/40 bg-stone-50/70 dark:bg-rose-950/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700 dark:text-rose-200 font-semibold text-sm pb-1 border-b border-stone-200 dark:border-rose-900/40">
                <CreditCard className="h-4 w-4 text-rose-500" /> Payment Summary
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500 dark:text-rose-300/70">Payment Method:</span>
                <span className="font-semibold text-stone-800 dark:text-rose-100">
                  {payment.method || "Cash On Delivery"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500 dark:text-rose-300/70">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                    payment.status === "paid"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : payment.status === "failed"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {payment.status || "Pending"}
                </span>
              </div>
              {payment.transactionId && (
                <div className="flex justify-between py-1 border-t border-stone-200 dark:border-rose-900/40 pt-1.5">
                  <span className="text-stone-500 dark:text-rose-300/70">Trx ID:</span>
                  <span className="font-mono font-medium text-stone-700 dark:text-rose-200">
                    {payment.transactionId}
                  </span>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/40 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600 dark:text-rose-200/80">
                <span>Subtotal</span>
                <span>৳ {(pricing.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-rose-200/80">
                <span>Shipping Cost</span>
                <span>৳ {(pricing.shippingCost ?? pricing.shipping ?? 0).toLocaleString()}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>- ৳ {pricing.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-rose-200 dark:border-rose-900/60 pt-2 flex justify-between font-bold text-lg text-rose-600 dark:text-rose-400">
                <span>Total</span>
                <span>৳ {(pricing.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
