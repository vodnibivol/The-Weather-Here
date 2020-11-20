const submitBtn = document.getElementById('submitBtn');

let location_map;

submitBtn.addEventListener('click', geolocate);

async function addEntryToDatabase(data) {
  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let response = await fetch('/api/add', options);
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

function placeMarker(lat, lon, desc = false) {
  const icon = L.icon({
    iconUrl: 'camera.png',
    iconSize: [40, 40],
  });

  const marker = L.marker([lat, lon]);
  marker.addTo(location_map);

  location_map.setView([lat, lon], 15);

  if (desc) {
    marker.bindPopup(desc);
  }
}

async function getWeather(lat, lon) {
  let response = await fetch(`weather/${lat},${lon}`);
  let data = await response.json();

  showWeather(data);
}

function showWeather(data) {
  // console.log(data);

  let { lat, lon } = data.coord;

  let loc = data.name;
  let country = data.sys.country;
  let summ = data.weather[0].description;
  let temp_k = data.main.temp;

  let temp = (temp_k - 273.15).toFixed(2);

  let txt = `The weather here at ${loc}, ${country} is ${summ} with a temperature of ${temp} &deg;C.`;
  placeMarker(lat, lon, txt);

  let dict = {
    lat: lat,
    lon: lon,
    loc: loc,
    msg: txt,
  };

  addEntryToDatabase(dict);
}

function geolocate() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    var crd = pos.coords;

    let lat = crd.latitude;
    let lon = crd.longitude;

    // placeMarker(lat, lon);
    // location_map.setView([lat, lon], 15);

    getWeather(lat, lon);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}
