// Initialize the map
var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
function createPixelGrid() {
    const pixelGrid = document.getElementById('pixel-grid');
    pixelGrid.innerHTML = '';

    const pixelSize = 10; // Size for the pixel
    const mapSize = map.getSize();

    for (let x = 0; x < mapSize.x; x += pixelSize) {
        for (let y = 0; y < mapSize.y; y += pixelSize) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.left = `${x}px`;
            pixel.style.top = `${y}px`;

            // Add hover effect to pixel and surrounding ones
            pixel.addEventListener('mouseenter', function() {
                pixel.style.backgroundColor = 'rgba(0, 0, 255, 0.7)'; // Main pixel hover effect
                highlightAdjacentPixels(x, y, pixelSize, 'rgba(0, 0, 255, 0.3)'); // Add hover effect to adjacent pixels
            });

            pixel.addEventListener('mouseleave', function() {
                pixel.style.backgroundColor = ''; // Reset main pixel
                resetAdjacentPixels(x, y, pixelSize); // Reset adjacent pixels
            });

            pixelGrid.appendChild(pixel);
        }
    }
}

// Function to highlight adjacent pixels with a lesser opacity
function highlightAdjacentPixels(x, y, pixelSize, color) {
    const adjacentPositions = [];

    // Loop to cover a 5x5 grid centered on the hovered pixel
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (i !== 0 || j !== 0) { // Exclude the center pixel itself
                adjacentPositions.push([x + i * pixelSize, y + j * pixelSize]);
            }
        }
    }

    adjacentPositions.forEach(pos => {
        const adjPixel = document.elementFromPoint(pos[0], pos[1]);
        if (adjPixel && adjPixel.classList.contains('pixel')) {
            adjPixel.style.backgroundColor = color; // Set lesser opacity for adjacent pixels
        }
    });
}

// Function to reset adjacent pixels
function resetAdjacentPixels(x, y, pixelSize) {
    highlightAdjacentPixels(x, y, pixelSize, ''); // Reset adjacent pixels by clearing the color
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
