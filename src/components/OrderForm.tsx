"use client";

import { useMemo, useState } from "react";
import { SIZE_GROUPS, ALL_SIZES, UNIT_PRICE } from "@/lib/config";
import {
  formatBRL,
  maskCEP,
  maskCPForCNPJ,
  maskPhone,
  onlyDigits,
} from "@/lib/format";

type Items = Record<string, number>;

const emptyItems: Items = ALL_SIZES.reduce((acc, s) => {
  acc[s] = 0;
  return acc;
}, {} as Items);

export function OrderForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [phone, setPhone] = useState("");

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

  const totalQty = useMemo(
    () => Object.values(items).reduce((a, b) => a + b, 0),
    [items]
  );
  const totalValue = totalQty * UNIT_PRICE;

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
      // silencioso — o cliente pode preencher manualmente
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (totalQty < 1) {
      setError("Escolha a quantidade de pelo menos 1 tamanho.");
      document.getElementById("tamanhos")?.scrollIntoView({ behavior: "smooth" });
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
          address: {
            cep,
            street,
            number,
            complement,
            district,
            city,
            state: uf,
          },
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível gerar o pagamento.");
      }
      // Vai para a página do pedido, que mostra o pagamento e confirma sozinha.
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
              placeholder="(11) 99999-9999"
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

      {/* Endereço de entrega */}
      <fieldset className="space-y-4">
        <legend className="mb-1 text-lg font-extrabold text-neutral-900">
          2. Endereço de entrega
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="cep">
              CEP {cepLoading && <span className="text-brasil-green">buscando…</span>}
            </label>
            <input
              id="cep"
              inputMode="numeric"
              className="input"
              value={cep}
              onChange={(e) => setCep(maskCEP(e.target.value))}
              onBlur={(e) => lookupCep(e.target.value)}
              placeholder="00000-000"
              required
              autoComplete="postal-code"
            />
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
              placeholder="Av. Brasil"
              required
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
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="complement">
              Complemento <span className="font-normal text-neutral-400">(opcional)</span>
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
              required
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
              placeholder="São Paulo"
              required
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
              placeholder="SP"
              required
            />
          </div>
        </div>
      </fieldset>

      {/* Tamanhos */}
      <fieldset id="tamanhos" className="space-y-5 scroll-mt-24">
        <legend className="mb-1 text-lg font-extrabold text-neutral-900">
          3. Tamanhos e quantidade
        </legend>
        <p className="-mt-1 text-sm text-neutral-500">
          Escolha quantas unidades de cada tamanho você quer. O total é somado
          automaticamente.
        </p>

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
                        className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-lg font-bold text-neutral-600 transition hover:bg-neutral-200 active:scale-95"
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
                        className="grid h-8 w-8 place-items-center rounded-lg bg-brasil-green/10 text-lg font-bold text-brasil-green transition hover:bg-brasil-green/20 active:scale-95"
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
      <div className="sticky bottom-3 z-10 rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500">
              {totalQty} {totalQty === 1 ? "unidade" : "unidades"} ×{" "}
              {formatBRL(UNIT_PRICE)}
            </div>
            <div className="text-2xl font-extrabold text-neutral-900">
              {formatBRL(totalValue)}
            </div>
          </div>
          <div className="hidden text-right text-xs text-neutral-400 sm:block">
            Pagamento via Asaas
            <br />
            PIX, boleto ou cartão
          </div>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> Gerando pagamento…
            </>
          ) : (
            <>Finalizar e pagar {totalQty > 0 ? `· ${formatBRL(totalValue)}` : ""}</>
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
