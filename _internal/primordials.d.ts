// deno-lint-ignore-file
// @ts-nocheck
interface PropertyDescriptor {
  __proto__: null;
  configurable?: boolean;
  enumerable?: boolean;
  value?: any;
  writable?: boolean;
  get?(): any;
  set?(v: any): void;
}

interface PropertyDescriptorMap {
  [key: PropertyKey]: PropertyDescriptor;
}

type ToObject<T extends object> = {
  [K in keyof T]: T[K];
};
interface AddSignature<
  T extends object,
  Params extends readonly unknown[],
  Return,
  This,
> extends T {
  (this: This, ...args: Params): Return;
}
type _UncurryThis<
  T extends (...args: never[]) => unknown,
  Shape extends object = ToObject<T>,
  Signatures extends [
    unknown,
    readonly unknown[],
    readonly unknown[],
    unknown,
  ][] = [],
> = Shape extends T ? Signatures
  : T extends AddSignature<Shape, infer Params, infer Return, infer This>
    ? _UncurryThis<T, AddSignature<Shape, Params, Return, This>, [
      [This, Params, [This, ...Params], Return],
      ...Signatures,
    ]>
  : Signatures;
declare const uncurryThis: <T extends (this: any, ...args: any[]) => unknown>(
  fn: T,
) => false extends (any extends T ? true : false)
  ? (...args: _UncurryThis<T>[number][2]) => _UncurryThis<T>[number][3]
  : (...args: any[]) => any;
type $Iterator<T, TReturn = unknown, TNext = undefined> = Iterator<
  T,
  TReturn,
  TNext
>;
type $Array<T> = Array<T>;
type $Uint8Array = Uint8Array;
type $Map<K, V> = Map<K, V>;
type $Set<T> = Set<T>;
type $WeakMap<K extends WeakKey, V> = WeakMap<K, V>;
type $WeakSet<T extends WeakKey> = WeakSet<T>;
type $Promise<T> = Promise<T>;
type $ArrayBuffer = ArrayBuffer;
declare const ReflectGetOwnPropertyDescriptor:
  typeof Reflect.getOwnPropertyDescriptor;
