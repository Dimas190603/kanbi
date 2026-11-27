# Kanbi: Progress

Terakhir diperbarui: 2026-11-25

Papan Kanban yang dibangun tanpa framework dan tanpa library state management, untuk menunjukkan fundamental front-end engineering: state reaktif buatan sendiri, Command pattern (undo/redo), dan persistence offline.

Cara membaca: `[x]` selesai, `[ ]` belum. Item bertanda "(sebagian)" berarti ada bagian yang sudah dan ada yang belum.

## Ringkasan

- Fondasi (state, command, model, view) selesai dan bertest.
- CRUD card, drag & drop, undo/redo, dan persistence IndexedDB berjalan.
- Fitur Tier 2: 1 dari 7 (undo/redo).
- Belum ada: demo online, README, tampilan responsif, CI.

## Roadmap Fase

- [x] Fase 1: Fondasi (`Store`, `Command`, `CommandManager`)
- [x] Fase 2: Model dan render dasar
- [ ] Fase 3: Interaksi (sebagian): CRUD card selesai, CRUD kolom belum
- [ ] Fase 4: Drag & drop dan a11y (sebagian): drag native selesai, drag lewat keyboard belum
- [ ] Fase 5: Persistence dan performa (sebagian): IndexedDB selesai, pengukuran performa belum
- [ ] Fase 6: Polish (GSAP, README)

## Fitur Tier 2

- [x] Undo/Redo (tombol, Ctrl+Z / Ctrl+Y)
- [ ] WIP Limit
- [ ] Keyboard-first (pilih, pindah, drop lewat keyboard)
- [ ] Optimistic UI dan rollback
- [ ] Command Palette (Ctrl+K)
- [ ] Activity Log
- [ ] Search dan Filter

## Tier 1 (prasyarat)

- [x] Tambah, edit, hapus, dan pindah card (semua lewat Command, bisa di-undo)
- [x] Drag & drop antar kolom dan dalam kolom
- [x] Persistence lokal (IndexedDB)
- [ ] Tambah, ganti nama, dan hapus kolom
- [ ] Ganti nama board

## Definition of Done

- [ ] Semua fitur Tier 2 berjalan (1 dari 7)
- [x] Unit test lengkap: `Store`, `CommandManager`, semua command, dan persistence sudah; test model `Board`, `Card`, `Column` sudah
- [x] Tidak ada error/warning di console
- [ ] Skor Lighthouse baik (belum diukur),
      (Baseline (server dev, mobile): Performance 90, Accessibility 100, Best Practices 100, SEO 91. Ukur ulang di build production dan setelah deploy.)
- [x] Kerangka README (dwibahasa)
- [x] SEO dan a11y dasar: lang, meta description, title, main, h1
- [x] Adapter IndexedDB membuka ulang koneksi yang tertutup
- [ ] Responsif mobile, tablet, desktop
- [ ] Live demo ter-deploy
- [ ] README lengkap (tech stack, cara menjalankan, tautan demo, keputusan arsitektur)

Jumlah test saat ini: 91 Test

## Tooling dan Praktik

- [x] Vite, ESLint, Prettier, Vitest
- [x] Git dengan branch `main` / `dev` dan commit per unit kerja
- [x] Repo di-push ke GitHub (cek `git remote -v`)
- [ ] CI (GitHub Actions) dan deploy
- [ ] Migrasi ke TypeScript (sengaja ditunda sampai selesai belajar)

## Tugas Perapian

- [x] Hapus `Card.order` dari model (urutan sudah dimiliki `column.cardIds`)
- [x] Test untuk `Board`, `Card`, `Column`
- [x] Audit console browser
- [ ] Perbarui Charter: `EventBus` tidak dibuat karena `Store` dan `CommandManager` sudah punya observer sendiri
- [ ] Samakan bahasa UI

## Utang Teknis

- Setiap perubahan state merender ulang seluruh papan, sehingga teks yang sedang diketik di form tambah card hilang dan fokus keyboard jatuh ke `<body>` setelah render.
- Drag & drop native tidak mendukung layar sentuh (perlu Pointer Events).
- Tidak ada penanganan fokus setelah tambah, edit, atau hapus card.

## Keputusan Arsitektur

| Keputusan                                                                                     | Alasan                                                                                                                                          |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP: View hanya menggambar, Presenter (`app.js`) merakit command dan menangani event          | Logika terpisah dari tampilan sehingga bisa dites tanpa browser                                                                                 |
| Satu `Store` dengan observer buatan sendiri                                                   | Aliran data satu arah; seluruh UI bereaksi lewat `subscribe`; menunjukkan prinsip di balik React/Redux tanpa library                            |
| State immutable (spread + override, tidak pernah memutasi)                                    | Perubahan terdeteksi lewat perbandingan referensi dan undo/redo aman                                                                            |
| State ternormalisasi (`cards` dan `columns` per id, `cardIds` dan `columnOrder` untuk urutan) | Pencarian per id cepat dan memindahkan card tidak menyalin data                                                                                 |
| Setiap aksi adalah Command                                                                    | Aksi menjadi object yang tahu cara menjalankan dan membatalkan dirinya                                                                          |
| Undo/redo dipilih sebagai engineering showcase                                                | Tidak semua aplikasi Kanban punya undo penuh; dipilih karena memaksa desain command dan state yang disiplin                                     |
| Riwayat undo tidak disimpan setelah refresh                                                   | Command memegang referensi ke store dan tidak bisa diserialisasi; menjalankan ulang undo lama terhadap state yang berbeda berisiko merusak data |
| Command hanya menyimpan id dan selalu membaca state terbaru saat dijalankan                   | Snapshot kolom menjadi basi setelah command lain berjalan (bug nyata yang pernah terjadi)                                                       |
| Id dan timestamp dibuat sebelum command dibuat                                                | Redo menghasilkan data yang persis sama                                                                                                         |
| Presenter tidak membuat command kalau tidak ada perubahan                                     | `CommandManager.execute` selalu mengisi undoStack dan mengosongkan redoStack                                                                    |
| Posisi sisip drag dihitung terhadap daftar tanpa card yang di-drag                            | Cocok dengan konvensi `toIndex` pada command dan menghindari off-by-one                                                                         |
| Drag & drop native HTML5                                                                      | Tanpa library; batasnya: tidak ada dukungan layar sentuh                                                                                        |
| Edit card lewat `<dialog>` di luar `#board`                                                   | Render ulang papan tidak menghapus form yang sedang diisi; focus trap dan tombol Escape bawaan browser                                          |
| Persistence IndexedDB tanpa library, debounce 300 ms, flush saat `visibilitychange`           | Dipilih sebagai showcase; flush mengurangi risiko kehilangan perubahan terakhir (best effort)                                                   |
| Gagal menyimpan tidak mematikan aplikasi dan user diberi tahu                                 | Tugas utama user tidak boleh terhalang masalah penyimpanan                                                                                      |
| Data tersimpan yang tidak valid dicadangkan ke `board-backup`                                 | Jangan menimpa data yang mungkin masih bisa dipulihkan                                                                                          |
| Dua tab saling menimpa (yang terakhir menang)                                                 | Keterbatasan yang diketahui dan diterima untuk saat ini                                                                                         |

## Urutan Berikutnya

1. Perapian: push ke GitHub, test model, audit console, kerangka README
2. `EditColumnCommand` (ganti nama dan atur `wipLimit`)
3. WIP Limit
4. Deploy awal dan CI
5. Keyboard-first
