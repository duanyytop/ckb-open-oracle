const OKEX_ENDPOINT = 'https://www.okex.com/api/market/v3/oracle'
const CKB_NODE_URL = 'https://prototype.ckbapp.dev/testnet/rpc'
const CKB_INDEXER_URL = 'https://prototype.ckbapp.dev/testnet/indexer'
const CKB_WS_URL = 'wss://ws-prototype.ckbapp.dev/testnet/rpc'

const OracleLockScript = {
  codeHash: '0x3a7b00b74ef24c93967ad9e933d4c12eb54c4f87f20c11d9a5ae4e10267e2444',
  hashType: 'type',
  args: '0x85615b076615317c80f14cbad6501eec031cd51c',
}

const OracleDeps = {
  outPoint: { txHash: '0xdbed1ab475285d29c451cb6c8f7e0d73a771f3bb9cc4a20fa15acbced9fd8384', index: '0x0' },
  depType: 'code',
}

const OPEN_TOKENS = ['BTC', 'ETH']

module.exports = {
  OKEX_ENDPOINT,
  CKB_NODE_URL,
  CKB_INDEXER_URL,
  CKB_WS_URL,
  OPEN_TOKENS,
  OracleLockScript,
  OracleDeps,
}
