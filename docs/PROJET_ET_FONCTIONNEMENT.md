# MOAYE SERVICE — guide du projet et audit technique

**État constaté dans le dépôt local `main` — 14 novembre 2026.** Ce document décrit le code/configuration présents. Il ne certifie pas les variables de production, la base distante ni chaque parcours déployé.

## 1. Fonction du projet

MOAYE SERVICE est un site de présentation et une application de gestion des activités agropastorales et aquacoles. Les visiteurs découvrent les activités, consultent les produits, demandent un devis ou contactent l’entreprise. Les clients suivent commandes et échanges. L’administration gère les demandes et contenus. Un assistant IA peut aider à décrire un projet.

Le dépôt contient des modèles de paiement, mais ne démontre pas l’intégration complète d’un prestataire d’encaissement.

## 2. Architecture et circulation

```text
Navigateur → frontend Next.js/React/TypeScript (port 3000)
           → routes serveur Next.js /api (sessions, cookies, relais)
           → backend Express (port 4000), routes sous /api
           → Prisma (modèle et migrations)
           → PostgreSQL
```

Le frontend et le backend sont deux projets npm indépendants avec leurs propres dépendances et fichiers lock. Le frontend rend l’interface et sert des handlers API pour la session et certains relais. L’API Express fournit les fonctionnalités métier. Les secrets de base, JWT et fournisseurs IA ne doivent jamais être exposés au navigateur.

## 3. Carte des dossiers et rôle des fichiers

### Racine

- `README.md` : démarrage et index de documentation.
- `docs/` : documentation fonctionnelle/technique.
- `DEPLOYMENT_UBUNTU.md`, `deploy.sh` : déploiement Linux.
- `MASTER_PLAN.md`, `VUE_ENSEMBLE.md`, `ANALYSIS_*.md`, `BILAN_GLOBAL_MOAYE_SERVICE.md` : plans et notes d’analyse, parfois historiques.
- `.vscode/` : préférences, tâches et extensions recommandées.

### Backend

- `src/server.js` valide les variables d’environnement et démarre Express.
- `src/app.js` configure Helmet, CORS, analyse JSON, journalisation, limite globale, fichiers statiques, routes et erreurs.
- `src/routes/index.js` assemble santé, auth, produits, commandes, profil, utilisateurs, panier, contact, devis, accueil et IA.
- `src/modules/` sépare les domaines métier : auth, cart, contact, homepage, orders, products, quotes, users. `categories` et `realisations` existent, mais aucun module de routes actif correspondant n’est monté dans le routeur racine.
- `src/middlewares/` contient auth, rôles, validation, limites et traitement des erreurs/téléversements.
- `src/config/` contient validation env, Prisma/PostgreSQL, CORS, journalisation, courrier.
- `src/services/`, `src/prompts/` : services et consignes IA/courrier.
- `prisma/schema.prisma` : entités, relations, enums; `prisma/migrations/` : historique SQL versionné.
- `generated/prisma/` : client généré, à régénérer après changement de schéma.
- `tests/` : tests Jest, notamment authentification et middleware.
- `seed*.js`, `seed*.mjs`, `seed-products.sql` : données initiales; lire avant exécution sur une base réelle.
- `uploads/` : fichiers produits conservés localement selon le middleware.

### Frontend

- `app/(public)/`, `app/(auth)/` : pages publiques et accès.
- `app/mon-compte/` : profil, commandes, devis, assistant, messages.
- `app/admin/` : interface d’administration.
- `app/api/` : handlers Next pour session, appels métier et médias.
- `components/` : interface par domaines `home`, `layout`, `shop`, `admin`, `account`, `assistant`, `quote`, `portal`, `ui`, `expertise`.
- `hooks/` : comportements auth, panier, compte, produits, chat, admin.
- `lib/` : client API, session serveur, validations, formatage, statistiques.
- `data/`, `types/` : contenus et types partagés.
- `public/` : images et médias statiques.
- `proxy.ts` : contrôle session/rôle sur `/admin` et `/mon-compte`.
- `AGENTS.md` : consignes spécifiques Next.js; à lire avant de modifier le frontend.

