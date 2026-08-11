"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export default function Cart() {
  const { totalItems } = useCart();
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    router.push("/cart");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Shopping Cart"
      className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-200/60 bg-white/70 text-rose-500 shadow-sm backdrop-blur transition-all hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:text-rose-300 dark:hover:bg-white/10 cursor-pointer"
    >
      <ShoppingBag size={19} className="transition-transform group-hover:scale-110" />

      {totalItems >= 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#1C1417]">
          {totalItems}
        </span>
      )}
    </button>
  );
}

