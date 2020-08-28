const { getTransactionByHash, getCells, generateEmptyLiveCells, generateOracleLiveCells, updateOracleLiveCells } = require('./rpc')
const fetchOpenOraclePayload = require('./service')
const { OPEN_TOKENS, OracleLockScript } = require('../utils/const')
const { containOracleData } = require('../utils/utils')

let txHash = ''

const postOpenOracle = async () => {
  const length = OPEN_TOKENS.length
  const oracleLiveCells = await getCells(OracleLockScript)
  if (oracleLiveCells.length < length) {
    if (txHash && !(await getTransactionByHash(txHash))) {
      return
    }
    console.info('Generate Live Cells')
    txHash = await generateEmptyLiveCells(length)
  } else if (!containOracleData(oracleLiveCells)) {
    console.info('Post Oracle to Live Cells Data')
    const { messages } = await fetchOpenOraclePayload()
    await generateOracleLiveCells(oracleLiveCells, messages)
  } else {
    console.info('Update Oracle Cells Data')
    const { messages, signatures } = await fetchOpenOraclePayload()
    await updateOracleLiveCells(oracleLiveCells, messages, signatures)
  }
}

module.exports = {
  postOpenOracle,
}
