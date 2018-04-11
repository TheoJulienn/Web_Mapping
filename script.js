
//initialisation de la carte
function myMap(){

	var myLatlng = new google.maps.LatLng(48.8539511,2.3502816);
	var myOptions = {
		zoom: 12.75,
	    center: myLatlng,
	    mapTypeId: 'satellite',
	    disableDefaultUI: true
	}
	map = new google.maps.Map(document.getElementById("map"), myOptions);

	//ajout de la légende sur la carte
	add_legend(map);

	//chargment des données sur la carte
	loadOnMap(map)
  	
}

//retourne le minimum d'un tableau
function min(tab){
	var min = Math.min.apply(null, tab)
	console.log(min)
	return min;
}

//retourne le maxmimum d'un tableau
function max(tab){
	var max = Math.max.apply(null, tab)
	console.log(max)
	return max;
}



function add_legend(map){
	//ajout de la légende
	var legend = document.getElementById('legende');
	// placement de la légende en bas à droite
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
}


function loadOnMap(map){

	//variabe qui va contenir nos données
	data1 = new google.maps.Data();
	
	// Chargement GeoJSON
  	data1.loadGeoJson('test.geojson');


  

	//////////////////////////////////////////////////////////////////////////


	//s'exécute après avoir chargé le geojson
  	setTimeout(function() {
  		//tableau qui va contenir les données chiffrées
		var tab = [];
		
		//on boucle sur la colonne "" pour remplir notre tableau
		data1.forEach(function(feature) {
			num = parseFloat(feature.getProperty("COMP_10"));			  		
			tab.push(num);
		});

		var mini = min(tab);
		var maxi = max(tab);
		//on change le min et le max dans la légende
		document.getElementById('census-min').textContent =
              mini.toLocaleString();
        document.getElementById('census-max').textContent =
              maxi.toLocaleString();
        document.getElementById("donnees").textContent = "COMP_10";


  		//ajout des couleurs sur la carte
  		data1.setStyle(function(feature) {
        	var low = [5, 69, 54];  // color of smallest datum
        	var high = [151, 83, 34];   // color of largest datum

        	// delta represente l'endroit ou se situe la valeur de compacité entre le min et le max
        	var delta = (feature.getProperty('COMP_10') - mini) /
            (maxi - mini);

        	var color = [];
        	for (var i = 0; i < 3; i++) {
          	// calcule une couleur basée sur delta
          	color[i] = (high[i] - low[i]) * delta + low[i];
        	}
        	//bordure des surfaces
        	var outlineWeight = 0.5, zIndex = 1;

        	return {
          	strokeWeight: outlineWeight,
          	strokeColor: '#fff',
          	zIndex: zIndex,
          	fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
          	fillOpacity: 0.75,
          	visible: true
        	};
      	});
	   
		data1.addListener('mouseover', mouseIn);

		//evenement qui met a jour la position du carré dans la légende
      	function mouseIn(e) {
        	var percent = (e.feature.getProperty('COMP_10') - mini) /
            (maxi - mini) * 100;

        	// deplacement du carré
        	document.getElementById('data-caret').style.display = 'block';
        	document.getElementById('data-caret').style.paddingLeft = percent + '%';
      	} 
	}, 500);

	//on charge nos données sur la carte 
	data1.setMap(map);
	


}
