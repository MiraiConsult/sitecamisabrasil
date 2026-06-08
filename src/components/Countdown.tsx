"use client";

import { useEffect, useState } from "react";
import { ORDER_DEADLINE } from "@/lib/config";

function diff() {
  return ORDER_DEADLINE.getTime() - Date.now();
}

export function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState(0);

  useEffect(() => {
    setMounted(true);
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  // Antes de montar no cliente, mostra um placeholder estável (sem hidratação divergente).
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-sm font-semibold text-brasil-yellow">
        ⚡ Pedidos só até 15/06
      </div>
    );
  }

  if (t <= 0) {
    return (
      <div className="rounded-lg bg-red-500/15 px-3 py-1.5 text-sm font-bold text-red-200 ring-1 ring-red-400/30">
        ⛔ Pedidos encerrados
      </div>
    );
  }

  const d = Math.floor(t / 86400000);
  const h = Math.floor((t % 86400000) / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-bold uppercase tracking-wide text-brasil-yellow">
        ⚡ Encerra em
      </span>
      <div className="flex items-center gap-1.5">
        <Box value={d} label="dias" />
        <Sep />
        <Box value={h} label="h" />
        <Sep />
        <Box value={m} label="min" />
        <Sep />
        <Box value={s} label="seg" />
      </div>
    </div>
  );
}

function Box({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[2.2rem] rounded-md bg-white/10 px-1.5 py-1 text-center font-display text-lg leading-none tabular-nums text-white ring-1 ring-white/15">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/60">
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return <span className="pb-3 font-display text-lg text-white/40">:</span>;
}
