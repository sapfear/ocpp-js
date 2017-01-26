var soap = require('soap');
var http = require('http');
var xml = require('fs').readFileSync(__dirname + '/../wsdl/ocpp_centralsystemservice_1.5_final.wsdl', 'utf8');

var myService = {
     CentralSystemService: {
         CentralSystemServiceSoap12: {
             MyFunction: function(args) {
                 return {
                     name: args.name
                 };
             },

             // This is how to define an asynchronous function.
             MyAsyncFunction: function(args, callback) {
                 // do some work
                 callback({
                     name: args.name
                 });
             },

             // This is how to receive incoming headers
             HeadersAwareFunction: function(args, cb, headers) {
                 return {
                     name: headers.Token
                 };
             },

             // You can also inspect the original `req`
             reallyDetailedFunction: function(args, cb, headers, req) {
                 console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                 return {
                     name: headers.Token
                 };
             },

             BootNotification: function(args, callback){
               console.log('[Server Logs] recieved ' + JSON.stringify(args));
               
               return {
                 status: 'Accepted'
               }
             }
         }
     }
 };

//http server example
var server = http.createServer(function(request,response) {
    response.end("404: Not Found: " + request.url);
});

server.listen(9000, function(){
  console.log('SOAP Server is listening on port 9000');
});

var soapServer = soap.listen(server, '/Ocpp/CentralSystemService', myService, xml);

soapServer.log = function(type, data) {
    // type is 'received' or 'replied'
    console.log('[SOAP Log] Type : ' + type);
    console.log('[SOAP Log] Data : ' + JSON.stringify(data));
  };

/*
//express server example
var app = express();
//body parser middleware are supported (optional)
app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
app.listen(8001, function(){
    //Note: /wsdl route will be handled by soap module
    //and all other routes & middleware will continue to work
    soap.listen(app, '/wsdl', service, xml);
});
*/
