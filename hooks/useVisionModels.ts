"use client";

import { useEffect, useRef, useState } from "react";
import type { SubjectBox } from "@/lib/types";

type CocoModel = import("@tensorflow-models/coco-ssd").ObjectDetection;
type BlazeFaceModel = import("@tensorflow-models/blazeface").BlazeFaceModel;

export function useVisionModels() {
  const coco = useRef<CocoModel | null>(null);
  const face = useRef<BlazeFaceModel | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        const [cocoModule, faceModule] = await Promise.all([
          import("@tensorflow-models/coco-ssd"),
          import("@tensorflow-models/blazeface"),
        ]);
        const [cocoModel, faceModel] = await Promise.all([
          cocoModule.load({ base: "lite_mobilenet_v2" }),
          faceModule.load(),
        ]);
        if (cancelled) return;
        coco.current = cocoModel;
        face.current = faceModel;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const detect = async (video: HTMLVideoElement): Promise<SubjectBox | undefined> => {
    if (video.readyState < 2) return;
    const vw = video.videoWidth || 1;
    const vh = video.videoHeight || 1;

    if (face.current) {
      const faces = await face.current.estimateFaces(video, false);
      const first = faces[0];
      if (first) {
        const tl = first.topLeft as [number, number];
        const br = first.bottomRight as [number, number];
        return { x: tl[0] / vw, y: tl[1] / vh, width: (br[0] - tl[0]) / vw, height: (br[1] - tl[1]) / vh, label: "face", confidence: 0.95 };
      }
    }

    if (coco.current) {
      const predictions = await coco.current.detect(video, 5, 0.48);
      const ranked = predictions.sort((a, b) => {
        const aa = a.bbox[2] * a.bbox[3] * (a.class === "person" ? 1.4 : 1);
        const bb = b.bbox[2] * b.bbox[3] * (b.class === "person" ? 1.4 : 1);
        return bb - aa;
      });
      const p = ranked[0];
      if (p) {
        return { x: p.bbox[0] / vw, y: p.bbox[1] / vh, width: p.bbox[2] / vw, height: p.bbox[3] / vh, label: p.class, confidence: p.score };
      }
    }
  };

  return { status, detect };
}
