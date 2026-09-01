"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Star, CheckCircle2, Quote, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const DEFAULT_TESTIMONIALS = [
  {
    _id: "default-1",
    userName: "Papiya Akter Popy",
    createdAt: "2026-03-12",
    comment:
      "এতদিন অরিজিনাল কোরিয়ান স্কিনকেয়ার খুঁজে পাওয়া ছিল সবচেয়ে বড় চ্যালেঞ্জ। কিন্তু এখান থেকে প্রোডাক্ট নেওয়ার পর বুঝেছি—অথেন্টিক জিনিস এখনো পাওয়া যায়। ধন্যবাদ সবসময় অরিজিনাল প্রোডাক্ট দেওয়ার জন্য!",
    rating: 5,
    userAvatar: "https://i.ibb.co/Q7XNs2BP/popy.jpg",
    productName: "Beauty of Joseon Sunscreen",
  },
  {
    _id: "default-2",
    userName: "Sohana Islam",
    createdAt: "2026-03-27",
    comment:
      "আমি ব্যবহার করছি make p:rem Low-Irritant & Mild Acid Foam Cleanser এবং honestly এটা sensitive skin friendly একটা amazing cleanser 💚",
    rating: 5,
    userAvatar: "https://i.ibb.co/mrcbsxR1/sohana.jpg",
    productName: "make p:rem Cleanser",
  },
  {
    _id: "default-3",
    userName: "Md Saddam Hossain",
    createdAt: "2026-04-18",
    comment:
      "যারা স্কিন কেয়ার নিয়ে কনফিউজড, তাদের জন্য Cherry Glow Korea হতে পারে একটা ট্রাস্টেড অপশন! এত ভালো সার্ভিস আর অরিজিনাল প্রোডাক্টের জন্য ধন্যবাদ।",
    rating: 5,
    userAvatar: "https://i.ibb.co/8LVQ598q/saddam.jpg",
    productName: "COSRX Snail Essence",
  },
  {
    _id: "default-4",
    userName: "Nusrat Jahan",
    createdAt: "2026-05-02",
    comment:
      "100% authentic products and super fast delivery in Dhaka! My skin texture has improved so much after using their rice toner.",
    rating: 5,
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    productName: "I'm From Rice Toner",
  },
];

export default function Testimonials() {
  const tTest = useTranslations("testimonials");
  const [reviews, setReviews] = useState(DEFAULT_TESTIMONIALS);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    const fetchApprovedReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE}/reviews/approved`);
        if (res.data && res.data.length > 0) {
          setReviews([...res.data, ...DEFAULT_TESTIMONIALS]);
        }
      } catch (err) {
        // Fallback to default testimonials silently
      }
    };

    fetchApprovedReviews();
  }, [API_BASE]);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-stone-50/40 via-rose-50/20 to-stone-50/40 dark:from-[#170E12]/40 dark:via-[#22131A]/30 dark:to-[#170E12]/40 border-t border-rose-100/60 dark:border-white/5 overflow-hidden">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> {tTest("badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
            {tTest("title")}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-100/60">
            {tTest("subtitle")}
          </p>
        </div>

        {/* Swiper Interactive Slider with 100% Uniform Equal Height Cards */}
        <div className="pb-8">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="w-full !pb-14 testimonials-swiper"
          >
            {reviews.map((item, idx) => {
              const avatar =
                item.userAvatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.userName || idx}`;
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <SwiperSlide key={item._id || idx} className="!h-auto flex flex-col">
                  <div className="w-full h-full min-h-[240px] flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#201318] border border-stone-200/90 dark:border-rose-900/50 shadow-xs hover:shadow-md transition-all duration-300 relative group flex-1">
                    <Quote className="absolute top-5 right-5 h-7 w-7 text-rose-200/60 dark:text-rose-900/40 pointer-events-none group-hover:text-rose-400 transition-colors" />

                    <div className="space-y-3.5 flex-1 flex flex-col justify-start">
                      {/* User Info Header */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-rose-100 dark:border-rose-900/60 shrink-0 bg-rose-50 dark:bg-slate-900 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={avatar}
                            alt={item.userName || "Customer"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                item.userName || "Customer"
                              )}&background=f43f5e&color=fff`;
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-stone-900 dark:text-rose-50 text-xs sm:text-sm truncate">
                              {item.userName}
                            </h4>
                            <span title="Verified Customer" className="inline-flex items-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 dark:text-rose-200/50 font-medium truncate">
                            {dateStr || tTest("verifiedBuyer")}{" "}
                            {item.productName ? `• ${item.productName}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="flex-1 flex flex-col justify-start pt-1">
                        <p className="text-xs text-stone-600 dark:text-rose-100/90 leading-relaxed font-sans line-clamp-3">
                          “{item.comment}”
                        </p>
                      </div>
                    </div>

                    {/* Star Rating & Verified Order Badge */}
                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-rose-900/30 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < (item.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-200 dark:text-slate-800"
                            }
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-950/40">
                        {tTest("verifiedOrder")}
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
