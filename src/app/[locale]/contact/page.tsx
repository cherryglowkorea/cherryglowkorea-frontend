"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Sparkles, Headphones, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Thank you! Your message has been sent successfully. We will get back to you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 600);
  };

  return (
    <main className="relative min-h-screen bg-stone-50/50 dark:bg-[#160d10] text-stone-800 dark:text-rose-100 overflow-hidden">
      {/* Ambient Background Blur Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-pink-300/15 dark:bg-rose-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-rose-200/15 dark:bg-pink-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* 1. Hero Header */}
        <section className="border-b border-rose-100/60 dark:border-white/5 bg-gradient-to-b from-rose-50/80 via-white to-stone-50/50 dark:from-[#211418] dark:via-[#1a0f13] dark:to-[#160d10] py-14 md:py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 mb-4 shadow-2xs">
              <Headphones className="w-3.5 h-3.5" /> Customer Care & Support
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
              Get in Touch With <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Cherry Glow</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-600 dark:text-rose-100/70 max-w-2xl mx-auto leading-relaxed">
              Have a question about our skincare products, order status, or recommendations? We are here to help you.
            </p>
          </div>
        </section>

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">

          {/* 2. Contact Main Section (Info + Form) */}
          <div className="grid lg:grid-cols-12 gap-10">

            {/* Left: Contact Info & Support Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Reach Out
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                  We'd Love to Hear From You
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 leading-relaxed">
                  Our friendly support team responds within 24 hours. Contact us via phone, email, or fill out the form.
                </p>
              </div>

              {/* Info Cards List */}
              <div className="space-y-3.5">
                <a
                  href="mailto:support@cherryglow.com"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shrink-0 group-hover:bg-rose-500 group-hover:text-white transition">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-rose-100/50">Email Support</h3>
                    <p className="text-sm font-semibold text-stone-800 dark:text-rose-100 group-hover:text-rose-500 transition">
                      support@cherryglow.com
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+8801234567890"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shrink-0 group-hover:bg-rose-500 group-hover:text-white transition">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-rose-100/50">Phone Hotline</h3>
                    <p className="text-sm font-semibold text-stone-800 dark:text-rose-100 group-hover:text-rose-500 transition">
                      +880 1234 567 890
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-rose-100/50">Office Locations</h3>
                    <p className="text-xs font-semibold text-stone-800 dark:text-rose-100">
                      Dhaka, Bangladesh & Busan, South Korea
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-rose-100/50">Support Hours</h3>
                    <p className="text-xs font-semibold text-stone-800 dark:text-rose-100">
                      Monday – Saturday: 10:00 AM – 8:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Contact Form (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-rose-100/60 mt-0.5">
                      Fill out the details below and we will respond promptly.
                    </p>
                  </div>
                  <MessageSquare className="w-6 h-6 text-rose-500" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-rose-100">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl text-xs text-stone-800 dark:text-white outline-none focus:border-rose-400 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-rose-100">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl text-xs text-stone-800 dark:text-white outline-none focus:border-rose-400 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-rose-100">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Product question, order inquiry, etc."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl text-xs text-stone-800 dark:text-white outline-none focus:border-rose-400 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-rose-100">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      placeholder="Write your message or inquiry here..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl text-xs text-stone-800 dark:text-white outline-none focus:border-rose-400 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
                  >
                    {loading ? (
                      "Sending Message..."
                    ) : (
                      <>
                        <Send size={15} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 3. Google Maps Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
                  Visit Our Headquarters & Lab
                </h2>
                <p className="text-xs text-stone-500 dark:text-rose-100/60 mt-0.5">
                  South Korea skincare manufacturing facility map location.
                </p>
              </div>
            </div>

            <div className="w-full h-[450px] md:h-[500px] rounded-3xl overflow-hidden border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <iframe
                title="Cherry Glow South Korea Headquarters"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313884.500292328!2d125.23345447830654!3d35.794646645573884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356455ebcb11ba9b%3A0x91249b00ba88db4b!2sSouth%20Korea!5e0!3m2!1sen!2sbd!4v1785674152850!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="border-0"
              />
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
