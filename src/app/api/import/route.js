import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Service role client — server-side only, never exposed to browser
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service role credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request) {
  try {
    const { cards, userId } = await request.json();

    if (!cards?.length || !userId) {
      return NextResponse.json({ error: 'Missing cards or userId' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const payload = cards.map(c => ({ ...c, user_id: userId }));

    // Upsert in batches of 500
    const BATCH = 500;
    for (let i = 0; i < payload.length; i += BATCH) {
      const { error } = await supabase.from('cards').upsert(payload.slice(i, i + BATCH));
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ imported: payload.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
