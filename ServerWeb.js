var http = require('http');
var fs = require('fs');

var serverWeb = http.createServer(function(req,res){
	fs.readFile('./Client.html', 'utf-8', function(error, content) {
	//fs.readFile('./Client_2.html', 'utf-8', function(error, content) {
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
		//envoie de tout le monde (mais pas de sous liste)
		socket.emit('envoieDB',listDiff);
		//ajout ds la bdd des clients
		listDiff.push(statut);
		//emission de cette bdd a tous les autres
		socket.broadcast.emit('envoieDB',listDiff);
		//console.log(listDiff[0].nom);
	});
	//gestion de la deconnexion
	socket.on('disconnect',function(){
		//enlever de chacun des listes
		var k=0;
		//dissociation de PeerServer et WebServer??
		var indicemax= listDiff.length;
		//console.log('client '+ socket.id +' se deconnecte');
		if (listDiff.length<0){indicemax=0;}
		console.log('indice max: '+indicemax);
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==socket.id){
				console.log('client '+ socket.id +' se deconnecte');
				//enlever cet objet du tableau listDiff : http://jonathankowalski.fr/blog/2011/12/supprimer-un-element-dans-un-tableau-javascript/
				listDiff.splice(k,1);
				listAssoPeerWebID.splice(k,1);
				console.log('client'+ socket.id +' est enleve des listes');
				//enlever cet objet de listAssoPeerWebID 
				socket.broadcast.emit('envoieDB',listDiff); //renvoyer la DB aux clients
				break;
			}
			k++
		};
		socket.broadcast.emit('envoieDB',listDiff);
	});

	//gestion de MAJ des statuts
	//MAJ ds la base de donnees
	socket.on('maj_statut',function(statut){
		var k=0;
		//dissociation de PeerServer et WebServer??
		var indicemax= listDiff.length;
		//console.log('client '+ socket.id +' se deconnecte');
		if (listDiff.length<0){indicemax=0;}
		console.log('indice max: '+indicemax);
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==socket.id){
				console.log('client '+ socket.id +' se MAJ');
				//enlever cet objet du tableau listDiff : http://jonathankowalski.fr/blog/2011/12/supprimer-un-element-dans-un-tableau-javascript/
				listDiff[k]=statut;
				socket.broadcast.emit('envoieDB',listDiff); //renvoyer la DB aux clients
				break;
			}
			k++
		};
		socket.broadcast.emit('envoieDB',listDiff);
	});
	socket.on('ask_info_callee',function(id_dest){
		console.log('recherche infos callee');
		console.log(id_dest);
		var k=0;
		var statut_dest;
		//dissociation de PeerServer et WebServer??
		var indicemax= listDiff.length;
		//console.log('client '+ socket.id +' se deconnecte');
		if (listDiff.length<0){indicemax=0;}
		//console.log('indice max: '+indicemax);
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==id_dest){
				console.log('on renvoie les infos du destinataire '+ id_dest);
				statut_dest=listDiff[k];
				socket.emit('receive_info_callee',statut_dest); //renvoyer la DB aux clients
				break;
			}
			k++
		};

	});

	//gestion des demandes des localisations
	socket.on('demandelocalisations',function(coordonnees){
		//recherche sur google en placant tout le monde dans la requete https://developers.google.com/maps/
		//et renvoie d'une sous liste
		socket.broadcast.emit('envoieDB',sous_listDiff);
	});
});

serverWeb.listen(8080);