import { createClient } from '@supabase/supabase-js';
import { verifyInitData } from './_auth.js';
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const BOOST = 0.001, MAX_H = 24; // TBC/jam per 1 TBC dimiliki (ATUR DI SINI)
export default async function handler(req, res) {
  try {
    const u = verifyInitData(req.body.initData);
    const { data: p } = await db.from('players').select('*').eq('tg_id', u.id).single();
    if (!p?.wallet_verified) return res.status(403).json({ error: 'Verifikasi dompet dulu' });
    const hours = Math.min((Date.now() - new Date(p.last_claim)) / 36e5, MAX_H);
    const rate = 1 + (p.balance + p.staked) * BOOST;
    const earned = hours * rate;
    await db.from('players').update({ balance: p.balance + earned, last_claim: new Date() }).eq('tg_id', u.id);
    await db.from('transactions').insert({ tg_id: u.id, type: 'mining', amount: earned });
    if (p.referrer) await db.from('players').rpc?.('noop'); // TODO: tambah 12% ke referrer + transaksi 'referral'
    res.json({ earned, rate });
  } catch (e) { res.status(401).json({ error: e.message }); }
}
