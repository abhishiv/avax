import { createSqliteDB, sqliteDB } from "../utils/index";
import { z } from "@hono/zod-openapi";

export type HonoContext = {
  Variables: {
    sqlite: sqliteDB;
  };
};

export const TransactionSchema = z.object({
  timestamp: z.string(),
  status: z.boolean(),
  block_number: z.string(),
  tx_index: z.string(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  value: z.string(),
  gas_limit: z.string(),
  gas_used: z.string(),
  gas_price: z.string().nullable(),
});

export type ChainTransaction = {
  timestamp: string;
  status: boolean;
  block_number: number;
  tx_index: number;
  from: string;
  to: string;
  value: number;
  gas_limit: number;
  gas_used: number;
  gas_price: number;
};

export type TransactionReceipt = {
  to: string | null;
  from: string;
  contractAddress: string | null;
  hash: string;
  index: number;
  blockHash: string;
  blockNumber: number;
  logsBloom: string;
  gasUsed: bigint;
  blobGasUsed: bigint | null;
  cumulativeGasUsed: bigint;
  gasPrice: bigint;
  blobGasPrice: bigint | null;
  type: number;
  status: number;
  root?: string | undefined;
};
