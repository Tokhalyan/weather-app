// Global variables with query selectors
const cityInputEl = document.querySelector("#city-search-input");
const cityFormEl = document.querySelector("#city-form");
const cityContainerEl = document.querySelector("#city-container");
const currentDateEl = document.querySelector("#current-date");
const fiveDayEl = document.querySelector("fiveDayForecastContainer");
const forecastEls = document.querySelectorAll(".forecast");
const displayEl = document.getElementById("display");
const currentUVEl = document.getElementById("UV-index");

// api key for using 
const apiKey = "5a60081ec2c71a1391cbafc0e63f0ec9";

// getting current date with moment JS, format - MM/DD/YYYY
const currentDate = moment().format('L');
currentDateEl.textContent = `(${currentDate})`;

// Getting city name from user input
function getCityName (event) {
    // prevent page from refreshing
    event.preventDefault();

    displayEl.classList.add("d-none");

    // get value from input element
    let cityName = cityInputEl.value.trim();

    if (cityName) {
        document.querySelector("#city").textContent = cityName.toUpperCase();
        getCityInfo(cityName);

    } else {
        alert("Please enter city name");
    }
};

// Receiving city name from getCityName function and getting weather information for the city
function getCityInfo(cityInfo) {
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInfo}&appid=${apiKey}&units=imperial`;
    fetch(apiUrl)
    .then(async function(response) {
        if(response.ok) {
            return response.json()    
            .then(function(data) {
                displayEl.classList.remove("d-none");
                let icon = data.weather[0].icon;
                let iconUrl = `http://openweathermap.org/img/w/${icon}.png`;
                document.querySelector("#weather-icon").setAttribute("src", iconUrl);
                
                let currentTemp = data.main.temp;
                document.querySelector("#temp").textContent = currentTemp + " °F";
                
                let currentWindSpeed = data.wind.speed;
                document.querySelector("#wind").textContent = currentWindSpeed + " MPH";
        
                let currentHumidity = data.main.humidity;
                document.querySelector("#humidity").textContent = currentHumidity + " %";

                // get coordinates for UV index
                let lat = data.coord.lat;
                let lon = data.coord.lon;

                let UVIndexUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
                fetch(UVIndexUrl)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        // When UV Index is good, shows green, when ok shows yellow, when bad shows red
                        if (data.current.uvi < 4 ) {
                            currentUVEl.setAttribute("class", "badge badge-success");
                        }
                        else if (data.current.uvi < 8) {
                            currentUVEl.setAttribute("class", "badge badge-warning");
                        }
                        else {
                            currentUVEl.setAttribute("class", "badge badge-danger");
                        }
                        currentUVEl.innerHTML = data.current.uvi;
                    })

                saveSearchHistory()
                fiveDayForecast(cityInfo);
            })
        } else {
            alert("Error: " + response.statusText);
        }
    }
    )

    .catch(function(error) {
        alert("Unable to connect to openweathermap.org");
    })
}

// using local storage to save user's inputs 
function saveSearchHistory() {
    if(cityInputEl.value) {

    let item = cityInputEl.value.toUpperCase();
    if(!localStorage.getItem("city")) {
        localStorage.setItem("city", "[]");
    }

    let oldData = JSON.parse(localStorage.getItem("city"));
    
    if(!oldData.includes(item)) {
        oldData.push(item);
    }
    localStorage.setItem("city", JSON.stringify(oldData));

    showSearchHistory();
    }
}

// getting information from local storage to show search logs on the page
function showSearchHistory() {
    if(localStorage.getItem("city")) {
        let borderTop = document.createElement("div");
        borderTop.classList = "border-top border-dark";

        cityContainerEl.appendChild(borderTop);
        cityContainerEl.innerHTML = "";
        
        let storageCityName = JSON.parse(localStorage.getItem("city"));
        // using revers method to print users last input info on top of the list
        storageCityName.reverse();
        

        for(let i = 0; i < storageCityName.length; i++) {
            let historyLinkEl = document.createElement("a");
            historyLinkEl.classList = "btn btn-secondary w-100 mt-3 text-white";
            historyLinkEl.textContent = storageCityName[i];
            cityContainerEl.appendChild(historyLinkEl);
            historyLinkEl.addEventListener("click", function() {
                let passingName = storageCityName[i];
                getCityInfo(passingName);
                document.getElementById("city").textContent = passingName.toUpperCase();
                return
            })
            
            // search logs only show last 8 inputs, when storage length is bigger than 8 it remove's the last value from the storage
            if(storageCityName.length > 8) {
                storageCityName.pop();
            }
        }
        cityInputEl.value = "";
    }
}

// receiving city name from getCityName function and showing 5 day forecast 
function fiveDayForecast(fiveDayCity) {
    let forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${fiveDayCity}&appid=${apiKey}&units=imperial`;
        fetch(forecastQueryURL)
            .then(function (response) {
                return response.json()
            })
            .then (function(data) {
                //  Parse response to display forecast for next 5 days
                for (let i = 0; i < forecastEls.length; i++) {
                    forecastEls[i].innerHTML = "";
                    const forecastIndex = i * 8 + 4;
                    const forecastDate = new Date(data.list[forecastIndex].dt * 1000);
                    const forecastDay = forecastDate.getDate();
                    const forecastMonth = forecastDate.getMonth() + 1;
                    const forecastYear = forecastDate.getFullYear();
                    const forecastDateEl = document.createElement("p");
                    forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                    forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                    forecastEls[i].append(forecastDateEl);

                    // Icon for current weather
                    const forecastWeatherEl = document.createElement("img");
                    forecastWeatherEl.setAttribute("src", `https://openweathermap.org/img/wn/${data.list[forecastIndex].weather[0].icon}@2x.png`);
                    forecastEls[i].append(forecastWeatherEl);

                    const forecastTempEl = document.createElement("p");
                    forecastTempEl.innerHTML = `Temp: ${data.list[forecastIndex].main.temp} °F`;
                    forecastEls[i].append(forecastTempEl);
                    
                    const forecastHumidityEl = document.createElement("p");
                    forecastHumidityEl.innerHTML = `Humidity: ${data.list[forecastIndex].main.humidity} %`;
                    forecastEls[i].append(forecastHumidityEl);
                }
            })
}

// calling getCityName function when user pushes submit button 
cityFormEl.addEventListener("submit", getCityName);

showSearchHistory()