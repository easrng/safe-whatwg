import {
  Array,
  ArrayFrom,
  ArrayIsArray,
  ArrayPrototypeFill,
  ArrayPrototypeFilter,
  ArrayPrototypeForEach,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypeUnshift,
  Boolean,
  DateNow,
  Error,
  MapPrototypeForEach,
  NumberParseFloat,
  NumberParseInt,
  ObjectAssign,
  ObjectDefineProperties,
  ObjectFromEntries,
  ObjectHasOwn,
  ObjectKeys,
  ObjectValues,
  ReflectHas,
  RegExpPrototypeSymbolReplace,
  String,
  StringPrototypeSlice,
  SymbolToStringTag,
} from "../_internal/primordials.js";
import {
  ArrayPrototypeMap,
  isMap,
  isSet,
  SafeArrayIterator,
  SafeRegExp,
  SafeSetIterator,
} from "../_internal/primordial-utils.ts";

export type Printer = (
  ...args:
    | [
      | "error"
      | "warn"
      | "log"
      | "info"
      | "debug"
      | "dir"
      | "trace"
      | "group"
      | "groupCollapsed"
      | "groupEnd",
      (string | Part)[],
    ]
    | ["clear"]
) => void;
type Logger = (
  ...args: [
    | "error"
    | "warn"
    | "log"
    | "info"
    | "debug"
    | "dir"
    | "trace"
    | "group"
    | "groupCollapsed"
    | "groupEnd",
    unknown[],
  ]
) => void;

const stripMe = new SafeRegExp(/^(?:.*Error.*\n)?.+\n/);
type Part = {
  css: string | undefined;
  value: unknown;
  type: "string" | "object" | "table";
};

function format(args: unknown[]): (string | Part)[] {
  const first = args[0];
  let a = 0;
  const parts: (Part | string)[] = [];

  if (typeof first == "string" && args.length > 1) {
    a++;
    // Index of the first not-yet-appended character. Use this so we only
    // have to append to `string` when a substitution occurs / at the end.
    let appendedChars = 0;
    let css: string | undefined;
    for (let i = 0; i < first.length - 1; i++) {
      if (first[i] == "%") {
        const char = first[++i];
        if (a < args.length) {
          let formattedArg: Part | string | null = null;
          switch (char) {
            case "s": {
              // Format as a string.
              formattedArg = String(args[a++]);
              break;
            }
            case "d":
            case "i": {
              // Format as an integer.
              const value = args[a++];
              if (typeof value === "symbol") {
                formattedArg = {
                  css,
                  type: "object",
                  value: NaN,
                };
              } else {
                formattedArg = {
                  css,
                  type: "object",
                  value: NumberParseInt(value as string, 10),
                };
              }
              break;
            }
            case "f": {
              // Format as a floating point value.
              const value = args[a++];
              if (typeof value === "symbol") {
                formattedArg = {
                  css,
                  type: "object",
                  value: NaN,
                };
              } else {
                formattedArg = {
                  css,
                  type: "object",
                  value: NumberParseFloat(value as string),
                };
              }
              break;
            }
            case "O":
            case "o": {
              // Format as an object.
              formattedArg = {
                css,
                type: "object",
                value: args[a++],
              };
              break;
            }
            case "c": {
              css = String(args[a++]);
              break;
            }
          }

          if (formattedArg !== null) {
            if (appendedChars !== i - 1) {
              ArrayPrototypePush(
                parts,
                StringPrototypeSlice(first, appendedChars, i - 1),
                formattedArg,
              );
            } else {
              ArrayPrototypePush(
                parts,
                formattedArg,
              );
            }
            appendedChars = i + 1;
          }
        }
        if (char == "%") {
          ArrayPrototypePush(
            parts,
            StringPrototypeSlice(first, appendedChars, i - 1) + "%",
          );
          appendedChars = i + 1;
        }
      }
    }
    ArrayPrototypePush(
      parts,
      StringPrototypeSlice(first, appendedChars),
    );
    css = undefined;
  }

  for (; a < args.length; a++) {
    if (a > 0) {
      ArrayPrototypePush(
        parts,
        " ",
      );
    }
    if (typeof args[a] == "string") {
      ArrayPrototypePush(
        parts,
        args[a],
      );
    } else {
      // Use default maximum depth for null or undefined arguments.
      ArrayPrototypePush(
        parts,
        {
          css: undefined,
          type: "object",
          value: args[a],
        },
      );
    }
  }

  return parts;
}

