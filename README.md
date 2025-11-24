# SET SPS - Manufacturing Time Definition System

SET SPS is a modern web application designed for Schneider Electric to manage and analyze manufacturing time definitions (SPS) across production lines. It provides a comprehensive dashboard for visualizing efficiency metrics (KD, UT, NVA, etc.) and an admin panel for managing lines, products, and users.

![Dashboard Preview](/schneider_f400_diagram.png)

## 🚀 Key Features

*   **Interactive Dashboard**: Visualize SPS data with dynamic charts and year-over-year comparisons.
*   **Role-Based Access Control**:
    *   **Super User**: Full access, immutable role.
    *   **Admin**: Manage lines, products, users, and system settings.
    *   **User**: View assigned lines and read-only data.
*   **Line Management**:
    *   Create, update, and delete production lines.
    *   **Image Upload**: Upload custom header images for each line (powered by Vercel Blob).
    *   **User Assignment**: Assign specific users to specific lines.
*   **Data Management**:
    *   **Excel Export**: Export all system data to Excel.
    *   **Backup & Restore**: Full JSON database backup and restore functionality.
*   **Performance**: Optimized for speed with efficient database queries and loading states.

## 🛠️ Technology Stack

*   **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (via Neon/Vercel Postgres)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
*   **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
*   **Deployment**: [Vercel](https://vercel.com/)

## 🏁 Getting Started

### Prerequisites

*   Node.js 18+
*   npm or yarn
*   PostgreSQL database (local or cloud)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/intra-ark/set-sps.git
    cd set-sps
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    # Database
    POSTGRES_PRISMA_URL="postgresql://user:password@host:port/dbname?sslmode=require"
    POSTGRES_URL_NON_POOLING="..."

    # NextAuth
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key"

    # Vercel Blob (for image uploads)
    BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
    ```

4.  **Initialize Database**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

5.  **Seed Database (Optional)**
    ```bash
    npx prisma db seed
    ```

6.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

For more detailed information, check the `docs/` folder:

*   [Architecture & Tech Stack](docs/01-architecture.md)
*   [User Guide](docs/02-user-guide.md)
*   [Admin Guide](docs/03-admin-guide.md)
*   [API Reference](docs/04-api-reference.md)
*   [Deployment](docs/05-deployment.md)

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
