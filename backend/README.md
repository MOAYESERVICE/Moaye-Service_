# Backend MOAYE SERVICE

API Express sous `/api`, connectée à PostgreSQL avec Prisma.

## Préparer l’environnement

Depuis ce dossier, copier `.env.example` vers `.env`. Renseigner `DATABASE_URL` et `JWT_SECRET` avec une valeur hexadécimale de 64 caractères. En local, `CORS_ORIGIN` doit inclure `http://localhost:3000`. Les clés IA sont nécessaires uniquement au fournisseur sélectionné.

PostgreSQL doit déjà fonctionner. Le fichier `docker-compose.yml` est vide et ne démarre pas de base locale.

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

API : port 4000 par défaut. `/api/health` vérifie Express et `/api/health/db` vérifie PostgreSQL.

## Commandes

- `npm run dev` : développement avec rechargement.
- `npm start` : démarrage normal.
- `npm test` : tests Jest.
- `npx prisma migrate deploy` : applique les migrations présentes.
- `npx prisma generate` : régénère le client depuis le schéma.

Voir le [guide complet](../docs/PROJET_ET_FONCTIONNEMENT.md). Ne jamais committer `.env`.
