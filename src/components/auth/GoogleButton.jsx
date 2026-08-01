"use client";

import { toast } from "sonner";

export default function GoogleButton({ label = "Continue with Google" }) {
  const handleGoogle = () => {
    toast.info("Google Sign-In is disabled. Please use Email/Password login.");
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      className="w-full rounded-lg border py-2 font-medium hover:bg-muted"
    >
      {label}
    </button>
  );
}

