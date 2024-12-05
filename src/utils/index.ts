import BetterSqlite, { Database } from "better-sqlite3";
import path from "path";
import { ChainTransaction } from "../types/index.js";
import fs from "fs";
import papa from "papaparse";
import { PrismaClient } from "@prisma/client";

export const dataDir = path.join(process.cwd(), "./data");
export const csvPath = path.join(dataDir, "43114_txs.csv");
export const sqlitePath = path.join(dataDir, "db.sqlite");

export const prisma = new PrismaClient();

export type sqliteDB = Database;

export async function createSqliteDB(): Promise<Database> {
  const db: Database = new BetterSqlite(sqlitePath);
  db.pragma("journal_mode = WAL");
  return db;
}

export async function getCSVData(): Promise<ChainTransaction[]> {
  const csvData = fs.readFileSync(csvPath, "utf8");
  const jsonData = papa.parse<ChainTransaction>(csvData, {
    header: true,
    dynamicTyping: true,
  }).data;
  return jsonData;
}
