import { Card } from "@/components/ui";

const items = [
  {
    q: "How do I track my order?",
    a: "Open your customer dashboard orders page to see live status updates.",
  },
  {
    q: "How can providers manage menu items?",
    a: "Providers can use the provider dashboard to add, update, and manage meals.",
  },
  {
    q: "Where can admins monitor operations?",
    a: "Admins can review users, orders, and category operations from the admin dashboard.",
  },
];

export default function FaqPage() {
  return (
    <div className="space-y-4 py-2">
      <h1 className="text-3xl font-semibold">FAQ</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.q} className="space-y-2">
            <h2 className="text-lg font-semibold">{item.q}</h2>
            <p className="text-sm text-slate-600">{item.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
