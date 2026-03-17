import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-accent text-slate-900 hover:bg-teal-300",
    secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
    danger: "bg-danger text-white hover:bg-red-500",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
