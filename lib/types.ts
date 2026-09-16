export type SubjectBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
};

export type FrameMetrics = {
  brightness: number;
  contrast: number;
  sharpness: number;
  motion: number;
  horizonAngle: number;
};

export type Guidance = {
  score: number;
  headline: string;
  detail: string;
  status: "good" | "warn" | "bad";
  target?: { x: number; y: number };
};

export type PhotoRecord = {
  id: string;
  createdAt: number;
  blob: Blob;
  width: number;
  height: number;
  score: number;
  localAdvice: string;
  aiReview?: string;
};
