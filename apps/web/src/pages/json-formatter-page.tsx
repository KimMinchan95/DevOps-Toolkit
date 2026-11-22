import { useEffect, useState } from "react";
import { formatJson, minifyJson, type JsonResult } from "@devops-toolkit/core";
import { Eyebrow } from "../components/eyebrow";
import { cn } from "../lib/utils";
import { fill, messages } from "../locales";
import type { EditorStatus, JsonFormatterPageProps, ToolButtonProps } from "./json-formatter-page.types";

function ToolButton({ primary, className, ...props }: ToolButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "h-[34px] cursor-pointer rounded-[7px] border border-line bg-surface px-[13px] text-xs text-foreground hover:border-hover-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        primary && "border-transparent bg-accent font-semibold text-ink hover:border-transparent hover:brightness-105",
        className,
      )}
      {...props}
    />
  );
}

function statusFromResult(result: JsonResult, success: "formatted" | "minified"): EditorStatus {
  if (result.ok) return { kind: success };
  if (result.reason === "empty") return { kind: "empty" };
  return { kind: "invalid", line: result.line, column: result.column };
}

export function JsonFormatterPage({ locale }: JsonFormatterPageProps) {
  const t = messages[locale].jsonFormatter;
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<EditorStatus>({ kind: "idle" });
  const invalid = status.kind === "invalid";

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  useEffect(() => {
    if (status.kind !== "copied") return;
    const timeout = window.setTimeout(() => setStatus({ kind: "idle" }), 1600);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const apply = (mode: "formatted" | "minified") => {
    const result = mode === "formatted" ? formatJson(input) : minifyJson(input);
    setStatus(statusFromResult(result, mode));
    if (result.ok) setInput(result.text);
  };

  const copy = async () => {
    if (input.trim() === "") {
      setStatus({ kind: "empty" });
      return;
    }
    try {
      await navigator.clipboard.writeText(input);
      setStatus({ kind: "copied" });
    } catch {
      setStatus({ kind: "copy-failed" });
    }
  };

  const message = (() => {
    if (status.kind === "formatted") return t.formatted;
    if (status.kind === "minified") return t.minified;
    if (status.kind === "copied") return t.copied;
    if (status.kind === "empty") return t.empty;
    if (status.kind === "copy-failed") return t.copyFailed;
    if (status.kind === "invalid") return fill(t.invalid, { line: status.line, column: status.column });
    return "";
  })();

  return (
    <section className="mx-auto my-[4vh] flex min-h-[560px] w-full max-w-[1120px] flex-1 flex-col rounded-[17px] border border-line bg-surface shadow-card max-[800px]:mt-[3vh] max-[800px]:rounded-xl">
      <div className="px-8 pt-8 max-[800px]:px-[18px]">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="mt-2 mb-1.5 text-[clamp(32px,4vw,46px)] font-semibold leading-[1.05] tracking-[-1.8px]">
          {t.title}<span className="text-accent">.</span>
        </h1>
        <p className="m-0 text-base tracking-[-0.2px] text-muted max-[520px]:text-sm">{t.description}</p>
      </div>
      <div className="flex flex-wrap gap-2 px-8 py-5 max-[800px]:px-[18px]">
        <ToolButton primary onClick={() => apply("formatted")}>{t.format}</ToolButton>
        <ToolButton onClick={() => apply("minified")}>{t.minify}</ToolButton>
        <ToolButton onClick={() => void copy()}>{t.copy}</ToolButton>
        <ToolButton
          onClick={() => {
            setInput("");
            setStatus({ kind: "idle" });
          }}
        >
          {t.clear}
        </ToolButton>
      </div>
      <label className="sr-only" htmlFor="json-input">{t.label}</label>
      <textarea
        id="json-input"
        className="mx-8 min-h-[280px] flex-1 resize-y rounded-xl border border-line bg-surface-soft p-4 font-mono text-[13px] leading-[1.65] text-foreground outline-2 outline-transparent focus:border-accent focus:outline-accent/65 aria-invalid:border-danger max-[800px]:mx-[18px]"
        value={input}
        placeholder={t.placeholder}
        spellCheck={false}
        autoCapitalize="off"
        aria-invalid={invalid}
        onChange={(event) => {
          setInput(event.target.value);
          setStatus({ kind: "idle" });
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            apply("formatted");
          }
        }}
      />
      <p className={cn("mx-8 mt-3 mb-6 min-h-[18px] text-xs text-muted max-[800px]:mx-[18px]", invalid && "text-danger")} role="status">{message}</p>
    </section>
  );
}
