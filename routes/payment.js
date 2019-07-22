var express = require("express");
var router = express.Router();

var PaymentController = require("../controllers/payment");

/* GET payments listing. */
router.get('/:site/payment_methods', PaymentController.getPayments);

module.exports = router;