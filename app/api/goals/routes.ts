import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  
  const q = query(collection(db, 'goals'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const docRef = await addDoc(collection(db, 'goals'), { ...body, createdAt: new Date().toISOString() });
  return NextResponse.json({ success: true, id: docRef.id });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  await updateDoc(doc(db, 'goals', id), updates);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await deleteDoc(doc(db, 'goals', id));
  return NextResponse.json({ success: true });
}