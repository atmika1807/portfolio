import type { ReactNode } from "react";

/** Mono tag ("03 — Selected work") above a bold heading ending in one italic serif word. */
export default function SectionHead({
  index,
  label,
  id,
  children,
}: {
  index: string;
  label: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-12 md:mb-16">
      <p className="tag rv">
        {index} — {label}
      </p>
      <h2 className="h2" id={id}>
        {children}
      </h2>
    </header>
  );
}
