"use client";
import { useEffect, useRef, type ReactNode } from "react";
import Button from "@/shared/components/button/Button";
import styles from "./confirm-dialog.module.scss";

type Props = {
  open: boolean;
  title: ReactNode;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Escape closes it and focus stays inside while it's open.
export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onCancel}
      onClick={(e) => e.target === ref.current && onCancel()}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className={styles.body}>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className={styles.actions}>
          <button ref={cancelRef} type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
