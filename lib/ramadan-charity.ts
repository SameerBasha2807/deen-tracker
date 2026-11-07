
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const RAMADAN_CHARITY_TYPES = [
  { value: "sadaqah", label: "Sadaqah" },
  { value: "zakat", label: "Zakat" },
  { value: "fitr", label: "Zakat al-Fitr" },
  { value: "fidya", label: "Fidya" },
  { value: "kaffarah", label: "Kaffarah" },
  { value: "iftar", label: "Iftar / Food" },
  { value: "mosque", label: "Mosque / Community" },
  { value: "other", label: "Other" },
] as const;

export const RAMADAN_CHARITY_PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
] as const;

export type CharityType =
  (typeof RAMADAN_CHARITY_TYPES)[number]["value"];

export type CharityPaymentMethod =
  (typeof RAMADAN_CHARITY_PAYMENT_METHODS)[number]["value"];

export interface RamadanCharityDonation {
  id: string;
  donationDate: string;
  title: string;
  amount: number;
  donationType: CharityType;
  recipient: string;
  paymentMethod: CharityPaymentMethod;
  note: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type RamadanCharityInput = Omit<
  RamadanCharityDonation,
  "id" | "createdAt" | "updatedAt"
>;

function validateDonation(input: RamadanCharityInput) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.donationDate)) {
    throw new Error("Please enter a valid donation date.");
  }

  const [year, month, day] = input.donationDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error("Please enter a valid donation date.");
  }

  if (!input.title.trim()) {
    throw new Error("Please enter a donation description.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Donation amount must be greater than zero.");
  }

  if (input.title.trim().length > 80) {
    throw new Error("Description must be 80 characters or fewer.");
  }

  if (input.recipient.length > 120 || input.note.length > 500) {
    throw new Error("Recipient or note is too long.");
  }
}

function donationsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "ramadanCharityDonations"
  );
}

export async function getRamadanCharityDonations(
  userId: string
): Promise<RamadanCharityDonation[]> {
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const snapshot = await getDocs(donationsCollection(userId));

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...(item.data() as Omit<RamadanCharityDonation, "id">),
    }))
    .sort((a, b) =>
      b.donationDate.localeCompare(a.donationDate)
    );
}

export async function addRamadanCharityDonation(
  userId: string,
  input: RamadanCharityInput
): Promise<string> {
  validateDonation(input);

  const docRef = await addDoc(donationsCollection(userId), {
    donationDate: input.donationDate,
    title: input.title.trim(),
    amount: Number(input.amount),
    donationType: input.donationType,
    recipient: input.recipient.trim(),
    paymentMethod: input.paymentMethod,
    note: input.note.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateRamadanCharityDonation(
  userId: string,
  donationId: string,
  input: RamadanCharityInput
): Promise<void> {
  validateDonation(input);

  await updateDoc(
    doc(
      db,
      "users",
      userId,
      "ramadanCharityDonations",
      donationId
    ),
    {
      donationDate: input.donationDate,
      title: input.title.trim(),
      amount: Number(input.amount),
      donationType: input.donationType,
      recipient: input.recipient.trim(),
      paymentMethod: input.paymentMethod,
      note: input.note.trim(),
      updatedAt: serverTimestamp(),
    }
  );
}

export async function deleteRamadanCharityDonation(
  userId: string,
  donationId: string
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "ramadanCharityDonations",
      donationId
    )
  );
}
