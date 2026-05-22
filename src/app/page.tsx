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
      mobileHotspots={mobileHotspots}
    />
  );
}
