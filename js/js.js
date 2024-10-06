let entreeCodePostal = document.getElementById('inputCodePostal'); // Champ d'entrée pour le code postal

// Ajoute un écouteur d'événements pour récuperer l'entrée utilisateur (code postal)
entreeCodePostal.addEventListener("input", async () => {
    if (verifierFormatCodePostal(entreeCodePostal.value)) { // Vérifie si le code postal est au bon format
        await rechercherVillesParCodePostal(); // Appelle la fonction pour chercher les villes
    }
});

// Cette fonction fait une recherche d'adresse à partir du code postal.
async function rechercherVillesParCodePostal() {
    let postalCode = entreeCodePostal.value; // Récupère le code postal entré
    results = await appelerApiAdresse(postalCode); // Appelle l'API pour récupérer les villes correspondant au code postal

    let resultsList = document.getElementById('results'); // Liste déroulante pour afficher les résultats
    resultsList.innerHTML = ''; // Réinitialise la liste à chaque recherche

    // Filtre les résultats pour ne conserver que ceux de type "municipalité"
    let villes = results.filter(result => result.properties.type === 'municipality');

    // Parcourt les villes et les ajoute à la liste déroulante
    villes.forEach(result => {
        let listItem = document.createElement('option');
        listItem.textContent = result.properties.label; // Affiche le nom de la ville
        listItem.value = result.properties.citycode; // Stocke le code INSEE dans la valeur de l'option
        resultsList.appendChild(listItem);
    });

    // Si des villes sont trouvées, on affiche la liste déroulante et on lance la recherche météo pour la première ville
    if (villes.length > 0) {
        document.getElementById('results').style.display = 'flex';

        // Affiche les informations météo de la première ville par défaut
        rechercherMeteoParCodeINSEE(villes[0].properties.citycode);

        // Si l'utilisateur change de sélection dans la liste déroulante, la météo de la nouvelle ville s'affiche
        resultsList.addEventListener('change', () => {
            let codeINSEE = resultsList.value; // Récupère le code INSEE de la ville sélectionnée
            if (codeINSEE) {
                rechercherMeteoParCodeINSEE(codeINSEE); // Recherche les informations météo de la ville sélectionnée
            }
        });
    } else {
        document.getElementById('results').style.display = 'none'; // Cache la liste s'il n'y a pas de résultats
    }

    
}

// Cette fonction fait appel à l'API de l'adresse pour chercher des villes par code postal.
async function appelerApiAdresse(postalCode) {
    let url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(postalCode)}`; // URL de l'API avec le code postal
    let response = await fetch(url); // Envoie la requête à l'API
    let data = await response.json(); // Convertit la réponse en JSON
    return data.features; // Retourne les villes trouvées 
}

// Fonction de vérification du format du code postal (5 chiffres)
async function verifierFormatCodePostal(valeur) {
    return valeur.length === 5 && /^[0-9]+$/.test(valeur); // Retourne true si le format est correct, sinon false
}

// Fonction pour rechercher les informations météo à partir d'un code INSEE.
async function rechercherMeteoParCodeINSEE(codeINSEE) {
    // Token de l'API Météo Concept (clé d'authentification)
    const token = '83e0e2c124fdddb66c4a732aa8839d713fd07053a743e8ec040f584c8cbed32a';

    // URL pour obtenir les informations d'éphéméride (heures d'ensoleillement)
    const ephemerideUrl = `https://api.meteo-concept.com/api/ephemeride/0?token=${token}&insee=${codeINSEE}`;

    // URL pour obtenir les prévisions météo (températures, probabilité de pluie)
    const forecastUrl = `https://api.meteo-concept.com/api/forecast/daily/0?token=${token}&insee=${codeINSEE}`;

    try {
        // Appel de l'API pour obtenir les informations d'éphéméride (ex : heures d'ensoleillement)
        let ephemerideResponse = await fetch(ephemerideUrl);
        let ephemerideData = await ephemerideResponse.json();

        // Appel de l'API pour obtenir les prévisions météo (ex : température, pluie)
        let forecastResponse = await fetch(forecastUrl);
        let forecastData = await forecastResponse.json();

        // Extraction des données utiles
        let ephemeride = ephemerideData.ephemeride;
        let forecast = forecastData.forecast;

        // Appelle la fonction pour afficher les données météo dans la bulle de texte
        afficherMeteo(ephemeride, forecast);
    } catch (error) {
        console.error(error); // Affiche l'erreur dans la console en cas de problème
        document.getElementById('texteBulle').innerHTML = "<p>Impossible de récupérer les infos météo.</p>";
    }
}

// Fonction pour afficher les données météo dans la bulle
function afficherMeteo(ephemeride, forecast) {
    // Calcul du nombre d'heures d'ensoleillement en fonction des heures de lever et de coucher du soleil
    let heuresEnsoleillement = calculerHeuresEnsoleillement(ephemeride.sunrise, ephemeride.sunset);

    // Probabilité de pluie
    let probabilitePluie = forecast.probarain;

    // Mise à jour du contenu HTML de la bulle de texte avec les informations météo
    const texteBulle = document.getElementById('texteBulle');
    texteBulle.innerHTML = `
        <p>Météo du jour :</p>
        <p>Température maximale : ${forecast.tmax}°C</p>
        <p>Température minimale : ${forecast.tmin}°C</p>
        <p>Probabilité de pluie : ${probabilitePluie}%</p>
        <p>Heures d'ensoleillement : ${heuresEnsoleillement} heures</p>
    `;
}

// Fonction pour calculer le nombre d'heures d'ensoleillement
function calculerHeuresEnsoleillement(sunrise, sunset) {
    // Convertit les heures de lever et coucher du soleil en minutes depuis minuit
    let [sunriseHour, sunriseMinute] = sunrise.split(':').map(Number);
    let [sunsetHour, sunsetMinute] = sunset.split(':').map(Number);

    // Calcule le nombre total de minutes depuis minuit pour le lever et le coucher du soleil
    let totalMinutesSunrise = sunriseHour * 60 + sunriseMinute;
    let totalMinutesSunset = sunsetHour * 60 + sunsetMinute;

    // Calcule la différence en minutes, puis convertit en heures (avec 2 décimales)
    let totalSunlightMinutes = totalMinutesSunset - totalMinutesSunrise;
    return (totalSunlightMinutes / 60).toFixed(2); // Retourne la durée d'ensoleillement en heures
}
