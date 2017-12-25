const utility = require('./utility');
const args = process.argv;


(async() => {
    const address = await utility.deploy('KnotToken', args[2]);
    utility.updateDB('KnotToken', address);
})();