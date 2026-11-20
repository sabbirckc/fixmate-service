# FixMate

## Purpose
FixMate is an on-demand smart device and home appliance repair service platform connecting customers with verified repair technicians. Customers can browse and filter repair services, submit repair requests with problem descriptions, track repair progress step-by-step through a real-time status pipeline, and pay securely via Stripe only after the job is completed. Technicians manage their service listings and incoming repair workflows, while administrators oversee platform operations, review and approve service listings, and manage user roles.

## Live URL
[https://fixmate-service.vercel.app](https://fixmate-service.vercel.app)

## Admin Credentials
- **Email:** `admin@fixmate.com`
- **Password:** `Password123`

## Key Features
- **Role-Based Authentication & Authorization:** Multi-role access control for Customers, Technicians, and Administrators using BetterAuth and JWT-protected Express routes.
- **Server-Side Search, Filter & Sort:** MongoDB-powered search by keyword/category, filtering by appliance type and service mode, and sorting by price and date with URL state synchronization.
- **Repair Booking & Step Status Pipeline:** Customer service booking flow with a server-enforced lifecycle: Requested → Accepted → In-Progress → Completed.
- **Pay-After-Service Stripe Integration:** Secure Stripe Checkout flow restricted strictly to completed and unpaid repairs with automated payment logging and verification.
- **Role-Specific Dashboards:** Dedicated dashboards with real-time KPI metrics and data visualizations for Customers, Technicians, and Administrators.
- **Service Listings Moderation:** Technicians can create, edit, and manage services with image uploads; Administrators review and approve listings before they go public.
- **Ratings & Reviews:** Customers can rate and review completed, paid repair jobs to help future clients make informed decisions.
- **Visual Job Timeline Tracker:** Step-by-step progress tracker on customer bookings reflecting status history transitions.
- **PDF Invoice Download:** One-click downloadable PDF invoices for paid repair bookings.
- **Responsive Design & Dark Mode:** Mobile-friendly layouts with cards and tables, plus smooth light and dark theme toggling.

## NPM Packages Used

### Frontend (`fixmate-service`)
- `next`
- `react`
- `react-dom`
- `better-auth`
- `mongodb`
- `stripe`
- `@stripe/stripe-js`
- `lucide-react`
- `sonner`
- `recharts`
- `jspdf`
- `tailwindcss`
- `@tailwindcss/turbopack`
- `class-variance-authority`
- `cmdk`
- `date-fns`
- `embla-carousel-react`
- `input-otp`
- `react-day-picker`
- `react-resizable-panels`
- `tw-animate-css`
- `shiki`
- `shadcn`
- `@base-ui/react`
- `@shadcn/react`

### Backend (`fixmate-service-server`)
- `express`
- `mongodb`
- `jsonwebtoken`
- `jose`
- `stripe`
- `cors`
- `dotenv`
