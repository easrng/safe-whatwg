// Copyright 2018-2025 the Deno authors. MIT license.

import {
  ArrayBufferPrototypeGetByteLength,
  DataViewPrototypeGetBuffer,
  DataViewPrototypeGetByteLength,
  DataViewPrototypeGetByteOffset,
  RangeError,
  ReflectApply,
  SharedArrayBufferPrototypeGetByteLength,
  StringFromCharCode,
  StringPrototypeCharCodeAt,
  StringPrototypeCodePointAt,
  TypeError,
  Uint16Array,
  Uint8Array,
} from "./_internal/primordials.js";
import {
  TypedArrayPrototypeGetBuffer,
  TypedArrayPrototypeGetByteLength,
  TypedArrayPrototypeGetByteOffset,
  TypedArrayPrototypeSet,
  TypedArrayPrototypeSlice,
} from "./_internal/primordial-utils.ts";
import * as webidl from "./_internal/webidl.ts";
import {
  __rust_alloc,
  __rust_dealloc,
  buffer as encodingBuffer,
  decoder_decode_to_utf16,
  decoder_free,
  decoder_max_utf16_buffer_length,
  encoding_for_label_no_replacement,
  encoding_name,
  ENCODING_NAME_MAX_LENGTH,
  encoding_new_decoder_with_bom_removal,
  encoding_new_decoder_without_bom_handling,
  HEAPU32,
  HEAPU8,
} from "./_internal/encoding_rs.js";
import { uncurryThis } from "./_internal/primordials.js";

function op_encoding_normalize_label(label: string) {
  const ptrSize = label.length < ENCODING_NAME_MAX_LENGTH
    ? label.length
    : ENCODING_NAME_MAX_LENGTH;
  const ptr = __rust_alloc(
    ptrSize,
    1,
  );
  try {
    for (let i = 0; i < label.length; i++) {
      HEAPU8[ptr + i] = StringPrototypeCharCodeAt(label, i);
    }
    const encoding = encoding_for_label_no_replacement(ptr, label.length);
    if (!encoding) return null;
    let name = "";
    const nameLen = encoding_name(encoding, ptr);
    for (let i = 0; i < nameLen; i++) {
      const cc = HEAPU8[ptr + i]!;
      name += StringFromCharCode(cc > 64 && cc < 91 ? 0x20 | cc : cc);
    }
    return { encoding, label: name };
  } finally {
    __rust_dealloc(ptr, ptrSize, 1);
  }
}

let isTextDecoder: (v: object) => v is TextDecoder;
class TextDecoder {
  static {
    // deno-lint-ignore prefer-primordials
    isTextDecoder = (v) => #encoding in v;
  }

  #encoding: number;
  #encodingLabel: string;
  #fatal: boolean;
  #ignoreBOM: boolean;
  #handle: number | null = null;

  /**
   * @param {string} label
   * @param {TextDecoderOptions} options
   */
  constructor(
    label: string = "utf-8",
    options: TextDecoderOptions = ({ __proto__: null } as TextDecoderOptions),
  ) {
    const prefix = "Failed to construct 'TextDecoder'";
    label = webidl.converters.DOMString(label, prefix, "Argument 1");
    options = webidl.converters.TextDecoderOptions(
      options,
      prefix,
      "Argument 2",
    );
    const encoding = op_encoding_normalize_label(label);
    if (!encoding) {
      throw new RangeError(
        `The encoding label provided ('${label}') is invalid.`,
      );
    }
    this.#encoding = encoding.encoding;
    this.#encodingLabel = encoding.label;
    this.#fatal = options.fatal!;
    this.#ignoreBOM = options.ignoreBOM!;
  }

  /** @returns {string} */
  get encoding(): string {
    webidl.assertBranded(this, isTextDecoder);
    return this.#encodingLabel;
  }

  /** @returns {boolean} */
  get fatal(): boolean {
    webidl.assertBranded(this, isTextDecoder);
    return this.#fatal;
  }

  /** @returns {boolean} */
  get ignoreBOM(): boolean {
    webidl.assertBranded(this, isTextDecoder);
    return this.#ignoreBOM;
  }

