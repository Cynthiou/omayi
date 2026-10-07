import { SHARED_READY } from "@omayi/shared";

// Vérifie que l'espace shared est bien résolu depuis les tests Jest,
// en plus du client et du serveur (critère d'acceptation US00).
describe("espace shared", () => {
  it("expose le témoin SHARED_READY", () => {
    expect(SHARED_READY).toBe("shared-ready");
  });
});
