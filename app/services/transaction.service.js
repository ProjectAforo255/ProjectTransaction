const transactionRepository = require('../repositories/transaction.repository')

const transactionService = {
    getTransactionById: async (invoiceId) => {
        return await transactionRepository.gettransactionById(invoiceId)
    }
}
 
module.exports = transactionService