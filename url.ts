// Copyright 2018-2025 the Deno authors. MIT license.
import {
  CHAR_AMPERSAND,
  CHAR_EQUAL,
  CHAR_PERCENT,
  CHAR_PLUS,
} from "./_internal/constants.ts";
import * as webidl from "./_internal/webidl.ts";
import {
  basicURLParse,
  cannotHaveAUsernamePasswordPort,
  hasAnOpaquePath,
  serializeHost,
  serializePath,
  serializeURL,
  serializeURLOrigin,
  setThePassword,
  setTheUsername,
  type URLRecord,
} from "./_internal/url/state-machine.ts";
import { ArrayPrototypeMap, SafeRegExp } from "./_internal/primordial-utils.ts";
import {
  Array,
  ArrayIsArray,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  ArrayPrototypeSort,
  ArrayPrototypeSplice,
  Int8Array,
  NumberPOSITIVE_INFINITY,
  NumberPrototypeToString,
  ObjectKeys,
  RegExpPrototypeSymbolReplace,
  String,
  StringPrototypeCharCodeAt,
  StringPrototypeSlice,
  StringPrototypeToUpperCase,
  Symbol,
  SymbolIterator,
  TypeError,
  URIError,
} from "./_internal/primordials.js";
import { percentDecodeString } from "./_internal/url/percent-encoding.ts";
import { utf8DecodeWithoutBOM } from "./_internal/utf8.ts";

const isHexTable = new Int8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 0 - 15
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 16 - 31
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 32 - 47
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0, // 48 - 63
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 64 - 79
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 80 - 95
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 96 - 111
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 112 - 127
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 128 ...
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // ... 256
]);

function encodeStr(
  str: string,
  noEscapeTable: InstanceType<typeof Int8Array>,
  hexTable: string[],
): string {
  const len = str.length;
  if (len === 0) return "";

  let out = "";
  let lastPos = 0;
  let i = 0;

  outer: for (; i < len; i++) {
    let c = StringPrototypeCharCodeAt(str, i);

    // ASCII
    while (c < 0x80) {
      if (noEscapeTable[c] !== 1) {
        if (lastPos < i) out += StringPrototypeSlice(str, lastPos, i);
        lastPos = i + 1;
        out += hexTable[c];
      }

      if (++i === len) break outer;

      c = StringPrototypeCharCodeAt(str, i);
    }

    if (lastPos < i) out += StringPrototypeSlice(str, lastPos, i);

    // Multi-byte characters ...
    if (c < 0x800) {
      lastPos = i + 1;
      out += hexTable[0xc0 | (c >> 6)]! + hexTable[0x80 | (c & 0x3f)];
      continue;
    }
    if (c < 0xd800 || c >= 0xe000) {
      lastPos = i + 1;
      out += hexTable[0xe0 | (c >> 12)]! +
        hexTable[0x80 | ((c >> 6) & 0x3f)] +
        hexTable[0x80 | (c & 0x3f)];
      continue;
    }
    // Surrogate pair
    ++i;

    // This branch should never happen because all URLSearchParams entries
    // should already be converted to USVString. But, included for
    // completion's sake anyway.
    if (i >= len) throw new URIError();

    const c2 = StringPrototypeCharCodeAt(str, i) & 0x3ff;

    lastPos = i + 1;
    c = 0x10000 + (((c & 0x3ff) << 10) | c2);
    out += hexTable[0xf0 | (c >> 18)]! +
      hexTable[0x80 | ((c >> 12) & 0x3f)] +
      hexTable[0x80 | ((c >> 6) & 0x3f)] +
      hexTable[0x80 | (c & 0x3f)];
  }
  if (lastPos === 0) return str;
  if (lastPos < len) return out + StringPrototypeSlice(str, lastPos);
  return out;
}

// Adapted from querystring's implementation.
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-byte-serializer
const noEscape = new Int8Array([
  /*
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F
  */
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 0x00 - 0x0F
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 0x10 - 0x1F
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  1,
  1,
  0, // 0x20 - 0x2F
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0, // 0x30 - 0x3F
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1, // 0x40 - 0x4F
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  1, // 0x50 - 0x5F
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1, // 0x60 - 0x6F
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0, // 0x70 - 0x7F
]);

