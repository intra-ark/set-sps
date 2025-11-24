# Deployment Guide

## 🚀 Deploying to Vercel

SET SPS is optimized for deployment on [Vercel](https://vercel.com), the creators of Next.js.

### Prerequisites
*   A Vercel account.
*   A GitHub repository with the project code.
*   A Vercel Postgres database (or any PostgreSQL database).
*   A Vercel Blob store (for images).

### Step-by-Step Deployment

1.  **Push to GitHub**
    Ensure your latest code is pushed to your GitHub repository.

2.  **Import Project in Vercel**
    *   Go to your Vercel Dashboard.
    *   Click "Add New..." > "Project".
    *   Import your `set-sps` repository.

3.  **Configure Project**
    *   **Framework Preset**: Next.js
    *   **Root Directory**: `./`
    *   **Build Command**: `prisma generate && next build` (or default `next build` if postinstall is set)
    *   **Install Command**: `npm install`

4.  **Environment Variables**
    Add the following variables in the Vercel Project Settings:

    | Variable | Description |
    | :--- | :--- |
    | `POSTGRES_PRISMA_URL` | Connection string for Prisma (Pooling) |
    | `POSTGRES_URL_NON_POOLING` | Direct connection string |
    | `NEXTAUTH_URL` | Your production URL (e.g., `https://your-app.vercel.app`) |
    | `NEXTAUTH_SECRET` | A strong random string (generate with `openssl rand -base64 32`) |
    | `BLOB_READ_WRITE_TOKEN` | Token for Vercel Blob storage |

5.  **Deploy**
    Click "Deploy". Vercel will build your application and deploy it.

### Database Migrations

During deployment, you might need to apply database migrations. You can do this by adding a build script or running it manually locally against the production database.

**Recommended**: Add `prisma migrate deploy` to your build command or use a `postinstall` script in `package.json`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

*Note*: For production schema changes, it's often safer to run migrations manually or via a dedicated CI/CD pipeline step, rather than during the build process, to avoid downtime.

### Vercel Blob Setup

1.  Go to Vercel Dashboard > Storage.
2.  Create a new Blob store.
3.  Link it to your `set-sps` project.
4.  The `BLOB_READ_WRITE_TOKEN` will be automatically added to your environment variables.
