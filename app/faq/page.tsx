import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Card } from "@/components/ui";

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
      <Card className="space-y-4 border-slate-200/80 bg-white/95 p-4 sm:p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">FAQ</p>
          <h1 className="text-3xl font-semibold text-slate-900">Frequently Asked Questions</h1>
        </div>

        <Accordion type="single" collapsible defaultValue={items[0]?.q} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          {items.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-slate-200/80">
              <AccordionTrigger className="px-4 py-4">
                <span className="pr-4 text-base font-semibold text-slate-900 sm:text-lg">{item.q}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 text-sm leading-relaxed text-slate-600 sm:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
