import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// GET /api/prayer?userId=xxx&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');
  if (!userId || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  
  const ref = doc(db, 'prayers', `${userId}_${date}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return NextResponse.json(null);
  return NextResponse.json({ id: snap.id, ...snap.data() });
}

// POST /api/prayer
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, date, ...prayerData } = body;
  const docId = `${userId}_${date}`;
  
  await setDoc(doc(db, 'prayers', docId), {
    userId,
    date,
    ...prayerData,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  
  return NextResponse.json({ success: true, id: docId });
}