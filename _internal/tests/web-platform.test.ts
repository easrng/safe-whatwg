// deno-lint-ignore-file prefer-primordials
import path from "node:path";
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert";
import { directlyRunnableTests, resourceDependentTests } from "./get_wpt.ts";
import { URL, URLSearchParams } from "../../url.ts";
import { TextDecoder, TextEncoder } from "../../encoding.ts";
import { DOMException } from "../../domexception.ts";
import encodings_table from "https://encoding.spec.whatwg.org/encodings.json" with {
  type: "json",
};

import {
  isSpecialQueryPercentEncode,
  utf8PercentEncodeString,
} from "../url/percent-encoding.ts";

import idnaTestV2Data from "./web-platform-tests/url/resources/IdnaTestV2.json" with {
  type: "json",
};
import idnaTestV2RemovedData from "./web-platform-tests/url/resources/IdnaTestV2-removed.json" with {
  type: "json",
};
import urlTestData from "./web-platform-tests/url/resources/urltestdata.json" with {
  type: "json",
};
import urlTestDataJavaScriptOnly from "./web-platform-tests/url/resources/urltestdata-javascript-only.json" with {
  type: "json",
};
import settersData from "./web-platform-tests/url/resources/setters_tests.json" with {
  type: "json",
};
import percentEncodingData from "./web-platform-tests/url/resources/percent-encoding.json" with {
  type: "json",
};
import toASCIIData from "./web-platform-tests/url/resources/toascii.json" with {
  type: "json",
};
import { makeSafe } from "../primordial-utils.ts";
import { ObjectHasOwn } from "../primordials.js";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createConsole } from "../../console/unstable-create.ts";

const str = (s: string) =>
  `'${
    s.replace(/[^ -~]/g, (u) =>
      `\\u${u.codePointAt(0)!.toString(16).padStart(4, "0").toUpperCase()}`)
  }'`;

for (const testFile of directlyRunnableTests) {
  await runWPT(testFile, Deno.test);
}

{
  assert.deepStrictEqual(
    resourceDependentTests,
    [
      "url/IdnaTestV2.window.js",
      "url/IdnaTestV2-removed.window.js",
      "url/url-constructor.any.js",
      "url/url-origin.any.js",
      "url/url-setters.any.js",
    ],
    "The list of resource-dependent tests should be updated if new tests are added",
  );

  await runWPT("url/IdnaTestV2.window.js", Deno.test, (sandbox) => {
    sandbox.runTests(idnaTestV2Data);
  });

  await runWPT("url/IdnaTestV2-removed.window.js", Deno.test, (sandbox) => {
    sandbox.runTests(idnaTestV2RemovedData);
  });

  await runWPT("url/url-constructor.any.js", Deno.test, (sandbox) => {
    sandbox.runURLTests(urlTestData);
    sandbox.runURLTests(urlTestDataJavaScriptOnly);
  });

  await runWPT("url/url-origin.any.js", Deno.test, (sandbox) => {
    sandbox.runURLTests(urlTestData);
    sandbox.runURLTests(urlTestDataJavaScriptOnly);
  });

  await runWPT("url/url-setters.any.js", Deno.test, (sandbox) => {
    sandbox.runURLSettersTests(settersData);
  });
}

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

const deps = await Promise.all(
  [
    "./web-platform-tests/resources/webidl2/lib/webidl2.js",
    "./web-platform-tests/resources/idlharness.js",
    "./setup.js",
  ].map((name) => import.meta.resolve(name)).map(async (
    url,
  ) => [fileURLToPath(url), await (await fetch(url)).text()]),
);

function _assert_inherits(name: string) {
  return function (
    object: object,
    property_name: PropertyKey,
    description: string,
  ) {
    assert(
      (typeof object === "object" && object !== null) ||
        typeof object === "function" ||
        // Or has [[IsHTMLDDA]] slot
        String(object) === "[object HTMLAllCollection]",
      name + ": " + (description ? description + ": " : "") +
        "provided value is not an object",
    );

    assert(
      "hasOwnProperty" in object,
      name + ": " +
        (description ? description + ": " : "") +
        "provided value is an object but has no hasOwnProperty method",
    );

    assert(
      // deno-lint-ignore no-prototype-builtins
      !object.hasOwnProperty(property_name),
      name + ": " +
        (description ? description + ": " : "") +
        `property '${
          String(property_name)
        }' found on object expected in prototype chain`,
    );

    assert(
      property_name in object,
      name + ": " +
        (description ? description + ": " : "") +
        `property '${String(property_name)}' not found in prototype chain`,
    );
  };
}

