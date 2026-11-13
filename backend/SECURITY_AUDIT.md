# Audit de sécurité du backend MOAYE-SERVICE

Date : 13 novembre 2026  
Périmètre : lecture statique du backend Express, des contrôles d'authentification et du schéma Prisma/PostgreSQL présents dans le dépôt. Aucun test d'intrusion ni accès à la base de production n'a été effectué.

## Conclusion

Le backend possède de bonnes protections de base : mots de passe hachés avec bcrypt, jetons d'accès courts, vérification des rôles côté serveur, contrôle de propriété de certaines ressources, validation de plusieurs formulaires, Helmet, limite de taille JSON et contrôle du type réel des images téléversées.

Je ne le qualifierais toutefois pas encore de suffisamment sûr pour des comptes clients en production. Le risque principal est le mot de passe client limité à quatre chiffres. D'autres améliorations sont nécessaires pour éviter les abus coûteux, les fuites d'erreurs internes et la perte de données de commande.

## Constats prioritaires

### Élevé — mot de passe client de quatre chiffres

L'inscription dans `src/modules/auth/auth.validation.js` n'accepte qu'un code numérique de quatre chiffres. Cela ne représente que 10 000 possibilités. bcrypt ralentit la vérification hors ligne en cas de fuite de la base, mais ne rend pas le code plus imprévisible. La limite actuelle de dix tentatives par IP sur quinze minutes aide contre les essais simples, mais ne bloque pas une attaque distribuée ou des IP renouvelées.

**Action recommandée :** demander une phrase de passe robuste (au moins 12 caractères) pour le compte Internet. Si l'expérience exige un code à quatre chiffres, le réserver à un verrouillage local/appareil après une authentification forte, ou ajouter un second facteur et une limitation par compte avec délais progressifs. Ne pas présenter le code seul comme une protection suffisante.

### Élevé — endpoints IA publics avec consommation facturable

`src/routes/ai.js` autorise les appels de chat et de résumé sans authentification, jusqu'à vingt appels par minute et par IP. Un visiteur peut donc consommer le quota/facturation du fournisseur IA. La limite est locale au processus et peut être contournée par des requêtes réparties sur plusieurs adresses.

**Action recommandée :** appliquer des quotas journaliers et mensuels côté serveur, un plafond de coût fournisseur, une limite par compte ou session, et une protection contre les abus adaptée au trafic public. Utiliser un stockage partagé pour les limites lorsque plusieurs instances tournent.

### Moyen — erreurs internes renvoyées au client

`src/middlewares/errorHandler.js` renvoie `err.message` même en production. La pile et `details` sont masqués hors développement, ce qui est bien, mais les messages d'erreurs Prisma, système ou fournisseur peuvent encore révéler des noms de tables, contraintes ou détails d'infrastructure. Les mêmes erreurs sont également consignées côté serveur.

**Action recommandée :** ne renvoyer que les messages d'erreurs API explicitement considérés comme sûrs. Pour les erreurs inattendues (HTTP 5xx), renvoyer un message générique avec un identifiant de suivi et garder le détail dans les journaux protégés.

### Moyen — configuration de production permissive par défaut

`src/config/env.js` définit `NODE_ENV` à `development` par défaut. Si le déploiement oublie ce réglage, le serveur se comporte comme en développement : CORS accepte les origines localhost sur tous les ports et le gestionnaire d'erreurs inclut détails et pile.

**Action recommandée :** exiger explicitement `NODE_ENV=production` en déploiement, ou supprimer cette valeur par défaut et faire échouer le démarrage si l'environnement n'est pas choisi.

### Moyen — quantités de panier insuffisamment bornées

Dans `src/modules/cart/cart.controller.js`, les routes d'ajout et de modification de quantité lisent `req.body` sans appliquer les schémas `addToCartSchema` et `updateCartItemSchema` disponibles dans `src/utils/validators.js`. Elles ne fixent pas de maximum cohérent. La synchronisation complète du panier, elle, limite chaque quantité à 999. Le panier vérifie l'existence d'un produit, mais ces routes ne refusent pas systématiquement un produit marqué indisponible.