const hexTable = new Array(256);
for (let i = 0; i < 256; ++i) {
  hexTable[i] = "%" +
    StringPrototypeToUpperCase(
      (i < 16 ? "0" : "") + NumberPrototypeToString(i, 16),
    );
}

// Special version of hexTable that uses `+` for U+0020 SPACE.
const paramHexTable = ArrayPrototypeSlice(hexTable);
paramHexTable[0x20] = "+";

// application/x-www-form-urlencoded serializer
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-serializer
function serializeParams(array: [string, string][]) {
  const len = array.length;
  if (len === 0) return "";

  const firstEncodedParam = encodeStr(array[0]![0], noEscape, paramHexTable);
  const firstEncodedValue = encodeStr(array[0]![1], noEscape, paramHexTable);
  let output = `${firstEncodedParam}=${firstEncodedValue}`;

  for (let i = 1; i < len; i++) {
    const encodedParam = encodeStr(array[i]![0], noEscape, paramHexTable);
    const encodedValue = encodeStr(array[i]![1], noEscape, paramHexTable);
    output += `&${encodedParam}=${encodedValue}`;
  }

  return output;
}

// application/x-www-form-urlencoded parser
// Ref: https://url.spec.whatwg.org/#concept-urlencoded-parser
function parseParams(
  qs: string,
  pairs: [string, string][] = [],
): [string, string][] {
  let pair: [string, string] = ["", ""];
  let seenSep = false;
  let buf = "";
  let encoded = false;
  let encodeCheck = 0;
  let i = 0;
  let pairStart = i;
  let lastPos = i;
  for (; i < qs.length; ++i) {
    const code = StringPrototypeCharCodeAt(qs, i);

    // Try matching key/value pair separator
    if (code === CHAR_AMPERSAND) {
      if (pairStart === i) {
        // We saw an empty substring between pair separators
        lastPos = pairStart = i + 1;
        continue;
      }

      if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i);
      if (encoded) buf = utf8DecodeWithoutBOM(percentDecodeString(buf));

      // If `buf` is the key, add an empty value.

      pair[+seenSep] = buf;
      ArrayPrototypePush(pairs, pair);
      pair = ["", ""];

      seenSep = false;
      buf = "";
      encoded = false;
      encodeCheck = 0;
      lastPos = pairStart = i + 1;
      continue;
    }

    // Try matching key/value separator (e.g. '=') if we haven't already
    if (!seenSep && code === CHAR_EQUAL) {
      // Key/value separator match!
      if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i);
      if (encoded) buf = utf8DecodeWithoutBOM(percentDecodeString(buf));
      pair[0] = buf;

      seenSep = true;
      buf = "";
      encoded = false;
      encodeCheck = 0;
      lastPos = i + 1;
      continue;
    }

    // Handle + and percent decoding.
    if (code === CHAR_PLUS) {
      if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i);
      buf += " ";
      lastPos = i + 1;
    } else if (!encoded) {
      // Try to match an (valid) encoded byte (once) to minimize unnecessary
      // calls to string decoding functions
      if (code === CHAR_PERCENT) {
        encodeCheck = 1;
      } else if (encodeCheck > 0) {
        if (isHexTable[code] === 1) {
          if (++encodeCheck === 3) {
            encoded = true;
          }
        } else {
          encodeCheck = 0;
        }
      }
    }
  }

  // Deal with any leftover key or value data

  // There is a trailing &. No more processing is needed.
  if (pairStart === i) return pairs;

  if (lastPos < i) buf += StringPrototypeSlice(qs, lastPos, i);
  if (encoded) buf = utf8DecodeWithoutBOM(percentDecodeString(buf));
  pair[+seenSep] = buf;
  ArrayPrototypePush(pairs, pair);

  return pairs;
}

let isURLSearchParams: (v: object) => v is URLSearchParams;
let setURLObject: (sp: URLSearchParams, u: URL) => void;
let getListMap: (sp: URLSearchParams) => [string, string][];
let updateUrlSearch: (instance: URL, search: string) => void;

interface URLSearchParamsIterator<T>
  extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [SymbolIterator](): URLSearchParamsIterator<T>;
}

