import { Id, toast, ToastOptions } from 'react-toastify';

// Custom toast configurations
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast with custom styling
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
  });
};

// Error toast with custom styling
export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...defaultOptions,
    ...options,
  });
};

// Info toast with custom styling
export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    ...defaultOptions,
    ...options,
  });
};

// Warning toast with custom styling
export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast.warn(message, {
    ...defaultOptions,
    ...options,
  });
};

// Loading toast that can be updated
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    ...defaultOptions,
  });
};

// Update an existing toast (useful for loading states)
export const updateToast = (toastId: Id, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
  return toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    ...defaultOptions,
  });
};

// Predefined toast messages for common actions
export const toastMessages = {
  fundraiser: {
    creating: "Creating your fundraiser...",
    created: "🎉 Fundraiser created successfully!",
    failed: "Failed to create fundraiser. Please try again.",
    validationError: "Please fix the form errors before submitting.",
    formReset: "Form has been reset for a new fundraiser.",
    walletNotConnected: "Please connect your wallet to create a fundraiser.",
    donationSuccess: "Donation successful!",
    donationFailed: "Donation failed. Please try again.",
    proofSubmissionSuccess: "Proof submission successful!",
    proofSubmissionFailed: "Proof submission failed. Please try again.",
    milestoneClaimSuccess: "Milestone claimed successfully!",
    milestoneClaimFailed: "Milestone claim failed. Please try again.",
    milestoneVoteSuccess: "Milestone voted successfully!",
    milestoneVoteFailed: "Milestone vote failed. Please try again.",
  },
  contact: {
    sending: "Sending your message...",
    sent: "✉️ Message sent successfully! We'll get back to you soon.",
    failed: "Failed to send message. Please try again.",
    formReset: "Form has been reset.",
  },
  wallet: {
    connecting: "Connecting to wallet...",
    connected: "🔗 Wallet connected successfully!",
    disconnected: "Wallet disconnected",
    failed: "Failed to connect wallet. Please try again.",
  },
  general: {
    loading: "Loading...",
    success: "Operation completed successfully!",
    error: "Something went wrong. Please try again.",
    copied: "📋 Copied to clipboard!",
  }
}; 