# Hat (Line) API

Bu dokümantasyon, **Hat (Line) API**'nin kullanımını ve endpointlerini açıklar.

## Endpointler

| Metod | URL | Açıklama |
|-------|-----|----------|
| `GET` | `/api/lines` | Tüm hatları listeler. Adminler `?all=true` parametresiyle tüm hatları alabilir. |
| `GET` | `/api/lines/{id}` | Belirli bir hatın detaylarını getirir. |
| `POST` | `/api/lines` | Yeni hat oluşturur (admin). |
| `PUT` | `/api/lines/{id}` | Mevcut hatı günceller (admin). |
| `DELETE` | `/api/lines/{id}` | Hatı siler (admin). |

## İzin Kontrolleri
- **ADMIN**: Tüm metodlara erişim.
- **USER**: Sadece kendisine atanan hatları (`GET /api/lines`) görebilir.

## Örnek İstek
```bash
curl -X GET "https://your-domain.com/api/lines?all=true" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Yanıt Şeması
```json
[ {
  "id": 1,
  "name": "F400",
  "slug": "f400",
  "headerImage": "https://example.com/img.png"
} ]
```
