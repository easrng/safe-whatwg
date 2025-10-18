// deno-lint-ignore-file no-control-regex
// https://github.com/jsdom/whatwg-url/blob/414f17a3459b0872baee7a2b77e23953b8a5ccd9/lib/url-state-machine.js

import { toASCII as tr46_toASCII } from "./tr46.ts";
import {
  isASCIIAlpha,
  isASCIIAlphanumeric,
  isASCIIDigit,
  isASCIIHex,
} from "./infra.ts";
import {
  isC0ControlPercentEncode,
  isFragmentPercentEncode,
  isPathPercentEncode,
  isQueryPercentEncode,
  isSpecialQueryPercentEncode,
  isUserinfoPercentEncode,
  percentDecodeString,
  utf8PercentEncodeCodePoint,
  utf8PercentEncodeString,
} from "./percent-encoding.ts";

import {
  type Safe,
  SafeArrayIterator,
  SafeSet,
  TypedArrayPrototypeGetByteLength,
} from "../primordial-utils.ts";
import {
  ArrayIsArray,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  Error,
  FunctionPrototypeBind,
  isNaN,
  MathFloor,
  NumberParseInt,
  NumberPrototypeToString,
  ObjectCreate,
  ObjectFreeze,
  ObjectSetPrototypeOf,
  RegExpPrototypeSymbolReplace,
  RegExpPrototypeSymbolSearch,
  RegExpPrototypeTest,
  String,
  StringFromCharCode,
  StringFromCodePoint,
  StringPrototypeCharAt,
  StringPrototypeCharCodeAt,
  StringPrototypeCodePointAt,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeToLowerCase,
  Symbol,
  undefined,
} from "../primordials.js";
import { utf8DecodeWithoutBOM } from "../utf8.ts";
import { codePointArray } from "../codepoints.ts";

const specialSchemes: Safe<Record<string, number | null>> = {
  __proto__: null,
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
};

const failure: unique symbol = Symbol("failure") as never;

function at(input: Record<number, number>, idx: number) {
  const c = input[idx]!;
  return (c == null || c !== c) ? undefined : StringFromCodePoint(c);
}

function isSingleDot(buffer: string) {
  return buffer === "." || StringPrototypeToLowerCase(buffer) === "%2e";
}

function isDoubleDot(buffer: string) {
  buffer = StringPrototypeToLowerCase(buffer);
  return (
    buffer === ".." ||
    buffer === "%2e." ||
    buffer === ".%2e" ||
    buffer === "%2e%2e"
  );
}

function isWindowsDriveLetterCodePoints(cp1: number, cp2: number) {
  return isASCIIAlpha(cp1) && (cp2 === 58 /* : */ || cp2 === 124 /* | */);
}

function isWindowsDriveLetterString(string: string) {
  return (
    string.length === 2 &&
    isASCIIAlpha(StringPrototypeCodePointAt(string, 0)!) &&
    (string[1] === ":" || string[1] === "|")
  );
}

function isNormalizedWindowsDriveLetterString(string: string) {
  return (
    string.length === 2 &&
    isASCIIAlpha(StringPrototypeCodePointAt(string, 0)!) &&
    string[1] === ":"
  );
}

function containsForbiddenHostCodePoint(string: string) {
  return (
    RegExpPrototypeSymbolSearch(
      // used directly with RegExpPrototypeSymbolSearch
      // deno-lint-ignore prefer-primordials
      /\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u,
      string,
    ) !== -1
  );
}

function containsForbiddenDomainCodePoint(string: string) {
  return (
    containsForbiddenHostCodePoint(string) ||
    // used directly with RegExpPrototypeSymbolSearch
    // deno-lint-ignore prefer-primordials
    RegExpPrototypeSymbolSearch(/[\u0000-\u001F]|%|\u007F/u, string) !== -1
  );
}

function isSpecialScheme(scheme: string) {
  return specialSchemes[scheme] !== undefined;
}

function isSpecial(url: Safe<URLRecord>) {
  return isSpecialScheme(url.scheme);
}

function isNotSpecial(url: Safe<URLRecord>) {
  return !isSpecialScheme(url.scheme);
}

function defaultPort(scheme: string) {
  return specialSchemes[scheme];
}

function parseIPv4Number(input: string) {
  if (input === "") {
    return failure;
  }

  let R = 10;

  if (
    input.length >= 2 &&
    StringPrototypeCharAt(input, 0) === "0" &&
    StringPrototypeToLowerCase(StringPrototypeCharAt(input, 1)) === "x"
  ) {
    input = StringPrototypeSlice(input, 2);
    R = 16;
  } else if (input.length >= 2 && StringPrototypeCharAt(input, 0) === "0") {
    input = StringPrototypeSlice(input, 1);
    R = 8;
  }

  if (input === "") {
    return 0;
  }

  // used for RegExpPrototypeTest
  // deno-lint-ignore prefer-primordials
  let regex = /[^0-7]/u;
  if (R === 10) {
    // used for RegExpPrototypeTest
    // deno-lint-ignore prefer-primordials
    regex = /[^0-9]/u;
  }
  if (R === 16) {
    // used for RegExpPrototypeTest
    // deno-lint-ignore prefer-primordials
    regex = /[^0-9A-Fa-f]/u;
  }

  if (RegExpPrototypeTest(regex, input)) {
    return failure;
  }

  return NumberParseInt(input, R);
}

