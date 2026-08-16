// Meta (Facebook) Pixel Utility Helper
export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "2122589755279030";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Triggers standard PageView event
 */
export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

/**
 * Custom / standard event tracker
 */
export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, options);
  }
};

/**
 * AddToCart event tracker
 */
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  quantity?: number;
}) => {
  event("AddToCart", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: Number(product.price || 0) * (product.quantity || 1),
    currency: product.currency || "BDT",
  });
};

/**
 * ViewContent event tracker (Product View)
 */
export const trackViewContent = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  currency?: string;
}) => {
  event("ViewContent", {
    content_name: product.name,
    content_category: product.category || "Skincare",
    content_ids: [product.id],
    content_type: "product",
    value: Number(product.price || 0),
    currency: product.currency || "BDT",
  });
};

/**
 * InitiateCheckout event tracker
 */
export const trackInitiateCheckout = (
  items: Array<{ id: string; name: string; price: number; quantity?: number }>,
  totalValue: number
) => {
  event("InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    content_type: "product",
    num_items: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
    value: Number(totalValue || 0),
    currency: "BDT",
  });
};

/**
 * Purchase event tracker
 */
export const trackPurchase = (orderData: {
  orderId: string;
  value: number;
  currency?: string;
  items?: Array<{ id: string; name: string; price: number; quantity?: number }>;
}) => {
  event("Purchase", {
    content_type: "product",
    content_ids: orderData.items?.map((i) => i.id) || [],
    value: Number(orderData.value || 0),
    currency: orderData.currency || "BDT",
    order_id: orderData.orderId,
  });
};

/**
 * Search event tracker
 */
export const trackSearch = (query: string) => {
  if (!query) return;
  event("Search", {
    search_string: query,
  });
};
