import type { Safe } from "./primordial-utils.ts";
import { FunctionPrototypeBind } from "./primordials.js";

// deno-lint-ignore no-property-access/no-property-access
const _utf8Encoder: Safe<TextEncoder> = new TextEncoder();
export const utf8Encode = FunctionPrototypeBind(
  _utf8Encoder.encode,
  _utf8Encoder,
) as (
  str: string,
) => Uint8Array;
// deno-lint-ignore no-property-access/no-property-access
const _utf8Decoder: Safe<TextDecoder> = new TextDecoder("utf-8", {
  ignoreBOM: true,
});
export const utf8DecodeWithoutBOM = FunctionPrototypeBind(
  _utf8Decoder.decode,
  _utf8Decoder,
) as (data: Uint8Array) => string;
