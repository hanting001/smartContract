'use strict';
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const bunyan = require('bunyan');
const cache = require('@huibao/cachehelper')

const conf = require('./config');
const web3 = require('./web3');
const db = require('./db');

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*']
});

module.exports = (server) => {
    server.pre(cors.preflight);
    server.use(restify.plugins.bodyParser());
    // server.on('after', restify.plugins.auditLogger({
    //     log: bunyan.createLogger({
    //         name: 'audit',
    //         stream: process.stdout
    //     }),
    //     printLog: true,
    //     event: 'after'
    // }));
    server.use(cors.actual);
    server.use(conf.middleware());
    web3.init(conf);
    db.init(conf.get('databaseConfig'));
    cache.config(conf.get('cacheConfig'));
}