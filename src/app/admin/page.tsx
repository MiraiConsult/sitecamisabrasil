"use client";

import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/format";
import { RRLogo } from "@/components/RRLogo";

type Order = {
  id: string;
  date: string;
  value: number;
  status: string;
  statusLabel: string;
  paid: boolean;
  billing: string;
  invoiceUrl?: string;
  cliente: string;
  email: string;
  telefone: string;
  entrega: string;
  tipo: string;
  frete: string;
  modelagem: string;
  quantidade: string;
  tamanhos: string;
  descricao: string;
};

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPago, setTotalPago] = useState(0);
  const [qtdPaga, setQtdPaga] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rr_admin_key");
    if (saved) {
      setKey(saved);
      load(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(k: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-key": k },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar.");
      setOrders(data.orders || []);
      setTotalPago(data.totalPago || 0);
      setQtdPaga(data.qtdPaga || 0);
      setAuthed(true);
      localStorage.setItem("rr_admin_key", k);
    } catch (e) {
      setAuthed(false);
      localStorage.removeItem("rr_admin_key");
      setError(e instanceof Error ? e.message : "Erro.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("rr_admin_key");
    setAuthed(false);
    setKey("");
    setOrders([]);
  }

  async function clearOrders(scope: "all" | "unpaid") {
    const msg =
      scope === "all"
        ? "Apagar TODOS os pedidos? Esta ação é irreversível."
        : "Apagar todos os pedidos NÃO pagos?";
    if (!window.confirm(msg)) return;
    if (
      scope === "all" &&
      !window.confirm("Tem certeza mesmo? Não dá para desfazer.")
    )
      return;

    setClearing(true);
    try {
      const res = await fetch("/api/admin/orders/clear", {
        method: "POST",
        headers: { "x-admin-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao apagar.");
      window.alert(
        `Pronto! Apagados: ${data.deleted}.` +
          (data.failed
            ? ` Não apagados (ex.: já pagos): ${data.failed}.`
            : "")
      );
      load(key);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Erro ao apagar.");
    } finally {
      setClearing(false);
    }
  }

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(key);
          }}
          className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex justify-center">
            <RRLogo />
          </div>
          <h1 className="mb-1 text-center text-xl font-extrabold text-neutral-900">
            Painel de Pedidos
          </h1>
          <p className="mb-5 text-center text-sm text-neutral-500">
            Acesso restrito da loja
          </p>
          <label className="label" htmlFor="key">
            Senha de acesso
          </label>
          <input
            id="key"
            type="password"
            className="input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="••••••••"
            autoFocus
          />
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary mt-4 w-full"
            disabled={loading}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <RRLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(key)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
              disabled={loading}
            >
              {loading ? "Atualizando…" : "Atualizar"}
            </button>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-extrabold text-neutral-900">Pedidos</h1>

        {/* Resumo */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card label="Total de pedidos" value={String(orders.length)} />
          <Card label="Pedidos pagos" value={String(qtdPaga)} accent />
          <Card label="Recebido (pagos)" value={formatBRL(totalPago)} accent />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
            Nenhum pedido ainda. Assim que alguém finalizar uma compra, aparece
            aqui.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <Th>Data</Th>
                  <Th>Cliente</Th>
                  <Th>Contato</Th>
                  <Th>Tamanhos</Th>
                  <Th>Entrega</Th>
                  <Th>Valor</Th>
                  <Th>Status</Th>
                  <Th>Pgto</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((o) => (
                  <tr key={o.id} className="align-top hover:bg-neutral-50/60">
                    <Td className="whitespace-nowrap text-neutral-500">
                      {formatDate(o.date)}
                    </Td>
                    <Td className="font-semibold text-neutral-900">
                      {o.cliente || "—"}
                    </Td>
                    <Td className="text-neutral-600">
                      <div className="whitespace-nowrap">{o.telefone}</div>
                      <div className="text-xs text-neutral-400">{o.email}</div>
                    </Td>
                    <Td className="text-neutral-700">
                      <span className="font-semibold">{o.quantidade}un</span>{" "}
                      <span className="text-neutral-500">{o.tamanhos}</span>
                      {o.modelagem && (
                        <div className="text-xs text-neutral-400">
                          {o.modelagem}
                        </div>
                      )}
                    </Td>
                    <Td className="max-w-[260px] text-xs text-neutral-600">
                      {o.tipo === "Retirada" ? (
                        <span className="font-semibold text-brasil-greenDark">
                          🏬 Retirada na loja
                        </span>
                      ) : (
                        o.entrega
                      )}
                    </Td>
                    <Td className="whitespace-nowrap font-bold text-neutral-900">
                      {formatBRL(o.value)}
                    </Td>
                    <Td>
                      <StatusBadge label={o.statusLabel} paid={o.paid} />
                    </Td>
                    <Td className="whitespace-nowrap text-neutral-600">
                      {o.billing}
                      {o.invoiceUrl && (
                        <a
                          href={o.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-xs font-semibold text-brasil-green hover:underline"
                        >
                          ver
                        </a>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-neutral-400">
          Dados em tempo real do Asaas. Mostra os 100 pedidos mais recentes.
        </p>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/50 p-4">
          <h3 className="font-bold text-red-700">Zona de perigo</h3>
          <p className="mt-1 text-sm text-red-600/80">
            Apaga pedidos no Asaas. Use para limpar dados de teste antes de
            começar a vender de verdade. Pedidos já pagos podem não ser apagados
            pelo Asaas.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => clearOrders("unpaid")}
              disabled={clearing}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              {clearing ? "Apagando…" : "Apagar não pagos"}
            </button>
            <button
              onClick={() => clearOrders("all")}
              disabled={clearing}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {clearing ? "Apagando…" : "Apagar TODOS"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-brasil-green/20 bg-brasil-green/5"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-neutral-900">
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusBadge({ label, paid }: { label: string; paid: boolean }) {
  const cls = paid
    ? "bg-brasil-green/15 text-brasil-greenDark"
    : label === "Vencido"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}
    >
      {label}
    </span>
  );
}
