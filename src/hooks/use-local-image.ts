"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadLocalImage } from "@/lib/image";
import type { ImageSource, LocalImage, Notice } from "@/types/image";

export function useLocalImage({
  isLocked,
  onChange,
}: { isLocked?: () => boolean; onChange?: () => void } = {}) {
  const [image, setImage] = useState<LocalImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const currentUrl = useRef<string | null>(null);
  const request = useRef(0);
  const active = useRef(true);

  const addImage = useCallback(
    async (file: File, source: ImageSource) => {
      if (isLocked?.()) return;
      const id = ++request.current;
      setLoading(true);
      try {
        const nextImage = await loadLocalImage(file);
        if (!active.current || id !== request.current || isLocked?.()) {
          URL.revokeObjectURL(nextImage.url);
          return;
        }
        if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
        currentUrl.current = nextImage.url;
        onChange?.();
        setImage(nextImage);
        setNotice({
          kind: "success",
          message:
            source === "clipboard"
              ? "Imagem colada com sucesso."
              : "Imagem carregada. Ela permanece no seu dispositivo.",
        });
      } catch (error) {
        if (active.current && id === request.current)
          setNotice({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "Não foi possível carregar a imagem.",
          });
      } finally {
        if (active.current && id === request.current) setLoading(false);
      }
    },
    [isLocked, onChange],
  );

  const removeImage = useCallback(() => {
    if (isLocked?.()) return;
    ++request.current;
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    currentUrl.current = null;
    setImage(null);
    onChange?.();
    setLoading(false);
    setNotice({ kind: "info", message: "Imagem removida." });
  }, [isLocked, onChange]);

  useEffect(() => {
    const paste = (event: ClipboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA"].includes(event.target.tagName))
      )
        return;
      const item = Array.from(event.clipboardData?.items ?? []).find((entry) =>
        entry.type.startsWith("image/"),
      );
      const file = item?.getAsFile();
      if (file) {
        event.preventDefault();
        void addImage(file, "clipboard");
      }
    };
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, [addImage]);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    };
  }, []);

  return { image, loading, notice, setNotice, addImage, removeImage };
}
