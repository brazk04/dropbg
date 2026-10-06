export type RefinementProfile = "soft" | "balanced" | "sharp";
export type EdgeMode = "contract" | "neutral" | "expand";
export type PixelImage = {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
  channels: number;
};
export type RefinementOptions = {
  profile?: RefinementProfile;
  edgeMode?: EdgeMode;
  inPlace?: boolean;
};
export type RefinementStats = {
  alphaChanged: number;
  colorChanged: number;
  cleaned: number;
};
export const REFINEMENT_PROFILES = {
  balanced: { smoothing: 0.12, decontamination: 0.45, maxColorShift: 12 },
  soft: { smoothing: 0.2, decontamination: 0.4, maxColorShift: 10 },
  sharp: { smoothing: 0.06, decontamination: 0.5, maxColorShift: 14 },
} as const;
