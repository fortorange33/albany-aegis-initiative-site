```javascript
// Initialize Map
const map = L.map('map').setView([42.6526, -73.7562], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let markers = [];
let crimeData = [];

// Credentials (Replace with your own)
const BROADCASTIFY_FEED_URL = 'https://api.broadcastify.com/v1/feed/ALBANY_CITY_COLONIE_POLICE_FIRE_EMS';
const BROADCASTIFY_TOKEN = 'YOUR_PREMIUM_BROADCASTIFY_TOKEN';
const X_API_KEY = 'YOUR_X_API_KEY';
const GOOGLE_SPEECH_API_KEY = 'YOUR_GOOGLE_SPEECH_API_KEY';
const ALBANY_OPEN_DATA_API = 'https://data.albanyny.gov/api/3/action/datastore_search?resource_id=CRIME_DATA_RESOURCE_ID';
const GVA_API_URL = 'https://www.gunviolencearchive.org/query';
const FASTAPI_URL = 'http://localhost:8000/predict/tract';
const FASTAPI_TOKEN = 'YOUR_FASTAPI_JWT_TOKEN';

// Fetch Broadcastify Data
async function fetchBroadcastifyData() {
    try {
        const response = await fetch(`${BROADCASTIFY_FEED_URL}/stream?token=${BROADCASTIFY_TOKEN}`, {
            headers: { 'Accept': 'audio/mpeg' }
        });
        const audioStream = await response.body;
        const transcription = await transcribeAudio(audioStream);
        const parsed = parseTranscription(transcription);
        return parsed.map(event => ({
            id: `bc_${Date.now()}_${Math.random()}`,
            type: ['ASSAULT', 'ROBBERY', 'HOMICIDE', 'STABBING'].includes(event.type.toUpperCase()) ? 'violent' : 'property',
            subtype: event.type,
            lat: event.lat || null,
            lng: event.lng || null,
            date: new Date().toISOString().split('T')[0],
            location: event.address || 'Unknown',
            details: event.description || 'No details available',
            source: 'Broadcastify'
        }));
    } catch (error) {
        console.error('Broadcastify fetch error:', error);
        return [];
    }
}

// Transcribe Audio (Placeholder)
async function transcribeAudio(stream) {
    return 'Shooting reported at 456 Western Ave, EMS dispatched, May 17, 2025';
}

// Parse Transcription
function parseTranscription(transcription) {
    const regex = /(assault|robbery|burglary|stabbing|homicide|shooting)\s+(?:at|on)\s+([0-9A-Za-z\s]+?(?:Street|Avenue|Road|Park))/i;
    const match = transcription.match(regex);
    if (!match) return [];
    return [{ type: match[1], address: match[2], description: transcription }];
}

// Fetch Gun Violence Archive Data
async function fetchGVAData() {
    try {
        const response = await fetch(`${GVA_API_URL}?city=Albany&state=NY&date_from=2025-05-10&date_to=2025-05-17`);
        const data = await response.json();
        return data.incidents.map(incident => ({
            id: `gva_${incident.id}`,
            type: 'violent',
            subtype: incident.type || 'Shooting',
            lat: incident.latitude,
            lng: incident.longitude,
            date: incident.date.split('T')[0],
            location: incident.address || 'Unknown',
            details: `Gun violence: ${incident.killed} killed, ${incident.injured} injured`,
            source: 'Gun Violence Archive'
        }));
    } catch (error) {
        console.error('GVA fetch error:', error);
        return [];
    }
}

// Fetch X.com Local News
async function fetchXNews() {
    try {
        const response = await fetch('https://api.x.com/2/tweets/search/recent?query=from:CBS6Albany OR from:News10ABC OR from:timesunion "crime" Albany&tweet.fields=created_at,geo', {
            headers: { 'Authorization': `Bearer ${X_API_KEY}` }
        });
        const tweets = await response.json();
        return tweets.data?.map(tweet => {
            const match = tweet.text.match(/(Assault|Robbery|Burglary|Stabbing|Homicide|Shooting)/i);
            return {
                id: `x_${tweet.id}`,
                type: match && ['Assault', 'Robbery', 'Stabbing', 'Homicide', 'Shooting'].includes(match[0]) ? 'violent' : 'property',
                subtype: match ? match[0] : 'Other',
                lat: tweet.geo?.coordinates?.coordinates[1] || null,
                lng: tweet.geo?.coordinates?.coordinates[0] || null,
                date: tweet.created_at.split('T')[0],
                location: tweet.text.match(/on\s+([A-Za-z\s]+?(?:Street|Avenue|Road|Park))/i)?.[1] || 'Unknown',
                details: tweet.text,
                source: 'X.com'
            };
        }).filter(t => t.subtype !== 'Other') || [];
    } catch (error) {
        console.error('X.com fetch error:', error);
        return [];
    }
}

// Fetch Albany Open Data
async function fetchOpenData() {
    try {
        const response = await fetch(ALBANY_OPEN_DATA_API);
        const data = await response.json();
        return data.result.records.map(record => ({
            id: `od_${record._id}`,
            type: record.CRIME_TYPE === 'VIOLENT' ? 'violent' : 'property',
            subtype: record.OFFENSE,
            lat: parseFloat(record.LATITUDE),
            lng: parseFloat(record.LONGITUDE),
            date: record.DATE.split('T')[0],
            location: record.NEIGHBORHOOD || 'Unknown',
            details: record.DESCRIPTION,
            source: 'Albany Open Data'
        }));
    } catch (error) {
        console.error('Open Data fetch error:', error);
        return [];
    }
}

// Fetch Crime Risk Prediction from FastAPI
async function fetchCrimeRisk(tract_fips, forecast_horizon) {
    try {
        const response = await fetch(FASTAPI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FASTAPI_TOKEN}`
            },
            body: JSON.stringify({ tract_fips, forecast_horizon })
        });
        if (!response.ok) throw new Error('FastAPI request failed');
        const data = await response.json();
        return {
            violent_risk: data.violent_risk,
            property_risk: data.property_risk,
            top_drivers: data.top_drivers.join(', ')
        };
    } catch (error) {
        console.error('FastAPI fetch error:', error);
        return null;
    }
}

