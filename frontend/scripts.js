var map = L.map('map').setView([40.7128, -74.0060], 16); 

var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);