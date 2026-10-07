import type { ComponentProps } from "react";

/**
 * Bouton aux mesures du chapitre 09 de la charte : 48 px de haut minimum
 * (cible tactile de 44 px respectée même avec des gants), rayon 8 px,
 * libellé en 16 px semibold.
 *
 * Règle de la charte : un seul bouton `principal` par écran, celui de
 * l'action que l'artisan est venu faire.
 */
type Variante = "principal" | "secondaire" | "contour" | "sombre";

type Props = ComponentProps<"button"> & {
  variante?: Variante;
};

const BASE =
  "inline-flex items-center justify-center gap-2 min-h-12 px-6 py-2.5 " +
  "rounded-sm border-2 border-transparent text-bouton cursor-pointer " +
  "disabled:cursor-not-allowed disabled:bg-line disabled:text-muted " +
  "disabled:border-transparent";

// --action vaut l'orange foncé en thème clair et l'orange de marque en
// thème sombre : le libellé atteint 4,5:1 dans les deux cas.
const VARIANTES: Record<Variante, string> = {
  principal: "bg-action text-action-ink",
  secondaire: "bg-action-soft text-ink",
  contour: "bg-bg text-action border-action",
  sombre: "bg-ink text-bg",
};

function Button({ variante = "principal", className, ...props }: Props) {
  const classes = [BASE, VARIANTES[variante], className]
    .filter(Boolean)
    .join(" ");

  return <button type="button" className={classes} {...props} />;
}

export default Button;
export type { Variante };