// Geocode Addresses
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Albany, NY')}`);
        const data = await response.json();
        return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Deduplicate and Validate Data
function deduplicateData(dataArrays) {
    const seen = new Map();
    return dataArrays.flat().filter(item => {
        const key = `${item.date}|${item.lat}|${item.lng}|${item.subtype}`;
        if (!item.lat || !item.lng || seen.has(key)) return false;
        seen.set(key, true);
        return true;
    }).filter(item => {
        const lat = item.lat, lng = item.lng;
        return lat >= 42.6 && lat <= 42.7 && lng >= -73.8 && lng <= -73.7;
    });
}

// Fetch All Crime Data
async function fetchCrimeData() {
    const [broadcastifyData, gvaData, xData, openData] = await Promise.all([
        fetchBroadcastifyData(),
        fetchGVAData(),
        fetchXNews(),
        fetchOpenData()
    ]);

    // Geocode non-geocoded items
    for (const item of [...broadcastifyData, ...xData, ...gvaData]) {
        if (!item.lat || !item.lng) {
            const coords = await geocodeAddress(item.location);
            if (coords) {
                item.lat = coords.lat;
                item.lng = coords.lng;
            }
        }
    }

    // Combine and deduplicate (last 7 days)
    crimeData = deduplicateData([broadcastifyData, gvaData, xData, openData.filter(d => {
        const date = new Date(d.date);
        const now = new Date();
        return (now - date) / (1000 * 60 * 60 * 24) <= 7;
    })]);

    updateDashboard();
}

