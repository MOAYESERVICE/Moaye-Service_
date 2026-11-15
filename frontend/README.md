# Frontend MOAYE SERVICE

Interface Next.js 16 / React 19 / TypeScript. Le site écoute sur le port 3000 par défaut et communique avec l’API Express de `backend/`.

## Démarrage local

```powershell
npm ci
npm run dev
```

Ouvrir <http://localhost:3000>. Le backend et PostgreSQL sont nécessaires aux parcours de compte et de données. Les routes serveur Next.js sont dans `app/api/`.

## URLs API optionnelles

- `MOAYE_API_URL` est utilisé côté serveur, par défaut `http://localhost:4000/api`.
- `NEXT_PUBLIC_API_URL` est lu par le client API frontend, par défaut `http://localhost:4000`. Cette valeur est publique; ne jamais y placer un secret.

Créer `frontend/.env.local` seulement si les valeurs par défaut ne conviennent pas, puis redémarrer Next.js. Garder les secrets dans le backend.

## Commandes

- `npm run dev` : développement.
- `npm run lint` : ESLint.
- `npm run build` : compilation de production.
- `npm start` : servir la compilation construite.

Lire `AGENTS.md` avant toute modification Next.js et consulter le [guide complet du projet](../docs/PROJET_ET_FONCTIONNEMENT.md).
