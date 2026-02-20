# FoodHub - Multi-Vendor Meal Ordering Platform (Frontend)

FoodHub is a production-ready frontend for a multi-vendor meal ordering platform.  
It is built with modern Next.js App Router patterns, TypeScript safety, and reusable UI architecture.  
The project focuses on responsive commerce UX, scalable component design, and maintainable code organization.  
It is structured for real-world iteration, team collaboration, and feature expansion.

## Live Demo

- Demo: `https://your-demo-url.example.com`

## Tech Stack

- **Next.js (App Router)**: Routing, server/client component model, metadata support.
- **TypeScript**: Static typing for predictable and maintainable code.
- **Tailwind CSS**: Utility-first styling with responsive, mobile-first design.
- **shadcn/ui**: Accessible, composable UI primitives for consistent interface patterns.
- **TanStack Form**: Structured and scalable form state/validation handling.
- **Lucide Icons**: Lightweight icon system for modern UI clarity.

## Key Features

- Fully responsive UI for **mobile, tablet, and desktop**
- Horizontal meal sections with smooth scrolling and snap behavior
- Reusable pagination system with desktop and mobile optimized patterns
- Cart flow with item quantity management and totals
- One-page checkout UX for faster conversion
- SEO-ready route structure and metadata integration
- Accessible UI elements (focus states, semantic controls, keyboard usability)
- Performance-conscious layout and rendering choices

## Architecture Overview

- **Modular architecture**: Features are organized by domain (meals, cart, checkout, admin/provider views).
- **Reusable components**: Shared UI primitives and section-level components reduce duplication.
- **Separation of concerns**:
  - UI components in `components/`
  - Route-level orchestration in `app/`
  - Utilities and config in `lib/`
  - API/service abstractions in `services/`
- **Scalable patterns**: Pagination, filtering, dialogs, and form flows use shared conventions.

## Folder Structure

```text
Client FoodHub/
├─ app/                  # App Router pages and route segments
│  ├─ meals/
│  ├─ cart/
│  ├─ checkout/
│  ├─ providers/
│  ├─ admin/
│  └─ provider/
├─ components/
│  ├─ ui/                # shadcn-based reusable primitives
│  ├─ home/              # Home page cards/sections
│  ├─ layout/            # Header, footer, container
│  └─ dashboard/         # Dashboard shell and layout helpers
├─ hooks/                # Reusable React hooks
├─ lib/                  # Utilities, config, helpers
├─ services/             # API service layer
├─ types/                # Shared TypeScript types
└─ public/               # Static assets
```

This structure is scalable because feature pages stay thin while shared logic and UI remain centralized and reusable.

## Performance & Optimization

- Mobile-first layout strategy with responsive breakpoints
- Optimized media rendering patterns and constrained visual containers
- Reduced layout shift through stable component sizing and spacing
- Lean, reusable UI building blocks to keep rendering predictable
- Core Web Vitals aware implementation approach

## SEO Strategy

- Next.js Metadata API usage at layout/page level
- Semantic HTML structure for crawlability and accessibility
- Clean URL patterns (`/meals`, `/providers/[id]`, `/checkout`, etc.)
- Structured data readiness for future enhancement

## Installation & Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` (or use `.env.example`) and provide required frontend environment variables, including API base URL.

### 3. Run development server

```bash
npm run dev
```

Application will run on:

- `http://localhost:3000`

## Future Improvements

- Stripe-based payment integration for production checkout flow
- Real-time delivery tracking via socket/event-driven updates
- Expanded admin analytics and moderation workflows
- PWA capabilities (offline support, installable experience)

## Screenshots

### Home Page

`[Add screenshot here]`

### Meals Listing

`[Add screenshot here]`

### Cart & Checkout

`[Add screenshot here]`

### Provider Dashboard

`[Add screenshot here]`

### Admin Overview

`[Add screenshot here]`
