const crypto = require("crypto");
const prisma = require("../config/prisma");
const { Client } = require("pg");

const ALGORITHM = "aes-256-gcm";
const RAW_KEY = process.env.DB_CREDENTIALS_ENCRYPTION_KEY;
const ENCRYPTION_KEY = Buffer.from(RAW_KEY, "hex");

function decryptPassword(encryptedPassword) {
  const [ivHex, authTagHex, encryptedHex] = encryptedPassword.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
// =============================
// PostgreSQL Version
// =============================
exports.getDatabaseVersion = async (req, res) => {
  let client;

  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid Database ID",
      });
    }

    const database = await prisma.database.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!database) {
      return res.status(404).json({
        message: "Database Not Found",
      });
    }
    const password = decryptPassword(database.password);
    client = new Client({
      host: database.host,
      port: database.port,
      user: database.username,
      password: password,
      database: "postgres",
    });

    await client.connect();

    const result = await client.query("SELECT version();");

    res.json({
      success: true,
      database: database.name,
      version: result.rows[0].version,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
};