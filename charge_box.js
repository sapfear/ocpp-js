var OCPP =  require('../index.js');

var options = {
  chargingPoint: {
	//wsdl: 'http://ev.moesk.ru/ocpp/CentralSystemService15?wsdl',
    wsdl: 'http://127.0.0.1:9220/Ocpp/CentralSystemService?wsdl',
    name: 'PCS_Premium_00000001'
  },
  chargingPointServer: {
    port: 9221
  }
}

var ocppJS = new OCPP(options);

// Charging Point Params can be also taken from options
var euriscoPoint = ocppJS.createChargingPoint();

// Create Charging Point Server
var euriscoPointServer = ocppJS.createChargingPointServer();

var boot = setInterval(function() {

    // Station is ready
    euriscoPoint.bootNotification({
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
    
    // Send Meter Values
    if(0) euriscoPoint.meterValues({
        transactionId: 0,
        values: [{
            "timestamp": new Date().toISOString(),
            "values": [{
                "value": "20",
                "unit": "Wh",
                "measurand": "Energy.Active.Import.Register"
            }, {
                "value": "20",
                "unit": "varh",
                "measurand": "Energy.Reactive.Import.Register"
            }]
        }]
    });
    
    /*
    euriscoPoint.sendStatusNotification({
        status: 'Available',
        errorCode: 'NoError',
        info: "",
        timestamp: "2013-02-01T15:09:18Z",
        vendorId: "",
        vendorErrorCode: ""
    });
    euriscoPoint.diagnosticsStatusNotification({
        status: 'Uploaded'
    });
    point.firmwareStatusNotification({
        status: 'DownloadFailed'
    });
    point.startTransaction({
        idTag: 'B4F62CEF',
        timestamp: '2013-02-01T15:09:18Z',
        meterStart: 0
    });
    point.stopTransaction({
        transactionId: 0,
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
        }, {
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
    */

    clearInterval(boot);
}, 1000);