## 4. Parcours fonctionnels

- Catalogue, détails produit et cartes de la page d’accueil alimentés par le contenu et la base.
- Panier connecté persistant, création de commande et suivi de statut.
- Demande de devis avec coordonnées, lieu, budget et description; les demandes invitées sont prises en charge par une migration.
- Inscription, connexion, profil, déconnexion et renouvellement de session. Le backend a un modèle de refresh token; le frontend utilise des cookies HttpOnly.
- Contact et fil de messages avec réponses client/admin persistées.
- Administration protégée par rôle et session, avec gestion de comptes et contenus.
- Assistant IA pour conversation et résumé de demande; il dépend d’un fournisseur/modèle/secret disponibles.
- Vérifications serveur `/api/health` et base `/api/health/db`.

## 5. Données

Le schéma contient `User`, `RefreshToken`, `Category`, `Product`, `HomepagePhoto`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Quote`, `Contact`, `ContactReply`, `Review` et `Realization`. Les montants sont des entiers commentés comme centimes; confirmer devise et affichage métier avant modification.

## 6. Installation locale et VS Code

1. Ouvrir le dossier racine `MOAYE-SERVICE` dans VS Code.
2. Installer PostgreSQL séparément. Le fichier `backend/docker-compose.yml` est vide et ne démarre pas la base.
3. Copier `backend/.env.example` vers `backend/.env`; remplacer URL PostgreSQL et secret JWT. En développement `CORS_ORIGIN=http://localhost:3000`.
4. Exécuter `npm ci` dans `backend/` et dans `frontend/` (deux installations indépendantes).
5. Depuis `backend/` :

   ```powershell
   npx prisma generate
   npx prisma migrate deploy
   npm run dev
   ```

6. Depuis un deuxième terminal, dans `frontend/` : `npm run dev`.
7. Ouvrir <http://localhost:3000>. API locale par défaut : <http://localhost:4000>.

Dans VS Code, **Terminal → Exécuter la tâche** permet de lancer `MOAYE: Backend`, `MOAYE: Frontend`, les contrôles lint/build et les tests backend. Le démarrage automatique à l’ouverture a été retiré : la base et les secrets doivent d’abord être configurés. Les extensions de `.vscode/extensions.json` sont des recommandations; elles ne s’installent pas seules.

Le backend exige `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `JWT_SECRET` (64 caractères hexadécimaux) et `DATABASE_URL`, avec valeurs par défaut documentées dans `src/config/env.js`. Les clés IA sont conditionnelles au fournisseur choisi. `MOAYE_API_URL` est utilisé côté serveur par `proxy.ts` et `lib/server-auth.ts`; `NEXT_PUBLIC_API_URL` est lu par `lib/api.ts` et devient public. Ne jamais mettre un secret dans une variable `NEXT_PUBLIC_*`.

## 7. Contrôles à disposition

- `GET http://localhost:4000/api/health` : santé Express.
- `GET http://localhost:4000/api/health/db` : requête PostgreSQL simple.
- Depuis `backend/` : `npm test`.
- Depuis `frontend/` : `npm run lint`, puis `npm run build`.

## 8. Constats techniques vérifiés dans les fichiers

- Express applique Helmet, CORS selon `CORS_ORIGIN`, limite JSON de 64 Ko et limite générale de 100 requêtes/IP/minute sur `/api`.
- La limite globale n’établit pas à elle seule une politique dédiée pour les tentatives de connexion ou opérations sensibles.
- Le modèle et les routes de session montrent un refresh token; les analyses affirmant « JWT sans expiration » ou « aucun refresh token » sont obsolètes.
- Des tests d’authentification existent; « aucun test » est obsolète, mais la couverture n’a pas été mesurée par ce constat.
- Les images produits sont enregistrées sur le disque local et servies par Express. Un disque éphémère en hébergement peut perdre les fichiers lors d’un redéploiement; prévoir du stockage persistant/externe.
- `backend/docker-compose.yml` est vide.
- Le backend n’a pas de script `build`; son démarrage normal est `npm start`. Le frontend propose `dev`, `lint`, `build`, `start`.
- L’API est appelée via plusieurs handlers et chemins; vérifier `frontend/lib/api.ts`, `frontend/lib/server-auth.ts`, `frontend/proxy.ts` et `frontend/app/api/` avant de changer les URLs.

