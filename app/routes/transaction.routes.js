const express = require('express')
const router = express.Router()

const { getTransactionById } = require('../controllers/transaction.controller')

router.get('/getTransactionById/:accountId', getTransactionById)

module.exports = router