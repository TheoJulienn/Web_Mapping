

/**
 * Cette fonction initialise la carte
 */
function myMap(){

	var myLatlng = new google.maps.LatLng(48.8539511,2.3502816);
	var myOptions = {
		zoom: 5,
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

/**
 * Cette fonction retourne le minimum d'un tableau
 * @param {tab} prends un tableau en entrée
 * @returns {number} retourne le nombre minimum contenu dans le tableau en entrée.
 */
function min(tab){
	var min = Math.min.apply(null, tab)

	return min;
}


/**
 * Cette fonction retourne le maximum d'un tableau
 * @param {tab} prends un tableau en entrée
 * @returns {number} retourne le nombre maximum contenu dans le tableau en entrée.
 */
function max(tab){
	var max = Math.max.apply(null, tab)

	return max;
}


/**
 * Cette fonction ajoute une légende à la carte en bas à gauche
 * @param {google.maps.Map} prends un objet google.map.Maps, une carte
 */
function add_legend(map){
	//ajout de la légende
	var legend = document.getElementById('legende');
	// placement de la légende en bas à droite
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
}


/**
 * Cette fonction se lance lors de l'intialisation de la carte
 * Elle permet de définir la légende basée sur les données en entrée
 * Et d'ajouter des evenements sur les données affichées
 * @param {google.maps.Map} prends un objet google.map.Maps, une carte
 */
function loadOnMap(map){

	//variabe qui va contenir nos données
	data1 = new google.maps.Data();
	
	// Chargement GeoJSON
  	data1.loadGeoJson('Script_carres/GeoJson/hypotheses.geojson');


	/**
	 * Cette fonction s'exécute après avoir chargé le geojson
	 * @param {google.maps.Map} prends un objet google.map.Maps, une carte
	 */
  	setTimeout(function() {
  		//tableau qui va contenir les données chiffrées
		var tab = [];
		

		/**
		 * Cette fonction boucle sur la colonne "HYPOTHESE" pour remplir notre tableau
		 * @param {google.maps.Map.Data.Feature} prends un objet google.map.Map.Data.Feature, une entité de nos données, ici nos carrés
		 */
		data1.forEach(function(feature) {
			num = parseFloat(feature.getProperty("HYPOTHESE"));			  		
			tab.push(num);
		});

		//Calcul du max et du min dans le tableau
		var mini = min(tab);
		var maxi = max(tab);

		//on affiche le min et le max dans la légende
		document.getElementById('min').textContent =
              mini.toLocaleString();
        document.getElementById('max').textContent =
              maxi.toLocaleString();
        document.getElementById("donnees").textContent = "HYPOTHESE";


  		/**
		 * Cette fonction permet de donner des couleurs aux entités affichées
		 * La couleur calculée est au format HSL (hue, saturation, lightness) à partir du minimum et du maximum
		 * Elle est directement appelée
		 * de nos données
		 * @param {google.maps.Map.Data.Feature} prends une feature en entrée
		 * @return {google.maps.Data.StyleOptions} retourne un objet qui correspond au style des entités qui sont affichées
		 */
  		data1.setStyle(function(feature) {
        	var low = [0, 100, 100];  // couleur de la plus petite donnée en HSL
        	var high = [0, 100, 50];   // couleur de la plus grande donnée en HSL

        	// delta represente l'endroit ou se situe la valeur de compacité entre le min et le max
        	var delta = (feature.getProperty('HYPOTHESE') - mini) /
            (maxi - mini);

            //tableau qui va contenir la couleur [Hue,Saturation,Lightness]
        	var color = [];
        	for (var i = 0; i < 3; i++) {
          	// calcule une couleur basée sur delta en HSL
          	color[i] = (high[i] - low[i]) * delta + low[i];
        	}
        	//bordure des surfaces
        	var outlineWeight = 0.5, zIndex = 1;
        	// defition de la couleur pour chaque feature de nos data
        	return {
          	strokeWeight: outlineWeight,
          	strokeColor: '#fff',
          	zIndex: zIndex,
          	fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
          	fillOpacity: 0.30,
          	visible: true
        	};
      	});
	   
		data1.addListener('mouseover', mouseIn);
		data1.addListener("mouseout",mousout)


		/**
		 * Cette fonction permet de mettre a jour l'icone (le carré dans la légende) sur la légende en fonction de la valeur "HYPOTHESE" de l'entité
		 * Elle joue sur le padding de la div "carre"
		 * De plus elle met a jour la zone d'affichage du nombre exact d'hypothèses dans la div "hypo"
		 * Elle s'active lorsqu'on passe le curseur sur une entité affichée
		 * @param {google.maps.Map.Data.Feature} prends un objet google.map.Map.Data.Feature, une entité de nos données, ici nos carrés
		 */
      	function mouseIn(e) {
        	var percent = (e.feature.getProperty('HYPOTHESE') - mini) /
            (maxi - mini) * 100;

        	// deplacement du carré
        	document.getElementById('carre').style.display = 'block';
        	document.getElementById('carre').style.paddingLeft = percent + '%'; 
        	document.getElementById('hypo').innerHTML =  e.feature.getProperty('HYPOTHESE') + " hypothèses dans ce secteur"
      	} 

      	/**
		 * Cette fonction permet d'effacer l'affichage du nombre d'hypothèse dans la div "hypo"
		 * Elle s'active lorsque le curseur sort de l'entité
		 * @param {google.maps.Map.Data.Feature} prends un objet google.map.Map.Data.Feature, une entité de nos données, ici nos carrés
		 */
      	function mousout(e){
      		document.getElementById('hypo').innerHTML =  ""

      	}

	}, 500);

	//on charge nos données sur la carte 
	data1.setMap(map);
}
