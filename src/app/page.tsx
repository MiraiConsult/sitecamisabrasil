import { OrderForm } from "@/components/OrderForm";
import { ProductGallery } from "@/components/ProductGallery";
import { RRLogo } from "@/components/RRLogo";
import { PRODUCT, UNIT_PRICE, STORE } from "@/lib/config";
import { formatBRL } from "@/lib/format";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <RRLogo />
          <a href="#pedido" className="btn-primary !px-5 !py-2.5 text-sm">
            Pedir agora
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-rr-navy text-white">
        <div className="absolute inset-0 opacity-[0.12] stripes-brasil" />
        <div className="absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brasil-green/30 blur-3xl" />
        <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-brasil-yellow/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brasil-yellow ring-1 ring-white/20">
              ★ {PRODUCT.collection}
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              CAMISETA <span className="text-brasil-yellow">BRASIL</span>{" "}
              RETRÔ
            </h1>
            <p className="mt-4 max-w-md text-base text-white/80">
              O clássico verde e amarelo em listras, no maior estilo retrô.
              Conforto, qualidade e a paixão do Brasil para vestir e torcer.
            </p>

            <div className="mt-6 flex items-end gap-3">
              <div className="text-5xl font-extrabold text-white">
                {formatBRL(UNIT_PRICE)}
              </div>
              <div className="pb-1.5 text-sm text-white/70">por unidade</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#pedido" className="btn-primary">
                Escolher tamanhos e pedir
              </a>
            </div>

            <ul className="mt-8 grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm text-white/85">
              <li className="flex items-center gap-2">
                <Check /> Infantil e adulto
              </li>
              <li className="flex items-center gap-2">
                <Check /> Entrega no seu endereço
              </li>
              <li className="flex items-center gap-2">
                <Check /> PIX, boleto ou cartão
              </li>
              <li className="flex items-center gap-2">
                <Check /> Pagamento seguro (Asaas)
              </li>
            </ul>
          </div>

          {/* Fotos reais do produto — as 3 sempre visíveis */}
          <div className="mt-10 md:mt-12">
            <ProductGallery />
          </div>
        </div>
      </section>

      {/* Faixa de destaque */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-neutral-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Feature
            title="Coleção Brasil Retrô"
            text="Listras verde e amarelo, número 10 e o brasão de estrelas."
          />
          <Feature
            title="Vários tamanhos"
            text="Do infantil (1 a 14) ao adulto (PP, P, M, G). Misture na mesma compra."
          />
          <Feature
            title="Pagamento facilitado"
            text="Finalize com PIX, boleto ou cartão em ambiente seguro."
          />
        </div>
      </section>

      {/* Pedido */}
      <section id="pedido" className="scroll-mt-20 bg-neutral-50 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl tracking-tight text-neutral-900 sm:text-4xl">
              Monte seu pedido
            </h2>
            <p className="mt-2 text-neutral-600">
              Preencha seus dados, escolha as quantidades por tamanho e finalize
              o pagamento.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
            <OrderForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
          <RRLogo />
          <p className="max-w-md text-sm text-neutral-500">
            {STORE.legalName}. {PRODUCT.collection}. Produtos oficiais RR
            Uniformes.
          </p>
          <a
            href={STORE.site}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brasil-green hover:underline"
          >
            Conheça a loja RR Uniformes
          </a>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="px-6 py-6">
      <h3 className="font-bold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{text}</p>
    </div>
  );
}

function Check() {
  return (
    <svg
      className="h-5 w-5 flex-none text-brasil-yellow"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
