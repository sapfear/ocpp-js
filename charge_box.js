var OCPP =  require('./index.js');
const MongoClient    = require('mongodb').MongoClient;
const MAIN_LOOP_TIMEOUT = 500;
const METER_SAMPLED_TYPE = 'ALIGNED'; //'SAMPLED'

String.prototype.uncapitalize = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

var self = global;
global.whiteList = undefined;
global.whiteListVersion = 0;

self.mongo_url = 'mongodb://localhost:27017/test_2';
self.boot_state = 1; //not booted
self.mongo_client_online_status = false;

var options = {
  chargingPoint: {
	serverURI: 'http://193.33.193.36:8080/ocpp/CentralSystemService15', //test moesk
	//serverURI: 'http://ev.moesk.ru/ocpp/CentralSystemService15', //prod moesk
	//serverURI: 'http://localhost:9220/Ocpp/CentralSystemService', //test local
    name: 'PCS_Premium_00000001',
	chargePointIP: '192.168.0.104:9000'
  },
  chargingPointServer: {
    port: 9000
  }
}

var ocppJS = new OCPP(options, function(command){
	console.log( command );
	
	var menu_list = 
		'<h2>Client Remote</h2><br/>' + 
		'<a href="/?remote=bootNotification">bootNotification</a><br/>' + 
		'<a href="/?remote=startTransaction">startTransaction</a><br/>' + 
		'<a href="/?remote=stopTransaction">stopTransaction</a><br/>' + 
		'<a href="/?remote=Authorize">Authorize</a><br/>' + 
		'<a href="/?remote=meterValues">MeterValues</a><br/>' + 
		'<a href="/?remote=StatusNotification">StatusNotification</a><br/>';
		
	var answer = function(message){
		return '<html><body>' + message + menu_list + '</body></html>';
	}
	
	switch(command) {
		case 'bootNotification': 
			cbxs.bootNotification({
				chargePointVendor: 'www.snzmomentum.ru',
				chargePointModel: 'PCS_Premium',
				chargePointSerialNumber: '00000001',
				chargeBoxSerialNumber: '00000001',
				firmwareVersion: '0.10',
				iccid: '',
				imsi: '',
				meterType: 'IB IL PM 3P/N/EF-PAC',
				meterSerialNumber: '00000001'
			});
			
			return answer( 'bootNotification sended' );
		break;
		
		case 'meterValues': 
			cbxs.meterValues({
				"connectorId": 2,
				"transactionId": 2,
				"values": [{
					"timestamp": "2013-03-07T16:52:16Z",
					"value": "0",
					"unit": "Wh",
					"measurand": "Energy.Active.Import.Register"
				}, {
					"timestamp": "2013-03-07T16:52:16Z",
					"value": "0",
					"unit": "varh",
					"measurand": "Energy.Reactive.Import.Register"
				}]
			});
			return answer( 'meterValues sended' );
		break;
		
		case 'startTransaction': 
			cbxs.startTransaction({
				idTag: 'B4F62CEF',
				timestamp: '2013-02-01T15:09:18Z',
				meterStart: 0,
				reservationId: 0,
				connectorId: 1
			});
			return answer( 'startTransaction sended' );
		break;
		case 'stopTransaction': 
			cbxs.stopTransaction({
				transactionId: 42396,
				idTag: 'B4F62CEF',
				timestamp: "2013-02-01T15:09:18Z",
				meterStop: 20,
				transactionData: [{
					"values": [{
						"timestamp": "2013-03-07T16:52:16Z",
						"values": [{
							"value": "0",
							"unit": "Wh",
							"measurand": "Energy.Active.Import.Register"
						}, {
							"value": "0",
							"unit": "varh",
							"measurand": "Energy.Reactive.Import.Register"
						}]
					}]
				}]
			});
			return answer( 'stopTransaction sended' );
		break;
		case 'Authorize': 
			console.log('findedInLocalList: ' + findedInLocalList('B4F62CEF1'));
			
			cbxs.authorize({
				idTag: 'B4F62CEF1'
			});
			return answer( 'Authorize sended' );
		break;
		case 'StatusNotification': 
			cbxs.sendStatusNotification({
				status: 'Available',
				errorCode: 'NoError',
				connectorId: 1,
				timestamp: "2013-02-01T15:09:18Z"
			});
			return answer( 'StatusNotification sended' );
		break;
		
		default:
			return answer( command + ' is not found' );
		
	}
});

