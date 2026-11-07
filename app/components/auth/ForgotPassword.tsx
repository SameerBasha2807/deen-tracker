"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email.trim());

      setSuccess(
        "Password reset email sent. Please check your inbox."
      );
    } catch (error: unknown) {
      console.error("Password reset error:", error);

      if (
        error &&
        typeof error === "object" &&
        "code" in error
      ) {
        const code = (error as { code: string }).code;

        switch (code) {
          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;

          case "auth/user-not-found":
            setError(
              "No account was found with this email address."
            );
            break;

          default:
            setError(
              "Unable to send the reset email. Please try again."
            );
        }
      } else {
        setError(
          "Unable to send the reset email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="reset-email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Back to Sign In
        </Link>
      </p>
    </form>
  );
}