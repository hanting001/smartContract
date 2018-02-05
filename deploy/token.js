const utility = require('../migrations/utility');
const args = process.argv;

console.log('参数，正确：node token 密码 name symbol')
if (process.env.NODE_ENV == 'test') {
    (async() => {
        const address = await utility.deploy('KnotToken', args[2], args.slice(3));
        utility.updateDB('knotCoin', 'KnotCoin', address);
    })();
}