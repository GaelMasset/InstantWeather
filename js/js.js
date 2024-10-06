let results;
let entreeCodePostal = document.getElementById('inputCodePostal');
entreeCodePostal.addEventListener("input", async() =>{
    if(verifFormat(entreeCodePostal)) {
        results = handleSearch();
    }
});

async function searchAddress(postalCode) {
    let url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(postalCode)}`;
    
    let response = await fetch(url);
    let data = await response.json();
    return data.features;
}

async function handleSearch() {
    let postalCode = entreeCodePostal.value; // Le code postal à tester
    results = await searchAddress(postalCode);

    let resultsList = document.getElementById('results');
    resultsList.innerHTML = ''; // Effacer les résultats précédents

    let villes = results.filter(result => result.properties.type === 'municipality');

    villes.forEach(result => {
        let listItem = document.createElement('option');
        listItem.textContent = result.properties.label;
        listItem.value = result.properties.citycode; // Assigner le code INSEE à la valeur de l'option
        resultsList.appendChild(listItem);
    });

    if (villes.length > 0) {
        document.getElementById('results').style.display = 'flex';
    } else {
        document.getElementById('results').style.display = 'none';
    }

    // Écouter l'événement 'change' sur le select pour déclencher la recherche météo
    resultsList.addEventListener('change', () => {
        let codeINSEE = resultsList.value; // Récupérer le code INSEE sélectionné
        if (codeINSEE) {
            RechercheInfMeteo(codeINSEE); // Appeler la fonction pour rechercher la météo
        }
    });

    return results;
}

//Fonction qui vérifie le format du code Postal
async function verifFormat(valeur){
    if (valeur.length === 5 && /^[0-9]+$/.test(valeur)) {
        return true;
    }
}

async function RechercheInfMeteo(codeINSEE) {
    const token = '83e0e2c124fdddb66c4a732aa8839d713fd07053a743e8ec040f584c8cbed32a';
    
    // URL pour l'éphéméride (lever/coucher de soleil)
    const ephemerideUrl = `https://api.meteo-concept.com/api/ephemeride/0?token=${token}&insee=${codeINSEE}`;

    // URL pour les prévisions météo (inclut température et probabilité de pluie)
    const forecastUrl = `https://api.meteo-concept.com/api/forecast/daily/0?token=${token}&insee=${codeINSEE}`;

    try {
        // Requête pour l'éphéméride (ensoleillement, lever/coucher du soleil)
        let ephemerideResponse = await fetch(ephemerideUrl);
        let ephemerideData = await ephemerideResponse.json();

        // Requête pour les prévisions météo (températures, probabilité de pluie)
        let forecastResponse = await fetch(forecastUrl);
        let forecastData = await forecastResponse.json();

        // Extraire les données pour l'affichage
        const ephemeride = ephemerideData.ephemeride;
        const forecast = forecastData.forecast;

        // Afficher les données météo dans la bulle
        afficherMeteo(ephemeride, forecast);
    } catch (error) {
        console.error(error);
        document.getElementById('texteBulle').innerHTML = "<p>Impossible de récupérer les infos météo.</p>";
    }
}

// Fonction pour afficher les données météo
function afficherMeteo(ephemeride, forecast) {
    // Calcul de la durée d'ensoleillement en heures (ensoleillement entre lever et coucher du soleil)
    let heuresEnsoleillement = calculateSunlightHours(ephemeride.sunrise, ephemeride.sunset);

    // Probabilité de pluie (en pourcentage)
    let probabilitePluie = forecast.probarain;  // probabilité de pluie pour la journée

    const texteBulle = document.getElementById('texteBulle');
    texteBulle.innerHTML = `
        <p>Météo du jour :</p>
        <p>Température maximale : ${forecast.tmax}°C</p>
        <p>Température minimale : ${forecast.tmin}°C</p>
        <p>Probabilité de pluie : ${probabilitePluie}%</p>
        <p>Heures d'ensoleillement : ${heuresEnsoleillement} heures</p>
        <p>Lever du soleil : ${ephemeride.sunrise}</p>
        <p>Coucher du soleil : ${ephemeride.sunset}</p>
    `;
}

// Fonction pour calculer le nombre d'heures d'ensoleillement
function calculateSunlightHours(sunrise, sunset) {
    let [sunriseHour, sunriseMinute] = sunrise.split(':').map(Number);
    let [sunsetHour, sunsetMinute] = sunset.split(':').map(Number);

    let totalMinutesSunrise = sunriseHour * 60 + sunriseMinute;
    let totalMinutesSunset = sunsetHour * 60 + sunsetMinute;

    let totalSunlightMinutes = totalMinutesSunset - totalMinutesSunrise;
    return (totalSunlightMinutes / 60).toFixed(2);  // Retourne la durée en heures avec 2 décimales
}



