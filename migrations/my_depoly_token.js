const utility = require('./utility');
const args = process.argv;


const address = await utility.deploy('knotCoin', args[2]);
utility.updateDB('knotCoin', address);