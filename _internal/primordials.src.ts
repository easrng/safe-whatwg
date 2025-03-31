// deno-lint-ignore-file prefer-primordials
// @ts-nocheck big file lol
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
  // This would be the first part to change if you want to change the return type.
  Signatures extends [
    unknown,
    readonly unknown[],
    readonly unknown[],
    unknown,
  ][] = [],
> = Shape extends T ? Signatures
  : T extends AddSignature<Shape, infer Params, infer Return, infer This>
    ? _UncurryThis<
      T,
      AddSignature<Shape, Params, Return, This>,
      [[This, Params, [This, ...Params], Return], ...Signatures]
    >
  : Signatures;
const { apply, bind, call } = /* @__PURE__ */ (() => Function.prototype)();
const uncurryThis = bind.bind(call) as <
  // deno-lint-ignore no-explicit-any
  T extends (this: any, ...args: any[]) => unknown,
>(
  fn: T,
  // deno-lint-ignore no-explicit-any
) => false extends (any extends T ? true : false)
  ? (...args: _UncurryThis<T>[number][2]) => _UncurryThis<T>[number][3]
  // deno-lint-ignore no-explicit-any
  : (...args: any[]) => any;
const applyBind = bind.bind(apply) as <
  // deno-lint-ignore no-explicit-any
  T extends (this: any, ...args: any[]) => unknown,
>(
  fn: T,
  // deno-lint-ignore no-explicit-any
) => false extends (any extends T ? true : false) ? (
    self: _UncurryThis<T>[number][0],
    args: _UncurryThis<T>[number][1],
  ) => _UncurryThis<T>[number][3]
  // deno-lint-ignore no-explicit-any
  : (self: any, args: any[]) => any;

declare global {
  abstract class Reflect {
    static [Symbol.toStringTag]: "Reflect";
  }
}

/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-syntax */
type $Iterator<T, TReturn = unknown, TNext = undefined> = Iterator<
  T,
  TReturn,
  TNext
>;
type $Array<T> = Array<T>;
type $Uint8Array = Uint8Array;
// type $FinalizationRegistry<T> = FinalizationRegistry<T>;
type $Map<K, V> = Map<K, V>;
type $Set<T> = Set<T>;
type $WeakMap<K extends WeakKey, V> = WeakMap<K, V>;
// type $WeakRef<T extends WeakKey> = WeakRef<T>;
type $WeakSet<T extends WeakKey> = WeakSet<T>;
type $Promise<T> = Promise<T>;
type $ArrayBuffer = ArrayBuffer;
const ReflectGetOwnPropertyDescriptor =
  /* @__PURE__ */ (() => Reflect.getOwnPropertyDescriptor)();
// deno-lint-ignore ban-types
type $Symbol = Symbol;
// deno-lint-ignore ban-types
type $BigInt = BigInt;

const $Symbol = /* @__PURE__ */ (() => Symbol)();
const SymbolPrototype = /* @__PURE__ */ (() => $Symbol.prototype)();
const SymbolFor = /* @__PURE__ */ (() => $Symbol.for)();
const SymbolKeyFor = /* @__PURE__ */ (() => $Symbol.keyFor)();
const SymbolToPrimitive: typeof Symbol.toPrimitive =
  /* @__PURE__ */ (() => $Symbol.toPrimitive)();
const SymbolIterator: typeof Symbol.iterator =
  /* @__PURE__ */ (() => $Symbol.iterator)();
const SymbolMatch: typeof Symbol.match =
  /* @__PURE__ */ (() => $Symbol.match)();
const SymbolMatchAll: typeof Symbol.matchAll =
  /* @__PURE__ */ (() => $Symbol.matchAll)();
const SymbolReplace: typeof Symbol.replace =
  /* @__PURE__ */ (() => $Symbol.replace)();
const SymbolSearch: typeof Symbol.search =
  /* @__PURE__ */ (() => $Symbol.search)();
const SymbolSplit: typeof Symbol.split =
  /* @__PURE__ */ (() => $Symbol.split)();
const SymbolToStringTag: typeof Symbol.toStringTag =
  /* @__PURE__ */ (() => $Symbol.toStringTag)();
const SymbolIsConcatSpreadable: typeof Symbol.isConcatSpreadable =
  /* @__PURE__ */ (() => $Symbol.isConcatSpreadable)();
const SymbolHasInstance: typeof Symbol.hasInstance =
  /* @__PURE__ */ (() => $Symbol.hasInstance)();
const SymbolSpecies: typeof Symbol.species =
  /* @__PURE__ */ (() => $Symbol.species)();
const SymbolUnscopables: typeof Symbol.unscopables =
  /* @__PURE__ */ (() => $Symbol.unscopables)();
const SymbolAsyncIterator: typeof Symbol.asyncIterator =
  /* @__PURE__ */ (() => $Symbol.asyncIterator)();
const SymbolPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(SymbolPrototype.toString))();
const SymbolPrototypeValueOf =
  /* @__PURE__ */ (() => uncurryThis(SymbolPrototype.valueOf))();
const SymbolPrototypeDescriptionDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(SymbolPrototype, "description")!)();
const SymbolPrototypeGetDescription =
  /* @__PURE__ */ (() =>
    uncurryThis(SymbolPrototypeDescriptionDescriptor.get!))();
const SymbolPrototypeSymbolToPrimitive =
  /* @__PURE__ */ (() => uncurryThis(SymbolPrototype[SymbolToPrimitive]))();
const SymbolPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => SymbolPrototype[SymbolToStringTag])();
const $globalThis = /* @__PURE__ */ (() => globalThis)();
const $isNaN = /* @__PURE__ */ (() => isNaN)();
const $decodeURI = /* @__PURE__ */ (() => decodeURI)();
const $decodeURIComponent = /* @__PURE__ */ (() => decodeURIComponent)();
const $encodeURI = /* @__PURE__ */ (() => encodeURI)();
const $encodeURIComponent = /* @__PURE__ */ (() => encodeURIComponent)();
const $JSON = /* @__PURE__ */ (() => JSON)();
const JSONParse = /* @__PURE__ */ (() => $JSON.parse)();
const JSONStringify = /* @__PURE__ */ (() => $JSON.stringify)();
const JSONSymbolToStringTag =
  /* @__PURE__ */ (() => $JSON[SymbolToStringTag])();
