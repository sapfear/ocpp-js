const Promise = require('promise');
module.exports = {
  handle: function(data){
    // TODO: save new availability status for station [Issue #21]
    return new Promise(function(resolve, reject) {
      resolve({
          UpdateFirmwareResponse: {
            status: 'Rejected'
          }
      });
    });
  }
}
