const CKB = require('@nervosnetwork/ckb-sdk-core').default
const { scriptToHash, rawTransactionToHash } = require('@nervosnetwork/ckb-sdk-utils')
const fetch = require('node-fetch')
const BN = require('bn.js')
const { Reporter } = require('open-oracle-reporter')
const { PRI_KEY } = require('../utils/config')
const { CKB_INDEXER_URL, CKB_NODE_URL, OracleLockScript, OracleDeps } = require('../utils/const')
const { remove0x } = require('../utils/utils')

const ckb = new CKB(CKB_NODE_URL)
const PUB_KEY = ckb.utils.privateKeyToPublicKey(PRI_KEY)
const ARGS = '0x' + ckb.utils.blake160(PUB_KEY, 'hex')
const FEE = new BN(2000)
const EACH_CAPACITY = new BN(40000000000)
const CHANGE_CAPACITY = new BN(16000000000)

const secp256k1LockScript = async () => {
  const secp256k1Dep = (await ckb.loadDeps()).secp256k1Dep
  return {
    codeHash: secp256k1Dep.codeHash,
    hashType: secp256k1Dep.hashType,
    args: ARGS,
  }
}

const secp256k1Dep = async () => {
  const secp256k1Dep = (await ckb.loadDeps()).secp256k1Dep
  return { outPoint: secp256k1Dep.outPoint, depType: 'depGroup' }
}

const generateInput = cell => {
  return {
    previousOutput: {
      txHash: cell.out_point.tx_hash,
      index: cell.out_point.index,
    },
    since: '0x0',
  }
}

const collectInputs = (cells, needCapacity) => {
  let inputs = []
  let sum = new BN(0)
  cells.forEach(cell => {
    inputs.push({
      previousOutput: {
        txHash: cell.out_point.tx_hash,
        index: cell.out_point.index,
      },
      since: '0x0',
    })
    sum = sum.add(new BN(remove0x(cell.output.capacity), 'hex'))
    if (sum.cmp(needCapacity.add(FEE)) >= 0) {
      return
    }
  })
  if (sum.cmp(needCapacity.add(FEE)) < 0) {
    throw Error('Capacity not enough')
  }
  return { inputs, capacity: sum }
}

const multiOutputs = async (inputCapacity, length) => {
  const lock = await secp256k1LockScript()
  if (length <= 0) return []
  let outputs = []
  let len = length * 2
  while (len--) {
    outputs.push(
      len >= length
        ? { capacity: `0x${EACH_CAPACITY.toString(16)}`, lock, type: null }
        : { capacity: `0x${CHANGE_CAPACITY.toString(16)}`, lock, type: null },
    )
  }
  const changeCapacity = inputCapacity
    .sub(FEE)
    .sub(EACH_CAPACITY.mul(new BN(length)))
    .sub(CHANGE_CAPACITY.mul(new BN(length)))
  outputs.push({
    capacity: `0x${changeCapacity.toString(16)}`,
    lock,
    type: null,
  })
  return outputs
}

const multiOutputsData = length => {
  if (length <= 0) return []
  let data = []
  let len = length
  while (len--) {
    data.push('0x')
  }
  return data
}

