# OMAYI

Monorepo OMAYI : un seul dépôt, trois espaces de travail npm.

| Espace   | Rôle                                | Technologies         |
| -------- | ----------------------------------- | -------------------- |
| `client` | Interface web (port 3000)           | Vite + React + TS    |
| `server` | API REST (port 3310)                | Express + MySQL + TS |
| `shared` | Code commun au client et au serveur | TypeScript           |

> **État : US00 — initialisation.** Il n'y a encore aucune règle métier.
> L'objectif de cette étape est une base technique saine : les trois espaces
> s'installent ensemble, le code partagé est importable des deux côtés, et la
> route `/api/health` dit la vérité sur l'état du serveur et de la base.

## Prérequis

- Node.js 20 ou plus (`node --version`)
- npm 10 ou plus (`npm --version`)
- Docker Desktop, pour la base MySQL de développement

## Installation, pas à pas

### 1. Cloner et installer

```bash
git clone https://github.com/Cynthiou/omayi.git
cd omayi
npm install
```

Un seul `npm install` à la racine installe les dépendances des trois espaces :
npm les reconnaît comme *workspaces* (voir la clé `workspaces` de
`package.json`). Il ne faut donc **pas** lancer `npm install` dans `client/`,
`server/` ou `shared/`.

Cette commande active aussi les hooks Git du dépôt (`.git-hooks`), via le
script `prepare`.

### 2. Créer les trois fichiers `.env`

Le dépôt ne contient que des `.env.sample`, sans aucun identifiant réel. Il
faut créer trois fichiers `.env`, qui ne sont jamais versionnés :

```bash
cp .env.sample .env                # identifiants du conteneur MySQL
cp server/.env.sample server/.env  # configuration de l'API
cp client/.env.sample client/.env  # URL de l'API pour le navigateur
```

Puis remplacer chaque `A_DEFINIR` par tes propres valeurs. Trois règles :

- `DB_NAME`, `DB_PORT`, `DB_USER` et `DB_PASSWORD` doivent être **identiques**
  dans `.env` (racine) et dans `server/.env`, sinon le serveur ne pourra pas
  se connecter au conteneur.
- `DB_ROOT_PASSWORD` n'existe que dans le `.env` de la racine : il ne sert
  qu'au conteneur.
- Tout ce qui est préfixé `VITE_` dans `client/.env` est embarqué dans le
  bundle envoyé au navigateur. N'y mets jamais de secret.

Le serveur refuse de démarrer si une variable obligatoire manque : il affiche
alors la liste complète des variables absentes (voir
`server/src/config/env.ts`).

### 3. Démarrer MySQL

```bash
docker compose up -d
```

Seule la base tourne dans Docker ; le client et le serveur se lancent sur ta
machine. Le port MySQL est publié sur `127.0.0.1` uniquement : la base n'est
jamais joignable depuis le réseau local.

Vérifier qu'elle est prête :

```bash
docker compose ps
```

> **Si le port 3306 est déjà occupé** (une installation MySQL locale, par
> exemple), choisis un autre port dans le `.env` de la racine **et** dans
> `server/.env`, par exemple `DB_PORT=3307`, puis relance
> `docker compose up -d`.

### 4. Créer le schéma et les données

```bash
npm run db:migrate   # recrée la base et applique server/database/schema.sql
npm run db:seed      # insère le jeu de données minimal
```

Les deux scripts sortent avec un code d'échec en cas d'erreur : ils
n'annoncent jamais un faux succès.

> `db:migrate` **supprime puis recrée** la base `DB_NAME`. Toutes les données
> existantes sont perdues.

> Si la migration échoue sur un refus de privilèges, l'utilisateur MySQL n'a
> pas le droit de recréer la base. Repartir d'un conteneur neuf :
> `docker compose down -v && docker compose up -d`.

### 5. Lancer le client et le serveur

```bash
npm run dev
```

Cette commande démarre les deux en parallèle :

- client : http://localhost:3000
- API : http://localhost:3310

