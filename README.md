# MOAYE SERVICE

Application web de présentation et de gestion des activités agropastorales : catalogue, devis, commandes, espace client, administration et assistant IA.

## Documentation

- [Guide complet du projet](docs/PROJET_ET_FONCTIONNEMENT.md)
- [Guide du frontend](frontend/README.md)
- [Guide du backend](backend/README.md)
- [Déploiement Ubuntu](DEPLOYMENT_UBUNTU.md)
- [Consignes Next.js](frontend/AGENTS.md)

`ANALYSIS_SUMMARY.md` et `ANALYSIS_PART2.md` sont des notes historiques; certains constats sont dépassés par le code actuel.

## Prérequis

- Node.js 20.9+ recommandé, npm et PostgreSQL accessible.
- Un `JWT_SECRET` de 64 caractères hexadécimaux.
- Une clé IA uniquement si l’assistant IA est utilisé.

## Démarrage local

La base PostgreSQL doit être disponible avant de démarrer le backend. `backend/docker-compose.yml` est vide actuellement.

Dans `backend/`, créer `.env` depuis `.env.example`, renseigner les valeurs locales, puis :

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Dans un second terminal, depuis `frontend/` :

```powershell
npm ci
npm run dev
```

Ouvrir <http://localhost:3000>. L’API écoute par défaut sur <http://localhost:4000>. Ne jamais versionner les fichiers `.env`.

## Commandes utiles

| Dossier | Commande | Usage |
|---|---|---|
| backend | `npm run dev` | API en développement |
| backend | `npm start` | API normale |
| backend | `npm test` | Tests Jest |
| backend | `npx prisma migrate deploy` | Appliquer les migrations |
| frontend | `npm run dev` | Site en développement |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` | Compilation production |

Dans VS Code, ouvrir le dossier racine du dépôt. Lancer séparément les tâches `MOAYE: Backend` et `MOAYE: Frontend` après configuration de la base.
