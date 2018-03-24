const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    // TODO: save new availability status for station [Issue #15]
    return new Promise(function(resolve, reject) {
		var self = global, cbxs = self.point, values = data;
		
		var connectorId = values.connectorId + '';
		var can_charge = (!!values && !!values.type && values.type.toUpperCase() == 'OPERATIVE')
	  
		if(self.mongo_client_online_status != false){
			self.mongo_db_instance.collection("availability_state").update(
				{
					CONNECTOR_ID: connectorId
				}, {
					$set: {
						STATUS: 'ReceivedFromOCPP',
						CAN_CHARGE: can_charge,
						CAN_AUTH: can_charge,
						CONNECTOR_ID: connectorId
					} 
				}, {
					upsert: true
				}, self.throw_callback
			);	
			resolve({
				changeAvailabilityResponse: {
			    	status: 'Accepted'
			  	}
			});
		} else {
			resolve({
				changeAvailabilityResponse: {
			    	status: 'Rejected'
			  	}
			});
		}
    });
  }
}
