"use strict";
const restify = require('restify');


const server = restify.createServer();

server.get('/balance', (req, res, next) => {
    res.send('hello world!');
    next();
});

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});