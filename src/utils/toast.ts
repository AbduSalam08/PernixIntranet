// toastUtils.ts
import { toast, ToastOptions } from "react-toastify";

const defaultToastOptions: ToastOptions = {
  position: "top-center",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Function to show a toast with dynamic options
const showToast = (
  type: "success" | "error" | "info",
  message: string,
  options?: ToastOptions
): void => {
  const toastOptions = { ...defaultToastOptions, ...options };

  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "info":
      toast.info(message, toastOptions);
      break;
    default:
      break;
  }
};

// Function to show a success toast
export const showSuccessToast = (
  message: string,
  options?: ToastOptions
): void => {
  showToast("success", message, options);
};

// Function to show an error toast
export const showErrorToast = (
  message: string,
  options?: ToastOptions
): void => {
  showToast("error", message, options);
};

// Function to show an info toast
export const showInfoToast = (
  message: string,
  options?: ToastOptions
): void => {
  showToast("info", message, options);
};

// Function to update an existing toast
export const updateToast = (
  toastId: React.ReactText,
  message: string,
  options?: ToastOptions
): void => {
  toast.update(toastId, {
    render: message,
    type: options?.type,
    isLoading: false, // Ensure loading state is disabled on update
    autoClose: options?.autoClose ?? 3000,
    hideProgressBar: options?.hideProgressBar ?? false,
    ...options,
  });
};
