var express = require('express');
var router = express.Router();

var SiteController = require("../controllers/sites");

/* GET sites listing. */
router.get('/sites', SiteController.getSites);

/* GET site specific by id. */
router.get('/sites/:id', SiteController.getSite);

module.exports = router;
