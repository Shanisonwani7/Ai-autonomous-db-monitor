/**
 * One-time migration script: existing plaintext passwords ko
 * AES-256-GCM se encrypt karke DB me wapas save karta hai.
 *
 * IMPORTANT:
 * - Chalane se pehle DB_CREDENTIALS_ENCRYPTION_KEY .env me set hona chahiye.
 * - Chalane se pehle database ka backup le lo (safety ke liye).
 * - Ye script safe hai — agar koi password already encrypted format
 *   (iv:authTag:ciphertext) me hai, to use skip kar dega, dobara encrypt nahi karega.
 *
 * Run karne ka tareeka:
 *   node migratePasswords.js           -> sirf preview (kuch update nahi karega)
 *   node migratePasswords.js --apply   -> actual update karega
 */

require("dotenv").config();
const crypto = require("crypto");
const prisma = require("../config/prisma"); // path apne project structure ke hisaab se adjust karo

const ALGORITHM = "aes-256-gcm";
const RAW_KEY = process.env.DB_CREDENTIALS_ENCRYPTION_KEY;

if (!RAW_KEY || RAW_KEY.length !== 64) {
  console.error(
    "❌ DB_CREDENTIALS_ENCRYPTION_KEY missing or invalid in .env (must be 64 hex chars). Aborting."
  );
  process.exit(1);
}

const ENCRYPTION_KEY = Buffer.from(RAW_KEY, "hex");

function encryptPassword(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString(
    "hex"
  )}`;
}

// Encrypted format hamesha "hex:hex:hex" (3 parts, sab valid hex) hota hai.
// Plaintext passwords aam taur par is pattern ko match nahi karenge.
const ENCRYPTED_FORMAT_PATTERN = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i;

function isAlreadyEncrypted(value) {
  return typeof value === "string" && ENCRYPTED_FORMAT_PATTERN.test(value);
}

async function migrate() {
  const applyChanges = process.argv.includes("--apply");

  console.log(
    applyChanges
      ? "🚀 Running migration in APPLY mode — DB will be updated.\n"
      : "🔎 Running migration in PREVIEW mode — no changes will be made. Use --apply to actually update.\n"
  );

  const databases = await prisma.database.findMany({
    select: { id: true, name: true, password: true },
  });

  if (!databases.length) {
    console.log("No database records found. Nothing to do.");
    return;
  }

  let toMigrate = 0;
  let alreadyDone = 0;
  let failed = 0;

  for (const db of databases) {
    if (!db.password) {
      console.log(`⚠️  [id=${db.id}] "${db.name}" has no password set, skipping.`);
      continue;
    }

    if (isAlreadyEncrypted(db.password)) {
      alreadyDone++;
      console.log(`✅ [id=${db.id}] "${db.name}" already encrypted, skipping.`);
      continue;
    }

    toMigrate++;
    console.log(`🔧 [id=${db.id}] "${db.name}" is plaintext, needs encryption.`);

    if (applyChanges) {
      try {
        const encrypted = encryptPassword(db.password);
        await prisma.database.update({
          where: { id: db.id },
          data: { password: encrypted },
        });
        console.log(`   ↳ Encrypted and saved.`);
      } catch (err) {
        failed++;
        console.error(`   ↳ ❌ Failed to migrate id=${db.id}:`, err.message);
      }
    }
  }

  console.log("\n---- Summary ----");
  console.log(`Total records:      ${databases.length}`);
  console.log(`Already encrypted:  ${alreadyDone}`);
  console.log(`Needed migration:   ${toMigrate}`);
  if (applyChanges) {
    console.log(`Successfully done:  ${toMigrate - failed}`);
    console.log(`Failed:             ${failed}`);
  } else {
    console.log("\nℹ️  Ye sirf preview tha. Actual update ke liye chalao:");
    console.log("   node migratePasswords.js --apply");
  }
}

migrate()
  .catch((err) => {
    console.error("Migration script crashed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });