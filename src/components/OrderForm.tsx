"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SIZE_GROUPS,
  ALL_SIZES,
  UNIT_PRICE,
  PICKUP,
  PRODUCTION_LABEL,
  FREE_SHIPPING_FROM,
  SHIPPING_FEE,
  FITS,
  computeShipping,
  isItajaiCep,
  isOrderingClosed,
  type Fit,
} from "@/lib/config";
import {
  formatBRL,
  maskCEP,
  maskCPForCNPJ,
  maskPhone,
  onlyDigits,
} from "@/lib/format";

type Items = Record<string, number>;
type Method = "entrega" | "retirada";

const emptyItems: Items = ALL_SIZES.reduce((acc, s) => {
  acc[s] = 0;
  return acc;
}, {} as Items);

export function OrderForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [phone, setPhone] = useState("");

  const [method, setMethod] = useState<Method>("entrega");
  const [fit, setFit] = useState<Fit>("masculina");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");

  const [items, setItems] = useState<Items>(emptyItems);

  const [cepLoading, setCepLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const tick = () => setClosed(isOrderingClosed());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalQty = useMemo(
    () => Object.values(items).reduce((a, b) => a + b, 0),
    [items]
  );
  const subtotal = totalQty * UNIT_PRICE;
  const shipping = computeShipping(method, subtotal);
  const total = subtotal + shipping;

  const cepDigits = onlyDigits(cep);
  const itajaiInvalid =
    method === "entrega" && cepDigits.length === 8 && !isItajaiCep(cepDigits);
  const missingForFree =
    method === "entrega" && subtotal > 0 && subtotal < FREE_SHIPPING_FROM
      ? FREE_SHIPPING_FROM - subtotal
      : 0;

  function setQty(size: string, value: number) {
    setItems((prev) => ({
      ...prev,
      [size]: Math.max(0, Math.min(999, Math.floor(value || 0))),
    }));
  }

  async function lookupCep(value: string) {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.logradouro) setStreet(data.logradouro);
        if (data.bairro) setDistrict(data.bairro);
        if (data.localidade) setCity(data.localidade);
        if (data.uf) setUf(data.uf);
      }
    } catch {
      // silencioso
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (closed) {
      setError("As vendas foram encerradas (prazo até 15/06).");
      return;
    }
    if (totalQty < 1) {
      setError("Escolha a quantidade de pelo menos 1 tamanho.");
      document.getElementById("tamanhos")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (itajaiInvalid) {
      setError("No momento só realizamos entregas em Itajaí (SC).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          cpfCnpj,
          phone,
          fit,
          deliveryMethod: method,
          address:
            method === "entrega"
              ? {
                  cep,
                  street,
                  number,
                  complement,
                  district,
                  city,
                  state: uf,
                }
              : undefined,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível gerar o pagamento.");
      }
      window.location.href = `/pedido/${encodeURIComponent(data.ref)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dados pessoais */}
      <fieldset className="space-y-4">
        <legend className="mb-1 text-lg font-extrabold text-neutral-900">
          1. Seus dados
        </legend>
        <div>
          <label className="label" htmlFor="name">
            Nome completo
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: João da Silva"
            required
            autoComplete="name"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Telefone / WhatsApp
            </label>
            <input
              id="phone"
              inputMode="numeric"
              className="input"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              placeholder="(47) 99999-9999"
              required
              autoComplete="tel"
            />
          </div>
        </div>
        <div className="sm:w-1/2 sm:pr-2">
          <label className="label" htmlFor="cpf">
            CPF (ou CNPJ)
          </label>
          <input
            id="cpf"
            inputMode="numeric"
            className="input"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(maskCPForCNPJ(e.target.value))}
            placeholder="000.000.000-00"
            required
          />
        </div>
      </fieldset>

      {/* Entrega ou retirada */}
      <fieldset className="space-y-4">
        <legend className="mb-1 text-lg font-extrabold text-neutral-900">
          2. Como você quer receber
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <MethodButton
            active={method === "entrega"}
            onClick={() => setMethod("entrega")}
            title="Entrega"
            subtitle="Somente em Itajaí"
          />
          <MethodButton
            active={method === "retirada"}
            onClick={() => setMethod("retirada")}
            title="Retirar na loja"
            subtitle="Grátis"
          />
        </div>

        {method === "entrega" ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              📍 Entregamos <strong>somente em Itajaí (SC)</strong>. Frete{" "}
              {formatBRL(SHIPPING_FEE)} — <strong>grátis</strong> acima de{" "}
              {formatBRL(FREE_SHIPPING_FROM)}.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="cep">
                  CEP{" "}
                  {cepLoading && (
                    <span className="text-brasil-green">buscando…</span>
                  )}
                </label>
                <input
                  id="cep"
                  inputMode="numeric"
                  className="input"
                  value={cep}
                  onChange={(e) => setCep(maskCEP(e.target.value))}
                  onBlur={(e) => lookupCep(e.target.value)}
                  placeholder="88300-000"
                  required={method === "entrega"}
                  autoComplete="postal-code"
                />
                {itajaiInvalid && (
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    Esse CEP não é de Itajaí. Só entregamos em Itajaí (SC).
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="street">
                  Rua / Logradouro
                </label>
                <input
                  id="street"
                  className="input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Rua das Flores"
                  required={method === "entrega"}
                  autoComplete="address-line1"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="number">
                  Número
                </label>
                <input
                  id="number"
                  className="input"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  required={method === "entrega"}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="complement">
                  Complemento{" "}
                  <span className="font-normal text-neutral-400">
                    (opcional)
                  </span>
                </label>
                <input
                  id="complement"
                  className="input"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto, bloco, referência…"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="district">
                  Bairro
                </label>
                <input
                  id="district"
                  className="input"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Centro"
                  required={method === "entrega"}
                />
              </div>
              <div className="sm:col-span-3">
                <label className="label" htmlFor="city">
                  Cidade
                </label>
                <input
                  id="city"
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Itajaí"
                  required={method === "entrega"}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="label" htmlFor="uf">
                  UF
                </label>
                <input
                  id="uf"
                  className="input uppercase"
                  value={uf}
                  maxLength={2}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  placeholder="SC"
                  required={method === "entrega"}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-brasil-green/30 bg-brasil-green/5 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏬</span>
              <div>
                <p className="font-bold text-neutral-900">
                  Retirada na {PICKUP.name}
                </p>
                <p className="mt-0.5 text-sm text-neutral-700">
                  {PICKUP.address}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {PICKUP.hours}
                </p>
                <p className="mt-2 text-sm font-semibold text-brasil-greenDark">
                  Sem frete • avisamos no WhatsApp quando estiver pronto para
                  retirar.
                </p>
              </div>
            </div>
          </div>
        )}
      </fieldset>

      {/* Tamanhos */}
      <fieldset id="tamanhos" className="space-y-5 scroll-mt-24">
        <legend className="mb-1 text-lg font-extrabold text-neutral-900">
          3. Tamanhos e quantidade
        </legend>
        <p className="-mt-1 text-sm text-neutral-500">
          Escolha a modelagem e quantas unidades de cada tamanho você quer. O
          total é somado automaticamente.
        </p>

        <div>
          <h4 className="mb-2 font-bold text-neutral-800">Modelagem</h4>
          <div className="grid grid-cols-2 gap-3">
            {FITS.map((f) => (
              <MethodButton
                key={f.value}
                active={fit === f.value}
                onClick={() => setFit(f.value)}
                title={f.label}
                subtitle={f.hint}
              />
            ))}
          </div>
        </div>

        {SIZE_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="mb-2 flex items-baseline gap-2">
              <h4 className="font-bold text-neutral-800">{group.label}</h4>
              <span className="text-xs text-neutral-400">{group.hint}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
              {group.sizes.map((size) => {
                const qty = items[size] || 0;
                const active = qty > 0;
                return (
                  <div
                    key={size}
                    className={`rounded-xl border p-2 transition ${
                      active
                        ? "border-brasil-green bg-brasil-green/5"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="mb-1.5 text-center text-sm font-extrabold text-neutral-700">
                      {size}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        aria-label={`Diminuir ${size}`}
                        onClick={() => setQty(size, qty - 1)}
                        className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-lg font-bold text-neutral-600 transition hover:bg-neutral-200 active:scale-95"
                      >
                        −
                      </button>
                      <input
                        aria-label={`Quantidade ${size}`}
                        inputMode="numeric"
                        className="w-10 rounded-md border border-transparent bg-transparent text-center text-base font-bold text-neutral-900 focus:border-neutral-200 focus:outline-none"
                        value={qty}
                        onChange={(e) =>
                          setQty(size, parseInt(e.target.value, 10))
                        }
                      />
                      <button
                        type="button"
                        aria-label={`Aumentar ${size}`}
                        onClick={() => setQty(size, qty + 1)}
                        className="grid h-9 w-9 place-items-center rounded-lg bg-brasil-green/10 text-lg font-bold text-brasil-green transition hover:bg-brasil-green/20 active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </fieldset>

      {/* Resumo + ação */}
      <div className="sticky bottom-3 z-10 rounded-2xl border border-neutral-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur">
        <div className="mb-3 space-y-1">
          <Row
            label={`${totalQty} ${totalQty === 1 ? "unidade" : "unidades"} × ${formatBRL(UNIT_PRICE)}`}
            value={formatBRL(subtotal)}
          />
          {method === "entrega" ? (
            <Row
              label="Frete (Itajaí)"
              value={
                totalQty === 0
                  ? "—"
                  : shipping === 0
                    ? "Grátis 🎉"
                    : formatBRL(shipping)
              }
              valueClass={shipping === 0 && totalQty > 0 ? "text-brasil-green" : ""}
            />
          ) : (
            <Row label="Retirada na loja" value="Grátis" valueClass="text-brasil-green" />
          )}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
            <span className="text-base font-bold text-neutral-900">Total</span>
            <span className="text-2xl font-extrabold text-neutral-900">
              {formatBRL(total)}
            </span>
          </div>
        </div>

        {missingForFree > 0 && (
          <p className="mb-2 rounded-lg bg-amber-50 px-3 py-1.5 text-center text-xs font-semibold text-amber-800">
            Faltam {formatBRL(missingForFree)} para o frete grátis!
          </p>
        )}

        <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500">
          🛠️ Pronto em até <strong>{PRODUCTION_LABEL}</strong> · pagamento via
          Asaas (PIX, boleto ou cartão)
        </p>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading || closed || itajaiInvalid}
        >
          {closed ? (
            "Pedidos encerrados"
          ) : loading ? (
            <>
              <Spinner /> Gerando pagamento…
            </>
          ) : (
            <>
              Finalizar e pagar
              {totalQty > 0 ? ` · ${formatBRL(total)}` : ""}
            </>
          )}
        </button>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Você será levado a uma página segura do Asaas para concluir o
          pagamento.
        </p>
      </div>
    </form>
  );
}

function MethodButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-3 text-left transition ${
        active
          ? "border-brasil-green bg-brasil-green/5"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
            active ? "border-brasil-green" : "border-neutral-300"
          }`}
        >
          {active && (
            <span className="h-2.5 w-2.5 rounded-full bg-brasil-green" />
          )}
        </span>
        <span className="font-bold text-neutral-900">{title}</span>
      </div>
      <div className="mt-1 pl-7 text-xs text-neutral-500">{subtitle}</div>
    </button>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className={`font-semibold text-neutral-700 ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
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
