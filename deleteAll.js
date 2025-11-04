require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI); // Debugging: Check if it's loading

const MONGO_URI = process.env.MONGODB_URI; // Use the correct variable

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGODB_URI is not defined. Check your .env.local file.");
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    deleteAllData();
  })
  .catch(err => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });

async function deleteAllData() {
  try {
    await mongoose.connection.db.dropDatabase();
    console.log("✅ All data deleted successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error deleting data:", error);
    mongoose.connection.close();
  }
}
