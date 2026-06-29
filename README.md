# Quickstart Guide

## Frontend

1. Buka terminal
2. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
5. Buka browser dan akses URL yang ditampilkan oleh Vite.

> FE DONE

## Backend

1. Salin file `.env.example` ke `.env`:
   ```bash
   copy .env.example .env
   ```
2. Isi konfigurasi database di `.env`:
   ```bash
   DB_HOST=
   DB_PORT=
   DB_USER=
   DB_PASSWORD=
   ```
3. Jalankan Docker Compose dari folder project utama:
   ```bash
   docker compose up
   ```
4. Terapkan migrasi database dari folder backend:
   ```bash
   cd backend\migration
   sql-migrate up -env=local
   ```
   Atau, jika menggunakan Make:
   ```bash
   make migrate-up -env=local
   ```
5. Tambahkan data admin untuk login backoffice:
   ```bash
   cd ..
   go run cmd/seed-admin/main.go
   ```

Backend siap digunakan.

> Backend Done

## Daftar Jobdesk

| Nama                          | NIM        | Job       |
|------------------------------|------------|-----------|
| Arthur Tirtajaya Jehuda      | 10231019   | Backend   |
| Azhka Daeshawnda             | 10231027   | Frontend  |
| Norbertino Eurakha Nandatoti | 10231071   | DevOps    |
