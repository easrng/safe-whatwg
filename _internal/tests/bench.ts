import { URL as MyURL } from "../../url.ts";
import { URL as WhatwgURL } from "npm:whatwg-url@14.2.0";

// uncomment to run profiling
/*
Deno.bench = (s, fn) => {
  if (s[0] !== "m") return;
  for (let i = 0; i < 1000; i++) fn();
};
// */

// warm up
for (let i = 0; i < 100; i++) {
  new URL("https://deno.land");
  new MyURL("https://deno.land");
  new WhatwgURL("https://deno.land");
}

Deno.bench("deno: basic url construct", () => {
  for (let i = 0; i < 100; i++) new URL("https://deno.land").href;
});
Deno.bench("me: basic url construct", () => {
  for (let i = 0; i < 100; i++) new MyURL("https://deno.land").href;
});
Deno.bench("whatwg-url: basic url construct", () => {
  for (let i = 0; i < 100; i++) new WhatwgURL("https://deno.land").href;
});

Deno.bench("deno: basic url parse", () => {
  for (let i = 0; i < 100; i++) URL.parse("https://deno.land")!.href;
});
Deno.bench("me: basic url parse", () => {
  for (let i = 0; i < 100; i++) MyURL.parse("https://deno.land")!.href;
});
Deno.bench("whatwg-url: basic url parse", () => {
  for (let i = 0; i < 100; i++) WhatwgURL.parse("https://deno.land")!.href;
});

Deno.bench("deno: idn url construct", () => {
  for (let i = 0; i < 100; i++) new URL("https://βόλος.com").href;
});
Deno.bench("me: idn url construct", () => {
  for (let i = 0; i < 100; i++) new MyURL("https://βόλος.com").href;
});
Deno.bench("whatwg-url: idn url construct", () => {
  for (let i = 0; i < 100; i++) new WhatwgURL("https://βόλος.com").href;
});

Deno.bench("deno: set url hostname", () => {
  for (let i = 0; i < 100; i++) {
    const url = new URL("https://deno.land");
    url.hostname = "βόλος.com";
    url.href;
  }
});
Deno.bench("me: set url hostname", () => {
  for (let i = 0; i < 100; i++) {
    const url = new MyURL("https://deno.land");
    url.hostname = "βόλος.com";
    url.href;
  }
});
Deno.bench("whatwg-url: set url hostname", () => {
  for (let i = 0; i < 100; i++) {
    const url = new WhatwgURL("https://deno.land");
    url.hostname = "βόλος.com";
    url.href;
  }
});
