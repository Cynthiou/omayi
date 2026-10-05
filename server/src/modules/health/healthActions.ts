import { SHARED_READY } from "@obacy/shared";

import healthRepository from "./healthRepository";

import type { RequestHandler } from "express";

/**
 * GET /api/health
 *
 * Répond 200 uniquement si le serveur répond ET que MySQL répond.
 * Si la base ne répond pas, répond 503 : jamais de faux OK.
 */
const read: RequestHandler = async (_req, res) => {
  try {
    await healthRepository.ping();

    res.json({
      status: "ok",
      database: "up",
      // Témoin temporaire : prouve que le code partagé est bien importé
      // côté serveur. Retiré en US09.
      shared: SHARED_READY,
    });
  } catch (err) {
    // Le détail de l'erreur MySQL (hôte, utilisateur, requête) reste dans
    // les journaux du serveur. Il ne part jamais vers le navigateur.
    console.error("Échec de la vérification de santé :", err);

    res.status(503).json({
      status: "error",
      database: "down",
      message: "La base de données ne répond pas.",
    });
  }
};

export default { read };
