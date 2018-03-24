const Promise = require('promise');
const moment = require('moment');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
			
			var list = [
				'AABB',
				'ABBB',
				'B4F62CEF'
			]
			
			if(list.indexOf(data.idTag) != -1){
				resolve({
					AuthorizeResponse: {
						idTagInfo: {
							status: 'Accepted',
							expiryDate: moment().add(1, 'months').format(),
							parentIdTag: 'PARENT'
						}
					}
				});
			} else {
				resolve({
					AuthorizeResponse:{
						idTagInfo: {
							status: 'Invalid',
							expiryDate: moment().subtract(1, 'months').format(),
							parentIdTag: 'PARENT'
						}
					}
				});
			}
        });
    }
}
