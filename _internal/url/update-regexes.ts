// deno-lint-ignore-file prefer-primordials ban-ts-comment no-explicit-any
import fs from "node:fs";
import regenerate_ from "npm:regenerate@1.4.2";
const unicodeVersion = "16.0.0";
const esUnicodeVersion = "15.0.0";
function dataIsSingleton(data: any) {
  // Check if the set only represents a single code point.
  return data.length == 2 && data[0] + 1 == data[1];
}
// This assumes that `number` is a positive integer that `toString()`s nicely
// (which is the case for all code point values).
const zeroes = "0000";
function pad(number: string, totalCharacters: number) {
  const string = String(number);
  return string.length < totalCharacters
    ? (zeroes + string).slice(-totalCharacters)
    : string;
}

function hex(number: number) {
  return Number(number).toString(16).toUpperCase();
}
function codePointToString(codePoint: number) {
  let string;
  // https://mathiasbynens.be/notes/javascript-escapes#single
  // Note: the `\b` escape sequence for U+0008 BACKSPACE in strings has a
  // different meaning in regular expressions (word boundary), so it cannot
  // be used here.
  if (codePoint == 0x09) {
    string = "\\t";
  } else if (codePoint == 0x0B) {
    string = "\\v";
  } else if (codePoint == 0x0A) {
    string = "\\n";
  } else if (codePoint == 0x0C) {
    string = "\\f";
  } else if (codePoint == 0x0D) {
    string = "\\r";
  } else if (codePoint == 0x2D) {
    // https://mathiasbynens.be/notes/javascript-escapes#hexadecimal
    // Note: `-` (U+002D HYPHEN-MINUS) is escaped in this way rather
    // than by backslash-escaping, in case the output is used outside
    // of a character class in a `u` RegExp. /\-/u throws, but
    // /\x2D/u is fine.
    string = "\\x2D";
  } else if (codePoint == 0x5C) {
    string = "\\\\";
  } else if (
    codePoint == 0x24 ||
    (codePoint >= 0x28 && codePoint <= 0x2B) ||
    codePoint == 0x2E || codePoint == 0x2F ||
    codePoint == 0x3F ||
    (codePoint >= 0x5B && codePoint <= 0x5E) ||
    (codePoint >= 0x7B && codePoint <= 0x7D)
  ) {
    // The code point maps to an unsafe printable ASCII character;
    // backslash-escape it. Here’s the list of those symbols:
    //
    //     $()*+./?[\]^{|}
    //
    // This matches SyntaxCharacters as well as `/` (U+002F SOLIDUS).
    // https://tc39.github.io/ecma262/#prod-SyntaxCharacter
    string = "\\" + String.fromCharCode(codePoint);
  } else if (codePoint >= 0x20 && codePoint <= 0x7E) {
    // The code point maps to one of these printable ASCII symbols
    // (including the space character):
    //
    //      !"#%&',/0123456789:;<=>@ABCDEFGHIJKLMNO
    //     PQRSTUVWXYZ_`abcdefghijklmnopqrstuvwxyz~
    //
    // These can safely be used directly.
    string = String.fromCharCode(codePoint);
  } else if (codePoint <= 0x7F) {
    string = "\\x" + pad(hex(codePoint), 2);
  } else {
    string = String.fromCodePoint(codePoint);
  }

  return string;
}
function createUnicodeCharacterClasses(data: any) {
  // Iterate over the data per `(start, end)` pair.
  let result = "";
  let index = 0;
  let start;
  let end;
  const length = data.length;
  if (dataIsSingleton(data)) {
    return codePointToString(data[0]);
  }
  while (index < length) {
    start = data[index];
    end = data[index + 1] - 1; // Note: the `- 1` makes `end` inclusive.
    if (start == end) {
      result += codePointToString(start);
    } else if (start + 1 == end) {
      result += codePointToString(start) + codePointToString(end);
    } else {
      result += codePointToString(start) + "-" +
        codePointToString(end);
    }
    index += 2;
  }
  return result;
}
const esProps: [string, Set<number>][] = [
  ...(await Promise.all(
    ["General_Category", "Script", "Script_Extensions"].map(async (e) =>
      Promise.all(
        (await import(`npm:@unicode/unicode-${esUnicodeVersion}`)).default[e]
          .map(
            async (b: string) => [
              `\\p{${
                e === "General_Category"
                  ? ""
                  : `${e === "Script" ? "sc" : "scx"}=`
              }${b}}`,
              new Set(
                (await import(
                  `npm:@unicode/unicode-${esUnicodeVersion}/${e}/${b}/code-points.js`
                )).default,
              ),
            ],
          ),
      )
    ),
  )).flat(),
  ...await Promise.all(
    [
      "ASCII",
      "ASCII_Hex_Digit",
      "Alphabetic",
      "Any",
      "Assigned",
      "Bidi_Control",
      "Bidi_Mirrored",
      "Case_Ignorable",
      "Cased",
      "Changes_When_Casefolded",
      "Changes_When_Casemapped",
      "Changes_When_Lowercased",
      "Changes_When_NFKC_Casefolded",
      "Changes_When_Titlecased",
      "Changes_When_Uppercased",
      "Dash",
      "Default_Ignorable_Code_Point",
      "Deprecated",
      "Diacritic",
      "Emoji",
      "Emoji_Component",
      "Emoji_Modifier",
      "Emoji_Modifier_Base",
      "Emoji_Presentation",
      "Extended_Pictographic",
      "Extender",
      "Grapheme_Base",
      "Grapheme_Extend",
      "Hex_Digit",
      "IDS_Binary_Operator",
      "IDS_Trinary_Operator",
      "ID_Continue",
      "ID_Start",
      "Ideographic",
      "Join_Control",
      "Logical_Order_Exception",
      "Lowercase",
      "Math",
      "Noncharacter_Code_Point",
      "Pattern_Syntax",
      "Pattern_White_Space",
      "Quotation_Mark",
      "Radical",
      "Regional_Indicator",
      "Sentence_Terminal",
      "Soft_Dotted",
      "Terminal_Punctuation",
      "Unified_Ideograph",
      "Uppercase",
      "Variation_Selector",
      "White_Space",
      "XID_Continue",
      "XID_Start",
    ].map(
      async (b) => [
        `\\p{${b}}`,
        new Set(
          (await import(
            `npm:@unicode/unicode-${esUnicodeVersion}/Binary_Property/${b}/code-points.js`
          )).default,
        ),
      ],
    ),
  ),
].filter((e) =>
  e[0].length <
    (regenerate_([...e[1]]).toString({ hasUnicodeFlag: true }).length - 2)
);

