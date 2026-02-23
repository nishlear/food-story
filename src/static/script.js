function updateStatus(msg) {
    document.getElementById('status').innerText = msg;
}

function sendLocation(lat, lng, accuracy) {
    fetch('/location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            accuracy: accuracy
        })
    })
    .then(response => response.json())
    .catch((error) => console.error('Error:', error));
}

// Text-to-Speech Function
function speak(text) {
    if (!('speechSynthesis' in window)) {
        console.error("This browser does not support speech synthesis.");
        return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: Set language (default is usually system lang)
    // utterance.lang = 'en-US'; 
    
    // Log available voices to console for debugging
    const voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => v.name));

    utterance.onstart = function(event) {
        console.log('We have started uttering this speech: ' + event.utterance.text);
    }

    utterance.onerror = function(event) {
        console.error('Speech synthesis error', event);
    }
    
    window.speechSynthesis.speak(utterance);
}

// Global variable to track active watch
let watchId = null;

function get_position() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            const now = new Date();
            const timeString = now.toLocaleTimeString() + '.' + now.getMilliseconds();
            updateStatus(`Updated at ${timeString}`);
            
            document.getElementById('result').innerHTML = `
                <div class="coords">Lat: ${lat.toFixed(6)}</div>
                <div class="coords">Lng: ${lng.toFixed(6)}</div>
                <div>Accuracy: ${accuracy.toFixed(1)} meters</div>
            `;
            
            sendLocation(lat, lng, accuracy);
        },
        (error) => {
            let msg = "Error: ";
            switch(error.code) {
                case error.PERMISSION_DENIED: msg = "User denied the request Geolocation."; break;
                case error.POSITION_UNAVAILABLE: msg = "Location information is unavailable."; break;
                case error.TIMEOUT: msg = "The request to get user location timed out."; break;
                case error.UNKNOWN_ERROR: msg = "An unknown error occurred."; break;
            }
            document.getElementById('result').innerHTML = `<div class="error">${msg}</div>`;
            updateStatus(`Failed at ${new Date().toLocaleTimeString()}`);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
}

if ("geolocation" in navigator) {
    updateStatus("Requesting location access...");
    // Use setInterval to poll location every 3 seconds
    setInterval(() => {
        get_position()
    }, 3000); // 3000 milliseconds = 3 seconds
} 
else {
    document.getElementById('result').innerHTML = "Geolocation is not supported by this browser.";
}