function parseIPv4(input: string) {
  const parts: string[] = StringPrototypeSplit(input, ".");
  if (parts[parts.length - 1] === "") {
    if (parts.length > 1) {
      ArrayPrototypePop(parts);
    }
  }

  if (parts.length > 4) {
    return failure;
  }

  const numbers: number[] = [];
  for (const part of new SafeArrayIterator(parts)) {
    const n = parseIPv4Number(part);
    if (n === failure) {
      return failure;
    }

    ArrayPrototypePush(numbers, n);
  }

  for (let i = 0; i < numbers.length - 1; ++i) {
    if (numbers[i]! > 255) {
      return failure;
    }
  }
  if (numbers[numbers.length - 1]! >= 256 ** (5 - numbers.length)) {
    return failure;
  }

  let ipv4 = ArrayPrototypePop(numbers)!;
  let counter = 0;

  for (const n of new SafeArrayIterator(numbers)) {
    ipv4 += n * 256 ** (3 - counter);
    ++counter;
  }

  return ipv4;
}

function serializeIPv4(address: number) {
  let output = "";
  let n = address;

  for (let i = 1; i <= 4; ++i) {
    output = String(n % 256) + output;
    if (i !== 4) {
      output = `.${output}`;
    }
    n = MathFloor(n / 256);
  }

  return output;
}

function parseIPv6(rawInput: string) {
  const address = [0, 0, 0, 0, 0, 0, 0, 0];
  let pieceIndex = 0;
  let compress = null;
  let pointer = 0;

  const input = codePointArray(rawInput);

  if (input[pointer] === 58 /* : */) {
    if (input[pointer + 1] !== 58 /* : */) {
      return failure;
    }

    pointer += 2;
    ++pieceIndex;
    compress = pieceIndex;
  }

  const length = TypedArrayPrototypeGetByteLength(input) / 4;
  while (pointer < length) {
    if (pieceIndex === 8) {
      return failure;
    }

    if (input[pointer] === 58 /* : */) {
      if (compress !== null) {
        return failure;
      }
      ++pointer;
      ++pieceIndex;
      compress = pieceIndex;
      continue;
    }

    let value = 0;
    let length = 0;

    while (length < 4 && isASCIIHex(input[pointer]!)) {
      value = value * 0x10 + NumberParseInt(at(input, pointer)!, 16);
      ++pointer;
      ++length;
    }

    if (input[pointer] === 46 /* . */) {
      if (length === 0) {
        return failure;
      }

      pointer -= length;

      if (pieceIndex > 6) {
        return failure;
      }

      let numbersSeen = 0;

      while (input[pointer] !== undefined) {
        let ipv4Piece = null;

        if (numbersSeen > 0) {
          if (input[pointer] === 46 /* . */ && numbersSeen < 4) {
            ++pointer;
          } else {
            return failure;
          }
        }

        if (!isASCIIDigit(input[pointer]!)) {
          return failure;
        }

        while (isASCIIDigit(input[pointer]!)) {
          const number = NumberParseInt(at(input, pointer)!);
          if (ipv4Piece === null) {
            ipv4Piece = number;
          } else if (ipv4Piece === 0) {
            return failure;
          } else {
            ipv4Piece = ipv4Piece * 10 + number;
          }
          if (ipv4Piece > 255) {
            return failure;
          }
          ++pointer;
        }

        address[pieceIndex] = address[pieceIndex]! * 0x100 + ipv4Piece!;

        ++numbersSeen;

        if (numbersSeen === 2 || numbersSeen === 4) {
          ++pieceIndex;
        }
      }

      if (numbersSeen !== 4) {
        return failure;
      }

      break;
    } else if (input[pointer] === 58 /* : */) {
      ++pointer;
      if (input[pointer] === undefined) {
        return failure;
      }
    } else if (input[pointer] !== undefined) {
      return failure;
    }

    address[pieceIndex] = value;
    ++pieceIndex;
  }

  if (compress !== null) {
    let swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex !== 0 && swaps > 0) {
      const temp = address[compress + swaps - 1]!;
      address[compress + swaps - 1] = address[pieceIndex]!;
      address[pieceIndex] = temp;
      --pieceIndex;
      --swaps;
    }
  } else if (compress === null && pieceIndex !== 8) {
    return failure;
  }

  return address;
}

function serializeIPv6(address: number[]) {
  let output = "";
  const compress = findTheIPv6AddressCompressedPieceIndex(address);
  let ignore0 = false;

  for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
    if (ignore0 && address[pieceIndex] === 0) {
      continue;
    } else if (ignore0) {
      ignore0 = false;
    }

    if (compress === pieceIndex) {
      const separator = pieceIndex === 0 ? "::" : ":";
      output += separator;
      ignore0 = true;
      continue;
    }

    output += NumberPrototypeToString(address[pieceIndex]!, 16);

    if (pieceIndex !== 7) {
      output += ":";
    }
  }

  return output;
}

