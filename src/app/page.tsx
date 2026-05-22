import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CircleDollarSign,
  Clock3,
  FileText,
  Handshake,
  PackageCheck,
  Radar,
  Route,
  Smartphone,
  Sparkles,
  Truck,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cx } from "@/lib/utils";

const benefits = [
  {
    title: "Powerful Bid System",
    text: "Courier companies compete for every job request, giving customers stronger pricing and cleaner decisions.",
    icon: Sparkles,
  },
  {
    title: "Cost Efficiency",
    text: "Automated quoting and structured requests reduce manual coordination and logistics cost.",
    icon: CircleDollarSign,
  },
  {
    title: "Enhanced Customer Experience",
    text: "Real-time status, documents, bids, and delivery activity stay organized in one window.",
    icon: BadgeCheck,
  },
];

const productCards = [
  {
    title: "Silent courier bidding",
    text: "Courier companies submit offers against job requests, while customers compare price, time, and reliability before accepting.",
    href: "/jobs/new",
    action: "I want to deliver a parcel",
    image: "/landing/bid-drawer.png",
    imageAlt: "TranXIT bid drawer",
    icon: Handshake,
  },
  {
    title: "Courier sales overview",
    text: "Keep a record of earnings, accepted jobs, customers, submitted bids, and operations performance.",
    href: "/courier/dashboard",
    action: "Learn more",
    image: null,
    imageAlt: "",
    icon: BarChart3,
  },
  {
    title: "Mobile-ready workflows",
    text: "The mobile app gives customers convenient access to verification, shipment tracking, and delivery updates on the go.",
    href: "/register",
    action: "Get to know TranXIT mobile",
    image: "/landing/mobile-app.png",
    imageAlt: "TranXIT mobile app",
    icon: Smartphone,
  },
];

const faqs = [
  {
    question: "What is TranXIT?",
    answer:
      "TranXIT is a digital platform that facilitates connections between businesses and customers, streamlining logistics and freight forwarding processes through a powerful bidding and tracking system.",
  },
  {
    question: "How does TranXIT streamline logistics processes?",
    answer:
      "It centralizes job requests, bid offers, documents, courier communication, and delivery status so teams can move shipments without scattered spreadsheets or message threads.",
  },
  {
    question: "Is TranXIT a freight forwarding service?",
    answer:
      "TranXIT is the operating platform. It connects customers with courier and logistics companies rather than acting as the freight forwarder itself.",
  },
  {
    question: "How does TranXIT connect businesses with customers?",
    answer:
      "Customers create structured shipment requests, courier companies respond with bids, and both sides use the same job record as the shared source of truth.",
  },
  {
    question: "What features does TranXIT offer for optimizing freight forwarding?",
    answer:
      "TranXIT gives teams structured job creation, courier bid comparison, delivery status timelines, document records, route visibility, and role-specific dashboards.",
  },
  {
    question: "What are the benefits for businesses?",
    answer:
      "Better quote comparison, faster coordination, clear job history, lower manual overhead, and a more reliable customer delivery experience.",
  },
];

const partnerLogos = [
  { name: "DHL Logistics & Courier", src: "/landing/logo-dhl.svg" },
  { name: "FedEx Express", src: "/landing/logo-fedex.svg" },
  { name: "Leopard Courier", src: "/landing/logo-leopard.png" },
  { name: "TCS Pakistan", src: "/landing/logo-tcs.png" },
  { name: "Trax", src: "/landing/logo-trax.png" },
];

function LandingLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex h-12 items-center justify-center gap-3 rounded-lg px-5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#BFF000]/60",
        variant === "primary" && "bg-[#BFF000] text-[#111110] hover:bg-[#d6ff28]",
        variant === "secondary" &&
          "border border-[#D7D9D6] bg-white text-[#111110] hover:border-[#BFF000]",
        variant === "dark" && "bg-[#111110] text-white hover:bg-[#242423]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function SectionLabel({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={cx("text-xs font-bold uppercase", dark ? "text-white/50" : "text-[#111110]/50")}>
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <main className="bg-white text-[#111110]">
      <header className="sticky top-0 z-40 border-b border-[#E7E8E4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 xl:px-[120px]">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#60606B] lg:flex">
            <a href="#features" className="hover:text-[#111110]">
              Explore features
            </a>
            <a href="#platform" className="hover:text-[#111110]">
              Understanding TranXIT
            </a>
            <a href="#partners" className="hover:text-[#111110]">
              Our partners
            </a>
            <a href="#contact" className="hover:text-[#111110]">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-bold text-[#111110] sm:inline">
              Log in
            </Link>
            <LandingLink href="/register">
              <ArrowRight size={17} />
              Register
            </LandingLink>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#EFF0F1]">
        <div className="mx-auto grid min-h-[820px] max-w-[1920px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_45%]">
          <div className="relative z-10 flex min-w-0 flex-col justify-center px-5 py-16 md:px-10 lg:px-16 min-[1800px]:px-[120px]">
            <h1
              className="max-w-[760px] text-[42px] leading-[1.02] text-[#111110] sm:text-5xl md:text-6xl xl:text-7xl"
              aria-label="All in one solution for your freight forwarding niche"
            >
              <span className="font-light">All in one solution for your </span>
              <span className="block max-w-full font-display text-[26px] leading-none text-[#383837] sm:text-5xl md:text-[56px] xl:text-[52px] 2xl:text-[60px]">
                freight
              </span>
              <span className="block max-w-full font-display text-[26px] leading-none text-[#383837] sm:text-5xl md:text-[56px] xl:text-[52px] 2xl:text-[60px]">
                forwarding
              </span>
              <span className="font-light"> niche_</span>
            </h1>
            <p className="mt-8 max-w-[760px] text-base leading-7 text-[#111110]/55">
              Your ultimate logistics and freight management solution. Streamline
              operations, optimize routes, and track shipments in real-time with our
              comprehensive platform. Sign up now for seamless logistics management,
              absolutely free.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <LandingLink href="/jobs/new" className="h-14 px-8">
                <PackageCheck size={20} />
                Request a delivery
              </LandingLink>
              <LandingLink href="/courier/dashboard" variant="secondary" className="h-14 px-8">
                <UsersRound size={20} />
                Own a company?
              </LandingLink>
            </div>
            <p className="mt-3 text-sm text-[#111110]/50">
              No charges apply. Signing up is completely free.
            </p>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[#BFF000] xl:min-h-[820px]">
            <Image
              src="/landing/hero-truck-composite.png"
              alt="Freight truck"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-left-bottom"
            />
          </div>
        </div>

        <div className="relative z-20 mx-auto max-w-[1320px] translate-y-0 px-5 pb-10 xl:-mt-24">
          <div className="grid gap-5 bg-white p-5 shadow-[0_28px_80px_-56px_rgba(17,17,16,0.65)] md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="flex gap-4 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#242423] text-white">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">{benefit.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#111110]/55">{benefit.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10" id="features">
        <div className="mx-auto max-w-[1304px]">
          <p className="mx-auto max-w-[1100px] text-center text-3xl font-bold leading-tight text-[#111110] md:text-5xl">
            TranXIT is a comprehensive digital platform addressing global logistics
            and freight forwarding needs, designed to reduce the daily hassle inside
            shipping operations.
          </p>
        </div>
      </section>

      <section className="bg-[#F9F9F9] px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1304px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center">
            <SectionLabel>Introduction</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              One workspace for shipment requests, bids, and delivery decisions.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#111110]/60">
              Customers create requests, courier companies compete with bid offers,
              and teams keep every action tied to a single shipment record.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Customer portal", icon: PackageCheck, metric: "38 bids today" },
              { title: "Courier operations", icon: Building2, metric: "26 open requests" },
              { title: "Delivery visibility", icon: Radar, metric: "7 in transit" },
              { title: "Document control", icon: FileText, metric: "100% job history" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-[#E7E8E4] bg-white p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#BFF000]">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-7 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#111110]/55">{item.metric}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#111110] text-white" id="platform">
        <div className="mx-auto grid min-h-[860px] max-w-[1920px] xl:grid-cols-[minmax(0,1fr)_617px]">
          <div className="flex min-w-0 flex-col justify-center px-5 py-20 md:px-10 lg:px-16 min-[1800px]:px-[120px]">
            <h2 className="max-w-[880px] text-4xl font-bold leading-tight text-white/55 md:text-6xl">
              TranXIT makes sending <span className="text-[#BFF000]">courier</span>{" "}
              easier with <span className="text-white">powerful bidding system</span>{" "}
              and <span className="text-white">seamless tracking</span>{" "}
              <span className="text-[#BFF000]">_</span>
            </h2>
            <div className="mt-16 grid max-w-[900px] gap-8 md:grid-cols-2">
              <div className="flex gap-5">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#111110]">
                  <Handshake size={20} />
                </div>
                <p className="text-base leading-7 text-white/80">
                  TranXIT&apos;s innovative bidding system ensures fair competition
                  and optimal pricing for all shipments.
                </p>
              </div>
              <div className="flex gap-5">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#111110]">
                  <Route size={20} />
                </div>
                <p className="text-base leading-7 text-white/80">
                  Web-based tracking helps customers and courier partners follow
                  packages worldwide from a shared record.
                </p>
              </div>
            </div>
            <p className="mt-28 max-w-[380px] text-base leading-7 text-white/80">
              Trust TranXIT for reliable logistics solutions backed by
              industry-leading technology and a commitment to exceptional service.
            </p>
          </div>

          <div className="relative min-h-[540px]">
            <Image
              src="/landing/courier-van-composite.png"
              alt="Courier vehicle"
              fill
              sizes="(min-width: 1024px) 617px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="mx-auto max-w-[1304px] bg-[#BFF000] p-8 text-[#111110] md:p-12 lg:-mt-24 lg:ml-[calc(50%-50px)] lg:max-w-[1135px]">
          <p className="max-w-[980px] text-3xl leading-tight md:text-5xl">
            <strong>Join TranXIT&apos;s</strong> courier network today and unlock a
            world of streamlined operations and enhanced efficiency through a single
            window.
          </p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-3 text-sm font-bold uppercase">
            Join TranXIT
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1304px] gap-10 lg:grid-cols-[390px_1fr]">
          <p className="text-lg leading-8">
            TranXIT facilitates connections between companies and their customers,
            rather than serving as a freight forwarder.
          </p>
          <p className="text-lg leading-8">
            TranXIT serves as a dynamic portal, connecting businesses and customers
            in logistics and freight forwarding. Users gain a seamless experience
            from job requests and bidding to real-time tracking and communication.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-[1304px] gap-6 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-lg bg-[#EFF0F1] p-6 lg:col-span-2 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative z-10 max-w-[520px]">
              <ProductCardContent card={productCards[0]} />
            </div>
            <div className="mt-8 h-[280px] overflow-hidden rounded-lg bg-[#242423] lg:mt-0">
              <Image
                src={productCards[0].image || ""}
                alt={productCards[0].imageAlt}
                width={900}
                height={520}
                className="h-full w-full object-cover object-left-top"
              />
            </div>
          </article>
          {productCards.slice(1).map((card) => (
            <article key={card.title} className="overflow-hidden rounded-lg bg-[#EFF0F1] p-6">
              <ProductCardContent card={card} />
              <div className="mt-10 h-[300px] overflow-hidden rounded-lg bg-white">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    width={640}
                    height={420}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-between p-8">
                    <div>
                      <p className="text-2xl font-bold">PKR 36,581.70</p>
                      <p className="mt-1 text-sm font-bold text-[#5FDCB3]">+1.53%</p>
                    </div>
                    <div className="grid h-28 grid-cols-8 items-end gap-3">
                      {[32, 26, 38, 34, 58, 74, 62, 88].map((height, index) => (
                        <span
                          key={index}
                          className="rounded-t bg-[#5FDCB3]"
                          style={{ height }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm text-[#111110]/55">
                      <span>Submitted bids</span>
                      <span>Won jobs</span>
                      <span>Sales view</span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1440px] items-center lg:grid-cols-[1fr_1fr]">
          <div className="relative h-[420px] overflow-hidden bg-[#E7E8E4] md:h-[620px]">
            <Image
              src="/landing/faq-laptop.jpg"
              alt="TranXIT web app on laptop"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="bg-[#F9F9F9] p-6 md:p-12 lg:p-24">
            <div className="mb-7 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111110] text-white">
                <Clock3 size={20} />
              </span>
              <span className="text-base text-[#111110]/70">Watch & learn</span>
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
            <div className="mt-8 grid gap-3">
              {faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="group border-b border-[#E7E8E4] py-3"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-sm font-bold">
                    <span>{faq.question}</span>
                    <ArrowRight
                      size={16}
                      className="rotate-90 transition group-open:-rotate-90"
                    />
                  </summary>
                  <p className="mt-5 text-base leading-7 text-[#111110]/70">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="partners" className="px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1304px] gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionLabel>Our users base</SectionLabel>
            <h2 className="mt-4 max-w-[540px] text-3xl font-bold leading-tight md:text-4xl">
              Industry-leading partners in courier & logistics solutions.
            </h2>
          </div>
          <div>
            <p className="max-w-[640px] text-lg leading-8">
              Discover the industry-leading courier and logistics companies
              partnering with TranXIT for seamless shipping solutions.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {partnerLogos.map((partner) => (
                <div key={partner.name} className="min-h-[88px]">
                  <div className="relative h-12 w-36">
                    <Image
                      src={partner.src}
                      alt={partner.name}
                      fill
                      sizes="144px"
                      className="object-contain object-left"
                    />
                  </div>
                  <p className="mt-3 text-sm">{partner.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111110] px-5 py-24 text-white md:px-10">
        <div className="mx-auto max-w-[1304px]">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionLabel dark>Get started with TranXIT today</SectionLabel>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
                Hop in!
                <br />
                Get set shipping.
              </h2>
            </div>
            <div className="flex items-start lg:justify-end lg:pt-8">
              <LandingLink href="/register" className="h-14 px-10">
                <ArrowRight size={18} />
                Register account
              </LandingLink>
            </div>
          </div>
          <div className="my-8 h-px bg-white/10" />
          <p className="max-w-[860px] text-base leading-7 text-white/70">
            Join TranXIT today and experience streamlined logistics management,
            optimized freight forwarding, and seamless courier services. Simplify
            your shipping processes with TranXIT, your ultimate logistics partner.
          </p>
        </div>
      </section>

      <footer id="contact" className="bg-[#242423] px-5 py-16 text-white md:px-10">
        <div className="mx-auto grid max-w-[1304px] gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo invert />
            <p className="mt-7 font-bold">Fb. / Ig. / Li.</p>
          </div>
          <div>
            <h3 className="font-bold">Useful Links</h3>
            <ul className="mt-5 grid gap-3 text-sm text-white/50">
              <li>About</li>
              <li>Explore Features</li>
              <li>Understanding TranXIT</li>
              <li>Our Partners</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Support</h3>
            <p className="mt-5 max-w-[260px] text-sm leading-6 text-white/50">
              Let us know what you are facing at{" "}
              <a href="mailto:support@tranxit.io" className="text-[#BFF000] underline">
                support@tranxit.io
              </a>
            </p>
            <h3 className="mt-8 font-bold">Career</h3>
            <p className="mt-5 max-w-[260px] text-sm leading-6 text-white/50">
              Looking for a job opportunity? See open positions.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Sign up for the newsletter</h3>
            <form className="mt-5 flex rounded-md bg-[#383837] p-1">
              <input
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
                placeholder="you@domain.com"
                type="email"
              />
              <button className="rounded-md px-4 text-sm font-bold text-white" type="submit">
                Sign Up
              </button>
            </form>
            <label className="mt-5 flex gap-3 text-sm leading-6 text-white/50">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#BFF000]" />
              I&apos;m okay with getting emails and having that activity tracked to
              improve my experience.
            </label>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-[1304px] flex-col gap-5 border-t border-white/10 pt-8 text-xs uppercase text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 TranXIT. All rights reserved, product of{" "}
            <span className="text-[#BFF000]">Makeways</span>
          </p>
          <div className="flex flex-wrap gap-6">
            <span>Sitemap</span>
            <span>Security</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProductCardContent({
  card,
}: {
  card: {
    title: string;
    text: string;
    href: string;
    action: string;
    icon: typeof Truck;
  };
}) {
  const Icon = card.icon;

  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111110] text-white">
        <Icon size={20} />
      </div>
      <h3 className="mt-6 text-2xl font-bold">{card.title}</h3>
      <p className="mt-4 max-w-[430px] text-base leading-7 text-[#111110]/70">{card.text}</p>
      <Link href={card.href} className="mt-8 inline-flex items-center gap-3 text-sm font-bold">
        {card.action}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
