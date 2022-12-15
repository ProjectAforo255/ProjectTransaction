const transactionService = require('../services/transaction.service')
const logProvider = require('../middleware/logprovider')

const getTransactionById = async (req, res) => {
    const accountId = parseInt(req.params.accountId)
    logProvider.info('Log Micro transaction')

    return res.send(await transactionService.getTransactionById(accountId))
}


module.exports = { getTransactionById }