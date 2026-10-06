export function Logo({
  variant = "default",
}: {
  variant?: "default" | "icon";
}) {
  return (
    <span className="logo">
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="25"
          height="25"
          rx="5"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="m9 22 7-12 7 12H9Z" fill="currentColor" />
        <path d="M22 22h8v8h-8z" fill="var(--background)" />
        <path d="M23 23h3v3h-3zm4 4h3v3h-3z" fill="currentColor" />
      </svg>
      {variant === "default" ? (
        <span>
          Drop<span className="logo-bg">BG</span>
        </span>
      ) : (
        <span className="sr-only">DropBG</span>
      )}
    </span>
  );
}
