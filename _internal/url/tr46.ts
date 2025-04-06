// https://unpkg.com/tr46@5.1.0/index.js

import { punycodeDecode, punycodeEncode } from "./punycode.ts";
import mappingTable from "./mapping-table.js";
import {
  ArrayPrototypeIndexOf,
  ArrayPrototypeJoin,
  ArrayPrototypeSlice,
  ObjectCreate,
  RegExpPrototypeTest,
  StringPrototypeCodePointAt,
  StringPrototypeEndsWith,
  StringPrototypeIncludes,
  StringPrototypeNormalize,
  StringPrototypeSlice,
  StringPrototypeSplit,
  StringPrototypeStartsWith,
} from "../primordials.js";
import { ArrayPrototypeMap, SafeRegExp } from "../primordial-utils.ts";
import {
  bidiDomain,
  bidiS1LTR,
  bidiS1RTL,
  bidiS2,
  bidiS3,
  bidiS4AN,
  bidiS4EN,
  bidiS5,
  bidiS6,
  combiningClassVirama,
  combiningMarks,
  validZWNJ,
} from "./regexes.ts";
import { codePointStrings } from "../codepoints.ts";

const STATUS_MAPPING = {
  mapped: 1,
  valid: 2,
  disallowed: 3,
  disallowed_STD3_valid: 4,
  disallowed_STD3_mapped: 5,
  deviation: 6,
  ignored: 7,
};

// deno-lint-ignore no-control-regex
const nonASCII = new SafeRegExp(/[^\x00-\x7F]/u);
function containsNonASCII(str: string) {
  return RegExpPrototypeTest(nonASCII, str);
}

const mappingTableEnd = mappingTable.length - 1;

