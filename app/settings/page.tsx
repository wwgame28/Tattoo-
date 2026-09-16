"use client";

import { BottomNav } from "@/components/BottomNav";
import { useSettings } from "@/lib/store";
import { Bot, Grid3X3, Mic2, ScanLine, Smartphone } from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-8 w-14 rounded-full transition ${checked ? "bg-lime-300" : "bg-white/15"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-7" : "left-1"}`} /></button>;
}

export default function SettingsPage() {
  const s = useSettings();
  const rows = [
    { icon: ScanLine, title: "Автоснимок", text: "Снимать после стабилизации хорошего кадра", value: s.autoCapture, set: s.setAutoCapture },
    { icon: Mic2, title: "Голосовые подсказки", text: "Озвучивать главную рекомендацию", value: s.voice, set: s.setVoice },
    { icon: Grid3X3, title: "Сетка третей", text: "Показывать композиционную сетку", value: s.grid, set: s.setGrid },
    { icon: Bot, title: "AI-разбор фото", text: "После снимка отправлять уменьшенную копию в Hugging Face", value: s.aiReview, set: s.setAiReview },
  ];

  return (
    <main className="min-h-dvh bg-[#080a0d] px-4 pb-32 text-white safe-top">
      <header className="mx-auto max-w-xl pt-4"><p className="text-xs uppercase tracking-[0.22em] text-lime-300">FrameGuide</p><h1 className="mt-2 text-3xl font-semibold">Настройки</h1></header>
      <section className="mx-auto mt-7 max-w-xl overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04]">
        {rows.map(({ icon: Icon, title, text, value, set }, i) => <div key={title} className={`flex items-center gap-4 p-4 ${i ? "border-t border-white/10" : ""}`}><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/8"><Icon size={20}/></div><div className="min-w-0 flex-1"><div className="font-medium">{title}</div><div className="mt-0.5 text-xs leading-relaxed text-white/45">{text}</div></div><Toggle checked={value} onChange={set}/></div>)}
      </section>

      <section className="mx-auto mt-5 max-w-xl rounded-[30px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3"><Smartphone className="text-lime-300"/><div><h2 className="font-semibold">Установка на iPhone</h2><p className="text-xs text-white/45">Safari → Поделиться → На экран «Домой»</p></div></div>
        <p className="mt-4 text-xs leading-relaxed text-white/55">Локальные метрики кадра и галерея работают без HF_TOKEN. Для облачного AI-разбора добавь переменную окружения <code className="rounded bg-white/10 px-1.5 py-0.5">HF_TOKEN</code> на Vercel.</p>
      </section>
      <BottomNav />
    </main>
  );
}
