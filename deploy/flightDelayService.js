const utility = require('../migrations/utility');
const args = process.argv;


if ('test' == 'test') {
    (async() => {
        const address = await utility.deploy('FlightDelayService', args[2], args.slice(3), (address) => {
            utility.updateDB('flightDelayService', 'FlightDelayService', address);
        });

    })();
} else {
    console.log('参数错误，正确：node flightDelayService 密码 hbAddress tokenAddress');
}