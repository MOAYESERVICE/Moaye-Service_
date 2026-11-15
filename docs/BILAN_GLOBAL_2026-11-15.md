# Bilan global — MOAYE SERVICE

**État du code relevé le 15 novembre 2026**  
**Dépôt :** branche `main`, commit `47eee50` (`Ajuster la mise en page apiculture`), synchronisée avec `origin/main` au moment de ce bilan.

## Résumé

MOAYE SERVICE est une application web de présentation et de gestion pour des activités agricoles, d’élevage et d’aquaculture. Le dépôt contient un site Next.js, une API Express, une base PostgreSQL gérée par Prisma, un catalogue, les commandes, les devis, des espaces client et administrateur, un assistant IA et un parcours de paiement Wave.

Le code a été envoyé sur GitHub. **L’état “Ready” du dernier déploiement Vercel et le fonctionnement réel de toutes les fonctions sur Render n’ont pas été vérifiés dans les consoles d’hébergement.** Un commit sur GitHub ne suffit pas à prouver que le site public a fini son déploiement.

## Architecture et dossiers importants

- `frontend/` : Next.js, React et TypeScript. Le site public, le catalogue, le panier, les pages de compte et d’administration s’y trouvent.
- `backend/` : API Node.js/Express, règles métier, validation des requêtes, authentification et connexion Prisma à PostgreSQL.
- `backend/prisma/schema.prisma` et `backend/prisma/migrations/` : modèles et historique de migration de la base.
- `frontend/public/` : images et médias du site.
- `docs/` : guides techniques et fonctionnels.
- `.vscode/` : tâches et réglages de développement pour VS Code.

Les exemples du projet associent le frontend public à Vercel (`https://moaye-service.vercel.app`) et l’API à Render (`https://moaye-service-api.onrender.com`). Les variables et les réglages réels des services doivent être contrôlés dans leurs tableaux de bord.

### Démarrage local

Le README du dépôt demande une base PostgreSQL disponible, un fichier `backend/.env` configuré, puis deux terminaux VS Code : le backend sur le port 4000 et le frontend sur le port 3000. Les fichiers `backend/Dockerfile` et `backend/docker-compose.yml` existent, mais font actuellement **0 octet** : ils ne configurent ni conteneur utilisable ni base locale.

## Fonctions présentes dans le code

- Pages publiques : accueil, expertises, services, produits, réalisations, contact et demande de devis.
- Catalogue et panier, création et suivi de commandes.
- Comptes client, connexion, renouvellement de session et pages d’administration protégées par rôle.
- Devis, messages et réponses client–administration enregistrés dans PostgreSQL.
- Assistant IA configurable avec Groq ou OpenAI. Le prompt demande déjà des réponses concises par défaut : 2 à 4 phrases courtes, environ 50 à 90 mots, et moins si la question est simple.
- Paiement Wave Checkout côté backend, décrit plus bas.

Le schéma Prisma contient notamment `User`, `Product`, `Order`, `Payment`, `Quote`, `Contact`, `ContactReply`, `HomepagePhoto` et `RefreshToken`.

## Modifications récentes de l’accueil

- La vidéo d’accueil a été remise en lecture au démarrage. Les anciens visuels retirés de la liste des diapositives peuvent toutefois encore apparaître **dans la vidéo elle-même**.
- Le bloc qui présentait les systèmes piscicoles a été remplacé par un focus apiculture, avec une photo fournie par le propriétaire du site, un texte sur l’apiculture et la pollinisation, et un bouton de demande de devis.
- Sur ordinateur, le texte et le bouton sont à gauche, la photo à droite. La photo a été redimensionnée et son texte explicatif est posé plus bas sur l’image.
- Sur téléphone, le contenu suit l’ordre texte, photo, explication puis bouton. Sur les petits écrans, la photo prend presque toute la largeur avec une petite marge.
- Le contenu et les couleurs suivent le thème vert sombre et ambre du site.

Le code de ces changements est sur `main` selon l’état Git relevé ci-dessus. Pour confirmer le rendu public, vérifier que Vercel indique le commit courant comme déployé, puis ouvrir le site sans cache.

## Accès administrateur : problème constaté, cause à confirmer

La page de connexion prévue dans le code est `/connexion-admin`; l’espace d’administration se trouve sous `/admin`.

Les captures partagées montrent un échec de connexion en ligne avec le message « E-mail ou mot de passe incorrect ». Ensuite, pgAdmin a été connecté au serveur nommé `Render production`, à la base `moaye_service_db`, via l’adresse externe Render et le paramètre SSL `require`.

Dans cette base, les requêtes montrées à l’écran n’ont trouvé aucune ligne pour l’adresse d’administration indiquée : le résultat affichait **0 ligne**, puis une mise à jour du rôle affichait **0 ligne affectée**. Cela indique qu’au moment de la capture, aucune ligne correspondante n’était présente dans la base interrogée. **Cela ne prouve pas à lui seul pourquoi la connexion du site échoue** : il faut encore confirmer que Render et le site en ligne utilisent cette même base, et que l’adresse saisie est bien celle du compte attendu.

Les captures de connexion et les échanges mentionnent des adresses e-mail différentes. Il faut choisir l’adresse exacte destinée au compte administrateur et l’utiliser de la même façon pour la recherche dans PostgreSQL et la connexion au site.

À vérifier en priorité :

