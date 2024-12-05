import duckdb from "duckdb";
import { readFileSync } from "fs";
import path from "path";
import { bench, describe } from "vitest";
import pg from "pg";
import { createSqliteDB, sqliteDB } from "../src/utils/index";
import { dataDir } from "../src/utils/index";
console.log("dataDir", dataDir);
import { PrismaClient } from "@prisma/client";

// Function to run Arrow Compute queries
async function queryWithParquet(
  parquetConnection: duckdb.Connection,
  query: string,
) {
  try {
    return new Promise(function (resolve, reject) {
      parquetConnection.all(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    //parquetConnection.close();
  }
}

async function queryWithArrow(
  arrowConnection: duckdb.Connection,
  query: string,
) {
  try {
    return new Promise(function (resolve, reject) {
      arrowConnection.all(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    //arrowConnection.close();
  }
}

async function queryWithSqlite(sqliteDB: sqliteDB, query: string) {
  try {
    const res = await sqliteDB.prepare(query).run();
  } catch (e) {
    console.error(e);
  } finally {
    //sqliteDB.close();
  }
}

async function createParquetDB() {
  const parquetDB = new duckdb.Database(":memory:", {
    max_memory: "1024MB",
    threads: "8",
  });
  return new Promise<duckdb.Connection>(async function (resolve, reject) {
    const parquetConnection = parquetDB.connect();
    parquetConnection.exec(
      `CREATE VIEW transactions AS SELECT * FROM read_parquet("${path.join(
        dataDir,
        "transactions.parquet",
      )}");`,
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(parquetConnection);
        }
      },
    );
  });
}

async function createArrowDB() {
  const arrowDB = new duckdb.Database(":memory:", {
    max_memory: "1024MB",
    threads: "8",
  });
  const arrowConnection = arrowDB.connect();
  const arrowData = readFileSync(path.join(dataDir, "transactions.arrow"));
  return new Promise<duckdb.Connection>(function (resolve, reject) {
    arrowConnection.exec(`INSTALL arrow;LOAD arrow;`, (err, res) => {
      if (err) {
        reject(err);
      } else {
        arrowConnection.register_buffer(
          "transactions",
          [arrowData],
          true,
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(arrowConnection);
            }
          },
        );
      }
    });
  });
}

// Function to run PostgreSQL queries
async function queryWithPostgres(client: PrismaClient, query: string) {
  try {
    const res = await client.$queryRawUnsafe(query);
    return res;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// Function to set up PostgreSQL client and create the view
async function createPostgresDB() {
  const prisma = new PrismaClient();
  return prisma;
}

describe("Transaction List", async () => {
  const arrowDB = await createArrowDB();
  const parquetDB = await createParquetDB();
  const sqliteDB = await createSqliteDB();
  const postgresDB = await createPostgresDB();

  const query = `SELECT * FROM transactions
      WHERE "from" = '0x995BE1CA945174D5bA75410C1E658a41eB13a2FA' or "to" = '0x995BE1CA945174D5bA75410C1E658a41eB13a2FA'
      ORDER BY block_number, tx_index LIMIT 1000`;
  bench("duckdb parquet", async () => {
    await queryWithParquet(parquetDB, query);
  });
  bench("duckdb arrow", async () => {
    await queryWithArrow(arrowDB, query);
  });
  bench("sqlite", async () => {
    await queryWithSqlite(sqliteDB, query);
  });
  bench("postgres", async () => {
    await queryWithPostgres(postgresDB, query);
  });
});

describe("Transaction Count", async () => {
  const arrowDB = await createArrowDB();
  const parquetDB = await createParquetDB();
  const sqliteDB = await createSqliteDB();
  const postgresDB = await createPostgresDB();

  const query = `SELECT count(*) FROM transactions WHERE "from" = '0x995BE1CA945174D5bA75410C1E658a41eB13a2FA' or "to" = '0x995BE1CA945174D5bA75410C1E658a41eB13a2FA'`;
  bench("duckdb parquet", async () => {
    await queryWithParquet(parquetDB, query);
  });
  bench("duckdb arrow", async () => {
    await queryWithArrow(arrowDB, query);
  });
  bench("sqlite", async () => {
    await queryWithSqlite(sqliteDB, query);
  });
  bench("postgres", async () => {
    await queryWithPostgres(postgresDB, query);
  });
});

describe("Transactions Ordered by Value", async () => {
  const arrowDB = await createArrowDB();
  const parquetDB = await createParquetDB();
  const sqliteDB = await createSqliteDB();
  const postgresDB = await createPostgresDB();

  const query = `SELECT * FROM transactions ORDER BY value desc LIMIT 1000`;
  bench("duckdb parquet", async () => {
    await queryWithParquet(parquetDB, query);
  });
  bench("duckdb arrow", async () => {
    await queryWithArrow(arrowDB, query);
  });
  bench("sqlite", async () => {
    await queryWithSqlite(sqliteDB, query);
  });
  bench("postgres", async () => {
    await queryWithPostgres(postgresDB, query);
  });
});