// Charging Point Params can be also taken from options
var cbxs = ocppJS.createChargingPoint();

self.point = cbxs;

// Create Charging Point Server
var cbxsServer = ocppJS.createChargingPointServer(options.chargingPointServer.port, function(command, data){
	
});
	
self.throw_callback = function(err, result) {
	if(!!err){
		//mongo_db_instance.close();
		//mongoConnect(1000);
		self.mongo_client_online_status = false;
		return true;
	}
	return false
	//if (err) throw err;
}

findedInLocalList = function(TAG_ID){
	var result = false;
	for(i = 0; i < self.whiteList.length; i++){
		if(self.whiteList[i].idTag == TAG_ID && (new Date(self.whiteList[i].idTagInfo.expiryDate) > new Date()) )
			result = true;
	}
	return result;
}

var print_idle = (function(){
	var a = 0;
	var progress_letters = ["/", "—", "\\", "|"];
	return function(text){
		a++;
		process.stdout.write('  ' + text + ' ' + progress_letters[a%progress_letters.length] + '\033[0G');
	}
})()

main_loop = function(delay){
	setTimeout(function(){
		print_idle('IDLE');
		if(self.mongo_client_online_status == false){
			main_loop(delay);
			return;
		}
		
		self.mongo_db_instance.collection("tag_requests").findOne({STATUS: 'ReceivedFromModbus'}, function(err, result) {
			if (self.throw_callback(err))
				return;
			if(!!result && !!result.AUTH_IDTAG){
				if(findedInLocalList(result.AUTH_IDTAG)){
					console.log('finded in localAuthorisationList');
					self.mongo_db_instance.collection("tag_requests").updateOne(
						{
							STATUS: 'ReceivedFromModbus'
						}, {
							$set: {
								STATUS: 'ReceivedFromOCPP', 
								TIME: new Date().getTime(),
								AUTH_COMPLETE: 1,
								AUTH_IDTAG_ACCEPTED: 1
							} 
						}, self.throw_callback
					);
				} else {
					if(true) {//new Date().getTime() - self.auth_request_time > 10*1000){
						self.mongo_db_instance.collection("tag_requests").updateOne({_id: result._id}, { $set: {STATUS: 'TransmittedToOCPP'} }, function(err, res){
							if (self.throw_callback(err))
								return;
								
							self.idTagTmp = result.AUTH_IDTAG;
							self.auth_request_time = new Date().getTime();
							
							cbxs.actionsQueue.push({
								procedure: 'Authorize',
								arguments: { idTag: result.AUTH_IDTAG }
							});
							cbxs.processActionsQueue();
						});
					}
				}
			}
		});
		
		self.mongo_db_instance.collection("status_notifications").findOne({STATUS: 'ReceivedFromModbus'}, function(err, result) {
			if (self.throw_callback(err))
				return;
			if(!!result && !!result.SN_CON_FAULTCODE && !!result.SN_CON_STATUS && !!result.CONNECTOR_ID){
				self.mongo_db_instance.collection("status_notifications").updateOne({_id: result._id}, { $set: {STATUS: 'TransmittedToOCPP'} }, function(err, res){
					if (self.throw_callback(err))
						return;
					cbxs.actionsQueue.push({
						procedure: 'StatusNotification',
						arguments: {
				        	connectorId: result.CONNECTOR_ID,
				        	status: result.SN_CON_STATUS,
				        	errorCode: result.SN_CON_FAULTCODE
				      	}
					});
					cbxs.processActionsQueue();
				});
			} else {
				if(!!result && !!result._id){
					self.mongo_db_instance.collection("status_notifications").updateOne({_id: result._id}, { $set: {STATUS: 'FieldsError'} }, self.throw_callback);
					console.log('FieldsError')
				} 
			}
		});
		
		self.mongo_db_instance.collection("start_transaction").findOne({STATUS: 'ReceivedFromModbus'}, function(err, result) {
			if (self.throw_callback(err))
				return;
			
			if(!!result && !!result.START_IDTAG){
				self.mongo_db_instance.collection("start_transaction").updateOne({_id: result._id}, { $set: {STATUS: 'TransmittedToOCPP'} }, function(err, res){
					if (self.throw_callback(err))
						return;
					
					mongo_db_instance.collection("reserve_state").find(
						{
							STATUS: 'TransmittedToModbus',
							RESERV_CON_IDTAG: result.START_IDTAG,
						}
					).sort({ _id: -1 }).limit(2).toArray( function(err, old_state) {
						if (throw_callback(err))
							return;
						
						var reservationId = 0;

						if (!!old_state) for(i = 0; i < old_state.length; i++ ){
							var values = old_state[i];	
							if(!!values && +values.RESERV_CON_DATETIME > new Date().getTime()){
								reservationId = values.RESERV_CON_RESID;
								
								mongo_db_instance.collection("reserve_state").updateOne({_id: values._id}, { $set: {STATUS: 'ReceivedFromOCPP', RESERV_CON_CMD: 0} }, throw_callback);
							}
						}
					
						cbxs.actionsQueue.push({
							procedure: 'StartTransaction',
							arguments: { 
								connectorId: result.START_CONNECTOR_ID,
						        idTag: result.START_IDTAG,
						        timestamp: result.TIME,
						        meterStart: result.START_WHMETER,
						        reservationId: reservationId
							}
						});
						cbxs.processActionsQueue();
						
					});
					
				});
			}
		});
		
		self.mongo_db_instance.collection("stop_transactions").findOne({STATUS: 'ReceivedFromModbus'}, function(err, result) {
			if (self.throw_callback(err))
				return;
			
			
			
			if(!!result && (!result.STOP_IDTAG || !result.STOP_CONNECTOR_ID)){
				console.log('errored stop request')
				console.log(result);
				
				self.mongo_db_instance.collection("stop_transactions").updateOne(
					{ _id: result._id }, 
					{ $set: {STATUS: 'Error'} }, 
					self.throw_callback
				);
				
			}
			
			if(!!result && !!result.STOP_IDTAG){
				console.log(result)
				self.mongo_db_instance.collection("stop_transactions").updateOne({_id: result._id}, { $set: {STATUS: 'TransmittedToOCPP'} }, function(err, res){
					//console.log(err)
					//console.log(res)
					
					if (self.throw_callback(err))
						return;
					cbxs.actionsQueue.push({
						procedure: 'StopTransaction',
						arguments: { 
					        transactionId: result.STOP_TRANSACTION_ID,
					        idTag: result.STOP_IDTAG,
					        timestamp: result.TIME,
					        meterStop: result.STOP_WHMETER,
					        transactionData: null
						}
					});
					cbxs.processActionsQueue();
				});
			}
		});
		main_loop(delay);
	}, delay);
}

