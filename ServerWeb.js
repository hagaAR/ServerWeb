var http = require('http');
var fs = require('fs');

var serverWeb = http.createServer(function(req,res){
	fs.readFile('./Client.html', 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content); 
	});
});

// Chargement de socket.io
var io = require('socket.io').listen(serverWeb);
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
	console.log('Un client est connecté !'); 
	socket.on('statut_alice',function (statut) {
		console.log('Un client envoie son statut ! Son ID est : ' + statut.statut_alice.i_d); 
	});
});


serverWeb.listen(8080);