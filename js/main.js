// main.js
var map = L.map('map').setView([20, 0], 2); // Initialize map

// Add OpenStreetMap tiles as a basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Function to create pixel grid
function createPixelGrid() {
    // Clear existing pixels
    const existingPixels = document.querySelectorAll('.pixel');
    existingPixels.forEach(pixel => pixel.remove());

    const bounds = map.getBounds();
    const pixelSize = 10; // Size of each pixel in pixels

    // Get the current zoom level
    const zoom = map.getZoom();

    // Set a fixed number of rows
    const numRows = 30; // Change this number as needed
    const latIncrement = (bounds.getNorth() - bounds.getSouth()) / numRows;

    // Calculate the longitude increment based on the pixel size and current zoom level
    const lngIncrement = pixelSize * (360 / (Math.pow(2, zoom) * 256)); // degrees per pixel

    for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += latIncrement) {
        for (let lng = bounds.getWest(); lng < bounds.getEast(); lng += lngIncrement) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            const point = map.latLngToLayerPoint([lat, lng]);
            pixel.style.left = `${point.x}px`;
            pixel.style.top = `${point.y}px`;
            document.getElementById('map').appendChild(pixel);
        }
    }
}

// Wait for the map to fully load before creating the pixel grid
map.on('load', createPixelGrid);

// Update pixel grid when the map moves or zooms
map.on('moveend zoomend', createPixelGrid);

// Trigger grid creation if the map is already loaded
if (map._loaded) {
    createPixelGrid();
    map.fire('moveend');
}

// Load GeoJSON data
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
