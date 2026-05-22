"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";

type FigmaImage = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

type Hotspot = {
  "aria-label": string;
  href: string;
  height: number;
  width: number;
  x: number;
  y: number;
};

type Anchor = {
  id: string;
  y: number;
};

type FigmaExportPageProps = {
  anchors?: Anchor[];
  desktop: FigmaImage;
  desktopHotspots?: Hotspot[];
  laptop?: FigmaImage;
  laptopHotspots?: Hotspot[];
  mobile: FigmaImage;
  mobileDropdown?: FigmaImage;
  mobileDropdownHotspots?: Hotspot[];
  mobileHotspots?: Hotspot[];
  mobileMenuButton?: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  tablet?: FigmaImage;
  tabletHotspots?: Hotspot[];
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
  tablet,
  tabletHotspots = [],
}: FigmaExportPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeMobileImage = isMobileMenuOpen && mobileDropdown ? mobileDropdown : mobile;
  const activeMobileHotspots =
    isMobileMenuOpen && mobileDropdown ? mobileDropdownHotspots : mobileHotspots;
  const tabletImage = tablet ?? laptop ?? desktop;
  const tabletImageHotspots =
    tablet && tabletHotspots.length > 0
      ? tabletHotspots
      : laptop && laptopHotspots.length > 0
        ? laptopHotspots
        : desktopHotspots;

  return (
    <main className="bg-white">
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
      <div className="block sm:hidden">
        <FigmaFrame
          anchors={anchors}
          image={activeMobileImage}
          hotspots={activeMobileHotspots}
          menuButton={mobileMenuButton}
          onMenuButtonClick={
            mobileDropdown ? () => setIsMobileMenuOpen((value) => !value) : undefined
          }
        />
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
  anchors: Anchor[];
  className?: string;
  hotspots: Hotspot[];
  image: FigmaImage;
  menuButton?: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  onMenuButtonClick?: () => void;
}) {
  return (
    <div className={className ?? ""}>
      <div className="relative mx-auto w-full max-w-[1920px]">
        <img
          alt={image.alt}
          className="block h-auto w-full select-none"
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
