const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const USERS_FILE = path.join(__dirname, "data", "users.json");

async function seed() {
  // Ensure data directory exists
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const email = "test@admin.com";
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);

  const users = [{ id: 1, email, password: hash, role: "admin" }];

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log(`Seeded admin user: ${email}`);
}

seed().catch(console.error);
