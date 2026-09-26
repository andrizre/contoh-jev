# DESIGN.md: Ruang Nilai Jev

> Arah visual produk. Ditulis agen sebagai draf (peringatan jujur: selera default agen cenderung monoton).
> User boleh mengganti seluruhnya. Filter anti-slop berlaku di atas arah ini.

## Design Read

Reading this as: alat penilai jawaban untuk pembelajar Indonesia, dengan bahasa visual
instrumen laboratorium malam, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

Tema gelap dipakai atas permintaan eksplisit pemilik produk (bukan default AI).

## Keputusan (satu baris alasan per keputusan, R-31)

- Revisi 2026-09-26: tema gelap malam (#12161d alas, #1b212b kartu, teks #ede8da 13.21:1) atas permintaan pemilik, menggantikan tema kertas. Aksen hijau terang #5ad2b3 (8.70:1) hanya tombol utama dan angka pemenang. Status bata #e8896f (6.34:1) dan oker #d9a93c (7.46:1) selalu ditemani label teks. Semua diverifikasi contrast-check.py.
- Judul Georgia serif: memberi karakter arsip/lab yang membedakan dari sans default AI. Isi system sans agar ringan tanpa unduhan font. Angka tabular-nums agar persen sejajar dan mudah dibaca.
- Motif identitas: meter jarum dan garis skala. Muncul di penggaris header dan panel hasil, tidak di tempat lain.
- Susunan instrumen, bukan kartu template: ledger masukan di kiri, panel baca di kanan, daftar definisi alur, tabel ledger riwayat. Tiap seksi beda komposisi (RHYTHM 2).
- Radius: 10px panel, 6px kontrol. Bukan pill, agar input terbaca sebagai input dan panel sebagai panel.
- Bayangan: hanya panel hasil yang terangkat (alasan elevasi: itu jawaban yang dibaca). Sisanya datar.
- Motion: hanya jarum meter dan lebar bar (alasan: menunjukkan perubahan nilai). Tanpa loop, tanpa confetti.
- CTA "Nilai jawaban": spesifik untuk aksi produk, bukan template generik.
- Header tidak lengket di HP (alasan: header lengket memakan seperempat layar kecil). Tetap lengket di desktop. Navigasi HP boleh geser horizontal satu baris.
- FAQ memakai details bawaan peramban (alasan: akordeon siap keyboard tanpa JS, tiap jawaban soal nyata pengguna bukan template).
- Lembar soal tepat di bawah intro ringkas (alasan: pengguna langsung eksekusi tanpa scroll panjang).
- Satu titik status menandai kondisi nyata Live/Demo (alasan: satu-satunya indikator status, tanpa glow dan denyut).
- Saklar tema terang/gelap oleh user (alasan: R-21, tidak ada alasan merek untuk mengunci satu tema; default ikut OS, pilihan tersimpan di localStorage, kedua palet lolos AA).
- Kebijakan gerbang (ambang skor, daftar alasan) tampil tertulis di hasil (alasan: pola harness resmi, Jev menasihati dan kode memutuskan, jejak audit terlihat user).