function parseHostString(input: string, isOpaque = false) {
  if (input[0] === "[") {
    if (input[input.length - 1] !== "]") {
      return failure;
    }

    return parseIPv6(StringPrototypeSlice(input, 1, input.length - 1));
  }

  if (isOpaque) {
    return parseOpaqueHost(input);
  }

  const domain = utf8DecodeWithoutBOM(percentDecodeString(input));
  const asciiDomain = domainToASCII(domain);
  if (asciiDomain === failure) {
    return failure;
  }

  if (endsInANumber(asciiDomain)) {
    return parseIPv4(asciiDomain);
  }

  return asciiDomain;
}

function endsInANumber(input: string) {
  let i: number = input.length - 1;
  let end = i + 1;
  if (input[i] === ".") {
    end--;
    i--;
  }
  let seenDigit = false;
  for (; i >= 0; i--) {
    if (input[i] === ".") break;
    if (input[i] <= "9" && input[i] >= "0") seenDigit = true;
  }
  if (!seenDigit) return false;
  if (i < 0) i = 0;
  if (input[i] === ".") i++;
  const last = StringPrototypeSlice(input, i, end);
  if (parseIPv4Number(last) !== failure) {
    return true;
  }

  // used for RegExpPrototypeTest
  // deno-lint-ignore prefer-primordials
  if (RegExpPrototypeTest(/^[0-9]+$/u, last)) {
    return true;
  }

  return false;
}

function parseOpaqueHost(input: string) {
  if (containsForbiddenHostCodePoint(input)) {
    return failure;
  }

  return utf8PercentEncodeString(input, isC0ControlPercentEncode);
}

function findTheIPv6AddressCompressedPieceIndex(address: number[]) {
  let longestIndex = null;
  let longestSize = 1; // only find elements > 1
  let foundIndex = null;
  let foundSize = 0;

  for (let pieceIndex = 0; pieceIndex < address.length; ++pieceIndex) {
    if (address[pieceIndex] !== 0) {
      if (foundSize > longestSize) {
        longestIndex = foundIndex;
        longestSize = foundSize;
      }

      foundIndex = null;
      foundSize = 0;
    } else {
      if (foundIndex === null) {
        foundIndex = pieceIndex;
      }
      ++foundSize;
    }
  }

  if (foundSize > longestSize) {
    return foundIndex;
  }

  return longestIndex;
}

export function serializeHost(host: string | number | number[] | null) {
  if (typeof host === "number") {
    return serializeIPv4(host);
  }

  // IPv6 serializer
  if (ArrayIsArray(host)) {
    return `[${serializeIPv6(host)}]`;
  }

  return host;
}

function domainToASCII(domain: string, beStrict = false) {
  const result = tr46_toASCII(domain, {
    checkHyphens: beStrict,
    checkBidi: true,
    checkJoiners: true,
    useSTD3ASCIIRules: beStrict,
    transitionalProcessing: false,
    verifyDNSLength: beStrict,
    ignoreInvalidPunycode: false,
  });
  if (result === null) {
    return failure;
  }
  if (!beStrict) {
    if (result === "") {
      return failure;
    }
    if (containsForbiddenDomainCodePoint(result)) {
      return failure;
    }
  }
  return result;
}

function trimControlChars(string: string) {
  // Avoid using regexp because of this V8 bug: https://issues.chromium.org/issues/42204424

  let start = 0;
  let end = string.length;
  for (; start < end; ++start) {
    if (StringPrototypeCharCodeAt(string, start) > 0x20) {
      break;
    }
  }
  for (; end > start; --end) {
    if (StringPrototypeCharCodeAt(string, end - 1) > 0x20) {
      break;
    }
  }
  return StringPrototypeSlice(string, start, end);
}

function trimTabAndNewline(url: string) {
  // used directly in RegExpPrototypeSymbolReplace
  // deno-lint-ignore prefer-primordials
  return RegExpPrototypeSymbolReplace(/\u0009|\u000A|\u000D/gu, url, "");
}

function shortenPath(url: Safe<URLRecord & { path: string[] }>) {
  const path: string[] = url.path;
  if (path.length === 0) {
    return;
  }
  if (
    url.scheme === "file" &&
    path.length === 1 &&
    isNormalizedWindowsDriveLetter(path[0]!)
  ) {
    return;
  }

  ArrayPrototypePop(path);
}

function includesCredentials(url: Safe<URLRecord>) {
  return url.username !== "" || url.password !== "";
}

export function cannotHaveAUsernamePasswordPort(url: Safe<URLRecord>) {
  return url.host === null || url.host === "" || url.scheme === "file";
}

export function hasAnOpaquePath(
  url: Safe<URLRecord>,
): url is URLRecord & { path: string } {
  return typeof url.path === "string";
}

function isNormalizedWindowsDriveLetter(string: string) {
  // used directly in RegExpPrototypeTest
  // deno-lint-ignore prefer-primordials
  return RegExpPrototypeTest(/^[A-Za-z]:$/u, string);
}

export interface URLRecord {
  scheme: string;
  username: string;
  password: string;
  host: string | number | number[] | null;
  port: number | null;
  path: string | string[];
  query: string | null;
  fragment: string | null;
}

