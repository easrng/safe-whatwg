// TODO: stop using symbol keys

import type * as primordials from "./primordials.js";
import {
  ArrayIteratorPrototype,
  isDataView,
  isNonSharedArrayBuffer,
  isSharedArrayBuffer,
  isTypedArray,
  type Safe,
  SafeRegExp,
  SafeSet,
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetSymbolToStringTag,
} from "./primordial-utils.ts";
import {
  ArrayBufferIsView,
  ArrayPrototypeForEach,
  ArrayPrototypePush,
  ArrayPrototypeSort,
  BigInt,
  BigIntAsIntN,
  BigIntAsUintN,
  type DataView,
  DataViewPrototypeGetBuffer,
  Float32Array,
  Float64Array,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  globalThis,
  Int16Array,
  Int32Array,
  Int8Array,
  MathFloor,
  MathFround,
  MathMax,
  MathMin,
  MathPow,
  MathRound,
  MathTrunc,
  Number,
  NumberIsFinite,
  NumberIsNaN,
  NumberMAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER,
  ObjectAssign,
  ObjectCreate,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetOwnPropertyDescriptors,
  ObjectGetPrototypeOf,
  ObjectHasOwn,
  ObjectIs,
  PromisePrototypeThen,
  PromiseReject,
  PromiseResolve,
  ReflectApply,
  ReflectDefineProperty,
  ReflectGetOwnPropertyDescriptor,
  ReflectHas,
  ReflectOwnKeys,
  RegExpPrototypeTest,
  SetPrototypeAdd,
  SetPrototypeClear,
  SetPrototypeDelete,
  SetPrototypeEntries,
  SetPrototypeForEach,
  SetPrototypeHas,
  SetPrototypeKeys,
  SetPrototypeValues,
  String,
  StringPrototypeCharCodeAt,
  StringPrototypeToWellFormed,
  Symbol,
  SymbolAsyncIterator,
  SymbolIterator,
  SymbolToStringTag,
  TypeError,
  Uint16Array,
  Uint32Array,
  Uint8Array,
  Uint8ClampedArray,
  undefined,
} from "./primordials.js";
import type { URLSearchParams } from "../url.ts";

// Copyright 2018-2025 the Deno authors. MIT license.

// Adapted from https://github.com/jsdom/webidl-conversions.
// Copyright Domenic Denicola. Licensed under BSD-2-Clause License.
// Original license at https://github.com/jsdom/webidl-conversions/blob/master/LICENSE.md.

function makeException(
  ErrorType: ErrorConstructor,
  message: string,
  prefix?: string,
  context?: string,
) {
  return new ErrorType(
    `${prefix ? prefix + ": " : ""}${context ? context : "Value"} ${message}`,
  );
}

function toNumber(value: unknown) {
  if (typeof value === "bigint") {
    throw new TypeError("Cannot convert a BigInt value to a number");
  }
  return Number(value);
}

function type(V: unknown) {
  if (V === null) {
    return "Null";
  }
  switch (typeof V) {
    case "undefined":
      return "Undefined";
    case "boolean":
      return "Boolean";
    case "number":
      return "Number";
    case "string":
      return "String";
    case "symbol":
      return "Symbol";
    case "bigint":
      return "BigInt";
    case "object":
    // Falls through
    case "function":
    // Falls through
    default:
      // Per ES spec, typeof returns an implementation-defined value that is not any of the existing ones for
      // uncallable non-standard exotic objects. Yet Type() which the Web IDL spec depends on returns Object for
      // such cases. So treat the default case as an object.
      return "Object";
  }
}

// Round x to the nearest integer, choosing the even integer if it lies halfway between two.
function evenRound(x: number) {
  // There are four cases for numbers with fractional part being .5:
  //
  // case |     x     | floor(x) | round(x) | expected | x <> 0 | x % 1 | x & 1 |   example
  //   1  |  2n + 0.5 |  2n      |  2n + 1  |  2n      |   >    |  0.5  |   0   |  0.5 ->  0
  //   2  |  2n + 1.5 |  2n + 1  |  2n + 2  |  2n + 2  |   >    |  0.5  |   1   |  1.5 ->  2
  //   3  | -2n - 0.5 | -2n - 1  | -2n      | -2n      |   <    | -0.5  |   0   | -0.5 ->  0
  //   4  | -2n - 1.5 | -2n - 2  | -2n - 1  | -2n - 2  |   <    | -0.5  |   1   | -1.5 -> -2
  // (where n is a non-negative integer)
  //
  // Branch here for cases 1 and 4
  if (
    (x > 0 && x % 1 === +0.5 && (x & 1) === 0) ||
    (x < 0 && x % 1 === -0.5 && (x & 1) === 1)
  ) {
    return censorNegativeZero(MathFloor(x));
  }

  return censorNegativeZero(MathRound(x));
}

function integerPart(n: number) {
  return censorNegativeZero(MathTrunc(n));
}

function sign(x: number) {
  return x < 0 ? -1 : 1;
}

function modulo(x: number, y: number) {
  // https://tc39.github.io/ecma262/#eqn-modulo
  // Note that http://stackoverflow.com/a/4467559/3191 does NOT work for large modulos
  const signMightNotMatch = x % y;
  if (sign(y) !== sign(signMightNotMatch)) {
    return signMightNotMatch + y;
  }
  return signMightNotMatch;
}

function censorNegativeZero(x: number) {
  return x === 0 ? 0 : x;
}

interface StringConverterOpts {
  /**
   * Whether to treat `null` value as an empty string.
   */
  treatNullAsEmptyString?: boolean;
}
interface BufferConverterOpts {
  /**
   * Whether to allow `SharedArrayBuffer` (not just `ArrayBuffer`).
   */
  allowShared?: boolean;
}

interface IntConverterOpts {
  /**
   * Whether to throw if the number is outside of the acceptable values for
   * this type.
   */
  enforceRange?: boolean;
  /**
   * Whether to clamp this number to the acceptable values for this type.
   */
  clamp?: boolean;
}