Pour n'en lancer qu'un : `npm run dev:client` ou `npm run dev:server`.

### 6. Vérifier `/api/health`

La page d'accueil du client appelle `/api/health` et affiche le résultat. Tu
peux aussi l'appeler directement :

```bash
curl -i http://localhost:3310/api/health
```

**Base démarrée** — `200 OK` :

```json
{ "status": "ok", "database": "up", "shared": "shared-ready" }
```

**Base arrêtée** (`docker compose stop`) — `503 Service Unavailable` :

```json
{
  "status": "error",
  "database": "down",
  "message": "La base de données ne répond pas."
}
```

La route fait une vraie requête MySQL (`select 1`). Elle ne peut donc pas
répondre `OK` si la base est injoignable. Le détail de l'erreur MySQL reste
dans les journaux du serveur : il ne part jamais vers le navigateur.

La page du client affiche trois états : vérification en cours, service
disponible, ou service indisponible avec le message d'erreur.

## L'espace `shared`

`shared` contient le code commun au client et au serveur. Il s'importe par son
nom de paquet, depuis les deux côtés comme depuis les tests :

```ts
import { SHARED_READY } from "@omayi/shared";
```

`SHARED_READY` est un témoin **temporaire**. Il ne sert qu'à prouver, en US00,
que le code partagé est bien importable. Il sera retiré en US09, quand le vrai
catalogue prendra sa place.

