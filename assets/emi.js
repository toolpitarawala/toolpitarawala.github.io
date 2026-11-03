/*
 * ToolPitara — EMI calculation core.
 * Pure functions with no DOM access, so the exact same code can be
 * unit-tested in Node and used in the browser.
 *
 * Formula:  EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 *   P = principal (loan amount)
 *   r = monthly interest rate = annual rate (%) / 1200
 *   n = tenure in months
 * When r = 0 the EMI is simply P / n.
 */
(function (global) {
  'use strict';

  function monthlyRate(annualPercent) {
    return annualPercent / 1200;
  }

  function computeEMI(principal, annualPercent, months) {
    if (!(principal > 0) || !(months > 0) || annualPercent < 0) return 0;
    var r = monthlyRate(annualPercent);
    if (r === 0) return principal / months;
    var pow = Math.pow(1 + r, months);
    return (principal * r * pow) / (pow - 1);
  }

  /*
   * Builds a year-wise amortisation summary.
   * Returns {
   *   emi, totalInterest, totalPayment,
   *   years: [{ year, principal, interest, balance }]  // balance = end of that year
   * }
   * The final month is adjusted so the closing balance is exactly 0.
   */
  function amortisation(principal, annualPercent, months) {
    var emi = computeEMI(principal, annualPercent, months);
    var r = monthlyRate(annualPercent);
    var balance = principal;
    var totalInterest = 0;
    var years = [];
    var yearPrincipal = 0;
    var yearInterest = 0;

    for (var m = 1; m <= months; m++) {
      var interest = balance * r;
      var principalPaid = emi - interest;
      if (m === months || principalPaid > balance) {
        principalPaid = balance; // final instalment clears the loan exactly
      }
      balance -= principalPaid;
      if (balance < 0.0000001) balance = 0;
      totalInterest += interest;
      yearPrincipal += principalPaid;
      yearInterest += interest;
      if (m % 12 === 0 || m === months) {
        years.push({
          year: years.length + 1,
          principal: yearPrincipal,
          interest: yearInterest,
          balance: balance
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    return {
      emi: emi,
      totalInterest: totalInterest,
      totalPayment: principal + totalInterest,
      years: years
    };
  }

  /*
   * Indian digit grouping (lakh/crore style): last 3 digits, then pairs.
   * e.g. 1037924 -> "10,37,924". Keeps any decimal part as-is (2 dp max by default).
   */
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

  var api = {
    monthlyRate: monthlyRate,
    computeEMI: computeEMI,
    amortisation: amortisation,
    formatINR: formatINR
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.TPEMI = api;
})(typeof window !== 'undefined' ? window : globalThis);
