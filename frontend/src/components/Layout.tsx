import { useState } from "react";
import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";
import { TopBar } from "./TopBar";

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` } }}>
        <TopBar title={title} onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
