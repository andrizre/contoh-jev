# DEPLOYMENT.md: Soal Pilihan Ganda

## 1. Environments

| Env | URL | Purpose | Deploy trigger |
|-----|-----|---------|----------------|
| Dev | http://localhost:3000 | Kerja harian | Manual (`node server.js`) |
| Prod (Vercel) | https://<project>.vercel.app | Pengguna nyata | Push ke main / import GitHub |

## 2. Environment variables

| Var | Required | Example (fake) | Notes |
|-----|----------|----------------|-------|
| `OPENCODE_API_KEY` | Tidak (demo tanpa key) | `sk-ant-contoh` | Wajib untuk mode live. Lokal via `.env` (jangan commit). Vercel via dashboard Project Settings, Environment Variables. |
| `JEV_MODEL` | Tidak | `jev-1.13-free` | Default gratis. |
| `PORT` | Tidak (lokal saja) | `3000` | Vercel mengabaikan ini. |

## 3. Deploy ke GitHub

```bash
cd /home/andrizre/Pi/jev-probability-lab
git init
git add .
git status   # pastikan .env TIDAK ikut (ada di .gitignore)
git commit -m "feat: soal pilihan ganda dengan penilaian Jev"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

## 4. Deploy ke Vercel

1. Struktur sudah siap: folder `public/` jadi output statis (`outputDirectory`),
   fungsi di `api/jev.js` dan `api/health.js`, tanpa dependensi npm.
2. Di vercel.com: Add New Project, Import repositori GitHub di atas.
3. Framework Preset: Other. Build Command: kosongkan. Output Directory: `public`.
4. Environment Variables: tambah `OPENCODE_API_KEY` (dan opsional `JEV_MODEL`).
5. Deploy. Smoke test: buka situs, tekan contoh Ibu kota, pastikan pemenang A Tokyo.

## 5. Release checklist

- [ ] `node --check` bersih untuk server.js, api/*.js, public/app.js
- [ ] `curl` GET /api/health dan POST /api/jev (contoh di README) mengembalikan JSON
- [ ] Env vars terpasang di dashboard Vercel (tanpa key = mode demo, tetap jalan)
- [ ] Smoke test jalur kritis: tambah/hapus pilihan, nilai, riwayat tercatat
- [ ] Rollback: redeploy deployment sebelumnya dari tab Deployments Vercel

## 6. Logging and alerts

- Logs: stdout (`console.error` hanya untuk gagal live, tanpa key dan tanpa isi user).
- Health endpoint: `GET /api/health` mengembalikan 200 + mode + model.
