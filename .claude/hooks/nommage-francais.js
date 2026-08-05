// Hook PostToolUse (Write|Edit) : verifie que les identifiants declares dans
// src/ et test/ respectent la convention « tout le code en francais ».
//
// Ecart detecte -> rapport sur stderr + code de sortie 2 (Claude lit stderr).
// Aucun ecart, fichier hors perimetre, entree vide ou illisible -> code 0 muet.
//
// La doctrine linguistique fait autorite dans .claude/agents/gardien-francais.md :
// ce script en est une transcription partielle et volontairement conservatrice.
//
// Limites assumees du reperage par expression reguliere :
//   - la destructuration n'est pas analysee (`const { port } = sonde.address()`) :
//     ces noms viennent d'API externes, que la doctrine exempte de toute facon ;
//   - les methodes de classe ne le sont pas non plus : `foo() {` est indistinguable
//     d'un appel ou d'un `if` sans veritable analyse syntaxique ;
//   - un declarateur multiple (`let a, b;`) ne livre que son premier nom ;
//   - les parametres de fonction ne sont pas inspectes.
// Ces angles morts restent couverts par l'agent gardien-francais, auditeur exhaustif.

import { readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const EXTENSION_AUDITEE = '.js';
const PREFIXES_AUDITES = ['src/', 'test/'];
const PLAFOND_ECARTS = 10;

// Mots anglais courants, associes a une traduction francaise sans accent.
//
// Liste noire et non liste blanche de mots francais : le vocabulaire francais est
// ouvert (`sonde`, `morceau`, `ancre`, `confine`, `attendu`...) et chaque mot absent
// d'une liste blanche deviendrait un faux positif — lequel, sur un hook qui alimente
// la boucle du modele, ne coute pas un avertissement mais un renommage de code
// correct. La liste noire est incomplete par construction, mais sans faux positif.
//
// Une Map, et non un objet litteral : `MOTS_ANGLAIS['constructor']` renverrait une
// fonction. La traduction rend le rapport actionnable et impose une discipline : on
// ne peut ajouter un mot qu'en exhibant un mot francais distinct, ce qui interdit
// mecaniquement d'y glisser `message`, `port` ou `temperature`.
const MOTS_ANGLAIS = new Map(Object.entries({
  // verbes
  add: 'ajouter', build: 'construire', check: 'verifier', clear: 'vider',
  click: 'clic', close: 'fermer', convert: 'convertir', create: 'creer',
  delete: 'supprimer', disable: 'desactiver', display: 'afficher',
  download: 'telecharger', edit: 'modifier', enable: 'activer',
  fetch: 'recuperer', fill: 'remplir', find: 'trouver', get: 'obtenir',
  handle: 'gerer', hide: 'masquer', insert: 'inserer', load: 'charger',
  make: 'fabriquer', merge: 'fusionner', open: 'ouvrir', parse: 'analyser',
  print: 'imprimer', push: 'empiler', read: 'lire', remove: 'retirer',
  render: 'afficher', reset: 'reinitialiser', run: 'executer',
  save: 'enregistrer', search: 'rechercher', select: 'selectionner',
  send: 'envoyer', set: 'definir', show: 'afficher', sort: 'trier',
  split: 'decouper', start: 'demarrer', stop: 'arreter', submit: 'soumettre',
  toggle: 'basculer', update: 'actualiser', upload: 'televerser',
  validate: 'valider', write: 'ecrire',

  // noms
  amount: 'montant', answer: 'reponse', array: 'tableau', button: 'bouton',
  child: 'enfant', children: 'enfants', color: 'couleur', colour: 'couleur',
  count: 'nombre', error: 'erreur', errors: 'erreurs', event: 'evenement',
  failure: 'echec', field: 'champ', file: 'fichier', folder: 'dossier',
  height: 'hauteur', input: 'saisie', key: 'cle', keys: 'cles',
  length: 'longueur', level: 'niveau', list: 'liste', main: 'principal',
  name: 'nom', names: 'noms', number: 'nombre', output: 'sortie',
  owner: 'proprietaire', path: 'chemin', query: 'requete', reason: 'motif',
  request: 'requete', response: 'reponse', result: 'resultat', row: 'rangee',
  screen: 'ecran', settings: 'reglages', size: 'taille', state: 'etat',
  string: 'chaine', target: 'cible', text: 'texte', time: 'duree',
  title: 'titre', user: 'utilisateur', value: 'valeur', values: 'valeurs',
  view: 'vue', width: 'largeur', window: 'fenetre', word: 'mot',
  wrapper: 'enveloppe',

  // adjectifs et mots de liaison
  and: 'et', current: 'courant', default: 'defaut', done: 'termine',
  empty: 'vide', first: 'premier', from: 'depuis', has: 'possede',
  hidden: 'masque', invalid: 'invalide', is: 'est', last: 'dernier',
  to: 'vers', valid: 'valide', with: 'avec'
}));

// Exclusions deliberees de la liste ci-dessus : `port`, `message`, `code`,
// `extension`, `socket`, `url`, `temperature`, `conversion`, `format`, `section`,
// `option`, `celsius`, `fahrenheit`, `test`, `assert`, `position`, `segment`,
// `contenu`, `cache`, `data`, `status`, `index`, `type` (mots francais ou quasi
// identiques dans les deux langues) ; `or` (mot francais) ; `in`, `on`, `at`, `of`
// (trop courts, gain marginal) ; `temp` (abreviation de temperature ici).

// Exemptions de gardien-francais.md, consultees AVANT la liste noire.
// L'intersection avec MOTS_ANGLAIS est vide aujourd'hui : c'est intentionnellement
// un no-op, une protection anti-regression qui rend la doctrine executable le jour
// ou quelqu'un ajouterait par megarde `message` ou `port` a la liste noire.
const SEGMENTS_TOUJOURS_ADMIS = new Set([
  // mots identiques ou quasi identiques en francais et en anglais
  'temperature', 'conversion', 'format', 'message', 'table', 'section',
  'option', 'invalide', 'transformation', 'position', 'segment', 'contenu',
  'code', 'extension', 'index', 'type', 'source', 'page', 'parent', 'date',
  'label', 'item', 'note', 'service', 'version', 'total', 'base', 'mode',
  'image', 'style', 'script', 'data', 'status', 'cache', 'port', 'socket',
  // API et acronymes techniques
  'url', 'uri', 'http', 'json', 'html', 'css', 'dom', 'api', 'id',
  // unites et symboles
  'celsius', 'fahrenheit', 'kelvin', 'degre', 'c', 'f', 'k',
  // identifiants node:test / node:assert
  'test', 'describe', 'it', 'assert', 'equal', 'throws', 'strict'
]);

// L'ancre `^[ \t]*` est le coeur du dispositif anti-faux-positif : elle exclut
// d'office les commentaires (`// const value = 1` porte un `/` avant `const`, une
// ligne JSDoc un `*`) et les occurrences en milieu de chaine.
const MOTIFS_DECLARATION = [
  /^[ \t]*(?:export[ \t]+(?:default[ \t]+)?)?(?:async[ \t]+)?(?:function[ \t*]+|class[ \t]+|const[ \t]+|let[ \t]+)([A-Za-z_$][\w$]*)/g,
  /\bfor[ \t]*\([ \t]*(?:const|let)[ \t]+([A-Za-z_$][\w$]*)/g
];

const RAPPEL = `
Renomme ces identifiants — et toutes leurs utilisations — en francais, sans accent
ni cedille. Un nom compose est fautif des qu'un seul de ses segments est anglais.
Le fichier est relu en entier : certains ecarts peuvent preexister a ta
modification, corrige-les egalement.
Doctrine complete : .claude/agents/gardien-francais.md`;

async function lireEntreeStandard() {
  // Sans ce garde, un lancement manuel sans tube bloquerait sur le `for await`.
  if (process.stdin.isTTY) {
    return '';
  }

  const morceaux = [];

  for await (const morceau of process.stdin) {
    morceaux.push(morceau);
  }

  return Buffer.concat(morceaux).toString('utf8');
}

function analyserEvenement(texte) {
  if (texte.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(texte);
  } catch {
    return null;
  }
}

function racineProjet(evenement) {
  return process.env.CLAUDE_PROJECT_DIR ?? evenement?.cwd ?? process.cwd();
}

function cheminRelatifAudite(evenement) {
  const cheminBrut = evenement?.tool_input?.file_path;

  if (typeof cheminBrut !== 'string' || !cheminBrut.endsWith(EXTENSION_AUDITEE)) {
    return null;
  }

  // Claude Code fournit un chemin absolu ; le resolve couvre les essais manuels
  // en relatif et laisse un chemin absolu intact.
  const absolu = resolve(evenement?.cwd ?? process.cwd(), cheminBrut);
  const relatif = relative(racineProjet(evenement), absolu).split(sep).join('/');

  // Un fichier hors du projet donne un relatif commencant par « .. », qui echoue
  // le test de prefixe — meme motif que estConfine dans src/cheminSecurise.js.
  return PREFIXES_AUDITES.some((prefixe) => relatif.startsWith(prefixe))
    ? relatif
    : null;
}

function extraireDeclarations(source) {
  const declarations = [];

  source.split('\n').forEach((ligne, rang) => {
    for (const motif of MOTIFS_DECLARATION) {
      // matchAll clone l'expression : pas de fuite de lastIndex entre les lignes.
      for (const trouve of ligne.matchAll(motif)) {
        declarations.push({ identifiant: trouve[1], ligne: rang + 1 });
      }
    }
  });

  return declarations;
}

function decouperEnMots(identifiant) {
  return identifiant
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')      // positionQuery -> position Query
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')   // URLValue      -> URL Value
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2')      // celsius2      -> celsius 2
    .split(/[^a-zA-Z0-9]+/)                      // _ - $ separateurs
    .filter((mot) => mot.length > 0)
    .map((mot) => mot.toLowerCase());
}

// Correspondance exacte, jamais par prefixe : c'est ce qui distingue `convert` de
// `convertir`, `result` de `resultat`, `is` de `est`, `invalid` de `invalide`.
function estMotAnglais(mot) {
  return !SEGMENTS_TOUJOURS_ADMIS.has(mot) && MOTS_ANGLAIS.has(mot);
}

function assemblerNom(mots, identifiant) {
  const traduits = mots.map((mot) => MOTS_ANGLAIS.get(mot) ?? mot);

  if (identifiant === identifiant.toUpperCase()) {
    return traduits.join('_').toUpperCase();
  }

  const compose = traduits
    .map((mot, rang) => (rang === 0 ? mot : mot[0].toUpperCase() + mot.slice(1)))
    .join('');

  return /^[A-Z]/.test(identifiant)
    ? compose[0].toUpperCase() + compose.slice(1)
    : compose;
}

// Un nom compose est fautif des qu'un seul de ses segments est anglais :
// ERROR_MESSAGE est signale sur « error », jamais sur « message », que la doctrine
// exempte nommement.
function analyserDeclaration({ identifiant, ligne }) {
  const mots = decouperEnMots(identifiant);
  const fautifs = mots.filter((mot) => estMotAnglais(mot));

  if (fautifs.length === 0) {
    return null;
  }

  return { identifiant, ligne, fautifs, suggestion: assemblerNom(mots, identifiant) };
}

function dedupliquer(ecarts) {
  const vus = new Set();

  return ecarts.filter(({ identifiant }) => {
    if (vus.has(identifiant)) {
      return false;
    }

    vus.add(identifiant);
    return true;
  });
}

function releverEcarts(source) {
  return dedupliquer(
    extraireDeclarations(source)
      .map((declaration) => analyserDeclaration(declaration))
      .filter((ecart) => ecart !== null)
  );
}

function formaterEcart(chemin, ecart) {
  const segments = ecart.fautifs
    .map((mot) => `« ${mot} » -> « ${MOTS_ANGLAIS.get(mot)} »`)
    .join(', ');

  return [
    `  ${chemin}:${ecart.ligne}  ${ecart.identifiant}`,
    `      segment anglais : ${segments}`,
    `      suggestion      : ${ecart.suggestion}`
  ].join('\n');
}

function signaler(chemin, ecarts) {
  const montres = ecarts.slice(0, PLAFOND_ECARTS);
  const reste = ecarts.length - montres.length;

  console.error(
    'Convention « tout le code en francais » non respectee : ' +
    `${ecarts.length} identifiant(s) anglais dans ${chemin}\n`
  );
  console.error(montres.map((ecart) => formaterEcart(chemin, ecart)).join('\n'));

  if (reste > 0) {
    console.error(`\n  ... et ${reste} autre(s).`);
  }

  console.error(RAPPEL);
}

async function principal() {
  const evenement = analyserEvenement(await lireEntreeStandard());

  if (evenement === null) {
    return;
  }

  const chemin = cheminRelatifAudite(evenement);

  if (chemin === null) {
    return;
  }

  const source = await readFile(resolve(racineProjet(evenement), chemin), 'utf8');
  const ecarts = releverEcarts(source);

  if (ecarts.length > 0) {
    signaler(chemin, ecarts);
    // exitCode plutot que process.exit(2), qui peut tronquer une ecriture stderr
    // encore en vol lorsque stderr est un tube — le cas sous Claude Code.
    process.exitCode = 2;
  }
}

try {
  await principal();
} catch (erreur) {
  // Sortie 0 : un hook casse ne doit jamais polluer la conversation. Tout code
  // autre que 0 ou 2 produirait une notice « hook error » a chaque tour.
  // Ce message n'est visible qu'avec `claude --debug hooks`.
  console.error(`nommage-francais : ${erreur.message}`);
}
