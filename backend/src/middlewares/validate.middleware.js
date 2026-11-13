// Crée un middleware qui vérifie le contenu reçu
// en utilisant le schéma Zod passé en argument.
export function validateBody(schema) {
  // req contient la requête du client.
  // res sert à lui envoyer une réponse.
  // next demande à Express de poursuivre le traitement.
  return (req, res, next) => {
    // Vérifie si les données de req.body respectent le schéma.
    const result = schema.safeParse(req.body)

    // Si les données ne respectent pas le schéma, répond avec une erreur 400.
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Les données envoyées sont invalides",

        // Renvoie les noms des champs incorrects et les explications.
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      })
    }

    // Garde les données vérifiées et nettoyées par Zod.
    req.body = result.data

    // Les données sont valides : passe au prochain middleware ou contrôleur.
    next()
  }
}