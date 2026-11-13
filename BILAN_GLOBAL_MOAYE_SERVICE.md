# Bilan global du projet MOAYE-SERVICE

> **Complément des travaux récents — 13 novembre 2026**  
> Ce complément décrit les changements faits dans cette session. Il prévaut sur les descriptions plus anciennes du même sujet dans l’historique ci-dessous. Les captures partagées montrent des états du navigateur; elles ne confirment pas à elles seules chaque parcours après correction.

## Modifications récentes

### Typographie et bandeau d’accueil

- Les titres utilisent maintenant **DM Sans**; le texte courant conserve **Poppins**.
- Le bandeau d’accueil garde ses éléments en place après leur apparition. Les titres et le texte de la carte changent avec une transition; la carte conserve son emplacement.
- Les quatre cartes produits existantes conservent leur ordre et leurs dimensions. Leur contenu est lu depuis `HomepagePhoto`.
- Le cadrage des photos du poulet et de l’oie a été réglé sur l’image entière avec remplissage flouté dans l’accueil, les cartes du catalogue et les fiches produit.

### Cartes d’accueil et catalogue

- `HomepagePhoto` stocke le titre, le chemin de la photo, le texte alternatif, l’ordre et l’état visible/masqué. Le fichier image lui-même reste un fichier servi depuis `frontend/public` ou le stockage d’images du backend; PostgreSQL garde son chemin.
- L’écran **Administration → Photos** charge et modifie les cartes par l’API, au lieu de conserver les changements uniquement en mémoire. La lecture publique est ouverte; la lecture et la modification d’administration exigent une session admin côté backend.
- Les quatre cartes existantes doivent aussi correspondre à des produits enregistrés dans `Product`. La migration `20261113210000_add_homepage_cards_to_catalog` ajoute le lien entre les deux tables, crée les fiches manquantes et relie chaque carte à sa fiche produit.
- **État confirmé :** l’utilisateur a montré que `20261113200000_add_homepage_card_titles` s’est appliquée avec succès.
- **État non confirmé :** aucune capture ne confirme encore l’application de `20261113210000_add_homepage_cards_to_catalog`. Tant qu’elle n’est pas appliquée, le lien des quatre cartes avec le catalogue n’est pas actif en base.
- Lorsqu’un produit lié est modifié dans l’administration Photos, son titre et son image sont synchronisés avec la fiche `Product`. Les produits ajoutés dans l’administration Produits sont déjà chargés par le catalogue public; le choix des quatre cartes d’accueil reste géré par la photothèque.

### Panier et navigation

- Le compteur du panier est maintenant calculé à partir des produits réellement chargés dans le catalogue, comme le contenu affiché sur la page panier.
- Les anciennes clés du stockage navigateur comme `p1`, `p2`, `p3` et `p7` sont converties vers les identifiants produits actuels quand le nom correspond. Les références inconnues ou quantités invalides ne sont plus comptées.
- Pour un visiteur non connecté, le panier reste conservé dans le navigateur. L’ajout d’un produit tente aussi la synchronisation avec l’API lorsqu’une session existe; la commande synchronise le contenu avant l’envoi.
- Le menu déroulant des services a été retiré sur ordinateur et mobile. « Nos services » mène directement à `/services`; les services restent disponibles sur leur page.

### Fiche produit et avertissement Next.js

- La lecture de `params.id` de la page produit est placée sous une limite `Suspense` pour répondre à l’avertissement Next.js sur les données d’URL hors Suspense.

### Connexion des anciens comptes

- La connexion accepte maintenant le code à 4 chiffres des nouveaux comptes et l’ancien mot de passe à 12 chiffres des comptes déjà créés.
- Les empreintes bcrypt et les comptes enregistrés ne sont pas modifiés. L’inscription et le nouveau mot de passe restent limités au code de 4 chiffres.
- Le parcours n’a pas été vérifié avec un compte existant dans le navigateur; la modification conserve la vérification bcrypt déjà utilisée par l’API.

