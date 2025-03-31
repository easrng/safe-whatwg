# safe-whatwg

An implementation of various Web/WHATWG apis, intended to be robust, correct,
and portable.

## Implementation status

### ✅ URL and URLSearchParams

```ts
import { URL, URLSearchParams } from "jsr:@easrng/safe-whatwg/url";
```

The implementation structure is based on Deno's
[00_webidl.js](https://github.com/denoland/deno/blob/main/ext/webidl/00_webidl.js)
and [00_url.js](https://github.com/denoland/deno/blob/main/ext/url/00_url.js),
with algorithms from [whatwg-url](https://github.com/jsdom/whatwg-url),
[tr46](https://github.com/jsdom/tr46), and node's
[internal/url](https://github.com/nodejs/node/blob/main/lib/internal/url.js). It
complies with the URL spec up to commit
[6c78200](https://github.com/whatwg/url/commit/6c782003a2d53b1feecd072d1006eb8f1d65fb2d).
It requires that the host environment support UTF-8 TextEncoder and TextDecoder.

## Robustness

This library should be robust against any environment modifications that occur
after it is imported. If it isn't, please report it, even if it's a weird
improbable edge case.
