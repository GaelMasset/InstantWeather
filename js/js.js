// Classe WeatherCard pour simplifier l'affichage d'informations
class WeatherCard{
    constructor(date, tempMax, tempMin, pluieProba, ensolHeures, latitude, longitude, cumulPluie, ventMoyen, ventDirection, paramWeather){
        this.date = date;
        this.tempMax = tempMax;
        this.tempMin = tempMin;
        this.pluieProba = pluieProba;
        this.ensolHeures = ensolHeures
        this.latitude = latitude;
        this.longitude = longitude;
        this.cumulPluie = cumulPluie;
        this.ventMoyen = ventMoyen;
        this.ventDirection = ventDirection;

        if((paramWeather<=32 && paramWeather>=20) || (paramWeather<=78 && paramWeather>=60) || (paramWeather>=120 && paramWeather<=142) || (paramWeather>=220 && paramWeather<=232)){
            this.toobo = "images/toobo_froid.png"
        }
        else if(paramWeather>=7){
            this.toobo="images/toobo_pluie.png"
        }
        else if(paramWeather== 0){
            this.toobo="images/toobo_plage.png"
        }
        else if(paramWeather<=6){
            this.toobo="images/toobo_soleil_d.png"
        }
        
        else{
            this.toobo = "images/toobo_golf.png"
        }
    }

}

let entreeCodePostal = document.getElementById('inputCodePostal'); // Champs d'entrée pour le code postal

let tooboImage = document.getElementById('imgToobo');

//Variables associées aux checkbox 
let latitude = document.getElementById('latitudeCheck');
let longitude = document.getElementById('longitudeCheck');
let cumulPluie = document.getElementById('cumulPCheck');
let ventMoyenne = document.getElementById('ventMoyCheck');
let ventDirection = document.getElementById('ventDirCheck');

//Variables pour les boutons
let boutonGauche = document.getElementById('boutonGauche');
let boutonDroite = document.getElementById('boutonDroite');

//Indices qui serviront pour le tableau de WeatherCard
let indice = 0;
let indiceMax; 
// Tableau pour contenir les infos sous formes de cartes
let tabWheatherCard = [];   

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

        // Affiche les informations météo de la première ville par défaut
        rechercherMeteoParCodeINSEE(villes[0].properties.citycode);

        // Si l'utilisateur change de sélection dans la liste déroulante, la météo de la nouvelle ville s'affiche
        resultsList.addEventListener('change', () => {
            let codeINSEE = resultsList.value; // Récupère le code INSEE de la ville sélectionnée
            if (codeINSEE) {
                rechercherMeteoParCodeINSEE(codeINSEE); // Recherche les informations météo de la ville sélectionnée
            }
        });
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
    let nbJours = document.getElementById('slider').value; // Champs d'entrée pour le nombre de jour 
    indiceMax = nbJours-1;              //Evite les erreurs de segmentation plus tard

    // Token de l'API Météo Concept (clé d'authentification)
    const token = '83e0e2c124fdddb66c4a732aa8839d713fd07053a743e8ec040f584c8cbed32a';

    //Vide le tableau de WeatherCard pour afficher les nouvelles infos
    tabWheatherCard.splice(0, tabWheatherCard.length);

    for(let i=0; i<nbJours; ++i){

        // URL pour obtenir les prévisions météo (températures, probabilité de pluie)
        let forecastUrl = `https://api.meteo-concept.com/api/forecast/daily/${i}?token=${token}&insee=${codeINSEE}`;

        try {

            // Appel de l'API pour obtenir les prévisions météo (ex : température, pluie)
            let forecastResponse = await fetch(forecastUrl);
            let forecastData = await forecastResponse.json();
    
            // Extraction des données utiles
            let forecast = forecastData.forecast;

            /*
            Pour éviter les doublons (mise à jours des données de l'API),
            On vérifie si on a pas déjà des données enregistrées à la même date
            */
            if(tabWheatherCard.length!=0){
                if(forecast.datetime != tabWheatherCard[tabWheatherCard.length-1].date){
                    //Crée une WeatherCard avec toutes les infos, peut importe si on les affiche
                    tabWheatherCard.push(new WeatherCard(forecast.datetime, forecast.tmax, forecast.tmin, forecast.probarain, forecast.sun_hours, forecast.latitude, forecast.longitude, forecast.rr10, forecast.gust10m, forecast.dirwind10m, forecast.weather));
                }else{
                    nbJours++;
                }
            }
            else{
                tabWheatherCard.push(new WeatherCard(forecast.datetime, forecast.tmax, forecast.tmin, forecast.probarain, forecast.sun_hours, forecast.latitude, forecast.longitude, forecast.rr10, forecast.gust10m, forecast.dirwind10m, forecast.weather));
            }
            
        } catch (error) {
            console.error(error); // Affiche l'erreur dans la console en cas de problème
            document.getElementById('texteBulle').innerHTML = "<p>Impossible de récupérer les infos météo.</p>";
        }
    }
    afficherMeteo(tabWheatherCard[0]);
}

