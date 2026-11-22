export type JsonFailure = {
  ok: false;
  reason: "empty" | "invalid";
  line: number;
  column: number;
};

export type JsonResult = { ok: true; text: string } | JsonFailure;

function locate(input: string, position: number) {
  const end = Math.max(0, Math.min(position, input.length));
  let line = 1;
  let column = 1;

  for (let index = 0; index < end; index += 1) {
    if (input[index] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function invalid(input: string, error: unknown): JsonFailure {
  const message = error instanceof Error ? error.message : "";
  const lineColumn = message.match(/line (\d+) column (\d+)/i);
  if (lineColumn) {
    return { ok: false, reason: "invalid", line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  }

  const position = message.match(/position (\d+)/i);
  const located = position ? locate(input, Number(position[1])) : { line: 1, column: 1 };
  return { ok: false, reason: "invalid", ...located };
}

function convert(input: string, space?: number): JsonResult {
  if (input.trim() === "") return { ok: false, reason: "empty", line: 1, column: 1 };

  try {
    return { ok: true, text: JSON.stringify(JSON.parse(input), null, space) };
  } catch (error) {
    return invalid(input, error);
  }
}

export function formatJson(input: string): JsonResult {
  return convert(input, 2);
}

export function minifyJson(input: string): JsonResult {
  return convert(input);
}
