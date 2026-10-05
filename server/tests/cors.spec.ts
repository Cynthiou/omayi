import supertest from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";

import type { Rows } from "../database/client";

const ORIGINE_AUTORISEE = "http://localhost:3000";
const ORIGINE_INCONNUE = "http://pirate.example";

const clientUrlInitiale = process.env.CLIENT_URL;

beforeEach(() => {
  process.env.CLIENT_URL = ORIGINE_AUTORISEE;

  jest
    .spyOn(databaseClient, "query")
    .mockImplementation(async () => [[{ disponible: 1 }] as Rows, []]);
});

afterEach(() => {
  process.env.CLIENT_URL = clientUrlInitiale;

  jest.restoreAllMocks();
});

afterAll(async () => {
  await databaseClient.end();
});

describe("CORS", () => {
  it("autorise l'origine du client déclarée dans CLIENT_URL", async () => {
    const reponse = await supertest(app)
      .get("/api/health")
      .set("Origin", ORIGINE_AUTORISEE);

    expect(reponse.headers["access-control-allow-origin"]).toBe(
      ORIGINE_AUTORISEE,
    );
  });

  it("n'accorde aucun en-tête CORS à une origine inconnue", async () => {
    const reponse = await supertest(app)
      .get("/api/health")
      .set("Origin", ORIGINE_INCONNUE);

    // Sans en-tête Access-Control-Allow-Origin, le navigateur bloque
    // la réponse même si le serveur a bien répondu.
    expect(reponse.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