## Vérifications et état d’exécution

- `npx prisma generate` a réussi après l’ajout du lien entre `HomepagePhoto` et `Product`.
- L’utilisateur a confirmé par capture l’application de la migration des titres de cartes.
- Une tentative d’application de migration depuis l’environnement Windows de Codex a échoué parce que PostgreSQL n’était pas joignable sur `localhost:5432`. L’utilisateur a ensuite appliqué la migration des titres dans son terminal. La deuxième migration doit être appliquée depuis le terminal connecté à sa base.
- Les changements récents du panier, du cadrage, du menu et de Suspense n’ont pas été validés par un test automatisé ni par un nouveau parcours navigateur dans cette session. Le cadrage montré après correction devra être revu dans le navigateur.

Pour appliquer la migration restante depuis le terminal du backend dans VS Code :

```sh
cd backend
npx prisma migrate deploy
npx prisma migrate status
```

Après confirmation, ouvrir ou actualiser le catalogue et les cartes de l’accueil, puis modifier une carte dans **Administration → Photos** pour vérifier la synchronisation du titre et de l’image.

> **Mise à jour consolidée — 13 novembre 2026**  
> Cette synthèse placée en tête rassemble les travaux et demandes suivis dans VS Code. Les sections historiques ci-dessous décrivent des états antérieurs : lorsque leurs chiffres ou constats contredisent cette mise à jour, retenir la mise à jour la plus récente. Les captures d’écran sont des signalements, pas des preuves que chaque parcours a été validé après correction.

## État consolidé des travaux

### Architecture examinée

- **Frontend :** Next.js, React et TypeScript. Il comprend le site public, la boutique, l’espace client et l’administration.
- **Backend :** API Express en JavaScript, organisée par modules métier.
- **Données :** PostgreSQL accédé avec Prisma, schéma versionné par migrations.
- Les données manipulées couvrent notamment les utilisateurs et rôles, catégories et produits, paniers, commandes, paiements, devis, contacts et réponses de messagerie.
- L’analyse précédente a inspecté les métadonnées de la base de développement `moeye_service_dev`. Les comptages affichés plus bas sont un instantané de cette base à la date indiquée, pas une garantie sur la production ni sur son contenu actuel.

### Travaux et corrections consignés

1. **Comptes et accès administrateur**
   - L’inscription publique crée un compte client; l’attribution du rôle administrateur est réservée à une action contrôlée.
   - La page « Utilisateurs et rôles » et l’identité affichée dans le menu admin ont été raccordées aux comptes réels, sans exposer les empreintes de mots de passe.
   - Les routes de gestion des utilisateurs sont protégées côté backend; la dernière personne administratrice active ne peut pas se retirer ses propres droits ni être désactivée par cette opération.

2. **Commandes et catalogue**
   - Le parcours de commande a été harmonisé pour transmettre le téléphone, le code postal et le moyen de paiement choisi.
   - Les moyens de paiement affichés sont compatibles avec les valeurs reconnues par le backend. Cela n’équivaut pas à un paiement en ligne : le traitement transactionnel et la création/confirmation d’un paiement restent à intégrer ou à vérifier.
   - La gestion des produits et des contenus possède des formulaires d’ajout/modification; les images de produits sont limitées aux formats et tailles configurés par le backend. Une session administrateur valide reste nécessaire pour l’envoi.