function runWPT(
  testFile: string,
  test: (
    name: string,
    fn: (t: Deno.TestContext) => void | Promise<void>,
  ) => unknown,
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

    const sandbox = vm.createContext(Object.defineProperties({
      get self() {
        return this;
      },
      encodings_table,
      createBuffer: (() => {
        // See https://github.com/whatwg/html/issues/5380 for why not `new SharedArrayBuffer()`
        let sabConstructor;
        try {
          sabConstructor =
            new WebAssembly.Memory({ shared: true, initial: 0, maximum: 0 })
              .buffer.constructor;
        } catch {
          sabConstructor = null;
        }
        // @ts-expect-error not typing this
        return (type, length, opts) => {
          if (type === "ArrayBuffer") {
            return new ArrayBuffer(length, opts);
          } else if (type === "SharedArrayBuffer") {
            if (sabConstructor && sabConstructor.name !== "SharedArrayBuffer") {
              throw new Error(
                "WebAssembly.Memory does not support shared:true",
              );
            }
            // @ts-expect-error not typing this
            return new sabConstructor(length, opts);
          } else {
            throw new Error("type has to be ArrayBuffer or SharedArrayBuffer");
          }
        };
      })(),
      MessageChannel: class {
        port1 = {
          postMessage(v: unknown, transferList: readonly ArrayBuffer[]) {
            structuredClone(v, { transfer: transferList });
          },
        };
      },
      fetch: fakeFetch.bind(filePath),
      format_value: Deno.inspect,

      test(func: () => void, name?: string) {
        if (name?.includes("FormData")) return;

        let err = undefined;
        try {
          func();
        } catch (e) {
          err = e;
        }
        chain = chain.then(() =>
          t.step(name || "[single-file test]", () => {
            if (err) throw err;
          })
        );
      },

      promise_test(func: () => Promise<void>, name?: string) {
        if (name?.includes(".formData()")) return;
        chain = chain.then(() => t.step(name || "[single-file test]", func));
      },

      async_test(name?: string) {
        return {
          step(func: () => Promise<void>) {
            let err = undefined;
            try {
              func();
            } catch (e) {
              err = e;
            }
            chain = chain.then(() =>
              t.step(name || "[single-file test]", () => {
                if (err) throw err;
              })
            );
          },
          done() {},
        };
      },

      assert_true(actual: unknown) {
        assert.strictEqual(actual, true);
      },

      assert_false(actual: unknown) {
        assert.strictEqual(actual, false);
      },

      assert_equals(actual: unknown, expected: unknown) {
        if (
          actual === Object.prototype &&
          Object.getPrototypeOf(expected) === null
        ) return;
        assert.strictEqual(actual, expected);
      },
      assert_in_array(
        actual: unknown,
        expected: unknown[],
        description: string,
      ) {
        assert(
          expected.indexOf(actual) != -1,
          "assert_in_array: " +
            (description ? description + ": " : "") +
            `value ${actual} not in array ${expected}`,
        );
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
      assert_own_property(
        object: object,
        property_name: string | symbol,
        description?: string,
      ) {
        assert(
          ObjectHasOwn(object, property_name),
          `assert_own_property: expected property ${property_name.toString()} missing${
            description ? ": " + description : ""
          }`,
        );
      },

      assert_inherits(
        object: object,
        property_name: PropertyKey,
        description: string,
      ) {
        return _assert_inherits("assert_inherits")(
          object,
          property_name,
          description,
        );
      },
      assert_regexp_match(
        actual: string,
        expected: RegExp,
        description: string,
      ) {
        /*
         * Test if a string (actual) matches a regexp (expected)
         */
        assert(
          expected.test(actual),
          "assert_regexp_match" + ": " +
            (description ? description + ": " : "") +
            `expected ${expected} but got ${actual}`,
        );
      },
      assert_class_string(
        object: object,
        class_string: string,
        description: string,
      ) {
        const actual = {}.toString.call(object);
        const expected = "[object " + class_string + "]";
        assert.strictEqual(
          actual,
          expected,
          "assert_class_string" +
            (description ? ": " + description : ""),
        );
      },

      subsetTestByKey(
        _key: string,
        testRunnerFunc: (...args: unknown[]) => void,
        ...args: unknown[]
      ) {
        // Don't do any keying stuff.
        return testRunnerFunc(...args);
      },
      shouldRunSubTest: () => true,

      setup(fn: () => void) {
        fn();
      },
      subsetTest(
        testFunc: (...args: unknown[]) => unknown,
        ...args: unknown[]
      ) {
        return testFunc(...args);
      },
      Function,
      Error,
      HostObject: Object,
    }, {
      DOMException: {
        value: DOMException,
        configurable: true,
        writable: true,
      },
      TextEncoder: {
        value: TextEncoder,
        configurable: true,
        writable: true,
      },
      TextDecoder: {
        value: TextDecoder,
        configurable: true,
        writable: true,
      },
      URL: {
        value: URL,
        configurable: true,
        writable: true,
      },
      URLSearchParams: {
        value: URLSearchParams,
        configurable: true,
        writable: true,
      },
      console: {
        value: createConsole(console.log),
        configurable: true,
        writable: true,
      },
    }));

    try {
      for (const [path, content] of deps) {
        vm.runInContext(
          content,
          sandbox,
          {
            filename: path,
            displayErrors: true,
          },
        );
      }
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

function fakeFetch(this: string, url: string) {
  const base = import.meta.resolve("./web-platform-tests/");
  url = new URL(
    url,
    "https://localhost/" + pathToFileURL(this).href.slice(
      base.length,
    ),
  ).href.replace(
    /^https:\/\/localhost\//,
    base,
  );
  return fetch(url);
}
