import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  PackageCheck,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Bid marketplace",
    text: "Invite courier companies to compete quietly on cost, service speed, and reliability.",
    icon: <BarChart3 size={20} />,
  },
  {
    title: "Shipment control",
    text: "Create requests, track bids, and monitor progress from a single operating dashboard.",
    icon: <PackageCheck size={20} />,
  },
  {
    title: "Compliance ready",
    text: "Keep shipment details, documents, and quote decisions organized per job.",
    icon: <ShieldCheck size={20} />,
  },
];

export default function Home() {
  return (
    <main className="bg-[#FBFBFF] text-[#171721]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#595D62] md:flex">
          <a href="#features">Features</a>
          <a href="#process">Process</a>
          <a href="#platform">Platform</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-bold text-[#171721] sm:block">
            Log in
          </Link>
          <Link href="/register">
            <Button icon={<ArrowRight size={16} />}>Get started</Button>
          </Link>
        </div>
      </header>

      <section className="overflow-hidden bg-[#EAEAEA]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-6 lg:grid-cols-[1fr_520px] lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase text-[#595D62]">
              Freight forwarding SaaS
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-none text-[#383837] md:text-5xl">
              All in one solution for your freight forwarding niche_
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#111110]/70">
              TranXIT connects customers and courier companies through shipment
              requests, competitive bid offers, real-time status, and structured job
              operations.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/jobs/new">
                <Button icon={<PackageCheck size={18} />}>Request a delivery</Button>
              </Link>
              <Link href="/courier/dashboard">
                <Button variant="secondary" icon={<Building2 size={18} />}>
                  Own a company?
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[430px] rounded-lg bg-[#BFF000] p-5">
            <Card className="relative ml-auto mt-8 max-w-[460px] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-[#8083A3]">
                    Live shipment
                  </p>
                  <h3 className="mt-2 text-xl font-bold">KHI {"->"} HAM</h3>
                </div>
                <Radar />
              </div>
              <div className="mt-6 grid gap-3">
                {["Create job", "Receive bids", "Accept offer", "Track delivery"].map(
                  (step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-lg bg-[#F5F5FA] p-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#171721] text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold">{step}</span>
                      {index < 3 ? <CheckCircle2 className="ml-auto text-[#5FDCB3]" size={18} /> : null}
                    </div>
                  ),
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-3 md:px-6">
        {features.map((feature) => (
          <Card key={feature.title} className="p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#BFF000]">
              {feature.icon}
            </div>
            <h2 className="text-xl font-bold">{feature.title}</h2>
            <p className="mt-3 leading-7 text-[#595D62]">{feature.text}</p>
          </Card>
        ))}
      </section>

      <section id="process" className="bg-[#171721] px-4 py-16 text-white md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase text-[#BFF000]">
              Process
            </p>
            <h2 className="mt-4 text-4xl font-bold">Register, request, bid, deliver.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["Customers request jobs", "Courier companies submit bids", "TranXIT keeps the record"].map(
              (item) => (
                <div key={item} className="rounded-lg border border-white/10 p-5">
                  <p className="text-lg font-bold">{item}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

