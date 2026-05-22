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
];

export default function ContactPage() {
  return (
    <FigmaExportPage
      desktop={{
        alt: "TranXIT Contact Figma export",
        height: 3171,
        src: "/landing/figma/contact-desktop.png",
        width: 1920,
      }}
      desktopHotspots={desktopHotspots}
      mobile={{
        alt: "TranXIT Contact mobile Figma export",
        height: 4101,
        src: "/landing/figma/contact-mobile.png",
        width: 376,
      }}
    />
  );
}
