import { FigmaExportPage } from "@/components/landing/figma-export-page";

const desktopHotspots = [
  { "aria-label": "Home", href: "/", x: 214, y: 24, width: 70, height: 48 },
  { "aria-label": "Explore Features", href: "/#features", x: 300, y: 24, width: 166, height: 48 },
  { "aria-label": "Understand TranXIT", href: "/#platform", x: 474, y: 24, width: 210, height: 48 },
  { "aria-label": "About", href: "/about", x: 690, y: 24, width: 86, height: 48 },
  { "aria-label": "Pricing", href: "/#pricing", x: 790, y: 24, width: 88, height: 48 },
  { "aria-label": "Contact", href: "/contact", x: 888, y: 24, width: 100, height: 48 },
  { "aria-label": "FAQs", href: "/#faqs", x: 1540, y: 24, width: 74, height: 48 },
  { "aria-label": "Help Center", href: "/contact", x: 1620, y: 24, width: 126, height: 48 },
  { "aria-label": "Log in", href: "/login", x: 1768, y: 24, width: 112, height: 48 },
  { "aria-label": "Request a delivery", href: "/jobs/new", x: 289, y: 666, width: 309, height: 66 },
  { "aria-label": "Own a company", href: "/courier/dashboard", x: 610, y: 666, width: 305, height: 66 },
];

const mobileHotspots = [
  { "aria-label": "Request a delivery", href: "/jobs/new", x: 24, y: 684, width: 327, height: 62 },
  { "aria-label": "Own a company", href: "/courier/dashboard", x: 24, y: 756, width: 327, height: 62 },
];

const tabletHotspots = [
  { "aria-label": "Log in", href: "/login", x: 690, y: 8, width: 58, height: 26 },
  { "aria-label": "Request a delivery", href: "/jobs/new", x: 111, y: 333, width: 184, height: 41 },
  { "aria-label": "Own a company", href: "/courier/dashboard", x: 111, y: 391, width: 184, height: 41 },
];

const mobileDropdownHotspots = [
  { "aria-label": "Home", href: "/", x: 24, y: 77, width: 96, height: 48 },
  { "aria-label": "About", href: "/about", x: 24, y: 125, width: 96, height: 48 },
  { "aria-label": "Pricing", href: "/#pricing", x: 24, y: 173, width: 96, height: 48 },
  { "aria-label": "Contact", href: "/contact", x: 24, y: 221, width: 110, height: 48 },
  { "aria-label": "Request a delivery", href: "/jobs/new", x: 32, y: 649, width: 311, height: 45 },
  { "aria-label": "Own a company", href: "/courier/dashboard", x: 32, y: 706, width: 311, height: 45 },
];

const anchors = [
  { id: "features", y: 1080 },
  { id: "platform", y: 4320 },
  { id: "pricing", y: 5400 },
  { id: "faqs", y: 6980 },
  { id: "partners", y: 7600 },
];

export default function Home() {
  return (
    <FigmaExportPage
      anchors={anchors}
      desktop={{
        alt: "TranXIT Homepage Figma export",
        height: 11241,
        src: "/landing/figma/homepage-desktop.png",
        width: 1920,
      }}
      desktopHotspots={desktopHotspots}
      mobile={{
        alt: "TranXIT Homepage mobile Figma export",
        height: 10364,
        src: "/landing/figma/homepage-mobile.png",
        width: 375,
      }}
      mobileDropdown={{
        alt: "TranXIT Homepage mobile dropdown Figma export",
        height: 812,
        src: "/landing/figma/homepage-mobile-dropdown.png",
        width: 375,
      }}
      mobileDropdownHotspots={mobileDropdownHotspots}
      mobileHotspots={mobileHotspots}
      mobileMenuButton={{ x: 309, y: 16, width: 42, height: 42 }}
      tablet={{
        alt: "TranXIT Homepage tablet Figma export",
        height: 9126,
        src: "/landing/figma/homepage-tablet.png",
        width: 768,
      }}
      tabletHotspots={tabletHotspots}
    />
  );
}
