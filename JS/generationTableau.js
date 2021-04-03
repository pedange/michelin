
	/////////////////////////////
	// AJOUTER LIGNE AU TABLEAU
	////////////////////////////
	function addLine(poiDatasheet,i, fields) {

		//console.log(poiDatasheet);
		var index = '<td title="#">' + i + '</td>';
		var identifiant = '<td title="#">' + poiDatasheet.dts_id + '</td>';
		var nomRestau = '<td title="Nom Restaurant">' + (poiDatasheet.name!=null?poiDatasheet.name:'') + '</td>';
		var adresse = '<td title="Adresse">' + (poiDatasheet.address!=null?poiDatasheet.address:'') + '</td>';
		var codePostal = '<td title="Code Postal">' + (poiDatasheet.postcode!=null?poiDatasheet.postcode:'') + '</td>';
		var ville =  '<td title="Ville">' + (poiDatasheet.city!=null?poiDatasheet.city:'') + '</td>';
		var pays = '<td title="Pays">' + (poiDatasheet.country!=null?poiDatasheet.country:'') + '</td>';
		var etoile = '<td title="Nombre d\'étoile">' + (poiDatasheet.michelin_stars!=null?poiDatasheet.michelin_stars:'') + '</td>';
		var email = '<td title="Email">' + (poiDatasheet.email!=null?poiDatasheet.email:'') + '</td>';
		var telephone = '<td title="Téléphone">' + (poiDatasheet.phone!=null?poiDatasheet.phone :'')+ '</td>';
		var web = '<td title="Site Web">' + (getWebUrlBalise(poiDatasheet.web)!=null?getWebUrlBalise(poiDatasheet.web):'') + '</td>';
		var chef = '<td title="Nom du Chef">' + (poiDatasheet.chef!=null?poiDatasheet.chef:'') + '</td>';
		var version =  '<td title="Version">' + (poiDatasheet.version!=null?poiDatasheet.version:'') + '</td>';

		var line = index + identifiant + (fields.match("name")!=null?nomRestau:'') + (fields.match("address")!=null?(adresse + codePostal + ville):'') + (fields.match("country")!=null?pays:'') + (fields.match("michelin_stars")!=null?etoile:'') + (fields.match("email")!=null?email:'') + (fields.match("phone")!=null?telephone:'') + (fields.match("web")!=null?web:'') + (fields.match("chef")!=null?chef:'') + (fields.match("version")!=null?version:'');
		$('#myTable tr:last').after('<tr>' + line + '</tr>');
	}

	///////////////////////////////
	//// GET REQUEST AJAX
	//////////////////////////////
	function getObjetAjax(url_request) {
		var xhr = new XMLHttpRequest();
	    //CREATION DE L'APPEL SYNCHRONE
	    xhr.open("GET", url_request, false);
	    log("url called ajax : " + url_request);
	    //ENVOIE DE LA REQUETE
	    xhr.send(null);
	    //TRAITEMENT DES DONNEE
	    var retour = new Object();
	    retour.reponse = JSON.parse(xhr.responseText);
	    log("reponse : " + retour.reponse);
	    retour.status = xhr.status;
	    return retour;
	}

	function getWebUrlBalise(url){
		if(url != null){
			// on verifie si l''url contient 'http://'
			var HTTP = "http://";
			var href = url;
			if(href.match(HTTP) == null){
				href = HTTP + href;
			}
			return "<a target='_blank' href='"+href+"'>"+url+"</a>"
		}else{
			return null;
		}
	}

	function downloadData() {
		let filename = 'dataMichelinPOI.json';
		let message = JSON.stringify(generateData(true));
		//message = message.replaceAll('\\[','[\n');
		//message = message.replaceAll('\\]','\n]');
		message = message.replaceAll('\\{','{\n');
		message = message.replaceAll('\\}','\n}');
		log(message)
		download(filename, message);
	}

	/////////////////////////////
	// GENERATE DATA
	////////////////////////////
	function generateData(allFields) {
		var listeGlobalPoisId = [];
			var listeGlobalPoisDatasheets = [];
			var listeCheckedCountriesStr = getListeCheckedCountries().toString();

			var vars = getVariables();
			var fields = allFields ? '' : "address,"+ vars.fields;
			var filtre = vars.filtre;
			var authKey = localStorage.getItem('michelinApiKey');
			var dist = 200000; //MAX , ne pas modifier (les coordonnées sont basées sur ce parametre)
			var nb = 100; // MAX

			var listCoords = getListeCoords();

			//console.log(listCoords)
			for(var j=0;j<listCoords.length;j++){
				var coord = listCoords[j];

				// on ne peux recuperer que nb points a la fois, on boucle pour traiter l'ensemble des pois correspondants a nos criteres de recherche, en modifiant la variable 'sidx' (index du premier POI retourné dans l'ensemble des POI retourné dans l'ensemble des POIs trouvés.)
				var condition = true; // condition = il existe encores des pois non traitées pour des coords données.
				var sidx = 0;
				while (condition) {
					var url_request = "http://apir.viamichelin.com/apir/2/findPoi.json2/RESTAURANT/eng?center="+coord+"&nb="+nb+"&dist="+dist+"&source=RESGR&filter="+ filtre +"&charset=UTF-8&ie=UTF-8&authKey="+authKey+"&field="+fields+"&sidx="+sidx;

					var resultAjax = getObjetAjax(url_request);
					var resultJson = resultAjax.reponse;
					if(resultJson.error != null){
						console.log('url : ' + url_request);
						alert("ERREUR CODE " + resultJson.error.errorCode + ": " + resultJson.error.errorMsg);
						// on réaffiche le form
						$('#idFormulaire').attr('hidden',false);
						// on cache le message de pleaseWait
						$('#idPleaseWait').attr('hidden',true);
						return;
					}

					// liste des pois :
					var listePois = resultJson.poiList;
					//console.log("liste pois : " + listePois)
					// on parcourt la liste
					for (var i = 0 ; i<listePois.length; i++) {
						var id = listePois[i].poi_id;
						var datasheets = listePois[i].datasheets[0];
						//console.log(datasheets)
						//console.log(id)
						// on verifie si on a deja traité la donnée
						if(!listeGlobalPoisId.includes(id)){
							// on regarde si le country  fait bien partie de la liste des pays demandés
							//console.log("country : " + datasheets.country)
							if(listeCheckedCountriesStr === "ALL" || listeCheckedCountriesStr.match(datasheets.country)){
								// ajout dans la liste global
								listeGlobalPoisDatasheets.push(datasheets);
							}
							// on marque ce poi comme traité
							listeGlobalPoisId.push(id);
						}
					}

					var nbPoiRecus = listePois.length;
					if(nbPoiRecus === nb){
						// on fait un second tour 
						sidx += nb;
						condition = true;
					}else{
						// on s'arrete la, on passe aux coordonnées suivantes
						condition = false;
					}
				}
			}
			return listeGlobalPoisDatasheets;
	}

	//////////////////////////
	// GENERATE TABLE
	//////////////////////////
	function generateTable(){
		// check des entrées du form :
		var chekForm = isFormValid();
		if(!chekForm.isValid){
			bootbox.alert("<center><b>Formulaire incomplet :<b></center>" + chekForm.message);
			return;
		}

		// on enleve le form
		$('#idFormulaire').attr('hidden',true);
		// on affiche le message de pleaseWait
		$('#idPleaseWait').attr('hidden',false);

		// on utilise un setTimeout(10) pour effectuer un 'flush' de tout ce qui est en dehors (affichage du please wait)
		setTimeout(function(){
			
			let listeGlobalPoisDatasheets = generateData();

			// on cree la premiere ligne du tableau (ajout des <th>)
			var lineTh = "<th>#</th><th>Identifiant</th>";
			var choosenFields = getVariables().fields;
			lineTh += choosenFields.match("name")!=null?"<th>Nom Restaurant</th>":"";
			lineTh += choosenFields.match("address")!=null?"<th>Adresse</th><th>Code postal</th><th>Ville</th>":"";
			lineTh += choosenFields.match("country")!=null?"<th>Pays</th>":"";
			lineTh += choosenFields.match("michelin_stars")!=null?"<th>Nombre d'étoile</th>":"";
			lineTh += choosenFields.match("email")!=null?"<th>Email</th>":"";
			lineTh += choosenFields.match("phone")!=null?"<th>Téléphone</th>":"";
			lineTh += choosenFields.match("web")!=null?"<th>Site Web</th>":"";
			lineTh += choosenFields.match("chef")!=null?"<th>Nom du Chef</th>":"";
			lineTh += choosenFields.match("version")!=null?"<th>Version</th>":"";
			$('#myTable tr:last').after('<tr>' + lineTh + '</tr>');
			

			// on parcourt la liste global et on rempli le tableau
			// console.log(listeGlobalPoisDatasheets);
			if(listeGlobalPoisDatasheets.length>0){
				listeGlobalPoisDatasheets.forEach(function(data, i) {
					addLine(data,i+1,choosenFields);
				});
			}else{
				$('#noResults').show();
			}
			/*for (var i = 0 ; i<listeGlobalPoisDatasheets.length; i++) {
				addLine(listeGlobalPoisDatasheets[i],i+1,choosenFields);
			}
*/
			// on cache le message de pleaseWait
			$('#idPleaseWait').attr('hidden',true);
			// on affiche le tableau : 
			$('#idAllTables').attr('hidden',false);

		}, 10);
}

	function getCountryRefList(zone){
		let list = [];

		// EUROPE
		if(zone==="EU" || !zone){
			list.push(newCountry("FRA,MCO", "France",		 "fr",	-5.1496, 	8.244782, 	1052, 	42.42132, 	51.089528, 	964));
			list.push(newCountry("BEL", 	"Belgique",		 "be", 	2.55, 		6.4, 		273,	49.5, 		51.5, 		223));
			list.push(newCountry("GBR", 	"Angleterre",	 "gb",	-7.515, 	1.775, 		592, 	49.883, 	59.4, 		1058));
			list.push(newCountry("IRL", 	"Irlande",		 "ie",	-10.4953,	-5.438, 	347, 	51.413, 	55.391, 	443));
			list.push(newCountry("NLD", 	"Pays-Bas",		 "nl",	3.361,		 7.213, 	263, 	50.75, 		53.692, 	327));
			list.push(newCountry("ESP", 	"Espagne",		 "es",	-9.29, 		4.31, 		1170, 	36.02, 		43.79, 		864));
			list.push(newCountry("ESP", 	"Iles Canaries", "",	-18.17, 	-13.41, 	183, 	27.64, 		29.29, 		468));
			list.push(newCountry("ITA", 	"Italie", 		 "it",	6.63, 		18.51, 		981, 	35.49, 		47.09, 		1290));
			list.push(newCountry("GRC", 	"Grèce", 		 "gr", 	19.62, 		28.26, 		736, 	34.91, 		41.75, 		760));
			list.push(newCountry("PRT", 	"Portugal", 	 "pt",	-9.5,		-6.19, 		282, 	36.96, 		42.16, 		864));
			list.push(newCountry("PRT", 	"Madère", 		 "",	-17.27,		-16.67, 	57, 	32.63, 		32.87, 		27));
			list.push(newCountry("CHE", 	"Suisse", 	 	 "ch", 	5.95,		10.5, 		352, 	45.82, 		47.81, 		221));
			list.push(newCountry("LUX", 	"Luxembourg", 	 "lu", 	5.73,		6.53, 		60, 	49.26, 		50.18, 		80));
			list.push(newCountry("DEU", 	"Allemagne", 	 "de", 	5.86,		15.04, 		640, 	47.27, 		54.91, 		850));
			list.push(newCountry("AUT", 	"Autriche", 	 "at", 	9.56,		17.16, 		570, 	46.38, 		49.02, 		295));
			list.push(newCountry("HRV", 	"Croatie", 	 	 "hr", 	13.49,		19.44, 		465, 	42.39, 		46.55, 		465));
			list.push(newCountry("EST", 	"Estonie", 	 	 "ee", 	21.77,		28.21, 		375, 	57.52, 		59.67, 		240));
			list.push(newCountry("FIN", 	"Finlande", 	 "fi", 	19.46,		31.59, 		620, 	59.8, 		70.1, 		1141));
			list.push(newCountry("CZE", 	"R.Tchèque", 	 "cz", 	12.09,		18.86, 		486, 	48.55, 		51.05, 		279));
			list.push(newCountry("HUN", 	"Hongrie", 	 	 "hu", 	16.11,		22.90, 		513, 	45.74, 		48.59, 		279));
			list.push(newCountry("SVN", 	"Slovenie", 	 "sv", 	13.38,		16.61, 		250, 	45.42, 		46.87, 		162));
			list.push(newCountry("DNK", 	"Danemark", 	 "dk", 	7.86,		15.23, 		455, 	54.43, 		58.03, 		400));
			list.push(newCountry("DNK", 	"Danemark", 	 "", 	-7.66,		-6.24, 		77, 	61.38, 		62.39, 		112));
			list.push(newCountry("POL", 	"Pologne", 	 	 "pl", 	14.12,		24.15, 		687, 	49.00, 		54.91, 		656));
			list.push(newCountry("SWE", 	"Suède", 	 	 "se",  10.58,		24.18, 		752, 	55.01, 		69.06, 		1563));
			list.push(newCountry("NOR", 	"Norvège", 	 	 "no",  4.57,		31.4, 		1200, 	57.58, 		71.05, 		1500));
		}
		//  OTHER
		if (zone === "OTHER" || !zone) {
			list.push(newCountry("BRA", 	"Brésil (Sao Paulo & Rio)",	 	"br",	-48.9, 		-40.5, 		880, 	-25.8, 		-20.67, 	570));
			list.push(newCountry("USA", 	"USA",	 		 				"um",	-124.1, 	-67.26, 	4780, 	25.9, 		49, 		2560));
			list.push(newCountry("SGP", 	"Singapour",	 		 		"sg",	103.6, 		104.09, 	54, 	1.21, 		1.48, 		30));
			list.push(newCountry("THA", 	"Thailande",	 		 		"th",	98.16, 		105.58, 	790, 	5.92, 		20.45, 		1620));
			list.push(newCountry("TWN", 	"Taiwan",	 		 			"tw",	120.14, 	122.01, 	180, 	21.92, 		25.33, 		382));
			list.push(newCountry("KOR", 	"Corée du Sud",	 		 		"kr",	126.14, 	129.5, 		305, 	33.2, 		38.6, 		600));
			list.push(newCountry("ZAF", 	"Afrique du sud",	 		 	"za",	16.51, 		32.89, 		1633, 	-34.26, 	-22.12, 	1373));



			// Chine - Shangai
			list.push(newCountry("CHN, HKG, MAC", 	"Chine (Shangai, Guangzhou)",	"cn",	120.8, 122, 110, 	30.69, 	31.9, 	130));
			// Chine - Guangzhou
			list.push(newCountry("CHN, HKG, MAC", 	"Chine (Shangai, Guangzhou)",	"",	112.96, 	114, 	105,	22.58, 	23.95, 	150));
			// HKG + MACAO
			list.push(newCountry("CHN, HKG, MAC", 	"Chine (Shangai, Guangzhou)",	"",	113.5, 		122, 	114.43,	22.03, 	22.59, 	65));

		}


		return list;
	}


  	//////////////////////////////
  	// GENERATE COUNTRY CHECBOX LIST
  	//////////////////////////////
	function generateCountryCheckBoxList(zone) {
		let div_start = '<div class="form-check form-check-inline">';
		let div_end = '</div>';
		let html = '';
		getCountryRefList(zone).forEach(function(country) {
			if (country.img.length>0) {
				let input = '<input class="form-check-input" type="checkbox" name="countries" id="id_'+country.code+'" value="'+country.code+'">';
				let urlImg = 'https://lipis.github.io/flag-icon-css/flags/4x3/'+country.img+'.svg';
				let img = '<img class="flag" src="'+urlImg+'" alt="'+country.name+'" data-toggle="tooltip" data-placement="top" title="'+country.name+'">';
				let label = '<label class="form-check-label" for="id_'+country.code+'">'+ img +'</label>';
				html += div_start + input + label + div_end;
			}
		});
		$('#countryList' + zone).html(html);
	}

	function getFieldRefList() {
		let list = [];
		list.push(newField("name", "Nom du restaurant", true));
		list.push(newField("email", "Email", true));
		list.push(newField("michelin_stars", "Nombre d'étoile", true));
		list.push(newField("address", "Adresse", true));
		list.push(newField("phone", "Téléphone", true));
		list.push(newField("chef", "Nom du chef", true));
		list.push(newField("web", "Site Web", true));
		list.push(newField("country", "Pays", true));
		list.push(newField("version", "Version", false));
		return list;
	}

	function newField(code, libelle, checked) {
		let field = new Object();
		field.code = code;
		field.libelle = libelle;
		field.checked = checked;
		return field;
	}

	//////////////////////////////
  	// GENERATE FIELD CHECBOX LIST
  	//////////////////////////////
	function generateFieldCheckBoxList() {
		let div_start = '<div class="form-check form-check-inline">';
		let div_end = '</div>';
		let html = '';
		getFieldRefList().forEach(function(field) {
			let input = '<input class="form-check-input" type="checkbox" value="'+field.code+'" name="fields" id="id_'+field.code+'" '+(field.checked?'checked':'')+'>';
			let label = '<label class="form-check-label" for="id_'+field.code+'">'+ field.libelle +'</label>';
			html += div_start + input + label + div_end;
		});
		$('#fieldList').html(html);
	}

	////////////////////////////////
	// CREATE A COUNTRY
	///////////////////////////////
	function newCountry(code, name, img,  Xmin, Xmax, Xdist, Ymin, Ymax, Ydist){
		let country = new Object();
		country.code = code;
		country.name = name;
		country.img = img;
		country.Xmin = Xmin;
		country.Xmax = Xmax;
		country.Xdist = Xdist; // km
		country.Ymin = Ymin;
		country.Ymax = Ymax;
		country.Ydist = Ydist; // km
		return country;
	}

	////////////////////////
	// GET NB
	////////////////////////
	function getNb(dist){
		//let gridStepSize = 200; //(km)
		let gridStepSize = 180; //(km)
		return Math.ceil(dist/gridStepSize);
	}

	//////////////////////////////
	// GET GRID OF COORDS
	//////////////////////////////
	function getGridCoords(countryCode){
		var gridCoords = new Object();
		var X = [];
		var NBX = [];
		var Y = [];
		var NBY = [];

		getCountryRefList().forEach(function(countryRef){
			if(countryRef.code===countryCode){
				let Xmin = countryRef.Xmin, Xmax = countryRef.Xmax, Xdist = countryRef.Xdist;
				X.push(calculCoords(Xmin,Xmax,getNb(Xdist)));
				NBX.push(getNb(Xdist));
				var Ymin = countryRef.Ymin, Ymax = countryRef.Ymax, Ydist = countryRef.Ydist;
				Y.push(calculCoords(Ymin,Ymax,getNb(Ydist)));
				NBY.push(getNb(Ydist));
			}
		})

		gridCoords.nbX = NBX;
		gridCoords.X = X;
		gridCoords.nbY = NBY;
		gridCoords.Y = Y;
		gridCoords.size = X.length;
		return gridCoords;
	}



	////////////////////////////////
	// CALCUL GRID OF COORDS
	////////////////////////////////
	function calculCoords(min, max, nb){
		var retour = [];
		var step = Math.abs(max-min)/nb;
		for(var i=0;i<=nb;i++){
			retour[i] = min+i*step;
		}
		return retour;
	}



	/////////////////////////
	// GET LISTE COORDS
	/////////////////////////
	function getListeCoords(){
		var listeCheckedCountries = getListeCheckedCountries();
		var listeAllCoords = [];
		for(var i=0;i<listeCheckedCountries.length;i++){
			var country = listeCheckedCountries[i];
			var gridCoords = getGridCoords(country);
			var listCoords = [];
			for(var j=0;j<gridCoords.size;j++){
				var coordsX = gridCoords.X[j];
				var coordsY = gridCoords.Y[j];
				for(var y=0;y<gridCoords.nbY[j];y++){
					var isYEven = y%2==0?true:false;
					//cas Y pair ou zero: on ne prend que les X pairs
					//Cas Y Impaire : on ne prend que les X impairs 
					for(var x=isYEven?0:1;x<=gridCoords.nbX[j];x=x+2){
						listCoords.push(coordsX[x]+':'+coordsY[y]);
					}
				}
			}
			listeAllCoords = listeAllCoords.concat(listCoords);
		}
		return listeAllCoords;
	}


	function getVariables(){
		var vars = new Object();
		// GESTION DES ETOILES MICHELIN
		var filtre = "AGG.provider eq RESGR AND country eq FRA";
		var filtreStar ="";
		var listeCheckedStars = getListeCheckedStars();
		if(listeCheckedStars.length>0){
			filtreStar = " AND michelin_stars in [";
			for(var i=0;i<listeCheckedStars.length;i++){
				filtreStar += listeCheckedStars[i] + (i!=(listeCheckedStars.length-1)?",":"");
			}
			filtreStar += "]";
		}
		filtre += filtreStar;
		//console.log(filtre)
		vars.filtre = filtre.replace(/ /g,'%20');

		// GESTION DES FIELDS
		var fields = "";
		var listeCheckedFields = getListeCheckedFields();
		for(var i=0;i<listeCheckedFields.length;i++){
			fields += ","+listeCheckedFields[i];
		}
		vars.fields = fields;

		return vars;
	}

	//////////////////////////////
	// get Liste des fields selectionnés dans le form
	//////////////////////////////
	function getListeCheckedFields(){
		var listeInputFields = $('input[name="fields"]');
		var listeCheckedFields = [];
		listeInputFields.each(function() {
			if($(this).prop('checked')){
				listeCheckedFields.push($(this).val());
			}
		})
		return listeCheckedFields;
	}
	//////////////////////////////
	// get Liste des michelin_stars selectionnés dans le form
	//////////////////////////////
	function getListeCheckedStars(){
		var listeInputStars = $('input[name="michelin_stars"]');
		var listeCheckedStars = [];
		listeInputStars.each(function(){
			if($(this).prop('checked')){
				listeCheckedStars.push($(this).val());
			}
		})
		return listeCheckedStars;
	}
	//////////////////////////////
	// get Liste des country selectionnés dans le form
	//////////////////////////////
	function getListeCheckedCountries(){
		var listeInputCountries = $('input[name="countries"]');
		var listeCheckedCountries = [];
		for(var i=0;i<listeInputCountries.length;i++){
			if(listeInputCountries[i].checked){
				listeCheckedCountries.push(listeInputCountries[i].value);
			}
		}
		return listeCheckedCountries;
	}

	//////////////////////
	// IS FORM VALID
	//////////////////////
	function isFormValid(){
		var chekForm = new Object();
		chekForm.isValid = true;
		chekForm.message ="";
		// test sur le nbre d'étoile
		var listeCheckedStars = getListeCheckedStars();
		if(listeCheckedStars.length <= 0){
			chekForm.message += "<br> &rarr; <i class=\"fa fa-star\" aria-hidden=\"true\"></i> : Veuillez selectionner au moins un critère sur le nombre d'étoiles";
			chekForm.isValid = false;
		}
		// test sur les champs a afficher
		var listeCheckedFields = getListeCheckedFields();
		if(listeCheckedFields.length <= 0){
			chekForm.message += "<br> &rarr; <i class=\"fa fa-table\" aria-hidden=\"true\"></i> : Veuillez selectionner au moins un Champs du tableau à afficher";
			chekForm.isValid = false;
		}
		// test sur les pays a parcourir
		var listeCheckedCountries = getListeCheckedCountries();
		if(listeCheckedCountries.length <= 0){
			chekForm.message += "<br> &rarr; <i class=\"fa fa-globe\" aria-hidden=\"true\"></i> : Veuillez selectionner au moins un Pays";
			chekForm.isValid = false;
		}
		return chekForm;
	}

	////////////////////////////////////
	// COPY TO CLIPBOARD
	////////////////////////////////////
	function CopySelectionToClipBoard (el) {
		var elemToSelect = document.getElementById (el);
        if (window.getSelection) {  // all browsers, except IE before version 9
        	var selection = window.getSelection ();
        	var rangeToSelect = document.createRange ();
        	rangeToSelect.selectNodeContents (elemToSelect);

        	selection.removeAllRanges ();
        	selection.addRange (rangeToSelect);
        	document.execCommand("copy");
        	selection.removeAllRanges (); 
        }
        else {
        	bootbox.alert("<span style='color:red;'>Désolé, votre navigateur ne prend pas en compte cette option !</span><br>"
        		+"Utilisez <span class = 'label label-primary'>ctrl+a</span> et <span class = 'label label-primary'>ctrl+v</span> pour selectionner et copier l'ensemble de la page.");
        }      



	    // message d'information :
	    var dialog = bootbox.dialog({
	    	message: '<span class="text-center">Le tableau a été copié dans le presse papier !</span>',
	    	closeButton: false
	    });
	    setTimeout(function(){dialog.modal('hide')},2000);

	}


    /////////////////////////////////////
    // ON CHANGE CHECKBOX
    /////////////////////////////////////
    function updateStarColor(input, name){
    	var elements = $('[name='+name+']');
    	if (input.checked){
    		var color = 'green';
    		var size = '1px';
    	}else{
    		var color = '';
    		var size = '0px';
    	}
    	elements.css('-webkit-text-stroke-color',color);
    	elements.css('-webkit-text-stroke-width',size);
    }


    /////////////////////////////////////
    // CHECK/UNCHECK ALL COUNTRIES
    /////////////////////////////////////
    function checkUncheckAllCheckBoxes(checkBoxesName, value){
    	var countries = $('input[name='+checkBoxesName+']');
    	for (var i = countries.length - 1; i >= 0; i--) {
    		var country = countries[i];
    		if(!country.disabled){
    			country.checked =value;
    		}
    	}
    }

    function afficherContactCoords(){
    	var message = "<center>Veuillez envoyer vos questions et/ou remarques à l'adresse mail suivante :<br> "
    	+"<i class='fa fa-arrow-right' aria-hidden='true'></i>&nbsp;"
    	+"<a href='mailto:youremailaddress'>paul.edange@gmail.com</a>"
    	+"&nbsp;<i class='fa fa-arrow-left' aria-hidden='true'></i></center> ";
    	bootbox.alert(message);

    }











	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////

	/*BOOTBOX*/
	(function(a,b){if(typeof define==="function"&&define.amd){define(["jquery"],b)}else{if(typeof exports==="object"){module.exports=b(require("jquery"))}else{a.bootbox=b(a.jQuery)}}}(this,function init(i,c){var m={dialog:"<div class='bootbox modal' tabindex='-1' role='dialog'><div class='modal-dialog'><div class='modal-content'><div class='modal-body'><div class='bootbox-body'></div></div></div></div></div>",header:"<div class='modal-header'><h4 class='modal-title'></h4></div>",footer:"<div class='modal-footer'></div>",closeButton:"<button type='button' class='bootbox-close-button close' data-dismiss='modal' aria-hidden='true'>&times;</button>",form:"<form class='bootbox-form'></form>",inputs:{text:"<input class='bootbox-input bootbox-input-text form-control' autocomplete=off type=text />",textarea:"<textarea class='bootbox-input bootbox-input-textarea form-control'></textarea>",email:"<input class='bootbox-input bootbox-input-email form-control' autocomplete='off' type='email' />",select:"<select class='bootbox-input bootbox-input-select form-control'></select>",checkbox:"<div class='checkbox'><label><input class='bootbox-input bootbox-input-checkbox' type='checkbox' /></label></div>",date:"<input class='bootbox-input bootbox-input-date form-control' autocomplete=off type='date' />",time:"<input class='bootbox-input bootbox-input-time form-control' autocomplete=off type='time' />",number:"<input class='bootbox-input bootbox-input-number form-control' autocomplete=off type='number' />",password:"<input class='bootbox-input bootbox-input-password form-control' autocomplete='off' type='password' />"}};var f={locale:"en",backdrop:"static",animate:true,className:null,closeButton:true,show:true,container:"body"};var h={};function p(r){var q=a[f.locale];return q?q[r]:a.en[r]}function d(s,r,t){s.stopPropagation();s.preventDefault();var q=i.isFunction(t)&&t.call(r,s)===false;if(!q){r.modal("hide")}}function j(s){var q,r=0;for(q in s){r++}return r}function k(s,r){var q=0;i.each(s,function(t,u){r(t,u,q++)})}function b(q){var s;var r;if(typeof q!=="object"){throw new Error("Please supply an object of options")}if(!q.message){throw new Error("Please specify a message")}q=i.extend({},f,q);if(!q.buttons){q.buttons={}}s=q.buttons;r=j(s);k(s,function(v,u,t){if(i.isFunction(u)){u=s[v]={callback:u}}if(i.type(u)!=="object"){throw new Error("button with key "+v+" must be an object")}if(!u.label){u.label=v}if(!u.className){if(r<=2&&t===r-1){u.className="btn-primary"}else{u.className="btn-default"}}});return q}function g(r,s){var t=r.length;var q={};if(t<1||t>2){throw new Error("Invalid argument length")}if(t===2||typeof r[0]==="string"){q[s[0]]=r[0];q[s[1]]=r[1]}else{q=r[0]}return q}function l(s,q,r){return i.extend(true,{},s,g(q,r))}function e(t,u,s,r){var q={className:"bootbox-"+t,buttons:o.apply(null,u)};return n(l(q,r,s),u)}function o(){var u={};for(var s=0,q=arguments.length;s<q;s++){var t=arguments[s];var r=t.toLowerCase();var v=t.toUpperCase();u[r]={label:p(v)}}return u}function n(q,s){var r={};k(s,function(t,u){r[u]=true});k(q.buttons,function(t){if(r[t]===c){throw new Error("button key "+t+" is not allowed (options are "+s.join("\n")+")")}});return q}h.alert=function(){var q;q=e("alert",["ok"],["message","callback"],arguments);if(q.callback&&!i.isFunction(q.callback)){throw new Error("alert requires callback property to be a function when provided")}q.buttons.ok.callback=q.onEscape=function(){if(i.isFunction(q.callback)){return q.callback.call(this)}return true};return h.dialog(q)};h.confirm=function(){var q;q=e("confirm",["cancel","confirm"],["message","callback"],arguments);q.buttons.cancel.callback=q.onEscape=function(){return q.callback.call(this,false)};q.buttons.confirm.callback=function(){return q.callback.call(this,true)};if(!i.isFunction(q.callback)){throw new Error("confirm requires a callback")}return h.dialog(q)};h.prompt=function(){var y;var t;var v;var q;var w;var s;var u;q=i(m.form);t={className:"bootbox-prompt",buttons:o("cancel","confirm"),value:"",inputType:"text"};y=n(l(t,arguments,["title","callback"]),["cancel","confirm"]);s=(y.show===c)?true:y.show;y.message=q;y.buttons.cancel.callback=y.onEscape=function(){return y.callback.call(this,null)};y.buttons.confirm.callback=function(){var A;switch(y.inputType){case"text":case"textarea":case"email":case"select":case"date":case"time":case"number":case"password":A=w.val();break;case"checkbox":var z=w.find("input:checked");A=[];k(z,function(B,C){A.push(i(C).val())});break}return y.callback.call(this,A)};y.show=false;if(!y.title){throw new Error("prompt requires a title")}if(!i.isFunction(y.callback)){throw new Error("prompt requires a callback")}if(!m.inputs[y.inputType]){throw new Error("invalid prompt type")}w=i(m.inputs[y.inputType]);switch(y.inputType){case"text":case"textarea":case"email":case"date":case"time":case"number":case"password":w.val(y.value);break;case"select":var r={};u=y.inputOptions||[];if(!i.isArray(u)){throw new Error("Please pass an array of input options")}if(!u.length){throw new Error("prompt with select requires options")}k(u,function(z,A){var B=w;if(A.value===c||A.text===c){throw new Error("given options in wrong format")}if(A.group){if(!r[A.group]){r[A.group]=i("<optgroup/>").attr("label",A.group)}B=r[A.group]}B.append("<option value='"+A.value+"'>"+A.text+"</option>")});k(r,function(z,A){w.append(A)});w.val(y.value);break;case"checkbox":var x=i.isArray(y.value)?y.value:[y.value];u=y.inputOptions||[];if(!u.length){throw new Error("prompt with checkbox requires options")}if(!u[0].value||!u[0].text){throw new Error("given options in wrong format")}w=i("<div/>");k(u,function(z,A){var B=i(m.inputs[y.inputType]);B.find("input").attr("value",A.value);B.find("label").append(A.text);k(x,function(C,D){if(D===A.value){B.find("input").prop("checked",true)}});w.append(B)});break}if(y.placeholder){w.attr("placeholder",y.placeholder)}if(y.pattern){w.attr("pattern",y.pattern)}if(y.maxlength){w.attr("maxlength",y.maxlength)}q.append(w);q.on("submit",function(z){z.preventDefault();z.stopPropagation();v.find(".btn-primary").click()});v=h.dialog(y);v.off("shown.bs.modal");v.on("shown.bs.modal",function(){w.focus()});if(s===true){v.modal("show")}return v};h.dialog=function(t){t=b(t);var u=i(m.dialog);var r=u.find(".modal-dialog");var q=u.find(".modal-body");var x=t.buttons;var v="";var w={onEscape:t.onEscape};if(i.fn.modal===c){throw new Error("$.fn.modal is not defined; please double check you have included the Bootstrap JavaScript library. See http://getbootstrap.com/javascript/ for more details.")}k(x,function(z,y){v+="<button data-bb-handler='"+z+"' type='button' class='btn "+y.className+"'>"+y.label+"</button>";w[z]=y.callback});q.find(".bootbox-body").html(t.message);if(t.animate===true){u.addClass("fade")}if(t.className){u.addClass(t.className)}if(t.size==="large"){r.addClass("modal-lg")}else{if(t.size==="small"){r.addClass("modal-sm")}}if(t.title){q.before(m.header)}if(t.closeButton){var s=i(m.closeButton);if(t.title){u.find(".modal-header").prepend(s)}else{s.css("margin-top","-10px").prependTo(q)}}if(t.title){u.find(".modal-title").html(t.title)}if(v.length){q.after(m.footer);u.find(".modal-footer").html(v)}u.on("hidden.bs.modal",function(y){if(y.target===this){u.remove()}});u.on("shown.bs.modal",function(){u.find(".btn-primary:first").focus()});if(t.backdrop!=="static"){u.on("click.dismiss.bs.modal",function(y){if(u.children(".modal-backdrop").length){y.currentTarget=u.children(".modal-backdrop").get(0)}if(y.target!==y.currentTarget){return}u.trigger("escape.close.bb")})}u.on("escape.close.bb",function(y){if(w.onEscape){d(y,u,w.onEscape)}});u.on("click",".modal-footer button",function(z){var y=i(this).data("bb-handler");d(z,u,w[y])});u.on("click",".bootbox-close-button",function(y){d(y,u,w.onEscape)});u.on("keyup",function(y){if(y.which===27){u.trigger("escape.close.bb")}});i(t.container).append(u);u.modal({backdrop:t.backdrop?"static":false,keyboard:false,show:false});if(t.show){u.modal("show")}return u};h.setDefaults=function(){var q={};if(arguments.length===2){q[arguments[0]]=arguments[1]}else{q=arguments[0]}i.extend(f,q)};h.hideAll=function(){i(".bootbox").modal("hide");return h};var a={bg_BG:{OK:"Ок",CANCEL:"Отказ",CONFIRM:"Потвърждавам"},br:{OK:"OK",CANCEL:"Cancelar",CONFIRM:"Sim"},cs:{OK:"OK",CANCEL:"Zrušit",CONFIRM:"Potvrdit"},da:{OK:"OK",CANCEL:"Annuller",CONFIRM:"Accepter"},de:{OK:"OK",CANCEL:"Abbrechen",CONFIRM:"Akzeptieren"},el:{OK:"Εντάξει",CANCEL:"Ακύρωση",CONFIRM:"Επιβεβαίωση"},en:{OK:"OK",CANCEL:"Cancel",CONFIRM:"OK"},es:{OK:"OK",CANCEL:"Cancelar",CONFIRM:"Aceptar"},et:{OK:"OK",CANCEL:"Katkesta",CONFIRM:"OK"},fa:{OK:"قبول",CANCEL:"لغو",CONFIRM:"تایید"},fi:{OK:"OK",CANCEL:"Peruuta",CONFIRM:"OK"},fr:{OK:"OK",CANCEL:"Annuler",CONFIRM:"D'accord"},he:{OK:"אישור",CANCEL:"ביטול",CONFIRM:"אישור"},hu:{OK:"OK",CANCEL:"Mégsem",CONFIRM:"Megerősít"},hr:{OK:"OK",CANCEL:"Odustani",CONFIRM:"Potvrdi"},id:{OK:"OK",CANCEL:"Batal",CONFIRM:"OK"},it:{OK:"OK",CANCEL:"Annulla",CONFIRM:"Conferma"},ja:{OK:"OK",CANCEL:"キャンセル",CONFIRM:"確認"},lt:{OK:"Gerai",CANCEL:"Atšaukti",CONFIRM:"Patvirtinti"},lv:{OK:"Labi",CANCEL:"Atcelt",CONFIRM:"Apstiprināt"},nl:{OK:"OK",CANCEL:"Annuleren",CONFIRM:"Accepteren"},no:{OK:"OK",CANCEL:"Avbryt",CONFIRM:"OK"},pl:{OK:"OK",CANCEL:"Anuluj",CONFIRM:"Potwierdź"},pt:{OK:"OK",CANCEL:"Cancelar",CONFIRM:"Confirmar"},ru:{OK:"OK",CANCEL:"Отмена",CONFIRM:"Применить"},sq:{OK:"OK",CANCEL:"Anulo",CONFIRM:"Prano"},sv:{OK:"OK",CANCEL:"Avbryt",CONFIRM:"OK"},th:{OK:"ตกลง",CANCEL:"ยกเลิก",CONFIRM:"ยืนยัน"},tr:{OK:"Tamam",CANCEL:"İptal",CONFIRM:"Onayla"},zh_CN:{OK:"OK",CANCEL:"取消",CONFIRM:"确认"},zh_TW:{OK:"OK",CANCEL:"取消",CONFIRM:"確認"}};h.addLocale=function(r,q){i.each(["OK","CANCEL","CONFIRM"],function(t,s){if(!q[s]){throw new Error("Please supply a translation for '"+s+"'")}});a[r]={OK:q.OK,CANCEL:q.CANCEL,CONFIRM:q.CONFIRM};return h};h.removeLocale=function(q){delete a[q];return h};h.setLocale=function(q){return h.setDefaults("locale",q)};h.init=function(q){return init(q||i)};return h}));
