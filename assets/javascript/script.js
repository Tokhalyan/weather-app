const cityInputEl = document.querySelector("#city-search-input");
const cityFormEl = document.querySelector("#city-form");
const cityContainerEl = document.querySelector("#city-container");
const currentDateEl = document.querySelector("#current-date");
const apiKey = "5a60081ec2c71a1391cbafc0e63f0ec9";

const currentDate = moment().format('L');
currentDateEl.textContent = `(${currentDate})`;

function getCityName (event) {
    // prevent page from refreshing
    event.preventDefault();

    // get value from input element
    let cityName = cityInputEl.value.trim();

    if (cityName) {
        document.querySelector("#city").textContent = cityName;
        getCityInfo(cityName);

        // clear search input
            cityInputEl.value = "";
    } else {
        alert("Please enter city name");
    }
};

function getCityInfo(cityInfo) {
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInfo}&appid=${apiKey}&units=imperial`;
    fetch(apiUrl)
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        let icon = data.weather[0].icon;
        let iconUrl = `http://openweathermap.org/img/w/${icon}.png`;
        document.querySelector("#weather-icon").setAttribute("src", iconUrl);

        let currentTemp = data.main.temp;
        document.querySelector("#temp").textContent = " " + currentTemp + " °F";

        let currentWindSpeed = data.wind.speed;
        document.querySelector("#wind").textContent = " " + currentWindSpeed + " MPH";

        let currentHumidity = data.main.humidity;
        document.querySelector("#humidity").textContent = " " + currentHumidity + " %";
    })
    
}

function saveSearchHistory() {
    let newData = cityInputEl.value;
    if(localStorage.getItem("city") == null) {
        localStorage.setItem("city", "[]");
    }

    let oldData = JSON.parse(localStorage.getItem("city"));
    oldData.push(newData);

    localStorage.setItem("city", JSON.stringify(oldData));
}

function showSearchHistory() {
    if(localStorage.getItem("city") != null) {
        let borderTop = document.createElement("div");
        borderTop.classList = "border-top border-dark";

        cityContainerEl.appendChild(borderTop);
        let storageCityName = JSON.parse(localStorage.getItem("city"));
        storageCityName.reverse();

        for(let i = 0; i < storageCityName.length; i++) {
            let historyLinkEl = document.createElement("a");
            historyLinkEl.classList = "btn btn-secondary w-100 mt-3 text-white";
            historyLinkEl.addEventListener("click", function() {
                console.log(historyLinkEl.value);
            })
            historyLinkEl.textContent = storageCityName[i];
            cityContainerEl.appendChild(historyLinkEl);
            
            if(storageCityName.length > 8) {
                storageCityName.pop();
            }
        }
    }
}
cityFormEl.addEventListener("submit", getCityName);
showSearchHistory()
// var a = [];
// a.push(JSON.parse(localStorage.getItem('session')));
// localStorage.setItem('session', JSON.stringify(a));