type StateParser = (
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
) => boolean | typeof failure;

class URLStateMachine {
  pointer: number = 0;
  input: Uint32Array;
  base: URLRecord | null = null;
  encodingOverride: string = "utf-8";
  stateOverride: StateParser | null = null;
  url: Safe<URLRecord>;
  failure: boolean = false;
  parseError: boolean = false;
  state: StateParser;
  stringBuffer: string;
  atFlag: boolean;
  arrFlag: boolean;
  passwordTokenSeenFlag: boolean;
  constructor(
    input: string,
    base: URLRecord | null | undefined,
    encodingOverride: string | null | undefined,
    url: Safe<URLRecord> | null | undefined,
    stateOverride: StateParser | null | undefined,
  ) {
    if (base) this.base = base;
    if (encodingOverride) this.encodingOverride = encodingOverride;
    if (stateOverride) this.stateOverride = stateOverride;

    if (url) {
      this.url = url;
    } else {
      this.url = {
        scheme: "",
        username: "",
        password: "",
        host: null,
        port: null,
        path: [],
        query: null,
        fragment: null,
      };

      const res = trimControlChars(input);
      if (res !== input) {
        this.parseError = true;
      }
      input = res;
    }

    const res = trimTabAndNewline(input);
    if (res !== input) {
      this.parseError = true;
    }
    input = res;

    this.state = stateOverride || parseSchemeStart;

    this.stringBuffer = "";
    this.atFlag = false;
    this.arrFlag = false;
    this.passwordTokenSeenFlag = false;

    const inputCodePoints = codePointArray(input);
    this.input = inputCodePoints;

    for (
      ;
      this.pointer <= TypedArrayPrototypeGetByteLength(inputCodePoints) / 4;
      ++this.pointer
    ) {
      const c = inputCodePoints[this.pointer | 0]!;
      const cStr = isNaN(c) ? undefined : StringFromCodePoint(c);

      // exec state machine
      const ret = this.state(
        this,
        c,
        cStr,
      );
      if (!ret) {
        break; // terminate algorithm
      } else if (ret === failure) {
        this.failure = true;
        break;
      }
    }
    return this;
  }
}
ObjectSetPrototypeOf(URLStateMachine.prototype, null);
ObjectFreeze(URLStateMachine.prototype);

export function parseSchemeStart(
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
): boolean | typeof failure {
  if (isASCIIAlpha(c)) {
    sm.stringBuffer += StringPrototypeToLowerCase(cStr!);
    sm.state = parseScheme;
  } else if (!sm.stateOverride) {
    sm.state = parseNoScheme;
    --sm.pointer;
  } else {
    sm.parseError = true;
    return failure;
  }

  return true;
}

function parseScheme(
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
): boolean | typeof failure {
  if (
    isASCIIAlphanumeric(c) || c === 43 /* + */ || c === 45 /* - */ ||
    c === 46 /* . */
  ) {
    sm.stringBuffer += c >= 65 && c <= 90 ? StringFromCharCode(c | 32) : cStr!;
  } else if (c === 58 /* : */) {
    const url: Safe<URLRecord> = sm.url;
    if (sm.stateOverride) {
      if (isSpecial(url) && !isSpecialScheme(sm.stringBuffer)) {
        return false;
      }

      if (!isSpecial(url) && isSpecialScheme(sm.stringBuffer)) {
        return false;
      }

      if (
        (includesCredentials(url) || url.port !== null) &&
        sm.stringBuffer === "file"
      ) {
        return false;
      }

      if (url.scheme === "file" && url.host === "") {
        return false;
      }
    }
    url.scheme = sm.stringBuffer;
    if (sm.stateOverride) {
      if (url.port === defaultPort(url.scheme)) {
        url.port = null;
      }
      return false;
    }
    sm.stringBuffer = "";
    const base: Safe<URLRecord | null> = sm.base;
    if (url.scheme === "file") {
      if (
        sm.input[sm.pointer + 1] !== 47 /* / */ ||
        sm.input[sm.pointer + 2] !== 47 /* / */
      ) {
        sm.parseError = true;
      }
      sm.state = parseFile;
    } else if (
      isSpecial(url) &&
      base !== null &&
      base.scheme === url.scheme
    ) {
      sm.state = parseSpecialRelativeOrAuthority;
    } else if (isSpecial(url)) {
      sm.state = parseSpecialAuthoritySlashes;
    } else if (sm.input[sm.pointer + 1] === 47 /* / */) {
      sm.state = parsePathOrAuthority;
      ++sm.pointer;
    } else {
      url.path = "";
      sm.state = parseOpaquePath;
    }
  } else if (!sm.stateOverride) {
    sm.stringBuffer = "";
    sm.state = parseNoScheme;
    sm.pointer = -1;
  } else {
    sm.parseError = true;
    return failure;
  }

  return true;
}

