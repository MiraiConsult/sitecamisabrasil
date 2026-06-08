import { NextRequest, NextResponse } from "next/server";
import { listPayments, isPaid, AsaasNotConfiguredError } from "@/lib/asaas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_PT: Record<string, string> = {
  PENDING: "Aguardando",
  RECEIVED: "Pago",
  CONFIRMED: "Pago",
  RECEIVED_IN_CASH: "Pago (dinheiro)",
  OVERDUE: "Vencido",
  REFUNDED: "Estornado",
  REFUND_REQUESTED: "Estorno solicitado",
  CHARGEBACK_REQUESTED: "Chargeback",
  AWAITING_RISK_ANALYSIS: "Em análise",
};

const BILLING_PT: Record<string, string> = {
  PIX: "PIX",
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão",
  UNDEFINED: "A escolher",
};

function parseDescription(desc: string) {
  const parts = (desc || "").split(" | ");
  const find = (prefix: string) => {
    const seg = parts.find((s) => s.startsWith(prefix));
    return seg ? seg.slice(prefix.length).trim() : "";
  };

  let quantidade = "";
  let tamanhos = "";
  const itemsSeg = parts[1] || "";
  const m = itemsSeg.match(/^(\d+)\s*un\s*\((.*)\)$/);
  if (m) {
    quantidade = m[1];
    tamanhos = m[2];
  }

  return {
    cliente: find("Cliente:"),
    email: find("Email:"),
    telefone: find("Tel:"),
    entrega: find("Entrega:"),
    quantidade,
    tamanhos,
  };
}

export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "Defina a variável ADMIN_PASSWORD na Vercel para proteger e habilitar esta página.",
      },
      { status: 503 }
    );
  }

  const key = req.headers.get("x-admin-key");
  if (!key || key !== expected) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  try {
    const data = await listPayments({ limit: 100 });
    const list: any[] = data?.data || [];

    const orders = list
      .sort((a, b) =>
        String(b.dateCreated || "").localeCompare(String(a.dateCreated || ""))
      )
      .map((p) => {
        const parsed = parseDescription(p.description || "");
        return {
          id: p.id,
          date: p.dateCreated,
          value: p.value,
          status: p.status,
          statusLabel: STATUS_PT[p.status] || p.status,
          paid: isPaid(p.status),
          billing: BILLING_PT[p.billingType] || p.billingType,
          invoiceUrl: p.invoiceUrl,
          ...parsed,
          descricao: p.description,
        };
      });

    const totalPago = orders
      .filter((o) => o.paid)
      .reduce((s, o) => s + (o.value || 0), 0);
    const qtdPaga = orders.filter((o) => o.paid).length;

    return NextResponse.json({
      orders,
      total: orders.length,
      totalCount: data?.totalCount ?? orders.length,
      totalPago,
      qtdPaga,
    });
  } catch (err: unknown) {
    if (err instanceof AsaasNotConfiguredError) {
      return NextResponse.json(
        { error: "Pagamento não configurado (ASAAS_API_KEY ausente)." },
        { status: 503 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Erro ao buscar os pedidos.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
