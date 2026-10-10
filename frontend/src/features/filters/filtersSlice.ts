import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type SortBy = "date" | "amount";
export type SortOrder = "asc" | "desc";

export interface ExpenseFiltersState {
  search: string;
  categoryId: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

const initialState: ExpenseFiltersState = {
  search: "",
  categoryId: "",
  paymentMethod: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
  pageSize: 10,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategoryId(state, action: PayloadAction<string>) {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setPaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setAmountRange(state, action: PayloadAction<{ minAmount: string; maxAmount: string }>) {
      state.minAmount = action.payload.minAmount;
      state.maxAmount = action.payload.maxAmount;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortBy; sortOrder: SortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearch,
  setCategoryId,
  setPaymentMethod,
  setDateRange,
  setAmountRange,
  setSort,
  setPage,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
