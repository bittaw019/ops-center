import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar({ userName, unreadNotifications }: { userName: string; unreadNotifications: number }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-bg/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="relative hidden w-full max-w-lg md:block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Ricerca globale: siti, log, eventi..." />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="relative rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800">
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] leading-none text-white">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            ) : null}
          </Link>
          <span className="hidden text-sm text-slate-300 md:inline">{userName}</span>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800" type="submit">
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
