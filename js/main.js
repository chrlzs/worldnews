// Step 2: Initialize the map
var map = L.map('map').setView([20, 0], 2); // Centered on the world view

// Add OpenStreetMap tiles as a basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load and display GeoJSON data
fetch('data/countries.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: "black",
                    fillColor: "lightgreen",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.ADMIN) {
                    layer.bindTooltip(feature.properties.ADMIN); // Show country name on hover
                }
            }
        }).addTo(map);
    });
