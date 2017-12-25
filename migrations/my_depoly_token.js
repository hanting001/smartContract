const utility = require('./utility');
const args = process.argv;


(async() => {
    const address = await utility.deploy('KnotCoin', args[2]);
    utility.updateDB('knotCoin', address);
})();