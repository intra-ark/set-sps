# Hızlı Başlangıç Kılavuzu

## İlk Giriş

### 1. Sisteme Giriş Yapma

1. Tarayıcınızda sisteme gidin
2. Kullanıcı adı ve şifrenizi girin
3. "Giriş Yap" butonuna tıklayın

**Varsayılan Admin Hesabı:**
- Kullanıcı Adı: `admin`
- Şifre: `admin123`

> ⚠️ **Güvenlik**: İlk girişten sonra mutlaka şifrenizi değiştirin!

### 2. Ana Sayfa

Giriş yaptıktan sonra dashboard sayfasını göreceksiniz:
- **Üst Kısım**: Logo, başlık, yardım ve menu butonları
- **Sol Taraf**: Hat seçimi (Line Drawer)
- **Orta Kısım**: Seçili hattın grafikleri ve verileri
- **Sağ Taraf**: Yıl seçimi ve filtreler

## Admin İçin İlk Adımlar

### 1. Yeni Hat Ekle

1. Sol menüden "Admin Panel" seçin
2. "Add New Line" butonuna tıklayın
3. Hat adı ve slug girin
4. "Create Line" butonuna tıklayın

**Örnek:**
- Hat Adı: `Assembly Line 1`
- Slug: `assembly-line-1`

### 2. Kullanıcı Ekle

1. Admin Panel'den "Manage Users" seçin
2. Kullanıcı adı ve şifre girin
3. "Add User" butonuna tıklayın

### 3. Kullanıcıya Hat Ata

1. "Manage Users" sayfasında kullanıcıyı bulun
2. "Assign Lines" butonuna tıklayın
3. Atamak istediğiniz hatları seçin
4. "Save Assignments" butonuna tıklayın

### 4. Ürün Ekle

1. Bir hat seçin
2. "Add Product" butonuna tıklayın
3. Ürün adı ve kodu girin
4. Kaydet

### 5. Veri Gir

1. Bir ürün seçin
2. Yıl seçin
3. KD, KE, UT, NVA değerlerini girin
4. "Save" butonuna tıklayın

## Normal Kullanıcı İçin İlk Adımlar

### 1. Atanan Hatları Görüntüle

1. Giriş yapın
2. Sol menüden size atanan hatları göreceksiniz
3. Bir hat seçin

### 2. Veri Görüntüle

1. Hat seçtikten sonra yıl seçin
2. Grafikleri ve tabloları inceleyin
3. Dashboard'da genel performansı görün

### 3. Veri Düzenle

1. Bir ürünün yanındaki "Edit" butonuna tıklayın
2. Değerleri güncelleyin
3. "Save" butonuna tıklayın

### 4. CSV Export

1. "Export CSV" butonuna tıklayın
2. Dosya otomatik indirilir
3. Excel'de açabilirsiniz

## Sık Kullanılan İşlemler

### Şifre Değiştirme

1. Sağ üst köşedeki menu butonuna tıklayın
2. "Change Password" seçin
3. Mevcut ve yeni şifrenizi girin
4. "Update Password" butonuna tıklayın

### CSV Import

1. Bir hat ve yıl seçin
2. "Import CSV" butonuna tıklayın
3. CSV dosyasını seçin
4. "Upload" butonuna tıklayın

**CSV Formatı:**
```csv
Product Name;Product Code;KD;KE;UT;NVA
Ürün 1;P001;100;50;150;10
Ürün 2;P002;200;75;275;15
```

### Grafikleri İnceleme

1. Dashboard'da yıllık trend grafiklerini görün
2. Farklı metrikleri karşılaştırın
3. Ortalama değerleri kontrol edin

## Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| `Esc` | Modal'ı kapat |
| `Ctrl + S` | Kaydet (veri girişinde) |
| `Ctrl + E` | Export CSV |

## Sorun mu Yaşıyorsunuz?

### Giriş Yapamıyorum
- Kullanıcı adı ve şifrenizi kontrol edin
- Caps Lock kapalı mı kontrol edin
- Admin'e başvurun

### Hat Göremiyorum
- Admin size hat atamış mı kontrol edin
- Sayfayı yenileyin (F5)
- Çıkış yapıp tekrar giriş yapın

### Veri Kaydedemedim
- İnternet bağlantınızı kontrol edin
- Tüm alanları doldurduğunuzdan emin olun
- Hata mesajını okuyun

## Sonraki Adımlar

- [Admin Kullanıcı Kılavuzu](./04-admin-kilavuzu.md)
- [Normal Kullanıcı Kılavuzu](./05-kullanici-kilavuzu.md)
- [API Dokümantasyonu](./10-api-genel.md)

## Yardım

Daha fazla yardım için:
- 📧 Email: ahmet.mersin@se.com
- 📚 Dokümantasyon: `/docs`
- 🐛 Hata Bildirimi: GitHub Issues
