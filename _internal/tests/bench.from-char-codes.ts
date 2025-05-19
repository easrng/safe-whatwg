// deno-lint-ignore-file prefer-primordials
import { StringFromCharCodes } from "../from-char-codes.ts";
import { ReflectApply, String, StringFromCharCode } from "../primordials.js";

Deno.bench("1", () => {
  let str = "";
  for (let i = 0; i < 1000; i++) str += StringFromCharCode(97);
  if (str.length !== 1000) throw "err";
});
Deno.bench("2", () => {
  let str = "";
  for (let i = 0; i < 500; i++) str += StringFromCharCode(97, 97);
  if (str.length !== 1000) throw "err";
});
Deno.bench("4", () => {
  let str = "";
  for (let i = 0; i < 250; i++) str += StringFromCharCode(97, 97, 97, 97);
  if (str.length !== 1000) throw "err";
});
Deno.bench("8", () => {
  let str = "";
  for (let i = 0; i < 125; i++) {
    str += StringFromCharCode(97, 97, 97, 97, 97, 97, 97, 97);
  }
  if (str.length !== 1000) throw "err";
});
Deno.bench("16", () => {
  let str = "";
  for (let i = 0; i < 62; i++) {
    str += StringFromCharCode(
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
    );
  }
  str += StringFromCharCode(97, 97, 97, 97, 97, 97, 97, 97);
  if (str.length !== 1000) throw "err";
});

Deno.bench("32", () => {
  let str = "";
  for (let i = 0; i < 31; i++) {
    str += StringFromCharCode(
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
      97,
    );
  }
  str += StringFromCharCode(97, 97, 97, 97, 97, 97, 97, 97);
  if (str.length !== 1000) throw "err";
});

const arr = new Uint8Array(1000).fill(97);
Deno.bench("StringFromCharCodes", () => {
  const str = StringFromCharCodes(arr);
  if (str.length !== 1000) throw "err";
});
Deno.bench("Apply", () => {
  const str = ReflectApply(StringFromCharCode, String, arr);
  if (str.length !== 1000) throw "err";
});