function parseNoScheme(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const base: Safe<URLRecord | null> = sm.base;
  const url: Safe<URLRecord> = sm.url;
  if (base === null || (hasAnOpaquePath(base) && c !== 35 /* # */)) {
    return failure;
  } else if (hasAnOpaquePath(base) && c === 35 /* # */) {
    url.scheme = base.scheme;
    url.path = base.path;
    url.query = base.query;
    url.fragment = "";
    sm.state = parseFragment;
  } else if (base.scheme === "file") {
    sm.state = parseFile;
    --sm.pointer;
  } else {
    sm.state = parseRelative;
    --sm.pointer;
  }

  return true;
}

function parseSpecialRelativeOrAuthority(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  if (c === 47 /* / */ && sm.input[sm.pointer + 1] === 47 /* / */) {
    sm.state = parseSpecialAuthorityIgnoreSlashes;
    ++sm.pointer;
  } else {
    sm.parseError = true;
    sm.state = parseRelative;
    --sm.pointer;
  }

  return true;
}

function parsePathOrAuthority(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  if (c === 47 /* / */) {
    sm.state = parseAuthority;
  } else {
    sm.state = parsePath;
    --sm.pointer;
  }

  return true;
}

function parseRelative(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const base: Safe<URLRecord | null> = sm.base;
  const url: Safe<URLRecord> = sm.url;
  if (base === null) throw new Error("invalid state");
  url.scheme = base.scheme;
  if (c === 47 /* / */) {
    sm.state = parseRelativeSlash;
  } else if (isSpecial(sm.url) && c === 92 /* \ */) {
    sm.parseError = true;
    sm.state = parseRelativeSlash;
  } else {
    url.username = base.username;
    url.password = base.password;
    url.host = base.host;
    url.port = base.port;
    url.path = ArrayPrototypeSlice(base.path);
    url.query = base.query;
    if (c === 63 /* ? */) {
      url.query = "";
      sm.state = parseQuery;
    } else if (c === 35 /* # */) {
      url.fragment = "";
      sm.state = parseFragment;
    } else if (!isNaN(c)) {
      url.query = null;
      ArrayPrototypePop(url.path as string[]);
      sm.state = parsePath;
      --sm.pointer;
    }
  }

  return true;
}

function parseRelativeSlash(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const base: Safe<URLRecord | null> = sm.base;
  const url: Safe<URLRecord> = sm.url;
  if (isSpecial(sm.url) && (c === 47 /* / */ || c === 92 /* \ */)) {
    if (c === 92 /* \ */) {
      sm.parseError = true;
    }
    sm.state = parseSpecialAuthorityIgnoreSlashes;
  } else if (c === 47 /* / */) {
    sm.state = parseAuthority;
  } else {
    if (base === null) throw new Error("invalid state");
    url.username = base.username;
    url.password = base.password;
    url.host = base.host;
    url.port = base.port;
    sm.state = parsePath;
    --sm.pointer;
  }

  return true;
}

function parseSpecialAuthoritySlashes(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  if (c === 47 /* / */ && sm.input[sm.pointer + 1] === 47 /* / */) {
    sm.state = parseSpecialAuthorityIgnoreSlashes;
    ++sm.pointer;
  } else {
    sm.parseError = true;
    sm.state = parseSpecialAuthorityIgnoreSlashes;
    --sm.pointer;
  }

  return true;
}

function parseSpecialAuthorityIgnoreSlashes(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  if (c !== 47 /* / */ && c !== 92 /* \ */) {
    sm.state = parseAuthority;
    --sm.pointer;
  } else {
    sm.parseError = true;
  }

  return true;
}

function parseAuthority(
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;
  if (c === 64 /* @ */) {
    sm.parseError = true;
    if (sm.atFlag) {
      sm.stringBuffer = `%40${sm.stringBuffer}`;
    }
    sm.atFlag = true;

    // careful, this is based on buffer and has its own pointer (sm.pointer != pointer) and inner chars
    const codePoints = codePointArray(sm.stringBuffer);
    const length = TypedArrayPrototypeGetByteLength(codePoints) / 4;
    for (let i = 0; i < length; ++i) {
      const codePoint = codePoints[i]!;

      if (codePoint === 58 /* : */ && !sm.passwordTokenSeenFlag) {
        sm.passwordTokenSeenFlag = true;
        continue;
      }
      const encodedCodePoints = utf8PercentEncodeCodePoint(
        codePoint,
        isUserinfoPercentEncode,
      );
      if (sm.passwordTokenSeenFlag) {
        url.password += encodedCodePoints;
      } else {
        url.username += encodedCodePoints;
      }
    }
    sm.stringBuffer = "";
  } else if (
    isNaN(c) ||
    c === 47 /* / */ ||
    c === 63 /* ? */ ||
    c === 35 /* # */ ||
    (isSpecial(sm.url) && c === 92 /* \ */)
  ) {
    if (sm.atFlag && sm.stringBuffer === "") {
      sm.parseError = true;
      return failure;
    }
    sm.pointer -=
      (TypedArrayPrototypeGetByteLength(codePointArray(sm.stringBuffer)) / 4) +
      1;
    sm.stringBuffer = "";
    sm.state = parseHost;
  } else {
    sm.stringBuffer += cStr;
  }

  return true;
}

