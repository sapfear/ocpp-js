const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
		var self = global, cbxs = self.point, values = data;

		if(self.mongo_client_online_status != false){
			if(self.whiteListVersion !== 0) 
				self.mongo_db_instance.collection("local_list").drop(function(err){	
					if (self.throw_callback(err))
						return;
					self.whiteList = [];
					self.whiteListVersion = 0;
				});
			resolve({
				clearCacheResponse: {
			    	status: 'Accepted'
			  	}
			});
		} else {
			resolve({
				clearCacheResponse: {
			    	status: 'Rejected'
			  	}
			});
		}
    });       	
  }
}
