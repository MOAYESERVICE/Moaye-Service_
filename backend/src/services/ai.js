import OpenAI from "openai";
// Charge .env avant de lire le fournisseur et la clé API ci-dessous.
import "../config/env.js";
import {
  SYSTEM_PROMPT,
  SUMMARY_PROMPT,
} from "../prompts/agropastoral.js";

const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
const isGroq = provider === "groq";
const apiKey = isGroq ? process.env.GROQ_API_KEY?.trim() : process.env.OPENAI_API_KEY?.trim();
const model = isGroq
  ? process.env.GROQ_MODEL || "openai/gpt-oss-20b"
  : process.env.OPENAI_MODEL || "gpt-6-luna";

if (!isGroq && provider !== "openai") {
  throw new Error('AI_PROVIDER must be "groq" or "openai".');
}

const client = apiKey
  ? new OpenAI({
      apiKey,
      ...(isGroq ? { baseURL: "https://api.groq.com/openai/v1" } : {}),
    })
  : null;

function getClient() {
  if (!client) {
    const keyName = isGroq ? "GROQ_API_KEY" : "OPENAI_API_KEY";
    const error = new Error(`Configure ${keyName} dans backend/.env.`);
    error.code = "ai_provider_not_configured";
    throw error;
  }

  return client;
}

// Garde le début et les échanges récents dans la limite gratuite de Groq.
function getGroqMessages(messages) {
  const recentMessages = messages.length > 10
    ? [messages[0], ...messages.slice(-9)]
    : messages;

  const boundedMessages = recentMessages.map((message) => ({
    role: message.role,
    content: message.content.slice(-1200),
  }));

  while (boundedMessages.length && boundedMessages[0].role !== "user") {
    boundedMessages.shift();
  }

  return boundedMessages;
}

// Envoie la réponse progressivement au frontend.
async function streamChat(messages, onText, signal) {
  if (isGroq) {
    const response = await getClient().chat.completions.create(
      {
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...getGroqMessages(messages),
        ],
        max_completion_tokens: 2048,
        // Laisse l'assistant chercher uniquement quand la question le justifie.
        tools: [{ type: "browser_search" }],
      },
      { signal }
    );

    const answer = response.choices[0]?.message?.content?.trim();
    if (answer) onText(answer);
    return;
  }

  const stream = await getClient().responses.create(
    {
      model,
      instructions: SYSTEM_PROMPT,
      input: messages,
      max_output_tokens: 1024,
      stream: true,
    },
    { signal }
  );

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      onText(event.delta);
    }
  }
}

// Résume la conversation pour préparer une demande de devis.
async function summarize(messages) {
  const transcriptMessages = isGroq ? getGroqMessages(messages) : messages;
  const transcript = transcriptMessages
    .map(
      (message) =>
        `${message.role === "user" ? "Visiteur" : "Assistant"} : ${message.content.slice(-1200)}`
    )
    .join("\n");

  if (isGroq) {
    const response = await getClient().chat.completions.create({
      model,
      messages: [
        { role: "system", content: SUMMARY_PROMPT },
        { role: "user", content: transcript },
      ],
      max_completion_tokens: 800,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  }

  const response = await getClient().responses.create({
    model,
    instructions: SUMMARY_PROMPT,
    input: transcript,
    max_output_tokens: 800,
  });

  return response.output_text.trim();
}

export { streamChat, summarize };
