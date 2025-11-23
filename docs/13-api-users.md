# Kullanıcı API

Bu dokümantasyon, **Kullanıcı API**'nin kullanımını ve endpointlerini açıklar.

## Endpointler

| Metod | URL | Açıklama |
|-------|-----|----------|
| `GET` | `/api/users` | Tüm kullanıcıları listeler (admin). |
| `GET` | `/api/users/{id}` | Belirli bir kullanıcıyı getirir (admin). |
| `POST` | `/api/users` | Yeni kullanıcı oluşturur (admin). |
| `PUT` | `/api/users/{id}` | Kullanıcıyı günceller (admin). |
| `DELETE` | `/api/users/{id}` | Kullanıcıyı siler (admin). |
| `POST` | `/api/change-password` | Kullanıcı şifresini değiştirir (kendi hesabı). |

## İzin Kontrolleri
- **ADMIN**: Tüm metodlara erişim.
- **USER**: Sadece kendi şifresini değiştirebilir.

## Örnek İstek
```bash
curl -X POST "https://your-domain.com/api/users" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"yeniKullanici","password":"sifre123","role":"USER"}'
```

## Yanıt Şeması
```json
{
  "id": 5,
  "username": "yeniKullanici",
  "role": "USER",
  "createdAt": "2025-11-23T22:00:00.000Z"
}
```
