import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { store } from "./app/store";
import { Layout } from "./components/Layout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { AdminPage } from "./pages/admin/AdminPage";

const theme = createTheme({
  palette: {
    primary: { main: "#2e7d32" },
    secondary: { main: "#ff8f00" },
  },
  shape: { borderRadius: 10 },
});

function AppLayoutRoute({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
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
                    <AppLayoutRoute>
                      <DashboardPage />
                    </AppLayoutRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <AppLayoutRoute>
                      <ExpensesPage />
                    </AppLayoutRoute>
                  }
                />
              </Route>

              <Route element={<AdminRoute />}>
                <Route
                  path="/admin"
                  element={
                    <AppLayoutRoute>
                      <AdminPage />
                    </AppLayoutRoute>
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
