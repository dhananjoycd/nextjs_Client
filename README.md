# FoodHub Frontend

FoodHub is a Next.js (App Router) frontend for a multi-vendor meal ordering platform.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui style component structure

## Project Structure

```text
Client FoodHub/
|-- app/
|   |-- admin/
|   |   `-- page.tsx
|   |-- cart/
|   |   `-- page.tsx
|   |-- checkout/
|   |   `-- page.tsx
|   |-- login/
|   |   `-- page.tsx
|   |-- meals/
|   |   |-- [id]/
|   |   |   `-- page.tsx
|   |   `-- page.tsx
|   |-- order/
|   |   `-- [id]/
|   |       `-- page.tsx
|   |-- orders/
|   |   |-- [id]/
|   |   |   `-- page.tsx
|   |   `-- page.tsx
|   |-- payment-success/
|   |   `-- page.tsx
|   |-- profile/
|   |   `-- page.tsx
|   |-- provider/
|   |   `-- dashboard/
|   |       `-- page.tsx
|   |-- providers/
|   |   |-- [id]/
|   |   |   `-- page.tsx
|   |   `-- page.tsx
|   |-- register/
|   |   `-- page.tsx
|   |-- test/
|   |   `-- page.tsx
|   |-- favicon.ico
|   |-- globals.css
|   |-- layout.tsx
|   |-- loading.tsx
|   `-- page.tsx
|-- components/
|   |-- dashboard/
|   |   `-- shell.tsx
|   |-- home/
|   |   |-- category-card.tsx
|   |   |-- index.ts
|   |   |-- meal-card.tsx
|   |   `-- provider-card.tsx
|   |-- layout/
|   |   |-- container.tsx
|   |   |-- footer.tsx
|   |   `-- header.tsx
|   |-- ui/
|   |   |-- alert.tsx
|   |   |-- badge.tsx
|   |   |-- button.tsx
|   |   |-- card.tsx
|   |   |-- dialog.tsx
|   |   |-- dropdown-menu.tsx
|   |   |-- index.ts
|   |   |-- input.tsx
|   |   |-- pagination.tsx
|   |   |-- radio-group.tsx
|   |   |-- select.tsx
|   |   |-- separator.tsx
|   |   |-- sheet.tsx
|   |   |-- skeleton.tsx
|   |   |-- sonner.tsx
|   |   |-- switch.tsx
|   |   `-- textarea.tsx
|   |-- AuthProvider.tsx
|   |-- Navbar.tsx
|   `-- Protected.tsx
|-- hooks/
|   |-- index.ts
|   |-- use-me.ts
|   `-- use-role-guard.ts
|-- lib/
|   |-- api.ts
|   |-- auth.ts
|   |-- cart.ts
|   |-- config.ts
|   |-- ids.ts
|   |-- money.ts
|   |-- order-store.ts
|   |-- types.ts
|   `-- utils.ts
|-- public/
|   |-- file.svg
|   |-- globe.svg
|   |-- next.svg
|   |-- vercel.svg
|   `-- window.svg
|-- services/
|   |-- admin.service.ts
|   |-- auth.service.ts
|   |-- cart.service.ts
|   |-- categories.service.ts
|   |-- index.ts
|   |-- meals.service.ts
|   |-- orders.service.ts
|   |-- payments.service.ts
|   |-- providers.service.ts
|   |-- reviews.service.ts
|   `-- user.service.ts
|-- types/
|   |-- cart.ts
|   |-- category.ts
|   |-- index.ts
|   |-- meal.ts
|   |-- order.ts
|   |-- provider.ts
|   |-- review.ts
|   `-- user.ts
|-- .env
|-- .env.example
|-- .gitignore
|-- eslint.config.mjs
|-- next-env.d.ts
|-- next.config.ts
|-- package-lock.json
|-- package.json
|-- postcss.config.mjs
|-- README.md
`-- tsconfig.json
```

## Run Locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.
