"use client";

import { useState } from "react";
import { Jersey } from "./Jersey";

type GalleryImage = { src: string; alt: string; caption: string };

// As fotos reais ficam em /public/produto (1.jpg ... 4.jpg).
// Enquanto não existirem, cada item mostra um placeholder com a arte da camisa.
const IMAGES: GalleryImage[] = [
  {
    src: "/produto/1.jpg",
    alt: "Camiseta Brasil Retrô — frente e costas, número 10",
    caption: "Frente e costas",
  },
  {
    src: "/produto/2.jpg",
    alt: "Camiseta Brasil Retrô em campo",
    caption: "Em ação",
  },
  {
    src: "/produto/3.jpg",
    alt: "Coleção Brasil Retrô — RR Uniformes",
    caption: "A coleção",
  },
  {
    src: "/produto/4.jpg",
    alt: "Detalhe da Camiseta Brasil Retrô",
    caption: "Detalhe",
  },
];

export function ProductGallery() {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const markFailed = (i: number) =>
    setFailed((f) => (f[i] ? f : { ...f, [i]: true }));

  return (
    <div className="w-full">
      {/* Imagem principal */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-rr-navy ring-1 ring-white/10">
        {failed[active] ? (
          <Placeholder />
        ) : (
          <img
            src={IMAGES[active].src}
            alt={IMAGES[active].alt}
            onError={() => markFailed(active)}
            className="h-full w-full object-contain"
          />
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {IMAGES[active].caption}
        </span>
      </div>

      {/* Miniaturas */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ver ${img.caption}`}
            className={`relative h-16 w-16 flex-none overflow-hidden rounded-xl ring-2 transition ${
              i === active
                ? "ring-brasil-yellow"
                : "opacity-70 ring-transparent hover:opacity-100"
            }`}
          >
            {failed[i] ? (
              <MiniPlaceholder />
            ) : (
              <img
                src={img.src}
                alt={img.alt}
                onError={() => markFailed(i)}
                className="h-full w-full object-cover"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Placeholder() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-rr-navy">
      <div className="absolute inset-0 opacity-[0.15] stripes-brasil" />
      <Jersey className="relative z-10 w-2/3" />
      <span className="relative z-10 mt-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/20">
        Foto real em breve
      </span>
    </div>
  );
}

function MiniPlaceholder() {
  return (
    <div className="relative grid h-full w-full place-items-center bg-rr-navy">
      <div className="absolute inset-0 opacity-20 stripes-brasil" />
    </div>
  );
}