// Fonction pour afficher les données météo dans la bulle
function afficherMeteo(WeatherCard) {

    // Mise à jour du contenu HTML de la bulle de texte avec les informations météo
    let texteBulle = document.getElementById('texteBulle');

    //On récupère le timestamp fourni par l'API et on le transforme en objet date plus malléable
    date = new Date(WeatherCard.date);
    let infosMeteo = `
        <p>Météo du ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}</p>
        <p>Température maximale : ${WeatherCard.tempMax}°C</p>
        <p>Température minimale : ${WeatherCard.tempMin}°C</p>
        <p>Probabilité de pluie : ${WeatherCard.pluieProba}%</p>
        <p>Heures d'ensoleillement : ${WeatherCard.ensolHeures} heures</p>
    `;

    //On vérifie quelles sont les checkbox cochées et on adapte les infos en fonction
    if(latitude.checked){
        infosMeteo = infosMeteo + `<p>Latitude décimale de la commune : ${WeatherCard.latitude}°</p>`;
    }
    if(longitude.checked){
        infosMeteo = infosMeteo + `<p>Longitude décimale de la commune : ${WeatherCard.longitude}°</p>`;
    }
    if(cumulPluie.checked == true){
        infosMeteo = infosMeteo + `<p>Cumul de pluie sur la journée : ${WeatherCard.cumulPluie} mm</p>`;
    }
    if(ventMoyenne.checked == true){
        infosMeteo = infosMeteo + `<p>Les rafales de vent maximales à 10m au-dessus du sol : ${WeatherCard.ventMoyen} km/h</p>`;
    }
    if(ventDirection.checked == true){
        infosMeteo = infosMeteo + `<p>La direction du vent moyen en degrés, à 10m au-dessus du sol : ${WeatherCard.ventDirection}°</p>`;
    }

    texteBulle.innerHTML = infosMeteo;

    tooboImage.src = WeatherCard.toobo;

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

// Appelle la fonction pour afficher les données météo dans la bulle de texte 
boutonDroite.addEventListener("click", () => {
    if(indice <indiceMax){
        indice = indice+1;
    }else{
        indice = 0;
    }
    afficherMeteo(tabWheatherCard[indice]);
});
boutonGauche.addEventListener("click", ()=>
// Appelle la fonction pour afficher les données météo dans la bulle de texte 
{
    if(indice >0){
        indice = indice-1;
    }else{
        indice = indiceMax;
    }
    afficherMeteo(tabWheatherCard[indice]);
});


const toggleButton = document.getElementById('toggleButton');
        const divOption = document.getElementById('divOption');

        toggleButton.addEventListener('click', () => {
            if (divOption.style.display === 'none' || divOption.style.display === '') {
                divOption.style.display = 'block'; // Affiche le div
            } else {
                divOption.style.display = 'none'; // Cache le div
            }
        });