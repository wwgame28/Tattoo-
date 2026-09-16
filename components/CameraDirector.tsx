"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera as CameraIcon, FlipHorizontal2, Lightbulb, RotateCcw, Sparkles, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useVisionModels } from "@/hooks/useVisionModels";
import { analyzePixels, buildGuidance } from "@/lib/camera-analysis";
import { savePhoto, updateAiReview } from "@/lib/db";
import type { FrameMetrics, Guidance, SubjectBox } from "@/lib/types";
import { useSettings } from "@/lib/store";

const EMPTY_METRICS: FrameMetrics = { brightness: 128, contrast: 40, sharpness: 30, motion: 20, horizonAngle: 0 };

function scoreTone(score: number) {
  if (score >= 88) return "bg-lime-300 text-black";
  if (score >= 68) return "bg-amber-300 text-black";
  return "bg-red-400 text-white";
}

function mapToCover(x: number, y: number, w: number, h: number, sourceW: number, sourceH: number, viewW: number, viewH: number) {
  if (!sourceW || !sourceH || !viewW || !viewH) return { x, y, width: w, height: h };
  const scale = Math.max(viewW / sourceW, viewH / sourceH);
  const displayW = sourceW * scale;
  const displayH = sourceH * scale;
  const offsetX = (viewW - displayW) / 2;
  const offsetY = (viewH - displayH) / 2;
  return {
    x: (offsetX + x * displayW) / viewW,
    y: (offsetY + y * displayH) / viewH,
    width: (w * displayW) / viewW,
    height: (h * displayH) / viewH,
  };
}

