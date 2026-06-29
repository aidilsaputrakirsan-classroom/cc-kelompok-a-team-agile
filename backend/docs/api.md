# SIHP API Contract Documentation

Sistem Informasi Harga Pangan - API Version v1 - Last Updated: May 2026

## Table of Contents

1. Overview
2. Quick Start
3. Authentication
4. Base URLs
5. Response Format
6. API Endpoints
7. Contract Per Page
8. Data Models and Enums
9. Error Codes
10. Implementation Status
11. Frontend Page-to-Endpoint Mapping

## Overview

SIHP is a system for monitoring and reporting food commodity prices across local markets in Indonesia. The API provides REST endpoints for market data, commodities, business locations, and price tracking.

| Property | Value |
| --- | --- |
| API Version | v1 |
| Protocol | HTTP/HTTPS |
| Content-Type | application/json |
| Authentication | Bearer Token (JWT) |
| Data Persistence | API backend and localStorage prototype |

## Quick Start

```bash
# Get all markets (public)
curl https://api.sihp.example.com/v1/pasar

# Login for JWT token
curl -X POST https://api.sihp.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Use token for protected endpoints
curl https://api.sihp.example.com/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Authentication

### Authorization Header

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Login Endpoint

| Method | Endpoint | Auth Required |
| --- | --- | --- |
| POST | /v1/auth/login | No |

Request Body:

```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}
```

Success Response (200):

```json
{
  "success": true,
  "code": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@admin.com"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "Bearer"
    }
  }
}
```

Error Responses:

- 400 - Invalid request body or email format
- 401 - Invalid email or password

## Base URLs

| Environment | URL |
| --- | --- |
| Production | https://api.sihp.example.com |
| Development | http://127.0.0.1:8080 |
| Staging | https://staging-api.sihp.example.com |

## Response Format

### Success Response Envelope

```json
{
  "success": true,
  "code": 200,
  "message": "Operation successful",
  "data": {
    "id": "value",
    "name": "value"
  }
}
```

### Paginated Response Envelope

```json
{
  "success": true,
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": "value"
    }
  ],
  "meta": {
    "offset": 0,
    "limit": 10,
    "count": 150,
    "order_by": "+created_at"
  }
}
```

### Error Response Envelope

```json
{
  "success": false,
  "code": 400,
  "message": "Error message describing what went wrong",
  "stacktrace": null
}
```

Note: stacktrace is only included in development environments.

## API Endpoints

### Auth

#### POST Login

POST /v1/auth/login

Auth Required: No

### Users

#### POST Create User

POST /v1/users

Auth Required: Yes (Admin)

Request:

```json
{
  "name": "string (required)",
  "email": "user@example.com (required, valid email)",
  "metadata": {
    "sex": "male | female (required)",
    "address": "string (required, max 255 chars)",
    "phone": "+62812345678 (required, E.164 format)"
  }
}
```

#### GET User by ID

GET /v1/users/:id

Auth Required: Yes

#### GET Users List

GET /v1/users

Auth Required: Yes

Query Parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| ids | string | Comma-separated UUIDs |
| name | string | Partial name match |
| email | string | Partial email match |
| status | int | 0 = inactive, 1 = active |
| sex | string | male or female |
| address | string | Filter by address |
| phone | string | Filter by phone |
| include_deleted | bool | Include soft-deleted users |
| show_count | bool | Include total count |
| offset | int | Default: 0 |
| limit | int | Default: 10, Max: 100 |
| order_by | string | Example: +name, -created_at |
| created_at_gte | timestamp | Created after date |
| created_at_lte | timestamp | Created before date |
| updated_at_gte | timestamp | Updated after date |
| updated_at_lte | timestamp | Updated before date |

#### PUT Update User

PUT /v1/users/:id

Auth Required: Yes

#### DELETE User

DELETE /v1/users/:id

Auth Required: Yes

### Pasar (Markets)

#### GET Markets List

GET /v1/pasar

Auth Required: No (Public)

#### POST Create Market

POST /v1/pasar

Auth Required: Yes (Admin)

### Komoditas (Commodities)

#### GET Commodities List

GET /v1/komoditas

Auth Required: No (Public)

#### POST Create Commodity

POST /v1/komoditas

Auth Required: Yes (Admin)

### Tempat Usaha (Business Places)

#### GET Business Places List

GET /v1/tempat-usaha

Auth Required: Yes

#### POST Create Business Place

POST /v1/tempat-usaha

Auth Required: Yes (Admin)

### Komoditas Dijual (Commodities Sold)

#### GET Commodities Sold List

GET /v1/komoditas-dijual

Auth Required: Yes

#### POST Create Commodity Sold

POST /v1/komoditas-dijual

Auth Required: Yes (Admin)

### Harga Rutin (Routine Prices)

#### GET Routine Prices List

GET /v1/harga-rutin

Auth Required: Yes

#### POST Create Routine Price

POST /v1/harga-rutin

Auth Required: Yes

### Harga Pelaporan (Reporting Prices)

#### GET Reporting Prices

GET /v1/harga-pelaporan

Auth Required: Yes

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
| /v1/public/search | GET | Pencarian komoditas (landing search) | 200 OK |
| /v1/public/komoditas | GET | Dropdown list komoditas (card list) | 200 OK |
| /v1/public/komoditas/:id/summary | GET | Detail ringkasan komoditas (avg/min/max/latest) | 200 OK, 404 Not Found |
| /v1/public/komoditas/:id/trend | GET | Tren harga komoditas terpilih | 200 OK |
| /v1/public/komoditas/overview | GET | Harga komoditas keseluruhan (avg/min/max) | 200 OK |
| /v1/public/pasar | GET | Dropdown list pasar aktif | 200 OK |
| /v1/public/pasar/map | GET | Data pasar dengan koordinat untuk map | 200 OK |
| /v1/public/pasar/:id | GET | Detail pasar untuk landing (nama, alamat, meta) | 200 OK, 404 Not Found |
| /v1/public/pasar/:id/komoditas | GET | List komoditas per pasar (harga terbaru) | 200 OK |
| /v1/public/pasar/:id/komoditas/:komoditas_id | GET | Detail komoditas per pasar | 200 OK, 404 Not Found |
| /v1/public/pasar/:id/tempat-usaha | GET | List tempat usaha per pasar | 200 OK |
| /v1/public/tempat-usaha | GET | Dropdown list tempat usaha aktif | 200 OK |
| /v1/public/tempat-usaha/:id/komoditas | GET | List komoditas per tempat usaha | 200 OK |
| /v1/public/tempat-usaha/:id/komoditas/:komoditas_id | GET | Detail komoditas per tempat usaha | 200 OK, 404 Not Found |

#### Request Format (Query)

```text
/v1/public/komoditas?search=beras&limit=8
/v1/public/komoditas/:id/trend?from=2026-04-01&to=2026-05-04
/v1/public/pasar?is_active=1
/v1/public/pasar/:id/komoditas?limit=8
/v1/public/tempat-usaha?is_active=1
```

#### Request Format (Query Detail)

```text
/v1/public/komoditas/:id/summary?include=latest,range
/v1/public/komoditas/overview?limit=12&sort=avg_desc
/v1/public/pasar/map?is_active=1
/v1/public/pasar/:id/tempat-usaha?is_active=1&limit=20
/v1/public/tempat-usaha/:id/komoditas?is_active=1&limit=8
/v1/public/pasar/:id/komoditas/:komoditas_id?include=trend
/v1/public/tempat-usaha/:id/komoditas/:komoditas_id?include=trend
```

#### Response yang Diharapkan (Contoh Map Pasar)

```json
{
  "success": true,
  "code": 200,
  "message": "Success",
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
  "success": true,
  "code": 200,
  "message": "Success",
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
  "success": true,
  "code": 200,
  "message": "Success",
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
  "success": true,
  "code": 200,
  "message": "Success",
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
| /v1/auth/login | POST | Login pengguna | 200 OK, 401 Unauthorized |

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
  "success": true,
  "code": 200,
  "message": "Login berhasil",
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
| /v1/dashboard/summary | GET | Mengambil ringkasan dashboard | 200 OK, 401 Unauthorized |
| /v1/harga-pelaporan | GET | Mengambil data tren harga per komoditas | 200 OK |

#### Request Format (Query)

```text
/v1/dashboard/summary?pasar_id=all
/v1/harga-pelaporan?pasar_id=all&from=2026-05-01&to=2026-05-04
```

#### Response yang Diharapkan

```json
{
  "success": true,
  "code": 200,
  "message": "Success",
  "data": {
    "pasar_aktif": 4,
    "komoditas": 8,
    "tempat_usaha_aktif": 11,
    "harga_pelaporan_terbaru": []
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
| /v1/pasar | GET | Ambil daftar pasar (search, status, sort) | 200 OK |
| /v1/pasar | POST | Buat pasar baru | 201 Created, 422 Unprocessable Entity |
| /v1/pasar/:id | PUT | Ubah pasar | 200 OK, 404 Not Found |
| /v1/pasar/:id | DELETE | Hapus pasar | 200 OK, 404 Not Found |

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
/v1/pasar?search=bandung&status=active&sort_by=nama&sort_dir=asc
```

### 5. Komoditas Page

**Route:** `/komoditas`

**Access:** Protected

**Fitur utama:** CRUD komoditas, unggah gambar, filter satuan, impor/ekspor CSV.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| /v1/komoditas | GET | Ambil daftar komoditas (search, satuan, sort) | 200 OK |
| /v1/komoditas | POST | Tambah komoditas | 201 Created |
| /v1/komoditas/:id | PUT | Ubah komoditas | 200 OK |
| /v1/komoditas/:id | DELETE | Hapus komoditas | 200 OK |

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
/v1/komoditas?search=beras&satuan_dasar=kg&sort_by=nama&sort_dir=asc
```

### 6. Tempat Usaha Page

**Route:** `/tempat-usaha`

**Access:** Protected

**Fitur utama:** CRUD tempat usaha, sub-CRUD komoditas dijual, klasifikasi kelas otomatis, filter, import CSV.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| /v1/tempat-usaha | GET | Ambil daftar tempat usaha (search, pasar, status, sort) | 200 OK |
| /v1/tempat-usaha | POST | Tambah tempat usaha | 201 Created |
| /v1/tempat-usaha/:id | PUT | Ubah tempat usaha | 200 OK |
| /v1/tempat-usaha/:id | DELETE | Hapus tempat usaha | 200 OK |
| /v1/tempat-usaha/:id/komoditas-dijual | GET | Ambil komoditas yang dijual | 200 OK |
| /v1/tempat-usaha/:id/komoditas-dijual | POST | Tambah komoditas dijual | 201 Created |
| /v1/komoditas-dijual/:id | PUT | Ubah komoditas dijual | 200 OK |
| /v1/komoditas-dijual/:id | DELETE | Hapus komoditas dijual | 200 OK |

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
/v1/tempat-usaha?search=berkah&pasar_id=psr-001&status=active&sort_by=nama&sort_dir=asc
/v1/tempat-usaha/:id/komoditas-dijual?status=active
```

#### Data Dropdown yang Dibutuhkan

- GET /v1/pasar untuk pilihan pasar
- GET /v1/komoditas untuk pilihan komoditas

### 7. Harga Rutin Page

**Route:** `/harga-rutin`

**Access:** Protected

**Fitur utama:** input harga rutin per tiga kelas, draft/finalisasi, signature, review data, validasi sampel.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| /v1/harga-rutin | GET | Ambil daftar harga rutin (filter pasar/tanggal/status) | 200 OK |
| /v1/harga-rutin/groups | GET | Ambil grup data berdasarkan tanggal + pasar + enumerator | 200 OK |
| /v1/harga-rutin | POST | Simpan data harga rutin | 201 Created |
| /v1/harga-rutin/:id | PUT | Ubah harga rutin | 200 OK |
| /v1/harga-rutin/:id | DELETE | Hapus harga rutin | 200 OK |
| /v1/harga-rutin/groups/:key/finalize | PATCH | Finalisasi satu grup input | 200 OK, 409 Conflict |

#### Data Dropdown yang Dibutuhkan (Form Harga Rutin)

- GET /v1/pasar untuk pilihan pasar
- GET /v1/komoditas untuk pilihan komoditas
- GET /v1/tempat-usaha?pasar_id=... untuk pilihan tempat usaha per pasar
- GET /v1/komoditas-dijual?pasar_id=...&komoditas_id=... untuk validasi komoditas dijual per pasar

#### Request Format (Query List)

```text
/v1/harga-rutin?pasar_id=psr-001&tanggal=2026-05-04&status=finalisasi
/v1/harga-rutin/groups?pasar_id=psr-001&tanggal=2026-05-04
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
/v1/harga-rutin/groups/:key/finalize
```

### 8. Harga Pelaporan Page

**Route:** `/harga-pelaporan`

**Access:** Protected

**Fitur utama:** daftar agregasi harga, filter, sorting, detail, ekspor CSV/PDF.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| /v1/harga-pelaporan | GET | Ambil data pelaporan teragregasi (filter pasar/tanggal) | 200 OK |
| /v1/harga-pelaporan/:id | GET | Ambil detail satu data pelaporan | 200 OK, 404 Not Found |

#### Response yang Diharapkan

```json
{
  "success": true,
  "code": 200,
  "message": "Success",
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
    "per_page": 20
  }
}
```

#### Request Format (Query List)

```text
/v1/harga-pelaporan?pasar_id=psr-001&from=2026-05-01&to=2026-05-04
```

### 9. Public Komoditas Dashboard

**Route:** `/public/komoditas`

**Access:** Public

**Fitur utama:** ringkasan publik harga komoditas, pencarian, filter pasar.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| /v1/public/komoditas | GET | Ambil daftar komoditas publik (search, pasar) | 200 OK |
| /v1/public/komoditas/summary | GET | Ambil ringkasan trend komoditas | 200 OK |

#### Request Format (Query List)

```text
/v1/public/komoditas?search=beras&pasar_id=psr-001
/v1/public/komoditas/summary?pasar_id=psr-001
```

### 10. Public Komoditas Detail

**Route:** `/public/komoditas/:id`

**Access:** Public

**Fitur utama:** detail komoditas, histori harga, distribusi per pasar.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| /v1/public/komoditas/:id | GET | Ambil detail komoditas publik | 200 OK, 404 Not Found |
| /v1/public/komoditas/:id/pasar | GET | Ambil perbandingan harga per pasar | 200 OK |
| /v1/public/komoditas/:id/trend | GET | Histori harga untuk grafik | 200 OK |

#### Request Format (Query Detail)

```text
/v1/public/komoditas/:id?include=latest,range
/v1/public/komoditas/:id/pasar?limit=10
/v1/public/komoditas/:id/trend?from=2026-04-01&to=2026-05-04
```

### 11. Public Tempat Usaha

**Route:** `/public/tempat-usaha/:id`

**Access:** Public

**Fitur utama:** detail tempat usaha, komoditas yang dijual, harga terbaru.

#### Endpoint

| Endpoint | Method | Kegunaan | Response |
| --- | --- | --- | --- |
| /v1/public/tempat-usaha/:id | GET | Ambil detail tempat usaha publik | 200 OK, 404 Not Found |
| /v1/public/tempat-usaha/:id/harga | GET | Ambil harga terbaru per komoditas | 200 OK |
| /v1/public/tempat-usaha/:id/komoditas | GET | Ambil komoditas aktif di tempat usaha | 200 OK |

#### Request Format (Query Detail)

```text
/v1/public/tempat-usaha/:id?include=pasar
/v1/public/tempat-usaha/:id/harga?limit=12
/v1/public/tempat-usaha/:id/komoditas?is_active=1
```

## Data Models and Enums

### SatuanDasar (Base Unit)

```typescript
type SatuanDasar = "kg" | "gram" | "ons" | "ton" | "liter" | "ml";
```

### KelasKomoditas (Commodity Class)

```typescript
type KelasKomoditas = "besar" | "menengah" | "kecil";
```

### PeriodeUnit (Period Unit)

```typescript
type PeriodeUnit = "hari" | "minggu" | "2minggu" | "bulan";
```

### PolaDistribusi (Distribution Pattern)

```typescript
type PolaDistribusi =
  | "pembelian_produsen"
  | "pembelian_pasar"
  | "pemesanan_produsen"
  | "pemesanan_supplier"
  | "rutin_produsen"
  | "rutin_supplier"
  | "produsen_pedagang"
  | "lainnya";
```

### Entity Schema

#### Pasar

```json
{
  "id": "uuid",
  "nama": "string",
  "longitude": "float",
  "latitude": "float",
  "alamat": "string",
  "is_active": 0 | 1,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

#### Komoditas

```json
{
  "id": "uuid",
  "nama": "string",
  "satuan_dasar": "SatuanDasar",
  "gambar": "url",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

#### TempatUsaha

```json
{
  "id": "uuid",
  "nama": "string",
  "nama_pemilik": "string",
  "nama_narahubung": "string",
  "nomor_narahubung": "string (E.164)",
  "berjualan_sejak": "YYYY-MM-DD",
  "is_active": 0 | 1,
  "pasar_id": "uuid",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

#### KomoditasDijual

```json
{
  "id": "uuid",
  "tempat_usaha_id": "uuid",
  "komoditas_id": "uuid",
  "harga_normal": "number",
  "harga_mahal": "number",
  "satuan_stok": "SatuanDasar",
  "nilai_stok": "number",
  "nilai_periode": "number",
  "periode_unit": "PeriodeUnit",
  "lokasi_supplier": "string",
  "pola_distribusi": "PolaDistribusi",
  "standardized_stock_periode": "number (auto-calculated)",
  "is_active": "boolean",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

#### HargaRutin

```json
{
  "id": "uuid",
  "nama_enumerator": "string",
  "tanggal": "YYYY-MM-DD",
  "pasar_id": "uuid",
  "komoditas_id": "uuid",
  "kelas_komoditas": "KelasKomoditas",
  "tempat_usaha_id": "uuid",
  "harga_input": "number",
  "jumlah_input": "number",
  "satuan_input": "SatuanDasar",
  "harga": "number (auto-calculated)",
  "status": "dalam_proses | finalisasi",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

#### HargaPelaporan

```json
{
  "id": "uuid",
  "tanggal": "YYYY-MM-DD",
  "pasar_id": "uuid",
  "komoditas_id": "uuid",
  "harga_rata_rata": "number",
  "harga_besar": "number | null",
  "harga_menengah": "number | null",
  "harga_kecil": "number | null",
  "created_at": "ISO8601"
}
```

## Error Codes

| Code | Message | Description | Common Causes |
| --- | --- | --- | --- |
| 400 | Bad Request | Invalid request format or parameters | Malformed JSON, missing required fields |
| 401 | Unauthorized | Missing or invalid authentication | Missing Bearer token, expired token |
| 403 | Forbidden | User lacks permission | Non-admin trying admin endpoint |
| 404 | Not Found | Resource does not exist | Invalid UUID, deleted resource |
| 409 | Conflict | Resource already exists | Duplicate email, duplicate entry |
| 422 | Unprocessable Entity | Validation error on fields | Invalid email format, out of range |
| 500 | Internal Server Error | Unexpected server error | Database connection failed |

## Implementation Status

### Implemented

- Auth - Login endpoint
- Users - CRUD operations
- Pasar - GET list (public), POST create (admin), pagination support
- Response Format - Consistent envelope structure

### Planned (Frontend expects, Backend WIP)

- Komoditas - GET, POST endpoints
- Tempat Usaha - Full CRUD with filters
- Komoditas Dijual - Full CRUD with auto-calculations
- Harga Rutin - Full CRUD with price standardization
- Harga Pelaporan - GET aggregated data from finalized Harga Rutin

### Notes

1. Timestamps: consider adding created_at and updated_at to all entities.
2. Pagination: support offset, limit, order_by across list endpoints.
3. DataContext alignment: frontend can fallback to localStorage.
4. Stock standardization: standardized_stock_periode is calculated server-side.
5. Price classification: KelasKomoditas determined by normal distribution analysis (mean +/- 0.5*stddev).

## Frontend Page-to-Endpoint Mapping

### Login Page

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| POST /v1/auth/login | POST | Implemented | N/A | JWT token generation |

### Landing Page (Public)

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/pasar | GET | Implemented | localStorage | Markets list for stats and search |
| GET /v1/komoditas | GET | Implemented | localStorage | Commodities for search and display |
| GET /v1/komoditas-dijual | GET | Not Implemented | localStorage | Market search results |
| GET /v1/harga-pelaporan | GET | Not Implemented | localStorage | Price trend charts |

### Dashboard

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/pasar | GET | Implemented | localStorage | Total markets count |
| GET /v1/komoditas | GET | Implemented | localStorage | Total commodities count |
| GET /v1/harga-pelaporan | GET | Not Implemented | localStorage | Recent price entries |

### Pasar (Market) Management

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/pasar | GET | Implemented | localStorage | List all markets with pagination |
| POST /v1/pasar | POST | Implemented | localStorage | Create new market |
| PUT /v1/pasar/:id | PUT | Not Implemented | localStorage | Edit market details |
| DELETE /v1/pasar/:id | DELETE | Not Implemented | localStorage | Deactivate market |

### Komoditas (Commodity) Management

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/komoditas | GET | Implemented | localStorage | List all commodities |
| POST /v1/komoditas | POST | Not Implemented | localStorage | Create new commodity |
| PUT /v1/komoditas/:id | PUT | Not Implemented | localStorage | Edit commodity |
| DELETE /v1/komoditas/:id | DELETE | Not Implemented | localStorage | Delete commodity |

### Tempat Usaha (Business Places) Management

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/tempat-usaha | GET | Not Implemented | localStorage | List business places by market |
| POST /v1/tempat-usaha | POST | Not Implemented | localStorage | Register new business place |
| PUT /v1/tempat-usaha/:id | PUT | Not Implemented | localStorage | Edit business place |
| DELETE /v1/tempat-usaha/:id | DELETE | Not Implemented | localStorage | Deactivate business place |

### Komoditas Dijual (Commodities Sold) Management

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/komoditas-dijual | GET | Not Implemented | localStorage | List commodities by business place |
| POST /v1/komoditas-dijual | POST | Not Implemented | localStorage | Register commodity sold with pricing |
| PUT /v1/komoditas-dijual/:id | PUT | Not Implemented | localStorage | Update commodity pricing |
| DELETE /v1/komoditas-dijual/:id | DELETE | Not Implemented | localStorage | Stop selling commodity |

### Harga Rutin (Routine Price) Entry

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/harga-rutin | GET | Not Implemented | localStorage | List entries by date and market |
| POST /v1/harga-rutin | POST | Not Implemented | localStorage | Record new price entry |
| PUT /v1/harga-rutin/:id | PUT | Not Implemented | localStorage | Edit entry before finalization |
| PATCH /v1/harga-rutin/:id/finalize | PATCH | Not Implemented | localStorage | Finalize entry for reporting |

### Harga Pelaporan (Price Reporting) View

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/harga-pelaporan | GET | Not Implemented | localStorage | Aggregated prices by date |
| GET /v1/harga-pelaporan/export | GET | Not Implemented | localStorage | Export to CSV/PDF (future) |

### User Management (Admin)

| Endpoint | Method | Status | Frontend Fallback | Notes |
| --- | --- | --- | --- | --- |
| GET /v1/users | GET | Implemented | N/A | List all users |
| POST /v1/users | POST | Implemented | N/A | Create new admin user |
| PUT /v1/users/:id | PUT | Implemented | N/A | Edit user |
| DELETE /v1/users/:id | DELETE | Implemented | N/A | Delete user |