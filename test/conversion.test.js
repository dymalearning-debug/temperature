import test from "node:test";
import assert from "node:assert/strict";

import {
  convertirCelsiusEnFahrenheit,
  convertirFahrenheitEnCelsius,
  convertirCelsiusEnKelvin,
  arrondirTemperature,
  lireTemperature,
  CONVERSIONS,
  trouverConversion,
} from "../src/conversion.js";

test("convertit les degrés Celsius en degrés Fahrenheit", () => {
  assert.equal(convertirCelsiusEnFahrenheit(0), 32);
  assert.equal(convertirCelsiusEnFahrenheit(100), 212);
});

test("convertit les degrés Fahrenheit en degrés Celsius", () => {
  assert.equal(convertirFahrenheitEnCelsius(32), 0);
  assert.equal(convertirFahrenheitEnCelsius(212), 100);
  assert.equal(convertirFahrenheitEnCelsius(68), 20);
  assert.equal(convertirFahrenheitEnCelsius(-40), -40);
});

test("convertit les degrés Celsius en kelvins", () => {
  assert.equal(convertirCelsiusEnKelvin(0), 273.15);
  assert.equal(convertirCelsiusEnKelvin(100), 373.15);
  assert.equal(convertirCelsiusEnKelvin(-273.15), 0);
});

test("convertit et arrondit une température Fahrenheit comme dans l'interface", () => {
  assert.equal(arrondirTemperature(convertirFahrenheitEnCelsius(100)), 37.8);
  assert.equal(arrondirTemperature(convertirFahrenheitEnCelsius(0)), -17.8);
});

test("arrondit une température à un chiffre après la virgule", () => {
  assert.equal(arrondirTemperature(12.34), 12.3);
  assert.equal(arrondirTemperature(12.36), 12.4);
});

test("lit une température valide depuis une saisie texte", () => {
  assert.equal(lireTemperature("20"), 20);
  assert.equal(lireTemperature("0"), 0);
  assert.equal(lireTemperature("-12.5"), -12.5);
  assert.equal(lireTemperature("  20  "), 20);
});

test("accepte la virgule comme séparateur décimal", () => {
  assert.equal(lireTemperature("12,5"), 12.5);
  assert.equal(lireTemperature("-3,2"), -3.2);
  assert.equal(lireTemperature("12.5"), 12.5);
  assert.equal(lireTemperature("-3.2"), -3.2);
});

test("rejette une saisie vide sans la convertir en 0", () => {
  assert.equal(lireTemperature(""), null);
  assert.equal(lireTemperature("   "), null);
});

test("rejette une saisie non numérique sans produire NaN", () => {
  assert.equal(lireTemperature("abc"), null);
  assert.equal(lireTemperature("20abc"), null);
  assert.equal(lireTemperature("Infinity"), null);
});

test("expose un catalogue de conversions aux identifiants uniques", () => {
  const identifiants = CONVERSIONS.map((conversion) => conversion.identifiant);

  assert.equal(identifiants.length, 3);
  assert.equal(new Set(identifiants).size, identifiants.length);

  for (const conversion of CONVERSIONS) {
    assert.equal(typeof conversion.libelle, "string");
    assert.equal(typeof conversion.uniteSource, "string");
    assert.equal(typeof conversion.uniteCible, "string");
    assert.equal(typeof conversion.convertir, "function");
  }
});

test("retrouve une conversion par son identifiant", () => {
  const conversion = trouverConversion("fahrenheit-vers-celsius");

  assert.equal(conversion.uniteSource, "°F");
  assert.equal(conversion.uniteCible, "°C");
  assert.equal(conversion.convertir(68), 20);
});

test("retourne null pour un identifiant de conversion inconnu", () => {
  assert.equal(trouverConversion("celsius-vers-rankine"), null);
  assert.equal(trouverConversion(""), null);
});
