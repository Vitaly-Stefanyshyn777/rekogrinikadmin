"use client";

import { useState } from "react";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  const showSuccess = (message: string) => showToast(message, "success");
  const showError = (message: string) => showToast(message, "error");
  const showInfo = (message: string) => showToast(message, "info");

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
  };
}
