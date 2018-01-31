const utility = require('../migrations/utility');
const args = process.argv;


if (process.env.NODE_ENV == 'test' && args.slice(3).length > 1) {
    (async() => {
        const address = await utility.deploy('Group', args[2], args.slice(3));
        utility.updateDB(args[3], 'Group', address);
    })();
} else {
    console.log('参数错误，正确：node group 密码 groupItemName tokenAddress')
}