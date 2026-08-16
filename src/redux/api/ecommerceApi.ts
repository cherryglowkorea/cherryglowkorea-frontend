import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const ecommerceApi = createApi({
  reducerPath: "ecommerceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Products", "Categories", "Brands", "Orders", "Reviews", "Coupons"],
  endpoints: (builder) => ({
    // ==========================================
    // 1. PRODUCTS
    // ==========================================
    getProducts: builder.query<any[], { search?: string; category?: string } | void>({
      query: (params) => {
        const p = params as any;
        const queryParams = new URLSearchParams();
        if (p?.search) queryParams.append("search", p.search);
        if (p?.category) queryParams.append("category", p.category);
        return `/products/allProduct/public?${queryParams.toString()}`;
      },
      providesTags: ["Products"],
    }),

    getProductById: builder.query<any, string>({
      query: (id) => `/products/singleProduct/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Products", id }],
    }),

    getFeaturedProducts: builder.query<any, { limit?: number } | void>({
      query: (params) => {
        const p = params as any;
        return `/products/featured?limit=${p?.limit || 6}`;
      },
      providesTags: ["Products"],
    }),

    getBestSellers: builder.query<any, { limit?: number } | void>({
      query: (params) => {
        const p = params as any;
        return `/products/best?limit=${p?.limit || 5}`;
      },
      providesTags: ["Products"],
    }),

    // ==========================================
    // 2. CATEGORIES & ATTRIBUTES
    // ==========================================
    getCategories: builder.query<any[], void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),

    getAttributes: builder.query<any[], void>({
      query: () => "/attributes",
      providesTags: ["Categories"],
    }),

    // ==========================================
    // 3. BRANDS
    // ==========================================
    getBrands: builder.query<any[], void>({
      query: () => "/brands",
      providesTags: ["Brands"],
    }),

    // ==========================================
    // 4. COUPONS
    // ==========================================
    validateCoupon: builder.mutation<any, { code: string; amount: number }>({
      query: (body) => ({
        url: "/coupons/validate",
        method: "POST",
        body,
      }),
    }),

    // ==========================================
    // 5. REVIEWS
    // ==========================================
    getProductReviews: builder.query<any[], string>({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: ["Reviews"],
    }),

    addReview: builder.mutation<any, { productId: string; rating: number; comment: string; images?: string[] }>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews", "Products"],
    }),

    // ==========================================
    // 6. ORDERS
    // ==========================================
    createOrder: builder.mutation<any, any>({
      query: (body) => ({
        url: "/orders/admin-create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),

    getOrders: builder.query<any[], void>({
      query: () => "/orders/allOrders",
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query<any, string>({
      query: (id) => `/orders/single/${id}`,
      providesTags: ["Orders"],
    }),

    updateOrderStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/updateStatus/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useGetBestSellersQuery,
  useGetCategoriesQuery,
  useGetAttributesQuery,
  useGetBrandsQuery,
  useValidateCouponMutation,
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = ecommerceApi;
