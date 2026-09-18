// Lightweight global toast bus: any component can call showToast(...) without
// prop-drilling or wrapping the tree in a Context provider. ToastHost (mounted
// once in App.tsx) subscribes and renders the active toasts.
export type ToastType = "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function showToast(message: string, type: ToastType = "success") {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => dismissToast(id), 4500);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}
