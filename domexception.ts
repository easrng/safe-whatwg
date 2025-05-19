// Copyright 2018-2025 the Deno authors. MIT license.

import {
  Error,
  ErrorPrototype,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  ReflectConstruct,
  ReflectDeleteProperty,
  StringPrototypeReplaceAll,
  StringPrototypeToUpperCase,
} from "./_internal/primordials.js";

import * as webidl from "./_internal/webidl.ts";

// Defined in WebIDL 2.8.1.
// https://webidl.spec.whatwg.org/#dfn-error-names-table
// the prototype should be null, to prevent user code from looking
// up Object.prototype properties, such as "toString"
const nameToCodeMapping: Record<string, number> = { __proto__: null as never };

class DOMExceptionSlots extends (function (obj: object) {
  return obj;
} as unknown as new (o: object) => object) {
  #message!: string;
  #name!: string;
  #code!: number;
  static m(m: DOMException) {
    return (m as unknown as DOMExceptionSlots).#message;
  }
  static n(m: DOMException) {
    return (m as unknown as DOMExceptionSlots).#name;
  }
  static c(m: DOMException) {
    return (m as unknown as DOMExceptionSlots).#code;
  }
  static i(m: DOMException, message: string, name: string, code: number) {
    const error = m as unknown as DOMExceptionSlots;
    error.#message = message;
    error.#name = name;
    error.#code = code;
  }
  static I(v: object): v is DOMException {
    // deno-lint-ignore prefer-primordials
    return #message in v;
  }
}

// Defined in WebIDL 4.3.
// https://webidl.spec.whatwg.org/#idl-DOMException
class DOMException {
  // https://webidl.spec.whatwg.org/#dom-domexception-domexception
  constructor(message = "", name = "Error") {
    message = webidl.converters.DOMString(
      message,
      "Failed to construct 'DOMException'",
      "Argument 1",
    );
    name = webidl.converters.DOMString(
      name,
      "Failed to construct 'DOMException'",
      "Argument 2",
    );

    const error = ReflectConstruct(
      Error,
      [message],
      new.target,
    ) as DOMException;
    ReflectDeleteProperty(error, "message");
    new DOMExceptionSlots(error);
    const code = nameToCodeMapping[name] ?? 0;
    DOMExceptionSlots.i(error, message, name, code);
    return error;
  }

  get message(): string {
    webidl.assertBranded(this, DOMExceptionSlots.I);
    return DOMExceptionSlots.m(this);
  }

  get name(): string {
    webidl.assertBranded(this, DOMExceptionSlots.I);
    return DOMExceptionSlots.n(this);
  }

  get code(): number {
    webidl.assertBranded(this, DOMExceptionSlots.I);
    return DOMExceptionSlots.c(this);
  }
}

ObjectSetPrototypeOf(DOMException.prototype, ErrorPrototype);

webidl.configureInterface(DOMException, "DOMException");

const names = [
  "Index_Size",
  "DOMSTRING_SIZE",
  "Hierarchy_Request",
  "Wrong_Document",
  "Invalid_Character",
  "NO_DATA_ALLOWED",
  "No_Modification_Allowed",
  "Not_Found",
  "Not_Supported",
  "InUse_Attribute",
  "Invalid_State",
  "Syntax",
  "Invalid_Modification",
  "Namespace",
  "Invalid_Access",
  "VALIDATION",
  "Type_Mismatch",
  "Security",
  "Network",
  "Abort",
  "URL_Mismatch",
  "Quota_Exceeded",
  "Timeout",
  "Invalid_Node_Type",
  "Data_Clone",
];
for (let i = 0; i < names.length;) {
  const n = names[i++];
  const desc = { __proto__: null, value: i, enumerable: true };
  const nu = StringPrototypeToUpperCase(n);
  if (n !== nu) {
    nameToCodeMapping[StringPrototypeReplaceAll(n, "_", "") + "Error"] = i;
  }
  const nc = nu + "_ERR";
  ObjectDefineProperty(DOMException, nc, desc);
  ObjectDefineProperty(DOMException.prototype, nc, desc);
}

export { DOMException };