class URLSearchParams {
  static {
    // deno-lint-ignore prefer-primordials
    isURLSearchParams = (v) => #toString in v;
    setURLObject = (sp, u) => {
      sp.#urlObject = u;
    };
    getListMap = (o) => o.#listMap;
  }
  #listMap: [string, string][];
  #urlObject?: URL;
  constructor(rawInit: unknown = undefined) {
    const prefix = "Failed to construct 'URL'";
    if (rawInit == null) {
      // if there is no query string, return early
      this.#listMap = [];
      return;
    }
    let init = webidl.converters[
      "sequence<sequence<USVString>> or record<USVString, USVString> or USVString"
    ](rawInit, prefix, "Argument 1");

    if (typeof init === "string") {
      // Overload: USVString
      // If init is a string and starts with U+003F (?),
      // remove the first code point from init.
      if (init[0] == "?") {
        init = StringPrototypeSlice(init, 1);
      }
      this.#listMap = parseParams(init);
    } else if (ArrayIsArray(init)) {
      // Overload: sequence<sequence<USVString>>
      this.#listMap = ArrayPrototypeMap(init, (pair, i) => {
        if (pair.length !== 2) {
          throw new TypeError(
            `${prefix}: Item ${
              i + 0
            } in the parameter list does have length 2 exactly`,
          );
        }
        return [pair[0]!, pair[1]!];
      });
    } else {
      // Overload: record<USVString, USVString>
      this.#listMap = ArrayPrototypeMap(ObjectKeys(init), (key) => [
        key,
        (init as Record<string, string>)[key]!,
      ]);
    }
  }

  #updateUrlSearch() {
    const url = this.#urlObject;
    if (url === undefined) {
      return;
    }
    updateUrlSearch(
      url,
      this.#toString(),
    );
  }

  append(name: string, value: string) {
    webidl.assertBranded(this, isURLSearchParams);
    const prefix = "Failed to execute 'append' on 'URLSearchParams'";
    webidl.requiredArguments(arguments.length, 2, prefix);
    name = webidl.converters.USVString(name, prefix, "Argument 1");
    value = webidl.converters.USVString(value, prefix, "Argument 2");
    ArrayPrototypePush(this.#listMap, [name, value]);
    this.#updateUrlSearch();
  }

  delete(name: string, value: string | undefined = undefined) {
    webidl.assertBranded(this, isURLSearchParams);
    const prefix = "Failed to execute 'append' on 'URLSearchParams'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    name = webidl.converters.USVString(name, prefix, "Argument 1");
    const list = this.#listMap;
    let i = 0;
    if (value === undefined) {
      while (i < list.length) {
        if (list[i]![0] === name) {
          ArrayPrototypeSplice(list, i, 1);
        } else {
          i++;
        }
      }
    } else {
      value = webidl.converters.USVString(value, prefix, "Argument 2");
      while (i < list.length) {
        if (list[i]![0] === name && list[i]![1] === value) {
          ArrayPrototypeSplice(list, i, 1);
        } else {
          i++;
        }
      }
    }
    this.#updateUrlSearch();
  }

  getAll(name: string): string[] {
    webidl.assertBranded(this, isURLSearchParams);
    const prefix = "Failed to execute 'getAll' on 'URLSearchParams'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    name = webidl.converters.USVString(name, prefix, "Argument 1");
    const values: string[] = [];
    const entries = this.#listMap;
    for (let i = 0; i < entries.length; ++i) {
      const entry = entries[i]!;
      if (entry[0] === name) {
        ArrayPrototypePush(values, entry[1]);
      }
    }
    return values;
  }

  get(name: string): string | null {
    webidl.assertBranded(this, isURLSearchParams);
    const prefix = "Failed to execute 'get' on 'URLSearchParams'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    name = webidl.converters.USVString(name, prefix, "Argument 1");
    const entries = this.#listMap;
    for (let i = 0; i < entries.length; ++i) {
      const entry = entries[i]!;
      if (entry[0] === name) {
        return entry[1];
      }
    }
    return null;
  }

  has(name: string, value: string | undefined = undefined): boolean {
    webidl.assertBranded(this, isURLSearchParams);
    const prefix = "Failed to execute 'has' on 'URLSearchParams'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    name = webidl.converters.USVString(name, prefix, "Argument 1");
    if (value !== undefined) {
      value = webidl.converters.USVString(value, prefix, "Argument 2");
      return ArrayPrototypeSome(
        this.#listMap,
        (entry) => entry[0] === name && entry[1] === value,
      );
    }
    return ArrayPrototypeSome(
      this.#listMap,
      (entry) => entry[0] === name,
    );
  }

  set(name: string, value: string) {
    webidl.assertBranded(this, isURLSearchParams);
    const prefix = "Failed to execute 'set' on 'URLSearchParams'";
    webidl.requiredArguments(arguments.length, 2, prefix);
    name = webidl.converters.USVString(name, prefix, "Argument 1");
    value = webidl.converters.USVString(value, prefix, "Argument 2");

    const list = this.#listMap;

    // If there are any name-value pairs whose name is name, in list,
    // set the value of the first such name-value pair to value
    // and remove the others.
    let found = false;
    let i = 0;
    while (i < list.length) {
      if (list[i]![0] === name) {
        if (!found) {
          list[i]![1] = value;
          found = true;
          i++;
        } else {
          ArrayPrototypeSplice(list, i, 1);
        }
      } else {
        i++;
      }
    }

    // Otherwise, append a new name-value pair whose name is name
    // and value is value, to list.
    if (!found) {
      ArrayPrototypePush(list, [name, value]);
    }

    this.#updateUrlSearch();
  }

  sort() {
    webidl.assertBranded(this, isURLSearchParams);
    ArrayPrototypeSort(
      this.#listMap,
      (a, b) => a[0] === b[0] ? 0 : a[0] > b[0] ? 1 : -1,
    );
    this.#updateUrlSearch();
  }

  toString(): string {
    webidl.assertBranded(this, isURLSearchParams);
    return this.#toString();
  }

  #toString(): string {
    return serializeParams(this.#listMap);
  }

  get size(): number {
    webidl.assertBranded(this, isURLSearchParams);
    return this.#listMap.length;
  }

  forEach(
    // deno-lint-ignore no-unused-vars
    callbackfn: (value: string, key: string, parent: this) => void,
    // deno-lint-ignore no-unused-vars
    thisArg?: unknown,
  ): void {
    return implInMixinPairIterable();
  }
  keys(): URLSearchParamsIterator<string> {
    return implInMixinPairIterable();
  }
  values(): URLSearchParamsIterator<string> {
    return implInMixinPairIterable();
  }
  entries(): URLSearchParamsIterator<[string, string]> {
    return implInMixinPairIterable();
  }
  [SymbolIterator](): URLSearchParamsIterator<[string, string]> {
    return implInMixinPairIterable();
  }
}
const implInMixinPairIterable = (): never => {
  throw "implemented in mixinPairIterable";
};
webidl.mixinPairIterable(
  "URLSearchParams",
  URLSearchParams,
  getListMap,
  isURLSearchParams,
  0,
  1,
);

