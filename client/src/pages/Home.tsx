import { SHARED_READY } from "@omayi/shared";
import { useEffect, useState } from "react";

import { recupererEtatSante } from "../services/health";

import type { EtatSante } from "../services/health";

type Etat =
  | { phase: "chargement" }
  | { phase: "ok"; sante: EtatSante }
  | { phase: "erreur"; message: string };

function Home() {
  const [etat, setEtat] = useState<Etat>({ phase: "chargement" });

  useEffect(() => {
    let actif = true;

    recupererEtatSante()
      .then((sante) => {
        if (actif) {
          setEtat({ phase: "ok", sante });
        }
      })
      .catch((erreur: Error) => {
        if (actif) {
          setEtat({ phase: "erreur", message: erreur.message });
        }
      });

    // Évite de modifier l'état d'un composant déjà démonté
    return () => {
      actif = false;
    };
  }, []);

  return (
    <section className="carte">
      <h2>État du service</h2>

      {etat.phase === "chargement" && <p className="statut">Vérification…</p>}

      {etat.phase === "ok" && (
        <>
          <p className="statut statut-ok">
            Serveur et base de données disponibles.
          </p>
          <p className="note">
            Code partagé vu par le serveur : <code>{etat.sante.shared}</code>
          </p>
        </>
      )}

      {etat.phase === "erreur" && (
        <p className="statut statut-erreur">
          Service indisponible : {etat.message}
        </p>
      )}

      <p className="note">
        Code partagé importé par le client : <code>{SHARED_READY}</code>
      </p>
    </section>
  );
}

export default Home;