function regenerate(setA: number[]) {
  const set = new Set(setA);
  const es: Set<[string, Set<number>]> = new Set();
  a: for (const guh of esProps) {
    if (guh[1].isSubsetOf(set)) {
      const toRemove = [];
      for (const e of es) {
        if (e[1].isSupersetOf(guh[1])) continue a;
        if (e[1].isSubsetOf(guh[1])) toRemove.push(e);
      }
      for (const r of toRemove) es.delete(r);
      es.add(guh);
    }
  }
  for (const [, s] of es) {
    for (const c of s) set.delete(c);
  }
  // @ts-ignore
  const rere = createUnicodeCharacterClasses(regenerate_([...set]).data);
  return `[${[...es].map((e) => e[0]).join("")}${rere}]`;
}

const cp = {
  Mark: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/General_Category/Mark/code-points.js`
  )).default,
  JT: await generateUnicodeCodePoints(
    `https://unicode.org/Public/${unicodeVersion}/ucd/extracted/DerivedJoiningType.txt`,
    ["L", "R", "D", "T"],
  ),
  CombiningClassVirama: (await generateUnicodeCodePoints(
    `https://unicode.org/Public/${unicodeVersion}/ucd/extracted/DerivedCombiningClass.txt`,
    ["9"],
  ))["9"],

  // https://tools.ietf.org/html/rfc5893#section-1.4
  L: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Left_To_Right/code-points.js`
  )).default,
  R: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Right_To_Left/code-points.js`
  )).default,
  AL: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Arabic_Letter/code-points.js`
  )).default,
  EN: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/European_Number/code-points.js`
  )).default,
  ES: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/European_Separator/code-points.js`
  )).default,
  ET: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/European_Terminator/code-points.js`
  )).default,
  AN: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Arabic_Number/code-points.js`
  )).default,
  CS: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Common_Separator/code-points.js`
  )).default,
  NSM: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Nonspacing_Mark/code-points.js`
  )).default,
  BN: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Boundary_Neutral/code-points.js`
  )).default,
  ON: (await import(
    `npm:@unicode/unicode-${unicodeVersion}/Bidi_Class/Other_Neutral/code-points.js`
  )).default,
};

