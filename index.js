const CentralSystem = require('./entities/CentralSystem.js');
const ChargingPoint = require('./entities/ChargingPoint');
const ChargingPointServer = require('./entities/ChargingPointServer');

class OCPP {
  constructor(options, callback){
    this.options = options || {};
	this.callback = callback || function(){};
  }

  createCentralSystem(port){
    // CentralSystem Default URI is /Ocpp/CentralSystemService
    console.log('port: ' + this.options.centralSystem.port);
    var port = this.options.centralSystem.port || port || 9220;
    return new CentralSystem(port, this.callback);
  }

  createChargingPoint(uri, name, w){
    var wsdl = this.options.chargingPoint.wsdl || w;
    var serverURI = this.options.chargingPoint.serverURI || uri;
    var pointName = this.options.chargingPoint.name || name || 'Simulator';

    if(!serverURI && !wsdl){
      throw 'Charging Point Server URI is required';
    }

    return new ChargingPoint(serverURI, pointName, wsdl, this.callback, this.options.chargingPoint.chargePointIP);
  }

  createChargingPointServer(){
    // ChargingPointServer Default URI is /Ocpp/ChargePointService
    var port = this.options.chargingPointServer.port || port || 9000;
    return new ChargingPointServer(port);
  }
}

module.exports = OCPP;
