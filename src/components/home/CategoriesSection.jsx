"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";

const defaultCategories = [
  { id: 1, name: "Cleanser", image: "https://i.ibb.co/XZmby8wp/body-care.jpg" },
  { id: 2, name: "Toner", image: "https://i.ibb.co/DTj6vTX/fragrance.jpg" },
  { id: 3, name: "Serum", image: "https://i.ibb.co/jPVqmVjK/hair-care.jpg" },
  { id: 4, name: "Eye Care", image: "https://i.ibb.co/WNXFcJdX/makeup.jpg" },
  { id: 5, name: "Moisturizer", image: "https://i.ibb.co/vxBd6rWx/skin-care.jpg" },
  { id: 6, name: "Sunscreen", image: "https://i.ibb.co/XZmby8wp/body-care.jpg" },
  { id: 7, name: "Mask", image: "https://i.ibb.co/jPVqmVjK/hair-care.jpg" },
  { id: 8, name: "Essence", image: "https://i.ibb.co/WNXFcJdX/makeup.jpg" },
];

export default function CategoryMarquee() {
  const { data: dbCategories, isLoading } = useGetCategoriesQuery();

  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : defaultCategories;

  return (
    <section className="relative overflow-hidden py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Shop by Category
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="group relative overflow-hidden">
            <div className="flex w-max animate-marquee gap-8 group-hover:[animation-play-state:paused]">
              {[...categories, ...categories].map((cat, index) => (
                <div
                  key={`${cat.id || cat._id}-${index}`}
                  className="flex w-[140px] flex-col items-center gap-3"
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg"
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </Link>

                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
