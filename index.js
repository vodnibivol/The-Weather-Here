const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening at port ${PORT}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const database = new Datastore('database.db');
database.loadDatabase();

app.get('/api', (request, response) => {
  console.log('got a GET request');
  database.find({}, (err, data) => {
    if (err) {
      console.log(err);
      response.end();
      return;
    }
    response.json(data);
  });
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

  let aq_url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
  let aq_response = await fetch(aq_url);
  let aq_data = await aq_response.json();

  let data = {
    weather: weather_data,
    air_quality: aq_data,
  };

  response.json(data);
});

app.post('/api', (request, response) => {
  console.log('got a POST request');

  const data = request.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;

  database.insert(data);
  response.json(data);
});
