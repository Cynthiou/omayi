// Charge les variables d'environnement depuis le fichier .env
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import mysql from "mysql2/promise";

import {
  VARIABLES_BASE_DE_DONNEES,
  listerVariablesManquantes,
} from "../src/config/env";

// Chemin du fichier de schéma SQL
const schema = path.join(__dirname, "../database/schema.sql");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const migrate = async () => {
  const variablesManquantes = listerVariablesManquantes(
    VARIABLES_BASE_DE_DONNEES,
  );

  if (variablesManquantes.length > 0) {
    console.error(
      "Migration impossible. Variables d'environnement manquantes :",
      variablesManquantes.join(", "),
    );

    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(schema, "utf8");

    const database = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    // On repart d'une base vide : schema.sql est la seule source de vérité
    await database.query(`drop database if exists \`${DB_NAME}\``);
    await database.query(`create database \`${DB_NAME}\``);
    await database.query(`use \`${DB_NAME}\``);
    await database.query(sql);

    await database.end();

    console.info(
      `Base ${DB_NAME} mise à jour depuis '${path.normalize(schema)}'`,
    );
  } catch (err) {
    const { message } = err as Error;

    console.error("Échec de la migration :", message);

    // Sortie en échec : sans cela le script annoncerait un succès alors
    // que la base n'a pas été mise à jour.
    process.exit(1);
  }
};

migrate();
