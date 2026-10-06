"use client";
import { useEffect } from "react";
import type { Notice } from "@/types/image";
import { Icon } from "./icon";
export function Toast({
  notice,
  onDismiss,
}: {
  notice: Notice | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {notice && (
        <div className={`toast toast-${notice.kind}`}>
          <Icon name={notice.kind === "success" ? "check" : "image"} />
          <p>{notice.message}</p>
          <button aria-label="Fechar notificação" onClick={onDismiss}>
            <Icon name="close" />
          </button>
        </div>
      )}
    </div>
  );
}
