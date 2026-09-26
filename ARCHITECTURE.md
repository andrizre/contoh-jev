# ARCHITECTURE.md: Ruang Nilai Jev

## 1. Stack
| Layer | Choice | Version / notes |
|-------|--------|-----------------|
| Language | JavaScript (Node + browser vanilla) | Node 18+ (global fetch), strict mode |
| Framework | Tanpa framework (no-build) | Patuh guardrail: no npm install tanpa izin |
| Styling | CSS murni tanpa dependensi | Instrumen lab kertas terang, lihat DESIGN.md |
| Backend | `server.js` Node `http` murni (lokal) + fungsi Vercel `api/*.js` | Logika Jev di `api/_lib.js` dipakai keduanya, tanpa dependensi |
| AI | Jev via OpenCode Zen `POST /zen/v1/systemone` | Model `jev-1.13-free` (gratis) / `jev-1.13` |
| Hosting | Lokal / VPS statis | `node server.js`, PORT default 3000 |

## 2. Folder map
```text
jev-probability-lab/
  server.js          # lokal: static public/ + /api/* (pakai api/_lib.js)
  api/
    _lib.js          # SATU-SATUNYA sumber logika Jev (validasi, demo, callZen)
    jev.js           # fungsi Vercel POST /api/jev
    health.js        # fungsi Vercel GET /api/health
  vercel.json        # outputDirectory public
  package.json       # metadata tanpa dependensi, engines node >= 18
  .gitignore         # .env tidak ikut commit
  .env.example       # OPENCODE_API_KEY=... , JEV_MODEL=jev-1.13-free
  public/
    index.html       # satu fitur soal pilihan ganda
    style.css        # sistem instrumen lab kertas
    app.js           # pilihan dinamis, dua angka per opsi, riwayat
  *.md               # doc-kit
```

## 3. Data model (tanpa DB, in-memory + localStorage)
| Entity | Key fields | Relations |
|--------|-----------|-----------|
| Verification | id, question, answer, noul, score, choice, probs, confidence, mode, createdAt | disimpan di localStorage `jev_history` (max 20) |

## 4. API conventions
- `POST /api/verify` body `{question: string 3..500, answer: string 1..1000}` → `{ok:true, mode:"live"\|"demo", noul:0..1, score:{value, legend, probabilities}, verdict:{choice, probabilities}, confidence, usage?, note?}`. Error: `{ok:false, error:"<CODE>", message:"<user-safe ID>"}`.
- Alur Jev (wajib): `state` = gabungan pertanyaan+jawaban; `questions` = 3 paralel: `is_correct` (noul), `kualitas` (score 5 level), `vonis` (choice: benar/sebagian_benar/salah). Response `answers` dipetakan 1:1 ke output.

## 5. Decisions log
| Date | Decision | Reason | Alternatives rejected |
|------|----------|--------|-----------------------|
| 2026-09-26 | Node http murni + fungsi Vercel CJS, tanpa express/zod | Zero-install, guardrail no-install; validasi manual setara | Express+Zod (butuh npm install + approval) |
| 2026-09-26 | Logika Jev pindah ke `api/_lib.js` dipakai server lokal + Vercel | Satu sumber, deploy dua target tanpa duplikasi | Duplikasi validasi di dua tempat |
| 2026-09-26 | 3 tipe Jev sekaligus (noul+score+choice) | Demo penuh alur kerja Jev sesuai riset thejevai.com/docs | Hanya noul (kurang edukatif) |
| 2026-09-26 | Key hanya di server `.env` | Docs Jev: never put key in browser | Key di frontend (bocor) |

## 6. Dependency approvals
| Date | Package | Version | Reason |
|------|---------|---------|--------|
| 2026-09-26 | (nihil, CSS murni) | - | Zero-install sesuai guardrail |
