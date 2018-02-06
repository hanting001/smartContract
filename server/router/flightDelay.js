const myWeb3 = require('../lib/web3');
const errors = require('restify-errors');
const auth = require('../lib/auth');

const FlightDelay = require('../contracts/FlightDelay');

module.exports = (server) => {
    this.path = '/flightDelay';
    server.get(this.path + '/getSFInfo/:flightNO/:flightDate', auth.jwt, async(req, res, next) => {
        try {
            const flightNO = req.params.flightNO;
            const flightDate = req.params.flightDate;
            const flightDelaySC = await FlightDelay.instance();
            const result = await flightDelaySC.getSFInfo(flightNO, flightDate, req.user.account);
            
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
};