const utility = require('../migrations/utility');
const args = process.argv;


if (process.env.NODE_ENV == 'test') {
    (async() => {
        const address = await utility.deploy('FlightDelay', args[2], args.slice(3));
        utility.updateDB('flightDelay', 'FlightDelay', address);
    })();
} else {
    console.log('参数错误，正确：node flightDelay 密码 hbAddress tokenAddress');
}