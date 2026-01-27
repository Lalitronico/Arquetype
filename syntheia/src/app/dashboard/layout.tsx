"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Users,
  Users2,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Plus,
  Menu,
  X,
  Loader2,
  Key,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Studies", href: "/dashboard/studies", icon: FileText },
  { name: "Persona Library", href: "/dashboard/personas", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const secondaryNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Team", href: "/dashboard/settings/team", icon: Users2 },
  { name: "API Keys", href: "/dashboard/settings/api", icon: Key },
  { name: "Activity", href: "/dashboard/settings/activity", icon: Activity },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null);

  const { data: session, isPending } = useSession();

  // Fetch credits on mount and when pathname changes (to refresh after running studies)
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/billing");
        if (response.ok) {
          const data = await response.json();
          setCredits({
            remaining: data.data?.organization?.creditsRemaining ?? 1000,
            total: data.data?.organization?.creditsMonthly ?? 1000,
          });
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      }
    };

    if (session) {
      fetchCredits();
    }
  }, [session, pathname]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const user = session?.user;
  const userInitials = getInitials(user?.name, user?.email || "U");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Syntheia</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              {secondaryNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Credits display */}
          <div className="p-4 border-t">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits Remaining
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {credits ? credits.remaining.toLocaleString() : "..."}
                </span>
                <span className="text-sm text-gray-500">
                  / {credits ? credits.total.toLocaleString() : "..."}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    credits && credits.remaining / credits.total < 0.2
                      ? "bg-red-500"
                      : credits && credits.remaining / credits.total < 0.5
                      ? "bg-yellow-500"
                      : "bg-blue-600"
                  )}
                  style={{
                    width: credits
                      ? `${(credits.remaining / credits.total) * 100}%`
                      : "100%"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find((n) => n.href === pathname)?.name ||
                  secondaryNav.find((n) => n.href === pathname)?.name ||
                  "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard/studies/new">
                <Button variant="gradient" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Study
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || ""} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name || "User"}</span>
                      <span className="text-xs font-normal text-gray-500">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
