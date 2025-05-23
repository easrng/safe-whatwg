import {
  ArrayPrototypeMap,
  SafeArrayIterator,
  SafeRegExp,
} from "../_internal/primordial-utils.ts";
import {
  ArrayFrom,
  ArrayPrototypeJoin,
  ArrayPrototypePush,
  RegExpPrototypeSymbolReplace,
  String,
  StringPrototypePadEnd,
  StringPrototypeRepeat,
} from "../_internal/primordials.js";
import type { Printer } from "./unstable-create.ts";
import inspect from "npm:object-inspect@1";
import pc from "npm:picocolors@^1.1.1";
import stringWidth from "npm:string-width@^7.2.0";

const {
  bold,
  dim,
  isColorSupported,
  magenta,
  red,
  yellow,
} = pc;

function table(arr: unknown[][]) {
  const cols = arr[0]!.length;
  const widths = ArrayFrom({ length: cols }, () => 0);
  const rows: string[][] = [];
  for (const rawRow of new SafeArrayIterator(arr)) {
    const row: string[] = [];
    for (let col = 0; col < cols; col++) {
      const str = typeof rawRow[col] === "string"
        ? rawRow[col]
        : inspect(rawRow[col]);
      const width = stringWidth(str);
      if (width > widths[col]) widths[col] = width;
      ArrayPrototypePush(row, str);
    }
    ArrayPrototypePush(rows, row);
  }
  return dim(`╭─${
    ArrayPrototypeJoin(
      ArrayPrototypeMap(widths, (w) => StringPrototypeRepeat("─", w)),
      "─┬─",
    )
  }─╮`) + "\n" + ArrayPrototypeJoin(
    ArrayPrototypeMap(rows, (row, i) =>
      `${dim("│")} ${
        ArrayPrototypeJoin(
          ArrayPrototypeMap(
            row,
            (cell, col) =>
              (col === 0 || i === 0 ? bold : String)(StringPrototypePadEnd(
                cell,
                widths[col],
                " ",
              )),
          ),
          ` ${dim("│")} `,
        )
      } ${dim("│")}\n`),
    dim(`├─${
      ArrayPrototypeJoin(
        ArrayPrototypeMap(widths, (w) => StringPrototypeRepeat("─", w)),
        "─┼─",
      )
    }─┤`) + "\n",
  ) +
    dim(`╰─${
      ArrayPrototypeJoin(
        ArrayPrototypeMap(widths, (w) => StringPrototypeRepeat("─", w)),
        "─┴─",
      )
    }─╯`);
}

const line = new SafeRegExp("^", "gm");

export const createAnsiPrinter = (
  stdout: (message: string) => void,
  stderr?: (message: string) => void,
): Printer => {
  let depth = 0;
  return (type, data?) => {
    if (type === "groupEnd") {
      depth--;
      stdout(
        dim(StringPrototypeRepeat("│ ", depth) + "╰─┄┄") +
          "\n",
      );
      return;
    }
    const isGroup = type === "group" || type === "groupCollapsed";
    const write =
      (stderr && (type === "error" || type === "warn" || type === "trace"))
        ? stderr
        : stdout;
    write(
      type === "clear"
        ? (isColorSupported ? "\x1b[H\x1b[2J\x1b[3J" : "")
        : RegExpPrototypeSymbolReplace(
          line,
          (isGroup ? dim("╭┤") + " " : "") +
            (type === "trace" ? magenta("console.trace()") + " " : "") +
            (isGroup
              ? bold
              : type === "error"
              ? red
              : type === "warn"
              ? yellow
              : String)(
                ArrayPrototypeJoin(
                  ArrayPrototypeMap(
                    data,
                    (item) =>
                      typeof item === "string"
                        ? item
                        : `${
                          item.type === "table"
                            ? table(item.value as unknown[][])
                            : item.type === "string"
                            ? item.value
                            : inspect(item.value)
                        }${item.css === undefined ? "" : "\x1b[0m"}`,
                  ),
                  "",
                ),
              ),
          dim(StringPrototypeRepeat("│ ", depth)),
        ) + (isGroup ? " " + dim("├─┄┄") : "") + "\n",
    );
    if (isGroup) depth++;
  };
};
