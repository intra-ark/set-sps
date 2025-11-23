# API Genel Bakış

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.vercel.app/api
```

## Kimlik Doğrulama

Tüm API istekleri NextAuth session tabanlı kimlik doğrulama gerektirir.

```typescript
// Her istekte otomatik olarak session kontrolü yapılır
const session = await getServerSession(authOptions);
```

## API Endpoint'leri

### Kimlik Doğrulama
- `POST /api/auth/signin` - Giriş yap
- `POST /api/auth/signout` - Çıkış yap
- `GET /api/auth/session` - Mevcut session bilgisi
- `POST /api/change-password` - Şifre değiştir

### Hatlar (Lines)
- `GET /api/lines` - Kullanıcının erişebildiği hatları listele
- `GET /api/lines?all=true` - Tüm hatları listele (Admin)
- `POST /api/lines` - Yeni hat ekle (Admin)
- `DELETE /api/lines?id={id}` - Hat sil (Admin)
- `GET /api/lines/{id}` - Hat detayı
- `PATCH /api/lines/{id}` - Hat güncelle
- `DELETE /api/lines/{id}` - Hat sil (Admin)

### Kullanıcılar (Users)
- `GET /api/users` - Tüm kullanıcıları listele (Admin)
- `POST /api/users` - Yeni kullanıcı ekle (Admin)
- `PUT /api/users` - Kullanıcı şifresini güncelle (Admin)
- `DELETE /api/users?id={id}` - Kullanıcı sil (Admin)

### Kullanıcı-Hat Ataması (User Lines)
- `GET /api/user-lines?userId={id}` - Kullanıcının hat atamalarını getir (Admin)
- `POST /api/user-lines` - Hat ataması yap (Admin)
- `DELETE /api/user-lines?userId={id}&lineId={id}` - Hat atamasını kaldır (Admin)

### Ürünler (Products)
- `GET /api/products?lineId={id}` - Hattın ürünlerini listele
- `POST /api/products` - Yeni ürün ekle
- `DELETE /api/products/{id}` - Ürün sil

### Yıl Verileri (Year Data)
- `GET /api/year-data?lineId={id}&year={year}` - Yıl verilerini getir
- `POST /api/year-data` - Yıl verisi ekle/güncelle
- `POST /api/year-data/bulk` - Toplu veri import (CSV)
- `DELETE /api/year-data/delete` - Yıl verisi sil

### Ayarlar (Settings)
- `GET /api/settings` - Global ayarları getir
- `POST /api/settings` - Global ayarları güncelle (Admin)

### AI Chat
- `POST /api/chat` - AI asistanı ile sohbet

## Yanıt Formatları

### Başarılı Yanıt
```json
{
  "id": 1,
  "name": "F400",
  "slug": "f400"
}
```

### Hata Yanıtı
```json
{
  "error": "Unauthorized"
}
```

## HTTP Durum Kodları

| Kod | Anlamı | Açıklama |
|-----|--------|----------|
| 200 | OK | İstek başarılı |
| 201 | Created | Kaynak oluşturuldu |
| 400 | Bad Request | Geçersiz istek |
| 401 | Unauthorized | Kimlik doğrulama gerekli |
| 403 | Forbidden | Yetki yok |
| 404 | Not Found | Kaynak bulunamadı |
| 500 | Internal Server Error | Sunucu hatası |

## Örnek İstekler

### JavaScript/TypeScript
```typescript
// GET isteği
const response = await fetch('/api/lines');
const lines = await response.json();

// POST isteği
const response = await fetch('/api/lines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Line 6', slug: 'line-6' })
});

// DELETE isteği
await fetch(`/api/lines/${lineId}`, {
  method: 'DELETE'
});
```

### cURL
```bash
# GET isteği
curl http://localhost:3000/api/lines

# POST isteği
curl -X POST http://localhost:3000/api/lines \
  -H "Content-Type: application/json" \
  -d '{"name":"Line 6","slug":"line-6"}'

# DELETE isteği
curl -X DELETE http://localhost:3000/api/lines/1
```

## Rate Limiting

CSV import endpoint'inde rate limiting aktif:
- **Limit**: 10 istek / dakika
- **Aşıldığında**: 429 Too Many Requests

## CORS

Sistem aynı origin üzerinde çalıştığı için CORS ayarı gerekmez.

## Güvenlik

### Session Tabanlı Auth
- Her istekte session cookie'si gönderilir
- NextAuth otomatik olarak yönetir
- CSRF koruması aktif

### Rol Bazlı Yetkilendirme
```typescript
// Admin kontrolü
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}

// Hat erişim kontrolü
const hasAccess = await canUserAccessLine(userId, lineId, userRole);
if (!hasAccess) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

## Detaylı Dokümantasyon

Her endpoint için detaylı dokümantasyon:
- [Hat API](./12-api-lines.md)
- [Kullanıcı API](./13-api-users.md)
- [Ürün API](./14-api-products.md)
- [Yıl Verisi API](./15-api-year-data.md)
- [Kullanıcı-Hat Atama API](./16-api-user-lines.md)
