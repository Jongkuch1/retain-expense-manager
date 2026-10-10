# Retain — Personal Expense & Budget Manager

Retain is a full-stack web application for tracking personal expenses and managing monthly budgets, built as a summative project.

**Live app:** https://retain-expense-manager.netlify.app
**Live API base URL:** https://retain-backend-zsyu.onrender.com/api (a REST API, not a browsable page — see [API overview](#api-overview) below; try `/api/health` to confirm it's running)

> The backend runs on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after a period of idle may take 30–60 seconds while it wakes back up.

## Features

Regular users and admins are functionally separate: sign-up always creates a regular `USER` (admin accounts exist only via seeding), and each role only ever sees its own part of the app — a user has no access to `/admin`, and an admin has no personal Dashboard/Expenses view (they're redirected straight to their own area either way).

### Regular users
- Sign up, sign in, sign out (React Context-based authentication, JWT-backed)
- Create, view, update, and delete personal expenses (title, amount, category, date, payment method, notes)
- Search, filter (category, payment method, date range, amount range), and sort (date/amount) expenses — state managed with Redux
- Paginated expense list
- Set/update a monthly budget and see total spent, remaining budget, and budget status (within / approaching / over)
- Dashboard: total spending for the month, remaining budget, highest expense, spending by category, recent expenses

### Admins only (protected via React Context + backend role checks)
- Create, update, delete expense categories — deleting a category that still has expenses reassigns them to a default "Uncategorized" category rather than blocking the deletion or leaving orphaned data; the "Uncategorized" category itself can't be renamed or deleted
- Platform insights: total users, total expenses, total expense value, expenses this month, spending per category, top 5 / bottom 5 categories, recently added expenses, recently registered users

## Tech stack

**Frontend** — `frontend/`
- React 19 + TypeScript + Vite
- Material UI (MUI) for components/styling
- React Router for routing
- React Context for authentication & role-based protected routes
- Redux Toolkit for expense filtering/searching/sorting state
- Axios for API calls

**Backend** — `backend/`
- Node.js + Express + TypeScript
- Prisma ORM over PostgreSQL
- JWT authentication, bcrypt password hashing, Zod request validation

## Project structure

```
retain-expense-manager/
  backend/     Express API, Prisma schema & migrations
  frontend/    React + TypeScript + Vite app
```

## Local setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local or hosted)

### Backend

```bash
cd backend
cp .env.example .env     # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev   # creates tables
npx tsx prisma/seed.ts   # seeds default categories + an admin user; prints a random admin password once (save it)
npm run dev              # starts on http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev              # starts on http://localhost:5173
```

Sign-up always creates a regular `USER` — there is no self-service way to become an admin. The only admin account is the one created by `prisma/seed.ts` (email `admin@retain.app` by default, or set `ADMIN_EMAIL`); its password is either a random value printed once when the seed runs, or whatever you set as `ADMIN_PASSWORD` before running it. To rotate an existing admin's password later, run `npm run rotate-admin-password -- <email>` (or set `NEW_PASSWORD` to choose it yourself instead of getting a random one) — it prints the new password once. Create any further admins directly in the database or by extending the seed script.

## Deployment

- **Frontend**: deployed to Netlify (build command `npm run build`, publish directory `dist`; see `netlify.toml`). `VITE_API_URL` is set to the backend's `/api` URL in Netlify's environment variables.
- **Backend**: deployed to Render as a free Node web service, with a managed free-tier PostgreSQL database in the same Render account. Environment variables: `DATABASE_URL` (the database's connection string), `JWT_SECRET`, and `CORS_ORIGIN` (the Netlify URL above — must be set to a real origin; there is no wildcard fallback). Render runs `npx prisma migrate deploy` before starting the server on every deploy. `render.yaml` describes this setup as a blueprint.

## API overview

Base URL: `/api`. All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Create an account | Public |
| POST | `/auth/login` | Log in | Public |
| GET | `/auth/me` | Current user | Authenticated |
| GET | `/categories` | List categories | Authenticated |
| POST/PUT/DELETE | `/categories` | Manage categories | Admin |
| GET | `/expenses` | List own expenses — query params: `search`, `categoryId`, `paymentMethod`, `startDate`/`endDate`, `minAmount`/`maxAmount`, `sortBy` (`date`\|`amount`), `sortOrder`, `page`, `pageSize` | Authenticated |
| POST/PUT/DELETE | `/expenses/:id` | Manage own expenses | Authenticated |
| GET | `/expenses/dashboard/summary` | Monthly dashboard summary | Authenticated |
| GET/PUT | `/budgets` | Get/set monthly budget | Authenticated |
| GET | `/admin/insights` | Platform-wide insights | Admin |

Expenses and budgets are always scoped to the authenticated user; the backend enforces this on every query so users can never read or modify another user's data.

## Notes

- Automated testing was not required for this assessment and is not included.
- Enhancements beyond the brief (charts, recurring expenses, notifications) were intentionally left out to keep scope aligned with the rubric.