type $Symbol = Symbol;
type $BigInt = BigInt;
declare const $Symbol: SymbolConstructor;
declare const SymbolPrototype: Symbol;
declare const SymbolFor: (key: string) => symbol;
declare const SymbolKeyFor: (sym: symbol) => string | undefined;
declare const SymbolToPrimitive: typeof Symbol.toPrimitive;
declare const SymbolIterator: typeof Symbol.iterator;
declare const SymbolMatch: typeof Symbol.match;
declare const SymbolMatchAll: typeof Symbol.matchAll;
declare const SymbolReplace: typeof Symbol.replace;
declare const SymbolSearch: typeof Symbol.search;
declare const SymbolSplit: typeof Symbol.split;
declare const SymbolToStringTag: typeof Symbol.toStringTag;
declare const SymbolIsConcatSpreadable: typeof Symbol.isConcatSpreadable;
declare const SymbolHasInstance: typeof Symbol.hasInstance;
declare const SymbolSpecies: typeof Symbol.species;
declare const SymbolUnscopables: typeof Symbol.unscopables;
declare const SymbolAsyncIterator: typeof Symbol.asyncIterator;
declare const SymbolPrototypeToString: (args_0: unknown) => string;
declare const SymbolPrototypeValueOf: (args_0: unknown) => symbol;
declare const SymbolPrototypeGetDescription: (
  args_0: unknown,
) => string | undefined;
declare const SymbolPrototypeSymbolToPrimitive: (
  args_0: unknown,
  hint: string,
) => symbol;
declare const SymbolPrototypeSymbolToStringTag: string;
declare const $globalThis: typeof globalThis;
declare const $isNaN: typeof isNaN;
declare const $decodeURI: typeof decodeURI;
declare const $decodeURIComponent: typeof decodeURIComponent;
declare const $encodeURI: typeof encodeURI;
declare const $encodeURIComponent: typeof encodeURIComponent;
declare const $JSON: JSON;
declare const JSONParse: (
  text: string,
  reviver?: (this: any, key: string, value: any) => any,
) => any;
declare const JSONStringify: {
  (
    value: any,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number,
  ): string;
  (
    value: any,
    replacer?: (number | string)[] | null,
    space?: string | number,
  ): string;
};
declare const JSONSymbolToStringTag: string;
declare const $Math: Math;
declare const MathMin: (...values: number[]) => number;
declare const MathMax: (...values: number[]) => number;
declare const MathAbs: (x: number) => number;
declare const MathFloor: (x: number) => number;
declare const MathCeil: (x: number) => number;
declare const MathRound: (x: number) => number;
declare const MathSqrt: (x: number) => number;
declare const MathAcos: (x: number) => number;
declare const MathAsin: (x: number) => number;
declare const MathAtan: (x: number) => number;
declare const MathAtan2: (y: number, x: number) => number;
declare const MathCos: (x: number) => number;
declare const MathExp: (x: number) => number;
declare const MathLog: (x: number) => number;
declare const MathPow: (x: number, y: number) => number;
declare const MathSin: (x: number) => number;
declare const MathTan: (x: number) => number;
declare const MathTrunc: (x: number) => number;
declare const MathSign: (x: number) => number;
declare const MathCosh: (x: number) => number;
declare const MathSinh: (x: number) => number;
declare const MathTanh: (x: number) => number;
declare const MathAcosh: (x: number) => number;
declare const MathAsinh: (x: number) => number;
declare const MathAtanh: (x: number) => number;
declare const MathExpm1: (x: number) => number;
declare const MathLog1p: (x: number) => number;
declare const MathLog2: (x: number) => number;
declare const MathLog10: (x: number) => number;
declare const MathCbrt: (x: number) => number;
declare const MathHypot: (...values: number[]) => number;
declare const MathRandom: () => number;
declare const MathFround: (x: number) => number;
declare const MathImul: (x: number, y: number) => number;
declare const MathClz32: (x: number) => number;
declare const MathE: number;
declare const MathLN10: number;
declare const MathLN2: number;
declare const MathLOG2E: number;
declare const MathLOG10E: number;
declare const MathPI: number;
declare const MathSQRT1_2: number;
declare const MathSQRT2: number;
declare const MathSymbolToStringTag: string;
declare const $Proxy: ProxyConstructor;
declare const ProxyRevocable: <T extends object>(
  target: T,
  handler: ProxyHandler<T>,
) => {
  proxy: T;
  revoke: () => void;
};
declare const $Reflect: typeof Reflect;
declare const ReflectApply: typeof Reflect.apply;
declare const ReflectConstruct: typeof Reflect.construct;
declare const ReflectDefineProperty: typeof Reflect.defineProperty;
declare const ReflectDeleteProperty: typeof Reflect.deleteProperty;
declare const ReflectGet: typeof Reflect.get;
declare const ReflectGetPrototypeOf: typeof Reflect.getPrototypeOf;
declare const ReflectHas: typeof Reflect.has;
declare const ReflectIsExtensible: typeof Reflect.isExtensible;
declare const ReflectOwnKeys: typeof Reflect.ownKeys;
declare const ReflectPreventExtensions: typeof Reflect.preventExtensions;
declare const ReflectSet: typeof Reflect.set;
declare const ReflectSetPrototypeOf: typeof Reflect.setPrototypeOf;
declare const ReflectSymbolToStringTag: "Reflect";
declare const $AggregateError: AggregateErrorConstructor;
declare const AggregateErrorPrototype: AggregateError;
declare const AggregateErrorPrototypeName: string;
declare const AggregateErrorPrototypeMessage: string;
declare const $Array: ArrayConstructor;
declare const ArrayPrototype: any[];
declare const ArrayIsArray: (arg: any) => arg is any[];
declare const ArrayFrom: {
  <T>(arrayLike: ArrayLike<T>): T[];
  <T, U>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: number) => U,
    thisArg?: any,
  ): U[];
  <T>(iterable: Iterable<T> | ArrayLike<T>): T[];
  <T, U>(
    iterable: Iterable<T> | ArrayLike<T>,
    mapfn: (v: T, k: number) => U,
    thisArg?: any,
  ): U[];
};
declare const ArrayOf: <T>(...items: T[]) => T[];
declare const ArrayGetSymbolSpecies: (args_0: unknown) => ArrayConstructor;
declare const ArrayPrototypeLength: number;
declare const ArrayPrototypeAt: (args_0: unknown, index: number) => any;
declare const ArrayPrototypeWith: (
  args_0: unknown,
  index: number,
  value: any,
) => any[];
declare const ArrayPrototypeConcat: (args_0: unknown, ...args: any[]) => any[];
declare const ArrayPrototypeEvery: (...args: any) => any;
declare const ArrayPrototypeSome: (
  args_0: unknown,
  predicate: (value: any, index: number, array: any[]) => unknown,
  thisArg?: any,
) => boolean;
declare const ArrayPrototypeForEach: (
  args_0: unknown,
  callbackfn: (value: any, index: number, array: any[]) => void,
  thisArg?: any,
) => void;
declare const ArrayPrototypeFilter: (
  args_0: unknown,
  predicate: (value: any, index: number, array: any[]) => unknown,
  thisArg?: any,
) => any[];
declare const ArrayPrototypeReduce: (
  ...args: [
    unknown,
    callbackfn: (
      previousValue: unknown,
      currentValue: any,
      currentIndex: number,
      array: any[],
    ) => unknown,
    initialValue: unknown,
  ] | [
    unknown,
    callbackfn: (
      previousValue: any,
      currentValue: any,
      currentIndex: number,
      array: any[],
    ) => any,
    initialValue: any,
  ] | [
    unknown,
    callbackfn: (
      previousValue: any,
      currentValue: any,
      currentIndex: number,
      array: any[],
    ) => any,
  ]
) => any;
declare const ArrayPrototypeReduceRight: (
  ...args: [
    unknown,
    callbackfn: (
      previousValue: unknown,
      currentValue: any,
      currentIndex: number,
      array: any[],
    ) => unknown,
    initialValue: unknown,
  ] | [
    unknown,
    callbackfn: (
      previousValue: any,
      currentValue: any,
      currentIndex: number,
      array: any[],
    ) => any,
    initialValue: any,
  ] | [
    unknown,
    callbackfn: (
      previousValue: any,
      currentValue: any,
      currentIndex: number,
      array: any[],
    ) => any,
  ]
) => any;
declare const ArrayPrototypeFill: (
  args_0: unknown,
  value: any,
  start?: number | undefined,
  end?: number | undefined,
) => any[];
declare const ArrayPrototypeFind: (
  args_0: unknown,
  predicate: (value: any, index: number, obj: any[]) => unknown,
  thisArg?: any,
) => any;
declare const ArrayPrototypeFindIndex: (
  args_0: unknown,
  predicate: (value: any, index: number, obj: any[]) => unknown,
  thisArg?: any,
) => number;
declare const ArrayPrototypeFindLast: (
  args_0: unknown,
  predicate: (value: any, index: number, array: any[]) => unknown,
  thisArg?: any,
) => any;
declare const ArrayPrototypeFindLastIndex: (
  args_0: unknown,
  predicate: (value: any, index: number, array: any[]) => unknown,
  thisArg?: any,
) => number;
declare const ArrayPrototypeIndexOf: (
  args_0: unknown,
  searchElement: any,
  fromIndex?: number | undefined,
) => number;
declare const ArrayPrototypeLastIndexOf: (
  args_0: unknown,
  searchElement: any,
  fromIndex?: number | undefined,
) => number;
declare const ArrayPrototypeIncludes: (
  args_0: unknown,
  searchElement: any,
  fromIndex?: number | undefined,
) => boolean;
declare const ArrayPrototypeJoin: (
  args_0: unknown,
  separator?: string | undefined,
) => string;
declare const ArrayPrototypeToString: (args_0: unknown) => string;
declare const ArrayPrototypeToLocaleString: (
  ...args: [unknown] | [
    unknown,
    locales: string | string[],
    options?:
      | (Intl.NumberFormatOptions & Intl.DateTimeFormatOptions)
      | undefined,
  ]
) => string;
declare const ArrayPrototypePop: (args_0: unknown) => any;
declare const ArrayPrototypePush: (args_0: unknown, ...args: any[]) => number;
declare const ArrayPrototypePushApply: (self: unknown, args: any[]) => number;
declare const ArrayPrototypeShift: (args_0: unknown) => any;
declare const ArrayPrototypeUnshift: (
  args_0: unknown,
  ...args: any[]
) => number;
declare const ArrayPrototypeUnshiftApply: (
  self: unknown,
  args: any[],
) => number;
declare const ArrayPrototypeReverse: (args_0: unknown) => any[];
declare const ArrayPrototypeToReversed: (args_0: unknown) => any[];
declare const ArrayPrototypeSort: (
  args_0: unknown,
  compareFn?: ((a: any, b: any) => number) | undefined,
) => any[];
declare const ArrayPrototypeToSorted: (
  args_0: unknown,
  compareFn?: ((a: any, b: any) => number) | undefined,
) => any[];
declare const ArrayPrototypeSlice: (
  args_0: unknown,
  start?: number | undefined,
  end?: number | undefined,
) => any[];
declare const ArrayPrototypeSplice: (
  args_0: unknown,
  start: number,
  deleteCount: number,
  ...items: any[]
) => any[];
declare const ArrayPrototypeToSpliced: (
  args_0: unknown,
  start: number,
  deleteCount?: number | undefined,
) => any[];
declare const ArrayPrototypeCopyWithin: (
  args_0: unknown,
  target: number,
  start: number,
  end?: number | undefined,
) => any[];
declare const ArrayPrototypeFlatMap: (
  args_0: unknown,
  callback: (this: unknown, value: any, index: number, array: any[]) => unknown,
  thisArg?: unknown,
) => unknown[];
declare const ArrayPrototypeFlat: (
  args_0: unknown,
  depth?: number | undefined,
) => unknown[];
declare const ArrayPrototypeValues: (args_0: unknown) => ArrayIterator<any>;
declare const ArrayPrototypeKeys: (args_0: unknown) => ArrayIterator<number>;
declare const ArrayPrototypeEntries: (
  args_0: unknown,
) => ArrayIterator<[number, any]>;
declare const ArrayPrototypeSymbolIterator: (
  args_0: unknown,
) => ArrayIterator<any>;
declare const ArrayPrototypeSymbolUnscopables: {
  [x: number]: boolean | undefined;
  length?: boolean | undefined;
  toString?: boolean | undefined;
  toLocaleString?: boolean | undefined;
  pop?: boolean | undefined;
  push?: boolean | undefined;
  concat?: boolean | undefined;
  join?: boolean | undefined;
  reverse?: boolean | undefined;
  shift?: boolean | undefined;
  slice?: boolean | undefined;
  sort?: boolean | undefined;
  splice?: boolean | undefined;
  unshift?: boolean | undefined;
  indexOf?: boolean | undefined;
  lastIndexOf?: boolean | undefined;
  every?: boolean | undefined;
  some?: boolean | undefined;
  forEach?: boolean | undefined;
  map?: boolean | undefined;
  filter?: boolean | undefined;
  reduce?: boolean | undefined;
  reduceRight?: boolean | undefined;
  find?: boolean | undefined;
  findIndex?: boolean | undefined;
  fill?: boolean | undefined;
  copyWithin?: boolean | undefined;
  entries?: boolean | undefined;
  keys?: boolean | undefined;
  values?: boolean | undefined;
  includes?: boolean | undefined;
  flatMap?: boolean | undefined;
  flat?: boolean | undefined;
  at?: boolean | undefined;
  findLast?: boolean | undefined;
  findLastIndex?: boolean | undefined;
  toReversed?: boolean | undefined;
  toSorted?: boolean | undefined;
  toSpliced?: boolean | undefined;
  with?: boolean | undefined;
  [Symbol.iterator]?: boolean | undefined;
  readonly [Symbol.unscopables]?: boolean | undefined;
};
declare const $ArrayBuffer: ArrayBufferConstructor;
declare const ArrayBufferPrototype: ArrayBuffer;
declare const ArrayBufferIsView: (arg: any) => arg is ArrayBufferView;
declare const ArrayBufferGetSymbolSpecies: (
  args_0: unknown,
) => ArrayBufferConstructor;
declare const ArrayBufferPrototypeGetByteLength: (args_0: unknown) => number;
declare const ArrayBufferPrototypeSlice: (
  args_0: unknown,
  begin?: number | undefined,
  end?: number | undefined,
) => ArrayBuffer;
declare const ArrayBufferPrototypeSymbolToStringTag: string;
declare const $BigInt: BigIntConstructor;
declare const BigIntPrototype: BigInt;
declare const BigIntAsUintN: (bits: number, int: bigint) => bigint;
declare const BigIntAsIntN: (bits: number, int: bigint) => bigint;
declare const BigIntPrototypeToString: (
  args_0: unknown,
  radix?: number | undefined,
) => string;
declare const BigIntPrototypeValueOf: (args_0: unknown) => bigint;
declare const BigIntPrototypeSymbolToStringTag: "BigInt";
declare const $BigInt64Array: BigInt64ArrayConstructor;
declare const BigInt64ArrayPrototype: BigInt64Array<ArrayBufferLike>;
declare const BigInt64ArrayBYTES_PER_ELEMENT: number;
declare const BigInt64ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $BigUint64Array: BigUint64ArrayConstructor;
declare const BigUint64ArrayPrototype: BigUint64Array<ArrayBufferLike>;
declare const BigUint64ArrayBYTES_PER_ELEMENT: number;
declare const BigUint64ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Boolean: BooleanConstructor;
declare const BooleanPrototype: Boolean;
declare const BooleanPrototypeToString: (args_0: unknown) => string;
declare const BooleanPrototypeValueOf: (args_0: unknown) => boolean;
declare const $DataView: DataViewConstructor;
declare const DataViewPrototype: DataView<ArrayBufferLike>;
declare const DataViewPrototypeGetBuffer: (args_0: unknown) => ArrayBufferLike;
declare const DataViewPrototypeGetByteLength: (args_0: unknown) => number;
declare const DataViewPrototypeGetByteOffset: (args_0: unknown) => number;
declare const DataViewPrototypeGetInt8: (
  args_0: unknown,
  byteOffset: number,
) => number;
declare const DataViewPrototypeGetUint8: (
  args_0: unknown,
  byteOffset: number,
) => number;
declare const DataViewPrototypeGetInt16: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => number;
declare const DataViewPrototypeGetUint16: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => number;
declare const DataViewPrototypeGetInt32: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => number;
declare const DataViewPrototypeGetUint32: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => number;
declare const DataViewPrototypeGetBigInt64: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => bigint;
declare const DataViewPrototypeGetBigUint64: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => bigint;
declare const DataViewPrototypeGetFloat32: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => number;
declare const DataViewPrototypeGetFloat64: (
  args_0: unknown,
  byteOffset: number,
  littleEndian?: boolean | undefined,
) => number;
declare const DataViewPrototypeSetInt8: (
  args_0: unknown,
  byteOffset: number,
  value: number,
) => void;
declare const DataViewPrototypeSetUint8: (
  args_0: unknown,
  byteOffset: number,
  value: number,
) => void;
declare const DataViewPrototypeSetInt16: (
  args_0: unknown,
  byteOffset: number,
  value: number,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSetUint16: (
  args_0: unknown,
  byteOffset: number,
  value: number,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSetInt32: (
  args_0: unknown,
  byteOffset: number,
  value: number,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSetUint32: (
  args_0: unknown,
  byteOffset: number,
  value: number,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSetBigInt64: (
  args_0: unknown,
  byteOffset: number,
  value: bigint,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSetBigUint64: (
  args_0: unknown,
  byteOffset: number,
  value: bigint,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSetFloat32: (
  args_0: unknown,
  byteOffset: number,
  value: number,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSetFloat64: (
  args_0: unknown,
  byteOffset: number,
  value: number,
  littleEndian?: boolean | undefined,
) => void;
declare const DataViewPrototypeSymbolToStringTag: string;
declare const $Date: DateConstructor;
declare const DatePrototype: Date;
declare const DateNow: () => number;
declare const DateParse: (s: string) => number;
declare const DateUTC: {
  (
    year: number,
    monthIndex: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number,
  ): number;
  (
    year: number,
    monthIndex?: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number,
  ): number;
};
declare const DatePrototypeValueOf: (args_0: unknown) => number;
declare const DatePrototypeToString: (args_0: unknown) => string;
declare const DatePrototypeToUTCString: (args_0: unknown) => string;
declare const DatePrototypeToISOString: (args_0: unknown) => string;
declare const DatePrototypeToDateString: (args_0: unknown) => string;
declare const DatePrototypeToTimeString: (args_0: unknown) => string;
declare const DatePrototypeToLocaleString: (
  args_0: unknown,
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions | undefined,
) => string;
declare const DatePrototypeToLocaleDateString: (
  args_0: unknown,
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions | undefined,
) => string;
declare const DatePrototypeToLocaleTimeString: (
  args_0: unknown,
  locales?: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions | undefined,
) => string;
declare const DatePrototypeGetTimezoneOffset: (args_0: unknown) => number;
declare const DatePrototypeGetTime: (args_0: unknown) => number;
declare const DatePrototypeGetFullYear: (args_0: unknown) => number;
declare const DatePrototypeGetUTCFullYear: (args_0: unknown) => number;
declare const DatePrototypeGetMonth: (args_0: unknown) => number;
declare const DatePrototypeGetUTCMonth: (args_0: unknown) => number;
declare const DatePrototypeGetDate: (args_0: unknown) => number;
declare const DatePrototypeGetUTCDate: (args_0: unknown) => number;
declare const DatePrototypeGetHours: (args_0: unknown) => number;
declare const DatePrototypeGetUTCHours: (args_0: unknown) => number;
declare const DatePrototypeGetMinutes: (args_0: unknown) => number;
declare const DatePrototypeGetUTCMinutes: (args_0: unknown) => number;
declare const DatePrototypeGetSeconds: (args_0: unknown) => number;
declare const DatePrototypeGetUTCSeconds: (args_0: unknown) => number;
declare const DatePrototypeGetMilliseconds: (args_0: unknown) => number;
declare const DatePrototypeGetUTCMilliseconds: (args_0: unknown) => number;
declare const DatePrototypeGetDay: (args_0: unknown) => number;
declare const DatePrototypeGetUTCDay: (args_0: unknown) => number;
declare const DatePrototypeSetTime: (args_0: unknown, time: number) => number;
declare const DatePrototypeSetMilliseconds: (
  args_0: unknown,
  ms: number,
) => number;
declare const DatePrototypeSetUTCMilliseconds: (
  args_0: unknown,
  ms: number,
) => number;
declare const DatePrototypeSetSeconds: (
  args_0: unknown,
  sec: number,
  ms?: number | undefined,
) => number;
declare const DatePrototypeSetUTCSeconds: (
  args_0: unknown,
  sec: number,
  ms?: number | undefined,
) => number;
declare const DatePrototypeSetMinutes: (
  args_0: unknown,
  min: number,
  sec?: number | undefined,
  ms?: number | undefined,
) => number;
declare const DatePrototypeSetUTCMinutes: (
  args_0: unknown,
  min: number,
  sec?: number | undefined,
  ms?: number | undefined,
) => number;
declare const DatePrototypeSetHours: (
  args_0: unknown,
  hours: number,
  min?: number | undefined,
  sec?: number | undefined,
  ms?: number | undefined,
) => number;
declare const DatePrototypeSetUTCHours: (
  args_0: unknown,
  hours: number,
  min?: number | undefined,
  sec?: number | undefined,
  ms?: number | undefined,
) => number;
declare const DatePrototypeSetDate: (args_0: unknown, date: number) => number;
declare const DatePrototypeSetUTCDate: (
  args_0: unknown,
  date: number,
) => number;
declare const DatePrototypeSetMonth: (
  args_0: unknown,
  month: number,
  date?: number | undefined,
) => number;
declare const DatePrototypeSetUTCMonth: (
  args_0: unknown,
  month: number,
  date?: number | undefined,
) => number;
declare const DatePrototypeSetFullYear: (
  args_0: unknown,
  year: number,
  month?: number | undefined,
  date?: number | undefined,
) => number;
declare const DatePrototypeSetUTCFullYear: (
  args_0: unknown,
  year: number,
  month?: number | undefined,
  date?: number | undefined,
) => number;
declare const DatePrototypeToJSON: (args_0: unknown, key?: any) => string;
declare const DatePrototypeSymbolToPrimitive: (
  ...args: [unknown, hint: string] | [unknown, hint: "number"] | [
    unknown,
    hint: "string",
  ] | [unknown, hint: "default"]
) => string | number;
declare const $Error: ErrorConstructor;
declare const ErrorPrototype: Error;
declare const ErrorPrototypeToString: (args_0: unknown) => string;
declare const ErrorPrototypeName: string;
declare const ErrorPrototypeMessage: string;
declare const $EvalError: EvalErrorConstructor;
declare const EvalErrorPrototype: EvalError;
declare const EvalErrorPrototypeName: string;
declare const EvalErrorPrototypeMessage: string;
declare const $Float32Array: Float32ArrayConstructor;
declare const Float32ArrayPrototype: Float32Array<ArrayBufferLike>;
declare const Float32ArrayBYTES_PER_ELEMENT: number;
declare const Float32ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Float64Array: Float64ArrayConstructor;
declare const Float64ArrayPrototype: Float64Array<ArrayBufferLike>;
declare const Float64ArrayBYTES_PER_ELEMENT: number;
declare const Float64ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Function: FunctionConstructor;
declare const FunctionPrototype: Function;
declare const FunctionPrototypeGetCaller: (args_0: unknown) => Function;
declare const FunctionPrototypeSetCaller: (
  args_0: unknown,
  value: Function,
) => void;
declare const FunctionPrototypeGetArguments: (args_0: unknown) => any;
declare const FunctionPrototypeSetArguments: (
  args_0: unknown,
  value: any,
) => void;
declare const FunctionPrototypeCall: (
  args_0: Function,
  thisArg: any,
  ...argArray: any[]
) => any;
declare const FunctionPrototypeApply: (
  args_0: Function,
  thisArg: any,
  argArray?: any,
) => any;
declare const FunctionPrototypeBind: (
  args_0: Function,
  thisArg: any,
  ...argArray: any[]
) => any;
declare const FunctionPrototypeToString: (args_0: unknown) => string;
declare const FunctionPrototypeSymbolHasInstance: (
  args_0: unknown,
  value: any,
) => boolean;
declare const $Int16Array: Int16ArrayConstructor;
declare const Int16ArrayPrototype: Int16Array<ArrayBufferLike>;
declare const Int16ArrayBYTES_PER_ELEMENT: number;
declare const Int16ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Int32Array: Int32ArrayConstructor;
declare const Int32ArrayPrototype: Int32Array<ArrayBufferLike>;
declare const Int32ArrayBYTES_PER_ELEMENT: number;
declare const Int32ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Int8Array: Int8ArrayConstructor;
declare const Int8ArrayPrototype: Int8Array<ArrayBufferLike>;
declare const Int8ArrayBYTES_PER_ELEMENT: number;
declare const Int8ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Map: MapConstructor;
declare const MapGroupBy: <K, T>(
  items: Iterable<T>,
  keySelector: (item: T, index: number) => K,
) => Map<K, T[]>;
declare const MapPrototype: Map<any, any>;
declare const MapGetSymbolSpecies: (args_0: unknown) => MapConstructor;
declare const MapPrototypeSet: (
  args_0: unknown,
  key: any,
  value: any,
) => Map<any, any>;
declare const MapPrototypeGet: (args_0: unknown, key: any) => any;
declare const MapPrototypeHas: (args_0: unknown, key: any) => boolean;
declare const MapPrototypeDelete: (args_0: unknown, key: any) => boolean;
declare const MapPrototypeClear: (args_0: unknown) => void;
declare const MapPrototypeGetSize: (args_0: unknown) => number;
declare const MapPrototypeForEach: (
  args_0: unknown,
  callbackfn: (value: any, key: any, map: Map<any, any>) => void,
  thisArg?: any,
) => void;
declare const MapPrototypeValues: (args_0: unknown) => MapIterator<any>;
declare const MapPrototypeKeys: (args_0: unknown) => MapIterator<any>;
declare const MapPrototypeEntries: (args_0: unknown) => MapIterator<[any, any]>;
declare const MapPrototypeSymbolIterator: (
  args_0: unknown,
) => MapIterator<[any, any]>;
declare const MapPrototypeSymbolToStringTag: string;
declare const $Number: NumberConstructor;
declare const NumberPrototype: Number;
declare const NumberParseInt: (string: string, radix?: number) => number;
declare const NumberParseFloat: (string: string) => number;
declare const NumberIsNaN: (number: unknown) => boolean;
declare const NumberIsFinite: (number: unknown) => boolean;
declare const NumberIsInteger: (number: unknown) => boolean;
declare const NumberIsSafeInteger: (number: unknown) => boolean;
declare const NumberMAX_VALUE: number;
declare const NumberMIN_VALUE: number;
declare const NumberNaN: number;
declare const NumberNEGATIVE_INFINITY: number;
declare const NumberPOSITIVE_INFINITY: number;
declare const NumberEPSILON: number;
declare const NumberMAX_SAFE_INTEGER: number;
declare const NumberMIN_SAFE_INTEGER: number;
declare const NumberPrototypeToExponential: (
  args_0: unknown,
  fractionDigits?: number | undefined,
) => string;
declare const NumberPrototypeToFixed: (
  args_0: unknown,
  fractionDigits?: number | undefined,
) => string;
declare const NumberPrototypeToPrecision: (
  args_0: unknown,
  precision?: number | undefined,
) => string;
declare const NumberPrototypeToString: (
  args_0: unknown,
  radix?: number | undefined,
) => string;
declare const NumberPrototypeToLocaleString: (
  args_0: unknown,
  locales?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions | undefined,
) => string;
declare const NumberPrototypeValueOf: (args_0: unknown) => number;
declare const $Object: ObjectConstructor;
declare const ObjectPrototype: Object;
declare const ObjectCreate: {
  (o: object | null): any;
  (o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;
};
declare const ObjectGetPrototypeOf: (o: any) => any;
declare const ObjectSetPrototypeOf: (o: any, proto: object | null) => any;
declare const ObjectDefineProperty: <T>(
  o: T,
  p: PropertyKey,
  attributes: PropertyDescriptor & ThisType<any>,
) => T;
declare const ObjectDefineProperties: <T>(
  o: T,
  properties: PropertyDescriptorMap & ThisType<any>,
) => T;
declare const ObjectGetOwnPropertyNames: (o: any) => string[];
declare const ObjectGetOwnPropertySymbols: (o: any) => symbol[];
declare const ObjectGroupBy: <K extends PropertyKey, T>(
  items: Iterable<T>,
  keySelector: (item: T, index: number) => K,
) => Partial<Record<K, T[]>>;
declare const ObjectKeys: {
  (o: object): string[];
  (o: {}): string[];
};
declare const ObjectValues: {
  <T>(
    o: {
      [s: string]: T;
    } | ArrayLike<T>,
  ): T[];
  (o: {}): any[];
};
declare const ObjectEntries: {
  <T>(
    o: {
      [s: string]: T;
    } | ArrayLike<T>,
  ): [string, T][];
  (o: {}): [string, any][];
};
declare const ObjectIsExtensible: (o: any) => boolean;
declare const ObjectPreventExtensions: <T>(o: T) => T;
declare const ObjectGetOwnPropertyDescriptor: (
  o: any,
  p: PropertyKey,
) => PropertyDescriptor | undefined;
declare const ObjectGetOwnPropertyDescriptors: <T>(
  o: T,
) => { [P in keyof T]: TypedPropertyDescriptor<T[P]> } & {
  [x: string]: PropertyDescriptor;
};
declare const ObjectIs: (value1: any, value2: any) => boolean;
declare const ObjectAssign: {
  <T extends {}, U>(target: T, source: U): T & U;
  <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
  <T extends {}, U, V, W>(
    target: T,
    source1: U,
    source2: V,
    source3: W,
  ): T & U & V & W;
  (target: object, ...sources: any[]): any;
};
declare const ObjectSeal: <T>(o: T) => T;
declare const ObjectFreeze: {
  <T extends Function>(f: T): T;
  <
    T extends {
      [idx: string]: U | null | undefined | object;
    },
    U extends string | bigint | number | boolean | symbol,
  >(o: T): Readonly<T>;
  <T>(o: T): Readonly<T>;
};
declare const ObjectIsSealed: (o: any) => boolean;
declare const ObjectIsFrozen: (o: any) => boolean;
declare const ObjectFromEntries: {
  <T = any>(entries: Iterable<readonly [PropertyKey, T]>): {
    [k: string]: T;
  };
  (entries: Iterable<readonly any[]>): any;
};
declare const ObjectHasOwn: (o: object, v: PropertyKey) => boolean;
declare const ObjectPrototypeToString: (args_0: unknown) => string;
declare const ObjectPrototypeToLocaleString: (args_0: unknown) => string;
declare const ObjectPrototypeValueOf: (args_0: unknown) => Object;
declare const ObjectPrototypeHasOwnProperty: (
  args_0: unknown,
  v: PropertyKey,
) => boolean;
declare const ObjectPrototypeIsPrototypeOf: (
  args_0: unknown,
  v: Object,
) => boolean;
declare const ObjectPrototypePropertyIsEnumerable: (
  args_0: unknown,
  v: PropertyKey,
) => boolean;
declare const $RangeError: RangeErrorConstructor;
declare const RangeErrorPrototype: RangeError;
declare const RangeErrorPrototypeName: string;
declare const RangeErrorPrototypeMessage: string;
declare const $ReferenceError: ReferenceErrorConstructor;
declare const ReferenceErrorPrototype: ReferenceError;
declare const ReferenceErrorPrototypeName: string;
declare const ReferenceErrorPrototypeMessage: string;
declare const $RegExp: RegExpConstructor;
declare const RegExpPrototype: RegExp;
declare const RegExpGetSymbolSpecies: (args_0: unknown) => RegExpConstructor;
declare const RegExpPrototypeGetFlags: (args_0: unknown) => string;
declare const RegExpPrototypeGetSource: (args_0: unknown) => string;
declare const RegExpPrototypeGetGlobal: (args_0: unknown) => boolean;
declare const RegExpPrototypeGetIgnoreCase: (args_0: unknown) => boolean;
declare const RegExpPrototypeGetMultiline: (args_0: unknown) => boolean;
declare const RegExpPrototypeGetDotAll: (args_0: unknown) => boolean;
declare const RegExpPrototypeGetUnicode: (args_0: unknown) => boolean;
declare const RegExpPrototypeGetSticky: (args_0: unknown) => boolean;
declare const RegExpPrototypeGetHasIndices: (args_0: unknown) => boolean;
declare const RegExpPrototypeExec: (
  args_0: unknown,
  string: string,
) => RegExpExecArray | null;
declare const RegExpPrototypeCompile: (
  args_0: unknown,
  pattern: string,
  flags?: string | undefined,
) => RegExp;
declare const RegExpPrototypeTest: (args_0: unknown, string: string) => boolean;
declare const RegExpPrototypeToString: (args_0: unknown) => string;
declare const RegExpPrototypeSymbolReplace: (
  ...args: [
    unknown,
    string: string,
    replacer: (substring: string, ...args: any[]) => string,
  ] | [unknown, string: string, replaceValue: string]
) => string;
declare const RegExpPrototypeSymbolMatch: (
  args_0: unknown,
  string: string,
) => RegExpMatchArray | null;
declare const RegExpPrototypeSymbolMatchAll: (
  args_0: unknown,
  str: string,
) => RegExpStringIterator<RegExpMatchArray>;
declare const RegExpPrototypeSymbolSearch: (
  args_0: unknown,
  string: string,
) => number;
declare const RegExpPrototypeSymbolSplit: (
  args_0: unknown,
  string: string,
  limit?: number | undefined,
) => string[];
declare const $Set: SetConstructor;
declare const SetPrototype: Set<any>;
declare const SetGetSymbolSpecies: (args_0: unknown) => SetConstructor;
declare const SetPrototypeAdd: (args_0: unknown, value: any) => Set<any>;
declare const SetPrototypeHas: (args_0: unknown, value: any) => boolean;
declare const SetPrototypeDelete: (args_0: unknown, value: any) => boolean;
declare const SetPrototypeClear: (args_0: unknown) => void;
declare const SetPrototypeGetSize: (args_0: unknown) => number;
declare const SetPrototypeForEach: (
  args_0: unknown,
  callbackfn: (value: any, value2: any, set: Set<any>) => void,
  thisArg?: any,
) => void;
declare const SetPrototypeValues: (args_0: unknown) => SetIterator<any>;
declare const SetPrototypeKeys: (args_0: unknown) => SetIterator<any>;
declare const SetPrototypeEntries: (args_0: unknown) => SetIterator<[any, any]>;
declare const SetPrototypeSymbolIterator: (args_0: unknown) => SetIterator<any>;
declare const SetPrototypeSymbolToStringTag: string;
declare const $SharedArrayBuffer: SharedArrayBufferConstructor;
declare const SharedArrayBufferPrototype: SharedArrayBuffer;
declare const SharedArrayBufferGetSymbolSpecies: (args_0: unknown) => any;
declare const SharedArrayBufferPrototypeGetByteLength: (
  args_0: unknown,
) => number;
declare const SharedArrayBufferPrototypeSlice: (
  args_0: unknown,
  begin?: number | undefined,
  end?: number | undefined,
) => SharedArrayBuffer;
declare const SharedArrayBufferPrototypeSymbolToStringTag: "SharedArrayBuffer";
declare const $String: StringConstructor;
declare const StringPrototype: String;
declare const StringFromCharCode: (...codes: number[]) => string;
declare const StringFromCodePoint: (...codePoints: number[]) => string;
declare const StringRaw: (template: {
  raw: readonly string[] | ArrayLike<string>;
}, ...substitutions: any[]) => string;
declare const StringPrototypeLength: number;
declare const StringPrototypeAt: (
  args_0: unknown,
  index: number,
) => string | undefined;
declare const StringPrototypeCharCodeAt: (
  args_0: unknown,
  index: number,
) => number;
declare const StringPrototypeCharAt: (args_0: unknown, pos: number) => string;
declare const StringPrototypeConcat: (
  args_0: unknown,
  ...args: string[]
) => string;
declare const StringPrototypeConcatApply: (
  self: unknown,
  args: string[],
) => string;
declare const StringPrototypeCodePointAt: (
  args_0: unknown,
  pos: number,
) => number | undefined;
declare const StringPrototypeIsWellFormed: (args_0: unknown) => boolean;
declare const StringPrototypeToWellFormed: (args_0: unknown) => string;
declare const StringPrototypeIndexOf: (
  args_0: unknown,
  searchString: string,
  position?: number | undefined,
) => number;
declare const StringPrototypeLastIndexOf: (
  args_0: unknown,
  searchString: string,
  position?: number | undefined,
) => number;
declare const StringPrototypeIncludes: (
  args_0: unknown,
  searchString: string,
  position?: number | undefined,
) => boolean;
declare const StringPrototypeEndsWith: (
  args_0: unknown,
  searchString: string,
  endPosition?: number | undefined,
) => boolean;
declare const StringPrototypeStartsWith: (
  args_0: unknown,
  searchString: string,
  position?: number | undefined,
) => boolean;
declare const StringPrototypeMatch: (
  ...args: [unknown, matcher: {
    [Symbol.match](string: string): RegExpMatchArray | null;
  }] | [unknown, regexp: string | RegExp]
) => RegExpMatchArray | null;
declare const StringPrototypeMatchAll: (
  args_0: unknown,
  regexp: RegExp,
) => RegExpStringIterator<RegExpExecArray>;
declare const StringPrototypeSearch: (
  ...args: [unknown, searcher: {
    [Symbol.search](string: string): number;
  }] | [unknown, regexp: string | RegExp]
) => number;
declare const StringPrototypeSplit: (
  ...args: [unknown, splitter: {
    [Symbol.split](string: string, limit?: number): string[];
  }, limit?: number | undefined] | [
    unknown,
    separator: string | RegExp,
    limit?: number | undefined,
  ]
) => string[];
declare const StringPrototypeSubstring: (
  args_0: unknown,
  start: number,
  end?: number | undefined,
) => string;
declare const StringPrototypeSubstr: (
  args_0: unknown,
  from: number,
  length?: number | undefined,
) => string;
declare const StringPrototypeSlice: (
  args_0: unknown,
  start?: number | undefined,
  end?: number | undefined,
) => string;
declare const StringPrototypeRepeat: (args_0: unknown, count: number) => string;
declare const StringPrototypeReplace: (
  ...args: [unknown, searchValue: {
    [Symbol.replace](
      string: string,
      replacer: (substring: string, ...args: any[]) => string,
    ): string;
  }, replacer: (substring: string, ...args: any[]) => string] | [
    unknown,
    searchValue: {
      [Symbol.replace](string: string, replaceValue: string): string;
    },
    replaceValue: string,
  ] | [
    unknown,
    searchValue: string | RegExp,
    replacer: (substring: string, ...args: any[]) => string,
  ] | [unknown, searchValue: string | RegExp, replaceValue: string]
) => string;
declare const StringPrototypeReplaceAll: (
  ...args: [
    unknown,
    searchValue: string | RegExp,
    replacer: (substring: string, ...args: any[]) => string,
  ] | [unknown, searchValue: string | RegExp, replaceValue: string]
) => string;
declare const StringPrototypePadEnd: (
  args_0: unknown,
  maxLength: number,
  fillString?: string | undefined,
) => string;
declare const StringPrototypePadStart: (
  args_0: unknown,
  maxLength: number,
  fillString?: string | undefined,
) => string;
declare const StringPrototypeTrim: (args_0: unknown) => string;
declare const StringPrototypeTrimEnd: (args_0: unknown) => string;
declare const StringPrototypeTrimRight: (args_0: unknown) => string;
declare const StringPrototypeTrimStart: (args_0: unknown) => string;
declare const StringPrototypeTrimLeft: (args_0: unknown) => string;
declare const StringPrototypeToString: (args_0: unknown) => string;
declare const StringPrototypeValueOf: (args_0: unknown) => string;
declare const StringPrototypeLocaleCompare: (
  args_0: unknown,
  that: string,
  locales?: Intl.LocalesArgument,
  options?: Intl.CollatorOptions | undefined,
) => number;
declare const StringPrototypeToLowerCase: (args_0: unknown) => string;
declare const StringPrototypeToUpperCase: (args_0: unknown) => string;
declare const StringPrototypeToLocaleLowerCase: (
  args_0: unknown,
  locales?: Intl.LocalesArgument,
) => string;
declare const StringPrototypeToLocaleUpperCase: (
  args_0: unknown,
  locales?: Intl.LocalesArgument,
) => string;
declare const StringPrototypeAnchor: (args_0: unknown, name: string) => string;
declare const StringPrototypeBig: (args_0: unknown) => string;
declare const StringPrototypeBlink: (args_0: unknown) => string;
declare const StringPrototypeBold: (args_0: unknown) => string;
declare const StringPrototypeFixed: (args_0: unknown) => string;
declare const StringPrototypeFontcolor: (
  args_0: unknown,
  color: string,
) => string;
declare const StringPrototypeFontsize: (
  ...args: [unknown, size: string] | [unknown, size: number]
) => string;
declare const StringPrototypeItalics: (args_0: unknown) => string;
declare const StringPrototypeLink: (args_0: unknown, url: string) => string;
declare const StringPrototypeSmall: (args_0: unknown) => string;
declare const StringPrototypeStrike: (args_0: unknown) => string;
declare const StringPrototypeSub: (args_0: unknown) => string;
declare const StringPrototypeSup: (args_0: unknown) => string;
declare const StringPrototypeNormalize: (
  args_0: unknown,
  form?: string | undefined,
) => string;
declare const StringPrototypeSymbolIterator: (
  args_0: unknown,
) => StringIterator<string>;
declare const $SyntaxError: SyntaxErrorConstructor;
declare const SyntaxErrorPrototype: SyntaxError;
declare const SyntaxErrorPrototypeName: string;
declare const SyntaxErrorPrototypeMessage: string;
declare const $TypeError: TypeErrorConstructor;
declare const TypeErrorPrototype: TypeError;
declare const TypeErrorPrototypeName: string;
declare const TypeErrorPrototypeMessage: string;
declare const $URIError: URIErrorConstructor;
declare const URIErrorPrototype: URIError;
declare const URIErrorPrototypeName: string;
declare const URIErrorPrototypeMessage: string;
declare const $Uint16Array: Uint16ArrayConstructor;
declare const Uint16ArrayPrototype: Uint16Array<ArrayBufferLike>;
declare const Uint16ArrayBYTES_PER_ELEMENT: number;
declare const Uint16ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Uint32Array: Uint32ArrayConstructor;
declare const Uint32ArrayPrototype: Uint32Array<ArrayBufferLike>;
declare const Uint32ArrayBYTES_PER_ELEMENT: number;
declare const Uint32ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Uint8Array: Uint8ArrayConstructor;
declare const Uint8ArrayPrototype: Uint8Array<ArrayBufferLike>;
declare const Uint8ArrayBYTES_PER_ELEMENT: number;
declare const Uint8ArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $Uint8ClampedArray: Uint8ClampedArrayConstructor;
declare const Uint8ClampedArrayPrototype: Uint8ClampedArray<ArrayBufferLike>;
declare const Uint8ClampedArrayBYTES_PER_ELEMENT: number;
declare const Uint8ClampedArrayPrototypeBYTES_PER_ELEMENT: number;
declare const $WeakMap: WeakMapConstructor;
declare const WeakMapPrototype: WeakMap<WeakKey, any>;
declare const WeakMapPrototypeSet: (
  args_0: unknown,
  key: WeakKey,
  value: any,
) => WeakMap<WeakKey, any>;
declare const WeakMapPrototypeGet: (args_0: unknown, key: WeakKey) => any;
declare const WeakMapPrototypeHas: (args_0: unknown, key: WeakKey) => boolean;
declare const WeakMapPrototypeDelete: (
  args_0: unknown,
  key: WeakKey,
) => boolean;
declare const WeakMapPrototypeSymbolToStringTag: string;
declare const $WeakSet: WeakSetConstructor;
declare const WeakSetPrototype: WeakSet<WeakKey>;
declare const WeakSetPrototypeAdd: (
  args_0: unknown,
  value: WeakKey,
) => WeakSet<WeakKey>;
declare const WeakSetPrototypeHas: (args_0: unknown, value: WeakKey) => boolean;
declare const WeakSetPrototypeDelete: (
  args_0: unknown,
  value: WeakKey,
) => boolean;
declare const WeakSetPrototypeSymbolToStringTag: string;
declare const $Promise: PromiseConstructor;
declare const PromiseResolve: {
  (): Promise<void>;
  <T>(value: T): Promise<Awaited<T>>;
  <T>(value: T | PromiseLike<T>): Promise<Awaited<T>>;
};
declare const PromiseReject: <T = never>(reason?: any) => Promise<T>;
declare const PromiseAll: {
  <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;
  <T extends readonly unknown[] | []>(
    values: T,
  ): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>;
};
declare const PromiseAllSettled: {
  <T extends readonly unknown[] | []>(
    values: T,
  ): Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }>;
  <T>(
    values: Iterable<T | PromiseLike<T>>,
  ): Promise<PromiseSettledResult<Awaited<T>>[]>;
};
declare const PromiseAny: {
  <T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
  <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
};
declare const PromiseRace: {
  <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
  <T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
};
declare const PromiseWithResolvers: <T>() => PromiseWithResolvers<T>;
declare const PromisePrototype: Promise<any>;
declare const PromiseGetSymbolSpecies: (args_0: unknown) => PromiseConstructor;
declare const PromisePrototypeThen: (
  args_0: unknown,
  onfulfilled?: ((value: any) => unknown) | null | undefined,
  onrejected?: ((reason: any) => unknown) | null | undefined,
) => Promise<unknown>;
declare const PromisePrototypeSymbolToStringTag: string;
export {
  $AggregateError as AggregateError,
  $Array as Array,
  $ArrayBuffer as ArrayBuffer,
  $BigInt as BigInt,
  $BigInt64Array as BigInt64Array,
  $BigUint64Array as BigUint64Array,
  $Boolean as Boolean,
  $DataView as DataView,
  $Date as Date,
  $decodeURI as decodeURI,
  $decodeURIComponent as decodeURIComponent,
  $encodeURI as encodeURI,
  $encodeURIComponent as encodeURIComponent,
  $Error as Error,
  $EvalError as EvalError,
  $Float32Array as Float32Array,
  $Float64Array as Float64Array,
  $Function as Function,
  $globalThis as globalThis,
  $Int16Array as Int16Array,
  $Int32Array as Int32Array,
  $Int8Array as Int8Array,
  $isNaN as isNaN,
  type $Iterator as Iterator,
  $JSON as JSON,
  $Map as Map,
  $Math as Math,
  $Number as Number,
  $Object as Object,
  $Promise as Promise,
  $Proxy as Proxy,
  $RangeError as RangeError,
  $ReferenceError as ReferenceError,
  $Reflect as Reflect,
  $RegExp as RegExp,
  $Set as Set,
  $SharedArrayBuffer as SharedArrayBuffer,
  $String as String,
  $Symbol as Symbol,
  $SyntaxError as SyntaxError,
  $TypeError as TypeError,
  $Uint16Array as Uint16Array,
  $Uint32Array as Uint32Array,
  $Uint8Array as Uint8Array,
  $Uint8ClampedArray as Uint8ClampedArray,
  $URIError as URIError,
  $WeakMap as WeakMap,
  $WeakSet as WeakSet,
  AggregateErrorPrototype,
  AggregateErrorPrototypeMessage,
  AggregateErrorPrototypeName,
  ArrayBufferGetSymbolSpecies,
  ArrayBufferIsView,
  ArrayBufferPrototype,
  ArrayBufferPrototypeGetByteLength,
  ArrayBufferPrototypeSlice,
  ArrayBufferPrototypeSymbolToStringTag,
  ArrayFrom,
  ArrayGetSymbolSpecies,
  ArrayIsArray,
  ArrayOf,
  ArrayPrototype,
  ArrayPrototypeAt,
  ArrayPrototypeConcat,
  ArrayPrototypeCopyWithin,
  ArrayPrototypeEntries,
  ArrayPrototypeEvery,
  ArrayPrototypeFill,
  ArrayPrototypeFilter,
  ArrayPrototypeFind,
  ArrayPrototypeFindIndex,
  ArrayPrototypeFindLast,
  ArrayPrototypeFindLastIndex,
  ArrayPrototypeFlat,
  ArrayPrototypeFlatMap,
  ArrayPrototypeForEach,
  ArrayPrototypeIncludes,
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypeKeys,
  ArrayPrototypeLastIndexOf,
  ArrayPrototypeLength,
  ArrayPrototypePop,
  ArrayPrototypePush,
  ArrayPrototypePushApply,
  ArrayPrototypeReduce,
  ArrayPrototypeReduceRight,
  ArrayPrototypeReverse,
  ArrayPrototypeShift,
  ArrayPrototypeSlice,
  ArrayPrototypeSome,
  ArrayPrototypeSort,
  ArrayPrototypeSplice,
  ArrayPrototypeSymbolIterator,
  ArrayPrototypeSymbolUnscopables,
  ArrayPrototypeToLocaleString,
  ArrayPrototypeToReversed,
  ArrayPrototypeToSorted,
  ArrayPrototypeToSpliced,
  ArrayPrototypeToString,
  ArrayPrototypeUnshift,
  ArrayPrototypeUnshiftApply,
  ArrayPrototypeValues,
  ArrayPrototypeWith,
  BigInt64ArrayBYTES_PER_ELEMENT,
  BigInt64ArrayPrototype,
  BigInt64ArrayPrototypeBYTES_PER_ELEMENT,
  BigIntAsIntN,
  BigIntAsUintN,
  BigIntPrototype,
  BigIntPrototypeSymbolToStringTag,
  BigIntPrototypeToString,
  BigIntPrototypeValueOf,
  BigUint64ArrayBYTES_PER_ELEMENT,
  BigUint64ArrayPrototype,
  BigUint64ArrayPrototypeBYTES_PER_ELEMENT,
  BooleanPrototype,
  BooleanPrototypeToString,
  BooleanPrototypeValueOf,
  DataViewPrototype,
  DataViewPrototypeGetBigInt64,
  DataViewPrototypeGetBigUint64,
  DataViewPrototypeGetBuffer,
  DataViewPrototypeGetByteLength,
  DataViewPrototypeGetByteOffset,
  DataViewPrototypeGetFloat32,
  DataViewPrototypeGetFloat64,
  DataViewPrototypeGetInt16,
  DataViewPrototypeGetInt32,
  DataViewPrototypeGetInt8,
  DataViewPrototypeGetUint16,
  DataViewPrototypeGetUint32,
  DataViewPrototypeGetUint8,
  DataViewPrototypeSetBigInt64,
  DataViewPrototypeSetBigUint64,
  DataViewPrototypeSetFloat32,
  DataViewPrototypeSetFloat64,
  DataViewPrototypeSetInt16,
  DataViewPrototypeSetInt32,
  DataViewPrototypeSetInt8,
  DataViewPrototypeSetUint16,
  DataViewPrototypeSetUint32,
  DataViewPrototypeSetUint8,
  DataViewPrototypeSymbolToStringTag,
  DateNow,
  DateParse,
  DatePrototype,
  DatePrototypeGetDate,
  DatePrototypeGetDay,
  DatePrototypeGetFullYear,
  DatePrototypeGetHours,
  DatePrototypeGetMilliseconds,
  DatePrototypeGetMinutes,
  DatePrototypeGetMonth,
  DatePrototypeGetSeconds,
  DatePrototypeGetTime,
  DatePrototypeGetTimezoneOffset,
  DatePrototypeGetUTCDate,
  DatePrototypeGetUTCDay,
  DatePrototypeGetUTCFullYear,
  DatePrototypeGetUTCHours,
  DatePrototypeGetUTCMilliseconds,
  DatePrototypeGetUTCMinutes,
  DatePrototypeGetUTCMonth,
  DatePrototypeGetUTCSeconds,
  DatePrototypeSetDate,
  DatePrototypeSetFullYear,
  DatePrototypeSetHours,
  DatePrototypeSetMilliseconds,
  DatePrototypeSetMinutes,
  DatePrototypeSetMonth,
  DatePrototypeSetSeconds,
  DatePrototypeSetTime,
  DatePrototypeSetUTCDate,
  DatePrototypeSetUTCFullYear,
  DatePrototypeSetUTCHours,
  DatePrototypeSetUTCMilliseconds,
  DatePrototypeSetUTCMinutes,
  DatePrototypeSetUTCMonth,
  DatePrototypeSetUTCSeconds,
  DatePrototypeSymbolToPrimitive,
  DatePrototypeToDateString,
  DatePrototypeToISOString,
  DatePrototypeToJSON,
  DatePrototypeToLocaleDateString,
  DatePrototypeToLocaleString,
  DatePrototypeToLocaleTimeString,
  DatePrototypeToString,
  DatePrototypeToTimeString,
  DatePrototypeToUTCString,
  DatePrototypeValueOf,
  DateUTC,
  ErrorPrototype,
  ErrorPrototypeMessage,
  ErrorPrototypeName,
  ErrorPrototypeToString,
  EvalErrorPrototype,
  EvalErrorPrototypeMessage,
  EvalErrorPrototypeName,
  Float32ArrayBYTES_PER_ELEMENT,
  Float32ArrayPrototype,
  Float32ArrayPrototypeBYTES_PER_ELEMENT,
  Float64ArrayBYTES_PER_ELEMENT,
  Float64ArrayPrototype,
  Float64ArrayPrototypeBYTES_PER_ELEMENT,
  FunctionPrototype,
  FunctionPrototypeApply,
  FunctionPrototypeBind,
  FunctionPrototypeCall,
  FunctionPrototypeGetArguments,
  FunctionPrototypeGetCaller,
  FunctionPrototypeSetArguments,
  FunctionPrototypeSetCaller,
  FunctionPrototypeSymbolHasInstance,
  FunctionPrototypeToString,
  Int16ArrayBYTES_PER_ELEMENT,
  Int16ArrayPrototype,
  Int16ArrayPrototypeBYTES_PER_ELEMENT,
  Int32ArrayBYTES_PER_ELEMENT,
  Int32ArrayPrototype,
  Int32ArrayPrototypeBYTES_PER_ELEMENT,
  Int8ArrayBYTES_PER_ELEMENT,
  Int8ArrayPrototype,
  Int8ArrayPrototypeBYTES_PER_ELEMENT,
  JSONParse,
  JSONStringify,
  JSONSymbolToStringTag,
  MapGetSymbolSpecies,
  MapGroupBy,
  MapPrototype,
  MapPrototypeClear,
  MapPrototypeDelete,
  MapPrototypeEntries,
  MapPrototypeForEach,
  MapPrototypeGet,
  MapPrototypeGetSize,
  MapPrototypeHas,
  MapPrototypeKeys,
  MapPrototypeSet,
  MapPrototypeSymbolIterator,
  MapPrototypeSymbolToStringTag,
  MapPrototypeValues,
  MathAbs,
  MathAcos,
  MathAcosh,
  MathAsin,
  MathAsinh,
  MathAtan,
  MathAtan2,
  MathAtanh,
  MathCbrt,
  MathCeil,
  MathClz32,
  MathCos,
  MathCosh,
  MathE,
  MathExp,
  MathExpm1,
  MathFloor,
  MathFround,
  MathHypot,
  MathImul,
  MathLN10,
  MathLN2,
  MathLog,
  MathLog10,
  MathLOG10E,
  MathLog1p,
  MathLog2,
  MathLOG2E,
  MathMax,
  MathMin,
  MathPI,
  MathPow,
  MathRandom,
  MathRound,
  MathSign,
  MathSin,
  MathSinh,
  MathSqrt,
  MathSQRT1_2,
  MathSQRT2,
  MathSymbolToStringTag,
  MathTan,
  MathTanh,
  MathTrunc,
  NumberEPSILON,
  NumberIsFinite,
  NumberIsInteger,
  NumberIsNaN,
  NumberIsSafeInteger,
  NumberMAX_SAFE_INTEGER,
  NumberMAX_VALUE,
  NumberMIN_SAFE_INTEGER,
  NumberMIN_VALUE,
  NumberNaN,
  NumberNEGATIVE_INFINITY,
  NumberParseFloat,
  NumberParseInt,
  NumberPOSITIVE_INFINITY,
  NumberPrototype,
  NumberPrototypeToExponential,
  NumberPrototypeToFixed,
  NumberPrototypeToLocaleString,
  NumberPrototypeToPrecision,
  NumberPrototypeToString,
  NumberPrototypeValueOf,
  ObjectAssign,
  ObjectCreate,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectEntries,
  ObjectFreeze,
  ObjectFromEntries,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetOwnPropertyDescriptors,
  ObjectGetOwnPropertyNames,
  ObjectGetOwnPropertySymbols,
  ObjectGetPrototypeOf,
  ObjectGroupBy,
  ObjectHasOwn,
  ObjectIs,
  ObjectIsExtensible,
  ObjectIsFrozen,
  ObjectIsSealed,
  ObjectKeys,
  ObjectPreventExtensions,
  ObjectPrototype,
  ObjectPrototypeHasOwnProperty,
  ObjectPrototypeIsPrototypeOf,
  ObjectPrototypePropertyIsEnumerable,
  ObjectPrototypeToLocaleString,
  ObjectPrototypeToString,
  ObjectPrototypeValueOf,
  ObjectSeal,
  ObjectSetPrototypeOf,
  ObjectValues,
  PromiseAll,
  PromiseAllSettled,
  PromiseAny,
  PromiseGetSymbolSpecies,
  PromisePrototype,
  PromisePrototypeSymbolToStringTag,
  PromisePrototypeThen,
  PromiseRace,
  PromiseReject,
  PromiseResolve,
  PromiseWithResolvers,
  ProxyRevocable,
  RangeErrorPrototype,
  RangeErrorPrototypeMessage,
  RangeErrorPrototypeName,
  ReferenceErrorPrototype,
  ReferenceErrorPrototypeMessage,
  ReferenceErrorPrototypeName,
  ReflectApply,
  ReflectConstruct,
  ReflectDefineProperty,
  ReflectDeleteProperty,
  ReflectGet,
  ReflectGetOwnPropertyDescriptor,
  ReflectGetPrototypeOf,
  ReflectHas,
  ReflectIsExtensible,
  ReflectOwnKeys,
  ReflectPreventExtensions,
  ReflectSet,
  ReflectSetPrototypeOf,
  ReflectSymbolToStringTag,
  RegExpGetSymbolSpecies,
  RegExpPrototype,
  RegExpPrototypeCompile,
  RegExpPrototypeExec,
  RegExpPrototypeGetDotAll,
  RegExpPrototypeGetFlags,
  RegExpPrototypeGetGlobal,
  RegExpPrototypeGetHasIndices,
  RegExpPrototypeGetIgnoreCase,
  RegExpPrototypeGetMultiline,
  RegExpPrototypeGetSource,
  RegExpPrototypeGetSticky,
  RegExpPrototypeGetUnicode,
  RegExpPrototypeSymbolMatch,
  RegExpPrototypeSymbolMatchAll,
  RegExpPrototypeSymbolReplace,
  RegExpPrototypeSymbolSearch,
  RegExpPrototypeSymbolSplit,
  RegExpPrototypeTest,
  RegExpPrototypeToString,
  SetGetSymbolSpecies,
  SetPrototype,
  SetPrototypeAdd,
  SetPrototypeClear,
  SetPrototypeDelete,
  SetPrototypeEntries,
  SetPrototypeForEach,
  SetPrototypeGetSize,
  SetPrototypeHas,
  SetPrototypeKeys,
  SetPrototypeSymbolIterator,
  SetPrototypeSymbolToStringTag,
  SetPrototypeValues,
  SharedArrayBufferGetSymbolSpecies,
  SharedArrayBufferPrototype,
  SharedArrayBufferPrototypeGetByteLength,
  SharedArrayBufferPrototypeSlice,
  SharedArrayBufferPrototypeSymbolToStringTag,
  StringFromCharCode,
  StringFromCodePoint,
  StringPrototype,
  StringPrototypeAnchor,
  StringPrototypeAt,
  StringPrototypeBig,
  StringPrototypeBlink,
  StringPrototypeBold,
  StringPrototypeCharAt,
  StringPrototypeCharCodeAt,
  StringPrototypeCodePointAt,
  StringPrototypeConcat,
  StringPrototypeConcatApply,
  StringPrototypeEndsWith,
  StringPrototypeFixed,
  StringPrototypeFontcolor,
  StringPrototypeFontsize,
  StringPrototypeIncludes,
  StringPrototypeIndexOf,
  StringPrototypeIsWellFormed,
  StringPrototypeItalics,
  StringPrototypeLastIndexOf,
  StringPrototypeLength,
  StringPrototypeLink,
  StringPrototypeLocaleCompare,
  StringPrototypeMatch,
  StringPrototypeMatchAll,
  StringPrototypeNormalize,
  StringPrototypePadEnd,
  StringPrototypePadStart,
  StringPrototypeRepeat,
  StringPrototypeReplace,
  StringPrototypeReplaceAll,
  StringPrototypeSearch,
  StringPrototypeSlice,
  StringPrototypeSmall,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
  StringPrototypeStrike,
  StringPrototypeSub,
  StringPrototypeSubstr,
  StringPrototypeSubstring,
  StringPrototypeSup,
  StringPrototypeSymbolIterator,
  StringPrototypeToLocaleLowerCase,
  StringPrototypeToLocaleUpperCase,
  StringPrototypeToLowerCase,
  StringPrototypeToString,
  StringPrototypeToUpperCase,
  StringPrototypeToWellFormed,
  StringPrototypeTrim,
  StringPrototypeTrimEnd,
  StringPrototypeTrimLeft,
  StringPrototypeTrimRight,
  StringPrototypeTrimStart,
  StringPrototypeValueOf,
  StringRaw,
  SymbolAsyncIterator,
  SymbolFor,
  SymbolHasInstance,
  SymbolIsConcatSpreadable,
  SymbolIterator,
  SymbolKeyFor,
  SymbolMatch,
  SymbolMatchAll,
  SymbolPrototype,
  SymbolPrototypeGetDescription,
  SymbolPrototypeSymbolToPrimitive,
  SymbolPrototypeSymbolToStringTag,
  SymbolPrototypeToString,
  SymbolPrototypeValueOf,
  SymbolReplace,
  SymbolSearch,
  SymbolSpecies,
  SymbolSplit,
  SymbolToPrimitive,
  SymbolToStringTag,
  SymbolUnscopables,
  SyntaxErrorPrototype,
  SyntaxErrorPrototypeMessage,
  SyntaxErrorPrototypeName,
  TypeErrorPrototype,
  TypeErrorPrototypeMessage,
  TypeErrorPrototypeName,
  Uint16ArrayBYTES_PER_ELEMENT,
  Uint16ArrayPrototype,
  Uint16ArrayPrototypeBYTES_PER_ELEMENT,
  Uint32ArrayBYTES_PER_ELEMENT,
  Uint32ArrayPrototype,
  Uint32ArrayPrototypeBYTES_PER_ELEMENT,
  Uint8ArrayBYTES_PER_ELEMENT,
  Uint8ArrayPrototype,
  Uint8ArrayPrototypeBYTES_PER_ELEMENT,
  Uint8ClampedArrayBYTES_PER_ELEMENT,
  Uint8ClampedArrayPrototype,
  Uint8ClampedArrayPrototypeBYTES_PER_ELEMENT,
  uncurryThis,
  URIErrorPrototype,
  URIErrorPrototypeMessage,
  URIErrorPrototypeName,
  WeakMapPrototype,
  WeakMapPrototypeDelete,
  WeakMapPrototypeGet,
  WeakMapPrototypeHas,
  WeakMapPrototypeSet,
  WeakMapPrototypeSymbolToStringTag,
  WeakSetPrototype,
  WeakSetPrototypeAdd,
  WeakSetPrototypeDelete,
  WeakSetPrototypeHas,
  WeakSetPrototypeSymbolToStringTag,
};
