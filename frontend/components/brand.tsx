import Link from "next/link";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Concierge Career home">
      <span className="brand-mark">c.</span> concierge
      <span className="brand-muted"> / career</span>
    </Link>
  );
}
