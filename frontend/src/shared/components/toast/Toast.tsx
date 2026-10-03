"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./toast.module.scss";

type Kind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: Kind };

const ToastContext = createContext<(message: string, kind?: Kind) => void>(() => {});

export const useToast = () => useContext(ToastContext);

/** Short messages that appear bottom-right for a few seconds. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string, kind: Kind = "info") => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const value = useMemo(() => toast, [toast]);

  // Dialogs (the lightbox, the delete confirmation) open above everything else on the page,
  //  which would hide a toast shown while one is open. Hence popover so toast is shown
  const regionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const isOpen = region.matches(":popover-open");
    if (items.length === 0) {
      if (isOpen) region.hidePopover();
    } else if (!isOpen) {
      region.showPopover();
    } else if (document.querySelector("dialog[open]")) {
      region.hidePopover(); // re-showing moves it back above a dialog opened after it
      region.showPopover();
    }
  }, [items]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div ref={regionRef} popover="manual" className={styles.region} role="status" aria-live="polite">
        {items.map((t) => (
          <p key={t.id} className={`${styles.toast} ${t.kind === "error" ? styles.error : ""}`}>
            {t.kind === "error" && <span className="sr-only">Error: </span>}
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
