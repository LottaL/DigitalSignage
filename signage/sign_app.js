'use strict';

const tiedote = document.querySelector('#tiedote'),
    ruoka = document.querySelector('#ruoka'),
    hsl= document.querySelector('#hsl'),
    saa = document.querySelector('#saa');

fetch('content.json')
.then(function(response) {
  if(response.ok) {
    console.log('response ok');
    return response.json();
  } else {
    throw new Error('Response not ok.');
  }
})
.then(function(myJson) {
  console.log(`Tuloksia ${myJson.APIs.length} kappaletta.`);
  myJson.APIs.forEach(function(e) {
    console.log(e.name, e.link);
    if (e.name === "announcement") {
      let announcement = e.link;
    }
    else if (e.name === "food") {
      let food = e.link;
    }
    else if (e.name === "hsl") {
      let hsl = e.link;
    }
    else if (e.name === "weather") {
      let weather = e.link;
    }
  });
})
.catch(function(e) {
  console.log(`Error: ${e.message}`);
});

function weatherAPI(link) {
  fetch(link)
  .then(function(response) {
    if(response.ok) {
      console.log('response ok');
      return response.json();
    } else {
      throw new Error('Response not ok.');
    }
  })
  .then(function(myJson) {
    let main = myJson.weather[0].main,
        temp = myJson.main.temp - 273.15,
        humid = myJson.main.humidity,
    visibility = myJson.visibility,
    wind = myJson.wind.speed;
    myJson.forEach(function(e) {
      console.log(e.name, e.link);
    });
  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });
}

