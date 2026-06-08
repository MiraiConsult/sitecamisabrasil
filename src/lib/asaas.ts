// Cliente mínimo para a API do Asaas (https://docs.asaas.com).
// A chave de API fica somente no servidor (variável de ambiente ASAAS_API_KEY).

const ENV = process.env.ASAAS_ENV === "production" ? "production" : "sandbox";

const BASE_URL = (
  process.env.ASAAS_BASE_URL ||
  (ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3")
).replace(/\/$/, "");

export class AsaasNotConfiguredError extends Error {
  constructor() {
    super("ASAAS_API_KEY não configurada.");
    this.name = "AsaasNotConfiguredError";
  }
}

function apiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new AsaasNotConfiguredError();
  return key;
}

async function asaasFetch(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey(),
      "User-Agent": "RR Uniformes Store",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      data?.errors?.[0]?.description ||
      data?.message ||
      `Erro na comunicação com o Asaas (HTTP ${res.status}).`;
    throw new Error(message);
  }

  return data;
}

export type AsaasCustomerInput = {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
};

export async function createCustomer(input: AsaasCustomerInput): Promise<any> {
  return asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type CreatePaymentInput = {
  customer: string;
  value: number;
  description: string;
  externalReference: string;
  dueDate: string; // YYYY-MM-DD
  callbackSuccessUrl?: string;
};

export async function createPayment(input: CreatePaymentInput): Promise<any> {
  const body: Record<string, unknown> = {
    customer: input.customer,
    billingType: "UNDEFINED", // o cliente escolhe PIX, boleto ou cartão na página do Asaas
    value: input.value,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
  };

  if (input.callbackSuccessUrl) {
    body.callback = {
      successUrl: input.callbackSuccessUrl,
      autoRedirect: true,
    };
  }

  return asaasFetch("/payments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getPayment(id: string): Promise<any> {
  return asaasFetch(`/payments/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function getPaymentByExternalReference(
  ref: string
): Promise<any | null> {
  const data = await asaasFetch(
    `/payments?externalReference=${encodeURIComponent(ref)}&limit=10`,
    { method: "GET" }
  );
  const list: any[] = data?.data || [];
  if (list.length === 0) return null;
  // Pega a cobrança mais recente para essa referência.
  list.sort((a, b) =>
    String(b.dateCreated || "").localeCompare(String(a.dateCreated || ""))
  );
  return list[0];
}

export async function listPayments(params?: {
  limit?: number;
  offset?: number;
}): Promise<any> {
  const limit = params?.limit ?? 100;
  const offset = params?.offset ?? 0;
  return asaasFetch(`/payments?limit=${limit}&offset=${offset}`, {
    method: "GET",
  });
}

// Status do Asaas que significam "pago".
export const PAID_STATUSES = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"];

export function isPaid(status: string): boolean {
  return PAID_STATUSES.includes(status);
}

export function asaasEnv(): "sandbox" | "production" {
  return ENV;
}
