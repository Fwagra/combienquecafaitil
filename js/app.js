
// Fonction qui vérifie que la clé d'API est bien présente
function isApiKeyThere() {
    return (config.apiKey !== undefined && config.apiKey.length > 0);
}


function initialize() {
    // Si la clé d'API n'est pas là, on affiche une erreur.
    if(!isApiKeyThere()){
    }
}

initialize();
