"use strict";
const init = require('./lib/init');

const restify = require('restify');

const KnotToken = require('./contracts/KnotToken');


const server = restify.createServer();
init(server);

server.get('/balance', async (req, res, next) => {
    let knot = new KnotToken('0x345ca3e014aaf5dca488057592ee47305d9b3e10');
    let balance = await knot.balanceOf();
    res.send(balance);
    next();
});

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});