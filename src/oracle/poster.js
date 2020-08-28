const { secp256k1LockScript, getCells, generateEmptyLiveCells, generateOracleLiveCells, updateOracleLiveCells } = require('./rpc')
const fetchOpenOraclePayload = require('./service')
const { OracleLockScript } = require('../utils/const')
const { containOracleData } = require('../utils/utils')

const postOpenOracle = async () => {
  const liveCells = await getCells(await secp256k1LockScript())
  const oracleLiveCells = await getCells(OracleLockScript)
  const { messages, signatures } = await fetchOpenOraclePayload()
  console.log(JSON.stringify(liveCells))
  if (liveCells.length < messages.length && !containOracleData(oracleLiveCells)) {
    console.info('Generate Live Cells')
    await generateEmptyLiveCells(messages.length)
  } else if (!containOracleData(oracleLiveCells)) {
    console.info('Post Oracle to Live Cells Data')
    await generateOracleLiveCells(liveCells, messages)
  } else {
    console.info('Update Oracle Cells Data')
    await updateOracleLiveCells(liveCells, oracleLiveCells, messages, signatures)
  }
}

module.exports = {
  postOpenOracle,
}
