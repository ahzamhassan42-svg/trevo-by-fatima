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

## 2. Managing Products

All products are defined in a `PRODUCTS` array inside `index.html`.

### How to Add a New Product
```javascript
  {
    id: 26,                    // Must be a unique number
    name: 'Product Name Here',
    category: 'Kitchen',       // Examples: Kitchen, Home Essentials, Cleaning, Storage
    price: 500,                // Selling price (numbers only, no commas)
    oldPrice: 800,             // Original price (use null if no discount)
    img: 'https://link-to-image.jpg',
    desc: 'A short description of the product.',
    badge: 'sale',             // Options: 'sale', 'new', 'hot', or null
    featured: true             // true = show on Home page, false = Products page only
  },
```

### Removing a Product
Delete the corresponding `{ id: ..., name: ... }` block from the `PRODUCTS` array.

### Changing Product Images
Replace the URL inside the `img: '...'` property with a direct image link (e.g. from Imgur or your Shopify CDN).

---

## 3. Changing Contact Information

### WhatsApp Number
Run a **Find and Replace** in your code editor:
- Replace `923007041451` with your new number (international format, no `+` sign)
- Replace the formatted text `+92 300 704 1451` with the new formatted number

### Address & Email
Find the `<div class="page" id="page-contact">` block in `index.html` and update the text in the contact tiles.

---

## 4. Firebase Setup (Cloud Order Sync)

Orders are synced via **Firebase Firestore** so that when a customer places an order, it appears in your admin panel in real-time on any device.

### Current Firebase Project
The store is already connected to the live Firebase project:

| Setting | Value |
|---|---|
| Project ID | `trevo-6d260` |
| Auth Domain | `trevo-6d260.firebaseapp.com` |
| Storage Bucket | `trevo-6d260.firebasestorage.app` |

Config is stored in `firebase-config.js` — no changes needed unless you switch projects.

### Firestore Security Rules
The `firestore.rules` file contains the correct public-ready rules. To apply them:
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → select `trevo-6d260`
2. Go to **Firestore Database → Rules**
3. Replace everything with the contents of `firestore.rules`
4. Click **Publish**

These rules allow customers to place orders but block anyone from reading or modifying the full order list publicly.

### How It Works
- **Customer places an order** → saved to Firestore cloud database
- **Admin panel** → reads orders in **real-time** (no refresh needed)
- **Fallback** → if Firebase isn't reachable, orders fall back to localStorage

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
- **Firebase status banner** — shows whether you're connected to cloud or using offline mode
- **Real-time updates** — new orders appear automatically without refreshing
- **Summary cards** — total orders, total revenue, pending count, delivered count
- **Orders table** — shows all orders with items, delivery, total, and status
- **Status management** — click any status badge to cycle: Pending → Confirmed → Shipped → Delivered
- **Search** — filter orders by order ID or product name
- **Status filter** — filter by order status
- **Delete** — remove individual orders or clear all

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
