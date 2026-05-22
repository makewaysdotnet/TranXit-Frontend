import {
  FigmaExportPage,
  type FigmaExportPageProps,
} from "@/components/landing/figma-export-page";

type OnboardingScreenConfig = Pick<
  FigmaExportPageProps,
  "desktop" | "desktopHotspots" | "mobile" | "mobileHotspots"
>;

export type CourierOnboardingScreenKey =
  | "forgotPassword"
  | "forgotPasswordSent"
  | "login"
  | "registerDetails"
  | "registerStart"
  | "resetPassword"
  | "verifyEmail";

const screens: Record<CourierOnboardingScreenKey, OnboardingScreenConfig> = {
  forgotPassword: {
    desktop: {
      alt: "TranXIT forgot password screen from Figma",
      height: 900,
      src: "/onboarding/figma/forgot-password-desktop.png",
      width: 1440,
    },
    desktopHotspots: [
      link("Send reset password link", "/forgot-password/sent", 150, 330, 441, 48),
      link("Log in", "/login", 318, 856, 46, 28),
    ],
    mobile: {
      alt: "TranXIT forgot password mobile screen from Figma",
      height: 812,
      src: "/onboarding/figma/forgot-password-mobile.png",
      width: 375,
    },
    mobileHotspots: [
      link("Send reset password link", "/forgot-password/sent", 12, 494, 351, 48),
      link("Log in", "/login", 246, 754, 46, 32),
    ],
  },
  forgotPasswordSent: {
    desktop: {
      alt: "TranXIT reset password link sent screen from Figma",
      height: 900,
      src: "/onboarding/figma/forgot-password-sent-desktop.png",
      width: 1440,
    },
    desktopHotspots: [
      link("Open reset password screen", "/reset-password", 398, 223, 644, 254),
    ],
    mobile: {
      alt: "TranXIT reset password link sent mobile screen from Figma",
      height: 812,
      src: "/onboarding/figma/forgot-password-sent-mobile.png",
      width: 375,
    },
    mobileHotspots: [
      link("Open reset password screen", "/reset-password", 18, 238, 339, 238),
    ],
  },
  login: {
    desktop: {
      alt: "TranXIT courier login screen from Figma",
      height: 900,
      src: "/onboarding/figma/login-desktop.png",
      width: 1440,
    },
    desktopHotspots: [
      link("Create an account", "/register", 547, 802, 139, 50),
      link("Forgot password", "/forgot-password", 863, 418, 150, 24),
      link("Sign in", "/courier/dashboard", 863, 469, 420, 48),
    ],
    mobile: {
      alt: "TranXIT courier login mobile screen from Figma",
      height: 812,
      src: "/onboarding/figma/login-mobile.png",
      width: 375,
    },
    mobileHotspots: [
      link("Forgot password", "/forgot-password", 16, 330, 150, 24),
      link("Sign in", "/courier/dashboard", 16, 381, 343, 48),
      link("Create an account", "/register", 16, 694, 343, 68),
    ],
  },
  registerDetails: {
    desktop: {
      alt: "TranXIT courier registration details screen from Figma",
      height: 900,
      src: "/onboarding/figma/register-details-desktop.png",
      width: 1440,
    },
    desktopHotspots: [
      link("Continue to email verification", "/verify-email", 150, 622, 441, 48),
      link("Log in", "/login", 318, 856, 46, 28),
    ],
    mobile: {
      alt: "TranXIT courier registration details mobile screen from Figma",
      height: 1016,
      src: "/onboarding/figma/register-details-mobile.png",
      width: 375,
    },
    mobileHotspots: [
      link("Continue to email verification", "/verify-email", 18, 654, 339, 47),
      link("Log in", "/login", 247, 956, 46, 32),
    ],
  },
  registerStart: {
    desktop: {
      alt: "TranXIT choose account type screen from Figma",
      height: 900,
      src: "/onboarding/figma/register-start-desktop.png",
      width: 1440,
    },
    desktopHotspots: [
      link("Choose customers", "/register/details", 307, 573, 234, 48),
      link("Choose courier service", "/register/details", 899, 573, 234, 48),
      link("Sign up as a customer", "/register/details", 811, 666, 150, 26),
      link("Log in", "/login", 782, 856, 46, 28),
    ],
    mobile: {
      alt: "TranXIT choose account type mobile screen from Figma",
      height: 812,
      src: "/onboarding/figma/register-start-mobile.png",
      width: 375,
    },
    mobileHotspots: [
      link("Choose account type", "/register/details", 28, 513, 219, 48),
      link("Sign up as a customer", "/register/details", 114, 632, 149, 28),
      link("Log in", "/login", 245, 752, 46, 32),
    ],
  },
  resetPassword: {
    desktop: {
      alt: "TranXIT update password screen from Figma",
      height: 900,
      src: "/onboarding/figma/reset-password-desktop.png",
      width: 1440,
    },
    desktopHotspots: [link("Update password", "/login", 150, 378, 441, 48)],
    mobile: {
      alt: "TranXIT update password mobile screen from Figma",
      height: 812,
      src: "/onboarding/figma/reset-password-mobile.png",
      width: 375,
    },
    mobileHotspots: [link("Update password", "/login", 12, 520, 351, 48)],
  },
  verifyEmail: {
    desktop: {
      alt: "TranXIT verify email screen from Figma",
      height: 900,
      src: "/onboarding/figma/verify-email-desktop.png",
      width: 1440,
    },
    desktopHotspots: [
      link("Verify OTP and continue", "/courier/dashboard", 562, 459, 317, 58),
      link("Log in", "/login", 318, 856, 46, 28),
    ],
    mobile: {
      alt: "TranXIT verify email mobile screen from Figma",
      height: 812,
      src: "/onboarding/figma/verify-email-mobile.png",
      width: 375,
    },
    mobileHotspots: [
      link("Verify OTP and continue", "/courier/dashboard", 29, 509, 316, 58),
      link("Log in", "/login", 247, 754, 46, 32),
    ],
  },
};

export function CourierOnboardingScreen({
  screen,
}: {
  screen: CourierOnboardingScreenKey;
}) {
  return <FigmaExportPage {...screens[screen]} />;
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
