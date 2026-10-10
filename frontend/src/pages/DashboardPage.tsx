import { useEffect, useState } from "react";
import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import { budgetApi, expenseApi } from "../api/endpoints";
import type { DashboardSummary } from "../types";
import { StatCard } from "../components/StatCard";
import { BudgetWidget } from "../components/BudgetWidget";
import { formatCurrency, formatDate, MONTH_NAMES } from "../utils/format";

const now = new Date();

export function DashboardPage() {
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

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
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

      {!loading && summary && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <StatCard
              label="Total spent"
              value={formatCurrency(summary.totalSpent)}
              icon={<PaidOutlinedIcon color="primary" />}
            />
            <StatCard
              label="Remaining budget"
              value={summary.remaining !== null ? formatCurrency(summary.remaining) : "—"}
              icon={<AccountBalanceWalletOutlinedIcon color="primary" />}
            />
            <StatCard
              label="Highest expense"
              value={summary.highestExpense ? formatCurrency(summary.highestExpense.amount) : "—"}
              icon={<TrendingUpOutlinedIcon color="primary" />}
            />
            <StatCard
              label="Recorded expenses"
              value={summary.recentExpenses.length}
              icon={<ListAltOutlinedIcon color="primary" />}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <BudgetWidget summary={summary} onSetBudget={handleSetBudget} />

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
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
            <Typography variant="h6" gutterBottom>
              Recent expenses
            </Typography>
            {summary.recentExpenses.length === 0 ? (
              <Typography color="text.secondary">No expenses recorded this month.</Typography>
            ) : (
              <Stack spacing={1}>
                {summary.recentExpenses.map((e) => (
                  <Stack key={e.id} direction="row" sx={{ justifyContent: "space-between" }}>
                    <Stack>
                      <Typography sx={{ fontWeight: 500 }}>{e.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {e.category.name} · {formatDate(e.date)}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontWeight: 600 }}>{formatCurrency(e.amount)}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </>
      )}
    </Stack>
  );
}
