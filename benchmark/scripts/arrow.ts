import * as arrow from "apache-arrow";
import { writeFileSync } from "fs";
import { ChainTransaction } from "../../src/types";

export async function convertCSVToArrow(
  jsonData: ChainTransaction[],
  outputPath: string,
) {
  const table = arrow.tableFromJSON(jsonData);
  const outputStream = arrow.tableToIPC(table);
  writeFileSync(outputPath, outputStream);
}
