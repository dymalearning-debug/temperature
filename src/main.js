import {
  convertirCelsiusEnFahrenheit,
  convertirFahrenheitEnCelsius,
  convertirKelvinEnCelsius,
  convertirRankineEnCelsius,
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

const champTemperatureRankine = document.querySelector('#temperature-rankine');
const boutonConvertirRankine = document.querySelector('#convertir-rankine');
const paragrapheResultatRankine = document.querySelector('#resultat-rankine');

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
  const temperatureKelvin = lireTemperature(champTemperatureKelvin.value);

  if (temperatureKelvin === null) {
    paragrapheResultatKelvin.textContent = ERROR_MESSAGE;
    return;
  }

  const temperatureCelsius = arrondirTemperature(
    convertirKelvinEnCelsius(temperatureKelvin)
  );

  paragrapheResultatKelvin.textContent =
    `${temperatureKelvin} K correspondent à ${temperatureCelsius} °C.`;
}

function afficherConversionRankine() {
  const temperatureRankine = lireTemperature(champTemperatureRankine.value);

  if (temperatureRankine === null) {
    paragrapheResultatRankine.textContent = ERROR_MESSAGE;
    return;
  }

  const temperatureCelsius = arrondirTemperature(
    convertirRankineEnCelsius(temperatureRankine)
  );

  paragrapheResultatRankine.textContent =
    `${temperatureRankine} °R correspondent à ${temperatureCelsius} °C.`;
}

convertButton.addEventListener('click', displayConversion);
boutonConvertirFahrenheit.addEventListener('click', afficherConversionFahrenheit);
boutonConvertirKelvin.addEventListener('click', afficherConversionKelvin);
boutonConvertirRankine.addEventListener('click', afficherConversionRankine);
