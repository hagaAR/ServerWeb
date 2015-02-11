var http = require('http');
var fs = require('fs');

var serverWeb = http.createServer(function(req,res){
	fs.readFile('./Client.html', 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content); 
	});
});

var listDiff =[];
var listAssoPeerWebID=[];
// Chargement de socket.io
var io = require('socket.io').listen(serverWeb);
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
	console.log('Un client est connecté !'); 
	socket.on('ajout_statut',function (statut) {
		//des quon recoit une notif 'statut'
		//console.log('Le client '+statut.statut_alice.nom +' envoie/MAJ son statut ! Son ID est : ' + statut.statut_alice.i_d); 
		console.log('Le client '+statut.nom +' envoie/MAJ son statut ! Son peerID est : ' + statut.i_d+' et son WebID est: '+socket.id); 
		var AssoPeerWebID={
			PeerID: statut.i_d,
			WebID: socket.id
		};
		listAssoPeerWebID.push(AssoPeerWebID);
		socket.emit('envoieDB',listDiff);
		//ajout ds la bdd des clients
		listDiff.push(statut);
		//emission de cette bdd a tous les autres
		socket.broadcast.emit('envoieDB',listDiff);
		console.log(listDiff[0].nom);
	});
	socket.on('disconnect',function(){
		var k=0;
		//dissociation de PeerServer et WebServer??
		var indicemax= listDiff.length-1;
		if (listDiff.length<0){indicemax=0;}
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==socket.id){
				//enlever cet objet du tableau listDiff : http://jonathankowalski.fr/blog/2011/12/supprimer-un-element-dans-un-tableau-javascript/
				//enlever cet objet de listAssoPeerWebID 
				socket.broadcast.emit('envoieDB',listDiff); //renvoyer la DB aux clients
				break;
			}
			k++
		};
	});
});



serverWeb.listen(8080);