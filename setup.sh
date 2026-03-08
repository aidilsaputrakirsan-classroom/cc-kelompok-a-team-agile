#!/usr/bin/env bash
# setup.sh — Script setup awal untuk Cloud App Backend
# Jalankan dari root repository: bash setup.sh

set -e  # Hentikan script jika ada perintah yang gagal

echo "======================================"
echo "  Cloud App — Setup Backend"
echo "======================================"

# ── 1. Cek Python ──────────────────────────────────────────────────────────────
if ! command -v py &>/dev/null; then
    echo "[ERROR] Python 3 tidak ditemukan. Install Python 3.9+ terlebih dahulu."
    exit 1
fi
echo "[OK] Python: $(py --version)"

# ── 2. Buat virtual environment ────────────────────────────────────────────────
cd backend

if [ ! -d "venv" ]; then
    echo "[INFO] Membuat virtual environment..."
    py -3.11 -m venv venv
else
    echo "[OK] Virtual environment sudah ada, dilewati."
fi

# ── 3. Aktifkan venv ───────────────────────────────────────────────────────────
# shellcheck disable=SC1091
source ./venv/scripts/activate
echo "[OK] Virtual environment aktif."

# ── 4. Install dependencies ────────────────────────────────────────────────────
echo "[INFO] Menginstall dependencies dari requirements.txt..."
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt
echo "[OK] Dependencies terinstall."

# ── 5. Salin .env.example → .env (jika belum ada) ─────────────────────────────
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "[OK] File .env dibuat dari .env.example."
    echo "     Silakan edit backend/.env dan sesuaikan DATABASE_URL."
else
    echo "[OK] File .env sudah ada, dilewati."
fi

# ── 6. Selesai ─────────────────────────────────────────────────────────────────
echo ""
echo "======================================"
echo "  Setup selesai!"
echo "======================================"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Edit backend/.env — isikan DATABASE_URL yang benar"
echo "  2. Aktifkan venv  : source backend/venv/scripts/activate"
echo "  3. Jalankan server: uvicorn main:app --reload"
echo ""
