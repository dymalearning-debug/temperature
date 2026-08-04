import { relative, resolve, sep } from 'node:path';

const FICHIER_PAR_DEFAUT = '/index.html';

export function retirerParametres(url) {
  const positionQuery = url.indexOf('?');
  const positionAncre = url.indexOf('#');

  const positions = [positionQuery, positionAncre].filter(
    (position) => position !== -1
  );

  if (positions.length === 0) {
    return url;
  }

  return url.slice(0, Math.min(...positions));
}

export function decoderChemin(chemin) {
  try {
    return decodeURIComponent(chemin);
  } catch {
    return null;
  }
}

export function contientSegmentCache(cheminRelatif) {
  return cheminRelatif
    .split(sep)
    .some((segment) => segment.startsWith('.') && segment !== '');
}

function estConfine(racine, cheminResolu) {
  return cheminResolu === racine || cheminResolu.startsWith(racine + sep);
}

/**
 * Nettoie une URL en chemin décodé exploitable, ou `null` si elle est
 * malformée, non décodable ou porteuse d'un octet nul.
 */
export function normaliserChemin(urlDemandee) {
  if (typeof urlDemandee !== 'string' || !urlDemandee.startsWith('/')) {
    return null;
  }

  const cheminDecode = decoderChemin(retirerParametres(urlDemandee));

  if (cheminDecode === null || cheminDecode.includes('\0')) {
    return null;
  }

  return cheminDecode === '/' ? FICHIER_PAR_DEFAUT : cheminDecode;
}

/**
 * Résout une URL demandée en chemin de fichier confiné sous `racine`.
 * Renvoie `null` si le chemin sort de la racine, vise un fichier caché
 * (`.git`, `.claude`, `.env`…) ou n'est pas décodable.
 */
export function resoudreCheminDemande(racine, urlDemandee) {
  const cheminNormalise = normaliserChemin(urlDemandee);

  if (cheminNormalise === null) {
    return null;
  }

  const racineResolue = resolve(racine);
  const cheminResolu = resolve(racineResolue, `.${cheminNormalise}`);

  if (!estConfine(racineResolue, cheminResolu)) {
    return null;
  }

  if (contientSegmentCache(relative(racineResolue, cheminResolu))) {
    return null;
  }

  return cheminResolu;
}
