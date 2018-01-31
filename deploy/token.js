const utility = require('../migrations/utility');
const args = process.argv;

if (process.env.NODE_ENV == 'test') {
    (async() => {
        const address = await utility.deploy('KnotToken', args[2]);
        utility.updateDB('knotCoin', 'KnotCoin', address);
    })();
}