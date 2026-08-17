"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Leaf, Heart, CheckCircle2, Sparkles } from "lucide-react";

interface Reason {
  title: string;
  description: string;
  position: "top" | "right" | "bottom" | "left";
  icon: any;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
}

const reasons: Reason[] = [
  {
    title: "Dermatologist Tested",
    description: "Formulated and approved by skin experts.",
    position: "top",
    icon: ShieldCheck,
    originX: 340,
    originY: 190,
    targetX: 340,
    targetY: 95,
  },
  {
    title: "Natural Ingredients",
    description: "Powered by clean, plant-based extracts.",
    position: "right",
    icon: Leaf,
    originX: 410,
    originY: 260,
    targetX: 460,
    targetY: 260,
  },
  {
    title: "Cruelty Free",
    description: "Never tested on animals, always ethical.",
    position: "bottom",
    icon: Heart,
    originX: 340,
    originY: 330,
    targetX: 340,
    targetY: 425,
  },
  {
    title: "Proven Results",
    description: "Visible improvement in weeks.",
    position: "left",
    icon: CheckCircle2,
    originX: 270,
    originY: 260,
    targetX: 220,
    targetY: 260,
  },
];

const desktopPositionClasses: Record<string, string> = {
  top: "top-0 left-1/2 -translate-x-1/2",
  bottom: "bottom-0 left-1/2 -translate-x-1/2",
  left: "left-0 top-1/2 -translate-y-1/2",
  right: "right-0 top-1/2 -translate-y-1/2",
};

export default function BenefitsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-transparent via-rose-50/20 to-transparent dark:via-rose-950/20">
      {/* Background glow orb */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-200/20 blur-3xl dark:bg-rose-600/10" />

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-xs font-semibold text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 mb-3 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Premium Skincare Guarantee
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
              Cherry Glow
            </span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-rose-100/70">
            Formulated with precision, backed by science, designed for glowing skin.
          </p>
        </div>

        {/* Desktop Radial Layout */}
        <div className="relative mx-auto hidden h-[520px] w-[680px] md:block">
          {/* SVG Connector Lines */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="roseGradientHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="1" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {reasons.map((reason, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <g key={`line-${index}`}>
                  <line
                    x1={reason.originX}
                    y1={reason.originY}
                    x2={reason.targetX}
                    y2={reason.targetY}
                    stroke={isHovered ? "url(#roseGradientHighlight)" : "url(#roseGradient)"}
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    strokeDasharray={isHovered ? "none" : "5 5"}
                    strokeOpacity={isHovered ? "1" : "0.6"}
                    filter={isHovered ? "url(#glowFilter)" : undefined}
                    className="transition-all duration-300"
                  />

                  <motion.circle
                    r={isHovered ? 4 : 3}
                    fill="#fb7185"
                    initial={{ cx: reason.originX, cy: reason.originY }}
                    animate={{
                      cx: [reason.originX, reason.targetX, reason.originX],
                      cy: [reason.originY, reason.targetY, reason.originY],
                    }}
                    transition={{
                      duration: 3.5 + index * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Animated Logo */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex items-center justify-center"
            >
              {/* Outer pulsing ring */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-rose-500/30 via-pink-500/40 to-rose-500/30 blur-md animate-pulse" />

              {/* Rotating conic gradient border */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600 p-[2px] animate-[spin_8s_linear_infinite]">
                <div className="h-full w-full rounded-full bg-white dark:bg-[#1c1014]" />
              </div>

              {/* Logo Circle Container */}
              <motion.div
                whileHover={{ scale: 1.08, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative z-10 flex h-32 w-32 md:h-36 md:w-36 items-center justify-center overflow-hidden rounded-full border border-rose-200 bg-white p-3 shadow-xl backdrop-blur-xl dark:border-rose-500/40 dark:bg-[#221418]"
              >
                <Image
                  src="/logo.png"
                  alt="Cherry Glow Logo"
                  fill
                  className="object-contain p-3 transition-transform duration-500 hover:scale-110"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* 4 Cards Around Center Logo */}
          {reasons.map((reason, index) => {
            const IconComp = reason.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`absolute z-10 ${desktopPositionClasses[reason.position]}`}
              >
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`group relative flex w-56 cursor-pointer items-start gap-3.5 rounded-2xl border p-4 shadow-md backdrop-blur-xl transition-all duration-300 ${
                    isHovered
                      ? "bg-white dark:bg-[#2a1a1f] border-rose-500/80 shadow-[0_10px_30px_-5px_rgba(244,63,94,0.25)] dark:border-rose-400/80"
                      : "bg-white/95 dark:bg-[#24161a]/95 border-slate-200/90 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500/70"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50 text-rose-500 shadow-xs transition-colors duration-300 group-hover:bg-rose-500 group-hover:text-white dark:border-rose-700/60 dark:bg-rose-950/80 dark:text-rose-300">
                      <IconComp className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-slate-800 transition-colors duration-300 group-hover:text-rose-600 dark:text-rose-50 dark:group-hover:text-rose-300">
                      {reason.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-rose-100/75">
                      {reason.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile / Tablet Responsive Layout */}
        <div className="mt-8 md:hidden">
          {/* Mobile Center Logo */}
          <div className="relative mb-8 flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-2 rounded-full bg-rose-400/30 blur-md animate-pulse" />
              <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-rose-200 bg-white p-2.5 shadow-md dark:border-rose-500/40 dark:bg-[#221418]">
                <Image
                  src="/logo.png"
                  alt="Cherry Glow Logo"
                  width={80}
                  height={80}
                  className="object-contain p-2"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((reason, index) => {
              const IconComp = reason.icon;
              return (
                <motion.div
                  key={reason.title}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group flex items-start gap-3.5 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-rose-900/50 dark:bg-[#24161a]/95"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50 text-rose-500 shadow-xs dark:border-rose-700/60 dark:bg-rose-950/80 dark:text-rose-300">
                      <IconComp className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-rose-50">
                      {reason.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-rose-100/75">
                      {reason.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
