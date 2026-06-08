import { NextRequest, NextResponse } from "next/server";
import {
  getPayment,
  getPaymentByExternalReference,
  isPaid,
  AsaasNotConfiguredError,
} from "@/lib/asaas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");
  const id = searchParams.get("id");

  if (!ref && !id) {
    return NextResponse.json(
      { error: "Informe o pedido (ref ou id)." },
      { status: 400 }
    );
  }

  try {
    const payment = id
      ? await getPayment(id)
      : await getPaymentByExternalReference(ref as string);

    if (!payment) {
      return NextResponse.json(
        { status: "NOT_FOUND", paid: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: payment.status,
      paid: isPaid(payment.status),
      value: payment.value,
      description: payment.description,
      invoiceUrl: payment.invoiceUrl,
      dueDate: payment.dueDate,
      billingType: payment.billingType,
    });
  } catch (err: unknown) {
    if (err instanceof AsaasNotConfiguredError) {
      return NextResponse.json(
        { error: "Pagamento não configurado.", status: "NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Erro ao consultar o pagamento.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
