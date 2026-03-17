import Link from "next/link";
import { Home, Globe, FolderOpen, Database, Bell, ClipboardList, Settings, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/sites", label: "Siti", icon: Globe },
  { href: "/backups", label: "Backup", icon: Database },
  { href: "/logs", label: "Logs", icon: ClipboardList },
  { href: "/activity", label: "Audit", icon: Shield },
  { href: "/notifications", label: "Notifiche", icon: Bell },
  { href: "/profile", label: "Profilo", icon: User },
  { href: "/settings", label: "Impostazioni", icon: Settings },
  { href: "/users", label: "Utenti", icon: User }
] as const;

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950/80 p-4 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <FolderOpen className="h-5 w-5 text-accent" />
        <span className="text-sm font-semibold tracking-wide text-slate-200">Ops Center</span>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-accent/20 text-accent" : "text-slate-300 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
