// Validasi initData Telegram (WAJIB di setiap endpoint)
import crypto from 'crypto';
export function verifyInitData(initData) {
  const p = new URLSearchParams(initData); const hash = p.get('hash'); p.delete('hash');
  const str = [...p.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n');
  const secret = crypto.createHmac('sha256','WebAppData').update(process.env.BOT_TOKEN).digest();
  const calc = crypto.createHmac('sha256',secret).update(str).digest('hex');
  if (calc !== hash) throw new Error('invalid');
  return JSON.parse(p.get('user'));
}
