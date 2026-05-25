"use client";

import { Bell, Building2, CreditCard, UserRound } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sections = [
  {
    label: "Profile",
    icon: UserRound,
    fields: [
      ["Name", "Ayesha Khan"],
      ["Email", "customer@tranxit.local"],
      ["Phone", "+92 300 0000001"],
      ["Default city", "Karachi"],
    ],
  },
  {
    label: "Company",
    icon: Building2,
    fields: [
      ["Company name", "Khan Textiles"],
      ["Tax identifier", "TX-448201"],
      ["Default origin", "Port Qasim"],
      ["Billing email", "finance@khantextiles.example"],
    ],
  },
  {
    label: "Notifications",
    icon: Bell,
    fields: [
      ["Bid alerts", "Email and in-app"],
      ["Shipment updates", "Every status change"],
      ["Weekly reports", "Monday morning"],
      ["Escalation contact", "+92 300 0000001"],
    ],
  },
  {
    label: "Billing",
    icon: CreditCard,
    fields: [
      ["Payment method", "Invoice"],
      ["Currency", "PKR"],
      ["Billing cycle", "Monthly"],
      ["PO required", "Yes"],
    ],
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [saved, setSaved] = useState(false);

  return (
    <AppShell>
      <section className="grid gap-6">
        <div>
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Settings & Preferences
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#171721]">
            Account, notifications, and billing
          </h1>
        </div>
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <Card className="h-fit p-3">
            {sections.map((section) => {
              const ItemIcon = section.icon;
              const isActive = section.label === activeSection.label;
              return (
                <button
                  key={section.label}
                  className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold ${
                    isActive
                      ? "bg-[#171721] text-white"
                      : "text-[#595D62] hover:bg-[#F5F5FA]"
                  }`}
                  onClick={() => {
                    setActiveSection(section);
                    setSaved(false);
                  }}
                >
                  <ItemIcon size={17} />
                  {section.label}
                </button>
              );
            })}
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-bold">{activeSection.label}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {activeSection.fields.map(([label, value]) => (
                <TextField key={label} label={label} defaultValue={value} />
              ))}
            </div>
            {saved ? (
              <p className="mt-5 rounded-lg bg-[#ECFBF6] p-3 text-sm font-medium text-[#0D8F65]">
                Changes saved locally.
              </p>
            ) : null}
            <Button className="mt-6" onClick={() => setSaved(true)}>
              Save changes
            </Button>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

