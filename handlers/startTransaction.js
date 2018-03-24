const Promise = require('promise');
const moment = require('moment');
const Utils = require('../utils/utils.js')
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
			resolve({
                StartTransactionResponse: {
                    transactionId: (''+new Date().getTime()).slice(-5),
                    idTagInfo: {
                        status: 'Accepted'
                    }
                }
			});
        });
    }
}
