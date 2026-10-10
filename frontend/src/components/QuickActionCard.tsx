import { ButtonBase, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function QuickActionCard({
  icon,
  title,
  subtitle,
  onClick,
  highlighted = false,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        textAlign: "left",
        borderRadius: 2,
        p: 2.5,
        bgcolor: highlighted ? "primary.main" : "action.hover",
        color: highlighted ? "primary.contrastText" : "text.primary",
        transition: "transform 0.15s ease",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <Stack spacing={1} sx={{ alignItems: "flex-start", width: "100%" }}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: highlighted ? "rgba(255,255,255,0.85)" : "text.secondary" }}
        >
          {subtitle}
        </Typography>
      </Stack>
    </ButtonBase>
  );
}
