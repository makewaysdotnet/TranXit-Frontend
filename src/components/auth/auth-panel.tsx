"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { TextField } from "@/components/ui/input";

export function AuthPanel({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister
      ? {
          username: String(form.get("username")),
          email: String(form.get("email")),
          phone: String(form.get("phone")),
          roleId: Number(form.get("roleId")),
          password: String(form.get("password")),
          confirmPassword: String(form.get("confirmPassword")),
        }
      : {
          email: String(form.get("email")),
          password: String(form.get("password")),
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result.isSuccess) {
      setError((result.error || result.errors || ["Unable to continue"]).join(", "));
      return;
    }

    if (isRegister) {
      router.push("/verify-email");
      return;
    }

    const role = result.value?.role;
    router.push(role === "Courier" ? "/courier/dashboard" : "/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-[#FBFBFF] lg:grid-cols-[minmax(460px,676px)_1fr]">
      <section className="relative hidden overflow-hidden bg-[#171721] p-7 text-white lg:block">
        <div className="absolute inset-x-0 top-0 h-24 bg-[#BFF000]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#111110]" />
        <div className="relative flex h-full flex-col justify-between rounded-lg border border-white/10 p-8">
          <BrandLogo invert />
          <div>
            <p className="text-xs font-bold uppercase text-[#BFF000]">
              TranXIT Web App
            </p>
            <h1 className="mt-4 max-w-[520px] font-display text-4xl leading-none xl:text-5xl">
              Logistics work in a single window_
            </h1>
            <p className="mt-5 max-w-[440px] text-base leading-7 text-white/70">
              Create shipment requests, compare bids, and move freight with the same
              operational clarity shown in the Figma dashboard flows.
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
        <form
          onSubmit={submit}
          className="w-full max-w-[420px] rounded-lg border border-[#E4E6E8] bg-white p-6 shadow-[0_32px_80px_-56px_rgba(0,0,0,0.45)] md:p-8"
        >
          <div className="mb-8 flex justify-center">
            <BrandLogo />
          </div>
          <h2 className="text-center text-3xl font-bold text-[#171721]">
            {isRegister ? "Tell us about yourself" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-[#8083A3]">
            {isRegister
              ? "Choose your portal type and finish onboarding."
              : "Enter your details to access your TranXIT workspace."}
          </p>

          <div className="mt-8 grid gap-4">
            {isRegister ? (
              <>
                <TextField
                  label="Full name"
                  name="username"
                  placeholder="Ayesha Khan"
                  required
                />
                <TextField label="Phone" name="phone" placeholder="+92 300 0000000" required />
                <label className="grid gap-2 text-sm font-medium text-[#292C43]">
                  <span>Portal</span>
                  <select
                    name="roleId"
                    className="h-12 rounded-lg border border-[#E4E6E8] bg-white px-4 text-sm outline-none focus:border-[#BFF000] focus:ring-2 focus:ring-[#BFF000]/30"
                    defaultValue="1"
                  >
                    <option value="1">Customer</option>
                    <option value="2">Courier company</option>
                  </select>
                </label>
              </>
            ) : null}
            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="customer@tranxit.local"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              placeholder="Password1!"
              required
            />
            {isRegister ? (
              <TextField
                label="Confirm password"
                name="confirmPassword"
                type="password"
                placeholder="Password1!"
                required
              />
            ) : null}
          </div>

          {error ? (
            <p className="mt-4 rounded-lg bg-[#FFF0EF] p-3 text-sm font-medium text-[#EB5E55]">
              {error}
            </p>
          ) : null}

          <Button
            className="mt-6 w-full"
            type="submit"
            disabled={loading}
            icon={<ArrowRight size={16} />}
          >
            {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </Button>

          <div className="mt-6 grid gap-3 text-sm text-[#8083A3]">
            <div className="flex items-center justify-center gap-2">
              <Mail size={16} />
              <span>Demo customer: customer@tranxit.local</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <LockKeyhole size={16} />
              <span>Password: Password1!</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <UserRound size={16} />
              <span>Demo courier: courier@tranxit.local</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[#595D62]">
            {isRegister ? "Already have an account?" : "Do not have an account?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-bold text-[#171721] underline decoration-[#BFF000] underline-offset-4"
            >
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