const $Math = /* @__PURE__ */ (() => Math)();
const MathMin = /* @__PURE__ */ (() => $Math.min)();
const MathMax = /* @__PURE__ */ (() => $Math.max)();
const MathAbs = /* @__PURE__ */ (() => $Math.abs)();
const MathFloor = /* @__PURE__ */ (() => $Math.floor)();
const MathCeil = /* @__PURE__ */ (() => $Math.ceil)();
const MathRound = /* @__PURE__ */ (() => $Math.round)();
const MathSqrt = /* @__PURE__ */ (() => $Math.sqrt)();
const MathAcos = /* @__PURE__ */ (() => $Math.acos)();
const MathAsin = /* @__PURE__ */ (() => $Math.asin)();
const MathAtan = /* @__PURE__ */ (() => $Math.atan)();
const MathAtan2 = /* @__PURE__ */ (() => $Math.atan2)();
const MathCos = /* @__PURE__ */ (() => $Math.cos)();
const MathExp = /* @__PURE__ */ (() => $Math.exp)();
const MathLog = /* @__PURE__ */ (() => $Math.log)();
const MathPow = /* @__PURE__ */ (() => $Math.pow)();
const MathSin = /* @__PURE__ */ (() => $Math.sin)();
const MathTan = /* @__PURE__ */ (() => $Math.tan)();
const MathTrunc = /* @__PURE__ */ (() => $Math.trunc)();
const MathSign = /* @__PURE__ */ (() => $Math.sign)();
const MathCosh = /* @__PURE__ */ (() => $Math.cosh)();
const MathSinh = /* @__PURE__ */ (() => $Math.sinh)();
const MathTanh = /* @__PURE__ */ (() => $Math.tanh)();
const MathAcosh = /* @__PURE__ */ (() => $Math.acosh)();
const MathAsinh = /* @__PURE__ */ (() => $Math.asinh)();
const MathAtanh = /* @__PURE__ */ (() => $Math.atanh)();
const MathExpm1 = /* @__PURE__ */ (() => $Math.expm1)();
const MathLog1p = /* @__PURE__ */ (() => $Math.log1p)();
const MathLog2 = /* @__PURE__ */ (() => $Math.log2)();
const MathLog10 = /* @__PURE__ */ (() => $Math.log10)();
const MathCbrt = /* @__PURE__ */ (() => $Math.cbrt)();
const MathHypot = /* @__PURE__ */ (() => $Math.hypot)();
const MathRandom = /* @__PURE__ */ (() => $Math.random)();
const MathFround = /* @__PURE__ */ (() => $Math.fround)();
const MathImul = /* @__PURE__ */ (() => $Math.imul)();
const MathClz32 = /* @__PURE__ */ (() => $Math.clz32)();
const MathE = /* @__PURE__ */ (() => $Math.E)();
const MathLN10 = /* @__PURE__ */ (() => $Math.LN10)();
const MathLN2 = /* @__PURE__ */ (() => $Math.LN2)();
const MathLOG2E = /* @__PURE__ */ (() => $Math.LOG2E)();
const MathLOG10E = /* @__PURE__ */ (() => $Math.LOG10E)();
const MathPI = /* @__PURE__ */ (() => $Math.PI)();
const MathSQRT1_2 = /* @__PURE__ */ (() => $Math.SQRT1_2)();
const MathSQRT2 = /* @__PURE__ */ (() => $Math.SQRT2)();
const MathSymbolToStringTag =
  /* @__PURE__ */ (() => $Math[SymbolToStringTag])();
const $Proxy = /* @__PURE__ */ (() => Proxy)();
const ProxyRevocable = /* @__PURE__ */ (() => $Proxy.revocable)();
const $Reflect = /* @__PURE__ */ (() => Reflect)();
const ReflectApply = /* @__PURE__ */ (() => $Reflect.apply)();
const ReflectConstruct = /* @__PURE__ */ (() => $Reflect.construct)();
const ReflectDefineProperty = /* @__PURE__ */ (() => $Reflect.defineProperty)();
const ReflectDeleteProperty = /* @__PURE__ */ (() => $Reflect.deleteProperty)();
const ReflectGet = /* @__PURE__ */ (() => $Reflect.get)();
const ReflectGetPrototypeOf = /* @__PURE__ */ (() => $Reflect.getPrototypeOf)();
const ReflectHas = /* @__PURE__ */ (() => $Reflect.has)();
const ReflectIsExtensible = /* @__PURE__ */ (() => $Reflect.isExtensible)();
const ReflectOwnKeys = /* @__PURE__ */ (() => $Reflect.ownKeys)();
const ReflectPreventExtensions =
  /* @__PURE__ */ (() => $Reflect.preventExtensions)();
const ReflectSet = /* @__PURE__ */ (() => $Reflect.set)();
const ReflectSetPrototypeOf = /* @__PURE__ */ (() => $Reflect.setPrototypeOf)();
const ReflectSymbolToStringTag =
  /* @__PURE__ */ (() => $Reflect[SymbolToStringTag])();
const $AggregateError = /* @__PURE__ */ (() => AggregateError)();
const AggregateErrorPrototype =
  /* @__PURE__ */ (() => $AggregateError.prototype)();
const AggregateErrorPrototypeName =
  /* @__PURE__ */ (() => AggregateErrorPrototype.name)();
const AggregateErrorPrototypeMessage =
  /* @__PURE__ */ (() => AggregateErrorPrototype.message)();
const $Array = /* @__PURE__ */ (() => Array)();
const ArrayPrototype = /* @__PURE__ */ (() => $Array.prototype)();
const ArrayIsArray = /* @__PURE__ */ (() => $Array.isArray)();
const ArrayFrom = /* @__PURE__ */ (() => $Array.from)();
const ArrayOf = /* @__PURE__ */ (() => $Array.of)();
const ArraySymbolSpeciesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor($Array, SymbolSpecies)!)();
const ArrayGetSymbolSpecies =
  /* @__PURE__ */ (() => uncurryThis(ArraySymbolSpeciesDescriptor.get!))();
