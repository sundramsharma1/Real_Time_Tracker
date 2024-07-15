const socket = io();

if (navigator.geolocation) {
    // Use watchPosition to get the current position of the device continuously.
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log("Emitting location:", { latitude, longitude });
        // Emit the latitude and longitude via a socket with "send-location". Log any errors to the console.
        socket.emit("send-location", { latitude, longitude });
    }, (error) => {
        console.log(error);
    }, {
        // Set options for high accuracy, timeout, and maximum age (caching).

        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}else{
    console.log('Geolocation is not supported by your browser');
}

// Initialize a map centered at coordinates (0, 0) with a zoom level of 16 using Leaflet. Add OpenStreetMap tiles to the map.
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data © OpenStreetMap contributors"
}).addTo(map);

// Create an empty object to hold markers.
const markers = {};

// Listen for "receive-location" events from the server.
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    // Set the map view to the new location.
    map.setView([latitude, longitude]);

    // Update the marker position or create a new marker if it doesn't exist.
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Listen for "user-disconnected" events from the server.
socket.on("user-disconnected", (id) => {
    console.log("User disconnected:", id);
    // Remove the marker if the user disconnects.
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
