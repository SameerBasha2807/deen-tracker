import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#030712] px-6 py-20 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              Create Your Account
            </h1>

            <p className="mt-2 text-slate-400">
              Start tracking your Deen with DeenTracker.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </main>
  );
}