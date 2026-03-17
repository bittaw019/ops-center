import { cn } from "@/lib/utils";

type BadgeVariant = "info" | "success" | "warning" | "error" | "neutral";

const classes: Record<BadgeVariant, string> = {
  info: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  neutral: "bg-slate-700 text-slate-300 border-slate-600"
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", classes[variant], className)}
      {...props}
    />
  );
}
