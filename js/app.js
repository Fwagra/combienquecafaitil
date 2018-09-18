
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


// Fonction qui permet d'effacer toutes les erreurs affichées
function resetErrors() {
    // On prend le conteneur des erreurs et on le vide.
    var errorContainer = document.querySelector('.errors');
    errorContainer.innerHTML = '';
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

            // On vérifie que fixer.io a renvoyé un bon résultat
            if(result.success == true) {

                // Pour chaque devise renvoyée, on crée une option qu'on ajoute au select
                for ( var key in result.symbols) {
                    var option = document.createElement('option');
                    option.value = key;
                    option.innerHTML = result.symbols[key];
                    selectContainer.append(option);
                }
            } else {
                // Sinon on affiche l'erreur envoyée par fixer.io
                createError(result.error.info);
            }
        }
        // S'il y a eu un problème lors de la requête on affiche un message d'erreur.
        else if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
            createError("Impossible de récupérer les devises. Voici le message d'erreur renvoyé : "+ this.status + " " + this.statusText);
        }
    }
}


// Fonction qui récupère le taux de conversion et convertit la somme tapée
function convertCurrency() {
    var fieldSomme = document.querySelector('.somme');
    var fieldDevises = document.querySelector('.devises');

    // Si l'un des deux champs est vide, pas la peine de continuer
    if(fieldSomme.value.length === 0 || fieldDevises.value.length === 0)
        return;

    // On commence par effacer les potentielles erreurs affichées
    resetErrors();

    // Ensuite on convertit la somme entrée en nombre
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number
    var somme = Number(fieldSomme.value);

    // On convertit la somme en sa valeur absolue, au cas ou un petit malin entre
    // une somme négative ;).
    somme = Math.abs(somme);

    // Si la somme rentrée n'est pas valide, on renvoie une erreur.
    if(isNaN(somme)) {
        createError("Il faut rentrer une vraie somme !");
        return;
    }

    // On fait une nouvelle requête à fixer.io avec XMLHttpRequest pour avoir le
    // dernier taux de change pour la devise sélectionnée.
    // On remarquera qu'une bonne partie du code est semblable au code de la
    // fonction populateCurrencySelect. Un bon exercice serait par exemple d'extraire
    // ce code en commun dans une fonction !
    var request = new XMLHttpRequest();
    request.open('GET', config.apiUrl + '/latest?symbols='+fieldDevises.value+'&access_key='+config.apiKey, true);
    request.send();

    // On vérifie l'état de la requête
    request.onreadystatechange = function (event) {

        if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {

            var result = JSON.parse(this.response);

            if (result.success == true) {
                // On récupère le taux de change
                var rate = result.rates[fieldDevises.value];

                // On multiplie la somme rentrée par le taux de change pour avoir
                // la somme convertie
                var result = somme * rate;

                // On affiche le résultat arrondi à deux chiffres après la virgule dans
                // la zone de réponse.
                var answerContainer = document.querySelector('.answer');
                answerContainer.innerHTML = "Ça fait " + result.toFixed(2) + " " + fieldDevises.value + " !";
            } else {
                createError(result.error.info);
            }
        }
        else if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
            createError("Impossible de récupérer le taux de change. Voici le message d'erreur renvoyé : "+ this.status + " " + this.statusText);
        }
    }

}


// Fonction lancée initialement
function initialize() {

    // Si la clé d'API n'est pas là, on affiche une erreur et on arrête tout.
    // On pourrait par exemple aussi vérifier le format de la clé en comptant son nombre de caractères
    if(!isApiKeyThere()){
        createError("Il faut ajouter une clé d'API dans le fichier js/config.js");
        return;
    }

    // On récupère les différentes devises depuis fixer.io et on les ajoute au select
    populateCurrencySelect();

    // On sélectionne nos champs et on "écoute" leurs changements avec un listener
    // Dès que l'un des champs est modifié, on execute la fonction qui viendra calculer la conversion
    // https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener
    var fieldSomme = document.querySelector('.somme');
    var fieldDevises = document.querySelector('.devises');

    fieldSomme.addEventListener('keyup', convertCurrency);
    fieldDevises.addEventListener('change', convertCurrency);

}

initialize();
