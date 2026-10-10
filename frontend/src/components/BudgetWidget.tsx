import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Box, Button, LinearProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import type { DashboardSummary } from "../types";
import { formatCurrency } from "../utils/format";

const STATUS_COPY: Record<DashboardSummary["status"], { label: string; color: "success" | "warning" | "error" | "info" }> = {
  "no-budget": { label: "No budget set", color: "info" },
  within: { label: "Within budget", color: "success" },
  approaching: { label: "Approaching budget", color: "warning" },
  over: { label: "Over budget", color: "error" },
};

interface Props {
  summary: DashboardSummary | null;
  onSetBudget: (amount: number) => Promise<void>;
}

export function BudgetWidget({ summary, onSetBudget }: Props) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAmount(summary?.budget != null ? String(summary.budget) : "");
  }, [summary?.budget]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSubmitting(true);
    try {
      await onSetBudget(value);
    } finally {
      setSubmitting(false);
    }
  };

  const status = summary ? STATUS_COPY[summary.status] : null;
  const percentUsed =
    summary?.budget && summary.budget > 0 ? Math.min(100, (summary.totalSpent / summary.budget) * 100) : 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Monthly budget
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="Set budget"
          type="number"
          size="small"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={submitting}>
          Save
        </Button>
      </Box>
      {summary && (
        <Stack spacing={1}>
          <LinearProgress
            variant="determinate"
            value={percentUsed}
            color={status?.color === "error" ? "error" : status?.color === "warning" ? "warning" : "primary"}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Spent: {formatCurrency(summary.totalSpent)}
            </Typography>
            {summary.remaining !== null && (
              <Typography variant="body2" color="text.secondary">
                Remaining: {formatCurrency(summary.remaining)}
              </Typography>
            )}
          </Stack>
          {status && (
            <Typography
              variant="subtitle2"
              color={`${status.color}.main`}
              sx={{ fontWeight: 600 }}
            >
              {status.label}
            </Typography>
          )}
        </Stack>
      )}
    </Paper>
  );
}
