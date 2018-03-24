const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    // TODO: save new availability status for station [Issue #17]
    return new Promise(function(resolve, reject) {
		var self = global, cbxs = self.point, values = data;
      	var transactionId = values.transactionId+'';
		
		var connectorId = 0;
		if(cbxs['chargingOnConnector_1'] == transactionId)
			connectorId = 1;
		if(cbxs['chargingOnConnector_2'] == transactionId)
			connectorId = 2;

		if(!connectorId)
			resolve({
				remoteStopTransactionResponse: {
					status: 'Rejected'
				}
			});
		
		if(self.mongo_client_online_status != false){
			self.mongo_db_instance.collection("stop_requests").update(
				{
					TRANSACTION_ID: transactionId
				}, {
					$set: {
						'STATUS': 'ReceivedFromOCPP',
						'TRANSACTION_ID': transactionId,
						'CONNECTOR_ID': connectorId
					} 
				}, {
					upsert: true
				}, function(err, res){
					if(self.throw_callback(err))
						resolve({
							remoteStopTransactionResponse: {
								status: 'Rejected'
							}
						});
					
					var checkInterval = false;
					var attempts = 50;
					checkInterval = setInterval(function(){
						if(attempts == 0){
							clearInterval(checkInterval);
							resolve({
								remoteStopTransactionResponse: {
									status: 'Rejected'
								}
							});
						}
						self.mongo_db_instance.collection("stop_requests").findOne({
							STATUS: 'ReceivedFromModbus',
							CONNECTOR_ID: connectorId,
							TRANSACTION_ID: transactionId
						}, function(err, res){
							if(self.throw_callback(err))
								return
							if(!!res){
								resolve({
									remoteStopTransactionResponse: {
										status: !!res.ACCEPTED ? 'Accepted' : 'Rejected'
									}
								});
								clearInterval(checkInterval);
							}
						});
						attempts--
					}, 300);
				}
			);
		} else {
			resolve({
				remoteStopTransactionResponse: {
			    	status: 'Rejected'
			  	}
			});
		}
    });
  }
}
