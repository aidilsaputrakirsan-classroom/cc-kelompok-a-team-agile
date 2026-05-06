# API Contract

Dokumen ini mendefinisikan kontrak API untuk setiap page di aplikasi Sistem Informasi Harga Pangan. Karena aplikasi saat ini masih berbasis front-end first, dokumen ini berfungsi sebagai spesifikasi target untuk backend atau layer API di masa depan.

## Prinsip Kontrak

Setiap endpoint di bawah ini mengikuti komponen standar berikut:

- `Endpoint`: path resource yang dipanggil.
- `HTTP Method`: operasi yang diizinkan.
- `Request Format`: struktur payload atau query string.
- `Response Format`: struktur data yang dikembalikan.
- `Status Codes`: kode HTTP untuk sukses dan gagal.
- `Error Handling`: format error yang seragam.

## Konvensi Umum

### Header

- `Content-Type: application/json`
- `Authorization: Bearer <token>` untuk endpoint protected

### Format Response Sukses

```json
{
  "data": {},
  "message": "Optional message",
  "meta": {
    "total": 0,
    "page": 1,
    "perPage": 20
  }
}
```

### Format Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field nama wajib diisi",
    "details": [
      {
        "field": "nama",
        "message": "Wajib diisi"
      }
    ]
  }
}
```

### Status Codes Umum

- `200 OK`: request berhasil
- `201 Created`: resource berhasil dibuat
- `400 Bad Request`: payload tidak valid
- `401 Unauthorized`: token tidak ada atau tidak valid
- `403 Forbidden`: akses tidak diizinkan
- `404 Not Found`: resource tidak ditemukan
- `409 Conflict`: data duplikat atau konflik state
- `422 Unprocessable Entity`: validasi gagal
- `500 Internal Server Error`: kesalahan server

## Skema Data Inti

### Pasar

```json
{
  "id": "psr-001",
  "nama": "Pasar Andir",
  "longitude": 107.5731,
  "latitude": -6.9147,
  "alamat": "Jl. Andir No. 1, Bandung",
  "is_active": 1
}
```

### Komoditas

```json
{
  "id": "kom-001",
  "nama": "Beras Premium",
  "satuan_dasar": "kg",
  "gambar": ""
}
```

### Tempat Usaha

```json
{
  "id": "tu-001",
  "nama": "Toko Berkah Jaya",
  "nama_pemilik": "H. Ahmad",
  "nama_narahubung": "H. Ahmad",
  "nomor_narahubung": "081234567890",
  "berjualan_sejak": "2015-03-10",
  "is_active": 1,
  "pasar_id": "psr-001"
}
```

### Komoditas Dijual

```json
{
  "id": "kd-001",
  "tempat_usaha_id": "tu-001",
  "komoditas_id": "kom-001",
  "harga_normal": 14000,
  "harga_mahal": 16000,
  "satuan_stok": "kg",
  "nilai_stok": 500,
  "nilai_periode": 1,
  "periode_unit": "minggu",
  "lokasi_supplier": "Subang",
  "pola_distribusi": "pembelian_produsen",
  "standardized_stock_periode": 71.4,
  "is_active": true
}
```

### Harga Rutin

```json
{
  "id": "hr-001",
  "nama_enumerator": "Andi Surveyor",
  "tanggal": "2026-05-04",
  "pasar_id": "psr-001",
  "komoditas_id": "kom-001",
  "kelas_komoditas": "besar",
  "tempat_usaha_id": "tu-001",
  "harga_input": 15500,
  "jumlah_input": 1,
  "satuan_input": "kg",
  "harga": 15500,
  "status": "finalisasi"
}
```

### Harga Pelaporan

```json
{
  "id": "hp-001",
  "tanggal": "2026-05-04",
  "pasar_id": "psr-001",
  "komoditas_id": "kom-001",
  "harga_rata_rata": 15400,
  "harga_besar": 15500,
  "harga_menengah": 15300,
  "harga_kecil": 15400
}
```

## Contract Per Page

### 1. Landing Page

**Route:** `/`

**Access:** Public

**Fitur utama:** pencarian global, dropdown card list (komoditas/pasar/tempat usaha), detail komoditas, trend harga komoditas terpilih, ringkasan harga komoditas keseluruhan, map pasar, dan detail tempat usaha per pasar.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/public/search` | `GET` | Pencarian komoditas (landing search) | `200 OK` |
| `/api/public/komoditas` | `GET` | Dropdown list komoditas (card list) | `200 OK` |
| `/api/public/komoditas/:id/summary` | `GET` | Detail ringkasan komoditas (avg/min/max/latest) | `200 OK`, `404 Not Found` |
| `/api/public/komoditas/:id/trend` | `GET` | Tren harga komoditas terpilih | `200 OK` |
| `/api/public/komoditas/overview` | `GET` | Harga komoditas keseluruhan (avg/min/max) | `200 OK` |
| `/api/public/pasar` | `GET` | Dropdown list pasar aktif | `200 OK` |
| `/api/public/pasar/map` | `GET` | Data pasar dengan koordinat untuk map | `200 OK` |
| `/api/public/pasar/:id` | `GET` | Detail pasar untuk landing (nama, alamat, meta) | `200 OK`, `404 Not Found` |
| `/api/public/pasar/:id/komoditas` | `GET` | List komoditas per pasar (harga terbaru) | `200 OK` |
| `/api/public/pasar/:id/komoditas/:komoditasId` | `GET` | Detail komoditas per pasar | `200 OK`, `404 Not Found` |
| `/api/public/pasar/:id/tempat-usaha` | `GET` | List tempat usaha per pasar | `200 OK` |
| `/api/public/tempat-usaha` | `GET` | Dropdown list tempat usaha aktif | `200 OK` |
| `/api/public/tempat-usaha/:id/komoditas` | `GET` | List komoditas per tempat usaha | `200 OK` |
| `/api/public/tempat-usaha/:id/komoditas/:komoditasId` | `GET` | Detail komoditas per tempat usaha | `200 OK`, `404 Not Found` |

