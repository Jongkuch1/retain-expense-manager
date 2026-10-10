import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function StatCard({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, height: "100%" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        {icon}
        <Stack>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
