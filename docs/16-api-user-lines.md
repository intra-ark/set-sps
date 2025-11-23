# Kullanıcı‑Hat Atama API

Bu dokümantasyon, **Kullanıcı‑Hat Atama API**'nin (User‑Line) kullanımını ve endpointlerini açıklar.

## Endpointler

| Metod | URL | Açıklama |
|-------|-----|----------|
| `GET` | `/api/user-lines` | Kullanıcı‑hat atamalarını listeler. Admin tüm atamaları, kullanıcı sadece kendisine ait atamaları görür. |
| `POST` | `/api/user-lines` | Bir kullanıcıya hat atar (admin). Gönderilen JSON: `{ "userId": 3, "lineIds": [1,2] }` |
| `DELETE` | `/api/user-lines` | Kullanıcı‑hat atamasını siler (admin). Gönderilen JSON: `{ "userId": 3, "lineId": 2 }` |

## İzin Kontrolleri
- **ADMIN**: Tüm metodlara erişim.
- **USER**: `GET` sadece kendi atamalarını görebilir; `POST` ve `DELETE` erişimi yok.

## Örnek İstek
```bash
# Atama ekleme
curl -X POST "https://your-domain.com/api/user-lines" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"userId":5,"lineIds":[1,3]}'
```

## Yanıt Şeması
```json
[ {
  "id": 12,
  "userId": 5,
  "lineId": 1,
  "createdAt": "2025-11-23T22:45:00.000Z"
}, {
  "id": 13,
  "userId": 5,
  "lineId": 3,
  "createdAt": "2025-11-23T22:45:00.000Z"
} ]
```