const ArrayPrototypeLength = /* @__PURE__ */ (() => ArrayPrototype.length)();
const ArrayPrototypeAt =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.at))();
const ArrayPrototypeWith =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.with))();
const ArrayPrototypeConcat =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.concat))();
const ArrayPrototypeEvery =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.every))();
const ArrayPrototypeSome =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.some))();
const ArrayPrototypeForEach =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.forEach))();
const ArrayPrototypeFilter =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.filter))();
const ArrayPrototypeReduce =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.reduce))();
const ArrayPrototypeReduceRight =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.reduceRight))();
const ArrayPrototypeFill =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.fill))();
const ArrayPrototypeFind =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.find))();
const ArrayPrototypeFindIndex =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.findIndex))();
const ArrayPrototypeFindLast =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.findLast))();
const ArrayPrototypeFindLastIndex =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.findLastIndex))();
const ArrayPrototypeIndexOf =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.indexOf))();
const ArrayPrototypeLastIndexOf =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.lastIndexOf))();
const ArrayPrototypeIncludes =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.includes))();
const ArrayPrototypeJoin =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.join))();
const ArrayPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.toString))();
const ArrayPrototypeToLocaleString =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.toLocaleString))();
const ArrayPrototypePop =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.pop))();
const ArrayPrototypePush =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.push))();
const ArrayPrototypePushApply =
  /* @__PURE__ */ (() => applyBind(ArrayPrototype.push))();
const ArrayPrototypeShift =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.shift))();
const ArrayPrototypeUnshift =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.unshift))();
const ArrayPrototypeUnshiftApply =
  /* @__PURE__ */ (() => applyBind(ArrayPrototype.unshift))();
const ArrayPrototypeReverse =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.reverse))();
const ArrayPrototypeToReversed =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.toReversed))();
const ArrayPrototypeSort =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.sort))();
const ArrayPrototypeToSorted =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.toSorted))();
const ArrayPrototypeSlice =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.slice))();
const ArrayPrototypeSplice =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.splice))();
const ArrayPrototypeToSpliced =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.toSpliced))();
const ArrayPrototypeCopyWithin =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.copyWithin))();
const ArrayPrototypeFlatMap =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.flatMap))();
const ArrayPrototypeFlat =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.flat))();
const ArrayPrototypeValues =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.values))();
const ArrayPrototypeKeys =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.keys))();
const ArrayPrototypeEntries =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype.entries))();
const ArrayPrototypeSymbolIterator =
  /* @__PURE__ */ (() => uncurryThis(ArrayPrototype[SymbolIterator]))();
const ArrayPrototypeSymbolUnscopables =
  /* @__PURE__ */ (() => ArrayPrototype[SymbolUnscopables])();
const $ArrayBuffer = /* @__PURE__ */ (() => ArrayBuffer)();
const ArrayBufferPrototype = /* @__PURE__ */ (() => $ArrayBuffer.prototype)();
const ArrayBufferIsView = /* @__PURE__ */ (() => $ArrayBuffer.isView)();
const ArrayBufferSymbolSpeciesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor($ArrayBuffer, SymbolSpecies)!)();
const ArrayBufferGetSymbolSpecies =
  /* @__PURE__ */ (() =>
    uncurryThis(ArrayBufferSymbolSpeciesDescriptor.get!))();
const ArrayBufferPrototypeByteLengthDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(ArrayBufferPrototype, "byteLength")!)();
const ArrayBufferPrototypeGetByteLength =
  /* @__PURE__ */ (() =>
    uncurryThis(ArrayBufferPrototypeByteLengthDescriptor.get!))();
const ArrayBufferPrototypeSlice =
  /* @__PURE__ */ (() => uncurryThis(ArrayBufferPrototype.slice))();
const ArrayBufferPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => ArrayBufferPrototype[SymbolToStringTag])();
const $BigInt = /* @__PURE__ */ (() => BigInt)();
const BigIntPrototype = /* @__PURE__ */ (() => $BigInt.prototype)();
const BigIntAsUintN = /* @__PURE__ */ (() => $BigInt.asUintN)();
const BigIntAsIntN = /* @__PURE__ */ (() => $BigInt.asIntN)();
const BigIntPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(BigIntPrototype.toString))();
const BigIntPrototypeValueOf =
  /* @__PURE__ */ (() => uncurryThis(BigIntPrototype.valueOf))();
const BigIntPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => BigIntPrototype[SymbolToStringTag])();
const $BigInt64Array = /* @__PURE__ */ (() => BigInt64Array)();
const BigInt64ArrayPrototype =
  /* @__PURE__ */ (() => $BigInt64Array.prototype)();
const BigInt64ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $BigInt64Array.BYTES_PER_ELEMENT)();
const BigInt64ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => BigInt64ArrayPrototype.BYTES_PER_ELEMENT)();
const $BigUint64Array = /* @__PURE__ */ (() => BigUint64Array)();
const BigUint64ArrayPrototype =
  /* @__PURE__ */ (() => $BigUint64Array.prototype)();
const BigUint64ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $BigUint64Array.BYTES_PER_ELEMENT)();
const BigUint64ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => BigUint64ArrayPrototype.BYTES_PER_ELEMENT)();
const $Boolean = /* @__PURE__ */ (() => Boolean)();
const BooleanPrototype = /* @__PURE__ */ (() => $Boolean.prototype)();
const BooleanPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(BooleanPrototype.toString))();
const BooleanPrototypeValueOf =
  /* @__PURE__ */ (() => uncurryThis(BooleanPrototype.valueOf))();
const $DataView = /* @__PURE__ */ (() => DataView)();
const DataViewPrototype = /* @__PURE__ */ (() => $DataView.prototype)();
const DataViewPrototypeBufferDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(DataViewPrototype, "buffer")!)();
const DataViewPrototypeGetBuffer =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototypeBufferDescriptor.get!))();
const DataViewPrototypeByteLengthDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(DataViewPrototype, "byteLength")!)();
const DataViewPrototypeGetByteLength =
  /* @__PURE__ */ (() =>
    uncurryThis(DataViewPrototypeByteLengthDescriptor.get!))();
const DataViewPrototypeByteOffsetDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(DataViewPrototype, "byteOffset")!)();
const DataViewPrototypeGetByteOffset =
  /* @__PURE__ */ (() =>
    uncurryThis(DataViewPrototypeByteOffsetDescriptor.get!))();
