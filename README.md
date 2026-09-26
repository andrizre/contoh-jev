# Soal Pilihan Ganda

Satu fitur untuk guru: tulis pernyataan, tambah pilihan jawaban (2 sampai 8,
tombol tambah dan hapus sungguhan), lalu tekan nilai. Jev memberi probabilitas
tiap pilihan dan menunjuk pemenang sebagai jawaban paling tepat.

## Logika (keputusan implementasi, boleh direvisi)

- Pernyataan dikirim sebagai state. Pilihan dikirim sebagai opsi satu pertanyaan
  bertipe choice dengan instruksi "Manakah jawaban yang paling tepat?".
- Huruf A sampai H dibuat otomatis mengikuti urutan dan ikut terkirim sebagai ID opsi.
- Kolom kosong diabaikan. Kurang dari 2 pilihan yang terisi ditolak dengan pesan jelas.
- Tiap pilihan mendapat dua angka: relatif (porsi dari 100 persen, selalu ada satu
  pemenang) dan mutlak (satu pertanyaan noul per pilihan, dinilai sendiri tanpa
  dibagi opsi lain). Pilihan bukan pemenang yang mutlaknya di atas 50 persen
  ditandai "mungkin benar". Pemenang pun belum tentu 100 persen benar, tergantung Jev.
- Hasil diurutkan dari probabilitas relatif tertinggi.
- Contoh uji live: soal ibu kota Jepang dengan opsi Tokyo, Osaka, Kyoto, Beijing
  dimenangkan A (Tokyo) 100 persen, keyakinan 100 persen.

## Cara jalan (tanpa npm install)

```bash
cd jev-probability-lab
cp .env.example .env   # isi OPENCODE_API_KEY dari https://opencode.ai/zen
node server.js          # buka http://localhost:3000
```

Penting: setiap ganti kode, restart server (hentikan dengan Ctrl+C, jalankan lagi).

Siap deploy ke GitHub dan Vercel, lihat `DEPLOYMENT.md`.

## Berkas

- `server.js`: peladen statis dan proxy `/api/jev` generik (validasi ketat, fallback demo)
- `public/index.html`, `style.css`, `app.js`: soal pilihan ganda, gaya instrumen lab kertas
- `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`: arah dan keputusan tertulis
- `anti-slop/audit-001-2026-09-26.md`: audit tampilan lama
