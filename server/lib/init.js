'use strict';
const restify = require('restify');

const conf = require('./config');
const web3 = require('./web3');

module.exports = (server) => {
    server.use(restify.plugins.bodyParser());
    server.use(conf.middleware());
    web3.init(conf);
}