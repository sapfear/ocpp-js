const Promise = require('promise');

module.exports = {
  handle: function(data){
    // TODO: save new availability status for station [Issue #9]
    return new Promise(function(resolve, reject) {
      resolve({
        FirmwareStatusNotificationResponse: {
          fileName: 'null'
        }
      });
    });
  }
}
