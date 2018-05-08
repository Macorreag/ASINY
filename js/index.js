const coorUniversity={lat:40.7291, lng:73.9965 };
$(".negrito").off(event);
var map;

var markers = [];
/*Matriz que contiene los marcaadores para posicionar en el mapa*/
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    /*Aqui vive el mapa,se maneja dentro de la clase google.maps*/
    center: {
      lat: 40.7291,
      lng: 73.9965
    },
    zoom: 19
    /*29 niveles de zoom para iniciar la vista*/
  });

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  /*Podriamos traer aca los DataSets para mostrar en el Mapa*/
  var locations = [{
    title: 'Park Ave Penthouse',
    location: {
      lat: 40.7713024,
      lng: -73.9632393
    }
  },
  {
    title: 'Chelsea Loft',
    location: {
      lat: 40.7444883,
      lng: -73.9949465
    }
  },
  {
    title: 'Union Square Open Floor Plan',
    location: {
      lat: 40.7347062,
      lng: -73.9895759
    }
  },
  {
    title: 'East Village Hip Studio',
    location: {
      lat: 40.7281777,
      lng: -73.984377
    }
  },
  {
    title: 'TriBeCa Artsy Bachelor Pad',
    location: {
      lat: 40.7195264,
      lng: -74.0089934
    }
  },
  {
    title: 'Chinatown Homey Space',
    location: {
      lat: 40.7180628,
      lng: -73.9961237
    }
  }
];



var largeInfowindow = new google.maps.InfoWindow();
var bounds = new google.maps.LatLngBounds();

// Thabre el  e following group uses the location array to create an array of markers on initialize.
for (var i = 0; i < locations.length; i++) {
  // Get the position from the location array.
  var position = locations[i].location;
  var title = locations[i].title;
  // Create a marker per location, and put into markers array.
  var marker = new google.maps.Marker({
    map: map,
    position: position,
    title: title,
    animation: google.maps.Animation.DROP,
    //animacion como ingresaran los markadores al mapa
    id: i
  });
  // Push the marker to our array of markers.
  markers.push(marker);
  // Create an onclick event to open an infowindow at each marker.
  marker.addListener('click', function() {
    populateInfoWindow(this, largeInfowindow);
  });
  bounds.extend(markers[i].position);
}


map.fitBounds(bounds);

function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.setMarker = null;
    });
  }
}
var tribeca = {
  /*Posicion del marker*/
  lat: 40.719526,
  lng: -74.0089934
};
var marker = new google.maps.Marker({
  position: tribeca,
  map: map,
  /*Mapa donde se colocara el marker*/
  title: 'First Marker!'
  /*Texto mostrado onHover*/
});

/*Probando los circulos en el mapa*/
var cityCircle = new google.maps.Circle({
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#31E7FB',
  fillOpacity: 0.35,
  map: map,
  center: tribeca,
  radius: 20 * 100,
  //editable: true
});



}
