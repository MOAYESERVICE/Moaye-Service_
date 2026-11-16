import { z } from "zod";

const phoneRule = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 12;
};

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Veuillez renseigner votre nom."),
  phone: z
    .string()
    .refine(phoneRule, "Veuillez saisir un numéro de téléphone valide (8 à 12 chiffres)."),
  email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
  subject: z.string().trim().min(1, "Veuillez préciser l’objet de votre demande."),
  message: z.string().trim().min(10, "Veuillez rédiger un message d’au moins 10 caractères."),
});

export type ContactData = z.infer<typeof contactSchema>;



const passwordRule = z.string()
  .regex(/^\d{4}$/, "Choisissez un code composé exactement de 4 chiffres.");
const loginPasswordRule = z.string()
  .regex(/^(?:\d{4}|\d{12})$/, "Saisissez votre code actuel à 4 chiffres ou votre ancien mot de passe à 12 chiffres.");

export const loginSchema = z.object({
  email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
  password: loginPasswordRule,
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Veuillez renseigner votre nom complet (2 caractères minimum)."),
    email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
    phone: z.string().trim().refine(
      (value) => /^[\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 8 && value.replace(/\D/g, "").length <= 12,
      "Veuillez saisir un numéro de téléphone valide (8 à 12 chiffres).",
    ),
    password: passwordRule,
    confirm: z.string().min(1, "Veuillez confirmer votre mot de passe."),
  })
  .refine((d) => d.password === d.confirm, { message: "Les mots de passe saisis ne correspondent pas.", path: ["confirm"] });

export const forgotSchema = z.object({
  email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
});

export const resetSchema = z
  .object({
    email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
    code: z.string().regex(/^\d{6}$/, "Le code reçu par e-mail doit contenir 6 chiffres."),
    password: passwordRule,
    confirm: z.string().min(1, "Veuillez confirmer votre mot de passe."),
  })
  .refine((d) => d.password === d.confirm, { message: "Les mots de passe saisis ne correspondent pas.", path: ["confirm"] });

export const changePasswordSchema = z
  .object({
    password: passwordRule,
    confirm: z.string().min(1, "Veuillez confirmer votre mot de passe."),
  })
  .refine((d) => d.password === d.confirm, { message: "Les mots de passe saisis ne correspondent pas.", path: ["confirm"] });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotData = z.infer<typeof forgotSchema>;
export type ResetData = z.infer<typeof resetSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;


export const profileSchema = z.object({
  name: z.string().trim().min(1, "Veuillez renseigner votre nom."),
  email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
  phone: z.string().refine(phoneRule, "Veuillez saisir un numéro de téléphone valide (8 à 12 chiffres)."),
  city: z.string().trim().optional(),
});
export type ProfileData = z.infer<typeof profileSchema>;

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(1, "Veuillez renseigner votre nom."),
    phone: z.string().refine(phoneRule, "Veuillez saisir un numéro de téléphone valide (8 à 12 chiffres)."),
    email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
    delivery: z.enum(["delivery", "pickup"]),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    zip: z.string().trim().optional(),
    paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "WAVE", "PAYTECH"]).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.delivery === "delivery") {
      if (!d.address) ctx.addIssue({ code: "custom", path: ["address"], message: "Veuillez renseigner l’adresse de livraison." });
      if (!d.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Veuillez renseigner la ville de livraison." });
      if (!d.zip) ctx.addIssue({ code: "custom", path: ["zip"], message: "Veuillez renseigner le code postal de livraison." });
    }
  });
export type CheckoutData = z.infer<typeof checkoutSchema>;

export const quoteSchema = z.object({
  type: z.string().min(1, "Veuillez sélectionner un type de projet."),
  stage: z.string(),
  budget: z.string(),
  location: z.string().trim().min(1, "Veuillez renseigner la localisation du projet."),
  message: z.string().optional(),
  name: z.string().trim().min(1, "Veuillez renseigner votre nom."),
  phone: z.string().refine(phoneRule, "Veuillez saisir un numéro de téléphone valide (8 à 12 chiffres)."),
  email: z.string().trim().email("Veuillez saisir une adresse e-mail valide."),
});
export type QuoteData = z.infer<typeof quoteSchema>;
export const productSchema = z.object({
  name: z.string().trim().min(1, "Veuillez renseigner le nom du produit."),
  cat: z.string(),
  price: z.string().refine((v) => Number.isInteger(Number(v.replace(/\s/g, ""))) && Number(v.replace(/\s/g, "")) > 0, "Veuillez saisir un prix entier supérieur à zéro."),
  stock: z.enum(["in", "order", "out"]),
  image: z.string().optional().refine(
    (value) => !value || (value.startsWith("/") && !value.startsWith("//")),
    "Le chemin de l’image doit être local et permanent.",
  ),
});
export type ProductFormData = z.infer<typeof productSchema>;
