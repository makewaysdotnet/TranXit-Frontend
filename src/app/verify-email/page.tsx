import Link from "next/link";
import { MailCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FBFBFF] p-6">
      <Card className="max-w-[480px] p-8 text-center">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#BFF000]">
          <MailCheck size={26} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-[#171721]">Verify your email</h1>
        <p className="mt-3 leading-7 text-[#595D62]">
          The backend is configured to skip real email sending in local development.
          Continue into the dashboard to test the customer shipment flow.
        </p>
        <Link href="/dashboard" className="mt-6 block">
          <Button className="w-full">Continue to dashboard</Button>
        </Link>
      </Card>
    </main>
  );
}
