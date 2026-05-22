import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/input";

export default function CourierSettingsPage() {
  return (
    <AppShell role="courier">
      <section className="grid gap-6">
        <div>
          <p className="text-xs font-bold uppercase text-[#8083A3]">
            Settings & Preferences
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#171721]">
            Business settings
          </h1>
        </div>
        <Card className="p-5">
          <h2 className="text-xl font-bold">Company profile</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextField label="Company name" defaultValue="TranXIT Courier Co." />
            <TextField label="Contact email" defaultValue="courier@tranxit.local" />
            <TextField label="Primary lane" defaultValue="Pakistan -> EU" />
            <TextField label="Insurance policy" defaultValue="Cargo loss/damage coverage" />
          </div>
          <Button className="mt-6">Save business settings</Button>
        </Card>
      </section>
    </AppShell>
  );
}

