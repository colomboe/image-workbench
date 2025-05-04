import { useEffect } from "preact/hooks";
import { useState } from "preact/hooks";
import './toast.css';

export interface Toast {
  id: number;
  message: string;
  duration?: number;
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
let nextId = 1;

export function showToast(message: string, duration = 3000) {
  const id = nextId++;
  toasts = [...toasts, { id, message, duration }];
  listeners.forEach(fn => fn(toasts));
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(fn => fn(toasts));
  }, duration);
}

function ToastItem({ toast }: { toast: Toast }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setFade(true), (toast.duration ?? 3000) - 500);
    return () => clearTimeout(timeout);
  }, [toast]);
  return (
    <div
      className={`toast-fade${fade ? ' out' : ''}`}
      style={{
        background: 'rgba(40,40,40,0.95)',
        color: 'white',
        borderRadius: 8,
        padding: '12px 32px',
        margin: 8,
        fontSize: 16,
        boxShadow: '0 2px 16px #0008',
        pointerEvents: 'auto',
      }}
    >
      {toast.message}
    </div>
  );
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);
  useEffect(() => {
    listeners.push(setCurrentToasts);
    setCurrentToasts(toasts);
    return () => {
      listeners = listeners.filter(fn => fn !== setCurrentToasts);
    };
  }, []);
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 0,
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 99999,
      pointerEvents: 'none',
    }}>
      {currentToasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
