# 🚀 Panduan Lengkap: Push ke GitHub & Deploy ke Vercel

## 📋 Checklist File

### ✅ File yang AMAN di-push ke GitHub:
- ✅ `backend/ai-server.js`
- ✅ `backend/server.js`
- ✅ `backend/package.json`
- ✅ `backend/.env.example` (template tanpa API key)
- ✅ `frontend/` (semua file)
- ✅ `.gitignore`
- ✅ `README.md`
- ✅ `vercel.json`

### ❌ File yang TIDAK BOLEH di-push (sudah di .gitignore):
- ❌ `backend/.env` (berisi API key rahasia!)
- ❌ `node_modules/`
- ❌ `*.log`
- ❌ Data user pribadi

---

## 📝 Langkah 1: Persiapan

1. **Pastikan semua file sudah benar:**
```bash
cd c:\Users\Eja\Downloads\WealthEase-main\WealthEase-main\WealthEase-main
```

2. **Cek .gitignore sudah ada:**
```bash
cat .gitignore
```
✅ Pastikan ada `.env` di dalamnya

3. **Cek .env.example sudah dibuat:**
```bash
cat backend\.env.example
```
✅ Pastikan TIDAK ada API key asli di sini

---

## 📤 Langkah 2: Push ke GitHub

### A. Initialize Git (jika belum)
```bash
git init
```

### B. Add Remote Repository
Ganti `yourusername` dengan username GitHub kamu:
```bash
git remote add origin https://github.com/yourusername/wealthease.git
```

### C. Add All Files
```bash
git add .
```

### D. Check Status (PENTING!)
```bash
git status
```
✅ Pastikan `.env` TIDAK muncul di list (harus ignored)
❌ Jika `.env` muncul, JANGAN lanjut! Cek .gitignore dulu

### E. Commit Changes
```bash
git commit -m "Initial commit: WealthEase AI Finance Tracker"
```

### F. Push to GitHub
```bash
git push -u origin main
```

Atau jika branch-nya master:
```bash
git push -u origin master
```

---

## 🌐 Langkah 3: Deploy ke Vercel

### A. Buat Akun Vercel
1. Kunjungi: https://vercel.com
2. Sign up dengan GitHub (recommended)
3. Authorize Vercel untuk akses GitHub

### B. Import Repository
1. Klik **"Add New Project"**
2. Pilih **"Import Git Repository"**
3. Cari repository **wealthease** yang baru kamu push
4. Klik **"Import"**

### C. Configure Project
1. **Framework Preset**: Other (biarkan kosong)
2. **Root Directory**: `./` (default)
3. **Build Command**: Kosongkan
4. **Output Directory**: `frontend`

### D. Add Environment Variables (PENTING!)
Sebelum deploy, tambahkan environment variables:

1. Klik **"Environment Variables"**
2. Tambahkan variabel berikut:

```
Name: OPENAI_API_KEY
Value: your-openai-api-key-here
```

```
Name: OPENAI_MODEL
Value: gpt-3.5-turbo
```

```
Name: NODE_ENV
Value: production
```

### E. Deploy!
1. Klik **"Deploy"**
2. Tunggu proses deployment (2-3 menit)
3. Selesai! 🎉

---

## 🔧 Langkah 4: Update API Endpoint (Penting!)

Setelah deploy, kamu perlu update API endpoint di frontend:

### A. Dapatkan URL Vercel
Contoh: `https://wealthease-abc123.vercel.app`

### B. Update Chatbot.js
Edit file `frontend/js/chatbot.js`:

**Cari baris ini:**
```javascript
const response = await fetch('http://localhost:3001/api/ai/chatbot', {
```

**Ganti dengan URL Vercel:**
```javascript
const response = await fetch('https://wealthease-abc123.vercel.app/api/ai/chatbot', {
```

### C. Commit & Push Update
```bash
git add frontend/js/chatbot.js
git commit -m "Update API endpoint for production"
git push
```

Vercel akan auto-redeploy! ✨

---

## ✅ Testing Production

1. Buka URL Vercel kamu
2. Test login
3. Test chatbot dengan:
   - "beli kopi 5 tunai"
   - "dapat gaji 150"
4. Test semua fitur

---

## 🔒 Keamanan PENTING!

### ❌ JANGAN PERNAH:
1. Push `.env` ke GitHub
2. Commit API key langsung di code
3. Share API key di public

### ✅ SELALU:
1. Gunakan environment variables
2. Simpan API key di Vercel settings
3. Check `git status` sebelum push
4. Review changes sebelum commit

---

## 🐛 Troubleshooting

### Problem: `.env` muncul di git status
**Solution:**
```bash
git rm --cached backend/.env
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "Fix: ignore .env file"
```

### Problem: Chatbot tidak jalan di production
**Solution:**
1. Cek environment variables di Vercel
2. Pastikan API endpoint sudah diupdate
3. Cek console browser (F12) untuk error

### Problem: API key invalid
**Solution:**
1. Buat API key baru di OpenAI
2. Update di Vercel environment variables
3. Redeploy

---

## 📚 Useful Commands

```bash
# Check git status
git status

# View .gitignore
cat .gitignore

# Check remote
git remote -v

# Force push (HATI-HATI!)
git push -f origin main

# Remove file from git
git rm --cached <file>

# View commit history
git log --oneline
```

---

## 🎉 Done!

Sekarang aplikasi kamu sudah live di Vercel!

**Share URL-nya:**
- https://wealthease-abc123.vercel.app

**Next Steps:**
- Custom domain (optional)
- Add more features
- Share with friends!

---

## 📞 Need Help?

Jika ada masalah, cek:
1. Vercel deployment logs
2. Browser console (F12)
3. GitHub Actions (if any)

Good luck! 🚀✨