3. **Messagerie client–administration**
   - Les demandes client sont conservées dans `Contact`; les réponses sont normalisées dans `ContactReply` avec auteur, rôle, texte et date.
   - Le backend vérifie la session et la propriété de la conversation. Le rôle et l’auteur proviennent de l’identité authentifiée, et les envois sont validés et limités en fréquence.
   - La migration `20261113170000_normalize_contact_replies` a été appliquée dans l’environnement montré dans le terminal, puis le client Prisma a été généré. La capture terminal indique que toutes les migrations présentes dans ce dépôt étaient alors appliquées (11 au statut montré).
   - La cloche client est alimentée par les réponses administratives et s’actualise périodiquement; la cloche ouvre les éléments correspondants dans la messagerie. L’actualisation périodique n’est pas une notification push du navigateur quand l’application est fermée.
   - Les détails, protections et limites de vérification sont consignés dans [`docs/COMPTE_RENDU_MESSAGERIE_CLIENT_ADMIN.md`](docs/COMPTE_RENDU_MESSAGERIE_CLIENT_ADMIN.md).

4. **Interface et affichage mobile**
   - Le menu téléphone des espaces client et admin s’ouvre en panneau plein écran, peut être fermé au clavier avec Échap et empêche le défilement de la page en arrière-plan.
   - Le tableau de bord admin a été adapté aux petits écrans : indicateurs compacts, actions réorganisées et tâches présentées sous une forme lisible.
   - Les tableaux de produits, utilisateurs, clients, commandes et contenus sont convertis en cartes adaptées au téléphone. Le tableau de bord client et le suivi de commande ont aussi été réorganisés pour éviter les tableaux ou étapes trop serrés.
   - Après un clic sur « Ajouter » ou « Modifier », l’écran défile maintenant jusqu’au formulaire, sur téléphone comme sur ordinateur. Cela concerne les produits et les contenus gérés par les modules d’administration.

5. **Photos mises en avant sur l’accueil**
   - Les quatre images affichées avec les produits vedettes étaient codées dans les données statiques du frontend; elles n’étaient pas enregistrées dans PostgreSQL.
   - La table Prisma `HomepagePhoto` conserve les chemins, titres, textes alternatifs, l’ordre et la visibilité des quatre cartes. La page d’accueil lit les cartes actives dans PostgreSQL; elle n’utilise plus la liste statique du frontend comme source de ces cartes.
   - Les fichiers image restent dans `frontend/public` ou dans le stockage du backend; PostgreSQL conserve leurs chemins, pas les octets des fichiers. Les quatre clés historiques sont `p1`, `p2`, `p3` et `p7`, pour `/poison.jpg`, `/poulet.jpg`, `/oies.jpg` et `/fond cage pour lapin.jpg`.
   - **État base :** l’utilisateur a confirmé l’application de `20261113180000_homepage_product_photos` et de `20261113200000_add_homepage_card_titles`. La capture pgAdmin antérieure montrait les quatre lignes actives. Le lien relationnel avec `Product` est ajouté par `20261113210000_add_homepage_cards_to_catalog`; son application reste à confirmer.

6. **Sessions, sécurité et base**
   - L’analyse et les notes précédentes consignent l’usage de jetons d’accès expirables, de jetons de renouvellement HttpOnly et d’une révocation à la déconnexion.
   - Le schéma Prisma comporte désormais les modèles de réponses persistantes de contact. La base doit être la même pour l’API et pour les migrations; une ancienne erreur `Contact.findMany()` venait d’un décalage entre le schéma/client Prisma et la base effectivement ciblée.
   - Aucun secret, mot de passe ni valeur de connexion n’est reproduit ici.

### Vérifications effectuées et limites

- Après les derniers changements d’interface, `npx tsc --noEmit` a réussi.
- Pour les photos d’accueil, `npx prisma validate`, `npx prisma generate`, `node --check` de la nouvelle route backend, TypeScript et ESLint ciblé ont réussi. La capture pgAdmin confirme que les quatre lignes de la migration sont présentes; le site lui-même reste à confirmer dans le navigateur après redémarrage éventuel du backend.
- ESLint ciblé a réussi pour les pages/composants d’interface mobile et de formulaires touchés. Un lint plus large a signalé une erreur préexistante dans `frontend/app/admin/commandes/page.tsx` autour de l’appel à `loadOrders`, ainsi qu’un setter de recherche non utilisé. Le lint global n’est donc pas annoncé comme entièrement propre.
- Les sorties fournies dans la conversation confirment l’application de la migration des réponses et l’exécution de `prisma generate` dans l’environnement de développement. La capture pgAdmin confirme ensuite les quatre lignes de `HomepagePhoto`; le dépôt contient 12 migrations.
- Les parcours n’ont pas tous été rejoués dans un navigateur après les corrections. Les migrations n’ont pas été appliquées à une base de production dans le cadre de ce bilan. Aucun test automatisé complet ni audit externe n’est déclaré.

