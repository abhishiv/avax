import fs from "fs";
import { parse } from "papaparse";
import path from "path";
import { ChainTransaction } from "../../src/types";
import { csvPath, dataDir, getCSVData, sqlitePath } from "../../src/utils";
import { convertCSVToArrow } from "./arrow";
import { convertCSVToParquet } from "./parquet";
import { convertCSVToSqlite } from "./sqlite";
import { convertCSVToPostgres } from "./postgresql";

export async function run() {
  try {
    fs.mkdirSync(dataDir);
  } catch (e) {
    // dir already exists
  }
  const jsonData = await getCSVData();
  await convertCSVToArrow(jsonData, path.join(dataDir, "transactions.arrow"));
  await convertCSVToParquet(
    jsonData,
    path.join(dataDir, "transactions.parquet"),
  );
  await convertCSVToSqlite(jsonData, sqlitePath);
  await convertCSVToPostgres(jsonData);
}

await run();
