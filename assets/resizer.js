/*
 * ToolPitara — Photo & Signature Resizer core.
 * Pure helpers with no DOM access (unit-testable in Node), plus the
 * canvas encode loop the page drives. Everything runs in the visitor's
 * browser: the image is never uploaded anywhere.
 *
 * How the resize works:
 *  1. The source image is centre-cropped to the target aspect ratio
 *     (cover-crop) and drawn at exactly the requested pixel size, so the
 *     output dimensions are always exactly what the form asked for.
 *  2. The JPEG encoder quality is binary-searched until the file fits
 *     under the requested maximum size in KB. If even the lowest useful
 *     quality is too big, we say so honestly instead of silently
 *     changing the dimensions — forms reject wrong dimensions.
 */
(function (global) {
  'use strict';

  /*
   * Commonly published Indian exam / form photo & signature sizes.
   * minKB is 0 when the form only states a maximum.
   * These are starting points: every field stays editable on the page,
   * and the page tells users to match their own form's official notice.
   */
  var PRESETS = [
    { id: 'custom',        kind: 'photo',     name: 'Custom size (type your own below)', w: 413, h: 531, minKB: 0,  maxKB: 50 },
    { id: 'passport',      kind: 'photo',     name: 'Passport-size photo — 3.5 × 4.5 cm', w: 413, h: 531, minKB: 0,  maxKB: 50 },
    { id: 'ssc-photo',     kind: 'photo',     name: 'SSC exam photo (20–50 KB)', w: 413, h: 531, minKB: 20, maxKB: 50 },
    { id: 'bank-photo',    kind: 'photo',     name: 'Bank exam photo — IBPS / SBI (200 × 230 px)', w: 200, h: 230, minKB: 20, maxKB: 50 },
    { id: 'ssc-sign',      kind: 'signature', name: 'SSC signature (10–20 KB)', w: 472, h: 236, minKB: 10, maxKB: 20 },
    { id: 'bank-sign',     kind: 'signature', name: 'Bank exam signature — IBPS / SBI (140 × 60 px)', w: 140, h: 60, minKB: 10, maxKB: 20 },
    { id: 'sign-wide',     kind: 'signature', name: 'Wide signature — 6 × 2 cm', w: 709, h: 236, minKB: 0,  maxKB: 50 }
  ];

  /*
   * Centre-crop rectangle (in source pixels) that fills dstW × dstH
   * without stretching. Returns { sx, sy, sw, sh } for drawImage.
   */
  function coverCrop(srcW, srcH, dstW, dstH) {
    var srcRatio = srcW / srcH;
    var dstRatio = dstW / dstH;
    var sw, sh;
    if (srcRatio > dstRatio) {
      sh = srcH;
      sw = Math.round(srcH * dstRatio);
    } else {
      sw = srcW;
      sh = Math.round(srcW / dstRatio);
    }
    if (sw > srcW) sw = srcW;
    if (sh > srcH) sh = srcH;
    return {
      sx: Math.floor((srcW - sw) / 2),
      sy: Math.floor((srcH - sh) / 2),
      sw: sw,
      sh: sh
    };
  }

  /*
   * Binary search for the highest JPEG quality whose encoded size is
   * at most targetBytes. encodeAtQuality(q, cb) must call cb(sizeBytes)
   * asynchronously (canvas.toBlob in the browser, a stub in tests).
   * Calls done({ quality, size }) with the best fit, or the lowest
   * quality tried if nothing fits (size will then exceed the target).
   */
  function findQuality(encodeAtQuality, targetBytes, done) {
    var LO = 0.05, HI = 0.95;
    var best = null;     // highest quality whose size fits the target
    var smallest = null; // smallest file seen, if nothing fits
    var steps = 0;

    function probe(q) {
      steps++;
      encodeAtQuality(q, function (size) {
        var rec = { quality: q, size: size };
        if (!smallest || size < smallest.size) smallest = rec;
        if (size <= targetBytes) {
          if (!best || q > best.quality) best = rec;
          LO = q; // a fit — try higher for better quality
        } else {
          HI = q; // too big — go lower
        }
        if (steps >= 8 || HI - LO < 0.02) {
          done(best || smallest);
        } else {
          probe(Math.round(((LO + HI) / 2) * 100) / 100);
        }
      });
    }
    probe(0.92);
  }

  function formatKB(bytes) {
    if (!isFinite(bytes) || bytes < 0) return '—';
    var kb = bytes / 1024;
    if (kb < 10) return (Math.round(kb * 10) / 10).toString();
    return Math.round(kb).toString();
  }

  function formatBytes(bytes) {
    if (!isFinite(bytes) || bytes < 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    return formatKB(bytes) + ' KB';
  }

  var api = {
    PRESETS: PRESETS,
    coverCrop: coverCrop,
    findQuality: findQuality,
    formatKB: formatKB,
    formatBytes: formatBytes
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.TPResize = api;
})(typeof window !== 'undefined' ? window : globalThis);
