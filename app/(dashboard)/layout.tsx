import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/server";
import { countUnreadNotifications } from "@/lib/services/notification-service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unreadNotifications = await countUnreadNotifications(user.id);

  return <AppShell userName={user.name} unreadNotifications={unreadNotifications}>{children}</AppShell>;
}
