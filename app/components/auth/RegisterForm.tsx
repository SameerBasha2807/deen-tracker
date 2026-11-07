"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, isUsernameTaken } from "@/services/auth";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<
    boolean | null
  >(null);

  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");

    setUsername(cleaned);
    setUsernameAvailable(null);
    setError("");
  }

  async function checkUsername() {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      setUsernameAvailable(null);
      return;
    }

    if (cleanUsername.length < 3) {
      setUsernameAvailable(false);
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (cleanUsername.length > 20) {
      setUsernameAvailable(false);
      setError("Username must contain at most 20 characters.");
      return;
    }

    try {
      setCheckingUsername(true);
      setError("");

      const taken = await isUsernameTaken(cleanUsername);

      if (taken) {
        setUsernameAvailable(false);
        setError(
          `@${cleanUsername} is already taken. Please try another username.`
        );
      } else {
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error("Username check error:", error);

      setUsernameAvailable(null);
      setError(
        "Unable to check username. Please try again."
      );
    } finally {
      setCheckingUsername(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanUsername) {
      setError("Please choose a username.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (cleanUsername.length > 20) {
      setError(
        "Username must contain at most 20 characters."
      );
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError(
        "Username can only contain letters, numbers and underscores."
      );
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Always check again before registration.
       *
       * This prevents registration if the username
       * was taken after the user initially checked it.
       */
      const taken = await isUsernameTaken(cleanUsername);

      if (taken) {
        setUsernameAvailable(false);

        setError(
          `@${cleanUsername} is already taken. Please choose another username.`
        );

        return;
      }

      setUsernameAvailable(true);

      await registerUser(
        cleanName,
        cleanUsername,
        cleanEmail,
        password
      );

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Registration error:", error);

      if (
        error &&
        typeof error === "object" &&
        "code" in error
      ) {
        const code = (error as { code: string }).code;

        switch (code) {
          case "username-already-exists":
            setUsernameAvailable(false);
            setError(
              "That username is already taken. Please choose another one."
            );
            break;

          case "auth/email-already-in-use":
            setError(
              "An account with this email already exists."
            );
            break;

          case "auth/invalid-email":
            setError(
              "Please enter a valid email address."
            );
            break;

          case "auth/weak-password":
            setError(
              "Password is too weak. Please choose a stronger password."
            );
            break;

          default:
            setError(
              "Unable to create your account. Please try again."
            );
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Full Name
        </label>

        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Your name"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          disabled={loading}
        />
      </div>

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Username
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              @
            </span>

            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) =>
                handleUsernameChange(
                  event.target.value
                )
              }
              onBlur={checkUsername}
              placeholder="sameer_basha"
              maxLength={20}
              className={`w-full rounded-2xl border bg-white py-3.5 pl-9 pr-4 text-slate-900 outline-none transition focus:ring-2 ${
                usernameAvailable === true
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100"
                  : usernameAvailable === false
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
              disabled={loading}
            />
          </div>

          <button
            type="button"
            onClick={checkUsername}
            disabled={
              loading ||
              checkingUsername ||
              username.trim().length < 3
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingUsername
              ? "Checking..."
              : "Check"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          3–20 characters. Letters, numbers and
          underscores only.
        </p>

        {usernameAvailable === true && (
          <p className="mt-2 text-sm font-medium text-emerald-600">
            ✓ Username is available
          </p>
        )}

        {usernameAvailable === false && (
          <p className="mt-2 text-sm font-medium text-red-600">
            ✕ Username is already taken
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="register-email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          disabled={loading}
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="register-password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="At least 6 characters"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          disabled={loading}
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirm-password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Confirm Password
        </label>

        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          placeholder="Enter password again"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          disabled={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || checkingUsername}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Creating account..."
          : "Create Account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}