  /**
   * @param {BufferSource} [input]
   * @param {TextDecodeOptions} options
   */
  decode(
    input: BufferSource = new Uint8Array(),
    options: TextDecodeOptions | undefined = undefined,
  ): string {
    webidl.assertBranded(this, isTextDecoder);
    const prefix = "Failed to execute 'decode' on 'TextDecoder'";
    if (input !== undefined) {
      input = webidl.converters.BufferSource(input, prefix, "Argument 1", {
        allowShared: true,
      });
    }
    let stream = false;
    if (options !== undefined) {
      options = webidl.converters.TextDecodeOptions(
        options,
        prefix,
        "Argument 2",
      );
      stream = options.stream!;
    }
    try {
      let buffer: ArrayBufferLike | undefined;
      let byteOffset!: number;
      let byteLength!: number;
      try {
        buffer = TypedArrayPrototypeGetBuffer(
          input,
        );
        byteOffset = TypedArrayPrototypeGetByteOffset(
          input,
        );
        byteLength = TypedArrayPrototypeGetByteLength(
          input,
        );
      } catch {
        // not a typed array
      }
      if (!buffer) {
        try {
          buffer = DataViewPrototypeGetBuffer(/** @type {DataView} */ (input));
          byteOffset = DataViewPrototypeGetByteOffset(
            /** @type {DataView} */ (input),
          );
          byteLength = DataViewPrototypeGetByteLength(
            /** @type {DataView} */ (input),
          );
        } catch {
          // not a dataview
        }
      }

      if (!buffer) {
        buffer = input as Exclude<typeof input, DataView | ArrayBufferView>;
        byteOffset = 0;
        try {
          byteLength = ArrayBufferPrototypeGetByteLength(buffer);
        } catch {
          byteLength = SharedArrayBufferPrototypeGetByteLength(buffer);
        }
      }

      if (this.#handle === null) {
        this.#handle = this.#ignoreBOM
          ? encoding_new_decoder_without_bom_handling(this.#encoding)!
          : encoding_new_decoder_with_bom_removal(this.#encoding)!;
      }

      const max_buffer_length = decoder_max_utf16_buffer_length(
        this.#handle,
        byteLength,
      );

      // memory layout
      // u32 src_len | u32 dst_len | u8 had_replacements | pad8 | u16[max_buffer_length] dst | u8[byteLength] src
      let size = 0;

      // u32 src_len
      const o_src_len = size;
      size += 4;

      // u32 dst_len
      const o_dst_len = size;
      size += 4;

      // u8 had_replacements
      const o_had_replacements = size;
      size += 1;

      // pad8
      size += 1;

      // u16[max_buffer_length] dst
      const o_dst = size;
      size += max_buffer_length * 2;

      // u8[byteLength] src
      const o_src = size;
      size += byteLength;

      const buf = __rust_alloc(size, 4);
      try {
        HEAPU32[(buf + o_src_len) / 4] = byteLength;
        HEAPU32[(buf + o_dst_len) / 4] = max_buffer_length;
        TypedArrayPrototypeSet(
          HEAPU8,
          new Uint8Array(buffer, byteOffset, byteLength),
          buf + o_src,
        );
        decoder_decode_to_utf16(
          this.#handle,
          buf + o_src,
          buf + o_src_len,
          buf + o_dst,
          buf + o_dst_len,
          +!stream,
          buf + o_had_replacements,
        );
        const had_replacements = HEAPU8[buf + o_had_replacements];
        if (had_replacements && this.#fatal) {
          throw new TypeError("The encoded data is not valid");
        }
        const written = HEAPU32[(buf + o_dst_len) / 4];
        return ReflectApply(
          StringFromCharCode,
          null,
          new Uint16Array(encodingBuffer, buf + o_dst, written),
        );
      } finally {
        __rust_dealloc(buf, size, 4);
      }
    } finally {
      if (!stream && this.#handle !== null) {
        decoder_free(this.#handle);
        this.#handle = null;
      }
    }
  }
}

webidl.configureInterface(TextDecoder, "TextDecoder");

let isTextEncoder: (v: object) => v is TextEncoder;
class TextEncoder {
  #brand = undefined;
  static {
    // deno-lint-ignore prefer-primordials
    isTextEncoder = (v) => #brand in v;
  }
  /** @returns {string} */
  get encoding(): string {
    webidl.assertBranded(this, isTextEncoder);
    return "utf-8";
  }

  /**
   * @param {string} input
   * @returns {Uint8Array}
   */
  encode(input: string = ""): Uint8Array {
    webidl.assertBranded(this, isTextEncoder);
    // The WebIDL type of `input` is `USVString`, but `core.encode` already
    // converts lone surrogates to the replacement character.
    input = webidl.converters.DOMString(
      input,
      "Failed to execute 'encode' on 'TextEncoder'",
      "Argument 1",
    );
    const buffer = new Uint8Array(input.length * 3);
    const result = TextEncoderEncodeInto(this, input, buffer);
    return TypedArrayPrototypeSlice(buffer, 0, result.written);
  }

  /**
   * @param {string} source
   * @param {Uint8Array} destination
   * @returns {TextEncoderEncodeIntoResult}
   */
  encodeInto(
    source: string,
    destination: Uint8Array,
  ): TextEncoderEncodeIntoResult {
    webidl.assertBranded(this, isTextEncoder);
    const prefix = "Failed to execute 'encodeInto' on 'TextEncoder'";
    // The WebIDL type of `source` is `USVString`, but the encoder should
    // already convert lone surrogates to the replacement character.
    source = webidl.converters.DOMString(source, prefix, "Argument 1");
    destination = webidl.converters.Uint8Array(
      destination,
      prefix,
      "Argument 2",
      {
        allowShared: true,
      },
    );
    const checkFit = source.length * 3 > destination.length;
    let read = 0, written = 0;
    for (let i = 0; i < source.length; i++) {
      let codePoint = StringPrototypeCodePointAt(source, i)!;
      if ((codePoint & 0b1111100000000000) === 0b1101100000000000) {
        codePoint = 0xFFFD;
      }
      const bytesNeeded = (codePoint <= 0x7f)
        ? 1
        : (codePoint <= 0x7ff)
        ? 2
        : (codePoint <= 0xffff)
        ? 3
        : (i++, 4);
      if (checkFit && written + bytesNeeded > destination.length) break;
      if (codePoint <= 0x7f) {
        destination[written++] = codePoint;
      } else if (codePoint <= 0x7ff) {
        destination[written++] = 0xc0 | (codePoint >> 6);
        destination[written++] = 0x80 | (codePoint & 0x3f);
      } else if (codePoint <= 0xffff) {
        destination[written++] = 0xe0 | (codePoint >> 12);
        destination[written++] = 0x80 | ((codePoint >> 6) & 0x3f);
        destination[written++] = 0x80 | (codePoint & 0x3f);
      } else {
        destination[written++] = 0xf0 | (codePoint >> 18);
        destination[written++] = 0x80 | ((codePoint >> 12) & 0x3f);
        destination[written++] = 0x80 | ((codePoint >> 6) & 0x3f);
        destination[written++] = 0x80 | (codePoint & 0x3f);
        read++;
      }
      read++;
    }
    return { read, written };
  }
}

const TextEncoderEncodeInto = uncurryThis(TextEncoder.prototype.encodeInto);

webidl.configureInterface(TextEncoder, "TextEncoder");

webidl.converters.TextDecoderOptions = webidl.createDictionaryConverter(
  "TextDecoderOptions",
  [
    {
      key: "fatal",
      converter: webidl.converters.boolean,
      defaultValue: false,
      __proto__: null,
    },
    {
      key: "ignoreBOM",
      converter: webidl.converters.boolean,
      defaultValue: false,
      __proto__: null,
    },
  ],
);
webidl.converters.TextDecodeOptions = webidl.createDictionaryConverter(
  "TextDecodeOptions",
  [
    {
      key: "stream",
      converter: webidl.converters.boolean,
      defaultValue: false,
      __proto__: null,
    },
  ],
);

export { TextDecoder, TextEncoder };