function createIntegerConversion(
  bitLength: number,
  typeOpts: Safe<{ unsigned: boolean }>,
) {
  const isSigned = !typeOpts.unsigned;

  let lowerBound;
  let upperBound;
  if (bitLength === 64) {
    upperBound = NumberMAX_SAFE_INTEGER;
    lowerBound = !isSigned ? 0 : NumberMIN_SAFE_INTEGER;
  } else if (!isSigned) {
    lowerBound = 0;
    upperBound = MathPow(2, bitLength) - 1;
  } else {
    lowerBound = -MathPow(2, bitLength - 1);
    upperBound = MathPow(2, bitLength - 1) - 1;
  }

  const twoToTheBitLength = MathPow(2, bitLength);
  const twoToOneLessThanTheBitLength = MathPow(2, bitLength - 1);

  return (
    V: unknown,
    prefix: string | undefined = undefined,
    context: string | undefined = undefined,
    opts: Safe<IntConverterOpts> = ObjectCreate(null),
  ) => {
    let x = toNumber(V);
    x = censorNegativeZero(x);

    if (opts.enforceRange) {
      if (!NumberIsFinite(x)) {
        throw makeException(
          TypeError,
          "is not a finite number",
          prefix,
          context,
        );
      }

      x = integerPart(x);

      if (x < lowerBound || x > upperBound) {
        throw makeException(
          TypeError,
          `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`,
          prefix,
          context,
        );
      }

      return x;
    }

    if (!NumberIsNaN(x) && opts.clamp) {
      x = MathMin(MathMax(x, lowerBound), upperBound);
      x = evenRound(x);
      return x;
    }

    if (!NumberIsFinite(x) || x === 0) {
      return 0;
    }
    x = integerPart(x);

    // Math.pow(2, 64) is not accurately representable in JavaScript, so try to avoid these per-spec operations if
    // possible. Hopefully it's an optimization for the non-64-bitLength cases too.
    if (x >= lowerBound && x <= upperBound) {
      return x;
    }

    // These will not work great for bitLength of 64, but oh well. See the README for more details.
    x = modulo(x, twoToTheBitLength);
    if (isSigned && x >= twoToOneLessThanTheBitLength) {
      return x - twoToTheBitLength;
    }
    return x;
  };
}

function createLongLongConversion(
  bitLength: number,
  { unsigned }: { unsigned: boolean },
) {
  const upperBound = NumberMAX_SAFE_INTEGER;
  const lowerBound = unsigned ? 0 : NumberMIN_SAFE_INTEGER;
  const asBigIntN = unsigned ? BigIntAsUintN : BigIntAsIntN;

  return (
    V: unknown,
    prefix: string | undefined = undefined,
    context: string | undefined = undefined,
    opts: Safe<IntConverterOpts> = ObjectCreate(null),
  ) => {
    let x = toNumber(V);
    x = censorNegativeZero(x);

    if (opts.enforceRange) {
      if (!NumberIsFinite(x)) {
        throw makeException(
          TypeError,
          "is not a finite number",
          prefix,
          context,
        );
      }

      x = integerPart(x);

      if (x < lowerBound || x > upperBound) {
        throw makeException(
          TypeError,
          `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`,
          prefix,
          context,
        );
      }

      return x;
    }

    if (!NumberIsNaN(x) && opts.clamp) {
      x = MathMin(MathMax(x, lowerBound), upperBound);
      x = evenRound(x);
      return x;
    }

    if (!NumberIsFinite(x) || x === 0) {
      return 0;
    }

    let xBigInt = BigInt(integerPart(x));
    xBigInt = asBigIntN(bitLength, xBigInt);
    return Number(xBigInt);
  };
}

