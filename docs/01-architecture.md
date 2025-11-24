# Architecture & Technology Stack

## Overview

SET SPS is built as a server-side rendered (SSR) React application using Next.js. It leverages the App Router for routing and layouts, providing a robust and scalable architecture.

## 🏗️ Technology Stack Details

### Frontend
*   **Next.js 14+**: Uses the latest App Router features, Server Components, and Server Actions.
*   **React 19**: Leveraging the latest React features.
*   **Tailwind CSS**: Utility-first CSS framework for rapid and responsive UI development.
*   **Chart.js / Recharts**: (If applicable) Used for rendering the waterfall and bar charts on the dashboard.
*   **Framer Motion**: (If applicable) Used for smooth animations and transitions.

### Backend
*   **Next.js API Routes**: Serverless functions handling API requests (`src/app/api/...`).
*   **Prisma ORM**: Type-safe database client for PostgreSQL.
*   **NextAuth.js**: Secure authentication system supporting credentials-based login and session management.

### Database
*   **PostgreSQL**: Relational database storing:
    *   Users & Roles
    *   Production Lines
    *   Products
    *   Yearly Data (SPS metrics)
    *   Global Settings

### Storage
*   **Vercel Blob**: Object storage solution for hosting user-uploaded images (e.g., Line header images).

## 📂 Project Structure

```
set-sps/
├── docs/                   # Project documentation
├── prisma/
│   ├── schema.prisma       # Database schema definition
│   └── migrations/         # Database migrations
├── public/                 # Static assets (images, fonts)
├── src/
│   ├── app/                # Next.js App Router pages & API
│   │   ├── admin/          # Admin panel routes
│   │   ├── api/            # API endpoints
│   │   ├── (auth)/         # Authentication routes
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage (Dashboard)
│   ├── components/         # Reusable React components
│   ├── lib/                # Utility functions & configs
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client instance
│   │   └── utils.ts        # Helper functions
│   └── types/              # TypeScript type definitions
├── .env                    # Environment variables
├── next.config.mjs         # Next.js configuration
├── package.json            # Dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```

## 🗄️ Database Schema

The core models in `prisma/schema.prisma` are:

*   **User**: System users with roles (`ADMIN`, `USER`, `SUPER_USER`).
*   **Line**: Production lines (e.g., "F-400").
*   **Product**: Products manufactured on lines.
    *   *Relation*: Belongs to a `Line`.
    *   *Cascade Delete*: Deleting a Line deletes its Products.
*   **YearData**: Yearly performance metrics for products.
*   **UserLine**: Many-to-many relationship between Users and Lines (assignments).

## 🔒 Security

*   **Authentication**: Protected routes via NextAuth middleware.
*   **Authorization**: Role-based access control (RBAC) ensures only Admins can modify data.
*   **Data Integrity**: Database constraints and cascade deletes maintain data consistency.
