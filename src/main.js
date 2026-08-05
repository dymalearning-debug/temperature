import {
  convertirCelsiusEnFahrenheit,
  convertirFahrenheitEnCelsius,
  convertirCelsiusEnKelvin,
  arrondirTemperature,
  lireTemperature
} from './conversion.js';

const ERROR_MESSAGE = 'Veuillez saisir une température valide.';

const temperatureInput = document.querySelector('#temperature');
const convertButton = document.querySelector('#convertir');
const paragrapheResultat = document.querySelector('#resultat');

const champTemperatureFahrenheit = document.querySelector('#temperature-fahrenheit');
const boutonConvertirFahrenheit = document.querySelector('#convertir-fahrenheit');
const paragrapheResultatFahrenheit = document.querySelector('#resultat-fahrenheit');

const champTemperatureKelvin = document.querySelector('#temperature-kelvin');
const boutonConvertirKelvin = document.querySelector('#convertir-kelvin');
const paragrapheResultatKelvin = document.querySelector('#resultat-kelvin');

function displayConversion() {
  const celsiusValue = lireTemperature(temperatureInput.value);

  if (celsiusValue === null) {
    paragrapheResultat.textContent = ERROR_MESSAGE;
    return;
  }

  const temperatureFahrenheit = arrondirTemperature(
    convertirCelsiusEnFahrenheit(celsiusValue)
  );

  paragrapheResultat.textContent =
    `${celsiusValue} °C correspondent à ${temperatureFahrenheit} °F.`;
}

function afficherConversionFahrenheit() {
  const temperatureFahrenheit = lireTemperature(champTemperatureFahrenheit.value);

  if (temperatureFahrenheit === null) {
    paragrapheResultatFahrenheit.textContent = ERROR_MESSAGE;
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
    paragrapheResultatKelvin.textContent = ERROR_MESSAGE;
    return;
  }

  const temperatureKelvin = arrondirTemperature(
    convertirCelsiusEnKelvin(temperatureCelsius)
  );

  paragrapheResultatKelvin.textContent =
    `${temperatureCelsius} °C correspondent à ${temperatureKelvin} K.`;
}

convertButton.addEventListener('click', displayConversion);
boutonConvertirFahrenheit.addEventListener('click', afficherConversionFahrenheit);
boutonConvertirKelvin.addEventListener('click', afficherConversionKelvin);
