import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import adminRoutes from "./routes/adminRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy; this makes
// express-rate-limit and req.ip use the real client IP from X-Forwarded-For
// instead of the proxy's own address.
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : false,
  }),
);

app.use(express.json({ limit: "50kb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
