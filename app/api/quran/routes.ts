import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  
  const q = query(collection(db, 'quran'), where('userId', '==', userId), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const docRef = await addDoc(collection(db, 'quran'), {
    ...body,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, id: docRef.id });
}