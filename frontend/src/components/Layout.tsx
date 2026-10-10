import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar sx={{ flexWrap: "wrap", gap: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", fontWeight: 700 }}
          >
            Retain
          </Typography>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/expenses">
                Expenses
              </Button>
              {user.role === "ADMIN" && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin
                </Button>
              )}
              <Chip
                label={`${user.name} (${user.role.toLowerCase()})`}
                size="small"
                sx={{ bgcolor: "primary.dark", color: "white" }}
              />
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
