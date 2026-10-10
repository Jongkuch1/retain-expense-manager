import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { budgetApi, expenseApi } from "../api/endpoints";
import type { DashboardSummary } from "../types";
import { StatCard } from "../components/StatCard";
import { QuickActionCard } from "../components/QuickActionCard";
import { ActivityItem } from "../components/ActivityItem";
import { BudgetWidget } from "../components/BudgetWidget";
import { formatCurrency, formatRelativeTime, MONTH_NAMES } from "../utils/format";

const now = new Date();

export function DashboardPage() {
  const navigate = useNavigate();
  const budgetRef = useRef<HTMLDivElement | null>(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async (m: number, y: number) => {
    setLoading(true);
    try {
      const data = await expenseApi.dashboard(m, y);
      setSummary(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleSetBudget = async (amount: number) => {
    await budgetApi.upsert(month, year, amount);
    await loadSummary(month, year);
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const budgetUsedPercent =
    summary?.budget && summary.budget > 0 ? Math.min(100, (summary.totalSpent / summary.budget) * 100) : undefined;
  const remainingPercent =
    summary?.budget && summary.budget > 0 && summary.remaining !== null
      ? Math.max(0, Math.min(100, (summary.remaining / summary.budget) * 100))
      : undefined;
  const highestShareOfSpend =
    summary?.highestExpense && summary.totalSpent > 0
      ? (summary.highestExpense.amount / summary.totalSpent) * 100
      : undefined;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard overview
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField select label="Month" size="small" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, idx) => (
              <MenuItem key={name} value={idx + 1}>
                {name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Year" size="small" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Quick actions
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <QuickActionCard
            highlighted
            icon={<AddCircleOutlineOutlinedIcon fontSize="large" />}
            title="Add expense"
            subtitle="Record a new expense"
            onClick={() => navigate("/expenses?new=1")}
          />
          <QuickActionCard
            icon={<SavingsOutlinedIcon fontSize="large" color="primary" />}
            title="Set budget"
            subtitle="Update this month's budget"
            onClick={() => budgetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
          />
          <QuickActionCard
            icon={<ReceiptLongOutlinedIcon fontSize="large" color="primary" />}
            title="View all expenses"
            subtitle="Search, filter and sort"
            onClick={() => navigate("/expenses")}
          />
        </Box>
      </Paper>

      {!loading && summary && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0, 1fr) minmax(0, 1fr)", md: "repeat(4, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <StatCard
              label="Total spent"
              value={formatCurrency(summary.totalSpent)}
              icon={<PaidOutlinedIcon />}
              accentColor="#2e7d32"
              progress={budgetUsedPercent}
              caption={budgetUsedPercent !== undefined ? `${budgetUsedPercent.toFixed(0)}% of budget used` : undefined}
            />
            <StatCard
              label="Remaining budget"
              value={summary.remaining !== null ? formatCurrency(summary.remaining) : "—"}
              icon={<AccountBalanceWalletOutlinedIcon />}
              accentColor="#1565c0"
              progress={remainingPercent}
              caption={remainingPercent !== undefined ? `${remainingPercent.toFixed(0)}% of budget left` : undefined}
            />
            <StatCard
              label="Highest expense"
              value={summary.highestExpense ? formatCurrency(summary.highestExpense.amount) : "—"}
              icon={<TrendingUpOutlinedIcon />}
              accentColor="#ef6c00"
              progress={highestShareOfSpend}
              caption={highestShareOfSpend !== undefined ? `${highestShareOfSpend.toFixed(0)}% of total spend` : undefined}
            />
            <StatCard
              label="Recorded expenses"
              value={summary.recentExpenses.length}
              icon={<ListAltOutlinedIcon />}
              accentColor="#6a1b9a"
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2 }}>
            <Box ref={budgetRef}>
              <BudgetWidget summary={summary} onSetBudget={handleSetBudget} />
            </Box>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                Spending by category
              </Typography>
              {summary.spendingByCategory.length === 0 ? (
                <Typography color="text.secondary">No spending recorded this month.</Typography>
              ) : (
                <Stack spacing={1}>
                  {summary.spendingByCategory.map((c) => (
                    <Stack key={c.categoryId} direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography>{c.name}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{formatCurrency(c.total)}</Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
              Recent activity
            </Typography>
            {summary.recentExpenses.length === 0 ? (
              <Typography color="text.secondary">No expenses recorded this month.</Typography>
            ) : (
              <Stack>
                {summary.recentExpenses.map((e) => (
                  <ActivityItem
                    key={e.id}
                    icon={<CategoryOutlinedIcon fontSize="small" />}
                    iconColor="#2e7d32"
                    title={e.title}
                    subtitle={`${e.category.name} · ${formatRelativeTime(e.createdAt)}`}
                    trailing={
                      <Typography sx={{ fontWeight: 600 }} noWrap>
                        {formatCurrency(e.amount)}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </>
      )}
    </Stack>
  );
}
