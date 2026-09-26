# DESIGN.md: Ruang Nilai Jev

> Arah visual produk. Ditulis agen sebagai draf (peringatan jujur: selera default agen cenderung monoton).
> User boleh mengganti seluruhnya. Filter anti-slop berlaku di atas arah ini.

## Design Read

Reading this as: alat penilai jawaban untuk pembelajar Indonesia, dengan bahasa visual
instrumen laboratorium kertas, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Keputusan (satu baris alasan per keputusan, R-31)

- Tema kertas terang, bukan dark: produknya alat baca dan belajar, dibaca lama seperti lembar kerja.
- Palet inti: kertas #F7F3EA (alas netral), tinta #1E2430 (teks, 14.04:1), aksen hijau lab #0F6B5C (5.79:1, hanya tombol utama dan angka vonis agar aksennya jatuh di momen kunci).
- Warna status fungsional, selalu ditemani label teks: benar = hijau lab, salah = bata #A63A2B (5.81:1), sebagian = oker #8A5E00 (5.15:1). Teks sekunder #5A6172 (5.60:1). Semua lolos AA, diverifikasi contrast-check.py.
- Judul Georgia serif: memberi karakter arsip/lab yang membedakan dari sans default AI. Isi system sans agar ringan tanpa unduhan font. Angka tabular-nums agar persen sejajar dan mudah dibaca.
- Motif identitas: meter jarum dan garis skala. Muncul di penggaris header dan panel hasil, tidak di tempat lain.
- Susunan instrumen, bukan kartu template: ledger masukan di kiri, panel baca di kanan, daftar definisi alur, tabel ledger riwayat. Tiap seksi beda komposisi (RHYTHM 2).
- Radius: 10px panel, 6px kontrol. Bukan pill, agar input terbaca sebagai input dan panel sebagai panel.
- Bayangan: hanya panel hasil yang terangkat (alasan elevasi: itu jawaban yang dibaca). Sisanya datar.
- Motion: hanya jarum meter dan lebar bar (alasan: menunjukkan perubahan nilai). Tanpa loop, tanpa confetti.
- CTA "Nilai jawaban": spesifik untuk aksi produk, bukan template generik.
- Tab meja kerja memakai radio asli dan label (alasan: ganti panel murni CSS, tetap jalan tanpa JS, keyboard bawaan peramban). Satu titik status menandai kondisi nyata (Live/Demo). Tanpa glow, tanpa denyut.
- Kebijakan gerbang (ambang skor, daftar alasan) tampil tertulis di hasil (alasan: pola harness resmi, Jev menasihati dan kode memutuskan, jejak audit terlihat user).