// Update Dashboard
function updateDashboard() {
    document.getElementById('total-incidents').textContent = crimeData.length;
    document.getElementById('violent-crimes').textContent = crimeData.filter(c => c.type === 'violent').length;
    document.getElementById('property-crimes').textContent = crimeData.filter(c => c.type === 'property').length;
    document.getElementById('last-updated').textContent = new Date().toLocaleString();

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    crimeData.forEach(incident => {
        const color = incident.type === 'violent' ? 'red' : 'green';
        const marker = L.circleMarker([ incident.lat, incident.lng ], { color, radius: 8 }).addTo(map).bindPopup(`<b>${ incident.subtype }</b><br>Date: ${ incident.date }<br>Location: ${ incident.location }<br>${ incident.details }<br>Source: ${ incident.source }`);
        markers.push(marker);
    });

    const crimeTypes = crimeData.reduce((acc, c) => {
        acc[c.subtype] = (acc[c.subtype] || 0) + 1;
        return acc;
    }, {});
    new Chart(document.getElementById('crimeTypeChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(crimeTypes),
            datasets: [ { label: 'Incidents', data: Object.values(crimeTypes), backgroundColor: [ '#ef4444', '#22c55e', '#3b82f6' ] } ]
        }
    });

    const dates = crimeData.reduce((acc, c) => {
        acc[c.date] = (acc[c.date] || 0) + 1;
        return acc;
    }, {});
    new Chart(document.getElementById('crimeTrendChart'), {
        type: 'line',
        data: {
            labels: Object.keys(dates),
            datasets: [ { label: 'Incidents', data: Object.values(dates), borderColor: '#3b82f6' } ]
        }
    });

    const tbody = document.getElementById('incidentTable');
    tbody.innerHTML = '';
    crimeData.forEach(incident => {
        const row = `<tr><td class="p-2">${ incident.date }</td><td class="p-2">${ incident.subtype }</td><td class="p-2">${ incident.location }</td><td class="p-2">${ incident.details } (${ incident.source })</td></tr>`;
        tbody.innerHTML += row;
    });

    const neighborhoods = crimeData.reduce((acc, c) => {
        const n = c.location;
        acc[n] = acc[n] || { count: 0, population: 10000 };
        acc[n].count += 1;
        return acc;
    }, {});
    const safetyData = Object.entries(neighborhoods).map(([ n, data ]) => {
        const rate = (data.count / data.population) * 1000;
        const rating = rate < 10 ? 'A' : rate < 20 ? 'B' : rate < 30 ? 'C' : 'D';
        return { neighborhood: n, rating, rate: rate.toFixed(1) };
    });
    const safetyTbody = document.getElementById('safetyTable');
    safetyTbody.innerHTML = '';
    safetyData.forEach(data => {
        const row = `<tr><td class="p-2">${ data.neighborhood }</td><td class="p-2">${ data.rating }</td><td class="p-2">${ data.rate }</td></tr>`;
        safetyTbody.innerHTML += row;
    });
}

// Filter Map
function filterMap(type) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    const filtered = type === 'all' ? crimeData : crimeData.filter(c => c.type === type);
    filtered.forEach(incident => {
        const color = incident.type === 'violent' ? 'red' : 'green';
        const marker = L.circleMarker([ incident.lat, incident.lng ], { color, radius: 8 }).addTo(map).bindPopup(`<b>${ incident.subtype }</b><br>Date: ${ incident.date }<br>Location: ${ incident.location }<br>${ incident.details }<br>Source: ${ incident.source }`);
        markers.push(marker);
    });
}

// Filter Incidents
document.getElementById('incidentFilter').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const tbody = document.getElementById('incidentTable');
    tbody.innerHTML = '';
    crimeData.filter(c => c.subtype.toLowerCase().includes(query) || c.location.toLowerCase().includes(query)).forEach(incident => {
        const row = `<tr><td class="p-2">${ incident.date }</td><td class="p-2">${ incident.subtype }</td><td class="p-2">${ incident.location }</td><td class="p-2">${ incident.details } (${ incident.source })</td></tr>`;
        tbody.innerHTML += row;
    });
});

// Handle Crime Risk Prediction Form
document.getElementById('prediction-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const tract_fips = document.getElementById('tract_fips').value;
    const forecast_horizon = parseInt(document.getElementById('forecast_horizon').value);
    const resultDiv = document.getElementById('prediction-result');
    const violentRiskSpan = document.getElementById('violent-risk');
    const propertyRiskSpan = document.getElementById('property-risk');
    const topDriversSpan = document.getElementById('top-drivers');

    const prediction = await fetchCrimeRisk(tract_fips, forecast_horizon);
    if (prediction) {
        violentRiskSpan.textContent = prediction.violent_risk.toFixed(2);
        propertyRiskSpan.textContent = prediction.property_risk.toFixed(2);
        topDriversSpan.textContent = prediction.top_drivers;
        resultDiv.classList.remove('hidden');
    } else {
        resultDiv.classList.add('hidden');
        alert('Failed to fetch crime risk prediction. Please try again.');
    }
});

// Fetch data initially and every 2 minutes
fetchCrimeData();
setInterval(fetchCrimeData, 120000);
```