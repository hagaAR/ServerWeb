//////
//gestion localisations
var localisation_div = document.getElementById("infos_div");
var googleMap= document.getElementById("googleMap");
function getLocation() {
	//recuperer sa propre localisation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        localisation_div.innerHTML = "Geolocation is not supported by this browser.";}
    }
    
function showPosition(position) {
	//afficher sa localisation
    //localisation_div.innerHTML+="Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;

    var ma_lat=position.coords.latitude;
    var ma_long=position.coords.longitude;
    var myCenter=new google.maps.LatLng(ma_lat,ma_long);
    var mapProp = {
		center:myCenter,
		zoom:15,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
  	var marker=new google.maps.Marker({position:myCenter,});
  	marker.setMap(map);
  	var infowindow = new google.maps.InfoWindow({content:"Vous etes ici!"});
  	infowindow.open(map,marker);   
    statut_Alice.localisation={latitude: ma_lat, longitude: ma_long};
    MAJStatut();
    console.log(statut_Alice.localisation);
    document.getElementById("others_location_button").style.visibility ="visible";
}
function askOthersPositionButton(){
	//appuie sur le bouton pour rechercher ds googleMap

}
function askOthersPosition(){
	// if(liste_diffuseurs==null){ return;}
	// var liste_markers=[];
	// for (var k=0;k<liste_diffuseurs.length;k++){
	// 	liste_markers[k]={liste_diffuseurs[k].localisation.latitude,liste_diffuseurs[k].localisation.longitude};
	// 	var marker = new google.maps.Marker({
	//         position: liste_markers[k],
	//         map: map
 //    	});
	// }
	//demande au serveur tous les gens dans le coin
	//socket.emit('demandelocalisations',Coordonnees);
}

//google.maps.event.addDomListener(window, 'load', askOthersPosition);
