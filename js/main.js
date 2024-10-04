// Initialize the map
var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function createPixelGrid() {
    const pixelGrid = document.getElementById('pixel-grid');
    pixelGrid.innerHTML = ''; // Clear previous grid

    const pixelSize = 10; // Define the grid size
    const mapSize = map.getSize(); // Get the size of the map in pixels

    // Create the grid
    for (let x = 0; x < mapSize.x; x += pixelSize) {
        for (let y = 0; y < mapSize.y; y += pixelSize) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.left = `${x}px`;
            pixel.style.top = `${y}px`;
            pixelGrid.appendChild(pixel);
        }
    }
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
