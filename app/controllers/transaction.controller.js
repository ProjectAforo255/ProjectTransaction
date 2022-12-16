const transactionService = require('../services/transaction.service')
const logProvider = require('../middleware/logprovider')

const getTransactionById = async (req, res) => {
    const invoiceId = parseInt(req.params.invoiceId)
    logProvider.info('Log Micro transaction')

    return res.send(await transactionService.getTransactionById(invoiceId))
}


module.exports = { getTransactionById }