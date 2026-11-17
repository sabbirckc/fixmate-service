# 🔧 FixMate — Smart Device & Home Appliance Repair Service Platform

FixMate is a full-stack, role-based on-demand repair service booking platform built with **Next.js (App Router)**, **Express.js**, **MongoDB Atlas**, **BetterAuth**, **JWT**, and **Stripe**. 

Verified technicians list their repair services, customers browse and submit repair requests with problem descriptions, track their jobs step-by-step through a real-time status pipeline, and pay online via Stripe **only after the repair is completed**. Administrators moderate service listings, inspect platform transactions, and manage user roles.

---

## 🌐 Project Links & Submission Details
- **Live Client Application**: [https://fixmate-service.vercel.app](https://fixmate-service.vercel.app)
- **Client GitHub Repository**: [https://github.com/sabbirckc/fixmate-service](https://github.com/sabbirckc/fixmate-service)
- **Server GitHub Repository**: [https://github.com/sabbirckc/fixmate-service-server](https://github.com/sabbirckc/fixmate-service-server)

### 🔑 Test Credentials (Quick Reviewer Accounts)
| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fixmate.com` | `Password123` | Platform overview, role management, service moderation queue, all bookings & transactions |
| **Technician 1** | `technician@fixmate.com` | `Password123` | Smartphone & laptop specialist, adds services with ImgBB, accepts/rejects jobs, advances status pipeline |
| **Technician 2** | `karim@fixmate.com` | `Password123` | Inverter AC & refrigerator specialist |
| **Customer** | `customer@fixmate.com` | `Password123` | Books repairs, tracks live timeline, cancels requested bookings, pays completed jobs with Stripe |

> **Tip:** You can also use the **1-click quick login buttons** located directly on the `/sign-in` page for instant testing!

---

## 🚀 Key Features

### 1. 🛡️ Role-Based Authentication & Authorization (Challenge 2)
- Built using **BetterAuth** with native **MongoDB Adapter** and custom fields (`role`, `phone`, `area`, `bio`).
- Role selection during sign-up (`customer` or `technician`). Admin cannot be selected and defaults to `customer` on unauthorized payloads.
- Live client & server password validation (≥6 characters, uppercase, lowercase).
- Custom Express JWT middlewares: `verifyToken`, `verifyCustomer`, `verifyTechnician`, and `verifyAdmin`.
- Horizontal data isolation: Users can strictly access only their own records.

### 2. 🔍 Server-Side Search, Filter & Sort (Challenge 1)
- 100% server-side search by title, category, or problem keyword using MongoDB text/regex indexing.
- Filter by category (`Smartphone`, `Laptop & PC`, `AC`, `Refrigerator`, `TV`, `Washing Machine`, `Electrical`) and service mode (`Home Visit`, `Shop Drop-off`).
- Sort by newest, price low-to-high, and price high-to-low.
- Query parameters persist across page reloads and direct links from the Home page (`/services?category=AC`).

### 3. 🔄 Server-Enforced Job Status Pipeline (Challenge 3)
- Strict state-machine progression:
  $$\text{Requested} \longrightarrow \begin{cases} \text{Accepted} \longrightarrow \text{In Progress} \longrightarrow \text{Completed (finalAmount)} \\ \text{Rejected (Final)} \\ \text{Cancelled (Customer Only, Final)} \end{cases}$$
- Technicians can only update bookings assigned to them.
- Customers can cancel only while status is `requested`.
- Final amount is validated ($> 0$) when transitioning to `completed`.

### 4. 💳 Pay-After-Service Stripe Integration
- Customers pay only after the job is completed (`status === 'completed'` and `paymentStatus === 'unpaid'`).
- The server loads the verified booking amount directly from MongoDB before initializing Stripe Checkout sessions.
- `/payment/success` verifies the Stripe session idempotently, records the payment in the `payments` collection, and marks the booking as `paid`.

### 5. 📊 Comprehensive Dashboards
- **Customer Dashboard**: Overview KPI cards, interactive bookings table, cancel confirmation modal, live step timeline tracker, payment history ledger.
- **Technician Dashboard**: Overview stats, Add Service form with ImgBB file upload, My Services full CRUD table with availability toggle, Manage Requests queue.
- **Admin Dashboard**: Real-time KPI metrics, User role management (admin cannot demote self), Service approval/rejection moderation, global booking monitor, financial transaction ledger with total revenue calculation.
- **Shared Profile**: Live profile update (Name, Phone, Area, Bio, Avatar via ImgBB) reflecting instantly across the navbar and header without logging out.

---

## 📦 NPM Packages Used

### Client Dependencies (`fixmate-service`)
- `next` (16.4.6) — React Framework with App Router & Turbopack
- `react` & `react-dom` (19.3.0) — Core React library
- `better-auth` (^1.7.25) — Authentication framework
- `mongodb` (^7.0.0) — MongoDB database driver for adapter
- `sonner` (^2.0.7) — Toast notification system
- `lucide-react` — Modern icon system
- `tailwindcss` (4.3.3) — Modern utility-first CSS styling
- `class-variance-authority`, `cmdk`, `date-fns`, `embla-carousel-react`, `recharts` — UI primitives and chart components

### Server Dependencies (`fixmate-service-server`)
- `express` (^5.3.0) — Web server framework
- `mongodb` (^7.9.0) — Native MongoDB Atlas client
- `cors` (^2.8.6) — Cross-origin resource sharing
- `dotenv` (^18.0.10) — Environment variable management
- `jsonwebtoken` (^9.0.3) — JWT token signing and verification
- `stripe` (^22.0.0) — Stripe payment processing SDK

---

## 🏗️ Logical Data Architecture (4 Core Collections)
- **`users`**: User records, roles (`customer` \| `technician` \| `admin`), phone, area, bio.
- **`services`**: Repair service offerings created by technicians and approved by admin.
- **`bookings`**: Customer repair requests governed by the status pipeline.
- **`payments`**: Audited Stripe payment documents and transaction IDs.

---

## ⚙️ Environment Variables Setup

### Client (`fixmate-service/.env.local`)
```env
BETTER_AUTH_SECRET=your_auth_secret_key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

### Server (`fixmate-service-server/.env`)
```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 💻 Local Development Guide

```bash
# 1. Clone repositories
git clone https://github.com/sabbirckc/fixmate-service.git
git clone https://github.com/sabbirckc/fixmate-service-server.git

# 2. Setup Server
cd fixmate-service-server
npm install
npm run seed       # Seeds 14+ services, users, bookings & payments
npm start          # Runs Express on port 5000

# 3. Setup Client
cd ../fixmate-service
npm install
npm run dev        # Runs Next.js on http://localhost:3000
```
