import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { connect, createServer } from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const racineProjet = join(dirname(fileURLToPath(import.meta.url)), '..');

async function trouverPortLibre() {
  const sonde = createServer();
  sonde.listen(0, '127.0.0.1');
  await once(sonde, 'listening');

  const { port } = sonde.address();
  sonde.close();
  await once(sonde, 'close');

  return port;
}

async function demarrerServeur(port) {
  const processus = spawn(process.execPath, ['server.js'], {
    cwd: racineProjet,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await once(processus.stdout, 'data');

  return processus;
}

/**
 * Envoie une requête HTTP brute : contrairement à fetch ou http.request,
 * le chemin n'est pas normalisé, ce qui reproduit fidèlement une attaque.
 */
function requeteBrute(port, chemin) {
  return new Promise((resoudre, rejeter) => {
    const socket = connect(port, '127.0.0.1');
    let reponse = '';

    socket.on('connect', () => {
      socket.write(
        `GET ${chemin} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n`
      );
    });

    socket.on('data', (morceau) => {
      reponse += morceau.toString();
    });

    socket.on('end', () => resoudre(reponse));
    socket.on('error', rejeter);
  });
}

test('le serveur de développement résiste au path traversal', async (t) => {
  const port = await trouverPortLibre();
  const processus = await demarrerServeur(port);

  t.after(() => processus.kill());

  await t.test('sert la page d\'accueil', async () => {
    const reponse = await requeteBrute(port, '/');

    assert.match(reponse, /^HTTP\/1\.1 200 /);
    assert.match(reponse, /Convertisseur de température/);
  });

  await t.test('ajoute l\'en-tête nosniff', async () => {
    const reponse = await requeteBrute(port, '/');

    assert.match(reponse, /X-Content-Type-Options: nosniff/i);
  });

  await t.test('refuse de lire /etc/passwd via ..', async () => {
    const reponse = await requeteBrute(port, '/../../../../etc/passwd');

    assert.match(reponse, /^HTTP\/1\.1 403 /);
    assert.doesNotMatch(reponse, /root:x:/);
  });

  await t.test('refuse de lire /etc/passwd via un encodage', async () => {
    const reponse = await requeteBrute(
      port,
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd'
    );

    assert.match(reponse, /^HTTP\/1\.1 403 /);
    assert.doesNotMatch(reponse, /root:x:/);
  });

  await t.test('refuse d\'exposer le dossier .git', async () => {
    const reponse = await requeteBrute(port, '/.git/HEAD');

    assert.match(reponse, /^HTTP\/1\.1 403 /);
    assert.doesNotMatch(reponse, /refs\/heads/);
  });

  await t.test('sert un module de src avec le bon type', async () => {
    const reponse = await requeteBrute(port, '/src/conversion.js');

    assert.match(reponse, /^HTTP\/1\.1 200 /);
    assert.match(reponse, /Content-Type: text\/javascript/);
  });

  await t.test('tolère une query string sur un fichier existant', async () => {
    const reponse = await requeteBrute(port, '/src/conversion.js?v=42');

    assert.match(reponse, /^HTTP\/1\.1 200 /);
  });

  await t.test('renvoie 404 pour un fichier confiné mais absent', async () => {
    const reponse = await requeteBrute(port, '/absent.js');

    assert.match(reponse, /^HTTP\/1\.1 404 /);
  });
});
