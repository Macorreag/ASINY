/*DataSets URl*/
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
var colorJIA = "rgba(0, 0, 0, 0.9)";


const coordUniversity = {	/*Position University*/
	lat:40.7291, lng:-73.9965
};

/*JSON filtered */

var borough=[];

/*Variables for GMaps*/
var map;

/*ranking variables*/
var maxDistance = 0;
var flagConsultedDistances = 0;
/*Community District Sorted By distance between neighborhoods to NYU*/
var filteredCD = [];

/*
Objects
BOROUGH[
CommunityDistrict{ IMPORTANT
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
	var point = new google.maps.LatLng(
		Number(temp[2]),
		Number(temp[1]),
	)
	return point;
}

function neighborhoodToCD(neighborhood,numberBoro){
	for(var i = 0; i < borough[numberBoro].length ; i++){
		if(pointInPath(neighborhood.coorCenter, borough[numberBoro][i].coordLimits)){
			borough[numberBoro][i].neighborhoods.push(neighborhood);
		}
	}
}


function getDataShapeDistric(){
	/*Organize DataSets of borough */
	var geoCD = [[],[],[],[],[]];
	var data = $.get(SHAPECD, () => {})
	.done(function () {
		var responseJSON = JSON.parse(data.responseText)
		for(var i = 0 ;i < responseJSON.features.length ;i++){	/*Number of CD*/
			var communityDistrict;
			var subShape = [];
			var multiPolygon = false;
			if (responseJSON.features[i].geometry.type == "MultiPolygon") {
				for (var j = 0; j < responseJSON.features[i].geometry.coordinates.length; j++) {
					for (var g = 0; g < responseJSON.features[i].geometry.coordinates[j].length; g++) {
						var subCoor = [];
						for (var k = 0; k < responseJSON.features[i].geometry.coordinates[j][g].length; k++) {
							var point = new google.maps.LatLng(
								responseJSON.features[i].geometry.coordinates[j][g][k][1],
								responseJSON.features[i].geometry.coordinates[j][g][k][0]
							)
							subCoor.push(point);
						}
					}
					subShape.push(subCoor);
				}
				multiPolygon = true;
			}else{
				for (var j = 0; j < responseJSON.features[i].geometry.coordinates.length; j++) {
					for (var g = 0; g < responseJSON.features[i].geometry.coordinates[j].length; g++) {
						var point = new google.maps.LatLng(
							responseJSON.features[i].geometry.coordinates[j][g][1],
							responseJSON.features[i].geometry.coordinates[j][g][0]
						);
						subShape.push(point);
					}
				}
			}
			communityDistrict = new CommunityDistrict(
				responseJSON.features[i].properties.BoroCD,
				subShape,
				multiPolygon /*Is a multipolygon*/
			);
			/*SortByCommunityDistrict*/
			geoCD[numberBorough(responseJSON.features[i].properties.BoroCD)].push(communityDistrict);
		}

	}).fail(function (error) {
		console.error(error);
	})
	return geoCD;
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

function pointInPath( point , coordLimits){
	var shape = new google.maps.Polygon({paths: coordLimits});
	return google.maps.geometry.poly.containsLocation(point, shape) ?
	true:
	false;
}
function drawNeigh(array){
	for( var i = 0 ;i <array.length ; i++){
		var marker = new google.maps.Marker({
			position: array[i].coorCenter,
			map: map,
			title: array[i].name
		});
	}
}


/*/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code*/