const DataViewPrototypeGetInt8 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getInt8))();
const DataViewPrototypeGetUint8 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getUint8))();
const DataViewPrototypeGetInt16 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getInt16))();
const DataViewPrototypeGetUint16 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getUint16))();
const DataViewPrototypeGetInt32 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getInt32))();
const DataViewPrototypeGetUint32 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getUint32))();
const DataViewPrototypeGetBigInt64 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getBigInt64))();
const DataViewPrototypeGetBigUint64 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getBigUint64))();
const DataViewPrototypeGetFloat32 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getFloat32))();
const DataViewPrototypeGetFloat64 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.getFloat64))();
const DataViewPrototypeSetInt8 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setInt8))();
const DataViewPrototypeSetUint8 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setUint8))();
const DataViewPrototypeSetInt16 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setInt16))();
const DataViewPrototypeSetUint16 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setUint16))();
const DataViewPrototypeSetInt32 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setInt32))();
const DataViewPrototypeSetUint32 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setUint32))();
const DataViewPrototypeSetBigInt64 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setBigInt64))();
const DataViewPrototypeSetBigUint64 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setBigUint64))();
const DataViewPrototypeSetFloat32 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setFloat32))();
const DataViewPrototypeSetFloat64 =
  /* @__PURE__ */ (() => uncurryThis(DataViewPrototype.setFloat64))();
const DataViewPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => DataViewPrototype[SymbolToStringTag])();
const $Date = /* @__PURE__ */ (() => Date)();
const DatePrototype = /* @__PURE__ */ (() => $Date.prototype)();
const DateNow = /* @__PURE__ */ (() => $Date.now)();
const DateParse = /* @__PURE__ */ (() => $Date.parse)();
const DateUTC = /* @__PURE__ */ (() => $Date.UTC)();
const DatePrototypeValueOf =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.valueOf))();
const DatePrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toString))();
const DatePrototypeToUTCString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toUTCString))();
const DatePrototypeToISOString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toISOString))();
const DatePrototypeToDateString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toDateString))();
const DatePrototypeToTimeString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toTimeString))();
const DatePrototypeToLocaleString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toLocaleString))();
const DatePrototypeToLocaleDateString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toLocaleDateString))();
const DatePrototypeToLocaleTimeString =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toLocaleTimeString))();
const DatePrototypeGetTimezoneOffset =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getTimezoneOffset))();
const DatePrototypeGetTime =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getTime))();
const DatePrototypeGetFullYear =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getFullYear))();
const DatePrototypeGetUTCFullYear =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCFullYear))();
const DatePrototypeGetMonth =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getMonth))();
const DatePrototypeGetUTCMonth =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCMonth))();
const DatePrototypeGetDate =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getDate))();
const DatePrototypeGetUTCDate =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCDate))();
const DatePrototypeGetHours =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getHours))();
const DatePrototypeGetUTCHours =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCHours))();
const DatePrototypeGetMinutes =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getMinutes))();
const DatePrototypeGetUTCMinutes =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCMinutes))();
const DatePrototypeGetSeconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getSeconds))();
const DatePrototypeGetUTCSeconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCSeconds))();
const DatePrototypeGetMilliseconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getMilliseconds))();
const DatePrototypeGetUTCMilliseconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCMilliseconds))();
const DatePrototypeGetDay =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getDay))();
const DatePrototypeGetUTCDay =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.getUTCDay))();
const DatePrototypeSetTime =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setTime))();
const DatePrototypeSetMilliseconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setMilliseconds))();
const DatePrototypeSetUTCMilliseconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setUTCMilliseconds))();
const DatePrototypeSetSeconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setSeconds))();
const DatePrototypeSetUTCSeconds =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setUTCSeconds))();
const DatePrototypeSetMinutes =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setMinutes))();
const DatePrototypeSetUTCMinutes =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setUTCMinutes))();
const DatePrototypeSetHours =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setHours))();
const DatePrototypeSetUTCHours =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setUTCHours))();
const DatePrototypeSetDate =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setDate))();
const DatePrototypeSetUTCDate =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setUTCDate))();
const DatePrototypeSetMonth =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setMonth))();
const DatePrototypeSetUTCMonth =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setUTCMonth))();
const DatePrototypeSetFullYear =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setFullYear))();
const DatePrototypeSetUTCFullYear =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.setUTCFullYear))();
const DatePrototypeToJSON =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype.toJSON))();
const DatePrototypeSymbolToPrimitive =
  /* @__PURE__ */ (() => uncurryThis(DatePrototype[SymbolToPrimitive]))();
const $Error = /* @__PURE__ */ (() => Error)();
const ErrorPrototype = /* @__PURE__ */ (() => $Error.prototype)();
const ErrorPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(ErrorPrototype.toString))();
const ErrorPrototypeName = /* @__PURE__ */ (() => ErrorPrototype.name)();
const ErrorPrototypeMessage = /* @__PURE__ */ (() => ErrorPrototype.message)();
const $EvalError = /* @__PURE__ */ (() => EvalError)();
const EvalErrorPrototype = /* @__PURE__ */ (() => $EvalError.prototype)();
const EvalErrorPrototypeName =
  /* @__PURE__ */ (() => EvalErrorPrototype.name)();
const EvalErrorPrototypeMessage =
  /* @__PURE__ */ (() => EvalErrorPrototype.message)();
const $Float32Array = /* @__PURE__ */ (() => Float32Array)();
const Float32ArrayPrototype = /* @__PURE__ */ (() => $Float32Array.prototype)();
const Float32ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Float32Array.BYTES_PER_ELEMENT)();
const Float32ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Float32ArrayPrototype.BYTES_PER_ELEMENT)();
const $Float64Array = /* @__PURE__ */ (() => Float64Array)();
const Float64ArrayPrototype = /* @__PURE__ */ (() => $Float64Array.prototype)();
const Float64ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Float64Array.BYTES_PER_ELEMENT)();
const Float64ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Float64ArrayPrototype.BYTES_PER_ELEMENT)();
const $Function = /* @__PURE__ */ (() => Function)();
const FunctionPrototype = /* @__PURE__ */ (() => $Function.prototype)();
const FunctionPrototypeCallerDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(FunctionPrototype, "caller")!)();
const FunctionPrototypeGetCaller =
  /* @__PURE__ */ (() => uncurryThis(FunctionPrototypeCallerDescriptor.get!))();
