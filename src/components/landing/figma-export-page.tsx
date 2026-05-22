/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

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
  mobile: FigmaImage;
  mobileHotspots?: Hotspot[];
};

export function FigmaExportPage({
  anchors = [],
  desktop,
  desktopHotspots = [],
  mobile,
  mobileHotspots = [],
}: FigmaExportPageProps) {
  return (
    <main className="bg-white">
      <FigmaFrame
        anchors={anchors}
        className="hidden sm:block"
        image={desktop}
        hotspots={desktopHotspots}
      />
      <FigmaFrame
        anchors={anchors}
        className="block sm:hidden"
        image={mobile}
        hotspots={mobileHotspots}
      />
    </main>
  );
}

function FigmaFrame({
  anchors,
  className,
  hotspots,
  image,
}: {
  anchors: Anchor[];
  className: string;
  hotspots: Hotspot[];
  image: FigmaImage;
}) {
  return (
    <div className={className}>
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
            className="absolute block rounded-sm focus:outline-none focus:ring-2 focus:ring-[#BFF000]"
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
      </div>
    </div>
  );
}
