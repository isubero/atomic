export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  dismissible: boolean;
  createdAt: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private container: HTMLElement | null = null;
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private renderedToastIds: Set<string> = new Set();

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    this.container.setAttribute("aria-live", "polite");
    this.container.setAttribute("aria-label", "Notifications");
    document.body.appendChild(this.container);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  private renderToasts() {
    if (!this.container) return;

    // Get currently rendered toast IDs
    const currentToastIds = new Set(this.toasts.map((toast) => toast.id));

    // Remove toasts that are no longer in the state
    const toastsToRemove: string[] = [];
    this.renderedToastIds.forEach((toastId) => {
      if (!currentToastIds.has(toastId)) {
        toastsToRemove.push(toastId);
      }
    });

    // Handle removal animations
    toastsToRemove.forEach((toastId) => {
      const toastElement = this.container?.querySelector(
        `[data-toast-id="${toastId}"]`
      );
      if (toastElement) {
        toastElement.classList.add("toast-exit");
        setTimeout(() => {
          toastElement.remove();
          this.renderedToastIds.delete(toastId);
        }, 150);
      }
    });

    // Add new toasts
    this.toasts.forEach((toast) => {
      if (!this.renderedToastIds.has(toast.id)) {
        const toastElement = this.createToastElement(toast);
        this.container!.appendChild(toastElement);
        this.renderedToastIds.add(toast.id);
      }
    });
  }

  private createToastElement(toast: Toast): HTMLElement {
    const toastEl = document.createElement("div");
    toastEl.className = `toast toast-${toast.type}`;
    toastEl.setAttribute("data-toast-id", toast.id);
    toastEl.setAttribute("role", "alert");

    const content = document.createElement("div");
    content.className = "toast-content";
    content.textContent = toast.message;

    const closeButton = document.createElement("button");
    closeButton.className = "toast-close";
    closeButton.innerHTML = "×";
    closeButton.setAttribute("aria-label", "Close notification");
    closeButton.addEventListener("click", () => this.dismiss(toast.id));

    toastEl.appendChild(content);
    if (toast.dismissible) {
      toastEl.appendChild(closeButton);
    }

    // Add enter animation after element is in DOM
    requestAnimationFrame(() => {
      toastEl.classList.add("toast-enter");
    });

    return toastEl;
  }

  private scheduleDismissal(toast: Toast) {
    if (toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }

  show(message: string, options: ToastOptions = {}): string {
    const id = `toast-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const toast: Toast = {
      id,
      message,
      type: options.type || "info",
      duration: options.duration ?? 5000,
      dismissible: options.dismissible ?? true,
      createdAt: Date.now(),
    };

    this.toasts.push(toast);
    this.renderToasts();
    this.scheduleDismissal(toast);
    this.notifyListeners();

    return id;
  }

  dismiss(id: string) {
    const toastIndex = this.toasts.findIndex(
      (toastItem) => toastItem.id === id
    );
    if (toastIndex === -1) return;

    // Remove from toasts array immediately
    this.toasts.splice(toastIndex, 1);

    // The renderToasts method will handle the exit animation
    this.renderToasts();
    this.notifyListeners();
  }

  dismissAll() {
    // Clear all toasts immediately
    this.toasts = [];

    // The renderToasts method will handle the exit animations
    this.renderToasts();
    this.notifyListeners();
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Create singleton instance
const toastManager = new ToastManager();

// Export toast object with convenience methods
export const toast = {
  show: (message: string, options?: ToastOptions) =>
    toastManager.show(message, options),
  success: (message: string, options?: Omit<ToastOptions, "type">) =>
    toastManager.show(message, { ...options, type: "success" }),
  error: (message: string, options?: Omit<ToastOptions, "type">) =>
    toastManager.show(message, { ...options, type: "error" }),
  warning: (message: string, options?: Omit<ToastOptions, "type">) =>
    toastManager.show(message, { ...options, type: "warning" }),
  info: (message: string, options?: Omit<ToastOptions, "type">) =>
    toastManager.show(message, { ...options, type: "info" }),
  dismiss: (id: string) => toastManager.dismiss(id),
  dismissAll: () => toastManager.dismissAll(),
  getToasts: () => toastManager.getToasts(),
  subscribe: (listener: (toasts: Toast[]) => void) =>
    toastManager.subscribe(listener),
};
