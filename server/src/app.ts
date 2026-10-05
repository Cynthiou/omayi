import fs from "node:fs";
import path from "node:path";

import cors from "cors";
import express from "express";

import router from "./router";

import type { ErrorRequestHandler } from "express";

const app = express();

/* ************************************************************************* */

// CORS : seule l'origine déclarée dans CLIENT_URL est autorisée.
//
// L'origine autorisée est relue à chaque requête plutôt que figée au
// démarrage, afin que la règle reste vérifiable depuis les tests.

app.use(
  cors({
    origin: (origine, callback) => {
      // Une origine non autorisée ne reçoit aucun en-tête
      // Access-Control-Allow-Origin : le navigateur bloque alors la réponse.
      // Les appels sans en-tête Origin (curl, tests, serveur à serveur) ne
      // relèvent pas du CORS.
      callback(null, origine === process.env.CLIENT_URL);
    },
  }),
);

/* ************************************************************************* */

// Lecture des corps de requête au format JSON
app.use(express.json());

/* ************************************************************************* */

// Routes de l'API
app.use(router);

/* ************************************************************************* */

// Fichiers statiques du serveur (favicon, images)
const publicFolderPath = path.join(__dirname, "../public");

if (fs.existsSync(publicFolderPath)) {
  app.use(express.static(publicFolderPath));
}

// Fichiers statiques du client, une fois celui-ci construit.
// Permet de servir le client et l'API depuis un seul processus en production.
const clientBuildPath = path.join(__dirname, "../../client/dist");

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Les requêtes non reconnues sont renvoyées vers le client,
  // qui gère lui-même son routage.
  app.get("*", (_req, res) => {
    res.sendFile("index.html", { root: clientBuildPath });
  });
}

/* ************************************************************************* */

// Journalisation des erreurs : doit rester déclarée en dernier,
// après tous les app.use() et toutes les routes.
const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  console.error("sur la requête :", req.method, req.path);

  next(err);
};

app.use(logErrors);

/* ************************************************************************* */

export default app;
