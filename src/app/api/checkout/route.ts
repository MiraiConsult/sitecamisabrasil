import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { UNIT_PRICE, PRODUCT, ALL_SIZES } from "@/lib/config";
import {
  createCustomer,
  createPayment,
  AsaasNotConfiguredError,
} from "@/lib/asaas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 400 }
    );
  }

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Dados inválidos.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const data = parsed.data;

  const totalQty = Object.values(data.items).reduce((a, b) => a + b, 0);
  const totalValue = Number((totalQty * UNIT_PRICE).toFixed(2));

  const breakdown = ALL_SIZES.filter((s) => (data.items[s] || 0) > 0)
    .map((s) => `${data.items[s]}x ${s}`)
    .join(", ");

  const a = data.address;
  const description =
    `${PRODUCT.collection} - ${PRODUCT.name} | ` +
    `${totalQty} un (${breakdown}) | ` +
    `Cliente: ${data.name} | ` +
    `Email: ${data.email} | ` +
    `Tel: ${data.phone} | ` +
    `Entrega: ${a.street}, ${a.number}` +
    `${a.complement ? " - " + a.complement : ""}, ${a.district}, ` +
    `${a.city}/${a.state}, CEP ${a.cep}`;

  // Geramos a referência do pedido nós mesmos, para já saber a URL de retorno.
  const ref = `RR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    const customer = await createCustomer({
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpfCnpj,
      mobilePhone: data.phone,
      postalCode: a.cep,
      address: a.street,
      addressNumber: a.number,
      complement: a.complement || undefined,
      province: a.district,
    });

    const due = new Date();
    due.setDate(due.getDate() + 3);
    const dueDate = due.toISOString().slice(0, 10);

    const payment = await createPayment({
      customer: customer.id,
      value: totalValue,
      description: description.slice(0, 500),
      externalReference: ref,
      dueDate,
      callbackSuccessUrl: `${siteUrl(req)}/pedido/${ref}`,
    });

    return NextResponse.json({
      ref,
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      total: totalValue,
      quantity: totalQty,
    });
  } catch (err: unknown) {
    if (err instanceof AsaasNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            "O meio de pagamento ainda está sendo configurado. Tente novamente em instantes ou fale com a loja.",
        },
        { status: 503 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Erro ao gerar a cobrança.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