class Neighborhood {
	/*In the communityDistrict*/
	constructor(name,coorCenter,district,coordLimits) {
		this._name = name;
		this._coorCenter = coordinateGmaps(coorCenter);
		this._district = district;
		this._coordLimits = coordLimits;
		this.distanceWalk  ,
		this.distanceCar  = [],
		this.distanceTransport  ,
		this.timeWalk  ,
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
	constructor(num,coordLimits,multiPol){
		this._id = Number(num);
		this._coordLimits = coordLimits;
		this._neighborhoods = [];
		this._multiPolygon = multiPol;
		if((num-(numberBorough(num)+1)*100) < 26){
			/*JIA is a different color for the user*/
			this._color = randomColorRGBA(0.6); /*Problema colores muy similares*/
		}else{
			this._color = colorJIA;

		}
	}
	get id() {
		return this._id;
	}
	get multiPolygon(){
		return this._multiPolygon;
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
		if((this._id-(numberBorough(this._id)+1)*100) < 26){ /*Validate if is habitable*/
			return true;
		}else {
			return false;
		}
	}
	get color(){
		return this._color;
	}

}

function getDataNeighborhood(){
	/*Como parametro podria tener la URL */
	var data = $.get(NAMESNEIGHBORHOOD,function(){})
	.done(function(){
		let responseJSON = JSON.parse(data.responseText);
		for(var i = 0 ;i < data.responseJSON.data.length ;i++){
			var neighborhood = new Neighborhood(
				data.responseJSON.data[i][10],
				data.responseJSON.data[i][9],
				""
			);
			var numberB= BOROUGH.indexOf(data.responseJSON.data[i][16]);
			neighborhoodToCD(neighborhood,numberB);
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





class BarChart {
	constructor(data,maxX,nameClass) {
		this._data = data;
		this._maxX = maxX;
		this._nameClass = nameClass;
		/*Ancho de las barras determinada por escala va desde 0[CERO TEMPORAL EL MINIMO DEBE CAMBIAR] hasta ---*/

	}
	get data() {
		return this._data;
	}
	get maxX() {
		return this._behavior;
	}
	get nameClass(){
		return this._nameClass;
	}

	get escalaX(){
		return this._escalaX;
	}
	graficar(){
		/*Toma del DOM la clase barras y todos los divs que tiene adentro ,luego con data va añadiendo div POR CADA DATO*/

		var escalaX = d3.scale.linear().domain([0,d3.max(this._data)]).range([0,this._maxX]);
		var array = d3.select(this.nameClass);
		var test = array.select("div");
		//test.style("background-color"," red");
		//d3.select(this.nameClass).selector([5]).style("background-color"," red");
		//d3.select(this.nameClass).filter(3).style("background-color","blue");
		var even =  array.select( function ( d , i ) { return i &  1  ?  this  :  null ;});
		/* alert("aqui esta el problema no puedo dividir la seleccion y por ende no puedo modificar directamente las caracteristicas de una sola division esto se debe realizar en cada swap la otra forma seria dibujar de nuevo todo el arreglo pero se sobrecargara el DOM");*/

		//var test2 = array.selectAll("div",3);
		//test2.style("background-color"," blue");
		//test.
		//var b =  d3 . selectAll ( " p " ). select ( " b " );
		//alert(test);
		//alert(test);
		d3.select(this.nameClass).selectAll("div").data(this.data).enter().append('div').style("width",function(d){
			/*Retorna un valor para el estilo en pixeles dentro del rango definido en escala y el parametro d corresponde al dato del arreglo*/
			return d +"%";

		})
		.text(function(d){
			return d;
		})
	}

}


$("document").ready(function(){
	borough = getDataShapeDistric();
	setTimeout(getDataNeighborhood,1000);

var  mata = [3,42,100,32,5];
/*Instanciando la clase*/
var barrasTest =  new BarChart(mata,300,".test");

barrasTest.graficar();

});

function updateTable(){
$('#table').bootstrapTable({

	data:filteredCD,
	onClickRow: function (row,$element){
		console.log(row);
		$element.css({backgroundColor: row.color});
		drawCD(row);
	},

	clickToSelect:true,
	//onlyInfoPagination:true,
	//rememberOrder:true,
	pagination:true,
	checkbox: true,
	onCheck: function(row,$element){

		alert("hi");
	}


});
}
/*FOR TEST
*/




function calculateDistanceCar( communityD ){
	var distanceMatrixService = new google.maps.DistanceMatrixService;
	var neighborhoodsDis = communityD.neighborhoods.map(a => a.coorCenter);
	return new Promise(resolve => {
		setTimeout(() => {
			distanceMatrixService.getDistanceMatrix({
				origins: neighborhoodsDis,
				destinations: [coordUniversity],
				unitSystem: google.maps.UnitSystem.METRIC,
				travelMode: 'DRIVING'

			},function(response, status){
				if (status !== google.maps.DistanceMatrixStatus.OK) {
					window.alert('Error Distance was: ' + status);
				} else {
					var sumDistance = 0;
					var numberNeigh = communityD.neighborhoods.length;
					for (var i = 0 ; i < numberNeigh ; i++){
						communityD.neighborhoods[i].distanceCar.push(response.rows[i]);
						sumDistance += response.rows[i].elements[0].distance.value;
					}
					/*Average cast to KM*/
					var averageDistance = sumDistance/(1000*numberNeigh);
					if(maxDistance < averageDistance){
						/*Save max distance for calculate Number of points*/
						maxDistance = averageDistance;
					}
					communityD.distanceCar = sumDistance/(1000*numberNeigh);
					resolve('resolved');
				}
			})

		}, 350);

	})
}
function compareByDistances(a,b) {
	if (a.distanceCar < b.distanceCar)
	return -1;
	if (a.distanceCar > b.distanceCar)
	return 1;
	return 0;
}
function drawCD( communityD ){
	var nbBoundaries = new google.maps.Polygon({
		paths: communityD.coordLimits,
		strokeColor: communityD.color,
		strokeWeight: 2,
		fillColor: communityD.color
	});
	drawNeigh(communityD.neighborhoods);
	nbBoundaries.setMap(map);
}
function controlCharge(status){
	$('.progress-bar').text( status+"% Loading" );
	$('.progress-bar').css( "width",status+"%" );
	if(status == 100){
		$('.progress-bar').removeClass( "progress-bar-striped progress-bar-animated " );
		$('.progress-bar').addClass("bg-success");
	}else{
		$('.progress-bar').addClass("progress-bar-striped progress-bar-animated ");
		$('.progress-bar').removeClass("bg-success");
	}
}
async function calculateDistances(){
	for(var i = 0;i < borough.length ;i++ ){
		for (var j = 0;j <borough[i].length ;j++){
			if(borough[i][j].habitable){
				filteredCD.push(borough[i][j]);
				await calculateDistanceCar(borough[i][j]);
			}
		}
		controlCharge(i*25);
	}
}
async function sortByDistance(){
	//if(flagConsultedDistances == 0){
		$('#exampleModalCenter').modal('toggle');
		$('#distance').addClass("btn-danger");
		$('#distance').prop('disabled', true);
		await calculateDistances();
		$('#distance').prop('disabled', false);
		document.getElementById("distance").setAttribute('onclick','sortByPreferences()')
		//flagConsultedDistances = 1;
	//}

	sortByPreferences();
}
function sortByPreferences(){
	filteredCD.sort(compareByDistances);
	updateTable();
	//$('#table').bootstrapTable('updateRow',0);
}
