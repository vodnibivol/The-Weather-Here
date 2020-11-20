const express = require('express');
const Datastore = require('nedb');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening at port ${PORT}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.get('/api', (request, response) => {
  console.log('got a GET request');
  let data = fs.readFileSync('places.json');
  let json = JSON.parse(data);

  response.json(json);
});

app.get('/weather/:latlon', async (request, response) => {
  console.log(request.params);

  let latlon = request.params.latlon.split(',');
  let lat = latlon[0];
  let lon = latlon[1];

  const API_KEY = process.env.API_KEY;

  let weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  let weather_response = await fetch(weather_url);
  let weather_data = await weather_response.json();

  response.json(weather_data);
});

app.post('/api/:action', (request, response) => {
  console.log('got a POST request');

  let action = request.params.action;
  const filename = 'places.json';

  switch (action) {
    case 'add':
      console.log('adding to database');

      const data = request.body;

      console.log(data);

      const timestamp = Date.now();
      data.timestamp = timestamp;

      if (fs.existsSync(filename)) {
        let file = fs.readFileSync(filename);
        let json = JSON.parse(file);

        console.log(json);

        json.push(data);

        let dataString = JSON.stringify(json);
        fs.writeFileSync('places.json', dataString);
      } else {
        let arr = [];
        arr.push(data);

        console.log('arr:');
        console.log(arr);

        let dataString = JSON.stringify(arr);

        console.log('datastring:');
        console.log(dataString);
        fs.writeFileSync(filename, dataString);
      }

      response.json("added to database.");
      break;
    case 'remove':
      console.log('removing from database');

      const index = request.body.index;

      let file = fs.readFileSync(filename);
      let json = JSON.parse(file);

      json.splice(index, 1);

      let dataString = JSON.stringify(json);
      fs.writeFileSync('places.json', dataString);

      response.json("removed from database: index " + index);
      break;
  }
});
