"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  userName,
  unreadNotifications,
  children
}: {
  userName: string;
  unreadNotifications: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg lg:flex">
      <Sidebar pathname={pathname} />
      <div className="flex-1">
        <Topbar userName={userName} unreadNotifications={unreadNotifications} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