#### Request Format (Query)

```text
/api/public/komoditas?search=beras&limit=8
/api/public/komoditas/:id/trend?from=2026-04-01&to=2026-05-04
/api/public/pasar?active=1
/api/public/pasar/:id/komoditas?limit=8
/api/public/tempat-usaha?active=1
```

#### Request Format (Query Detail)

```text
/api/public/komoditas/:id/summary?include=latest,range
/api/public/komoditas/overview?limit=12&sort=avg_desc
/api/public/pasar/map?active=1
/api/public/pasar/:id/tempat-usaha?active=1&limit=20
/api/public/tempat-usaha/:id/komoditas?active=1&limit=8
/api/public/pasar/:id/komoditas/:komoditasId?include=trend
/api/public/tempat-usaha/:id/komoditas/:komoditasId?include=trend
```

#### Response yang Diharapkan (Contoh Map Pasar)

```json
{
  "data": [
    {
      "id": "psr-001",
      "nama": "Pasar Andir",
      "longitude": 107.5731,
      "latitude": -6.9147,
      "alamat": "Jl. Andir No. 1, Bandung",
      "is_active": 1
    }
  ]
}
```

#### Response Tren Komoditas (Contoh)

```json
{
  "data": [
    { "tanggal": "2026-04-28", "harga_rata_rata": 15400 },
    { "tanggal": "2026-05-01", "harga_rata_rata": 15600 },
    { "tanggal": "2026-05-04", "harga_rata_rata": 15500 }
  ]
}
```

#### Response Ringkasan Komoditas (Contoh)

```json
{
  "data": {
    "komoditas_id": "kom-001",
    "latest": { "tanggal": "2026-05-04", "harga_rata_rata": 15500 },
    "avg": 15350,
    "min": 14900,
    "max": 15800
  }
}
```

#### Response Tempat Usaha per Pasar (Contoh)

