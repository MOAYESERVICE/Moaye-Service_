import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { streamChat, summarize } from "../services/ai.js";

const router = express.Router();

// Limite les appels pour éviter qu'une même adresse envoie trop de requêtes.
const limiter = rateLimit({
  windowMs: 60_000, // Période de calcul : 1 minute.
  limit: 20, // Maximum : 20 appels pendant cette période.
  standardHeaders: true,
  legacyHeaders: false,
});

// Décrit la forme attendue pour les messages envoyés par le frontend.
const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        // Les réponses précédentes de l'assistant peuvent dépasser 2 000 caractères.
        content: z.string().trim().min(1).max(12000),
      })
    )
    .min(1)
    .max(20),
});

// Valide les 20 derniers messages envoyés par le frontend.
function readMessages(req) {
  const parsed = bodySchema.safeParse(req.body);

  if (!parsed.success) return null;

  const messages = parsed.data.messages.slice(-20);

  // Retire les réponses au début s'il manque le premier message du visiteur.
  while (messages.length && messages[0].role !== "user") {
    messages.shift();
  }

  // Refuse la conversation si le dernier message vient déjà de l'assistant.
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return null;
  }

  return messages;
}

// Envoie la réponse de l'assistant progressivement au frontend.
router.post("/chat", limiter, async (req, res) => {
  const messages = readMessages(req);

  if (!messages) {
    return res.status(400).json({ error: "Requête invalide." });
  }

  // Indique au navigateur que la réponse est du texte transmis progressivement.
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  const controller = new AbortController();

  // Arrête l'appel OpenAI si le visiteur part avant la fin de la réponse.
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    await streamChat(
      messages,
      (text) => res.write(text), // Transmet chaque morceau reçu au navigateur.
      controller.signal
    );

    res.end(); // Termine la réponse après le dernier morceau.
  } catch (error) {
    if (controller.signal.aborted) return;

    console.error("Erreur IA :", error.message);

    if (!res.headersSent) {
      if (error.code === "ai_provider_not_configured") {
        return res.status(503).json({ error: error.message });
      }

      if (error.code === "rate_limit_exceeded" || error.status === 429 || error.statusCode === 429) {
        return res.status(429).json({
          error:
            error.type === "requests"
              ? "La limite de requêtes du fournisseur IA est atteinte. Réessayez plus tard."
              : "Le fournisseur IA limite temporairement les requêtes. Réessayez dans un moment.",
        });
      }

      if (error.status === 401 || error.statusCode === 401) {
        return res.status(503).json({ error: "La clé du fournisseur IA est invalide. Vérifiez backend/.env." });
      }

      res.status(502).json({ error: "Service IA indisponible." });
    } else {
      res.end();
    }
  }
});

// Produit un résumé de la conversation pour préparer un devis.
router.post("/quote-summary", limiter, async (req, res) => {
  const messages = readMessages(req);

  if (!messages) {
    return res.status(400).json({ error: "Requête invalide." });
  }

  try {
    const summary = await summarize(messages);
    res.json({ summary }); // Renvoie le résumé au frontend au format JSON.
  } catch (error) {
    console.error("Erreur résumé :", error.message);
    if (error.code === "ai_provider_not_configured") {
      return res.status(503).json({ error: error.message });
    }

    if (error.code === "rate_limit_exceeded" || error.status === 429 || error.statusCode === 429) {
      return res.status(429).json({ error: "Le fournisseur IA limite temporairement les requêtes. Réessayez dans un moment." });
    }

    res.status(502).json({ error: "Service IA indisponible." });
  }
});

export default router;
