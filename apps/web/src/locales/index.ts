import { en } from "./en";
import { ko } from "./ko";

export const messages = { en, ko };

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
