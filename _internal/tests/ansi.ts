// deno-lint-ignore-file prefer-primordials
import { createConsole } from "../../console/unstable-create.ts";
import { createAnsiPrinter } from "../../console/unstable-ansi.ts";
const encoder = new TextEncoder();
const c = createConsole(
  createAnsiPrinter((message) => Deno.stdout.write(encoder.encode(message))),
);
c.time("time");
c.assert(true);
c.assert(false);
c.assert(false, "uwu");
c.count();
c.count(undefined);
c.countReset("default");
c.count({
  toString() {
    return "default";
  },
} as string);
c.count("a");
c.debug("debug");
c.timeLog("time");
c.dir({ dir: true }, { opts: true });
c.dirxml({ dirxml: true }, { notOpts: true });
c.error("error");
c.group("group");
c.info("info");
c.log("log");
c.groupCollapsed("groupCollapsed");
c.table([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
c.timeEnd("time");
c.trace("trace");
c.groupEnd();
c.warn("warn");
c.groupEnd();
c.log([new Map([[new Set([1, 2, 3]), Symbol.iterator]]), {
  a: 3,
  b: 4,
  c: [5, 6, [7, [8, [9]]], function a() {}],
}]);
