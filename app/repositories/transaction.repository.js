global.TextEncoder = require("util").TextEncoder
global.TextDecoder = require("util").TextDecoder
const MongoClient = require('mongodb').MongoClient

const transactionRepository = {
    gettransactionById: async (invoiceId) => {
        return new Promise((resolve, reject) => {
            MongoClient.connect(process.env.DB_MONGO_URI, async function (err, db) {
                if (err) throw err
                const query = { id_invoice: `${invoiceId}` }
                const collection = await db.db(process.env.DB_MONGO_DATABASE_TRANSACTION).collection("transaction");
                const cursor = collection.find(query);
                var docs = [];

                await cursor.forEach((doc)=>{
                    docs.push(doc);
                });

                docs.length === 0 ? resolve([]) : resolve(docs)
            })
        })
    }
}

module.exports = transactionRepository;