webidl.configureInterface(URLSearchParams, "URLSearchParams");

webidl.converters["URLSearchParams"] = webidl.createInterfaceConverter(
  "URLSearchParams",
  isURLSearchParams,
);

const skipInit: unique symbol = Symbol("skipInit") as never;

function potentiallyStripTrailingSpacesFromAnOpaquePath(url: URLRecord) {
  if (!hasAnOpaquePath(url)) {
    return;
  }

  if (url.fragment !== null) {
    return;
  }

  if (url.query !== null) {
    return;
  }

  url.path = RegExpPrototypeSymbolReplace(trailingSpace, url.path, "");
}

const trailingSpace = new SafeRegExp(/\u0020+$/u);

let isURL: (v: object) => v is URL;

class URL {
  static {
    // deno-lint-ignore prefer-primordials
    isURL = (v) => #href in v;
  }
  #urlRecord!: URLRecord;
  #queryObject?: URLSearchParams;
  #updateSearchParams() {
    const qo = this.#queryObject;
    if (!qo) return;
    const list = getListMap(qo);
    ArrayPrototypeSplice(list, 0, NumberPOSITIVE_INFINITY);
    const { query } = this.#urlRecord;
    if (query !== null) {
      parseParams(query, list);
    }
  }

  constructor(
    url: string | typeof skipInit,
    base: string | undefined = undefined,
  ) {
    // skip initialization for URL.parse
    if (url === skipInit) {
      return;
    }
    const prefix = "Failed to construct 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    url = webidl.converters.DOMString(url, prefix, "Argument 1");
    if (base !== undefined) {
      base = webidl.converters.DOMString(base, prefix, "Argument 2");
    }

    let parsedBase = null;
    if (base !== undefined) {
      parsedBase = basicURLParse(base);
      if (parsedBase === null) {
        throw new TypeError(`Invalid base URL: ${base}`);
      }
    }

    const parsedURL = basicURLParse(url, { baseURL: parsedBase });
    if (parsedURL === null) {
      throw new TypeError(`Invalid URL: ${url}`);
    }
    this.#urlRecord = parsedURL;
  }

  static {
    updateUrlSearch = (instance, value) => {
      if (value === "") {
        instance.#urlRecord.query = null;
        potentiallyStripTrailingSpacesFromAnOpaquePath(instance.#urlRecord);
        return;
      }

      instance!.#urlRecord.query = "";
      basicURLParse(value!, {
        url: instance!.#urlRecord,
        stateOverride: "query",
      });
    };
  }

  static parse(
    url: string,
    base: string | undefined = undefined,
  ): URL | null {
    const prefix = "Failed to execute 'URL.parse'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    url = webidl.converters.DOMString(url, prefix, "Argument 1");
    if (base !== undefined) {
      base = webidl.converters.DOMString(base, prefix, "Argument 2");
    }

    let parsedBase = null;
    if (base !== undefined) {
      parsedBase = basicURLParse(base);
      if (parsedBase === null) {
        return null;
      }
    }

    const parsedURL = basicURLParse(url, { baseURL: parsedBase });
    if (parsedURL === null) {
      return null;
    }

    // If initialized with webidl.createBranded, private properties are not be accessible,
    // so it is passed through the constructor
    const self = new this(skipInit);
    self.#urlRecord = parsedURL;
    return self;
  }

  static canParse(url: string, base: string | undefined = undefined): boolean {
    const prefix = "Failed to execute 'URL.canParse'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    url = webidl.converters.DOMString(url, prefix, "Argument 1");
    if (base !== undefined) {
      base = webidl.converters.DOMString(base, prefix, "Argument 2");
    }
    let parsedBase = null;
    if (base !== undefined) {
      parsedBase = basicURLParse(base);
      if (parsedBase === null) {
        return false;
      }
    }
    const parsedURL = basicURLParse(url, { baseURL: parsedBase });
    if (parsedURL === null) {
      return false;
    }
    return true;
  }

  get hash(): string {
    webidl.assertBranded(this, isURL);
    if (this.#urlRecord.fragment === null || this.#urlRecord.fragment === "") {
      return "";
    }

    return `#${this.#urlRecord.fragment}`;
  }

  set hash(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'hash' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    if (value === "") {
      this.#urlRecord.fragment = null;
      potentiallyStripTrailingSpacesFromAnOpaquePath(this.#urlRecord);
      return;
    }

    const input = value[0] === "#" ? StringPrototypeSlice(value, 1) : value;
    this.#urlRecord.fragment = "";
    basicURLParse(input, { url: this.#urlRecord, stateOverride: "fragment" });
  }

  /** @return {string} */
  get host(): string {
    webidl.assertBranded(this, isURL);
    const url = this.#urlRecord;

    if (url.host === null) {
      return "";
    }

    if (url.port === null) {
      return serializeHost(url.host)!;
    }

    return `${serializeHost(url.host)}:${url.port}`;
  }

  /** @param {string} value */
  set host(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'host' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    if (hasAnOpaquePath(this.#urlRecord)) {
      return;
    }

    basicURLParse(value, { url: this.#urlRecord, stateOverride: "host" });
  }

  /** @return {string} */
  get hostname(): string {
    webidl.assertBranded(this, isURL);
    if (this.#urlRecord.host === null) {
      return "";
    }

    return serializeHost(this.#urlRecord.host)!;
  }

  /** @param {string} value */
  set hostname(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'hostname' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    if (hasAnOpaquePath(this.#urlRecord)) {
      return;
    }

    basicURLParse(value, { url: this.#urlRecord, stateOverride: "hostname" });
  }

  get #href(): string {
    return serializeURL(this.#urlRecord);
  }

  get href(): string {
    webidl.assertBranded(this, isURL);
    return this.#href;
  }

  set href(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'href' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    const parsedURL = basicURLParse(value);
    if (parsedURL === null) {
      throw new TypeError(`Invalid URL: ${value}`);
    }

    this.#urlRecord = parsedURL;
    this.#updateSearchParams();
  }

  get origin(): string {
    webidl.assertBranded(this, isURL);
    return serializeURLOrigin(this.#urlRecord);
  }

  get password(): string {
    webidl.assertBranded(this, isURL);
    return this.#urlRecord.password;
  }

  set password(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'password' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    try {
      if (cannotHaveAUsernamePasswordPort(this.#urlRecord)) {
        return;
      }

      setThePassword(this.#urlRecord, value);
    } catch {
      /* pass */
    }
  }

  get pathname(): string {
    webidl.assertBranded(this, isURL);
    return serializePath(this.#urlRecord);
  }

  set pathname(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'pathname' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    try {
      if (hasAnOpaquePath(this.#urlRecord)) {
        return;
      }

      this.#urlRecord.path = [];
      basicURLParse(value, {
        url: this.#urlRecord,
        stateOverride: "path start",
      });
    } catch {
      /* pass */
    }
  }

  get port(): string {
    webidl.assertBranded(this, isURL);
    if (this.#urlRecord.port === null) {
      return "";
    }
    return String(this.#urlRecord.port);
  }

  set port(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'port' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    if (cannotHaveAUsernamePasswordPort(this.#urlRecord)) {
      return;
    }

    if (value === "") {
      this.#urlRecord.port = null;
    } else {
      basicURLParse(value, { url: this.#urlRecord, stateOverride: "port" });
    }
  }

  get protocol(): string {
    webidl.assertBranded(this, isURL);
    return `${this.#urlRecord.scheme}:`;
  }

  set protocol(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'protocol' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    try {
      basicURLParse(`${value}:`, {
        url: this.#urlRecord,
        stateOverride: "scheme start",
      });
    } catch {
      /* pass */
    }
  }

  get #search(): string {
    if (this.#urlRecord.query === null || this.#urlRecord.query === "") {
      return "";
    }

    return `?${this.#urlRecord.query}`;
  }

  get search(): string {
    webidl.assertBranded(this, isURL);
    return this.#search;
  }

  set search(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'search' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    try {
      const url = this.#urlRecord;

      if (value === "") {
        url.query = null;
        getListMap(this.#queryObject!)?.splice(0);
        potentiallyStripTrailingSpacesFromAnOpaquePath(this.#urlRecord);
        return;
      }

      const input = value[0] === "?" ? StringPrototypeSlice(value, 1) : value;
      url.query = "";
      basicURLParse(input, { url, stateOverride: "query" });
      this.#updateSearchParams();
    } catch {
      /* pass */
    }
  }

  get username(): string {
    webidl.assertBranded(this, isURL);
    // https://github.com/servo/rust-url/blob/1d307ae51a28fecc630ecec03380788bfb03a643/url/src/lib.rs#L881
    return this.#urlRecord.username;
  }

  set username(value: string) {
    webidl.assertBranded(this, isURL);
    const prefix = "Failed to set 'username' on 'URL'";
    webidl.requiredArguments(arguments.length, 1, prefix);
    value = webidl.converters.DOMString(value, prefix, "Argument 1");
    try {
      if (cannotHaveAUsernamePasswordPort(this.#urlRecord)) {
        return;
      }

      setTheUsername(this.#urlRecord, value);
    } catch {
      /* pass */
    }
  }

  get searchParams(): URLSearchParams {
    if (this.#queryObject == null) {
      this.#queryObject = new URLSearchParams(this.#search);
      setURLObject(this.#queryObject, this);
    }
    return this.#queryObject;
  }

  toString(): string {
    webidl.assertBranded(this, isURL);
    return this.#href;
  }

  toJSON(): string {
    webidl.assertBranded(this, isURL);
    return this.#href;
  }
}

webidl.configureInterface(URL, "URL");

export { URL, URLSearchParams };
