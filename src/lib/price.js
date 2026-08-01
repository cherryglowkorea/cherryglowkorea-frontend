export function getPriceInfo(product) {
  if (!product) return { original: 0, final: 0 };

  if (product.type === "combo") {
    const original = product.price || 0;
    const final = product.salePrice || 0;
    return {
      original,
      final,
      hasDiscount: original > final,
    };
  }

  const {
    basePrice = 0,
    discountType,
    discountValue = 0,
    variants = [],
  } = product;

  const original =
    variants.length > 0 && variants[0]?.price ? variants[0].price : basePrice;

  let final = original;

  if (discountType === "percentage") {
    final = original - (original * discountValue) / 100;
  } else if (discountType === "flat") {
    final = original - discountValue;
  }

  final = Math.max(final, 0);

  return {
    original,
    final: Math.round(final),
    hasDiscount: discountValue > 0,
  };
}
