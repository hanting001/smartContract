const request = require('request-promise-native');

const conf = require('../server/lib/config');
const utility = require('./utility');
module.exports = {
    updateDB: (name, address) => {
        let options = {
            uri: conf.get('apiHost') + '/contract/deployed',
            method: 'POST',
            body: {
                contractInfo: {
                    name: name,
                    address: address
                }
            },
            json: true
        };
        return request(options);
    }
}