**Action recommandée :** appliquer une validation stricte commune aux trois routes de panier, borner les quantités et vérifier la disponibilité avant ajout. Refaire également le contrôle de stock de façon atomique au moment de créer la commande.

### Moyen — les commandes ne réservent ni ne revérifient le stock

`src/modules/orders/orders.controller.js` recalcule correctement le prix depuis les produits en base, mais crée la commande depuis les articles du panier sans revérifier le statut de stock dans la transaction. Deux commandes concurrentes peuvent aussi dépasser la disponibilité si un stock chiffré est ajouté plus tard. La création de commande et la suppression du panier sont deux opérations séparées : si la seconde échoue, une nouvelle tentative peut créer une commande en double.

**Action recommandée :** créer la commande et vider le panier dans une transaction, revérifier la disponibilité à cet endroit, et prévoir une clé d'idempotence pour les soumissions répétées.

### Moyen — jetons de renouvellement conservés en clair en base

`src/modules/auth/refreshToken.repository.js` stocke le JWT de renouvellement entier dans la colonne unique `RefreshToken.token`. La rotation et la révocation sont en place, mais une fuite de sauvegarde/base peut fournir des jetons réutilisables jusqu'à leur révocation/expiration.

**Action recommandée :** stocker une empreinte cryptographique du refresh token et comparer les empreintes lors de la rotation. Protéger aussi les sauvegardes et limiter l'accès SQL au strict nécessaire.

### Moyen — données et historique peuvent être supprimés en cascade

Dans `prisma/schema.prisma`, la relation `OrderItem.product` est configurée avec `onDelete: Cascade`. La suppression d'un produit peut donc effacer ses lignes d'articles de commande et détériorer l'historique commercial. Les routes admin exposent aussi une suppression définitive de commande.

**Action recommandée :** conserver un instantané du nom du produit dans la ligne de commande et interdire la suppression définitive des produits/commandes ayant un historique. Préférer l'archivage et des sauvegardes testées.

### Moyen — limites de requêtes dépendantes d'une seule instance et de l'IP

La limite générale de 100 requêtes/minute et les limites spécifiques utilisent le stockage mémoire par défaut de `express-rate-limit`. Les compteurs redémarrent avec le processus et ne sont pas partagés entre instances. Selon le reverse proxy et son adresse IP, plusieurs clients peuvent également être confondus ou les limites être moins efficaces.

**Action recommandée :** configurer explicitement les proxies de confiance pour l'hébergement réel et utiliser un stockage partagé (Redis, par exemple) pour les limites de connexion, d'inscription, de contact et d'appels IA.

## Protections déjà observées

- Inscription sans champ de rôle fourni par le client; les routes d'administration contrôlent `ADMIN` côté serveur.
- bcrypt avec facteur de travail 12.
- Jetons d'accès de 15 minutes et de renouvellement de sept jours; le middleware d'accès vérifie le type du jeton et la rotation/révocation des refresh tokens est présente.
- Vérification d'appartenance à l'utilisateur sur la lecture de commandes, devis et éléments de panier concernés.
- Téléversement d'image réservé à l'administrateur, une image de 5 Mo maximum, types PNG/JPEG/WEBP et vérification de signature avant écriture sous un nom UUID.
- Helmet, CORS configuré, JSON limité à 64 Ko et requêtes SQL construites via Prisma.

## Capture du formulaire d'inscription

La capture jointe affiche encore « au moins 12 caractères », tandis que la copie Windows du dépôt inspectée contient maintenant une validation backend de quatre chiffres. Cela suggère une page alimentée par une autre copie du projet ou un serveur frontend non redémarré. L'accès WSL de cette session a été refusé, donc je n'ai pas pu vérifier la copie Ubuntu ni confirmer quel serveur sert la page. Il faut que le frontend et le backend appliquent la même politique avant de modifier le message affiché.

## Limites de l'audit

Cette lecture ne confirme pas les réglages réels de l'hébergeur, du reverse proxy, du pare-feu PostgreSQL, des sauvegardes, des secrets de production ni des dépendances contre les avis de sécurité du jour. Le fichier `.env` et les données réelles de la base n'ont pas été lus. Aucun essai sur un système en production n'a été effectué.
