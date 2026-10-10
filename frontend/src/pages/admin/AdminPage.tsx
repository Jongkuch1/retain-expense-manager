import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { adminApi, categoryApi } from "../../api/endpoints";
import type { AdminInsights, Category } from "../../types";
import { StatCard } from "../../components/StatCard";
import { QuickActionCard } from "../../components/QuickActionCard";
import { ActivityItem } from "../../components/ActivityItem";
import { formatCurrency, formatRelativeTime } from "../../utils/format";
import { getErrorMessage } from "../../utils/errors";

export function AdminPage() {
  const navigate = useNavigate();
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

  const monthShareOfExpenses =
    insights && insights.totalExpenses > 0 ? (insights.expensesThisMonth / insights.totalExpenses) * 100 : undefined;

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Platform overview
      </Typography>

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
            icon={<AddIcon fontSize="large" />}
            title="Add category"
            subtitle="Create a new expense category"
            onClick={openCreate}
          />
          <QuickActionCard
            icon={<ReceiptLongOutlinedIcon fontSize="large" color="primary" />}
            title="View all expenses"
            subtitle="Browse every recorded expense"
            onClick={() => navigate("/expenses")}
          />
          <QuickActionCard
            icon={<RefreshOutlinedIcon fontSize="large" color="primary" />}
            title="Refresh insights"
            subtitle="Reload the latest platform stats"
            onClick={load}
          />
        </Box>
      </Paper>

      {insights && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr) minmax(0, 1fr)", md: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
          <StatCard
            label="Registered users"
            value={insights.totalUsers}
            icon={<GroupOutlinedIcon />}
            accentColor="#1565c0"
          />
          <StatCard
            label="Expenses recorded"
            value={insights.totalExpenses}
            icon={<ReceiptLongOutlinedIcon />}
            accentColor="#6a1b9a"
          />
          <StatCard
            label="Total expense value"
            value={formatCurrency(insights.totalExpenseValue)}
            icon={<PaidOutlinedIcon />}
            accentColor="#2e7d32"
          />
          <StatCard
            label="Expenses this month"
            value={insights.expensesThisMonth}
            icon={<CalendarMonthOutlinedIcon />}
            accentColor="#ef6c00"
            progress={monthShareOfExpenses}
            caption={monthShareOfExpenses !== undefined ? `${monthShareOfExpenses.toFixed(0)}% of all-time expenses` : undefined}
          />
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Categories
            </Typography>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
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
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
            Recently added expenses
          </Typography>
          {insights?.recentExpenses.length === 0 ? (
            <Typography color="text.secondary">No expenses yet.</Typography>
          ) : (
            insights?.recentExpenses.map((e) => (
              <ActivityItem
                key={e.id}
                icon={<ReceiptOutlinedIcon fontSize="small" />}
                iconColor="#6a1b9a"
                title={e.title}
                subtitle={`${e.category.name} · ${formatRelativeTime(e.createdAt)}`}
                trailing={
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {formatCurrency(e.amount)}
                  </Typography>
                }
              />
            ))
          )}
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
            Recently registered users
          </Typography>
          {insights?.recentUsers.length === 0 ? (
            <Typography color="text.secondary">No users yet.</Typography>
          ) : (
            insights?.recentUsers.map((u) => (
              <ActivityItem
                key={u.id}
                icon={<PersonOutlineOutlinedIcon fontSize="small" />}
                iconColor="#1565c0"
                title={u.name}
                subtitle={u.email}
                trailing={
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {formatRelativeTime(u.createdAt)}
                  </Typography>
                }
              />
            ))
          )}
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
