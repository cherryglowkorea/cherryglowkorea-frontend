"use client";

import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";

export default function ProfileCard({ member }) {
  const { name, post, imgSrc, desc, facebook, instagram } = member;

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#1e1215] p-6 border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
      {/* Profile Image with Gradient Ring */}
      <div className="p-1 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full shadow-xs mb-4">
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-stone-100 dark:bg-white/5">
          <Image
            src={imgSrc || "/placeholder.jpg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Name & Role */}
      <h3 className="text-base font-bold text-stone-900 dark:text-white font-serif">
        {name}
      </h3>
      <span className="mt-1 inline-block text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/30">
        {post}
      </span>

      {/* Description */}
      <p className="mt-3 text-xs text-stone-600 dark:text-rose-100/70 leading-relaxed flex-1">
        {desc}
      </p>

      {/* Social Links */}
      <div className="mt-5 flex items-center justify-center gap-3 pt-3 border-t border-stone-100 dark:border-white/5 w-full">
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 text-stone-600 dark:text-rose-100/80 flex items-center justify-center transition-colors duration-200 cursor-pointer"
            title="Facebook Profile"
          >
            <Facebook className="h-4 w-4" />
          </a>
        )}

        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500 text-stone-600 dark:text-rose-100/80 flex items-center justify-center transition-colors duration-200 cursor-pointer"
            title="Instagram Profile"
          >
            <Instagram className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

