
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

export function generateAudioTourMapHTML(stops: any[], centerLat: number, centerLng: number): string {
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
        
        const stops = ${JSON.stringify(stops)};
        const markers = [];
        
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
        
        if (stops.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
        
        window.setActiveMarker = function(index) {
            markers.forEach(m => m.getElement().classList.remove('active'));
            if (markers[index]) {
                markers[index].getElement().classList.add('active');
            }
        };
    </script>
</body>
</html>`;
}

export function generateMapHTML(venues: any[], bounds: MapBounds, centerLat: number, centerLng: number): string {
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
        });
        
        // Fit map to show all markers
        if (venues.length > 0) {
            const group = new L.featureGroup(map._layers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
        
        // Handle clicks to send data back to React Native
        window.addEventListener('message', function(event) {
            // Handle messages from React Native if needed
        });
    </script>
</body>
</html>`;
}
