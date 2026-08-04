import test from 'node:test';
import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';

import {
  resoudreCheminDemande,
  retirerParametres,
  contientSegmentCache
} from '../src/cheminSecurise.js';

const racine = resolve('/home/utilisateur/projet');

test('sert index.html à la racine', () => {
  assert.equal(
    resoudreCheminDemande(racine, '/'),
    join(racine, 'index.html')
  );
});

test('sert un fichier normal du projet', () => {
  assert.equal(
    resoudreCheminDemande(racine, '/src/main.js'),
    join(racine, 'src', 'main.js')
  );
});

test('refuse une remontée de répertoire avec ..', () => {
  assert.equal(resoudreCheminDemande(racine, '/../../etc/passwd'), null);
  assert.equal(
    resoudreCheminDemande(racine, '/../../../../etc/passwd'),
    null
  );
  assert.equal(resoudreCheminDemande(racine, '/src/../../secret.txt'), null);
});

test('refuse une remontée encodée en pourcentage', () => {
  assert.equal(resoudreCheminDemande(racine, '/%2e%2e/%2e%2e/etc/passwd'), null);
  assert.equal(resoudreCheminDemande(racine, '/..%2f..%2fetc%2fpasswd'), null);
  assert.equal(resoudreCheminDemande(racine, '/%2e%2e%2f%2e%2e%2fetc'), null);
});

test('refuse un encodage pourcentage invalide', () => {
  assert.equal(resoudreCheminDemande(racine, '/%zz'), null);
  assert.equal(resoudreCheminDemande(racine, '/fichier%'), null);
});

test('refuse un octet nul injecté', () => {
  assert.equal(resoudreCheminDemande(racine, '/index.html%00.txt'), null);
});

test('refuse les fichiers et dossiers cachés', () => {
  assert.equal(resoudreCheminDemande(racine, '/.git/HEAD'), null);
  assert.equal(resoudreCheminDemande(racine, '/.env'), null);
  assert.equal(
    resoudreCheminDemande(racine, '/.claude/settings.local.json'),
    null
  );
  assert.equal(resoudreCheminDemande(racine, '/src/.secret'), null);
});

test('refuse une url absolue ou malformée', () => {
  assert.equal(resoudreCheminDemande(racine, 'http://ailleurs/etc/passwd'), null);
  assert.equal(resoudreCheminDemande(racine, 'index.html'), null);
  assert.equal(resoudreCheminDemande(racine, undefined), null);
});

test('refuse un préfixe de racine voisin mais distinct', () => {
  assert.equal(resoudreCheminDemande(racine, '/../projet-prive/secret'), null);
});

test('ignore la query string et l\'ancre', () => {
  const attendu = join(racine, 'index.html');

  assert.equal(resoudreCheminDemande(racine, '/index.html?v=1'), attendu);
  assert.equal(resoudreCheminDemande(racine, '/index.html#section'), attendu);
  assert.equal(resoudreCheminDemande(racine, '/index.html?a=1#b'), attendu);
});

test('refuse une remontée cachée derrière une query string', () => {
  assert.equal(resoudreCheminDemande(racine, '/../../etc/passwd?x=1'), null);
});

test('retirerParametres coupe au premier séparateur rencontré', () => {
  assert.equal(retirerParametres('/a.js'), '/a.js');
  assert.equal(retirerParametres('/a.js?x=1'), '/a.js');
  assert.equal(retirerParametres('/a.js#ancre'), '/a.js');
  assert.equal(retirerParametres('/a.js#ancre?x=1'), '/a.js');
});

test('contientSegmentCache repère un segment commençant par un point', () => {
  assert.equal(contientSegmentCache('src/main.js'), false);
  assert.equal(contientSegmentCache('.git/HEAD'), true);
  assert.equal(contientSegmentCache('src/.env'), true);
});

test('accepte un nom de fichier encodé légitime', () => {
  assert.equal(
    resoudreCheminDemande(racine, '/mon%20fichier.js'),
    join(racine, 'mon fichier.js')
  );
});
