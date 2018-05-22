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
const HOUSEDATA = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD";
/*Crimes filtered DataSets*/
const CRIMES = "https://data.cityofnewyork.us/Public-Safety/Filtered12-31-2015Crimes/qcnt-82dk";
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
var shapeActive;
var heatmap;
/*ranking variables*/
var maxDistance = 0;
var preferenceDistance = false;
var preferencePrice = false;
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
var crimeCoordinates = [];
function getCrimes(){
	$.ajax({
	url: "https://data.cityofnewyork.us/resource/fj84-7huk.json",
}).done(function(data) {
		console.log(data)
	//data = JSON.parse(data.responseText);
		for (var i = 0; i < data.length; i++) {
		crimeCoordinates.push(
			new google.maps.LatLng(
				data[i].latitude,
				data[i].longitude
				//responseJSON.features[i].geometry.coordinates[j][g][k][0]
			)
		);


	}
	console.log(crimeCoordinates);
});

heatmap = new google.maps.visualization.HeatmapLayer({
				data: crimeCoordinates,
				map: map
});
return crimeCoordinates;

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
			communityDistrict.incomeUnits = [,,,,,];
			communityDistrict.bedroomUnits = new Array(0, 0, 0);
			/*SortByCommunityDistrict*/
			if(communityDistrict.habitable){
				filteredCD.push(communityDistrict);
			}
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
	marker.setMap(map);
	return marker;
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: coordUniversity,
		zoom: 11,
		/*29 levels to Zoom*/
		styles:[
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
]
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


class Neighborhood {
	/*In the communityDistrict*/
	constructor(name,coorCenter,coordLimits) {
		this._name = name;
		this._coorCenter = coordinateGmaps(coorCenter);
		this.distanceCar  = []
	}
	get name() {
		return this._name;
	}
	get coorCenter(){
		return this._coorCenter;
	}
	draw(){
		var image = {
			url: 'https://i.imgur.com/PQwY47e.png?1',
			size: new google.maps.Size(32, 32),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(15.5,15.5)
		};
		var marker = setMarker(image,this.coorCenter,this.name);
		return marker;
	}
}

class CommunityDistrict {
	/*CommunityDistrict in the 5 district */
	constructor(num,coordLimits,multiPol){
		this._id = Number(num);
		this._coordLimits = coordLimits;
		this._neighborhoods = [];
		this._multiPolygon = multiPol;
		this._bedroomUnits = new Array(
			/*Number of Bedroom by unit*/
			{"value":0 ,"text":"0"},
			{"value":0 ,"text":"1"},
			{"value":0 ,"text":"2"},
			{"value":0 ,"text":"3"},
			{"value":0 ,"text":"4"},
			{"value":0 ,"text":"5"},
			{"value":0 ,"text":"6"},
			{"value":0 ,"text":"UD"}),
		this._incomeUnits = new Array(
			/*Level of IncomeUnits*/
				{"value":0 ,"text":"Extremely low IncomeUnits"},
				{"value":0 ,"text":"Very low IncomeUnits"},
				{"value":0 ,"text":"Low IncomeUnits"},
				{"value":0 ,"text":"Moderate low IncomeUnits"},
				{"value":0 ,"text":"Middle IncomeUnits"},
				{"value":0 ,"text":"Other IncomeUnits"});
		this.affordableUnits = 0,
		this.numberUnits = 0;
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
	get incomeUnits(){
		return this._incomeUnits;
	}
	get bedroomUnits(){
		return this._bedroomUnits;
	}
	draw(){
		let communityDistr = new google.maps.Polygon({
			paths: this._coordLimits,
			strokeColor: this._color,
			strokeWeight: 2,
			fillColor: this._color
		});
		communityDistr.setMap(map);
		return communityDistr;
	}
	drawNB(){
		var neighborhoodMarkers = [];
		for( var i = 0 ;i < this._neighborhoods.length ; i++){
			neighborhoodMarkers.push(this._neighborhoods[i].draw());
		}
		return neighborhoodMarkers;
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

function getHousingData(){
	/*Como parametro podria tener la URL */
	var data = $.get(HOUSEDATA,function(){})
	.done(function(){

		var responseJSON = JSON.parse(data.responseText);

		for(var i = 0 ;i < 	responseJSON.data.length ;i++){
			let numberBoro = BOROUGH.indexOf(responseJSON.data[i][15]);
			let numberCD = Number(responseJSON.data[i][19].slice(-2)); /*Extract last 2 items*/
			var communityDistr = borough[numberBoro].filter(function( obj ) {
				if(obj.id == ((numberBoro+1)*100)+numberCD){
						return obj;
				}
			});
			communityDistr[0].incomeUnits[0].value += Number(responseJSON.data[i][31]);
			communityDistr[0].incomeUnits[1].value += Number(responseJSON.data[i][32]);
			communityDistr[0].incomeUnits[2].value += Number(responseJSON.data[i][33]);
			communityDistr[0].incomeUnits[3].value += Number(responseJSON.data[i][34]);
			communityDistr[0].incomeUnits[4].value += Number(responseJSON.data[i][35]);
			communityDistr[0].incomeUnits[5].value += Number(responseJSON.data[i][36]);

			communityDistr[0].bedroomUnits[0].value += Number(responseJSON.data[i][37]);
			communityDistr[0].bedroomUnits[1].value += Number(responseJSON.data[i][38]);
			communityDistr[0].bedroomUnits[2].value += Number(responseJSON.data[i][39]);
			communityDistr[0].bedroomUnits[3].value += Number(responseJSON.data[i][40]);
			communityDistr[0].bedroomUnits[4].value += Number(responseJSON.data[i][41]);
			communityDistr[0].bedroomUnits[5].value += Number(responseJSON.data[i][42]);
			communityDistr[0].bedroomUnits[6].value += Number(responseJSON.data[i][43]);
			communityDistr[0].bedroomUnits[7].value += Number(responseJSON.data[i][44]);

			communityDistr[0].affordableUnits += Number(responseJSON.data[i][45]);
			communityDistr[0].numberUnits += Number(responseJSON.data[i][47]);


		}
})
.fail(function(error){
	console.error(error);
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

function compareById(a,b) {
	if (a.id < b.id)
	return -1;
	if (a.id > b.id)
	return 1;
	return 0;
}

/*When Page charge Load Basic data */
$("document").ready(function(){
	borough = getDataShapeDistric();
	setTimeout(getDataNeighborhood,1000);
});

/*For bootstrap -Table*/
function runningFormatter(value, row, index) {
	/*Change Text by Icons */
	if( index == 0 ){
		return "Winner";
	}
	if( index == 1 ){
		return "Second";
	}
	if( index == 2 ){
		return "Third";
	}
    return index + 1;
}
/*/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code/Clean Code*/




function updateTable(){

	/*SORT BY ACTIVE PARAMETERS*/
	$('#table').bootstrapTable({
		data:filteredCD,
		onClickRow: function (row,$element){
			if(typeof(shapeActive) == "object" && typeof(neigMarkActive) == "object"){
				shapeActive.setMap(null);
				for(var i = 0 ;i < neigMarkActive.length ; i++){
					neigMarkActive[i].setMap(null);
				}
			};
			console.log(row);
			$element.css({backgroundColor: row.color});
			shapeActive = row.draw();
			neigMarkActive = row.drawNB();
			//drawBars();

			loadData(row.bedroomUnits);

			map.setCenter(row.neighborhoods[0].coorCenter);
			map.setZoom(13);

		},
		//pageList:false,

		clickToSelect:true,
		//onlyInfoPagination:true,
		//rememberOrder:true,
		//pagination:true,
		checkbox: true,
		onCheck: function(row,$element){

			alert("hi");
		}
	});
	$('#table').bootstrapTable('updateRow', {index:0});
}
/*FOR TEST
*/





async function calculateDistances(){
	for(var i = 0;i < borough.length ;i++ ){
		for (var j = 0;j <borough[i].length ;j++){
			if(borough[i][j].habitable){
				await calculateDistanceCar(borough[i][j]);
			}
		}
		controlCharge(i*25);
	}
}
function compareByDistances(a,b) {
	if (a.distanceCar < b.distanceCar)
	return -1;
	if (a.distanceCar > b.distanceCar)
	return 1;
	return 0;
}
function pointsPrice(communityD){
	var acumulate = 0;
	for(var i = 1;i < 8; i++){
		/*priorize number of bedroom per unit*/
			acumulate += (communityD.bedroomUnits[i].value*i);
			/*priorize by i more bredrom more points
			units without rooms do not have points
			more points is best*/
	}
	return acumulate; // /communityD.numberUnits;
}
function pointsIncome(communityD){
	var acumulate = 0;
	for(var i = 1, priorize = 5;i < 5; i++,priorize--){
		/*priorize number of bedroom per unit*/
			acumulate += (communityD.incomeUnits[i].value*priorize);
		/*priorize units by incomeUnits
		Units with unknown income values are not counted
		more points is best
		*/
	}
	return acumulate ;///communityD.numberUnits;
}
function percentageByPreferences(){
	var preferences = 0;
	if(preferenceDistance){
		preferences++;
	}
	if(preferencePrice){
		preferences++;
	}
	return 100/(100*preferences);
}
function calculatePoints(a,b) {
	var scoreA = 0;
	var scoreB = 0;
	if(preferencePrice){
		/*Function of points priorize
		*Number of bedroomUnits
		*/
		scoreA -= (pointsIncome(a) + pointsPrice(a));
		scoreB -= (pointsIncome(b) + pointsPrice(b));
		scoreA = scoreA*percentageByPreferences();
		scoreB = scoreB*percentageByPreferences();
	}
	if(preferenceDistance){
		scoreA += a.distanceCar*percentageByPreferences();
		scoreB += b.distanceCar*percentageByPreferences();
	}

	if (scoreA < scoreB)
	return -1;
	if (scoreA > scoreB)
	return 1;
	return 0;
}

function controlCharge(status){
	$('.progress-bar').text( status+"% Loading" );
	$('.progress-bar').css( "width",status+"%" );
	if(status == 100){
		$('#Status').text("Loaded Data");
		$('.progress-bar').removeClass( "progress-bar-striped progress-bar-animated " );
		$('.progress-bar').addClass("bg-success");
	}else{
		$('#Status').text( status+"% Loading" );
		$('.progress-bar').addClass("progress-bar-striped progress-bar-animated ");
		$('.progress-bar').removeClass("bg-success");
	}
}

async function calculateDistance(){
	$('#ModalDistance').modal('toggle');
	$('#distance').addClass("btn-danger");
	$('#distance').prop('disabled', true);
	await calculateDistances();
	$('#distance').prop('disabled', false);
	$('#distance').removeClass("btn-danger");
	document.getElementById("distance").setAttribute('onclick','sortByDistance()')
	sortByDistance();
}
function sortByDistance(){
	preferenceDistance = pressButton($('#distance'));
	sortByPreferences();
}
async function calculatePricing(){
	//$('#ModalDistance').modal('toggle');
	$('#price').addClass("btn-danger");
	$('#price').prop('disabled', true);
	await getHousingData();
	$('#price').prop('disabled', false);
	$('#price').removeClass("btn-danger");
	document.getElementById("price").setAttribute('onclick','sortByPrice()');
	sortByPrice();
}
function sortByPrice(){
	preferencePrice = pressButton($('#price'));
	sortByPreferences();
}
function pressButton( button ){
	if( button.hasClass("btn-primary") ){
		button.removeClass("btn-primary");
		return false;
	}else{
		button.addClass("btn-primary");
		return true;
	}
}
function sortByPreferences(){
	filteredCD.sort(calculatePoints);
	updateTable();
}

var tooltip = d3.select("body").append("div").attr("class", "toolTip");


function drawBars(values){

var axiXSpace = 40;
var svg = d3.select("#iu");
var width = svg.attr("width");
var height = svg.attr("height")  - axiXSpace;
var sizeFont = 15;

var footerText = "Number of bedroom by units";

var x = d3.scaleBand().rangeRound([0, width]).padding(0.05);
var y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g");
var tooltip = d3.select("body").append("div").attr("class", "toolTip");

x.domain(values.map(function(d) { return d.text; }));
y.domain([0, d3.max(values, function(d) { return d.value; })]);

 g.selectAll(".bar")
    .data(values)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.text); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })

			.on("mouseover", function(d){
				 tooltip
					 .style("left", d3.event.pageX - 50 + "px")
					 .style("top" , d3.event.pageY - 70 + "px")
					 .style("display", "inline-block")
					 .html((d.text) + "<br>"  + (d.value));
		 })
		 ;


  g.append("g").attr("class", "axis-x")
      .attr("transform", "translate(0,"+ (height + 1) + ")")
      .call(d3.axisBottom(x));

  svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           ((height )+ sizeFont + 20) + ")")
			.style("font-size",sizeFont + "px")
      .style("text-anchor", "middle")
      .text(footerText);

}
d3.select("#grap")
   .append("div")
   .classed("svg-container", true) //container class to make it responsive
   .append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 800 400")
   //class to make it responsive
   .classed("svg-content-responsive", true);
/*
var chart = $("#barChart"),
    aspect = chart.width()/chart.height(),
    container = chart.parent();
$(window).on("resize", function() {
    var targetWidth = chart.parent();
    chart.attr("width", container.width());
    chart.attr("height", container.height());
}).trigger("resize");
*/
/*BAR CHART */

  // SETUP

  var svg = d3.select("#barChart"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    x = d3.scaleBand().padding(0.1),
    y = d3.scaleLinear(),
    theData = undefined;

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  g.append("g")
    .attr("class", "axis axis--x")
		.style('fill', 'rgb(135, 137, 143)');


  g.append("g")
    .attr("class", "axis axis--y")
		.style('fill', 'rgb(135, 137, 143)');

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
		.style('fill', 'rgb(135, 137, 143)')
    .text("Frequency");

  // DRAWING
	var div = d3.select("body").append("div")
	    .attr("class", "tooltip");
  function paint() {

    var bounds = svg.node().getBoundingClientRect(),
      width = bounds.width - margin.left - margin.right,
      height = bounds.height - margin.top - margin.bottom;

    x.rangeRound([0, width]);
    y.rangeRound([height, 0]);

    g.select(".axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.select(".axis--y")
      .call(d3.axisLeft(y));

    var bars = g.selectAll(".bar")
      .data(theData);

    // ENTER
    bars
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return x(d.text); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d.value); })

			.on("mouseover", function(d) {
            div.transition()
                .duration(50)
                .style("opacity", 1);
            div	.html(d.text + "<br/>"  + d.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(20)
                .style("opacity", 0);
        });
			;

    // UPDATE
    bars.attr("x", function (d) { return x(d.text); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d.value); })
			;

    // EXIT
    bars.exit()
      .remove();

  }

  // LOADING DATA

  function loadData(tsvFile) {
			theData = tsvFile;

			console.log(tsvFile)
      x.domain(tsvFile.map(function (d) { return d.text; }))
			;
      y.domain([0, d3.max(theData, function (d) { return d.value; })]);

      paint();

  }

  // START!


  window.addEventListener("resize", paint);
	function toggleHeatmap() {
	        heatmap.setMap(heatmap.getMap() ? null : map);
	      }
