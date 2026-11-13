// Charge l'application Express et les réglages du backend.
import app from "./app.js";
import { env } from "./config/env.js";

// Démarre le serveur sur le port défini dans le fichier .env.
app.listen(env.PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${env.PORT}`);
});
