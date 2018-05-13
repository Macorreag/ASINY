neighborhoods/*DataSets URl*/
const NAMESNEIGHBORHOOD ="https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD";

/*
CD is a  COMMUNITY DISTRICT
[9] Point of Neighborhood
[10] Complete Name Neighborhood
[11] CD to which belongs(Orden inverted 12 is de 1 CD)
*/
const SHAPECD = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson"
/*
features[i].properties.BoroCD  = 100 * BOROUGH + CD
features[i].geometry.coordinates[j] = Coordinates of Shape
*/
const BOROUGH = ["Manhattan", "Bronx", "Brooklyn", "Queens", "Staten Island"];

/*(Joint of Interest Areas) Not living posible Areas*/
const JIA = [164,226,227,228,355,356,480,481,482,483,484,595];
var colorJIA = "rgba(0, 0, 0, 0.9)";


const coordUniversity = {	/*Position University*/
	lat:40.7291, lng:-73.9965
};

/*
Objects
BOROUGH[
CommunityDistrict{
NEIGHBORHOOD[]
}
]
*/

/*Manage */
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomColorRGBA( a ){
	var r = getRandomInt(0, 255);
	var g = getRandomInt(0, 255);
	var b = getRandomInt(0, 255);
	return ("rgba(" +r+ "," +g+ "," +b+ "," +a+ ")");
}
/*Data Treatment
*/
function numberBorough( numberCD ){
	/*Number of CD define your BOROUGH */
	var n = (Number(numberCD) /100)-1;
	return	parseInt(n);
}

function coordinateGmaps( chain ){
	/*Cast Strng POINT to GmapsFormat*/
	var temp = chain.split(" ");
	temp[1] = temp[1].substring(1,(temp[1].length));
	temp[2] = temp[2].substring(0,(temp[2].length-1));
	/*var point = {
		lat:Number(temp[1]), lng:Number(temp[2])
	}*/
	var point = new google.maps.LatLng(
		Number(temp[2]),
		Number(temp[1]),
	 )
	return point;
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

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: coordUniversity,
		zoom: 11
		/*29 levels to Zoom*/
	});

	var image = {
		url: 'https://i.imgur.com/QDsm8jB.png',
		size: new google.maps.Size(45, 45),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(25,45)
	};

	setMarker(image,coordUniversity,'NYC University');
}

/*/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code*/


/*JSON filtered */
var neighborhoods = [];
var nbInfo = [];
var shapes=[];
var boroughts = [];

/*Variables for GMaps*/
var map;
var markers = [];

/*ranking variables*/
var topTen = [];
var globale = [];

var topTen = [
	{
		"positionArray":"0",
		"id": "",
		"district": "",
		"color": "",
		"description": ""
	}
];


