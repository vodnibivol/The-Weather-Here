const dataContainer = document.getElementById('dataContainer');

(function createMap() {
  location_map = L.map('locMap').setView([30, -40], 1);
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tiles = L.tileLayer(tileUrl, { attribution });
  tiles.addTo(location_map);
})();

function placeMarker(lat, lon, desc = false) {
  let marker = L.marker([lat, lon]).addTo(location_map);

  if (desc) {
    marker.bindPopup(desc);
  }
}

async function getData() {
  const response = await fetch('/api');
  const data = await response.json();

  return data;
}

async function showData() {
  data = await getData();

  let entryContainer = document.createElement('div');

  data.forEach((entry) => {
    // console.log(entry);

    let { lat, lon, weather, air_quality } = entry;

    let loc = weather.name;
    let country = weather.sys.country;
    let summ = weather.weather[0].description;
    let temp_k = weather.main.temp;
    let temp = (temp_k - 273.15).toFixed(2);

    let txt = `The weather here at ${loc}, ${country} is ${summ} with a temperature of ${temp} &deg;C.`;

    // let dateString = new Date(timestamp).toDateString();

    // let locPara = document.createElement('p');
    // let anchor = document.createElement('a');
    // let datePara = document.createElement('p');

    // locPara.innerText = `location :\n${lat}\n${lon}\n`;
    // anchor.innerText = 'show';
    // anchor.setAttribute('href', '#');
    // datePara.innerText = dateString;

    // locPara.append(anchor);
    // entryContainer.append(locPara);

    placeMarker(lat, lon, txt);
  });

  dataContainer.append(entryContainer);
}

showData();
