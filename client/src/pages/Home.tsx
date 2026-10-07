import { SHARED_READY } from "@omayi/shared";
import { useEffect, useState } from "react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
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
    <Card titre="État du service">
      {/* La charte interdit de laisser la couleur seule porter un statut :
          chaque pastille écrit son état en toutes lettres. */}
      {etat.phase === "chargement" && <Badge>Vérification…</Badge>}

      {etat.phase === "ok" && (
        <>
          <Badge ton="ok">Serveur et base disponibles</Badge>
          <p className="text-petit text-muted">
            Code partagé vu par le serveur :{" "}
            <code className="font-mono">{etat.sante.shared}</code>
          </p>
        </>
      )}

      {etat.phase === "erreur" && (
        <>
          <Badge ton="ko">Service indisponible</Badge>
          <p className="text-petit text-muted">{etat.message}</p>
        </>
      )}

      <p className="text-petit text-muted">
        Code partagé importé par le client :{" "}
        <code className="font-mono">{SHARED_READY}</code>
      </p>
    </Card>
  );
}

export default Home;
