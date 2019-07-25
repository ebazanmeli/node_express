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
    var orderby = req.query.orderby;
    var criterio = req.query.criterio;

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

        var jsonFile = null;
        //ordenar archivo y responder dicho resultado
        fs.readFile('search.txt', 'utf-8', (err, data) => {
            if(err) {
                console.log('error: ', err);
                res.send({"message": "Error cuando se quiere leer el archivo. " + err});
            } else {
                jsonFile = JSON.parse(data);

                switch(orderby) {
                    case "address_line":
                        jsonFile.results.sort(function (a, b) {
                            if(criterio === "ASC") {
                                if (a.address.address_line > b.address.address_line) {
                                    return 1;
                                }
                                if (a.address.address_line < b.address.address_line) {
                                    return -1;
                                }
                            } else if(criterio === "DESC") {
                                if (b.address.address_line > a.address.address_line) {
                                    return 1;
                                }
                                if (b.address.address_line < a.address.address_line) {
                                    return -1;
                                }
                            }
                            // a must be equal to b
                            return 0;
                        });
                        break;
                    case "agency_code":
                        jsonFile.results.sort(function(a, b) {
                            if(criterio === "ASC") {
                                return a.agency_code - b.agency_code;
                            } else if (criterio === "DESC") {
                                return b.agency_code - a.agency_code;
                            }
                        });
                        break;
                    case "distance":
                        jsonFile.results.sort(function(a, b) {
                            if(criterio === "ASC") {
                                return a.distance - b.distance;
                            } else if (criterio === "DESC") {
                                return b.distance - a.distance;
                            }
                        });
                        break;
                }
            }
            res.send(jsonFile);
        });

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

function getAgenciesRecomended(req, res) {
    if (fs.existsSync("agencias-recomendadas.json")) {
        fs.readFile('agencias-recomendadas.json', 'utf-8', (err, data) => {
            if(err) {
                console.log('error: ', err);
            } else {
                res.send(data);
            }
        });
    } else {
        res.send({"message": "No hay lista de agencias recomendadas."});
    }
}

module.exports = {
    getAgencies,
    getAgencie,
    saveAgencie,
    removeAgencie,
    getAgenciesRecomended
}