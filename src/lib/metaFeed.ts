function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanCdata(text: string): string {
  if (!text) return "";
  return text.replace(/]]>/g, "]]&gt;");
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

export function generateMetaProductFeedXml(products: any[], baseUrl: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

  const itemsXml = products
    .map((product) => {
      const id = (product._id ? product._id.toString() : product.id || "").trim();
      if (!id) return "";

      const title = cleanCdata(product.name || "Product");

      const rawDesc = product.description || product.shortDescription || product.name || "";
      const description = cleanCdata(stripHtml(rawDesc) || title);

      // Stock & Availability calculation
      let stock = 0;
      if (typeof product.stock === "number") {
        stock = product.stock;
      } else if (Array.isArray(product.variants) && product.variants.length > 0) {
        stock = product.variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0);
      }
      const availability = stock > 0 ? "in stock" : "out of stock";

      const currency = (product.currency || "BDT").toUpperCase();

      // Prices calculation
      let price = Number(product.price || product.basePrice || 0);
      let salePrice = Number(product.salePrice || 0);

      // If main price is missing but variant prices exist, take lowest variant price
      if (!price && Array.isArray(product.variants) && product.variants.length > 0) {
        const variantPrices = product.variants
          .map((v: any) => Number(v.price))
          .filter((p: number) => !isNaN(p) && p > 0);
        if (variantPrices.length > 0) {
          price = Math.min(...variantPrices);
        }
      }

      if (!price && salePrice) {
        price = salePrice;
        salePrice = 0;
      }

      let priceXml = `<g:price>${price.toFixed(2)} ${currency}</g:price>`;
      if (salePrice > 0 && salePrice < price) {
        priceXml = `<g:price>${price.toFixed(2)} ${currency}</g:price>\n      <g:sale_price>${salePrice.toFixed(2)} ${currency}</g:sale_price>`;
      }

      // Direct Product URL on Website
      const productUrl = `${cleanBaseUrl}/products/${id}`;

      // Direct Image URL
      let rawImage =
        product.thumbnail ||
        product.image ||
        (Array.isArray(product.gallery) && product.gallery[0]) ||
        (Array.isArray(product.images) &&
          (typeof product.images[0] === "string"
            ? product.images[0]
            : product.images[0]?.url)) ||
        "";

      if (rawImage && !rawImage.startsWith("http")) {
        rawImage = `${cleanBaseUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
      }

      const imageLink = escapeXml(rawImage);
      const brand = cleanCdata(product.brand || "Cherry Glow");
      const category = cleanCdata(product.category || "Skincare");

      return `    <item>
      <g:id>${id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      ${priceXml}
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:brand><![CDATA[${brand}]]></g:brand>
      <g:product_type><![CDATA[${category}]]></g:product_type>
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title><![CDATA[Cherry Glow Product Catalog]]></title>
    <link>${escapeXml(cleanBaseUrl)}</link>
    <description><![CDATA[Active Product Feed for Meta Commerce Manager]]></description>
    ${itemsXml}
  </channel>
</rss>`;
}
