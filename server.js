// server.js: Soal Pilihan Ganda (Node http murni, zero-install)
// Cara pakai lokal:
//   cp .env.example .env   # isi OPENCODE_API_KEY dari https://opencode.ai/zen
//   node server.js          # buka http://localhost:3000
// Deploy Vercel: fungsi di api/ memakai logika yang sama dari api/_lib.js.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const lib = require('./api/_lib');

// --- .env manual loader (tanpa dotenv, zero-install) ---
(function loadEnv() {
  try {
    const p = path.join(__dirname, '.env');
    if (!fs.existsSync(p)) return;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch { /* abaikan, lanjut demo mode */ }
})();

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENCODE_API_KEY || '';
const JEV_MODEL = process.env.JEV_MODEL || 'jev-1.13-free';
const PUBLIC = path.join(__dirname, 'public');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://${req.headers.host}`);

    // API: health
    if (u.pathname === '/api/health' && req.method === 'GET') {
      return send(res, 200, JSON.stringify({ ok: true, mode: API_KEY ? 'live-ready' : 'demo', model: JEV_MODEL }));
    }

    // API: generic Jev (dipakai fitur pilihan ganda)
    if (u.pathname === '/api/jev' && req.method === 'POST') {
      let raw = '';
      for await (const c of req) { raw += c; if (raw.length > 16384) break; }
      let body = null;
      try { body = JSON.parse(raw || '{}'); } catch { return send(res, 400, lib.userError('Body harus JSON valid.')); }
      const err = lib.validateJev(body);
      if (err) return send(res, 400, lib.userError(err));
      const state = body.state.trim();
      if (API_KEY) {
        try {
          const live = await lib.callZen(API_KEY, JEV_MODEL, state, body.questions);
          return send(res, 200, JSON.stringify({ ok: true, mode: 'live', model: JEV_MODEL, answers: live.answers || {}, usage: live.usage || null }));
        } catch (e) {
          console.error('[jev live gagal]', e.message);
          return send(res, 200, JSON.stringify({ ok: true, mode: 'demo', model: 'demo-hash', answers: lib.demoGeneric(state, body.questions), note: 'Live Jev gagal (' + e.message + '). Ini hasil DEMO.' }));
        }
      }
      return send(res, 200, JSON.stringify({ ok: true, mode: 'demo', model: 'demo-hash', answers: lib.demoGeneric(state, body.questions), note: 'Tanpa OPENCODE_API_KEY: hasil DEMO. Isi .env untuk penilaian Jev asli.' }));
    }

    // API: verify (kompatibilitas lama)
    if (u.pathname === '/api/verify' && req.method === 'POST') {
      let raw = '';
      for await (const c of req) { raw += c; if (raw.length > 8192) break; }
      let body = null;
      try { body = JSON.parse(raw || '{}'); } catch { return send(res, 400, lib.userError('Body harus JSON valid.')); }
      const err = lib.validateVerify(body);
      if (err) return send(res, 400, lib.userError(err));
      const question = body.question.trim(), answer = body.answer.trim();
      const state = `Pertanyaan: ${question}\nJawaban user: ${answer}\n\nTugas: nilai apakah jawaban user benar untuk pertanyaan tersebut. Jawab HANYA via struktur yang diminta.`;
      if (API_KEY) {
        try {
          const live = await lib.callZen(API_KEY, JEV_MODEL, state, lib.verifyQuestions(question, answer));
          const m = lib.mapVerify(live);
          return send(res, 200, JSON.stringify({ ok: true, mode: 'live', model: JEV_MODEL, question, answer, ...m }));
        } catch (e) {
          // Fallback transparan ke demo, JANGAN bocorkan stack/key
          console.error('[jev live gagal]', e.message);
          const d = lib.demoScore(question, answer);
          return send(res, 200, JSON.stringify({
            ok: true, mode: 'demo', model: 'demo-heuristik',
            question, answer, noul: d.noul, scoreVal: d.scoreVal,
            scoreLegend: { 0: 'Salah total', 1: 'Kurang tepat', 2: 'Sebagian benar', 3: 'Benar', 4: 'Sangat tepat dan lengkap' },
            probs: d.probs, choice: d.choice, confidence: d.confidence,
            note: 'Live Jev gagal (' + e.message + '). Ini hasil DEMO lokal.',
          }));
        }
      }
      const d = lib.demoScore(question, answer);
      return send(res, 200, JSON.stringify({
        ok: true, mode: 'demo', model: 'demo-heuristik',
        question, answer, noul: d.noul, scoreVal: d.scoreVal,
        scoreLegend: { 0: 'Salah total', 1: 'Kurang tepat', 2: 'Sebagian benar', 3: 'Benar', 4: 'Sangat tepat dan lengkap' },
        probs: d.probs, choice: d.choice, confidence: d.confidence,
        note: 'Tanpa OPENCODE_API_KEY: hasil DEMO lokal. Isi .env untuk penilaian Jev asli (jev-1.13-free).',
      }));
    }

    // Static
    let fp = path.join(PUBLIC, u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname.slice(1)));
    if (!fp.startsWith(PUBLIC)) return send(res, 403, lib.userError('Forbidden.', 'FORBIDDEN'));
    if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
    if (!fs.existsSync(fp)) fp = path.join(PUBLIC, 'index.html');
    const ext = path.extname(fp).toLowerCase();
    send(res, 200, fs.readFileSync(fp), MIME[ext] || 'application/octet-stream');
  } catch (e) {
    console.error('[server]', e.message);
    send(res, 500, lib.userError('Terjadi kesalahan server. Coba lagi.', 'INTERNAL'));
  }
});

server.listen(PORT, () => console.log(`Soal Pilihan Ganda jalan di http://localhost:${PORT} (mode: ${API_KEY ? 'LIVE (' + JEV_MODEL + ')' : 'DEMO, isi .env untuk live'})`));
