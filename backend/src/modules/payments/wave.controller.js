import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { prisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";

function isValidWaveSignature(signatureHeader, rawBody, secret) {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  const timestampSeconds = Number(timestamp);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (!Number.isInteger(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > 300 || signatures.length === 0) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}${rawBody}`)
    .digest();

  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const supplied = Buffer.from(signature, "hex");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  });
}

export async function handleWaveWebhook(req, res) {
  if (!env.WAVE_WEBHOOK_SECRET) {
    return res.status(503).json({ success: false, message: "Webhook Wave non configuré." });
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  if (!isValidWaveSignature(req.get("Wave-Signature"), rawBody, env.WAVE_WEBHOOK_SECRET)) {
    return res.status(401).json({ success: false, message: "Signature Wave invalide." });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ success: false, message: "Événement Wave invalide." });
  }

  if (event?.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true });
  }

  const session = event.data;
  if (
    typeof session?.id !== "string" ||
    session.payment_status !== "succeeded" ||
    session.checkout_status !== "complete" ||
    session.currency !== "XOF"
  ) {
    return res.status(400).json({ success: false, message: "Données de paiement Wave invalides." });
  }

  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: session.id },
    select: { id: true, amount: true, method: true, status: true, orderId: true },
  });

  // Acknowledge authentic but already-removed/untracked sessions to prevent endless retries.
  if (!payment) {
    logger.warn("Webhook Wave reçu pour une session non suivie", { eventId: event.id });
    return res.status(200).json({ received: true });
  }

  if (payment.method !== "WAVE" || String(payment.amount) !== String(session.amount)) {
    logger.error("Montant ou moyen de paiement Wave incohérent", { paymentId: payment.id, orderId: payment.orderId });
    return res.status(400).json({ success: false, message: "Montant de paiement incohérent." });
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "COMPLETED" },
    });

    if (updated.count === 0) return;

    const order = await tx.order.findUnique({
      where: { id: payment.orderId },
      select: { id: true, userId: true, status: true },
    });
    if (!order) return;

    if (order.status === "PENDING") {
      await tx.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } });
    }

    const cart = await tx.cart.findUnique({ where: { userId: order.userId }, select: { id: true } });
    if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  });

  return res.status(200).json({ received: true });
}
