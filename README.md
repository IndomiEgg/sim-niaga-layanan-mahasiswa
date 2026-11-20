# SIM Niaga · Layanan Mahasiswa

Frontend publik React + Vite untuk permohonan surat, pelacakan status, unduh dokumen mahasiswa, layanan dinamis, dan pendaftaran kesiapan sidang. Tidak menyediakan akun mahasiswa.

## Menjalankan

```bash
npm ci
npm run dev
```

## Konfigurasi API

Salin `.env.example` menjadi `.env.local`, lalu atur `VITE_API_BASE_URL` ke `/api/v1` jika web server meneruskan rute API pada origin yang sama, atau ke base URL Laravel sesuai deployment. Target proxy Vite lokal bersifat opsional dan harus diatur eksplisit lewat `VITE_API_PROXY_TARGET`; aplikasi tidak menggunakan server API eksternal bawaan.

Permohonan, pelacakan, akses mahasiswa, unduhan, dan unggahan sidang menggunakan endpoint pada Kontrak API SIM Niaga v1.1.0. P-07 memerlukan **perubahan kontrak**: `POST /publik/akses-mahasiswa` harus menerima `nim` dan `kode_pelacakan`, lalu memvalidasi bahwa kode tersebut milik NIM sebelum menerbitkan token akses. Implementasi backend saat ini harus menambahkan aturan ini sebelum alur P-07 dapat dipakai.

Alur status dan pengunduhan bergantung pada respons backend. Belum ada backend yang dijalankan atau diuji dalam repo frontend ini.

Data layanan dan dokumen tidak disimpan di localStorage atau IndexedDB. Kedua frontend harus diarahkan ke API Laravel yang sama agar data permohonan dan dokumen dibagikan lintas origin. Pastikan backend mengatur CORS untuk origin kedua frontend dan mengirim `X-Akses-Mahasiswa` untuk endpoint dokumen mahasiswa.

## Validasi

```bash
npm run lint
npm run build
```