export interface Converters {
  TextDecoderOptions(
    options: TextDecoderOptions,
    prefix: string,
    arg2: string,
  ): TextDecoderOptions;
  TextDecodeOptions(
    options: TextDecodeOptions,
    prefix: string,
    arg2: string,
  ): TextDecodeOptions;
  any(v: unknown): unknown;
  /**
   * Convert a value into a `boolean` (bool).
   */
  boolean(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): boolean;
  /**
   * Convert a value into a `byte` (int8).
   */
  byte(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `octet` (uint8).
   */
  octet(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `short` (int16).
   */
  short(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `unsigned short` (uint16).
   */
  ["unsigned short"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `long` (int32).
   */
  long(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `unsigned long` (uint32).
   */
  ["unsigned long"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `long long` (int64).
   * **Note this is truncated to a JS number (53 bit precision).**
   */
  ["long long"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `unsigned long long` (uint64).
   * **Note this is truncated to a JS number (53 bit precision).**
   */
  ["unsigned long long"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `float` (f32).
   */
  float(v: unknown, prefix?: string, context?: string, opts?: unknown): number;
  /**
   * Convert a value into a `unrestricted float` (f32, infinity, or NaN).
   */
  ["unrestricted float"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): number;
  /**
   * Convert a value into a `double` (f64).
   */
  double(v: unknown, prefix?: string, context?: string, opts?: unknown): number;
  /**
   * Convert a value into a `unrestricted double` (f64, infinity, or NaN).
   */
  ["unrestricted double"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): number;
  /**
   * Convert a value into a `DOMString` (string).
   */
  DOMString(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: StringConverterOpts,
  ): string;
  /**
   * Convert a value into a `ByteString` (string with only u8 codepoints).
   */
  ByteString(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: StringConverterOpts,
  ): string;
  /**
   * Convert a value into a `USVString` (string with only valid non
   * surrogate Unicode code points).
   */
  USVString(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: StringConverterOpts,
  ): string;
  /**
   * Convert a value into an `object` (object).
   */
  object(v: unknown, prefix?: string, context?: string, opts?: unknown): object;
  /**
   * Convert a value into an `ArrayBuffer` (ArrayBuffer).
   */
  "ArrayBuffer"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): primordials.ArrayBuffer;
  /**
   * Convert a value into a `DataView` (ArrayBuffer).
   */
  "DataView"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof DataView>;
  /**
   * Convert a value into a `Int8Array` (Int8Array).
   */
  "Int8Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Int8Array>;
  /**
   * Convert a value into a `Int16Array` (Int16Array).
   */
  "Int16Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Int16Array>;
  /**
   * Convert a value into a `Int32Array` (Int32Array).
   */
  "Int32Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Int32Array>;
  /**
   * Convert a value into a `Uint8Array` (Uint8Array).
   */
  "Uint8Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Uint8Array>;
  /**
   * Convert a value into a `Uint16Array` (Uint16Array).
   */
  "Uint16Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Uint16Array>;
  /**
   * Convert a value into a `Uint32Array` (Uint32Array).
   */
  "Uint32Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Uint32Array>;
  /**
   * Convert a value into a `Uint8ClampedArray` (Uint8ClampedArray).
   */
  "Uint8ClampedArray"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Uint8ClampedArray>;
  /**
   * Convert a value into a `Float32Array` (Float32Array).
   */
  "Float32Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Float32Array>;
  /**
   * Convert a value into a `Float64Array` (Float64Array).
   */
  "Float64Array"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): InstanceType<typeof Float64Array>;
  /**
   * Convert a value into an `ArrayBufferView` (ArrayBufferView).
   */
  ArrayBufferView(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): ArrayBufferView;
  /**
   * Convert a value into a `BufferSource` (ArrayBuffer or ArrayBufferView).
   */
  BufferSource(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: BufferConverterOpts,
  ): primordials.ArrayBuffer | ArrayBufferView;
  /**
   * Convert a value into a `DOMTimeStamp` (u64). Alias for unsigned long long
   */
  DOMTimeStamp(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `DOMHighResTimeStamp` (f64). Alias for double
   */
  DOMHighResTimeStamp(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: IntConverterOpts,
  ): number;
  /**
   * Convert a value into a `Function` ((...args: any[]) => any).
   */
  "Function"(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): (...args: unknown[]) => unknown;
  /**
   * Convert a value into a `VoidFunction` (() => void).
   */
  VoidFunction(
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): () => void;
  ["UVString?"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: StringConverterOpts,
  ): string | null;
  ["sequence<double>"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): number[];
  ["sequence<object>"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): object[];
  ["sequence<ByteString>"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): string[];
  ["sequence<USVString>"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): string[];
  ["sequence<DOMString>"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): string[];
  ["sequence<sequence<ByteString>>"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): string[][];
  ["sequence<sequence<USVString>>"](
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ): string[][];
  ["Promise<undefined>"]: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ) => primordials.Promise<undefined>;
  ["record<ByteString, ByteString>"]: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: StringConverterOpts,
  ) => Record<string, string>;
  ["record<USVString, USVString>"]: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: StringConverterOpts,
  ) => Record<string, string>;
  ["sequence<sequence<USVString>> or record<USVString, USVString> or USVString"]:
    (
      v: unknown,
      prefix?: string,
      context?: string,
      opts?: StringConverterOpts,
    ) => string | Record<string, string> | string[][];
  ["URLSearchParams"]: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ) => URLSearchParams;
}
const converters: Safe<Converters> = ObjectCreate(null);

converters.any = (V) => {
  return V;
};

converters.boolean = function (val) {
  return !!val;
};

converters.byte = createIntegerConversion(8, { unsigned: false });
converters.octet = createIntegerConversion(8, { unsigned: true });

converters.short = createIntegerConversion(16, { unsigned: false });
converters["unsigned short"] = createIntegerConversion(16, {
  unsigned: true,
});

converters.long = createIntegerConversion(32, { unsigned: false });
converters["unsigned long"] = createIntegerConversion(32, {
  unsigned: true,
});

converters["long long"] = createLongLongConversion(64, {
  unsigned: false,
});
converters["unsigned long long"] = createLongLongConversion(64, {
  unsigned: true,
});

converters.float = (V, prefix, context, _opts) => {
  const x = toNumber(V);

  if (!NumberIsFinite(x)) {
    throw makeException(
      TypeError,
      "is not a finite floating-point value",
      prefix,
      context,
    );
  }

  if (ObjectIs(x, -0)) {
    return x;
  }

  const y = MathFround(x);

  if (!NumberIsFinite(y)) {
    throw makeException(
      TypeError,
      "is outside the range of a single-precision floating-point value",
      prefix,
      context,
    );
  }

  return y;
};

converters["unrestricted float"] = (V, _prefix, _context, _opts) => {
  const x = toNumber(V);

  if (NumberIsNaN(x)) {
    return x;
  }

  if (ObjectIs(x, -0)) {
    return x;
  }

  return MathFround(x);
};

converters.double = (V, prefix, context, _opts) => {
  const x = toNumber(V);

  if (!NumberIsFinite(x)) {
    throw makeException(
      TypeError,
      "is not a finite floating-point value",
      prefix,
      context,
    );
  }

  return x;
};

converters["unrestricted double"] = (V, _prefix, _context, _opts) => {
  const x = toNumber(V);

  return x;
};

converters.DOMString = function (
  V,
  prefix,
  context,
  opts: Safe<StringConverterOpts> = ObjectCreate(null),
) {
  if (typeof V === "string") {
    return V;
  } else if (V === null && opts.treatNullAsEmptyString) {
    return "";
  } else if (typeof V === "symbol") {
    throw makeException(
      TypeError,
      "is a symbol, which cannot be converted to a string",
      prefix,
      context,
    );
  }

  return String(V);
};

function isByteString(input: string) {
  for (let i = 0; i < input.length; i++) {
    if (StringPrototypeCharCodeAt(input, i) > 255) {
      // If a character code is greater than 255, it means the string is not a byte string.
      return false;
    }
  }
  return true;
}

converters.ByteString = (V, prefix, context, opts) => {
  const x = converters.DOMString(V, prefix, context, opts);
  if (!isByteString(x)) {
    throw makeException(
      TypeError,
      "is not a valid ByteString",
      prefix,
      context,
    );
  }
  return x;
};

converters.USVString = (V, prefix, context, opts) => {
  const S = converters.DOMString(V, prefix, context, opts);
  return StringPrototypeToWellFormed(S);
};

converters.object = (V, prefix, context, _opts) => {
  if (type(V) !== "Object") {
    throw makeException(TypeError, "is not an object", prefix, context);
  }

  return V as object;
};

// Not exported, but used in Function and VoidFunction.

// Neither Function nor VoidFunction is defined with [TreatNonObjectAsNull], so
// handling for that is omitted.
function convertCallbackFunction(
  V: unknown,
  prefix: string | undefined,
  context: string | undefined,
  _opts: unknown,
) {
  if (typeof V !== "function") {
    throw makeException(TypeError, "is not a function", prefix, context);
  }
  return V as (...args: unknown[]) => unknown;
}

converters.ArrayBuffer = (
  V,
  prefix = undefined,
  context = undefined,
  opts: Safe<BufferConverterOpts> = ObjectCreate(null),
) => {
  if (!isNonSharedArrayBuffer(V)) {
    if (opts.allowShared && !isSharedArrayBuffer(V)) {
      throw makeException(
        TypeError,
        "is not an ArrayBuffer or SharedArrayBuffer",
        prefix,
        context,
      );
    }
    throw makeException(TypeError, "is not an ArrayBuffer", prefix, context);
  }

  return V as ArrayBuffer;
};

converters.DataView = (
  V,
  prefix = undefined,
  context = undefined,
  opts: Safe<BufferConverterOpts> = ObjectCreate(null),
) => {
  if (!isDataView(V)) {
    throw makeException(TypeError, "is not a DataView", prefix, context);
  }

  if (!opts.allowShared && isSharedArrayBuffer(DataViewPrototypeGetBuffer(V))) {
    throw makeException(
      TypeError,
      "is backed by a SharedArrayBuffer, which is not allowed",
      prefix,
      context,
    );
  }

  return V as DataView;
};

ArrayPrototypeForEach(
  [
    Int8Array,
    Int16Array,
    Int32Array,
    Uint8Array,
    Uint16Array,
    Uint32Array,
    Uint8ClampedArray,
    // TODO(petamoriken): add Float16Array converter
    // Float16Array,
    Float32Array,
    Float64Array,
  ],
  (func) => {
    // deno-lint-ignore no-property-access/no-property-access
    const name = func.name as
      | "Int8Array"
      | "Int16Array"
      | "Int32Array"
      | "Uint8Array"
      | "Uint16Array"
      | "Uint32Array"
      | "Uint8ClampedArray"
      | "Float32Array"
      | "Float64Array";
    const article = RegExpPrototypeTest(new SafeRegExp(/^[AEIOU]/), name)
      ? "an"
      : "a";
    converters[name] = (
      V,
      prefix = undefined,
      context = undefined,
      opts: Safe<BufferConverterOpts> = ObjectCreate(null),
    ) => {
      if (TypedArrayPrototypeGetSymbolToStringTag(V) !== name) {
        throw makeException(
          TypeError,
          `is not ${article} ${name} object`,
          prefix,
          context,
        );
      }
      if (
        !opts.allowShared &&
        isSharedArrayBuffer(TypedArrayPrototypeGetBuffer(V))
      ) {
        throw makeException(
          TypeError,
          "is a view on a SharedArrayBuffer, which is not allowed",
          prefix,
          context,
        );
      }

      // deno-lint-ignore no-explicit-any
      return V as any;
    };
  },
);

// Common definitions

converters.ArrayBufferView = (
  V,
  prefix = undefined,
  context = undefined,
  opts: Safe<BufferConverterOpts> = ObjectCreate(null),
) => {
  if (!ArrayBufferIsView(V)) {
    throw makeException(
      TypeError,
      "is not a view on an ArrayBuffer or SharedArrayBuffer",
      prefix,
      context,
    );
  }
  let buffer;
  if (isTypedArray(V)) {
    buffer = TypedArrayPrototypeGetBuffer(V);
  } else {
    buffer = DataViewPrototypeGetBuffer(V);
  }
  if (!opts.allowShared && isSharedArrayBuffer(buffer)) {
    throw makeException(
      TypeError,
      "is a view on a SharedArrayBuffer, which is not allowed",
      prefix,
      context,
    );
  }

  return V;
};

converters.BufferSource = (
  V,
  prefix = undefined,
  context = undefined,
  opts: Safe<BufferConverterOpts> = ObjectCreate(null),
) => {
  if (ArrayBufferIsView(V)) {
    if (!opts.allowShared) {
      let buffer: ArrayBuffer | SharedArrayBuffer;
      if (isTypedArray(V)) {
        buffer = TypedArrayPrototypeGetBuffer(V);
      } else {
        buffer = DataViewPrototypeGetBuffer(V);
      }
      if (isSharedArrayBuffer(buffer)) {
        throw makeException(
          TypeError,
          "is a view on a SharedArrayBuffer, which is not allowed",
          prefix,
          context,
        );
      }
    }

    return V;
  }

  if (!opts.allowShared && !isNonSharedArrayBuffer(V)) {
    throw makeException(
      TypeError,
      "is not an ArrayBuffer or a view on one",
      prefix,
      context,
    );
  }
  if (
    opts.allowShared &&
    !isSharedArrayBuffer(V) &&
    !isNonSharedArrayBuffer(V)
  ) {
    throw makeException(
      TypeError,
      "is not an ArrayBuffer, SharedArrayBuffer, or a view on one",
      prefix,
      context,
    );
  }

  return V as ArrayBuffer;
};

converters.DOMTimeStamp = converters["unsigned long long"];
converters.DOMHighResTimeStamp = converters["double"];

converters.Function = convertCallbackFunction;

converters.VoidFunction = convertCallbackFunction;

converters["UVString?"] = createNullableConverter(
  converters.USVString,
);
converters["sequence<double>"] = createSequenceConverter(
  converters.double,
);
converters["sequence<object>"] = createSequenceConverter(
  converters.object,
);
converters["Promise<undefined>"] = createPromiseConverter(() => undefined);

converters["sequence<ByteString>"] = createSequenceConverter(
  converters.ByteString,
);
converters["sequence<sequence<ByteString>>"] = createSequenceConverter(
  converters["sequence<ByteString>"],
);
converters["record<ByteString, ByteString>"] = createRecordConverter(
  converters.ByteString,
  converters.ByteString,
);

converters["sequence<USVString>"] = createSequenceConverter(
  converters.USVString,
);
converters["sequence<sequence<USVString>>"] = createSequenceConverter(
  converters["sequence<USVString>"],
);
converters[
  "sequence<sequence<USVString>> or record<USVString, USVString> or USVString"
] = (
  V: unknown,
  prefix: string | undefined,
  context: string | undefined,
  opts: StringConverterOpts | undefined,
): string | Record<string, string> | string[][] => {
  // Union for (sequence<sequence<USVString>> or record<USVString, USVString> or USVString)
  if (type(V) === "Object" && V !== null) {
    // @ts-ignore needed for correct semantics
    // deno-lint-ignore no-property-access/no-property-access
    if (V[SymbolIterator] !== undefined) {
      return converters["sequence<sequence<USVString>>"]!(
        V,
        prefix,
        context,
        opts,
      );
    }
    return converters["record<USVString, USVString>"]!(
      V,
      prefix,
      context,
      opts,
    );
  }
  return converters.USVString(V, prefix, context, opts);
};
converters["record<USVString, USVString>"] = createRecordConverter(
  converters.USVString,
  converters.USVString,
);

converters["sequence<DOMString>"] = createSequenceConverter(
  converters.DOMString,
);

function requiredArguments(
  length: number,
  required: number,
  prefix: string,
): void {
  if (length < required) {
    const errMsg = `${prefix ? prefix + ": " : ""}${required} argument${
      required === 1 ? "" : "s"
    } required, but only ${length} present`;
    throw new TypeError(errMsg);
  }
}

export type Dictionary = DictionaryMember[];
export interface DictionaryMember {
  __proto__: null;
  key: string;
  converter: (
    v: unknown,
    prefix?: string,
    context?: string,
    // deno-lint-ignore no-explicit-any
    opts?: any,
  ) => unknown;
  defaultValue?: unknown;
  required?: boolean;
}

type DictionaryMemberValueType<T extends DictionaryMember, K> = T extends {
  key: K;
} ?
    | ReturnType<T["converter"]>
    | (T extends { defaultValue: infer D } ? D
      : T extends { required: true } ? never
      : undefined)
  : never;
type DictionaryType<T extends Dictionary> = T extends unknown ? {
    [K in T[number]["key"]]: DictionaryMemberValueType<T[number], K>;
  }
  : never;

function createDictionaryConverter<const T extends Dictionary>(
  name: string,
  ...dictionaries: T[]
): (
  v: unknown,
  prefix?: string,
  context?: string,
  opts?: unknown,
) => DictionaryType<T> {
  let hasRequiredKey = false;
  const allMembers: DictionaryMember[] = [];
  for (let i = 0; i < dictionaries.length; ++i) {
    const members: [...T] = dictionaries[i]!;
    for (let j = 0; j < members.length; ++j) {
      const member: Safe<[...T][number]> = members[j]!;
      if (member.required) {
        hasRequiredKey = true;
      }
      ArrayPrototypePush(allMembers, member);
    }
  }
  ArrayPrototypeSort(
    allMembers,
    (a: Safe<DictionaryMember>, b: Safe<DictionaryMember>) => {
      if (a.key == b.key) {
        return 0;
      }
      return a.key < b.key ? -1 : 1;
    },
  );

  // deno-lint-ignore no-explicit-any
  const defaultValues: Safe<any> = ObjectCreate(null);
  for (let i = 0; i < allMembers.length; ++i) {
    const member: Safe<DictionaryMember> = allMembers[i]!;
    // safe to call props because proto is null
    void (member.__proto__ satisfies null);
    if (ReflectHas(member, "defaultValue")) {
      const idlMemberValue = member.defaultValue;
      const imvType = typeof idlMemberValue;
      // Copy by value types can be directly assigned, copy by reference types
      // need to be re-created for each allocation.
      if (
        imvType === "number" ||
        imvType === "boolean" ||
        imvType === "string" ||
        imvType === "bigint" ||
        imvType === "undefined"
      ) {
        defaultValues[member.key] = member.converter(idlMemberValue);
      } else {
        ObjectDefineProperty(defaultValues, member.key, {
          __proto__: null,
          get() {
            return member.converter(
              idlMemberValue,
              member.key,
            );
          },
          enumerable: true,
        });
      }
    }
  }

  return function (
    V,
    prefix = undefined,
    context = undefined,
    opts = ObjectCreate(null),
  ) {
    const typeV = type(V);
    switch (typeV) {
      case "Undefined":
      case "Null":
      case "Object":
        break;
      default:
        throw makeException(
          TypeError,
          "can not be converted to a dictionary",
          prefix,
          context,
        );
    }
    const esDict: Safe<Record<PropertyKey, unknown> | null | undefined> = V as
      | Record<PropertyKey, unknown>
      | null
      | undefined;

    // deno-lint-ignore no-explicit-any
    const idlDict: Safe<any> = ObjectAssign({}, defaultValues);

    // NOTE: fast path Null and Undefined.
    if ((V === undefined || V === null) && !hasRequiredKey) {
      return idlDict;
    }

    for (let i = 0; i < allMembers.length; ++i) {
      const member: Safe<DictionaryMember> = allMembers[i]!;
      const key = member.key;

      let esMemberValue;
      if (typeV === "Undefined" || typeV === "Null") {
        esMemberValue = undefined;
      } else {
        // @ts-expect-error we want this to throw if it's null or undefined
        esMemberValue = esDict[key];
      }

      if (esMemberValue !== undefined) {
        const memberContext = `'${key}' of '${name}'${
          context ? ` (${context})` : ""
        }`;
        const converter = member.converter;
        const idlMemberValue = converter(
          esMemberValue,
          prefix,
          memberContext,
          opts,
        );
        idlDict[key] = idlMemberValue;
      } else if (member.required) {
        throw makeException(
          TypeError,
          `can not be converted to '${name}' because '${key}' is required in '${name}'`,
          prefix,
          context,
        );
      }
    }

    return idlDict;
  };
}

// https://heycam.github.io/webidl/#es-enumeration
function createEnumConverter(
  name: string,
  values: string[],
): (v: unknown, prefix?: string, context?: string, opts?: unknown) => string {
  const enumValues: Safe<Set<string>> = new SafeSet(values);

  return function (
    V,
    prefix = undefined,
    _context = undefined,
    _opts = ObjectCreate(null),
  ) {
    const S = String(V);

    if (!enumValues.has(S)) {
      throw new TypeError(
        `${
          prefix ? prefix + ": " : ""
        }The provided value '${S}' is not a valid enum value of type ${name}`,
      );
    }

    return S;
  };
}

function createNullableConverter<T, O>(
  converter: (v: unknown, prefix?: string, context?: string, opts?: O) => T,
): (v: unknown, prefix?: string, context?: string, opts?: O) => T | null {
  return (
    V,
    prefix = undefined,
    context = undefined,
    opts = ObjectCreate(null),
  ) => {
    // FIXME: If Type(V) is not Object, and the conversion to an IDL value is
    // being performed due to V being assigned to an attribute whose type is a
    // nullable callback function that is annotated with
    // [LegacyTreatNonObjectAsNull], then return the IDL nullable type T?
    // value null.

    if (V === null || V === undefined) return null;
    return converter(V, prefix, context, opts);
  };
}

// https://heycam.github.io/webidl/#es-sequence
function createSequenceConverter<T, O>(
  converter: (v: unknown, prefix?: string, context?: string, opts?: O) => T,
): (v: unknown, prefix?: string, context?: string, opts?: O) => T[] {
  return function (
    V,
    prefix = undefined,
    context = undefined,
    opts = ObjectCreate(null),
  ) {
    if (type(V) !== "Object") {
      throw makeException(
        TypeError,
        "can not be converted to sequence.",
        prefix,
        context,
      );
    }
    // @ts-expect-error unsafely trying to iterate
    // deno-lint-ignore no-property-access/no-property-access
    const iter = V?.[SymbolIterator]?.();
    if (iter === undefined) {
      throw makeException(
        TypeError,
        "can not be converted to sequence.",
        prefix,
        context,
      );
    }
    const array: T[] = [];
    while (true) {
      // deno-lint-ignore no-property-access/no-property-access
      const res = iter?.next?.();
      if (res === undefined) {
        throw makeException(
          TypeError,
          "can not be converted to sequence.",
          prefix,
          context,
        );
      }
      // deno-lint-ignore no-property-access/no-property-access
      if (res.done === true) break;
      const val = converter(
        // deno-lint-ignore no-property-access/no-property-access
        res.value,
        prefix,
        `${context}, index ${array.length}`,
        opts,
      );
      ArrayPrototypePush(array, val);
    }
    return array;
  };
}

interface ConvertedAsyncIterable<V, T> {
  value: V;
  open(context?: string): AsyncIterableIterator<T>;
}

function createAsyncIterableConverter<T>(
  converter: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ) => T,
): <V>(
  v: V,
  prefix?: string,
  context?: string,
  opts?: unknown,
) => ConvertedAsyncIterable<V, T> {
  return function (
    V,
    prefix = undefined,
    context = undefined,
    opts = ObjectCreate(null),
  ) {
    if (type(V) !== "Object") {
      throw makeException(
        TypeError,
        "can not be converted to async iterable.",
        prefix,
        context,
      );
    }

    let isAsync = true;
    // @ts-expect-error type checking
    // deno-lint-ignore no-property-access/no-property-access
    let method = V[SymbolAsyncIterator];
    if (method === undefined) {
      // @ts-expect-error type checking
      // deno-lint-ignore no-property-access/no-property-access
      method = V[SymbolIterator];

      if (method === undefined) {
        throw makeException(TypeError, "is not iterable.", prefix, context);
      }

      isAsync = false;
    }

    return {
      value: V,
      open(context?: string): AsyncIterableIterator<T> {
        const iter = FunctionPrototypeCall(method, V);
        if (type(iter) !== "Object") {
          throw new TypeError(
            `${context} could not be iterated because iterator method did not return object, but ${
              type(
                iter,
              )
            }.`,
          );
        }

        let asyncIterator = iter;

        if (!isAsync) {
          asyncIterator = {
            // deno-lint-ignore require-await
            async next() {
              // deno-lint-ignore no-property-access/no-property-access
              return iter.next();
            },
          };
        }

        return {
          async next(_?: unknown) {
            // deno-lint-ignore no-property-access/no-property-access
            const iterResult = await asyncIterator.next();
            if (type(iterResult) !== "Object") {
              throw TypeError(
                `${context} failed to iterate next value because the next() method did not return an object, but ${
                  type(
                    iterResult,
                  )
                }.`,
              );
            }

            // deno-lint-ignore no-property-access/no-property-access
            if (iterResult.done) {
              return { done: true, value: undefined };
            }

            const iterValue = converter(
              // deno-lint-ignore no-property-access/no-property-access
              iterResult.value,
              `${context} failed to iterate next value`,
              `The value returned from the next() method`,
              opts,
            );

            return { done: false, value: iterValue };
          },
          async return(reason?: unknown) {
            // deno-lint-ignore no-property-access/no-property-access
            if (asyncIterator.return === undefined) {
              return { value: undefined, done: true };
            }

            // deno-lint-ignore no-property-access/no-property-access
            const returnPromiseResult = await asyncIterator.return(reason);
            if (type(returnPromiseResult) !== "Object") {
              throw TypeError(
                `${context} failed to close iterator because the return() method did not return an object, but ${
                  type(
                    returnPromiseResult,
                  )
                }.`,
              );
            }

            return { value: undefined, done: true };
          },
          [SymbolAsyncIterator]() {
            return this;
          },
        };
      },
    };
  };
}

function createRecordConverter<K extends string | number | symbol, V, O>(
  keyConverter: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: O,
  ) => K,
  valueConverter: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: O,
  ) => V,
): (v: unknown, prefix?: string, context?: string, opts?: O) => Record<K, V> {
  return (V, prefix, context, opts) => {
    if (type(V) !== "Object") {
      throw makeException(
        TypeError,
        "can not be converted to dictionary",
        prefix,
        context,
      );
    }
    // deno-lint-ignore no-explicit-any
    const result: Safe<any> = ObjectCreate(null);
    /*// Fast path for common case (not a Proxy)
    // eslint-disable-next-line no-constant-condition
    if (!core.isProxy(V)) {
      for (const key in V) {
        if (!ObjectHasOwn(V, key)) {
          continue;
        }
        const typedKey = keyConverter(key, prefix, context, opts);
        const value = V[key];
        const typedValue = valueConverter(value, prefix, context, opts);
        result[typedKey] = typedValue;
      }
      return result;
    }*/
    // Slow path if Proxy (e.g: in WPT tests)
    const keys: PropertyKey[] = ReflectOwnKeys(V as object);
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]!;
      const desc = ObjectGetOwnPropertyDescriptor(V, key);
      // deno-lint-ignore no-property-access/no-property-access
      if (desc !== undefined && desc.enumerable === true) {
        const typedKey = keyConverter(key, prefix, context, opts);
        // deno-lint-ignore no-property-access/no-property-access
        const value = (V as Record<PropertyKey, unknown>)[key];
        const typedValue = valueConverter(value, prefix, context, opts);
        result[typedKey] = typedValue;
      }
    }
    return result;
  };
}

