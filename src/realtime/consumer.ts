import async from "async";
import { ethers, TransactionReceipt, TransactionResponse } from "ethers";
import { prisma } from "../utils/index.js";
import { blockQueue, logProcessedBlock } from "./utils.js";

const provider = new ethers.JsonRpcProvider(
  "https://api.avax.network/ext/bc/C/rpc",
);

// Insert transaction
const insertTransaction = async ({
  tx,
  txReceipt,
  blockNumber,
}: {
  tx: TransactionResponse;
  txReceipt: TransactionReceipt;
  blockNumber: number;
}) => {
  return prisma.transactions.create({
    data: {
      timestamp: new Date().toISOString(),
      block_number: blockNumber,
      status: true,
      tx_index: txReceipt.index,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gas_price: tx.gasPrice?.toString() ?? null,
      gas_limit: tx.gasLimit.toString(),
      gas_used: txReceipt.gasUsed.toString(),
    },
  });
};

// Process transactions within a block using async.parallelLimit
const processTransactions = async (
  blockNumber: number,
  transactions: string[],
) => {
  return await async.parallelLimit(
    transactions.map((txHash) => async () => {
      await async.retry({ times: 3, interval: 1000 }, async () => {
        const txReceipt = await provider.getTransactionReceipt(txHash);
        const tx = await provider.getTransaction(txHash);
        if (tx && txReceipt) {
          await insertTransaction({ tx, txReceipt, blockNumber });
        }
        return { txHash, tx, txReceipt, blockNumber };
      });
    }),
    5, // Limit to 5 parallel transaction processing
  );
};

// Process a single block
const syncBlock = async (blockNumber: number) => {
  try {
    const block = await provider.getBlock(blockNumber);
    if (block) {
      console.log(`Syncing block ${blockNumber}`);
      const result = await processTransactions(
        blockNumber,
        block.transactions as string[],
      );
      return { blockNumber, txs: result };
    } else {
      throw new Error(`block ${blockNumber} not found`);
    }
  } catch (error) {
    console.error(`Failed to sync block ${blockNumber}:`, error);
    throw error;
  }
};

// Worker for block queue
blockQueue.process(async (job) => {
  const { blockNumber } = job.data;
  return await syncBlock(blockNumber);
});

blockQueue.on("job succeeded", async (jobId, result) => {
  console.log(
    `Job ${jobId} for block ${result.blockNumber} succeeded with ${result.txs.length} transactions imported`,
  );
  await logProcessedBlock(parseInt(result.blockNumber));
});

blockQueue.on("job failed", async (jobId, err) => {
  const params = await blockQueue.getJob(jobId);
  //await delogFailedBlock(parseInt(params.data.blockNumber));
});
