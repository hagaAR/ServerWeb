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
    var ma_lat=position.coords.latitude;
    var ma_long=position.coords.longitude;
    coordonnees={latitude: ma_lat, longitude: ma_long};
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
    console.log(statut_Alice.localisation);
	//Des qu'on se geolocalise, on MAJ tous les clients
	//MAIS il faudrait juste envoyer une sousliste des Clients à proximité ou ailleurs
    MAJStatut();
	//

}


//google.maps.event.addDomListener(window, 'load', askOthersPosition);
