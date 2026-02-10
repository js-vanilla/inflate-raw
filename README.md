# inflate-raw

**Tiny, dependency-free vanilla JavaScript implementation** of **raw DEFLATE decompression** (RFC 1951).

- Raw inflate only (no zlib or gzip headers/checksums)
- Single-file, no dependencies
- Works in browsers, Node.js, Deno, Bun, Web Workers
- Designed for low memory usage and fast startup

> **CDN/minified version:** `inflateRaw(base64String) → string`  
> **Source version:** `inflateRaw(Uint8Array) → string`

---

## Why this library?

Many popular DEFLATE libraries (pako, fflate, zlib) include:

- Unneeded gzip/zlib wrapper support
- Larger bundle size
- Higher GC pressure from many allocations

`inflate-raw` is built for one purpose only:

> Minimal, fast, raw-DEFLATE-only decompression in plain JavaScript

Ideal when **bundle size**, **cold-start performance**, and **memory predictability** matter.

---

## Key Features

- **Raw DEFLATE only** (RFC 1951) — no headers, no checksums
- **Very small** — ~3.9–4.2 kB minified, ~1.9–2.3 kB gzipped
- **Memory optimized** — reuses typed arrays, shared LUTs, minimal temp objects
- **Fast Huffman decoding** — lookup-table based with bit-reversed prefixes
- **No dependencies** — pure vanilla JS
- **Broad compatibility** — browsers (modern), Node.js, Deno, Bun

---

## Installation

### Via CDN (recommended for browsers)

```html
<script src="https://cdn.jsdelivr.net/gh/js-vanilla/inflate-raw@main/inflate-raw.min.js"></script>
```

After loading, the global function `inflateRaw` becomes available.

### Via source (if you prefer Uint8Array input)

Download or import `inflate-raw.js` from the repo.

---

## Usage

### CDN / Minified version (base64 input)

```js
// Base64-encoded raw DEFLATE data
const compressedBase64 = "80jNyclXKM8vyklRBAA=";

// Returns decoded UTF-8 string
const result = inflateRaw(compressedBase64);

console.log(result);  // → "Hello world!"
```

### Source version (Uint8Array input)

```js
const compressedBytes = new Uint8Array([/* raw deflate bytes */]);

const result = inflateRaw(compressedBytes);  // returns string
```

**Important:** The input must be **raw DEFLATE** data (no zlib/gzip wrapper).

---

## API

### `inflateRaw(input): string`

```js
const text = inflateRaw(base64);
```

---

## Demo

A live demo showing both static and interactive usage is available at:

* https://raw.githack.com/js-vanilla/inflate-raw/refs/heads/main/demo.html
(or check `/demo.html` in the repository)

(If the link is down, please open an issue — static hosting can be flaky.)

---

## Size Comparison (approximate, minified + gzipped)

| Library         | Size (min + gzip) | Raw inflate only | Dependencies |
|-----------------|-------------------|------------------|--------------|
| **inflate-raw** | ~1.9–2.3 kB       | Yes              | 0            |
| tiny-inflate    | ~2.5–3 kB         | Yes              | 0            |
| fflate (inflate-only) | ~3–4 kB     | Yes              | 0            |
| pako            | ~12–15 kB         | No               | 0            |

*Measured on latest versions as of early 2026.*

---

## Implementation Notes

- Uses `Uint8Array`, `Uint16Array`, `Int32Array`
- Custom bit reader with 16-bit lookahead
- Reused memory for trees and output buffer
- Fixed Huffman trees cached globally
- Overlap-safe LZ77 match copying
- No streaming support (whole input at once)

This is **not** a full zlib replacement — it's intentionally minimal.

---

## Browser Support

Works in all modern browsers (Chrome 80+, Firefox 80+, Safari 14+, Edge 80+).  
Requires `atob`/`btoa` for base64 usage (universally available).

---

## Status

Stable for well-formed raw DEFLATE streams.  
Edge-case coverage is still improving — contributions welcome!

Tested against:
- Small & medium payloads
- Fixed/dynamic Huffman blocks
- Back-reference corner cases

---

## License

[MIT](./LICENSE)
