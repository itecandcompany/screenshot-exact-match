import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { quoteSchema, type QuoteInput } from "@/content/quote";
import { services } from "@/content/services";
import { Button } from "@/components/ui/button";
export function QuoteForm({
  service,
  packageName,
}: {
  service?: string | undefined;
  packageName?: string | undefined;
}) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      service: service || "",
      budget: "discuss",
      contact: "email",
      website: "",
      description: packageName ? `I am interested in the ${packageName} monthly package. ` : "",
    },
  });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async () => {
        setError(
          "Quote delivery is not available yet. Your request has not been sent. Please try again once our contact details are published.",
        );
      })}
      className="grid sm:grid-cols-2 gap-6"
    >
      {[
        { key: "name", label: "Full name", type: "text", placeholder: "Your full name" },
        {
          key: "business",
          label: "Business / organisation",
          type: "text",
          placeholder: "Your business name",
        },
        {
          key: "email",
          label: "Email address",
          type: "email",
          placeholder: "you@yourbusiness.com",
        },
        { key: "phone", label: "Phone / WhatsApp", type: "tel", placeholder: "+255 …" },
      ].map((f) => (
        <div className="quote-field" key={f.key}>
          <label htmlFor={f.key}>{f.label}</label>
          <input
            id={f.key}
            type={f.type}
            placeholder={f.placeholder}
            maxLength={f.key === "email" ? 255 : 100}
            {...register(f.key as "name" | "business" | "email" | "phone")}
            aria-invalid={!!errors[f.key as keyof QuoteInput]}
            aria-describedby={`${f.key}-error`}
          />
          <span id={`${f.key}-error`} className="field-error">
            {errors[f.key as keyof QuoteInput]?.message}
          </span>
        </div>
      ))}
      <div className="quote-field">
        <label htmlFor="service">Service required</label>
        <select id="service" {...register("service")} aria-invalid={!!errors.service}>
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
        {errors.service && <span className="field-error">{errors.service.message}</span>}
      </div>
      <div className="quote-field">
        <label htmlFor="budget">Budget range</label>
        <select id="budget" {...register("budget")}>
          <option value="discuss">Let's discuss</option>
          <option value="under-100000">Under TSh 100,000</option>
          <option value="100000-300000">TSh 100,000 – 300,000</option>
          <option value="300000-500000">TSh 300,000 – 500,000</option>
          <option value="500000-plus">TSh 500,000+</option>
        </select>
      </div>
      <div className="quote-field sm:col-span-2">
        <label htmlFor="description">Tell us about your project</label>
        <textarea
          id="description"
          rows={5}
          maxLength={3000}
          placeholder="Your goals, ideas and what you have in mind…"
          {...register("description")}
          aria-invalid={!!errors.description}
        />
        {errors.description && <span className="field-error">{errors.description.message}</span>}
      </div>
      <div className="quote-field">
        <label htmlFor="contact">Preferred contact method</label>
        <select id="contact" {...register("contact")}>
          <option value="email">Email</option>
          <option value="phone">Phone call</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <p className="sm:col-span-2 text-xs text-muted-foreground leading-6">
        Quote requests are temporarily unavailable while our contact details are being finalised. No
        request is sent or stored.
      </p>
      <div className="sm:col-span-2">
        <Button type="submit" variant="forest" disabled={isSubmitting}>
          {isSubmitting ? "Checking…" : "Get a Free Quote"}
          <ArrowUpRight />
        </Button>
        <p role="alert" className="field-error mt-4">
          {error}
        </p>
      </div>
    </form>
  );
}
