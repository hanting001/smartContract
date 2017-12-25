const utility = require('../migrations/utility');
const args = process.argv;

if (process.env.NODE_ENV == 'test') {
    (async() => {
        const address = await utility.deploy('Group', args[2], args.slice(3));
        utility.updateDB('G00000001', address);
    })();
}