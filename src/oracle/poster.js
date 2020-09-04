const { secp256k1LockScript, getCells, generateEmptyLiveCells, generateOracleCells, updateOracleCells } = require('./rpc')
const fetchOpenOraclePayload = require('./okex')
const { OracleLockScript } = require('../utils/const')
const { containOracleData } = require('../utils/utils')

const postOpenOracle = async () => {
  const liveCells = await getCells(await secp256k1LockScript())
  const oracleLiveCells = await getCells(OracleLockScript)
  const { messages, signatures } = await fetchOpenOraclePayload()
  if (liveCells.length < messages.length && !containOracleData(oracleLiveCells)) {
    console.info('Generate Live Cells')
    await generateEmptyLiveCells(messages.length)
  } else if (!containOracleData(oracleLiveCells)) {
    console.info('Post Oracle to Cells Data')
    await generateOracleCells(liveCells, messages)
  } else {
    console.info('Update Oracle Cells Data')
    await updateOracleCells(liveCells, oracleLiveCells, messages, signatures)
  }
}

module.exports = {
  postOpenOracle,
}
