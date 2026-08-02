import Link from "next/link";
import { ShieldCheck, Lock, FileText, Truck, HelpCircle, ChevronRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Cherry Glow Korea",
  description: "Learn how Cherry Glow Korea collects, uses, and safeguards your personal information.",
};

export default function PrivacyPolicyPage() {
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
              <Lock className="w-3.5 h-3.5" /> Customer Data Protection
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 max-w-xl mx-auto">
              Last Updated: August 2026. How we protect and process your personal information.
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
                    href="/privacy-policy"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> Privacy Policy
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
                    href="/shipping"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-stone-600 dark:text-rose-100/70 hover:bg-rose-50 dark:hover:bg-white/5 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5" /> Shipping & Returns
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
                    Our Privacy Commitment
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-rose-100/80 leading-relaxed">
                    At Cherry Glow Korea, we respect your privacy and are committed to safeguarding your personal data. We never sell or share your personal details to unverified third parties.
                  </p>
                </div>

                {/* Section 1 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 text-xs flex items-center justify-center font-bold">1</span>
                    Information We Collect
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 leading-relaxed">
                    We collect personal information necessary to fulfill your skincare orders, provide customer support, and enhance your shopping experience:
                  </p>
                  <ul className="space-y-2 text-xs text-stone-600 dark:text-rose-100/80 pl-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                      <span><strong>Contact Details:</strong> Your full name, delivery address, email address, and phone number.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                      <span><strong>Order & Transaction Info:</strong> Products purchased, payment method (bKash/Nagad transaction IDs, Cash on Delivery status).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                      <span><strong>Technical Data:</strong> IP address, browser type, and device information gathered strictly for security and website optimization.</span>
                    </li>
                  </ul>
                </section>

                {/* Section 2 */}
                <section className="space-y-3 pt-4 border-t border-stone-100 dark:border-white/5">
                  <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 text-xs flex items-center justify-center font-bold">2</span>
                    How We Use Your Information
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 leading-relaxed">
                    Your personal information is processed strictly for legitimate business purposes:
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/50 dark:border-white/5">
                      <h4 className="font-bold text-stone-800 dark:text-rose-100 mb-0.5">Order Fulfillment</h4>
                      <p className="text-[11px] text-stone-500 dark:text-rose-100/60">Processing, shipping, and delivering your cosmetics orders safely.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/50 dark:border-white/5">
                      <h4 className="font-bold text-stone-800 dark:text-rose-100 mb-0.5">Customer Support</h4>
                      <p className="text-[11px] text-stone-500 dark:text-rose-100/60">Responding to inquiries, tracking packages, and handling replacements.</p>
                    </div>
                  </ul>
                </section>

                {/* Section 3 */}
                <section className="space-y-3 pt-4 border-t border-stone-100 dark:border-white/5">
                  <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 text-xs flex items-center justify-center font-bold">3</span>
                    Data Security & Storage
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 leading-relaxed">
                    We employ SSL encryption, secure token authentication, and restricted database access to protect your personal data against unauthorized access, alteration, or disclosure.
                  </p>
                </section>

                {/* Section 4 */}
                <section className="space-y-3 pt-4 border-t border-stone-100 dark:border-white/5">
                  <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 text-xs flex items-center justify-center font-bold">4</span>
                    Contact Privacy Officer
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 leading-relaxed">
                    If you have any questions regarding your data or wish to request data removal, please contact us at <a href="mailto:privacy@cherryglow.com" className="text-rose-500 font-bold hover:underline">privacy@cherryglow.com</a>.
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
