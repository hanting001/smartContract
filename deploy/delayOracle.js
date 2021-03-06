const utility = require('../migrations/utility');
const args = process.argv;


if (process.env.NODE_ENV == 'test') {
    (async() => {
        const address = await utility.deploy('DelayOracle', args[2], args.slice(3));
        utility.updateDB('delayOracle', 'DelayOracle', address);
    })();
} else {
    console.log('参数错误，正确：node delayOracle 密码')
}