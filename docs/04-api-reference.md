# API Reference

The application uses Next.js App Router API Routes. All endpoints are located in `src/app/api/`.

## 🏭 Lines

### `GET /api/lines`
Fetches all production lines.
*   **Response**: `Line[]`

### `POST /api/lines`
Creates a new production line.
*   **Body**: `{ name: string, slug: string }`
*   **Auth**: Admin only.

### `PATCH /api/lines/[id]`
Updates a line (e.g., header image).
*   **Body**: `{ headerImageUrl: string | null }`
*   **Auth**: Admin only.

### `DELETE /api/lines/[id]`
Deletes a line and its cascade data.
*   **Auth**: Admin only.

## 📦 Products

### `GET /api/products`
Fetches products, optionally filtered by line.
*   **Query**: `?lineId=123`
*   **Response**: `Product[]` (Optimized: selects only needed fields)

## 👥 Users

### `GET /api/users`
Fetches all users.
*   **Auth**: Admin only.

### `PATCH /api/users`
Updates user role.
*   **Body**: `{ userId: string, role: 'ADMIN' | 'USER' }`
*   **Auth**: Admin only.

## 💾 Data & Backup

### `GET /api/backup/export`
Downloads full database backup as JSON.
*   **Auth**: Admin only.

### `POST /api/backup/import`
Restores database from JSON backup.
*   **Body**: JSON Backup Data
*   **Auth**: Admin only.

### `GET /api/backup/excel`
Downloads Excel export of all data.
*   **Auth**: Admin only.

### `POST /api/upload`
Uploads a file to Vercel Blob.
*   **Body**: `FormData` (file)
*   **Auth**: Admin only.
