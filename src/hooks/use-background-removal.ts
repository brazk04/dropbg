"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BackgroundRemovalStatus,
  ModelProgress,
  RemovalResult,
} from "@/lib/background-removal/types";

export function useBackgroundRemoval() {
  const [status, setStatus] = useState<BackgroundRemovalStatus>("idle");
  const [modelProgress, setModelProgress] = useState<ModelProgress>({
    percent: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RemovalResult | null>(null);
  const locked = useRef(false);
  const active = useRef(true);
  const resultUrl = useRef<string | null>(null);
  const rawUrl = useRef<string | null>(null);
  const sequence = useRef(0);
  const engine = useRef<
    typeof import("@/lib/background-removal/engine") | null
  >(null);
  const isRunning = useCallback(() => locked.current, []);
  const clearUrl = useCallback(() => {
    if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    if (rawUrl.current && rawUrl.current !== resultUrl.current)
      URL.revokeObjectURL(rawUrl.current);
    resultUrl.current = null;
    rawUrl.current = null;
  }, []);
  const reset = useCallback(() => {
    if (locked.current) return;
    ++sequence.current;
    clearUrl();
    setResult(null);
    setError(null);
    setStatus("idle");
    setModelProgress({ percent: null });
  }, [clearUrl]);

  const processImage = useCallback(
    async (file: File) => {
      if (locked.current) return;
      locked.current = true;
      const id = ++sequence.current;
      clearUrl();
      setResult(null);
      setError(null);
      setModelProgress({ percent: null });
      setStatus("loading-model");
      try {
        // Permite ao React pintar o feedback antes de iniciar o worker/runtime.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        if (!active.current) return;
        const engineModule = await import("@/lib/background-removal/engine");
        engine.current = engineModule;
        if (!active.current) return;
        const output = await engineModule.removeBackground(file, {
          onUpdate: (update) => {
            if (!active.current || id !== sequence.current) return;
            setStatus(update.status);
            if (update.status === "loading-model")
              setModelProgress(update.progress);
          },
        });
        if (!active.current || id !== sequence.current) return;
        const url = URL.createObjectURL(output.blob);
        resultUrl.current = url;
        const raw = output.refinementAvailable
          ? URL.createObjectURL(output.rawBlob)
          : url;
        rawUrl.current = raw;
        setResult({
          ...output,
          url,
          rawUrl: raw,
          name: `${file.name.replace(/\.[^.]+$/, "")}-dropbg.png`,
        });
        setStatus("success");
      } catch (failure) {
        if (!active.current || id !== sequence.current) return;
        setError(
          failure instanceof Error
            ? failure.message
            : "Não conseguimos processar esta imagem. Tente novamente.",
        );
        setStatus("error");
      } finally {
        locked.current = false;
      }
    },
    [clearUrl],
  );

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (locked.current) engine.current?.backgroundRemovalEngine.dispose();
      clearUrl();
    };
  }, [clearUrl]);
  return {
    status,
    modelProgress,
    error,
    result,
    processImage,
    reset,
    isRunning,
    busy:
      status === "loading-model" ||
      status === "processing" ||
      status === "refining",
  };
}
