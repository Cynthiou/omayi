import type { ReactNode } from "react";

/**
 * Bloc de contenu sur fond de surface, rayon 12 px, sans ombre : la charte
 * écarte les ombres et les dégradés décoratifs.
 */
type Props = {
  titre?: string;
  className?: string;
  children: ReactNode;
};

function Card({ titre, className, children }: Props) {
  const classes = ["flex flex-col gap-3 rounded-md bg-surface p-5", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      {titre != null && (
        <h2 className="text-sous-titre font-semibold">{titre}</h2>
      )}
      {children}
    </section>
  );
}

export default Card;
