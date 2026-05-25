"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck } from "lucide-react";
import { AuthFrame } from "@/components/auth/auth-frame";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

function readErrors(result: { error?: string[]; errors?: string[] }, fallback: string) {
  return (result.error || result.errors || [fallback]).join(", ");
}

export function ForgotPasswordPanel() {
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
      response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(form.get("email")) }),
      });
      result = await response.json();
    } catch {
      setLoading(false);
      setError("Unable to send a verification code right now.");
      return;
    }

    setLoading(false);

    if (!response.ok || !result.isSuccess) {
      setError(readErrors(result, "Unable to send verification code"));
      return;
    }

    router.push("/forgot-password/sent");
  }

  return (
    <AuthFrame
      eyebrow="Password recovery"
      title="Reset your password"
      description="Enter your email and we will send a verification code."
    >
      <form onSubmit={submit} className="mt-8 grid gap-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="name@company.com"
          required
        />
        {error ? (
          <p className="rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} icon={<ArrowRight size={16} />}>
          {loading ? "Sending..." : "Send verification code"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#595D62]">
        Remembered it?{" "}
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

export function ResetCodeSentPanel({ email = "" }: { email?: string }) {
  return (
    <AuthFrame
      eyebrow="Password recovery"
      title="Check your email"
      description={email ? `A verification code was sent to ${email}.` : "A verification code was sent."}
    >
      <div className="mt-8 grid gap-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#BFF000] text-[#111110]">
          <MailCheck size={24} />
        </div>
        <Link href="/reset-password">
          <Button className="w-full" icon={<ArrowRight size={16} />}>
            Continue
          </Button>
        </Link>
      </div>
    </AuthFrame>
  );
}

export function ResetPasswordPanel({ initialEmail = "" }: { initialEmail?: string }) {
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
      response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email")),
          code: String(form.get("code")),
          password: String(form.get("password")),
          confirmPassword: String(form.get("confirmPassword")),
        }),
      });
      result = await response.json();
    } catch {
      setLoading(false);
      setError("Unable to reset password right now.");
      return;
    }

    setLoading(false);

    if (!response.ok || !result.isSuccess) {
      setError(readErrors(result, "Unable to reset password"));
      return;
    }

    router.push("/login?reset=1");
  }

  return (
    <AuthFrame
      eyebrow="Password recovery"
      title="Choose a new password"
      description="Confirm your verification code before changing the password."
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
        <TextField
          label="New password"
          name="password"
          type="password"
          placeholder="Password1!"
          required
        />
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Password1!"
          required
        />
        {error ? (
          <p className="rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} icon={<ArrowRight size={16} />}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthFrame>
  );
}