function createPromiseConverter<T>(
  converter: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ) => T,
): (
  v: unknown,
  prefix?: string,
  context?: string,
  opts?: unknown,
) => primordials.Promise<T> {
  return (V, prefix, context, opts) =>
    // should be able to handle thenables
    // see: https://github.com/web-platform-tests/wpt/blob/a31d3ba53a79412793642366f3816c9a63f0cf57/streams/writable-streams/close.any.js#L207
    // @ts-expect-error needed for right semantics
    // deno-lint-ignore no-property-access/no-property-access
    typeof V?.then === "function"
      ? (PromisePrototypeThen(PromiseResolve(V), (V) =>
        converter(V, prefix, context, opts)) satisfies primordials.Promise<
          unknown
        > as primordials.Promise<T>)
      : PromiseResolve(converter(V, prefix, context, opts));
}

function invokeCallbackFunction<T>(
  callable: (...args: unknown[]) => unknown,
  args: unknown[],
  thisArg: unknown,
  returnValueConverter: (
    v: unknown,
    prefix?: string,
    context?: string,
    opts?: unknown,
  ) => T,
  prefix: string,
  returnsPromise?: boolean,
): T {
  try {
    const rv = ReflectApply(callable, thisArg, args);
    return returnValueConverter(rv, prefix, "return value");
  } catch (err) {
    if (returnsPromise === true) {
      return PromiseReject(err) as T;
    }
    throw err;
  }
}

