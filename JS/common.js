
var isDebug = false;

/////////////////////////////////
// CHECK API KEY
///////////////////////////////
function checkApiKey(key) {
	let urlTest = "http://apir.viamichelin.com/apir/2/findPoi.json2/RESTAURANT/eng?center=-5.149666:42.42132&nb=1&dist=1&source=RESGR&authKey=" + key;
	var xhr = new XMLHttpRequest();
    //CREATION DE L'APPEL SYNCHRONE
    xhr.open("GET", urlTest, false);
    //ENVOIE DE LA REQUETE
    xhr.send(null);
    //TRAITEMENT DES DONNEE
    let response = JSON.parse(xhr.responseText);
    let status = xhr.status;
    if (status+""==="200") {
        if(response.error!=null && response.error.errorCode === 2){
            return false;
        }
        if(response.error!=null && response.error.errorCode !== 2){
            alert('Erreur : ' + JSON.stringify(response));
            return false;
        }
        return true;
    }else{
        alert('Erreur : ' + JSON.stringify(response));
        return false;
    }
}



function setDebugStatus(){
    let param = window.location.search.slice(1);
    let params = param.split('&');
    params.forEach(p=>{
        if(p.toUpperCase() === "DEBUG"){
            alert("debug activé!")
            isDebug = true;
        }
    })
}

function log(message) {
    if(isDebug){
     console.log(message); 
 }

}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
