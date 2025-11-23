# Rol Bazlı Yetkilendirme Sistemi

## Genel Bakış

SPS Analiz Sistemi, iki seviyeli rol bazlı erişim kontrol sistemi kullanır:
1. **ADMIN** - Tam yetki
2. **USER** - Sınırlı yetki (sadece atanan hatlar)

## Roller ve Yetkiler

### 🔐 ADMIN Rolü

#### Tam Yetkiler
- ✅ **Tüm hatlara erişim** - Hat ataması gerekmez
- ✅ **Hat yönetimi** - Ekleme, düzenleme, silme
- ✅ **Kullanıcı yönetimi** - Ekleme, silme, şifre sıfırlama
- ✅ **Hat ataması** - Kullanıcılara hat atama/kaldırma
- ✅ **Tüm verileri görüntüleme** - Tüm hatların tüm verileri
- ✅ **Tüm verileri düzenleme** - Kısıtlama yok

#### Admin Özellikleri
```typescript
// Admin kontrolü
if (session?.user?.role === 'ADMIN') {
    // Tüm hatlara erişim
    // Tüm yönetim özellikleri aktif
}
```

### 👤 USER Rolü

#### Sınırlı Yetkiler
- ✅ **Atanan hatlara erişim** - Sadece admin tarafından atanan hatlar
- ✅ **Atanan hat verilerini görüntüleme**
- ✅ **Atanan hat verilerini düzenleme**
- ✅ **Kendi şifresini değiştirme**
- ❌ **Hat ekleme/silme** - Yasak
- ❌ **Kullanıcı yönetimi** - Yasak
- ❌ **Hat ataması** - Yasak
- ❌ **Atanmayan hatlara erişim** - Yasak

#### User Kontrolü
```typescript
// Kullanıcının hata erişimi var mı?
const hasAccess = await canUserAccessLine(userId, lineId, userRole);
if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

## Yetki Matrisi

| Özellik | ADMIN | USER |
|---------|-------|------|
| Tüm hatları görüntüleme | ✅ | ❌ |
| Atanan hatları görüntüleme | ✅ | ✅ |
| Hat ekleme | ✅ | ❌ |
| Hat silme | ✅ | ❌ |
| Hat düzenleme (isim/slug) | ✅ | ❌ |
| Hat resmi güncelleme | ✅ | ✅* |
| Ürün ekleme | ✅ | ✅* |
| Ürün silme | ✅ | ✅* |
| Veri girişi | ✅ | ✅* |
| Veri düzenleme | ✅ | ✅* |
| CSV import/export | ✅ | ✅* |
| Kullanıcı ekleme | ✅ | ❌ |
| Kullanıcı silme | ✅ | ❌ |
| Şifre sıfırlama (başkası) | ✅ | ❌ |
| Şifre değiştirme (kendi) | ✅ | ✅ |
| Hat ataması yapma | ✅ | ❌ |
| Dashboard görüntüleme | ✅ | ✅* |

*\* Sadece atanan hatlar için*

## İzin Kontrol Mekanizması

### 1. Kimlik Doğrulama (Authentication)
```typescript
// Her API isteğinde session kontrolü
const session = await getServerSession(authOptions);
if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Rol Kontrolü (Role Check)
```typescript
// Admin yetkisi gereken işlemler
if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}
```

### 3. Hat Erişim Kontrolü (Line Access)
```typescript
// Kullanıcının hata erişimi kontrolü
import { canUserAccessLine } from '@/lib/permissions';

const userId = parseInt(session.user.id);
const userRole = session.user.role;
const hasAccess = await canUserAccessLine(userId, lineId, userRole);

if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this line' }, { status: 403 });
}
```

## Veritabanı İlişkileri

### UserLine Tablosu
```prisma
model UserLine {
  id        Int      @id @default(autoincrement())
  userId    Int
  lineId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  line      Line     @relation(fields: [lineId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, lineId])
}
```

### İlişki Diyagramı
```
User (1) ←→ (N) UserLine (N) ←→ (1) Line

Admin User:
- UserLine kaydı YOK (tüm hatlara erişir)

Normal User:
- UserLine kayıtları VAR (sadece atanan hatlar)
```

## Kullanım Senaryoları

