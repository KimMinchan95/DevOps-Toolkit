import { useEffect, useRef, useState } from "react";
import { formatJson, minifyJson, offsetAt, type JsonResult } from "@devops-toolkit/core";
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

function errorPieces(input: string, errors: { line: number; column: number }[]) {
  const indexes = [...new Set(errors.map((issue) => offsetAt(input, issue.line, issue.column)))].sort((left, right) => left - right);
  const pieces: { text: string; mark: boolean }[] = [];
  let cursor = 0;

  for (const index of indexes) {
    if (index < cursor) continue;
    pieces.push({ text: input.slice(cursor, index), mark: false });
    const char = input[index];
    if (char === undefined || char === "\n") {
      pieces.push({ text: "", mark: true });
      cursor = index;
    } else {
      pieces.push({ text: char, mark: true });
      cursor = index + 1;
    }
  }

  pieces.push({ text: input.slice(cursor), mark: false });
  return pieces;
}

function statusFromResult(result: JsonResult, success: "formatted" | "minified"): EditorStatus {
  if (result.ok) return { kind: success };
  if (result.reason === "empty") return { kind: "empty" };
  return { kind: "invalid", errors: result.errors };
}

export function JsonFormatterPage({ locale }: JsonFormatterPageProps) {
  const t = messages[locale].jsonFormatter;
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<EditorStatus>({ kind: "idle" });
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const invalid = status.kind === "invalid";
  const errors = invalid ? status.errors : [];
  const errorLines = new Set(errors.map((issue) => issue.line));
  const pieces = invalid ? errorPieces(input, errors) : [];

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  useEffect(() => {
    if (status.kind !== "copied") return;
    const timeout = window.setTimeout(() => setStatus({ kind: "idle" }), 1600);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const syncScroll = (field: HTMLTextAreaElement) => {
    if (mirrorRef.current) {
      mirrorRef.current.scrollTop = field.scrollTop;
      mirrorRef.current.scrollLeft = field.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = field.scrollTop;
  };

  useEffect(() => {
    if (status.kind !== "invalid") return;
    const field = fieldRef.current;
    const issue = status.errors[0];
    if (!field || !issue) return;
    const index = offsetAt(input, issue.line, issue.column);
    const end = index < input.length && input[index] !== "\n" ? index + 1 : index;
    field.focus();
    field.setSelectionRange(index, end);
    syncScroll(field);
  }, [input, status]);

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
    if (status.kind === "invalid") {
      const [first] = status.errors;
      if (!first || status.errors.length < 2) return fill(t.invalid, first ?? { line: 1, column: 1 });
      const places = status.errors.map((issue) => fill(t.invalidItem, issue)).join(", ");
      return fill(t.invalidMany, { places });
    }
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
      <div className={cn("relative mx-8 flex min-h-[280px] flex-1 overflow-hidden rounded-xl border border-line bg-surface-soft focus-within:border-accent max-[800px]:mx-[18px]", invalid && "border-danger focus-within:border-danger")}>
        {invalid ? (
          <div
            ref={gutterRef}
            aria-hidden
            className="w-8 shrink-0 overflow-hidden border-r border-danger/30 py-4 text-center font-mono text-[13px] leading-[1.65] text-danger"
          >
            {input.split("\n").map((_, line) => (
              <div key={line} className="h-[1.65em]">
                {errorLines.has(line + 1) ? <span data-testid="json-error-arrow">→</span> : null}
              </div>
            ))}
          </div>
        ) : null}
        <div className="relative min-w-0 flex-1">
          {invalid ? (
            <pre
              ref={mirrorRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-4 font-mono text-[13px] leading-[1.65] whitespace-pre text-foreground [scrollbar-gutter:stable]"
            >
              {pieces.map((piece, index) => piece.mark ? (
                <mark key={index} data-testid="json-error-mark" className="rounded-[3px] bg-danger/20 text-danger">
                  {piece.text || <span className="inline-block h-[1.05em] w-0.5 translate-y-px bg-danger" />}
                </mark>
              ) : (
                <span key={index}>{piece.text}</span>
              ))}
            </pre>
          ) : null}
          <textarea
            ref={fieldRef}
            id="json-input"
            wrap={invalid ? "off" : "soft"}
            className={cn(
              "absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-[13px] leading-[1.65] text-foreground outline-none [scrollbar-gutter:stable]",
              invalid && "text-transparent caret-danger selection:bg-danger/25",
            )}
            value={input}
            placeholder={t.placeholder}
            spellCheck={false}
            autoCapitalize="off"
            aria-invalid={invalid}
            onChange={(event) => {
              setInput(event.target.value);
              setStatus({ kind: "idle" });
            }}
            onScroll={(event) => syncScroll(event.currentTarget)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                apply("formatted");
              }
            }}
          />
        </div>
      </div>
      <p className={cn("mx-8 mt-3 mb-6 min-h-[18px] text-xs text-muted max-[800px]:mx-[18px]", invalid && "text-danger")} role="status">{message}</p>
    </section>
  );
}
