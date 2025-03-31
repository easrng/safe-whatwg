// deno-lint-ignore-file prefer-primordials
"use strict";

// Pin to specific version
//
// To get the latest commit:
// 1. Go to https://github.com/web-platform-tests/wpt/tree/master/url
// 2. Press "y" on your keyboard to get a permalink
// 3. Copy the commit hash
const commitHash = "bd675eac22189c59cd721d7b51ad0cbbfb43e8ce";

const urlPrefix =
  `https://raw.githubusercontent.com/web-platform-tests/wpt/${commitHash}/url/`;
const targetDir = new URL("./web-platform-tests/", import.meta.url);

// These resources we download, but the test runner doesn't need to know about them.
const resources = [
  "resources/percent-encoding.json",
  "resources/setters_tests.json",
  "resources/toascii.json",
  "resources/urltestdata.json",
  "resources/urltestdata-javascript-only.json",
  "resources/IdnaTestV2.json",
  "resources/IdnaTestV2-removed.json",
];

// These tests we can download and run directly in /test/web-platform.js.
export const directlyRunnableTests = [
  "url-searchparams.any.js",
  "url-setters-stripping.any.js",
  "url-statics-canparse.any.js",
  "url-statics-parse.any.js",
  "url-tojson.any.js",
  "urlencoded-parser.any.js",
  "urlsearchparams-append.any.js",
  "urlsearchparams-constructor.any.js",
  "urlsearchparams-delete.any.js",
  "urlsearchparams-foreach.any.js",
  "urlsearchparams-getall.any.js",
  "urlsearchparams-get.any.js",
  "urlsearchparams-has.any.js",
  "urlsearchparams-set.any.js",
  "urlsearchparams-size.any.js",
  "urlsearchparams-sort.any.js",
  "urlsearchparams-stringifier.any.js",
];

// These tests need some special handling in /test/web-platform.js, since they need to be hooked up to their resource
// files in a case-by-case way. We still download them, but they're in a separately-exported array so that the runner
// can distinguish.
export const resourceDependentTests = [
  "IdnaTestV2.window.js",
  "IdnaTestV2-removed.window.js",
  "url-constructor.any.js",
  "url-origin.any.js",
  "url-setters.any.js",
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
        const res = await fetch(`${urlPrefix}${file}`);
        await Deno.writeFile(new URL(file, targetDir), res.body!);
      }),
  );
}
