import { z } from "zod";
import { services } from "./services";
export const quoteSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  business: z.string().trim().min(2, "Please enter your business name.").max(150),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s()-]{7,25}$/, "Enter a valid phone number."),
  service: z.string().refine((s) => services.some((x) => x.slug === s), "Choose a service."),
  description: z
    .string()
    .trim()
    .min(20, "Please describe your project in at least 20 characters.")
    .max(3000),
  budget: z.enum(["under-100000", "100000-300000", "300000-500000", "500000-plus", "discuss"]),
  contact: z.enum(["email", "phone", "whatsapp"]),
  website: z.string().max(0),
});
export type QuoteInput = z.infer<typeof quoteSchema>;
