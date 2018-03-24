const SOAPWrapper = require('../utils/SOAPWrapper');
const wrapper = new SOAPWrapper();
const Utils = require('../utils/utils.js');
const UUID = require('uuid-js');

class ChargingPoint {
    constructor(uri, identifier, wsdl, callback, self_ip) {
        var self = this;
        this.uri = uri;
        this.chargePointId = identifier;
		this.wsdl = wsdl;
		this.callback = callback;
		this.actionsQueue = [];
		this.self_ip = self_ip;
		
		this.connect()
    }
	
	connect() {
		var _this = this;
        wrapper.createCentralClient(this.uri, this.wsdl, this.callback).then(function(client) {
            console.log('[ChargingPoint] Creating Client for Central System Service');
            _this.client = client;
			//console.log('_this:');
			//console.log(_this);
        }).catch(function(error) {
			//console.log(error)
			console.log('Reconnect in 3 sec');
			setTimeout(function(){
				_this.connect();
			}, 3000);
		});
	}
	
	processActionsQueue() {
	    var msg = null;
		if(!this.client){
			console.log('Client not connected...');
			setTimeout(function(context){context.processActionsQueue()}, 3000, this);
			return
		}
		
	    while(msg = this.actionsQueue.pop()) {
			//console.log('start ' + msg.procedure.uncapitalize());
			//console.log('with args')
			//console.log(msg.arguments);
			this[msg.procedure.uncapitalize()](msg.arguments);
	    }
  	}

    getId() {
      return this.chargePointId;
    }

    _updateSoapHeaders() {
        if (this.client) {
            // Remove soap headers
            this.client.clearSoapHeaders();

            // Generate a V4 UUID
            var uuid4 = UUID.create();

            // Add addressing info
            this.client.addSoapHeader('<a:Action s:mustUnderstand="1">'+ this.action +'</a:Action>')
            this.client.addSoapHeader('<h:chargeBoxIdentity xmlns="urn://Ocpp/Cp/2012/06/" xmlns:h="urn://Ocpp/Cs/2012/06/">'+ this.getId() + '</h:chargeBoxIdentity>')
            this.client.addSoapHeader('<a:MessageID>urn:uuid:' + uuid4 + '</a:MessageID>')
            this.client.addSoapHeader('<ActivityId CorrelationId="92e71dbc-1a3c-47a2-aac4-38216cf90872" xmlns="http://schemas.microsoft.com/2004/09/ServiceModel/Diagnostics">ca154a34-9c63-45fc-b023-b9b1486a5004</ActivityId>')
            this.client.addSoapHeader('<a:ReplyTo><a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address></a:ReplyTo>')
            this.client.addSoapHeader('<a:From><a:Address>http://' + this.self_ip + '/Ocpp/ChargePointService</a:Address></a:From>')
            //this.client.addSoapHeader('<a:To>'+ this.uri +'</a:To>')
        } else {
            console.log('[ChargingPoint] Client for Central System Service is not ready !');
        }
    }

	sendHB(cbxs, dropFirst) {
		var interval = cbxs.heartBeatInterval;
		//console.log('dropFirst '+ dropFirst);
		if(!interval)
		  return;

		if(!dropFirst)
			cbxs['heartbeat']();

		cbxs.hbTimeout = setTimeout(cbxs.sendHB, interval * 1000, cbxs, false);
	}
	
	bootNotificationResult(values) {
		var cbxs = this;
		var self = global;
		if(self.mongo_client_online_status != false) self.mongo_db_instance.collection("boot_notification_state").findOne({}, function(err, old_state) {
			if (self.throw_callback(err))
				return;

			var new_state = {
				$set: {
		    		BN_CS_DATETIME: new Date(values.currentTime).getTime(),
		    		BN_EVCHST_ACCEPTED: +(values.status == 'Accepted')
				}
			}

			if(old_state != null && !!old_state._id){
				self.mongo_db_instance.collection("boot_notification_state").updateOne({_id: old_state._id}, new_state, function(err, res){
					if (self.throw_callback(err))
						return;
					if(values.status == 'Accepted')
						self.boot_state = 3;
					else
						self.boot_state = 4;
				});
			}
		});
		
		if(values.status == 'Accepted'){
			cbxs.heartBeatInterval = values.heartbeatInterval;
			cbxs.sendHB(cbxs, false);
		}
    }

