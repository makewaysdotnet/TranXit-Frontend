import { Bell, Building2, CreditCard, UserRound } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
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
            {[
              ["Profile", UserRound],
              ["Company", Building2],
              ["Notifications", Bell],
              ["Billing", CreditCard],
            ].map(([label, Icon]) => {
              const ItemIcon = Icon as typeof UserRound;
              return (
                <button
                  key={label as string}
                  className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold text-[#595D62] hover:bg-[#F5F5FA]"
                >
                  <ItemIcon size={17} />
                  {label as string}
                </button>
              );
            })}
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-bold">Profile</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextField label="Name" defaultValue="Ayesha Khan" />
              <TextField label="Email" defaultValue="customer@tranxit.local" />
              <TextField label="Phone" defaultValue="+92 300 0000001" />
              <TextField label="Default city" defaultValue="Karachi" />
            </div>
            <Button className="mt-6">Save changes</Button>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

