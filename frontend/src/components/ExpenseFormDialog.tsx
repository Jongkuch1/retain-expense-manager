import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { PAYMENT_METHODS } from "../types";
import type { Category, Expense, ExpenseInput, PaymentMethod } from "../types";
import { getErrorMessage } from "../utils/errors";

interface Props {
  open: boolean;
  categories: Category[];
  initialExpense?: Expense | null;
  onClose: () => void;
  onSubmit: (input: ExpenseInput) => Promise<void>;
}

const emptyForm: ExpenseInput = {
  title: "",
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "CASH",
  notes: "",
  categoryId: "",
};

export function ExpenseFormDialog({ open, categories, initialExpense, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ExpenseInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialExpense) {
      setForm({
        title: initialExpense.title,
        amount: initialExpense.amount,
        date: initialExpense.date.slice(0, 10),
        paymentMethod: initialExpense.paymentMethod,
        notes: initialExpense.notes ?? "",
        categoryId: initialExpense.categoryId,
      });
    } else {
      setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    }
    setError(null);
  }, [initialExpense, open, categories]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.title.trim()) return setError("Title is required");
    if (!form.categoryId) return setError("Please select a category");
    if (form.amount <= 0) return setError("Amount must be greater than 0");

    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to save expense"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialExpense ? "Edit expense" : "Add expense"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <div style={{ color: "#d32f2f", fontSize: 14 }}>{error}</div>}
          <TextField
            label="Title / description"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            fullWidth
            required
            slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
          />
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            fullWidth
            required
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Payment method"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
            fullWidth
          >
            {PAYMENT_METHODS.map((pm) => (
              <MenuItem key={pm} value={pm}>
                {pm.replace("_", " ")}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
