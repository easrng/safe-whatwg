import {
  ArrayBuffer,
  StringPrototypeCodePointAt,
  Uint32Array,
} from "./primordials.js";

export const codePointStrings = (str: string): string[] => {
  const codePoints: string[] = [];
  let i = 0, j = 0;
  for (;;) {
    const cp = StringPrototypeCodePointAt(str, i);
    if (cp === undefined) break;
    if (cp >> 16) {
      codePoints[j++] = str[i++] + str[i++];
    } else {
      codePoints[j++] = str[i++];
    }
  }
  return codePoints;
};

export const codePointArray = (str: string): Uint32Array => {
  const buffer = new ArrayBuffer(str.length * 4);
  const codePoints = new Uint32Array(buffer);
  let i = 0, j = 0;
  for (;;) {
    const cp = StringPrototypeCodePointAt(str, i);
    if (cp === undefined) break;
    i += ((codePoints[j++] = cp) >> 16) ? 2 : 1;
  }
  return new Uint32Array(buffer, 0, j);
};
