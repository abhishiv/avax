import BeeQueue from "bee-queue";
import { prisma } from "../utils/index.js";

export const BLOCK_START = process.env.BLOCK_START
  ? parseInt(process.env.BLOCK_START)
  : 53952899;

export const blockQueue = new BeeQueue("blockQueue111", {
  removeOnSuccess: false,
  redis: { host: "127.0.0.1", port: 6379 }, // Configure Redis
});

// Log processing of block
export const logProcessingBlock = async (blockNumber: number) => {
  await prisma.syncStatus.upsert({
    where: { id: blockNumber },
    update: { processingStartedAt: new Date() },
    create: { id: blockNumber, blockNumber, processingStartedAt: new Date() },
  });
};

// Log processed block
export const logProcessedBlock = async (blockNumber: number) => {
  await prisma.syncStatus.update({
    where: { id: blockNumber },
    data: { processedAt: new Date() },
  });
};

// Delete failed block log
export const delogFailedBlock = async (blockNumber: number) => {
  await prisma.syncStatus.delete({
    where: { id: blockNumber },
  });
};
