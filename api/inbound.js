const RESEND_API = 'https://api.resend.com';
const FORWARD_TO = 'timothy.o.ojo@gmail.com';
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.INBOUND_TOKEN || req.query.token !== process.env.INBOUND_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.body || {};
  if (event.type !== 'email.received') {
    return res.status(200).json({ ignored: event.type || 'unknown' });
  }

  const emailId = event.data && (event.data.email_id || event.data.id);
  if (!emailId) {
    console.error('No email id in webhook payload:', JSON.stringify(event).slice(0, 500));
    return res.status(200).json({ ignored: 'no email id' });
  }

  const auth = { Authorization: `Bearer ${process.env.RESEND_API_KEY}` };

  const emailRes = await fetch(`${RESEND_API}/emails/receiving/${emailId}`, { headers: auth });
  if (!emailRes.ok) {
    console.error('Failed to fetch received email:', emailRes.status, await emailRes.text());
    return res.status(502).json({ error: 'fetch failed' });
  }
  const email = await emailRes.json();

  const attachments = [];
  let skippedAttachments = 0;
  try {
    const listRes = await fetch(`${RESEND_API}/emails/receiving/${emailId}/attachments`, { headers: auth });
    if (listRes.ok) {
      const list = await listRes.json();
      let total = 0;
      for (const att of list.data || []) {
        total += att.size || 0;
        if (total > MAX_ATTACHMENT_BYTES) { skippedAttachments++; continue; }
        const fileRes = await fetch(att.download_url);
        if (!fileRes.ok) { skippedAttachments++; continue; }
        const buf = Buffer.from(await fileRes.arrayBuffer());
        attachments.push({
          filename: att.filename || 'attachment',
          content: buf.toString('base64'),
          content_type: att.content_type,
        });
      }
    }
  } catch (err) {
    console.error('Attachment handling error:', err);
    skippedAttachments++;
  }

  const recipient = Array.isArray(email.to) ? email.to.join(', ') : String(email.to || '');
  const noteLines = [`Forwarded from ${recipient} (sent by ${email.from})`];
  if (skippedAttachments > 0) {
    noteLines.push(`${skippedAttachments} attachment(s) too large to forward; view in Resend dashboard.`);
  }
  const note = noteLines.join(' — ');

  const payload = {
    from: 'Epimer Labs Mail <hello@epimerlabs.com>',
    to: [FORWARD_TO],
    reply_to: email.from,
    subject: `[${recipient}] ${email.subject || '(no subject)'}`,
    attachments,
  };
  if (email.html) {
    payload.html = `<p style="color:#888;font-size:12px">${note}</p><hr>${email.html}`;
  }
  payload.text = `${note}\n\n${email.text || ''}`;

  const sendRes = await fetch(`${RESEND_API}/emails`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!sendRes.ok) {
    console.error('Forward send failed:', sendRes.status, await sendRes.text());
    return res.status(502).json({ error: 'forward failed' });
  }

  return res.status(200).json({ forwarded: true });
};

module.exports.config = { maxDuration: 60 };
