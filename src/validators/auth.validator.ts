import { z } from "zod";

// Password rule: min 6 chars, at least 1 letter and 1 number
export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");


// 1. Email Register Form Validation Schema
export const registerEmailFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
});

// 2. Phone Register Form Validation Schema
export const registerPhoneFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  password: passwordSchema,
});

// 3. Email Login Form Validation Schema
export const loginEmailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// 4. Phone Login Form Validation Schema
export const loginPhoneFormSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

// 5. Forgot Password Form Validation Schema
export const forgotPasswordFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// 6. Verify OTP Form Validation Schema
export const verifyOtpFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

// 7. Reset Password Form Validation Schema
export const resetPasswordFormSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// 8. Change Password Form Validation Schema
export const changePasswordFormSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: passwordSchema,
});

// 9. Add Email Profile Form Schema
export const addEmailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// 10. Add Phone Profile Form Schema
export const addPhoneFormSchema = z.object({
  phone: z.string().min(6, "Please enter a valid phone number"),
});
