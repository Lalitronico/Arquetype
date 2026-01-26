import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./local.db",
});

async function check() {
  try {
    const users = await client.execute("SELECT id, email, name FROM users");
    console.log("Users found:", users.rows.length);
    users.rows.forEach((row) => {
      console.log(`  - ${row.email} (${row.name || "no name"})`);
    });

    const accounts = await client.execute(
      "SELECT a.id, a.user_id, a.provider_id, a.password, u.email FROM accounts a JOIN users u ON a.user_id = u.id"
    );
    console.log("\nAccounts found:", accounts.rows.length);
    accounts.rows.forEach((row) => {
      console.log(
        `  - Email: ${row.email}, Provider: ${row.provider_id}, Has password: ${row.password ? "Yes" : "No"}`
      );
    });

    const orgs = await client.execute("SELECT id, name, slug FROM organizations");
    console.log("\nOrganizations found:", orgs.rows.length);
    orgs.rows.forEach((row) => {
      console.log(`  - ${row.name} (${row.slug})`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

check();
