import { CourierDashboard } from "@/components/courier/courier-dashboard";
import {
  dashboardJobs as demoDashboardJobs,
  liveTrackingItems as demoTrackingItems,
  recentRoutes as demoRecentRoutes,
} from "@/lib/courier-dashboard-data";
import {
  getCourierJobsRequest,
  getCourierJobStatsRequest,
} from "@/lib/api";
import {
  mapCourierJobToDashboardJob,
  mapRecentRoutes,
  mapTrackingItems,
} from "@/lib/live-data";
import { getServerAuth } from "@/lib/server-auth";
import { BackendJobStats } from "@/lib/types";

const demoDataEnabled = process.env.TRANXIT_ENABLE_DEMO_DATA === "true";

async function loadCourierDashboard() {
  const { token, userName } = await getServerAuth();

  if (!token) {
    return {
      jobs: [],
      routes: [],
      trackingItems: [],
      stats: null as BackendJobStats | null,
      user: null,
    };
  }

  try {
    const [jobsResult, statsResult] = await Promise.all([
      getCourierJobsRequest(1, 50, token),
      getCourierJobStatsRequest(token),
    ]);

    if (!jobsResult.isSuccess || !jobsResult.value) {
      return {
        jobs: demoDataEnabled ? demoDashboardJobs : [],
        routes: demoDataEnabled ? demoRecentRoutes : [],
        trackingItems: demoDataEnabled ? demoTrackingItems : [],
        stats: statsResult.value || null,
        user: userName ? { name: userName, companyName: userName } : null,
      };
    }

    const jobs = jobsResult.value.items.map(mapCourierJobToDashboardJob);

    return {
      jobs,
      routes: mapRecentRoutes(jobs),
      trackingItems: mapTrackingItems(jobs),
      stats: statsResult.isSuccess ? statsResult.value || null : null,
      user: userName ? { name: userName, companyName: userName } : null,
    };
  } catch {
    return {
      jobs: demoDataEnabled ? demoDashboardJobs : [],
      routes: demoDataEnabled ? demoRecentRoutes : [],
      trackingItems: demoDataEnabled ? demoTrackingItems : [],
      stats: null as BackendJobStats | null,
      user: userName ? { name: userName, companyName: userName } : null,
    };
  }
}

export default async function CourierDashboardPage() {
  const { jobs, routes, trackingItems, stats, user } = await loadCourierDashboard();

  return (
    <CourierDashboard
      jobs={jobs}
      routes={routes}
      stats={stats}
      trackingItems={trackingItems}
      user={user}
    />
  );
}