const FunctionPrototypeSetCaller =
  /* @__PURE__ */ (() => uncurryThis(FunctionPrototypeCallerDescriptor.set!))();
const FunctionPrototypeArgumentsDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(FunctionPrototype, "arguments")!)();
const FunctionPrototypeGetArguments =
  /* @__PURE__ */ (() =>
    uncurryThis(FunctionPrototypeArgumentsDescriptor.get!))();
const FunctionPrototypeSetArguments =
  /* @__PURE__ */ (() =>
    uncurryThis(FunctionPrototypeArgumentsDescriptor.set!))();
const FunctionPrototypeCall =
  /* @__PURE__ */ (() => uncurryThis(FunctionPrototype.call))();
const FunctionPrototypeApply =
  /* @__PURE__ */ (() => uncurryThis(FunctionPrototype.apply))();
const FunctionPrototypeBind =
  /* @__PURE__ */ (() => uncurryThis(FunctionPrototype.bind))();
const FunctionPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(FunctionPrototype.toString))();
const FunctionPrototypeSymbolHasInstance =
  /* @__PURE__ */ (() => uncurryThis(FunctionPrototype[SymbolHasInstance]))();
const $Int16Array = /* @__PURE__ */ (() => Int16Array)();
const Int16ArrayPrototype = /* @__PURE__ */ (() => $Int16Array.prototype)();
const Int16ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Int16Array.BYTES_PER_ELEMENT)();
const Int16ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Int16ArrayPrototype.BYTES_PER_ELEMENT)();
const $Int32Array = /* @__PURE__ */ (() => Int32Array)();
const Int32ArrayPrototype = /* @__PURE__ */ (() => $Int32Array.prototype)();
const Int32ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Int32Array.BYTES_PER_ELEMENT)();
const Int32ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Int32ArrayPrototype.BYTES_PER_ELEMENT)();
const $Int8Array = /* @__PURE__ */ (() => Int8Array)();
const Int8ArrayPrototype = /* @__PURE__ */ (() => $Int8Array.prototype)();
const Int8ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Int8Array.BYTES_PER_ELEMENT)();
const Int8ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Int8ArrayPrototype.BYTES_PER_ELEMENT)();
const $Map = /* @__PURE__ */ (() => Map)();
const MapGroupBy = /* @__PURE__ */ (() => $Map.groupBy)();
const MapPrototype = /* @__PURE__ */ (() => $Map.prototype)();
const MapSymbolSpeciesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor($Map, SymbolSpecies)!)();
const MapGetSymbolSpecies =
  /* @__PURE__ */ (() => uncurryThis(MapSymbolSpeciesDescriptor.get!))();
const MapPrototypeSet = /* @__PURE__ */ (() => uncurryThis(MapPrototype.set))();
const MapPrototypeGet = /* @__PURE__ */ (() => uncurryThis(MapPrototype.get))();
const MapPrototypeHas = /* @__PURE__ */ (() => uncurryThis(MapPrototype.has))();
const MapPrototypeDelete =
  /* @__PURE__ */ (() => uncurryThis(MapPrototype.delete))();
const MapPrototypeClear =
  /* @__PURE__ */ (() => uncurryThis(MapPrototype.clear))();
const MapPrototypeSizeDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(MapPrototype, "size")!)();
const MapPrototypeGetSize =
  /* @__PURE__ */ (() => uncurryThis(MapPrototypeSizeDescriptor.get!))();
const MapPrototypeForEach =
  /* @__PURE__ */ (() => uncurryThis(MapPrototype.forEach))();
const MapPrototypeValues =
  /* @__PURE__ */ (() => uncurryThis(MapPrototype.values))();
const MapPrototypeKeys =
  /* @__PURE__ */ (() => uncurryThis(MapPrototype.keys))();
const MapPrototypeEntries =
  /* @__PURE__ */ (() => uncurryThis(MapPrototype.entries))();
const MapPrototypeSymbolIterator =
  /* @__PURE__ */ (() => uncurryThis(MapPrototype[SymbolIterator]))();
const MapPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => MapPrototype[SymbolToStringTag])();
const $Number = /* @__PURE__ */ (() => Number)();
const NumberPrototype = /* @__PURE__ */ (() => $Number.prototype)();
const NumberParseInt = /* @__PURE__ */ (() => $Number.parseInt)();
const NumberParseFloat = /* @__PURE__ */ (() => $Number.parseFloat)();
const NumberIsNaN = /* @__PURE__ */ (() => $Number.isNaN)();
const NumberIsFinite = /* @__PURE__ */ (() => $Number.isFinite)();
const NumberIsInteger = /* @__PURE__ */ (() => $Number.isInteger)();
const NumberIsSafeInteger = /* @__PURE__ */ (() => $Number.isSafeInteger)();
const NumberMAX_VALUE = /* @__PURE__ */ (() => $Number.MAX_VALUE)();
const NumberMIN_VALUE = /* @__PURE__ */ (() => $Number.MIN_VALUE)();
const NumberNaN = /* @__PURE__ */ (() => $Number.NaN)();
const NumberNEGATIVE_INFINITY =
  /* @__PURE__ */ (() => $Number.NEGATIVE_INFINITY)();
const NumberPOSITIVE_INFINITY =
  /* @__PURE__ */ (() => $Number.POSITIVE_INFINITY)();
const NumberEPSILON = /* @__PURE__ */ (() => $Number.EPSILON)();
const NumberMAX_SAFE_INTEGER =
  /* @__PURE__ */ (() => $Number.MAX_SAFE_INTEGER)();
const NumberMIN_SAFE_INTEGER =
  /* @__PURE__ */ (() => $Number.MIN_SAFE_INTEGER)();
const NumberPrototypeToExponential =
  /* @__PURE__ */ (() => uncurryThis(NumberPrototype.toExponential))();
const NumberPrototypeToFixed =
  /* @__PURE__ */ (() => uncurryThis(NumberPrototype.toFixed))();
const NumberPrototypeToPrecision =
  /* @__PURE__ */ (() => uncurryThis(NumberPrototype.toPrecision))();
const NumberPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(NumberPrototype.toString))();
const NumberPrototypeToLocaleString =
  /* @__PURE__ */ (() => uncurryThis(NumberPrototype.toLocaleString))();
