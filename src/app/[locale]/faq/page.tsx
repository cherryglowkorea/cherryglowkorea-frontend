"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  MessageSquare,
  Sparkles,
  FileText,
  Lock,
} from "lucide-react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "products", label: "Products & Safety", icon: ShieldCheck },
    { id: "shipping", label: "Shipping & Delivery", icon: Truck },
    { id: "returns", label: "Returns & Refunds", icon: RotateCcw },
    { id: "payment", label: "Payment & Security", icon: CreditCard },
  ];

  const faqs = [
    {
      category: "products",
      question: "Are Cherry Glow products 100% authentic and safe for sensitive skin?",
      answer:
        "Yes, absolutely. All Cherry Glow products are 100% authentic and directly imported from certified skincare laboratories in South Korea. They are dermatologically tested, cruelty-free, and formulated to be gentle on all skin types, including sensitive skin.",
    },
    {
      category: "products",
      question: "Are Cherry Glow skincare products cruelty-free?",
      answer:
        "Yes! Cherry Glow is strictly 100% cruelty-free. We do not test on animals at any stage of product development, nor do we work with suppliers who engage in animal testing.",
    },
    {
      category: "products",
      question: "Where are Cherry Glow products manufactured?",
      answer:
        "Our skincare products are manufactured in ISO-certified, top-tier skincare facilities in South Korea following international GMP safety and purity standards.",
    },
    {
      category: "shipping",
      question: "How long does delivery take across Bangladesh?",
      answer:
        "Delivery within Dhaka city typically takes 1 to 2 business days. For locations outside Dhaka, delivery usually takes 2 to 4 business days via courier service.",
    },
    {
      category: "shipping",
      question: "What are the shipping charges?",
      answer:
        "Standard shipping inside Dhaka is ৳70, and outside Dhaka is ৳130. We offer FREE shipping on all orders over ৳2,000!",
    },
    {
      category: "returns",
      question: "What is your return and exchange policy?",
      answer:
        "We offer a 7-day hassle-free return and exchange policy. If you receive a damaged, defective, or incorrect item, contact our support team within 7 days of delivery with photos/unboxing video for an instant replacement.",
    },
    {
      category: "returns",
      question: "How long does a refund take to process?",
      answer:
        "Once your returned item is received and inspected at our warehouse, approved refunds are processed within 3 to 5 business days back to your original payment method (bKash, Nagad, or Bank).",
    },
    {
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept Cash on Delivery (COD) across all districts in Bangladesh, as well as digital payments via bKash, Nagad, Visa, and Mastercard.",
    },
    {
      category: "payment",
      question: "Is Cash on Delivery (COD) available nationwide?",
      answer:
        "Yes! Cash on Delivery is available in all 64 districts across Bangladesh. You can inspect the package exterior upon arrival and pay cash directly to the delivery agent.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="relative min-h-screen bg-stone-50/50 dark:bg-[#160d10] text-stone-800 dark:text-rose-100 overflow-hidden">
      {/* Background Ambient Blur Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-pink-300/15 dark:bg-rose-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-rose-200/15 dark:bg-pink-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <section className="border-b border-rose-100/60 dark:border-white/5 bg-gradient-to-b from-rose-50/80 via-white to-stone-50/50 dark:from-[#211418] dark:via-[#1a0f13] dark:to-[#160d10] py-12 md:py-16 text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5" /> Help Center & FAQs
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-900 dark:text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 max-w-xl mx-auto">
              Everything you need to know about Cherry Glow Korea products, shipping, orders, and returns.
            </p>

            {/* Instant Search Bar */}
            <div className="pt-2 max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search questions (e.g. shipping, authentic, return)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 rounded-2xl text-xs text-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-400/50 shadow-sm transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </section>

        {/* Main Content Layout with Amazon Style Sidebar */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-[#1e1215] p-4 rounded-2xl border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 px-3 py-2">
                  Help Categories
                </h3>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                        active
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs"
                          : "text-stone-600 dark:text-rose-100/70 hover:bg-rose-50 dark:hover:bg-white/5 hover:text-rose-600"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Policy Quick Links Box */}
              <div className="bg-white dark:bg-[#1e1215] p-4 rounded-2xl border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-rose-100/50 px-2">
                  Legal & Policy Links
                </h3>
                <div className="space-y-1 text-xs">
                  <Link
                    href="/privacy-policy"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-stone-700 dark:text-rose-100/80 hover:text-rose-500 transition font-medium"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-500" /> Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-stone-700 dark:text-rose-100/80 hover:text-rose-500 transition font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-500" /> Terms & Conditions
                  </Link>
                  <Link
                    href="/shipping"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-stone-700 dark:text-rose-100/80 hover:text-rose-500 transition font-medium"
                  >
                    <Truck className="w-3.5 h-3.5 text-rose-500" /> Shipping & Return Policy
                  </Link>
                </div>
              </div>
            </aside>

            {/* Accordion FAQ Area */}
            <main className="lg:col-span-9 space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white dark:bg-[#1e1215] p-10 rounded-2xl border border-stone-200/60 dark:border-white/10 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="text-base font-bold text-stone-800 dark:text-white">No questions found</h3>
                  <p className="text-xs text-stone-500 dark:text-rose-100/60">
                    Try searching for another keyword or browse all help categories.
                  </p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition duration-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-stone-900 dark:text-rose-50 cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ${
                            isOpen ? "rotate-180 text-rose-500" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-stone-600 dark:text-rose-100/70 leading-relaxed border-t border-stone-100 dark:border-white/5 animate-in fade-in duration-150">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Support CTA Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-[#211418] dark:to-[#1a0f13] border border-rose-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white font-serif">Still have questions?</h4>
                  <p className="text-xs text-stone-600 dark:text-rose-100/70">
                    Our customer care team is online and ready to assist you.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Contact Customer Care
                </Link>
              </div>
            </main>

          </div>
        </div>
      </div>
    </main>
  );
}