```json
{
  "data": [
    {
      "id": "tu-001",
      "nama": "Toko Berkah Jaya",
      "komoditas": [
        {
          "id": "kd-001",
          "komoditas_id": "kom-001",
          "nama": "Beras Premium",
          "satuan": "kg",
          "harga": 15500
        }
      ]
    }
  ]
}
```

### 2. Login Page

**Route:** `/login`

**Access:** Public

**Fitur utama:** autentikasi pengguna.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/auth/login` | `POST` | Login pengguna | `200 OK`, `401 Unauthorized` |

#### Request Format

```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

#### Response Format

```json
{
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "usr-001",
      "email": "admin@admin.com",
      "name": "Admin",
      "role": "admin"
    }
  }
}
```

### 3. Dashboard Page

**Route:** `/dashboard`

**Access:** Protected

**Fitur utama:** statistik ringkas, tren harga, dan ekspor laporan.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/dashboard/summary` | `GET` | Mengambil ringkasan dashboard | `200 OK`, `401 Unauthorized` |
| `/api/harga-pelaporan` | `GET` | Mengambil data tren harga per komoditas | `200 OK` |

#### Request Format (Query)

```text
/api/dashboard/summary?pasarId=all
/api/harga-pelaporan?pasarId=all&from=2026-05-01&to=2026-05-04
```

#### Response yang Diharapkan

```json
{
  "data": {
    "pasarAktif": 4,
    "komoditas": 8,
    "tempatUsahaAktif": 11,
    "hargaPelaporanTerbaru": []
  }
}
```

### 4. Pasar Page

**Route:** `/pasar`

**Access:** Protected

**Fitur utama:** CRUD pasar, pencarian, filter status, sorting, impor/ekspor CSV.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/pasar` | `GET` | Ambil daftar pasar (search, status, sort) | `200 OK` |
| `/api/pasar` | `POST` | Buat pasar baru | `201 Created`, `422 Unprocessable Entity` |
| `/api/pasar/:id` | `PUT` | Ubah pasar | `200 OK`, `404 Not Found` |
| `/api/pasar/:id` | `DELETE` | Hapus pasar | `200 OK`, `404 Not Found` |

#### Request Format Create

```json
{
  "nama": "Pasar Baru",
  "longitude": 107.5,
  "latitude": -6.9,
  "alamat": "Jl. Contoh No. 1",
  "is_active": 1
}
```

#### Request Format (Query List)

```text
/api/pasar?search=bandung&status=active&sortBy=nama&sortDir=asc
```

### 5. Komoditas Page

**Route:** `/komoditas`

**Access:** Protected

**Fitur utama:** CRUD komoditas, unggah gambar, filter satuan, impor/ekspor CSV.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/komoditas` | `GET` | Ambil daftar komoditas (search, satuan, sort) | `200 OK` |
| `/api/komoditas` | `POST` | Tambah komoditas | `201 Created` |
| `/api/komoditas/:id` | `PUT` | Ubah komoditas | `200 OK` |
| `/api/komoditas/:id` | `DELETE` | Hapus komoditas | `200 OK` |

#### Request Format Create

```json
{
  "nama": "Beras Premium",
  "satuan_dasar": "kg",
  "gambar": "data:image/png;base64,..."
}
```

#### Request Format (Query List)

```text
/api/komoditas?search=beras&satuanDasar=kg&sortBy=nama&sortDir=asc
```

### 6. Tempat Usaha Page

**Route:** `/tempat-usaha`

**Access:** Protected

**Fitur utama:** CRUD tempat usaha, sub-CRUD komoditas dijual, klasifikasi kelas otomatis, filter, import CSV.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/tempat-usaha` | `GET` | Ambil daftar tempat usaha (search, pasar, status, sort) | `200 OK` |
| `/api/tempat-usaha` | `POST` | Tambah tempat usaha | `201 Created` |
| `/api/tempat-usaha/:id` | `PUT` | Ubah tempat usaha | `200 OK` |
| `/api/tempat-usaha/:id` | `DELETE` | Hapus tempat usaha | `200 OK` |
| `/api/tempat-usaha/:id/komoditas-dijual` | `GET` | Ambil komoditas yang dijual | `200 OK` |
| `/api/tempat-usaha/:id/komoditas-dijual` | `POST` | Tambah komoditas dijual | `201 Created` |
| `/api/komoditas-dijual/:id` | `PUT` | Ubah komoditas dijual | `200 OK` |
| `/api/komoditas-dijual/:id` | `DELETE` | Hapus komoditas dijual | `200 OK` |

