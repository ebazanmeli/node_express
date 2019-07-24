'use strict'

var request = require("request");
var fs = require("fs");

function getAgencies(req, res) {
    var site = req.params.site;
    var payment_method = req.params.payment_method;
    var lat = req.query.lat;
    var lon = req.query.lon;
    var radius = req.query.radius;
    var limit = req.query.limit;
    var offset = req.query.offset;

    var urlAPI;

    var withoutParams = "https://api.mercadolibre.com/sites/" + site + "/payment_methods/" + payment_method + "/agencies";
    var withGeo = "https://api.mercadolibre.com/sites/" + site + "/payment_methods/"
                        + payment_method + "/agencies?near_to=" + lat + "," + lon + "," + radius;
    var withLimit = "https://api.mercadolibre.com/sites/" + site + "/payment_methods/" + payment_method + "/agencies?limit=" + limit;
    var withAllParams = "https://api.mercadolibre.com/sites/" + site + "/payment_methods/"
                        + payment_method + "/agencies?near_to=" + lat + "," + lon + "," + radius + "&limit=" + limit;


    if(lat === "null" || lat === "undefined") {
        if(limit === "null" || limit === "undefined") {
            if(offset === "null" || offset === "undefined") {
                urlAPI = withoutParams;
            } else {
                urlAPI = withoutParams + "?offset=" + offset;
            }
        } else {
            if(offset === "null" || offset === "undefined") {
                urlAPI = withLimit;
            } else {
                urlAPI = withLimit + "&offset=" + offset;
            }
        }
    } else if (limit === "null" || limit === "undefined") {
        if(offset === "null" || offset === "undefined") {
            urlAPI = withGeo;
        } else {
            urlAPI = withGeo + "&offset=" + offset;
        }
    } else {
        if(offset === "null" || offset === "undefined") {
            urlAPI = withAllParams;
        } else {
            urlAPI = withAllParams + "&offset=" + offset;
        }
    }


    request.get(urlAPI, function (error, response, body) {
        if(error) {
            res.send(error);
        }

        fs.writeFileSync('search.txt', body);

        console.log(JSON.parse(body));
        res.send(JSON.parse(body));
    });

}

function getAgencie(req, res) {
    var idAgencie = req.params.id;
    var jsonFile = null;
    var agencie = {};

    fs.readFile('search.txt', 'utf-8', (err, data) => {
        if(err) {
            console.log('error: ', err);
            res.send({"message": "Error cuando se quiere leer el archivo. " + err});
        } else {
            jsonFile = JSON.parse(data);

            for(var i = 0; i < jsonFile.results.length; i++) {
                if(jsonFile.results[i].id == idAgencie) {
                    agencie = {"agencia": jsonFile.results[i]};
                    res.send(agencie);
                    break;
                }
            }
        }
    });
}

function saveAgencie(req, res) {
    var agencie = req.body;

    var agencies = [];
    var existAgencie = false;

        if (fs.existsSync("agencias-recomendadas.json")) {
            fs.readFile('agencias-recomendadas.json', 'utf-8', (err, data) => {
                if(err) {
                    console.log('error: ', err);
                } else {
                    agencies = JSON.parse(data);

                    for(var i = 0; i < agencies.length; i++) {
                        if(agencies[i].id == agencie.id) {
                            existAgencie = true;
                            res.send({"message": "La agencia seleccionada ya se encuentra en la lista de recomendadas."});
                            break;
                        }
                    }

                    if(existAgencie == false) {
                        agencies.push(agencie);
                        fs.writeFileSync('agencias-recomendadas.json', JSON.stringify(agencies));
                        res.send({"message": "La agencia se agregó con éxito a la lista."});
                    }
                }
            });

        } else {
            agencies[0] = agencie;
            fs.writeFileSync('agencias-recomendadas.json', JSON.stringify(agencies));
            res.send({"message": "La agencia se agregó con éxito a la lista."});
        }
}

function removeAgencie(req, res) {
    var agencieID = req.params.id;

    var agencies = [];
    var agenciesAUX = [];
    var existAgencie = false;
    var j = 0;

    if (fs.existsSync("agencias-recomendadas.json")) {
        fs.readFile('agencias-recomendadas.json', 'utf-8', (err, data) => {
            if(err) {
                console.log('error: ', err);
            } else {
                agenciesAUX = JSON.parse(data);

                for(var i = 0; i < agenciesAUX.length; i++) {
                    if(agenciesAUX[i].id != agencieID) {
                        agencies[j] = agenciesAUX[i];
                        j++;
                    } else {
                        existAgencie = true;
                    }
                }

                if(existAgencie == false) {
                    res.send({"message": "La agencia no se encuentra en la lista de recomendadas."});
                } else {
                    fs.writeFileSync('agencias-recomendadas.json', JSON.stringify(agencies));
                    res.send({"message": "La agencia seleccionada se eliminó de la lista de recomendadas."});
                }
            }
        });

    } else {
        res.send({"message": "La agencia no se encuentra en la lista de recomendadas."});
    }
}

module.exports = {
    getAgencies,
    getAgencie,
    saveAgencie,
    removeAgencie
}