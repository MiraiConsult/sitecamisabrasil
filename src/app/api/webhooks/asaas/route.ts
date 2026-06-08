import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Endpoint de webhook do Asaas.
//
// A confirmação ao cliente acontece na própria tela de sucesso (que consulta o
// status do pagamento em tempo real). Este webhook fica disponível para registro
// e para evoluções futuras (ex.: disparar e-mail/WhatsApp, gravar em banco).
//
// Se ASAAS_WEBHOOK_TOKEN estiver definido, validamos o header asaas-access-token.
export async function POST(req: NextRequest) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (expected) {
    const received = req.headers.get("asaas-access-token");
    if (received !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let event: any = null;
  try {
    event = await req.json();
  } catch {
    // corpo vazio/ inválido — apenas confirmamos o recebimento
  }

  if (event?.event) {
    console.log(
      "[asaas webhook]",
      event.event,
      "payment=",
      event?.payment?.id,
      "status=",
      event?.payment?.status,
      "ref=",
      event?.payment?.externalReference
    );
  }

  return NextResponse.json({ received: true });
}