#### Request Format Create Tempat Usaha

```json
{
  "nama": "Toko Berkah Jaya",
  "nama_pemilik": "H. Ahmad",
  "nama_narahubung": "H. Ahmad",
  "nomor_narahubung": "081234567890",
  "berjualan_sejak": "2015-03-10",
  "is_active": 1,
  "pasar_id": "psr-001"
}
```

#### Request Format Create Komoditas Dijual

```json
{
  "tempat_usaha_id": "tu-001",
  "komoditas_id": "kom-001",
  "harga_normal": 14000,
  "harga_mahal": 16000,
  "satuan_stok": "kg",
  "nilai_stok": 500,
  "nilai_periode": 1,
  "periode_unit": "minggu",
  "lokasi_supplier": "Subang",
  "pola_distribusi": "pembelian_produsen",
  "is_active": true
}
```

#### Request Format (Query List)

```text
/api/tempat-usaha?search=berkah&pasarId=psr-001&status=active&sortBy=nama&sortDir=asc
/api/tempat-usaha/:id/komoditas-dijual?status=active
```

#### Data Dropdown yang Dibutuhkan

- `GET /api/pasar` untuk pilihan pasar
- `GET /api/komoditas` untuk pilihan komoditas

### 7. Harga Rutin Page

**Route:** `/harga-rutin`

**Access:** Protected

**Fitur utama:** input harga rutin per tiga kelas, draft/finalisasi, signature, review data, validasi sampel.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/harga-rutin` | `GET` | Ambil daftar harga rutin (filter pasar/tanggal/status) | `200 OK` |
| `/api/harga-rutin/groups` | `GET` | Ambil grup data berdasarkan tanggal + pasar + enumerator | `200 OK` |
| `/api/harga-rutin` | `POST` | Simpan data harga rutin | `201 Created` |
| `/api/harga-rutin/:id` | `PUT` | Ubah harga rutin | `200 OK` |
| `/api/harga-rutin/:id` | `DELETE` | Hapus harga rutin | `200 OK` |
| `/api/harga-rutin/groups/:key/finalize` | `PATCH` | Finalisasi satu grup input | `200 OK`, `409 Conflict` |

#### Data Dropdown yang Dibutuhkan (Form Harga Rutin)

- `GET /api/pasar` untuk pilihan pasar
- `GET /api/komoditas` untuk pilihan komoditas
- `GET /api/tempat-usaha?pasarId=...` untuk pilihan tempat usaha per pasar
- `GET /api/komoditas-dijual?pasarId=...&komoditasId=...` untuk validasi komoditas dijual per pasar

#### Request Format (Query List)

```text
/api/harga-rutin?pasarId=psr-001&tanggal=2026-05-04&status=finalisasi
/api/harga-rutin/groups?pasarId=psr-001&tanggal=2026-05-04
```

#### Request Format Create

```json
{
  "nama_enumerator": "Andi Surveyor",
  "tanggal": "2026-05-04",
  "pasar_id": "psr-001",
  "komoditas_id": "kom-001",
  "kelas_komoditas": "besar",
  "tempat_usaha_id": "tu-001",
  "harga_input": 15500,
  "jumlah_input": 1,
  "satuan_input": "kg",
  "harga": 15500,
  "status": "dalam_proses"
}
```

#### Request Format Finalize Group

```text
/api/harga-rutin/groups/:key/finalize
```

### 8. Harga Pelaporan Page

**Route:** `/harga-pelaporan`

**Access:** Protected

**Fitur utama:** daftar agregasi harga, filter, sorting, detail, ekspor CSV/PDF.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/harga-pelaporan` | `GET` | Ambil data pelaporan teragregasi (filter pasar/tanggal) | `200 OK` |
| `/api/harga-pelaporan/:id` | `GET` | Ambil detail satu data pelaporan | `200 OK`, `404 Not Found` |

