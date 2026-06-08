import { z } from "zod";
import { ALL_SIZES, isItajaiCep } from "./config";

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

const addressSchema = z.object({
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
});

export const checkoutSchema = z
  .object({
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
    deliveryMethod: z.enum(["entrega", "retirada"]),
    address: addressSchema.optional(),
    items: itemsSchema,
  })
  .superRefine((val, ctx) => {
    if (val.deliveryMethod === "entrega") {
      if (!val.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Preencha o endereço de entrega.",
          path: ["address"],
        });
      } else if (!isItajaiCep(val.address.cep)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No momento só realizamos entregas em Itajaí (SC).",
          path: ["address", "cep"],
        });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
