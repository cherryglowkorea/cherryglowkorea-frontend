export interface User {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  googleId?: string;
  avatar?: string;
  photoURL?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  authProviders: string[];
  role: 'user' | 'admin' | 'super_admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface RegisterEmailPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterPhonePayload {
  name: string;
  phone: string;
  password: string;
}

export interface LoginEmailPayload {
  email: string;
  password: string;
}

export interface LoginPhonePayload {
  phone: string;
  password: string;
}

export interface GoogleAuthPayload {
  token?: string;
  idToken?: string;
  credential?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface AddEmailPayload {
  email: string;
}

export interface AddPhonePayload {
  phone: string;
}
