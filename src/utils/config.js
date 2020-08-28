require('dotenv').config()
const PRI_KEY = process.env.PRIVATE_KEY

const OKEX_API_KEY_ID = process.env.OKEX_API_KEY_ID
const OKEX_API_SECRET = process.env.OKEX_API_SECRET
const OKEX_API_PASSPHRASE = process.env.OKEX_API_PASSPHRASE

module.exports = {
  PRI_KEY,
  OKEX_API_KEY_ID,
  OKEX_API_SECRET,
  OKEX_API_PASSPHRASE,
}
