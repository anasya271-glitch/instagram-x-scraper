#!/bin/bash
# ==============================================================================
# PIPELINE AUTOMATED DEVOPS: MEMORY & DRIVER GARBAGE COLLECTOR (BASH)
# ==============================================================================
# Skrip ini otomatis membersihkan sisa zombie proses driver peramban di Colab.

echo "[INFO] Meluncurkan pembersihan sisa memori komputasi..."

# 1. Menghentikan paksa instansiasi driver peramban yang menggantung di memori
pkill -f chromedriver
pkill -f chrome

# 2. Membersihkan direktori temporary linux dari sampah cache session cookie
rm -rf /tmp/.com.google.Chrome*
rm -rf /tmp/scoped_dir*

# 3. Menghitung sisa kapasitas ruang penyimpanan harddisk komputasi cloud
FREE_SPACE=$(df -h / | awk 'NR==2 {print $4}')
echo "[SUCCESS] Pembersihan selesai. Sisa kapasitas memori mesin cloud: $FREE_SPACE"