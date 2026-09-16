"use client";

import { BottomNav } from "@/components/BottomNav";
import { deletePhoto, listPhotos } from "@/lib/db";
import type { PhotoRecord } from "@/lib/types";
import { Download, Share2, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PhotoView = PhotoRecord & { url: string };

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoView[]>([]);

  const reload = async () => {
    const records = await listPhotos();
    setPhotos((old) => {
      old.forEach((p) => URL.revokeObjectURL(p.url));
      return records.map((p) => ({ ...p, url: URL.createObjectURL(p.blob) }));
    });
  };

  useEffect(() => {
    void reload();
    return () => setPhotos((old) => { old.forEach((p) => URL.revokeObjectURL(p.url)); return []; });
  }, []);

  const average = useMemo(() => photos.length ? Math.round(photos.reduce((s, p) => s + p.score, 0) / photos.length) : 0, [photos]);

  const remove = async (id: string) => { await deletePhoto(id); await reload(); };
  const download = (p: PhotoView) => {
    const a = document.createElement("a");
    a.href = p.url;
    a.download = `frameguide-${new Date(p.createdAt).toISOString().replace(/[:.]/g, "-")}.jpg`;
    a.click();
  };
  const share = async (p: PhotoView) => {
    if (!navigator.share) return download(p);
    const file = new File([p.blob], "frameguide.jpg", { type: p.blob.type || "image/jpeg" });
    try { await navigator.share({ title: "FrameGuide", files: [file] }); } catch { /* пользователь отменил */ }
  };

  return (
    <main className="min-h-dvh bg-[#080a0d] px-4 pb-32 text-white safe-top">
      <header className="mx-auto max-w-2xl pt-4">
        <p className="text-xs uppercase tracking-[0.22em] text-lime-300">FrameGuide</p>
        <div className="mt-2 flex items-end justify-between"><div><h1 className="text-3xl font-semibold">Галерея</h1><p className="mt-1 text-sm text-white/45">Снимки хранятся локально на устройстве</p></div>{photos.length > 0 && <div className="rounded-full bg-white px-3 py-2 text-sm font-bold text-black">Ø {average}</div>}</div>
      </header>

      <section className="mx-auto mt-7 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {photos.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
            <div className="relative aspect-[4/3] bg-black"><img src={p.url} alt="Снимок FrameGuide" className="h-full w-full object-cover" /><div className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1.5 text-sm font-bold backdrop-blur">{p.score}</div></div>
            <div className="p-4">
              <p className="text-sm font-medium">{p.localAdvice}</p>
              {p.aiReview ? <div className="mt-3 rounded-2xl bg-lime-300/10 p-3 text-xs leading-relaxed text-lime-50"><div className="mb-1 flex items-center gap-1.5 font-semibold text-lime-300"><Sparkles size={14}/> AI-разбор</div>{p.aiReview}</div> : <p className="mt-3 text-xs text-white/35">AI-разбор появится здесь, если настроен HF_TOKEN.</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => void share(p)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-sm font-medium text-black"><Share2 size={16}/> Поделиться</button>
                <button onClick={() => download(p)} aria-label="Скачать" className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10"><Download size={17}/></button>
                <button onClick={() => void remove(p.id)} aria-label="Удалить" className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-red-300"><Trash2 size={17}/></button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {photos.length === 0 && <div className="mx-auto mt-24 max-w-sm text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-white/5 text-3xl">◎</div><h2 className="mt-5 text-xl font-semibold">Пока пусто</h2><p className="mt-2 text-sm text-white/45">Сделай первый кадр — он появится здесь автоматически.</p></div>}
      <BottomNav />
    </main>
  );
}
