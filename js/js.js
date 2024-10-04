
let entreeCodePostal = document.getElementById('inputCodePostal');
entreeCodePostal.addEventListener("input", async() =>{
    if(verifFormat(entreeCodePostal)) {
        handleSearch();
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
    let results = await searchAddress(postalCode);

    let resultsList = document.getElementById('results');
    resultsList.innerHTML = ''; // Effacer les résultats précédents

    let villes = results.filter(result => result.properties.type === 'municipality');

    villes.forEach(result => {
        let listItem = document.createElement('option');
        listItem.textContent = result.properties.label;
        resultsList.appendChild(listItem);
    });

    if(villes.length > 0){
        document.getElementById('results').style.display='flex';
    } else{
        document.getElementById('results').style.display='none';
    }
}

async function verifFormat(valeur){
    if (valeur.length === 5 && /^[0-9]+$/.test(valeur)) {
        return true;
    }
}