import { FunctionPrototypeBind } from "./primordials.js";

const _utf8Encoder = new TextEncoder();
export const utf8Encode = FunctionPrototypeBind(
  _utf8Encoder.encode,
  _utf8Encoder,
) as (
  str: string,
) => Uint8Array;
const _utf8Decoder = new TextDecoder("utf-8", { ignoreBOM: true });
export const utf8DecodeWithoutBOM = FunctionPrototypeBind(
  _utf8Decoder.decode,
  _utf8Decoder,
) as (data: Uint8Array) => string;
