import { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";

type AuthFrameProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthFrame({ children, eyebrow, title, description }: AuthFrameProps) {
  return (
    <main className="grid min-h-screen bg-[#FBFBFF] lg:grid-cols-[minmax(460px,676px)_1fr]">
      <section className="relative hidden overflow-hidden bg-[#171721] p-7 text-white lg:block">
        <div className="absolute inset-x-0 top-0 h-24 bg-[#BFF000]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#111110]" />
        <div className="relative flex h-full flex-col justify-between rounded-lg border border-white/10 p-8">
          <BrandLogo invert />
          <div>
            <p className="text-xs font-bold uppercase text-[#BFF000]">{eyebrow}</p>
            <h1 className="mt-4 max-w-[520px] font-display text-4xl leading-none xl:text-5xl">
              Logistics work in a single window_
            </h1>
            <p className="mt-5 max-w-[440px] text-base leading-7 text-white/70">
              Create shipment requests, compare bids, and move freight with operational clarity.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["Bids", "Tracking", "Documents"].map((item) => (
              <div key={item} className="rounded-lg bg-white/10 p-4">
                <p className="text-xs uppercase text-white/45">{item}</p>
                <p className="mt-2 text-lg font-bold">Ready</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-[#E4E6E8] bg-white p-6 shadow-[0_32px_80px_-56px_rgba(0,0,0,0.45)] md:p-8">
          <div className="mb-8 flex justify-center">
            <BrandLogo />
          </div>
          <h2 className="text-center text-3xl font-bold text-[#171721]">{title}</h2>
          <p className="mt-2 text-center text-sm text-[#8083A3]">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
