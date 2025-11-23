# SET SPS - İleri Seviye Ürün Yönetimi & SPS Analiz Platformu

SET SPS, ürün performans metriklerini yıllar (2023-2027) bazında takip eden ve SPS (Single Point of Success) analizi yapan gelişmiş bir yönetim platformudur.

## 🌟 Özellikler

### 🎯 Temel Özellikler
- **Yıl Bazlı Ürün Yönetimi**: Her ürün belirli yıllarda bağımsız olarak yönetilebilir
- **SPS Şelale Analizi**: Görsel akış analizi (OT → DT → UT → NVA)
- **Gelişmiş Analitik**: CSV içe/dışa aktarma, toplu işlemler
- **Dinamik Yapılandırma**: Başlık görsel yönetimi, kullanıcı kontrolleri

### 🤖 Intra Arc AI Asistanı
- **Gerçek Veri Erişimi**: Tüm ürün ve yıl verilerinize erişim
- **Akıllı Analiz**: SPS, KD, UT gibi metrikleri anlayıp açıklama
- **Jarvis-Tarzı Arayüz**: Premium animasyonlar ve glassmorphism
- **Türkçe Destek**: Tamamen Türkçe yanıtlar

### 📊 Performans Metrikleri
- **OT (Overall Time)**: Toplam proje süresi
- **DT (Design Time)**: Tasarım fazı süresi
- **UT (Useful Time)**: Üretken çalışma süresi
- **NVA (Non-Value Added)**: İsraf/verimsiz süre
- **KD (Kaizen Delta %)**: Verimlilik iyileştirme oranı
- **KE, KER, KSR**: Genişletilmiş performans göstergeleri

---

## 🚀 Hızlı Başlangıç (Yerel Geliştirme)

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Veritabanını oluştur
npx prisma generate
npx prisma db push

# 3. Seed (örnek veri yükle)
npx prisma db seed

# 4. Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini ziyaret edin.

### 🔐 Varsayılan Giriş Bilgileri
- **Kullanıcı adı**: `admin`
- **Şifre**: `admin123`

---

## 🌐 Vercel'de Yayına Alma

### 1️⃣ Hazırlık

#### a) GitHub Repository Oluştur
```bash
# Proje dizininde
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/f400.git
git push -u origin main
```

#### b) Vercel PostgreSQL Hazırlığı
> ⚠️ **ÖNEMLİ**: SQLite production'da çalışmaz. PostgreSQL kullanmanız gerekiyor.

**Prisma Schema'yı Güncelle** (`prisma/schema.prisma`):
```prisma
datasource db {
  provider = "postgresql"  // sqlite yerine
  url      = env("DATABASE_URL")
}
```

### 2️⃣ Vercel'de Deploy

1. **Vercel'e Git**: https://vercel.com
2. **"Add New Project"** tıklayın
3. **GitHub repo'nuzu import edin**
4. **Environment Variables** ekleyin:

```env
# Database (Vercel Postgres'ten alacaksınız)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=rastgele-güvenli-bir-string-buraya
NEXTAUTH_URL=https://sizin-proje-adiniz.vercel.app

# Gemini AI
GEMINI_API_KEY=AIzaSy...
```

5. **Deploy** butonuna tıklayın

### 3️⃣ Vercel Postgres Kurulumu

1. Vercel Dashboard'da projenize gidin
2. **Storage** sekmesine tıklayın
3. **Connect Database** → **Postgres** seçin
4. Database oluşturun (ücretsiz plan yeterli)
5. **Environment Variables** otomatik eklenir

### 4️⃣ Database Migration

Vercel deploy'dan sonra:

```bash
# Terminal'de
vercel env pull .env.local  # .env'i çek
npx prisma db push          # Tabloları oluştur
npx prisma db seed          # Seed verilerini yükle
```

**VEYA** Vercel Dashboard'da:
- **Settings** → **General** → **Build Command**:
```bash
npx prisma generate && npx prisma db push && next build
```