/**
 * The Console interface provides methods for logging information to the console,
 * as well as other utility methods for debugging and inspecting code.
 * Methods include logging, debugging, and timing functionality.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/console
 */
export interface Console {
  /**
   * Tests that an expression is true. If not, logs an error message
   * @param condition The expression to test for truthiness
   * @param data Additional arguments to be printed if the assertion fails
   * @example
   * ```ts
   * console.assert(1 === 1, "This won't show");
   * console.assert(1 === 2, "This will show an error");
   * ```
   */
  assert(condition?: boolean, ...data: unknown[]): void;

  /**
   * Clears the console if the environment allows it
   * @example
   * ```ts
   * console.clear();
   * ```
   */
  clear(): void;

  /**
   * Maintains an internal counter for a given label, incrementing it each time the method is called
   * @param label The label to count. Defaults to 'default'
   * @example
   * ```ts
   * console.count('myCounter');
   * console.count('myCounter'); // Will show: myCounter: 2
   * ```
   */
  count(label?: string): void;

  /**
   * Resets the counter for a given label
   * @param label The label to reset. Defaults to 'default'
   * @example
   * ```ts
   * console.count('myCounter');
   * console.countReset('myCounter'); // Resets to 0
   * ```
   */
  countReset(label?: string): void;

  /**
   * Outputs a debugging message to the console
   * @param data Values to be printed to the console
   * @example
   * ```ts
   * console.debug('Debug message', { detail: 'some data' });
   * ```
   */
  debug(...data: unknown[]): void;

  /**
   * Displays a list of the properties of a specified object
   * @param item Object to display
   * @param options Formatting options
   * @example
   * ```ts
   * console.dir({ name: 'object', value: 42 }, { depth: 1 });
   * ```
   */
  dir(item?: unknown, options?: unknown): void;

  /**
   * @ignore
   */
  dirxml(...data: unknown[]): void;

  /**
   * Outputs an error message to the console.
   * This method routes the output to stderr,
   * unlike other console methods that route to stdout.
   * @param data Values to be printed to the console
   * @example
   * ```ts
   * console.error('Error occurred:', new Error('Something went wrong'));
   * ```
   */
  error(...data: unknown[]): void;

  /**
   * Creates a new inline group in the console, indenting subsequent console messages
   * @param data Labels for the group
   * @example
   * ```ts
   * console.group('Group 1');
   * console.log('Inside group 1');
   * console.groupEnd();
   * ```
   */
  group(...data: unknown[]): void;

  /**
   * Creates a new inline group in the console that is initially collapsed
   * @param data Labels for the group
   * @example
   * ```ts
   * console.groupCollapsed('Details');
   * console.log('Hidden until expanded');
   * console.groupEnd();
   * ```
   */
  groupCollapsed(...data: unknown[]): void;

  /**
   * Exits the current inline group in the console
   * @example
   * ```ts
   * console.group('Group');
   * console.log('Grouped message');
   * console.groupEnd();
   * ```
   */
  groupEnd(): void;

  /**
   * Outputs an informational message to the console
   * @param data Values to be printed to the console
   * @example
   * ```ts
   * console.info('Application started', { version: '1.0.0' });
   * ```
   */
  info(...data: unknown[]): void;

  /**
   * Outputs a message to the console
   * @param data Values to be printed to the console
   * @example
   * ```ts
   * console.log('Hello', 'World', 123);
   * ```
   */
  log(...data: unknown[]): void;

  /**
   * Displays tabular data as a table
   * @param tabularData Data to be displayed in table format
   * @param properties Array of property names to be displayed
   * @example
   * ```ts
   * console.table([
   *   { name: 'John', age: 30 },
   *   { name: 'Jane', age: 25 }
   * ]);
   * ```
   */
  table(tabularData?: unknown, properties?: string[]): void;