function parseHostOrHostname(
  // is hostname
  this: boolean,
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;
  if (sm.stateOverride && url.scheme === "file") {
    --sm.pointer;
    sm.state = parseFileHost;
  } else if (c === 58 /* : */ && !sm.arrFlag) {
    if (sm.stringBuffer === "") {
      sm.parseError = true;
      return failure;
    }

    if (/* hostname reparser */ this) {
      return false;
    }

    const host = parseHostString(sm.stringBuffer, isNotSpecial(sm.url));
    if (host === failure) {
      return failure;
    }

    url.host = host;
    sm.stringBuffer = "";
    sm.state = parsePort;
  } else if (
    isNaN(c) ||
    c === 47 /* / */ ||
    c === 63 /* ? */ ||
    c === 35 /* # */ ||
    (isSpecial(sm.url) && c === 92 /* \ */)
  ) {
    --sm.pointer;
    if (isSpecial(sm.url) && sm.stringBuffer === "") {
      sm.parseError = true;
      return failure;
    } else if (
      sm.stateOverride &&
      sm.stringBuffer === "" &&
      (includesCredentials(sm.url) || url.port !== null)
    ) {
      sm.parseError = true;
      return false;
    }

    const host = parseHostString(sm.stringBuffer, isNotSpecial(sm.url));
    if (host === failure) {
      return failure;
    }

    url.host = host;
    sm.stringBuffer = "";
    sm.state = parsePathStart;
    if (sm.stateOverride) {
      return false;
    }
  } else {
    if (c === 91 /* [ */) {
      sm.arrFlag = true;
    } else if (c === 93 /* ] */) {
      sm.arrFlag = false;
    }
    sm.stringBuffer += cStr;
  }

  return true;
}
export const parseHost: StateParser = FunctionPrototypeBind(
  parseHostOrHostname,
  false,
);
export const parseHostName: StateParser = FunctionPrototypeBind(
  parseHostOrHostname,
  true,
);

export function parsePort(
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;
  if (isASCIIDigit(c)) {
    sm.stringBuffer += cStr;
  } else if (
    isNaN(c) ||
    c === 47 /* / */ ||
    c === 63 /* ? */ ||
    c === 35 /* # */ ||
    (isSpecial(sm.url) && c === 92 /* \ */) ||
    sm.stateOverride
  ) {
    if (sm.stringBuffer !== "") {
      const port = NumberParseInt(sm.stringBuffer);
      if (port > 2 ** 16 - 1) {
        sm.parseError = true;
        return failure;
      }
      url.port = port === defaultPort(url.scheme) ? null : port;
      sm.stringBuffer = "";
    }
    if (sm.stateOverride) {
      return false;
    }
    sm.state = parsePathStart;
    --sm.pointer;
  } else {
    sm.parseError = true;
    return failure;
  }

  return true;
}

const fileOtherwiseCodePoints: Safe<Set<number>> = new SafeSet([
  47, /* / */
  92, /* \ */
  63, /* ? */
  35, /* # */
]);

function startsWithWindowsDriveLetter(input: Uint32Array, pointer: number) {
  const length = (TypedArrayPrototypeGetByteLength(input) / 4) - pointer;
  return (
    length >= 2 &&
    isWindowsDriveLetterCodePoints(input[pointer]!, input[pointer + 1]!) &&
    (length === 2 || fileOtherwiseCodePoints.has(input[pointer + 2]))
  );
}

function parseFile(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;
  const base: Safe<URLRecord | null> = sm.base;
  url.scheme = "file";
  url.host = "";

  if (c === 47 /* / */ || c === 92 /* \ */) {
    if (c === 92 /* \ */) {
      sm.parseError = true;
    }
    sm.state = parseFileSlash;
  } else if (base !== null && base.scheme === "file") {
    url.host = base.host;
    url.path = ArrayPrototypeSlice(base.path);
    url.query = base.query;
    if (c === 63 /* ? */) {
      url.query = "";
      sm.state = parseQuery;
    } else if (c === 35 /* # */) {
      url.fragment = "";
      sm.state = parseFragment;
    } else if (!isNaN(c)) {
      url.query = null;
      if (!startsWithWindowsDriveLetter(sm.input, sm.pointer)) {
        shortenPath(
          sm.url satisfies URLRecord as URLRecord & { path: string[] },
        );
      } else {
        sm.parseError = true;
        url.path = [];
      }

      sm.state = parsePath;
      --sm.pointer;
    }
  } else {
    sm.state = parsePath;
    --sm.pointer;
  }

  return true;
}

function parseFileSlash(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const base: Safe<URLRecord | null> = sm.base;
  const url: Safe<URLRecord> = sm.url;

  if (c === 47 /* / */ || c === 92 /* \ */) {
    if (c === 92 /* \ */) {
      sm.parseError = true;
    }
    sm.state = parseFileHost;
  } else {
    if (base !== null && base.scheme === "file") {
      if (
        !startsWithWindowsDriveLetter(sm.input, sm.pointer) &&
        isNormalizedWindowsDriveLetterString(base.path[0]!)
      ) {
        ArrayPrototypePush(url.path as string[], base.path[0]!);
      }
      url.host = base.host;
    }
    sm.state = parsePath;
    --sm.pointer;
  }

  return true;
}

