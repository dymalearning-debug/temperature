import {
  CONVERSIONS,
  trouverConversion,
  arrondirTemperature,
  lireTemperature
} from './conversion.js';

const MESSAGE_ERREUR = 'Veuillez saisir une température valide.';

const listeTypeConversion = document.querySelector('#type-conversion');
const champTemperature = document.querySelector('#temperature');
const boutonConvertir = document.querySelector('#convertir');
const paragrapheResultat = document.querySelector('#resultat');

function remplirListeTypeConversion() {
  for (const conversion of CONVERSIONS) {
    const option = document.createElement('option');
    option.value = conversion.identifiant;
    option.textContent = conversion.libelle;
    listeTypeConversion.append(option);
  }
}

function afficherConversion() {
  const conversion = trouverConversion(listeTypeConversion.value);

  if (conversion === null) {
    paragrapheResultat.textContent = MESSAGE_ERREUR;
    return;
  }

  const temperatureSource = lireTemperature(champTemperature.value);

  if (temperatureSource === null) {
    paragrapheResultat.textContent = MESSAGE_ERREUR;
    return;
  }

  const temperatureCible = arrondirTemperature(
    conversion.convertir(temperatureSource)
  );

  paragrapheResultat.textContent =
    `${temperatureSource} ${conversion.uniteSource} correspondent à ` +
    `${temperatureCible} ${conversion.uniteCible}.`;
}

remplirListeTypeConversion();

boutonConvertir.addEventListener('click', afficherConversion);
listeTypeConversion.addEventListener('change', afficherConversion);
