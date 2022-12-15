global.TextEncoder = require("util").TextEncoder
global.TextDecoder = require("util").TextDecoder
const MongoClient = require('mongodb').MongoClient

const transactionRepository = {
    gettransactionById: async (accountId) => {
        return new Promise((resolve, reject) => {
            MongoClient.connect(process.env.DB_MONGO_URI, function (err, db) {
                if (err) throw err
                const query = { accountId: accountId }
                db.db(process.env.DB_MONGO_DATABASE_TRANSACTION).collection("transaction").find(query).toArray(function (err, result) {
                    if (err) throw err
                    db.close()
                    resolve(result)
                })
            })
        })
    }
}

module.exports = transactionRepository;