module.exports = (server) => {
    require('./main')(server);
    require('./account')(server);
    require('./group')(server);
}