# ckb-open-oracle

A poster fetching [open oracle](https://github.com/compound-finance/open-oracle) data from the providers (e.g. [okex oracle](https://www.okex.com/docs/en/#oracle-oracle) and [coinbase oracle](https://docs.pro.coinbase.com/#oracle)) who support open oracle protocol and posting to Nervos CKB

The lock script of open oracle on Nervos CKB is [ckb-open-oracle-script](https://github.com/duanyytop/ckb-open-oracle-script)

[`ckb-oracle-bridge`](https://github.com/duanyytop/ckb-oracle-bridge) ([Live Demo](https://oracle-bridge.ckbapp.dev/)) provides a server to fetch open oracle data and a web application to display oracle data and uses [rich-node](https://github.com/ququzone/ckb-rich-node) as ckb rpc and indexer server.

### How to work

`ckb-open-oracle` has five stages to post band oracle data to Nervos CKB

- Generate some live cells whose count is equal to oracle tokens' count to carry open oracle data
- Fetch latest oracle data from the provides who support open oracle protocol
- Generate transaction whose outputs data contain open oracle data and send to Nervos CKB
- Fetch latest oracle data from the provides who support open oracle protocol
- Update cells data which contain open oracle data with new oracle data per block

### Getting Started

Before starting the project, you should edit the `.env` file with your private key to sign above transactions later and add okex oracle api key information.
You should make sure the balance of the account is enough and if you have not enough Testnet ckb, you can claim free Testnet ckb from [CKB Faucet](https://faucet.nervos.org).

```shell
$ git clone https://github.com/duanyytop/ckb-open-oracle
$ cd ckb-open-oracle
$ yarn install
$ yarn start
```

### Script info in Aggron

The script of open oracle has been deployed in Aggron whose `out_point` and `cell_deps` are:

```
txHash: 0x8e64c6b0bed8231b1490fb04be49f100dfcd50279bcd484b699bd7a17e44aa2a
index: 0
depType: depGroup
codeHash: 0x224fe274a7b005cd299f7223afa8ab4be24d0d754cf9655dfa3a4cb497f0f32b
```

### Resource

- [open oracle](https://github.com/compound-finance/open-oracle) - A standard and SDK allowing reporters to sign key-value pairs (e.g. a price feed) that interested users can post to the blockchain
- [CKB JavaScript SDK](https://github.com/nervosnetwork/ckb-sdk-js) - JavaScript SDK of Nervos CKB which can help developers to interact ckb node
- [CKB Rich Node](https://github.com/ququzone/ckb-rich-node) - Remote server which supports ckb rpc and ckb indexer
- [CKB Indexer](https://github.com/nervosnetwork/ckb-indexer) - Core Module of CKB Rich Node
- [CKB Explorer](https://explorer.nervos.org) - CKB blockchain explorer
- [CKB Faucet](https://faucet.nervos.org) - A faucet where you can claim free Testnet CKBytes
