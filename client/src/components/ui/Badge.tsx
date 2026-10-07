import type { ReactNode } from "react";

/**
 * Pastille de statut : pilule, 12/16 px medium, pastille de 6 px devant.
 *
 * La charte interdit de faire porter un statut par la couleur seule, donc
 * le libellé est toujours écrit en entier. Les teintes reprennent les
 * statuts de devis et de factures du backlog.
 */
type Ton = "neutre" | "brouillon" | "info" | "ok" | "ko";

type Props = {
  ton?: Ton;
  children: ReactNode;
};

const TONS: Record<Ton, string> = {
  neutre: "bg-surface-2 text-ink",
  brouillon: "bg-action-soft text-ink",
  info: "bg-info-bg text-info",
  ok: "bg-ok-bg text-ok",
  ko: "bg-ko-bg text-ko",
};

function Badge({ ton = "neutre", children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-legende ${TONS[ton]}`}
    >
      <span
        aria-hidden="true"
        className="block size-1.5 rounded-full bg-current"
      />
      {children}
    </span>
  );
}

export default Badge;
export type { Ton };
