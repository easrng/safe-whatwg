// https://github.com/jsdom/whatwg-url/blob/414f17a3459b0872baee7a2b77e23953b8a5ccd9/lib/percent-encoding.js

import {
  SafeSet,
  SafeStringIterator,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength,
} from "../primordial-utils.ts";
import {
  NumberParseInt,
  NumberPrototypeToString,
  StringFromCharCode,
  StringFromCodePoint,
  StringPrototypeToUpperCase,
  Uint8Array,
} from "../primordials.js";
import { utf8Encode } from "../utf8.ts";
import { isASCIIHex } from "./infra.ts";

// https://url.spec.whatwg.org/#percent-encode
function percentEncode(c: number) {
  let hex = StringPrototypeToUpperCase(NumberPrototypeToString(c, 16));
  if (hex.length === 1) {
    hex = `0${hex}`;
  }

  return `%${hex}`;
}

// https://url.spec.whatwg.org/#percent-decode
function percentDecodeBytes(input: Uint8Array) {
  const length = TypedArrayPrototypeGetByteLength(input);
  const output = new Uint8Array(length);
  let outputIndex = 0;
  for (let i = 0; i < length; ++i) {
    const byte = input[i]!;
    if (byte !== 0x25) {
      output[outputIndex++] = byte;
    } else if (
      byte === 0x25 &&
      (!isASCIIHex(input[i + 1]!) || !isASCIIHex(input[i + 2]!))
    ) {
      output[outputIndex++] = byte;
    } else {
      const bytePoint = NumberParseInt(
        StringFromCodePoint(input[i + 1]!, input[i + 2]!),
        16,
      );
      output[outputIndex++] = bytePoint;
      i += 2;
    }
  }

  return new Uint8Array(TypedArrayPrototypeGetBuffer(output), 0, outputIndex);
}

// https://url.spec.whatwg.org/#string-percent-decode
function percentDecodeString(input: string) {
  const bytes = utf8Encode(input);
  return percentDecodeBytes(bytes);
}

// https://url.spec.whatwg.org/#c0-control-percent-encode-set
function isC0ControlPercentEncode(c: number) {
  return c <= 0x1f || c > 0x7e;
}

// https://url.spec.whatwg.org/#fragment-percent-encode-set
const extraFragmentPercentEncodeSet = /* @__PURE__ */ (() =>
  new SafeSet([
    32, /*   */
    34, /* " */
    60, /* < */
    62, /* > */
    96, /* ` */
  ]))();
function isFragmentPercentEncode(c: number) {
  return isC0ControlPercentEncode(c) || extraFragmentPercentEncodeSet.has(c);
}

// https://url.spec.whatwg.org/#query-percent-encode-set
const extraQueryPercentEncodeSet = /* @__PURE__ */ (() =>
  new SafeSet([
    32, /*   */
    34, /* " */
    35, /* # */
    60, /* < */
    62, /* > */
  ]))();
function isQueryPercentEncode(c: number) {
  return isC0ControlPercentEncode(c) || extraQueryPercentEncodeSet.has(c);
}

// https://url.spec.whatwg.org/#special-query-percent-encode-set
function isSpecialQueryPercentEncode(c: number) {
  return isQueryPercentEncode(c) || c === 39 /* ' */;
}

// https://url.spec.whatwg.org/#path-percent-encode-set
const extraPathPercentEncodeSet = /* @__PURE__ */ (() =>
  new SafeSet([
    63, /* ? */
    96, /* ` */
    123, /* { */
    125, /* } */
    94, /* ^ */
  ]))();
function isPathPercentEncode(c: number) {
  return isQueryPercentEncode(c) || extraPathPercentEncodeSet.has(c);
}

// https://url.spec.whatwg.org/#userinfo-percent-encode-set
const extraUserinfoPercentEncodeSet = /* @__PURE__ */ (() =>
  new SafeSet([
    47, /* / */
    58, /* : */
    59, /* ; */
    61, /* = */
    64, /* @ */
    91, /* [ */
    92, /* \ */
    93, /* ] */
    124, /* | */
  ]))();
function isUserinfoPercentEncode(c: number) {
  return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
}

// https://url.spec.whatwg.org/#component-percent-encode-set
const extraComponentPercentEncodeSet = /* @__PURE__ */ (() =>
  new SafeSet([
    36, /* $ */
    37, /* % */
    38, /* & */
    43, /* + */
    44, /* , */
  ]))();
function isComponentPercentEncode(c: number) {
  return isUserinfoPercentEncode(c) || extraComponentPercentEncodeSet.has(c);
}

// https://url.spec.whatwg.org/#application-x-www-form-urlencoded-percent-encode-set
const extraURLEncodedPercentEncodeSet = /* @__PURE__ */ (() =>
  new SafeSet([
    33, /* ! */
    39, /* ' */
    40, /* ( */
    41, /* ) */
    126, /* ~ */
  ]))();
function isURLEncodedPercentEncode(c: number) {
  return isComponentPercentEncode(c) || extraURLEncodedPercentEncodeSet.has(c);
}

// https://url.spec.whatwg.org/#code-point-percent-encode-after-encoding
// https://url.spec.whatwg.org/#utf-8-percent-encode
// Assuming encoding is always utf-8 allows us to trim one of the logic branches. TODO: support encoding.
// The "-Internal" variant here has code points as JS strings. The external version used by other files has code points
// as JS numbers, like the rest of the codebase.
function utf8PercentEncodeCodePointInternal(
  codePoint: string,
  percentEncodePredicate: (c: number) => boolean,
) {
  const bytes = utf8Encode(codePoint);
  let output = "";
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // Our percentEncodePredicate operates on bytes, not code points, so this is slightly different from the spec.
    if (!percentEncodePredicate(byte)) {
      output += StringFromCharCode(byte);
    } else {
      output += percentEncode(byte);
    }
  }

  return output;
}

function utf8PercentEncodeCodePoint(
  codePoint: number,
  percentEncodePredicate: (c: number) => boolean,
) {
  return utf8PercentEncodeCodePointInternal(
    StringFromCodePoint(codePoint),
    percentEncodePredicate,
  );
}

// https://url.spec.whatwg.org/#string-percent-encode-after-encoding
// https://url.spec.whatwg.org/#string-utf-8-percent-encode
function utf8PercentEncodeString(
  input: string,
  percentEncodePredicate: (c: number) => boolean,
  spaceAsPlus = false,
) {
  let output = "";
  for (const codePoint of new SafeStringIterator(input)) {
    if (spaceAsPlus && codePoint === " ") {
      output += "+";
    } else {
      output += utf8PercentEncodeCodePointInternal(
        codePoint,
        percentEncodePredicate,
      );
    }
  }
  return output;
}

export {
  isC0ControlPercentEncode,
  isFragmentPercentEncode,
  isPathPercentEncode,
  isQueryPercentEncode,
  isSpecialQueryPercentEncode,
  isURLEncodedPercentEncode,
  isUserinfoPercentEncode,
  percentDecodeBytes,
  percentDecodeString,
  utf8PercentEncodeCodePoint,
  utf8PercentEncodeString,
};
