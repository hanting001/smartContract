const mongoose = require('mongoose');
const updatedTimestamp = require('mongoose-updated_at');

var Schema = mongoose.Schema;

var schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    historyAddresses: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'smartContracts' });
schema.plugin(updatedTimestamp);

module.exports = mongoose.model('SmartContract', schema);