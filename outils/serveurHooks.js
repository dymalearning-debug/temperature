import { createServer } from 'node:http';
import { appendFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT_HOOKS) || 4000;
const hote = '127.0.0.1';
const chemin = '/hooks/tool';

const dossierCourant = dirname(fileURLToPath(import.meta.url));
const fichierJournal = join(dossierCourant, 'tools-log.jsonl');

const TAILLE_MAX_CORPS = 1_000_000;

function lireCorps(requete) {
  return new Promise((resoudre, rejeter) => {
    const morceaux = [];
    let taille = 0;

    requete.on('data', (morceau) => {
      taille += morceau.length;

      if (taille > TAILLE_MAX_CORPS) {
        rejeter(new Error('Corps de requête trop volumineux.'));
        requete.destroy();
        return;
      }

      morceaux.push(morceau);
    });

    requete.on('end', () => resoudre(Buffer.concat(morceaux).toString('utf8')));
    requete.on('error', rejeter);
  });
}

function extraireDuree(charge) {
  const candidats = [
    charge.duration_ms,
    charge.durationMs,
    charge.duration,
    charge.tool_duration_ms,
    charge.tool_response?.duration_ms
  ];

  const duree = candidats.find((valeur) => typeof valeur === 'number');

  return duree ?? null;
}

export function construireEntree(charge) {
  return {
    horodatage: new Date().toISOString(),
    idSession: charge.session_id ?? charge.sessionId ?? null,
    outil: charge.tool_name ?? charge.toolName ?? null,
    dureeMs: extraireDuree(charge)
  };
}

async function journaliser(entree) {
  await appendFile(fichierJournal, `${JSON.stringify(entree)}\n`, 'utf8');
}

function repondre(reponse, code, message) {
  reponse.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });

  reponse.end(JSON.stringify(message));
}

export const serveur = createServer(async (requete, reponse) => {
  const urlDemandee = new URL(requete.url, `http://${hote}:${port}`);

  if (urlDemandee.pathname !== chemin) {
    repondre(reponse, 404, { erreur: 'Endpoint inconnu.' });
    return;
  }

  if (requete.method !== 'POST') {
    repondre(reponse, 405, { erreur: 'Méthode non autorisée.' });
    return;
  }

  let charge;

  try {
    const corps = await lireCorps(requete);
    charge = JSON.parse(corps);
  } catch {
    repondre(reponse, 400, { erreur: 'Corps JSON invalide.' });
    return;
  }

  if (charge === null || typeof charge !== 'object') {
    repondre(reponse, 400, { erreur: 'Corps JSON invalide.' });
    return;
  }

  const entree = construireEntree(charge);

  try {
    await journaliser(entree);
  } catch (erreur) {
    console.error("Échec de l'écriture du journal :", erreur);
    repondre(reponse, 500, { erreur: 'Journalisation impossible.' });
    return;
  }

  repondre(reponse, 200, { statut: 'ok', ...entree });
});

if (process.env.NODE_ENV !== 'test') {
  serveur.listen(port, hote, () => {
    console.log(`Serveur de hooks à l'écoute sur http://${hote}:${port}${chemin}`);
    console.log(`Journal : ${fichierJournal}`);
  });
}
