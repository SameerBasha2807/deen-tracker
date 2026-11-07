
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Heart,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";
import { useAuth } from "@/contexts/AuthContext";

import {
  addRamadanCharityDonation,
  deleteRamadanCharityDonation,
  getRamadanCharityDonations,
  RAMADAN_CHARITY_PAYMENT_METHODS,
  RAMADAN_CHARITY_TYPES,
  updateRamadanCharityDonation,
  type CharityPaymentMethod,
  type CharityType,
  type RamadanCharityDonation,
  type RamadanCharityInput,
} from "@/lib/ramadan-charity";

type DonationForm = {
  donationDate: string;
  title: string;
  amount: string;
  donationType: CharityType;
  recipient: string;
  paymentMethod: CharityPaymentMethod;
  note: string;
};

function getToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function createEmptyForm(): DonationForm {
  return {
    donationDate: getToday(),
    title: "",
    amount: "",
    donationType: "sadaqah",
    recipient: "",
    paymentMethod: "upi",
    note: "",
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTypeLabel(type: CharityType) {
  return (
    RAMADAN_CHARITY_TYPES.find((item) => item.value === type)?.label ??
    "Other"
  );
}

function getPaymentLabel(method: CharityPaymentMethod) {
  return (
    RAMADAN_CHARITY_PAYMENT_METHODS.find(
      (item) => item.value === method
    )?.label ?? "Other"
  );
}

export default function RamadanCharityPage() {
  const { user, loading: authLoading } = useAuth();

  const [donations, setDonations] = useState<RamadanCharityDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DonationForm>(createEmptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadDonations(userId: string) {
    const data = await getRamadanCharityDonations(userId);
    setDonations(data);
  }


useEffect(() => {
  if (authLoading) return;

  if (!user) {
    setLoading(false);
    setError("Please sign in to access your charity tracker.");
    return;
  }

  // Capture the authenticated user's ID before entering
  // the asynchronous function.
  const userId = user.uid;

  let cancelled = false;

  async function load() {
    try {
      setLoading(true);
      setError("");

      const data = await getRamadanCharityDonations(userId);

      if (!cancelled) {
        setDonations(data);
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load donation records."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  load();

  return () => {
    cancelled = true;
  };
}, [user, authLoading]);


  const totalDonated = useMemo(
    () => donations.reduce((sum, item) => sum + item.amount, 0),
    [donations]
  );

  const currentMonth = getToday().slice(0, 7);

  const thisMonthTotal = useMemo(
    () =>
      donations
        .filter((item) => item.donationDate.startsWith(currentMonth))
        .reduce((sum, item) => sum + item.amount, 0),
    [donations, currentMonth]
  );

  const categoryBreakdown = useMemo(() => {
    return RAMADAN_CHARITY_TYPES.map((type) => ({
      ...type,
      total: donations
        .filter((item) => item.donationType === type.value)
        .reduce((sum, item) => sum + item.amount, 0),
    }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [donations]);

  const filteredDonations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return donations;

    return donations.filter((item) =>
      [
        item.title,
        item.recipient,
        item.note,
        getTypeLabel(item.donationType),
        getPaymentLabel(item.paymentMethod),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [donations, search]);

  function resetForm() {
    setForm(createEmptyForm());
    setEditingId(null);
    setShowForm(false);
  }

  function startEditing(donation: RamadanCharityDonation) {
    setForm({
      donationDate: donation.donationDate,
      title: donation.title,
      amount: String(donation.amount),
      donationType: donation.donationType,
      recipient: donation.recipient,
      paymentMethod: donation.paymentMethod,
      note: donation.note,
    });

    setEditingId(donation.id);
    setShowForm(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Please sign in first.");
      return;
    }

    const input: RamadanCharityInput = {
      donationDate: form.donationDate,
      title: form.title.trim(),
      amount: Number(form.amount),
      donationType: form.donationType,
      recipient: form.recipient.trim(),
      paymentMethod: form.paymentMethod,
      note: form.note.trim(),
    };

    try {
      setSaving(true);
      setError("");
      setNotice("");

      if (editingId) {
        await updateRamadanCharityDonation(
          user.uid,
          editingId,
          input
        );
        setNotice("Donation record updated.");
      } else {
        await addRamadanCharityDonation(user.uid, input);
        setNotice("Donation recorded successfully.");
      }

      await loadDonations(user.uid);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the donation."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(donationId: string) {
    if (!user) return;

    const confirmed = window.confirm(
      "Delete this donation record? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotice("");

      await deleteRamadanCharityDonation(user.uid, donationId);
      await loadDonations(user.uid);

      if (editingId === donationId) resetForm();

      setNotice("Donation record deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the donation."
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                RAMADAN WORKSPACE
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Charity Tracker
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Keep a record of your Sadaqah, Zakat and other charitable
                contributions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm && !editingId) {
                  resetForm();
                } else {
                  setForm(createEmptyForm());
                  setEditingId(null);
                  setShowForm(true);
                  setError("");
                  setNotice("");
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              {showForm && !editingId ? (
                <X size={18} />
              ) : (
                <Plus size={18} />
              )}
              {showForm && !editingId
                ? "Close form"
                : "Record donation"}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {notice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Total contributions
                </p>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                  <Heart size={20} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {formatCurrency(totalDonated)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across all recorded donations
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  This month
                </p>
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                  <CalendarDays size={20} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {formatCurrency(thisMonthTotal)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Based on donation dates
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Donations recorded
                </p>
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                  <Wallet size={20} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {donations.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Individual contribution records
              </p>
            </div>
          </section>

          {showForm && (
            <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingId ? "Edit donation" : "Record a donation"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the details of your contribution.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Description *
                    </span>
                    <input
                      required
                      maxLength={80}
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g. Monthly Sadaqah"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Amount (INR) *
                    </span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      placeholder="500"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Donation date *
                    </span>
                    <input
                      required
                      type="date"
                      value={form.donationDate}
                      onChange={(e) =>
                        setForm({ ...form, donationDate: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Category *
                    </span>
                    <select
                      value={form.donationType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          donationType: e.target.value as CharityType,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                      {RAMADAN_CHARITY_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Recipient / organization
                    </span>
                    <input
                      maxLength={120}
                      value={form.recipient}
                      onChange={(e) =>
                        setForm({ ...form, recipient: e.target.value })
                      }
                      placeholder="Optional"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Payment method
                    </span>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          paymentMethod: e.target.value as CharityPaymentMethod,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                      {RAMADAN_CHARITY_PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Notes
                  </span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: e.target.value })
                    }
                    placeholder="Optional details..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update donation"
                        : "Save donation"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Donation history
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and manage your recorded contributions.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search donations..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={20} />
                  Loading donations...
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Heart size={22} />
                  </div>
                  <h3 className="font-semibold text-slate-800">
                    {search ? "No matching donations" : "No donations recorded yet"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    {search
                      ? "Try another search term."
                      : "Use Record donation to add your first contribution."}
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {filteredDonations.map((donation) => (
                    <article
                      key={donation.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {donation.title}
                            </h3>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                              {getTypeLabel(donation.donationType)}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>{formatDate(donation.donationDate)}</span>
                            {donation.recipient && (
                              <span>To: {donation.recipient}</span>
                            )}
                            <span>{getPaymentLabel(donation.paymentMethod)}</span>
                          </div>

                          {donation.note && (
                            <p className="mt-2 break-words text-sm text-slate-600">
                              {donation.note}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <p className="text-lg font-bold text-emerald-800">
                            {formatCurrency(donation.amount)}
                          </p>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditing(donation)}
                              aria-label="Edit donation"
                              className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(donation.id)}
                              aria-label="Delete donation"
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Category breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Recorded amounts by contribution type.
              </p>

              {categoryBreakdown.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Your category totals will appear here.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {categoryBreakdown.map((item) => {
                    const percentage =
                      totalDonated > 0
                        ? (item.total / totalDonated) * 100
                        : 0;

                    return (
                      <div key={item.value}>
                        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                          <span className="font-medium text-slate-700">
                            {item.label}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </section>

          <p className="text-xs leading-relaxed text-slate-500">
            Your donation records are private to your account. This tracker
            records contributions only; it does not determine religious
            obligations or calculate Zakat.
          </p>
        </main>
      </div>
    </div>
  );
}
