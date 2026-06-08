"use client";

import { useState } from "react";

// As 3 fotos reais do produto (em /public/produto). Todas sempre visíveis,
// lado a lado no desktop e empilhadas no celular — sem miniaturas e sem clique.
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {IMAGES.map((img, i) =>
        hidden[i] ? null : (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            loading={i === 0 ? "eager" : "lazy"}
            onError={() => setHidden((h) => ({ ...h, [i]: true }))}
            className="w-full rounded-2xl shadow-2xl"
          />
        )
      )}
    </div>
  );
}
