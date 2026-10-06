import type { HTMLAttributes } from "react";
export function TransparentGrid({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`transparent-grid ${className}`} {...props} />;
}
