// Initialize the map
var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function createPixelGrid() {
    const pixelGrid = document.getElementById('pixel-grid');
    pixelGrid.innerHTML = '';

    const pixelSize = 10; // Pixel size for the grid
    const mapSize = map.getSize();

    for (let x = 0; x < mapSize.x; x += pixelSize) {
        for (let y = 0; y < mapSize.y; y += pixelSize) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.left = `${x}px`;
            pixel.style.top = `${y}px`;
            pixel.dataset.x = x;
            pixel.dataset.y = y;
            
            // Hover event listener
            pixel.addEventListener('mouseenter', function() {
                highlightAdjacentPixels(this);
            });

            pixel.addEventListener('mouseleave', function() {
                removeHighlightAdjacentPixels(this);
            });

            pixelGrid.appendChild(pixel);
        }
    }
}

// Function to highlight the current pixel and its neighbors
function highlightAdjacentPixels(pixel) {
    const x = parseInt(pixel.dataset.x);
    const y = parseInt(pixel.dataset.y);
    const pixelSize = 10;

    // Get current and adjacent pixels (8 directions: top, bottom, left, right, and corners)
    const positions = [
        { x: x, y: y },                 // Current pixel
        { x: x - pixelSize, y: y },      // Left
        { x: x + pixelSize, y: y },      // Right
        { x: x, y: y - pixelSize },      // Top
        { x: x, y: y + pixelSize },      // Bottom
        { x: x - pixelSize, y: y - pixelSize }, // Top-left
        { x: x + pixelSize, y: y - pixelSize }, // Top-right
        { x: x - pixelSize, y: y + pixelSize }, // Bottom-left
        { x: x + pixelSize, y: y + pixelSize }  // Bottom-right
    ];

    // Loop through the positions and apply hover effect
    positions.forEach(position => {
        const adjacentPixel = document.querySelector(`.pixel[data-x="${position.x}"][data-y="${position.y}"]`);
        if (adjacentPixel) {
            adjacentPixel.classList.add('hovered');
        }
    });
}

// Function to remove the hover effect from the current and adjacent pixels
function removeHighlightAdjacentPixels(pixel) {
    const x = parseInt(pixel.dataset.x);
    const y = parseInt(pixel.dataset.y);
    const pixelSize = 10;

    const positions = [
        { x: x, y: y },
        { x: x - pixelSize, y: y },
        { x: x + pixelSize, y: y },
        { x: x, y: y - pixelSize },
        { x: x, y: y + pixelSize },
        { x: x - pixelSize, y: y - pixelSize },
        { x: x + pixelSize, y: y - pixelSize },
        { x: x - pixelSize, y: y + pixelSize },
        { x: x + pixelSize, y: y + pixelSize }
    ];

    // Loop through the positions and remove the hover effect
    positions.forEach(position => {
        const adjacentPixel = document.querySelector(`.pixel[data-x="${position.x}"][data-y="${position.y}"]`);
        if (adjacentPixel) {
            adjacentPixel.classList.remove('hovered');
        }
    });
}

createPixelGrid();
map.on('resize moveend zoomend', createPixelGrid);

// Load GeoJSON data and display country boundaries
fetch('data/countries.geojson')  // Check if the path is correct
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
                    layer.bindPopup(feature.properties.ADMIN, { closeOnClick: false, autoClose: false });
                }
            }
        }).addTo(map);

        // Handle map clicks to open popups
        map.on('click', function(e) {
            let popupOpened = false;
            geoJsonLayer.eachLayer(function(layer) {
                if (!popupOpened && layer.getBounds && layer.getBounds().contains(e.latlng)) {
                    layer.openPopup(e.latlng);
                    popupOpened = true; // Ensure only one popup opens
                }
            });
        });
    })
    .catch(error => {
        console.error('Error loading GeoJSON:', error);
    });

// Handle clicks on the pixel grid
document.getElementById('pixel-grid').addEventListener('click', function(e) {
    const mapPoint = map.containerPointToLatLng([e.clientX, e.clientY]);
    
    // Trigger a map click event at the grid click location
    map.fire('click', {
        latlng: mapPoint,
        layerPoint: map.latLngToLayerPoint(mapPoint),
        containerPoint: map.latLngToContainerPoint(mapPoint)
    });
});
