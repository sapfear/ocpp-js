const Promise = require('promise');
var fs = require('fs');

module.exports = {
  handle: function(data){
    // TODO: save new availability status for station [Issue #22]
    return new Promise(function(resolve, reject) {
		var dir = __dirname.replace('handlers', '');
		console.log(__dirname);
		console.log(dir);
		fs.closeSync(fs.openSync(dir + 'need_reset.io', 'w'));
		resolve({
			resetResponse: {
				status: 'Accepted'
			}
		});
    });
  }
}
