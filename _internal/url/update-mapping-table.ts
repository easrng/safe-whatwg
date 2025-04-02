import { deepEqual } from "node:assert";
import {
  ArrayIsArray,
  Function,
  JSONParse,
  JSONStringify,
} from "../primordials.js";

const raw = await (
  await fetch("https://cdn.jsdelivr.net/npm/tr46@5.1.0/lib/mappingTable.json")
).text();
const t: [
  number | [number, number],
  number,
  ...([] | [string]),
][] = JSONParse(raw);
let p = 0;
for (let i = 0; i < t.length; i++) {
  const e = t[i][0];
  if (ArrayIsArray(e)) {
    const { 0: a, 1: b } = e;
    e[0] = a - p;
    e[1] = b - a;
    p = b;
  } else {
    t[i][0] = e - p;
    p = e;
  }
}

const decomp =
  `// @ts-self-types="./mapping-table.d.ts"\n// deno-fmt-ignore-file\n// deno-lint-ignore prefer-const\nlet i,e,p=0,a=${
    JSONStringify(t)
  };for(i=0;i<a.length;i++)e=a[i][0],e[1]?(e[0]=p+=e[0],e[1]=p+=e[1]):a[i][0]=p+=e`;
deepEqual(
  JSONParse(raw),
  new Function(decomp + ";return a")(),
);
await Deno.writeTextFile(
  "_internal/url/mapping-table.js",
  decomp + ";export{a as default}",
);
