export type JsonIssue = {
  line: number;
  column: number;
};

export type JsonFailure =
  | { ok: false; reason: "empty"; line: number; column: number }
  | ({ ok: false; reason: "invalid" } & JsonIssue & { errors: JsonIssue[] });

export type JsonResult = { ok: true; text: string } | JsonFailure;

export function offsetAt(input: string, line: number, column: number) {
  const targetLine = Math.max(1, line);
  let currentLine = 1;
  let index = 0;

  while (index < input.length && currentLine < targetLine) {
    if (input[index] === "\n") currentLine += 1;
    index += 1;
  }

  return Math.min(input.length, index + Math.max(0, column - 1));
}

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

function syntaxOffsets(input: string) {
  let index = 0;
  let brokenString = false;
  const errors: number[] = [];

  const push = (at: number) => {
    if (errors.length >= 40) return;
    errors.push(Math.min(Math.max(0, at), input.length));
  };

  const recoverValue = () => {
    let depth = 0;
    while (index < input.length) {
      const char = input[index];
      if (char === "{" || char === "[") {
        depth += 1;
        index += 1;
        continue;
      }
      if (char === "}" || char === "]") {
        if (depth === 0) return "closer" as const;
        depth -= 1;
        index += 1;
        continue;
      }
      if (char === "," && depth === 0) {
        index += 1;
        return "comma" as const;
      }
      index += 1;
    }
    return "end" as const;
  };

  const stopAfter = (closer: "}" | "]") => {
    const before = index;
    const sync = recoverValue();
    if (sync === "comma" && index !== before) return false;
    if (input[index] === closer) index += 1;
    return true;
  };

  const skip = () => {
    while (index < input.length && " \n\r\t".includes(input[index])) index += 1;
  };

  const isDigit = (char: string | undefined) => char !== undefined && char >= "0" && char <= "9";

  const parseString = () => {
    brokenString = false;
    if (input[index] !== '"') return false;
    index += 1;
    while (index < input.length) {
      const char = input[index];
      if (char === '"') {
        index += 1;
        return true;
      }
      if (char === "\\") {
        index += 1;
        const escaped = input[index];
        if (escaped === undefined) {
          brokenString = true;
          return false;
        }
        if ('"\\/bfnrt'.includes(escaped)) {
          index += 1;
          continue;
        }
        if (escaped === "u") {
          index += 1;
          for (let count = 0; count < 4; count += 1) {
            if (!/[0-9a-fA-F]/.test(input[index] ?? "")) {
              brokenString = index >= input.length || (input[index] ?? "") < " ";
              return false;
            }
            index += 1;
          }
          continue;
        }
        return false;
      }
      if (char < " ") {
        brokenString = true;
        return false;
      }
      index += 1;
    }
    brokenString = true;
    return false;
  };

  const parseNumber = () => {
    if (input[index] === "-") index += 1;
    if (!isDigit(input[index])) return false;
    if (input[index] === "0") index += 1;
    else while (isDigit(input[index])) index += 1;
    if (input[index] === ".") {
      const dot = index;
      index += 1;
      if (!isDigit(input[index])) {
        index = dot;
        return false;
      }
      while (isDigit(input[index])) index += 1;
    }
    if (input[index] === "e" || input[index] === "E") {
      const exponent = index;
      index += 1;
      if (input[index] === "+" || input[index] === "-") index += 1;
      if (!isDigit(input[index])) {
        index = exponent;
        return false;
      }
      while (isDigit(input[index])) index += 1;
    }
    return true;
  };

  const parseWord = (word: string) => {
    if (!input.startsWith(word, index)) return false;
    index += word.length;
    return true;
  };

  const parseValue = (): boolean => {
    skip();
    const char = input[index];
    if (char === '"') return parseString();
    if (char === "{") {
      parseObject();
      return !brokenString;
    }
    if (char === "[") {
      parseArray();
      return !brokenString;
    }
    if (char === "t") return parseWord("true");
    if (char === "f") return parseWord("false");
    if (char === "n") return parseWord("null");
    if (char === "-" || isDigit(char)) return parseNumber();
    return false;
  };

  const parseObject = () => {
    index += 1;
    skip();
    if (input[index] === "}") {
      index += 1;
      return;
    }
    while (index <= input.length && errors.length < 40 && !brokenString) {
      skip();
      if (input[index] !== '"') {
        push(index);
        if (input[index] === "}") index += 1;
        else if (!stopAfter("}")) continue;
        return;
      }
      if (!parseString()) {
        push(index);
        if (brokenString || stopAfter("}")) return;
        continue;
      }
      skip();
      if (input[index] !== ":") {
        push(index);
        if (stopAfter("}")) return;
        continue;
      }
      index += 1;
      if (!parseValue()) {
        if (brokenString) return;
        push(index);
        if (stopAfter("}")) return;
        continue;
      }
      skip();
      if (input[index] === ",") {
        index += 1;
        skip();
        if (input[index] === "}" || index >= input.length) {
          push(index);
          if (input[index] === "}") index += 1;
          return;
        }
        continue;
      }
      if (input[index] === "}") {
        index += 1;
        return;
      }
      push(index);
      if (stopAfter("}")) return;
    }
  };

  const parseArray = () => {
    index += 1;
    skip();
    if (input[index] === "]") {
      index += 1;
      return;
    }
    while (index <= input.length && errors.length < 40 && !brokenString) {
      skip();
      if (input[index] === "]" || index >= input.length) {
        push(index);
        if (input[index] === "]") index += 1;
        return;
      }
      if (!parseValue()) {
        if (brokenString) return;
        push(index);
        if (stopAfter("]")) return;
        continue;
      }
      skip();
      if (input[index] === ",") {
        index += 1;
        continue;
      }
      if (input[index] === "]") {
        index += 1;
        return;
      }
      push(index);
      if (stopAfter("]")) return;
    }
  };

  skip();
  if (index >= input.length) push(0);
  else if (!parseValue() && !brokenString) push(index);
  skip();
  if (!brokenString && index < input.length) push(index);
  return [...new Set(errors)].sort((left, right) => left - right);
}

function invalid(input: string): JsonFailure {
  const offsets = syntaxOffsets(input);
  const errors = (offsets.length > 0 ? offsets : [0]).map((offset) => locate(input, offset));
  return { ok: false, reason: "invalid", ...errors[0], errors };
}

function convert(input: string, space?: number): JsonResult {
  if (input.trim() === "") return { ok: false, reason: "empty", line: 1, column: 1 };

  try {
    return { ok: true, text: JSON.stringify(JSON.parse(input), null, space) };
  } catch {
    return invalid(input);
  }
}

export function formatJson(input: string): JsonResult {
  return convert(input, 2);
}

export function minifyJson(input: string): JsonResult {
  return convert(input);
}
