// deno-lint-ignore-file prefer-primordials
"use strict";

// Pin to specific version
//
// To get the latest commit:
// 1. Go to https://github.com/web-platform-tests/wpt/tree/master/url
// 2. Press "y" on your keyboard to get a permalink
// 3. Copy the commit hash
const commitHash = "0557f15b1edaed64ca89d864a8be9ffd82c888ec";

const prefix =
  `http://cdn.jsdelivr.net/gh/web-platform-tests/wpt@${commitHash}/`;
const targetDir = new URL("./web-platform-tests/", import.meta.url);

// These resources we download, but the test runner doesn't need to know about them.
const resources = [
  "url/resources/percent-encoding.json",
  "url/resources/setters_tests.json",
  "url/resources/toascii.json",
  "url/resources/urltestdata.json",
  "url/resources/urltestdata-javascript-only.json",
  "url/resources/IdnaTestV2.json",
  "url/resources/IdnaTestV2-removed.json",
];

// These tests we can download and run directly in /test/web-platform.js.
export const directlyRunnableTests = [
  "url/url-searchparams.any.js",
  "url/url-setters-stripping.any.js",
  "url/url-statics-canparse.any.js",
  "url/url-statics-parse.any.js",
  "url/url-tojson.any.js",
  "url/urlencoded-parser.any.js",
  "url/urlsearchparams-append.any.js",
  "url/urlsearchparams-constructor.any.js",
  "url/urlsearchparams-delete.any.js",
  "url/urlsearchparams-foreach.any.js",
  "url/urlsearchparams-getall.any.js",
  "url/urlsearchparams-get.any.js",
  "url/urlsearchparams-has.any.js",
  "url/urlsearchparams-set.any.js",
  "url/urlsearchparams-size.any.js",
  "url/urlsearchparams-sort.any.js",
  "url/urlsearchparams-stringifier.any.js",
  "encoding/api-surrogates-utf8.any.js",
  "encoding/api-basics.any.js",
  "encoding/api-invalid-label.any.js",
  "encoding/api-replacement-encodings.any.js",
  "encoding/api-surrogates-utf8.any.js",
  "encoding/encodeInto.any.js",
  "encoding/iso-2022-jp-decoder.any.js",
  "encoding/textdecoder-arguments.any.js",
  "encoding/textdecoder-byte-order-marks.any.js",
  "encoding/textdecoder-copy.any.js",
  "encoding/textdecoder-eof.any.js",
  "encoding/textdecoder-fatal-single-byte.any.js",
  "encoding/textdecoder-fatal-streaming.any.js",
  "encoding/textdecoder-fatal.any.js",
  "encoding/textdecoder-ignorebom.any.js",
  "encoding/textdecoder-labels.any.js",
  "encoding/textdecoder-streaming.any.js",
  "encoding/textdecoder-utf16-surrogates.any.js",
  "encoding/textencoder-constructor-non-utf.any.js",
  "encoding/textencoder-utf16-surrogates.any.js",
];

// These tests need some special handling in /test/web-platform.js, since they need to be hooked up to their resource
// files in a case-by-case way. We still download them, but they're in a separately-exported array so that the runner
// can distinguish.
export const resourceDependentTests = [
  "url/IdnaTestV2.window.js",
  "url/IdnaTestV2-removed.window.js",
  "url/url-constructor.any.js",
  "url/url-origin.any.js",
  "url/url-setters.any.js",
];

// These tests need their logic duplicated in /test/web-platform.js, because we can't easly shim them. They are not
// downloaded, but we list them here so that it's easy to understand our categorization scheme.
// - failure.html
// - percent-encoding.window.js
// - toascii.window.js

if (import.meta.main) {
  try {
    await Deno.remove(targetDir, { recursive: true });
  } catch {
    // ignore
  }
  await Deno.mkdir(new URL("resources", targetDir), { recursive: true });

  await Promise.all(
    [
      ...resources,
      ...directlyRunnableTests,
      ...resourceDependentTests,
    ]
      .map(async (file) => {
        const res = await fetch(`${prefix}${file}`);
        if (!res.ok) throw new Error("http " + res.status);
        await Deno.mkdir(new URL(file + "/..", targetDir), { recursive: true });
        if (file === "encoding/textdecoder-fatal-single-byte.any.js") {
          await Deno.writeTextFile(
            new URL(file, targetDir),
            (await res.text()).replace(
              "for (var i = 0; i < 256; ++i) {",
              "for (let i = 0; i < 256; ++i) {",
            ),
          );
        } else {
          await Deno.writeFile(new URL(file, targetDir), res.body!);
        }
      }),
  );
}
