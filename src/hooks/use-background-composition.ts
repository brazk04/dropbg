import { useEffect, useRef, useState } from "react";
import { loadLocalImage } from "@/lib/image";
import { composePng } from "@/lib/background-composition/export";
import type { BackgroundOption } from "@/lib/background-composition/types";
import type { RemovalResult } from "@/lib/background-removal/types";

export function useBackgroundComposition(result: RemovalResult) {
  const [background, setBackground] = useState<BackgroundOption>({
    type: "transparent",
  });
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const active = useRef(true),
    sequence = useRef(0),
    backgroundUrl = useRef<string | null>(null),
    locked = useRef(false);
  const downloads = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const releaseBackground = () => {
    if (backgroundUrl.current) URL.revokeObjectURL(backgroundUrl.current);
    backgroundUrl.current = null;
  };
  const select = (option: BackgroundOption) => {
    if (locked.current) return;
    ++sequence.current;
    releaseBackground();
    setReading(false);
    setError(null);
    setBackground(option);
  };
  const addImage = async (file: File) => {
    if (locked.current) return;
    const id = ++sequence.current;
    setReading(true);
    setError(null);
    try {
      const image = await loadLocalImage(file);
      if (!active.current || id !== sequence.current) {
        URL.revokeObjectURL(image.url);
        return;
      }
      releaseBackground();
      backgroundUrl.current = image.url;
      setBackground({ type: "image", ...image });
    } catch (failure) {
      if (active.current && id === sequence.current)
        setError(
          failure instanceof Error
            ? failure.message
            : "Não foi possível usar esta imagem como fundo.",
        );
    } finally {
      if (active.current && id === sequence.current) setReading(false);
    }
  };
  const download = async () => {
    if (locked.current || reading) return;
    locked.current = true;
    setExporting(true);
    setError(null);
    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const blob = await composePng(
        result.blob,
        result.width,
        result.height,
        background,
      );
      if (!active.current) return;
      const url = URL.createObjectURL(blob);
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        downloads.current.delete(url);
      }, 60_000);
      downloads.current.set(url, timer);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.name;
      document.body.append(anchor);
      try {
        anchor.click();
      } finally {
        anchor.remove();
      }
    } catch {
      if (active.current)
        setError(
          "Não foi possível gerar ou baixar o PNG. Tente novamente ou escolha uma imagem menor.",
        );
    } finally {
      locked.current = false;
      if (active.current) setExporting(false);
    }
  };
  useEffect(() => {
    active.current = true;
    const pending = downloads.current;
    return () => {
      active.current = false;
      if (backgroundUrl.current) URL.revokeObjectURL(backgroundUrl.current);
      for (const [url, timer] of pending) {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      }
      pending.clear();
    };
  }, []);
  return { background, select, addImage, download, error, reading, exporting };
}
