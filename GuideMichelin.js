$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip(); 
});

function printLink() {
}

var link = "http://apir.viamichelin.com/apir/2/"
+ "findPOI.{format}/{type}/{lg}?"
+ "center=<center>"
+ "&authKey=<authKey>"
+ "&[dist=<dist>]"
+ "&[distRange=<distRange>]"
+ "&[nb=<nb>]"
+ "&[nbRange=<nbRange>]"
+ "&[sidx=<sidx>]"
+ "&[filter=<filter>]"
+ "&[field=<field>]"
+ "&[source=<source>]"
+ "&[orderby=<orderby>]"
+ "&[charset=<charset>]";




// calcul du filter:
$(function() {
	var inputType = $('select[name="type"]');
	majFilter(inputType);
	majSource(inputType)
	inputType.on('change',function(){
		console.log('type modifié')
		majFilter(inputType);
		majSource(inputType)
	});
});
function majFilter(inputType){
	switch(inputType.val()) {
		case 'RESTAURANT':
		$('input[name="filter"]').val("AGG.provider eq RESGR");
		break;
		case 'HOTEL':
		$('input[name="filter"]').val("AGG.provider eq HOTGR");
		break;
		default:
		alert("ERROR IN CALCUL DU FILTRE")
	}
}

function majSource(inputType){
	switch(inputType.val()) {
		case 'RESTAURANT':
		$('input[name="source"]').val("RESGR");
		break;
		case 'HOTEL':
		$('input[name="source"]').val("HOTGR");
		break;
		default:
		alert("ERROR IN CALCUL DE SOURCE")
	}
}

var result = "{\"searchInfos\": {\"QTime\": \"1\", \"lang\": \"eng\", \"numFound\": \"7\", \"start\": \"0\", \"status\": \"0\"}, \"poiList\": [{\"poi_id\": \"3tszvle\", \"type\": \"RESTAURANT\", \"datasheets\": [{\"dts_id\": \"231821\", \"name\": \"Itinéraires\", \"latitude\": \"48.85012\", \"longitude\": \"2.3523495\", \"country\": \"FRA\", \"area\": \"\", \"city\": \"Paris\", \"address\": \"5 r. de Pontoise\", \"postcode\": \"75005\", \"email\": \"sarahsendra@yahoo.fr\", \"chef\": \"Sylvain Sendra\", \"michelin_stars\": \"1\"}]}, {\"poi_id\": \"3yamflk\", \"type\": \"RESTAURANT\", \"datasheets\": [{\"dts_id\": \"318144\", \"name\": \"Sola\", \"latitude\": \"48.85162\", \"longitude\": \"2.34832\", \"country\": \"FRA\", \"area\": \"\", \"city\": \"Paris\", \"address\": \"12 r. de l'Hôtel-Colbert\", \"postcode\": \"75005\", \"email\": \"sola.contact@gmail.com\", \"michelin_stars\": \"1\"}]}, {\"poi_id\": \"t4cp5kaa\", \"type\": \"RESTAURANT\", \"datasheets\": [{\"dts_id\": \"489523\", \"name\": \"Alliance\", \"latitude\": \"48.8499\", \"longitude\": \"2.3532698\", \"country\": \"FRA\", \"area\": \"\", \"city\": \"Paris\", \"address\": \"5 r. de Poissy\", \"postcode\": \"75005\", \"email\": \"restaurant.alliance@outlook.com\", \"chef\": \"Toshitaka Omiya\", \"michelin_stars\": \"1\"}]}]}";
var resultJson = JSON.parse(result);
console.log(resultJson)


///////////////////////////////
//// GET REQUEST AJAX
//////////////////////////////
function getObjetAjax(url_request) {
	var xhr = new XMLHttpRequest();
    //CREATION DE L'APPEL SYNCHRONE
    xhr.open("GET", url_request, false);
    //ENVOIE DE LA REQUETE
    xhr.send(null);
    //TRAITEMENT DES DONNEES 
    return JSON.parse(xhr.responseText);
}


