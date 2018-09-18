
// Fonction qui vérifie que la clé d'API est bien présente
function isApiKeyThere() {
    return (config.apiKey !== undefined && config.apiKey.length > 0);
}


// Fonction qui affiche l'erreur qu'on lui transmet
function createError(message) {
    // On retrouve l'élément contenant les erreurs.
    var errorContainer = document.querySelector('.errors');

    // On crée un nouvel élément, on lui attribue une classe et on colle le message transmis dedans.
    var error = document.createElement('div');
    error.className = 'error';
    error.innerHTML = message;

    // On ajoute l'erreur dans le conteneur, à la suite des erreurs potentiellement déjà là.
    // https://developer.mozilla.org/fr/docs/Web/API/ParentNode/append
    errorContainer.append(error);
}

// Fonction qui ajoute les devises au select depuis fixer.io
function populateCurrencySelect() {
    // On sélectionne l'élément select
    var selectContainer = document.querySelector('.devises');

    // On fait une requête à fixer.io avec XMLHttpRequest
    // https://developer.mozilla.org/fr/docs/Web/API/XMLHttpRequest
    var request = new XMLHttpRequest();
    request.open('GET', config.apiUrl + '/symbols?access_key='+config.apiKey, true);
    request.send();

    // On vérifie l'état de la requête
    request.onreadystatechange = function (event) {

        // Si la requête est terminée (XMLHttpRequest.DONE) et qu'elle n'a pas retourné d'erreurs (status = 200)
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {

            // On récupère le résultat renvoyé par fixer.io. Ce dernier renvoie un objet JSON au format texte.
            // On le convertit pour qu'il soit utilisable grâce à JSON.parse()
            // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/JSON/parse
            var result = JSON.parse(this.response);

            // Pour chaque devise renvoyée, on crée une option qu'on ajoute au select
            for ( var key in result.symbols) {
                var option = document.createElement('option');
                option.value = key;
                option.innerHTML = result.symbols[key];
                selectContainer.append(option);
            }
        }
        // S'il y a eu un problème lors de la requête on affiche un message d'erreur.
        else {
            createError("Impossible de récupérer les devises. Voici le message d'erreur renvoyé : "+ this.status + " " + this.statusText);
        }
    }
}


function initialize() {
    // Si la clé d'API n'est pas là, on affiche une erreur.
    // On pourrait par exemple aussi vérifier le format de la clé en comptant son nombre de caractères
    if(!isApiKeyThere()){
        createError("Il faut ajouter une clé d'API dans le fichier js/config.js");
    }

    // On récupère les différentes devises depuis fixer.io et on les ajoute au select
    populateCurrencySelect();
}

initialize();
