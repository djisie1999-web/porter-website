const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
      // Non-blocking — don't fail the request if webhook is down
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
    // No API key — log to console
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
