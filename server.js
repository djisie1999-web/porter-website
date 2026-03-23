const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "porter-admin-secret-change-me";
const USERS_FILE = path.join(__dirname, "data", "users.json");

// --- Auto-seed on startup if no users file exists ---
function autoSeed() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    const hash = bcrypt.hashSync("admin123", 10);
    const users = [{ id: 1, email: "test@admin.com", password: hash, role: "admin" }];
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log("Auto-seeded admin user: test@admin.com");
  }
}
autoSeed();

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Public paths that don't require auth
const PUBLIC_PATHS = [
  "/", "/index", "/index.html",
  "/login", "/login.html",
  "/api/auth/login",
  "/api/contact",
  "/styles.css", "/main.js"
];

function isPublicPath(reqPath) {
  // Static assets (images, fonts, etc.)
  if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|webp)$/.test(reqPath)) return true;
  // Explicit public paths
  const normalized = reqPath.toLowerCase().replace(/\/$/, "") || "/";
  return PUBLIC_PATHS.includes(normalized);
}

// Auth middleware — protect everything except public paths
app.use((req, res, next) => {
  if (isPublicPath(req.path)) return next();

  const token = req.cookies.porter_token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.clearCookie("porter_token");
    return res.redirect("/login");
  }
});

// --- Auth endpoints ---
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password required" });
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
  res.cookie("porter_token", token, { httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
  return res.json({ success: true });
});

app.get("/api/auth/logout", (req, res) => {
  res.clearCookie("porter_token");
  res.redirect("/login");
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.user || null });
});

// --- Serve static files (after auth middleware) ---
app.use(express.static(path.join(__dirname), {
  extensions: ["html"],
  index: "index.html"
}));

// --- Contact form endpoint ---
app.post("/api/contact", async (req, res) => {
  const { name, email, company, phone, subject, message } = req.body;

  // Validate required fields
  const errors = [];
  if (!name || !name.trim()) errors.push("name is required");
  if (!email || !email.trim()) errors.push("email is required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email is invalid");
  if (!message || !message.trim()) errors.push("message is required");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const contactData = {
    name: name.trim(),
    email: email.trim(),
    company: (company || "").trim(),
    phone: (phone || "").trim(),
    subject: (subject || "").trim(),
    message: message.trim(),
    submitted_at: new Date().toISOString(),
  };

  // 1. Send to webhook (n8n integration) if configured
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });
    } catch (err) {
      console.error("Webhook error:", err.message);
    }
  }

  // 2. Send confirmation email via Resend if API key is configured
  const resendKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL || "hello@getporter.co.uk";

  if (resendKey) {
    try {
      const { Resend } = require("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Porter Website <noreply@getporter.co.uk>",
        to: contactEmail,
        replyTo: contactData.email,
        subject: `Contact form: ${contactData.name}${contactData.company ? ` (${contactData.company})` : ""}`,
        text: [
          `Name: ${contactData.name}`,
          `Email: ${contactData.email}`,
          `Company: ${contactData.company || "N/A"}`,
          `Phone: ${contactData.phone || "N/A"}`,
          `Subject: ${contactData.subject || "N/A"}`,
          "",
          contactData.message,
        ].join("\n"),
      });
    } catch (err) {
      console.error("Resend error:", err);
      return res.status(500).json({ success: false, errors: ["Failed to send email. Please try again."] });
    }
  } else {
    console.log("--- Contact form submission ---");
    console.log(JSON.stringify(contactData, null, 2));
    console.log("------------------------------");
  }

  return res.json({ success: true });
});

// Fallback to index.html for unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Porter website running on port ${PORT}`);
});
