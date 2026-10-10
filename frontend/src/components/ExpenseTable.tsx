import {
  IconButton,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { Expense, PaginatedExpenses } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

interface Props {
  data: PaginatedExpenses | null;
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onPageChange: (page: number) => void;
}

export function ExpenseTable({ data, loading, onEdit, onDelete, onPageChange }: Props) {
  if (!loading && (!data || data.items.length === 0)) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No expenses found. Try adjusting your filters.</Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.items.map((expense) => (
              <TableRow key={expense.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 500 }}>{expense.title}</Typography>
                  {expense.notes && (
                    <Typography variant="caption" color="text.secondary">
                      {expense.notes}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{expense.category.name}</TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.paymentMethod.replace("_", " ")}</TableCell>
                <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(expense)} aria-label="edit">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(expense)} aria-label="delete">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPages > 1 && (
        <Stack sx={{ alignItems: "center" }}>
          <Pagination
            count={data.totalPages}
            page={data.page}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
          />
        </Stack>
      )}
    </Stack>
  );
}
