const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    // TODO: save new availability status for station [Issue #14]
    return new Promise(function(resolve, reject) {
		var self = global, cbxs = self.point, values = data;
		var connectorId = values.connectorId + '';
	  
		if(self.mongo_client_online_status != false){
			self.mongo_db_instance.collection("lock_state").update(
				{
					CONNECTOR_ID: connectorId
				}, {
					$set: {
						STATUS: 'ReceivedFromOCPP',
						CAN_LOCK: 0,
						CONNECTOR_ID: connectorId
					} 
				}, {
					upsert: true
				}, self.throw_callback
			);	
			resolve({
				UnlockConnectorResponse: {
			    	status: 'Accepted'
			  	}
			});
		} else {
			resolve({
				UnlockConnectorResponse: {
			    	status: 'Rejected'
			  	}
			});
		}
    });
  }
}
