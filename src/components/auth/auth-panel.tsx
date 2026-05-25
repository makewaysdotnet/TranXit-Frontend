"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { AuthFrame } from "@/components/auth/auth-frame";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

export function AuthPanel({
  mode,
  demoAuthEnabled = false,
}: {
  mode: "login" | "register";
  demoAuthEnabled?: boolean;
}) {
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

    let result;
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      result = await response.json();
    } catch {
      setLoading(false);
      setError("Unable to reach TranXIT auth service.");
      return;
    }

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
    <AuthFrame
      eyebrow="TranXIT Web App"
      title={isRegister ? "Tell us about yourself" : "Sign in to your account"}
      description={
        isRegister
          ? "Choose your portal type and finish onboarding."
          : "Enter your details to access your TranXIT workspace."
      }
    >
        <form
          onSubmit={submit}
          className="mt-8"
        >
          <div className="grid gap-4">
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

          {demoAuthEnabled ? (
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
          ) : null}

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
    </AuthFrame>
  );
}