boot_notificate_loop = function(delay){
	setTimeout(function(){
		if(self.mongo_client_online_status == true){
			switch(self.boot_state){
				case 1:
					//not booted
					print_idle('Boot_state: not booted');
					self.mongo_db_instance.collection("boot_notification_state").findOne({}, function(err, result) {
						
						if (err) boot_notificate_loop(delay);
						
						if (!!result && result.BN_PLC_RUNNING == 1){
							console.log('result.BN_PLC_RUNNING == 1');
							
							
							cbxs.actionsQueue.push({
								procedure: 'BootNotification',
								arguments: {
							        chargePointVendor: 'MOMENTUM_VENDOR',
							        chargePointModel: result.BN_EVCHST_MODEL,
							        chargePointSerialNumber: 'POINT_' + result.BN_PLC_SW_VERSION,
							        chargeBoxSerialNumber: 'BOX_' + result.BN_PLC_SW_VERSION,
							        firmwareVersion: result.BN_PLC_SW_VERSION,
							        iccid: '',
							        imsi: '',
							        meterType: 'DBT NQC-ACDC',
							        meterSerialNumber: '1.000e48'
						      	}
							});
							cbxs.processActionsQueue();
							
							self.mongo_db_instance.collection("local_list").findOne({}, function(err, result) {
								self.whiteList = (!!result && !!result.TAG_LIST) ? result.TAG_LIST : [];
								self.whiteListVersion = (!!result && !!result.LIST_VERSION) ? result.LIST_VERSION : 0;
							});
							self.mongo_db_instance.collection("configuration_info").findOne({CONFIG: 'SUPPORTED'}, function(err, result) {
								
								cbxs.METER_SAMPLED_TYPE = METER_SAMPLED_TYPE;
								
								cbxs.connectionTimeOut = 1200;
								cbxs.meterValueSampleInterval = 0;
								cbxs.clockAlignedDataInterval = 0;
								cbxs.meterValuesAlignedData = 'Voltage';
								cbxs.meterValuesSampledData = 'Current.Import';
								cbxs.stopTxnSampledData = 'Current.Import';
								cbxs.stopTxnAlignedData = 'Current.Import';
								cbxs.sampleOnTransaction = 0;
								
								if(!!result){
									//cbxs.heartBeatInterval = result.HeartBeatInterval;
									if(result.ConnectionTimeOut != undefined) cbxs.connectionTimeOut = +result.ConnectionTimeOut;
									//if(result.MeterValueSampleInterval != undefined) cbxs.meterValueSampleInterval = +result.MeterValueSampleInterval;
									//if(result.ClockAlignedDataInterval != undefined) cbxs.clockAlignedDataInterval = +result.ClockAlignedDataInterval;
									if(result.MeterValuesAlignedData != undefined) cbxs.meterValuesAlignedData = result.MeterValuesAlignedData;
									if(result.MeterValuesSampledData != undefined) cbxs.meterValuesSampledData = result.MeterValuesSampledData;
									if(result.StopTxnSampledData != undefined) cbxs.stopTxnSampledData = result.StopTxnSampledData;
									if(result.StopTxnAlignedData != undefined) cbxs.stopTxnAlignedData = result.StopTxnAlignedData;
								}
							});
						    self.boot_state = 2;
							boot_notificate_loop(delay);
						} else {
							boot_notificate_loop(200);
						}
					});
				break;
				case 2:
					//wait boot response from ocpp
					print_idle('Boot_state: wait boot response from ocpp');
					boot_notificate_loop(200);
				break;
				case 3:
					//boot notification successfull
					console.log('Boot_state: boot notification successfull');
					main_loop(MAIN_LOOP_TIMEOUT);
					var d = new Date();
					setTimeout(meter_aligned_loop, (10-(d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds())%10)*1000);
				break;
				case 4:
					//wait boot response from ocpp
					console.log('Boot_state: boot Rejected. Start Fail. Call exit from script...');
					process.exit();
				break;
			}
		} else {
			boot_notificate_loop(delay);
		}
	}, delay);
}

