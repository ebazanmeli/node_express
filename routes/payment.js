var express = require("express");
var router = express.Router();

var PaymentController = require("../controllers/payment");

/* GET payments listing. */
router.get('/sites/:site/payment_methods', PaymentController.getPayments);

module.exports = router;