## 9. Points à clarifier ou améliorer

1. Rendre PostgreSQL local reproductible (compose opérationnel ou procédure d’installation détaillée).
2. Ajouter un exemple frontend non secret et clarifier les cas d’usage des deux URLs API.
3. Confirmer les limites de taille/type des images dans les middlewares d’upload; configurer un stockage durable en production.
4. Définir le véritable parcours de paiement : modèle de statut/méthode présent, encaissement fournisseur à confirmer.
5. Vérifier les secrets, migrations, CORS, sauvegardes et médias directement dans l’hébergement; le dépôt ne révèle pas l’état des consoles distantes.
6. Harmoniser les documents d’analyse anciens avec les versions actuelles du code.

## 10. Résultats des vérifications locales

Exécutées le 14 novembre 2026 dans le dépôt local :

- Les fichiers JSON de `.vscode/` sont valides.
- `frontend`: `npm run lint` échoue avec quatre erreurs et un avertissement. Les erreurs sont dans `app/admin/commandes/page.tsx` (appel de `loadOrders` avant sa déclaration selon la règle hooks) et dans `components/admin/PhotoLibrary.tsx` ainsi que `components/home/Hero.tsx` (règle `react-hooks/set-state-in-effect`). Le warning signale `setQ` inutilisé dans la page admin des commandes.
- `backend`: `npm test -- --runInBand` donne 1 suite passée (3 tests) et 2 suites en échec au chargement. Les mocks de `auth.refresh.test.js` n’exportent pas `replaceUserPassword`, et ceux de `auth.routes.test.js` n’exportent pas `changePassword`, attendus par les modules actuels. Les tests ont été exécutés sans modifier le code ni les mocks.
- `frontend`: le premier `npm run build` n’a pas pu télécharger DM Sans et Poppins depuis Google Fonts. Une seconde tentative avec le réseau autorisé s’est arrêtée sur une erreur interne Turbopack pendant le traitement CSS de `app/portal.css` (processus Node auxiliaire fermé avant connexion). Le build reste donc non validé.

Ces résultats décrivent une vérification ponctuelle et ne constituent pas une mesure exhaustive de sécurité, couverture ou fonctionnement en production.

## 11. Déploiement et sécurité

- Ne jamais committer `.env`, identifiants PostgreSQL, secrets JWT ou clés IA.
- Définir les secrets dans les consoles de l’hébergeur; ne pas les publier dans le frontend.
- Appliquer `npx prisma migrate deploy`, puis vérifier les journaux et routes de santé.
- Prévoir sauvegarde/restauration PostgreSQL et stockage durable des fichiers téléversés.
- Les offres gratuites, domaines, règles et dates cités dans les anciens bilans changent; confirmer ces données dans les consoles avant une décision.

## 12. Où intervenir pour une fonctionnalité

1. Page : `frontend/app/`; composant : `frontend/components/`.
2. Appel/session : `frontend/lib/` et handler associé dans `frontend/app/api/`.
3. API : `backend/src/routes/index.js`, puis le module métier correspondant.
4. Règles et données : validation, service/repository, puis `backend/prisma/schema.prisma`.
5. Un changement de schéma nécessite une nouvelle migration, `npx prisma generate` et une mise à jour de ce guide si les étapes locales changent.
6. Lire `frontend/AGENTS.md` avant un changement Next.js et utiliser les contrôles pertinents (lint, build, tests).
