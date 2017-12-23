var OCPP =  require('./index.js');

var options = {
  centralSystem: {
    port: 8080
  }
}

var ocppJS = new OCPP(options);

// Create Central System
var server = ocppJS.createCentralSystem();

server.createChargeBoxClient({
 	chargeBoxIdentity: 'PCS_Premium_00000001',
 	endpoint: 'http://127.0.0.1:9000/Ocpp/ChargePointService'
});

setTimeout(function(){
	console.log('reset changeAvailability');
	
    server.reset('PCS_Premium_00000001', 'http://127.0.0.1:9000/Ocpp/ChargePointService', { type: 'Soft' });

    //server.unlockConnector('Simulator 1', 'http://127.0.0.1:9221/Ocpp/ChargePointService');
}, 2000)