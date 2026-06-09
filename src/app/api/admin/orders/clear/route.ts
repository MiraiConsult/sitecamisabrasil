import { NextRequest, NextResponse } from "next/server";
import {
  listAllPayments,
  deletePayment,
  isPaid,
  AsaasNotConfiguredError,
} from "@/lib/asaas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function inChunks<T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<void>
) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD não configurada no servidor." },
      { status: 503 }
    );
  }
  const key = req.headers.get("x-admin-key");
  if (!key || key !== expected) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  let scope: "all" | "unpaid" = "all";
  try {
    const body = await req.json();
    if (body?.scope === "unpaid") scope = "unpaid";
  } catch {
    // sem corpo => apaga todos
  }

  try {
    const payments = await listAllPayments(500);
    const targets =
      scope === "unpaid"
        ? payments.filter((p) => !isPaid(p.status))
        : payments;

    let deleted = 0;
    let failed = 0;
    await inChunks(targets, 6, async (p) => {
      try {
        await deletePayment(p.id);
        deleted++;
      } catch {
        failed++;
      }
    });

    return NextResponse.json({
      deleted,
      failed,
      attempted: targets.length,
      scope,
    });
  } catch (err: unknown) {
    if (err instanceof AsaasNotConfiguredError) {
      return NextResponse.json(
        { error: "Pagamento não configurado (ASAAS_API_KEY ausente)." },
        { status: 503 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Erro ao apagar os pedidos.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
