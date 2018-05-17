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
const JIA = [164,226,227,228,355,356,480,481,482,483,484,595];
var colorJIA = "rgba(0, 0, 0, 0.9)";


const coordUniversity = {	/*Position University*/
	lat:40.7291, lng:-73.9965
};

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

async function neighborhoodToCD(){
	for(var i = 0 ;i < neighborhoods.length; i++){
		var numberBoro= BOROUGH.indexOf(neighborhoods[i].district);

		for(var j = 0; j < boroughts[numberBoro].length ; j++){
			if(pointInPath(neighborhoods[i].coorCenter, boroughts[numberBoro][j].coordLimits)){
				boroughts[numberBoro][j].neighborhoods.push(neighborhoods[i]);
			}
		}
	}

}
function getDataShapeDistric(){
	/*Organize DataSets of Shapes */
	var geoCD = [];
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
			geoCD.push(communityDistrict);
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

var filteredCD = [];

var topTen = [
	{"positionArray":0,
	"id":0,
	"district":0,
	"color":0
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
		this._id = Number(num),
		this._coordLimits = coordLimits,
		this._neighborhoods = [],
		this._multiPolygon = multiPol;
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
		if(this._neighborhoods.length > 0){ /*Validate if is habitable*/
			return true;
		}else {
			return false;
		}
	}
	get color(){
		return this._color;
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
			/*tamaño determinado por el ancho del viewport*/
		})
		.text(function(d){
			return d;
		})
	}

}


$("document").ready(function(){
	shapes = getDataShapeDistric();
	getDataNeighborhood(NAMESNEIGHBORHOOD);
	setTimeout(separateByBoroughts, 2000);/*Is Wrong controll Async Execute*/
	setTimeout(neighborhoodToCD,5000);
	setTimeout(calculateDistances,10000);



	/*x(shapes, function(val){
	val =
	(val);
});
*/
//separateByBoroughts(getDataShapeDistric);
//pullData().then(function(value) {
//	var yuca = Promise.resolve(getDataShapeDistric(SHAPECD));
//separateByBoroughts(Promise.resolve(getDataShapeDistric(SHAPECD)));
//yuca.then(function(value) {
//shapes = value;

//});
//separateByBoroughts(Promise.resolve(shapes));
//var casa = pullData();
//console.log(casa);

//neighborhoods
//var data =  getDataShapeDistric(SHAPECD);
//getDataNeighborhood(NAMESNEIGHBORHOOD);

$('#table').bootstrapTable({

	data:topTen,
	onClickRow: function (row,$element){
		console.log(row);
		$element.css({backgroundColor: row.color});
		drawNB(filteredCD[row.positionArray]);
	},

	clickToSelect:true,
	//onlyInfoPagination:true,
	//rememberOrder:true,
	pagination:true,
	onCheck: function(row,$element){

		alert("hi");
	}

	//checkbox: true,
});
//drawNB(shapes[3].coordLimits);
//fillData();



var  mata = [3,42,100,32,5];

/*Instanciando la clase*/
var barrasTest =  new BarChart(mata,300,".test");



barrasTest.graficar();


});




/*FOR TEST
*/
function drawNeigh(array){
	for( var i = 0 ;i <array.length ; i++){
		var marker = new google.maps.Marker({
			position: array[i].coorCenter,
			map: map,
			title: 'Hello World!'
		});
	}

}
function countNeigh(){
	var num = 0;
	for (var i=0;i <boroughts.length;i++){
		for (var j=0;j <boroughts[i].length ;j++){
			num += boroughts[i][j].neighborhoods.length;
		}
	}
	console.log(num);
}
function getJSON( url ){
	var data = $.get(url,function(){})
	.done(function(){
		//return responseJSON = JSON.parse(data.responseText)
		console.log(data);
	}).fail(function(error){
		console.log(error);
	})
}

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
					for (var i = 0 ; i < communityD.neighborhoods.length ; i++){
						communityD.neighborhoods[i].distanceCar.push(response.rows[i]);
						sumDistance += response.rows[i].elements[0].distance.value;
					}
					/*Average cast to KM*/
					communityD.distanceCar = sumDistance/(1000*communityD.neighborhoods.length);
					resolve('resolved');
				}
			})

		}, 400);

	})
}
function compareBydistance(a,b) {
	if (a.distanceCar < b.distanceCar)
	return -1;
	if (a.distanceCar > b.distanceCar)
	return 1;
	return 0;
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

async function calculateDistances(){
	for(var i = 0;i < boroughts.length ;i++ ){
		for (var j = 0;j <boroughts[i].length ;j++){
			if(boroughts[i][j].neighborhoods.length > 0 ){
				filteredCD.push(boroughts[i][j]);

				await calculateDistanceCar(boroughts[i][j]);
				$('.progress-bar').text( i*25+"%" );
				$('.progress-bar').css( "width",i*25+"%" )	;
				if(i == 4){
					$('.progress-bar').removeClass( "progress-bar-striped progress-bar-animated" );
				}
				console.log(i);
			}
		}
	}
}
function sortByDistance(){

filteredCD.sort(compareBydistance);
	console.log(filteredCD);
	topTen[0].positionArray = 0;
	topTen[0].id = filteredCD[0].id ;
	topTen[0].district = filteredCD[0].borough ;
	topTen[0].color = filteredCD[0].color;

	for(var iter = 1 ;iter < filteredCD.length; iter++){
		topTen.push(
			{
				"positionArray":iter,
				"id":filteredCD[iter].id,
				"district":filteredCD[iter].borough,
				"color":filteredCD[iter].color
			}
		);
	}
	$('#table').bootstrapTable('updateRow',0);
}