function parseFileHost(
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;
  if (
    isNaN(c) ||
    c === 47 /* / */ ||
    c === 92 /* \ */ ||
    c === 63 /* ? */ ||
    c === 35 /* # */
  ) {
    --sm.pointer;
    if (!sm.stateOverride && isWindowsDriveLetterString(sm.stringBuffer)) {
      sm.parseError = true;
      sm.state = parsePath;
    } else if (sm.stringBuffer === "") {
      url.host = "";
      if (sm.stateOverride) {
        return false;
      }
      sm.state = parsePathStart;
    } else {
      let host = parseHostString(sm.stringBuffer, isNotSpecial(sm.url));
      if (host === failure) {
        return failure;
      }
      if (host === "localhost") {
        host = "";
      }
      url.host = host;

      if (sm.stateOverride) {
        return false;
      }

      sm.stringBuffer = "";
      sm.state = parsePathStart;
    }
  } else {
    sm.stringBuffer += cStr;
  }

  return true;
}

export function parsePathStart(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;

  if (isSpecial(sm.url)) {
    if (c === 92 /* \ */) {
      sm.parseError = true;
    }
    sm.state = parsePath;

    if (c !== 47 /* / */ && c !== 92 /* \ */) {
      --sm.pointer;
    }
  } else if (!sm.stateOverride && c === 63 /* ? */) {
    url.query = "";
    sm.state = parseQuery;
  } else if (!sm.stateOverride && c === 35 /* # */) {
    url.fragment = "";
    sm.state = parseFragment;
  } else if (c !== undefined) {
    sm.state = parsePath;
    if (c !== 47 /* / */) {
      --sm.pointer;
    }
  } else if (sm.stateOverride && url.host === null) {
    ArrayPrototypePush(url.path as string[], "");
  }

  return true;
}

function parsePath(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;

  if (
    isNaN(c) ||
    c === 47 /* / */ ||
    (isSpecial(sm.url) && c === 92 /* \ */) ||
    (!sm.stateOverride && (c === 63 /* ? */ || c === 35 /* # */))
  ) {
    if (isSpecial(sm.url) && c === 92 /* \ */) {
      sm.parseError = true;
    }

    if (isDoubleDot(sm.stringBuffer)) {
      shortenPath(sm.url as URLRecord & { path: string[] });
      if (c !== 47 /* / */ && !(isSpecial(sm.url) && c === 92 /* \ */)) {
        ArrayPrototypePush(url.path as string[], "");
      }
    } else if (
      isSingleDot(sm.stringBuffer) &&
      c !== 47 /* / */ &&
      !(isSpecial(sm.url) && c === 92 /* \ */)
    ) {
      ArrayPrototypePush(url.path as string[], "");
    } else if (!isSingleDot(sm.stringBuffer)) {
      if (
        url.scheme === "file" &&
        // deno-lint-ignore no-property-access/no-property-access
        url.path.length === 0 &&
        isWindowsDriveLetterString(sm.stringBuffer)
      ) {
        sm.stringBuffer = `${sm.stringBuffer[0]}:`;
      }
      ArrayPrototypePush(url.path as string[], sm.stringBuffer);
    }
    sm.stringBuffer = "";
    if (c === 63 /* ? */) {
      url.query = "";
      sm.state = parseQuery;
    }
    if (c === 35 /* # */) {
      url.fragment = "";
      sm.state = parseFragment;
    }
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.

    if (
      c === 37 /* % */ &&
      (!isASCIIHex(sm.input[sm.pointer + 1]!) ||
        !isASCIIHex(sm.input[sm.pointer + 2]!))
    ) {
      sm.parseError = true;
    }

    sm.stringBuffer += utf8PercentEncodeCodePoint(c, isPathPercentEncode);
  }

  return true;
}

function parseOpaquePath(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;

  if (c === 63 /* ? */) {
    url.query = "";
    sm.state = parseQuery;
  } else if (c === 35 /* # */) {
    url.fragment = "";
    sm.state = parseFragment;
  } else if (c === 32 /*   */) {
    const remaining = sm.input[sm.pointer + 1];
    if (remaining === 63 /* ? */ || remaining === 35 /* # */) {
      url.path += "%20";
    } else {
      url.path += " ";
    }
  } else {
    // TODO: Add: not a URL code point
    if (!isNaN(c) && c !== 37 /* % */) {
      sm.parseError = true;
    }

    if (
      c === 37 /* % */ &&
      (!isASCIIHex(sm.input[sm.pointer + 1]!) ||
        !isASCIIHex(sm.input[sm.pointer + 2]!))
    ) {
      sm.parseError = true;
    }

    if (!isNaN(c)) {
      url.path += utf8PercentEncodeCodePoint(c, isC0ControlPercentEncode);
    }
  }

  return true;
}

