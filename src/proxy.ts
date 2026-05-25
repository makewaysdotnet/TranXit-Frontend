import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_HOME = "/dashboard";
const COURIER_HOME = "/courier/dashboard";

function isCourierRoute(pathname: string) {
  return pathname === "/courier" || pathname.startsWith("/courier/");
}

function isCustomerRoute(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/jobs" ||
    pathname.startsWith("/jobs/")
  );
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("tranxit_session")?.value;
  const role = request.cookies.get("tranxit_role")?.value;
  const protectedRoute = isCourierRoute(pathname) || isCustomerRoute(pathname);

  if (!protectedRoute) {
    return NextResponse.next();
  }

  if (!session || !role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isCourierRoute(pathname) && role !== "Courier") {
    return redirectTo(request, CUSTOMER_HOME);
  }

  if (isCustomerRoute(pathname) && role === "Courier") {
    return redirectTo(request, COURIER_HOME);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/jobs/:path*", "/courier/:path*"],
};
