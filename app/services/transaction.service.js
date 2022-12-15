const redis = require('redis')
const transactionRepository = require('../repositories/transaction.repository')
 
const client = redis.createClient({
    url: process.env.DB_REDIS_URL,
    tls: {
        rejectUnauthorized: false
    },
    legacyMode: true
})
client.connect();
client.on('error', function (err) {
    console.log('Error ' + err)
})
 
const transactionService = {
    getTransactionById: async (accountId) => {
        const key = `key-transaction-${accountId}`
        return new Promise((resolve, reject) => {
            client.get(key, async function (err, reply) {
                if (err) { return reject(err) }
                if (reply === null) {
                    console.log('Register information in redis')
                    var result = await transactionRepository.gettransactionById(accountId)
                    await client.set(key, JSON.stringify(result), 'EX', 30)
                    return resolve(result)
                }
                else {
                    console.log('Showing redis information')
                    return resolve(JSON.parse(reply))
                }
            })
        })
    }
}
 
module.exports = transactionService