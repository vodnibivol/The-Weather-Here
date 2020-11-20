const submitBtn = document.getElementById('submitBtn');
const locateBtn = document.getElementById('locateBtn');

let location_map;
let lat, lon, weather, air_quality;

// submitBtn.addEventListener('click', submit);
// locateBtn.addEventListener('click', geolocate);

geolocate();

async function submit() {
  let data = { lat, lon, weather, air_quality };

  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let response = await fetch('/api', options);
  let file = await response.json();

  console.log('submitted data. response:');
  console.log(file);
}

(function createMap() {
  location_map = L.map('locMap').setView([46.027, 16.293], 7);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileUrl, { attribution });
  tiles.addTo(location_map);
})();

function placeMarker(lat, lon) {
  const icon = L.icon({
    iconUrl: 'camera.png',
    iconSize: [40, 40],
  });

  const marker = L.marker([lat, lon]);
  marker.addTo(location_map);
}

async function getWeather(lat, lon) {
  let response = await fetch(`weather/${lat},${lon}`);
  let data = await response.json();

  showWeather(data);
}

function showWeather(data) {
  const locationSpan = document.getElementById('location');
  const summarySpan = document.getElementById('summary');
  const tempSpan = document.getElementById('temperature');

  const parameterSpan = document.getElementById('aq_parameter');
  const valueSpan = document.getElementById('aq_value');
  const unitSpan = document.getElementById('aq_unit');

  console.log(data);

  weather = data.weather;
  air_quality = data.air_quality;

  let loc = weather.name;
  let country = weather.sys.country;
  let summ = weather.weather[0].description;
  let temp_k = weather.main.temp;
  let temp = (temp_k - 273.15).toFixed(2);

  try {
    locationSpan.innerText = `${loc}, ${country}`;
    summarySpan.innerText = summ;
    tempSpan.innerText = temp;

    let measurements = air_quality.results[0].measurements[0];
    let param = measurements.parameter;
    let value = measurements.value;
    let unit = measurements.unit;

    parameterSpan.innerText = param;
    valueSpan.innerText = value;
    unitSpan.innerText = unit;
  } catch (err) {
    console.log('measurement not found.');
    
    parameterSpan.innerText = "unknown particle";
    valueSpan.innerText = "unknown";
  }

  submit();
}

function geolocate() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    var crd = pos.coords;

    // console.log('Your current position is:');
    // console.log(`Latitude : ${crd.latitude}`);
    // console.log(`Longitude: ${crd.longitude}`);
    // console.log(`More or less ${crd.accuracy} meters.`);

    lat = crd.latitude;
    lon = crd.longitude;

    placeMarker(lat, lon);
    location_map.setView([lat, lon], 15);

    // locateBtn.disabled = true;
    // submitBtn.disabled = false;

    getWeather(lat, lon);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}
