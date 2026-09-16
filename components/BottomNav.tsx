"use client";
import Link from "next/link";
import { Camera, Images, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/camera", label: "Камера", icon: Camera },
  { href: "/gallery", label: "Галерея", icon: Images },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-4 pb-2">
      <div className="glass flex items-center justify-around rounded-[28px] px-2 py-2 shadow-2xl">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} aria-label={label} className={`flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition ${active ? "bg-white text-black" : "text-white/65"}`}>
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
