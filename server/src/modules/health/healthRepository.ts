import databaseClient from "../../../database/client";

import type { Rows } from "../../../database/client";

class HealthRepository {
  /**
   * Interroge réellement MySQL.
   *
   * `select 1` est une requête volontairement triviale : elle ne dépend
   * d'aucune table, mais elle effectue un aller-retour complet jusqu'au
   * serveur MySQL. Si la base est arrêtée ou mal configurée, l'appel lève
   * une erreur au lieu de laisser croire que tout va bien.
   */
  async ping() {
    const [rows] = await databaseClient.query<Rows>("select 1 as disponible");

    if (rows.length === 0) {
      throw new Error("La base de données n'a renvoyé aucune ligne.");
    }
  }
}

export default new HealthRepository();
