module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const subject = String(body._subject || 'New Epimer Labs Form Submission').slice(0, 200);
  const redirect = String(body._next || 'https://www.epimerlabs.com/contact.html');

  const skip = new Set(['_subject', '_next', '_captcha']);
  const lines = Object.entries(body)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Epimer Labs <hello@epimerlabs.com>',
      to: ['timothy.o.ojo@gmail.com'],
      reply_to: email,
      subject,
      text: lines.join('\n'),
    }),
  });

  if (!r.ok) {
    const detail = await r.text();
    console.error('Resend error:', r.status, detail);
    return res.status(502).json({ error: 'Failed to send message' });
  }

  res.writeHead(303, { Location: `${redirect.split('?')[0]}?sent=1` });
  res.end();
};
