// deno-lint-ignore-file prefer-primordials
import {
  TextDecoder as MyTextDecoder,
  TextEncoder as MyTextEncoder,
} from "../../encoding.ts";
import {
  TextDecoder as FSTEDDecoder,
  TextEncoder as FSTEDEncoder,
} from "npm:fastestsmallesttextencoderdecoder@1.0.22/NodeJS/EncoderAndDecoderNodeJS.min.mjs";

// uncomment to run profiling
/*
Deno.bench = (s, fn) => {
  if (s[0] !== "m") return;
  for (let i = 0; i < 1000; i++) fn();
};
// */

// warm up
for (let i = 0; i < 100; i++) {
  new MyTextEncoder().encode("abc");
  new TextEncoder().encode("abc");
  new FSTEDEncoder().encode("abc");
  new MyTextDecoder().decode(new Uint8Array([0x20]));
  new TextDecoder().decode(new Uint8Array([0x20]));
  new FSTEDDecoder().decode(new Uint8Array([0x20]));
}

Deno.bench("empty", () => {
  for (let i = 0; i < 100; i++) void 0;
});

Deno.bench("deno: construct TextEncoder", () => {
  for (let i = 0; i < 100; i++) new TextEncoder().encoding;
});
Deno.bench("me: construct TextEncoder", () => {
  for (let i = 0; i < 100; i++) new MyTextEncoder().encoding;
});
Deno.bench("fastestsmallesttextencoderdecoder: construct TextEncoder", () => {
  for (let i = 0; i < 100; i++) new FSTEDEncoder().encoding;
});

const s = ("a".repeat(100) + "\uD834\uDD1E".repeat(100) + "å".repeat(100) +
  "あわわわわ".repeat(100)).repeat(1000);
let encoded: Uint8Array;

Deno.bench("deno: TextEncoder", () => {
  const encoder = new TextEncoder();
  for (let i = 0; i < 10; i++) encoded = encoder.encode(s);
});
Deno.bench("me: TextEncoder", () => {
  const encoder = new MyTextEncoder();
  for (let i = 0; i < 10; i++) encoded = encoder.encode(s);
});
Deno.bench("fastestsmallesttextencoderdecoder: TextEncoder", () => {
  const encoder = new FSTEDEncoder();
  for (let i = 0; i < 10; i++) encoded = encoder.encode(s);
});

Deno.bench("deno: construct TextDecoder (default)", () => {
  for (let i = 0; i < 100; i++) new TextDecoder().encoding;
});
Deno.bench("me: construct TextDecoder (default)", () => {
  for (let i = 0; i < 100; i++) new MyTextDecoder().encoding;
});
Deno.bench(
  "fastestsmallesttextencoderdecoder: construct TextDecoder (default)",
  () => {
    for (let i = 0; i < 100; i++) new FSTEDDecoder().encoding;
  },
);

Deno.bench("deno: construct TextDecoder (utf8)", () => {
  for (let i = 0; i < 100; i++) new TextDecoder("utf8").encoding;
});
Deno.bench("me: construct TextDecoder (utf8)", () => {
  for (let i = 0; i < 100; i++) new MyTextDecoder("utf8").encoding;
});
Deno.bench(
  "fastestsmallesttextencoderdecoder: construct TextDecoder (utf8)",
  () => {
    for (let i = 0; i < 100; i++) new FSTEDDecoder("utf8").encoding;
  },
);

let _decoded: string;
const awawa = new TextEncoder().encode("a" + "wa".repeat(20000));
Deno.bench("deno: TextDecoder (utf-8, ascii only)", () => {
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < 100; i++) _decoded = decoder.decode(awawa);
});
Deno.bench("me: TextDecoder (utf-8, ascii only)", () => {
  const decoder = new MyTextDecoder("utf-8");
  for (let i = 0; i < 100; i++) _decoded = decoder.decode(awawa);
});
Deno.bench(
  "fastestsmallesttextencoderdecoder: TextDecoder (utf-8, ascii only)",
  () => {
    const decoder = new FSTEDDecoder("utf-8");
    for (let i = 0; i < 100; i++) _decoded = decoder.decode(awawa);
  },
);

Deno.bench("deno: TextDecoder (utf-8)", () => {
  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < 10; i++) _decoded = decoder.decode(encoded);
});
Deno.bench("me: TextDecoder (utf-8)", () => {
  const decoder = new MyTextDecoder("utf-8");
  for (let i = 0; i < 10; i++) _decoded = decoder.decode(encoded);
});
Deno.bench(
  "fastestsmallesttextencoderdecoder: TextDecoder (utf-8)",
  () => {
    const decoder = new FSTEDDecoder("utf-8");
    for (let i = 0; i < 10; i++) _decoded = decoder.decode(encoded);
  },
);

Deno.bench("deno: construct TextDecoder (sjis)", () => {
  for (let i = 0; i < 100; i++) new TextDecoder("sjis").encoding;
});
Deno.bench("me: construct TextDecoder (sjis)", () => {
  for (let i = 0; i < 100; i++) new MyTextDecoder("sjis").encoding;
});
const awawasjis = Uint8Array.from(
  { 0: 0x82, 1: 0xa0, length: 40000 },
  (e, i) => e || (i & 1 ? 0xed : 0x82),
);
Deno.bench("deno: TextDecoder (sjis)", () => {
  const decoder = new TextDecoder("sjis");
  for (let i = 0; i < 10; i++) _decoded = decoder.decode(awawasjis);
});
Deno.bench("me: TextDecoder (sjis)", () => {
  const decoder = new MyTextDecoder("sjis");
  for (let i = 0; i < 1000; i++) _decoded = decoder.decode(awawasjis);
});
