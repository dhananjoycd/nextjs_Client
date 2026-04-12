import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SupportChat } from "@/components/ai";
import { Button, Card } from "@/components/ui";

const contactCards = [
  { title: "Email support", value: "support@foodhub.app", href: "mailto:support@foodhub.app", icon: Mail },
  { title: "Call support", value: "+880 1234 567890", href: "tel:+8801234567890", icon: Phone },
  { title: "Visit office", value: "Dhaka, Bangladesh", href: "https://maps.google.com/?q=Dhaka,Bangladesh", icon: MapPin },
] as const;

const faqs = [
  {
    question: "How do I place an order on FoodHub?",
    answer:
      "Browse meals, add your preferred items to cart, complete checkout with address and payment method, then track the order from the orders page.",
  },
  {
    question: "Can providers manage their own menu?",
    answer:
      "Yes. Provider accounts can create, update, and remove menu items, then move incoming orders through each delivery stage from their dashboard.",
  },
  {
    question: "What happens after payment success?",
    answer:
      "FoodHub verifies the payment session, creates the order record, clears the cart, and redirects the customer to the order history flow.",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="space-y-8 py-2">
      <section className="rounded-4xl border border-slate-200 bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Contact & Support</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Let&apos;s talk about orders, onboarding, support, or common questions.</h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
          Reach out for customer support, provider onboarding, admin questions, or partnership discussions.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {contactCards.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.title} href={item.href} target={item.href.startsWith("https") ? "_blank" : undefined} rel="noreferrer" className="block">
              <Card className="h-full space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-xl">{item.title}</h2>
                <p className="text-sm text-slate-600">{item.value}</p>
              </Card>
            </a>
          );
        })}
      </section>

      <Card className="space-y-4">
        <h2 className="text-2xl">Quick help</h2>
        <p className="text-sm text-slate-600">Common answers for customers, providers, and reviewers.</p>
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <h3 className="text-lg">{faq.question}</h3>
              <p className="mt-1 text-sm text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      <SupportChat />

      <Card className="space-y-4">
        <h2 className="text-2xl">Still need support?</h2>
        <p className="text-sm text-slate-600">
          If your issue is not covered above, contact the FoodHub support team directly or continue exploring meals.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/meals">Go back to meals</Link>
          </Button>
          <Button asChild>
            <Link href="mailto:support@foodhub.app">Email support</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
