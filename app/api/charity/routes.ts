import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

// GET /api/charity?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  
  const q = query(
    collection(db, 'charity'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(data);
}

// POST /api/charity
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, amount, date, category, note } = body;
  
  if (!userId || !amount || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  const docRef = await addDoc(collection(db, 'charity'), {
    userId,
    amount: Number(amount),
    date,
    category: category || 'sadaqah',
    note: note || '',
    createdAt: Timestamp.now().toMillis(),
  });
  
  return NextResponse.json({ id: docRef.id, success: true });
}