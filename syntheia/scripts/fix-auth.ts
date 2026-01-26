import { createClient } from "@libsql/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const client = createClient({
  url: process.env.DATABASE_URL || "file:./local.db",
});

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function fixAuth() {
  try {
    // Check users without accounts
    const users = await client.execute("SELECT id, email, name FROM users");
    const accounts = await client.execute("SELECT user_id FROM accounts");

    const userIdsWithAccounts = new Set(accounts.rows.map((r) => r.user_id));

    const usersWithoutAccounts = users.rows.filter(
      (u) => !userIdsWithAccounts.has(u.id)
    );

    console.log("Users without accounts:", usersWithoutAccounts.length);

    if (usersWithoutAccounts.length === 0) {
      console.log("All users have accounts. Nothing to fix.");
      process.exit(0);
    }

    // Create accounts for users without them
    const defaultPassword = "Syntheia123!"; // Temporary password
    const hashedPassword = await hashPassword(defaultPassword);

    for (const user of usersWithoutAccounts) {
      const accountId = crypto.randomUUID();

      await client.execute({
        sql: `INSERT INTO accounts (id, user_id, account_id, provider_id, password, created_at, updated_at)
              VALUES (?, ?, ?, 'credential', ?, ?, ?)`,
        args: [
          accountId,
          user.id as string,
          user.id as string,
          hashedPassword,
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      });

      console.log(`Created account for: ${user.email}`);
      console.log(`  Temporary password: ${defaultPassword}`);
    }

    console.log("\nDone! Users can now login with the temporary password.");
    console.log("Password: Syntheia123!");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

fixAuth();
