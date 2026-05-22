import { FigmaExportPage } from "@/components/landing/figma-export-page";

const desktopHotspots = [
  { "aria-label": "Home", href: "/", x: 215, y: 24, width: 56, height: 48 },
  { "aria-label": "About", href: "/about", x: 293, y: 24, width: 65, height: 48 },
  { "aria-label": "Contact", href: "/contact", x: 380, y: 24, width: 78, height: 48 },
  { "aria-label": "FAQs", href: "/#faqs", x: 1511, y: 24, width: 56, height: 48 },
  { "aria-label": "Help Center", href: "/contact", x: 1579, y: 24, width: 107, height: 48 },
  { "aria-label": "Support", href: "/contact", x: 1698, y: 24, width: 48, height: 48 },
  { "aria-label": "Log in", href: "/login", x: 1754, y: 24, width: 111, height: 48 },
  { "aria-label": "Mail support", href: "mailto:support@tranxit.io", x: 298, y: 785, width: 360, height: 32 },
  { "aria-label": "Phone support", href: "tel:+923064652555", x: 298, y: 885, width: 360, height: 32 },
  { "aria-label": "Register account", href: "/register", x: 1322, y: 2339, width: 290, height: 63 },
  { "aria-label": "Footer About", href: "/about", x: 644, y: 2807, width: 296, height: 28 },
  { "aria-label": "Footer Explore Features", href: "/#features", x: 644, y: 2847, width: 296, height: 28 },
  { "aria-label": "Footer Understand TranXIT", href: "/#platform", x: 644, y: 2887, width: 296, height: 28 },
  { "aria-label": "Footer Our Partners", href: "/#partners", x: 644, y: 2927, width: 296, height: 28 },
  { "aria-label": "Footer Contact", href: "/contact", x: 644, y: 2967, width: 296, height: 28 },
  { "aria-label": "Footer support email", href: "mailto:support@tranxit.io", x: 980, y: 2834, width: 296, height: 28 },
];

const laptopHotspots = [
  { "aria-label": "Home", href: "/", x: 215, y: 24, width: 56, height: 48 },
  { "aria-label": "About", href: "/about", x: 293, y: 24, width: 65, height: 48 },
  { "aria-label": "Contact", href: "/contact", x: 380, y: 24, width: 78, height: 48 },
  { "aria-label": "FAQs", href: "/#faqs", x: 1031, y: 24, width: 56, height: 48 },
  { "aria-label": "Help Center", href: "/contact", x: 1099, y: 24, width: 107, height: 48 },
  { "aria-label": "Support", href: "/contact", x: 1218, y: 24, width: 48, height: 48 },
  { "aria-label": "Log in", href: "/login", x: 1274, y: 24, width: 111, height: 48 },
  { "aria-label": "Mail support", href: "mailto:support@tranxit.io", x: 120, y: 764, width: 360, height: 32 },
  { "aria-label": "Phone support", href: "tel:+923064652555", x: 120, y: 861, width: 360, height: 32 },
  { "aria-label": "Register account", href: "/register", x: 1030, y: 2312, width: 290, height: 63 },
  { "aria-label": "Footer About", href: "/about", x: 430, y: 2780, width: 270, height: 28 },
  { "aria-label": "Footer Explore Features", href: "/#features", x: 430, y: 2820, width: 270, height: 28 },
  { "aria-label": "Footer Understand TranXIT", href: "/#platform", x: 430, y: 2860, width: 270, height: 28 },
  { "aria-label": "Footer Our Partners", href: "/#partners", x: 430, y: 2900, width: 270, height: 28 },
  { "aria-label": "Footer Contact", href: "/contact", x: 430, y: 2940, width: 270, height: 28 },
  { "aria-label": "Footer support email", href: "mailto:support@tranxit.io", x: 740, y: 2807, width: 270, height: 28 },
];

const mobileHotspots = [
  { "aria-label": "Home", href: "/", x: 24, y: 16, width: 64, height: 43 },
  { "aria-label": "Mail support", href: "mailto:support@tranxit.io", x: 24, y: 687, width: 328, height: 32 },
  { "aria-label": "Phone support", href: "tel:+923064652555", x: 24, y: 784, width: 328, height: 32 },
  { "aria-label": "Register account", href: "/register", x: 24, y: 2472, width: 328, height: 45 },
  { "aria-label": "Footer About", href: "/about", x: 24, y: 3036, width: 328, height: 28 },
  { "aria-label": "Footer Explore Features", href: "/#features", x: 24, y: 3076, width: 328, height: 28 },
  { "aria-label": "Footer Understand TranXIT", href: "/#platform", x: 24, y: 3116, width: 328, height: 28 },
  { "aria-label": "Footer Our Partners", href: "/#partners", x: 24, y: 3156, width: 328, height: 28 },
  { "aria-label": "Footer Contact", href: "/contact", x: 24, y: 3196, width: 328, height: 28 },
  { "aria-label": "Footer support email", href: "mailto:support@tranxit.io", x: 24, y: 3341, width: 249, height: 28 },
];

const mobileDropdownHotspots = [
  { "aria-label": "Home", href: "/", x: 24, y: 77, width: 96, height: 48 },
  { "aria-label": "About", href: "/about", x: 24, y: 125, width: 96, height: 48 },
  { "aria-label": "Pricing", href: "/#pricing", x: 24, y: 173, width: 96, height: 48 },
  { "aria-label": "Contact", href: "/contact", x: 24, y: 221, width: 110, height: 48 },
  { "aria-label": "Request a delivery", href: "/jobs/new", x: 32, y: 649, width: 311, height: 45 },
  { "aria-label": "Own a company", href: "/courier/dashboard", x: 32, y: 706, width: 311, height: 45 },
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
      laptop={{
        alt: "TranXIT Contact 1440 Figma export",
        height: 3144,
        src: "/landing/figma/contact-tablet.png",
        width: 1440,
      }}
      laptopHotspots={laptopHotspots}
      mobile={{
        alt: "TranXIT Contact mobile Figma export",
        height: 4101,
        src: "/landing/figma/contact-mobile.png",
        width: 376,
      }}
      mobileDropdown={{
        alt: "TranXIT mobile navigation dropdown Figma export",
        height: 812,
        src: "/landing/figma/homepage-mobile-dropdown.png",
        width: 375,
      }}
      mobileDropdownHotspots={mobileDropdownHotspots}
      mobileHotspots={mobileHotspots}
      mobileMenuButton={{ x: 309, y: 16, width: 42, height: 42 }}
    />
  );
}
