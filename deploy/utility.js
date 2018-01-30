const utility = require('../migrations/utility');
const args = process.argv;


if (process.env.NODE_ENV == 'test') {
    (async() => {
        const address = await utility.deploy('Utility', args[2], args.slice(3));
    })();
} else {
    console.log('参数错误，正确：node utility 密码')
}