'use strict';
/* Logika Jev dipakai bersama oleh server lokal (server.js) dan fungsi Vercel (api/*.js).
   Tanpa dependensi. Kunci dibaca dari process.env di masing-masing runtime. */

const ZEN_URL = 'https://opencode.ai/zen/v1/systemone';

function userError(message, code = 'BAD_REQUEST') {
  return JSON.stringify({ ok: false, error: code, message });
}

function validateVerify(b) {
  if (!b || typeof b !== 'object') return 'Body harus JSON object.';
  const { question, answer } = b;
  if (typeof question !== 'string' || typeof answer !== 'string') return 'Pertanyaan dan jawaban harus teks.';
  const q = question.trim(), a = answer.trim();
  if (q.length < 3) return 'Pertanyaan minimal 3 karakter.';
  if (q.length > 500) return 'Pertanyaan maksimal 500 karakter.';
  if (a.length < 1) return 'Jawaban tidak boleh kosong.';
  if (a.length > 1000) return 'Jawaban maksimal 1000 karakter.';
  if (/<script|onerror\s*=|javascript:/i.test(q + a)) return 'Input mengandung pola tidak diizinkan.';
  return null;
}

const DEMO_KNOWLEDGE = [
  { match: ['ibu kota jepang'], good: ['tokyo'], bad: ['osaka', 'kyoto', 'jakarta'], pGood: 0.95, pBad: 0.07 },
  { match: ['2 + 2', '2+2×2', '2 + 2 × 2'], good: ['6'], bad: ['8', '4'], pGood: 0.95, pBad: 0.07 },
  { match: ['lampu pijar'], good: ['edison'], bad: [], pGood: 0.93, pBad: 0.2 },
  { match: ['mendidih', '100'], good: ['ya', 'benar', 'betul'], bad: ['tidak', 'salah'], pGood: 0.9, pBad: 0.1 },
];
function demoScore(question, answer) {
  const q = question.toLowerCase(), a = answer.toLowerCase();
  for (const k of DEMO_KNOWLEDGE) {
    if (k.match.some((m) => q.includes(m))) {
      if (k.good.some((g) => a.includes(g))) return packDemo(k.pGood);
      if (k.bad.some((b) => a.includes(b))) return packDemo(k.pBad);
    }
  }
  const uncertain = /(tidak tahu|tidak yakin|mungkin|kayaknya|asal|ngawur)/.test(a);
  const lenBonus = Math.min(0.08, a.length / 800);
  const p = Math.max(0.35, Math.min(0.65, 0.5 + lenBonus + (uncertain ? -0.15 : 0)));
  return packDemo(+p.toFixed(3));
}
function packDemo(p) {
  const probs = {
    benar: p > 0.66 ? p : (1 - p) * 0.3,
    sebagian_benar: Math.min(0.9, 0.25 + (1 - Math.abs(p - 0.5) * 2) * 0.45),
    salah: p < 0.34 ? 1 - p : (1 - p) * 0.6,
  };
  const s = probs.benar + probs.sebagian_benar + probs.salah;
  for (const k of Object.keys(probs)) probs[k] = +(probs[k] / s).toFixed(3);
  const choice = probs.benar >= probs.salah && probs.benar >= probs.sebagian_benar ? 'benar' : probs.salah >= probs.sebagian_benar ? 'salah' : 'sebagian_benar';
  return { noul: +p.toFixed(3), scoreVal: +(p * 4).toFixed(2), probs, choice, confidence: +Math.max(0.4, Math.abs(p - 0.5) * 2).toFixed(3) };
}

function validateJev(body) {
  if (!body || typeof body !== 'object') return 'Body harus JSON object.';
  const { state, questions } = body;
  if (typeof state !== 'string' || state.trim().length < 3) return 'State minimal 3 karakter.';
  if (state.length > 3000) return 'State maksimal 3000 karakter.';
  if (!questions || typeof questions !== 'object' || Array.isArray(questions)) return 'Questions harus object berisi 1 sampai 10 pertanyaan.';
  const ids = Object.keys(questions);
  if (!ids.length || ids.length > 10) return 'Questions harus berisi 1 sampai 10 pertanyaan.';
  for (const id of ids) {
    if (!/^[a-z_]{1,32}$/.test(id)) return 'ID "' + id + '" tidak valid (huruf kecil dan garis bawah, maks 32).';
    const q = questions[id];
    if (!q || typeof q !== 'object') return 'Pertanyaan "' + id + '" harus object.';
    if (q.type !== 'noul' && q.type !== 'choice' && q.type !== 'score') return 'Tipe "' + id + '" harus noul, choice, atau score.';
    if (typeof q.instructions !== 'string' || q.instructions.trim().length < 5) return 'Instruksi "' + id + '" minimal 5 karakter.';
    if (q.instructions.length > 500) return 'Instruksi "' + id + '" maksimal 500 karakter.';
    if (q.type === 'noul') {
      if (q.criteria !== undefined) {
        if (typeof q.criteria !== 'object' || q.criteria === null || Array.isArray(q.criteria)) return 'Criteria "' + id + '" harus object {true, false}.';
        for (const k of ['true', 'false']) {
          if (q.criteria[k] !== undefined && (typeof q.criteria[k] !== 'string' || q.criteria[k].length > 200)) return 'Criteria "' + id + '.' + k + '" maksimal 200 karakter.';
        }
      }
    } else if (q.type === 'choice') {
      if (!q.criteria || typeof q.criteria !== 'object' || Array.isArray(q.criteria)) return 'Criteria "' + id + '" wajib object 2 sampai 8 opsi.';
      const opts = Object.keys(q.criteria);
      if (opts.length < 2 || opts.length > 8) return 'Opsi "' + id + '" harus 2 sampai 8.';
      for (const o of opts) {
        if (!/^[A-Za-z0-9_]{1,32}$/.test(o)) return 'Nama opsi "' + o + '" tidak valid.';
        const v = q.criteria[o];
        if (v !== null && (typeof v !== 'string' || v.length > 200)) return 'Deskripsi opsi "' + o + '" maksimal 200 karakter.';
      }
    } else {
      if (!Array.isArray(q.criteria) || q.criteria.length < 2 || q.criteria.length > 8) return 'Criteria "' + id + '" wajib array 2 sampai 8 level.';
      for (const lv of q.criteria) {
        if (typeof lv !== 'string' || !lv.trim() || lv.length > 120) return 'Level "' + id + '" harus teks 1 sampai 120 karakter.';
      }
    }
  }
  return null;
}