### Points à traiter en priorité

1. **Remplacer le code d’accès de 4 chiffres par un mot de passe robuste** ou le présenter comme un PIN avec une vraie limitation des tentatives, temporisation/verrouillage et récupération sécurisée. Quatre chiffres seuls ne sont pas adaptés à la sécurité d’un compte d’entreprise.
2. **Vérifier le parcours devis de bout en bout** : l’analyse précédente relève encore des écarts possibles entre les champs envoyés par le frontend, les champs attendus par le backend et l’authentification par cookie.
3. **Vérifier les appels profil/session restants** : l’analyse précédente relève un appel qui semble encore chercher un jeton dans `localStorage` alors que la session courante utilise un cookie HttpOnly.
4. **Finaliser le paiement réel** : la sélection du moyen de paiement n’est pas une confirmation de paiement; vérifier les écritures `Payment`, le statut et les retours du prestataire.
5. **Protéger l’historique commercial** : revoir les suppressions en cascade entre utilisateurs, produits, commandes et lignes de commande; privilégier l’archivage quand l’historique doit être conservé.
6. **Faire un contrôle fonctionnel navigateur** des notifications client/admin et des formulaires (ajout, modification, téléversement, message, réponse) avec un compte client puis un compte admin, sur mobile et ordinateur.

### Mode d’emploi rapide

- Projet ouvert dans VS Code : dossier `MOAYE-SERVICE`.
- Frontend : `frontend/`.
- Backend, Prisma et migrations : `backend/`.
- Compte rendu détaillé de la messagerie : `docs/COMPTE_RENDU_MESSAGERIE_CLIENT_ADMIN.md`.
- Pour une migration, confirmer d’abord que `DATABASE_URL` cible la base voulue. En développement, utiliser les scripts du `package.json` backend; en production, déployer uniquement les migrations validées avec `prisma migrate deploy` et sauvegarder la base avant une opération de schéma.

Pour appliquer les migrations en attente depuis le dossier du backend dans le terminal VS Code :

```sh
cd backend
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status
```

Après succès, la requête de vérification dans pgAdmin est :

```sql
SELECT "productKey", "productId", "title", "imageUrl", "alt", "position", "isActive"
FROM public."HomepagePhoto"
ORDER BY "position";
```

---

**Date de l’analyse initiale :** 13 novembre 2026  
**Dernière vérification documentée :** après application de la migration des réponses Contact du 13 novembre 2026  
**Périmètre :** frontend, backend, schéma Prisma, migrations et base PostgreSQL configurée.  
**Méthode :** revue statique du code et inspection PostgreSQL en lecture seule. Aucune donnée personnelle n’a été affichée et aucune donnée n’a été modifiée.

## 1. Résumé exécutif

MOAYE-SERVICE est une application de commerce et de services agropastoraux composée d’un frontend Next.js et d’une API Express indépendante. Prisma gère une base PostgreSQL organisée autour des utilisateurs, produits, paniers, commandes, paiements, devis et contenus associés.

La fondation technique est cohérente : séparation frontend/backend, validation de plusieurs entrées, authentification JWT avec expiration, rôles d’accès sur les opérations produit, et migrations versionnées. L’analyse initiale comptait huit migrations; trois autres ont depuis été ajoutées, portant le dossier à onze. La sortie du terminal après `migrate deploy` confirme que les migrations en attente ont été appliquées dans la base de développement ciblée.

