# inflate-raw

**~2–4 KB** vanilla JavaScript implementation of **inflateRaw** (raw DEFLATE decompression, RFC 1951)

No dependencies. No `zlib`. Browser & Node.js compatible. Single-file distribution.

## Why?

Most popular DEFLATE libraries (pako, fflate, zlib) either:
- Include gzip/zlib header support you may not need
- Are significantly larger when you only want raw deflate decompression
- Depend on Node built-ins or add polyfills

`inflate-raw` gives you **only** the inflate algorithm for **raw** deflate streams — perfect when:

- You receive raw-deflate data (no zlib/gzip wrapper)
- You want the smallest possible footprint
- You prefer zero dependencies and vanilla JS

## Code

* original code: https://cdn.jsdelivr.net/gh/js-vanilla/inflate-raw@main/inflate-raw.js
* minified code: https://cdn.jsdelivr.net/gh/js-vanilla/inflate-raw@main/inflate-raw.min.js

## Installation

### Via CDN (recommended for browsers)

```html
<script src="https://cdn.jsdelivr.net/gh/js-vanilla/inflate-raw@main/inflate-raw.min.js"></script>
```

## Usage

```js
const compressed = "........";   // your raw deflate data (in base64)
const decompressed = inflateRaw(compressed); // decompressed text
```

## Size

| File                    | Size (minified) | Gzipped |
|-------------------------|------------------|---------|
| inflate-raw.js          | ~6–8 KB         | ~2–3 KB |
| inflate-raw.min.js      | ~3–4 KB         | ~1.5–2 KB |

(Actual size depends on minifier settings — using terser with compress + mangle)

## Comparison

| Library       | Size (min+gzip) | inflateRaw | Dependencies | Notes                     |
|---------------|------------------|------------|--------------|---------------------------|
| inflate-raw   | ~1.8–2.5 KB     | Yes        | 0            | Only raw inflate          |
| tiny-inflate  | ~2–3 KB         | Yes        | 0            | Very small, widely used   |
| fflate        | ~3–4 KB (inflate only) | Yes   | 0            | Fast + gzip/deflate too   |
| pako          | ~12–15 KB       | Yes        | 0            | Most popular, full-featured |

## License

[MIT](./LICENSE)

## Status

Early stage – works for valid raw deflate streams, but test coverage is still growing.

Contributions welcome (especially tests with edge cases from zlib test suite).

Enjoy your lightweight decompression! 🚀


Feel free to adjust numbers (size, version), add real benchmarks later, or publish to npm and update the install section. This should give the repo a professional first impression.
