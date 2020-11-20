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

async function removeEntryFromDatabase(index = 0) {
  let dict = { index: index };

  const options = {
    method: 'POST',
    body: JSON.stringify(dict),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log(dict);

  let response = await fetch('/api/remove', options);
  let file = await response.json();

  console.log('submitted data. response:');
  console.log(file);
}

async function getData() {
  const response = await fetch('/api');
  const data = await response.json();

  return data;
}

async function showData() {
  data = await getData();

  let entryContainer = document.createElement('div');
  entryContainer.classList.add('entry-container');

  let i = 1;

  data.forEach((entry) => {
    // console.log(entry);

    let { lat, lon, loc, msg } = entry;

    /* -------- create elements --------- */

    let sectionDiv = document.createElement('div');
    let locPara = document.createElement('p');
    let deleteBtn = document.createElement('img');
    let hr = document.createElement('hr');

    locPara.innerText = `${i} : ${loc}`;
    deleteBtn.setAttribute('src', '../delete.svg');

    sectionDiv.appendChild(locPara);
    sectionDiv.appendChild(deleteBtn);

    entryContainer.appendChild(sectionDiv);
    entryContainer.appendChild(hr);

    /* ------- add event listeners ------- */

    deleteBtn.addEventListener('click', (e) => {
      let target = e.target;
      let parentDiv = target.parentNode;
      let hr = parentDiv.nextSibling;

      let gParent = parentDiv.parentNode;

      let index = Array.from(gParent.children).indexOf(parentDiv) / 2;

      gParent.removeChild(parentDiv);
      gParent.removeChild(hr);

      removeEntryFromDatabase(index);
    });

    placeMarker(lat, lon, msg);

    i++;
  });

  dataContainer.appendChild(entryContainer);
}

showData();