Des corrections ont été apportées depuis l’analyse initiale : le checkout recueille maintenant le code postal et propose des valeurs de paiement compatibles avec le backend; les routes contact/devis sont raccordées; le renouvellement et la révocation des sessions sont intégrés. La vérification TypeScript passe désormais. Des écarts persistent dans la soumission des devis et la mise à jour du profil.

## 2. Architecture constatée

```text
Navigateur
   │
   ├── Frontend Next.js / React / TypeScript
   │     Pages publiques, boutique, espace client, administration
   │     Routes API Next.js servant de proxy pour certaines opérations
   │
   └── API Express / JavaScript
         Authentification, produits, commandes, profil, panier, IA
         │
         ├── Prisma ORM
         └── PostgreSQL
```

### Frontend

- Application Next.js avec routes sous `frontend/app`, composants React dans `frontend/components`, logique réutilisable dans `frontend/hooks` et `frontend/lib`.
- Pages publiques : accueil, produits, services, expertise, réalisations, devis, contact, assistant et informations légales.
- Espaces client et administrateur présents dans l’arborescence.
- TypeScript, React Hook Form et Zod sont utilisés pour plusieurs formulaires.
- Les produits sont récupérés depuis l’API; des routes Next.js transmettent aussi des opérations d’authentification, de panier, de commande et d’administration.

### Backend

- Express 5 avec modules métier organisés dans `backend/src/modules`.
- Modules/routage actuellement raccordés : authentification, produits, commandes, profil, panier, contact, devis, santé et assistant IA.
- Services d’accès à PostgreSQL via Prisma et l’adaptateur PostgreSQL.
- Protections présentes : Helmet, CORS, limite globale de débit, validation d’entrées sur certaines routes, hachage des mots de passe, JWT, rôles et limite/validation de format pour les images produit.

### Modèle de données Prisma

