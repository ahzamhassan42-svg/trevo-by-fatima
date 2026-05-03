// ═══════════════════════════════════════════════════════════
//  🔥 Firebase Configuration for Trevo Store
// ═══════════════════════════════════════════════════════════
//
//  HOW TO SET UP:
//  1. Go to https://console.firebase.google.com
//  2. Create a new project (e.g., "trevo-store")
//  3. Go to Project Settings → Your Apps → click Web icon (</>)
//  4. Register app, then copy the config values below
//  5. Enable Firestore: Build → Firestore Database → Create
//  6. Choose "Start in test mode" and region "asia-south1"
//
// ═══════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCEbkFFbIoatz9JWqGt1JszfOc-iDK_BU8",
  authDomain: "trevo-6d260.firebaseapp.com",
  projectId: "trevo-6d260",
  storageBucket: "trevo-6d260.firebasestorage.app",
  messagingSenderId: "222795353004",
  appId: "1:222795353004:web:dad6a2b99175903c898809"
};

// ── Initialize Firebase ──────────────────────────────────
let db = null;
let firebaseReady = false;

try {
  if (FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" && FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID") {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    firebase.firestore.setLogLevel('silent');
    firebaseReady = true;
  }
} catch (err) {
  // Silent fallback to localStorage if Firebase fails
}

// ── Firestore Helpers ────────────────────────────────────
const ORDERS_COLLECTION = 'orders';

/**
 * Save an order to Firestore (uses orderId as document ID).
 * Returns a promise. Falls back silently if Firebase isn't ready.
 */
async function firestoreSaveOrder(order) {
  if (!firebaseReady) return;
  try {
    await db.collection(ORDERS_COLLECTION).doc(order.orderId).set(order);
  } catch (err) {
    console.error('Firestore write error:', err);
  }
}

/**
 * Update a single field on an order document.
 */
async function firestoreUpdateOrder(orderId, data) {
  if (!firebaseReady) return;
  try {
    await db.collection(ORDERS_COLLECTION).doc(orderId).update(data);
  } catch (err) {
    console.error('Firestore update error:', err);
  }
}

/**
 * Delete an order document.
 */
async function firestoreDeleteOrder(orderId) {
  if (!firebaseReady) return;
  try {
    await db.collection(ORDERS_COLLECTION).doc(orderId).delete();
  } catch (err) {
    console.error('Firestore delete error:', err);
  }
}

/**
 * Delete all order documents (batch).
 */
async function firestoreClearAllOrders() {
  if (!firebaseReady) return;
  try {
    const snapshot = await db.collection(ORDERS_COLLECTION).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  } catch (err) {
    console.error('Firestore batch delete error:', err);
  }
}

/**
 * Get the next sequential order ID from Firestore.
 * Queries the latest order and increments.
 */
async function firestoreNextOrderId() {
  if (!firebaseReady) return null;
  try {
    const snapshot = await db.collection(ORDERS_COLLECTION)
      .orderBy('orderNum', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return { orderId: 'TRV-0001', orderNum: 1 };
    const lastNum = snapshot.docs[0].data().orderNum || 0;
    const next = lastNum + 1;
    return { orderId: 'TRV-' + String(next).padStart(4, '0'), orderNum: next };
  } catch (err) {
    console.error('Firestore query error:', err);
    return null;
  }
}

// ── Products Collection Helpers ──────────────────────────
const PRODUCTS_COLLECTION = 'products';



/**
 * Get all products from Firestore (one-time fetch).
 */
async function firestoreGetAllProducts() {
  if (!firebaseReady) return null;
  try {
    const snapshot = await db.collection(PRODUCTS_COLLECTION).orderBy('id').get();
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error('Firestore products read error:', err);
    return null;
  }
}

/**
 * Save or update a product document (uses product id as doc ID).
 */
async function firestoreSaveProduct(product) {
  if (!firebaseReady) return;
  try {
    await db.collection(PRODUCTS_COLLECTION).doc(String(product.id)).set(product);
  } catch (err) {
    console.error('Firestore product write error:', err);
  }
}

/**
 * Update specific fields on a product document.
 */
async function firestoreUpdateProduct(productId, data) {
  if (!firebaseReady) return;
  try {
    await db.collection(PRODUCTS_COLLECTION).doc(String(productId)).update(data);
  } catch (err) {
    console.error('Firestore product update error:', err);
  }
}

/**
 * Delete a product document.
 */
async function firestoreDeleteProduct(productId) {
  if (!firebaseReady) return;
  try {
    await db.collection(PRODUCTS_COLLECTION).doc(String(productId)).delete();
  } catch (err) {
    console.error('Firestore product delete error:', err);
  }
}

/**
 * Get the next product ID by finding the max existing ID.
 */
async function firestoreNextProductId() {
  if (!firebaseReady) return 1;
  try {
    const snapshot = await db.collection(PRODUCTS_COLLECTION)
      .orderBy('id', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return 1;
    return (snapshot.docs[0].data().id || 0) + 1;
  } catch (err) {
    console.error('Firestore product ID query error:', err);
    return Date.now(); // Fallback to timestamp-based ID
  }
}
