'use strict';

const body = document.querySelector('body'),
    tiedote = document.querySelector('#tiedote'),
    ruoka = document.querySelector('#ruoka'),
    hsl = document.querySelector('#hsl'),
    saa = document.querySelector('#saa'),
    timetable = document.querySelector('#timetable');
let campus = 'leiritiestop',
    Arabia = 16364,
    Myyrmaki = 16365,
    Myllypuro = 35449,
    VanhaViertotie = 16448;
let stopArray = [];

//DATE&TIME
const clock = document.createElement('div');
clock.id = 'clock';
body.appendChild(clock);

function showtime() {
  let date = new Date(),
  yyyy = date.getFullYear(),
  mm = date.getMonth()+1,
  dd = date.getDate(),
  hh = date.getHours(),
  min = date.getMinutes();

  mm = (mm < 10) ? "0" + mm : mm;
  dd = (dd < 10) ? "0" + dd : dd;
  hh = (hh < 10) ? "0" + hh : hh;
  min = (min < 10) ? "0" + min : min;

  date = dd + "." + mm + "." + yyyy + " - " + hh + ":" + min;
  clock.innerHTML = date;
}
window.onload = function setup() {
  showtime();
  weather();
  buses();
  sodexo(Myyrmaki);
  setInterval(sodexo(Myyrmaki), 3600000);
  setInterval(showtime, 60000);
  setInterval(weather, 3600000);
  setInterval(buses, 60000);
};



function buses() {
  fetch('content.json')
  .then(function(response) {
    if(response.ok) {
      //console.log('hsl content.json response ok');
      return response.json();
    } else {
      throw new Error('Response not ok.');
    }
  })
  .then(function(myJson) {
    myJson.APIs.forEach(function(e) {
      if (e.name === "hsl") {
        hslAPI(e.link);
      }
    });
  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });
}

function hslAPI(link) {
  fetch(campus + '.graphql')
  .then(function(response) {
    if(response.ok) {
      //console.log('HSL API query response ok');
      return response.text();
    } else {
      throw new Error('Response not ok.');
    }
  })
  .then(function(textponse) {
    fetch(link, {method: "POST", // *GET, POST, PUT, DELETE, etc.
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/graphql",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: textponse // body data type must match "Content-Type" header
    })
    .then(function(response) {
      if(response.ok) {
        //console.log('HSL response ok');
        return response.json();
      } else {
        throw new Error('Response not ok.');
      }
    })
    .then(function(myJson) {
      //console.log(myJson);
      stopArray = [];
      let results = myJson.data.stopsByRadius.edges;
      results.forEach(a => {
        stopArray.push(a.node.stop.gtfsId);
        //fetchTimetable(a, link);
      });
      fetchTimetable(stopArray);

    })
    .catch(function(e) {
      console.log(`Error: ${e.message}`);
    });
  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });
}

