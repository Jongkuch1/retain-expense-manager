import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { adminApi, categoryApi } from "../../api/endpoints";
import type { AdminInsights, Category } from "../../types";
import { StatCard } from "../../components/StatCard";
import { formatCurrency, formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";

export function AdminPage() {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = async () => {
    const [i, c] = await Promise.all([adminApi.insights(), categoryApi.list()]);
    setInsights(i);
    setCategories(c);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await categoryApi.update(editing.id, name);
      } else {
        await categoryApi.create(name);
      }
      setDialogOpen(false);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to save category"));
    }
  };

  const handleDelete = async (category: Category) => {
    setDeleteError(null);
    try {
      await categoryApi.remove(category.id);
      await load();
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, "Unable to delete category"));
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Admin dashboard
      </Typography>

      {insights && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr) minmax(0, 1fr)", md: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
          <StatCard label="Registered users" value={insights.totalUsers} icon={<GroupOutlinedIcon color="primary" />} />
          <StatCard
            label="Expenses recorded"
            value={insights.totalExpenses}
            icon={<ReceiptLongOutlinedIcon color="primary" />}
          />
          <StatCard
            label="Total expense value"
            value={formatCurrency(insights.totalExpenseValue)}
            icon={<PaidOutlinedIcon color="primary" />}
          />
          <StatCard
            label="Expenses this month"
            value={insights.expensesThisMonth}
            icon={<CalendarMonthOutlinedIcon color="primary" />}
          />
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6">Categories</Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={openCreate}>
              Add
            </Button>
          </Stack>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 1 }} onClose={() => setDeleteError(null)}>
              {deleteError}
            </Alert>
          )}
          <List dense>
            {categories.map((c) => (
              <ListItem
                key={c.id}
                secondaryAction={
                  <Stack direction="row">
                    <IconButton size="small" onClick={() => openEdit(c)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(c)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText primary={c.name} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Spending per category
          </Typography>
          <Stack spacing={1}>
            {insights?.spendingPerCategory.map((c) => (
              <Stack key={c.categoryId} direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography>
                  {c.name}{" "}
                  <Typography component="span" variant="caption" color="text.secondary">
                    ({c.usageCount} uses)
                  </Typography>
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatCurrency(c.totalSpent)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top 5 categories
          </Typography>
          <Stack spacing={1}>
            {insights?.topCategories.map((c) => (
              <Stack key={c.categoryId} direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography>{c.name}</Typography>
                <Typography color="text.secondary">{c.usageCount} expenses</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bottom 5 categories
          </Typography>
          <Stack spacing={1}>
            {insights?.bottomCategories.map((c) => (
              <Stack key={c.categoryId} direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography>{c.name}</Typography>
                <Typography color="text.secondary">{c.usageCount} expenses</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recently added expenses
          </Typography>
          <Stack spacing={1}>
            {insights?.recentExpenses.map((e) => (
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
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recently registered users
          </Typography>
          <Stack spacing={1}>
            {insights?.recentUsers.map((u) => (
              <Stack key={u.id} direction="row" sx={{ justifyContent: "space-between" }}>
                <Stack>
                  <Typography sx={{ fontWeight: 500 }}>{u.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.email}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(u.createdAt)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            <TextField
              autoFocus
              label="Category name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}
