import Link from "next/link";
import { Button, Card } from "@/components/ui";

const effectiveDate = "April 11, 2026";

const highlights = [
  {
    title: "Lawful use only",
    text: "FoodHub must be used for legal ordering and provider operations. Misuse, fraud, and abusive behavior are prohibited.",
  },
  {
    title: "Order responsibilities",
    text: "Customers must provide accurate delivery details, and providers must maintain correct menus, pricing, and order status updates.",
  },
  {
    title: "Account security",
    text: "Users are responsible for protecting credentials and all activities performed through their accounts.",
  },
] as const;

const sections = [
  {
    title: "1. Acceptance of terms",
    points: [
      "By accessing or using FoodHub, you agree to these Terms of Service and our Privacy Policy.",
      "If you do not agree with any part of these terms, you must stop using the platform.",
    ],
  },
  {
    title: "2. Eligibility and accounts",
    points: [
      "You must provide accurate registration information and keep your account details up to date.",
      "You are responsible for safeguarding your login credentials and for all account activity.",
      "FoodHub may suspend or terminate accounts involved in suspicious, fraudulent, or policy-violating activity.",
    ],
  },
  {
    title: "3. Orders, pricing, and fulfillment",
    points: [
      "Meal availability, preparation time, and delivery windows may vary by provider and location.",
      "Customers must provide complete and accurate order and delivery information.",
      "Providers are responsible for menu accuracy, food quality, and timely order status updates.",
      "FoodHub may cancel or adjust orders where pricing errors, stock issues, or security risks are detected.",
    ],
  },
  {
    title: "4. Payments and refunds",
    points: [
      "Payments are processed through approved channels and may be subject to third-party processor rules.",
      "Refund outcomes depend on issue type, provider confirmation, payment status, and applicable platform policy.",
      "Chargebacks or payment disputes may result in temporary account restrictions during investigation.",
    ],
  },
  {
    title: "5. Prohibited activities",
    points: [
      "Do not use FoodHub for unlawful activity, fraud, abuse, spam, scraping, or unauthorized access attempts.",
      "Do not upload false listings, harmful content, or misleading business information.",
      "Do not interfere with service performance, APIs, or security controls.",
    ],
  },
  {
    title: "6. Intellectual property",
    points: [
      "FoodHub branding, platform UI, and software content are protected by applicable intellectual property laws.",
      "You may not copy, distribute, reverse engineer, or exploit platform assets without permission.",
    ],
  },
  {
    title: "7. Limitation of liability",
    points: [
      "FoodHub provides the platform on an 'as is' and 'as available' basis to the extent allowed by law.",
      "We are not liable for indirect or consequential damages arising from service interruptions, provider actions, or user misuse.",
      "Where legally permitted, our aggregate liability is limited to the amounts paid through the platform for the affected transaction.",
    ],
  },
  {
    title: "8. Changes to these terms",
    points: [
      "We may update these terms from time to time to reflect legal, product, or operational changes.",
      "Continued platform use after updates means you accept the revised terms.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <div className="space-y-8 py-2">
      <section className="rounded-4xl border border-slate-200 bg-linear-to-br from-slate-100 via-white to-amber-50 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Terms of Service</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Rules, responsibilities, and legal terms for using FoodHub.</h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
          These terms explain how customers, providers, and admins are expected to use the platform, including account rules, order handling, and payment-related conditions.
        </p>
        <p className="mt-3 text-sm font-medium text-slate-700">Effective date: {effectiveDate}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((section) => (
          <Card key={section.title} className="space-y-3">
            <h2 className="text-xl">{section.title}</h2>
            <p className="text-sm text-slate-600">{section.text}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="space-y-4">
            <h2 className="text-2xl">{section.title}</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
              {section.points.map((point) => (
                <li key={point} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <Card className="space-y-4">
        <h2 className="text-2xl">Need clarification on terms?</h2>
        <p className="text-sm text-slate-600">
          Contact FoodHub for questions about account rules, payments, order disputes, or provider obligations.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/contact">Contact FoodHub</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/privacy">View Privacy Policy</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
