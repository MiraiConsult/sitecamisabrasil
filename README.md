# Camiseta Brasil Retrô — Loja RR Uniformes

Site de venda da **Camiseta Brasil Retrô** (Coleção Brasil Retrô) da **RR Uniformes**.
O cliente informa nome, contato, endereço e a **quantidade por tamanho**, e o
pagamento é feito pelo **Asaas** (PIX, boleto ou cartão). Assim que o pagamento
é confirmado, a própria página de acompanhamento avisa o cliente que o pedido
foi pago e será entregue.

- **Preço unitário:** R$ 89,90
- **Valor total:** R$ 89,90 × quantidade total escolhida
- **Tamanhos:** Infantil `1, 2, 3, 4, 6, 8, 10, 12, 14` e Adulto `PP, P, M, G`

## Como funciona

1. O cliente preenche o formulário na página inicial (`/`): nome, e-mail, CPF/CNPJ,
   telefone, endereço de entrega e quantas unidades de cada tamanho.
2. Ao finalizar, o servidor cria um **cliente** e uma **cobrança** no Asaas no
   valor de `89,90 × quantidade` e redireciona para a página do pedido.
3. A página do pedido (`/pedido/[ref]`) mostra o botão **Pagar agora** (página
   segura do Asaas com PIX, boleto ou cartão).
4. Quando o pagamento é confirmado, a página **detecta sozinha** (consulta o
   status no Asaas) e mostra **"Pagamento confirmado! Será entregue."**
5. O vendedor vê cada pedido pago no **painel do Asaas**, com nome, endereço,
   telefone e a grade de tamanhos (no campo descrição da cobrança).

> A confirmação ao cliente é feita na tela (polling do status). O endpoint de
> webhook (`/api/webhooks/asaas`) já existe e fica pronto para evoluções
> futuras (e-mail, WhatsApp, banco de dados).

## Tecnologias

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS**
- **Asaas** como meio de pagamento e fonte dos pedidos
- **Zod** para validação

## Configuração (variáveis de ambiente)

Copie `.env.example` para `.env.local` e preencha:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `ASAAS_API_KEY` | **Sim** | Chave de API do Asaas (sandbox ou produção). |
| `ASAAS_ENV` | Não | `sandbox` (padrão) ou `production`. Define a URL base. |
| `ASAAS_BASE_URL` | Não | Sobrescreve a URL base do Asaas (normalmente não precisa). |
| `ASAAS_WEBHOOK_TOKEN` | Não | Se definido, o webhook exige o header `asaas-access-token` igual. |
| `NEXT_PUBLIC_SITE_URL` | Recomendada em produção | URL pública do site, usada no retorno do Asaas após o pagamento. |

### Onde pegar a chave do Asaas

1. Acesse o Asaas (**sandbox**: https://sandbox.asaas.com — testes; **produção**:
   https://www.asaas.com — valendo de verdade).
2. Menu **Integrações → Chave de API** → gere/copa a chave.
3. Cole em `ASAAS_API_KEY` e ajuste `ASAAS_ENV` (`sandbox` ou `production`).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha ASAAS_API_KEY
npm run dev                  # http://localhost:3000
```

> O site abre e o formulário funciona mesmo sem a chave; só o passo final de
> pagamento exige `ASAAS_API_KEY` configurada.

## Deploy (Vercel)

1. Faça o deploy do projeto na Vercel.
2. Em **Settings → Environment Variables**, adicione `ASAAS_API_KEY`, `ASAAS_ENV`
   e `NEXT_PUBLIC_SITE_URL` (a URL final do site).
3. Refaça o deploy.

## Webhook do Asaas (opcional, recomendado)

No painel do Asaas, em **Integrações → Webhooks**, aponte para:

```
https://SEU-SITE/api/webhooks/asaas
```

Se quiser proteger, defina um token no Asaas e o mesmo valor em
`ASAAS_WEBHOOK_TOKEN`. Eventos relevantes: `PAYMENT_CONFIRMED`,
`PAYMENT_RECEIVED`.

## Estrutura

```
src/
  app/
    page.tsx                     # landing + formulário de pedido
    pedido/[ref]/page.tsx        # acompanhamento + confirmação automática
    api/
      checkout/route.ts          # cria cliente + cobrança no Asaas
      payments/status/route.ts   # consulta status do pagamento
      webhooks/asaas/route.ts    # recebe eventos do Asaas
  components/
    OrderForm.tsx                # formulário (nome, endereço, tamanhos)
    Jersey.tsx                   # mockup da camisa (SVG)
    RRLogo.tsx                   # logo RR Uniformes
  lib/
    asaas.ts                     # cliente da API do Asaas
    config.ts                    # produto, preço (R$ 89,90) e tamanhos
    validation.ts                # validação (Zod)
    format.ts                    # moeda e máscaras
```

## Possíveis evoluções

- Painel de pedidos próprio (ex.: Supabase) com status de envio.
- Confirmação também por e-mail/WhatsApp.
- Cálculo de frete por CEP.
