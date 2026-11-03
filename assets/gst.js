/*
 * ToolPitara — GST calculation core (pure functions, Node-testable).
 *
 * Add GST (amount is the base / exclusive price):
 *   gstAmount = base * rate / 100 ; total = base + gstAmount
 * Remove GST (amount already includes GST):
 *   base = total / (1 + rate / 100) ; gstAmount = total - base
 * CGST = SGST = gstAmount / 2 (supply within one state).
 * IGST = gstAmount (supply across states). One of the two applies, never both.
 */
(function (global) {
  'use strict';

  function addGST(base, ratePercent) {
    var gst = (base * ratePercent) / 100;
    return {
      base: base,
      gst: gst,
      cgst: gst / 2,
      sgst: gst / 2,
      igst: gst,
      total: base + gst
    };
  }

  function removeGST(inclusiveTotal, ratePercent) {
    var base = inclusiveTotal / (1 + ratePercent / 100);
    var gst = inclusiveTotal - base;
    return {
      base: base,
      gst: gst,
      cgst: gst / 2,
      sgst: gst / 2,
      igst: gst,
      total: inclusiveTotal
    };
  }

  /* Indian digit grouping (lakh/crore style): 11800 -> "11,800". */
  function formatINR(value, decimals) {
    var dp = typeof decimals === 'number' ? decimals : 0;
    var fixed = Math.abs(value).toFixed(dp);
    var parts = fixed.split('.');
    var intPart = parts[0];
    var decPart = parts.length > 1 ? '.' + parts[1] : '';
    var last3 = intPart.slice(-3);
    var rest = intPart.slice(0, -3);
    var grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
    return (value < 0 ? '-' : '') + grouped + decPart;
  }

  var api = { addGST: addGST, removeGST: removeGST, formatINR: formatINR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.TPGST = api;
})(typeof window !== 'undefined' ? window : globalThis);
