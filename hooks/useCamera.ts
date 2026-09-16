"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Facing = "user" | "environment";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<Facing>("environment");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoomState] = useState(1);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torch, setTorch] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const next = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = next;
      setStream(next);
      if (videoRef.current) {
        videoRef.current.srcObject = next;
        await videoRef.current.play();
      }

      const track = next.getVideoTracks()[0];
      const caps = track.getCapabilities?.() as MediaTrackCapabilities & {
        zoom?: { min: number; max: number; step?: number };
        torch?: boolean;
      };
      if (caps?.zoom) {
        setZoomRange({ min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step || 0.1 });
        setZoomState(caps.zoom.min);
      } else {
        setZoomRange({ min: 1, max: 1, step: 0.1 });
      }
      setTorchAvailable(Boolean(caps?.torch));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Не удалось открыть камеру";
      setError(message.includes("Permission") ? "Разреши доступ к камере в настройках браузера." : message);
    }
  }, [facingMode]);

  useEffect(() => {
    void start();
    return () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const flip = () => setFacingMode((v) => v === "environment" ? "user" : "environment");

  const setZoom = async (value: number) => {
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ zoom: value } as MediaTrackConstraintSet] });
      setZoomState(value);
    } catch { /* iOS Safari может игнорировать zoom */ }
  };

  const toggleTorch = async () => {
    const track = stream?.getVideoTracks()[0];
    if (!track || !torchAvailable) return;
    try {
      const next = !torch;
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorch(next);
    } catch { /* не все камеры позволяют torch */ }
  };

  return { videoRef, facingMode, stream, error, zoom, zoomRange, torchAvailable, torch, flip, setZoom, toggleTorch, restart: start, stop };
}