const NumberPrototypeValueOf =
  /* @__PURE__ */ (() => uncurryThis(NumberPrototype.valueOf))();
const $Object = /* @__PURE__ */ (() => Object)();
const ObjectPrototype = /* @__PURE__ */ (() => $Object.prototype)();
const ObjectCreate = /* @__PURE__ */ (() => $Object.create)();
const ObjectGetPrototypeOf = /* @__PURE__ */ (() => $Object.getPrototypeOf)();
const ObjectSetPrototypeOf = /* @__PURE__ */ (() => $Object.setPrototypeOf)();
const ObjectDefineProperty = /* @__PURE__ */ (() => $Object.defineProperty)();
const ObjectDefineProperties =
  /* @__PURE__ */ (() => $Object.defineProperties)();
const ObjectGetOwnPropertyNames =
  /* @__PURE__ */ (() => $Object.getOwnPropertyNames)();
const ObjectGetOwnPropertySymbols =
  /* @__PURE__ */ (() => $Object.getOwnPropertySymbols)();
const ObjectGroupBy = /* @__PURE__ */ (() => $Object.groupBy)();
const ObjectKeys = /* @__PURE__ */ (() => $Object.keys)();
const ObjectValues = /* @__PURE__ */ (() => $Object.values)();
const ObjectEntries = /* @__PURE__ */ (() => $Object.entries)();
const ObjectIsExtensible = /* @__PURE__ */ (() => $Object.isExtensible)();
const ObjectPreventExtensions =
  /* @__PURE__ */ (() => $Object.preventExtensions)();
const ObjectGetOwnPropertyDescriptor =
  /* @__PURE__ */ (() => $Object.getOwnPropertyDescriptor)();
const ObjectGetOwnPropertyDescriptors =
  /* @__PURE__ */ (() => $Object.getOwnPropertyDescriptors)();
const ObjectIs = /* @__PURE__ */ (() => $Object.is)();
const ObjectAssign = /* @__PURE__ */ (() => $Object.assign)();
const ObjectSeal = /* @__PURE__ */ (() => $Object.seal)();
const ObjectFreeze = /* @__PURE__ */ (() => $Object.freeze)();
const ObjectIsSealed = /* @__PURE__ */ (() => $Object.isSealed)();
const ObjectIsFrozen = /* @__PURE__ */ (() => $Object.isFrozen)();
const ObjectFromEntries = /* @__PURE__ */ (() => $Object.fromEntries)();
const ObjectHasOwn = /* @__PURE__ */ (() => $Object.hasOwn)();
const ObjectPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(ObjectPrototype.toString))();
const ObjectPrototypeToLocaleString =
  /* @__PURE__ */ (() => uncurryThis(ObjectPrototype.toLocaleString))();
const ObjectPrototypeValueOf =
  /* @__PURE__ */ (() => uncurryThis(ObjectPrototype.valueOf))();
const ObjectPrototypeHasOwnProperty =
  /* @__PURE__ */ (() => uncurryThis(ObjectPrototype.hasOwnProperty))();
const ObjectPrototypeIsPrototypeOf =
  /* @__PURE__ */ (() => uncurryThis(ObjectPrototype.isPrototypeOf))();
const ObjectPrototypePropertyIsEnumerable =
  /* @__PURE__ */ (() => uncurryThis(ObjectPrototype.propertyIsEnumerable))();
const $RangeError = /* @__PURE__ */ (() => RangeError)();
const RangeErrorPrototype = /* @__PURE__ */ (() => $RangeError.prototype)();
const RangeErrorPrototypeName =
  /* @__PURE__ */ (() => RangeErrorPrototype.name)();
const RangeErrorPrototypeMessage =
  /* @__PURE__ */ (() => RangeErrorPrototype.message)();
const $ReferenceError = /* @__PURE__ */ (() => ReferenceError)();
const ReferenceErrorPrototype =
  /* @__PURE__ */ (() => $ReferenceError.prototype)();
const ReferenceErrorPrototypeName =
  /* @__PURE__ */ (() => ReferenceErrorPrototype.name)();
const ReferenceErrorPrototypeMessage =
  /* @__PURE__ */ (() => ReferenceErrorPrototype.message)();
const $RegExp = /* @__PURE__ */ (() => RegExp)();
const RegExpPrototype = /* @__PURE__ */ (() => $RegExp.prototype)();
const RegExpSymbolSpeciesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor($RegExp, SymbolSpecies)!)();
const RegExpGetSymbolSpecies =
  /* @__PURE__ */ (() => uncurryThis(RegExpSymbolSpeciesDescriptor.get!))();
const RegExpPrototypeFlagsDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "flags")!)();
const RegExpPrototypeGetFlags =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototypeFlagsDescriptor.get!))();
const RegExpPrototypeSourceDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "source")!)();
const RegExpPrototypeGetSource =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototypeSourceDescriptor.get!))();
const RegExpPrototypeGlobalDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "global")!)();
const RegExpPrototypeGetGlobal =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototypeGlobalDescriptor.get!))();
const RegExpPrototypeIgnoreCaseDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "ignoreCase")!)();
const RegExpPrototypeGetIgnoreCase =
  /* @__PURE__ */ (() =>
    uncurryThis(RegExpPrototypeIgnoreCaseDescriptor.get!))();
const RegExpPrototypeMultilineDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "multiline")!)();
const RegExpPrototypeGetMultiline =
  /* @__PURE__ */ (() =>
    uncurryThis(RegExpPrototypeMultilineDescriptor.get!))();
const RegExpPrototypeDotAllDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "dotAll")!)();
const RegExpPrototypeGetDotAll =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototypeDotAllDescriptor.get!))();
const RegExpPrototypeUnicodeDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "unicode")!)();
const RegExpPrototypeGetUnicode =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototypeUnicodeDescriptor.get!))();
const RegExpPrototypeStickyDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "sticky")!)();
const RegExpPrototypeGetSticky =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototypeStickyDescriptor.get!))();
const RegExpPrototypeHasIndicesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(RegExpPrototype, "hasIndices")!)();
const RegExpPrototypeGetHasIndices =
  /* @__PURE__ */ (() =>
    uncurryThis(RegExpPrototypeHasIndicesDescriptor.get!))();
