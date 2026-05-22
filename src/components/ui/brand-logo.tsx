import Image from "next/image";

export function BrandLogo({ invert = false }: { invert?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={invert ? "/brand/tranxit-logo-white.png" : "/brand/tranxit-logo.svg"}
        alt="TranXIT"
        width={74}
        height={40}
        priority
      />
      <span className="sr-only">TranXIT</span>
    </div>
  );
}
