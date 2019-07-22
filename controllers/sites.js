'use strict'

var request = require("request");

function getSites(req, res) {
    request.get("https://api.mercadolibre.com/sites", function (error, response, body) {
        if(error) {
            res.send(error);
        }
        res.status(200).send(JSON.parse(body));
    });
}

function getSite(req, res) {
    var id = req.params.id;
    request.get("https://api.mercadolibre.com/sites/" + id, function (error, response, body) {
        if(error) {
            res.send(error);
        }
        res.send(JSON.parse(body));
    });
}

module.exports = {
    getSites,
    getSite
}