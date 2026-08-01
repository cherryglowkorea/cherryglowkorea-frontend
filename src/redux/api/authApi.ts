import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AuthResponse,
  RegisterEmailPayload,
  RegisterPhonePayload,
  LoginEmailPayload,
  LoginPhonePayload,
  GoogleAuthPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  AddEmailPayload,
  AddPhonePayload,
} from "../../types/auth.types";

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/auth`,
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // 1. Register Email
    registerEmail: builder.mutation<AuthResponse, RegisterEmailPayload>({
      query: (body) => ({
        url: "/register/email",
        method: "POST",
        body,
      }),
    }),

    // 2. Register Phone
    registerPhone: builder.mutation<AuthResponse, RegisterPhonePayload>({
      query: (body) => ({
        url: "/register/phone",
        method: "POST",
        body,
      }),
    }),

    // 3. Google Sign In
    googleAuth: builder.mutation<AuthResponse, GoogleAuthPayload>({
      query: (body) => ({
        url: "/google",
        method: "POST",
        body,
      }),
    }),

    // 4. Login Email
    loginEmail: builder.mutation<AuthResponse, LoginEmailPayload>({
      query: (body) => ({
        url: "/login/email",
        method: "POST",
        body,
      }),
    }),

    // 5. Login Phone
    loginPhone: builder.mutation<AuthResponse, LoginPhonePayload>({
      query: (body) => ({
        url: "/login/phone",
        method: "POST",
        body,
      }),
    }),

    // 6. Forgot Password (Request OTP)
    forgotPassword: builder.mutation<AuthResponse, ForgotPasswordPayload>({
      query: (body) => ({
        url: "/forgot-password",
        method: "POST",
        body,
      }),
    }),

    // 7. Verify Reset OTP
    verifyResetOTP: builder.mutation<{ success: boolean; resetToken: string; message: string }, VerifyOtpPayload>({
      query: (body) => ({
        url: "/verify-reset-otp",
        method: "POST",
        body,
      }),
    }),

    // 8. Reset Password
    resetPassword: builder.mutation<AuthResponse, ResetPasswordPayload>({
      query: (body) => ({
        url: "/reset-password",
        method: "POST",
        body,
      }),
    }),

    // 9. Change Password (Protected)
    changePassword: builder.mutation<AuthResponse, ChangePasswordPayload>({
      query: (body) => ({
        url: "/change-password",
        method: "POST",
        body,
      }),
    }),

    // 10. Add Email to Profile (Protected)
    addEmail: builder.mutation<AuthResponse, AddEmailPayload>({
      query: (body) => ({
        url: "/profile/add-email",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // 11. Add Phone to Profile (Protected)
    addPhone: builder.mutation<AuthResponse, AddPhonePayload>({
      query: (body) => ({
        url: "/profile/add-phone",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // 12. Get Current Authenticated User (Protected)
    getMe: builder.query<AuthResponse, void>({
      query: () => "/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterEmailMutation,
  useRegisterPhoneMutation,
  useGoogleAuthMutation,
  useLoginEmailMutation,
  useLoginPhoneMutation,
  useForgotPasswordMutation,
  useVerifyResetOTPMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useAddEmailMutation,
  useAddPhoneMutation,
  useGetMeQuery,
} = authApi;