const RegExpPrototypeExec =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype.exec))();
const RegExpPrototypeCompile =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype.compile))();
const RegExpPrototypeTest =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype.test))();
const RegExpPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype.toString))();
const RegExpPrototypeSymbolReplace =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype[SymbolReplace]))();
const RegExpPrototypeSymbolMatch =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype[SymbolMatch]))();
const RegExpPrototypeSymbolMatchAll =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype[SymbolMatchAll]))();
const RegExpPrototypeSymbolSearch =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype[SymbolSearch]))();
const RegExpPrototypeSymbolSplit =
  /* @__PURE__ */ (() => uncurryThis(RegExpPrototype[SymbolSplit]))();
const $Set = /* @__PURE__ */ (() => Set)();
const SetPrototype = /* @__PURE__ */ (() => $Set.prototype)();
const SetSymbolSpeciesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor($Set, SymbolSpecies)!)();
const SetGetSymbolSpecies =
  /* @__PURE__ */ (() => uncurryThis(SetSymbolSpeciesDescriptor.get!))();
const SetPrototypeAdd = /* @__PURE__ */ (() => uncurryThis(SetPrototype.add))();
const SetPrototypeHas = /* @__PURE__ */ (() => uncurryThis(SetPrototype.has))();
const SetPrototypeDelete =
  /* @__PURE__ */ (() => uncurryThis(SetPrototype.delete))();
const SetPrototypeClear =
  /* @__PURE__ */ (() => uncurryThis(SetPrototype.clear))();
const SetPrototypeSizeDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(SetPrototype, "size")!)();
const SetPrototypeGetSize =
  /* @__PURE__ */ (() => uncurryThis(SetPrototypeSizeDescriptor.get!))();
const SetPrototypeForEach =
  /* @__PURE__ */ (() => uncurryThis(SetPrototype.forEach))();
const SetPrototypeValues =
  /* @__PURE__ */ (() => uncurryThis(SetPrototype.values))();
const SetPrototypeKeys =
  /* @__PURE__ */ (() => uncurryThis(SetPrototype.keys))();
const SetPrototypeEntries =
  /* @__PURE__ */ (() => uncurryThis(SetPrototype.entries))();
const SetPrototypeSymbolIterator =
  /* @__PURE__ */ (() => uncurryThis(SetPrototype[SymbolIterator]))();
const SetPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => SetPrototype[SymbolToStringTag])();
const $SharedArrayBuffer = /* @__PURE__ */ (() => SharedArrayBuffer)();
const SharedArrayBufferPrototype =
  /* @__PURE__ */ (() => $SharedArrayBuffer.prototype)();
const SharedArrayBufferSymbolSpeciesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor($SharedArrayBuffer, SymbolSpecies)!)();
const SharedArrayBufferGetSymbolSpecies =
  /* @__PURE__ */ (() =>
    uncurryThis(SharedArrayBufferSymbolSpeciesDescriptor.get!))();
const SharedArrayBufferPrototypeByteLengthDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor(
      SharedArrayBufferPrototype,
      "byteLength",
    )!)();
const SharedArrayBufferPrototypeGetByteLength =
  /* @__PURE__ */ (() =>
    uncurryThis(SharedArrayBufferPrototypeByteLengthDescriptor.get!))();
const SharedArrayBufferPrototypeSlice =
  /* @__PURE__ */ (() => uncurryThis(SharedArrayBufferPrototype.slice))();
const SharedArrayBufferPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => SharedArrayBufferPrototype[SymbolToStringTag])();
const $String = /* @__PURE__ */ (() => String)();
const StringPrototype = /* @__PURE__ */ (() => $String.prototype)();
const StringFromCharCode = /* @__PURE__ */ (() => $String.fromCharCode)();
const StringFromCodePoint = /* @__PURE__ */ (() => $String.fromCodePoint)();
const StringRaw = /* @__PURE__ */ (() => $String.raw)();
const StringPrototypeLength = /* @__PURE__ */ (() => StringPrototype.length)();
const StringPrototypeAt =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.at))();
const StringPrototypeCharCodeAt =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.charCodeAt))();
const StringPrototypeCharAt =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.charAt))();
const StringPrototypeConcat =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.concat))();
const StringPrototypeConcatApply =
  /* @__PURE__ */ (() => applyBind(StringPrototype.concat))();
const StringPrototypeCodePointAt =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.codePointAt))();
const StringPrototypeIsWellFormed =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.isWellFormed))();
const StringPrototypeToWellFormed =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.toWellFormed))();
const StringPrototypeIndexOf =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.indexOf))();
const StringPrototypeLastIndexOf =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.lastIndexOf))();
const StringPrototypeIncludes =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.includes))();
const StringPrototypeEndsWith =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.endsWith))();
const StringPrototypeStartsWith =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.startsWith))();
const StringPrototypeMatch =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.match))();
const StringPrototypeMatchAll =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.matchAll))();
const StringPrototypeSearch =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.search))();
const StringPrototypeSplit =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.split))();
const StringPrototypeSubstring =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.substring))();
const StringPrototypeSubstr =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.substr))();
const StringPrototypeSlice =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.slice))();
const StringPrototypeRepeat =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.repeat))();
const StringPrototypeReplace =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.replace))();
const StringPrototypeReplaceAll =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.replaceAll))();
const StringPrototypePadEnd =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.padEnd))();
const StringPrototypePadStart =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.padStart))();
const StringPrototypeTrim =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.trim))();
const StringPrototypeTrimEnd =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.trimEnd))();
const StringPrototypeTrimRight =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.trimRight))();
const StringPrototypeTrimStart =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.trimStart))();
const StringPrototypeTrimLeft =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.trimLeft))();
const StringPrototypeToString =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.toString))();
const StringPrototypeValueOf =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.valueOf))();
const StringPrototypeLocaleCompare =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.localeCompare))();
const StringPrototypeToLowerCase =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.toLowerCase))();
const StringPrototypeToUpperCase =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.toUpperCase))();
const StringPrototypeToLocaleLowerCase =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.toLocaleLowerCase))();
const StringPrototypeToLocaleUpperCase =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.toLocaleUpperCase))();
const StringPrototypeAnchor =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.anchor))();
const StringPrototypeBig =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.big))();
const StringPrototypeBlink =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.blink))();
const StringPrototypeBold =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.bold))();
const StringPrototypeFixed =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.fixed))();
const StringPrototypeFontcolor =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.fontcolor))();
const StringPrototypeFontsize =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.fontsize))();
const StringPrototypeItalics =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.italics))();
const StringPrototypeLink =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.link))();
const StringPrototypeSmall =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.small))();
const StringPrototypeStrike =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.strike))();
const StringPrototypeSub =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.sub))();
const StringPrototypeSup =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.sup))();
const StringPrototypeNormalize =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype.normalize))();
const StringPrototypeSymbolIterator =
  /* @__PURE__ */ (() => uncurryThis(StringPrototype[SymbolIterator]))();
