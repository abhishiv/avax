import { convertCSVToPostgres } from "../benchmark/scripts/postgresql";
import { getCSVData } from "../src/utils";

export async function run() {
  const jsonData = await getCSVData();
  await convertCSVToPostgres(jsonData);
}

await run();
process.exit();
