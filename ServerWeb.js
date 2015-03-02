var http = require('http');
var fs = require('fs');

var serverWeb = http.createServer(function(req,res){
	fs.readFile('./Client.html', 'utf-8', function(error, content) {
	//fs.readFile('./Client_2.html', 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content); 
	});
});

listeClients =[];
listAssoPeerWebID=[];
//il faut repenser a la sousliste des diffuseurs: 
//mettre en variable locale pour chaque socket de connexion
//...et envoyer les souslistes des quon demande une recherche des utilisateurs
sousliste_diffuseurs=[];
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
		//Inutile ici de verifier si le client diffuse car il ne peut diffuser pdt sa connexion au serveur
		if (statut.diffuseur==true){
			sousliste_diffuseurs.push(statut);
		};
		listeClients.push(statut);
		socket.emit('envoieDB',sousliste_diffuseurs);
		//ajout ds la bdd des clients
		//emission de cette bdd a tous les autres
		socket.broadcast.emit('envoieDB',sousliste_diffuseurs);
		//console.log(listeClients[0].nom);
		JSON.stringify(listeClients);
	});
	//gestion de la deconnexion
	socket.on('disconnect',function(){
		//enlever de chacun des listes
		var k=0;
		//dissociation de PeerServer et WebServer??
		var indicemax= listeClients.length;
		//console.log('client '+ socket.id +' se deconnecte');
		if (listeClients.length<0){indicemax=0;}
		//console.log('indice max: '+indicemax);
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==socket.id){
				console.log('client de ID '+ socket.id +' se deconnecte');
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
				console.log('client de ID'+ socket.id +' est enleve des listes');
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
		var etreDansLaSousListe=false;
		//dissociation de PeerServer et WebServer??
		var indicemax= listeClients.length;
		console.log('client '+ socket.id +' se MAJ');
		if (listeClients.length<0){indicemax=0;}
		//MAJ de la bdd
		while (k<indicemax){
			if (listAssoPeerWebID[k].WebID==socket.id){
				console.log('client (WebID:'+ socket.id +' PeerID:'+statut.i_d+') se MAJ');
				listeClients[k]=statut;
				//Controle si le client diffuse ou non
				console.log('le client '+statut.nom+' diffuse? '+statut.diffuseur);
				if(statut.diffuseur){
					var l=0;
					//var etreDansLaSousListe=false;
					while(l<sousliste_diffuseurs.length){
						if(statut.i_d==sousliste_diffuseurs[l].i_d){
							etreDansLaSousListe=true;
							console.log('le client '+statut.nom+' qui est deja ds la sous liste et diffuse? '+listeClients[k].diffuseur);
							sousliste_diffuseurs[l]=statut;
							break;
						};
						l++;
					};
					if(!etreDansLaSousListe){
						console.log('le client '+listeClients[k].nom+' nest pas ds la sous liste, est ajoute et diffuse? '+listeClients[k].diffuseur);
						sousliste_diffuseurs.push(statut);
						break;
					};
				}else{
					var l=0;
					//var etreDansLaSousListe=false;
					while(l<sousliste_diffuseurs.length){
						if(statut.i_d==sousliste_diffuseurs[l].i_d){
							sousliste_diffuseurs.splice(l,1);
						break;
						};
						l++;
					};
				};
				break;
			};
			k++;
		};
		//renvoyer la DB aux clients
		socket.broadcast.emit('envoieDB',sousliste_diffuseurs);
	});

	//gestion des demandes des localisations
	socket.on('rafraichirliste',function(coordonnees){
		socket.emit('envoieDB',sousliste_diffuseurs);
	});
});

serverWeb.listen(8080);