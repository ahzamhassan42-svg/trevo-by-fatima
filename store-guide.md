# Trevo Store Maintenance Guide

This document explains how to update your store's products, layout, and configuration.

---

## 1. Changing the Shipping Cost

The shipping cost is hardcoded into the JavaScript logic for the cart and WhatsApp checkout.

1. Open `index.html` in your text editor.
2. Find the `renderCart()` function. You will see:
   ```javascript
   const total = getTotal() + (cart.length > 0 ? 199 : 0);
   ```
   Change `199` to your new shipping cost.

3. Find the `checkoutWhatsApp()` function. Update the `199` in `getTotal() + 199` and the text `Shipping: Rs. 199` to your new amount.

4. Update the visual display on the cart page:
   ```html
   <div class="summary-row"><span>Delivery</span><span style="font-weight:600;">Rs. 199</span></div>
   ```

---

## 2. Managing Products (Inventory)

Products are now managed through **Firebase Firestore** and can be edited directly from the Admin Panel.

### How It Works
- Products are stored in the `products` collection in Firestore
- The storefront (`index.html`) loads products dynamically from Firestore on every page load
- The admin panel has a dedicated **Inventory** tab for full product management
- A seed dataset is embedded in `index.html` — on first visit, it auto-populates Firestore if the collection is empty

### Admin Panel — Inventory Tab
1. Log in to the Admin Panel (`admin.html`)
2. Click the **🏪 Inventory** tab
3. From here you can:
   - **View all products** with image, name, category, price, quantity, badge, and featured status
   - **Edit quantity inline** — just change the number in the Qty column
   - **Add a new product** — click "＋ Add Product" and fill in the form
   - **Edit a product** — click the ✏️ button on any row
   - **Delete a product** — click the 🗑 button on any row
   - **Search & filter** by name or category

### Product Fields
| Field | Required | Description |
|---|---|---|
| Name | ✅ | Product display name |
| Category | ✅ | e.g. Kitchen, Home Essentials, Cleaning, Storage |
| Price | ✅ | Selling price in Rs. |
| Old Price | ❌ | Original price for discount display (leave empty if no discount) |
| Image URL | ✅ | Direct link to product image |
| Short Description | ✅ | One-line summary shown on product cards |
| Detailed HTML | ❌ | Rich HTML body shown in product detail modal |
| Badge | ❌ | Options: sale, new, hot, or none |
| Featured | ❌ | If checked, product appears on the homepage |
| Quantity | ❌ | Inventory count (only visible to admin, not customers) |

### Adding Products via Code (Legacy)
Products can still be added to the `SEED_PRODUCTS` array in `index.html` for initial seeding. However, for day-to-day management, use the Admin Panel.

---

## 3. Changing Contact Information

### WhatsApp Number
Run a **Find and Replace** in your code editor:
- Replace `923007041451` with your new number (international format, no `+` sign)
- Replace the formatted text `+92 300 704 1451` with the new formatted number

### Address & Email
Find the `<div class="page" id="page-contact">` block in `index.html` and update the text in the contact tiles.

---

## 4. Firebase Setup (Cloud Sync)

Orders and products are synced via **Firebase Firestore** so that data is consistent across all devices.

### Current Firebase Project
The store is already connected to the live Firebase project:

| Setting | Value |
|---|---|
| Project ID | `trevo-6d260` |
| Auth Domain | `trevo-6d260.firebaseapp.com` |
| Storage Bucket | `trevo-6d260.firebasestorage.app` |

Config is stored in `firebase-config.js` — no changes needed unless you switch projects.

### Firestore Collections
| Collection | Purpose |
|---|---|
| `orders` | Customer orders (created at checkout, managed in admin) |
| `products` | Product catalog (auto-seeded, managed in admin Inventory tab) |

### Firestore Security Rules
The `firestore.rules` file contains the correct public-ready rules. To apply them:
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → select `trevo-6d260`
2. Go to **Firestore Database → Rules**
3. Replace everything with the contents of `firestore.rules`
4. Click **Publish**

### How It Works
- **Customer visits store** → products loaded from Firestore in real-time
- **Customer places an order** → saved to Firestore cloud database
- **Admin panel** → reads orders and products in **real-time** (no refresh needed)
- **Fallback** → if Firebase isn't reachable, seed products are used as fallback

---

## 5. Order Tracking

Every time a customer checks out via WhatsApp, the order is saved to Firebase automatically. Each order includes:

- **Order ID** (auto-generated, e.g. `TRV-0001`)
- **Date & Time**
- **Items** (product name, quantity, price)
- **Delivery type** (Standard or Urgent)
- **Subtotal, Delivery cost, Total**
- **Status** (Pending by default)

---

## 6. Admin Panel

The admin panel is at `admin.html` (e.g. `yoursite.com/admin.html`).

### Login
| Field | Value |
|---|---|
| URL | `yoursite.com/admin.html` |
| Password | `trevo.admin@2025` |

> **Security note:** The password is stored as a SHA-256 hash in the source code, so it is not readable by anyone who views the page source.

### Changing the Admin Password
1. Compute the SHA-256 hash of your new password (use [sha256.online](https://emn178.github.io/online-tools/sha256.html))
2. Open `admin.html` and find:
   ```javascript
   const ADMIN_HASH = '11b1545980adcbeeec9672ef356395b20d2b0fe9edd486e2e5e3ed864a7a29e8';
   ```
3. Replace the hash string with the new hash

### Dashboard Features

#### Orders Tab (📦)
- **Firebase status banner** — shows whether you're connected to cloud or using offline mode
- **Real-time updates** — new orders appear automatically without refreshing
- **Summary cards** — total orders, total revenue, pending count, delivered count
- **Orders table** — shows all orders with items, delivery, total, and status
- **Status management** — click any status badge to cycle: Pending → Confirmed → Shipped → Delivered
- **Search** — filter orders by order ID or product name
- **Status filter** — filter by order status
- **Delete** — remove individual orders or clear all

#### Inventory Tab (🏪)
- **Summary cards** — total products, categories, low stock (≤5), out of stock (0)
- **Products table** — shows all products with image, name, category, price, quantity, badge, featured
- **Inline quantity editing** — change quantity directly in the table
- **Add product** — modal form with all product fields
- **Edit product** — pre-filled modal for updating existing products
- **Delete product** — remove with confirmation
- **Search & filter** — by name or category

---

## 7. CSV Export & Import

### Exporting Orders
1. Log in to the Admin Panel
2. Click **"📥 Export CSV"** in the top toolbar
3. A file named `trevo_orders_YYYY-MM-DD.csv` will download

### Importing Orders
1. Log in to the Admin Panel
2. Click **"📤 Import CSV"** in the top toolbar
3. Upload a previously exported CSV file (drag & drop or click to browse)
4. Duplicate orders (same Order ID) are automatically skipped

### CSV File Format
```
Order ID, Date, Items, Quantities, Prices, Delivery Type, Delivery Cost, Subtotal, Total, Status
```
