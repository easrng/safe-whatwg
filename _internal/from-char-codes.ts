import { StringFromCharCode } from "./primordials.js";

export function StringFromCharCodes(codes: ArrayLike<number>) {
  let str = "";
  let i = 0;
  for (; i + 15 < codes.length; i += 16) {
    str += StringFromCharCode(
      codes[i],
      codes[i + 1],
      codes[i + 2],
      codes[i + 3],
      codes[i + 4],
      codes[i + 5],
      codes[i + 6],
      codes[i + 7],
      codes[i + 8],
      codes[i + 9],
      codes[i + 10],
      codes[i + 11],
      codes[i + 12],
      codes[i + 13],
      codes[i + 14],
      codes[i + 15],
    );
  }
  for (; i < codes.length; i++) {
    str += StringFromCharCode(codes[i]);
  }
  return str;
}