export function CameraDirector() {
  const { videoRef, error, flip, restart, zoom, zoomRange, setZoom, torchAvailable, torch, toggleTorch, facingMode } = useCamera();
  const { status: visionStatus, detect } = useVisionModels();
  const { autoCapture, voice, grid, aiReview } = useSettings();
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<FrameMetrics>(EMPTY_METRICS);
  const [subject, setSubject] = useState<SubjectBox>();
  const [guidance, setGuidance] = useState<Guidance>(() => buildGuidance(EMPTY_METRICS));
  const [flash, setFlash] = useState(false);
  const [lastShot, setLastShot] = useState<string | null>(null);
  const [stableSince, setStableSince] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);
  const lastSpoken = useRef("");
  const lastAutoShot = useRef(0);
  const [viewport, setViewport] = useState({ width: 1, height: 1 });

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const runMetrics = useCallback(() => {
    const video = videoRef.current;
    const canvas = analysisCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    const w = 192;
    const h = Math.max(108, Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const next = analyzePixels(ctx, w, h);
    setMetrics(next);
  }, [videoRef]);

  useEffect(() => {
    const id = window.setInterval(runMetrics, 320);
    return () => window.clearInterval(id);
  }, [runMetrics]);

  useEffect(() => {
    if (visionStatus !== "ready") return;
    let busy = false;
    const id = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || busy) return;
      busy = true;
      try { setSubject(await detect(video)); } catch { setSubject(undefined); } finally { busy = false; }
    }, 800);
    return () => window.clearInterval(id);
  }, [detect, videoRef, visionStatus]);

  useEffect(() => {
    const next = buildGuidance(metrics, subject);
    setGuidance(next);
    const stable = next.score >= 90 && metrics.motion < 7 && metrics.sharpness >= 18;
    setStableSince((since) => stable ? (since ?? Date.now()) : null);
  }, [metrics, subject]);

  useEffect(() => {
    if (!voice || guidance.status === "good" || guidance.headline === lastSpoken.current) return;
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(guidance.headline);
    utterance.lang = "ru-RU";
    utterance.rate = 1.04;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    lastSpoken.current = guidance.headline;
  }, [guidance, voice]);

  const capture = useCallback(async (automatic = false) => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas || video.readyState < 2 || capturing) return;
    if (automatic && Date.now() - lastAutoShot.current < 4500) return;

    setCapturing(true);
    if (automatic) lastAutoShot.current = Date.now();
    try {
      const sourceW = video.videoWidth;
      const sourceH = video.videoHeight;
      const maxW = 1920;
      const scale = Math.min(1, maxW / sourceW);
      canvas.width = Math.round(sourceW * scale);
      canvas.height = Math.round(sourceH * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) return;
      const id = crypto.randomUUID();
      await savePhoto({
        id,
        createdAt: Date.now(),
        blob,
        width: canvas.width,
        height: canvas.height,
        score: guidance.score,
        localAdvice: `${guidance.headline}. ${guidance.detail}`,
      });

      const url = URL.createObjectURL(blob);
      setLastShot((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
      setFlash(true);
      window.setTimeout(() => setFlash(false), 130);

      if (aiReview) {
        const aiCanvas = document.createElement("canvas");
        const aiScale = Math.min(1, 1280 / canvas.width);
        aiCanvas.width = Math.round(canvas.width * aiScale);
        aiCanvas.height = Math.round(canvas.height * aiScale);
        aiCanvas.getContext("2d")?.drawImage(canvas, 0, 0, aiCanvas.width, aiCanvas.height);
        const aiBlob = await new Promise<Blob | null>((resolve) => aiCanvas.toBlob(resolve, "image/jpeg", 0.78));
        if (aiBlob) {
          const form = new FormData();
          form.append("image", aiBlob, "frame.jpg");
          fetch("/api/ai-review", { method: "POST", body: form })
            .then(async (res) => res.ok ? res.json() : Promise.reject())
            .then(async (data: { review?: string }) => { if (data.review) await updateAiReview(id, data.review); })
            .catch(() => undefined);
        }
      }
    } finally {
      setCapturing(false);
    }
  }, [aiReview, capturing, guidance, videoRef]);

  useEffect(() => {
    if (!autoCapture || !stableSince || capturing) return;
    if (Date.now() - stableSince < 1100) return;
    void capture(true);
  }, [autoCapture, stableSince, capturing, capture, metrics]);

  const displaySubject = useMemo(() => {
    if (!subject) return undefined;
    const video = videoRef.current;
    const mapped = mapToCover(subject.x, subject.y, subject.width, subject.height, video?.videoWidth || 1, video?.videoHeight || 1, viewport.width, viewport.height);
    return facingMode === "user" ? { ...subject, ...mapped, x: 1 - mapped.x - mapped.width } : { ...subject, ...mapped };
  }, [subject, facingMode, videoRef, viewport]);

  const displayTarget = useMemo(() => {
    if (!guidance.target) return undefined;
    const video = videoRef.current;
    const mapped = mapToCover(guidance.target.x, guidance.target.y, 0, 0, video?.videoWidth || 1, video?.videoHeight || 1, viewport.width, viewport.height);
    return facingMode === "user" ? { x: 1 - mapped.x, y: mapped.y } : { x: mapped.x, y: mapped.y };
  }, [guidance.target, facingMode, videoRef, viewport]);

  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#080a0d] px-6 text-center">
        <div className="glass max-w-sm rounded-[32px] p-7">
          <CameraIcon className="mx-auto mb-4" size={38} />
          <h1 className="text-xl font-semibold">Камера недоступна</h1>
          <p className="mt-2 text-sm text-white/60">{error}</p>
          <button onClick={() => void restart()} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black"><RotateCcw size={18} /> Повторить</button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <video ref={videoRef} muted playsInline className={`absolute inset-0 h-full w-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`} />
      <canvas ref={analysisCanvasRef} className="hidden" />
      <canvas ref={captureCanvasRef} className="hidden" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/65" />

      {grid && <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute left-1/3 top-0 h-full w-px bg-white" /><div className="absolute left-2/3 top-0 h-full w-px bg-white" />
        <div className="absolute top-1/3 left-0 h-px w-full bg-white" /><div className="absolute top-2/3 left-0 h-px w-full bg-white" />
      </div>}

      {displaySubject && (
        <motion.div
          className="pointer-events-none absolute rounded-3xl border-2 border-lime-300/90 shadow-[0_0_28px_rgba(217,255,99,.18)]"
          animate={{ left: `${displaySubject.x * 100}%`, top: `${displaySubject.y * 100}%`, width: `${displaySubject.width * 100}%`, height: `${displaySubject.height * 100}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        >
          <span className="absolute -top-7 left-0 rounded-full bg-black/65 px-2 py-1 text-[10px] uppercase tracking-widest text-lime-200">{displaySubject.label}</span>
        </motion.div>
      )}

      {displayTarget && <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${displayTarget.x * 100}%`, top: `${displayTarget.y * 100}%` }}>
        <div className="h-8 w-8 rounded-full border border-lime-200/80"><div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-200" /></div>
      </div>}

      <div className="safe-top absolute inset-x-0 top-0 z-20 px-4">
        <div className="flex items-center justify-between">
          <div className="glass flex items-center gap-2 rounded-full px-3 py-2 text-xs">
            <Sparkles size={15} className="text-lime-300" />
            <span>{visionStatus === "ready" ? "Vision AI" : visionStatus === "loading" ? "AI загружается" : "Локальный режим"}</span>
          </div>
          <div className={`rounded-full px-3 py-2 text-sm font-bold ${scoreTone(guidance.score)}`}>{guidance.score}</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={guidance.headline} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="glass mx-auto mt-3 max-w-sm rounded-[24px] px-4 py-3 text-center">
            <div className="text-[15px] font-semibold">{guidance.headline}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/60">{guidance.detail}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <button onClick={flip} aria-label="Сменить камеру" className="glass grid h-12 w-12 place-items-center rounded-full"><FlipHorizontal2 size={20} /></button>
        {zoomRange.max > zoomRange.min && (
          <div className="glass flex h-12 items-center rounded-full px-3">
            <input aria-label="Зум" type="range" min={zoomRange.min} max={zoomRange.max} step={zoomRange.step} value={zoom} onChange={(e: { target: { value: string } }) => void setZoom(Number(e.target.value))} className="w-24 accent-lime-300" />
          </div>
        )}
        <button disabled={!torchAvailable} onClick={() => void toggleTorch()} aria-label="Фонарик" className={`glass grid h-12 w-12 place-items-center rounded-full ${!torchAvailable ? "opacity-35" : torch ? "text-lime-300" : ""}`}><Zap size={20} fill={torch ? "currentColor" : "none"} /></button>
      </div>

      <div className="safe-bottom absolute inset-x-0 bottom-2 z-30 flex items-center justify-center px-6 pb-16">
        <div className="grid w-full max-w-sm grid-cols-3 items-center">
          <div className="flex justify-start">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/20 bg-white/10">{lastShot ? <img src={lastShot} alt="Последний снимок" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center"><Lightbulb size={18} className="text-white/35" /></div>}</div>
          </div>
          <div className="flex justify-center">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => void capture(false)} aria-label="Сделать снимок" className="grid h-[76px] w-[76px] place-items-center rounded-full border-[5px] border-white bg-white/20 shadow-2xl">
              <div className="h-[58px] w-[58px] rounded-full bg-white" />
            </motion.button>
          </div>
          <div className="flex justify-end"><div className="glass rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white/65">{autoCapture ? "Auto" : "Manual"}</div></div>
        </div>
      </div>

      <AnimatePresence>{flash && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-[90] bg-white" />}</AnimatePresence>
    </main>
  );
}