const getCells = async lock => {
  let payload = {
    id: 1,
    jsonrpc: '2.0',
    method: 'get_cells',
    params: [
      {
        script: {
          code_hash: lock.codeHash,
          hash_type: lock.hashType,
          args: lock.args,
        },
        script_type: 'lock',
      },
      'asc',
      '0x3e8',
    ],
  }
  const body = JSON.stringify(payload, null, '  ')
  try {
    let res = await fetch(CKB_INDEXER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    res = await res.json()
    return res.result.objects
  } catch (error) {
    console.error('error', error)
  }
}

const generateEmptyLiveCells = async length => {
  const liveCells = await getCells(await secp256k1LockScript())
  const { inputs, capacity } = collectInputs(liveCells, EACH_CAPACITY.mul(new BN(length)))
  const outputs = await multiOutputs(capacity, length)
  const cellDeps = [await secp256k1Dep()]
  const rawTx = {
    version: '0x0',
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData: multiOutputsData(outputs.length),
  }
  rawTx.witnesses = rawTx.inputs.map((_, i) => (i > 0 ? '0x' : { lock: '', inputType: '', outputType: '' }))
  const signedTx = ckb.signTransaction(PRI_KEY)(rawTx)
  const txHash = await ckb.rpc.sendTransaction(signedTx)
  console.info(`Transaction has been sent with tx hash ${txHash}`)
  return txHash
}

const generateOracleCells = async (liveCells, messages) => {
  const requests = []
  const cellDeps = [await secp256k1Dep()]
  liveCells.forEach((cell, index) => {
    if (index < messages.length) {
      const rawTx = {
        version: '0x0',
        cellDeps,
        headerDeps: [],
        inputs: [generateInput(cell)],
        outputs: [
          {
            capacity: `0x${new BN(remove0x(cell.output.capacity), 'hex').sub(FEE).toString(16)}`,
            lock: OracleLockScript,
            type: null,
          },
        ],
        outputsData: [messages[index]],
      }
      rawTx.witnesses = rawTx.inputs.map((_, i) => (i > 0 ? '0x' : { lock: '', inputType: '', outputType: '' }))
      const signedTx = ckb.signTransaction(PRI_KEY)(rawTx)
      requests.push(['sendTransaction', signedTx])
    }
  })
  const batch = ckb.rpc.createBatchRequest(requests)
  batch
    .exec()
    .then(console.info)
    .catch(console.error)
}

const getMatchedIndex = (outputData, messages) => {
  // For example: // [ [ '1583195520', 'BTC', '8845095000' ] ]
  let decoded = Reporter.decode('prices', [outputData])
  const tokenSymbol = decoded[0][1]
  decoded = Reporter.decode('prices', messages)
  for (let index = 0; index < decoded.length; index++) {
    if (decoded[index][1] === tokenSymbol) {
      return index
    }
  }
  throw Error('Output data is not matched')
}

const getMaxCapacityCell = cells => {
  let maxCell = cells[0]
  for (let cell of cells) {
    if (new BN(remove0x(cell.output.capacity)).cmp(new BN(remove0x(maxCell.output.capacity))) > 0) {
      maxCell = cell
    }
  }
  return maxCell
}

const updateOracleCells = async (liveCells, oracleLiveCells, messages, signatures) => {
  const cellDeps = [OracleDeps, await secp256k1Dep()]
  const secp256k1Lock = await secp256k1LockScript()
  let rawTx = {
    version: '0x0',
    cellDeps,
    headerDeps: [],
  }
  let inputs = []
  let outputs = []
  let outputsData = []
  let witnesses = []
  oracleLiveCells.forEach(async cell => {
    const msgIndex = getMatchedIndex(cell.output_data, messages)
    inputs.push(generateInput(cell))
    outputs.push({
      capacity: cell.output.capacity,
      lock: OracleLockScript,
      type: null,
    })
    outputsData.push(messages[msgIndex])
    witnesses.push(signatures[msgIndex])
  })
  const maxCapacityCell = getMaxCapacityCell(liveCells)
  inputs.push(generateInput(maxCapacityCell))
  outputs.push({
    capacity: `0x${new BN(remove0x(maxCapacityCell.output.capacity), 'hex').sub(FEE).toString(16)}`,
    lock: secp256k1Lock,
    type: null,
  })
  outputsData.push('0x')
  witnesses.push({ lock: '', inputType: '', outputType: '' })
  rawTx = {
    ...rawTx,
    inputs,
    outputs,
    outputsData,
  }
  const keys = new Map()
  keys.set(scriptToHash(OracleLockScript), undefined)
  keys.set(scriptToHash(secp256k1Lock), PRI_KEY)
  const signedWitnesses = ckb.signWitnesses(keys)({
    transactionHash: rawTransactionToHash(rawTx),
    witnesses: witnesses,
    inputCells: rawTx.inputs.map((input, index) => {
      return {
        outPoint: input.previousOutput,
        lock: index === rawTx.inputs.length - 1 ? secp256k1Lock : OracleLockScript,
      }
    }),
    skipMissingKeys: true,
  })
  const signedTx = { ...rawTx, witnesses: signedWitnesses }
  const txHash = ckb.rpc.sendTransaction(signedTx)
  console.info(`Update oracle cell data tx: ${txHash}`)
}

module.exports = {
  secp256k1LockScript,
  getCells,
  generateEmptyLiveCells,
  generateOracleCells,
  updateOracleCells,
}
