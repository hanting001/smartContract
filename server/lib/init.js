'use strict';
const restify = require('restify');
const bunyan = require('bunyan');

const conf = require('./config');
const web3 = require('./web3');

module.exports = (server) => {
    server.use(restify.plugins.bodyParser());
    server.on('after', restify.plugins.auditLogger({
        log: bunyan.createLogger({
            name: 'audit',
            stream: process.stdout
        }),
        printLog: true,
        event: 'after'
    }));
    server.use(conf.middleware());
    web3.init(conf);
}