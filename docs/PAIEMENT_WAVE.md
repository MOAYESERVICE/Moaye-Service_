# Paiement Wave

## État de l’intégration

Le checkout Wave crée une session auprès de Wave et enregistre la commande et le paiement en `PENDING` dans PostgreSQL. Le backend ne marque la commande `CONFIRMED` et le paiement `COMPLETED` qu’après réception d’un webhook Wave signé dont le montant et la devise correspondent à la commande.

Le checkout Wave reste indisponible tant que les secrets Wave et l’URL publique du frontend ne sont pas configurés dans Render. Les options de paiement par carte, virement et Paytech ne sont pas couvertes par cette intégration.

## Préparer Wave Business

1. Disposer d’un compte marchand Wave Business autorisé à utiliser Checkout API.
2. Dans le portail Wave Business, ouvrir la section Developer et créer une clé API avec accès Checkout. Activer la signature des requêtes et conserver la clé API ainsi que le secret de signature.
3. Dans Developer → Webhooks, enregistrer cette URL :

   `https://moaye-service-api.onrender.com/api/payments/wave/webhook`

4. S’abonner à l’événement `checkout.session.completed`, choisir la signature HMAC et conserver le secret webhook. Ce secret est distinct du secret de signature des requêtes API.

Wave n’affiche les secrets qu’au moment de leur création. Ne les envoyez pas par e-mail ou dans une conversation et ne les ajoutez pas à Git.

## Variables à configurer dans Render

Dans le service backend Render → Environment, ajouter :

- `WAVE_API_KEY` : clé API Wave Business.
- `WAVE_REQUEST_SIGNING_SECRET` : secret qui signe les requêtes API sortantes.
- `WAVE_WEBHOOK_SECRET` : secret de signature fourni lors de l’enregistrement du webhook.
- `PUBLIC_FRONTEND_URL` : `https://moaye-service.vercel.app`.

Après l’ajout des variables, redéployer le backend. Les clés restent uniquement sur le backend Render.

## Parcours en production

1. Le backend calcule le montant à partir des prix de la base PostgreSQL et crée la commande et son paiement Wave en attente.
2. Le backend demande une Checkout Session Wave en XOF et enregistre son identifiant dans `Payment.providerPaymentId`.
3. Le navigateur du client ouvre l’URL de paiement Wave.
4. À la notification Wave, le backend vérifie la signature HMAC, l’état, la devise et le montant avant de confirmer le paiement et la commande.

Le retour du navigateur après paiement n’est pas considéré comme une preuve de paiement. Seul le webhook signé met à jour les statuts en base.

## Test avant ouverture aux clients

- Enregistrer le webhook Wave et utiliser son outil de test pour vérifier la validation de signature.
- Effectuer un paiement sandbox si le compte Wave le permet.
- Vérifier dans PostgreSQL que `Payment.status` passe de `PENDING` à `COMPLETED` et que la commande passe de `PENDING` à `CONFIRMED`.
- Vérifier qu’un webhook répété n’entraîne pas de double traitement.
- N’activer les clés de production qu’après ces vérifications.