function findStatus(
  val: number,
) {
  let start = 0;
  let end = mappingTableEnd;

  while (start <= end) {
    const mid = ~~((start + end) / 2);

    const target = mappingTable[mid]!;
    const min = typeof target[0] === "number" ? target[0] : target[0][0];
    const max = typeof target[0] === "number" ? target[0] : target[0][1];

    if (min <= val && max >= val) {
      return target;
    } else if (min > val) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return null;
}

function mapChars(
  domainName: string,
  { transitionalProcessing }: ConcreteOptions,
) {
  let processed = "";

  const codePoints = codePointStrings(domainName);
  for (let i = 0; i < codePoints.length; i++) {
    const ch = codePoints[i];
    const { 1: status, 2: mapping } = findStatus(
      StringPrototypeCodePointAt(ch, 0)!,
    )!;

    switch (status) {
      case STATUS_MAPPING.disallowed:
        processed += ch;
        break;
      case STATUS_MAPPING.ignored:
        break;
      case STATUS_MAPPING.mapped:
        if (transitionalProcessing && ch === "ẞ") {
          processed += "ss";
        } else {
          processed += mapping;
        }
        break;
      case STATUS_MAPPING.deviation:
        if (transitionalProcessing) {
          processed += mapping;
        } else {
          processed += ch;
        }
        break;
      case STATUS_MAPPING.valid:
        processed += ch;
        break;
    }
  }

  return processed;
}

function validateLabel(
  label: string,
  {
    checkHyphens,
    checkBidi,
    checkJoiners,
    transitionalProcessing,
    useSTD3ASCIIRules,
    isBidi,
  }: ConcreteOptions & { isBidi: boolean },
) {
  // "must be satisfied for a non-empty label"
  if (label.length === 0) {
    return true;
  }

  // "1. The label must be in Unicode Normalization Form NFC."
  if (StringPrototypeNormalize(label, "NFC") !== label) {
    return false;
  }

  const codePoints: Record<number, string> & { length: number } =
    codePointStrings(label);

  // "2. If CheckHyphens, the label must not contain a U+002D HYPHEN-MINUS character in both the
  // third and fourth positions."
  //
  // "3. If CheckHyphens, the label must neither begin nor end with a U+002D HYPHEN-MINUS character."
  if (checkHyphens) {
    if (
      (codePoints[2] === "-" && codePoints[3] === "-") ||
      StringPrototypeStartsWith(label, "-") ||
      StringPrototypeEndsWith(label, "-")
    ) {
      return false;
    }
  }

  // "4. If not CheckHyphens, the label must not begin with “xn--”."
  if (!checkHyphens) {
    if (StringPrototypeStartsWith(label, "xn--")) {
      return false;
    }
  }

  // "5. The label must not contain a U+002E ( . ) FULL STOP."
  if (StringPrototypeIncludes(label, ".")) {
    return false;
  }

  // "6. The label must not begin with a combining mark, that is: General_Category=Mark."
  if (RegExpPrototypeTest(combiningMarks, codePoints[0]!)) {
    return false;
  }

  // "7. Each code point in the label must only have certain Status values according to Section 5"
  for (let i = 0; i < codePoints.length; i++) {
    const ch = codePoints[i]!;
    const codePoint = StringPrototypeCodePointAt(ch, 0)!;
    const { 1: status } = findStatus(codePoint)!;
    if (transitionalProcessing) {
      // "For Transitional Processing (deprecated), each value must be valid."
      if (status !== STATUS_MAPPING.valid) {
        return false;
      }
    } else if (
      status !== STATUS_MAPPING.valid &&
      status !== STATUS_MAPPING.deviation
    ) {
      // "For Nontransitional Processing, each value must be either valid or deviation."
      return false;
    }
    // "In addition, if UseSTD3ASCIIRules=true and the code point is an ASCII code point (U+0000..U+007F), then it must
    // be a lowercase letter (a-z), a digit (0-9), or a hyphen-minus (U+002D). (Note: This excludes uppercase ASCII
    // A-Z which are mapped in UTS #46 and disallowed in IDNA2008.)"
    if (useSTD3ASCIIRules && codePoint <= 0x7F) {
      // deno-lint-ignore prefer-primordials
      if (!RegExpPrototypeTest(/^[a-z][0-9]-$/u, ch)) {
        return false;
      }
    }
  }

  // "8. If CheckJoiners, the label must satisify the ContextJ rules"
  // https://tools.ietf.org/html/rfc5892#appendix-A
  if (checkJoiners) {
    let last = 0;
    for (let i = 0; i < codePoints.length; i++) {
      const ch = codePoints[i]!;
      if (ch === "\u200C" || ch === "\u200D") {
        if (i > 0) {
          if (
            RegExpPrototypeTest(
              combiningClassVirama,
              codePoints[i - 1]!,
            )
          ) {
            continue;
          }
          if (ch === "\u200C") {
            // TODO: make this more efficient
            const next = ArrayPrototypeIndexOf(codePoints, "\u200C", i + 1);
            const test = next < 0
              ? ArrayPrototypeSlice(codePoints, last)
              : ArrayPrototypeSlice(codePoints, last, next);
            if (
              RegExpPrototypeTest(
                validZWNJ,
                ArrayPrototypeJoin(test, ""),
              )
            ) {
              last = i + 1;
              continue;
            }
          }
        }
        return false;
      }
    }
  }

  // "9. If CheckBidi, and if the domain name is a Bidi domain name, then the label must satisfy..."
  // https://tools.ietf.org/html/rfc5893#section-2
  if (checkBidi && isBidi) {
    let rtl;

    // 1
    if (RegExpPrototypeTest(bidiS1LTR, codePoints[0]!)) {
      rtl = false;
    } else if (RegExpPrototypeTest(bidiS1RTL, codePoints[0]!)) {
      rtl = true;
    } else {
      return false;
    }

    if (rtl) {
      // 2-4
      if (
        !RegExpPrototypeTest(bidiS2, label) ||
        !RegExpPrototypeTest(bidiS3, label) ||
        (RegExpPrototypeTest(bidiS4EN, label) &&
          RegExpPrototypeTest(bidiS4AN, label))
      ) {
        return false;
      }
    } else if (
      !RegExpPrototypeTest(bidiS5, label) ||
      !RegExpPrototypeTest(bidiS6, label)
    ) {
      // 5-6
      return false;
    }
  }

  return true;
}

function isBidiDomain(labels: string[]) {
  const domain = ArrayPrototypeJoin(
    ArrayPrototypeMap(labels, (label) => {
      if (StringPrototypeStartsWith(label, "xn--")) {
        try {
          return punycodeDecode(StringPrototypeSlice(label, 4));
        } catch {
          return "";
        }
      }
      return label;
    }),
    ".",
  );
  return RegExpPrototypeTest(bidiDomain, domain);
}

function processing(domainName: string, options: ConcreteOptions) {
  // 1. Map.
  let string = mapChars(domainName, options);

  // 2. Normalize.
  string = StringPrototypeNormalize(string, "NFC");

  // 3. Break.
  const labels = StringPrototypeSplit(string, ".");
  const isBidi = isBidiDomain(labels);

  // 4. Convert/Validate.
  let error = false;
  for (let i = 0; i < labels.length; i++) {
    const origLabel = labels[i]!;
    let label = origLabel;
    let transitionalProcessingForThisLabel = options.transitionalProcessing;
    if (StringPrototypeStartsWith(label, "xn--")) {
      if (containsNonASCII(label)) {
        error = true;
        continue;
      }

      try {
        label = punycodeDecode(StringPrototypeSlice(label, 4));
      } catch {
        if (!options.ignoreInvalidPunycode) {
          error = true;
          continue;
        }
      }
      labels[i] = label;

      if (label === "" || !containsNonASCII(label)) {
        error = true;
      }

      transitionalProcessingForThisLabel = false;
    }

    // No need to validate if we already know there is an error.
    if (error) {
      continue;
    }
    const validation = validateLabel(label, {
      ...options,
      transitionalProcessing: transitionalProcessingForThisLabel,
      isBidi,
    });
    if (!validation) {
      error = true;
    }
  }

  return {
    string: ArrayPrototypeJoin(labels, "."),
    error,
  };
}

export interface ToASCIIOptions extends Options {
  /**
   * When set to `true`, the length of each DNS label within the input will be checked for validation.
   * @default false
   */
  verifyDNSLength?: boolean | undefined;
}

export function toASCII(
  domainName: string,
  {
    checkHyphens = false,
    checkBidi = false,
    checkJoiners = false,
    useSTD3ASCIIRules = false,
    verifyDNSLength = false,
    transitionalProcessing = false,
    ignoreInvalidPunycode = false,
  }: ToASCIIOptions = ObjectCreate(null),
) {
  const result = processing(domainName, {
    checkHyphens,
    checkBidi,
    checkJoiners,
    useSTD3ASCIIRules,
    transitionalProcessing,
    ignoreInvalidPunycode,
  });
  let labels = StringPrototypeSplit(result.string, ".");
  labels = ArrayPrototypeMap(labels, (l) => {
    if (containsNonASCII(l)) {
      try {
        return `xn--${punycodeEncode(l)}`;
      } catch {
        result.error = true;
      }
    }
    return l;
  });

  if (verifyDNSLength) {
    const total = ArrayPrototypeJoin(labels, ".").length;
    if (total > 253 || total === 0) {
      result.error = true;
    }

    for (let i = 0; i < labels.length; ++i) {
      if (labels[i]!.length > 63 || labels[i]!.length === 0) {
        result.error = true;
        break;
      }
    }
  }

  if (result.error) {
    return null;
  }
  return ArrayPrototypeJoin(labels, ".");
}

type ConcreteOptions = Record<keyof Options, boolean>;

export interface Options {
  /**
   * When set to `true`, any bi-directional text within the input will be checked for validation.
   * @default false
   */
  checkBidi?: boolean | undefined;
  /**
   * When set to `true`, the positions of any hyphen characters within the input will be checked for validation.
   * @default false
   */
  checkHyphens?: boolean | undefined;
  /**
   * When set to `true`, any word joiner characters within the input will be checked for validation.
   * @default false
   */
  checkJoiners?: boolean | undefined;
  /**
   * When set to `true`, invalid Punycode strings within the input will be allowed.
   * @default false
   */
  ignoreInvalidPunycode?: boolean | undefined;
  /**
   * When set to `true`, uses transitional (compatibility) processing of the deviation characters.
   * @default false
   */
  transitionalProcessing?: boolean | undefined;
  /**
   * When set to `true`, input will be validated according to [STD3 Rules](http://unicode.org/reports/tr46/#STD3_Rules).
   * @default false
   */
  useSTD3ASCIIRules?: boolean | undefined;
}

export function toUnicode(
  domainName: string,
  {
    checkHyphens = false,
    checkBidi = false,
    checkJoiners = false,
    useSTD3ASCIIRules = false,
    transitionalProcessing = false,
    ignoreInvalidPunycode = false,
  }: Options = ObjectCreate(null),
) {
  const result = processing(domainName, {
    checkHyphens,
    checkBidi,
    checkJoiners,
    useSTD3ASCIIRules,
    transitionalProcessing,
    ignoreInvalidPunycode,
  });

  return {
    domain: result.string,
    error: result.error,
  };
}
