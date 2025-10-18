// deno-lint-ignore-file explicit-module-boundary-types no-explicit-any no-var
export function __rust_alloc(size: any, align: any): number;
export function __rust_dealloc(ptr: any, size: any, align: any): void;
export var buffer: globalThis.ArrayBuffer;
export function decoder_decode_to_utf16(decoder: any, ptr_src: any, ptr_src_len: any, ptr_dst: any, ptr_dst_len: any, bool_last: any, ptr_had_replacements: any): number;
export function decoder_free($0: any): void;
export function decoder_max_utf16_buffer_length($0: any, $1: any): number;
export function encoding_for_label_no_replacement($0: any, $1: any): number;
export function encoding_name($0: any, $1: any): number;
export var ENCODING_NAME_MAX_LENGTH: number;
export function encoding_new_decoder_with_bom_removal($0: any): number;
export function encoding_new_decoder_without_bom_handling($0: any): number;
export var HEAPU32: Uint32Array<globalThis.ArrayBuffer>;
export var HEAPU8: globalThis.Uint8Array<globalThis.ArrayBuffer>;
