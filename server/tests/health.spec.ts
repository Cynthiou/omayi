import supertest from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";

import type { Rows } from "../database/client";

const ligneDisponible = [{ disponible: 1 }] as Rows;

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await databaseClient.end();
});

describe("GET /api/health", () => {
  it("répond 200 quand le serveur et MySQL répondent", async () => {
    jest
      .spyOn(databaseClient, "query")
      .mockImplementation(async () => [ligneDisponible, []]);

    const reponse = await supertest(app).get("/api/health");

    expect(reponse.status).toBe(200);
    expect(reponse.body.status).toBe("ok");
    expect(reponse.body.database).toBe("up");
    // Prouve que le code partagé est bien importé côté serveur
    expect(reponse.body.shared).toBe("shared-ready");
  });

  it("répond 503 quand MySQL ne répond pas, jamais un faux OK", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(databaseClient, "query").mockImplementation(async () => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:3306");
    });

    const reponse = await supertest(app).get("/api/health");

    expect(reponse.status).toBe(503);
    expect(reponse.body.status).toBe("error");
    expect(reponse.body.database).toBe("down");
  });

  it("ne divulgue aucun détail technique MySQL au navigateur", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(databaseClient, "query").mockImplementation(async () => {
      throw new Error("Access denied for user 'omayi'@'127.0.0.1'");
    });

    const reponse = await supertest(app).get("/api/health");

    const corps = JSON.stringify(reponse.body);

    expect(corps).not.toMatch(/access denied/i);
    expect(corps).not.toMatch(/127\.0\.0\.1/);
    expect(corps).not.toMatch(/omayi/i);
  });
});
