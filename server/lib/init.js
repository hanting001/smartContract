'use strict';


const conf = require('./config');
const web3 = require('./web3');

module.exports = (server) => {
    server.use(conf.middleware());
    web3.init(conf);
}