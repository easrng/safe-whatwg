// deno-lint-ignore-file no-property-access/no-property-access
import { expandGlob } from "jsr:@std/fs@^1.0.19";
import { basename, fromFileUrl, join, relative } from "jsr:@std/path@^1.1.1";
import pkg from "../deno.json" with { type: "json" };
import { transformAsync } from "npm:oxc-transform@0.95.0";
import { parseAsync, Visitor } from "npm:oxc-parser@0.95.0";
import MagicString from "npm:magic-string@0.30.19";
import assert from "node:assert";
const base = fromFileUrl(new URL("..", import.meta.url));
await Deno.remove(join(base, "dist"), { recursive: true }).catch(() => {});
await Deno.mkdir(join(base, "dist"));
async function fixup(outPath: string, code: string) {
  const ms = new MagicString(code);
  const result = await parseAsync(basename(outPath), code);
  const update = (
    node: { value: string; start: number; end: number } | undefined | null,
  ) => {
    if (!node) return;
    const newValue = node.value.replace(/(\.[cm]?)ts$/, "$1js");
    ms.overwrite(node.start, node.end, JSON.stringify(newValue));
  };
  const visitor = new Visitor({
    ImportDeclaration(node) {
      update(node.source);
    },
    ImportExpression(node) {
      assert(node.source.type === "Literal");
      assert(typeof node.source.value === "string");
      update(node.source);
    },
    TSImportType(node) {
      assert(node.argument.type === "TSLiteralType");
      assert(node.argument.literal.type === "Literal");
      assert(typeof node.argument.literal.value === "string");
    },
    ExportAllDeclaration(node) {
      update(node.source);
    },
    ExportNamedDeclaration(node) {
      update(node.source);
    },
  });
  visitor.visit(result.program);
  return (
    (outPath.endsWith("js")
      ? `// @ts-self-types=${
        JSON.stringify(
          `./${basename(outPath).replace(/(\.[cm]?)js$/, ".d$1ts")}`,
        )
      }\n`
      : "") + ms.toString()
  );
}
for await (
  const entry of expandGlob("**/*", {
    exclude: [...pkg.publish.exclude, "**/.*", "**/deno.json", "**/deno.lock"],
    root: base,
  })
) {
  const outPath = join(base, "dist", relative(base, entry.path));
  if (entry.isDirectory) {
    await Deno.mkdir(outPath);
  }
  if (entry.isFile) {
    if (/\.[cm]?[tj]s$/.test(outPath)) {
      const code = await Deno.readTextFile(entry.path);
      if (/\.[cm]?ts$/.test(entry.path) && !entry.path.includes(".d.")) {
        const result = await transformAsync(basename(entry.path), code, {
          typescript: {
            declaration: {},
          },
        });
        const declPath = outPath.replace(/(\.[cm]?ts$)/, ".d$1");
        await Deno.writeTextFile(
          declPath,
          await fixup(declPath, result.declaration!),
        );
        const jsPath = outPath.replace(/(\.[cm]?)ts$/, "$1js");
        await Deno.writeTextFile(jsPath, await fixup(jsPath, result.code));
      } else {
        await Deno.writeTextFile(outPath, await fixup(outPath, code));
      }
    } else {
      await Deno.copyFile(entry.path, outPath);
    }
  }
}
const outPath = join(base, "dist", "package.json");
await Deno.writeTextFile(
  outPath,
  JSON.stringify(
    {
      name: "@purl.org/safe-whatwg",
      version: pkg.version,
      description:
        "An implementation of various Web/WHATWG APIs, intended to be robust, correct, and portable.",
      keywords: [
        "URL",
        "URLSearchParams",
        "TextEncoder",
        "TextDecoder",
        "DOMException",
        "WHATWG",
      ],
      contributors: [
        {
          name: "easrng",
          url: "at://did:plc:7prhbuf5izwc7xlbitgpt3sn",
        },
      ],
      license: "MIT",
      type: "module",
      exports: Object.fromEntries(
        Object.entries(pkg.exports).map((e) => [
          e[0],
          e[1].replace(/\.ts$/, ".js"),
        ]),
      ),
    },
    null,
    2,
  ),
);
