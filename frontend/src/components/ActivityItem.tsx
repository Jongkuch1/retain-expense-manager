import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function ActivityItem({
  icon,
  iconColor = "#2e7d32",
  title,
  subtitle,
  trailing,
}: {
  icon: ReactNode;
  iconColor?: string;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center", py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Stack
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: `${iconColor}1a`,
          color: iconColor,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Stack>
      <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
      </Stack>
      {trailing}
    </Stack>
  );
}
