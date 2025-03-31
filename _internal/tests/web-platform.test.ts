// deno-lint-ignore-file prefer-primordials
"use strict";
import path from "node:path";
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert";
import { directlyRunnableTests, resourceDependentTests } from "./get_wpt.ts";
import { URL, URLSearchParams } from "../../url.ts";

import {
  isSpecialQueryPercentEncode,
  utf8PercentEncodeString,
} from "../url/percent-encoding.ts";

import idnaTestV2Data from "./web-platform-tests/resources/IdnaTestV2.json" with {
  type: "json",
};
import idnaTestV2RemovedData from "./web-platform-tests/resources/IdnaTestV2-removed.json" with {
  type: "json",
};
import urlTestData from "./web-platform-tests/resources/urltestdata.json" with {
  type: "json",
};
import urlTestDataJavaScriptOnly from "./web-platform-tests/resources/urltestdata-javascript-only.json" with {
  type: "json",
};
import settersData from "./web-platform-tests/resources/setters_tests.json" with {
  type: "json",
};
import percentEncodingData from "./web-platform-tests/resources/percent-encoding.json" with {
  type: "json",
};
import toASCIIData from "./web-platform-tests/resources/toascii.json" with {
  type: "json",
};
import { makeSafe } from "../primordial-utils.ts";

const str = (s: string) =>
  `'${
    s.replace(/[^ -~]/g, (u) =>
      `\\u${u.codePointAt(0)!.toString(16).padStart(4, "0").toUpperCase()}`)
  }'`;

Deno.test("Directly-runnable web platform tests", async (t) => {
  for (const testFile of directlyRunnableTests) {
    await runWPT(testFile, t.step);
  }
});

Deno.test("Data file-based web platform tests", async (t) => {
  assert.deepStrictEqual(
    resourceDependentTests,
    [
      "IdnaTestV2.window.js",
      "IdnaTestV2-removed.window.js",
      "url-constructor.any.js",
      "url-origin.any.js",
      "url-setters.any.js",
    ],
    "The list of resource-dependent tests should be updated if new tests are added",
  );

  await runWPT("IdnaTestV2.window.js", t.step, (sandbox) => {
    sandbox.runTests(idnaTestV2Data);
  });

  await runWPT("IdnaTestV2-removed.window.js", t.step, (sandbox) => {
    sandbox.runTests(idnaTestV2RemovedData);
  });

  await runWPT("url-constructor.any.js", t.step, (sandbox) => {
    sandbox.runURLTests(urlTestData);
    sandbox.runURLTests(urlTestDataJavaScriptOnly);
  });

  await runWPT("url-origin.any.js", t.step, (sandbox) => {
    sandbox.runURLTests(urlTestData);
    sandbox.runURLTests(urlTestDataJavaScriptOnly);
  });

  await runWPT("url-setters.any.js", t.step, (sandbox) => {
    sandbox.runURLSettersTests(settersData);
  });
});

