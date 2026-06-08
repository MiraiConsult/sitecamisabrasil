// Configuração central do produto e da loja.

export const STORE = {
  name: "RR Uniformes",
  legalName: "RR Uniformes Esportivos",
  slogan: "Tecnologia e Performance",
  site: "https://rr-uniformes-esportivos-779301313898.us-west1.run.app/",
};

export const PRODUCT = {
  name: "Camiseta Brasil Retrô",
  collection: "Coleção Brasil Retrô",
  // Preço unitário em centavos para evitar erros de ponto flutuante.
  priceCents: 8990, // R$ 89,90
};

// Preço unitário em reais (89.9).
export const UNIT_PRICE = PRODUCT.priceCents / 100;

export type SizeGroup = {
  label: string;
  hint: string;
  sizes: string[];
};

// Tamanhos definidos pela loja: infantil (por idade) + adulto.
export const SIZE_GROUPS: SizeGroup[] = [
  {
    label: "Infantil",
    hint: "Tamanho por idade",
    sizes: ["1", "2", "3", "4", "6", "8", "10", "12", "14"],
  },
  {
    label: "Adulto",
    hint: "Tamanhos PP ao G",
    sizes: ["PP", "P", "M", "G"],
  },
];

export const ALL_SIZES: string[] = SIZE_GROUPS.flatMap((g) => g.sizes);
