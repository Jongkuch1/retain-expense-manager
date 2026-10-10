# Retain — Personal Expense & Budget Manager

Retain is a full-stack web application for tracking personal expenses and managing monthly budgets, built as a summative project.

**Live app:** _add your deployed frontend URL here, e.g. https://retain-app.netlify.app_
**Live API:** _add your deployed backend URL here, e.g. https://retain-api.up.railway.app_

> Replace the two links above once deployed — the assignment requires the live URL in this README.

## Features

### All users
- Sign up, sign in, sign out (React Context-based authentication, JWT-backed)
- Create, view, update, and delete personal expenses (title, amount, category, date, payment method, notes)
- Search, filter (category, payment method, date range), and sort (date/amount) expenses — state managed with Redux
- Paginated expense list
- Set/update a monthly budget and see total spent, remaining budget, and budget status (within / approaching / over)
- Dashboard: total spending for the month, remaining budget, highest expense, spending by category, recent expenses

### Admin only (protected via React Context + backend role checks)
- Create, update, delete expense categories
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
npx tsx prisma/seed.ts   # seeds default categories + an admin user (admin@retain.app / Admin123!)
npm run dev              # starts on http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev              # starts on http://localhost:5173
```

Sign-up always creates a regular `USER` — there is no self-service way to become an admin. The only admin account is the one created by `prisma/seed.ts` (`admin@retain.app` / `Admin123!`); change its password after first login in a real deployment, and create any further admins directly in the database or by extending the seed script.

## Deployment

- **Frontend**: deploy `frontend/` to Netlify (build command `npm run build`, publish directory `dist`; `netlify.toml` is included). Set `VITE_API_URL` to your deployed backend's `/api` URL in Netlify's environment variables.
- **Backend**: deploy `backend/` to Railway (or any Node host) with a managed PostgreSQL addon. Set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` (your Netlify URL) as environment variables. `railway.json` runs `prisma migrate deploy` before starting the server.

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
