"use client";

import { useState } from "react";

// As fotos reais do produto (em /public/produto). Todas sempre visíveis,
// lado a lado no desktop e empilhadas no celular — sem miniaturas e sem clique.
// O layout se adapta à quantidade de fotos disponíveis (2 ou 3).
const IMAGES = [
  {
    src: "/produto/1.jpg",
    alt: "Camiseta Brasil Retrô — frente e costas, número 10",
  },
  {
    src: "/produto/2.jpg",
    alt: "Camiseta Brasil Retrô em ação no estádio",
  },
  {
    src: "/produto/3.jpg",
    alt: "Coleção Brasil Retrô da RR Uniformes",
  },
];

export function ProductGallery() {
  const [hidden, setHidden] = useState<Record<number, boolean>>({});

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {IMAGES.map((img, i) =>
        hidden[i] ? null : (
          <div key={img.src} className="sm:min-w-0 sm:flex-1">
            <img
              src={img.src}
              alt={img.alt}
              loading={i === 0 ? "eager" : "lazy"}
              onError={() => setHidden((h) => ({ ...h, [i]: true }))}
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        )
      )}
    </div>
  );
}
