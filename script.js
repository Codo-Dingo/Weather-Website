const API_KEY = 'zpka_34877e5d24ef4228ae6e5737b42f6a69_ac4f3c61'; 

// -----------------------------------------
// PAGE 1: SEARCH LOGIC (index.html)
// -----------------------------------------
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');

if (searchBtn && cityInput) {
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            // Send the user to the next page, passing the city in the URL
            window.location.href = `weather.html?city=${encodeURIComponent(city)}`;
        }
    });

    // Trigger search when the user presses the "Enter" key
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });
}

// -----------------------------------------
// PAGE 2: WEATHER LOGIC (weather.html)
// -----------------------------------------
const weatherContainer = document.getElementById('weather-container');

if (weatherContainer) {
    // Extract the city name from the URL (e.g., "?city=Bhilai")
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');

    if (city) {
        fetchWeather(city);
    } else {
        weatherContainer.innerHTML = `
            <p>No city provided.</p>
            <a href="index.html" class="back-btn">Go Back</a>`;
    }
}

async function fetchWeather(cityName) {
    try {
        // API Call 1: Search for the city to get AccuWeather's unique "Location Key"
        const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${API_KEY}&q=${cityName}`;
        const locResponse = await fetch(locationUrl);
        const locData = await locResponse.json();

        // If the array is empty, the city doesn't exist in their database
        if (!locData || locData.length === 0) {
            weatherContainer.innerHTML = `
                <h2>City Not Found</h2>
                <p>We couldn't find "${cityName}".</p>
                <a href="index.html" class="back-btn">Try Again</a>`;
            return;
        }

        const locationKey = locData[0].Key;
        const exactCityName = locData[0].LocalizedName;

        // API Call 2: Use the Location Key to get current conditions (details=true gets humidity/wind)
        const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${API_KEY}&details=true`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        displayWeather(exactCityName, weatherData[0]);

    } catch (error) {
        console.error("Fetch error:", error);
        weatherContainer.innerHTML = `
            <h2>Error fetching data</h2>
            <p>Please check your internet connection or API limit (50/day max).</p>
            <a href="index.html" class="back-btn">Go Back</a>`;
    }
}

function displayWeather(city, data) {
    const temp = data.Temperature.Metric.Value;
    const condition = data.WeatherText;
    
    // Fallbacks just in case the API omits these fields
    const humidity = data.RelativeHumidity ?? '--';
    const windSpeed = data.Wind?.Speed?.Metric?.Value ?? '--';
    
    // AccuWeather icons are numbered 1-44. Their image URLs require a 2-digit format (e.g., '01', '07').
    let iconNum = data.WeatherIcon;
    let paddedIcon = iconNum < 10 ? '0' + iconNum : iconNum;
    let iconUrl = `https://developer.accuweather.com/sites/default/files/${paddedIcon}-s.png`;

    // Inject the final HTML into the card
    weatherContainer.innerHTML = `
        <h2>${city}</h2>
        <img src="${iconUrl}" alt="${condition}">
        <div class="temp">${temp}°C</div>
        <div class="condition">${condition}</div>
        
        <div class="details">
            <div>
                <span class="label">Humidity</span>
                <span>${humidity}%</span>
            </div>
            <div>
                <span class="label">Wind</span>
                <span>${windSpeed} km/h</span>
            </div>
        </div>
        <a href="index.html" class="back-btn">Search Another City</a>
    `;
}