"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";

export type FigmaImage = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type FigmaHotspot = {
  "aria-label": string;
  href: string;
  height: number;
  width: number;
  x: number;
  y: number;
};

export type FigmaAnchor = {
  id: string;
  y: number;
};

export type FigmaExportPageProps = {
  anchors?: FigmaAnchor[];
  desktop: FigmaImage;
  desktopHotspots?: FigmaHotspot[];
  laptop?: FigmaImage;
  laptopHotspots?: FigmaHotspot[];
  mobile: FigmaImage;
  mobileDropdown?: FigmaImage;
  mobileDropdownHotspots?: FigmaHotspot[];
  mobileHotspots?: FigmaHotspot[];
  mobileMenuButton?: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  resetScrollOnMount?: boolean;
  tablet?: FigmaImage;
  tabletHotspots?: FigmaHotspot[];
};

export function FigmaExportPage({
  anchors = [],
  desktop,
  desktopHotspots = [],
  laptop,
  laptopHotspots = [],
  mobile,
  mobileDropdown,
  mobileDropdownHotspots = [],
  mobileHotspots = [],
  mobileMenuButton,
  resetScrollOnMount = false,
  tablet,
  tabletHotspots = [],
}: FigmaExportPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tabletImage = tablet ?? laptop ?? desktop;
  const tabletImageHotspots =
    tablet && tabletHotspots.length > 0
      ? tabletHotspots
      : laptop && laptopHotspots.length > 0
        ? laptopHotspots
        : desktopHotspots;

  useEffect(() => {
    if (!resetScrollOnMount || window.location.hash) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, 0));

    return () => {
      window.cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [resetScrollOnMount]);

  return (
    <main className="min-h-screen bg-white" id="top">
      <FigmaFrame
        anchors={anchors}
        className={laptop ? "hidden 2xl:block" : "hidden lg:block"}
        image={desktop}
        hotspots={desktopHotspots}
      />
      {laptop ? (
        <FigmaFrame
          anchors={anchors}
          className="hidden lg:block 2xl:hidden"
          image={laptop}
          hotspots={laptopHotspots.length > 0 ? laptopHotspots : desktopHotspots}
        />
      ) : null}
      {tabletImage ? (
        <FigmaFrame
          anchors={anchors}
          className="hidden sm:block lg:hidden"
          image={tabletImage}
          hotspots={tabletImageHotspots}
        />
      ) : null}
      <div className="relative block sm:hidden">
        <FigmaFrame
          anchors={anchors}
          image={mobile}
          hotspots={isMobileMenuOpen ? [] : mobileHotspots}
          menuButton={mobileMenuButton}
          onMenuButtonClick={
            mobileDropdown ? () => setIsMobileMenuOpen((value) => !value) : undefined
          }
        />
        {isMobileMenuOpen && mobileDropdown ? (
          <FigmaFrame
            className="absolute inset-x-0 top-0 z-20"
            anchors={[]}
            image={mobileDropdown}
            hotspots={mobileDropdownHotspots}
            menuButton={mobileMenuButton}
            onMenuButtonClick={() => setIsMobileMenuOpen(false)}
          />
        ) : null}
      </div>
    </main>
  );
}

function FigmaFrame({
  anchors,
  className,
  hotspots,
  image,
  menuButton,
  onMenuButtonClick,
}: {
  anchors: FigmaAnchor[];
  className?: string;
  hotspots: FigmaHotspot[];
  image: FigmaImage;
  menuButton?: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  onMenuButtonClick?: () => void;
}) {
  const reservedHeight = `calc(min(100vw, ${image.width}px) * ${image.height / image.width})`;

  return (
    <div className={className ?? ""}>
      <div
        className="relative mx-auto w-full max-w-[1920px]"
        style={{ minHeight: reservedHeight }}
      >
        <img
          alt={image.alt}
          className="pointer-events-none block h-auto w-full select-none"
          draggable={false}
          height={image.height}
          src={image.src}
          width={image.width}
        />
        {anchors.map((anchor) => (
          <span
            aria-hidden="true"
            className="absolute left-0 block h-px w-px"
            id={anchor.id}
            key={anchor.id}
            style={{ top: `${(anchor.y / image.height) * 100}%` }}
          />
        ))}
        {hotspots.map((hotspot) => (
          <Link
            aria-label={hotspot["aria-label"]}
            className="absolute block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BFF000]"
            href={hotspot.href}
            key={`${hotspot.href}-${hotspot["aria-label"]}`}
            style={{
              height: `${(hotspot.height / image.height) * 100}%`,
              left: `${(hotspot.x / image.width) * 100}%`,
              top: `${(hotspot.y / image.height) * 100}%`,
              width: `${(hotspot.width / image.width) * 100}%`,
            }}
          />
        ))}
        {menuButton && onMenuButtonClick ? (
          <button
            aria-label="Toggle mobile menu"
            className="absolute block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BFF000]"
            onClick={onMenuButtonClick}
            style={{
              height: `${(menuButton.height / image.height) * 100}%`,
              left: `${(menuButton.x / image.width) * 100}%`,
              top: `${(menuButton.y / image.height) * 100}%`,
              width: `${(menuButton.width / image.width) * 100}%`,
            }}
            type="button"
          />
        ) : null}
      </div>
    </div>
  );
}
