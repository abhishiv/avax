import * as parquet from "@dsnp/parquetjs";
import { ChainTransaction } from "../../src/types";

export async function convertCSVToParquet(
  jsonData: ChainTransaction[],
  outputPath: string,
) {
  const schema = new parquet.ParquetSchema({
    timestamp: { type: "UTF8" },
    status: { type: "BOOLEAN" },
    block_number: { type: "INT64" },
    tx_index: { type: "INT64" },
    from: { type: "UTF8" },
    to: { type: "UTF8" },
    value: { type: "DOUBLE" },
    gas_limit: { type: "INT64" },
    gas_used: { type: "INT64" },
    gas_price: { type: "DOUBLE" },
  });
  const writer = await parquet.ParquetWriter.openFile(schema, outputPath);
  for (const row of jsonData) {
    try {
      await writer.appendRow(row);
    } catch (e) {
      console.error(e);
      console.log(row);
    }
  }
  await writer.close();
}
