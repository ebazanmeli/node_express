var express = require("express");
var router = express.Router();

var AgencieController = require("../controllers/agencies");

//GET las agencias para un sitio y metodo de pago específico
router.get('/:site/payment_methods/:payment_method/agencies', AgencieController.getAgencies);

//GET una agencia específica
router.get('/agencies/:id', AgencieController.getAgencie);

//SAVE document to agencies recomended
router.post('/agencies', AgencieController.saveAgencie);

//ELIMINAR una agencia de la lista de agencias recomendadas
router.delete('/agencies/:id', AgencieController.removeAgencie);

//GET ALL agencias recomendadas
router.get('/agencies-recomended', AgencieController.getAgenciesRecomended);

module.exports = router;