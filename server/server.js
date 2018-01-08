"use strict";
const restify = require('restify');

const init = require('./lib/init');
const router = require('./router');
const socketIO = require('./lib/socket.io');

const server = restify.createServer();
//系统初始化
global.env = process.env.NODE_ENV;
init(server);
//配置路由
router(server);
socketIO.init();

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});