# Admin Guide

## 🛡️ Administration Panel

The Admin Panel is the control center for SET SPS. Only users with the `ADMIN` or `SUPER_USER` role can access this area.

## 🏭 Line Management

### Creating a Line
1.  Navigate to the Admin Dashboard.
2.  Click "Add New Line".
3.  Enter the **Line Name** (e.g., "Assembly Line 1") and **Slug** (e.g., "assembly-1").
4.  Click "Create".

### Editing a Line
*   **Header Image**:
    *   Click on a line to enter its details page.
    *   Expand "Header Image Settings".
    *   **Upload**: Drag & drop or select an image file (PNG, JPG) to upload.
    *   **Remove**: Click "Remove" to delete the current image.
*   **Deleting**: Click the delete icon (trash bin) to remove a line. **Warning**: This deletes all associated products and data!

### Managing Line Data (Years & Products)
After clicking on a line in the Admin Dashboard, you can manage its data by selecting a specific year (e.g., 2024, 2025).

#### 1. Adding Products
*   Click **"Add Product"**.
*   **Create New**: Enter a name to create a brand new product for this line.
*   **Select Existing**: Choose a product that already exists in the system but hasn't been added to this year yet.

#### 2. Importing Data (CSV)
You can bulk upload product data using a CSV file.
*   Click **"Import CSV"**.
*   **Format**: The CSV must have headers and use semicolons (`;`) as delimiters.
*   **Columns**: `Product; DT; UT; NVA; KD; KE; KER; KSR; OT; TSR`
*   **Example**:
    ```csv
    Product;DT;UT;NVA;KD;KE;KER;KSR;OT;TSR
    Product A;10.5;2.1;5.0;0.85;0.90;0.95;0.98;100;Target Met
    ```

#### 3. Editing Metrics
*   Click on a product name to expand its details.
*   Enter values for **DT, UT, NVA, KD, KE, KER, KSR, OT, TSR**.
*   Click **"Save Changes"**.

#### 4. Exporting Data
*   Click **"Export CSV"** to download the current year's data for this line.

## 👥 User Management

### Managing Users
1.  Go to "Manage Users".
2.  **Change Role**: Click "Change Role" to promote/demote users (User <-> Admin).
    *   *Note*: The Super User role cannot be changed.
3.  **Assign Lines**:
    *   Click "Assign Lines" for a specific user.
    *   Select the lines this user should have access to.
    *   Save changes.

## 💾 Data Management

### Backup & Restore
Located in the top-right menu (Storage icon) of the Admin Dashboard.

*   **Export JSON**: Downloads a full JSON backup of the database (Lines, Products, Users, Settings).
*   **Import JSON**: Restores the database from a backup file.
    *   *Warning*: This replaces all existing data (except User accounts).
*   **Export Excel**: Downloads a comprehensive Excel report of all lines, products, and yearly data.

## ⚙️ System Settings

*   **Global Settings**: Configure application-wide parameters (if implemented).
