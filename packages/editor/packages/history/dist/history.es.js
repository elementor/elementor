import Ce from "react";
function ve() {
  return {
    t: (a) => a
  };
}
const sr = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjIiIGhlaWdodD0iMTM0Ij48c3R5bGU+PCFbQ0RBVEFbLkJ7ZmlsbDojZmZmfS5De2ZpbGwtcnVsZTpub256ZXJvfS5Ee3N0cm9rZS1saW5lY2FwOnJvdW5kfS5Fe3N0cm9rZTojYTRhZmI3fS5Ge3N0cm9rZS1saW5lam9pbjpyb3VuZH0uR3tzdHJva2Utd2lkdGg6MS4zOTd9Lkh7c3Ryb2tlLXdpZHRoOjEuMzk4fS5Je2ZpbGw6I2E0YWZiN31dXT48L3N0eWxlPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGcgY2xhc3M9IkUiPjxnIGNsYXNzPSJHIj48cGF0aCBkPSJNNjEuOTggNzUuMjc1Yy04LjAyMiAyLjU0Mi0xNi42NyAxMC4zMDgtMjEuOTYgNy42NjgtMy40Mi0xLjcwNy02LjYxNi0xMy42LTExLjI3NC0xOC4xNS0yLjgxNC0yLjc1LTQuMTUyLTMuNDc3LTUuMzktNC4xMzYtMy43NTUtMi01LjM0Ni0xLjYzOC01LjM0Ni0zLjM4NyAwLTIuMjY4IDQuOTMzLTIuNzg2IDEwLjE0NyAyLjIzNy4zNjguMzU0LTQuODEyLTQuMDItNi4wODUtNS4wMjMtMS40MDgtMS4xMDgtMi43MzgtMi4zNC0yLjAyNy0zLjY1MyAxLjE5Mi0yLjIgNC4wMS0uNDMyIDUuODg2IDEuODQ0IDEuNjU3IDIgMy40NzMgNC40MTUgMi44MTQgMy4yNzYtMS40MDQtMi40MjcgMi4wNS00LjUzOCAzLjM3NS00Ljk1N3MzLjY5My0uNTYgNC40NzcuOTE2Yy40MzUuODE3LjE3MyAxLjYwNy0uNzg1IDIuMTc0LTEuMjMuNzMtMy44MjQgMS4wODUtNC4zIDMuMTg1LS4zMyAxLjQ1Ni42MDcgMy4wNCAzLjAxIDEuMjQgMS40NjUtMS4wOTYuNTE4LTIuOTkgMi4wNzMtNC4yNjRzMy4zNi0uNzEgMy4zNiAxLjFjMCA2LjAxOC00LjY4OCA3LjExNy00LjQ3IDcuNDg4IDIuMDczIDMuNTE1IDUuNyAxMC4xNTIgNi43NzYgMTEuMjQ1IDUuMTQgNS4yMTUgMTMuNTMtOS4zOCAxNi41Mi04LjAyOCIgY2xhc3M9IkIgQyBEIEYiLz48cGF0aCBkPSJNMzcuMyA5LjM4YTQuMTkgNC4xOSAwIDAgMSA0LjE5IDQuMTlWMzcuOWE0LjE5IDQuMTkgMCAwIDEtNC4xOSA0LjE5TDM1LjUgNDIuMXY0LjE2MmEuODQuODQgMCAwIDEtLjEyOC40NDVsLS4wNy4wOTVhLjg0Ljg0IDAgMCAxLTEuMTgxLjEwMUwyOC40MDggNDIuMWwtMTUuNTM3LjAwMWE0LjE5IDQuMTkgMCAwIDEtNC4xOS00LjE5VjEzLjU3YTQuMTkgNC4xOSAwIDAgMSA0LjE5LTQuMTlIMzcuM3oiIGZpbGw9IiNjMmNiZDIiLz48L2c+PHBhdGggZD0iTTMuNzkzIDMuMDk1bDIuNzkzIDMuNU0xMS4xMjUgMXY0LjJNMSAxMC43NzZsMy41LjY5OCIgc3Ryb2tlLXdpZHRoPSIxLjI1NyIgY2xhc3M9IkQiLz48cGF0aCBkPSJNMTE4LjkyIDI1Ljg2bC01Mi4xNDctLjgxOGMtMy41NDMtLjA1Ni02LjkzNiAxLjQyNi05LjMwMyA0LjA2MmwtMi45IDMuMjE4YTE2LjA2IDE2LjA2IDAgMCAwLTEuOTE0IDIuNjIyYy0xLjk3OCAzLjM4LTIuOTg3IDUuOTEzLTMuMDQyIDcuNTM3LS43MDMgMjAuOTcyLS44NiAzNi4yLS40NjcgNDUuNjc1LjE3OCA0LjMxMi43NjYgOC4xMzggMS43NiAxMS40OGExNi4wNiAxNi4wNiAwIDAgMCAxNS4zOTMgMTEuNDc5aDYwLjA0NWM4Ljg3IDAgMTYuMDYtNy4yIDE2LjA2LTE2LjA2VjQ1LjE4M2ExNi4wNiAxNi4wNiAwIDAgMC0xMS4wNzYtMTUuMjY3bC0xMi40Mi00LjA1NXoiIGNsYXNzPSJCIEMgRyIvPjwvZz48cmVjdCB4PSI0OC4wNDciIHk9IjI0LjI1MyIgd2lkdGg9IjgxLjc5OSIgaGVpZ2h0PSI4MS45NTIiIHJ4PSIyMS43ODYiIGNsYXNzPSJCIEMiLz48ZyBjbGFzcz0iRSBHIEIgQyI+PHJlY3QgeD0iNDguNzQ1IiB5PSIyNC45NTEiIHdpZHRoPSI4MC40MDMiIGhlaWdodD0iODAuNTU2IiByeD0iMTYuNzU4Ii8+PHBhdGggZD0iTTEwMS4wMzYgMTA4LjgxMmwuNTUgMTguNzI0aC0xLjI5MmMtMS40MzMgMC0yLjU5NiAxLjE2Mi0yLjU5NiAyLjU5NnMxLjE2MiAyLjU5NiAyLjU5NiAyLjU5Nmg0LjA2OGMxLjkzIDAgMy40OTMtMS41NjQgMy40OTMtMy40OTMgMC0uNTk0LTEuNDM0LTkuNjA2LTEuMTI3LTIwLjQyMm0tMjkuMTUzLS4wMDFsLjU1IDE4LjcyNGgtMS4yOTJjLTEuNDMzIDAtMi41OTYgMS4xNjItMi41OTYgMi41OTZzMS4xNjIgMi41OTYgMi41OTYgMi41OTZIODAuOWMxLjkzIDAgMy40OTMtMS41NjQgMy40OTMtMy40OTMgMC0uNTk0LTEuNDM0LTkuNjA2LTEuMTI3LTIwLjQyMiIgY2xhc3M9IkQgRiIvPjwvZz48cmVjdCBmaWxsLW9wYWNpdHk9Ii43IiBmaWxsPSIjZTZlOWVjIiB4PSI1My4wMSIgeT0iMjguOTMiIHdpZHRoPSI3MS45MjEiIGhlaWdodD0iNzEuOTIxIiByeD0iMTEuNTA3IiBjbGFzcz0iQyIvPjxnIGNsYXNzPSJFIEciPjxnIGNsYXNzPSJCIj48cGF0aCBkPSJNNDkuOTY0IDEyNy41ODZjMi43LS4wMDEgNC44NCAyLjIyNiA0Ljg0IDQuNjk0SDMzLjRjMC00LjYyOCAzLjMzNS04LjAyNCA3Ljk2My04LjAyNCAzLjEgMCA0LjcyNSAxLjA4MiA2LjYyNCAzLjYyNy4wNC4wNTQtMS41OCAxLjI0NS0xLjU0IDEuMy0uMi40MjQgMS4zNy0xLjU5NyAzLjUxNy0xLjU5OHptOTcuNDE0IDQuNTY3aC03LjM2MmwtMS4yNjgtMi4yMi02LjAyMy0xMC4xLS4wODQtLjE1NGMtLjg5Ni0xLjc1LS42NTMtMy44OTYgMS4wOTctNC43OTJhMy4yMyAzLjIzIDAgMCAxIDQuMzU3IDEuNDI0IDQuNzkgNC43OSAwIDAgMSAuMTczLjQxNGwyLjA3NCA2LjQzYy0uMS0uNTYyLS41NjctNC4wODctMS40MjgtMTAuNTc0YTQuMzggNC4zOCAwIDAgMSAzLjk4OS00Ljc0MWMuMTg2LS4wMTYuMzcyLS4wMi41Ni0uMDEybC4yNS4wMWE0LjQ3IDQuNDcgMCAwIDEgNC4yNjEgNC45MDJsLTEuOTE1IDE0LjU0NGMuMDI0LjguNjk4LTEuNjQgMi4wMjMtNy4zMTRhMi42NiAyLjY2IDAgMCAxIDMuNzg1LTEuMzkyYzEuNDkzLjgzIDEuNiAyLjIzMi43NjQgMy43MjdsLTUuMjUyIDkuODM3eiIvPjxwYXRoIGQ9Ik0xMzUuNzY0IDEyNi42OTRhNS41OSA1LjU5IDAgMCAxIDUuNTgyIDUuMzY3bC4wMDMuMjE4aC0xMS4xN2E1LjU5IDUuNTkgMCAwIDEgNS4zNjctNS41ODFsLjIyLS4wMDR6Ii8+PC9nPjxnIGNsYXNzPSJEIj48cGF0aCBkPSJNMjguMzcyIDEzMi41NTJoMTIyLjg5NG0zLjkgMGg1LjU4Nm0tMTQxLjMyOCAwaDUuNTg2bS0xMC4wNTUgMGgxLjY3NiIvPjxwYXRoIGQ9Ik0xMzQuMjk2IDcxLjY2NWM1LjQ3NyAzLjIgMTYuNjYgOC4wODUgMTQuMDcgOS43NzQtNi43IDQuMzc0LTkuMTU3IDIuODAzLTkuMTU3IDguMDcgMCA5LjU3IDYuMjU3IDEwLjgyIDkuMTU3IDguM3MuMzE2LTkuODUtMy4zMy04LjMgMTAuMTQtNS4zNyAxMC4xNC05LjMyLTE2Ljg2Ni0xNi44MzUtMjAuODgtMTcuNjU0IiBjbGFzcz0iQiBDIEYiLz48L2c+PC9nPjxnIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzLjM1MiIgY2xhc3M9IkQiPjxwYXRoIGQ9Ik02My41NTYgMzUuMDc1Yy0yLjI2IDEuMzc4LTMuODYzIDMuMTMtNC44MDcgNS4yNTgiLz48cGF0aCBkPSJNMTguMDg4IDI1Ljk0M2w1LjI1OCA0LjgwNyAxMC4xOTctMTEuMTczIiBjbGFzcz0iRiIvPjwvZz48ZyBjbGFzcz0iQiI+PGNpcmNsZSBjeD0iNTcuMTMiIGN5PSI0NS40NTEiIHI9IjEuMzI3Ii8+PHBhdGggZD0iTTEwMS41OTYgNTIuOTM3YzMuNTggMCA2LjU5IDMuMDUzIDYuNTkgNy4zMDUgMCAyLjA3Mi0uNTk2IDMuNjctMS42MiA0Ljc2Ny0xLjY1OC0xLjAwNi0zLjYwNC0xLjU4NC01LjY4NS0xLjU4NC0xLjQ1NiAwLTIuODQ2LjI4My00LjExNy43OTctLjk1LTEuMTc0LTEuNTQtMi43LTEuNTQtNC41MDggMC00LjI1MyAyLjc5LTYuNzc3IDYuMzctNi43Nzd6IiBjbGFzcz0iRSBIIi8+PC9nPjxjaXJjbGUgY3g9IjEwMC44ODIiIGN5PSI2MC45MjgiIHI9IjIuOTk2IiBjbGFzcz0iSSIvPjxwYXRoIGQ9Ik03MS41NjMgNTIuOTM3Yy0zLjU4IDAtNi41OSAzLjA1My02LjU5IDcuMzA1IDAgMi4wNzIuNTk2IDMuNjcgMS42MiA0Ljc2NyAxLjY1OC0xLjAwNiAzLjYwNC0xLjU4NCA1LjY4NS0xLjU4NCAxLjQ1NiAwIDIuODQ2LjI4MyA0LjExNy43OTcuOTUtMS4xNzQgMS41NC0yLjcgMS41NC00LjUwOCAwLTQuMjUzLTIuNzktNi43NzctNi4zNy02Ljc3N3oiIGNsYXNzPSJCIEUgSCIvPjxjaXJjbGUgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMTQzLjU1MzY3MiAxKSIgY3g9IjcxLjI3NyIgY3k9IjU5LjkyOCIgcj0iMi45OTYiIGNsYXNzPSJJIi8+PGcgY2xhc3M9IkUiPjxwYXRoIGQ9Ik03NC42IDQzLjk1Yy02LjA4NiAxLjcwMi05LjEzIDMuMjM1LTkuMTMgNC41OTdtMzQuODQ0LTQuNTk3YzYuMDg2IDEuNzAyIDkuMTMgMy4yMzUgOS4xMyA0LjU5NyIgc3Ryb2tlLXdpZHRoPSIxLjM5NCIgY2xhc3M9IkQgRiIvPjxwYXRoIGQ9Ik04OC40MTUgODAuODY4YzUuMDU2IDAgOC4wNDUtMi42NDggMTAuMzc0LTQuOTU2LTIuNzYgMS4yLTQuODI0IDIuNjYtMTAuODkyIDIuNjZzLTguNDM0LTEuMDQ4LTEwLjk4Ny0yLjIzOGMzLjI2NiAyLjk4NiA2LjQ1IDQuNTM0IDExLjUwNSA0LjUzNHoiIHN0cm9rZS13aWR0aD0iLjk5OSIgY2xhc3M9IkYgSSIvPjxnIGNsYXNzPSJCIEgiPjxwYXRoIGQ9Ik04Mi43MzIgNzguNDg3bDQuNzg4LjI1LS4xNTcgMi45OTJhMS44IDEuOCAwIDAgMS0xLjg4OSAxLjcwMWwtMS4xOTctLjA2M2ExLjggMS44IDAgMCAxLTEuNzAxLTEuODg5bC4xNTctMi45OTJ6Ii8+PHBhdGggZD0iTTYuMDA2IDFIMTAuOHYyLjk5NmExLjggMS44IDAgMCAxLTEuNzk4IDEuNzk4aC0xLjJhMS44IDEuOCAwIDAgMS0xLjc5OC0xLjc5OFYxeiIgdHJhbnNmb3JtPSJtYXRyaXgoLS45OTg2MyAuMDUyMzM2IC4wNTIzMzYgLjk5ODYzIDk4LjIyMDk1OCA3Ny4xNzQ4NykiLz48L2c+PHBhdGggZD0iTTEwNC40OSA0OC45NTVjOC43NC4xOTYgMTMuMTk3IDEuMjggMTMuMzcgMy4yNTJ2My43MDVjLTEuMDY1LjMzNy0xLjY3Ljk1NS0xLjgxNiAxLjg1NC0xLjU0MiA5LjUyNy00LjIzNiAxMy4xNS0xMS44NzcgMTMuMTUtNy43MjMgMC0xNC44MjItMy44NC0xNS43NjMtMTQuMTE3LS4wNS0uNTU4LS43Mi0uODU0LTIuMDA2LS44ODdsLS4yMi4wMWMtMS4xNDIuMDYtMS43MzguMzUzLTEuNzg2Ljg3OC0uOTQgMTAuMjc4LTguMDQgMTQuMTE3LTE1Ljc2MyAxNC4xMTctNy42NCAwLTEwLjMzNS0zLjYyNC0xMS44NzctMTMuMTUtLjEzNi0uODQtLjY3Mi0xLjQzNC0xLjYxLTEuNzgzbC0uMjA3LS4wN3YtMy43MDVjLjE3My0xLjk3MiA0LjYzLTMuMDU1IDEzLjM3LTMuMjUyIDYuNDg1LS4xNDYgMTEuMzg0LjkxIDE0LjY4NCAyLjY3LjY3NC4zNiAxLjcwMi41NTMgMy4wODMuNThsLjMyNS4wMDNjMS41NDYgMCAyLjY4Mi0uMTk0IDMuNDA4LS41ODIgMy4zLTEuNzYgOC4yLTIuODE1IDE0LjY4NC0yLjY3em0tMzQuMTM2IDMuMDY4Yy00LjU5LS4xLTcuNzE1LjExNy05LjA3NiAxLjkxLS45OTYgMS4zMTItLjgzNyAzLjQ1LS42MDMgNS4zMDIuMjk4IDIuMzY4IDEuMDIyIDQuNDgzIDEuOTY0IDUuNzIyIDEuMDYgMS4zOTUgMy4wMzMgMi41NTYgNi40OTYgMi41NTYgMy44NyAwIDcuNS0xLjQxIDkuMzctMy42MDUuODk0LTEuMDU2IDMuNzEtNS44MzUgMi40NzgtOC42ODctLjIwNy0uNDgtLjczNS0yLjk2LTEwLjYyOC0zLjE5NnptNDEuMzE2IDEuOTFjLTEuMzYtMS43OTItNC40ODctMi4wMi05LjA3Ni0xLjkxLTkuODkzLjIzNy0xMC40MiAyLjcxNi0xMC42MjggMy4xOTYtMS4yMyAyLjg1MyAxLjU4NCA3LjYzIDIuNDc4IDguNjg3IDEuODYgMi4xOTYgNS41IDMuNjA1IDkuMzcgMy42MDUgMy40NjMgMCA1LjQzNi0xLjE2IDYuNDk2LTIuNTU2Ljk0Mi0xLjI0IDEuNjY2LTMuMzU0IDEuOTY0LTUuNzIyLjIzNC0xLjg1My4zOTMtNC0uNjAzLTUuMzAyeiIgc3Ryb2tlLXdpZHRoPSIxLjExOSIgY2xhc3M9IkIiLz48L2c+PC9nPjwvc3ZnPg==";
var Z = { exports: {} }, b = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ze;
function jr() {
  if (ze)
    return b;
  ze = 1;
  var a = Ce, I = Symbol.for("react.element"), d = Symbol.for("react.fragment"), E = Object.prototype.hasOwnProperty, x = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, R = { key: !0, ref: !0, __self: !0, __source: !0 };
  function w(z, j, v) {
    var g, y = {}, S = null, U = null;
    v !== void 0 && (S = "" + v), j.key !== void 0 && (S = "" + j.key), j.ref !== void 0 && (U = j.ref);
    for (g in j)
      E.call(j, g) && !R.hasOwnProperty(g) && (y[g] = j[g]);
    if (z && z.defaultProps)
      for (g in j = z.defaultProps, j)
        y[g] === void 0 && (y[g] = j[g]);
    return { $$typeof: I, type: z, key: S, ref: U, props: y, _owner: x.current };
  }
  return b.Fragment = d, b.jsx = w, b.jsxs = w, b;
}
var k = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Se;
function Nr() {
  return Se || (Se = 1, process.env.NODE_ENV !== "production" && function() {
    var a = Ce, I = Symbol.for("react.element"), d = Symbol.for("react.portal"), E = Symbol.for("react.fragment"), x = Symbol.for("react.strict_mode"), R = Symbol.for("react.profiler"), w = Symbol.for("react.provider"), z = Symbol.for("react.context"), j = Symbol.for("react.forward_ref"), v = Symbol.for("react.suspense"), g = Symbol.for("react.suspense_list"), y = Symbol.for("react.memo"), S = Symbol.for("react.lazy"), U = Symbol.for("react.offscreen"), K = Symbol.iterator, Ae = "@@iterator";
    function me(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = K && e[K] || e[Ae];
      return typeof r == "function" ? r : null;
    }
    var O = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function N(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
          t[i - 1] = arguments[i];
        we("error", e, t);
      }
    }
    function we(e, r, t) {
      {
        var i = O.ReactDebugCurrentFrame, M = i.getStackAddendum();
        M !== "" && (r += "%s", t = t.concat([M]));
        var o = t.map(function(u) {
          return String(u);
        });
        o.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, o);
      }
    }
    var Ye = !1, he = !1, be = !1, ke = !1, pe = !1, ee;
    ee = Symbol.for("react.module.reference");
    function Re(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === E || e === R || pe || e === x || e === v || e === g || ke || e === U || Ye || he || be || typeof e == "object" && e !== null && (e.$$typeof === S || e.$$typeof === y || e.$$typeof === w || e.$$typeof === z || e.$$typeof === j || e.$$typeof === ee || e.getModuleId !== void 0));
    }
    function Ue(e, r, t) {
      var i = e.displayName;
      if (i)
        return i;
      var M = r.displayName || r.name || "";
      return M !== "" ? t + "(" + M + ")" : t;
    }
    function re(e) {
      return e.displayName || "Context";
    }
    function T(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && N("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case E:
          return "Fragment";
        case d:
          return "Portal";
        case R:
          return "Profiler";
        case x:
          return "StrictMode";
        case v:
          return "Suspense";
        case g:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case z:
            var r = e;
            return re(r) + ".Consumer";
          case w:
            var t = e;
            return re(t._context) + ".Provider";
          case j:
            return Ue(e, e.render, "ForwardRef");
          case y:
            var i = e.displayName || null;
            return i !== null ? i : T(e.type) || "Memo";
          case S: {
            var M = e, o = M._payload, u = M._init;
            try {
              return T(u(o));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var C = Object.assign, Y = 0, te, ie, ne, ue, ae, Me, oe;
    function ce() {
    }
    ce.__reactDisabledLog = !0;
    function Pe() {
      {
        if (Y === 0) {
          te = console.log, ie = console.info, ne = console.warn, ue = console.error, ae = console.group, Me = console.groupCollapsed, oe = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: ce,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        Y++;
      }
    }
    function _e() {
      {
        if (Y--, Y === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: C({}, e, {
              value: te
            }),
            info: C({}, e, {
              value: ie
            }),
            warn: C({}, e, {
              value: ne
            }),
            error: C({}, e, {
              value: ue
            }),
            group: C({}, e, {
              value: ae
            }),
            groupCollapsed: C({}, e, {
              value: Me
            }),
            groupEnd: C({}, e, {
              value: oe
            })
          });
        }
        Y < 0 && N("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var W = O.ReactCurrentDispatcher, J;
    function P(e, r, t) {
      {
        if (J === void 0)
          try {
            throw Error();
          } catch (M) {
            var i = M.stack.trim().match(/\n( *(at )?)/);
            J = i && i[1] || "";
          }
        return `
` + J + e;
      }
    }
    var H = !1, _;
    {
      var Qe = typeof WeakMap == "function" ? WeakMap : Map;
      _ = new Qe();
    }
    function se(e, r) {
      if (!e || H)
        return "";
      {
        var t = _.get(e);
        if (t !== void 0)
          return t;
      }
      var i;
      H = !0;
      var M = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var o;
      o = W.current, W.current = null, Pe();
      try {
        if (r) {
          var u = function() {
            throw Error();
          };
          if (Object.defineProperty(u.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(u, []);
            } catch (D) {
              i = D;
            }
            Reflect.construct(e, [], u);
          } else {
            try {
              u.call();
            } catch (D) {
              i = D;
            }
            e.call(u.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (D) {
            i = D;
          }
          e();
        }
      } catch (D) {
        if (D && i && typeof D.stack == "string") {
          for (var n = D.stack.split(`
`), l = i.stack.split(`
`), c = n.length - 1, s = l.length - 1; c >= 1 && s >= 0 && n[c] !== l[s]; )
            s--;
          for (; c >= 1 && s >= 0; c--, s--)
            if (n[c] !== l[s]) {
              if (c !== 1 || s !== 1)
                do
                  if (c--, s--, s < 0 || n[c] !== l[s]) {
                    var f = `
` + n[c].replace(" at new ", " at ");
                    return e.displayName && f.includes("<anonymous>") && (f = f.replace("<anonymous>", e.displayName)), typeof e == "function" && _.set(e, f), f;
                  }
                while (c >= 1 && s >= 0);
              break;
            }
        }
      } finally {
        H = !1, W.current = o, _e(), Error.prepareStackTrace = M;
      }
      var m = e ? e.displayName || e.name : "", xe = m ? P(m) : "";
      return typeof e == "function" && _.set(e, xe), xe;
    }
    function Ge(e, r, t) {
      return se(e, !1);
    }
    function Fe(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function Q(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return se(e, Fe(e));
      if (typeof e == "string")
        return P(e);
      switch (e) {
        case v:
          return P("Suspense");
        case g:
          return P("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case j:
            return Ge(e.render);
          case y:
            return Q(e.type, r, t);
          case S: {
            var i = e, M = i._payload, o = i._init;
            try {
              return Q(o(M), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var G = Object.prototype.hasOwnProperty, je = {}, Ne = O.ReactDebugCurrentFrame;
    function F(e) {
      if (e) {
        var r = e._owner, t = Q(e.type, e._source, r ? r.type : null);
        Ne.setExtraStackFrame(t);
      } else
        Ne.setExtraStackFrame(null);
    }
    function Ze(e, r, t, i, M) {
      {
        var o = Function.call.bind(G);
        for (var u in e)
          if (o(e, u)) {
            var n = void 0;
            try {
              if (typeof e[u] != "function") {
                var l = Error((i || "React class") + ": " + t + " type `" + u + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[u] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw l.name = "Invariant Violation", l;
              }
              n = e[u](r, u, i, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (c) {
              n = c;
            }
            n && !(n instanceof Error) && (F(M), N("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", t, u, typeof n), F(null)), n instanceof Error && !(n.message in je) && (je[n.message] = !0, F(M), N("Failed %s type: %s", t, n.message), F(null));
          }
      }
    }
    var We = Array.isArray;
    function B(e) {
      return We(e);
    }
    function Je(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function He(e) {
      try {
        return le(e), !1;
      } catch {
        return !0;
      }
    }
    function le(e) {
      return "" + e;
    }
    function Le(e) {
      if (He(e))
        return N("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Je(e)), le(e);
    }
    var h = O.ReactCurrentOwner, Be = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ie, ge, X;
    X = {};
    function Xe(e) {
      if (G.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Ve(e) {
      if (G.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function $e(e, r) {
      if (typeof e.ref == "string" && h.current && r && h.current.stateNode !== r) {
        var t = T(h.current.type);
        X[t] || (N('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', T(h.current.type), e.ref), X[t] = !0);
      }
    }
    function qe(e, r) {
      {
        var t = function() {
          Ie || (Ie = !0, N("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function Ke(e, r) {
      {
        var t = function() {
          ge || (ge = !0, N("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var er = function(e, r, t, i, M, o, u) {
      var n = {
        $$typeof: I,
        type: e,
        key: r,
        ref: t,
        props: u,
        _owner: o
      };
      return n._store = {}, Object.defineProperty(n._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(n, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: i
      }), Object.defineProperty(n, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: M
      }), Object.freeze && (Object.freeze(n.props), Object.freeze(n)), n;
    };
    function rr(e, r, t, i, M) {
      {
        var o, u = {}, n = null, l = null;
        t !== void 0 && (Le(t), n = "" + t), Ve(r) && (Le(r.key), n = "" + r.key), Xe(r) && (l = r.ref, $e(r, M));
        for (o in r)
          G.call(r, o) && !Be.hasOwnProperty(o) && (u[o] = r[o]);
        if (e && e.defaultProps) {
          var c = e.defaultProps;
          for (o in c)
            u[o] === void 0 && (u[o] = c[o]);
        }
        if (n || l) {
          var s = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          n && qe(u, s), l && Ke(u, s);
        }
        return er(e, n, l, M, i, h.current, u);
      }
    }
    var V = O.ReactCurrentOwner, fe = O.ReactDebugCurrentFrame;
    function A(e) {
      if (e) {
        var r = e._owner, t = Q(e.type, e._source, r ? r.type : null);
        fe.setExtraStackFrame(t);
      } else
        fe.setExtraStackFrame(null);
    }
    var $;
    $ = !1;
    function q(e) {
      return typeof e == "object" && e !== null && e.$$typeof === I;
    }
    function ye() {
      {
        if (V.current) {
          var e = T(V.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function tr(e) {
      {
        if (e !== void 0) {
          var r = e.fileName.replace(/^.*[\\\/]/, ""), t = e.lineNumber;
          return `

Check your code at ` + r + ":" + t + ".";
        }
        return "";
      }
    }
    var Te = {};
    function ir(e) {
      {
        var r = ye();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function De(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = ir(r);
        if (Te[t])
          return;
        Te[t] = !0;
        var i = "";
        e && e._owner && e._owner !== V.current && (i = " It was passed a child from " + T(e._owner.type) + "."), A(e), N('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, i), A(null);
      }
    }
    function de(e, r) {
      {
        if (typeof e != "object")
          return;
        if (B(e))
          for (var t = 0; t < e.length; t++) {
            var i = e[t];
            q(i) && De(i, r);
          }
        else if (q(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var M = me(e);
          if (typeof M == "function" && M !== e.entries)
            for (var o = M.call(e), u; !(u = o.next()).done; )
              q(u.value) && De(u.value, r);
        }
      }
    }
    function nr(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === j || r.$$typeof === y))
          t = r.propTypes;
        else
          return;
        if (t) {
          var i = T(r);
          Ze(t, e.props, "prop", i, e);
        } else if (r.PropTypes !== void 0 && !$) {
          $ = !0;
          var M = T(r);
          N("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", M || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && N("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function ur(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var i = r[t];
          if (i !== "children" && i !== "key") {
            A(e), N("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", i), A(null);
            break;
          }
        }
        e.ref !== null && (A(e), N("Invalid attribute `ref` supplied to `React.Fragment`."), A(null));
      }
    }
    function Ee(e, r, t, i, M, o) {
      {
        var u = Re(e);
        if (!u) {
          var n = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (n += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var l = tr(M);
          l ? n += l : n += ye();
          var c;
          e === null ? c = "null" : B(e) ? c = "array" : e !== void 0 && e.$$typeof === I ? (c = "<" + (T(e.type) || "Unknown") + " />", n = " Did you accidentally export a JSX literal instead of a component?") : c = typeof e, N("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", c, n);
        }
        var s = rr(e, r, t, M, o);
        if (s == null)
          return s;
        if (u) {
          var f = r.children;
          if (f !== void 0)
            if (i)
              if (B(f)) {
                for (var m = 0; m < f.length; m++)
                  de(f[m], e);
                Object.freeze && Object.freeze(f);
              } else
                N("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              de(f, e);
        }
        return e === E ? ur(s) : nr(s), s;
      }
    }
    function ar(e, r, t) {
      return Ee(e, r, t, !0);
    }
    function Mr(e, r, t) {
      return Ee(e, r, t, !1);
    }
    var or = Mr, cr = ar;
    k.Fragment = E, k.jsx = or, k.jsxs = cr;
  }()), k;
}
(function(a) {
  process.env.NODE_ENV === "production" ? a.exports = jr() : a.exports = Nr();
})(Z);
const Oe = Z.exports.Fragment, L = Z.exports.jsx, p = Z.exports.jsxs;
function lr() {
  const {
    t: a
  } = ve();
  return /* @__PURE__ */ p("div", {
    id: "elementor-panel-history-no-items",
    children: [/* @__PURE__ */ L("img", {
      className: "elementor-nerd-box-icon",
      src: sr,
      alt: a("No history icon")
    }), /* @__PURE__ */ L("div", {
      className: "elementor-nerd-box-title",
      children: a("No History Yet")
    }), /* @__PURE__ */ L("div", {
      className: "elementor-nerd-box-message",
      children: a("Once you start working, you'll be able to redo / undo any action you make in the editor.")
    })]
  });
}
const Lr = (a) => /* @__PURE__ */ p("div", {
  className: `elementor-history-item elementor-history-item-${a.item.status} ${a.isCurrent ? "elementor-history-item-current" : ""}`,
  onClick: (I) => {
    a.onClick(I, {
      id: a.item.id
    });
  },
  children: [/* @__PURE__ */ p("div", {
    className: "elementor-history-item__details",
    children: [/* @__PURE__ */ L("span", {
      className: "elementor-history-item__title",
      children: a.item.title
    }), " ", a.item.subTitle && /* @__PURE__ */ p(Oe, {
      children: [/* @__PURE__ */ L("span", {
        className: "elementor-history-item__subtitle",
        children: a.item.subTitle
      }), " "]
    }), /* @__PURE__ */ L("span", {
      className: "elementor-history-item__action",
      children: a.item.action
    })]
  }), /* @__PURE__ */ L("div", {
    className: "elementor-history-item__icon",
    children: /* @__PURE__ */ L("span", {
      className: "eicon",
      "aria-hidden": "true"
    })
  })]
}), Ir = (a) => /* @__PURE__ */ L(Oe, {
  children: a.items.map((I, d) => /* @__PURE__ */ L(Lr, {
    item: I,
    isCurrent: d === a.currentItem,
    onClick: (E) => {
      var x;
      (x = a.onItemClick) == null || x.call(a, E, {
        id: I.id
      });
    }
  }, I.id))
}), fr = (a) => {
  const {
    t: I
  } = ve(), d = a.items.length === 0;
  return /* @__PURE__ */ p("div", {
    id: "elementor-panel-history",
    className: d ? "elementor-empty" : "",
    children: [/* @__PURE__ */ L("div", {
      id: "elementor-history-list",
      children: d ? /* @__PURE__ */ L(lr, {}) : /* @__PURE__ */ L(Ir, {
        items: a.items,
        onItemClick: a.onItemClick,
        currentItem: a.currentItem
      })
    }), /* @__PURE__ */ L("div", {
      className: "elementor-history-revisions-message",
      children: I("Switch to Revisions tab for older versions")
    })]
  });
};
export {
  fr as HistoryPanel
};