### Senaryo 1: Admin Tüm Hatlara Erişir
```typescript
// Admin için hat listesi
const lines = await getUserLines(adminUserId, 'ADMIN');
// Sonuç: Tüm hatlar döner (UserLine kontrolü yapılmaz)
```

### Senaryo 2: User Sadece Atanan Hatlara Erişir
```typescript
// Normal user için hat listesi
const lines = await getUserLines(userId, 'USER');
// Sonuç: Sadece UserLine tablosunda kayıtlı hatlar döner
```

### Senaryo 3: Yetkisiz Erişim Denemesi
```typescript
// User, atanmamış bir hata erişmeye çalışır
const hasAccess = await canUserAccessLine(userId, unauthorizedLineId, 'USER');
// Sonuç: false
// API: 403 Forbidden
```

### Senaryo 4: Hat Ataması
```typescript
// Admin, kullanıcıya hatları atar
POST /api/user-lines
{
  "userId": 2,
  "lineIds": [1, 3, 5]  // F400, Okken, Line 5
}
// Sonuç: Kullanıcı artık bu 3 hata erişebilir
```

## Güvenlik Önlemleri

### 1. Middleware Koruması
```typescript
// middleware.ts
export const config = {
  matcher: '/admin/:path*'
};
// Tüm /admin rotaları kimlik doğrulama gerektirir
```

### 2. API Seviyesinde Kontrol
- Her API endpoint'i session kontrolü yapar
- Rol bazlı yetki kontrolü
- Hat erişim kontrolü

### 3. Frontend Seviyesinde Gizleme
- Admin özellikleri sadece adminlere gösterilir
- Yetkisiz butonlar gizlenir
- Ancak güvenlik backend'de sağlanır

### 4. Cascade Delete
```prisma
onDelete: Cascade
```
- Kullanıcı silinirse → UserLine kayıtları silinir
- Hat silinirse → UserLine kayıtları silinir
- Veri tutarlılığı sağlanır

## Best Practices

### ✅ Yapılması Gerekenler
1. Her API isteğinde session kontrolü
2. Admin işlemlerinde rol kontrolü
3. Veri işlemlerinde hat erişim kontrolü
4. Frontend'de de kontroller (UX için)
5. Hata mesajlarında detay vermeme (güvenlik)

### ❌ Yapılmaması Gerekenler
1. Sadece frontend kontrolüne güvenme
2. Session kontrolünü atlama
3. Hata mesajlarında sistem detayı verme
4. Kullanıcı ID'sini client'tan alma (session kullan)
5. Admin kontrolünü bypass etmeye çalışma

## Örnek Kod

### Permission Helper Kullanımı
```typescript
import { canUserAccessLine, getUserLines, isAdmin } from '@/lib/permissions';

// Admin mi kontrol et
if (isAdmin(session)) {
    // Admin işlemleri
}

// Kullanıcının hata erişimi var mı?
const hasAccess = await canUserAccessLine(
    userId,
    lineId,
    userRole
);

// Kullanıcının tüm hatlarını getir
const userLines = await getUserLines(userId, userRole);
```

### API Endpoint Örneği
```typescript
export async function PATCH(request: NextRequest) {
    // 1. Kimlik doğrulama
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Hat erişim kontrolü
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    const hasAccess = await canUserAccessLine(userId, lineId, userRole);
    
    if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 3. İşlem yapılabilir
    // ...
}
```

## Sorun Giderme

### "Access denied to this line" Hatası
**Sebep**: Kullanıcının hata erişimi yok
**Çözüm**: Admin, kullanıcıya hatı atamalı

### "Admin access required" Hatası
**Sebep**: İşlem admin yetkisi gerektiriyor
**Çözüm**: Admin hesabıyla giriş yapın

### Kullanıcı hiçbir hat göremiyor
**Sebep**: Kullanıcıya hat atanmamış
**Çözüm**: Admin `/admin/users` sayfasından hat ataması yapmalı

## İlgili Dokümantasyon
- [API Dokümantasyonu](./10-api-genel.md)
- [Kullanıcı-Hat Atama API](./16-api-user-lines.md)
- [Admin Kullanıcı Kılavuzu](./04-admin-kilavuzu.md)
