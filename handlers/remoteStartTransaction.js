const Promise = require('promise');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
  handle: function(data){
    // TODO: save new availability status for station [Issue #7]
    return new Promise(function(resolve, reject) {
		var self = global, cbxs = self.point, values = data;
		
      	var idTag = values.idTag+'';
      	var connectorId = values.connectorId;

		if(!connectorId)
			resolve({
				remoteStartTransactionResponse: {
					status: 'Rejected'
				}
			});
		
		if( self.mongo_client_online_status != false){
			self.mongo_db_instance.collection("start_requests").update(
				{
					CONNECTOR_ID: connectorId
				}, {
					$set: {
						'STATUS': 'ReceivedFromOCPP',
						'TAG_ID': idTag
					} 
				}, {
					upsert: true
				}, function(err, res){
					if(self.throw_callback(err))
						resolve({
							remoteStartTransactionResponse: {
								status: 'Rejected'
							}
						});
					
					var checkInterval = false;
					var attempts = 50;
					checkInterval = setInterval(function(){
						if(attempts == 0){
							clearInterval(checkInterval);
							resolve({
								remoteStartTransactionResponse: {
									status: 'Rejected'
								}
							});
						}
						self.mongo_db_instance.collection("start_requests").findOne({
							STATUS: 'ReceivedFromModbus',
							CONNECTOR_ID: connectorId,
							TAG_ID: idTag
						}, function(err, res){
							if(self.throw_callback(err))
								return
							if(!!res){
								resolve({
									remoteStartTransactionResponse: {
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
				remoteStartTransactionResponse: {
			    	status: 'Rejected'
			  	}
			});
		}
    });
  }
}
