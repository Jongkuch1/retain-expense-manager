import { useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeModeContext";
import { SIDEBAR_WIDTH } from "./Sidebar";

const TODAY_LABEL = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function TopBar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const isMdUp = useMediaQuery("(min-width:900px)");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { md: `${SIDEBAR_WIDTH}px` },
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ gap: 1.5, flexWrap: "wrap", py: 1 }}>
        {!isMdUp && (
          <IconButton onClick={onMenuClick} edge="start">
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: "none", sm: "block" } }}>
            {TODAY_LABEL}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <TextField
          size="small"
          placeholder="Search..."
          sx={{ display: { xs: "none", sm: "block" }, width: 220 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <IconButton onClick={toggleMode} aria-label="toggle theme">
          {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        <IconButton aria-label="notifications">
          <NotificationsNoneOutlinedIcon />
        </IconButton>

        <IconButton onClick={handleOpenMenu} sx={{ p: 0.25 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
            {user?.name?.slice(0, 1).toUpperCase() ?? "?"}
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleCloseMenu}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email} · {user?.role.toLowerCase()}
            </Typography>
          </Box>
          <MenuItem onClick={handleLogout}>
            <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