#### Response yang Diharapkan

```json
{
  "data": [
    {
      "id": "hp-001",
      "tanggal": "2026-05-04",
      "pasar_id": "psr-001",
      "komoditas_id": "kom-001",
      "harga_rata_rata": 15400,
      "harga_besar": 15500,
      "harga_menengah": 15300,
      "harga_kecil": 15400
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "perPage": 20
  }
}
```

#### Request Format (Query List)

```text
/api/harga-pelaporan?pasarId=psr-001&from=2026-05-01&to=2026-05-04
```

### 9. Public Komoditas Dashboard

**Route:** `/public/komoditas`

**Access:** Public

**Fitur utama:** ringkasan publik harga komoditas, pencarian, filter pasar.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/public/komoditas` | `GET` | Ambil daftar komoditas publik (search, pasar) | `200 OK` |
| `/api/public/komoditas/summary` | `GET` | Ambil ringkasan trend komoditas | `200 OK` |

#### Request Format (Query List)

```text
/api/public/komoditas?search=beras&pasarId=psr-001
/api/public/komoditas/summary?pasarId=psr-001
```

### 10. Public Komoditas Detail

**Route:** `/public/komoditas/:id`

**Access:** Public

**Fitur utama:** detail komoditas, histori harga, distribusi per pasar.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/public/komoditas/:id` | `GET` | Ambil detail komoditas publik | `200 OK`, `404 Not Found` |
| `/api/public/komoditas/:id/pasar` | `GET` | Ambil perbandingan harga per pasar | `200 OK` |
| `/api/public/komoditas/:id/trend` | `GET` | Histori harga untuk grafik | `200 OK` |

#### Request Format (Query Detail)

```text
/api/public/komoditas/:id?include=latest,range
/api/public/komoditas/:id/pasar?limit=10
/api/public/komoditas/:id/trend?from=2026-04-01&to=2026-05-04
```

### 11. Public Tempat Usaha

**Route:** `/public/tempat-usaha/:id`

**Access:** Public

**Fitur utama:** detail tempat usaha, komoditas yang dijual, harga terbaru.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| `/api/public/tempat-usaha/:id` | `GET` | Ambil detail tempat usaha publik | `200 OK`, `404 Not Found` |
| `/api/public/tempat-usaha/:id/harga` | `GET` | Ambil harga terbaru per komoditas | `200 OK` |
| `/api/public/tempat-usaha/:id/komoditas` | `GET` | Ambil komoditas aktif di tempat usaha | `200 OK` |

#### Request Format (Query Detail)

```text
/api/public/tempat-usaha/:id?include=pasar
/api/public/tempat-usaha/:id/harga?limit=12
/api/public/tempat-usaha/:id/komoditas?active=1
```

## Error Handling Standar

Semua endpoint harus memakai format error yang sama agar client dapat menanganinya dengan konsisten.

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Data tidak ditemukan",
    "details": []
  }
}
```

### Contoh Kode Error per Kasus

- `VALIDATION_ERROR`: input tidak lolos validasi
- `UNAUTHORIZED`: login diperlukan atau token invalid
- `FORBIDDEN`: user tidak punya akses
- `NOT_FOUND`: resource tidak ditemukan
- `CONFLICT`: data bentrok dengan state yang ada

## Catatan Implementasi

- Saat ini aplikasi masih memakai localStorage, jadi dokumen ini adalah target contract, bukan implementasi backend aktif.
- Endpoint protected harus memverifikasi token sebelum mengembalikan data.
- Untuk halaman list, disarankan dukungan pagination sejak awal agar response tetap konsisten dengan format `meta`.
