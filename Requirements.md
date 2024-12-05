# Task Description

Attached you will find the file [`43114_txs.csv.tar.gz`](https://drive.google.com/file/d/1ECK2Ng6hsrPhtSXwg8SGrtZpgsFdeD-E/view?usp=sharing), which contains 1 million transactions conducted on the C-Chain blockchain between October 4, 2024, at 04:42:41 and October 10, 2024, at 19:47:59, specifically between blocks 51339620 and 51614312.

## Objectives

**Import Transactions**
Import these transactions into an appropriate database. Ensure the chosen schema is optimized for future queries and guarantees high data access speed.

**Real-Time Insertion Process (TypeScript)**
Write a TypeScript process that keeps the database updated by inserting new transactions injected into the C-Chain. There is no need to import historical blocks; the focus is solely on transactions executed after the process starts.


**Data Exposure Process (TypeScript)**
Write a TypeScript process to expose the stored data via APIs. The endpoints to be implemented are:
- Transaction List: Return all transactions (with pagination) sent or received by a given address, ordered by blockNumber and transactionIndex.
- Transaction Count: Provide the number of transactions sent or received by a specific address.
- Transactions Ordered by Value: Return transactions ordered by value (with pagination), i.e., the amount of $AVAX transferred.

##Additional Notes

**Optimization**
Pay special attention to optimizing queries and the database schema to ensure quick responses to the endpoints. Given that the C-Chain blockchain currently has over 500 million transactions, the system must be scalable and maintain high performance even with a large volume of data.
A single address may have millions of transactions, so the queries must be particularly optimized to handle such scenarios without degrading performance.

**Hot Addresses for Testing**
We provide a list of addresses that have sent or received many transactions in the attached dataset, useful for performance testing.

**Addresses with the Most Transactions as Senders**

```sql
select "from", count() as txs from transactions group by "from" order by txs desc limit 10;

┌────────────────────────────────────────────┬───────┐
│                    from                    │  txs  │
│                  varchar                   │ int64 │
├────────────────────────────────────────────┼───────┤
│ 0x995BE1CA945174D5bA75410C1E658a41eB13a2FA │ 29325 │
│ 0xbD8679cf79137042214fA4239b02F4022208EE82 │ 14656 │
│ 0x9f8c163cBA728e99993ABe7495F06c0A3c8Ac8b9 │  9901 │
│ 0xCddc5d0Ebeb71a08ffF26909AA6c0d4e256b4fE1 │  9590 │
│ 0xffB3118124cdaEbD9095fA9a479895042018cac2 │  9405 │
│ 0x3BCE63C6C9ABf7A47f52c9A3a7950867700B0158 │  9316 │
│ 0xABa2D404C5C41da5964453A368aFF2604Ae80A14 │  9216 │
│ 0x6D8bE5cdf0d7DEE1f04E25FD70B001AE3B907824 │  9139 │
│ 0x2A44Ae6a71788FB62988bfE294e16063983BeC78 │  9040 │
│ 0x7E4aA755550152a522d9578621EA22eDAb204308 │  8675 │
└────────────────────────────────────────────┴───────┘
```

**Addresses with the Most Transactions as Recipients**


```sql
select "to", count() as txs from transactions group by "to" order by txs desc limit 10;

┌────────────────────────────────────────────┬────────┐
│                     to                     │  txs   │
│                  varchar                   │ int64  │
├────────────────────────────────────────────┼────────┤
│ 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7 │ 161658 │
│ 0x18556DA13313f3532c54711497A8FedAC273220E │  49145 │
│ 0x069571BDA2f6Fbb2fEDcF18a7BbdA1014b485818 │  37794 │
│ 0x802b65b5d9016621E66003aeD0b16615093f328b │  32556 │
│ 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E │  31087 │
│ 0x7d2F62b6134e8B5676D17f5E988B3e48b4f50b70 │  23854 │
│ 0x6203c968Ae2C15a562C53E0258FCB62e8139BD3E │  15447 │
│ 0x2A375567f5E13F6bd74fDa7627Df3b1Af6BfA5a6 │  14661 │
│ 0xef0cdae2FfEEeFA539a244a16b3f46ba75b8c810 │  11912 │
│ 0x1a1ec25DC08e98e5E93F1104B5e5cdD298707d31 │  10737 │
└────────────────────────────────────────────┴────────┘
```

## Useful Links
- C-Chain RPC: [https://api.avax.network/ext/bc/C/rpc](https://api.avax.network/ext/bc/C/rpc)
- C-Chain JSON-RPC documentation: [https://docs.infura.io/infura/networks/ethereum/json-rpc-methods](https://docs.infura.io/infura/networks/ethereum/json-rpc-methods)
- https://viem.sh/
