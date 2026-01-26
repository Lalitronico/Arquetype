import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./local.db",
});

async function createPanelConfigsTable() {
  console.log("Creating panel_configs table...");

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS panel_configs (
        id TEXT PRIMARY KEY NOT NULL,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        config TEXT NOT NULL,
        is_template INTEGER DEFAULT 0,
        industry TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);

    console.log("Table created successfully!");

    // Verify table exists
    const result = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='panel_configs'
    `);

    if (result.rows.length > 0) {
      console.log("Verified: panel_configs table exists");
    }
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

createPanelConfigsTable();
