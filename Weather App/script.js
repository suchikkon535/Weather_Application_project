// Weatherbit API Key (Get yours at https://www.weatherbit.io/api)
const API_KEY = "f29770f3f0724e1daaaefa2a8750359c"; // Replace this!

// DOM Elements (same as before)
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const unitToggle = document.getElementById("unit-toggle");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const unit = document.getElementById("unit");
const weatherDescription = document.getElementById("weather-description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const weatherIcon = document.getElementById("weather-icon");
const forecastContainer = document.getElementById("forecast-container");

// Variables
let isCelsius = true;

// Fetch Weather Data from Weatherbit
async function fetchWeather(city, units = "M") {
    try {
        // Current Weather
        const currentResponse = await fetch(
            `https://api.weatherbit.io/v2.0/current?city=${city}&units=${units}&key=${API_KEY}`
        );
        const currentData = await currentResponse.json();

        if (currentData.error) {
            alert(currentData.error);
            return;
        }

        // Forecast (16-day requires premium, so we use 5-day)
        const forecastResponse = await fetch(
            `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&days=5&units=${units}&key=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        displayWeather(currentData.data[0], forecastData.data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to fetch weather data!");
    }
}

// Display Weather (modified for Weatherbit)
function displayWeather(currentData, forecastData) {
    // Current Weather
    cityName.textContent = currentData.city_name;
    temperature.textContent = Math.round(currentData.temp);
    weatherDescription.textContent = currentData.weather.description;
    humidity.textContent = currentData.rh;
    windSpeed.textContent = Math.round(currentData.wind_spd * 3.6); // Convert m/s to km/h
    
    // Weatherbit icons use their own system
    weatherIcon.src = `https://www.weatherbit.io/static/img/icons/${currentData.weather.icon}.png`;

    // Forecast
    forecastContainer.innerHTML = "";
    
    // Skip today (index 0) since we show it in current weather
    for (let i = 1; i < Math.min(5, forecastData.length); i++) {
        const day = forecastData[i];
        const date = new Date(day.valid_date);
        const dayName = date.toLocaleDateString("en", { weekday: "short" });
        
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png" alt="Weather Icon">
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(day.max_temp)}°</span>
                <span class="min-temp">${Math.round(day.min_temp)}°</span>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    }
}

// Get Weather by Location (updated for Weatherbit)
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&units=${isCelsius ? "M" : "I"}&key=${API_KEY}`
                    );
                    const data = await response.json();
                    fetchWeather(data.data[0].city_name);
                } catch (error) {
                    console.error("Error fetching location weather:", error);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Toggle Units (°C/°F)
function toggleUnits() {
    isCelsius = !isCelsius;
    unitToggle.textContent = isCelsius ? "°C / °F" : "°F / °C";
    unit.textContent = isCelsius ? "°C" : "°F";
    const currentCity = cityName.textContent;
    if (currentCity) fetchWeather(currentCity, isCelsius ? "M" : "I");
}

// Event Listeners (same as before)
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city, isCelsius ? "M" : "I");
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city, isCelsius ? "M" : "I");
    }
});

locationBtn.addEventListener("click", getLocationWeather);
unitToggle.addEventListener("click", toggleUnits);

// Initialize with default city
fetchWeather("London", "M");