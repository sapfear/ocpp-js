const Promise = require('promise');
const moment = require('moment');
const DB = require('../db/index.js');
var Storage = new DB(process.env.storage);

module.exports = {
    handle: function(data) {
        return new Promise(function(resolve, reject) {
            // Create Notification
            var message = data.chargeBoxIdentity + ' has just started';

            var notification = {
                text: message,
                unread: true,
                type: 'BootNotification',
                timestamp: moment().format()
            }

            console.log('[BootNotification] notification: ' + JSON.stringify(notification))

            Storage.findById('station', data.chargePointSerialNumber, function(err, station) {
                if (err) {
                    reject(err);
                }

                console.log('[BootNotification] Station: ' + JSON.stringify(station))

                if (station.chargePointSerialNumber) {
                    // Station already exists
                    Storage.save('notification', notification, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                bootNotificationResponse: {
                                    status: 'Accepted',
                                    currentTime: new Date().toISOString(),
                                    heartbeatInterval: 20
                                }
                            });
                        }
                    });
                } else {
                    Storage.save('notification', notification, function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            data.connectors = [{
                                id: 1,
                                status: 'Unkown',
                                consumption: '0 kW'
                            }, {
                                id: 2,
                                status: 'Unkown',
                                consumption: '0 kW'
                            }]
                            data.status = 'Unkown';
                            data.consumption = 0;
                            
                            Storage.save('station', data, function(err) {
                                if (err) {
                                    resolve({
                                        bootNotificationResponse: {
                                            status: 'Accepted',
                                            currentTime: new Date().toISOString(),
                                            heartbeatInterval: 20
                                        }
                                    });
                                } else {
                                    // Return Reponse
                                    // status can be Rejected or Accepted
                                    resolve({
                                        bootNotificationResponse: {
                                            status: 'Accepted',
                                            currentTime: new Date().toISOString(),
                                            heartbeatInterval: 20
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
}
