/*
 * ToolPitara — SIP calculation core (pure functions, Node-testable).
 *
 * Future value of a monthly SIP (investment at the START of each month,
 * i.e. annuity due):
 *   FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 *   P = monthly investment, i = expected annual return (%) / 1200,
 *   n = number of months.
 * When i = 0, FV = P * n.
 * Returns are an assumption typed in by the user — never a guarantee.
 */
(function (global) {
  'use strict';

  function computeSIP(monthly, annualPercent, years) {
    var months = Math.round(years * 12);
    if (!(monthly > 0) || !(months > 0) || annualPercent < 0) {
      return { invested: 0, gains: 0, maturity: 0, yearly: [] };
    }
    var i = annualPercent / 1200;
    var maturity;
    if (i === 0) {
      maturity = monthly * months;
    } else {
      maturity = monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
    }
    var invested = monthly * months;

    var yearly = [];
    for (var y = 1; y <= years; y++) {
      var m = y * 12;
      var value = i === 0 ? monthly * m : monthly * ((Math.pow(1 + i, m) - 1) / i) * (1 + i);
      yearly.push({ year: y, invested: monthly * m, value: value });
    }

    return {
      invested: invested,
      gains: maturity - invested,
      maturity: maturity,
      yearly: yearly
    };
  }

  /* Indian digit grouping (lakh/crore style): 1161695 -> "11,61,695". */
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

  var api = { computeSIP: computeSIP, formatINR: formatINR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.TPSIP = api;
})(typeof window !== 'undefined' ? window : globalThis);
