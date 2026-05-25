"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthFrame } from "@/components/auth/auth-frame";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

export function VerifyEmailPanel({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    let response: Response;
    let result;

    try {
      response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email")),
          code: String(form.get("code")),
        }),
      });
      result = await response.json();
    } catch {
      setLoading(false);
      setError("Unable to verify email right now.");
      return;
    }

    setLoading(false);

    if (!response.ok || !result.isSuccess) {
      setError((result.error || result.errors || ["Invalid verification code"]).join(", "));
      return;
    }

    router.push("/login?verified=1");
  }

  return (
    <AuthFrame
      eyebrow="Email verification"
      title="Verify your email"
      description="Enter the code sent to your email address."
    >
      <form onSubmit={submit} className="mt-8 grid gap-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="name@company.com"
          defaultValue={initialEmail}
          required
        />
        <TextField
          label="Verification code"
          name="code"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder="000000"
          required
        />
        {error ? (
          <p className="rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} icon={<ArrowRight size={16} />}>
          {loading ? "Verifying..." : "Verify email"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#595D62]">
        Already verified?{" "}
        <Link
          href="/login"
          className="font-bold text-[#171721] underline decoration-[#BFF000] underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
