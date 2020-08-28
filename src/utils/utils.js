const remove0x = hex => {
  if (hex.startsWith('0x')) {
    return hex.substring(2)
  }
  return hex
}

const containOracleData = cells => {
  let result = false
  for (let cell of cells) {
    if (cell.output_data !== '0x' && cell.output_data.length > 2) {
      result = true
      break
    }
  }
  return result
}

module.exports = {
  remove0x,
  containOracleData,
}
