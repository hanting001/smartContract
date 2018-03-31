const utility = require('../migrations/utility');
const args = process.argv;


if ('test' == 'test') {
    const constract = args[3];
    const name = constract.substring(0, 1).toLowerCase() + constract.substring(1);
    console.log(`class: ${constract}, name: ${name}`);
    (async() => {
        const address = await utility.deploy(constract, args[2], args.slice(4));
        utility.updateDB(name, constract, address);
    })();
} else {
    console.log('参数错误，正确：node utility 密码 contractClassName params')
}