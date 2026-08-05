import {
  convertirCelsiusEnFahrenheit,
  convertirFahrenheitEnCelsius,
  convertirCelsiusEnKelvin,
  arrondirTemperature,
  lireTemperature
} from './conversion.js';

const MESSAGE_ERREUR = 'Veuillez saisir une température valide.';

const champTemperature = document.querySelector('#temperature');
const boutonConvertir = document.querySelector('#convertir');
const paragrapheResultat = document.querySelector('#resultat');

const champTemperatureFahrenheit = document.querySelector('#temperature-fahrenheit');
const boutonConvertirFahrenheit = document.querySelector('#convertir-fahrenheit');
const paragrapheResultatFahrenheit = document.querySelector('#resultat-fahrenheit');

const champTemperatureKelvin = document.querySelector('#temperature-kelvin');
const boutonConvertirKelvin = document.querySelector('#convertir-kelvin');
const paragrapheResultatKelvin = document.querySelector('#resultat-kelvin');

function afficherConversion() {
  const temperatureCelsius = lireTemperature(champTemperature.value);

  if (temperatureCelsius === null) {
    paragrapheResultat.textContent = MESSAGE_ERREUR;
    return;
  }

  const temperatureFahrenheit = arrondirTemperature(
    convertirCelsiusEnFahrenheit(temperatureCelsius)
  );

  paragrapheResultat.textContent =
    `${temperatureCelsius} °C correspondent à ${temperatureFahrenheit} °F.`;
}

function afficherConversionFahrenheit() {
  const temperatureFahrenheit = lireTemperature(champTemperatureFahrenheit.value);

  if (temperatureFahrenheit === null) {
    paragrapheResultatFahrenheit.textContent = MESSAGE_ERREUR;
    return;
  }

  const temperatureCelsius = arrondirTemperature(
    convertirFahrenheitEnCelsius(temperatureFahrenheit)
  );

  paragrapheResultatFahrenheit.textContent =
    `${temperatureFahrenheit} °F correspondent à ${temperatureCelsius} °C.`;
}

function afficherConversionKelvin() {
  const temperatureCelsius = lireTemperature(champTemperatureKelvin.value);

  if (temperatureCelsius === null) {
    paragrapheResultatKelvin.textContent = MESSAGE_ERREUR;
    return;
  }

  const temperatureKelvin = arrondirTemperature(
    convertirCelsiusEnKelvin(temperatureCelsius)
  );

  paragrapheResultatKelvin.textContent =
    `${temperatureCelsius} °C correspondent à ${temperatureKelvin} K.`;
}

boutonConvertir.addEventListener('click', afficherConversion);
boutonConvertirFahrenheit.addEventListener('click', afficherConversionFahrenheit);
boutonConvertirKelvin.addEventListener('click', afficherConversionKelvin);