  /**
   * Starts a timer you can use to track how long an operation takes
   * @param label Timer label. Defaults to 'default'
   * @example
   * ```ts
   * console.time('operation');
   * // ... some code
   * console.timeEnd('operation');
   * ```
   */
  time(label?: string): void;

  /**
   * Stops a timer that was previously started
   * @param label Timer label to stop. Defaults to 'default'
   * @example
   * ```ts
   * console.time('operation');
   * // ... some code
   * console.timeEnd('operation'); // Prints: operation: 1234ms
   * ```
   */
  timeEnd(label?: string): void;

  /**
   * Logs the current value of a timer that was previously started
   * @param label Timer label
   * @param data Additional data to log
   * @example
   * ```ts
   * console.time('process');
   * // ... some code
   * console.timeLog('process', 'Checkpoint A');
   * ```
   */
  timeLog(label?: string, ...data: unknown[]): void;

  /**
   * Outputs a stack trace to the console
   * @param data Values to be printed to the console
   * @example
   * ```ts
   * console.trace('Trace message');
   * ```
   */
  trace(...data: unknown[]): void;

  /**
   * Outputs a warning message to the console
   * @param data Values to be printed to the console
   * @example
   * ```ts
   * console.warn('Deprecated feature used');
   * ```
   */
  warn(...data: unknown[]): void;
}

