import { z } from "zod";
import { ALL_SIZES } from "./config";

const itemsSchema = z
  .record(z.string(), z.number().int().min(0).max(999))
  .refine(
    (items) => Object.keys(items).every((k) => ALL_SIZES.includes(k)),
    { message: "Tamanho inválido." }
  )
  .refine(
    (items) => Object.values(items).reduce((a, b) => a + b, 0) >= 1,
    { message: "Selecione pelo menos 1 unidade." }
  );

export const checkoutSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().trim().email("Email inválido."),
  cpfCnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11 || v.length === 14, "CPF/CNPJ inválido."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 11, "Telefone inválido."),
  address: z.object({
    cep: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v.length === 8, "CEP inválido."),
    street: z.string().trim().min(2, "Informe a rua / logradouro."),
    number: z.string().trim().min(1, "Informe o número."),
    complement: z.string().trim().optional().default(""),
    district: z.string().trim().min(2, "Informe o bairro."),
    city: z.string().trim().min(2, "Informe a cidade."),
    state: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase())
      .refine((v) => /^[A-Z]{2}$/.test(v), "UF inválida."),
  }),
  items: itemsSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
