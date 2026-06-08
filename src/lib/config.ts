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
    hint: "Tamanhos PP ao G1",
    sizes: ["PP", "P", "M", "G", "GG", "G1"],
  },
];

export const ALL_SIZES: string[] = SIZE_GROUPS.flatMap((g) => g.sizes);

// ===== Regras de venda =====

// Pedidos abertos até esta data/hora (horário de Brasília, UTC-3).
export const ORDER_DEADLINE_ISO = "2026-06-15T23:59:59-03:00";
export const ORDER_DEADLINE = new Date(ORDER_DEADLINE_ISO);

export function isOrderingClosed(now: number = Date.now()): boolean {
  return now > ORDER_DEADLINE.getTime();
}

// Frete: R$ 10 para entregas; grátis quando o subtotal atinge o limite.
export const SHIPPING_FEE = 10;
export const FREE_SHIPPING_FROM = 100;

export function computeShipping(
  method: "entrega" | "retirada",
  subtotal: number
): number {
  if (method !== "entrega" || subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

// Entrega somente em Itajaí/SC (faixa de CEP 88300-000 a 88319-999).
export const ITAJAI = {
  city: "Itajaí",
  state: "SC",
  cepMin: 88300000,
  cepMax: 88319999,
};

export function isItajaiCep(cepDigits: string): boolean {
  const n = parseInt(cepDigits, 10);
  return Number.isFinite(n) && n >= ITAJAI.cepMin && n <= ITAJAI.cepMax;
}

// Retirada na loja — CONFIRME estes dados com a loja.
export const PICKUP = {
  name: "RR Uniformes",
  address: "Endereço a confirmar — Itajaí/SC",
  hours: "Segunda a sexta, das 9h às 18h",
  mapsUrl: "",
};

// Prazo de produção.
export const PRODUCTION_DAYS = 7; // dias úteis
export const PRODUCTION_LABEL = "7 dias úteis";

// Modelagem (corte) da camiseta.
export type Fit = "masculina" | "feminina";

export const FITS: { value: Fit; label: string; hint: string }[] = [
  { value: "masculina", label: "Masculina", hint: "Modelagem tradicional" },
  { value: "feminina", label: "Feminina", hint: "Baby look" },
];

export function fitLabel(value: string): string {
  return value === "feminina" ? "Feminina (baby look)" : "Masculina";
}