export function createConsole(printer: Printer): Console {
  const groupStack: unknown[][] = [];
  const countMap: Record<string, number> = { __proto__: null as never };
  const timerTable: Record<string, number> = { __proto__: null as never };
  const logger: Logger = (...args) => {
    printer(args[0], format(args[1]));
  };
  return ObjectDefineProperties(
    {
      __proto__: {},
      assert(condition: unknown = undefined, ...data: unknown[]) {
        if (condition) {
          return;
        }
        if (!data.length) {
          data[0] = "Assertion failed";
        } else if (typeof data[0] === "string") {
          data[0] = `Assertion failed: ${data[0]}`;
        } else {
          ArrayPrototypeUnshift(data, "Assertion failed");
        }
        logger("error", data);
      },
      clear() {
        while (groupStack.length) {
          logger("groupEnd", ArrayPrototypePop(groupStack));
        }
        printer("clear");
      },
      debug(...data: unknown[]) {
        logger("debug", data);
      },
      error(...data: unknown[]) {
        logger("error", data);
      },
      info(...data: unknown[]) {
        logger("info", data);
      },
      log(...data: unknown[]) {
        logger("log", data);
      },
      table(...args: unknown[]) {
        const data = args[0];
        const properties = args[1];

        if (
          args.length > 2 ||
          (properties !== undefined && !ArrayIsArray(properties))
        ) {
          logger("log", args);
          return;
        }

        let resultData: Record<PropertyKey, unknown>;
        const isSetObject = isSet(data);
        const isMapObject = isMap(data);
        const valuesKey = "Values";
        const indexKey = isSetObject || isMapObject ? "(iter idx)" : "(idx)";

        if (isSetObject) {
          // deno-lint-ignore no-explicit-any
          resultData = [...new SafeSetIterator(data as any)] as any;
        } else if (isMapObject) {
          let idx = 0;
          resultData = { __proto__: null };

          MapPrototypeForEach(data, (v, k) => {
            resultData[idx] = { Key: k, Values: v };
            idx++;
          });
        } else {
          // deno-lint-ignore no-explicit-any
          resultData = data as any;
        }

        const keys = ObjectKeys(resultData);
        const numRows = keys.length;

        const objectValues: Record<string | number, unknown[]> = properties
          ? ObjectFromEntries(
            ArrayPrototypeMap(
              properties,
              (name) => [name, ArrayPrototypeFill(new Array(numRows), "")],
            ),
          )
          : {};
        const indexKeys: PropertyKey[] = [];
        const values: unknown[] = [];

        let hasPrimitives = false;
        ArrayPrototypeForEach(keys, (k, idx) => {
          const value = resultData[k];
          const primitive = value === null ||
            (typeof value !== "function" && typeof value !== "object");
          if (properties === undefined && primitive) {
            hasPrimitives = true;
            ArrayPrototypePush(values, value);
          } else {
            const valueObj = value || {};
            const keys = properties || ObjectKeys(valueObj);
            for (let i = 0; i < keys.length; ++i) {
              const k = keys[i];
              if (!primitive && ReflectHas(valueObj, k)) {
                if (!(ReflectHas(objectValues, k))) {
                  objectValues[k] = ArrayPrototypeFill(new Array(numRows), "");
                }
                // deno-lint-ignore no-explicit-any
                objectValues[k][idx] = (valueObj as any)[k];
              }
            }
            ArrayPrototypePush(values, "");
          }

          ArrayPrototypePush(indexKeys, k);
        });

        const headerKeys = ObjectKeys(objectValues);
        const bodyValues = ObjectValues(objectValues);
        const headerProps = properties ||
          [
            ...new SafeArrayIterator(headerKeys),
            !isMapObject && hasPrimitives && valuesKey,
          ];
        const header = ArrayPrototypeFilter([
          indexKey,
          ...new SafeArrayIterator(headerProps),
        ], Boolean);
        const body = [
          indexKeys,
          ...new SafeArrayIterator(bodyValues),
          values,
        ];

        printer("log", [{
          css: undefined,
          type: "table",
          value: [
            header,
            ...new SafeArrayIterator(
              ArrayFrom(
                ObjectAssign({ __proto__: null }, { length: numRows }),
                (_, row) =>
                  ArrayPrototypeMap(header, (_, col) => body[col][row]),
              ),
            ),
          ],
        }]);
      },
      trace(...data: unknown[]) {
        logger("trace", [
          ...new SafeArrayIterator(data),
          "\n" + RegExpPrototypeSymbolReplace(stripMe, new Error().stack!, ""),
        ]);
      },
      warn(...data: unknown[]) {
        logger("warn", data);
      },
      dir(item: unknown = undefined) {
        logger("dir", [item]);
      },
      dirxml(...data: unknown[]) {
        logger("log", data);
      },
      count(label: string | undefined = undefined) {
        if (label === undefined) label = "default";
        label += "";
        countMap[label] ??= 0;
        logger("log", [`${label}: ${++countMap[label]}`]);
      },
      countReset(label: string | undefined = undefined) {
        if (label === undefined) label = "default";
        label += "";
        if (ObjectHasOwn(countMap, label)) {
          countMap[label] = 0;
        } else {
          logger("warn", [`Counter ${label} doesn't exist.`]);
        }
      },
      group(...data: unknown[]) {
        ArrayPrototypePush(groupStack, data);
        logger("group", data);
      },
      groupCollapsed(...data: unknown[]) {
        ArrayPrototypePush(groupStack, data);
        logger("groupCollapsed", data);
      },
      groupEnd() {
        const group = ArrayPrototypePop(groupStack);
        if (group) logger("groupEnd", group);
      },
      time(label: string | undefined = undefined) {
        if (label === undefined) label = "default";
        label += "";
        if (ObjectHasOwn(timerTable, label)) {
          logger("warn", [`Timer "${label}" already exists.`]);
        } else {
          timerTable[label] = DateNow();
        }
      },
      timeLog(label: string | undefined = undefined, ...data: unknown[]) {
        if (label === undefined) label = "default";
        label += "";
        if (ObjectHasOwn(timerTable, label)) {
          logger("log", [
            `${label}: ${DateNow() - timerTable[label]}ms`,
            ...new SafeArrayIterator(data),
          ]);
        } else {
          logger("warn", [`Timer "${label}" doesn't exist.`]);
        }
      },
      timeEnd(label: string | undefined = undefined, ...data: unknown[]) {
        if (label === undefined) label = "default";
        label += "";
        if (ObjectHasOwn(timerTable, label)) {
          logger("log", [
            `${label}: ${DateNow() - timerTable[label]}ms - timer ended`,
            ...new SafeArrayIterator(data),
          ]);
          delete timerTable[label];
        } else {
          logger("warn", [`Timer "${label}" doesn't exist.`]);
        }
      },
    },
    {
      [SymbolToStringTag]: {
        __proto__: null,
        value: "console",
        writable: false,
        enumerable: false,
        configurable: true,
      },
    },
  );
}
