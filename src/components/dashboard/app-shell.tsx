"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/utils";

const customerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs/new", label: "Create Job", icon: PackagePlus },
  { href: "/jobs/1001", label: "My Shipments", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

const courierNav = [
  { href: "/courier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courier/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/courier/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  role = "customer",
}: {
  children: React.ReactNode;
  role?: "customer" | "courier";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "customer" ? customerNav : courierNav;
  const settingsHref = role === "customer" ? "/settings" : "/courier/settings";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setMobileOpen(false);
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] text-[#171721]">
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-[#E4E6E8] bg-white/95 px-4 backdrop-blur">
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E4E6E8] lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <BrandLogo />
        <div className="ml-auto hidden h-10 min-w-[320px] items-center gap-2 rounded-lg border border-[#E4E6E8] bg-[#F5F5FA] px-3 text-sm text-[#8083A3] md:flex">
          <Search size={16} />
          <span>Search jobs, bids, invoices</span>
        </div>
        <div className="ml-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E4E6E8] bg-white"
          >
            <Bell size={18} />
          </button>
          <Link
            href={settingsHref}
            aria-label="Open profile settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#171721] text-white"
          >
            <UserRound size={18} />
          </Link>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-[#E4E6E8] bg-white p-4 shadow-[0_24px_48px_-32px_rgba(23,23,33,0.45)] lg:hidden">
          <nav className="grid gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cx(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#595D62] transition",
                    active && "bg-[#BFF000] text-[#111110]",
                    !active && "hover:bg-[#F5F5FA] hover:text-[#171721]",
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button
            type="button"
            className="mt-3 w-full"
            icon={<LogOut size={16} />}
            variant="ghost"
            onClick={logout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      ) : null}

      <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-56 border-r border-[#E4E6E8] bg-white px-3 py-4 lg:block">
        <div className="mb-4 rounded-lg bg-[#171721] p-4 text-white">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#BFF000] text-[#111110]">
            {role === "customer" ? <ClipboardList size={20} /> : <Building2 size={20} />}
          </div>
          <p className="text-xs uppercase text-white/50">
            {role === "customer" ? "Customer Portal" : "Courier Company"}
          </p>
          <p className="mt-1 text-sm font-bold">
            {role === "customer" ? "Shipment Control" : "Bid Operations"}
          </p>
        </div>
        <nav className="grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#595D62] transition",
                  active && "bg-[#BFF000] text-[#111110]",
                  !active && "hover:bg-[#F5F5FA] hover:text-[#171721]",
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button
          type="button"
          className="absolute bottom-4 left-3 right-3"
          icon={<LogOut size={16} />}
          variant="ghost"
          onClick={logout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Log out"}
        </Button>
      </aside>

      <main className="pt-16 lg:pl-56">
        <div className="min-h-[calc(100vh-64px)] p-4 md:p-6 xl:p-8">{children}</div>
      </main>
    </div>
  );
}

