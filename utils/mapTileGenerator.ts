export interface MapTile {
  url: string;
  x: number;
  y: number;
  z: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function calculateTilesForBounds(bounds: MapBounds, zoomLevel: number): MapTile[] {
  const tiles: MapTile[] = [];

  // Convert lat/lng to tile coordinates
  const minTileX = Math.floor(lngToTileX(bounds.west, zoomLevel));
  const maxTileX = Math.floor(lngToTileX(bounds.east, zoomLevel));
  const minTileY = Math.floor(latToTileY(bounds.north, zoomLevel));
  const maxTileY = Math.floor(latToTileY(bounds.south, zoomLevel));

  for (let x = minTileX; x <= maxTileX; x++) {
    for (let y = minTileY; y <= maxTileY; y++) {
      tiles.push({
        url: `https://tile.openstreetmap.org/${zoomLevel}/${x}/${y}.png`,
        x,
        y,
        z: zoomLevel
      });
    }
  }

  return tiles;
}

function lngToTileX(lng: number, zoom: number): number {
  return (lng + 180) / 360 * Math.pow(2, zoom);
}

function latToTileY(lat: number, zoom: number): number {
  return (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
}

export function generateAudioTourMapHTML(audioStops: any[], centerLat: number, centerLng: number, gpxRoute?: { lat: number; lon: number }[], showUserLocation: boolean = false): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audio Tour Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        #map { height: 100vh; width: 100vw; }
        .audio-marker {
            background-color: #f27d42;
            color: white;
            border: 3px solid white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .audio-marker.active {
            background-color: #062c20;
            transform: scale(1.2);
        }
        .leaflet-popup-content-wrapper {
            border-radius: 8px;
            font-size: 14px;
        }
        .popup-title {
            font-weight: bold;
            color: #062c20;
            margin-bottom: 4px;
        }
        .user-location-marker div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors',
            detectRetina: true
        }).addTo(map);

        map.zoomControl.remove();

        const stops = ${JSON.stringify(audioStops)};
        const routePoints = ${JSON.stringify(gpxRoute || [])};
        const markers = [];

        // Add GPX route line if available
        if (routePoints && routePoints.length > 0) {
            const routeLine = L.polyline(routePoints.map(p => [p.lat, p.lon]), {
                color: '#f27d42',
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1
            }).addTo(map);
        }

        stops.forEach((stop, index) => {
            const marker = L.marker([stop.lat, stop.lon], {
                icon: L.divIcon({
                    className: 'audio-marker',
                    html: stop.id,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                })
            })
            .bindPopup(\`<div class="popup-title">\${stop.title}</div>\`)
            .on('click', function() {
                markers.forEach(m => m.getElement().classList.remove('active'));
                this.getElement().classList.add('active');

                window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'stopClick',
                    stopIndex: index,
                    stop: stop
                }));
            })
            .addTo(map);

            markers.push(marker);
        });

        // Fit bounds to include both markers and route
        const allPoints = [...markers];
        if (routePoints && routePoints.length > 0) {
            const routeLine = L.polyline(routePoints.map(p => [p.lat, p.lon]));
            allPoints.push(routeLine);
        }

        if (allPoints.length > 0) {
            const group = new L.featureGroup(allPoints);
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // Listen for marker activation from React Native
        window.setActiveMarker = function(index) {
          if (markers[index]) {
            markers[index].openPopup();
          }
        };

        // User location marker
        let userMarker = null;
        let userLocationEnabled = ${showUserLocation};

        function updateUserLocation(lat, lng, heading) {
          if (!userLocationEnabled) return;

          if (userMarker) {
            map.removeLayer(userMarker);
          }

          // Create compass arrow icon
          const compassIcon = L.divIcon({
            html: '<div style="transform: rotate(' + (heading || 0) + 'deg); font-size: 20px; color: #007AFF;">📍</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            className: 'user-location-marker'
          });

          userMarker = L.marker([lat, lng], { icon: compassIcon })
            .addTo(map)
            .bindPopup('Your Location');
        }

        function toggleUserLocation(enable) {
          userLocationEnabled = enable;
          if (!enable && userMarker) {
            map.removeLayer(userMarker);
            userMarker = null;
          }
        }

        // Listen for location updates from React Native
        window.updateUserLocation = updateUserLocation;
        window.toggleUserLocation = toggleUserLocation;

        // Handle messages from React Native
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.action === 'updateUserLocation') {
              updateUserLocation(data.latitude, data.longitude, data.heading);
            } else if (data.action === 'toggleUserLocation') {
              toggleUserLocation(data.enable);
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });
    </script>
</body>
</html>`;
}

export function generateMapHTML(venues: any[], bounds: MapBounds, centerLat: number, centerLng: number, showUserLocation: boolean = false): string {
  const venueMarkers = venues.map(venue => ({
    id: venue.id,
    lat: venue.latitude,
    lng: venue.longitude,
    name: venue.name,
    address: venue.address || venue.description || ''
  })).filter(v => v.lat && v.lng);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Venue Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        #map { height: 100vh; width: 100vw; }
        .custom-marker {
            color: #f27d42;
            font-size: 24px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 8px;
            font-size: 14px;
        }
        .popup-title {
            font-weight: bold;
            color: #062c20;
            margin-bottom: 4px;
        }
        .popup-address {
            color: #666;
            font-size: 12px;
        }
        .user-location-marker div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map
        const map = L.map('map').setView([${centerLat}, ${centerLng}], 14);

        // Add OpenStreetMap tiles with retina support
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors',
            detectRetina: true
        }).addTo(map);

        // Remove zoom controls
        map.zoomControl.remove();

        // Custom marker icon using FontAwesome
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<i class="fas fa-map-marker-alt"></i>',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
            popupAnchor: [0, -32]
        });

        // Add venue markers
        const venues = ${JSON.stringify(venueMarkers)};
        const markers = []; // Keep track of markers

        venues.forEach((venue, index) => {
            const marker = L.marker([venue.lat, venue.lng], { icon: customIcon })
                .bindPopup(\`
                    <div class="popup-title">\${venue.name}</div>
                    <div class="popup-address">\${venue.address}</div>
                \`)
                .on('click', function() {
                    // Send venue click data to React Native
                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'venueClick',
                        venueIndex: index,
                        venue: venue
                    }));
                })
                .addTo(map);
            markers.push(marker);
        });

        // Fit map to show all markers
        if (venues.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // User location marker
        let userMarker = null;
        let userLocationEnabled = ${showUserLocation};

        function updateUserLocation(lat, lng, heading) {
          if (!userLocationEnabled) return;

          if (userMarker) {
            map.removeLayer(userMarker);
          }

          // Create compass arrow icon
          const compassIcon = L.divIcon({
            html: '<div style="transform: rotate(' + (heading || 0) + 'deg); font-size: 20px; color: #007AFF;">📍</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            className: 'user-location-marker'
          });

          userMarker = L.marker([lat, lng], { icon: compassIcon })
            .addTo(map)
            .bindPopup('Your Location');
        }

        function toggleUserLocation(enable) {
          userLocationEnabled = enable;
          if (!enable && userMarker) {
            map.removeLayer(userMarker);
            userMarker = null;
          }
        }

        // Listen for location updates from React Native
        window.updateUserLocation = updateUserLocation;
        window.toggleUserLocation = toggleUserLocation;

        // Handle messages from React Native
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.action === 'updateUserLocation') {
              updateUserLocation(data.latitude, data.longitude, data.heading);
            } else if (data.action === 'toggleUserLocation') {
              toggleUserLocation(data.enable);
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });
    </script>
</body>
</html>`;
}