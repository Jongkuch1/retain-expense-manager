import { Box, MenuItem, TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setAmountRange,
  setCategoryId,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
} from "../features/filters/filtersSlice";
import { PAYMENT_METHODS } from "../types";
import type { Category } from "../types";

export function ExpenseFiltersBar({ categories }: { categories: Category[] }) {
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: "repeat(3, 1fr)",
          md: "2fr 1.5fr 1.5fr 1.5fr 1.5fr 1fr 1fr 1.5fr",
        },
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        label="Search"
        fullWidth
        size="small"
        value={filters.search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
      />
      <TextField
        select
        label="Category"
        fullWidth
        size="small"
        value={filters.categoryId}
        onChange={(e) => dispatch(setCategoryId(e.target.value))}
      >
        <MenuItem value="">All</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Payment"
        fullWidth
        size="small"
        value={filters.paymentMethod}
        onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
      >
        <MenuItem value="">All</MenuItem>
        {PAYMENT_METHODS.map((pm) => (
          <MenuItem key={pm} value={pm}>
            {pm.replace("_", " ")}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="From"
        type="date"
        fullWidth
        size="small"
        slotProps={{ inputLabel: { shrink: true } }}
        value={filters.startDate}
        onChange={(e) => dispatch(setDateRange({ startDate: e.target.value, endDate: filters.endDate }))}
      />
      <TextField
        label="To"
        type="date"
        fullWidth
        size="small"
        slotProps={{ inputLabel: { shrink: true } }}
        value={filters.endDate}
        onChange={(e) => dispatch(setDateRange({ startDate: filters.startDate, endDate: e.target.value }))}
      />
      <TextField
        label="Min amount"
        type="number"
        fullWidth
        size="small"
        value={filters.minAmount}
        onChange={(e) => dispatch(setAmountRange({ minAmount: e.target.value, maxAmount: filters.maxAmount }))}
        slotProps={{ htmlInput: { min: "0", step: "0.01" } }}
      />
      <TextField
        label="Max amount"
        type="number"
        fullWidth
        size="small"
        value={filters.maxAmount}
        onChange={(e) => dispatch(setAmountRange({ minAmount: filters.minAmount, maxAmount: e.target.value }))}
        slotProps={{ htmlInput: { min: "0", step: "0.01" } }}
      />
      <TextField
        select
        label="Sort by"
        fullWidth
        size="small"
        value={`${filters.sortBy}:${filters.sortOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(":") as ["date" | "amount", "asc" | "desc"];
          dispatch(setSort({ sortBy, sortOrder }));
        }}
      >
        <MenuItem value="date:desc">Newest</MenuItem>
        <MenuItem value="date:asc">Oldest</MenuItem>
        <MenuItem value="amount:desc">Amount ↓</MenuItem>
        <MenuItem value="amount:asc">Amount ↑</MenuItem>
      </TextField>
    </Box>
  );
}
