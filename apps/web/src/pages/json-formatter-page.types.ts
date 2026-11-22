import type { ButtonHTMLAttributes } from "react";

export type EditorStatus =
  | { kind: "idle" }
  | { kind: "formatted" }
  | { kind: "minified" }
  | { kind: "copied" }
  | { kind: "empty" }
  | { kind: "copy-failed" }
  | { kind: "invalid"; errors: { line: number; column: number }[] };

export type JsonFormatterPageProps = {
  locale: "ko" | "en";
};

export type ToolButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
};
