# PRD.md: Ruang Nilai Jev

## 1. Problem
Belajar probabilitas itu abstrak kalau cuma rumus. Pemain kuis, siswa, dan kreator konten butuh cara interaktif untuk menguji "seberapa benar jawabanku?" dan melihat probabilitasnya secara visual. Jev (System One model dari TypeSafe AI, gratis via OpenCode Zen `jev-1.13-free`) bisa menilai kebenaran tanpa generate teks panjang, pas untuk ini.

## 2. Target users
| User | Goal | Pain today |
|------|------|------------|
| Siswa / pembelajar | Uji jawaban soal & lihat probabilitas benar < 5 detik | Kunci jawaban statis, tidak ada nuansa "sebagian benar" |
| Kreator kuis | Buat pertanyaan + cek jawaban peserta cepat | Harus nilai manual satu-satu |
| Penasaran AI | Coba model Jev gratis via OpenCode Zen | Docs tersebar, belum ada demo visual berbahasa Indonesia |

## 3. Goals dan non-goals
- **Goals (v1):** User input Pertanyaan + Jawaban → muncul probabilitas benar (noul 0-100%), kualitas (score), verdict (choice); ada Mode Demo tanpa API key; riwayat + visual gauge; 100% jalan lokal via `node server.js`.
- **Goals (v2, berjalan):** Meja kerja 6 modul (uji jawaban, triage tiket, moderasi, skor prospek, gerbang aksi, konsol bebas) lewat satu endpoint `POST /api/jev` yang meneruskan state + typed questions ke Jev; kebijakan gerbang tinggal di kode agar bisa diaudit.
- **Non-goals:** Tidak ada login/database akun di v1; tidak ada generate soal otomatis oleh LLM; tidak simpan API key di browser.

## 4. User stories
| ID | As a... | I want... | So that... | Priority |
|----|---------|-----------|------------|----------|
| US-01 | Pengunjung | Input pertanyaan + jawabanku lalu klik "Cek Probabilitas" | Tahu seberapa benar jawabanku + alasannya | Must |
| US-02 | Pengunjung tanpa API key | Tetap bisa coba Mode Demo | Paham alur Jev sebelum daftar key | Must |
| US-03 | Pemilik API key | Tempel OpenCode Zen key sekali via `.env` | Dapat penilaian Jev asli (kalibrasi) | Must |
| US-04 | Pengunjung | Lihat riwayat & contoh 1-klik | Eksplorasi cepat & bandingkan | Should |

## 5. Functional requirements
- **FR-01:** `POST /api/verify` menerima `{question, answer}` tervalidasi, memanggil `https://opencode.ai/zen/v1/systemone` dengan model `jev-1.13-free`, mengembalikan `{noul, score, choice, probabilities, confidence, mode}`.
- **FR-02:** Frontend menampilkan gauge animasi, bar probabilitas per verdict, badge confidence, dan penjelasan alur Jev (state → questions → answers).
- **FR-03:** Mode Demo aktif otomatis bila `OPENCODE_API_KEY` kosong / fetch gagal, dengan label jelas "DEMO".
- **FR-04:** Validasi panjang input, error user-safe bahasa Indonesia, empty/loading/error states di semua view.

## 6. Acceptance criteria
- **US-01:** Given halaman terbuka, when isi pertanyaan+jawaban valid lalu klik cek, then gauge 0→nilai beranimasi + verdict muncul < 8 detik (atau error jelas).
- **US-02:** Given tanpa `.env`, when klik cek, then hasil berlabel DEMO tetap muncul.
- **US-03:** Given `.env` berisi key valid, when klik cek, then response `mode:"live"` dan `usage` tampil.

## 7. Open questions
- [ ] Butuh simpan riwayat ke localStorage saja atau backend? (v1: localStorage, 2026-09-26)
