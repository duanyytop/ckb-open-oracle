const OKEX_ENDPOINT = 'https://www.okex.com/api/market/v3/oracle'
const CKB_NODE_URL = 'https://prototype.ckbapp.dev/testnet/rpc'
const CKB_INDEXER_URL = 'https://prototype.ckbapp.dev/testnet/indexer'
const CKB_WS_URL = 'wss://ws-prototype.ckbapp.dev/testnet/rpc'

const OracleLockScript = {
  codeHash: '0x224fe274a7b005cd299f7223afa8ab4be24d0d754cf9655dfa3a4cb497f0f32b',
  hashType: 'type',
  args: '0x85615b076615317c80f14cbad6501eec031cd51c',
}

const OracleDeps = {
  outPoint: { txHash: '0x8e64c6b0bed8231b1490fb04be49f100dfcd50279bcd484b699bd7a17e44aa2a', index: '0x0' },
  depType: 'depGroup',
}

module.exports = {
  OKEX_ENDPOINT,
  CKB_NODE_URL,
  CKB_INDEXER_URL,
  CKB_WS_URL,
  OracleLockScript,
  OracleDeps,
}
