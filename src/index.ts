import { serve } from "@hono/node-server";
import { compress } from "hono/compress";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HonoContext, TransactionSchema } from "./types/index.js";
import { prisma } from "./utils/index.js";

const app = new OpenAPIHono<HonoContext>();

app.use(compress());
app.use(logger());

// Transaction List API
app.openapi(
  createRoute({
    method: "get",
    path: "/transactions",
    request: {
      query: z.object({
        address: z.string(),
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10"),
      }),
    },
    responses: {
      200: {
        description: "List of transactions",
        content: {
          "application/json": {
            schema: z.array(TransactionSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const address = c.req.query("address");
    const page = parseInt(c.req.query("page") as string);
    const limit = parseInt(c.req.query("limit") as string);
    const offset = (page - 1) * limit;

    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [{ from: address }, { to: address }],
      },
      orderBy: [{ block_number: "asc" }, { tx_index: "asc" }],
      skip: offset,
      take: limit,
    });

    return c.json(transactions);
  },
);

// Transaction Count API
app.openapi(
  createRoute({
    method: "get",
    path: "/transactions/count",
    request: {
      query: z.object({
        address: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Transaction count",
        content: {
          "application/json": {
            schema: z.object({
              count: z.number(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { address } = c.req.query();

    const count = await prisma.transactions.count({
      where: {
        OR: [{ from: address }, { to: address }],
      },
    });

    return c.json({ count });
  },
);

// Transactions Ordered by Value API
app.openapi(
  createRoute({
    method: "get",
    path: "/transactions/ordered",
    request: {
      query: z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10"),
      }),
    },
    responses: {
      200: {
        description: "Transactions ordered by value",
        content: {
          "application/json": {
            schema: z.array(TransactionSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const page = parseInt(c.req.query("page") as string);
    const limit = parseInt(c.req.query("limit") as string);
    const offset = (page - 1) * limit;

    const transactions = await prisma.transactions.findMany({
      orderBy: { value: "desc" },
      skip: offset,
      take: limit,
    });

    return c.json(transactions);
  },
);

app.get(
  "/",
  swaggerUI({
    url: "/doc",
  }),
);

app.doc("/doc", {
  info: {
    title: "Routescan AVAX transactions API",
    version: "v1",
  },
  openapi: "3.1.0",
});

const port = process.env.PORT || 8200;
console.log("listening on port " + port);
serve({
  fetch: app.fetch,
  port: port as number,
});
