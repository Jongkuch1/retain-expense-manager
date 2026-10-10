import { LinearProgress, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accentColor?: string;
  progress?: number;
  caption?: string;
}

export function StatCard({ label, value, icon, accentColor = "#2e7d32", progress, caption }: Props) {
  return (
    <Paper
      sx={{
        p: 2.5,
        height: "100%",
        borderLeft: "4px solid",
        borderLeftColor: accentColor,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Stack>
        {icon && (
          <Stack
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${accentColor}1a`,
              color: accentColor,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Stack>
        )}
      </Stack>
      {progress !== undefined ? (
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, progress))}
          sx={{
            mt: 1.5,
            height: 5,
            borderRadius: 4,
            bgcolor: `${accentColor}22`,
            "& .MuiLinearProgress-bar": { bgcolor: accentColor },
          }}
        />
      ) : null}
      {caption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {caption}
        </Typography>
      )}
    </Paper>
  );
}