function safeAssertion<C extends object>(
  fn: (v: object) => v is C,
  v: object,
): v is C {
  try {
    return fn(v);
  } catch {
    return false;
  }
}

function createInterfaceConverter<C extends object>(
  name: string,
  assertion: (v: object) => v is C,
): (v: unknown, prefix?: string, context?: string, opts?: unknown) => C {
  return (V, prefix, context, _opts) => {
    if (
      typeof V !== "object" ||
      V === null ||
      !safeAssertion(assertion, V)
    ) {
      throw makeException(TypeError, `is not of type ${name}`, prefix, context);
    }
    return V;
  };
}

function assertBranded<C extends object>(
  self: unknown,
  assertion: (v: object) => v is C,
): asserts self is C {
  if (
    typeof self !== "object" ||
    self === null ||
    !safeAssertion(assertion, self)
  ) {
    throw new TypeError("Illegal invocation");
  }
}

function illegalConstructor() {
  throw new TypeError("Illegal constructor");
}

function define(target: object, source: object) {
  const keys: PropertyKey[] = ReflectOwnKeys(source);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]!;
    const descriptor = ReflectGetOwnPropertyDescriptor(source, key);
    if (descriptor && !ReflectDefineProperty(target, key, descriptor)) {
      throw new TypeError(`Cannot redefine property: ${String(key)}`);
    }
  }
}

