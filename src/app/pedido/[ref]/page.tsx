"use client";

import { useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/format";
import { RRLogo } from "@/components/RRLogo";
import { PRODUCTION_LABEL, PICKUP } from "@/lib/config";

type StatusData = {
  status: string;
  paid: boolean;
  value?: number;
  invoiceUrl?: string;
  dueDate?: string;
  description?: string;
  error?: string;
};

type Screen = "loading" | "pending" | "paid" | "notfound" | "error";

export default function PedidoPage({ params }: { params: { ref: string } }) {
  const ref = decodeURIComponent(params.ref);
  const [screen, setScreen] = useState<Screen>("loading");
  const [data, setData] = useState<StatusData | null>(null);
  const notFound = useRef(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(check, 4000);
    };

    async function check() {
      try {
        const res = await fetch(
          `/api/payments/status?ref=${encodeURIComponent(ref)}`,
          { cache: "no-store" }
        );
        const json: StatusData = await res.json();
        if (!active) return;

        if (res.status === 404) {
          notFound.current += 1;
          if (notFound.current > 5) {
            setScreen("notfound");
            return;
          }
          schedule();
          return;
        }
        if (res.status === 503) {
          setData(json);
          setScreen("error");
          return;
        }
        if (!res.ok) {
          setData(json);
          setScreen("error");
          return;
        }

        setData(json);
        if (json.paid) {
          setScreen("paid");
          return; // para o polling
        }
        setScreen("pending");
        schedule();
      } catch {
        if (!active) return;
        schedule();
      }
    }

    check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [ref]);

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <a href="/">
            <RRLogo />
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          {screen === "loading" && <Loading />}
          {screen === "pending" && <Pending data={data} />}
          {screen === "paid" && <Paid data={data} />}
          {screen === "notfound" && <NotFound />}
          {screen === "error" && <ErrorBox data={data} />}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Pedido <span className="font-mono">{ref}</span>
        </p>
      </div>
    </main>
  );
}

function Loading() {
  return (
    <div className="py-6">
      <Spinner className="mx-auto h-10 w-10 text-brasil-green" />
      <p className="mt-4 font-semibold text-neutral-700">
        Carregando seu pedido…
      </p>
    </div>
  );
}

function Pending({ data }: { data: StatusData | null }) {
  return (
    <div>
      <Spinner className="mx-auto h-10 w-10 text-brasil-green" />
      <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">
        Aguardando o pagamento
      </h1>
      {typeof data?.value === "number" && (
        <p className="mt-1 text-neutral-600">
          Valor total:{" "}
          <span className="font-bold text-neutral-900">
            {formatBRL(data.value)}
          </span>
        </p>
      )}
      <p className="mt-3 text-sm text-neutral-500">
        Esta página atualiza sozinha assim que o pagamento for confirmado. Pode
        deixar aberta. 😉
      </p>

      {data?.invoiceUrl && (
        <a
          href={data.invoiceUrl}
          className="btn-primary mt-6 w-full"
          target="_self"
        >
          Pagar agora (PIX, boleto ou cartão)
        </a>
      )}
    </div>
  );
}

function Paid({ data }: { data: StatusData | null }) {
  const isPickup = (data?.description || "").includes("Retirada");
  return (
    <div>
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brasil-green/15">
        <svg
          className="h-9 w-9 text-brasil-green"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-neutral-900">
        Pagamento confirmado! 🎉
      </h1>
      {typeof data?.value === "number" && (
        <p className="mt-1 text-neutral-600">
          Recebemos {formatBRL(data.value)}.
        </p>
      )}
      <p className="mx-auto mt-4 max-w-sm text-neutral-600">
        {isPickup ? (
          <>
            Seu pedido foi confirmado! Assim que ficar pronto, você{" "}
            <span className="font-semibold text-neutral-900">
              retira na loja
            </span>
            . Obrigado por comprar com a RR Uniformes!
          </>
        ) : (
          <>
            Seu pedido foi confirmado e será{" "}
            <span className="font-semibold text-neutral-900">
              entregue no endereço informado
            </span>{" "}
            (Itajaí). Obrigado por comprar com a RR Uniformes!
          </>
        )}
      </p>

      <div className="mt-6 rounded-xl bg-brasil-green/5 px-4 py-3 text-sm text-brasil-greenDark">
        🛠️ Seu pedido fica pronto em até <strong>{PRODUCTION_LABEL}</strong>.
        Avisaremos quando estiver pronto
        {isPickup ? " para retirada." : " e a caminho."}
      </div>

      {isPickup && (
        <div className="mt-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm text-neutral-700">
          <div className="font-bold text-neutral-900">
            Endereço de retirada
          </div>
          <div>
            {PICKUP.name} — {PICKUP.address}
          </div>
          <div className="text-neutral-500">{PICKUP.hours}</div>
        </div>
      )}

      <a
        href="/"
        className="mt-6 inline-block text-sm font-semibold text-brasil-green hover:underline"
      >
        Voltar à página inicial
      </a>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-4">
      <h1 className="text-2xl font-extrabold text-neutral-900">
        Pedido não encontrado
      </h1>
      <p className="mt-3 text-neutral-600">
        Não localizamos este pedido. Ele pode ainda estar sendo processado ou o
        link está incorreto.
      </p>
      <a
        href="/"
        className="btn-primary mt-6 inline-flex"
      >
        Fazer um novo pedido
      </a>
    </div>
  );
}

function ErrorBox({ data }: { data: StatusData | null }) {
  return (
    <div className="py-4">
      <h1 className="text-2xl font-extrabold text-neutral-900">
        Não foi possível verificar o pagamento
      </h1>
      <p className="mt-3 text-neutral-600">
        {data?.error ||
          "Tente atualizar a página em alguns instantes. Se o problema continuar, fale com a loja."}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary mt-6"
      >
        Atualizar
      </button>
    </div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}
