var OCPP =  require('./index.js');
const moment = require('moment');

var options = {
  centralSystem: {
    port: 8080
  }
}

var ocppJS = new OCPP(options, function(command){
	console.log( command );
	
	var st_name = 'PCS_Premium_00000001';
	var st_endpoint = 'http://127.0.0.1:9000/Ocpp/ChargePointService';

	var menu_list = 
		'<h2>Server Remote</h2><br/>' + 
		'<a href="/?remote=reset">reset</a><br/><br/>' + 
		'<a href="/?remote=SendLocalList">SendLocalList FULL</a><br/>' + 
		'<a href="/?remote=SendLocalListDifferential">SendLocalList DIFFERENTIAL</a><br/><br/>' + 
		'<a href="/?remote=GetLocalListVersion">GetLocalListVersion</a><br/>' + 
		'<a href="/?remote=GetConfiguration">GetConfiguration</a><br/>' + 
		'<a href="/?remote=ClearCache">ClearCache</a><br/>' + 
		'<a href="/?remote=RemoteStopTransaction">RemoteStopTransaction</a><br/>' + 
		'<a href="/?remote=RemoteStartTransaction">RemoteStartTransaction</a><br/>' + 
		'<a href="/?remote=ReserveNow">ReserveNow</a><br/>' + 
		'<a href="/?remote=CancelReservation">CancelReservation</a><br/>' + 
		'<a href="/?remote=ChangeAvailability">ChangeAvailability</a><br/>' + 
		'<a href="/?remote=UnlockConnector">UnlockConnector</a><br/><br/>' + 
		'<a href="/?remote=DataTransfer">DataTransfer</a><br/>' + 
		'<a href="/?remote=GetDiagnostics">GetDiagnostics</a><br/>' + 
		'<a href="/?remote=UpdateFirmware">UpdateFirmware</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationHeartBeatInterval">ChangeConfiguration HeartBeatInterval 45</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationConnectionTimeOut">ChangeConfiguration ConnectionTimeOut 1200</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationMeterValueSampleInterval">ChangeConfiguration MeterValueSampleInterval 0</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationMeterValueSampleInterval20">ChangeConfiguration MeterValueSampleInterval 20</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationClockAlignedDataInterval">ChangeConfiguration ClockAlignedDataInterval 0</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationClockAlignedDataInterval20">ChangeConfiguration ClockAlignedDataInterval 20</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationClockAlignedDataInterval900">ChangeConfiguration ClockAlignedDataInterval 900</a><br/><br/>' + 
		'<a href="/?remote=ChangeConfigurationSampleOnTransactionTrue">ChangeConfiguration SampleOnTransaction True</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationSampleOnTransactionFalse">ChangeConfiguration SampleOnTransaction False</a><br/><br/>' + 
		'<a href="/?remote=ChangeConfigurationMeterValuesAlignedData">ChangeConfiguration MeterValuesAlignedData</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationMeterValuesSampledData">ChangeConfiguration MeterValuesSampledData</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationStopTxnSampledData">ChangeConfiguration StopTxnSampledData</a><br/>' + 
		'<a href="/?remote=ChangeConfigurationStopTxnAlignedData">ChangeConfiguration StopTxnAlignedData</a><br/>';
	
	var answer = function(message){
		return '<html><body>' + message + menu_list + '</body></html>';
	}

	switch(command) {
		case 'reset': 
			server.reset(st_name, st_endpoint, { type: 'Soft' });
			return answer( 'reset sended' );
		break;
		case 'SendLocalList': 
			server.sendLocalList(st_name, st_endpoint, {
				updateType: 'FULL',
				listVersion: '121',
				localAuthorisationList: [{
					idTag: 'AABB1',
					idTagInfo: {
						expiryDate: moment().add(1, 'months').format()
					}
				}, {
					idTag: 'B4F62CEF1',
					idTagInfo: {
						expiryDate: moment().add(1, 'months').format()
					}
				}]
			});
			return answer( 'sendLocalList sended' );
		break;
		case 'SendLocalListDifferential': 
			server.sendLocalList(st_name, st_endpoint, {
				updateType: 'differential',
				listVersion: '122',
				localAuthorisationList: [{
					idTag: 'DIFF_AABB1',
					idTagInfo: {
						expiryDate: moment().add(1, 'months').format()
					}
				}, {
					idTag: 'DIFF_B4F62CEF1',
					idTagInfo: {
						expiryDate: moment().add(1, 'months').format()
					}
				}]
			});
			return answer( 'sendLocalList sended' );
		break;
		case 'GetLocalListVersion': 
			server.getLocalListVersion(st_name, st_endpoint);
			return answer( 'getLocalListVersion sended' );
		break;
		case 'GetConfiguration': 
			server.getConfiguration(st_name, st_endpoint, {
				key: ['ClockAlignedDataInterval', 'HeartBeatInterval', 'VENDOR_ID', 'KVCBX_PROFILE', 'errorlist']
			});
			return answer( 'getConfiguration sended' );
		break;
		case 'ClearCache': 
			server.clearCache(st_name, st_endpoint);
			return answer( 'clearCache sended' );
		break;
		case 'RemoteStopTransaction': 
			server.remoteStopTransaction(st_name, st_endpoint, {
				transactionId: '14755'
			});
			return answer( 'remoteStopTransaction sended' );
		break;
		case 'RemoteStartTransaction': 
			server.remoteStartTransaction(st_name, st_endpoint, {
				connectorId: 2,
				idTag: 'AABB'
			});
			return answer( 'remoteStartTransaction sended' );
		break;
		case 'ReserveNow': 
			server.reserveNow(st_name, st_endpoint, {
            	connectorId: '1',
				idTag: 'AABB',
				reservationId: '12344',
				expiryDate: moment().add(30, 'seconds').format()
          	});
			return answer( 'reserveNow sended' );
		break;
		case 'CancelReservation': 
			server.cancelReservation(st_name, st_endpoint, {
				reservationId: '12344'
			});
			return answer( 'cancelReservation sended' );
		break;
		case 'ChangeAvailability': 
			server.changeAvailability(st_name, st_endpoint, {
				connectorId: 1,
				type: 'OPERATIVE'
			});
			return answer( 'changeAvailability sended' );
		break;
		case 'ChangeConfigurationHeartBeatInterval': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'HeartBeatInterval',
				value: 45
			});
			return answer( 'changeAvailability HeartBeatInterval 45 sended' );
		break;
		case 'ChangeConfigurationConnectionTimeOut': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'ConnectionTimeOut',
				value: 1200
			});
			return answer( 'changeAvailability ConnectionTimeOut 1200 sended' );
		break;
		case 'ChangeConfigurationMeterValueSampleInterval': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'MeterValueSampleInterval',
				value: 0
			});
			return answer( 'changeAvailability MeterValueSampleInterval 0 sended' );
		break;
		case 'ChangeConfigurationMeterValueSampleInterval20': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'MeterValueSampleInterval',
				value: 20
			});
			return answer( 'changeAvailability MeterValueSampleInterval 20 sended' );
		break;
		case 'ChangeConfigurationClockAlignedDataInterval': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'ClockAlignedDataInterval',
				value: 0
			});
			return answer( 'changeAvailability ClockAlignedDataInterval 900 sended' );
		break;
		case 'ChangeConfigurationClockAlignedDataInterval20': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'ClockAlignedDataInterval',
				value: 20
			});
			return answer( 'changeAvailability ClockAlignedDataInterval 900 sended' );
		break;
		case 'ChangeConfigurationClockAlignedDataInterval900': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'ClockAlignedDataInterval',
				value: 900
			});
			return answer( 'changeAvailability ClockAlignedDataInterval 900 sended' );
		break;
		case 'ChangeConfigurationSampleOnTransactionTrue': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'SampleOnTransaction',
				value: 1
			});
			return answer( 'changeAvailability SampleOnTransaction true sended' );
		break;
		case 'ChangeConfigurationSampleOnTransactionFalse': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'SampleOnTransaction',
				value: 0
			});
			return answer( 'changeAvailability SampleOnTransaction false sended' );
		break;
		case 'ChangeConfigurationMeterValuesAlignedData': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'MeterValuesAlignedData',
				value: 'Energy.Active.Import.Register,Power.Active.Import,Voltage,Current.Import'
			});
			return answer( 'changeAvailability MeterValuesAlignedData' );
		break;
		case 'ChangeConfigurationMeterValuesSampledData': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'MeterValuesSampledData',
				value: 'Energy.Active.Import.Register,Power.Active.Import,Voltage,Current.Import'
			});
			return answer( 'changeAvailability MeterValuesSampledData' );
		break;
		case 'ChangeConfigurationStopTxnSampledData': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'StopTxnSampledData',
				value: 'Energy.Active.Import.Register,Power.Active.Import,Voltage,Current.Import'
			});
			return answer( 'changeAvailability StopTxnSampledData' );
		break;
		case 'ChangeConfigurationStopTxnAlignedData': 
			server.changeConfiguration(st_name, st_endpoint, {
				key: 'StopTxnAlignedData',
				value: 'Energy.Active.Import.Register,Power.Active.Import,Voltage,Current.Import'
			});
			return answer( 'changeAvailability StopTxnAlignedData' );
		break;
		case 'UnlockConnector': 
			server.unlockConnector(st_name, st_endpoint, {
            	connectorId: '1'
          	});
			return answer( 'unlockConnector sended' );
		break;
		case 'DataTransfer': 
			server.dataTransfer(st_name, st_endpoint, {});
			return answer( 'dataTransfer sended' );
		break;
		case 'GetDiagnostics': 
			server.getDiagnostics(st_name, st_endpoint, {});
			return answer( 'getDiagnostics sended' );
		break;
		case 'UpdateFirmware': 
			server.updateFirmware(st_name, st_endpoint, {});
			return answer( 'updateFirmware sended' );
		break;
	
		default:
			return answer( command + ' is not found' );
	
	}
});

// Create Central System
var server = ocppJS.createCentralSystem();

server.createChargeBoxClient({
 	chargeBoxIdentity: 'PCS_Premium_00000001',
 	endpoint: 'http://127.0.0.1:9000/Ocpp/ChargePointService'
});

setTimeout(function(){
	//console.log('reset changeAvailability');
	
    //server.reset('PCS_Premium_00000001', 'http://127.0.0.1:9000/Ocpp/ChargePointService', { type: 'Soft' });

    //server.unlockConnector('Simulator 1', 'http://127.0.0.1:9221/Ocpp/ChargePointService');
}, 2000)