const $SyntaxError = /* @__PURE__ */ (() => SyntaxError)();
const SyntaxErrorPrototype = /* @__PURE__ */ (() => $SyntaxError.prototype)();
const SyntaxErrorPrototypeName =
  /* @__PURE__ */ (() => SyntaxErrorPrototype.name)();
const SyntaxErrorPrototypeMessage =
  /* @__PURE__ */ (() => SyntaxErrorPrototype.message)();
const $TypeError = /* @__PURE__ */ (() => TypeError)();
const TypeErrorPrototype = /* @__PURE__ */ (() => $TypeError.prototype)();
const TypeErrorPrototypeName =
  /* @__PURE__ */ (() => TypeErrorPrototype.name)();
const TypeErrorPrototypeMessage =
  /* @__PURE__ */ (() => TypeErrorPrototype.message)();
const $URIError = /* @__PURE__ */ (() => URIError)();
const URIErrorPrototype = /* @__PURE__ */ (() => $URIError.prototype)();
const URIErrorPrototypeName = /* @__PURE__ */ (() => URIErrorPrototype.name)();
const URIErrorPrototypeMessage =
  /* @__PURE__ */ (() => URIErrorPrototype.message)();
const $Uint16Array = /* @__PURE__ */ (() => Uint16Array)();
const Uint16ArrayPrototype = /* @__PURE__ */ (() => $Uint16Array.prototype)();
const Uint16ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Uint16Array.BYTES_PER_ELEMENT)();
const Uint16ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Uint16ArrayPrototype.BYTES_PER_ELEMENT)();
const $Uint32Array = /* @__PURE__ */ (() => Uint32Array)();
const Uint32ArrayPrototype = /* @__PURE__ */ (() => $Uint32Array.prototype)();
const Uint32ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Uint32Array.BYTES_PER_ELEMENT)();
const Uint32ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Uint32ArrayPrototype.BYTES_PER_ELEMENT)();
const $Uint8Array = /* @__PURE__ */ (() => Uint8Array)();
const Uint8ArrayPrototype = /* @__PURE__ */ (() => $Uint8Array.prototype)();
const Uint8ArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Uint8Array.BYTES_PER_ELEMENT)();
const Uint8ArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Uint8ArrayPrototype.BYTES_PER_ELEMENT)();
const $Uint8ClampedArray = /* @__PURE__ */ (() => Uint8ClampedArray)();
const Uint8ClampedArrayPrototype =
  /* @__PURE__ */ (() => $Uint8ClampedArray.prototype)();
const Uint8ClampedArrayBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => $Uint8ClampedArray.BYTES_PER_ELEMENT)();
const Uint8ClampedArrayPrototypeBYTES_PER_ELEMENT =
  /* @__PURE__ */ (() => Uint8ClampedArrayPrototype.BYTES_PER_ELEMENT)();
const $WeakMap = /* @__PURE__ */ (() => WeakMap)();
const WeakMapPrototype = /* @__PURE__ */ (() => $WeakMap.prototype)();
const WeakMapPrototypeSet =
  /* @__PURE__ */ (() => uncurryThis(WeakMapPrototype.set))();
const WeakMapPrototypeGet =
  /* @__PURE__ */ (() => uncurryThis(WeakMapPrototype.get))();
const WeakMapPrototypeHas =
  /* @__PURE__ */ (() => uncurryThis(WeakMapPrototype.has))();
const WeakMapPrototypeDelete =
  /* @__PURE__ */ (() => uncurryThis(WeakMapPrototype.delete))();
const WeakMapPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => WeakMapPrototype[SymbolToStringTag])();
const $WeakSet = /* @__PURE__ */ (() => WeakSet)();
const WeakSetPrototype = /* @__PURE__ */ (() => $WeakSet.prototype)();
const WeakSetPrototypeAdd =
  /* @__PURE__ */ (() => uncurryThis(WeakSetPrototype.add))();
const WeakSetPrototypeHas =
  /* @__PURE__ */ (() => uncurryThis(WeakSetPrototype.has))();
const WeakSetPrototypeDelete =
  /* @__PURE__ */ (() => uncurryThis(WeakSetPrototype.delete))();
const WeakSetPrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => WeakSetPrototype[SymbolToStringTag])();
const $Promise = /* @__PURE__ */ (() => Promise)();
const PromiseResolve = /* @__PURE__ */ (() => $Promise.resolve.bind(Promise))();
const PromiseReject = /* @__PURE__ */ (() => $Promise.reject.bind(Promise))();
const PromiseAll = /* @__PURE__ */ (() => $Promise.all.bind(Promise))();
const PromiseAllSettled =
  /* @__PURE__ */ (() => $Promise.allSettled.bind(Promise))();
const PromiseAny = /* @__PURE__ */ (() => $Promise.any.bind(Promise))();
const PromiseRace = /* @__PURE__ */ (() => $Promise.race.bind(Promise))();
const PromiseWithResolvers =
  /* @__PURE__ */ (() => $Promise.withResolvers.bind(Promise))();
const PromisePrototype = /* @__PURE__ */ (() => $Promise.prototype)();
const PromiseSymbolSpeciesDescriptor =
  /* @__PURE__ */ (() =>
    ReflectGetOwnPropertyDescriptor($Promise, SymbolSpecies)!)();
const PromiseGetSymbolSpecies =
  /* @__PURE__ */ (() => uncurryThis(PromiseSymbolSpeciesDescriptor.get!))();
const PromisePrototypeThen =
  /* @__PURE__ */ (() => uncurryThis(PromisePrototype.then))();
const PromisePrototypeSymbolToStringTag =
  /* @__PURE__ */ (() => PromisePrototype[SymbolToStringTag])();

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