function r(strings: TemplateStringsArray, ...regs: string[]) {
  let output = "";
  for (const [i, reg] of regs.entries()) {
    output += strings[i];
    output += reg;
  }
  output += strings[strings.length - 1];
  return output;
}

const regexes = {
  // Validity criteria
  // https://unicode.org/reports/tr46/#Validity_Criteria

  // Step 5
  combiningMarks: r`${regenerate(cp.Mark)}`,

  // CONTEXTJ
  // https://tools.ietf.org/html/rfc5892#appendix-A

  // A.1. ZWNJ, Rule 2 / A.2. ZWJ, Rule 2
  combiningClassVirama: r`${regenerate(cp.CombiningClassVirama)}`,

  // A.1. ZWNJ, Rule 3
  // eslint-disable-next-line prefer-template
  validZWNJ: r`${regenerate([...cp.JT.L, ...cp.JT.D])}${regenerate(cp.JT.T)}*` +
    "\\u200C" +
    r`${regenerate(cp.JT.T)}*${regenerate([...cp.JT.R, ...cp.JT.D])}`,

  // BIDI Rule
  // https://tools.ietf.org/html/rfc5893#section-2

  bidiDomain: r`${regenerate([...cp.R, ...cp.AL, ...cp.AN])}`,

  // Step 1
  bidiS1LTR: r`${regenerate(cp.L)}`,
  bidiS1RTL: r`${regenerate([...cp.R, ...cp.AL])}`,

  // Step 2
  bidiS2: r`^${
    regenerate([
      ...cp.R,
      ...cp.AL,
      ...cp.AN,
      ...cp.EN,
      ...cp.ES,
      ...cp.CS,
      ...cp.ET,
      ...cp.ON,
      ...cp.BN,
      ...cp.NSM,
    ])
  }*$`,

  // Step 3
  bidiS3: r`${
    regenerate([
      ...cp.R,
      ...cp.AL,
      ...cp.EN,
      ...cp.AN,
    ])
  }${regenerate(cp.NSM)}*$`,

  // Step 4
  bidiS4EN: r`${regenerate(cp.EN)}`,
  bidiS4AN: r`${regenerate(cp.AN)}`,

  // Step 5
  bidiS5: r`^${
    regenerate([
      ...cp.L,
      ...cp.EN,
      ...cp.ES,
      ...cp.CS,
      ...cp.ET,
      ...cp.ON,
      ...cp.BN,
      ...cp.NSM,
    ])
  }*$`,

  // Step 6
  bidiS6: r`${regenerate([...cp.L, ...cp.EN])}${regenerate(cp.NSM)}*$`,
};

let out =
  '// deno-lint-ignore-file no-control-regex\nimport { SafeRegExp } from "../primordial-utils.ts";\n';

for (const name of Object.keys(regexes) as (keyof typeof regexes)[]) {
  out += `const ${name} = new SafeRegExp(\n  /${regexes[name]}/u,\n);\n`;
}
out += `export {\n${
  Object.keys(regexes).sort().map((e) => "  " + e + ",\n").join("")
}};\n`;
fs.writeFileSync("_internal/url/regexes.ts", out);

async function generateUnicodeCodePoints(
  url: string,
  interestedValuesA: string[],
) {
  const interestedValues = new Set(interestedValuesA);

  const source = await (await fetch(url)).text();
  const lines = source.split("\n");

  const map: Record<string, number[]> = {};
  for (const line of lines) {
    if (/^#/u.test(line) || !/;\x20/u.test(line)) {
      continue;
    }
    const data = line.trim().split(";");
    const category = data[1].split("#")[0].trim();
    const [begin, end = begin] = data[0].trim().split("..").map((str) =>
      parseInt(str, 16)
    );

    for (const i of range(begin, end)) {
      if (!map[category]) {
        if (interestedValues.size === 0 || interestedValues.has(category)) {
          map[category] = [];
        } else {
          continue;
        }
      }
      map[category].push(i);
    }
  }

  return map;
}

function* range(begin: number, end: number) {
  for (let i = begin; i <= end; i++) {
    yield i;
  }
}
