"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace("/dashboard/charity");
    } catch (caught) {
      const code = typeof caught === "object" && caught && "code" in caught ? String(caught.code) : "";
      setError(code === "auth/email-already-in-use" ? "An account already exists for this email." : "Unable to continue. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#030712] p-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <Link href="/" className="text-sm font-semibold text-emerald-400">← DeenTracker</Link>
        <h1 className="mt-6 text-3xl font-bold text-white">{mode === "sign-in" ? "Welcome back" : "Begin your journey"}</h1>
        <p className="mt-2 text-slate-400">{mode === "sign-in" ? "Sign in to access your personal records." : "Create an account to keep your progress private and synced."}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {mode === "register" && <label className="block text-sm text-slate-300">Name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" autoComplete="name" /></label>}
          <label className="block text-sm text-slate-300">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" autoComplete="email" required /></label>
          <label className="block text-sm text-slate-300">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required /></label>
          {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
          <button disabled={submitting} className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50">{submitting ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}</button>
        </form>

        <button onClick={() => { setMode(mode === "sign-in" ? "register" : "sign-in"); setError(null); }} className="mt-6 text-sm text-emerald-400 hover:text-emerald-300">
          {mode === "sign-in" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
