'use strict';

const body = document.querySelector('body'),
    tiedote = document.querySelector('#tiedote'),
    ruoka = document.querySelector('#ruoka'),
    hsl = document.querySelector('#hsl'),
    saa = document.querySelector('#saa');

//DATE&TIME
const clock = document.createElement('div');
clock.id = 'clock';
//body.appendChild(clock);
//showtime();

function showtime() {
  let date = new Date(),
  yyyy = date.getFullYear(),
  mm = date.getMonth(),
  dd = date.getDate(),
  hh = date.getHours(),
  min = date.getMinutes();

  mm = (mm < 10) ? "0" + mm : mm;
  dd = (dd < 10) ? "0" + dd : dd;
  hh = (hh < 10) ? "0" + hh : hh;
  min = (min < 10) ? "0" + min : min;

  date = dd + "." + mm + ". " + yyyy + " - " + hh + ":" + min;
  clock.innerHTML = date;
  setTimeout(showTime, 1000)
}

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
      let bus = e.link;
    }
    else if (e.name === "weather") {
      let weather = e.link;
      weatherAPI(weather);
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
        icon = myJson.weather[0].icon,
        temp = myJson.main.temp - 273.15,
        humid = myJson.main.humidity,
        wind = myJson.wind.speed,
        windDir = myJson.wind.deg - 180,
        sunrise = myJson.sys.sunrise,
        sunset = myJson.sys.sunset,
        city = myJson.name;

    //MAIN, TEMP, CITY
    //HEADER PART
    let weatherheader = document.createElement('div');
    weatherheader.className = 'datadiv weatherheader';
    saa.appendChild(weatherheader);

    //WEATHER ICON
    let openicon = document.createElement('div');
    openicon.className = 'icon';
    openicon.style = "margin-left: 2vh; background-image: url(http://openweathermap.org/img/w/"+ icon +".png); width: 8vh; height: 8vh";
    weatherheader.appendChild(openicon);

    //TEMPERATURE
    let temperature = document.createElement('h2');
    temperature.id = 'temp';
    temperature.innerHTML = temp.toFixed(1) + ' °C';
    weatherheader.appendChild(temperature);

    //CITY NAME
    let cityname = document.createElement('h1');
    cityname.id = 'cityname';
    cityname.innerHTML = city;
    weatherheader.appendChild(cityname);

    //WIND
    //WIND DIRECTION CONTAINER
    let windcont = document.createElement('div');
    windcont.className = 'datadiv windcont';
    saa.appendChild(windcont);

    //WIND DIRECTION COMPASS
    let compass = document.createElement('div');
    compass.className = 'compass icon';
    compass.style.transform = 'rotate(' + windDir + 'deg)';
    windcont.appendChild(compass);
    let tilt;
    if (windDir < 0) {
      tilt = Math.abs(windDir);
    } else {
      tilt = -windDir;
    }
    compass.innerHTML = '<div id="windspeed" style="transform: rotate(' + tilt + 'deg)">' + wind + '</div>';

    //WIND SPEED TEXT
    let windspd = document.createElement('h3');
    windspd.id = 'windtxt';
    windspd.innerHTML = wind + 'm/s';
    windcont.appendChild(windspd);

    //HUMIDITY
    //HUMIDITYCONTAINER
    let humidcont = document.createElement('div');
    humidcont.className = 'datadiv humidcont';
    saa.appendChild(humidcont);

    //HUMIDITY ICON
    let dropicon = document.createElement('div');
    dropicon.className = 'icon';
    dropicon.style = "background-image: url(img/humid.png);";
    humidcont.appendChild(dropicon);

    //HUMIDITY TEXT
    let humidity = document.createElement('h3');
    humidity.id = 'humidity';
    humidity.innerHTML = humid + '%';
    humidcont.appendChild(humidity);

    //SUN THINGS
    //SUNCONTAINERS
    let sunrisecont = document.createElement('div');
    sunrisecont.className = 'datadiv suncont';
    saa.appendChild(sunrisecont);

    let sunsetcont = document.createElement('div');
    sunsetcont.className = 'datadiv suncont';
    saa.appendChild(sunsetcont);

    //SUNRISE
    let sunupicon = document.createElement('div');
    sunupicon.className = 'icon';
    sunupicon.style.backgroundImage = 'url(img/sunrise.png)';
    sunrisecont.appendChild(sunupicon);

    let sunrisetime = document.createElement('h3');
    sunrisetime.id = 'sunrise';
    sunrisetime.innerHTML = timestamp(sunrise);
    sunrisecont.appendChild(sunrisetime);

    //SUNSET
    let sundownicon = document.createElement('div');
    sundownicon.className = 'icon';
    sundownicon.style.backgroundImage = 'url(img/sunset.png)';
    sunsetcont.appendChild(sundownicon);

    let sunsettime = document.createElement('h3');
    sunsettime.id = 'sunset';
    sunsettime.innerHTML = timestamp(sunset);
    sunsetcont.appendChild(sunsettime);


    //UNIX TIME TO HUMAN TIME
    function timestamp(unix) { //BORROWED FROM STACKOVERFLOW
      // Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
      let date = new Date(unix*1000);
// Hours part from the timestamp
      let hours = date.getHours();
// Minutes part from the timestamp
      let minutes = "0" + date.getMinutes();
// Seconds part from the timestamp
      let seconds = "0" + date.getSeconds();
// Will display time in 10:30:23 format
      let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      return formattedTime;
    }
  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });

}