Le schéma décrit les tables `User`, `Category`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Quote`, `Contact`, `Review`, `Realization` et `RefreshToken`, ainsi que des enums de rôles, états de commande, paiements et contacts.

Les relations couvrent les principaux besoins : un utilisateur peut avoir des commandes, un panier, des devis et des jetons de renouvellement; les produits appartiennent à une catégorie et peuvent apparaître dans des paniers, commandes et avis.

## 3. État réel de PostgreSQL inspecté

La connexion configurée a répondu avec une base nommée **`moeye_service_dev`**, sur PostgreSQL 18.6. Ce nom diffère de l’orthographe du projet `MOAYE-SERVICE`; vérifiez qu’il s’agit bien de la base attendue et pas d’une ancienne base de développement.

| Table | Lignes constatées |
|---|---:|
| User | 11 |
| Category | 6 |
| Product | 8 |
| Cart | 2 |
| CartItem | 0 |
| Order | 0 |
| OrderItem | 0 |
| Payment | 0 |
| Quote | 0 |
| Contact | 0 |
| Realization | 0 |
| Review | 0 |
| RefreshToken | 0 |

Lors de la dernière vérification, les 11 comptes se répartissent en 10 `CUSTOMER` et 1 `ADMIN`. Les huit produits sont au statut `IN_STOCK`. La répartition produit/catégorie observée : Alevins 1, Aliments 1, Équipements aquacoles 3, Intrants agricoles 0, Matériel d’élevage 2, Poissons et volailles 1.

Au moment de cette inspection historique, les **huit migrations présentes alors** figuraient comme appliquées dans `_prisma_migrations`. Depuis, trois migrations supplémentaires ont été ajoutées : devis invités, réponses persistantes et normalisation des réponses Contact. La capture du terminal après `migrate deploy` confirme que toutes les migrations en attente ont été appliquées dans la base de développement ciblée. Cette vérification ne couvre pas une éventuelle base de production distincte.

## 4. Constats et risques prioritaires

### P0 — À régler avant de considérer les commandes comme opérationnelles

#### Le checkout enregistre le choix, mais aucun paiement n’est créé

Les dernières corrections harmonisent le formulaire, le schéma frontend et le backend : le code postal est présent, les options utilisent `CARD`, `BANK_TRANSFER`, `WAVE` et `PAYTECH`, et la requête transmet `shippingPhone`, `shippingZip` et `paymentMethod`. Le contrôleur stocke le téléphone et le moyen choisi dans `Order`.

Le contrôleur ne crée toutefois pas de ligne dans la table `Payment`; le moyen est stocké uniquement sur `Order`. Le nom et l’e-mail saisis au checkout ne sont pas conservés comme instantané sur la commande, qui reste liée au compte utilisateur.

**État :** les erreurs TypeScript du checkout sont corrigées et le code postal peut être saisi. Le paiement transactionnel n’est pas intégré; l’interface indique que ces options sont à confirmer ou disponibles prochainement.

Fichiers concernés : `frontend/components/shop/CheckoutForm.tsx`, `frontend/lib/api.ts`, `frontend/app/api/orders/route.ts`, `backend/src/modules/orders/orders.controller.js`, `backend/prisma/schema.prisma`.

#### Contact est raccordé; le devis reste incompatible avec le backend

Les routes `/api/contact` et `/api/quotes` sont maintenant montées dans le routeur Express et ont des contrôleurs. Le contact est public et validé. En revanche, `sendQuote` envoie encore le jeton depuis `localStorage` alors que la session utilise des cookies HttpOnly; il transmet aussi les champs frontend (`type`, `stage`, `budget`, `location`, etc.) sans les convertir en `title` et `description` exigés par le backend.

**Conséquence :** le formulaire de devis risque d’obtenir une réponse 401 sans jeton et/ou une erreur 400 de validation. Il faut adapter son appel au proxy de session et convertir explicitement les champs au format attendu.

Fichiers concernés : `frontend/lib/api.ts`, `backend/src/routes/index.js`.

Les fonctions de lecture et de modification des commandes, contacts et devis utilisent aussi `fetchWithSession` avec l’URL directe du backend. Cette fonction renouvelle la session sur un 401, mais elle ne joint pas le cookie HttpOnly ni ne pose un en-tête `Authorization` Bearer sur ces appels. Les routes correspondantes exigent pourtant `requireAuth`.

**Conséquence :** ces opérations protégées risquent de continuer à recevoir 401 après le renouvellement, car la requête réessayée reste sans jeton. Il faut les faire passer par des routes proxy Next.js qui lisent le cookie et transmettent le Bearer token.

### P1 — Authentification et accès opérateur

#### Renouvellement de session désormais raccordé

Le backend émet un jeton d’accès valable 15 minutes et un refresh token valable 7 jours, stocké en base. Le frontend place maintenant les deux jetons dans des cookies HttpOnly; `/api/auth/refresh` renouvelle la session, `/api/auth/me` tente le renouvellement si nécessaire et la déconnexion appelle la révocation backend.

**État :** le défaut initial de renouvellement/révocation paraît corrigé dans le code relu. Les appels qui utilisent `fetchWithSession` réessaient après un 401. Certains appels directs, notamment profil et devis, n’utilisent pas encore ce flux.

Fichiers concernés : `backend/src/utils/jwt.js`, `backend/src/modules/auth/auth.routes.js`, `backend/src/modules/auth/auth.service.js`, `frontend/lib/server-auth.ts`, `frontend/app/api/auth/logout/route.ts`.

#### Compte administrateur provisionné

Un compte existant a maintenant été passé à `ADMIN` par une mise à jour ciblée dans PostgreSQL, puis le rôle `ADMIN` a été relu et confirmé. Le formulaire de connexion comparait auparavant `ADMIN` en majuscules alors que le frontend reçoit `admin` en minuscules; cette comparaison a été corrigée. Le proxy d’envoi d’image indique maintenant de se reconnecter lorsque le cookie de session admin est absent. L’inscription publique continue de créer des comptes `CUSTOMER`, ce qui évite l’auto-attribution de privilèges administrateur.

**À faire côté navigateur :** actualiser la page puis se reconnecter avec ce compte. L’accès au tableau de bord n’a pas été testé en direct dans le navigateur.

#### Mise à jour du profil avec un ancien mode de session

La fonction `saveProfile` cherche un jeton `authToken` dans `localStorage`, alors que le flux de connexion actuel utilise un cookie HttpOnly. Elle transmet donc potentiellement une requête de profil sans le jeton attendu par Express.

Fichiers concernés : `frontend/lib/api.ts`, `frontend/lib/server-auth.ts`.

### P1 — Conservation des données commerciales

#### Les suppressions en cascade peuvent effacer l’historique

La base confirme notamment que supprimer un produit supprime aussi ses `OrderItem` et avis; supprimer un utilisateur efface ses commandes et devis. Pour une application commerciale, l’effacement d’un produit ou d’un compte ne devrait généralement pas supprimer les pièces historiques associées.

**Recommandation :** examiner les règles de suppression, préférer l’archivage/désactivation et protéger les lignes de commande historiques. Toute modification de ces règles doit être accompagnée d’une migration planifiée.

Fichiers concernés : `backend/prisma/schema.prisma`, migrations SQL du dossier `backend/prisma/migrations`.

### P2 — Cohérence fonctionnelle et qualité

- Les fonctions frontend de mot de passe oublié et de réinitialisation renvoient explicitement une erreur « non disponible »; elles ne sont pas opérationnelles malgré les pages/formulaires associés.
- La création de compte accepte maintenant un code secret exactement composé de 4 chiffres, avec validation côté frontend et backend. C’est plus simple à retenir, mais moins sûr qu’un mot de passe long; les comptes existants et la connexion ne sont pas modifiés.
- Plusieurs écrans d’administration existent, mais les modules de routes backend visibles couvrent surtout les produits, commandes, authentification et profil. Vérifier écran par écran si les données sont persistées ou encore statiques.
- Le dossier `backend/tests` contient le setup mais aucun fichier de test détecté dans ce dossier. Les scripts `test-api.js` et `test-orders.js` sont des scripts à examiner séparément; la couverture automatisée n’a pas été exécutée dans cette analyse.
- L’API ne montre pas de pagination pour les listes de produits et de commandes. À faible volume cela reste gérable, mais il faudra la prévoir à mesure que les données augmentent.
- Le lint signale une erreur dans `frontend/app/admin/commandes/page.tsx` : le `useEffect` appelle `loadOrders` avant sa déclaration selon la règle React Hooks `immutability`. Il signale aussi `setQ` non utilisé.
- Des index simples doublent des index uniques sur `Payment.orderId` et `RefreshToken.token`. Ils sont probablement redondants; confirmer les usages et plans de requête avant de les modifier.
- La migration `20261106004535_add_all_models` supprime l’ancienne colonne `Product.category` puis ajoute `categoryId` obligatoire sans valeur par défaut. Elle porte un avertissement de perte et d’impossibilité d’application sur une table Product déjà remplie sans préparation. Elle est déjà marquée appliquée sur la base inspectée; l’avertissement concerne une réapplication ou une autre base non migrée.

## 5. Recommandations de mise en œuvre

### Étape 1 — Fiabiliser les parcours métier

1. Décider si un enregistrement de paiement doit être créé à la commande ou seulement après confirmation; actuellement seul le moyen est stocké dans `Order`.
2. Convertir les champs de devis au format du backend et transmettre l’authentification via les cookies de session.
3. Tester les parcours complets de commande, panier, contact et devis avec des comptes et données de test.

### Étape 2 — Fermer les écarts d’authentification

1. Faire passer la mise à jour du profil par le proxy serveur déjà utilisé par la session HttpOnly.
2. Vérifier les appels directs restants et les migrer vers `fetchWithSession` ou un proxy adapté.
3. Garder une procédure contrôlée pour attribuer ou révoquer le rôle `ADMIN`, hors inscription publique, et vérifier périodiquement les permissions côté API.

### Étape 3 — Protéger les données et préparer l’exploitation

1. Revoir les suppressions en cascade et introduire l’archivage là où l’historique doit survivre.
2. Mettre en place des tests automatisés pour l’authentification, les permissions, les commandes, les paiements et les migrations.
3. Vérifier les variables d’environnement pour développement et production; confirmer explicitement la base cible avant toute migration.
4. Ajouter pagination aux listes administratives et documenter les endpoints/API et les procédures de sauvegarde/restauration.

## 6. Conclusion

Le projet possède une architecture exploitable et une base PostgreSQL migrée. Les corrections récentes ont résolu le décalage de types du checkout, ajouté le code postal et raccordé les champs commande/contact. Un compte administrateur est maintenant provisionné dans la base inspectée. Le paiement transactionnel, le mapping du devis et le profil avec session HttpOnly restent à traiter.

## Fichiers de référence

- Backend : `backend/src/app.js`, `backend/src/routes/index.js`, `backend/src/modules/`
- Base et migrations : `backend/prisma/schema.prisma`, `backend/prisma/migrations/`
- Frontend : `frontend/app/`, `frontend/components/`, `frontend/lib/`
- Notes d’analyse antérieures : `ANALYSIS_SUMMARY.md`, `ANALYSIS_PART2.md` — à considérer comme des notes historiques, car certains constats ne correspondent plus au code observé.

## Annexe — Synthèse complémentaire frontend/backend

Cette annexe reprend les constats techniques détaillés qui complètent le résumé exécutif :

1. **Commande :** le téléphone, le code postal et le mode sont transmis et stockés dans `Order`. Le contrôleur ne crée pas d’enregistrement `Payment`.
2. **Contact et devis :** les deux routes backend sont désormais montées. Le devis a toujours un décalage d’authentification et de format entre le frontend et le schéma backend.
3. **Session :** le renouvellement, les cookies HttpOnly et la révocation à la déconnexion sont maintenant raccordés dans le frontend.
4. **Profil :** une fonction frontend envoie encore un bearer token lu dans `localStorage`, alors que la session actuelle est placée dans un cookie HttpOnly.
5. **Prisma et intégrité :** les migrations sont appliquées sur la base inspectée. La migration de conversion des catégories contient un avertissement de perte de colonne; les suppressions en cascade peuvent effacer des lignes liées à l’historique commercial.

Les protections déjà présentes comprennent la validation Zod sur plusieurs routes, le hachage des mots de passe, l’expiration des JWT, des contrôles de rôle sur les opérations produit, une limite globale de requêtes et la validation des fichiers image produit (PNG/JPG/WEBP, 5 Mo maximum).

**Portée et limites :** l’analyse inclut le schéma/migrations et des inspections en lecture seule des métadonnées et agrégats PostgreSQL; le rôle du compte demandé a été modifié explicitement puis confirmé. Aucun mot de passe ni contenu personnel de compte n’a été consulté. L’instantané historique de la base `moeye_service_dev` contenait 11 utilisateurs (10 `CUSTOMER`, 1 `ADMIN` après la mise à jour), 8 produits, aucune commande ni paiement. Le dépôt contient aujourd’hui 11 migrations; leur application dans l’environnement de développement est confirmée par la sortie du terminal. Ces chiffres ne sont pas une lecture en temps réel de la base. La règle de code à quatre chiffres passe `npx tsc --noEmit`, ESLint ciblé et `node --check` du validateur backend. `npm run lint -- --no-cache` reste en échec sur `frontend/app/admin/commandes/page.tsx` avec une erreur React Hooks; il signale également `setQ` inutilisé. Aucun téléversement réel n’a été possible sans cookie de session valide.
