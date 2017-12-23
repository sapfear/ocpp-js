var OCPP =  require('./index.js');

var options = {
  centralSystem: {
    port: 9220
  }
}

var ocppJS = new OCPP(options);

// Create Central System
var server = ocppJS.createCentralSystem();