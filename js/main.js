var map = L.map('map').setView([20, 0], 2); // Initialize map

// Add OpenStreetMap tiles as a basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Function to create fixed pixel grid
function createFixedPixelGrid() {
    // Clear existing pixels
    const existingPixels = document.querySelectorAll('.pixel');
    existingPixels.forEach(pixel => pixel.remove());

    const pixelSize = 10; // Size of each pixel in pixels
    const mapWidth = map.getSize().x; // Get the current width of the map
    const mapHeight = map.getSize().y; // Get the current height of the map

    for (let x = 0; x < mapWidth; x += pixelSize) {
        for (let y = 0; y < mapHeight; y += pixelSize) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.left = `${x}px`;
            pixel.style.top = `${y}px`;
            document.getElementById('map').appendChild(pixel);
        }
    }
}

// Wait for the map to fully load before creating the pixel grid
map.on('load', createFixedPixelGrid);

// Update pixel grid when the map moves or zooms
map.on('moveend zoomend', createFixedPixelGrid);

// Trigger grid creation if the map is already loaded
if (map._loaded) {
    createFixedPixelGrid();
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
                    fillOpacity: 0.7,
                    className: 'country-overlay'
                };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.ADMIN) {
                    layer.bindTooltip(feature.properties.ADMIN); // Show country name on hover
                }
            }
        }).addTo(map);
    });
