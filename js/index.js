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
	var point = {
		lat:Number(temp[1]), lng:Number(temp[2])
	}
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
var infoRows = [];
var nbInfo = [];
 var shapes=[];
/*Variables for GMaps*/
var map;
var markers = [];

/*ranking variables*/
var topTen = [];
var globale = [];

var rata = [
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
	constructor(name,coorCenter,district,coordLimits,habitable) {
		this._name = name;
		this._coorCenter = coordinateGmaps(coorCenter);
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
	constructor(num,coorCenter,coordLimits) {
		this._id = Number(num);
		this._coorCenter = coorCenter;/*Acomodar para si recibe POINT lo organize*/
		this._coordLimits = coordLimits;
		if(JIA.includes(this._id)){
			this._color = colorJIA;
		}else{
			this._color = randomColorRGBA(0.6); /*Dejar ramdom dentro del costructor para luego usar*/
		}
	}
	get id() {
		return this._id;
	}

	get coorCenter(){
		return this._coorCenter;
	}
	get borough(){
		return BOROUGH[numberBorough(this._id)];
	}
	get coordLimits(){
		return this._coordLimits;
	}
	get habitable(){
		return !JIA.includes(this._id);/*Validate if is habitable*/;
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
							var point = {
								lat: responseJSON.features[i].geometry.coordinates[j][g][k][1],
								lng: responseJSON.features[i].geometry.coordinates[j][g][k][0]
							}
							subCoor.push(point);
						}
						geoCD[i]._coordLimits.push(subCoor);
					}else{
						var point = {
							lat: responseJSON.features[i].geometry.coordinates[j][g][1],
							lng: responseJSON.features[i].geometry.coordinates[j][g][0]
						}
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
	/*
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
	 shapes = getDataShapeDistric(SHAPECD);
	//var data =  getDataShapeDistric(SHAPECD);
	getDataNeighborhood(NAMESNEIGHBORHOOD);

	$('#table').bootstrapTable({
		data:rata,
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
	fillData();

});


	function fillData(){

				for(var iter = 1 ;iter < 10; iter++){
					rata.push(
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
	function compareById(a,b) {
	  if (a.id < b.id)
	    return -1;
	  if (a.id > b.id)
	    return 1;
	  return 0;
	}
//shapes.sort(compare)
function separateByBoroughts( array ){
		var  result = array.filter(dis => numberBorough(dis.id) == 0);
		return result;
}
