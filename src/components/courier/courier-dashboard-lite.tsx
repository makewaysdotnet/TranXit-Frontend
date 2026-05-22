/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type Hotspot = {
  "aria-label": string;
  height: number;
  href: string;
  width: number;
  x: number;
  y: number;
};

const dashboardImage = {
  alt: "TranXIT courier dashboard lite screen from Figma",
  height: 900,
  src: "/courier/figma/dashboard-lite-desktop.png",
  width: 1440,
};

const hotspots: Hotspot[] = [
  link("Dashboard", "/courier/dashboard", 249, 17, 104, 32),
  link("Jobs", "/courier/jobs", 365, 17, 82, 32),
  link("Settings", "/courier/settings", 742, 17, 105, 32),
  link("Profile", "/courier/settings", 1368, 15, 47, 39),
  link("Complete profile", "/courier/settings", 1288, 80, 123, 45),
  link("See all job requests", "/courier/jobs", 998, 429, 40, 24),
  link("Open job request", "/courier/jobs/1001", 878, 469, 99, 37),
  link("Create bid", "/courier/jobs/1001/bid", 878, 788, 99, 37),
  link("Upload files", "/courier/jobs/1001", 1105, 775, 85, 26),
  link("Recent jobs", "/courier/jobs", 23, 383, 70, 24),
  link("Team settings", "/courier/settings", 23, 688, 70, 24),
];

export function CourierDashboardLite() {
  return (
    <main className="min-h-screen overflow-x-auto bg-white">
      <div className="relative mx-auto aspect-[1440/900] w-full min-w-[1180px] max-w-[1440px] lg:min-w-0">
        <img
          alt={dashboardImage.alt}
          className="block h-auto w-full select-none"
          draggable={false}
          height={dashboardImage.height}
          src={dashboardImage.src}
          width={dashboardImage.width}
        />
        {hotspots.map((hotspot) => (
          <Link
            aria-label={hotspot["aria-label"]}
            className="absolute block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BFF000]"
            href={hotspot.href}
            key={`${hotspot.href}-${hotspot["aria-label"]}-${hotspot.x}-${hotspot.y}`}
            style={{
              height: `${(hotspot.height / dashboardImage.height) * 100}%`,
              left: `${(hotspot.x / dashboardImage.width) * 100}%`,
              top: `${(hotspot.y / dashboardImage.height) * 100}%`,
              width: `${(hotspot.width / dashboardImage.width) * 100}%`,
            }}
          />
        ))}
      </div>
    </main>
  );
}

function link(
  label: string,
  href: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return {
    "aria-label": label,
    height,
    href,
    width,
    x,
    y,
  };
}