1. Dans Render, contrôler que `DATABASE_URL` du backend pointe vers la base de production attendue; ne pas copier cette valeur dans un document ou une conversation.
2. Dans pgAdmin, vérifier la base sélectionnée et rechercher l’adresse exacte du compte, sans afficher ni exporter le champ de mot de passe.
3. Confirmer que le compte existe, que son rôle est `ADMIN` et que `isActive` vaut `true`.
4. Si le compte doit être créé, utiliser une procédure de création sécurisée qui génère le hash du mot de passe. Ne jamais écrire un mot de passe en clair dans PostgreSQL.
5. Tester `/connexion-admin` sur le domaine public après confirmation du déploiement Vercel.

Le compte local et le compte de production sont stockés dans des bases distinctes tant que leur configuration ne prouve pas le contraire.

## PostgreSQL, Prisma et Render

- Le projet utilise Prisma avec PostgreSQL; pgAdmin est un outil séparé qui permet d’inspecter cette base.
- Pour un service Render, l’adresse **interne** sert aux connexions entre services Render. L’adresse **externe** sert, par exemple, à pgAdmin depuis l’ordinateur. La connexion externe configurée sur la capture utilisait SSL `require`.
- Prisma Studio a affiché « Could not load schema metadata ». Cette erreur d’introspection de Studio n’a pas été résolue dans cette intervention. La connexion pgAdmin à Render a été enregistrée, mais une connexion pgAdmin réussie ne valide pas à elle seule Prisma Studio ni toutes les opérations de l’API.
- Une capture Render du 15 novembre indiquait que la base gratuite expirerait le **14 décembre 2026**. Vérifier cette date dans Render et prévoir une sauvegarde ainsi qu’une solution de conservation des données avant toute expiration.
- Avant toute migration ou modification manuelle d’une base utilisée par des clients : confirmer la cible, disposer d’une sauvegarde récupérable et examiner la migration. Ne pas lancer un seed de développement sur la production.

## Paiements

### Wave

Le code backend contient un parcours Wave Checkout : création d’une commande et d’un paiement en attente, génération d’une session Wave en XOF, validation de la signature du webhook, vérification du montant et confirmation de la commande après l’événement signé. Le détail de configuration est dans [`PAIEMENT_WAVE.md`](PAIEMENT_WAVE.md).

Le portail Wave Business a montré un refus d’accès pour le numéro utilisé. L’accès marchand, les secrets Wave dans Render, l’URL de webhook et un paiement réel ou sandbox **n’ont pas été confirmés**. Donc l’intégration existe dans le code, mais il ne faut pas considérer l’encaissement de production comme testé ou opérationnel avant ces vérifications.

### Autres choix affichés au paiement

Le formulaire présente aussi carte bancaire, virement et Paytech. Le guide Wave précise que ces moyens ne sont pas inclus dans l’intégration Wave. Aucune intégration Orange Money ou MTN Mobile Money n’a été confirmée lors de cette intervention. Un choix affiché dans l’interface n’est pas la preuve qu’un prestataire encaisse effectivement le paiement.

## Déploiement et Docker

- Le dépôt Git `main` était synchronisé avec `origin/main` au moment du relevé. Le commit courant est `47eee50`.
- Le nom de domaine Vercel et l’URL Render API figurent dans les exemples de configuration et le guide Wave. L’état actuel du dernier build Vercel, du service API Render et de leurs variables secrètes reste à vérifier dans leurs tableaux de bord.
- Les fichiers Docker présents sont vides (0 octet). Le projet ne possède donc pas de configuration Docker Compose prête à lancer. Vercel et Render peuvent fonctionner sans Docker si leurs services sont configurés pour déployer le frontend et l’API directement; vérifier le mode réellement choisi dans les consoles.
- Les secrets (`DATABASE_URL`, `JWT_SECRET`, clés IA et clés Wave) doivent rester dans les variables d’environnement des services ou dans les `.env` locaux ignorés par Git. Ne pas les placer dans `NEXT_PUBLIC_*` ni les envoyer dans une capture publique.

## Suite conseillée

1. **Confirmer les déploiements** : dans Vercel, vérifier que le dernier déploiement de `main` est `Ready`; dans Render, consulter les journaux du backend et confirmer sa base liée.
2. **Résoudre l’accès admin** : comparer prudemment la base Render, l’adresse du compte, son rôle et son statut actif; créer ou corriger le compte uniquement par une méthode qui conserve le hash sécurisé.
3. **Protéger la base** : vérifier l’échéance Render affichée, créer et tester une sauvegarde avant toute échéance ou modification.
4. **Résoudre l’erreur Prisma Studio** : tester la configuration Prisma et les droits de lecture des métadonnées sur la bonne base, séparément de l’API de production.
5. **Activer les paiements Wave** : obtenir l’accès marchand, configurer les secrets et webhook dans Render, puis tester le cycle complet avant de l’annoncer comme disponible aux clients.
6. **Clarifier les autres moyens** : ne laisser carte, virement, Paytech, Orange ou MTN comme moyens « en ligne » que lorsqu’un parcours réel et confirmé existe pour chacun.
7. **Revalider le code** : lancer lint, compilation frontend et tests backend après les changements; les résultats historiques du guide technique datent du 14 novembre et n’ont pas été rejoués pour ce bilan.

## Documents de référence

- [`Guide technique et fonctionnement`](PROJET_ET_FONCTIONNEMENT.md)
- [`Configuration du paiement Wave`](PAIEMENT_WAVE.md)
- [`Compte rendu de la messagerie client–administration`](COMPTE_RENDU_MESSAGERIE_CLIENT_ADMIN.md)
- [`README du dépôt`](../README.md)
