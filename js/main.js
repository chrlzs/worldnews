var map = L.map('map').setView([20, 0], 2); // Initialize map

// Add OpenStreetMap tiles as a basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Function to create fixed pixel grid
function createFixedPixelGrid() {
    // Clear existing pixels
    const existingPixels = document.querySelectorAll('#pixel-grid .pixel');
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
            document.getElementById('pixel-grid').appendChild(pixel); // Append to the new grid container
        }
    }
}

// This function will keep the grid overlay fixed
function updatePixelGridPosition() {
    const mapContainer = document.getElementById('map');
    const gridContainer = document.getElementById('pixel-grid');
    const mapRect = mapContainer.getBoundingClientRect();

    // Keep grid container synced with the map size and position
    gridContainer.style.width = `${mapRect.width}px`;
    gridContainer.style.height = `${mapRect.height}px`;
    gridContainer.style.left = `${mapRect.left}px`;
    gridContainer.style.top = `${mapRect.top}px`;
}

// Wait for the map to fully load before creating the pixel grid
map.on('load', createFixedPixelGrid);

// Update the grid and keep it "sticky" on move or zoom
map.on('moveend zoomend', function() {
    createFixedPixelGrid();
    updatePixelGridPosition(); // Update position and size after every move or zoom
});

// Trigger grid creation if the map is already loaded
if (map._loaded) {
    createFixedPixelGrid();
    updatePixelGridPosition();
}

// Load GeoJSON data
fetch('data/countries.geojson')
    .then(response => response.json())
    .then(data => {
        const geoJsonLayer = L.geoJSON(data, {
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
        });

        // Add GeoJSON layer to the map and set a high z-index
        geoJsonLayer.addTo(map);
        geoJsonLayer.setZIndex(1000); // Ensures it's above the pixel grid
    })
    .catch(error => {
        console.error('Error loading GeoJSON:', error);
    });
