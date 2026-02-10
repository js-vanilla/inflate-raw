# inflate-raw

A **tiny, dependency-free, high-performance** vanilla JavaScript implementation of **raw DEFLATE (RFC 1951) decompression**.

* **Raw inflate only** (no zlib / gzip headers)
* **Single file**
* **Browser & Node.js compatible**
* Optimized for **low memory churn** and **fast startup**

> Input: Base64-encoded **raw DEFLATE stream**
> Output: Decoded UTF-8 string

---

## Why this exists

Most DEFLATE libraries (pako, fflate, zlib):

* Bundle gzip/zlib header handling you may not need
* Allocate many short-lived objects (GC pressure)
* Are larger than necessary for *inflate-only* use cases

`inflate-raw` focuses on **one job only**:

> **Fast, minimal, raw DEFLATE decompression in plain JavaScript**

This makes it ideal when **bundle size, cold-start time, and memory behavior** matter.

---

## Key features

### 🔹 Raw DEFLATE only (RFC 1951)

* No zlib header
* No gzip wrapper
* Exactly what many binary protocols, WASM payloads, and embedded formats use

---

### 🔹 Extremely small footprint

* ~4 KB minified (3.98 kB)
* ~1.8–2.5 KB gzipped (2.22 kB)
* No dependencies
* No polyfills required

---

### 🔹 Memory-efficient design

This implementation is **not a straight port** of zlib logic.

Notable optimizations:

* Reuses large typed arrays across blocks
* Shared lookup tables for literals, distances, and code lengths
* Minimal temporary allocations
* Reduced GC pressure in long or repeated inflations

This matters for:

* Mobile browsers
* Workers
* Tight loops
* Streaming-like workloads

---

### 🔹 Fast Huffman decoding

* Prebuilt LUTs with bit-reversed prefixes
* Fixed Huffman trees cached and reused
* Dynamic trees built in-place using shared buffers

This keeps decode speed competitive with larger libraries despite the size.

---

### 🔹 Zero dependencies, zero globals

* Pure vanilla JS
* Works in:

  * Browsers
  * Web Workers
  * Node.js
  * Deno / Bun
* No reliance on `zlib`, `Buffer`, or Node internals

---

## When should you use this?

Perfect fit if you:

* Receive **raw deflate** data (no wrapper)
* Need the **smallest possible decompressor**
* Want predictable memory usage
* Don’t want gzip / zlib overhead
* Are building:

  * Browser libraries
  * WASM loaders
  * Binary protocols
  * Embedded formats
  * Self-contained tools

Not ideal if you need:

* gzip / zlib headers
* streaming APIs
* compression (deflate)

---

## Installation

### CDN (browser)

```html
<script src="https://cdn.jsdelivr.net/gh/js-vanilla/inflate-raw@main/inflate-raw.min.js"></script>
```

---

## Demo

* https://raw.githack.com/js-vanilla/inflate-raw/refs/heads/main/demo.html

---

## Usage

```js
// Base64-encoded raw DEFLATE data
const compressed = "eJyrVkrLz1eyUkpKLFKqBQAQ9gQJ";

// Returns UTF-8 decoded string
const result = inflateRaw(compressed);

console.log(result);
```

> Input **must** be raw DEFLATE (RFC 1951), not zlib or gzip.

---

## API

### `inflateRaw(base64: string): string`

* **Input:** Base64-encoded raw DEFLATE stream
* **Output:** UTF-8 decoded string
* Throws or produces invalid output if input is malformed

---

## Size comparison

| Library         | Min + Gzip  | Raw inflate only | Dependencies |
| --------------- | ----------- | ---------------- | ------------ |
| **inflate-raw** | ~1.8–2.5 KB | ✅                | 0            |
| tiny-inflate    | ~2–3 KB     | ✅                | 0            |
| fflate          | ~3–4 KB*    | ✅                | 0            |
| pako            | ~12–15 KB   | ❌                | 0            |

* inflate-only build

---

## Implementation notes

* Uses typed arrays (`Uint8Array`, `Uint16Array`, `Int32Array`)
* Manual bit reader
* LUT-based Huffman decoding
* Fixed trees cached once
* Dynamic trees built per block
* Overlap-safe match copying

This is designed to be **small, fast, and predictable**, not a full zlib clone.

---

## Status

Stable for valid raw DEFLATE streams.

Test coverage is still growing — contributions welcome, especially:

* Edge cases
* Large blocks
* zlib test suite vectors

---

## License

MIT


