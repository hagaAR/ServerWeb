var http = require('http');
var fs = require('fs');

var serverWeb = http.createServer(function(req,res){
	fs.readFile('./Client.html', 'utf-8', function(error, content) {
	//fs.readFile('./Client_2.html', 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content); 
	});
});

var listeClients =[];
var listAssoPeerWebID=[];
//il faut repenser a la sousliste des diffuseurs: 
//mettre en variable locale pour chaque socket de connexion
//...et envoyer les souslistes des quon demande une recherche des utilisateurs
var sousliste_diffuseurs=[];
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
		//Remplissage de la sous liste des clients diffuseurs
		//MAIS il faudrait une sous liste personnalisée à la proximité (ou ailleurs) pour chaque client
		if (statut.diffuseur){
			sousliste_diffuseurs.push(statut);
		};
		listeClients.push(statut);
		socket.emit('envoieDB',sousliste_diffuseurs);
		//ajout ds la bdd des clients
		//emission de cette bdd a tous les autres
		socket.broadcast.emit('envoieDB',sousliste_diffuseurs);
		//console.log(listeClients[0].nom);
	});
	//gestion de la deconnexion
	socket.on('disconnect',function(){
		//enlever de chacun des listes
		var k=0;
		//dissociation de PeerServer et WebServer??
		var indicemax= listeClients.length;
		//console.log('client '+ socket.id +' se deconnecte');
		if (listeClients.length<0){indicemax=0;}
		console.log('indice max: '+indicemax);
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==socket.id){
				console.log('client '+ socket.id +' se deconnecte');
				//enlever cet objet du tableau listeClients : http://jonathankowalski.fr/blog/2011/12/supprimer-un-element-dans-un-tableau-javascript/
				//enlever de la liste des diffuseurs
				var l=0;
				while(l<sousliste_diffuseurs.length){
					if(listeClients[k].i_d=sousliste_diffuseurs[l].i_d){
						sousliste_diffuseurs.splice(l,1);
						break;	
					}
					l++;
				};
				listeClients.splice(k,1);
				listAssoPeerWebID.splice(k,1);

				console.log('client'+ socket.id +' est enleve des listes');
				//enlever cet objet de listAssoPeerWebID 
				socket.broadcast.emit('envoieDB',sousliste_diffuseurs); //renvoyer la DB aux clients
				break;
			}
			k++;
		};
		socket.broadcast.emit('envoieDB',sousliste_diffuseurs);
	});

	//gestion de MAJ des statuts
	//MAJ ds la base de donnees et dans la sous liste
	socket.on('maj_statut',function(statut){
		var k=0;
		//dissociation de PeerServer et WebServer??
		var indicemax= listeClients.length;
		//console.log('client '+ socket.id +' se deconnecte');
		if (listeClients.length<0){indicemax=0;}
		//console.log('indice max: '+indicemax);
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==socket.id){
				console.log('client '+ socket.id +' se MAJ');
				listeClients[k]=statut;
				if(listeClients[k].diffuseur){
					var l=0;
					while(l<sousliste_diffuseurs.length){
						if(listeClients[k].i_d=sousliste_diffuseurs[l].i_d){
							sousliste_diffuseurs[l]=listeClients[k];
							break;
						};
						l++;
					};
					//rechercher dans la sousliste_diffuseurs
					socket.broadcast.emit('envoieDB',sousliste_diffuseurs);
				};
				 //renvoyer la DB aux clients
				break;
			};
			k++;
		};
		socket.broadcast.emit('envoieDB',sousliste_diffuseurs);
	});

	//gestion des demandes des localisations
	socket.on('demandelocalisations',function(coordonnees){
		socket.emit('envoieDB',sousliste_diffuseurs);
	});
});

serverWeb.listen(8080);