# Arunika

Aplikasi pencatatan keuangan bisnis berbasis React, TypeScript, Vite, dan Supabase. Akun pengguna memiliki satu workspace privat untuk kontak dan catatan pemasukan/pengeluaran. Dashboard menghitung ringkasan hanya dari data yang tersimpan.

## Fitur yang tersedia

- Daftar dan masuk dengan email/kata sandi Supabase Auth.
- Workspace bisnis privat untuk setiap pemilik akun.
- Tambah, cari, dan hapus transaksi pemasukan/pengeluaran.
- Ringkasan pemasukan, pengeluaran, dan arus kas bersih berdasarkan transaksi.
- Tambah, cari, dan hapus kontak pelanggan/pemasok.
- Row Level Security (RLS) untuk membatasi data ke pemilik workspace.

Aplikasi belum menyediakan invoice, jurnal berpasangan, rekonsiliasi bank, perpajakan, atau laporan akuntansi resmi. Angka arus kas bersih bukan saldo rekening bank. Tinjau pencatatan dengan tenaga akuntansi sebelum dipakai untuk keputusan atau pelaporan resmi.

## Menyiapkan Supabase

1. Buat project di Supabase.
2. Buka **SQL Editor** pada project, lalu jalankan seluruh isi `supabase/migrations/20261025170000_initial_schema.sql`.
3. Buka **Project Settings → API**. Salin **Project URL** dan **anon/public key**. Jangan gunakan atau membagikan `service_role` key.
4. Buat file `.env.local` di root project berdasarkan `.env.example`, lalu isikan URL dan anon key project.
5. Pada **Authentication → URL Configuration**, tambahkan alamat pengembangan aplikasi ke daftar URL yang diizinkan.
6. Jalankan aplikasi dengan `npm install` lalu `npm run dev`.
7. Daftar menggunakan email dan kata sandi. Jika konfirmasi email diaktifkan, konfirmasi tautan email sebelum masuk. Setelah masuk, buat workspace bisnis.

Jangan commit `.env.local`. Variabel `VITE_*` tersedia pada browser; karena itu hanya anon/public key yang boleh digunakan. Keamanan akses database dilakukan melalui kebijakan RLS dalam migrasi.

## Menjalankan dan membangun

- `npm run dev` — server pengembangan.
- `npm run build` — pemeriksaan TypeScript dan build produksi.
- `npm run preview` — pratinjau build.

Jika aplikasi pernah berjalan sebelum mengubah `.env.local`, hentikan lalu mulai ulang server pengembangan agar konfigurasi baru dimuat.

## Menerbitkan website di GitHub Pages

Workflow GitHub Actions akan membangun dan menerbitkan website setiap ada push ke branch `main`.

1. Di repository GitHub, buka **Settings → Secrets and variables → Actions → New repository secret**.
2. Tambahkan secret `VITE_SUPABASE_URL` dengan Project URL Supabase dan `VITE_SUPABASE_ANON_KEY` dengan anon/public key. Jangan gunakan `service_role` key.
3. Buka **Settings → Pages** lalu atur **Build and deployment → Source** ke **GitHub Actions**.
4. Di Supabase, buka **Authentication → URL Configuration**. Atur Site URL menjadi `https://maz-proxy.github.io/in-get/` dan tambahkan URL tersebut ke daftar Redirect URLs.
5. Buka tab **Actions** di GitHub untuk melihat status workflow. Setelah sukses, website tersedia di `https://maz-proxy.github.io/in-get/`.

Jika workflow sudah berjalan sebelum secrets ditambahkan, buka **Actions**, pilih workflow deploy, lalu klik **Run workflow** untuk menerbitkan ulang.
