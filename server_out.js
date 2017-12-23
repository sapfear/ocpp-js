var OCPP =  require('../index.js');

var options = {
  chargingPointServer: {
    port: 9220
  }
}

var ocppJS = new OCPP(options);

// Create Central System
var server = ocppJS.createCentralSystem();

server.createChargeBoxClient({
 	chargeBoxIdentity: 'Simulator 1',
 	endpoint: 'http://127.0.0.1:9221/Ocpp/ChargePointService'
});

setTimeout(function(){
	console.log('reset changeAvailability');
	
    server.reset('Simulator 1', 'http://127.0.0.1:9221/Ocpp/ChargePointService', { type: 'Soft' });

    //server.unlockConnector('Simulator 1', 'http://127.0.0.1:9221/Ocpp/ChargePointService');
}, 7000)