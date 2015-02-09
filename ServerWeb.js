var http = require('http');
var fs = require('fs');

var serverWeb = http.createServer(function(req,res){
	fs.readFile('./Client.html', 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content); 
		
	});
});
serverWeb.listen(8080);