function hash01(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 1000) / 1000;
}

function demoGeneric(state, questions) {
  const answers = {};
  for (const id of Object.keys(questions)) {
    const q = questions[id];
    const r = hash01(state + '|' + id + '|' + q.instructions);
    if (q.type === 'noul') {
      answers[id] = { type: 'noul', noul: +(0.15 + r * 0.7).toFixed(3) };
    } else if (q.type === 'choice') {
      const opts = Object.keys(q.criteria);
      const w = opts.map((o) => 1 + hash01(o + id + r) * 2);
      const s = w.reduce((a, b) => a + b, 0);
      const probs = {};
      opts.forEach((o, i) => { probs[o] = +(w[i] / s).toFixed(3); });
      const best = opts.reduce((a, b) => (probs[a] >= probs[b] ? a : b));
      answers[id] = { type: 'choice', choice: best, probabilities: probs, confidence: +Math.max(0.35, Math.abs(probs[best] - 1 / opts.length) * 1.5).toFixed(3) };
    } else {
      const n = q.criteria.length;
      const w = q.criteria.map((c, i) => 1 + hash01(id + i + r) * 2);
      const s = w.reduce((a, b) => a + b, 0);
      const probs = {}; let score = 0;
      w.forEach((x, i) => { const p = +(x / s).toFixed(3); probs[String(i)] = p; score += p * i; });
      const legend = {}; q.criteria.forEach((c, i) => { legend[String(i)] = c; });
      answers[id] = { type: 'score', score: +score.toFixed(2), legend, probabilities: probs, confidence: +Math.max(0.35, 0.9 - Math.abs(score - (n - 1) / 2) / n).toFixed(3) };
    }
  }
  return answers;
}

async function callZen(apiKey, model, state, questions, timeoutMs = 25000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(ZEN_URL, {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, state, questions }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = r.status === 401 ? 'API key ditolak (401). Cek OPENCODE_API_KEY.' : r.status === 429 ? 'Rate limit (429). Tunggu sebentar.' : 'Zen error ' + r.status + '.';
      throw Object.assign(new Error(msg), { status: r.status });
    }
    return data;
  } finally { clearTimeout(t); }
}

function verifyQuestions(question, answer) {
  return {
    is_correct: {
      type: 'noul',
      instructions: 'Apakah jawaban user BENAR untuk pertanyaan yang diberikan?',
      criteria: { true: 'Jawaban benar / intinya tepat', false: 'Jawaban salah, ngawur, atau tidak menjawab' },
    },
    kualitas: {
      type: 'score',
      instructions: 'Seberapa bagus kualitas jawaban user?',
      criteria: ['Salah total', 'Kurang tepat', 'Sebagian benar', 'Benar', 'Sangat tepat dan lengkap'],
    },
    vonis: {
      type: 'choice',
      instructions: 'Pilih satu vonis untuk jawaban user.',
      criteria: { benar: 'Jawaban benar', sebagian_benar: 'Ada benarnya tapi belum penuh', salah: 'Jawaban salah' },
    },
  };
}

function mapVerify(data) {
  const a = data.answers || {};
  const noul = a.is_correct && typeof a.is_correct.noul === 'number' ? a.is_correct.noul : 0.5;
  const sc = a.kualitas || {};
  const ch = a.vonis || {};
  return {
    noul: +noul.toFixed(3),
    scoreVal: typeof sc.score === 'number' ? +sc.score.toFixed(2) : null,
    scoreLegend: sc.legend || { 0: 'Salah total', 1: 'Kurang tepat', 2: 'Sebagian benar', 3: 'Benar', 4: 'Sangat tepat dan lengkap' },
    scoreProbs: sc.probabilities || null,
    probs: ch.probabilities || null,
    choice: ch.choice || (noul >= 0.66 ? 'benar' : noul <= 0.34 ? 'salah' : 'sebagian_benar'),
    confidence: typeof ch.confidence === 'number' ? +ch.confidence.toFixed(3) : +(Math.abs(noul - 0.5) * 2).toFixed(3),
    usage: data.usage || null,
  };
}

module.exports = { ZEN_URL, userError, validateVerify, demoScore, validateJev, demoGeneric, callZen, verifyQuestions, mapVerify };