export function parseQuery(
  sm: Safe<URLStateMachine>,
  c: number,
  cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;

  if (!isSpecial(url) || url.scheme === "ws" || url.scheme === "wss") {
    sm.encodingOverride = "utf-8";
  }

  if ((!sm.stateOverride && c === 35 /* # */) || isNaN(c)) {
    const queryPercentEncodePredicate = isSpecial(sm.url)
      ? isSpecialQueryPercentEncode
      : isQueryPercentEncode;
    url.query += utf8PercentEncodeString(
      sm.stringBuffer,
      queryPercentEncodePredicate,
    );

    sm.stringBuffer = "";

    if (c === 35 /* # */) {
      url.fragment = "";
      sm.state = parseFragment;
    }
  } else if (!isNaN(c)) {
    // TODO: If c is not a URL code point and not "%", parse error.

    if (
      c === 37 /* % */ &&
      (!isASCIIHex(sm.input[sm.pointer + 1]!) ||
        !isASCIIHex(sm.input[sm.pointer + 2]!))
    ) {
      sm.parseError = true;
    }

    sm.stringBuffer += cStr;
  }

  return true;
}

export function parseFragment(
  sm: Safe<URLStateMachine>,
  c: number,
  _cStr: string | undefined,
): boolean | typeof failure {
  const url: Safe<URLRecord> = sm.url;

  if (!isNaN(c)) {
    // TODO: If c is not a URL code point and not "%", parse error.
    if (
      c === 37 /* % */ &&
      (!isASCIIHex(sm.input[sm.pointer + 1]!) ||
        !isASCIIHex(sm.input[sm.pointer + 2]!))
    ) {
      sm.parseError = true;
    }

    url.fragment += utf8PercentEncodeCodePoint(c, isFragmentPercentEncode);
  }

  return true;
}

export function serializeURL(url: Safe<URLRecord>, excludeFragment?: boolean) {
  let output = `${url.scheme}:`;
  if (url.host !== null) {
    output += "//";

    if (url.username !== "" || url.password !== "") {
      output += url.username;
      if (url.password !== "") {
        output += `:${url.password}`;
      }
      output += "@";
    }

    output += serializeHost(url.host);

    if (url.port !== null) {
      output += `:${url.port}`;
    }
  }

  if (
    url.host === null &&
    !hasAnOpaquePath(url) &&
    // deno-lint-ignore no-property-access/no-property-access
    url.path.length > 1 &&
    url.path[0] === ""
  ) {
    output += "/.";
  }
  output += serializePath(url);

  if (url.query !== null) {
    output += `?${url.query}`;
  }

  if (!excludeFragment && url.fragment !== null) {
    output += `#${url.fragment}`;
  }

  return output;
}

function serializeOrigin(
  tuple: Safe<{
    scheme: string;
    host: string;
    port: number | null;
  }>,
) {
  let result = `${tuple.scheme}://`;
  result += serializeHost(tuple.host);

  if (tuple.port !== null) {
    result += `:${tuple.port}`;
  }

  return result;
}

export function serializePath(url: Safe<URLRecord>) {
  if (hasAnOpaquePath(url)) {
    return url.path;
  }

  let output = "";
  for (const segment of new SafeArrayIterator(url.path)) {
    output += `/${segment}`;
  }
  return output;
}

export function serializeURLOrigin(url: Safe<URLRecord>) {
  // https://url.spec.whatwg.org/#concept-url-origin
  switch (url.scheme) {
    case "blob": {
      const pathURL: Safe<URLRecord | null> = basicURLParse(serializePath(url));
      if (pathURL === null) {
        return "null";
      }
      if (pathURL.scheme !== "http" && pathURL.scheme !== "https") {
        return "null";
      }
      return serializeURLOrigin(pathURL);
    }
    case "ftp":
    case "http":
    case "https":
    case "ws":
    case "wss":
      return serializeOrigin({
        scheme: url.scheme,
        host: url.host as string,
        port: url.port,
      });
    case "file":
      // The spec says:
      // > Unfortunate as it is, this is left as an exercise to the reader. When in doubt, return a new opaque origin.
      // Browsers tested so far:
      // - Chrome says "file://", but treats file: URLs as cross-origin for most (all?) purposes; see e.g.
      //   https://bugs.chromium.org/p/chromium/issues/detail?id=37586
      // - Firefox says "null", but treats file: URLs as same-origin sometimes based on directory stuff; see
      //   https://developer.mozilla.org/en-US/docs/Archive/Misc_top_level/Same-origin_policy_for_file:_URIs
      return "null";
    default:
      // serializing an opaque origin returns "null"
      return "null";
  }
}

const empty = ObjectFreeze(ObjectCreate(null));
export function basicURLParse(
  input: string,
  options: Safe<{
    baseURL?: URLRecord | null | undefined;
    encodingOverride?: string | null | undefined;
    url?: URLRecord;
    stateOverride?: StateParser | null | undefined;
  }> = empty,
) {
  const usm: Safe<URLStateMachine> = new URLStateMachine(
    input,
    options.baseURL,
    options.encodingOverride,
    options.url,
    options.stateOverride,
  );
  if (usm.failure) {
    return null;
  }

  return usm.url;
}

export function setTheUsername(url: Safe<URLRecord>, username: string) {
  url.username = utf8PercentEncodeString(username, isUserinfoPercentEncode);
}

export function setThePassword(url: Safe<URLRecord>, password: string) {
  url.password = utf8PercentEncodeString(password, isUserinfoPercentEncode);
}
