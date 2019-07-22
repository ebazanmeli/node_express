'use strict'

var request = require("request");

function getPayments(req, res) {
    var site = req.params.site;

    request.get("https://api.mercadolibre.com/sites/" + site + "/payment_methods", function (error, response, body) {
        if(error) {
            res.send(error);
        }
        res.send(JSON.parse(body));
    });
}

module.exports = {
    getPayments
}