### 5️⃣ Seed Verilerini Yükle

İlk admin kullanıcısını oluşturmak için:

**Seçenek 1: Vercel CLI**
```bash
vercel env pull
npx prisma db seed
```

**Seçenek 2: Manuel**
Prisma Studio kullanın:
```bash
npx prisma studio
```

---

## 📝 Environment Variables Açıklamaları

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantı string'i | `postgresql://user:pass@host/db` |
| `NEXTAUTH_SECRET` | NextAuth şifreleme anahtarı | Random 32+ karakter |
| `NEXTAUTH_URL` | Sitenizin tam URL'i | `https://f400.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini AI anahtarı | `AIzaSy...` |

### NEXTAUTH_SECRET Oluşturma
```bash
openssl rand -base64 32
```

### GEMINI_API_KEY Alma
1. https://aistudio.google.com/apikey
2. "Create API Key" tıklayın
3. Anahtarı kopyalayın

---

## 🎮 Kullanım Rehberi

### Admin Paneli
1. `/admin` adresine gidin
2. Giriş yapın (admin/admin123)
3. **Yıl Seçin** (2023-2027)
4. **Ürün Ekle/Çıkar** - Her yıl için ayrı ayrı
5. **Veri Gir** - KD, UT, NVA gibi metrikleri girin
6. **CSV Import/Export** - Toplu işlemler yapın

### Intra Arc AI Kullanımı
1. Ana sayfada sağ alttaki **parlayan orb**'a tıklayın
2. Sorular sorun:
   - "Hangi ürünler var?"
   - "2024'te en yüksek KD'li ürün hangisi?"
   - "SPS analizi nasıl yapılır?"
   - "Product X'in performansı nasıl?"
3. **Gerçek verilerinize** erişir ve analiz eder

### CSV Import Formatı
```csv
Product,DT,UT,NVA,KD,KE,KER,KSR,OT,TSR
Product A,100,200,50,0.75,150,0.8,0.9,350,REF-001
Product B,120,180,60,0.72,140,0.78,0.88,360,REF-002
```

---

## 🛠️ Teknik Detaylar

### Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js
- **AI**: Google Gemini 2.0 Flash Lite
- **Styling**: Tailwind CSS
- **Charts**: Recharts

### Dizin Yapısı
```
f400/
├── prisma/
│   ├── schema.prisma       # Database şeması
│   └── seed.ts             # Seed verileri
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin panel
│   │   └── page.tsx        # Ana sayfa
│   ├── components/
│   │   ├── Dashboard.tsx    # Public dashboard
│   │   └── AIAssistant.tsx  # Intra Arc
│   └── lib/
│       ├── prisma.ts       # DB client
│       └── auth.ts          # Auth config
└── public/                 # Static dosyalar
```

---

## 🔧 Troubleshooting

### "Database not found" Hatası
```bash
npx prisma db push --force-reset
npx prisma db seed
```

### AI Asistan Çalışmıyor
- `GEMINI_API_KEY` doğru mu kontrol edin
- API quota limitini kontrol edin: https://ai.dev/usage

### Build Hatası
```bash
# Prisma client'ı yeniden oluştur
npx prisma generate
npm run build
```

### Vercel Deploy Hatası
- Environment variables eklenmiş mi?
- Database bağlantısı çalışıyor mu?
- Build logs'u kontrol edin

---

## 📄 Lisans

MIT License - Ahmet Mersin tarafından geliştirilmiştir.

---

## 🤝 Destek

Sorularınız için:
- Issues: GitHub Issues
- Email: ahmetmersin@example.com

---

## 🎯 Gelecek Özellikler

- [ ] Çoklu kullanıcı rolleri
- [ ] PDF rapor oluşturma
- [ ] E-posta bildirimleri
- [ ] Gelişmiş grafik analizi
- [ ] Mobil uygulama
- [ ] Real-time collaboration

---

**SET SPS** - *İleri seviye ürün yönetimi, akıllı analiz* 🚀
