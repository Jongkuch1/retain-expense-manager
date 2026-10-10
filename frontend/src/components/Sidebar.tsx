import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { useAuth } from "../context/AuthContext";

export const SIDEBAR_WIDTH = 240;

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const items: NavItem[] = [
    { label: "Dashboard", to: "/dashboard", icon: <SpaceDashboardOutlinedIcon /> },
    { label: "Expenses", to: "/expenses", icon: <ReceiptLongOutlinedIcon /> },
  ];
  if (user?.role === "ADMIN") {
    items.push({ label: "Admin", to: "/admin", icon: <AdminPanelSettingsOutlinedIcon /> });
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0b2b22",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 3 }}>
        <SavingsOutlinedIcon sx={{ color: "#4caf80" }} fontSize="large" />
        <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
          Retain
        </Typography>
      </Box>

      <Typography
        variant="overline"
        sx={{ px: 2.5, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}
      >
        Menu
      </Typography>
      <List sx={{ px: 1.5 }}>
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              onClick={onNavigate}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: active ? "white" : "rgba(255,255,255,0.75)",
                "&.Mui-selected": {
                  bgcolor: "#1f6f54",
                  "&:hover": { bgcolor: "#1f6f54" },
                },
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontWeight: active ? 600 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
      <List sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          sx={{ borderRadius: 2, color: "rgba(255,255,255,0.75)", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box", border: "none" },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
}
