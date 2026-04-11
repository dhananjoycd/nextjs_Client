import Link from "next/link";
import { Button, Card } from "@/components/ui";

const effectiveDate = "April 11, 2026";

const highlights = [
  {
    title: "Account and profile data",
    text: "We collect your name, email, phone number, role, and address details to create accounts, deliver orders, and secure role-based dashboard access.",
  },
  {
    title: "Order and payment records",
    text: "We keep order items, delivery notes, payment status, and transaction references to process purchases, reduce fraud, and support customer service.",
  },
  {
    title: "Support and communication",
    text: "Messages, reviews, and support tickets may be stored to resolve issues, improve product quality, and maintain a reliable service history.",
  },
] as const;

const sections = [
  {
    title: "1. Information we collect",
    points: [
      "Identity and contact details such as name, email, phone, and account role.",
      "Order details including meals, quantity, provider, delivery location, and timestamps.",
      "Payment metadata from payment providers such as transaction IDs and status. We do not store full card numbers.",
      "Device and usage details such as IP address, browser, and interaction logs for security and troubleshooting.",
    ],
  },
  {
    title: "2. How we use your information",
    points: [
      "To create and maintain your account, authenticate sessions, and provide role-based access.",
      "To process orders, route requests to providers, coordinate delivery, and show order status updates.",
      "To handle customer support, investigate disputes, and communicate service updates.",
      "To detect abuse, enforce platform rules, and improve reliability and performance.",
    ],
  },
  {
    title: "3. Sharing and disclosure",
    points: [
      "Providers receive only the data necessary to prepare and fulfill your order.",
      "Payment processors receive payment-related data required to complete transactions securely.",
      "Service partners may process data for analytics, hosting, and communication under contractual safeguards.",
      "We may disclose data when required by law or to protect users, platform integrity, and legal rights.",
    ],
  },
  {
    title: "4. Data retention",
    points: [
      "Account and order records are retained as long as necessary for service operations, compliance, and dispute resolution.",
      "You may request account deletion. Some records may remain where legal, tax, security, or fraud-prevention obligations apply.",
    ],
  },
  {
    title: "5. Cookies and tracking",
    points: [
      "We use cookies and similar technologies to keep you signed in, remember preferences, and measure service usage.",
      "You can control cookies through browser settings, but disabling essential cookies may affect platform functionality.",
    ],
  },
  {
    title: "6. Your rights",
    points: [
      "You can access, update, or correct your account information from your profile and dashboard.",
      "You can contact us to request data export, deletion, or clarification regarding data handling.",
      "If you believe your privacy rights were violated, you may submit a complaint to our support team.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="space-y-8 py-2">
      <section className="rounded-4xl border border-slate-200 bg-linear-to-br from-emerald-100 via-white to-amber-50 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Privacy Policy</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">How FoodHub collects, uses, and protects your information.</h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
          This Privacy Policy explains what information we collect across customer, provider, and admin workflows and how that data is handled in the FoodHub platform.
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
        <h2 className="text-2xl">Questions about privacy?</h2>
        <p className="text-sm text-slate-600">
          For any data request, privacy concern, or legal clarification, contact the FoodHub support team.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/contact">Contact FoodHub</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/terms">View Terms of Service</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
