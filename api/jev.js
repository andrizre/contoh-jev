'use strict';
/* Fungsi serverless Vercel: POST /api/jev. Kunci dari env Vercel (OPENCODE_API_KEY). */
const lib = require('./_lib');

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === 'string') {
        try { resolve(JSON.parse(req.body || '{}')); } catch { resolve(null); }
        return;
      }
      resolve(req.body);
      return;
    }
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 16384) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve(null); } });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'METHOD', message: 'Gunakan POST.' });
    return;
  }
  const body = await readBody(req);
  if (!body) {
    res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Body harus JSON valid.' });
    return;
  }
  const err = lib.validateJev(body);
  if (err) {
    res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: err });
    return;
  }
  const state = body.state.trim();
  const apiKey = process.env.OPENCODE_API_KEY || '';
  const model = process.env.JEV_MODEL || 'jev-1.13-free';
  if (apiKey) {
    try {
      const live = await lib.callZen(apiKey, model, state, body.questions);
      res.status(200).json({ ok: true, mode: 'live', model, answers: live.answers || {}, usage: live.usage || null });
      return;
    } catch (e) {
      console.error('[jev live gagal]', e.message);
      res.status(200).json({ ok: true, mode: 'demo', model: 'demo-hash', answers: lib.demoGeneric(state, body.questions), note: 'Live Jev gagal (' + e.message + '). Ini hasil DEMO.' });
      return;
    }
  }
  res.status(200).json({ ok: true, mode: 'demo', model: 'demo-hash', answers: lib.demoGeneric(state, body.questions), note: 'Tanpa OPENCODE_API_KEY: hasil DEMO. Isi env untuk penilaian Jev asli.' });
};
