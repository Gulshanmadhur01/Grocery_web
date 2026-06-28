import { readDb } from './db.js';

async function verify() {
  console.log("🚀 Running Backend database verification...");
  
  const db = await readDb();
  
  // Test Categories
  console.log(`- Verified Categories: Count = ${db.categories.length}`);
  if (db.categories.length !== 8) {
    throw new Error(`Expected 8 categories, but found ${db.categories.length}`);
  }
  
  // Test Products
  console.log(`- Verified Products: Count = ${db.products.length}`);
  if (db.products.length !== 14) {
    throw new Error(`Expected 14 seed products, but found ${db.products.length}`);
  }
  
  // Test lowdb structure
  if (!db.users || !db.orders) {
    throw new Error("Missing users or orders arrays in data.json schemas");
  }
  console.log("- Schema structures validated successfully.");
  console.log("✅ All backend unit checks passed!");
}

verify().catch(err => {
  console.error("❌ Verification failed:", err.message);
  process.exit(1);
});
