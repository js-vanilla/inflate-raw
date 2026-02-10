/**
 * @license
 * MIT License
 *
 * Copyright (c) 2026 js-vanilla
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var inflateRaw = (() => {

  const $fromBase64 = Uint8Array.fromBase64?.bind(Uint8Array) ?? ((b64) => {
    const binStr = atob(b64);
    let n = binStr.length;
    const input = new Uint8Array(n);
    while (n--) input[n] = binStr.charCodeAt(n);
    return input;
  });

  const $inflate = (b64) => {
    const input = $fromBase64(b64);

    // Output Buffer (Standard)
    let outSize = input.length * 4;
    if (outSize < 32768) outSize = 32768;
    let out = new Uint8Array(outSize);
    let outIdx = 0;
    const ensure = (need) => {
      let n = out.length;
      const required = outIdx + need;
      if (required > n) {
        do { n = (n * 3) >>> 1; } while (n < required);
        const newOut = new Uint8Array(n);
        newOut.set(out);
        out = newOut;
      }
    };

    // --- MEMORY OPTIMIZATION ---
    // We reuse these for every block to avoid Garbage Collection churn.
    const tableMemory = new Uint16Array(65536 + 320 + 512 + 32);
    const lTable = tableMemory.subarray(0, 32768); // Shared for Literals & CodeLengths
    const dTable = tableMemory.subarray(32768, 65536); // Shared for Distances
    const sortedSymsMem = tableMemory.subarray(65536, 65536 + 320); // size = 320
    let lxTree; // size = 512
    let dxTree; // size = 32
    const treeMemory = new Int32Array(48); // Small temp buffer

    // Bit Reader
    let bitBuf = 0, bitLen = 0, inpIdx = 0;
    const refill = () => {
      while (bitLen < 16 && inpIdx < input.length) {
        bitBuf |= input[inpIdx++] << bitLen;
        bitLen += 8;
      }
    };
    const readBits = (n) => {
      refill();
      const res = bitBuf & ((1 << n) - 1);
      bitBuf >>>= n;
      bitLen -= n;
      return res;
    };

    // Constants
    const ord = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    const lensOf0 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
    const ex0 = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
    const distsOf1 = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
    const ex1 = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

    const countsMem = treeMemory.subarray(0, 16);
    const offsetsMem = treeMemory.subarray(16, 32);
    // Modified buildTree: Accepts a target buffer (lut) to fill
    const buildTree = (lens, lut) => {
      const counts = countsMem.fill(0);
      let maxBits = 0;
      for (let i = 0; i < lens.length; i++) {
        const l = lens[i];
        if (l > 0) {
          counts[l]++;
          if (l > maxBits) maxBits = l;
        }
      }

      const limit = 1 << maxBits;
      const resLut = lut.subarray(0, limit);
      const offsets = offsetsMem;
      let off = 0;
      for (let i = 1; i <= maxBits; i++) {
        offsets[i] = off;
        off += counts[i];
      }

      const sorted = sortedSymsMem;
      for (let i = 0; i < lens.length; i++) {
        if (lens[i] > 0) sorted[offsets[lens[i]]++] = i;
      }

      let rev = 0;
      let sortedIdx = 0;
      for (let len = 1; len <= maxBits; len++) {
        const step = 1 << len;
        const count = counts[len];
        for (let i = 0; i < count; i++) {
          const sym = sorted[sortedIdx++];
          const entry = (len << 9) | sym;

          // Fill all indices in the LUT that share this bit-reversed prefix
          for (let j = rev; j < limit; j += step) resLut[j] = entry;

          // Increment 'rev' in bit-reversed order:
          // Propagate carry from the MSB (at position len-1) down to the LSB
          let bit = 1 << (len - 1);
          while (rev & bit) {
            rev ^= bit;
            bit >>= 1;
          }
          rev ^= bit;
        }
      }
      return resLut;
    };

    const decodeSymbol = (lut) => {
      refill();
      // Mask allows us to use smaller tables for smaller trees
      const bitMask = lut.length - 1;
      const entry = lut[bitBuf & bitMask];
      const len = entry >>> 9;
      bitBuf >>>= len;
      bitLen -= len;
      return entry & 0x1FF;
    };

    // Temp buffers
    const ms = new Uint8Array(320);
    const clens = ms.subarray(0, 19);

    let fixedTreeOk = false;

    // Main Loop
    let isFinal = 0;
    while (!isFinal) {
      const bits = readBits(3);
      isFinal = bits & 1;
      const type = bits >> 1;

      if (type === 0) { // Uncompressed
        bitBuf = bitLen = 0;
        const len = input[inpIdx++] | (input[inpIdx++] << 8);
        inpIdx += 2; // Skip nlen
        ensure(len);
        out.set(input.subarray(inpIdx, inpIdx + len), outIdx);
        outIdx += len;
        inpIdx += len;

      } else { // Compressed
        let lTree, dTree;

        if (type === 1) { // Fixed
          if (!fixedTreeOk) {
            fixedTreeOk = true;
            let offset = 65536 + 320;

            const ls = ms.subarray(0, 288);
            ls.fill(8, 0, 144); ls.fill(9, 144, 256); ls.fill(7, 256, 280); ls.fill(8, 280, 288);
            lxTree = tableMemory.subarray(offset, (offset += 512));
            buildTree(ls, lxTree);

            const ds = ms.subarray(0, 32).fill(5);
            dxTree = tableMemory.subarray(offset, (offset += 32));
            buildTree(ds, dxTree);
          }
          lTree = lxTree;
          dTree = dxTree;

        } else { // Dynamic
          const bits = readBits(14);
          const hlit = (bits & 0b11111) + 257;
          const hdist = ((bits >> 5) & 0b11111) + 1;
          const hclen = ((bits >> 10) & 0b1111) + 4;

          clens.fill(0);
          for (let i = 0; i < hclen; i++) clens[ord[i]] = readBits(3);

          // Use lTable temporarily for Code Length tree
          const clTree = buildTree(clens, lTable);

          const hLen = hlit + hdist;
          const allLens = ms.subarray(0, hLen).fill(0);

          let i = 0;
          while (i < hLen) {
            const s = decodeSymbol(clTree);
            if (s < 16) allLens[i++] = s;
            else {
              let r = 0, val = 0;
              if (s === 16) { r = 3 + readBits(2); val = allLens[i - 1]; }
              else if (s === 17) { r = 3 + readBits(3); }
              else { r = 11 + readBits(7); }
              while (r--) allLens[i++] = val;
            }
          }
          // Now build actual trees into their respective buffers
          lTree = buildTree(allLens.subarray(0, hlit), lTable);
          dTree = buildTree(allLens.subarray(hlit), dTable);
        }

        // Decode Huffman Block
        while (true) {
          const s = decodeSymbol(lTree);
          if (s < 256) {
            ensure(1);
            out[outIdx++] = s;
          } else if (s === 256) {
            break;
          } else {
            const si = s - 257;
            let len = lensOf0[si] + readBits(ex0[si]);
            const di = decodeSymbol(dTree);
            const dist = distsOf1[di] + readBits(ex1[di]);

            ensure(len);
            // Match Copy
            let pos = outIdx - dist;
            if (len <= 8) {
              while (len--) out[outIdx++] = out[pos++];
            } else {
              // Overlap safe copy
              const end = outIdx + len;
              while (outIdx < end) {
                const m = end - outIdx;
                const n = outIdx - pos;
                const chunk = m < n ? m : n;
                out.copyWithin(outIdx, pos, pos + chunk);
                outIdx += chunk;
              }
            }
          }
        }
      }
    }
    return new TextDecoder().decode(out.subarray(0, outIdx));
  };

  return $inflate;

})();