    bootNotification(data, callback) {
		var _this = this;
        this.action = '/BootNotification';

        this._updateSoapHeaders();

        var request = {
          bootNotificationRequest: data
        }

        this.client.BootNotification(request, function(err, result) {
			//console.log("===========");
			//console.log(_this.client.lastRequest);
			//console.log("===========");
			//console.log("result:");
			//console.log(result);
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
				if(!!result){
                	console.log('[ChargingPoint] BootNotification Result ' + JSON.stringify(result));
					_this.bootNotificationResult(result)
				} else {
					self.boot_state = 4;
				}
            }
        });

    }
	
	heartbeatResult(values) {
		var cbxs = this;
		var self = global;
		if(self.mongo_client_online_status != false) self.mongo_db_instance.collection("heartbeat_state").update(
			{ 
				query: 'not_finded'
			}, {
				$set: { HB_CS_DATETIME: new Date(values.currentTime).getTime() }
			}, {
				//new: true,   // return new doc if one is upserted
				upsert: true // insert the document if it does not exist
			}, self.throw_callback
		);
    }

    heartbeat() {
		var _this = this;
        this.action = '/Heartbeat';

        this._updateSoapHeaders();

        var request = {
          heartbeatRequest: {}
        }

        this.client.Heartbeat(request, function(err, result, envelope, soapHeader) {
			//console.log("===========");
			//console.log("lastRequest");
			//console.log(_this.client.lastRequest);
			//console.log("Respons");
			//console.log(envelope);
			//console.log("===========");
			//console.log("result:");
			//console.log(result);
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] Heartbeat Result ' + JSON.stringify(result));
				if(!!result) _this.heartbeatResult(result);
            }
        });
    }
	
	

    meterValues(data) {
		var _this = this;
        this.action = '/MeterValues';

        this._updateSoapHeaders();

        var request = {
          meterValuesRequest: data
        }

        this.client.MeterValues(request, function(err, result) {
			console.log('[ChargingPoint] MeterValues Sended: ');
			console.log(JSON.stringify(data));
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] MeterValues Result ' + JSON.stringify(result));
            }
        });
    }

    statusNotification(data) {
		var _this = this;
        this.action = '/StatusNotification';

        this._updateSoapHeaders();
		
        var request = {
          statusNotificationRequest: data
        }

        this.client.StatusNotification(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] StatusNotification Success');
            }
        });
    }
	
	getMeasurementValue(type, data, connectorId){
		var value = {};
		switch(type){
			case 'Energy.Active.Import.Register':
				value = {
					"measurand": type,
					"value": data['MV_CONNECTOR' + connectorId + '_WHMETER'],
					"unit": "Wh"
				};
			break;
			case 'Power.Active.Import':
				value = {
					"measurand": type,
					"value": data['MV_CONNECTOR' + connectorId + '_ACTPOW'],
					"unit": "W"
				};
			break;
			case 'Voltage':
				value = {
					"measurand": type,
					"value": data['MV_CONNECTOR' + connectorId + '_VOLTAGE'],
					"unit": "Volt"
				};
			break;
			case 'Current.Import':
				value = {
					"measurand": type,
					"value": data['MV_CONNECTOR' + connectorId + '_CURRENT'],
					"unit": "Amp"
				};
			break;
			default:
				value = {};
		}
		return value;
	}
	
	runAlignedMeasuring(cbxs, connectorID, type){
		var self = global;
		
		var meter_data = (type == 'aligned') ? cbxs.meterValuesAlignedData : cbxs.meterValuesSampledData;
		var stop_data = (type == 'aligned') ? cbxs.stopTxnAlignedData : cbxs.stopTxnSampledData;
		var context = (type == 'aligned') ? 'Sample.Clock' : 'Sample.Periodic'
		var transactionId = cbxs['chargingOnConnector_' + connectorID];
		
		if(transactionId == undefined && type == 'sampled' && +cbxs.sampleOnTransaction)
			return;
		
		var aligned_measurent_names = meter_data.split(',');
		var stop_measurent_names = stop_data.split(',');
		var meter_values = [];
		var stop_values = [];
		var timestamp = new Date().toISOString().slice(0, 19) + 'Z';
		
		self.mongo_db_instance.collection("meter_values").findOne({}, function(err, old_state) {
			if(old_state != null && !!old_state._id){
				if(!!meter_data && aligned_measurent_names.length > 0){
					for(var i = 0; i < aligned_measurent_names.length; i++){
						var aligned_value = cbxs.getMeasurementValue(aligned_measurent_names[i], old_state, connectorID);
						if(!!aligned_value){
							aligned_value.timestamp = timestamp
							aligned_value.context = context;
							meter_values.push(aligned_value);
						}
					}
						
					if(type == 'sampled' && !!transactionId)
						cbxs['meterValues']({
							"values": meter_values,
							connectorId: connectorID,
							transactionId: transactionId
						});
					else
						cbxs['meterValues']({
							"values": meter_values,
							connectorId: connectorID
						});
					
				}
				if(!!transactionId && !!stop_data && stop_measurent_names.length > 0){
					for(var i = 0; i < stop_measurent_names.length; i++){
						var stop_aligned_value = cbxs.getMeasurementValue(stop_measurent_names[i], old_state, connectorID);
						if(!!stop_aligned_value){
							stop_aligned_value.context = context;
							stop_values.push(stop_aligned_value);
						}
					}
					if(!cbxs['transactionMeasurement_' + transactionId])
						cbxs['transactionMeasurement_' + transactionId] = [];
					
					cbxs['transactionMeasurement_' + transactionId].push({
						"timestamp": timestamp,
						"values": stop_values
					});
				}
			}
		});
	}
	
	startIntervalMeasuring(cbxs, transactionID, connectorId, first){
		var self = global;
		var interval = cbxs.meterValueSampleInterval;
		if(interval == 0){
			cbxs.sampleMeterTimeout = setTimeout(cbxs.startIntervalMeasuring, 5 * 1000, cbxs, transactionID, connectorId, false);
			return
		}
		console.log('cbxs[chargingOnConnector_' + connectorId + ']: ' + cbxs['chargingOnConnector_' + connectorId])
		if(cbxs['chargingOnConnector_' + connectorId] != transactionID){
			return
		} else {

			if(!first)
				self.mongo_db_instance.collection("meter_values").findOne({}, function(err, old_state) {
					if(old_state != null && !!old_state._id){
						var sampled_measurent_names = cbxs.meterValuesSampledData.split(',');
						var stop_measurent_names = cbxs.stopTxnSampledData.split(',');
						var values = [];
						var stop_values = [];
						var timestamp = new Date().toISOString().slice(0, 19) + 'Z';
						if(!!cbxs.meterValuesSampledData && sampled_measurent_names.length > 0){
							for(var i = 0; i < sampled_measurent_names.length; i++){
								var sampled_value = cbxs.getMeasurementValue(sampled_measurent_names[i], old_state, connectorId);
								if(!!sampled_value){
									sampled_value.timestamp = timestamp;
									sampled_value.context = 'Sample.Periodic';
									values.push(sampled_value);
								}
							}

							cbxs['meterValues']({
								"connectorId": connectorId,
								"transactionId": transactionID,
								"values": values
							});
						}
						if(!!cbxs.stopTxnSampledData && stop_measurent_names.length > 0){
							for(var i = 0; i < stop_measurent_names.length; i++){
								var stop_sampled_value = cbxs.getMeasurementValue(stop_measurent_names[i], old_state, connectorId);
								if(!!stop_sampled_value){
									stop_sampled_value.context = 'Sample.Periodic';
									stop_values.push(stop_sampled_value);
								}
							}
							if(!cbxs['transactionMeasurement_' + transactionID])
								cbxs['transactionMeasurement_' + transactionID] = [];
							
							cbxs['transactionMeasurement_' + transactionID].push({
								"timestamp": timestamp,
								"values": stop_values
							});
						}
					}
				});

			cbxs.sampleMeterTimeout = setTimeout(cbxs.startIntervalMeasuring, interval * 1000, cbxs, transactionID, connectorId, false);
		}
	}
	
	startTransactionResult(values, connectorId) {
		var cbxs = this;
		var self = global;
		
		if(self.mongo_client_online_status != false) self.mongo_db_instance.collection("start_transaction").updateOne(
			{
				STATUS: 'TransmittedToOCPP',
				CONNECTOR_ID: connectorId
			}, {
				$set: {
					STATUS: 'ReceivedFromOCPP', 
					TIME: new Date().getTime(),
					START_COMPLETE: 1,
					START_ACCEPTED: (!!values && !!values.idTagInfo && !!values.idTagInfo.status && values.idTagInfo.status.toUpperCase() == 'ACCEPTED'),
					START_TRANSACTION_ID: values.transactionId
				} 
			}, function(err, res){
				if (self.throw_callback(err))
					return;
				
				cbxs['chargingOnConnector_' + connectorId] = values.transactionId;
				
				if(cbxs.METER_SAMPLED_TYPE == 'SAMPLED')
					cbxs.startIntervalMeasuring(cbxs, values.transactionId, connectorId, true);
			}
		);
    }

    startTransaction(data) {
		var _this = this;
        this.action = '/StartTransaction';

        this._updateSoapHeaders();

        var request = {
          startTransactionRequest: data
        }

        this.client.StartTransaction(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] StartTransaction Result ' + JSON.stringify(result));
				_this.startTransactionResult(result, data.connectorId);
            }
        });
    }
	
	stopTransactionResult(values) {
		var cbxs = this;
		var self = global;
		
		if(self.mongo_client_online_status != false) self.mongo_db_instance.collection("stop_transactions").updateMany(
			{
				STATUS: 'TransmittedToOCPP'
			}, {
				$set: {
					STATUS: 'ReceivedFromOCPP'
				} 
			}, self.throw_callback
		);
	}

    stopTransaction(data) {
		var _this = this;
        this.action = '/StopTransaction';

        this._updateSoapHeaders();

		if(!!this['transactionMeasurement_' + data.transactionId]){
			data.transactionData = this['transactionMeasurement_' + data.transactionId];
			this['transactionMeasurement_' + data.transactionId] = undefined;
		}

        var request = {
          stopTransactionRequest: data
        }
		
		if(this['chargingOnConnector_1'] == data.transactionId)
			this['chargingOnConnector_1'] = undefined;
		if(this['chargingOnConnector_2'] == data.transactionId)
			this['chargingOnConnector_2'] = undefined;
		
        this.client.StopTransaction(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] StopTransaction Result ' + JSON.stringify(result));
				_this.stopTransactionResult(result);
            }
        });
    }
	
	
	authorizeResult(values) {
		var cbxs = this;
		var self = global;
		
		if(self.mongo_client_online_status != false) self.mongo_db_instance.collection("tag_requests").updateOne(
			{
				STATUS: 'TransmittedToOCPP'
			}, {
				$set: {
					STATUS: 'ReceivedFromOCPP', 
					TIME: new Date().getTime(),
					AUTH_COMPLETE: 1,
					AUTH_IDTAG_ACCEPTED: (!!values && !!values.idTagInfo && !!values.idTagInfo.status && values.idTagInfo.status.toUpperCase() == 'ACCEPTED')
				} 
			}, self.throw_callback
		);
    }

    authorize(data) {
		var _this = this;
        this.action = '/Authorize';

        this._updateSoapHeaders();

        var request = {
          authorizeRequest: data
        }

        this.client.Authorize(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] Authorize Result ' + JSON.stringify(result));
				_this.authorizeResult(result)
            }
        });
    }

    diagnosticsStatusNotification(data) {
        this.action = '/DiagnosticsStatusNotification';

        this._updateSoapHeaders();

        var request = {
          diagnosticsStatusNotificationRequest: data
        }

        this.client.DiagnosticsStatusNotification(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] DiagnosticsStatusNotification Result ' + JSON.stringify(result));
            }
        });
    }

    firmwareStatusNotification(data) {
        this.action = '/FirmwareStatusNotification';

        this._updateSoapHeaders();

        var request = {
          firmwareStatusNotificationRequest: data
        }

        this.client.FirmwareStatusNotification(request, function(err, result) {
            if (err) {
                console.log('[ChargingPoint] ERROR Central System ' + err);
            } else {
                console.log('[ChargingPoint] FirmwareStatusNotification Result ' + JSON.stringify(result));
            }
        });
    }
}

module.exports = ChargingPoint;
