# Sistem Mimarisi

> Bu dokümantasyon, SPS Analiz Sistemi'nin teknik mimarisini, kullanılan teknolojileri ve bileşenler arasındaki etkileşimleri açıklar.

## Genel Bakış
- **Frontend**: Next.js 16 (React 18) – Sunucu tarafı render (SSR) ve statik site üretimi (SSG) destekli.
- **Backend**: Next.js API Routes – Node.js ortamında çalışır, Prisma ORM aracılığıyla PostgreSQL veritabanına bağlanır.
- **Veritabanı**: PostgreSQL – Prisma ile tip güvenliği ve migration yönetimi.
- **Kimlik Doğrulama**: NextAuth.js (JWT) – Rol‑bazlı (ADMIN / USER) erişim kontrolü.
- **Deployment**: Vercel – Otomatik CI/CD, serverless fonksiyonlar ve statik dosyalar.

## Katmanlar
```mermaid
flowchart TD
    subgraph Frontend[Frontend (Next.js)]
        A[Dashboard UI] --> B[Docs Page]
        A --> C[Admin Panel]
        A --> D[User Panel]
    end
    subgraph Backend[Backend (API Routes)]
        E[/api/auth/] --> F[Session Management]
        E --> G[Role Checks]
        H[/api/lines/] --> I[Line CRUD]
        J[/api/user-lines/] --> K[User‑Line Assignment]
        L[/api/products/] --> M[Product CRUD]
        N[/api/year-data/] --> O[Year Data CRUD]
    end
    subgraph DB[PostgreSQL]
        P[User]
        Q[Line]
        R[Product]
        S[YearData]
        T[UserLine]
    end
    subgraph Auth[NextAuth]
        U[JWT Tokens]
    end
    
    Frontend --> Backend
    Backend --> DB
    Auth --> Backend
    Auth --> Frontend
```

## Bileşen Detayları
### 1. Dashboard UI
- Kullanıcıya atanan hatları (lines) listeler.
- Grafikler ve veri giriş formları içerir.
- Dark/Light tema desteği.

### 2. Admin Panel
- **Hat Yönetimi**: `/admin` – hat ekleme, düzenleme, silme, başlık resmi URL'si.
- **Kullanıcı Yönetimi**: `/admin/users` – kullanıcı oluşturma, şifre sıfırlama, hat atama.
- **Ayarlar**: `/admin/settings` – global ayarlar (ör. varsayılan birimler).

### 3. API Routes
- **/api/auth/** – oturum açma, oturum kapama, JWT yenileme.
- **/api/lines/** – hat CRUD, `?all=true` adminler için tüm hatları getirir.
- **/api/user-lines/** – kullanıcı‑hat atama (GET, POST, DELETE).
- **/api/products/** – ürün CRUD, line ilişkisi.
- **/api/year-data/** – yıllık veri CRUD, `unique(productId, year)`.

### 4. Veritabanı Şeması
- Prisma `schema.prisma` dosyasında tanımlı modeller: `User`, `Line`, `Product`, `YearData`, `UserLine`, `GlobalSettings`.
- **Cascade Delete** kuralları: Line → Product → YearData, User → UserLine.
- **Unique Constraints**: `User.username`, `Line.slug`, `YearData.[productId, year]`, `UserLine.[userId, lineId]`.

## Güvenlik ve Performans
- **Rol‑bazlı erişim kontrolü** (`isAdmin`, `canUserAccessLine`).
- **JWT** ile stateless oturum yönetimi.
- **Prisma query optimization** – `include` ve `select` ile N+1 problemini önleme.
- **Rate limiting** – Vercel edge middleware ile istek sınırlandırma.
- **CORS** – sadece aynı origin’e izin verilir.

## Deployment
- `npm run build` → Vercel otomatik olarak `next build` ve `next start` çalıştırır.
- Prisma migrationları `npx prisma migrate deploy` ile prod ortamına uygulanır.
- Environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`) Vercel dashboard’da tanımlanır.

## Sonuç
Bu mimari, **yüksek ölçeklenebilirlik**, **güvenli rol bazlı erişim**, **kolay geliştirme** ve **hızlı dağıtım** sağlar. Yeni özellik eklemek için sadece ilgili API route ve UI bileşenini genişletmek yeterlidir.
