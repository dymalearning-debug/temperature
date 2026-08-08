export function convertirCelsiusEnFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function convertirFahrenheitEnCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

export function convertirCelsiusEnKelvin(celsius) {
  return celsius + 273.15;
}

export function arrondirTemperature(valeur) {
  return Math.round(valeur * 10) / 10;
}

export const CONVERSIONS = [
  {
    identifiant: "celsius-vers-fahrenheit",
    libelle: "Celsius → Fahrenheit",
    uniteSource: "°C",
    uniteCible: "°F",
    convertir: convertirCelsiusEnFahrenheit,
  },
  {
    identifiant: "fahrenheit-vers-celsius",
    libelle: "Fahrenheit → Celsius",
    uniteSource: "°F",
    uniteCible: "°C",
    convertir: convertirFahrenheitEnCelsius,
  },
  {
    identifiant: "celsius-vers-kelvin",
    libelle: "Celsius → Kelvin",
    uniteSource: "°C",
    uniteCible: "K",
    convertir: convertirCelsiusEnKelvin,
  },
];

export function trouverConversion(identifiant) {
  return (
    CONVERSIONS.find((conversion) => conversion.identifiant === identifiant) ??
    null
  );
}

export function lireTemperature(texte) {
  if (typeof texte !== "string" || texte.trim() === "") {
    return null;
  }

  const texteNormalise = texte.trim().replace(",", ".");
  const valeur = Number(texteNormalise);

  return Number.isFinite(valeur) ? valeur : null;
}
