# jularthus.fr

## Ce que c'est

Le portfolio de Jules-Arthus Klein : un site statique fait main, sans build ni
framework (HTML, CSS, JS, un shader WebGL), en français et en anglais, avec sa
page 404 (et Mew).

```
public/            le site, tel qu'il est servi
ops/nginx/         site.conf : le nginx du conteneur ; jularthus.fr.conf : le vhost de l'hôte
tools/             aperçu local, tests navigateur, Lighthouse, images générées, hook git
compose.yml        le conteneur (nginx non-root), sur 127.0.0.1:8380
```

## Lancer en local

```sh
make dev     # http://127.0.0.1:8787 : sert public/ directement, une modif = un rechargement,
             # les URL inconnues donnent la page 404 comme en production
make up      # ou le vrai conteneur, sur http://127.0.0.1:8380
make         # liste toutes les commandes
```

Depuis une autre machine : `ssh -L 8787:localhost:8787 jularthus@<serveur>`.

**Tests** (première fois : `make setup`) :

```sh
make check                              # contre make dev
make check URL=http://127.0.0.1:8380/   # contre le conteneur
```

Ils vérifient, en FR et en EN : erreurs console, défilement horizontal, tirets
cadratins, mouvement réduit, sans JS, bascule de langue, la page 404 et
`security.txt` (alerte un mois avant son expiration). Dans `tools/` :
`npm run interact` (terminal, palette, fiches), `npm run csp`,
`npm run lighthouse`, `npm run render` (régénère `og.jpg` et l'icône).

**Cache busting.** Le CSS et le JS sont liés avec un hash de leur contenu
(`site.css?v=3f9a1c2b`) ; le hook pre-commit (`make setup` l'active) le met à
jour dans les pages à chaque commit qui touche un style ou un script.

**Règles maison.** Pas de tiret cadratin dans les textes visibles (les tests
le vérifient). Tout nouveau texte visible a sa version anglaise dans
`public/assets/js/data.js`.

## Déployer

Comme les autres projets : Docker Compose derrière le nginx de l'hôte.

```sh
make deploy   # git pull + rebuild
make up       # rebuild depuis la copie locale
make logs     # suivre les logs
make down     # arrêter (nginx affiche alors la page de maintenance)
```

Le conteneur n'écoute que sur `127.0.0.1:8380`. Le vhost de l'hôte
(`ops/nginx/jularthus.fr.conf`, dans `/etc/nginx/sites-available/`) fait le
HTTPS et le proxy ; il garde aussi `/files/` et `/live/beers`. Les en-têtes de
sécurité, la page 404, le cache et le gzip viennent du nginx du conteneur
(`ops/nginx/site.conf`).

Passage depuis l'ancien site statique (une seule fois) :
`sudo ops/migrate-to-docker.sh`.

## Variables d'environnement

Voir `.env.example` (`cp .env.example .env`).

| Variable | Rôle |
|---|---|
| `PORT` | Port publié sur `127.0.0.1`, `8380` par défaut |

## Données et sauvegardes

Le site n'écrit rien à l'exécution : ce qu'il faut garder, c'est le dépôt
lui-même (aussi poussé sur GitHub).

```sh
make backup
```

Ajoute dans `data/backups/` un bundle git daté de tout le dépôt (branches et
tags), vérifié ; rien n'y est jamais supprimé. Pour restaurer :
`git clone data/backups/jularthus.fr-<date>.bundle`.

## Versions

Une branche par version : `v2.1` (ACDC / YAKA, le relais), `v2.2` (page 404,
`security.txt`), `v2.3` (conteneur, ces conventions). Tags : `v1` (le site
d'origine), `v2.0`, `v2-checkpoint`, `before-relay`.
Changer de version : `git switch <branche>` puis `make up`.
