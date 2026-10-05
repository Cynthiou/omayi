/** Réponse de GET /api/health telle que renvoyée par le serveur. */
type EtatSante = {
  status: "ok" | "error";
  database: "up" | "down";
  shared?: string;
  message?: string;
};

const urlApi: string | undefined = import.meta.env.VITE_API_URL;

/**
 * Interroge la route de santé du serveur.
 *
 * Lève une erreur explicite si VITE_API_URL n'est pas configurée, plutôt
 * que d'appeler une URL vide et d'afficher un message incompréhensible.
 */
const recupererEtatSante = async (): Promise<EtatSante> => {
  if (urlApi == null || urlApi.trim() === "") {
    throw new Error(
      "VITE_API_URL n'est pas configurée. Copie client/.env.sample en client/.env.",
    );
  }

  const reponse = await fetch(`${urlApi}/api/health`);

  const corps = (await reponse.json()) as EtatSante;

  // Un 503 est une réponse valide du serveur : on remonte son message
  // plutôt que de faire passer l'échec pour un succès.
  if (!reponse.ok) {
    throw new Error(corps.message ?? "Le serveur a répondu une erreur.");
  }

  return corps;
};

export { recupererEtatSante };
export type { EtatSante };
