import fs from "fs";
import { ChainTransaction } from "../../src/types";
import { prisma } from "../../src/utils";

// Function to create and populate the database
export async function convertCSVToPostgres(jsonData: ChainTransaction[]) {
  try {
    const insertMany = async (batch: ChainTransaction[]) => {
      return prisma.transactions.createMany({
        data: batch,
      });
    };
    const batchSize = 10000;
    // Insert in batches of 1000
    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize);
      await insertMany(batch);
    }
  } catch (e) {
    throw e;
  } finally {
    //
  }
}
