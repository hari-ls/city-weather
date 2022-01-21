// initiliase data
var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather";
var weatherForecastURL = "https://api.openweathermap.org/data/2.5/onecall";
var key = "c1d12307f11eff8fdbb0b0ceb4c0beda";

// add variables and operators
var city,
  lon,
  lat,
  cache = [];

// initialise cities from local storage if not null
$(document).ready(function () {
  var savedCities = JSON.parse(localStorage.getItem("saved-cities"));
  if (savedCities) {
    cache = savedCities;
  } else {
    setLocalData();
  }
  updateCitiesList();
});

// listen to search query event
$("#search-btn").click(function () {
  var input = $("#query");
  var value = $(input).val();
  if (value) {
    fetchCurrentWeather(
      `${currentWeatherURL}?q=${value}&units=metric&appid=${key}`
    );
  }
});
$("#cities").on("click", ".suggested-city", function () {
  var clicked = $(this).data("city");
  if (clicked) {
    $("#forecast-grid").html(" ");
    fetchCurrentWeather(
      `${currentWeatherURL}?q=${clicked}&units=metric&appid=${key}`
    );
  }
});

// fetch the data from the API
// get current weather, and coordinates
function fetchCurrentWeather(url) {
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        return console.error("Something went wong!", response.json());
      }
      return response.json();
    })
    .then(function (data) {
      if (data) {
        updateCities(data.name);
        setTodaysHeader(
          data.name,
          data.coord.lat,
          data.coord.lon,
          data.dt,
          data.weather[0].icon
        );
        setTodaysWeather(data.main.temp, data.wind.speed, data.main.humidity);
      }
    })
    .then(function () {
      if (lat && lon) {
        fetchWeatherForecast(
          `${weatherForecastURL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=c1d12307f11eff8fdbb0b0ceb4c0beda&units=metric`
        );
      }
    });
}
// get weather forecast
function fetchWeatherForecast(url) {
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      setTodaysUV(data.current.uvi);
      for (let i = 0; i < 5; i++) {
        setForecast(
          i + 1,
          data.daily[i].dt,
          data.daily[i].weather[0].icon,
          data.daily[i].temp.day,
          data.daily[i].wind_speed,
          data.daily[i].humidity
        );
      }
    });
}

// update the data on the document
// set required values, selected city's today header
function setTodaysHeader(name, latitude, longitude, date, icon) {
  city = name;
  lat = latitude;
  lon = longitude;
  $("#city-name").text(city);
  $("#todays-date").text(`(${convertDate(date)})`);
  $("#todays-icon").attr("src", getIcon(icon));
}
// set today's weather information
function setTodaysWeather(temperature, speed, humidity) {
  $("#todays-temp").text(`${temperature}°C`);
  $("#todays-wind").text(converSpeed(speed));
  $("#todays-humidity").text(`${humidity} %`);
}
// set uv index with color coding
function setTodaysUV(uvi) {
  var todaysUV = $("#todays-uv").text(uvi);
  // update uvi background color based on the value
  if (uvi > 0 && uvi <= 2) {
    $(todaysUV).addClass("low");
  } else if (uvi > 2 && uvi <= 5) {
    $(todaysUV).addClass("moderate");
  } else if (uvi > 5 && uvi <= 8) {
    $(todaysUV).addClass("high");
  } else if (uvi > 8 && uvi <= 11) {
    $(todaysUV).addClass("very-high");
  } else if (uvi > 11) {
    $(todaysUV).addClass("extreme");
  } else {
    $(todaysUV).addClass("none");
  }
}
// create forecast grid with information
function setForecast(day, date, icon, temperature, speed, humidity) {
  // set elements and data
  var grid = $("#forecast-grid");
  var block = $("<div>")
    .addClass("col text-white p-0 pt-1")
    .attr("data-day", day);
  var container = $("<div>").addClass("container p-3");
  var dateRow = $("<div>").addClass("row");
  var setDate = $("<h4>").text(convertDate(date));
  var iconRow = $("<div>").addClass("row");
  var setIcon = $("<img>").attr("src", getIcon(icon));
  var infoRow = $("<div>").addClass("row");
  var setTemp = $("<p>").text(`Temp: ${temperature}°C`);
  var setWind = $("<p>").text(`Wind: ${converSpeed(speed)}`);
  var setHumidity = $("<p>").text(`Humidity: ${humidity}°C`);
  // append elements
  dateRow.append(setDate);
  iconRow.append(setIcon);
  infoRow.append(setTemp, setWind, setHumidity);
  container.append(dateRow, iconRow, infoRow);
  block.append(container);
  grid.append(block);
}
// add the city to the list of suggested cities
function addCity(name) {
  var list = $("#cities");
  var item = $("<li>")
    .addClass(
      "list-group-item list-group-item-dark text-center rounded suggested-city"
    )
    .attr("data-city", name)
    .text(name);
  list.append(item);
  li = $(".suggested-city");
}

// helper functions
// convert date from unix to DD/MM/YYYY
function convertDate(d) {
  return moment.unix(d).format("DD/MM/YYYY");
}
// get icon for weahter condition
function getIcon(i) {
  return `https://openweathermap.org/img/wn/${i}.png`;
}
// convert speed from meter per second to KMPH
function converSpeed(s) {
  return `${(s * 3.6).toFixed(2)} KMPH`;
}
// update data in local storage
function setLocalData() {
  localStorage.setItem("saved-cities", JSON.stringify(cache));
}
// update cities if not already present in array and update local storage
function updateCities(c) {
  if (cache.indexOf(c) < 0) {
    cache.push(c);
    addCity(c);
    setLocalData();
  }
}
// update list of cities on the document
function updateCitiesList() {
  for (let i of cache) {
    addCity(i);
  }
}
