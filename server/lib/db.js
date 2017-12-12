const mongoose = require('mongoose');

module.exports = (() => {
    return {
        /**
         * Open a connection to the database
         * @param conf
         */
        init: function (conf) {
            var uri = '';
            if (global.env === 'production') {
                uri = conf.host;
            } else {
                uri = 'mongodb://' + conf.host + '/' + conf.database;
            }
            var opts = conf.options;
            mongoose.Promise = global.Promise;
            mongoose.connect(uri, opts);

            var db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', function callback() {
                console.log('db connection open');
                // Logger.debug('db connection open');
            });
        }
    };
})();