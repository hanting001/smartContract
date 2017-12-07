const main = require('./main');
const account = require('./account');

module.exports = (server) => {
    main(server);
    account(server);
}