function fetchTimetable(array) {
  timetable.innerHTML = '';
  let busesByTime = [],
  promises = [];
 array.forEach(a => {
   let query = "{\n" +
       "  stop(id: \"" + a + "\") {\n" +
       "    name\n" +
       "      stoptimesWithoutPatterns {\n" +
       "      scheduledArrival\n" +
       "      realtimeArrival\n" +
       "      realtime\n" +
       "      serviceDay\n" +
       "      headsign\n" +
       "         trip {routeShortName}" +
       "    }\n" +
       "  }  \n" +
       "}";
   promises.push(
     fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
       method: "POST", // *GET, POST, PUT, DELETE, etc.
       cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
       headers: {
         "Content-Type": "application/graphql",
         // "Content-Type": "application/x-www-form-urlencoded",
       },
       redirect: "follow", // manual, *follow, error
       referrer: "no-referrer", // no-referrer, *client
       body: query // body data type must match "Content-Type" header
     }).then(function(response) {
       if (response.ok) {
         //console.log('long AF fetch tail is ok');
         return response.json();
       } else {
         throw new Error('Response not ok.');
       }
     }).then(function(myJson) {
       //console.log(myJson);
       let name = myJson.data.stop.name,
           data = document.createElement('div');
       data.innerText = name;
       //timetable.appendChild(data);
       let buses = myJson.data.stop.stoptimesWithoutPatterns;
       buses.forEach(a => {
         a.stopname = name;
         //console.log(a.stopname);
         busesByTime.push(a);
       });
     }).catch(function(e) {
       console.log(`Error: ${e.message}`);
     })
   )
 });
 //console.log(promises);
  Promise.all(promises).then(() => {
    //console.log(busesByTime);

    busesByTime.sort(function(a, b) {
      return a.serviceDay - b.serviceDay || a.realtimeArrival - b.realtimeArrival;
    });
    console.log(busesByTime);

    function normaltime(seconds) {
      let h = Math.floor(seconds/3600),
          m = Math.floor(seconds%3600 / 60);
      h = (h < 10) ? "0" + h : h;
      m = (m < 10) ? "0" + m : m;
      return h + ':' + m;
    }

    let col1 = document.createElement('div'),
        col2 = document.createElement('div'),
        bus = document.createElement('p'),
        time = document.createElement('p'),
        header = document.createElement('p'),
        stop = document.createElement('p');
    bus.innerHTML = "linja";
    time.innerHTML = "lähtöaika";
    header.innerHTML = "reitti";
    stop.innerHTML = "pysäkki";

    col1.className = 'col';
    col2.className = 'col';
    timetable.appendChild(col1);
    nameThem(col1);
    timetable.appendChild(col2);
    nameThem(col2);

    function nameThem(div) {
      let columns = ["linja", "reitti", "pysäkki", "lähtöaika"];
      columns.forEach(a => {
        let p = document.createElement('p');
        p.innerHTML = a;
        p.className = "title";
        div.appendChild(p);
      })
    }

    for (let i = 0; i < 12; i++) {
      let a = busesByTime[i];
      let bus = document.createElement('p'),
          time = document.createElement('p'),
          header = document.createElement('p'),
          stop = document.createElement('p'),
          num = a.trip.routeShortName,
          head = a.headsign,
          arrive = normaltime(a.realtimeArrival),
          stopname = a.stopname;
      bus.style.fontWeight = "bold";
      header.style.fontSize = "1.6vh";
      let midnight = a.serviceDay,
          leavetime = a.realtimeArrival,
          now = Math.floor(Date.now()/1000);
      let minsTilDep = Math.floor(Math.abs((now-(midnight+leavetime))/60));
      if (minsTilDep <= 10) {
        arrive = minsTilDep + ' min';
        if (!a.realtime) {
          arrive = '~' + minsTilDep + ' min';
        }
      } else if (!a.realtime) {
        arrive = '~' + normaltime(a.scheduledArrival);
      }

      if (head === null) {
        head = "[reitti ei saatavilla]";
      }
      if (stopname.length >= 10) {
        stopname = stopname.substring(0, 9);
      }
      bus.innerHTML = num;
      time.innerHTML = arrive;
      header.innerHTML = head;
      stop.innerHTML = stopname;
      if (i > 5) {
        col2.appendChild(bus);
        col2.appendChild(header);
        col2.appendChild(stop);
        col2.appendChild(time);
      } else {
        col1.appendChild(bus);
        col1.appendChild(header);
        col1.appendChild(stop);
        col1.appendChild(time);
      }
    }
  })



}

function weather() {
  fetch('content.json')
  .then(function(response) {
    if(response.ok) {
      //console.log('weather url response ok');
      return response.json();
    } else {
      throw new Error('Response not ok.');
    }
  })
  .then(function(myJson) {
    myJson.APIs.forEach(function(e) {
      if (e.name === "weather") {
        weatherAPI(e.link);
      }
    });
  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });
}

function weatherAPI(link) {
  fetch(link)
  .then(function(response) {
    if(response.ok) {
      //console.log('weatherAPI response ok');
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
    //test();
    saa.innerHTML = "";
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



  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });
}

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

function sodexo(campuscode) {
  fetch('content.json')
  .then(function(response) {
    if(response.ok) {
      //console.log('hsl content.json response ok');
      return response.json();
    } else {
      throw new Error('Response not ok.');
    }
  })
  .then(function(myJson) {
    myJson.APIs.forEach(function(e) {
      if (e.name === "food") {
        let day = new Date(),
            year = day.getFullYear(),
            month = day.getMonth(),
            dayn = day.getDate();
        month = (month < 10) ? "0" + month : month;
        dayn = (dayn < 10) ? "0" + dayn : dayn;
        let addedData = campuscode + '/' + year + '/' + month + '/' + dayn + '/fi',
            fullURL = e.link + addedData;
        console.log(fullURL);
        //CALL NEXT FUNCTION
        menu(fullURL);
      }
    });
  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });
}

function menu(url) {
  fetch("https://cors-anywhere.herokuapp.com/" + url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // "Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    //body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
  .then(function(response) {
    if(response.ok) {
      //console.log('hsl content.json response ok');
      return response.json();
    } else {
      console.log(response);
      throw new Error('Response not ok.');
    }
  })
  .then(function(myJson) {
    console.log(myJson);
  })
  .catch(function(e) {
    console.log(`Error: ${e.message}`);
  });
}

function test() {
  console.log('test');
}
