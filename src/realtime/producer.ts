import async from "async";
import { ethers } from "ethers";
import { BLOCK_START, blockQueue, logProcessingBlock } from "./utils.js";
import { prisma } from "../utils/index.js";

const provider = new ethers.JsonRpcProvider(
  "https://api.avax.network/ext/bc/C/rpc",
);

// Get all processed blocks
const getProcessedBlocks = async () => {
  const blocks = await prisma.syncStatus.findMany({
    select: { blockNumber: true },
    orderBy: { blockNumber: "asc" },
  });
  return blocks.map((b) => Number(b.blockNumber));
};

// Detect missing blocks
const computeMissingBlocks = async (latestBlock: number) => {
  const processedBlocks = await getProcessedBlocks();
  const missingBlocks: number[] = [];
  const firstUnprocessedBlock = BLOCK_START;

  for (let block = firstUnprocessedBlock; block <= latestBlock; block++) {
    if (!processedBlocks.includes(block)) {
      missingBlocks.push(block);
    }
  }

  return missingBlocks;
};

// Producer for missing blocks
const producerQueue = async.queue<number>(async (latestBlock) => {
  const missingBlocks = await computeMissingBlocks(latestBlock);
  console.log(
    `${missingBlocks.length} blocks behind: syncing ${missingBlocks.join(
      ", ",
    )}`,
  );
  for (var blockNumber of missingBlocks) {
    await blockQueue.createJob({ blockNumber }).save();
    await logProcessingBlock(blockNumber);
  }
}, 1); // Serialize job creation

// Start syncing
const startSyncing = async () => {
  provider.on("block", async (latestBlock: number) => {
    console.log(`New block detected: ${latestBlock}`);
    producerQueue.push(latestBlock);
  });
};

provider.on("error", (error) => {
  console.error("Provider error:", error);
});

startSyncing().catch(console.error);
