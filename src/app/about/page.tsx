import { FigmaExportPage } from "@/components/landing/figma-export-page";

const desktopHotspots = [
  { "aria-label": "Home", href: "/", x: 215, y: 24, width: 56, height: 48 },
  { "aria-label": "About", href: "/about", x: 293, y: 24, width: 65, height: 48 },
  { "aria-label": "Contact", href: "/contact", x: 380, y: 24, width: 78, height: 48 },
  { "aria-label": "FAQs", href: "/#faqs", x: 1511, y: 24, width: 56, height: 48 },
  { "aria-label": "Help Center", href: "/contact", x: 1579, y: 24, width: 107, height: 48 },
  { "aria-label": "Support", href: "/contact", x: 1698, y: 24, width: 48, height: 48 },
  { "aria-label": "Log in", href: "/login", x: 1754, y: 24, width: 111, height: 48 },
];

const laptopHotspots = [
  { "aria-label": "Home", href: "/", x: 215, y: 24, width: 56, height: 48 },
  { "aria-label": "About", href: "/about", x: 293, y: 24, width: 65, height: 48 },
  { "aria-label": "Contact", href: "/contact", x: 380, y: 24, width: 78, height: 48 },
  { "aria-label": "FAQs", href: "/#faqs", x: 1031, y: 24, width: 56, height: 48 },
  { "aria-label": "Help Center", href: "/contact", x: 1099, y: 24, width: 107, height: 48 },
  { "aria-label": "Support", href: "/contact", x: 1218, y: 24, width: 48, height: 48 },
  { "aria-label": "Log in", href: "/login", x: 1274, y: 24, width: 111, height: 48 },
];

const mobileHotspots = [
  { "aria-label": "Home", href: "/", x: 24, y: 16, width: 64, height: 43 },
  { "aria-label": "Register account", href: "/register", x: 24, y: 5777, width: 328, height: 45 },
  { "aria-label": "About", href: "/about", x: 24, y: 6340, width: 328, height: 28 },
  { "aria-label": "Explore Features", href: "/#features", x: 24, y: 6380, width: 328, height: 28 },
  { "aria-label": "Understand TranXIT", href: "/#platform", x: 24, y: 6420, width: 328, height: 28 },
  { "aria-label": "Our Partners", href: "/#partners", x: 24, y: 6460, width: 328, height: 28 },
  { "aria-label": "Contact", href: "/contact", x: 24, y: 6500, width: 328, height: 28 },
];

export default function AboutPage() {
  return (
    <FigmaExportPage
      desktop={{
        alt: "TranXIT About Figma export",
        height: 7516,
        src: "/landing/figma/about-desktop.png",
        width: 1920,
      }}
      desktopHotspots={desktopHotspots}
      laptop={{
        alt: "TranXIT About 1440 Figma export",
        height: 7564,
        src: "/landing/figma/about-tablet.png",
        width: 1440,
      }}
      laptopHotspots={laptopHotspots}
      mobile={{
        alt: "TranXIT About mobile Figma export",
        height: 8092,
        src: "/landing/figma/about-mobile.png",
        width: 375,
      }}
      mobileHotspots={mobileHotspots}
    />
  );
}
