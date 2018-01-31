const utility = require('../migrations/utility');
const args = process.argv;


if (process.env.NODE_ENV == 'test') {
    (async() => {
        const address = await utility.deploy('HbStorage', args[2], args.slice(3));
        utility.updateDB('hbStorage', 'HbStorage', address);
    })();
} else {
    console.log('参数错误，正确：node hbStorage 密码')
}