"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Box,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  FileUp,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  Search,
  Settings,
  Sun,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  courierCompany,
  dashboardDateRanges,
  dashboardJobs,
  liveTrackingItems,
  recentRoutes,
  salesSummary,
  salesTransactions,
  teamAgents,
  type CourierDashboardJob,
  type LiveTrackingItem,
  type RecentRoute,
  type TeamAgent,
} from "@/lib/courier-dashboard-data";
import { ShipmentStatus } from "@/lib/types";
import { cx } from "@/lib/utils";

const navItems = [
  { href: "/courier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courier/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/courier/jobs/1001", label: "Tracking", icon: Truck },
  { href: "/courier/settings", label: "Clients", icon: Users },
  { href: "/courier/settings", label: "Messages", icon: MessageSquare },
  { href: "/courier/settings", label: "Settings", icon: Settings },
];

const visibleJobCount = 4;
const visibleSidebarCount = 4;

export function CourierDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"jobs" | "sales">("jobs");
  const [companyOpen, setCompanyOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(dashboardJobs[0]?.id ?? null);
  const [jobMenuId, setJobMenuId] = useState<number | null>(null);
  const [trackingIndex, setTrackingIndex] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState(dashboardDateRanges[0]);
  const [search, setSearch] = useState("");
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [uploadedTrackingIds, setUploadedTrackingIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return dashboardJobs;
    }

    return dashboardJobs.filter((job) => {
      const searchable = [
        job.customer,
        job.fromCity,
        job.fromCountry,
        job.toCity,
        job.toCountry,
        job.jobId,
        job.trackingId,
        job.status,
        job.cargo,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [search]);

  const displayedJobs = showAllJobs ? filteredJobs : filteredJobs.slice(0, visibleJobCount);
  const trackingItem = liveTrackingItems[trackingIndex];
  const dashboardMetrics = useMemo(() => getDashboardMetrics(), []);

  const logout = async () => {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setProfileOpen(false);
      setMobileOpen(false);
      router.replace("/login");
      router.refresh();
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 2400);
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copied`);
    } catch {
      showToast(`${label}: ${value}`);
    }
  };

  const selectTracking = (direction: "previous" | "next") => {
    setTrackingIndex((current) => {
      if (direction === "previous") {
        return current === 0 ? liveTrackingItems.length - 1 : current - 1;
      }

      return current === liveTrackingItems.length - 1 ? 0 : current + 1;
    });
  };

  const uploadFiles = (item: LiveTrackingItem) => {
    setUploadedTrackingIds((ids) =>
      ids.includes(item.trackingId) ? ids : [...ids, item.trackingId],
    );
    showToast(`Files uploaded for ${item.trackingId}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#171721]" data-testid="courier-dashboard">
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-[#E7E7E9] bg-white px-3 sm:px-4 lg:px-6">
        <button
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E4E6E8] text-[#171721] lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          type="button"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        <Link href="/courier/dashboard" aria-label="TranXIT courier dashboard">
          <BrandLogo />
        </Link>

        <nav className="ml-10 hidden h-full items-center gap-7 xl:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.label === "Jobs"
                ? pathname === "/courier/dashboard" || pathname.startsWith("/courier/jobs")
                : pathname === item.href && item.label !== "Jobs";

            return (
              <Link
                className={cx(
                  "inline-flex h-full items-center gap-2 border-b-2 border-transparent text-sm font-bold text-[#1E1E22] transition",
                  active && "border-[#0F7CFF] text-[#0F7CFF]",
                  !active && "hover:text-[#0F7CFF]",
                )}
                href={item.href}
                key={item.label}
              >
                <span
                  className={cx(
                    "inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#F0F1F2] text-[#B7BBC0]",
                    active && "bg-[#DCEBFF] text-[#0F7CFF]",
                  )}
                >
                  <Icon size={14} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Toggle light theme"
            className="hidden h-9 w-16 items-center justify-between rounded-full border border-[#E4E6E8] bg-[#F5F5F5] px-1 text-[#171721] shadow-[0_8px_18px_-14px_rgba(23,23,33,0.8)] md:inline-flex"
            onClick={() => showToast("Light theme active")}
            type="button"
          >
            <span className="h-7 w-7 rounded-full bg-white shadow-sm" />
            <Sun size={15} />
          </button>

          <label className="hidden h-10 min-w-[220px] items-center gap-2 rounded-lg bg-[#F3F4F5] px-3 text-sm text-[#8C8F95] lg:flex">
            <Search size={17} />
            <input
              aria-label="Search dashboard"
              className="w-full bg-transparent text-[#171721] outline-none placeholder:text-[#8C8F95]"
              data-testid="dashboard-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              type="search"
              value={search}
            />
          </label>

          <button
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#7B7F87] hover:bg-[#F3F4F5]"
            onClick={() => showToast("No new notifications")}
            type="button"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#BFF000]" />
          </button>

          <div className="relative">
            <button
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E6E8] bg-[#171721] text-sm font-bold text-white sm:h-11 sm:w-11"
              data-testid="profile-menu-trigger"
              onClick={() => setProfileOpen((open) => !open)}
              type="button"
            >
              DK
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-[#E4E6E8] bg-white p-2 shadow-[0_24px_60px_-24px_rgba(23,23,33,0.45)]">
                <div className="border-b border-[#F0F0F1] px-3 py-2">
                  <p className="text-sm font-bold">Dawood Khan</p>
                  <p className="text-xs text-[#8C8F95]">Courier admin</p>
                </div>
                <Link
                  className="mt-2 flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold hover:bg-[#F5F5F5]"
                  href="/courier/settings"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={16} />
                  Profile settings
                </Link>
                <button
                  className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-bold hover:bg-[#F5F5F5]"
                  disabled={loggingOut}
                  onClick={logout}
                  type="button"
                >
                  <LogOut size={16} />
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-x-0 top-16 z-30 max-h-[calc(100vh-64px)] overflow-y-auto border-b border-[#E4E6E8] bg-white p-4 shadow-[0_24px_60px_-32px_rgba(23,23,33,0.5)] lg:hidden">
          <label className="mb-4 flex h-10 items-center gap-2 rounded-lg bg-[#F3F4F5] px-3 text-sm text-[#8C8F95]">
            <Search size={17} />
            <input
              aria-label="Search dashboard mobile"
              className="w-full bg-transparent text-[#171721] outline-none placeholder:text-[#8C8F95]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search jobs, routes, tracking IDs"
              type="search"
              value={search}
            />
          </label>
          <nav className="mb-4 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-[#292C43] hover:bg-[#F5F5F5]"
                  href={item.href}
                  key={item.label}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <SidebarContent
            companyOpen={companyOpen}
            onCompanyOpenChange={setCompanyOpen}
            onRouteToast={showToast}
            onTeamToast={showToast}
            showAllAgents={showAllAgents}
            showAllRoutes={showAllRoutes}
            onShowAllAgentsChange={setShowAllAgents}
            onShowAllRoutesChange={setShowAllRoutes}
          />
          <div className="mt-6 grid gap-2 border-t border-[#E4E6E8] pt-4">
            <Link
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-[#292C43] hover:bg-[#F5F5F5]"
              href="/courier/settings"
              onClick={() => setMobileOpen(false)}
            >
              <Settings size={17} />
              Profile settings
            </Link>
            <button
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-bold text-[#292C43] hover:bg-[#F5F5F5]"
              data-testid="mobile-logout"
              disabled={loggingOut}
              onClick={logout}
              type="button"
            >
              <LogOut size={17} />
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-56 shrink-0 overflow-y-auto border-r border-[#E7E7E9] bg-[#F7F7F8] p-6 lg:block">
          <SidebarContent
            companyOpen={companyOpen}
            onCompanyOpenChange={setCompanyOpen}
            onRouteToast={showToast}
            onTeamToast={showToast}
            showAllAgents={showAllAgents}
            showAllRoutes={showAllRoutes}
            onShowAllAgentsChange={setShowAllAgents}
            onShowAllRoutesChange={setShowAllRoutes}
          />
        </aside>

        <main className="min-w-0 flex-1">
          {showProfileBanner ? (
            <section className="relative border-b border-[#E4E6E8] bg-[#FAFFE9] px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#171721]">
                    {courierCompany.profileCompletion}% Profile completion
                  </h2>
                  <p className="mt-1 max-w-[300px] text-sm leading-5 text-[#8C8F95] sm:max-w-[640px]">
                    Complete your profile to enjoy endless experience on our platform
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    className="text-sm font-bold text-[#7B7F87] hover:text-[#171721]"
                    onClick={() => setShowProfileBanner(false)}
                    type="button"
                  >
                    Skip
                  </button>
                  <Link
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-[#BFF000] px-8 text-sm font-bold text-[#111110] hover:bg-[#D6FF28]"
                    href="/courier/settings"
                  >
                    Complete
                  </Link>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-transparent">
                <span
                  className="block h-full bg-[#52D6AA]"
                  style={{ width: `${courierCompany.profileCompletion}%` }}
                />
              </div>
            </section>
          ) : null}

          <section className="grid gap-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-normal text-[#171721] sm:text-[34px]">
                  Welcome, Dawood
                </h1>
                <p className="mt-1 text-base text-[#A0A0A4]">Check out latest updates</p>
              </div>

              <div className="relative">
                <button
                  aria-expanded={dateOpen}
                  className="inline-flex h-12 items-center gap-3 rounded-lg bg-[#EEEFF0] px-5 text-sm font-bold text-[#171721] hover:bg-[#E6E7E8]"
                  data-testid="date-range-trigger"
                  onClick={() => setDateOpen((open) => !open)}
                  type="button"
                >
                  <CalendarDays size={17} />
                  {selectedDateRange}
                  <ChevronDown size={16} />
                </button>
                {dateOpen ? (
                  <div className="absolute right-0 top-14 z-20 w-56 rounded-lg border border-[#E4E6E8] bg-white p-2 shadow-[0_18px_48px_-24px_rgba(23,23,33,0.4)]">
                    {dashboardDateRanges.map((range) => (
                      <button
                        className={cx(
                          "flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-bold hover:bg-[#F5F5F5]",
                          selectedDateRange === range && "bg-[#F5F5F5]",
                        )}
                        key={range}
                        onClick={() => {
                          setSelectedDateRange(range);
                          setDateOpen(false);
                        }}
                        type="button"
                      >
                        {range}
                        {selectedDateRange === range ? <Check size={15} /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-b border-[#E4E6E8]">
              <div className="flex gap-8">
                {(["jobs", "sales"] as const).map((tab) => (
                  <button
                    className={cx(
                      "relative h-12 px-7 text-sm font-bold capitalize text-[#8C8F95]",
                      activeTab === tab && "text-[#171721]",
                    )}
                    data-testid={`dashboard-tab-${tab}`}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab}
                    {activeTab === tab ? (
                      <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-[#171721]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>

            {activeTab === "jobs" ? (
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_368px]">
                <section className="min-w-0">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-[#171721]">Recent Job Requests</h2>
                    <button
                      className="text-sm font-bold text-[#0F7CFF] hover:text-[#075BB8]"
                      data-testid="job-see-all"
                      onClick={() => setShowAllJobs((open) => !open)}
                      type="button"
                    >
                      {showAllJobs ? "Show less" : "See all"}
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {displayedJobs.length ? (
                      displayedJobs.map((job) => (
                        <JobRequestRow
                          expanded={expandedJobId === job.id}
                          job={job}
                          key={job.id}
                          menuOpen={jobMenuId === job.id}
                          onCopy={copyText}
                          onMenuChange={(open) => setJobMenuId(open ? job.id : null)}
                          onToggle={() =>
                            setExpandedJobId((current) => (current === job.id ? null : job.id))
                          }
                        />
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#D6D7DA] bg-white p-8 text-center">
                        <p className="text-sm font-bold text-[#171721]">No job requests found</p>
                        <p className="mt-1 text-sm text-[#8C8F95]">
                          Try a different route, customer, or tracking ID.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <LiveTrackingPanel
                  currentIndex={trackingIndex}
                  item={trackingItem}
                  onCopy={copyText}
                  onMove={selectTracking}
                  onUpload={uploadFiles}
                  uploaded={uploadedTrackingIds.includes(trackingItem.trackingId)}
                />
              </div>
            ) : (
              <SalesView />
            )}
          </section>
        </main>
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#171721] px-4 py-3 text-sm font-bold text-white shadow-[0_24px_48px_-24px_rgba(23,23,33,0.7)]">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({
  companyOpen,
  onCompanyOpenChange,
  onRouteToast,
  onTeamToast,
  showAllAgents,
  showAllRoutes,
  onShowAllAgentsChange,
  onShowAllRoutesChange,
}: {
  companyOpen: boolean;
  onCompanyOpenChange: (open: boolean) => void;
  onRouteToast: (message: string) => void;
  onTeamToast: (message: string) => void;
  showAllAgents: boolean;
  showAllRoutes: boolean;
  onShowAllAgentsChange: (open: boolean) => void;
  onShowAllRoutesChange: (open: boolean) => void;
}) {
  const visibleRoutes = showAllRoutes ? recentRoutes : recentRoutes.slice(0, visibleSidebarCount);
  const visibleAgents = showAllAgents ? teamAgents : teamAgents.slice(0, visibleSidebarCount);

  return (
    <div className="grid gap-8">
      <section>
        <p className="mb-3 text-sm text-[#A0A0A4]">Company</p>
        <div className="relative">
          <button
            aria-expanded={companyOpen}
            className="flex w-full items-center gap-3 rounded-lg py-1 text-left hover:bg-white/70"
            data-testid="company-switcher"
            onClick={() => onCompanyOpenChange(!companyOpen)}
            type="button"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFD64D] text-[10px] font-black text-[#EF552E]">
              DHL
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{courierCompany.name}</span>
              <span className="block truncate text-xs text-[#8C8F95]">{courierCompany.location}</span>
            </span>
            <ChevronDown
              className={cx("shrink-0 text-[#A0A0A4] transition", companyOpen && "rotate-180")}
              size={16}
            />
          </button>
          {companyOpen ? (
            <div className="absolute left-0 top-14 z-20 w-full rounded-lg border border-[#E4E6E8] bg-white p-2 shadow-[0_18px_40px_-24px_rgba(23,23,33,0.45)]">
              {["DHL Courier", "TranXIT Express", "Portside Logistics"].map((company) => (
                <button
                  className="flex h-9 w-full items-center rounded-lg px-2 text-left text-xs font-bold hover:bg-[#F5F5F5]"
                  key={company}
                  onClick={() => {
                    onCompanyOpenChange(false);
                    onRouteToast(`${company} selected`);
                  }}
                  type="button"
                >
                  {company}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <SidebarSection
        actionLabel={showAllRoutes ? "View Less" : "View More"}
        actionTestId="recent-routes-toggle"
        label="Recent Jobs"
        onAction={() => onShowAllRoutesChange(!showAllRoutes)}
      >
        <div className="grid gap-4">
          {visibleRoutes.map((route) => (
            <RecentRouteButton key={route.id} route={route} onRouteToast={onRouteToast} />
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        actionLabel={showAllAgents ? "View Less" : "View More"}
        actionTestId="team-agents-toggle"
        label="Team (Agents)"
        onAction={() => onShowAllAgentsChange(!showAllAgents)}
      >
        <div className="grid gap-4">
          {visibleAgents.map((agent) => (
            <TeamAgentButton agent={agent} key={agent.id} onTeamToast={onTeamToast} />
          ))}
        </div>
      </SidebarSection>
    </div>
  );
}

function SidebarSection({
  actionLabel,
  actionTestId,
  children,
  label,
  onAction,
}: {
  actionLabel: string;
  actionTestId: string;
  children: ReactNode;
  label: string;
  onAction: () => void;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[#A0A0A4]">{label}</p>
        <ChevronDown size={16} className="text-[#A0A0A4]" />
      </div>
      {children}
      <button
        className="mt-5 text-sm font-bold text-[#0F7CFF] hover:text-[#075BB8]"
        data-testid={actionTestId}
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    </section>
  );
}

function RecentRouteButton({
  onRouteToast,
  route,
}: {
  onRouteToast: (message: string) => void;
  route: RecentRoute;
}) {
  return (
    <button
      className="grid w-full grid-cols-[18px_minmax(0,1fr)_14px_minmax(0,1fr)_6px] items-center gap-2 text-left text-sm font-bold text-[#171721]"
      onClick={() => onRouteToast(`${route.from} to ${route.to} opened`)}
      type="button"
    >
      <span className="h-3 w-3 rounded-sm bg-[#0F7CFF] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
      <span className="truncate">{route.from}</span>
      <ArrowRight size={13} className="text-[#0F7CFF]" />
      <span className="truncate">{route.to}</span>
      <span className={cx("h-1.5 w-1.5 rounded-full", route.active ? "bg-[#BFF000]" : "bg-[#C9CCD0]")} />
    </button>
  );
}

function TeamAgentButton({
  agent,
  onTeamToast,
}: {
  agent: TeamAgent;
  onTeamToast: (message: string) => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-lg text-left hover:bg-white/70"
      onClick={() => onTeamToast(`${agent.name} opened`)}
      type="button"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-[#171721]"
        style={{ backgroundColor: agent.accent }}
      >
        {agent.initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">{agent.name}</span>
        <span className="block truncate text-xs text-[#9A9DA3]">
          Bids: {agent.bids} &nbsp; Assigned: {agent.assigned}
        </span>
      </span>
    </button>
  );
}

function MetricCard({
  delta,
  helper,
  icon: Icon,
  label,
  trend,
  value,
}: {
  delta: string;
  helper: string;
  icon: LucideIcon;
  label: string;
  trend: "up" | "down";
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#E4E6E8] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-bold text-[#8C8F95]">{label}</p>
        <Icon size={22} className="text-[#7F8184]" />
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[30px] font-bold leading-none text-[#171721]">{value}</p>
          <p className="mt-2 text-sm text-[#A0A0A4]">{helper}</p>
        </div>
        <p
          className={cx(
            "flex items-center gap-1 text-sm font-bold",
            trend === "up" ? "text-[#20C997]" : "text-[#FF3B30]",
          )}
        >
          {delta}
          {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </p>
      </div>
    </div>
  );
}

function JobRequestRow({
  expanded,
  job,
  menuOpen,
  onCopy,
  onMenuChange,
  onToggle,
}: {
  expanded: boolean;
  job: CourierDashboardJob;
  menuOpen: boolean;
  onCopy: (value: string, label: string) => void;
  onMenuChange: (open: boolean) => void;
  onToggle: () => void;
}) {
  return (
    <article
      className="relative rounded-lg border border-[#E4E6E8] bg-white p-4 shadow-[0_14px_36px_-30px_rgba(23,23,33,0.5)]"
      data-testid={`job-row-${job.id}`}
    >
      <div className="grid gap-3 lg:grid-cols-[24px_minmax(105px,1.2fr)_minmax(105px,1.2fr)_70px_70px_70px_66px_92px_28px] lg:items-center">
        <button
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse job request" : "Expand job request"}
          className="hidden h-7 w-7 items-center justify-center rounded-md text-[#A0A0A4] hover:bg-[#F5F5F5] lg:inline-flex"
          data-testid={`job-expand-${job.id}`}
          onClick={onToggle}
          type="button"
        >
          <ChevronRight className={cx("transition", expanded && "rotate-90")} size={18} />
        </button>

        <RouteCell
          actionLabel={expanded ? "Collapse request" : "Expand request"}
          city={job.fromCity}
          country={job.fromCountry}
          icon={<MapPin size={16} />}
          label="From"
          onAction={onToggle}
        />
        <RouteCell
          city={job.toCity}
          country={job.toCountry}
          icon={<ArrowRight size={14} />}
          label="Ship to"
        />

        <BidCell label="Min Bid" value={job.minBid} />
        <BidCell label="Max Bid" value={job.maxBid} />
        <BidCell label="Your bid" value={job.yourBid ?? "-"} />

        <div>
          <p className="flex items-center gap-1 text-sm font-bold text-[#171721]">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#B8F7DD]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35C996]" />
            </span>
            {job.timeLeft}
          </p>
          <p className="mt-1 text-xs text-[#8C8F95]">Time left</p>
        </div>

        <DashboardStatus status={job.status} />

        <div className="relative flex justify-end">
          <button
            aria-expanded={menuOpen}
            aria-label="Open job actions"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#A0A0A4] hover:bg-[#F5F5F5]"
            data-testid={`job-actions-${job.id}`}
            onClick={() => onMenuChange(!menuOpen)}
            type="button"
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border border-[#E4E6E8] bg-white p-2 shadow-[0_18px_42px_-24px_rgba(23,23,33,0.45)]">
              <Link
                className="flex h-9 items-center rounded-lg px-2 text-sm font-bold hover:bg-[#F5F5F5]"
                href={`/courier/jobs/${job.id}`}
                onClick={() => onMenuChange(false)}
              >
                View request
              </Link>
              <Link
                className="flex h-9 items-center rounded-lg px-2 text-sm font-bold hover:bg-[#F5F5F5]"
                href={`/courier/jobs/${job.id}/bid`}
                onClick={() => onMenuChange(false)}
              >
                Create bid
              </Link>
              <button
                className="flex h-9 w-full items-center rounded-lg px-2 text-left text-sm font-bold hover:bg-[#F5F5F5]"
                onClick={() => {
                  onCopy(job.jobId, "Job ID");
                  onMenuChange(false);
                }}
                type="button"
              >
                Copy job ID
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-[#E6E7E8] pt-3 text-sm text-[#8C8F95] md:flex-row md:items-center md:justify-between">
        <p className="flex min-w-0 items-center gap-2">
          <span>Job ID:</span>
          <span className="font-bold text-[#171721]">{job.jobId}</span>
          <button
            aria-label="Copy job ID"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#0F7CFF] hover:bg-[#EAF3FF]"
            onClick={() => onCopy(job.jobId, "Job ID")}
            type="button"
          >
            <Copy size={14} />
          </button>
        </p>
        <p>
          Dated: <span className="font-bold text-[#171721]">{job.dated}</span>
        </p>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-4 rounded-lg bg-[#FAFAFA] p-4 md:grid-cols-[1fr_220px]">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoMini label="Customer" value={job.customer} />
            <InfoMini label="Cargo" value={job.cargo} />
            <InfoMini label="Tracking ID" value={job.trackingId} />
            <div className="sm:col-span-3">
              <p className="text-xs font-bold uppercase text-[#A0A0A4]">Progress</p>
              <div className="mt-2 h-2 rounded-full bg-[#E8E9EB]">
                <span
                  className="block h-full rounded-full bg-[#BFF000]"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[#595D62]">{job.notes}</p>
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#DADDE0] bg-white px-4 text-sm font-bold hover:border-[#BFF000]"
              href={`/courier/jobs/${job.id}`}
            >
              View request
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#BFF000] px-4 text-sm font-bold text-[#111110] hover:bg-[#D6FF28]"
              href={`/courier/jobs/${job.id}/bid`}
            >
              {job.yourBid ? "View bid" : "Create bid"}
            </Link>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function RouteCell({
  actionLabel,
  city,
  country,
  icon,
  label,
  onAction,
}: {
  actionLabel?: string;
  city: string;
  country: string;
  icon: ReactNode;
  label: string;
  onAction?: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_36px] items-center gap-3">
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[#171721]">{city}</p>
        <p className="mt-1 text-sm text-[#8C8F95]">{label}</p>
        <p className="sr-only">{country}</p>
      </div>
      {onAction ? (
        <button
          aria-label={actionLabel}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FF] text-[#0F7CFF] lg:hidden"
          onClick={onAction}
          type="button"
        >
          {icon}
        </button>
      ) : (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FF] text-[#0F7CFF]">
          {icon}
        </span>
      )}
    </div>
  );
}

function BidCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#171721]">{value}</p>
      <p className="mt-1 text-xs text-[#8C8F95]">{label}</p>
    </div>
  );
}

function DashboardStatus({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={cx(
        "inline-flex h-9 min-w-[100px] items-center justify-center rounded-lg border px-4 text-sm font-bold",
        status === "Bidding" && "border-[#DCEBFF] bg-[#DCEBFF] text-[#0F67E8]",
        status === "Open" && "border-[#E4E6E8] bg-white text-[#171721]",
        status === "Won" && "border-[#DDF7EC] bg-[#ECFBF6] text-[#0D8F65]",
        status === "InTransit" && "border-[#DCEBFF] bg-[#EAF3FF] text-[#0F67E8]",
        status === "Delivered" && "border-[#DDF7EC] bg-[#ECFBF6] text-[#0D8F65]",
        (status === "Closed" || status === "Draft") &&
          "border-[#E4E6E8] bg-[#F5F5F5] text-[#595D62]",
      )}
    >
      {status === "InTransit" ? "In Transit" : status}
    </span>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-[#A0A0A4]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#171721]">{value}</p>
    </div>
  );
}

function LiveTrackingPanel({
  currentIndex,
  item,
  onCopy,
  onMove,
  onUpload,
  uploaded,
}: {
  currentIndex: number;
  item: LiveTrackingItem;
  onCopy: (value: string, label: string) => void;
  onMove: (direction: "previous" | "next") => void;
  onUpload: (item: LiveTrackingItem) => void;
  uploaded: boolean;
}) {
  return (
    <aside className="rounded-lg border border-[#E4E6E8] bg-white p-5">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#171721]">Live Tracking</h2>
        <p className="text-sm text-[#595D62]">
          {currentIndex + 1}/{liveTrackingItems.length}
        </p>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#8C8F95]">Tracking ID</p>
          <p className="mt-1 flex items-center gap-2 text-base font-bold text-[#171721]">
            {item.trackingId}
            <button
              aria-label="Copy tracking ID"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#0F7CFF] hover:bg-[#EAF3FF]"
              onClick={() => onCopy(item.trackingId, "Tracking ID")}
              type="button"
            >
              <Copy size={14} />
            </button>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous tracking item"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F1F2] hover:bg-[#E4E6E8]"
            data-testid="tracking-prev"
            onClick={() => onMove("previous")}
            type="button"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            aria-label="Next tracking item"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F1F2] hover:bg-[#E4E6E8]"
            data-testid="tracking-next"
            onClick={() => onMove("next")}
            type="button"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] items-center gap-3">
        <RouteSummary icon={<MapPin size={16} />} label="From" value={item.from} />
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5FF] text-[#0F7CFF]">
          <ArrowRight size={14} />
        </span>
        <RouteSummary label="Ship to" value={item.to} />
        <div className="col-span-3 flex justify-end">
          <DashboardStatus status={item.status} />
        </div>
      </div>

      <div className="mt-7 grid gap-0">
        {item.steps.map((step, index) => {
          const isCurrent = step.state === "current";
          const isComplete = step.state === "complete";

          return (
            <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-4" key={step.id}>
              <div className="flex flex-col items-center">
                <span
                  className={cx(
                    "mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2",
                    isComplete && "border-[#171721] bg-[#171721]",
                    isCurrent && "border-[#171721] bg-white",
                    step.state === "upcoming" && "border-[#C7C9CC] bg-[#C7C9CC]",
                  )}
                >
                  {isCurrent ? <span className="h-1.5 w-1.5 rounded-full bg-[#171721]" /> : null}
                </span>
                {index < item.steps.length - 1 ? (
                  <span
                    className={cx(
                      "h-full min-h-[42px] w-0.5",
                      isComplete ? "bg-[#171721]" : "bg-[#C7C9CC]",
                    )}
                  />
                ) : null}
              </div>
              <div className={cx("pb-5", step.state === "upcoming" && "text-[#B5B6BA]")}>
                <p className="font-bold">{step.label}</p>
                {isCurrent ? (
                  <>
                    <p className="mt-5 text-sm leading-5 text-[#171721]">{step.description}</p>
                    <button
                      className={cx(
                        "mt-3 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-bold",
                        uploaded
                          ? "bg-[#ECFBF6] text-[#0D8F65]"
                          : "bg-[#BFF000] text-[#111110] hover:bg-[#D6FF28]",
                      )}
                      data-testid="tracking-upload"
                      onClick={() => onUpload(item)}
                      type="button"
                    >
                      <FileUp size={15} />
                      {uploaded ? "Files uploaded" : "Upload Files"}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function RouteSummary({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex min-w-0 items-center gap-2 font-bold text-[#171721]">
        {icon ? (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCEBFF] text-[#0F7CFF]">
            {icon}
          </span>
        ) : null}
        <span className="truncate">{value}</span>
      </p>
      <p className="mt-1 text-sm text-[#8C8F95]">{label}</p>
    </div>
  );
}

function SalesView() {
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_368px]">
      <section className="rounded-lg border border-[#E4E6E8] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Sales Overview</h2>
          <Link className="text-sm font-bold text-[#0F7CFF]" href="/courier/jobs">
            View jobs
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {salesSummary.map((item) => (
            <div className="rounded-lg bg-[#FAFAFA] p-4" key={item.id}>
              <p className="text-sm font-bold text-[#8C8F95]">{item.label}</p>
              <p className="mt-4 text-2xl font-bold">{item.value}</p>
              <p
                className={cx(
                  "mt-2 flex items-center gap-1 text-sm font-bold",
                  item.trend === "up" ? "text-[#20C997]" : "text-[#FF3B30]",
                )}
              >
                {item.delta}
                {item.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-lg border border-[#E4E6E8] bg-white p-5">
        <h2 className="text-lg font-bold">Transactions</h2>
        <div className="mt-5 grid gap-3">
          {salesTransactions.map((transaction) => (
            <div className="rounded-lg border border-[#F0F0F1] p-3" key={transaction.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{transaction.id}</p>
                <span
                  className={cx(
                    "rounded-full px-2 py-1 text-xs font-bold",
                    transaction.status === "Paid"
                      ? "bg-[#ECFBF6] text-[#0D8F65]"
                      : "bg-[#FFF4DF] text-[#9B6500]",
                  )}
                >
                  {transaction.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#8C8F95]">{transaction.customer}</p>
              <p className="mt-2 text-sm font-bold">{transaction.amount}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function getDashboardMetrics() {
  const won = dashboardJobs.filter((job) => job.status === "Won").length + 21;
  const inTransit = dashboardJobs.filter((job) => job.status === "InTransit").length + 9;
  const delivered = dashboardJobs.filter((job) => job.status === "Delivered").length + 120;

  return [
    {
      label: "Total Shipments",
      value: String(dashboardJobs.length + 115),
      helper: "Items",
      delta: "+10%",
      trend: "up" as const,
      icon: Box,
    },
    {
      label: "Won",
      value: String(won),
      helper: "Job requests this month",
      delta: "+10%",
      trend: "up" as const,
      icon: ClipboardCheck,
    },
    {
      label: "In Transit",
      value: String(inTransit),
      helper: "Jobs won this month",
      delta: "-10%",
      trend: "down" as const,
      icon: BriefcaseBusiness,
    },
    {
      label: "Delivered",
      value: String(delivered),
      helper: "Jobs this month",
      delta: "+10%",
      trend: "up" as const,
      icon: PackageCheck,
    },
  ];
}
