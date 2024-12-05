import BetterSqlite from "better-sqlite3";
import fs from "fs";
import { ChainTransaction } from "../../src/types";

// Function to create and populate the database
export async function convertCSVToSqlite(
  jsonData: ChainTransaction[],
  dbFileName: string,
) {
  try {
    fs.writeFileSync(dbFileName, ""); // Clear file if it exists
  } catch (e) {
    // File might not exist, or permissions issue
  }

  const db = new BetterSqlite(dbFileName);

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        timestamp TEXT,
        status BOOLEAN,
        block_number INTEGER,
        tx_index INTEGER,
        "from" TEXT,
        "to" TEXT,
        value INTEGER,
        gas_limit INTEGER,
        gas_used INTEGER,
        gas_price INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_from ON transactions("from");
      CREATE INDEX IF NOT EXISTS idx_to ON transactions("to");
    `);

    const insertStatement = db.prepare(`
      INSERT INTO transactions (timestamp, status, block_number, tx_index, "from", "to", value, gas_limit, gas_used, gas_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((batch: ChainTransaction[]) => {
      for (const row of batch) {
        insertStatement.run(
          row.timestamp,
          row.status,
          row.block_number,
          row.tx_index,
          row.from,
          row.to,
          row.value,
          row.gas_limit,
          row.gas_used,
          row.gas_price,
        );
      }
    });

    const batchSize = 10000;
    // Insert in batches of 1000
    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize);
      insertMany(batch);
    }
  } catch (e) {
    throw e;
  } finally {
    db.close();
  }
}
