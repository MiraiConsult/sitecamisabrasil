export function RRLogo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const title = variant === "light" ? "text-white" : "text-rr-navy";
  const subtitle = variant === "light" ? "text-white/70" : "text-neutral-500";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-rr-navy font-display text-lg leading-none tracking-tight text-white shadow-sm">
        RR
      </span>
      <span className="leading-none">
        <span className={`block font-display text-base tracking-wide ${title}`}>
          RR UNIFORMES
        </span>
        <span
          className={`mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] ${subtitle}`}
        >
          Tecnologia e Performance
        </span>
      </span>
    </div>
  );
}
