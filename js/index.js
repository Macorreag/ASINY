/*DataSets URl*/
const NAMESNEIGHBORHOOD ="https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";
const SHAPECD = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson"
const BOROUGHTS_NAMES = ["Manhattan", "The Bronx", "Brooklyn", "Queens", "Staten Island"];
const coordUniversity={lat:40.7291, lng:-73.9965 }; /*Position University*/

/*CD is a  COMMUNITY DISTRICT /
const coordUniversity={lat:40.7291, lng:-73.9965 }; /*Position University*/
/*JSON filtered */
var infoRows = [];
var nbInfo = [];
/*Variables for GMaps*/
var map;
var markers = [];



var geoCD = [];

function nameDistrict( numberCD ){
	/*Number of CD define your DISTRICT */
	var n = (Number(numberCD) /100)-1;
	return	BOROUGHTS_NAMES[parseInt(n)];
}

class Neighborhood {
	/*Neighborhood in the 5 district */
	constructor(name,coorCenter,district,coordLimits,habitable) {
		this._name = name;
		this._coorCenter = coorCenter;/*Acomodar para si recibe POINT lo organize*/
		this._district = district;
		this._coordLimits = coordLimits;
		this._habitable = habitable;
		this._color = "#111111"; /*Dejar ramdom dentro del costructor para luego usar*/
	}
	get name() {
		return this._name;
	}

	get coorCenter(){
		return this._coorCenter;
	}

	get district(){
		return this._district;
	}

	get coordLimits(){
		return this._coordLimits;
	}

	get habitable(){
		return this._habitable;
	}

}
class CommunityDistrict {
	/*CommunityDistrict in the 5 district */
	constructor(num,coorCenter,coordLimits,habitable) {
		this._id = Number(num);
		this._coorCenter = coorCenter;/*Acomodar para si recibe POINT lo organize*/
		this._coordLimits = coordLimits;
		this._habitable = habitable;
		this._color = "#111111"; /*Dejar ramdom dentro del costructor para luego usar*/
	}
	get id() {
		return this._id;
	}

	get coorCenter(){
		return this._coorCenter;
	}
	get district(){
		return nameDistrict(this._id);
	}
	get coordLimits(){
		return this._coordLimits;
	}

	get habitable(){
		return this._habitable;
	}



}

function castToCoordinate( coordinates ){
	for (var i = 0; i < coordinates.length ; i++){
		var point = {
			lat: coordinates[1],
			lng: coordinates[0]
		}
	}
}

function getDataShapeDistric( url ){
	var data = $.get(url, () => {
	})
	.done(function () {
		var responseJSON = JSON.parse(data.responseText)
		for(var i = 0 ;i < responseJSON.features.length ;i++){
			var communityDistrict = new CommunityDistrict(
				responseJSON.features[i].properties.BoroCD,
				"",
				[],
				"true", /*Tem*/
			);
			geoCD.push(communityDistrict);
			/*Make object with contains of DataSets*/
		}





		for (var i = 0; i < responseJSON.features.length; i++) {

			if (responseJSON.features[i].geometry.type == "MultiPolygon") {


				for (var j = 0; j < responseJSON.features[i].geometry.coordinates.length; j++) {
					for (var g = 0; g < responseJSON.features[i].geometry.coordinates[j].length; g++) {
						for (var k = 0; k < responseJSON.features[i].geometry.coordinates[j][g].length; k++) {

							var point = {
								lat: responseJSON.features[i].geometry.coordinates[j][g][k][1],
								lng: responseJSON.features[i].geometry.coordinates[j][g][k][0]
							}
								geoCD[i]._coordLimits.push(point);
								//console.log(point);
							}
						}
					}
				}else{

					for (var j = 0; j < responseJSON.features[i].geometry.coordinates.length; j++) {

						for (var g = 0; g < responseJSON.features[i].geometry.coordinates[j].length; g++) {
							var point = {
								lat: responseJSON.features[i].geometry.coordinates[j][g][1],
								lng: responseJSON.features[i].geometry.coordinates[j][g][0]
							}
							geoCD[i]._coordLimits.push(point);
						}
					}
				}
			}


			console.log(geoCD);
			drawNB();


})
.fail(function (error) {
	/**/
	console.error(error);
})
}


function drawNB(){
	for (var i = 0; i < geoCD.length; i++) {
			console.log(i);
			var nbBoundaries = new google.maps.Polygon({
			    paths: geoCD[i].coordLimits,
			    strokeColor: "red",
			    strokeOpacity: 0.8,
			    strokeWeight: 2,
			    fillColor: "blue",
			    fillOpacity: 0.2
			});
			nbBoundaries.setMap(map);
		}
	}



function getDataNeighborhood(URL){
	/*Como parametro podria tener la URL */
	var data = $.get(URL,function(){})
	.done(function(){
		let responseJSON = JSON.parse(data.responseText);
		for(var i = 0 ;i < data.responseJSON.data.length ;i++){
			var neighborhood = new Neighborhood(
				data.responseJSON.data[i][10],
				data.responseJSON.data[i][9],
				data.responseJSON.data[i][16],
				"", /*Tem*/
				"True" /*Tem*/
			);
			infoRows.push(neighborhood);
			/*Make object with contains of DataSets*/
		}
		console.log(infoRows);
		console.log(infoRows.sort(function(name){

		}));/*
		var tableReference = $("#city")[0];
		var newRow, state, deaths, year;
		for(var i = 0;i <infoRows.length;i++){
		newRow = tableReference.insertRow(tableReference.rows.length);
		state = newRow.insertCell()
		deaths = newRow.insertCell();
		year =  newRow.insertCell();
		state.innerHTML = infoRows[i][0];
		deaths.innerHTML = infoRows[i][1];
		year.innerHTML = infoRows[i][2]
	}
	/*console.log(data.responseJSON.data.filter(function (n){
	if(1==1){

}
return n[16][0]  ;
}));
*/
/*
for(var i = 0 ;i < data.responseJSON.data.length ;i++){
infoRows.push([data.responseJSON.data[i][8],data.responseJSON.data[i][13],data.responseJSON.data[i][9]]);
/*Primera Fila con el contenido de la row 8 del data set*/
/*}
var tableReference = $(".table")[0];
var newRow, state, deaths, year;
for(var i = 0;i <infoRows.length;i++){
newRow = tableReference.insertRow(tableReference.rows.length);
state = newRow.insertCell()
deaths = newRow.insertCell();
year =  newRow.insertCell();
state.innerHTML = infoRows[i][0];
deaths.innerHTML = infoRows[i][1];
year.innerHTML = infoRows[i][2]
}
console.log(infoRows);
*/
})
.fail(function(error){
	console.log(error);
})
}


$("document").ready(function(){
	var data =  getDataShapeDistric(SHAPECD);


});





/*Matriz que contiene los marcaadores para posicionar en el mapa*/
function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		/*Aqui vive el mapa,se maneja dentro de la clase google.maps*/
		center: coordUniversity,
		zoom: 11
		/*29 niveles de zoom para iniciar la vista*/
	});


	var image = {
		url: 'https://i.imgur.com/QDsm8jB.png',
		size: new google.maps.Size(45, 45),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(25,45 )
	};
	setMarker(image,coordUniversity,'NYC University');

}


/*Functions for Google Maps*/

function setMarker(image,coordinates,textHover) {
	var marker = new google.maps.Marker({
		position:coordinates,
		map: map,
		/*Mapa donde se colocara el marker*/
		icon: image,
		title: textHover,
		/*Text show in event Hover*/
		zIndex: 100
	});
}
