import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { resoudreCheminDemande } from './src/cheminSecurise.js';

const port = Number(process.env.PORT) || 5173;
const hote = '127.0.0.1';
const racine = process.cwd();

const typesDeContenu = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

const ENTETES_SECURITE = {
  'X-Content-Type-Options': 'nosniff'
};

function repondreErreur(reponse, code, message) {
  reponse.writeHead(code, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...ENTETES_SECURITE
  });

  reponse.end(message);
}

const serveur = createServer(async (requete, reponse) => {
  const cheminFichier = resoudreCheminDemande(racine, requete.url);

  if (cheminFichier === null) {
    repondreErreur(reponse, 403, 'Accès refusé.');
    return;
  }

  try {
    const contenu = await readFile(cheminFichier);
    const extension = extname(cheminFichier);

    reponse.writeHead(200, {
      'Content-Type': typesDeContenu[extension] || 'text/plain; charset=utf-8',
      ...ENTETES_SECURITE
    });

    reponse.end(contenu);
  } catch {
    repondreErreur(reponse, 404, 'Fichier introuvable.');
  }
});

serveur.listen(port, hote, () => {
  console.log(`Serveur de développement disponible sur http://${hote}:${port}`);
});
