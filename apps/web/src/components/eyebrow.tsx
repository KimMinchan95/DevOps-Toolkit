import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
};

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <span className="flex items-center gap-[9px] text-[9px] font-semibold tracking-[1.6px] text-muted max-[520px]:text-[8px] max-[520px]:tracking-[1px]">
      <i className="block size-1.5 rounded-full bg-accent shadow-glow" />
      {children}
    </span>
  );
}
