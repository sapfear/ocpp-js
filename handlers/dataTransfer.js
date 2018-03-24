const Promise = require('promise');

module.exports = {
  handle: function(data){
    return new Promise(function(resolve, reject) {
      resolve({
        DataTransferResponse: {
          status: 'Rejected'
        }
      });
    });
  }
}