Deno.test("Manually recreated web platform tests", async (t) => {
  // Last sync:
  // https://github.com/web-platform-tests/wpt/blob/6d461b4ddb2f1b8d226ca6ae92e14bbd464731a5/url/failure.html
  await t.step("failure.html", async (t) => {
    for (const data of urlTestData) {
      if (typeof data === "string" || !data.failure || data.base !== null) {
        continue;
      }

      const name = `${data.input} should throw`;

      await t.step(`URL's constructor's base argument: ${name}`, () => {
        // URL's constructor's first argument is tested by url-constructor.html
        // If a URL fails to parse with any valid base, it must also fail to parse with no base, i.e.
        // when used as a base URL itself.
        assert.throws(() => new URL("about:blank", data.input), TypeError);
      });

      await t.step(`URL's href: ${name}`, () => {
        const url = new URL("about:blank");
        assert.throws(() => {
          url.href = data.input;
        }, TypeError);
      });
    }
  });

  // Last sync:
  // https://github.com/web-platform-tests/wpt/blob/6d461b4ddb2f1b8d226ca6ae92e14bbd464731a5/url/percent-encoding.window.js
  await t.step("percent-encoding.window.js", async (t) => {
    for (const data of percentEncodingData) {
      if (typeof data === "string") {
        continue;
      }

      // whatwg-url only supports UTF-8 percent encoding for now.
      const { input } = data;
      const output = data.output["utf-8"];

      await t.step(`Input ${input} with encoding utf-8`, () => {
        // Unit test
        assert.equal(
          utf8PercentEncodeString(input, isSpecialQueryPercentEncode, false),
          output,
        );

        // Integration test
        const url = new URL(`https://doesnotmatter.invalid/?${input}#${input}`);
        assert.equal(url.search, `?${output}`, "search");
        assert.equal(url.hash, `#${output}`, "hash");
      });
    }
  });

  // Last sync:
  // https://github.com/web-platform-tests/wpt/blob/6d461b4ddb2f1b8d226ca6ae92e14bbd464731a5/url/toascii.window.js
  await t.step("toascii.window.js", async (t) => {
    for (const data of toASCIIData) {
      if (typeof data === "string") {
        continue;
      }

      await t.step(`${str(data.input)} (using URL)`, () => {
        if (data.output !== null) {
          const url = new URL(`https://${data.input}/x`);
          assert.equal(url.host, data.output);
          assert.equal(url.hostname, data.output);
          assert.equal(url.pathname, "/x");
          assert.equal(url.href, `https://${data.output}/x`);

          const url2 = new URL("https://x/x");
          url2.hostname = data.input;
          assert.equal(url2.hostname, data.output);

          const url3 = new URL("https://x/x");
          url3.host = data.input;
          assert.equal(url3.host, data.output);
        } else {
          assert.throws(() => new URL(`https://${data.input}/x`), TypeError);
        }
      });

      for (const val of ["host", "hostname"] as const) {
        await t.step(`${str(data.input)} (using URL's ${val} setter)`, () => {
          const url = new URL(`https://x/x`);
          url[val] = data.input;
          if (data.output !== null) {
            assert.equal(url[val], data.output);
          } else {
            assert.equal(url[val], "x");
          }
        });
      }
    }
  });
});

Deno.test("makeSafe", () => {
  const SafeURL = makeSafe(URL, class SafeURL extends URL {});
  const u = new SafeURL("https://example.com");
  assert.strictEqual(u.toString(), "https://example.com/");
});

function runWPT(
  testFile: string,
  test: (
    name: string,
    fn: (t: Deno.TestContext) => void | Promise<void>,
  ) => Promise<boolean>,
  extraAction = (_sandbox: vm.Context) => {},
) {
  return test(testFile, async (t) => {
    const filePath = path.resolve(
      import.meta.dirname!,
      "web-platform-tests",
      testFile,
    );
    const code = fs.readFileSync(filePath, { encoding: "utf-8" });

    let chain = Promise.resolve(true);

    const sandbox = vm.createContext({
      URL,
      URLSearchParams,
      DOMException,
      fetch: fakeFetch,

      test(func: () => void, name?: string) {
        if (name?.includes("FormData")) return;
        chain = chain.then(() => t.step(name || "[single-file test]", func));
      },

      promise_test(func: () => Promise<void>, name?: string) {
        if (name?.includes(".formData()")) return;
        chain = chain.then(() => t.step(name || "[single-file test]", func));
      },

      assert_true(actual: unknown) {
        assert.strictEqual(actual, true);
      },

      assert_false(actual: unknown) {
        assert.strictEqual(actual, false);
      },

      assert_equals(actual: unknown, expected: unknown) {
        assert.strictEqual(actual, expected);
      },

      assert_not_equals(actual: unknown, expected: unknown) {
        assert.notStrictEqual(actual, expected);
      },

      assert_array_equals(actual: unknown[], expected: unknown[]) {
        assert.deepStrictEqual([...actual], [...expected]);
      },

      assert_throws_js(
        errorConstructor: ErrorConstructor,
        func: () => unknown,
      ) {
        // Don't pass errorConstructor itself since that brings in tricky realm issues.
        assert.throws(func, errorConstructor.name);
      },

      assert_unreached() {
        assert(false);
      },

      subsetTestByKey(
        _key: string,
        testRunnerFunc: (func: () => void, name: string) => void,
        func: () => void,
        name: string,
      ) {
        // Don't do any keying stuff.
        testRunnerFunc(func, name);
      },
    });

    try {
      vm.runInContext(code, sandbox, {
        filename: testFile,
        displayErrors: true,
      });

      extraAction(sandbox);
    } finally {
      let prev;
      while (prev !== chain) {
        prev = chain;
        await prev;
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  });
}

function fakeFetch(url: string) {
  const filePath = path.resolve(
    import.meta.dirname!,
    "web-platform-tests",
    url,
  );
  return Promise.resolve({
    json() {
      return fs.promises.readFile(filePath, { encoding: "utf-8" }).then(
        JSON.parse,
      );
    },
  });
}