class Neighborhood {
	/*In the communityDistrict*/
	constructor(name,coorCenter,district,coordLimits) {
		this._name = name;
		this._coorCenter = coordinateGmaps(coorCenter);
		this._district = district;
		this._coordLimits = coordLimits;
		this.distanceWalk  ,
		this.distanceCar  ,
		this.distanceTransport  ,
		this.timwWalk  ,
		this.timeCar  ,
		this.timeTrans  ,
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


}
class CommunityDistrict {
	/*CommunityDistrict in the 5 district */
	constructor(num,coorCenter,coordLimits) {
		this._id = Number(num),
		this._coorCenter = coorCenter,
		this._coordLimits = coordLimits,
		this._neighborhoods = [];
		this._multiPolygon;
		if(JIA.includes(this._id)){
			/*JIA is a different color for the user*/
			this._color = colorJIA;
		}else{
			this._color = randomColorRGBA(0.6); /*Problema colores muy similares*/
		}
	}
	get id() {
		return this._id;
	}
	get multiPolygon(){
		return this._multiPolygon;
	}
	get coorCenter(){
		return this._coorCenter;
	}
	get neighborhoods(){
		return this._neighborhoods;
	}
	get borough(){
		return BOROUGH[numberBorough(this._id)];
	}
	get coordLimits(){
		return this._coordLimits;
	}
	get habitable(){
		if(!JIA.includes(this._id) && this.neighborhoods.length > 0){
			return true;/*Validate if is habitable*/;
		}else{
			return false;
		}
	}
	get color(){
		return this._color;
	}
}



function getDataShapeDistric( url ){
	/*Organize DataSets of Shapes */
	var geoCD = [];
	var data = $.get(url, () => {
	})
	.done(function () {
		var responseJSON = JSON.parse(data.responseText)
		for(var i = 0 ;i < responseJSON.features.length ;i++){
			var communityDistrict = new CommunityDistrict(
				responseJSON.features[i].properties.BoroCD,
				"",
				[],
				""
			);
			geoCD.push(communityDistrict);
			for (var j = 0; j < responseJSON.features[i].geometry.coordinates.length; j++) {
				for (var g = 0; g < responseJSON.features[i].geometry.coordinates[j].length; g++) {

					if (responseJSON.features[i].geometry.type == "MultiPolygon") {
						var subCoor = [];
						for (var k = 0; k < responseJSON.features[i].geometry.coordinates[j][g].length; k++) {
							/*var point = {
								lat: responseJSON.features[i].geometry.coordinates[j][g][k][1],
								lng: responseJSON.features[i].geometry.coordinates[j][g][k][0]
							}*/
							var point = new google.maps.LatLng(
								 responseJSON.features[i].geometry.coordinates[j][g][k][1],
								 responseJSON.features[i].geometry.coordinates[j][g][k][0]
							 )
							subCoor.push(point);
						}
						geoCD[i]._multiPolygon = true;
						geoCD[i]._coordLimits.push(subCoor);
					}else{
						/*var point = {
							lat: responseJSON.features[i].geometry.coordinates[j][g][1],
							lng: responseJSON.features[i].geometry.coordinates[j][g][0]
						}*/
						var point = new google.maps.LatLng(
							 responseJSON.features[i].geometry.coordinates[j][g][1],
							 responseJSON.features[i].geometry.coordinates[j][g][0]
						 )
						geoCD[i]._multiPolygon = false;
						geoCD[i]._coordLimits.push(point);
					}
				}
			}			/*Make object with contains of DataSets*/
		}
	}).fail(function (error) {
		console.error(error);
	})

	return geoCD;

}




function drawNB( shape ){
	var nbBoundaries = new google.maps.Polygon({
		paths: shape.coordLimits,
		strokeColor: shape.color,
		strokeWeight: 2,
		fillColor: shape.color
	});
	nbBoundaries.setMap(map);
}

function neighborhoodInCD( neighbor, communityD){
	if(!communityD.multiPolygon){
		console.log("Here");
		var bermudaTriangle = new google.maps.Polygon({paths: communityD.coordLimits});
		return google.maps.geometry.poly.containsLocation(neighbor.coorCenter, bermudaTriangle) ?
		true:
		false;
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
				data.responseJSON.data[i][16],/**/
				""
			);
			neighborhoods.push(neighborhood);
			//neighborhoodInCD
			//boroughts[numberBoro].push(neighborhood);
			/*Make object with contains of DataSets*/
		}

	})
	.fail(function(error){
		console.log(error);
	})
}

function compareById(a,b) {
	if (a.id < b.id)
	return -1;
	if (a.id > b.id)
	return 1;
	return 0;
}


function separateByBoroughts( array ){
	for (var i = 0 ;i < BOROUGH.length  ; i++){
		var  filteredCD = array.filter(dis => numberBorough(dis.id) == i);
		boroughts.push(filteredCD);
	}
	return boroughts;
}


$("document").ready(function(){
	shapes = getDataShapeDistric(SHAPECD);
	//separateByBoroughts(shapes);

	//neighborhoods
	//var data =  getDataShapeDistric(SHAPECD);
	//getDataNeighborhood(NAMESNEIGHBORHOOD);

	neighborhoods
	$('#table').bootstrapTable({
		data:topTen,
		onClickRow: function (row,$element){
			console.log(row);
			$element.css({backgroundColor: row.color});
			drawNB(shapes[row.positionArray]);
		},

		clickToSelect:true,
		rememberOrder:true,
		onCheck: function(row,$element){

			alert("hi");
		}

		//checkbox: true,
	});
	//drawNB(shapes[3].coordLimits);
	//fillData();

});


function fillData(){
	console.log(separateByBoroughts(shapes));
	getDataNeighborhood(NAMESNEIGHBORHOOD);
	for(var iter = 1 ;iter < 10; iter++){
		topTen.push(
			{
				"positionArray":iter,
				"id":shapes[iter].id,
				"district":shapes[iter].borough,
				"color":shapes[iter].color
			}
		);
	}
	$('#table').bootstrapTable('updateRow',6);
}

function neighborhoodToCD(){
	for(var i = 0 ;i < neighborhoods.length; i++){

		var numberBoro= BOROUGH.indexOf(neighborhoods[i].district);
		for(var j = 0; j < boroughts[numberBoro].length ; j++){

			if(neighborhoodInCD( neighborhoods[i], boroughts[numberBoro][j])){
				console.log("Hi2");
				boroughts[numberBoro][j].neighborhoods.push(neighborhoods[i]);
			}
		}

	}}
function drawNeigh(array){
	for( var i = 0 ;i <array.length ; i++){
		var marker = new google.maps.Marker({
	 		position: array[i].coorCenter,
	 		map: map,
	 		title: 'Hello World!'
		});
	}

}