const _iteratorInternal = Symbol("iterator internal");

const globalIteratorPrototype = ObjectGetPrototypeOf(ArrayIteratorPrototype);

function mixinPairIterable<
  T extends { new (...args: unknown[]): unknown; prototype: object },
  KK extends PropertyKey,
  VK extends PropertyKey,
>(
  name: string,
  prototype: Safe<T>,
  // deno-lint-ignore no-explicit-any
  getData: (o: InstanceType<T>) => (Record<KK, any> & Record<VK, any>)[],
  assertion: (v: object) => v is object & InstanceType<T>,
  keyKey: KK,
  valueKey: VK,
): void {
  const iteratorPrototype = ObjectCreate(globalIteratorPrototype, {
    [SymbolToStringTag]: {
      __proto__: null,
      configurable: true,
      value: `${name} Iterator`,
    },
  });
  define(iteratorPrototype, {
    next() {
      // deno-lint-ignore no-property-access/no-property-access, no-explicit-any
      const internal: Safe<any> = this && (this as any)[_iteratorInternal];
      if (!internal) {
        throw new TypeError(
          `next() called on a value that is not a ${name} iterator object`,
        );
      }
      const { target, kind, index } = internal;
      // deno-lint-ignore no-explicit-any
      const values: Safe<(Record<KK, any> & Record<VK, any>)[]> = getData(
        target,
      );
      const len = values.length;
      if (index >= len) {
        return { value: undefined, done: true };
      }
      // deno-lint-ignore no-explicit-any
      const pair: Safe<Record<KK, any> & Record<VK, any>> = values[index]!;
      internal.index = index + 1;
      let result;
      switch (kind) {
        case "key":
          result = pair[keyKey];
          break;
        case "value":
          result = pair[valueKey];
          break;
        case "key+value":
          result = [pair[keyKey], pair[valueKey]];
          break;
      }
      return { value: result, done: false };
    },
  });
  // deno-lint-ignore no-explicit-any
  function createDefaultIterator(target: any, kind: any) {
    const iterator = ObjectCreate(iteratorPrototype);
    ObjectDefineProperty(iterator, _iteratorInternal, {
      __proto__: null,
      value: { target, kind, index: 0 },
      configurable: true,
    });
    return iterator;
  }

  function entries(this: unknown) {
    assertBranded(this, assertion);
    return createDefaultIterator(this, "key+value");
  }

  const properties = {
    entries: {
      __proto__: null,
      value: entries,
      writable: true,
      enumerable: true,
      configurable: true,
    },
    [SymbolIterator]: {
      __proto__: null,
      value: entries,
      writable: true,
      enumerable: false,
      configurable: true,
    },
    keys: {
      __proto__: null,
      value: function keys() {
        assertBranded(this, assertion);
        return createDefaultIterator(this, "key");
      },
      writable: true,
      enumerable: true,
      configurable: true,
    },
    values: {
      __proto__: null,
      value: function values() {
        assertBranded(this, assertion);
        return createDefaultIterator(this, "value");
      },
      writable: true,
      enumerable: true,
      configurable: true,
    },
    forEach: {
      __proto__: null,
      value: function forEach(idlCallback: unknown, thisArg = undefined) {
        assertBranded(this, assertion);
        const prefix = `Failed to execute 'forEach' on '${name}'`;
        requiredArguments(arguments.length, 1, prefix);
        let parsedIdlCallback = converters["Function"](
          idlCallback,
          prefix,
          "Argument 1",
        );
        parsedIdlCallback = FunctionPrototypeBind(
          parsedIdlCallback,
          thisArg ?? globalThis,
        );
        // deno-lint-ignore no-explicit-any
        const pairs: (Record<KK, any> & Record<VK, any>)[] = getData(this);
        for (let i = 0; i < pairs.length; i++) {
          // deno-lint-ignore no-explicit-any
          const entry: Safe<Record<KK, any> & Record<VK, any>> = pairs[i]!;
          parsedIdlCallback(entry[valueKey], entry[keyKey], this);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true,
    },
  };
  ObjectDefineProperties(prototype.prototype, properties);
}

function configureInterface<N extends string>(
  interface_: Safe<{ prototype: object; name: N }>,
  name: N,
) {
  configureProperties(interface_);
  configureProperties(interface_.prototype);
  const d = {
    __proto__: null,
    value: name,
    enumerable: false,
    configurable: true,
    writable: false,
  };
  ObjectDefineProperty(interface_.prototype, SymbolToStringTag, d);
  ObjectDefineProperty(interface_, "name", d);
}

function configureProperties(obj: object) {
  const descriptors: Safe<PropertyDescriptorMap> =
    ObjectGetOwnPropertyDescriptors(obj);
  for (const key in descriptors) {
    if (!ObjectHasOwn(descriptors, key)) {
      continue;
    }
    if (key === "constructor") continue;
    if (key === "prototype") continue;
    const descriptor: Safe<PropertyDescriptor> = descriptors[key]!;
    if (
      ReflectHas(descriptor, "value") &&
      typeof descriptor.value === "function"
    ) {
      ObjectDefineProperty(obj, key, {
        __proto__: null,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    } else if (ReflectHas(descriptor, "get")) {
      ObjectDefineProperty(obj, key, {
        __proto__: null,
        enumerable: true,
        configurable: true,
      });
    }
  }
}

const setlikeInner: unique symbol = /* @__PURE__ */ Symbol("[[set]]") as never;

// Ref: https://webidl.spec.whatwg.org/#es-setlike
function setlike(
  obj: { [setlikeInner]: primordials.Set<unknown> },
  assertion: (v: object) => v is object,
  readonly: boolean,
) {
  ObjectDefineProperties(obj, {
    size: {
      __proto__: null,
      configurable: true,
      enumerable: true,
      get() {
        assertBranded(this, assertion);
        // deno-lint-ignore no-property-access/no-property-access
        return obj[setlikeInner].size;
      },
    },
    [SymbolIterator]: {
      __proto__: null,
      configurable: true,
      enumerable: false,
      writable: true,
      value() {
        assertBranded(this, assertion);
        // deno-lint-ignore no-property-access/no-property-access
        return obj[setlikeInner][SymbolIterator]();
      },
    },
    entries: {
      __proto__: null,
      configurable: true,
      enumerable: true,
      writable: true,
      value() {
        assertBranded(this, assertion);
        // deno-lint-ignore no-property-access/no-property-access
        return SetPrototypeEntries(obj[setlikeInner]);
      },
    },
    keys: {
      __proto__: null,
      configurable: true,
      enumerable: true,
      writable: true,
      value() {
        assertBranded(this, assertion);
        // deno-lint-ignore no-property-access/no-property-access
        return SetPrototypeKeys(obj[setlikeInner]);
      },
    },
    values: {
      __proto__: null,
      configurable: true,
      enumerable: true,
      writable: true,
      value() {
        assertBranded(this, assertion);
        // deno-lint-ignore no-property-access/no-property-access
        return SetPrototypeValues(obj[setlikeInner]);
      },
    },
    forEach: {
      __proto__: null,
      configurable: true,
      enumerable: true,
      writable: true,
      value(
        callbackfn: (
          value: unknown,
          value2: unknown,
          set: primordials.Set<unknown>,
        ) => void,
        thisArg?: unknown,
      ) {
        assertBranded(this, assertion);
        // deno-lint-ignore no-property-access/no-property-access
        return SetPrototypeForEach(obj[setlikeInner], callbackfn, thisArg);
      },
    },
    has: {
      __proto__: null,
      configurable: true,
      enumerable: true,
      writable: true,
      value(value: unknown) {
        assertBranded(this, assertion);
        // deno-lint-ignore no-property-access/no-property-access
        return SetPrototypeHas(obj[setlikeInner], value);
      },
    },
  });

  if (!readonly) {
    ObjectDefineProperties(obj, {
      add: {
        __proto__: null,
        configurable: true,
        enumerable: true,
        writable: true,
        value(value: unknown) {
          assertBranded(this, assertion);
          // deno-lint-ignore no-property-access/no-property-access
          return SetPrototypeAdd(obj[setlikeInner], value);
        },
      },
      delete: {
        __proto__: null,
        configurable: true,
        enumerable: true,
        writable: true,
        value(value: unknown) {
          assertBranded(this, assertion);
          // deno-lint-ignore no-property-access/no-property-access
          return SetPrototypeDelete(obj[setlikeInner], value);
        },
      },
      clear: {
        __proto__: null,
        configurable: true,
        enumerable: true,
        writable: true,
        value() {
          assertBranded(this, assertion);
          // deno-lint-ignore no-property-access/no-property-access
          return SetPrototypeClear(obj[setlikeInner]);
        },
      },
    });
  }
}

export {
  assertBranded,
  configureInterface,
  converters,
  createAsyncIterableConverter,
  createDictionaryConverter,
  createEnumConverter,
  createInterfaceConverter,
  createNullableConverter,
  createPromiseConverter,
  createRecordConverter,
  createSequenceConverter,
  illegalConstructor,
  invokeCallbackFunction,
  makeException,
  mixinPairIterable,
  requiredArguments,
  setlike,
  setlikeInner,
  type,
};