**Pas d'étape de compilation pour `shared`.** Le serveur tourne avec
[tsx](https://tsx.is), qui exécute directement le TypeScript ; le client passe
par Vite, qui fait de même. Les deux lisent donc `shared/src` tel quel. C'est
pour cette raison que `shared/package.json` pointe sur `src/index.ts` et que
`shared` n'a pas de script `build` : il n'y a rien à construire. Son script
`check-types` vérifie quand même les types à chaque commit.

Les dossiers `shared/src/types`, `shared/src/catalogue` et `shared/src/regles`
sont des emplacements réservés, encore vides : ils seront remplis en US02,
US09 et US11.

## Design et charte graphique

La référence est `Charte graphique omayi.html`, à la racine : logo, couleurs,
contrastes, typographie et mesures des éléments d'interface. Elle s'ouvre
directement dans un navigateur, sans rien installer.

L'interface est stylée avec **Tailwind CSS 4**. Il n'y a pas de
`tailwind.config.js` : en version 4, toute la configuration vit dans le CSS,
ici dans `client/src/styles/index.css`.

### Les deux couches de couleurs

`client/src/styles/tokens.css` contient deux couches, et il ne faut pas les
confondre :

| Couche | Préfixe | Change avec le thème ? | À utiliser dans un composant ? |
| ------ | ------- | ---------------------- | ------------------------------ |
| Palette de marque | `--omayi-*` | Non | Non, sauf logo et graphismes |
| Rôles d'interface | `--bg`, `--ink`, `--surface`, `--action`… | Oui | **Oui, toujours** |

Concrètement, on écrit `bg-surface text-ink`, jamais une couleur en dur ni une
encre de marque. C'est ce qui fait que le thème sombre fonctionne sans écrire
un seul `dark:` : les utilitaires pointent sur les variables, et les variables
basculent.

Le thème suit le réglage du système. Pour le forcer, on pose
`data-theme="dark"` ou `data-theme="light"` sur `<html>`.

### L'orange, et pourquoi il y en a deux

Du blanc sur l'orange du logo `#EA580C` ne donne que **3,56:1**, sous le seuil
WCAG AA de 4,5:1. Le chapitre 10 de la charte posait la question ; la réponse
retenue ici est son **option B** :

- `#EA580C` reste l'orange de marque : logo, icônes actives, aplats.
- `#C2410C` (`--action`) porte le texte : boutons et liens, **5,18:1** avec du
  blanc, donc conformes dès 16 px.

En thème sombre, `--action` repasse à `#EA580C` : sur le fond `#111827` il
atteint 4,98:1, et le libellé du bouton passe en noir. Pour revenir à l'option
A, il suffit de changer `--action` dans `tokens.css` — rien d'autre dans le
code ne connaît ces valeurs.

### Échelle typographique

Les sept styles du chapitre 08 sont des utilitaires. Chacun porte déjà sa
taille, son interligne **et** sa graisse :

| Utilitaire | Réglage | Usage |
| ---------- | ------- | ----- |
| `text-titre` | 700 · 28/34 | Titre de page, numéro de document |
| `text-sous-titre` | 400 · 20/28 | Sous-titre, titre de section |
| `text-courant` | 400 · 16/24 | Paragraphes, champs de saisie |
| `text-petit` | 400 · 14/20 | Dates, infos secondaires |
| `text-bouton` | 600 · 16/24 | Libellés de boutons |
| `text-legende` | 500 · 12/16 | Badges, onglets |

Donc `text-titre` suffit : pas besoin d'ajouter `font-bold leading-9`.

Les rayons de la charte remplacent l'échelle de Tailwind : `rounded-sm` vaut
8 px ici, `rounded-md` 12 px. Les espacements de la charte (4, 8, 16, 24,
32 px) correspondent déjà à `1`, `2`, `4`, `6`, `8` de Tailwind.

### Polices

Inter et JetBrains Mono sont servies depuis `node_modules`
(`@fontsource/*`), sous-ensemble latin seulement. Aucune requête ne part vers
Google Fonts quand un artisan ouvre l'application.

### Règles à ne pas perdre de vue

Elles viennent de la charte, pas d'une préférence :

- **Un seul bouton `principal` par écran** : l'action que l'artisan est venu
  faire.
- **Cibles tactiles de 48 px**, jamais moins de 44 px — l'app sert sur
  chantier, souvent avec des gants.
- **Un statut s'écrit toujours en toutes lettres.** La couleur ne doit jamais
  le porter seule, d'où la pastille de texte dans `Badge`.
- **Montants en chiffres tabulaires** : la classe `.montant`.
- **Contour de focus visible** sur tout ce qui se clique (déjà posé globalement
  sur `:focus-visible`).
- Pas de dégradé, pas d'ombre décorative, pas de deuxième famille de
  caractères, pas de couleur hors palette.

### Reste à trancher

Le chapitre 10 de la charte liste encore trois points ouverts : les teintes
relevées à l'œil sur une image plutôt que dans le fichier Illustrator, les
tailles minimales du logo à l'impression, et le nom du produit dans les
documents (le backlog parle encore de « NTHIA »).

## Qualité et conventions

### Vérifications

```bash
npm run check       # Biome sur les fichiers indexés, puis les types des 3 espaces
npm run check:fix   # corrige automatiquement ce qui peut l'être
npm test            # tests Jest du serveur
```

Le hook `pre-commit` lance le contrôle du nom de branche puis `npm run check`.
Un commit qui ne passe pas ces vérifications est refusé.

### Nom de branche

Une branche doit s'appeler `feature/USxx-nom-court` ou `fix/USxx-nom-court`
(en plus de `main`, `master`, `staging` et `dev`). Pour renommer une branche
mal nommée : `git branch -m <nouveau-nom>`.

### Message de commit

Format `type(USxx): description`, avec `type` parmi `feat`, `fix`, `chore`,
`test`, `docs` et `refactor`. Le scope `USxx` est obligatoire.

```bash
git commit -m "chore(US00): initialize monorepo"   # accepté
git commit -m "chore: bad"                         # refusé : scope manquant
```

Le contrôle est fait par commitlint, via le hook `commit-msg`. Pour le tester
sans commiter :

```bash
echo "chore: bad" | npx commitlint
```

### Tests

Les tests du serveur couvrent les points vérifiés par l'US00 :

| Fichier                    | Ce qu'il vérifie                                    |
| -------------------------- | --------------------------------------------------- |
| `tests/workspaces.spec.ts` | les trois espaces sont des workspaces npm installés |
| `tests/shared.spec.ts`     | `shared` est importable depuis Jest                 |
| `tests/health.spec.ts`     | `/api/health` en 200 et en 503, sans fuite d'erreur |
| `tests/cors.spec.ts`       | une origine inconnue ne reçoit aucun en-tête CORS   |
| `tests/env.spec.ts`        | les variables manquantes sont toutes listées        |

## Construction

```bash
npm run build
npm start
```

> **Attention** : `npm run build` construit le client **et applique la
> migration de la base**. La base doit donc être démarrée, et elle sera
> recréée à vide. C'est le comportement attendu en déploiement ; en local,
> préfère `npm run db:migrate` quand tu veux seulement migrer.

Après la construction, `npm start` démarre le serveur avec tsx : l'import de
`shared` continue de fonctionner, puisqu'il n'y a jamais eu de compilation
intermédiaire. Le serveur sert alors aussi les fichiers construits du client,
depuis `client/dist`.

## Sécurité

- Les `.env` sont ignorés par Git. Seuls les `.env.sample` sont versionnés, et
  ils ne contiennent aucun identifiant réel.
- Le CORS n'autorise qu'une seule origine : celle déclarée dans `CLIENT_URL`.
  Une autre origine ne reçoit aucun en-tête `Access-Control-Allow-Origin`, et
  le navigateur bloque alors la réponse.
- Le port MySQL n'est publié que sur `127.0.0.1`.
- `/api/health` ne renvoie jamais le détail d'une erreur MySQL au navigateur.

## Structure du dépôt

```plaintext
omayi/
├── Charte graphique omayi.html   Charte de référence, à ouvrir au navigateur
├── client/                  Interface web (Vite + React + Tailwind)
│   ├── public/
│   │   └── favicon.svg      Icône, dérivée du logo de la charte
│   └── src/
│       ├── components/
│       │   ├── ui/          Button, Badge, Card aux mesures de la charte
│       │   └── Logo.tsx     Logo omayi, chemins repris de la charte
│       ├── pages/           Pages
│       ├── services/        Appels à l'API
│       ├── styles/
│       │   ├── tokens.css   Variables de la charte (thème clair et sombre)
│       │   └── index.css    Entrée unique : polices, Tailwind, échelle typo
│       └── App.tsx          Coquille de l'application
├── server/                  API REST (Express)
│   ├── bin/                 Scripts db:migrate et db:seed
│   ├── database/            Client MySQL, schema.sql, fixtures
│   ├── src/
│   │   ├── config/          Vérification des variables d'environnement
│   │   ├── modules/         Un dossier par domaine
│   │   ├── app.ts           Configuration Express (CORS, JSON, statique)
│   │   ├── router.ts        Déclaration des routes
│   │   └── main.ts          Point d'entrée
│   └── tests/               Tests Jest
├── shared/                  Code partagé
│   └── src/
│       ├── catalogue/       (US09)
│       ├── regles/          (US11)
│       └── types/           (US02)
└── docker-compose.yml       MySQL de développement
```

Chaque route du serveur suit la même chaîne :
**Router → Action → Repository → MySQL**. Le routeur associe une URL à une
action, l'action gère la requête et la réponse HTTP, et le repository est le
seul à parler à MySQL. Exemple complet : `server/src/modules/health`.

## Déploiement

Le déploiement se fait par GitHub Actions vers un VPS équipé de Traefik
(`docker-compose.prod.yml` et `.github/workflows/`). Il demande, dans les
réglages du dépôt GitHub :

- secrets (`secrets` → `actions`) : `SSH_HOST`, `SSH_USER`, `SSH_PASSWORD`
- variable publique (`settings` → `variables` → `actions`) : `PROJECT_NAME`,
  sans underscore (il casserait le certificat Let's Encrypt)

Le déploiement n'est pas dans le périmètre de l'US00 et n'a pas encore été
vérifié pour OMAYI.

## Hors du périmètre de l'US00

L'authentification Supabase (US03), le modèle de données métier (US02), le
catalogue réel (US09), le JSON métier (US10), le moteur de règles (US11) et le
calcul de prix (US12) ne sont pas encore implémentés.
