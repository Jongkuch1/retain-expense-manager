import { useMemo } from "react";
import type { ReactNode } from "react";
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeModeContext";
import { store } from "./app/store";
import { Layout } from "./components/Layout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { AdminPage } from "./pages/admin/AdminPage";

function PageLayout({ title, children }: { title: string; children: ReactNode }) {
  return <Layout title={title}>{children}</Layout>;
}

function ThemedApp() {
  const { mode } = useThemeMode();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#2e7d32" },
          secondary: { main: "#ff8f00" },
          background:
            mode === "dark"
              ? { default: "#0f1613", paper: "#16211c" }
              : { default: "#f6f8f7", paper: "#ffffff" },
        },
        shape: { borderRadius: 10 },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route
                  path="/dashboard"
                  element={
                    <PageLayout title="Dashboard">
                      <DashboardPage />
                    </PageLayout>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <PageLayout title="Expenses">
                      <ExpensesPage />
                    </PageLayout>
                  }
                />
              </Route>

              <Route element={<AdminRoute />}>
                <Route
                  path="/admin"
                  element={
                    <PageLayout title="Admin dashboard">
                      <AdminPage />
                    </PageLayout>
                  }
                />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  );
}
