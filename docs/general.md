# Documentation générale

Ce document liste toutes les fonctions exportées par les modules du dossier `src/`.

## `src/conversion.js`

| Fonction | Paramètres | Valeur de retour | Exemple d'utilisation |
| --- | --- | --- | --- |
| `convertirCelsiusEnFahrenheit` | `celsius` (`number`) : température en degrés Celsius | `number` : température convertie en degrés Fahrenheit | `convertirCelsiusEnFahrenheit(20); // 68` |
| `convertirFahrenheitEnCelsius` | `fahrenheit` (`number`) : température en degrés Fahrenheit | `number` : température convertie en degrés Celsius | `convertirFahrenheitEnCelsius(68); // 20` |
| `convertirCelsiusEnKelvin` | `celsius` (`number`) : température en degrés Celsius | `number` : température convertie en kelvins | `convertirCelsiusEnKelvin(20); // 293.15` |
| `trouverConversion` | `identifiant` (`string`) : identifiant d'une conversion du catalogue `CONVERSIONS` | `object \| null` : la conversion correspondante (`identifiant`, `libelle`, `uniteSource`, `uniteCible`, `convertir`), ou `null` si l'identifiant est inconnu | `trouverConversion('celsius-vers-kelvin').uniteCible; // 'K'`<br>`trouverConversion('inconnu'); // null` |
| `arrondirTemperature` | `valeur` (`number`) : température à arrondir | `number` : température arrondie au dixième | `arrondirTemperature(20.456); // 20.5` |
| `lireTemperature` | `texte` (`string`) : saisie utilisateur à interpréter (accepte la virgule comme séparateur décimal) | `number \| null` : valeur numérique lue, ou `null` si la saisie est vide, non numérique ou invalide | `lireTemperature('20,5'); // 20.5`<br>`lireTemperature('abc'); // null` |

Ce module exporte aussi la constante `CONVERSIONS` : le catalogue des conversions proposées dans la liste déroulante de l'interface. Chaque entrée contient un `identifiant`, un `libelle` affiché, les unités `uniteSource` / `uniteCible` et la fonction `convertir` à appliquer.

## `src/cheminSecurise.js`

| Fonction | Paramètres | Valeur de retour | Exemple d'utilisation |
| --- | --- | --- | --- |
| `retirerParametres` | `url` (`string`) : URL brute pouvant contenir une chaîne de requête ou une ancre | `string` : URL tronquée avant le premier `?` ou `#` rencontré | `retirerParametres('/index.html?theme=sombre#section'); // '/index.html'` |
| `decoderChemin` | `chemin` (`string`) : segment de chemin encodé en URL | `string \| null` : chemin décodé, ou `null` si le décodage échoue | `decoderChemin('%2Findex.html'); // '/index.html'`<br>`decoderChemin('%E0%A4%A'); // null` |
| `contientSegmentCache` | `cheminRelatif` (`string`) : chemin relatif à examiner | `boolean` : `true` si un segment du chemin commence par un point (fichier ou dossier caché) | `contientSegmentCache('src/.env'); // true`<br>`contientSegmentCache('src/conversion.js'); // false` |
| `normaliserChemin` | `urlDemandee` (`string`) : URL brute reçue par le serveur | `string \| null` : chemin décodé et nettoyé (racine `/` convertie en `/index.html`), ou `null` si l'URL est malformée, non décodable ou contient un octet nul | `normaliserChemin('/'); // '/index.html'`<br>`normaliserChemin('/src/conversion.js'); // '/src/conversion.js'` |
| `resoudreCheminDemande` | `racine` (`string`) : chemin absolu du dossier racine servi<br>`urlDemandee` (`string`) : URL brute reçue par le serveur | `string \| null` : chemin de fichier absolu confiné sous `racine`, ou `null` si le chemin sort de la racine, vise un fichier caché ou n'est pas décodable | `resoudreCheminDemande('/app', '/index.html'); // '/app/index.html'`<br>`resoudreCheminDemande('/app', '/../etc/passwd'); // null` |
