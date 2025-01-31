document.addEventListener("DOMContentLoaded", function () {
  const themeSwitcher = document.createElement("div");
  themeSwitcher.style.position = "absolute";
  themeSwitcher.style.top = "10px";
  themeSwitcher.style.right = "10px";
  themeSwitcher.style.zIndex = "1000";
  themeSwitcher.innerHTML = `
        <button onclick="switchTheme('dracula')">Dracula</button>
        <button onclick="switchTheme('light')">Light</button>
        <button onclick="switchTheme('ocean')">Ocean</button>
        <button onclick="switchTheme('crt')">CRT</button>
    `;
  document.body.appendChild(themeSwitcher);

  function switchTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Initialize with the default theme
  switchTheme("crt");

  let selectedLayer = null; // Track the currently selected country layer

  function highlightCountry(layer) {
    // Reset the style of the previously selected country
    if (selectedLayer) {
      selectedLayer.setStyle({
        fillColor: "lightgreen", // Default fill color
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      });
    }

    // Highlight the newly selected country
    layer.setStyle({
      fillColor: "orange", // Highlight color
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
    });

    // Update the selectedLayer variable
    selectedLayer = layer;
  }

  const mapContainer = document.getElementById("map");
  mapContainer.style.width = "100vw";
  mapContainer.style.height = "100vh";

  //const map = L.map("map").setView([0, 0], 2);
  //const map = L.map("map", { zoomControl: false }).fitWorld();
  const map = L.map("map", { zoomControl: false });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors!",
  }).addTo(map);

  const canvas = document.createElement("canvas");
  canvas.id = "pixel-canvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "1000"; // Ensure the canvas is on top
  document.getElementById("map").appendChild(canvas);

  const windows = document.querySelectorAll(".window");

  const windowSpacing = 30; // Adjust spacing between windows
  let startX = 50; // Initial X position
  let startY = 50; // Initial Y position

  windows.forEach((window, index) => {
    const header = window.querySelector(".window-header");
    let isDragging = false;
    let offsetX, offsetY;
    window.style.left = `${startX + index * windowSpacing * 2}px`;
    window.style.top = `${startY + index * windowSpacing}px`;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - window.offsetLeft;
      offsetY = e.clientY - window.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        window.style.left = `${e.clientX - offsetX}px`;
        window.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Close button functionality
    const closeBtn = window.querySelector(".close-btn");
    closeBtn.addEventListener("click", () => {
      window.style.display = "none";
    });
    // Ensure windows stay within viewport bounds
    const rect = window.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      window.style.left = `${window.innerWidth - rect.width - 20}px`;
    }
    if (rect.bottom > window.innerHeight) {
      window.style.top = `${window.innerHeight - rect.height - 20}px`;
    }
  });

  function drawPixelGrid() {
    const ctx = canvas.getContext("2d");
    canvas.width = map.getSize().x;
    canvas.height = map.getSize().y;

    const pixelSize = 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 255, 0.3)";

    for (let x = 0; x < canvas.width; x += pixelSize) {
      for (let y = 0; y < canvas.height; y += pixelSize) {
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  function animateRadarEffect() {
    const ctx = canvas.getContext("2d");
    const pixelSize = 10;
    const width = canvas.width;
    const height = canvas.height;
    const totalColumns = Math.ceil(width / pixelSize);

    function animateColumn(column) {
      ctx.clearRect(0, 0, width, height);
      drawPixelGrid();

      ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // Semi-transparent green
      for (let y = 0; y < height; y += pixelSize) {
        ctx.fillRect(column * pixelSize, y, pixelSize, pixelSize);
      }

      column = (column + 1) % totalColumns;
      requestAnimationFrame(() => animateColumn(column));
    }

    animateColumn(0);
  }

  fetch("data/countries.geojson")
    .then((response) => response.json())
    .then((data) => {
      const geoJsonLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            color: "black",
            fillColor: "lightgreen",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7,
          };
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.ADMIN) {
            // Create popup content with a close button
            const popupContent = `
                    <div>
                        <span>${feature.properties.ADMIN}</span>
                    </div>
                `;

            // Bind the popup to the layer
            layer.bindPopup(popupContent, {
              closeOnClick: false,
              autoClose: false,
            });

            // Add a click event listener to the layer
            layer.on("click", (e) => {
              // Close all other popups
              map.eachLayer(function (layer) {
                if (layer.getPopup) {
                  layer.closePopup();
                }
              });

              // Open the popup for the clicked country at the clicked location
              layer.openPopup(e.latlng);

              // Highlight the clicked country
              highlightCountry(layer);

              // Update the country info window
              const countryName = feature.properties.ADMIN;
              const countryData = {
                population: "N/A",
                capital: "N/A",
                region: "N/A",
              };
              updateCountryInfo(countryName, countryData);

              // Add a log entry
              addLogEntry(`Country selected: ${countryName}`);
            });
          }
        },
      }).addTo(map);
      // Dynamically fit the map to the world while avoiding empty borders
      const bounds = geoJsonLayer.getBounds();
      const paddingOptions = {
        paddingTopLeft: [0, 50], // Adjust padding to avoid top/bottom borders
        paddingBottomRight: [0, 50],
        maxZoom: 6, // Set max zoom level to avoid excessive zoom-out
      };

      map.fitBounds(bounds, paddingOptions);
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));

  map.on("resize moveend zoomend", drawPixelGrid);
  drawPixelGrid();
  animateRadarEffect();
});

function createBlip() {
  const blip = document.createElement("div");
  blip.className = "radar-blip";
  blip.style.top = `${Math.random() * 100}%`;
  blip.style.left = `${Math.random() * 100}%`;
  document.getElementById("radar").appendChild(blip);

  // Remove blip after animation ends
  setTimeout(() => blip.remove(), 2000);
}

// Generate blips every second
setInterval(createBlip, 1000);

window.switchTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", theme);
};

function updateCountryInfo(countryName, countryData) {
  const countryInfoWindow = document.getElementById("country-info-window");
  const content = countryInfoWindow.querySelector(".window-content");

  content.innerHTML = `
        <h3>${countryName}</h3>
        <p>Population: ${countryData.population}</p>
        <p>Capital: ${countryData.capital}</p>
        <p>Region: ${countryData.region}</p>
    `;

  // Show the window if it's hidden
  countryInfoWindow.style.display = "block";
}

// Example usage
updateCountryInfo("Germany", {
  population: "83 million",
  capital: "Berlin",
  region: "Europe",
});

function addLogEntry(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString(); // Get current time
  const logsList = document.getElementById("logs-list");
  const logEntry = document.createElement("li");

  // Add a class for the log type (e.g., info, warning, error)
  logEntry.classList.add(`log-${type}`);

  // Include the timestamp and message in the log entry
  logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;

  logsList.appendChild(logEntry);

  // Auto-scroll to the latest log
  logsList.scrollTop = logsList.scrollHeight;
}

function filterLogs(type) {
  const logs = document.querySelectorAll("#logs-list li");

  logs.forEach((log) => {
    if (type === "all" || log.classList.contains(`log-${type}`)) {
      log.style.display = "block"; // Show the log
    } else {
      log.style.display = "none"; // Hide the log
    }
  });
}

// Example usage
addLogEntry("Country selected: Germany", "info");
addLogEntry("Warning: Low disk space", "warning");
addLogEntry("Error: Failed to fetch data", "error");