var meter_aligned_loop = function(delay){
	var d = new Date();
	setTimeout(meter_aligned_loop, (10-(d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds())%10) * 1000);
	
	if(cbxs.clockAlignedDataInterval != 0 && (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds())%cbxs.clockAlignedDataInterval <= 1){
		console.log('Runned Aligned Meter ' + new Date().toTimeString());
		cbxs.runAlignedMeasuring(cbxs, 1, 'aligned');
		cbxs.runAlignedMeasuring(cbxs, 2, 'aligned');	
	}
	
	if(METER_SAMPLED_TYPE == 'ALIGNED'){
		if(cbxs.meterValueSampleInterval != 0 && (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds())%cbxs.meterValueSampleInterval <= 1){
			console.log('Runned Sampled Meter ' + new Date().toTimeString());
			cbxs.runAlignedMeasuring(cbxs, 1, 'sampled');
			cbxs.runAlignedMeasuring(cbxs, 2, 'sampled');
		}
	}
}

var mongoConnect = function(delay){
	setTimeout(function(){
		console.log("MongoClient start connect");
		MongoClient.connect(self.mongo_url, {
		        reconnectTries: 60, // retry to connect for 60 times
		        reconnectInterval: 1000 // wait 1 second before retrying
		}, function(err, db) {
			self.mongo_client_online_status = (err == null);
			self.mongo_db_instance = db;
			console.log('mongo_connection established: ' + self.mongo_client_online_status);
			if(!self.mongo_client_online_status){
				mongoConnect(delay);
			} else {
    			self.mongo_db_instance.s.topology.on('close', () => self.mongo_client_online_status = false );
    			self.mongo_db_instance.s.topology.on('reconnect', () => self.mongo_client_online_status = true );
				boot_notificate_loop(3000);
			}
		});
	}, delay)
}

mongoConnect(1000);


