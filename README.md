# Chain API for AVAX

To get started

- Please run `npm install`
- configure `DATABASE_URL` in .env to point at a local postgres database. You can use `.env.example` as a starting point.
- Create a data directory, and place `43114_txs.csv` in this data directory
- run `npm run seed`
- start dev server with `npm run start-dev`
- For relatime sync, run `npm run realtime-producer-dev` in terminal tab which would use the ethers.JsonRpc to listen for new blocks on chain and emit jobs to process these blocks. To process these jobs and in turn insert these block transactions into the postgres database please run `npm run realtime-consumer-dev`
