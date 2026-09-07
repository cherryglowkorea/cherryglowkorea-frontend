import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Clock, FileText, Lock, HelpCircle, ChevronRight, CheckCircle2 } from "lucide-react";

// Rendering Strategy: ISR (revalidate: 86400s / 24h) — Pre-renders shipping policy.
export const revalidate = 86400;

export const metadata = {
  title: "Shipping & Return Policy | Cherry Glow Korea",
  description: "Learn about Cherry Glow Korea shipping charges, delivery timelines, and 7-day easy return policy.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="relative min-h-screen bg-stone-50/50 dark:bg-[#160d10] text-stone-800 dark:text-rose-100 overflow-hidden">
      {/* Ambient Background Blur Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-pink-300/15 dark:bg-rose-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-rose-200/15 dark:bg-pink-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <section className="border-b border-rose-100/60 dark:border-white/5 bg-gradient-to-b from-rose-50/80 via-white to-stone-50/50 dark:from-[#211418] dark:via-[#1a0f13] dark:to-[#160d10] py-12 md:py-16 text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              <Truck className="w-3.5 h-3.5" /> Delivery & Returns Guide
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-900 dark:text-white">
              Shipping & Return Policy
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 max-w-xl mx-auto">
              Fast nationwide delivery across Bangladesh & 7-day hassle-free replacements.
            </p>
          </div>
        </section>

        {/* 2-Column Amazon Style Layout */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid lg:grid-cols-12 gap-8">

            {/* Left Sidebar Index */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-[#1e1215] p-4 rounded-2xl border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-2 sticky top-24">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 px-2">
                  Legal Directory
                </h3>
                <div className="space-y-1 text-xs font-medium">
                  <Link
                    href="/shipping"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5" /> Shipping & Returns
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/privacy-policy"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-stone-600 dark:text-rose-100/70 hover:bg-rose-50 dark:hover:bg-white/5 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> Privacy Policy
                    </span>
                  </Link>

                  <Link
                    href="/terms"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-stone-600 dark:text-rose-100/70 hover:bg-rose-50 dark:hover:bg-white/5 transition"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Terms & Conditions
                    </span>
                  </Link>

                  <Link
                    href="/faq"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-stone-600 dark:text-rose-100/70 hover:bg-rose-50 dark:hover:bg-white/5 transition"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5" /> Help & FAQ
                    </span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Main Policy Content */}
            <main className="lg:col-span-9 space-y-6">
              <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-8">
                
                {/* Intro Callout */}
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-rose-500 space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">
                    Fast Delivery & Free Shipping Threshold
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-rose-100/80 leading-relaxed">
                    We deliver to all 64 districts in Bangladesh! Enjoy <strong>FREE Shipping</strong> on all orders over ৳2,000.
                  </p>
                </div>

                {/* Section 1: Delivery Table */}
                <section className="space-y-4">
                  <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 text-xs flex items-center justify-center font-bold">1</span>
                    Shipping Rates & Timeline
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-stone-200 dark:border-white/10 rounded-xl overflow-hidden">
                      <thead className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-4 py-3 border-b border-stone-200 dark:border-white/10">Location</th>
                          <th className="px-4 py-3 border-b border-stone-200 dark:border-white/10">Delivery Time</th>
                          <th className="px-4 py-3 border-b border-stone-200 dark:border-white/10">Shipping Charge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-white/5 text-stone-700 dark:text-rose-100">
                        <tr>
                          <td className="px-4 py-3 font-semibold">Dhaka City</td>
                          <td className="px-4 py-3">1 – 2 Business Days</td>
                          <td className="px-4 py-3 font-bold text-pink-600">৳70 (FREE over ৳2,000)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold">Outside Dhaka (All BD)</td>
                          <td className="px-4 py-3">2 – 4 Business Days</td>
                          <td className="px-4 py-3 font-bold text-pink-600">৳130 (FREE over ৳2,000)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Section 2: Returns */}
                <section className="space-y-3 pt-4 border-t border-stone-100 dark:border-white/5">
                  <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 text-xs flex items-center justify-center font-bold">2</span>
                    7-Day Easy Return & Exchange
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 leading-relaxed">
                    If you receive a damaged, defective, or incorrect product, contact our support team within 7 days of delivery for an immediate replacement or refund.
                  </p>
                </section>

              </div>
            </main>

          </div>
        </div>
      </div>
    </main>
  );
}
