function Zb(B) {
  return B && B.__esModule && Object.prototype.hasOwnProperty.call(B, "default") ? B.default : B;
}
var Xs = { exports: {} }, Et = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var q1;
function Jb() {
  if (q1)
    return Et;
  q1 = 1;
  var B = Symbol.for("react.element"), q = Symbol.for("react.portal"), A = Symbol.for("react.fragment"), $t = Symbol.for("react.strict_mode"), Yt = Symbol.for("react.profiler"), Je = Symbol.for("react.provider"), S = Symbol.for("react.context"), It = Symbol.for("react.forward_ref"), he = Symbol.for("react.suspense"), pe = Symbol.for("react.memo"), rt = Symbol.for("react.lazy"), re = Symbol.iterator;
  function me(T) {
    return T === null || typeof T != "object" ? null : (T = re && T[re] || T["@@iterator"], typeof T == "function" ? T : null);
  }
  var ie = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, Pe = Object.assign, Ct = {};
  function st(T, $, le) {
    this.props = T, this.context = $, this.refs = Ct, this.updater = le || ie;
  }
  st.prototype.isReactComponent = {}, st.prototype.setState = function(T, $) {
    if (typeof T != "object" && typeof T != "function" && T != null)
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, T, $, "setState");
  }, st.prototype.forceUpdate = function(T) {
    this.updater.enqueueForceUpdate(this, T, "forceUpdate");
  };
  function dn() {
  }
  dn.prototype = st.prototype;
  function at(T, $, le) {
    this.props = T, this.context = $, this.refs = Ct, this.updater = le || ie;
  }
  var Qe = at.prototype = new dn();
  Qe.constructor = at, Pe(Qe, st.prototype), Qe.isPureReactComponent = !0;
  var ct = Array.isArray, _e = Object.prototype.hasOwnProperty, it = { current: null }, He = { key: !0, ref: !0, __self: !0, __source: !0 };
  function nn(T, $, le) {
    var $e, Fe = {}, ht = null, et = null;
    if ($ != null)
      for ($e in $.ref !== void 0 && (et = $.ref), $.key !== void 0 && (ht = "" + $.key), $)
        _e.call($, $e) && !He.hasOwnProperty($e) && (Fe[$e] = $[$e]);
    var ft = arguments.length - 2;
    if (ft === 1)
      Fe.children = le;
    else if (1 < ft) {
      for (var tt = Array(ft), zt = 0; zt < ft; zt++)
        tt[zt] = arguments[zt + 2];
      Fe.children = tt;
    }
    if (T && T.defaultProps)
      for ($e in ft = T.defaultProps, ft)
        Fe[$e] === void 0 && (Fe[$e] = ft[$e]);
    return { $$typeof: B, type: T, key: ht, ref: et, props: Fe, _owner: it.current };
  }
  function _n(T, $) {
    return { $$typeof: B, type: T.type, key: $, ref: T.ref, props: T.props, _owner: T._owner };
  }
  function Qt(T) {
    return typeof T == "object" && T !== null && T.$$typeof === B;
  }
  function bt(T) {
    var $ = { "=": "=0", ":": "=2" };
    return "$" + T.replace(/[=:]/g, function(le) {
      return $[le];
    });
  }
  var Cn = /\/+/g;
  function Ue(T, $) {
    return typeof T == "object" && T !== null && T.key != null ? bt("" + T.key) : $.toString(36);
  }
  function qe(T, $, le, $e, Fe) {
    var ht = typeof T;
    (ht === "undefined" || ht === "boolean") && (T = null);
    var et = !1;
    if (T === null)
      et = !0;
    else
      switch (ht) {
        case "string":
        case "number":
          et = !0;
          break;
        case "object":
          switch (T.$$typeof) {
            case B:
            case q:
              et = !0;
          }
      }
    if (et)
      return et = T, Fe = Fe(et), T = $e === "" ? "." + Ue(et, 0) : $e, ct(Fe) ? (le = "", T != null && (le = T.replace(Cn, "$&/") + "/"), qe(Fe, $, le, "", function(zt) {
        return zt;
      })) : Fe != null && (Qt(Fe) && (Fe = _n(Fe, le + (!Fe.key || et && et.key === Fe.key ? "" : ("" + Fe.key).replace(Cn, "$&/") + "/") + T)), $.push(Fe)), 1;
    if (et = 0, $e = $e === "" ? "." : $e + ":", ct(T))
      for (var ft = 0; ft < T.length; ft++) {
        ht = T[ft];
        var tt = $e + Ue(ht, ft);
        et += qe(ht, $, le, tt, Fe);
      }
    else if (tt = me(T), typeof tt == "function")
      for (T = tt.call(T), ft = 0; !(ht = T.next()).done; )
        ht = ht.value, tt = $e + Ue(ht, ft++), et += qe(ht, $, le, tt, Fe);
    else if (ht === "object")
      throw $ = String(T), Error("Objects are not valid as a React child (found: " + ($ === "[object Object]" ? "object with keys {" + Object.keys(T).join(", ") + "}" : $) + "). If you meant to render a collection of children, use an array instead.");
    return et;
  }
  function Nt(T, $, le) {
    if (T == null)
      return T;
    var $e = [], Fe = 0;
    return qe(T, $e, "", "", function(ht) {
      return $.call(le, ht, Fe++);
    }), $e;
  }
  function Rt(T) {
    if (T._status === -1) {
      var $ = T._result;
      $ = $(), $.then(function(le) {
        (T._status === 0 || T._status === -1) && (T._status = 1, T._result = le);
      }, function(le) {
        (T._status === 0 || T._status === -1) && (T._status = 2, T._result = le);
      }), T._status === -1 && (T._status = 0, T._result = $);
    }
    if (T._status === 1)
      return T._result.default;
    throw T._result;
  }
  var ye = { current: null }, Z = { transition: null }, we = { ReactCurrentDispatcher: ye, ReactCurrentBatchConfig: Z, ReactCurrentOwner: it };
  return Et.Children = { map: Nt, forEach: function(T, $, le) {
    Nt(T, function() {
      $.apply(this, arguments);
    }, le);
  }, count: function(T) {
    var $ = 0;
    return Nt(T, function() {
      $++;
    }), $;
  }, toArray: function(T) {
    return Nt(T, function($) {
      return $;
    }) || [];
  }, only: function(T) {
    if (!Qt(T))
      throw Error("React.Children.only expected to receive a single React element child.");
    return T;
  } }, Et.Component = st, Et.Fragment = A, Et.Profiler = Yt, Et.PureComponent = at, Et.StrictMode = $t, Et.Suspense = he, Et.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = we, Et.cloneElement = function(T, $, le) {
    if (T == null)
      throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + T + ".");
    var $e = Pe({}, T.props), Fe = T.key, ht = T.ref, et = T._owner;
    if ($ != null) {
      if ($.ref !== void 0 && (ht = $.ref, et = it.current), $.key !== void 0 && (Fe = "" + $.key), T.type && T.type.defaultProps)
        var ft = T.type.defaultProps;
      for (tt in $)
        _e.call($, tt) && !He.hasOwnProperty(tt) && ($e[tt] = $[tt] === void 0 && ft !== void 0 ? ft[tt] : $[tt]);
    }
    var tt = arguments.length - 2;
    if (tt === 1)
      $e.children = le;
    else if (1 < tt) {
      ft = Array(tt);
      for (var zt = 0; zt < tt; zt++)
        ft[zt] = arguments[zt + 2];
      $e.children = ft;
    }
    return { $$typeof: B, type: T.type, key: Fe, ref: ht, props: $e, _owner: et };
  }, Et.createContext = function(T) {
    return T = { $$typeof: S, _currentValue: T, _currentValue2: T, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, T.Provider = { $$typeof: Je, _context: T }, T.Consumer = T;
  }, Et.createElement = nn, Et.createFactory = function(T) {
    var $ = nn.bind(null, T);
    return $.type = T, $;
  }, Et.createRef = function() {
    return { current: null };
  }, Et.forwardRef = function(T) {
    return { $$typeof: It, render: T };
  }, Et.isValidElement = Qt, Et.lazy = function(T) {
    return { $$typeof: rt, _payload: { _status: -1, _result: T }, _init: Rt };
  }, Et.memo = function(T, $) {
    return { $$typeof: pe, type: T, compare: $ === void 0 ? null : $ };
  }, Et.startTransition = function(T) {
    var $ = Z.transition;
    Z.transition = {};
    try {
      T();
    } finally {
      Z.transition = $;
    }
  }, Et.unstable_act = function() {
    throw Error("act(...) is not supported in production builds of React.");
  }, Et.useCallback = function(T, $) {
    return ye.current.useCallback(T, $);
  }, Et.useContext = function(T) {
    return ye.current.useContext(T);
  }, Et.useDebugValue = function() {
  }, Et.useDeferredValue = function(T) {
    return ye.current.useDeferredValue(T);
  }, Et.useEffect = function(T, $) {
    return ye.current.useEffect(T, $);
  }, Et.useId = function() {
    return ye.current.useId();
  }, Et.useImperativeHandle = function(T, $, le) {
    return ye.current.useImperativeHandle(T, $, le);
  }, Et.useInsertionEffect = function(T, $) {
    return ye.current.useInsertionEffect(T, $);
  }, Et.useLayoutEffect = function(T, $) {
    return ye.current.useLayoutEffect(T, $);
  }, Et.useMemo = function(T, $) {
    return ye.current.useMemo(T, $);
  }, Et.useReducer = function(T, $, le) {
    return ye.current.useReducer(T, $, le);
  }, Et.useRef = function(T) {
    return ye.current.useRef(T);
  }, Et.useState = function(T) {
    return ye.current.useState(T);
  }, Et.useSyncExternalStore = function(T, $, le) {
    return ye.current.useSyncExternalStore(T, $, le);
  }, Et.useTransition = function() {
    return ye.current.useTransition();
  }, Et.version = "18.2.0", Et;
}
var Fm = { exports: {} };
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var X1;
function eD() {
  return X1 || (X1 = 1, function(B, q) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var A = "18.2.0", $t = Symbol.for("react.element"), Yt = Symbol.for("react.portal"), Je = Symbol.for("react.fragment"), S = Symbol.for("react.strict_mode"), It = Symbol.for("react.profiler"), he = Symbol.for("react.provider"), pe = Symbol.for("react.context"), rt = Symbol.for("react.forward_ref"), re = Symbol.for("react.suspense"), me = Symbol.for("react.suspense_list"), ie = Symbol.for("react.memo"), Pe = Symbol.for("react.lazy"), Ct = Symbol.for("react.offscreen"), st = Symbol.iterator, dn = "@@iterator";
      function at(h) {
        if (h === null || typeof h != "object")
          return null;
        var C = st && h[st] || h[dn];
        return typeof C == "function" ? C : null;
      }
      var Qe = {
        current: null
      }, ct = {
        transition: null
      }, _e = {
        current: null,
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1
      }, it = {
        current: null
      }, He = {}, nn = null;
      function _n(h) {
        nn = h;
      }
      He.setExtraStackFrame = function(h) {
        nn = h;
      }, He.getCurrentStack = null, He.getStackAddendum = function() {
        var h = "";
        nn && (h += nn);
        var C = He.getCurrentStack;
        return C && (h += C() || ""), h;
      };
      var Qt = !1, bt = !1, Cn = !1, Ue = !1, qe = !1, Nt = {
        ReactCurrentDispatcher: Qe,
        ReactCurrentBatchConfig: ct,
        ReactCurrentOwner: it
      };
      Nt.ReactDebugCurrentFrame = He, Nt.ReactCurrentActQueue = _e;
      function Rt(h) {
        {
          for (var C = arguments.length, N = new Array(C > 1 ? C - 1 : 0), F = 1; F < C; F++)
            N[F - 1] = arguments[F];
          Z("warn", h, N);
        }
      }
      function ye(h) {
        {
          for (var C = arguments.length, N = new Array(C > 1 ? C - 1 : 0), F = 1; F < C; F++)
            N[F - 1] = arguments[F];
          Z("error", h, N);
        }
      }
      function Z(h, C, N) {
        {
          var F = Nt.ReactDebugCurrentFrame, X = F.getStackAddendum();
          X !== "" && (C += "%s", N = N.concat([X]));
          var Ne = N.map(function(ae) {
            return String(ae);
          });
          Ne.unshift("Warning: " + C), Function.prototype.apply.call(console[h], console, Ne);
        }
      }
      var we = {};
      function T(h, C) {
        {
          var N = h.constructor, F = N && (N.displayName || N.name) || "ReactClass", X = F + "." + C;
          if (we[X])
            return;
          ye("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", C, F), we[X] = !0;
        }
      }
      var $ = {
        isMounted: function(h) {
          return !1;
        },
        enqueueForceUpdate: function(h, C, N) {
          T(h, "forceUpdate");
        },
        enqueueReplaceState: function(h, C, N, F) {
          T(h, "replaceState");
        },
        enqueueSetState: function(h, C, N, F) {
          T(h, "setState");
        }
      }, le = Object.assign, $e = {};
      Object.freeze($e);
      function Fe(h, C, N) {
        this.props = h, this.context = C, this.refs = $e, this.updater = N || $;
      }
      Fe.prototype.isReactComponent = {}, Fe.prototype.setState = function(h, C) {
        if (typeof h != "object" && typeof h != "function" && h != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, h, C, "setState");
      }, Fe.prototype.forceUpdate = function(h) {
        this.updater.enqueueForceUpdate(this, h, "forceUpdate");
      };
      {
        var ht = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, et = function(h, C) {
          Object.defineProperty(Fe.prototype, h, {
            get: function() {
              Rt("%s(...) is deprecated in plain JavaScript React classes. %s", C[0], C[1]);
            }
          });
        };
        for (var ft in ht)
          ht.hasOwnProperty(ft) && et(ft, ht[ft]);
      }
      function tt() {
      }
      tt.prototype = Fe.prototype;
      function zt(h, C, N) {
        this.props = h, this.context = C, this.refs = $e, this.updater = N || $;
      }
      var Vr = zt.prototype = new tt();
      Vr.constructor = zt, le(Vr, Fe.prototype), Vr.isPureReactComponent = !0;
      function vr() {
        var h = {
          current: null
        };
        return Object.seal(h), h;
      }
      var Br = Array.isArray;
      function pn(h) {
        return Br(h);
      }
      function In(h) {
        {
          var C = typeof Symbol == "function" && Symbol.toStringTag, N = C && h[Symbol.toStringTag] || h.constructor.name || "Object";
          return N;
        }
      }
      function Fn(h) {
        try {
          return Hn(h), !1;
        } catch {
          return !0;
        }
      }
      function Hn(h) {
        return "" + h;
      }
      function bn(h) {
        if (Fn(h))
          return ye("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", In(h)), Hn(h);
      }
      function $r(h, C, N) {
        var F = h.displayName;
        if (F)
          return F;
        var X = C.displayName || C.name || "";
        return X !== "" ? N + "(" + X + ")" : N;
      }
      function Yr(h) {
        return h.displayName || "Context";
      }
      function Qn(h) {
        if (h == null)
          return null;
        if (typeof h.tag == "number" && ye("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof h == "function")
          return h.displayName || h.name || null;
        if (typeof h == "string")
          return h;
        switch (h) {
          case Je:
            return "Fragment";
          case Yt:
            return "Portal";
          case It:
            return "Profiler";
          case S:
            return "StrictMode";
          case re:
            return "Suspense";
          case me:
            return "SuspenseList";
        }
        if (typeof h == "object")
          switch (h.$$typeof) {
            case pe:
              var C = h;
              return Yr(C) + ".Consumer";
            case he:
              var N = h;
              return Yr(N._context) + ".Provider";
            case rt:
              return $r(h, h.render, "ForwardRef");
            case ie:
              var F = h.displayName || null;
              return F !== null ? F : Qn(h.type) || "Memo";
            case Pe: {
              var X = h, Ne = X._payload, ae = X._init;
              try {
                return Qn(ae(Ne));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      var hr = Object.prototype.hasOwnProperty, Ir = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      }, mr, ca, tr;
      tr = {};
      function Qr(h) {
        if (hr.call(h, "ref")) {
          var C = Object.getOwnPropertyDescriptor(h, "ref").get;
          if (C && C.isReactWarning)
            return !1;
        }
        return h.ref !== void 0;
      }
      function vn(h) {
        if (hr.call(h, "key")) {
          var C = Object.getOwnPropertyDescriptor(h, "key").get;
          if (C && C.isReactWarning)
            return !1;
        }
        return h.key !== void 0;
      }
      function xr(h, C) {
        var N = function() {
          mr || (mr = !0, ye("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", C));
        };
        N.isReactWarning = !0, Object.defineProperty(h, "key", {
          get: N,
          configurable: !0
        });
      }
      function ui(h, C) {
        var N = function() {
          ca || (ca = !0, ye("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", C));
        };
        N.isReactWarning = !0, Object.defineProperty(h, "ref", {
          get: N,
          configurable: !0
        });
      }
      function fa(h) {
        if (typeof h.ref == "string" && it.current && h.__self && it.current.stateNode !== h.__self) {
          var C = Qn(it.current.type);
          tr[C] || (ye('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', C, h.ref), tr[C] = !0);
        }
      }
      var J = function(h, C, N, F, X, Ne, ae) {
        var Le = {
          $$typeof: $t,
          type: h,
          key: C,
          ref: N,
          props: ae,
          _owner: Ne
        };
        return Le._store = {}, Object.defineProperty(Le._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: !1
        }), Object.defineProperty(Le, "_self", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: F
        }), Object.defineProperty(Le, "_source", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: X
        }), Object.freeze && (Object.freeze(Le.props), Object.freeze(Le)), Le;
      };
      function xe(h, C, N) {
        var F, X = {}, Ne = null, ae = null, Le = null, ut = null;
        if (C != null) {
          Qr(C) && (ae = C.ref, fa(C)), vn(C) && (bn(C.key), Ne = "" + C.key), Le = C.__self === void 0 ? null : C.__self, ut = C.__source === void 0 ? null : C.__source;
          for (F in C)
            hr.call(C, F) && !Ir.hasOwnProperty(F) && (X[F] = C[F]);
        }
        var xt = arguments.length - 2;
        if (xt === 1)
          X.children = N;
        else if (xt > 1) {
          for (var qt = Array(xt), Bt = 0; Bt < xt; Bt++)
            qt[Bt] = arguments[Bt + 2];
          Object.freeze && Object.freeze(qt), X.children = qt;
        }
        if (h && h.defaultProps) {
          var Xt = h.defaultProps;
          for (F in Xt)
            X[F] === void 0 && (X[F] = Xt[F]);
        }
        if (Ne || ae) {
          var tn = typeof h == "function" ? h.displayName || h.name || "Unknown" : h;
          Ne && xr(X, tn), ae && ui(X, tn);
        }
        return J(h, Ne, ae, Le, ut, it.current, X);
      }
      function nt(h, C) {
        var N = J(h.type, C, h.ref, h._self, h._source, h._owner, h.props);
        return N;
      }
      function Lt(h, C, N) {
        if (h == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + h + ".");
        var F, X = le({}, h.props), Ne = h.key, ae = h.ref, Le = h._self, ut = h._source, xt = h._owner;
        if (C != null) {
          Qr(C) && (ae = C.ref, xt = it.current), vn(C) && (bn(C.key), Ne = "" + C.key);
          var qt;
          h.type && h.type.defaultProps && (qt = h.type.defaultProps);
          for (F in C)
            hr.call(C, F) && !Ir.hasOwnProperty(F) && (C[F] === void 0 && qt !== void 0 ? X[F] = qt[F] : X[F] = C[F]);
        }
        var Bt = arguments.length - 2;
        if (Bt === 1)
          X.children = N;
        else if (Bt > 1) {
          for (var Xt = Array(Bt), tn = 0; tn < Bt; tn++)
            Xt[tn] = arguments[tn + 2];
          X.children = Xt;
        }
        return J(h.type, Ne, ae, Le, ut, xt, X);
      }
      function Ut(h) {
        return typeof h == "object" && h !== null && h.$$typeof === $t;
      }
      var Dn = ".", hn = ":";
      function yr(h) {
        var C = /[=:]/g, N = {
          "=": "=0",
          ":": "=2"
        }, F = h.replace(C, function(X) {
          return N[X];
        });
        return "$" + F;
      }
      var Vt = !1, _r = /\/+/g;
      function At(h) {
        return h.replace(_r, "$&/");
      }
      function Ft(h, C) {
        return typeof h == "object" && h !== null && h.key != null ? (bn(h.key), yr("" + h.key)) : C.toString(36);
      }
      function Ga(h, C, N, F, X) {
        var Ne = typeof h;
        (Ne === "undefined" || Ne === "boolean") && (h = null);
        var ae = !1;
        if (h === null)
          ae = !0;
        else
          switch (Ne) {
            case "string":
            case "number":
              ae = !0;
              break;
            case "object":
              switch (h.$$typeof) {
                case $t:
                case Yt:
                  ae = !0;
              }
          }
        if (ae) {
          var Le = h, ut = X(Le), xt = F === "" ? Dn + Ft(Le, 0) : F;
          if (pn(ut)) {
            var qt = "";
            xt != null && (qt = At(xt) + "/"), Ga(ut, C, qt, "", function(Bf) {
              return Bf;
            });
          } else
            ut != null && (Ut(ut) && (ut.key && (!Le || Le.key !== ut.key) && bn(ut.key), ut = nt(
              ut,
              N + (ut.key && (!Le || Le.key !== ut.key) ? At("" + ut.key) + "/" : "") + xt
            )), C.push(ut));
          return 1;
        }
        var Bt, Xt, tn = 0, vt = F === "" ? Dn : F + hn;
        if (pn(h))
          for (var Mi = 0; Mi < h.length; Mi++)
            Bt = h[Mi], Xt = vt + Ft(Bt, Mi), tn += Ga(Bt, C, N, Xt, X);
        else {
          var Ku = at(h);
          if (typeof Ku == "function") {
            var Xo = h;
            Ku === Xo.entries && (Vt || Rt("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Vt = !0);
            for (var Vf = Ku.call(Xo), Za, Ko = 0; !(Za = Vf.next()).done; )
              Bt = Za.value, Xt = vt + Ft(Bt, Ko++), tn += Ga(Bt, C, N, Xt, X);
          } else if (Ne === "object") {
            var Zo = String(h);
            throw new Error("Objects are not valid as a React child (found: " + (Zo === "[object Object]" ? "object with keys {" + Object.keys(h).join(", ") + "}" : Zo) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return tn;
      }
      function _a(h, C, N) {
        if (h == null)
          return h;
        var F = [], X = 0;
        return Ga(h, F, "", "", function(Ne) {
          return C.call(N, Ne, X++);
        }), F;
      }
      function il(h) {
        var C = 0;
        return _a(h, function() {
          C++;
        }), C;
      }
      function ql(h, C, N) {
        _a(h, function() {
          C.apply(this, arguments);
        }, N);
      }
      function ju(h) {
        return _a(h, function(C) {
          return C;
        }) || [];
      }
      function ki(h) {
        if (!Ut(h))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return h;
      }
      function ll(h) {
        var C = {
          $$typeof: pe,
          _currentValue: h,
          _currentValue2: h,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null
        };
        C.Provider = {
          $$typeof: he,
          _context: C
        };
        var N = !1, F = !1, X = !1;
        {
          var Ne = {
            $$typeof: pe,
            _context: C
          };
          Object.defineProperties(Ne, {
            Provider: {
              get: function() {
                return F || (F = !0, ye("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), C.Provider;
              },
              set: function(ae) {
                C.Provider = ae;
              }
            },
            _currentValue: {
              get: function() {
                return C._currentValue;
              },
              set: function(ae) {
                C._currentValue = ae;
              }
            },
            _currentValue2: {
              get: function() {
                return C._currentValue2;
              },
              set: function(ae) {
                C._currentValue2 = ae;
              }
            },
            _threadCount: {
              get: function() {
                return C._threadCount;
              },
              set: function(ae) {
                C._threadCount = ae;
              }
            },
            Consumer: {
              get: function() {
                return N || (N = !0, ye("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), C.Consumer;
              }
            },
            displayName: {
              get: function() {
                return C.displayName;
              },
              set: function(ae) {
                X || (Rt("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", ae), X = !0);
              }
            }
          }), C.Consumer = Ne;
        }
        return C._currentRenderer = null, C._currentRenderer2 = null, C;
      }
      var da = -1, oi = 0, pa = 1, si = 2;
      function br(h) {
        if (h._status === da) {
          var C = h._result, N = C();
          if (N.then(function(Ne) {
            if (h._status === oi || h._status === da) {
              var ae = h;
              ae._status = pa, ae._result = Ne;
            }
          }, function(Ne) {
            if (h._status === oi || h._status === da) {
              var ae = h;
              ae._status = si, ae._result = Ne;
            }
          }), h._status === da) {
            var F = h;
            F._status = oi, F._result = N;
          }
        }
        if (h._status === pa) {
          var X = h._result;
          return X === void 0 && ye(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, X), "default" in X || ye(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, X), X.default;
        } else
          throw h._result;
      }
      function va(h) {
        var C = {
          _status: da,
          _result: h
        }, N = {
          $$typeof: Pe,
          _payload: C,
          _init: br
        };
        {
          var F, X;
          Object.defineProperties(N, {
            defaultProps: {
              configurable: !0,
              get: function() {
                return F;
              },
              set: function(Ne) {
                ye("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), F = Ne, Object.defineProperty(N, "defaultProps", {
                  enumerable: !0
                });
              }
            },
            propTypes: {
              configurable: !0,
              get: function() {
                return X;
              },
              set: function(Ne) {
                ye("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), X = Ne, Object.defineProperty(N, "propTypes", {
                  enumerable: !0
                });
              }
            }
          });
        }
        return N;
      }
      function ci(h) {
        h != null && h.$$typeof === ie ? ye("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof h != "function" ? ye("forwardRef requires a render function but was given %s.", h === null ? "null" : typeof h) : h.length !== 0 && h.length !== 2 && ye("forwardRef render functions accept exactly two parameters: props and ref. %s", h.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), h != null && (h.defaultProps != null || h.propTypes != null) && ye("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var C = {
          $$typeof: rt,
          render: h
        };
        {
          var N;
          Object.defineProperty(C, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return N;
            },
            set: function(F) {
              N = F, !h.name && !h.displayName && (h.displayName = F);
            }
          });
        }
        return C;
      }
      var R;
      R = Symbol.for("react.module.reference");
      function Y(h) {
        return !!(typeof h == "string" || typeof h == "function" || h === Je || h === It || qe || h === S || h === re || h === me || Ue || h === Ct || Qt || bt || Cn || typeof h == "object" && h !== null && (h.$$typeof === Pe || h.$$typeof === ie || h.$$typeof === he || h.$$typeof === pe || h.$$typeof === rt || h.$$typeof === R || h.getModuleId !== void 0));
      }
      function ee(h, C) {
        Y(h) || ye("memo: The first argument must be a component. Instead received: %s", h === null ? "null" : typeof h);
        var N = {
          $$typeof: ie,
          type: h,
          compare: C === void 0 ? null : C
        };
        {
          var F;
          Object.defineProperty(N, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return F;
            },
            set: function(X) {
              F = X, !h.name && !h.displayName && (h.displayName = X);
            }
          });
        }
        return N;
      }
      function ce() {
        var h = Qe.current;
        return h === null && ye(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), h;
      }
      function Ge(h) {
        var C = ce();
        if (h._context !== void 0) {
          var N = h._context;
          N.Consumer === h ? ye("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : N.Provider === h && ye("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return C.useContext(h);
      }
      function mt(h) {
        var C = ce();
        return C.useState(h);
      }
      function Xe(h, C, N) {
        var F = ce();
        return F.useReducer(h, C, N);
      }
      function ke(h) {
        var C = ce();
        return C.useRef(h);
      }
      function Mn(h, C) {
        var N = ce();
        return N.useEffect(h, C);
      }
      function Jt(h, C) {
        var N = ce();
        return N.useInsertionEffect(h, C);
      }
      function en(h, C) {
        var N = ce();
        return N.useLayoutEffect(h, C);
      }
      function nr(h, C) {
        var N = ce();
        return N.useCallback(h, C);
      }
      function fi(h, C) {
        var N = ce();
        return N.useMemo(h, C);
      }
      function Pu(h, C, N) {
        var F = ce();
        return F.useImperativeHandle(h, C, N);
      }
      function Tt(h, C) {
        {
          var N = ce();
          return N.useDebugValue(h, C);
        }
      }
      function jf() {
        var h = ce();
        return h.useTransition();
      }
      function qa(h) {
        var C = ce();
        return C.useDeferredValue(h);
      }
      function lt() {
        var h = ce();
        return h.useId();
      }
      function di(h, C, N) {
        var F = ce();
        return F.useSyncExternalStore(h, C, N);
      }
      var ul = 0, Vu, ol, Wr, Qo, Dr, Wo, Go;
      function Ks() {
      }
      Ks.__reactDisabledLog = !0;
      function Bu() {
        {
          if (ul === 0) {
            Vu = console.log, ol = console.info, Wr = console.warn, Qo = console.error, Dr = console.group, Wo = console.groupCollapsed, Go = console.groupEnd;
            var h = {
              configurable: !0,
              enumerable: !0,
              value: Ks,
              writable: !0
            };
            Object.defineProperties(console, {
              info: h,
              log: h,
              warn: h,
              error: h,
              group: h,
              groupCollapsed: h,
              groupEnd: h
            });
          }
          ul++;
        }
      }
      function sl() {
        {
          if (ul--, ul === 0) {
            var h = {
              configurable: !0,
              enumerable: !0,
              writable: !0
            };
            Object.defineProperties(console, {
              log: le({}, h, {
                value: Vu
              }),
              info: le({}, h, {
                value: ol
              }),
              warn: le({}, h, {
                value: Wr
              }),
              error: le({}, h, {
                value: Qo
              }),
              group: le({}, h, {
                value: Dr
              }),
              groupCollapsed: le({}, h, {
                value: Wo
              }),
              groupEnd: le({}, h, {
                value: Go
              })
            });
          }
          ul < 0 && ye("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      var Xa = Nt.ReactCurrentDispatcher, kr;
      function cl(h, C, N) {
        {
          if (kr === void 0)
            try {
              throw Error();
            } catch (X) {
              var F = X.stack.trim().match(/\n( *(at )?)/);
              kr = F && F[1] || "";
            }
          return `
` + kr + h;
        }
      }
      var fl = !1, dl;
      {
        var $u = typeof WeakMap == "function" ? WeakMap : Map;
        dl = new $u();
      }
      function Yu(h, C) {
        if (!h || fl)
          return "";
        {
          var N = dl.get(h);
          if (N !== void 0)
            return N;
        }
        var F;
        fl = !0;
        var X = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var Ne;
        Ne = Xa.current, Xa.current = null, Bu();
        try {
          if (C) {
            var ae = function() {
              throw Error();
            };
            if (Object.defineProperty(ae.prototype, "props", {
              set: function() {
                throw Error();
              }
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(ae, []);
              } catch (vt) {
                F = vt;
              }
              Reflect.construct(h, [], ae);
            } else {
              try {
                ae.call();
              } catch (vt) {
                F = vt;
              }
              h.call(ae.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (vt) {
              F = vt;
            }
            h();
          }
        } catch (vt) {
          if (vt && F && typeof vt.stack == "string") {
            for (var Le = vt.stack.split(`
`), ut = F.stack.split(`
`), xt = Le.length - 1, qt = ut.length - 1; xt >= 1 && qt >= 0 && Le[xt] !== ut[qt]; )
              qt--;
            for (; xt >= 1 && qt >= 0; xt--, qt--)
              if (Le[xt] !== ut[qt]) {
                if (xt !== 1 || qt !== 1)
                  do
                    if (xt--, qt--, qt < 0 || Le[xt] !== ut[qt]) {
                      var Bt = `
` + Le[xt].replace(" at new ", " at ");
                      return h.displayName && Bt.includes("<anonymous>") && (Bt = Bt.replace("<anonymous>", h.displayName)), typeof h == "function" && dl.set(h, Bt), Bt;
                    }
                  while (xt >= 1 && qt >= 0);
                break;
              }
          }
        } finally {
          fl = !1, Xa.current = Ne, sl(), Error.prepareStackTrace = X;
        }
        var Xt = h ? h.displayName || h.name : "", tn = Xt ? cl(Xt) : "";
        return typeof h == "function" && dl.set(h, tn), tn;
      }
      function Oi(h, C, N) {
        return Yu(h, !1);
      }
      function Pf(h) {
        var C = h.prototype;
        return !!(C && C.isReactComponent);
      }
      function pi(h, C, N) {
        if (h == null)
          return "";
        if (typeof h == "function")
          return Yu(h, Pf(h));
        if (typeof h == "string")
          return cl(h);
        switch (h) {
          case re:
            return cl("Suspense");
          case me:
            return cl("SuspenseList");
        }
        if (typeof h == "object")
          switch (h.$$typeof) {
            case rt:
              return Oi(h.render);
            case ie:
              return pi(h.type, C, N);
            case Pe: {
              var F = h, X = F._payload, Ne = F._init;
              try {
                return pi(Ne(X), C, N);
              } catch {
              }
            }
          }
        return "";
      }
      var Dt = {}, Iu = Nt.ReactDebugCurrentFrame;
      function Xl(h) {
        if (h) {
          var C = h._owner, N = pi(h.type, h._source, C ? C.type : null);
          Iu.setExtraStackFrame(N);
        } else
          Iu.setExtraStackFrame(null);
      }
      function Qu(h, C, N, F, X) {
        {
          var Ne = Function.call.bind(hr);
          for (var ae in h)
            if (Ne(h, ae)) {
              var Le = void 0;
              try {
                if (typeof h[ae] != "function") {
                  var ut = Error((F || "React class") + ": " + N + " type `" + ae + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof h[ae] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw ut.name = "Invariant Violation", ut;
                }
                Le = h[ae](C, ae, F, N, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (xt) {
                Le = xt;
              }
              Le && !(Le instanceof Error) && (Xl(X), ye("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", F || "React class", N, ae, typeof Le), Xl(null)), Le instanceof Error && !(Le.message in Dt) && (Dt[Le.message] = !0, Xl(X), ye("Failed %s type: %s", N, Le.message), Xl(null));
            }
        }
      }
      function wt(h) {
        if (h) {
          var C = h._owner, N = pi(h.type, h._source, C ? C.type : null);
          _n(N);
        } else
          _n(null);
      }
      var Wu;
      Wu = !1;
      function Gu() {
        if (it.current) {
          var h = Qn(it.current.type);
          if (h)
            return `

Check the render method of \`` + h + "`.";
        }
        return "";
      }
      function Ye(h) {
        if (h !== void 0) {
          var C = h.fileName.replace(/^.*[\\\/]/, ""), N = h.lineNumber;
          return `

Check your code at ` + C + ":" + N + ".";
        }
        return "";
      }
      function Kl(h) {
        return h != null ? Ye(h.__source) : "";
      }
      var mn = {};
      function Gr(h) {
        var C = Gu();
        if (!C) {
          var N = typeof h == "string" ? h : h.displayName || h.name;
          N && (C = `

Check the top-level render call using <` + N + ">.");
        }
        return C;
      }
      function Or(h, C) {
        if (!(!h._store || h._store.validated || h.key != null)) {
          h._store.validated = !0;
          var N = Gr(C);
          if (!mn[N]) {
            mn[N] = !0;
            var F = "";
            h && h._owner && h._owner !== it.current && (F = " It was passed a child from " + Qn(h._owner.type) + "."), wt(h), ye('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', N, F), wt(null);
          }
        }
      }
      function pl(h, C) {
        if (typeof h == "object") {
          if (pn(h))
            for (var N = 0; N < h.length; N++) {
              var F = h[N];
              Ut(F) && Or(F, C);
            }
          else if (Ut(h))
            h._store && (h._store.validated = !0);
          else if (h) {
            var X = at(h);
            if (typeof X == "function" && X !== h.entries)
              for (var Ne = X.call(h), ae; !(ae = Ne.next()).done; )
                Ut(ae.value) && Or(ae.value, C);
          }
        }
      }
      function Rn(h) {
        {
          var C = h.type;
          if (C == null || typeof C == "string")
            return;
          var N;
          if (typeof C == "function")
            N = C.propTypes;
          else if (typeof C == "object" && (C.$$typeof === rt || C.$$typeof === ie))
            N = C.propTypes;
          else
            return;
          if (N) {
            var F = Qn(C);
            Qu(N, h.props, "prop", F, h);
          } else if (C.PropTypes !== void 0 && !Wu) {
            Wu = !0;
            var X = Qn(C);
            ye("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", X || "Unknown");
          }
          typeof C.getDefaultProps == "function" && !C.getDefaultProps.isReactClassApproved && ye("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      function Ht(h) {
        {
          for (var C = Object.keys(h.props), N = 0; N < C.length; N++) {
            var F = C[N];
            if (F !== "children" && F !== "key") {
              wt(h), ye("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", F), wt(null);
              break;
            }
          }
          h.ref !== null && (wt(h), ye("Invalid attribute `ref` supplied to `React.Fragment`."), wt(null));
        }
      }
      function Zs(h, C, N) {
        var F = Y(h);
        if (!F) {
          var X = "";
          (h === void 0 || typeof h == "object" && h !== null && Object.keys(h).length === 0) && (X += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var Ne = Kl(C);
          Ne ? X += Ne : X += Gu();
          var ae;
          h === null ? ae = "null" : pn(h) ? ae = "array" : h !== void 0 && h.$$typeof === $t ? (ae = "<" + (Qn(h.type) || "Unknown") + " />", X = " Did you accidentally export a JSX literal instead of a component?") : ae = typeof h, ye("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", ae, X);
        }
        var Le = xe.apply(this, arguments);
        if (Le == null)
          return Le;
        if (F)
          for (var ut = 2; ut < arguments.length; ut++)
            pl(arguments[ut], h);
        return h === Je ? Ht(Le) : Rn(Le), Le;
      }
      var qr = !1;
      function Wn(h) {
        var C = Zs.bind(null, h);
        return C.type = h, qr || (qr = !0, Rt("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(C, "type", {
          enumerable: !1,
          get: function() {
            return Rt("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: h
            }), h;
          }
        }), C;
      }
      function vi(h, C, N) {
        for (var F = Lt.apply(this, arguments), X = 2; X < arguments.length; X++)
          pl(arguments[X], F.type);
        return Rn(F), F;
      }
      function Js(h, C) {
        var N = ct.transition;
        ct.transition = {};
        var F = ct.transition;
        ct.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          h();
        } finally {
          if (ct.transition = N, N === null && F._updatedFibers) {
            var X = F._updatedFibers.size;
            X > 10 && Rt("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), F._updatedFibers.clear();
          }
        }
      }
      var Li = !1, vl = null;
      function ec(h) {
        if (vl === null)
          try {
            var C = ("require" + Math.random()).slice(0, 7), N = B && B[C];
            vl = N.call(B, "timers").setImmediate;
          } catch {
            vl = function(X) {
              Li === !1 && (Li = !0, typeof MessageChannel > "u" && ye("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var Ne = new MessageChannel();
              Ne.port1.onmessage = X, Ne.port2.postMessage(void 0);
            };
          }
        return vl(h);
      }
      var ba = 0, hl = !1;
      function ml(h) {
        {
          var C = ba;
          ba++, _e.current === null && (_e.current = []);
          var N = _e.isBatchingLegacy, F;
          try {
            if (_e.isBatchingLegacy = !0, F = h(), !N && _e.didScheduleLegacyUpdate) {
              var X = _e.current;
              X !== null && (_e.didScheduleLegacyUpdate = !1, gl(X));
            }
          } catch (Xt) {
            throw Da(C), Xt;
          } finally {
            _e.isBatchingLegacy = N;
          }
          if (F !== null && typeof F == "object" && typeof F.then == "function") {
            var Ne = F, ae = !1, Le = {
              then: function(Xt, tn) {
                ae = !0, Ne.then(function(vt) {
                  Da(C), ba === 0 ? qu(vt, Xt, tn) : Xt(vt);
                }, function(vt) {
                  Da(C), tn(vt);
                });
              }
            };
            return !hl && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              ae || (hl = !0, ye("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), Le;
          } else {
            var ut = F;
            if (Da(C), ba === 0) {
              var xt = _e.current;
              xt !== null && (gl(xt), _e.current = null);
              var qt = {
                then: function(Xt, tn) {
                  _e.current === null ? (_e.current = [], qu(ut, Xt, tn)) : Xt(ut);
                }
              };
              return qt;
            } else {
              var Bt = {
                then: function(Xt, tn) {
                  Xt(ut);
                }
              };
              return Bt;
            }
          }
        }
      }
      function Da(h) {
        h !== ba - 1 && ye("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), ba = h;
      }
      function qu(h, C, N) {
        {
          var F = _e.current;
          if (F !== null)
            try {
              gl(F), ec(function() {
                F.length === 0 ? (_e.current = null, C(h)) : qu(h, C, N);
              });
            } catch (X) {
              N(X);
            }
          else
            C(h);
        }
      }
      var yl = !1;
      function gl(h) {
        if (!yl) {
          yl = !0;
          var C = 0;
          try {
            for (; C < h.length; C++) {
              var N = h[C];
              do
                N = N(!0);
              while (N !== null);
            }
            h.length = 0;
          } catch (F) {
            throw h = h.slice(C + 1), F;
          } finally {
            yl = !1;
          }
        }
      }
      var Zl = Zs, Xu = vi, qo = Wn, Ka = {
        map: _a,
        forEach: ql,
        count: il,
        toArray: ju,
        only: ki
      };
      q.Children = Ka, q.Component = Fe, q.Fragment = Je, q.Profiler = It, q.PureComponent = zt, q.StrictMode = S, q.Suspense = re, q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Nt, q.cloneElement = Xu, q.createContext = ll, q.createElement = Zl, q.createFactory = qo, q.createRef = vr, q.forwardRef = ci, q.isValidElement = Ut, q.lazy = va, q.memo = ee, q.startTransition = Js, q.unstable_act = ml, q.useCallback = nr, q.useContext = Ge, q.useDebugValue = Tt, q.useDeferredValue = qa, q.useEffect = Mn, q.useId = lt, q.useImperativeHandle = Pu, q.useInsertionEffect = Jt, q.useLayoutEffect = en, q.useMemo = fi, q.useReducer = Xe, q.useRef = ke, q.useState = mt, q.useSyncExternalStore = di, q.useTransition = jf, q.version = A, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(Fm, Fm.exports)), Fm.exports;
}
(function(B) {
  process.env.NODE_ENV === "production" ? B.exports = Jb() : B.exports = eD();
})(Xs);
const tD = /* @__PURE__ */ Zb(Xs.exports);
var Kp = {}, lR = { exports: {} }, Qa = {}, c0 = { exports: {} }, f0 = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var K1;
function nD() {
  return K1 || (K1 = 1, function(B) {
    function q(Z, we) {
      var T = Z.length;
      Z.push(we);
      e:
        for (; 0 < T; ) {
          var $ = T - 1 >>> 1, le = Z[$];
          if (0 < Yt(le, we))
            Z[$] = we, Z[T] = le, T = $;
          else
            break e;
        }
    }
    function A(Z) {
      return Z.length === 0 ? null : Z[0];
    }
    function $t(Z) {
      if (Z.length === 0)
        return null;
      var we = Z[0], T = Z.pop();
      if (T !== we) {
        Z[0] = T;
        e:
          for (var $ = 0, le = Z.length, $e = le >>> 1; $ < $e; ) {
            var Fe = 2 * ($ + 1) - 1, ht = Z[Fe], et = Fe + 1, ft = Z[et];
            if (0 > Yt(ht, T))
              et < le && 0 > Yt(ft, ht) ? (Z[$] = ft, Z[et] = T, $ = et) : (Z[$] = ht, Z[Fe] = T, $ = Fe);
            else if (et < le && 0 > Yt(ft, T))
              Z[$] = ft, Z[et] = T, $ = et;
            else
              break e;
          }
      }
      return we;
    }
    function Yt(Z, we) {
      var T = Z.sortIndex - we.sortIndex;
      return T !== 0 ? T : Z.id - we.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var Je = performance;
      B.unstable_now = function() {
        return Je.now();
      };
    } else {
      var S = Date, It = S.now();
      B.unstable_now = function() {
        return S.now() - It;
      };
    }
    var he = [], pe = [], rt = 1, re = null, me = 3, ie = !1, Pe = !1, Ct = !1, st = typeof setTimeout == "function" ? setTimeout : null, dn = typeof clearTimeout == "function" ? clearTimeout : null, at = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function Qe(Z) {
      for (var we = A(pe); we !== null; ) {
        if (we.callback === null)
          $t(pe);
        else if (we.startTime <= Z)
          $t(pe), we.sortIndex = we.expirationTime, q(he, we);
        else
          break;
        we = A(pe);
      }
    }
    function ct(Z) {
      if (Ct = !1, Qe(Z), !Pe)
        if (A(he) !== null)
          Pe = !0, Rt(_e);
        else {
          var we = A(pe);
          we !== null && ye(ct, we.startTime - Z);
        }
    }
    function _e(Z, we) {
      Pe = !1, Ct && (Ct = !1, dn(nn), nn = -1), ie = !0;
      var T = me;
      try {
        for (Qe(we), re = A(he); re !== null && (!(re.expirationTime > we) || Z && !bt()); ) {
          var $ = re.callback;
          if (typeof $ == "function") {
            re.callback = null, me = re.priorityLevel;
            var le = $(re.expirationTime <= we);
            we = B.unstable_now(), typeof le == "function" ? re.callback = le : re === A(he) && $t(he), Qe(we);
          } else
            $t(he);
          re = A(he);
        }
        if (re !== null)
          var $e = !0;
        else {
          var Fe = A(pe);
          Fe !== null && ye(ct, Fe.startTime - we), $e = !1;
        }
        return $e;
      } finally {
        re = null, me = T, ie = !1;
      }
    }
    var it = !1, He = null, nn = -1, _n = 5, Qt = -1;
    function bt() {
      return !(B.unstable_now() - Qt < _n);
    }
    function Cn() {
      if (He !== null) {
        var Z = B.unstable_now();
        Qt = Z;
        var we = !0;
        try {
          we = He(!0, Z);
        } finally {
          we ? Ue() : (it = !1, He = null);
        }
      } else
        it = !1;
    }
    var Ue;
    if (typeof at == "function")
      Ue = function() {
        at(Cn);
      };
    else if (typeof MessageChannel < "u") {
      var qe = new MessageChannel(), Nt = qe.port2;
      qe.port1.onmessage = Cn, Ue = function() {
        Nt.postMessage(null);
      };
    } else
      Ue = function() {
        st(Cn, 0);
      };
    function Rt(Z) {
      He = Z, it || (it = !0, Ue());
    }
    function ye(Z, we) {
      nn = st(function() {
        Z(B.unstable_now());
      }, we);
    }
    B.unstable_IdlePriority = 5, B.unstable_ImmediatePriority = 1, B.unstable_LowPriority = 4, B.unstable_NormalPriority = 3, B.unstable_Profiling = null, B.unstable_UserBlockingPriority = 2, B.unstable_cancelCallback = function(Z) {
      Z.callback = null;
    }, B.unstable_continueExecution = function() {
      Pe || ie || (Pe = !0, Rt(_e));
    }, B.unstable_forceFrameRate = function(Z) {
      0 > Z || 125 < Z ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : _n = 0 < Z ? Math.floor(1e3 / Z) : 5;
    }, B.unstable_getCurrentPriorityLevel = function() {
      return me;
    }, B.unstable_getFirstCallbackNode = function() {
      return A(he);
    }, B.unstable_next = function(Z) {
      switch (me) {
        case 1:
        case 2:
        case 3:
          var we = 3;
          break;
        default:
          we = me;
      }
      var T = me;
      me = we;
      try {
        return Z();
      } finally {
        me = T;
      }
    }, B.unstable_pauseExecution = function() {
    }, B.unstable_requestPaint = function() {
    }, B.unstable_runWithPriority = function(Z, we) {
      switch (Z) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          Z = 3;
      }
      var T = me;
      me = Z;
      try {
        return we();
      } finally {
        me = T;
      }
    }, B.unstable_scheduleCallback = function(Z, we, T) {
      var $ = B.unstable_now();
      switch (typeof T == "object" && T !== null ? (T = T.delay, T = typeof T == "number" && 0 < T ? $ + T : $) : T = $, Z) {
        case 1:
          var le = -1;
          break;
        case 2:
          le = 250;
          break;
        case 5:
          le = 1073741823;
          break;
        case 4:
          le = 1e4;
          break;
        default:
          le = 5e3;
      }
      return le = T + le, Z = { id: rt++, callback: we, priorityLevel: Z, startTime: T, expirationTime: le, sortIndex: -1 }, T > $ ? (Z.sortIndex = T, q(pe, Z), A(he) === null && Z === A(pe) && (Ct ? (dn(nn), nn = -1) : Ct = !0, ye(ct, T - $))) : (Z.sortIndex = le, q(he, Z), Pe || ie || (Pe = !0, Rt(_e))), Z;
    }, B.unstable_shouldYield = bt, B.unstable_wrapCallback = function(Z) {
      var we = me;
      return function() {
        var T = me;
        me = we;
        try {
          return Z.apply(this, arguments);
        } finally {
          me = T;
        }
      };
    };
  }(f0)), f0;
}
var d0 = {};
/**
 * @license React
 * scheduler.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Z1;
function rD() {
  return Z1 || (Z1 = 1, function(B) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var q = !1, A = !1, $t = 5;
      function Yt(J, xe) {
        var nt = J.length;
        J.push(xe), It(J, xe, nt);
      }
      function Je(J) {
        return J.length === 0 ? null : J[0];
      }
      function S(J) {
        if (J.length === 0)
          return null;
        var xe = J[0], nt = J.pop();
        return nt !== xe && (J[0] = nt, he(J, nt, 0)), xe;
      }
      function It(J, xe, nt) {
        for (var Lt = nt; Lt > 0; ) {
          var Ut = Lt - 1 >>> 1, Dn = J[Ut];
          if (pe(Dn, xe) > 0)
            J[Ut] = xe, J[Lt] = Dn, Lt = Ut;
          else
            return;
        }
      }
      function he(J, xe, nt) {
        for (var Lt = nt, Ut = J.length, Dn = Ut >>> 1; Lt < Dn; ) {
          var hn = (Lt + 1) * 2 - 1, yr = J[hn], Vt = hn + 1, _r = J[Vt];
          if (pe(yr, xe) < 0)
            Vt < Ut && pe(_r, yr) < 0 ? (J[Lt] = _r, J[Vt] = xe, Lt = Vt) : (J[Lt] = yr, J[hn] = xe, Lt = hn);
          else if (Vt < Ut && pe(_r, xe) < 0)
            J[Lt] = _r, J[Vt] = xe, Lt = Vt;
          else
            return;
        }
      }
      function pe(J, xe) {
        var nt = J.sortIndex - xe.sortIndex;
        return nt !== 0 ? nt : J.id - xe.id;
      }
      var rt = 1, re = 2, me = 3, ie = 4, Pe = 5;
      function Ct(J, xe) {
      }
      var st = typeof performance == "object" && typeof performance.now == "function";
      if (st) {
        var dn = performance;
        B.unstable_now = function() {
          return dn.now();
        };
      } else {
        var at = Date, Qe = at.now();
        B.unstable_now = function() {
          return at.now() - Qe;
        };
      }
      var ct = 1073741823, _e = -1, it = 250, He = 5e3, nn = 1e4, _n = ct, Qt = [], bt = [], Cn = 1, Ue = null, qe = me, Nt = !1, Rt = !1, ye = !1, Z = typeof setTimeout == "function" ? setTimeout : null, we = typeof clearTimeout == "function" ? clearTimeout : null, T = typeof setImmediate < "u" ? setImmediate : null;
      typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function $(J) {
        for (var xe = Je(bt); xe !== null; ) {
          if (xe.callback === null)
            S(bt);
          else if (xe.startTime <= J)
            S(bt), xe.sortIndex = xe.expirationTime, Yt(Qt, xe);
          else
            return;
          xe = Je(bt);
        }
      }
      function le(J) {
        if (ye = !1, $(J), !Rt)
          if (Je(Qt) !== null)
            Rt = !0, Qr($e);
          else {
            var xe = Je(bt);
            xe !== null && vn(le, xe.startTime - J);
          }
      }
      function $e(J, xe) {
        Rt = !1, ye && (ye = !1, xr()), Nt = !0;
        var nt = qe;
        try {
          var Lt;
          if (!A)
            return Fe(J, xe);
        } finally {
          Ue = null, qe = nt, Nt = !1;
        }
      }
      function Fe(J, xe) {
        var nt = xe;
        for ($(nt), Ue = Je(Qt); Ue !== null && !q && !(Ue.expirationTime > nt && (!J || Yr())); ) {
          var Lt = Ue.callback;
          if (typeof Lt == "function") {
            Ue.callback = null, qe = Ue.priorityLevel;
            var Ut = Ue.expirationTime <= nt, Dn = Lt(Ut);
            nt = B.unstable_now(), typeof Dn == "function" ? Ue.callback = Dn : Ue === Je(Qt) && S(Qt), $(nt);
          } else
            S(Qt);
          Ue = Je(Qt);
        }
        if (Ue !== null)
          return !0;
        var hn = Je(bt);
        return hn !== null && vn(le, hn.startTime - nt), !1;
      }
      function ht(J, xe) {
        switch (J) {
          case rt:
          case re:
          case me:
          case ie:
          case Pe:
            break;
          default:
            J = me;
        }
        var nt = qe;
        qe = J;
        try {
          return xe();
        } finally {
          qe = nt;
        }
      }
      function et(J) {
        var xe;
        switch (qe) {
          case rt:
          case re:
          case me:
            xe = me;
            break;
          default:
            xe = qe;
            break;
        }
        var nt = qe;
        qe = xe;
        try {
          return J();
        } finally {
          qe = nt;
        }
      }
      function ft(J) {
        var xe = qe;
        return function() {
          var nt = qe;
          qe = xe;
          try {
            return J.apply(this, arguments);
          } finally {
            qe = nt;
          }
        };
      }
      function tt(J, xe, nt) {
        var Lt = B.unstable_now(), Ut;
        if (typeof nt == "object" && nt !== null) {
          var Dn = nt.delay;
          typeof Dn == "number" && Dn > 0 ? Ut = Lt + Dn : Ut = Lt;
        } else
          Ut = Lt;
        var hn;
        switch (J) {
          case rt:
            hn = _e;
            break;
          case re:
            hn = it;
            break;
          case Pe:
            hn = _n;
            break;
          case ie:
            hn = nn;
            break;
          case me:
          default:
            hn = He;
            break;
        }
        var yr = Ut + hn, Vt = {
          id: Cn++,
          callback: xe,
          priorityLevel: J,
          startTime: Ut,
          expirationTime: yr,
          sortIndex: -1
        };
        return Ut > Lt ? (Vt.sortIndex = Ut, Yt(bt, Vt), Je(Qt) === null && Vt === Je(bt) && (ye ? xr() : ye = !0, vn(le, Ut - Lt))) : (Vt.sortIndex = yr, Yt(Qt, Vt), !Rt && !Nt && (Rt = !0, Qr($e))), Vt;
      }
      function zt() {
      }
      function Vr() {
        !Rt && !Nt && (Rt = !0, Qr($e));
      }
      function vr() {
        return Je(Qt);
      }
      function Br(J) {
        J.callback = null;
      }
      function pn() {
        return qe;
      }
      var In = !1, Fn = null, Hn = -1, bn = $t, $r = -1;
      function Yr() {
        var J = B.unstable_now() - $r;
        return !(J < bn);
      }
      function Qn() {
      }
      function hr(J) {
        if (J < 0 || J > 125) {
          console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported");
          return;
        }
        J > 0 ? bn = Math.floor(1e3 / J) : bn = $t;
      }
      var Ir = function() {
        if (Fn !== null) {
          var J = B.unstable_now();
          $r = J;
          var xe = !0, nt = !0;
          try {
            nt = Fn(xe, J);
          } finally {
            nt ? mr() : (In = !1, Fn = null);
          }
        } else
          In = !1;
      }, mr;
      if (typeof T == "function")
        mr = function() {
          T(Ir);
        };
      else if (typeof MessageChannel < "u") {
        var ca = new MessageChannel(), tr = ca.port2;
        ca.port1.onmessage = Ir, mr = function() {
          tr.postMessage(null);
        };
      } else
        mr = function() {
          Z(Ir, 0);
        };
      function Qr(J) {
        Fn = J, In || (In = !0, mr());
      }
      function vn(J, xe) {
        Hn = Z(function() {
          J(B.unstable_now());
        }, xe);
      }
      function xr() {
        we(Hn), Hn = -1;
      }
      var ui = Qn, fa = null;
      B.unstable_IdlePriority = Pe, B.unstable_ImmediatePriority = rt, B.unstable_LowPriority = ie, B.unstable_NormalPriority = me, B.unstable_Profiling = fa, B.unstable_UserBlockingPriority = re, B.unstable_cancelCallback = Br, B.unstable_continueExecution = Vr, B.unstable_forceFrameRate = hr, B.unstable_getCurrentPriorityLevel = pn, B.unstable_getFirstCallbackNode = vr, B.unstable_next = et, B.unstable_pauseExecution = zt, B.unstable_requestPaint = ui, B.unstable_runWithPriority = ht, B.unstable_scheduleCallback = tt, B.unstable_shouldYield = Yr, B.unstable_wrapCallback = ft, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(d0)), d0;
}
var J1;
function uR() {
  return J1 || (J1 = 1, function(B) {
    process.env.NODE_ENV === "production" ? B.exports = nD() : B.exports = rD();
  }(c0)), c0.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var eR;
function aD() {
  if (eR)
    return Qa;
  eR = 1;
  var B = Xs.exports, q = uR();
  function A(n) {
    for (var r = "https://reactjs.org/docs/error-decoder.html?invariant=" + n, l = 1; l < arguments.length; l++)
      r += "&args[]=" + encodeURIComponent(arguments[l]);
    return "Minified React error #" + n + "; visit " + r + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var $t = /* @__PURE__ */ new Set(), Yt = {};
  function Je(n, r) {
    S(n, r), S(n + "Capture", r);
  }
  function S(n, r) {
    for (Yt[n] = r, n = 0; n < r.length; n++)
      $t.add(r[n]);
  }
  var It = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), he = Object.prototype.hasOwnProperty, pe = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, rt = {}, re = {};
  function me(n) {
    return he.call(re, n) ? !0 : he.call(rt, n) ? !1 : pe.test(n) ? re[n] = !0 : (rt[n] = !0, !1);
  }
  function ie(n, r, l, o) {
    if (l !== null && l.type === 0)
      return !1;
    switch (typeof r) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return o ? !1 : l !== null ? !l.acceptsBooleans : (n = n.toLowerCase().slice(0, 5), n !== "data-" && n !== "aria-");
      default:
        return !1;
    }
  }
  function Pe(n, r, l, o) {
    if (r === null || typeof r > "u" || ie(n, r, l, o))
      return !0;
    if (o)
      return !1;
    if (l !== null)
      switch (l.type) {
        case 3:
          return !r;
        case 4:
          return r === !1;
        case 5:
          return isNaN(r);
        case 6:
          return isNaN(r) || 1 > r;
      }
    return !1;
  }
  function Ct(n, r, l, o, c, d, m) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = o, this.attributeNamespace = c, this.mustUseProperty = l, this.propertyName = n, this.type = r, this.sanitizeURL = d, this.removeEmptyString = m;
  }
  var st = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n) {
    st[n] = new Ct(n, 0, !1, n, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(n) {
    var r = n[0];
    st[r] = new Ct(r, 1, !1, n[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(n) {
    st[n] = new Ct(n, 2, !1, n.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(n) {
    st[n] = new Ct(n, 2, !1, n, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n) {
    st[n] = new Ct(n, 3, !1, n.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(n) {
    st[n] = new Ct(n, 3, !0, n, null, !1, !1);
  }), ["capture", "download"].forEach(function(n) {
    st[n] = new Ct(n, 4, !1, n, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(n) {
    st[n] = new Ct(n, 6, !1, n, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(n) {
    st[n] = new Ct(n, 5, !1, n.toLowerCase(), null, !1, !1);
  });
  var dn = /[\-:]([a-z])/g;
  function at(n) {
    return n[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n) {
    var r = n.replace(
      dn,
      at
    );
    st[r] = new Ct(r, 1, !1, n, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n) {
    var r = n.replace(dn, at);
    st[r] = new Ct(r, 1, !1, n, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(n) {
    var r = n.replace(dn, at);
    st[r] = new Ct(r, 1, !1, n, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(n) {
    st[n] = new Ct(n, 1, !1, n.toLowerCase(), null, !1, !1);
  }), st.xlinkHref = new Ct("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(n) {
    st[n] = new Ct(n, 1, !1, n.toLowerCase(), null, !0, !0);
  });
  function Qe(n, r, l, o) {
    var c = st.hasOwnProperty(r) ? st[r] : null;
    (c !== null ? c.type !== 0 : o || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (Pe(r, l, c, o) && (l = null), o || c === null ? me(r) && (l === null ? n.removeAttribute(r) : n.setAttribute(r, "" + l)) : c.mustUseProperty ? n[c.propertyName] = l === null ? c.type === 3 ? !1 : "" : l : (r = c.attributeName, o = c.attributeNamespace, l === null ? n.removeAttribute(r) : (c = c.type, l = c === 3 || c === 4 && l === !0 ? "" : "" + l, o ? n.setAttributeNS(o, r, l) : n.setAttribute(r, l))));
  }
  var ct = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, _e = Symbol.for("react.element"), it = Symbol.for("react.portal"), He = Symbol.for("react.fragment"), nn = Symbol.for("react.strict_mode"), _n = Symbol.for("react.profiler"), Qt = Symbol.for("react.provider"), bt = Symbol.for("react.context"), Cn = Symbol.for("react.forward_ref"), Ue = Symbol.for("react.suspense"), qe = Symbol.for("react.suspense_list"), Nt = Symbol.for("react.memo"), Rt = Symbol.for("react.lazy"), ye = Symbol.for("react.offscreen"), Z = Symbol.iterator;
  function we(n) {
    return n === null || typeof n != "object" ? null : (n = Z && n[Z] || n["@@iterator"], typeof n == "function" ? n : null);
  }
  var T = Object.assign, $;
  function le(n) {
    if ($ === void 0)
      try {
        throw Error();
      } catch (l) {
        var r = l.stack.trim().match(/\n( *(at )?)/);
        $ = r && r[1] || "";
      }
    return `
` + $ + n;
  }
  var $e = !1;
  function Fe(n, r) {
    if (!n || $e)
      return "";
    $e = !0;
    var l = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (r)
        if (r = function() {
          throw Error();
        }, Object.defineProperty(r.prototype, "props", { set: function() {
          throw Error();
        } }), typeof Reflect == "object" && Reflect.construct) {
          try {
            Reflect.construct(r, []);
          } catch (U) {
            var o = U;
          }
          Reflect.construct(n, [], r);
        } else {
          try {
            r.call();
          } catch (U) {
            o = U;
          }
          n.call(r.prototype);
        }
      else {
        try {
          throw Error();
        } catch (U) {
          o = U;
        }
        n();
      }
    } catch (U) {
      if (U && o && typeof U.stack == "string") {
        for (var c = U.stack.split(`
`), d = o.stack.split(`
`), m = c.length - 1, E = d.length - 1; 1 <= m && 0 <= E && c[m] !== d[E]; )
          E--;
        for (; 1 <= m && 0 <= E; m--, E--)
          if (c[m] !== d[E]) {
            if (m !== 1 || E !== 1)
              do
                if (m--, E--, 0 > E || c[m] !== d[E]) {
                  var w = `
` + c[m].replace(" at new ", " at ");
                  return n.displayName && w.includes("<anonymous>") && (w = w.replace("<anonymous>", n.displayName)), w;
                }
              while (1 <= m && 0 <= E);
            break;
          }
      }
    } finally {
      $e = !1, Error.prepareStackTrace = l;
    }
    return (n = n ? n.displayName || n.name : "") ? le(n) : "";
  }
  function ht(n) {
    switch (n.tag) {
      case 5:
        return le(n.type);
      case 16:
        return le("Lazy");
      case 13:
        return le("Suspense");
      case 19:
        return le("SuspenseList");
      case 0:
      case 2:
      case 15:
        return n = Fe(n.type, !1), n;
      case 11:
        return n = Fe(n.type.render, !1), n;
      case 1:
        return n = Fe(n.type, !0), n;
      default:
        return "";
    }
  }
  function et(n) {
    if (n == null)
      return null;
    if (typeof n == "function")
      return n.displayName || n.name || null;
    if (typeof n == "string")
      return n;
    switch (n) {
      case He:
        return "Fragment";
      case it:
        return "Portal";
      case _n:
        return "Profiler";
      case nn:
        return "StrictMode";
      case Ue:
        return "Suspense";
      case qe:
        return "SuspenseList";
    }
    if (typeof n == "object")
      switch (n.$$typeof) {
        case bt:
          return (n.displayName || "Context") + ".Consumer";
        case Qt:
          return (n._context.displayName || "Context") + ".Provider";
        case Cn:
          var r = n.render;
          return n = n.displayName, n || (n = r.displayName || r.name || "", n = n !== "" ? "ForwardRef(" + n + ")" : "ForwardRef"), n;
        case Nt:
          return r = n.displayName || null, r !== null ? r : et(n.type) || "Memo";
        case Rt:
          r = n._payload, n = n._init;
          try {
            return et(n(r));
          } catch {
          }
      }
    return null;
  }
  function ft(n) {
    var r = n.type;
    switch (n.tag) {
      case 24:
        return "Cache";
      case 9:
        return (r.displayName || "Context") + ".Consumer";
      case 10:
        return (r._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return n = r.render, n = n.displayName || n.name || "", r.displayName || (n !== "" ? "ForwardRef(" + n + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return r;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return et(r);
      case 8:
        return r === nn ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof r == "function")
          return r.displayName || r.name || null;
        if (typeof r == "string")
          return r;
    }
    return null;
  }
  function tt(n) {
    switch (typeof n) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return n;
      case "object":
        return n;
      default:
        return "";
    }
  }
  function zt(n) {
    var r = n.type;
    return (n = n.nodeName) && n.toLowerCase() === "input" && (r === "checkbox" || r === "radio");
  }
  function Vr(n) {
    var r = zt(n) ? "checked" : "value", l = Object.getOwnPropertyDescriptor(n.constructor.prototype, r), o = "" + n[r];
    if (!n.hasOwnProperty(r) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
      var c = l.get, d = l.set;
      return Object.defineProperty(n, r, { configurable: !0, get: function() {
        return c.call(this);
      }, set: function(m) {
        o = "" + m, d.call(this, m);
      } }), Object.defineProperty(n, r, { enumerable: l.enumerable }), { getValue: function() {
        return o;
      }, setValue: function(m) {
        o = "" + m;
      }, stopTracking: function() {
        n._valueTracker = null, delete n[r];
      } };
    }
  }
  function vr(n) {
    n._valueTracker || (n._valueTracker = Vr(n));
  }
  function Br(n) {
    if (!n)
      return !1;
    var r = n._valueTracker;
    if (!r)
      return !0;
    var l = r.getValue(), o = "";
    return n && (o = zt(n) ? n.checked ? "true" : "false" : n.value), n = o, n !== l ? (r.setValue(n), !0) : !1;
  }
  function pn(n) {
    if (n = n || (typeof document < "u" ? document : void 0), typeof n > "u")
      return null;
    try {
      return n.activeElement || n.body;
    } catch {
      return n.body;
    }
  }
  function In(n, r) {
    var l = r.checked;
    return T({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: l != null ? l : n._wrapperState.initialChecked });
  }
  function Fn(n, r) {
    var l = r.defaultValue == null ? "" : r.defaultValue, o = r.checked != null ? r.checked : r.defaultChecked;
    l = tt(r.value != null ? r.value : l), n._wrapperState = { initialChecked: o, initialValue: l, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function Hn(n, r) {
    r = r.checked, r != null && Qe(n, "checked", r, !1);
  }
  function bn(n, r) {
    Hn(n, r);
    var l = tt(r.value), o = r.type;
    if (l != null)
      o === "number" ? (l === 0 && n.value === "" || n.value != l) && (n.value = "" + l) : n.value !== "" + l && (n.value = "" + l);
    else if (o === "submit" || o === "reset") {
      n.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? Yr(n, r.type, l) : r.hasOwnProperty("defaultValue") && Yr(n, r.type, tt(r.defaultValue)), r.checked == null && r.defaultChecked != null && (n.defaultChecked = !!r.defaultChecked);
  }
  function $r(n, r, l) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var o = r.type;
      if (!(o !== "submit" && o !== "reset" || r.value !== void 0 && r.value !== null))
        return;
      r = "" + n._wrapperState.initialValue, l || r === n.value || (n.value = r), n.defaultValue = r;
    }
    l = n.name, l !== "" && (n.name = ""), n.defaultChecked = !!n._wrapperState.initialChecked, l !== "" && (n.name = l);
  }
  function Yr(n, r, l) {
    (r !== "number" || pn(n.ownerDocument) !== n) && (l == null ? n.defaultValue = "" + n._wrapperState.initialValue : n.defaultValue !== "" + l && (n.defaultValue = "" + l));
  }
  var Qn = Array.isArray;
  function hr(n, r, l, o) {
    if (n = n.options, r) {
      r = {};
      for (var c = 0; c < l.length; c++)
        r["$" + l[c]] = !0;
      for (l = 0; l < n.length; l++)
        c = r.hasOwnProperty("$" + n[l].value), n[l].selected !== c && (n[l].selected = c), c && o && (n[l].defaultSelected = !0);
    } else {
      for (l = "" + tt(l), r = null, c = 0; c < n.length; c++) {
        if (n[c].value === l) {
          n[c].selected = !0, o && (n[c].defaultSelected = !0);
          return;
        }
        r !== null || n[c].disabled || (r = n[c]);
      }
      r !== null && (r.selected = !0);
    }
  }
  function Ir(n, r) {
    if (r.dangerouslySetInnerHTML != null)
      throw Error(A(91));
    return T({}, r, { value: void 0, defaultValue: void 0, children: "" + n._wrapperState.initialValue });
  }
  function mr(n, r) {
    var l = r.value;
    if (l == null) {
      if (l = r.children, r = r.defaultValue, l != null) {
        if (r != null)
          throw Error(A(92));
        if (Qn(l)) {
          if (1 < l.length)
            throw Error(A(93));
          l = l[0];
        }
        r = l;
      }
      r == null && (r = ""), l = r;
    }
    n._wrapperState = { initialValue: tt(l) };
  }
  function ca(n, r) {
    var l = tt(r.value), o = tt(r.defaultValue);
    l != null && (l = "" + l, l !== n.value && (n.value = l), r.defaultValue == null && n.defaultValue !== l && (n.defaultValue = l)), o != null && (n.defaultValue = "" + o);
  }
  function tr(n) {
    var r = n.textContent;
    r === n._wrapperState.initialValue && r !== "" && r !== null && (n.value = r);
  }
  function Qr(n) {
    switch (n) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function vn(n, r) {
    return n == null || n === "http://www.w3.org/1999/xhtml" ? Qr(r) : n === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : n;
  }
  var xr, ui = function(n) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, l, o, c) {
      MSApp.execUnsafeLocalFunction(function() {
        return n(r, l, o, c);
      });
    } : n;
  }(function(n, r) {
    if (n.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in n)
      n.innerHTML = r;
    else {
      for (xr = xr || document.createElement("div"), xr.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = xr.firstChild; n.firstChild; )
        n.removeChild(n.firstChild);
      for (; r.firstChild; )
        n.appendChild(r.firstChild);
    }
  });
  function fa(n, r) {
    if (r) {
      var l = n.firstChild;
      if (l && l === n.lastChild && l.nodeType === 3) {
        l.nodeValue = r;
        return;
      }
    }
    n.textContent = r;
  }
  var J = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, xe = ["Webkit", "ms", "Moz", "O"];
  Object.keys(J).forEach(function(n) {
    xe.forEach(function(r) {
      r = r + n.charAt(0).toUpperCase() + n.substring(1), J[r] = J[n];
    });
  });
  function nt(n, r, l) {
    return r == null || typeof r == "boolean" || r === "" ? "" : l || typeof r != "number" || r === 0 || J.hasOwnProperty(n) && J[n] ? ("" + r).trim() : r + "px";
  }
  function Lt(n, r) {
    n = n.style;
    for (var l in r)
      if (r.hasOwnProperty(l)) {
        var o = l.indexOf("--") === 0, c = nt(l, r[l], o);
        l === "float" && (l = "cssFloat"), o ? n.setProperty(l, c) : n[l] = c;
      }
  }
  var Ut = T({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function Dn(n, r) {
    if (r) {
      if (Ut[n] && (r.children != null || r.dangerouslySetInnerHTML != null))
        throw Error(A(137, n));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null)
          throw Error(A(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML))
          throw Error(A(61));
      }
      if (r.style != null && typeof r.style != "object")
        throw Error(A(62));
    }
  }
  function hn(n, r) {
    if (n.indexOf("-") === -1)
      return typeof r.is == "string";
    switch (n) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var yr = null;
  function Vt(n) {
    return n = n.target || n.srcElement || window, n.correspondingUseElement && (n = n.correspondingUseElement), n.nodeType === 3 ? n.parentNode : n;
  }
  var _r = null, At = null, Ft = null;
  function Ga(n) {
    if (n = ss(n)) {
      if (typeof _r != "function")
        throw Error(A(280));
      var r = n.stateNode;
      r && (r = De(r), _r(n.stateNode, n.type, r));
    }
  }
  function _a(n) {
    At ? Ft ? Ft.push(n) : Ft = [n] : At = n;
  }
  function il() {
    if (At) {
      var n = At, r = Ft;
      if (Ft = At = null, Ga(n), r)
        for (n = 0; n < r.length; n++)
          Ga(r[n]);
    }
  }
  function ql(n, r) {
    return n(r);
  }
  function ju() {
  }
  var ki = !1;
  function ll(n, r, l) {
    if (ki)
      return n(r, l);
    ki = !0;
    try {
      return ql(n, r, l);
    } finally {
      ki = !1, (At !== null || Ft !== null) && (ju(), il());
    }
  }
  function da(n, r) {
    var l = n.stateNode;
    if (l === null)
      return null;
    var o = De(l);
    if (o === null)
      return null;
    l = o[r];
    e:
      switch (r) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (o = !o.disabled) || (n = n.type, o = !(n === "button" || n === "input" || n === "select" || n === "textarea")), n = !o;
          break e;
        default:
          n = !1;
      }
    if (n)
      return null;
    if (l && typeof l != "function")
      throw Error(A(231, r, typeof l));
    return l;
  }
  var oi = !1;
  if (It)
    try {
      var pa = {};
      Object.defineProperty(pa, "passive", { get: function() {
        oi = !0;
      } }), window.addEventListener("test", pa, pa), window.removeEventListener("test", pa, pa);
    } catch {
      oi = !1;
    }
  function si(n, r, l, o, c, d, m, E, w) {
    var U = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(l, U);
    } catch (Q) {
      this.onError(Q);
    }
  }
  var br = !1, va = null, ci = !1, R = null, Y = { onError: function(n) {
    br = !0, va = n;
  } };
  function ee(n, r, l, o, c, d, m, E, w) {
    br = !1, va = null, si.apply(Y, arguments);
  }
  function ce(n, r, l, o, c, d, m, E, w) {
    if (ee.apply(this, arguments), br) {
      if (br) {
        var U = va;
        br = !1, va = null;
      } else
        throw Error(A(198));
      ci || (ci = !0, R = U);
    }
  }
  function Ge(n) {
    var r = n, l = n;
    if (n.alternate)
      for (; r.return; )
        r = r.return;
    else {
      n = r;
      do
        r = n, (r.flags & 4098) !== 0 && (l = r.return), n = r.return;
      while (n);
    }
    return r.tag === 3 ? l : null;
  }
  function mt(n) {
    if (n.tag === 13) {
      var r = n.memoizedState;
      if (r === null && (n = n.alternate, n !== null && (r = n.memoizedState)), r !== null)
        return r.dehydrated;
    }
    return null;
  }
  function Xe(n) {
    if (Ge(n) !== n)
      throw Error(A(188));
  }
  function ke(n) {
    var r = n.alternate;
    if (!r) {
      if (r = Ge(n), r === null)
        throw Error(A(188));
      return r !== n ? null : n;
    }
    for (var l = n, o = r; ; ) {
      var c = l.return;
      if (c === null)
        break;
      var d = c.alternate;
      if (d === null) {
        if (o = c.return, o !== null) {
          l = o;
          continue;
        }
        break;
      }
      if (c.child === d.child) {
        for (d = c.child; d; ) {
          if (d === l)
            return Xe(c), n;
          if (d === o)
            return Xe(c), r;
          d = d.sibling;
        }
        throw Error(A(188));
      }
      if (l.return !== o.return)
        l = c, o = d;
      else {
        for (var m = !1, E = c.child; E; ) {
          if (E === l) {
            m = !0, l = c, o = d;
            break;
          }
          if (E === o) {
            m = !0, o = c, l = d;
            break;
          }
          E = E.sibling;
        }
        if (!m) {
          for (E = d.child; E; ) {
            if (E === l) {
              m = !0, l = d, o = c;
              break;
            }
            if (E === o) {
              m = !0, o = d, l = c;
              break;
            }
            E = E.sibling;
          }
          if (!m)
            throw Error(A(189));
        }
      }
      if (l.alternate !== o)
        throw Error(A(190));
    }
    if (l.tag !== 3)
      throw Error(A(188));
    return l.stateNode.current === l ? n : r;
  }
  function Mn(n) {
    return n = ke(n), n !== null ? Jt(n) : null;
  }
  function Jt(n) {
    if (n.tag === 5 || n.tag === 6)
      return n;
    for (n = n.child; n !== null; ) {
      var r = Jt(n);
      if (r !== null)
        return r;
      n = n.sibling;
    }
    return null;
  }
  var en = q.unstable_scheduleCallback, nr = q.unstable_cancelCallback, fi = q.unstable_shouldYield, Pu = q.unstable_requestPaint, Tt = q.unstable_now, jf = q.unstable_getCurrentPriorityLevel, qa = q.unstable_ImmediatePriority, lt = q.unstable_UserBlockingPriority, di = q.unstable_NormalPriority, ul = q.unstable_LowPriority, Vu = q.unstable_IdlePriority, ol = null, Wr = null;
  function Qo(n) {
    if (Wr && typeof Wr.onCommitFiberRoot == "function")
      try {
        Wr.onCommitFiberRoot(ol, n, void 0, (n.current.flags & 128) === 128);
      } catch {
      }
  }
  var Dr = Math.clz32 ? Math.clz32 : Ks, Wo = Math.log, Go = Math.LN2;
  function Ks(n) {
    return n >>>= 0, n === 0 ? 32 : 31 - (Wo(n) / Go | 0) | 0;
  }
  var Bu = 64, sl = 4194304;
  function Xa(n) {
    switch (n & -n) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return n & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return n & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return n;
    }
  }
  function kr(n, r) {
    var l = n.pendingLanes;
    if (l === 0)
      return 0;
    var o = 0, c = n.suspendedLanes, d = n.pingedLanes, m = l & 268435455;
    if (m !== 0) {
      var E = m & ~c;
      E !== 0 ? o = Xa(E) : (d &= m, d !== 0 && (o = Xa(d)));
    } else
      m = l & ~c, m !== 0 ? o = Xa(m) : d !== 0 && (o = Xa(d));
    if (o === 0)
      return 0;
    if (r !== 0 && r !== o && (r & c) === 0 && (c = o & -o, d = r & -r, c >= d || c === 16 && (d & 4194240) !== 0))
      return r;
    if ((o & 4) !== 0 && (o |= l & 16), r = n.entangledLanes, r !== 0)
      for (n = n.entanglements, r &= o; 0 < r; )
        l = 31 - Dr(r), c = 1 << l, o |= n[l], r &= ~c;
    return o;
  }
  function cl(n, r) {
    switch (n) {
      case 1:
      case 2:
      case 4:
        return r + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return r + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function fl(n, r) {
    for (var l = n.suspendedLanes, o = n.pingedLanes, c = n.expirationTimes, d = n.pendingLanes; 0 < d; ) {
      var m = 31 - Dr(d), E = 1 << m, w = c[m];
      w === -1 ? ((E & l) === 0 || (E & o) !== 0) && (c[m] = cl(E, r)) : w <= r && (n.expiredLanes |= E), d &= ~E;
    }
  }
  function dl(n) {
    return n = n.pendingLanes & -1073741825, n !== 0 ? n : n & 1073741824 ? 1073741824 : 0;
  }
  function $u() {
    var n = Bu;
    return Bu <<= 1, (Bu & 4194240) === 0 && (Bu = 64), n;
  }
  function Yu(n) {
    for (var r = [], l = 0; 31 > l; l++)
      r.push(n);
    return r;
  }
  function Oi(n, r, l) {
    n.pendingLanes |= r, r !== 536870912 && (n.suspendedLanes = 0, n.pingedLanes = 0), n = n.eventTimes, r = 31 - Dr(r), n[r] = l;
  }
  function Pf(n, r) {
    var l = n.pendingLanes & ~r;
    n.pendingLanes = r, n.suspendedLanes = 0, n.pingedLanes = 0, n.expiredLanes &= r, n.mutableReadLanes &= r, n.entangledLanes &= r, r = n.entanglements;
    var o = n.eventTimes;
    for (n = n.expirationTimes; 0 < l; ) {
      var c = 31 - Dr(l), d = 1 << c;
      r[c] = 0, o[c] = -1, n[c] = -1, l &= ~d;
    }
  }
  function pi(n, r) {
    var l = n.entangledLanes |= r;
    for (n = n.entanglements; l; ) {
      var o = 31 - Dr(l), c = 1 << o;
      c & r | n[o] & r && (n[o] |= r), l &= ~c;
    }
  }
  var Dt = 0;
  function Iu(n) {
    return n &= -n, 1 < n ? 4 < n ? (n & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Xl, Qu, wt, Wu, Gu, Ye = !1, Kl = [], mn = null, Gr = null, Or = null, pl = /* @__PURE__ */ new Map(), Rn = /* @__PURE__ */ new Map(), Ht = [], Zs = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function qr(n, r) {
    switch (n) {
      case "focusin":
      case "focusout":
        mn = null;
        break;
      case "dragenter":
      case "dragleave":
        Gr = null;
        break;
      case "mouseover":
      case "mouseout":
        Or = null;
        break;
      case "pointerover":
      case "pointerout":
        pl.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Rn.delete(r.pointerId);
    }
  }
  function Wn(n, r, l, o, c, d) {
    return n === null || n.nativeEvent !== d ? (n = { blockedOn: r, domEventName: l, eventSystemFlags: o, nativeEvent: d, targetContainers: [c] }, r !== null && (r = ss(r), r !== null && Qu(r)), n) : (n.eventSystemFlags |= o, r = n.targetContainers, c !== null && r.indexOf(c) === -1 && r.push(c), n);
  }
  function vi(n, r, l, o, c) {
    switch (r) {
      case "focusin":
        return mn = Wn(mn, n, r, l, o, c), !0;
      case "dragenter":
        return Gr = Wn(Gr, n, r, l, o, c), !0;
      case "mouseover":
        return Or = Wn(Or, n, r, l, o, c), !0;
      case "pointerover":
        var d = c.pointerId;
        return pl.set(d, Wn(pl.get(d) || null, n, r, l, o, c)), !0;
      case "gotpointercapture":
        return d = c.pointerId, Rn.set(d, Wn(Rn.get(d) || null, n, r, l, o, c)), !0;
    }
    return !1;
  }
  function Js(n) {
    var r = Oa(n.target);
    if (r !== null) {
      var l = Ge(r);
      if (l !== null) {
        if (r = l.tag, r === 13) {
          if (r = mt(l), r !== null) {
            n.blockedOn = r, Gu(n.priority, function() {
              wt(l);
            });
            return;
          }
        } else if (r === 3 && l.stateNode.current.memoizedState.isDehydrated) {
          n.blockedOn = l.tag === 3 ? l.stateNode.containerInfo : null;
          return;
        }
      }
    }
    n.blockedOn = null;
  }
  function Li(n) {
    if (n.blockedOn !== null)
      return !1;
    for (var r = n.targetContainers; 0 < r.length; ) {
      var l = Xu(n.domEventName, n.eventSystemFlags, r[0], n.nativeEvent);
      if (l === null) {
        l = n.nativeEvent;
        var o = new l.constructor(l.type, l);
        yr = o, l.target.dispatchEvent(o), yr = null;
      } else
        return r = ss(l), r !== null && Qu(r), n.blockedOn = l, !1;
      r.shift();
    }
    return !0;
  }
  function vl(n, r, l) {
    Li(n) && l.delete(r);
  }
  function ec() {
    Ye = !1, mn !== null && Li(mn) && (mn = null), Gr !== null && Li(Gr) && (Gr = null), Or !== null && Li(Or) && (Or = null), pl.forEach(vl), Rn.forEach(vl);
  }
  function ba(n, r) {
    n.blockedOn === r && (n.blockedOn = null, Ye || (Ye = !0, q.unstable_scheduleCallback(q.unstable_NormalPriority, ec)));
  }
  function hl(n) {
    function r(c) {
      return ba(c, n);
    }
    if (0 < Kl.length) {
      ba(Kl[0], n);
      for (var l = 1; l < Kl.length; l++) {
        var o = Kl[l];
        o.blockedOn === n && (o.blockedOn = null);
      }
    }
    for (mn !== null && ba(mn, n), Gr !== null && ba(Gr, n), Or !== null && ba(Or, n), pl.forEach(r), Rn.forEach(r), l = 0; l < Ht.length; l++)
      o = Ht[l], o.blockedOn === n && (o.blockedOn = null);
    for (; 0 < Ht.length && (l = Ht[0], l.blockedOn === null); )
      Js(l), l.blockedOn === null && Ht.shift();
  }
  var ml = ct.ReactCurrentBatchConfig, Da = !0;
  function qu(n, r, l, o) {
    var c = Dt, d = ml.transition;
    ml.transition = null;
    try {
      Dt = 1, gl(n, r, l, o);
    } finally {
      Dt = c, ml.transition = d;
    }
  }
  function yl(n, r, l, o) {
    var c = Dt, d = ml.transition;
    ml.transition = null;
    try {
      Dt = 4, gl(n, r, l, o);
    } finally {
      Dt = c, ml.transition = d;
    }
  }
  function gl(n, r, l, o) {
    if (Da) {
      var c = Xu(n, r, l, o);
      if (c === null)
        sc(n, r, o, Zl, l), qr(n, o);
      else if (vi(c, n, r, l, o))
        o.stopPropagation();
      else if (qr(n, o), r & 4 && -1 < Zs.indexOf(n)) {
        for (; c !== null; ) {
          var d = ss(c);
          if (d !== null && Xl(d), d = Xu(n, r, l, o), d === null && sc(n, r, o, Zl, l), d === c)
            break;
          c = d;
        }
        c !== null && o.stopPropagation();
      } else
        sc(n, r, o, null, l);
    }
  }
  var Zl = null;
  function Xu(n, r, l, o) {
    if (Zl = null, n = Vt(o), n = Oa(n), n !== null)
      if (r = Ge(n), r === null)
        n = null;
      else if (l = r.tag, l === 13) {
        if (n = mt(r), n !== null)
          return n;
        n = null;
      } else if (l === 3) {
        if (r.stateNode.current.memoizedState.isDehydrated)
          return r.tag === 3 ? r.stateNode.containerInfo : null;
        n = null;
      } else
        r !== n && (n = null);
    return Zl = n, null;
  }
  function qo(n) {
    switch (n) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (jf()) {
          case qa:
            return 1;
          case lt:
            return 4;
          case di:
          case ul:
            return 16;
          case Vu:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Ka = null, h = null, C = null;
  function N() {
    if (C)
      return C;
    var n, r = h, l = r.length, o, c = "value" in Ka ? Ka.value : Ka.textContent, d = c.length;
    for (n = 0; n < l && r[n] === c[n]; n++)
      ;
    var m = l - n;
    for (o = 1; o <= m && r[l - o] === c[d - o]; o++)
      ;
    return C = c.slice(n, 1 < o ? 1 - o : void 0);
  }
  function F(n) {
    var r = n.keyCode;
    return "charCode" in n ? (n = n.charCode, n === 0 && r === 13 && (n = 13)) : n = r, n === 10 && (n = 13), 32 <= n || n === 13 ? n : 0;
  }
  function X() {
    return !0;
  }
  function Ne() {
    return !1;
  }
  function ae(n) {
    function r(l, o, c, d, m) {
      this._reactName = l, this._targetInst = c, this.type = o, this.nativeEvent = d, this.target = m, this.currentTarget = null;
      for (var E in n)
        n.hasOwnProperty(E) && (l = n[E], this[E] = l ? l(d) : d[E]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? X : Ne, this.isPropagationStopped = Ne, this;
    }
    return T(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var l = this.nativeEvent;
      l && (l.preventDefault ? l.preventDefault() : typeof l.returnValue != "unknown" && (l.returnValue = !1), this.isDefaultPrevented = X);
    }, stopPropagation: function() {
      var l = this.nativeEvent;
      l && (l.stopPropagation ? l.stopPropagation() : typeof l.cancelBubble != "unknown" && (l.cancelBubble = !0), this.isPropagationStopped = X);
    }, persist: function() {
    }, isPersistent: X }), r;
  }
  var Le = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(n) {
    return n.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, ut = ae(Le), xt = T({}, Le, { view: 0, detail: 0 }), qt = ae(xt), Bt, Xt, tn, vt = T({}, xt, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: If, button: 0, buttons: 0, relatedTarget: function(n) {
    return n.relatedTarget === void 0 ? n.fromElement === n.srcElement ? n.toElement : n.fromElement : n.relatedTarget;
  }, movementX: function(n) {
    return "movementX" in n ? n.movementX : (n !== tn && (tn && n.type === "mousemove" ? (Bt = n.screenX - tn.screenX, Xt = n.screenY - tn.screenY) : Xt = Bt = 0, tn = n), Bt);
  }, movementY: function(n) {
    return "movementY" in n ? n.movementY : Xt;
  } }), Mi = ae(vt), Ku = T({}, vt, { dataTransfer: 0 }), Xo = ae(Ku), Vf = T({}, xt, { relatedTarget: 0 }), Za = ae(Vf), Ko = T({}, Le, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Zo = ae(Ko), Bf = T({}, Le, { clipboardData: function(n) {
    return "clipboardData" in n ? n.clipboardData : window.clipboardData;
  } }), jm = ae(Bf), Pm = T({}, Le, { data: 0 }), $f = ae(Pm), Yf = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, Zp = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Jp = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function ev(n) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(n) : (n = Jp[n]) ? !!r[n] : !1;
  }
  function If() {
    return ev;
  }
  var Ni = T({}, xt, { key: function(n) {
    if (n.key) {
      var r = Yf[n.key] || n.key;
      if (r !== "Unidentified")
        return r;
    }
    return n.type === "keypress" ? (n = F(n), n === 13 ? "Enter" : String.fromCharCode(n)) : n.type === "keydown" || n.type === "keyup" ? Zp[n.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: If, charCode: function(n) {
    return n.type === "keypress" ? F(n) : 0;
  }, keyCode: function(n) {
    return n.type === "keydown" || n.type === "keyup" ? n.keyCode : 0;
  }, which: function(n) {
    return n.type === "keypress" ? F(n) : n.type === "keydown" || n.type === "keyup" ? n.keyCode : 0;
  } }), Vm = ae(Ni), Qf = T({}, vt, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), tc = ae(Qf), Wf = T({}, xt, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: If }), Bm = ae(Wf), nc = T({}, Le, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), tv = ae(nc), Xr = T({}, vt, {
    deltaX: function(n) {
      return "deltaX" in n ? n.deltaX : "wheelDeltaX" in n ? -n.wheelDeltaX : 0;
    },
    deltaY: function(n) {
      return "deltaY" in n ? n.deltaY : "wheelDeltaY" in n ? -n.wheelDeltaY : "wheelDelta" in n ? -n.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), zi = ae(Xr), Nn = [9, 13, 27, 32], Ja = It && "CompositionEvent" in window, Jl = null;
  It && "documentMode" in document && (Jl = document.documentMode);
  var rc = It && "TextEvent" in window && !Jl, nv = It && (!Ja || Jl && 8 < Jl && 11 >= Jl), Zu = String.fromCharCode(32), rv = !1;
  function av(n, r) {
    switch (n) {
      case "keyup":
        return Nn.indexOf(r.keyCode) !== -1;
      case "keydown":
        return r.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function ac(n) {
    return n = n.detail, typeof n == "object" && "data" in n ? n.data : null;
  }
  var Ju = !1;
  function $m(n, r) {
    switch (n) {
      case "compositionend":
        return ac(r);
      case "keypress":
        return r.which !== 32 ? null : (rv = !0, Zu);
      case "textInput":
        return n = r.data, n === Zu && rv ? null : n;
      default:
        return null;
    }
  }
  function Ym(n, r) {
    if (Ju)
      return n === "compositionend" || !Ja && av(n, r) ? (n = N(), C = h = Ka = null, Ju = !1, n) : null;
    switch (n) {
      case "paste":
        return null;
      case "keypress":
        if (!(r.ctrlKey || r.altKey || r.metaKey) || r.ctrlKey && r.altKey) {
          if (r.char && 1 < r.char.length)
            return r.char;
          if (r.which)
            return String.fromCharCode(r.which);
        }
        return null;
      case "compositionend":
        return nv && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var iv = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function lv(n) {
    var r = n && n.nodeName && n.nodeName.toLowerCase();
    return r === "input" ? !!iv[n.type] : r === "textarea";
  }
  function uv(n, r, l, o) {
    _a(o), r = ls(r, "onChange"), 0 < r.length && (l = new ut("onChange", "change", null, l, o), n.push({ event: l, listeners: r }));
  }
  var Jo = null, eo = null;
  function to(n) {
    oc(n, 0);
  }
  function no(n) {
    var r = ao(n);
    if (Br(r))
      return n;
  }
  function ov(n, r) {
    if (n === "change")
      return r;
  }
  var Gf = !1;
  if (It) {
    var qf;
    if (It) {
      var Xf = "oninput" in document;
      if (!Xf) {
        var sv = document.createElement("div");
        sv.setAttribute("oninput", "return;"), Xf = typeof sv.oninput == "function";
      }
      qf = Xf;
    } else
      qf = !1;
    Gf = qf && (!document.documentMode || 9 < document.documentMode);
  }
  function cv() {
    Jo && (Jo.detachEvent("onpropertychange", fv), eo = Jo = null);
  }
  function fv(n) {
    if (n.propertyName === "value" && no(eo)) {
      var r = [];
      uv(r, eo, n, Vt(n)), ll(to, r);
    }
  }
  function Im(n, r, l) {
    n === "focusin" ? (cv(), Jo = r, eo = l, Jo.attachEvent("onpropertychange", fv)) : n === "focusout" && cv();
  }
  function Qm(n) {
    if (n === "selectionchange" || n === "keyup" || n === "keydown")
      return no(eo);
  }
  function Wm(n, r) {
    if (n === "click")
      return no(r);
  }
  function dv(n, r) {
    if (n === "input" || n === "change")
      return no(r);
  }
  function Gm(n, r) {
    return n === r && (n !== 0 || 1 / n === 1 / r) || n !== n && r !== r;
  }
  var ka = typeof Object.is == "function" ? Object.is : Gm;
  function es(n, r) {
    if (ka(n, r))
      return !0;
    if (typeof n != "object" || n === null || typeof r != "object" || r === null)
      return !1;
    var l = Object.keys(n), o = Object.keys(r);
    if (l.length !== o.length)
      return !1;
    for (o = 0; o < l.length; o++) {
      var c = l[o];
      if (!he.call(r, c) || !ka(n[c], r[c]))
        return !1;
    }
    return !0;
  }
  function pv(n) {
    for (; n && n.firstChild; )
      n = n.firstChild;
    return n;
  }
  function vv(n, r) {
    var l = pv(n);
    n = 0;
    for (var o; l; ) {
      if (l.nodeType === 3) {
        if (o = n + l.textContent.length, n <= r && o >= r)
          return { node: l, offset: r - n };
        n = o;
      }
      e: {
        for (; l; ) {
          if (l.nextSibling) {
            l = l.nextSibling;
            break e;
          }
          l = l.parentNode;
        }
        l = void 0;
      }
      l = pv(l);
    }
  }
  function hv(n, r) {
    return n && r ? n === r ? !0 : n && n.nodeType === 3 ? !1 : r && r.nodeType === 3 ? hv(n, r.parentNode) : "contains" in n ? n.contains(r) : n.compareDocumentPosition ? !!(n.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function ic() {
    for (var n = window, r = pn(); r instanceof n.HTMLIFrameElement; ) {
      try {
        var l = typeof r.contentWindow.location.href == "string";
      } catch {
        l = !1;
      }
      if (l)
        n = r.contentWindow;
      else
        break;
      r = pn(n.document);
    }
    return r;
  }
  function Ui(n) {
    var r = n && n.nodeName && n.nodeName.toLowerCase();
    return r && (r === "input" && (n.type === "text" || n.type === "search" || n.type === "tel" || n.type === "url" || n.type === "password") || r === "textarea" || n.contentEditable === "true");
  }
  function lc(n) {
    var r = ic(), l = n.focusedElem, o = n.selectionRange;
    if (r !== l && l && l.ownerDocument && hv(l.ownerDocument.documentElement, l)) {
      if (o !== null && Ui(l)) {
        if (r = o.start, n = o.end, n === void 0 && (n = r), "selectionStart" in l)
          l.selectionStart = r, l.selectionEnd = Math.min(n, l.value.length);
        else if (n = (r = l.ownerDocument || document) && r.defaultView || window, n.getSelection) {
          n = n.getSelection();
          var c = l.textContent.length, d = Math.min(o.start, c);
          o = o.end === void 0 ? d : Math.min(o.end, c), !n.extend && d > o && (c = o, o = d, d = c), c = vv(l, d);
          var m = vv(
            l,
            o
          );
          c && m && (n.rangeCount !== 1 || n.anchorNode !== c.node || n.anchorOffset !== c.offset || n.focusNode !== m.node || n.focusOffset !== m.offset) && (r = r.createRange(), r.setStart(c.node, c.offset), n.removeAllRanges(), d > o ? (n.addRange(r), n.extend(m.node, m.offset)) : (r.setEnd(m.node, m.offset), n.addRange(r)));
        }
      }
      for (r = [], n = l; n = n.parentNode; )
        n.nodeType === 1 && r.push({ element: n, left: n.scrollLeft, top: n.scrollTop });
      for (typeof l.focus == "function" && l.focus(), l = 0; l < r.length; l++)
        n = r[l], n.element.scrollLeft = n.left, n.element.scrollTop = n.top;
    }
  }
  var mv = It && "documentMode" in document && 11 >= document.documentMode, ei = null, Kf = null, ts = null, Zf = !1;
  function yv(n, r, l) {
    var o = l.window === l ? l.document : l.nodeType === 9 ? l : l.ownerDocument;
    Zf || ei == null || ei !== pn(o) || (o = ei, "selectionStart" in o && Ui(o) ? o = { start: o.selectionStart, end: o.selectionEnd } : (o = (o.ownerDocument && o.ownerDocument.defaultView || window).getSelection(), o = { anchorNode: o.anchorNode, anchorOffset: o.anchorOffset, focusNode: o.focusNode, focusOffset: o.focusOffset }), ts && es(ts, o) || (ts = o, o = ls(Kf, "onSelect"), 0 < o.length && (r = new ut("onSelect", "select", null, r, l), n.push({ event: r, listeners: o }), r.target = ei)));
  }
  function uc(n, r) {
    var l = {};
    return l[n.toLowerCase()] = r.toLowerCase(), l["Webkit" + n] = "webkit" + r, l["Moz" + n] = "moz" + r, l;
  }
  var eu = { animationend: uc("Animation", "AnimationEnd"), animationiteration: uc("Animation", "AnimationIteration"), animationstart: uc("Animation", "AnimationStart"), transitionend: uc("Transition", "TransitionEnd") }, Jf = {}, ed = {};
  It && (ed = document.createElement("div").style, "AnimationEvent" in window || (delete eu.animationend.animation, delete eu.animationiteration.animation, delete eu.animationstart.animation), "TransitionEvent" in window || delete eu.transitionend.transition);
  function Gn(n) {
    if (Jf[n])
      return Jf[n];
    if (!eu[n])
      return n;
    var r = eu[n], l;
    for (l in r)
      if (r.hasOwnProperty(l) && l in ed)
        return Jf[n] = r[l];
    return n;
  }
  var td = Gn("animationend"), gv = Gn("animationiteration"), Sv = Gn("animationstart"), Ev = Gn("transitionend"), Cv = /* @__PURE__ */ new Map(), Rv = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Ai(n, r) {
    Cv.set(n, r), Je(r, [n]);
  }
  for (var ns = 0; ns < Rv.length; ns++) {
    var tu = Rv[ns], qm = tu.toLowerCase(), rs = tu[0].toUpperCase() + tu.slice(1);
    Ai(qm, "on" + rs);
  }
  Ai(td, "onAnimationEnd"), Ai(gv, "onAnimationIteration"), Ai(Sv, "onAnimationStart"), Ai("dblclick", "onDoubleClick"), Ai("focusin", "onFocus"), Ai("focusout", "onBlur"), Ai(Ev, "onTransitionEnd"), S("onMouseEnter", ["mouseout", "mouseover"]), S("onMouseLeave", ["mouseout", "mouseover"]), S("onPointerEnter", ["pointerout", "pointerover"]), S("onPointerLeave", ["pointerout", "pointerover"]), Je("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Je("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Je("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), Je("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Je("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Je("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var as = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Xm = new Set("cancel close invalid load scroll toggle".split(" ").concat(as));
  function Tv(n, r, l) {
    var o = n.type || "unknown-event";
    n.currentTarget = l, ce(o, r, void 0, n), n.currentTarget = null;
  }
  function oc(n, r) {
    r = (r & 4) !== 0;
    for (var l = 0; l < n.length; l++) {
      var o = n[l], c = o.event;
      o = o.listeners;
      e: {
        var d = void 0;
        if (r)
          for (var m = o.length - 1; 0 <= m; m--) {
            var E = o[m], w = E.instance, U = E.currentTarget;
            if (E = E.listener, w !== d && c.isPropagationStopped())
              break e;
            Tv(c, E, U), d = w;
          }
        else
          for (m = 0; m < o.length; m++) {
            if (E = o[m], w = E.instance, U = E.currentTarget, E = E.listener, w !== d && c.isPropagationStopped())
              break e;
            Tv(c, E, U), d = w;
          }
      }
    }
    if (ci)
      throw n = R, ci = !1, R = null, n;
  }
  function Kt(n, r) {
    var l = r[od];
    l === void 0 && (l = r[od] = /* @__PURE__ */ new Set());
    var o = n + "__bubble";
    l.has(o) || (wv(r, n, 2, !1), l.add(o));
  }
  function Sl(n, r, l) {
    var o = 0;
    r && (o |= 4), wv(l, n, o, r);
  }
  var Fi = "_reactListening" + Math.random().toString(36).slice(2);
  function ro(n) {
    if (!n[Fi]) {
      n[Fi] = !0, $t.forEach(function(l) {
        l !== "selectionchange" && (Xm.has(l) || Sl(l, !1, n), Sl(l, !0, n));
      });
      var r = n.nodeType === 9 ? n : n.ownerDocument;
      r === null || r[Fi] || (r[Fi] = !0, Sl("selectionchange", !1, r));
    }
  }
  function wv(n, r, l, o) {
    switch (qo(r)) {
      case 1:
        var c = qu;
        break;
      case 4:
        c = yl;
        break;
      default:
        c = gl;
    }
    l = c.bind(null, r, l, n), c = void 0, !oi || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (c = !0), o ? c !== void 0 ? n.addEventListener(r, l, { capture: !0, passive: c }) : n.addEventListener(r, l, !0) : c !== void 0 ? n.addEventListener(r, l, { passive: c }) : n.addEventListener(r, l, !1);
  }
  function sc(n, r, l, o, c) {
    var d = o;
    if ((r & 1) === 0 && (r & 2) === 0 && o !== null)
      e:
        for (; ; ) {
          if (o === null)
            return;
          var m = o.tag;
          if (m === 3 || m === 4) {
            var E = o.stateNode.containerInfo;
            if (E === c || E.nodeType === 8 && E.parentNode === c)
              break;
            if (m === 4)
              for (m = o.return; m !== null; ) {
                var w = m.tag;
                if ((w === 3 || w === 4) && (w = m.stateNode.containerInfo, w === c || w.nodeType === 8 && w.parentNode === c))
                  return;
                m = m.return;
              }
            for (; E !== null; ) {
              if (m = Oa(E), m === null)
                return;
              if (w = m.tag, w === 5 || w === 6) {
                o = d = m;
                continue e;
              }
              E = E.parentNode;
            }
          }
          o = o.return;
        }
    ll(function() {
      var U = d, Q = Vt(l), W = [];
      e: {
        var I = Cv.get(n);
        if (I !== void 0) {
          var oe = ut, ge = n;
          switch (n) {
            case "keypress":
              if (F(l) === 0)
                break e;
            case "keydown":
            case "keyup":
              oe = Vm;
              break;
            case "focusin":
              ge = "focus", oe = Za;
              break;
            case "focusout":
              ge = "blur", oe = Za;
              break;
            case "beforeblur":
            case "afterblur":
              oe = Za;
              break;
            case "click":
              if (l.button === 2)
                break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              oe = Mi;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              oe = Xo;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              oe = Bm;
              break;
            case td:
            case gv:
            case Sv:
              oe = Zo;
              break;
            case Ev:
              oe = tv;
              break;
            case "scroll":
              oe = qt;
              break;
            case "wheel":
              oe = zi;
              break;
            case "copy":
            case "cut":
            case "paste":
              oe = jm;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              oe = tc;
          }
          var Ce = (r & 4) !== 0, On = !Ce && n === "scroll", D = Ce ? I !== null ? I + "Capture" : null : I;
          Ce = [];
          for (var _ = U, L; _ !== null; ) {
            L = _;
            var K = L.stateNode;
            if (L.tag === 5 && K !== null && (L = K, D !== null && (K = da(_, D), K != null && Ce.push(is(_, K, L)))), On)
              break;
            _ = _.return;
          }
          0 < Ce.length && (I = new oe(I, ge, null, l, Q), W.push({ event: I, listeners: Ce }));
        }
      }
      if ((r & 7) === 0) {
        e: {
          if (I = n === "mouseover" || n === "pointerover", oe = n === "mouseout" || n === "pointerout", I && l !== yr && (ge = l.relatedTarget || l.fromElement) && (Oa(ge) || ge[Hi]))
            break e;
          if ((oe || I) && (I = Q.window === Q ? Q : (I = Q.ownerDocument) ? I.defaultView || I.parentWindow : window, oe ? (ge = l.relatedTarget || l.toElement, oe = U, ge = ge ? Oa(ge) : null, ge !== null && (On = Ge(ge), ge !== On || ge.tag !== 5 && ge.tag !== 6) && (ge = null)) : (oe = null, ge = U), oe !== ge)) {
            if (Ce = Mi, K = "onMouseLeave", D = "onMouseEnter", _ = "mouse", (n === "pointerout" || n === "pointerover") && (Ce = tc, K = "onPointerLeave", D = "onPointerEnter", _ = "pointer"), On = oe == null ? I : ao(oe), L = ge == null ? I : ao(ge), I = new Ce(K, _ + "leave", oe, l, Q), I.target = On, I.relatedTarget = L, K = null, Oa(Q) === U && (Ce = new Ce(D, _ + "enter", ge, l, Q), Ce.target = L, Ce.relatedTarget = On, K = Ce), On = K, oe && ge)
              t: {
                for (Ce = oe, D = ge, _ = 0, L = Ce; L; L = nu(L))
                  _++;
                for (L = 0, K = D; K; K = nu(K))
                  L++;
                for (; 0 < _ - L; )
                  Ce = nu(Ce), _--;
                for (; 0 < L - _; )
                  D = nu(D), L--;
                for (; _--; ) {
                  if (Ce === D || D !== null && Ce === D.alternate)
                    break t;
                  Ce = nu(Ce), D = nu(D);
                }
                Ce = null;
              }
            else
              Ce = null;
            oe !== null && nd(W, I, oe, Ce, !1), ge !== null && On !== null && nd(W, On, ge, Ce, !0);
          }
        }
        e: {
          if (I = U ? ao(U) : window, oe = I.nodeName && I.nodeName.toLowerCase(), oe === "select" || oe === "input" && I.type === "file")
            var Re = ov;
          else if (lv(I))
            if (Gf)
              Re = dv;
            else {
              Re = Qm;
              var Se = Im;
            }
          else
            (oe = I.nodeName) && oe.toLowerCase() === "input" && (I.type === "checkbox" || I.type === "radio") && (Re = Wm);
          if (Re && (Re = Re(n, U))) {
            uv(W, Re, l, Q);
            break e;
          }
          Se && Se(n, I, U), n === "focusout" && (Se = I._wrapperState) && Se.controlled && I.type === "number" && Yr(I, "number", I.value);
        }
        switch (Se = U ? ao(U) : window, n) {
          case "focusin":
            (lv(Se) || Se.contentEditable === "true") && (ei = Se, Kf = U, ts = null);
            break;
          case "focusout":
            ts = Kf = ei = null;
            break;
          case "mousedown":
            Zf = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Zf = !1, yv(W, l, Q);
            break;
          case "selectionchange":
            if (mv)
              break;
          case "keydown":
          case "keyup":
            yv(W, l, Q);
        }
        var be;
        if (Ja)
          e: {
            switch (n) {
              case "compositionstart":
                var Be = "onCompositionStart";
                break e;
              case "compositionend":
                Be = "onCompositionEnd";
                break e;
              case "compositionupdate":
                Be = "onCompositionUpdate";
                break e;
            }
            Be = void 0;
          }
        else
          Ju ? av(n, l) && (Be = "onCompositionEnd") : n === "keydown" && l.keyCode === 229 && (Be = "onCompositionStart");
        Be && (nv && l.locale !== "ko" && (Ju || Be !== "onCompositionStart" ? Be === "onCompositionEnd" && Ju && (be = N()) : (Ka = Q, h = "value" in Ka ? Ka.value : Ka.textContent, Ju = !0)), Se = ls(U, Be), 0 < Se.length && (Be = new $f(Be, n, null, l, Q), W.push({ event: Be, listeners: Se }), be ? Be.data = be : (be = ac(l), be !== null && (Be.data = be)))), (be = rc ? $m(n, l) : Ym(n, l)) && (U = ls(U, "onBeforeInput"), 0 < U.length && (Q = new $f("onBeforeInput", "beforeinput", null, l, Q), W.push({ event: Q, listeners: U }), Q.data = be));
      }
      oc(W, r);
    });
  }
  function is(n, r, l) {
    return { instance: n, listener: r, currentTarget: l };
  }
  function ls(n, r) {
    for (var l = r + "Capture", o = []; n !== null; ) {
      var c = n, d = c.stateNode;
      c.tag === 5 && d !== null && (c = d, d = da(n, l), d != null && o.unshift(is(n, d, c)), d = da(n, r), d != null && o.push(is(n, d, c))), n = n.return;
    }
    return o;
  }
  function nu(n) {
    if (n === null)
      return null;
    do
      n = n.return;
    while (n && n.tag !== 5);
    return n || null;
  }
  function nd(n, r, l, o, c) {
    for (var d = r._reactName, m = []; l !== null && l !== o; ) {
      var E = l, w = E.alternate, U = E.stateNode;
      if (w !== null && w === o)
        break;
      E.tag === 5 && U !== null && (E = U, c ? (w = da(l, d), w != null && m.unshift(is(l, w, E))) : c || (w = da(l, d), w != null && m.push(is(l, w, E)))), l = l.return;
    }
    m.length !== 0 && n.push({ event: r, listeners: m });
  }
  var rd = /\r\n?/g, Km = /\u0000|\uFFFD/g;
  function ad(n) {
    return (typeof n == "string" ? n : "" + n).replace(rd, `
`).replace(Km, "");
  }
  function cc(n, r, l) {
    if (r = ad(r), ad(n) !== r && l)
      throw Error(A(425));
  }
  function fc() {
  }
  var id = null, ru = null;
  function us(n, r) {
    return n === "textarea" || n === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var au = typeof setTimeout == "function" ? setTimeout : void 0, xv = typeof clearTimeout == "function" ? clearTimeout : void 0, ld = typeof Promise == "function" ? Promise : void 0, ud = typeof queueMicrotask == "function" ? queueMicrotask : typeof ld < "u" ? function(n) {
    return ld.resolve(null).then(n).catch(Zm);
  } : au;
  function Zm(n) {
    setTimeout(function() {
      throw n;
    });
  }
  function El(n, r) {
    var l = r, o = 0;
    do {
      var c = l.nextSibling;
      if (n.removeChild(l), c && c.nodeType === 8)
        if (l = c.data, l === "/$") {
          if (o === 0) {
            n.removeChild(c), hl(r);
            return;
          }
          o--;
        } else
          l !== "$" && l !== "$?" && l !== "$!" || o++;
      l = c;
    } while (l);
    hl(r);
  }
  function ti(n) {
    for (; n != null; n = n.nextSibling) {
      var r = n.nodeType;
      if (r === 1 || r === 3)
        break;
      if (r === 8) {
        if (r = n.data, r === "$" || r === "$!" || r === "$?")
          break;
        if (r === "/$")
          return null;
      }
    }
    return n;
  }
  function os(n) {
    n = n.previousSibling;
    for (var r = 0; n; ) {
      if (n.nodeType === 8) {
        var l = n.data;
        if (l === "$" || l === "$!" || l === "$?") {
          if (r === 0)
            return n;
          r--;
        } else
          l === "/$" && r++;
      }
      n = n.previousSibling;
    }
    return null;
  }
  var Cl = Math.random().toString(36).slice(2), hi = "__reactFiber$" + Cl, iu = "__reactProps$" + Cl, Hi = "__reactContainer$" + Cl, od = "__reactEvents$" + Cl, Jm = "__reactListeners$" + Cl, sd = "__reactHandles$" + Cl;
  function Oa(n) {
    var r = n[hi];
    if (r)
      return r;
    for (var l = n.parentNode; l; ) {
      if (r = l[Hi] || l[hi]) {
        if (l = r.alternate, r.child !== null || l !== null && l.child !== null)
          for (n = os(n); n !== null; ) {
            if (l = n[hi])
              return l;
            n = os(n);
          }
        return r;
      }
      n = l, l = n.parentNode;
    }
    return null;
  }
  function ss(n) {
    return n = n[hi] || n[Hi], !n || n.tag !== 5 && n.tag !== 6 && n.tag !== 13 && n.tag !== 3 ? null : n;
  }
  function ao(n) {
    if (n.tag === 5 || n.tag === 6)
      return n.stateNode;
    throw Error(A(33));
  }
  function De(n) {
    return n[iu] || null;
  }
  var Rl = [], rn = -1;
  function Ke(n) {
    return { current: n };
  }
  function Mt(n) {
    0 > rn || (n.current = Rl[rn], Rl[rn] = null, rn--);
  }
  function jt(n, r) {
    rn++, Rl[rn] = n.current, n.current = r;
  }
  var mi = {}, Ve = Ke(mi), Tn = Ke(!1), Kr = mi;
  function La(n, r) {
    var l = n.type.contextTypes;
    if (!l)
      return mi;
    var o = n.stateNode;
    if (o && o.__reactInternalMemoizedUnmaskedChildContext === r)
      return o.__reactInternalMemoizedMaskedChildContext;
    var c = {}, d;
    for (d in l)
      c[d] = r[d];
    return o && (n = n.stateNode, n.__reactInternalMemoizedUnmaskedChildContext = r, n.__reactInternalMemoizedMaskedChildContext = c), c;
  }
  function sn(n) {
    return n = n.childContextTypes, n != null;
  }
  function Ma() {
    Mt(Tn), Mt(Ve);
  }
  function Tl(n, r, l) {
    if (Ve.current !== mi)
      throw Error(A(168));
    jt(Ve, r), jt(Tn, l);
  }
  function cs(n, r, l) {
    var o = n.stateNode;
    if (r = r.childContextTypes, typeof o.getChildContext != "function")
      return l;
    o = o.getChildContext();
    for (var c in o)
      if (!(c in r))
        throw Error(A(108, ft(n) || "Unknown", c));
    return T({}, l, o);
  }
  function dc(n) {
    return n = (n = n.stateNode) && n.__reactInternalMemoizedMergedChildContext || mi, Kr = Ve.current, jt(Ve, n), jt(Tn, Tn.current), !0;
  }
  function _v(n, r, l) {
    var o = n.stateNode;
    if (!o)
      throw Error(A(169));
    l ? (n = cs(n, r, Kr), o.__reactInternalMemoizedMergedChildContext = n, Mt(Tn), Mt(Ve), jt(Ve, n)) : Mt(Tn), jt(Tn, l);
  }
  var ha = null, qn = !1, fs = !1;
  function cd(n) {
    ha === null ? ha = [n] : ha.push(n);
  }
  function fd(n) {
    qn = !0, cd(n);
  }
  function Zr() {
    if (!fs && ha !== null) {
      fs = !0;
      var n = 0, r = Dt;
      try {
        var l = ha;
        for (Dt = 1; n < l.length; n++) {
          var o = l[n];
          do
            o = o(!0);
          while (o !== null);
        }
        ha = null, qn = !1;
      } catch (c) {
        throw ha !== null && (ha = ha.slice(n + 1)), en(qa, Zr), c;
      } finally {
        Dt = r, fs = !1;
      }
    }
    return null;
  }
  var wl = [], Jr = 0, lu = null, io = 0, ea = [], gr = 0, Na = null, rr = 1, ji = "";
  function ma(n, r) {
    wl[Jr++] = io, wl[Jr++] = lu, lu = n, io = r;
  }
  function dd(n, r, l) {
    ea[gr++] = rr, ea[gr++] = ji, ea[gr++] = Na, Na = n;
    var o = rr;
    n = ji;
    var c = 32 - Dr(o) - 1;
    o &= ~(1 << c), l += 1;
    var d = 32 - Dr(r) + c;
    if (30 < d) {
      var m = c - c % 5;
      d = (o & (1 << m) - 1).toString(32), o >>= m, c -= m, rr = 1 << 32 - Dr(r) + c | l << c | o, ji = d + n;
    } else
      rr = 1 << d | l << c | o, ji = n;
  }
  function pc(n) {
    n.return !== null && (ma(n, 1), dd(n, 1, 0));
  }
  function pd(n) {
    for (; n === lu; )
      lu = wl[--Jr], wl[Jr] = null, io = wl[--Jr], wl[Jr] = null;
    for (; n === Na; )
      Na = ea[--gr], ea[gr] = null, ji = ea[--gr], ea[gr] = null, rr = ea[--gr], ea[gr] = null;
  }
  var ya = null, ta = null, an = !1, za = null;
  function vd(n, r) {
    var l = Pa(5, null, null, 0);
    l.elementType = "DELETED", l.stateNode = r, l.return = n, r = n.deletions, r === null ? (n.deletions = [l], n.flags |= 16) : r.push(l);
  }
  function bv(n, r) {
    switch (n.tag) {
      case 5:
        var l = n.type;
        return r = r.nodeType !== 1 || l.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (n.stateNode = r, ya = n, ta = ti(r.firstChild), !0) : !1;
      case 6:
        return r = n.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (n.stateNode = r, ya = n, ta = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (l = Na !== null ? { id: rr, overflow: ji } : null, n.memoizedState = { dehydrated: r, treeContext: l, retryLane: 1073741824 }, l = Pa(18, null, null, 0), l.stateNode = r, l.return = n, n.child = l, ya = n, ta = null, !0) : !1;
      default:
        return !1;
    }
  }
  function vc(n) {
    return (n.mode & 1) !== 0 && (n.flags & 128) === 0;
  }
  function hc(n) {
    if (an) {
      var r = ta;
      if (r) {
        var l = r;
        if (!bv(n, r)) {
          if (vc(n))
            throw Error(A(418));
          r = ti(l.nextSibling);
          var o = ya;
          r && bv(n, r) ? vd(o, l) : (n.flags = n.flags & -4097 | 2, an = !1, ya = n);
        }
      } else {
        if (vc(n))
          throw Error(A(418));
        n.flags = n.flags & -4097 | 2, an = !1, ya = n;
      }
    }
  }
  function Dv(n) {
    for (n = n.return; n !== null && n.tag !== 5 && n.tag !== 3 && n.tag !== 13; )
      n = n.return;
    ya = n;
  }
  function mc(n) {
    if (n !== ya)
      return !1;
    if (!an)
      return Dv(n), an = !0, !1;
    var r;
    if ((r = n.tag !== 3) && !(r = n.tag !== 5) && (r = n.type, r = r !== "head" && r !== "body" && !us(n.type, n.memoizedProps)), r && (r = ta)) {
      if (vc(n))
        throw kv(), Error(A(418));
      for (; r; )
        vd(n, r), r = ti(r.nextSibling);
    }
    if (Dv(n), n.tag === 13) {
      if (n = n.memoizedState, n = n !== null ? n.dehydrated : null, !n)
        throw Error(A(317));
      e: {
        for (n = n.nextSibling, r = 0; n; ) {
          if (n.nodeType === 8) {
            var l = n.data;
            if (l === "/$") {
              if (r === 0) {
                ta = ti(n.nextSibling);
                break e;
              }
              r--;
            } else
              l !== "$" && l !== "$!" && l !== "$?" || r++;
          }
          n = n.nextSibling;
        }
        ta = null;
      }
    } else
      ta = ya ? ti(n.stateNode.nextSibling) : null;
    return !0;
  }
  function kv() {
    for (var n = ta; n; )
      n = ti(n.nextSibling);
  }
  function yn() {
    ta = ya = null, an = !1;
  }
  function hd(n) {
    za === null ? za = [n] : za.push(n);
  }
  var yc = ct.ReactCurrentBatchConfig;
  function ga(n, r) {
    if (n && n.defaultProps) {
      r = T({}, r), n = n.defaultProps;
      for (var l in n)
        r[l] === void 0 && (r[l] = n[l]);
      return r;
    }
    return r;
  }
  var yi = Ke(null), gc = null, xl = null, md = null;
  function yd() {
    md = xl = gc = null;
  }
  function _l(n) {
    var r = yi.current;
    Mt(yi), n._currentValue = r;
  }
  function Xn(n, r, l) {
    for (; n !== null; ) {
      var o = n.alternate;
      if ((n.childLanes & r) !== r ? (n.childLanes |= r, o !== null && (o.childLanes |= r)) : o !== null && (o.childLanes & r) !== r && (o.childLanes |= r), n === l)
        break;
      n = n.return;
    }
  }
  function te(n, r) {
    gc = n, md = xl = null, n = n.dependencies, n !== null && n.firstContext !== null && ((n.lanes & r) !== 0 && (zn = !0), n.firstContext = null);
  }
  function kn(n) {
    var r = n._currentValue;
    if (md !== n)
      if (n = { context: n, memoizedValue: r, next: null }, xl === null) {
        if (gc === null)
          throw Error(A(308));
        xl = n, gc.dependencies = { lanes: 0, firstContext: n };
      } else
        xl = xl.next = n;
    return r;
  }
  var ar = null;
  function gd(n) {
    ar === null ? ar = [n] : ar.push(n);
  }
  function Ov(n, r, l, o) {
    var c = r.interleaved;
    return c === null ? (l.next = l, gd(r)) : (l.next = c.next, c.next = l), r.interleaved = l, Pi(n, o);
  }
  function Pi(n, r) {
    n.lanes |= r;
    var l = n.alternate;
    for (l !== null && (l.lanes |= r), l = n, n = n.return; n !== null; )
      n.childLanes |= r, l = n.alternate, l !== null && (l.childLanes |= r), l = n, n = n.return;
    return l.tag === 3 ? l.stateNode : null;
  }
  var bl = !1;
  function Sd(n) {
    n.updateQueue = { baseState: n.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function jn(n, r) {
    n = n.updateQueue, r.updateQueue === n && (r.updateQueue = { baseState: n.baseState, firstBaseUpdate: n.firstBaseUpdate, lastBaseUpdate: n.lastBaseUpdate, shared: n.shared, effects: n.effects });
  }
  function Vi(n, r) {
    return { eventTime: n, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Dl(n, r, l) {
    var o = n.updateQueue;
    if (o === null)
      return null;
    if (o = o.shared, (dt & 2) !== 0) {
      var c = o.pending;
      return c === null ? r.next = r : (r.next = c.next, c.next = r), o.pending = r, Pi(n, l);
    }
    return c = o.interleaved, c === null ? (r.next = r, gd(o)) : (r.next = c.next, c.next = r), o.interleaved = r, Pi(n, l);
  }
  function Sc(n, r, l) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (l & 4194240) !== 0)) {
      var o = r.lanes;
      o &= n.pendingLanes, l |= o, r.lanes = l, pi(n, l);
    }
  }
  function Ed(n, r) {
    var l = n.updateQueue, o = n.alternate;
    if (o !== null && (o = o.updateQueue, l === o)) {
      var c = null, d = null;
      if (l = l.firstBaseUpdate, l !== null) {
        do {
          var m = { eventTime: l.eventTime, lane: l.lane, tag: l.tag, payload: l.payload, callback: l.callback, next: null };
          d === null ? c = d = m : d = d.next = m, l = l.next;
        } while (l !== null);
        d === null ? c = d = r : d = d.next = r;
      } else
        c = d = r;
      l = { baseState: o.baseState, firstBaseUpdate: c, lastBaseUpdate: d, shared: o.shared, effects: o.effects }, n.updateQueue = l;
      return;
    }
    n = l.lastBaseUpdate, n === null ? l.firstBaseUpdate = r : n.next = r, l.lastBaseUpdate = r;
  }
  function kl(n, r, l, o) {
    var c = n.updateQueue;
    bl = !1;
    var d = c.firstBaseUpdate, m = c.lastBaseUpdate, E = c.shared.pending;
    if (E !== null) {
      c.shared.pending = null;
      var w = E, U = w.next;
      w.next = null, m === null ? d = U : m.next = U, m = w;
      var Q = n.alternate;
      Q !== null && (Q = Q.updateQueue, E = Q.lastBaseUpdate, E !== m && (E === null ? Q.firstBaseUpdate = U : E.next = U, Q.lastBaseUpdate = w));
    }
    if (d !== null) {
      var W = c.baseState;
      m = 0, Q = U = w = null, E = d;
      do {
        var I = E.lane, oe = E.eventTime;
        if ((o & I) === I) {
          Q !== null && (Q = Q.next = {
            eventTime: oe,
            lane: 0,
            tag: E.tag,
            payload: E.payload,
            callback: E.callback,
            next: null
          });
          e: {
            var ge = n, Ce = E;
            switch (I = r, oe = l, Ce.tag) {
              case 1:
                if (ge = Ce.payload, typeof ge == "function") {
                  W = ge.call(oe, W, I);
                  break e;
                }
                W = ge;
                break e;
              case 3:
                ge.flags = ge.flags & -65537 | 128;
              case 0:
                if (ge = Ce.payload, I = typeof ge == "function" ? ge.call(oe, W, I) : ge, I == null)
                  break e;
                W = T({}, W, I);
                break e;
              case 2:
                bl = !0;
            }
          }
          E.callback !== null && E.lane !== 0 && (n.flags |= 64, I = c.effects, I === null ? c.effects = [E] : I.push(E));
        } else
          oe = { eventTime: oe, lane: I, tag: E.tag, payload: E.payload, callback: E.callback, next: null }, Q === null ? (U = Q = oe, w = W) : Q = Q.next = oe, m |= I;
        if (E = E.next, E === null) {
          if (E = c.shared.pending, E === null)
            break;
          I = E, E = I.next, I.next = null, c.lastBaseUpdate = I, c.shared.pending = null;
        }
      } while (1);
      if (Q === null && (w = W), c.baseState = w, c.firstBaseUpdate = U, c.lastBaseUpdate = Q, r = c.shared.interleaved, r !== null) {
        c = r;
        do
          m |= c.lane, c = c.next;
        while (c !== r);
      } else
        d === null && (c.shared.lanes = 0);
      Ii |= m, n.lanes = m, n.memoizedState = W;
    }
  }
  function uu(n, r, l) {
    if (n = r.effects, r.effects = null, n !== null)
      for (r = 0; r < n.length; r++) {
        var o = n[r], c = o.callback;
        if (c !== null) {
          if (o.callback = null, o = l, typeof c != "function")
            throw Error(A(191, c));
          c.call(o);
        }
      }
  }
  var Lv = new B.Component().refs;
  function Cd(n, r, l, o) {
    r = n.memoizedState, l = l(o, r), l = l == null ? r : T({}, r, l), n.memoizedState = l, n.lanes === 0 && (n.updateQueue.baseState = l);
  }
  var Ec = { isMounted: function(n) {
    return (n = n._reactInternals) ? Ge(n) === n : !1;
  }, enqueueSetState: function(n, r, l) {
    n = n._reactInternals;
    var o = Rr(), c = Un(n), d = Vi(o, c);
    d.payload = r, l != null && (d.callback = l), r = Dl(n, d, c), r !== null && (Tr(r, n, c, o), Sc(r, n, c));
  }, enqueueReplaceState: function(n, r, l) {
    n = n._reactInternals;
    var o = Rr(), c = Un(n), d = Vi(o, c);
    d.tag = 1, d.payload = r, l != null && (d.callback = l), r = Dl(n, d, c), r !== null && (Tr(r, n, c, o), Sc(r, n, c));
  }, enqueueForceUpdate: function(n, r) {
    n = n._reactInternals;
    var l = Rr(), o = Un(n), c = Vi(l, o);
    c.tag = 2, r != null && (c.callback = r), r = Dl(n, c, o), r !== null && (Tr(r, n, o, l), Sc(r, n, o));
  } };
  function Mv(n, r, l, o, c, d, m) {
    return n = n.stateNode, typeof n.shouldComponentUpdate == "function" ? n.shouldComponentUpdate(o, d, m) : r.prototype && r.prototype.isPureReactComponent ? !es(l, o) || !es(c, d) : !0;
  }
  function Nv(n, r, l) {
    var o = !1, c = mi, d = r.contextType;
    return typeof d == "object" && d !== null ? d = kn(d) : (c = sn(r) ? Kr : Ve.current, o = r.contextTypes, d = (o = o != null) ? La(n, c) : mi), r = new r(l, d), n.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = Ec, n.stateNode = r, r._reactInternals = n, o && (n = n.stateNode, n.__reactInternalMemoizedUnmaskedChildContext = c, n.__reactInternalMemoizedMaskedChildContext = d), r;
  }
  function zv(n, r, l, o) {
    n = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(l, o), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(l, o), r.state !== n && Ec.enqueueReplaceState(r, r.state, null);
  }
  function Cc(n, r, l, o) {
    var c = n.stateNode;
    c.props = l, c.state = n.memoizedState, c.refs = Lv, Sd(n);
    var d = r.contextType;
    typeof d == "object" && d !== null ? c.context = kn(d) : (d = sn(r) ? Kr : Ve.current, c.context = La(n, d)), c.state = n.memoizedState, d = r.getDerivedStateFromProps, typeof d == "function" && (Cd(n, r, d, l), c.state = n.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (r = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), r !== c.state && Ec.enqueueReplaceState(c, c.state, null), kl(n, l, c, o), c.state = n.memoizedState), typeof c.componentDidMount == "function" && (n.flags |= 4194308);
  }
  function lo(n, r, l) {
    if (n = l.ref, n !== null && typeof n != "function" && typeof n != "object") {
      if (l._owner) {
        if (l = l._owner, l) {
          if (l.tag !== 1)
            throw Error(A(309));
          var o = l.stateNode;
        }
        if (!o)
          throw Error(A(147, n));
        var c = o, d = "" + n;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === d ? r.ref : (r = function(m) {
          var E = c.refs;
          E === Lv && (E = c.refs = {}), m === null ? delete E[d] : E[d] = m;
        }, r._stringRef = d, r);
      }
      if (typeof n != "string")
        throw Error(A(284));
      if (!l._owner)
        throw Error(A(290, n));
    }
    return n;
  }
  function Rc(n, r) {
    throw n = Object.prototype.toString.call(r), Error(A(31, n === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : n));
  }
  function Uv(n) {
    var r = n._init;
    return r(n._payload);
  }
  function Av(n) {
    function r(D, _) {
      if (n) {
        var L = D.deletions;
        L === null ? (D.deletions = [_], D.flags |= 16) : L.push(_);
      }
    }
    function l(D, _) {
      if (!n)
        return null;
      for (; _ !== null; )
        r(D, _), _ = _.sibling;
      return null;
    }
    function o(D, _) {
      for (D = /* @__PURE__ */ new Map(); _ !== null; )
        _.key !== null ? D.set(_.key, _) : D.set(_.index, _), _ = _.sibling;
      return D;
    }
    function c(D, _) {
      return D = Fl(D, _), D.index = 0, D.sibling = null, D;
    }
    function d(D, _, L) {
      return D.index = L, n ? (L = D.alternate, L !== null ? (L = L.index, L < _ ? (D.flags |= 2, _) : L) : (D.flags |= 2, _)) : (D.flags |= 1048576, _);
    }
    function m(D) {
      return n && D.alternate === null && (D.flags |= 2), D;
    }
    function E(D, _, L, K) {
      return _ === null || _.tag !== 6 ? (_ = Os(L, D.mode, K), _.return = D, _) : (_ = c(_, L), _.return = D, _);
    }
    function w(D, _, L, K) {
      var Re = L.type;
      return Re === He ? Q(D, _, L.props.children, K, L.key) : _ !== null && (_.elementType === Re || typeof Re == "object" && Re !== null && Re.$$typeof === Rt && Uv(Re) === _.type) ? (K = c(_, L.props), K.ref = lo(D, _, L), K.return = D, K) : (K = ef(L.type, L.key, L.props, null, D.mode, K), K.ref = lo(D, _, L), K.return = D, K);
    }
    function U(D, _, L, K) {
      return _ === null || _.tag !== 4 || _.stateNode.containerInfo !== L.containerInfo || _.stateNode.implementation !== L.implementation ? (_ = _u(L, D.mode, K), _.return = D, _) : (_ = c(_, L.children || []), _.return = D, _);
    }
    function Q(D, _, L, K, Re) {
      return _ === null || _.tag !== 7 ? (_ = xu(L, D.mode, K, Re), _.return = D, _) : (_ = c(_, L), _.return = D, _);
    }
    function W(D, _, L) {
      if (typeof _ == "string" && _ !== "" || typeof _ == "number")
        return _ = Os("" + _, D.mode, L), _.return = D, _;
      if (typeof _ == "object" && _ !== null) {
        switch (_.$$typeof) {
          case _e:
            return L = ef(_.type, _.key, _.props, null, D.mode, L), L.ref = lo(D, null, _), L.return = D, L;
          case it:
            return _ = _u(_, D.mode, L), _.return = D, _;
          case Rt:
            var K = _._init;
            return W(D, K(_._payload), L);
        }
        if (Qn(_) || we(_))
          return _ = xu(_, D.mode, L, null), _.return = D, _;
        Rc(D, _);
      }
      return null;
    }
    function I(D, _, L, K) {
      var Re = _ !== null ? _.key : null;
      if (typeof L == "string" && L !== "" || typeof L == "number")
        return Re !== null ? null : E(D, _, "" + L, K);
      if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case _e:
            return L.key === Re ? w(D, _, L, K) : null;
          case it:
            return L.key === Re ? U(D, _, L, K) : null;
          case Rt:
            return Re = L._init, I(
              D,
              _,
              Re(L._payload),
              K
            );
        }
        if (Qn(L) || we(L))
          return Re !== null ? null : Q(D, _, L, K, null);
        Rc(D, L);
      }
      return null;
    }
    function oe(D, _, L, K, Re) {
      if (typeof K == "string" && K !== "" || typeof K == "number")
        return D = D.get(L) || null, E(_, D, "" + K, Re);
      if (typeof K == "object" && K !== null) {
        switch (K.$$typeof) {
          case _e:
            return D = D.get(K.key === null ? L : K.key) || null, w(_, D, K, Re);
          case it:
            return D = D.get(K.key === null ? L : K.key) || null, U(_, D, K, Re);
          case Rt:
            var Se = K._init;
            return oe(D, _, L, Se(K._payload), Re);
        }
        if (Qn(K) || we(K))
          return D = D.get(L) || null, Q(_, D, K, Re, null);
        Rc(_, K);
      }
      return null;
    }
    function ge(D, _, L, K) {
      for (var Re = null, Se = null, be = _, Be = _ = 0, Jn = null; be !== null && Be < L.length; Be++) {
        be.index > Be ? (Jn = be, be = null) : Jn = be.sibling;
        var _t = I(D, be, L[Be], K);
        if (_t === null) {
          be === null && (be = Jn);
          break;
        }
        n && be && _t.alternate === null && r(D, be), _ = d(_t, _, Be), Se === null ? Re = _t : Se.sibling = _t, Se = _t, be = Jn;
      }
      if (Be === L.length)
        return l(D, be), an && ma(D, Be), Re;
      if (be === null) {
        for (; Be < L.length; Be++)
          be = W(D, L[Be], K), be !== null && (_ = d(be, _, Be), Se === null ? Re = be : Se.sibling = be, Se = be);
        return an && ma(D, Be), Re;
      }
      for (be = o(D, be); Be < L.length; Be++)
        Jn = oe(be, D, Be, L[Be], K), Jn !== null && (n && Jn.alternate !== null && be.delete(Jn.key === null ? Be : Jn.key), _ = d(Jn, _, Be), Se === null ? Re = Jn : Se.sibling = Jn, Se = Jn);
      return n && be.forEach(function(Hl) {
        return r(D, Hl);
      }), an && ma(D, Be), Re;
    }
    function Ce(D, _, L, K) {
      var Re = we(L);
      if (typeof Re != "function")
        throw Error(A(150));
      if (L = Re.call(L), L == null)
        throw Error(A(151));
      for (var Se = Re = null, be = _, Be = _ = 0, Jn = null, _t = L.next(); be !== null && !_t.done; Be++, _t = L.next()) {
        be.index > Be ? (Jn = be, be = null) : Jn = be.sibling;
        var Hl = I(D, be, _t.value, K);
        if (Hl === null) {
          be === null && (be = Jn);
          break;
        }
        n && be && Hl.alternate === null && r(D, be), _ = d(Hl, _, Be), Se === null ? Re = Hl : Se.sibling = Hl, Se = Hl, be = Jn;
      }
      if (_t.done)
        return l(
          D,
          be
        ), an && ma(D, Be), Re;
      if (be === null) {
        for (; !_t.done; Be++, _t = L.next())
          _t = W(D, _t.value, K), _t !== null && (_ = d(_t, _, Be), Se === null ? Re = _t : Se.sibling = _t, Se = _t);
        return an && ma(D, Be), Re;
      }
      for (be = o(D, be); !_t.done; Be++, _t = L.next())
        _t = oe(be, D, Be, _t.value, K), _t !== null && (n && _t.alternate !== null && be.delete(_t.key === null ? Be : _t.key), _ = d(_t, _, Be), Se === null ? Re = _t : Se.sibling = _t, Se = _t);
      return n && be.forEach(function(Sy) {
        return r(D, Sy);
      }), an && ma(D, Be), Re;
    }
    function On(D, _, L, K) {
      if (typeof L == "object" && L !== null && L.type === He && L.key === null && (L = L.props.children), typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case _e:
            e: {
              for (var Re = L.key, Se = _; Se !== null; ) {
                if (Se.key === Re) {
                  if (Re = L.type, Re === He) {
                    if (Se.tag === 7) {
                      l(D, Se.sibling), _ = c(Se, L.props.children), _.return = D, D = _;
                      break e;
                    }
                  } else if (Se.elementType === Re || typeof Re == "object" && Re !== null && Re.$$typeof === Rt && Uv(Re) === Se.type) {
                    l(D, Se.sibling), _ = c(Se, L.props), _.ref = lo(D, Se, L), _.return = D, D = _;
                    break e;
                  }
                  l(D, Se);
                  break;
                } else
                  r(D, Se);
                Se = Se.sibling;
              }
              L.type === He ? (_ = xu(L.props.children, D.mode, K, L.key), _.return = D, D = _) : (K = ef(L.type, L.key, L.props, null, D.mode, K), K.ref = lo(D, _, L), K.return = D, D = K);
            }
            return m(D);
          case it:
            e: {
              for (Se = L.key; _ !== null; ) {
                if (_.key === Se)
                  if (_.tag === 4 && _.stateNode.containerInfo === L.containerInfo && _.stateNode.implementation === L.implementation) {
                    l(D, _.sibling), _ = c(_, L.children || []), _.return = D, D = _;
                    break e;
                  } else {
                    l(D, _);
                    break;
                  }
                else
                  r(D, _);
                _ = _.sibling;
              }
              _ = _u(L, D.mode, K), _.return = D, D = _;
            }
            return m(D);
          case Rt:
            return Se = L._init, On(D, _, Se(L._payload), K);
        }
        if (Qn(L))
          return ge(D, _, L, K);
        if (we(L))
          return Ce(D, _, L, K);
        Rc(D, L);
      }
      return typeof L == "string" && L !== "" || typeof L == "number" ? (L = "" + L, _ !== null && _.tag === 6 ? (l(D, _.sibling), _ = c(_, L), _.return = D, D = _) : (l(D, _), _ = Os(L, D.mode, K), _.return = D, D = _), m(D)) : l(D, _);
    }
    return On;
  }
  var uo = Av(!0), Fv = Av(!1), ds = {}, ni = Ke(ds), ps = Ke(ds), oo = Ke(ds);
  function ou(n) {
    if (n === ds)
      throw Error(A(174));
    return n;
  }
  function Rd(n, r) {
    switch (jt(oo, r), jt(ps, n), jt(ni, ds), n = r.nodeType, n) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : vn(null, "");
        break;
      default:
        n = n === 8 ? r.parentNode : r, r = n.namespaceURI || null, n = n.tagName, r = vn(r, n);
    }
    Mt(ni), jt(ni, r);
  }
  function Ol() {
    Mt(ni), Mt(ps), Mt(oo);
  }
  function Me(n) {
    ou(oo.current);
    var r = ou(ni.current), l = vn(r, n.type);
    r !== l && (jt(ps, n), jt(ni, l));
  }
  function ot(n) {
    ps.current === n && (Mt(ni), Mt(ps));
  }
  var ze = Ke(0);
  function gn(n) {
    for (var r = n; r !== null; ) {
      if (r.tag === 13) {
        var l = r.memoizedState;
        if (l !== null && (l = l.dehydrated, l === null || l.data === "$?" || l.data === "$!"))
          return r;
      } else if (r.tag === 19 && r.memoizedProps.revealOrder !== void 0) {
        if ((r.flags & 128) !== 0)
          return r;
      } else if (r.child !== null) {
        r.child.return = r, r = r.child;
        continue;
      }
      if (r === n)
        break;
      for (; r.sibling === null; ) {
        if (r.return === null || r.return === n)
          return null;
        r = r.return;
      }
      r.sibling.return = r.return, r = r.sibling;
    }
    return null;
  }
  var Ua = [];
  function Tc() {
    for (var n = 0; n < Ua.length; n++)
      Ua[n]._workInProgressVersionPrimary = null;
    Ua.length = 0;
  }
  var wc = ct.ReactCurrentDispatcher, Td = ct.ReactCurrentBatchConfig, su = 0, ln = null, P = null, yt = null, Ae = !1, gi = !1, Sa = 0, cu = 0;
  function un() {
    throw Error(A(321));
  }
  function fu(n, r) {
    if (r === null)
      return !1;
    for (var l = 0; l < r.length && l < n.length; l++)
      if (!ka(n[l], r[l]))
        return !1;
    return !0;
  }
  function Ll(n, r, l, o, c, d) {
    if (su = d, ln = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, wc.current = n === null || n.memoizedState === null ? ty : ny, n = l(o, c), gi) {
      d = 0;
      do {
        if (gi = !1, Sa = 0, 25 <= d)
          throw Error(A(301));
        d += 1, yt = P = null, r.updateQueue = null, wc.current = xd, n = l(o, c);
      } while (gi);
    }
    if (wc.current = Pc, r = P !== null && P.next !== null, su = 0, yt = P = ln = null, Ae = !1, r)
      throw Error(A(300));
    return n;
  }
  function du() {
    var n = Sa !== 0;
    return Sa = 0, n;
  }
  function Aa() {
    var n = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return yt === null ? ln.memoizedState = yt = n : yt = yt.next = n, yt;
  }
  function na() {
    if (P === null) {
      var n = ln.alternate;
      n = n !== null ? n.memoizedState : null;
    } else
      n = P.next;
    var r = yt === null ? ln.memoizedState : yt.next;
    if (r !== null)
      yt = r, P = n;
    else {
      if (n === null)
        throw Error(A(310));
      P = n, n = { memoizedState: P.memoizedState, baseState: P.baseState, baseQueue: P.baseQueue, queue: P.queue, next: null }, yt === null ? ln.memoizedState = yt = n : yt = yt.next = n;
    }
    return yt;
  }
  function pu(n, r) {
    return typeof r == "function" ? r(n) : r;
  }
  function vs(n) {
    var r = na(), l = r.queue;
    if (l === null)
      throw Error(A(311));
    l.lastRenderedReducer = n;
    var o = P, c = o.baseQueue, d = l.pending;
    if (d !== null) {
      if (c !== null) {
        var m = c.next;
        c.next = d.next, d.next = m;
      }
      o.baseQueue = c = d, l.pending = null;
    }
    if (c !== null) {
      d = c.next, o = o.baseState;
      var E = m = null, w = null, U = d;
      do {
        var Q = U.lane;
        if ((su & Q) === Q)
          w !== null && (w = w.next = { lane: 0, action: U.action, hasEagerState: U.hasEagerState, eagerState: U.eagerState, next: null }), o = U.hasEagerState ? U.eagerState : n(o, U.action);
        else {
          var W = {
            lane: Q,
            action: U.action,
            hasEagerState: U.hasEagerState,
            eagerState: U.eagerState,
            next: null
          };
          w === null ? (E = w = W, m = o) : w = w.next = W, ln.lanes |= Q, Ii |= Q;
        }
        U = U.next;
      } while (U !== null && U !== d);
      w === null ? m = o : w.next = E, ka(o, r.memoizedState) || (zn = !0), r.memoizedState = o, r.baseState = m, r.baseQueue = w, l.lastRenderedState = o;
    }
    if (n = l.interleaved, n !== null) {
      c = n;
      do
        d = c.lane, ln.lanes |= d, Ii |= d, c = c.next;
      while (c !== n);
    } else
      c === null && (l.lanes = 0);
    return [r.memoizedState, l.dispatch];
  }
  function hs(n) {
    var r = na(), l = r.queue;
    if (l === null)
      throw Error(A(311));
    l.lastRenderedReducer = n;
    var o = l.dispatch, c = l.pending, d = r.memoizedState;
    if (c !== null) {
      l.pending = null;
      var m = c = c.next;
      do
        d = n(d, m.action), m = m.next;
      while (m !== c);
      ka(d, r.memoizedState) || (zn = !0), r.memoizedState = d, r.baseQueue === null && (r.baseState = d), l.lastRenderedState = d;
    }
    return [d, o];
  }
  function xc() {
  }
  function _c(n, r) {
    var l = ln, o = na(), c = r(), d = !ka(o.memoizedState, c);
    if (d && (o.memoizedState = c, zn = !0), o = o.queue, ms(kc.bind(null, l, o, n), [n]), o.getSnapshot !== r || d || yt !== null && yt.memoizedState.tag & 1) {
      if (l.flags |= 2048, vu(9, Dc.bind(null, l, o, c, r), void 0, null), Sn === null)
        throw Error(A(349));
      (su & 30) !== 0 || bc(l, r, c);
    }
    return c;
  }
  function bc(n, r, l) {
    n.flags |= 16384, n = { getSnapshot: r, value: l }, r = ln.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, ln.updateQueue = r, r.stores = [n]) : (l = r.stores, l === null ? r.stores = [n] : l.push(n));
  }
  function Dc(n, r, l, o) {
    r.value = l, r.getSnapshot = o, Oc(r) && Lc(n);
  }
  function kc(n, r, l) {
    return l(function() {
      Oc(r) && Lc(n);
    });
  }
  function Oc(n) {
    var r = n.getSnapshot;
    n = n.value;
    try {
      var l = r();
      return !ka(n, l);
    } catch {
      return !0;
    }
  }
  function Lc(n) {
    var r = Pi(n, 1);
    r !== null && Tr(r, n, 1, -1);
  }
  function Mc(n) {
    var r = Aa();
    return typeof n == "function" && (n = n()), r.memoizedState = r.baseState = n, n = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: pu, lastRenderedState: n }, r.queue = n, n = n.dispatch = jc.bind(null, ln, n), [r.memoizedState, n];
  }
  function vu(n, r, l, o) {
    return n = { tag: n, create: r, destroy: l, deps: o, next: null }, r = ln.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, ln.updateQueue = r, r.lastEffect = n.next = n) : (l = r.lastEffect, l === null ? r.lastEffect = n.next = n : (o = l.next, l.next = n, n.next = o, r.lastEffect = n)), n;
  }
  function Nc() {
    return na().memoizedState;
  }
  function hu(n, r, l, o) {
    var c = Aa();
    ln.flags |= n, c.memoizedState = vu(1 | r, l, void 0, o === void 0 ? null : o);
  }
  function Bi(n, r, l, o) {
    var c = na();
    o = o === void 0 ? null : o;
    var d = void 0;
    if (P !== null) {
      var m = P.memoizedState;
      if (d = m.destroy, o !== null && fu(o, m.deps)) {
        c.memoizedState = vu(r, l, d, o);
        return;
      }
    }
    ln.flags |= n, c.memoizedState = vu(1 | r, l, d, o);
  }
  function zc(n, r) {
    return hu(8390656, 8, n, r);
  }
  function ms(n, r) {
    return Bi(2048, 8, n, r);
  }
  function Uc(n, r) {
    return Bi(4, 2, n, r);
  }
  function Ac(n, r) {
    return Bi(4, 4, n, r);
  }
  function wd(n, r) {
    if (typeof r == "function")
      return n = n(), r(n), function() {
        r(null);
      };
    if (r != null)
      return n = n(), r.current = n, function() {
        r.current = null;
      };
  }
  function so(n, r, l) {
    return l = l != null ? l.concat([n]) : null, Bi(4, 4, wd.bind(null, r, n), l);
  }
  function Fc() {
  }
  function co(n, r) {
    var l = na();
    r = r === void 0 ? null : r;
    var o = l.memoizedState;
    return o !== null && r !== null && fu(r, o[1]) ? o[0] : (l.memoizedState = [n, r], n);
  }
  function Ml(n, r) {
    var l = na();
    r = r === void 0 ? null : r;
    var o = l.memoizedState;
    return o !== null && r !== null && fu(r, o[1]) ? o[0] : (n = n(), l.memoizedState = [n, r], n);
  }
  function ra(n, r, l) {
    return (su & 21) === 0 ? (n.baseState && (n.baseState = !1, zn = !0), n.memoizedState = l) : (ka(l, r) || (l = $u(), ln.lanes |= l, Ii |= l, n.baseState = !0), r);
  }
  function ey(n, r) {
    var l = Dt;
    Dt = l !== 0 && 4 > l ? l : 4, n(!0);
    var o = Td.transition;
    Td.transition = {};
    try {
      n(!1), r();
    } finally {
      Dt = l, Td.transition = o;
    }
  }
  function Zt() {
    return na().memoizedState;
  }
  function Hc(n, r, l) {
    var o = Un(n);
    if (l = { lane: o, action: l, hasEagerState: !1, eagerState: null, next: null }, fo(n))
      ys(r, l);
    else if (l = Ov(n, r, l, o), l !== null) {
      var c = Rr();
      Tr(l, n, o, c), Hv(l, r, o);
    }
  }
  function jc(n, r, l) {
    var o = Un(n), c = { lane: o, action: l, hasEagerState: !1, eagerState: null, next: null };
    if (fo(n))
      ys(r, c);
    else {
      var d = n.alternate;
      if (n.lanes === 0 && (d === null || d.lanes === 0) && (d = r.lastRenderedReducer, d !== null))
        try {
          var m = r.lastRenderedState, E = d(m, l);
          if (c.hasEagerState = !0, c.eagerState = E, ka(E, m)) {
            var w = r.interleaved;
            w === null ? (c.next = c, gd(r)) : (c.next = w.next, w.next = c), r.interleaved = c;
            return;
          }
        } catch {
        } finally {
        }
      l = Ov(n, r, c, o), l !== null && (c = Rr(), Tr(l, n, o, c), Hv(l, r, o));
    }
  }
  function fo(n) {
    var r = n.alternate;
    return n === ln || r !== null && r === ln;
  }
  function ys(n, r) {
    gi = Ae = !0;
    var l = n.pending;
    l === null ? r.next = r : (r.next = l.next, l.next = r), n.pending = r;
  }
  function Hv(n, r, l) {
    if ((l & 4194240) !== 0) {
      var o = r.lanes;
      o &= n.pendingLanes, l |= o, r.lanes = l, pi(n, l);
    }
  }
  var Pc = { readContext: kn, useCallback: un, useContext: un, useEffect: un, useImperativeHandle: un, useInsertionEffect: un, useLayoutEffect: un, useMemo: un, useReducer: un, useRef: un, useState: un, useDebugValue: un, useDeferredValue: un, useTransition: un, useMutableSource: un, useSyncExternalStore: un, useId: un, unstable_isNewReconciler: !1 }, ty = { readContext: kn, useCallback: function(n, r) {
    return Aa().memoizedState = [n, r === void 0 ? null : r], n;
  }, useContext: kn, useEffect: zc, useImperativeHandle: function(n, r, l) {
    return l = l != null ? l.concat([n]) : null, hu(
      4194308,
      4,
      wd.bind(null, r, n),
      l
    );
  }, useLayoutEffect: function(n, r) {
    return hu(4194308, 4, n, r);
  }, useInsertionEffect: function(n, r) {
    return hu(4, 2, n, r);
  }, useMemo: function(n, r) {
    var l = Aa();
    return r = r === void 0 ? null : r, n = n(), l.memoizedState = [n, r], n;
  }, useReducer: function(n, r, l) {
    var o = Aa();
    return r = l !== void 0 ? l(r) : r, o.memoizedState = o.baseState = r, n = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: n, lastRenderedState: r }, o.queue = n, n = n.dispatch = Hc.bind(null, ln, n), [o.memoizedState, n];
  }, useRef: function(n) {
    var r = Aa();
    return n = { current: n }, r.memoizedState = n;
  }, useState: Mc, useDebugValue: Fc, useDeferredValue: function(n) {
    return Aa().memoizedState = n;
  }, useTransition: function() {
    var n = Mc(!1), r = n[0];
    return n = ey.bind(null, n[1]), Aa().memoizedState = n, [r, n];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(n, r, l) {
    var o = ln, c = Aa();
    if (an) {
      if (l === void 0)
        throw Error(A(407));
      l = l();
    } else {
      if (l = r(), Sn === null)
        throw Error(A(349));
      (su & 30) !== 0 || bc(o, r, l);
    }
    c.memoizedState = l;
    var d = { value: l, getSnapshot: r };
    return c.queue = d, zc(kc.bind(
      null,
      o,
      d,
      n
    ), [n]), o.flags |= 2048, vu(9, Dc.bind(null, o, d, l, r), void 0, null), l;
  }, useId: function() {
    var n = Aa(), r = Sn.identifierPrefix;
    if (an) {
      var l = ji, o = rr;
      l = (o & ~(1 << 32 - Dr(o) - 1)).toString(32) + l, r = ":" + r + "R" + l, l = Sa++, 0 < l && (r += "H" + l.toString(32)), r += ":";
    } else
      l = cu++, r = ":" + r + "r" + l.toString(32) + ":";
    return n.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, ny = {
    readContext: kn,
    useCallback: co,
    useContext: kn,
    useEffect: ms,
    useImperativeHandle: so,
    useInsertionEffect: Uc,
    useLayoutEffect: Ac,
    useMemo: Ml,
    useReducer: vs,
    useRef: Nc,
    useState: function() {
      return vs(pu);
    },
    useDebugValue: Fc,
    useDeferredValue: function(n) {
      var r = na();
      return ra(r, P.memoizedState, n);
    },
    useTransition: function() {
      var n = vs(pu)[0], r = na().memoizedState;
      return [n, r];
    },
    useMutableSource: xc,
    useSyncExternalStore: _c,
    useId: Zt,
    unstable_isNewReconciler: !1
  }, xd = { readContext: kn, useCallback: co, useContext: kn, useEffect: ms, useImperativeHandle: so, useInsertionEffect: Uc, useLayoutEffect: Ac, useMemo: Ml, useReducer: hs, useRef: Nc, useState: function() {
    return hs(pu);
  }, useDebugValue: Fc, useDeferredValue: function(n) {
    var r = na();
    return P === null ? r.memoizedState = n : ra(r, P.memoizedState, n);
  }, useTransition: function() {
    var n = hs(pu)[0], r = na().memoizedState;
    return [n, r];
  }, useMutableSource: xc, useSyncExternalStore: _c, useId: Zt, unstable_isNewReconciler: !1 };
  function po(n, r) {
    try {
      var l = "", o = r;
      do
        l += ht(o), o = o.return;
      while (o);
      var c = l;
    } catch (d) {
      c = `
Error generating stack: ` + d.message + `
` + d.stack;
    }
    return { value: n, source: r, stack: c, digest: null };
  }
  function gs(n, r, l) {
    return { value: n, source: null, stack: l != null ? l : null, digest: r != null ? r : null };
  }
  function Vc(n, r) {
    try {
      console.error(r.value);
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  var ry = typeof WeakMap == "function" ? WeakMap : Map;
  function jv(n, r, l) {
    l = Vi(-1, l), l.tag = 3, l.payload = { element: null };
    var o = r.value;
    return l.callback = function() {
      Gc || (Gc = !0, Eu = o), Vc(n, r);
    }, l;
  }
  function Ss(n, r, l) {
    l = Vi(-1, l), l.tag = 3;
    var o = n.type.getDerivedStateFromError;
    if (typeof o == "function") {
      var c = r.value;
      l.payload = function() {
        return o(c);
      }, l.callback = function() {
        Vc(n, r);
      };
    }
    var d = n.stateNode;
    return d !== null && typeof d.componentDidCatch == "function" && (l.callback = function() {
      Vc(n, r), typeof o != "function" && (Ci === null ? Ci = /* @__PURE__ */ new Set([this]) : Ci.add(this));
      var m = r.stack;
      this.componentDidCatch(r.value, { componentStack: m !== null ? m : "" });
    }), l;
  }
  function Pv(n, r, l) {
    var o = n.pingCache;
    if (o === null) {
      o = n.pingCache = new ry();
      var c = /* @__PURE__ */ new Set();
      o.set(r, c);
    } else
      c = o.get(r), c === void 0 && (c = /* @__PURE__ */ new Set(), o.set(r, c));
    c.has(l) || (c.add(l), n = cy.bind(null, n, r, l), r.then(n, n));
  }
  function _d(n) {
    do {
      var r;
      if ((r = n.tag === 13) && (r = n.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r)
        return n;
      n = n.return;
    } while (n !== null);
    return null;
  }
  function bd(n, r, l, o, c) {
    return (n.mode & 1) === 0 ? (n === r ? n.flags |= 65536 : (n.flags |= 128, l.flags |= 131072, l.flags &= -52805, l.tag === 1 && (l.alternate === null ? l.tag = 17 : (r = Vi(-1, 1), r.tag = 2, Dl(l, r, 1))), l.lanes |= 1), n) : (n.flags |= 65536, n.lanes = c, n);
  }
  var ay = ct.ReactCurrentOwner, zn = !1;
  function Pn(n, r, l, o) {
    r.child = n === null ? Fv(r, null, l, o) : uo(r, n.child, l, o);
  }
  function Nl(n, r, l, o, c) {
    l = l.render;
    var d = r.ref;
    return te(r, c), o = Ll(n, r, l, o, d, c), l = du(), n !== null && !zn ? (r.updateQueue = n.updateQueue, r.flags &= -2053, n.lanes &= ~c, ir(n, r, c)) : (an && l && pc(r), r.flags |= 1, Pn(n, r, o, c), r.child);
  }
  function Bc(n, r, l, o, c) {
    if (n === null) {
      var d = l.type;
      return typeof d == "function" && !Qd(d) && d.defaultProps === void 0 && l.compare === null && l.defaultProps === void 0 ? (r.tag = 15, r.type = d, aa(n, r, d, o, c)) : (n = ef(l.type, null, o, r, r.mode, c), n.ref = r.ref, n.return = r, r.child = n);
    }
    if (d = n.child, (n.lanes & c) === 0) {
      var m = d.memoizedProps;
      if (l = l.compare, l = l !== null ? l : es, l(m, o) && n.ref === r.ref)
        return ir(n, r, c);
    }
    return r.flags |= 1, n = Fl(d, o), n.ref = r.ref, n.return = r, r.child = n;
  }
  function aa(n, r, l, o, c) {
    if (n !== null) {
      var d = n.memoizedProps;
      if (es(d, o) && n.ref === r.ref)
        if (zn = !1, r.pendingProps = o = d, (n.lanes & c) !== 0)
          (n.flags & 131072) !== 0 && (zn = !0);
        else
          return r.lanes = n.lanes, ir(n, r, c);
    }
    return vo(n, r, l, o, c);
  }
  function mu(n, r, l) {
    var o = r.pendingProps, c = o.children, d = n !== null ? n.memoizedState : null;
    if (o.mode === "hidden")
      if ((r.mode & 1) === 0)
        r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, jt(Eo, Ea), Ea |= l;
      else {
        if ((l & 1073741824) === 0)
          return n = d !== null ? d.baseLanes | l : l, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: n, cachePool: null, transitions: null }, r.updateQueue = null, jt(Eo, Ea), Ea |= n, null;
        r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, o = d !== null ? d.baseLanes : l, jt(Eo, Ea), Ea |= o;
      }
    else
      d !== null ? (o = d.baseLanes | l, r.memoizedState = null) : o = l, jt(Eo, Ea), Ea |= o;
    return Pn(n, r, c, l), r.child;
  }
  function Ze(n, r) {
    var l = r.ref;
    (n === null && l !== null || n !== null && n.ref !== l) && (r.flags |= 512, r.flags |= 2097152);
  }
  function vo(n, r, l, o, c) {
    var d = sn(l) ? Kr : Ve.current;
    return d = La(r, d), te(r, c), l = Ll(n, r, l, o, d, c), o = du(), n !== null && !zn ? (r.updateQueue = n.updateQueue, r.flags &= -2053, n.lanes &= ~c, ir(n, r, c)) : (an && o && pc(r), r.flags |= 1, Pn(n, r, l, c), r.child);
  }
  function Dd(n, r, l, o, c) {
    if (sn(l)) {
      var d = !0;
      dc(r);
    } else
      d = !1;
    if (te(r, c), r.stateNode === null)
      Sr(n, r), Nv(r, l, o), Cc(r, l, o, c), o = !0;
    else if (n === null) {
      var m = r.stateNode, E = r.memoizedProps;
      m.props = E;
      var w = m.context, U = l.contextType;
      typeof U == "object" && U !== null ? U = kn(U) : (U = sn(l) ? Kr : Ve.current, U = La(r, U));
      var Q = l.getDerivedStateFromProps, W = typeof Q == "function" || typeof m.getSnapshotBeforeUpdate == "function";
      W || typeof m.UNSAFE_componentWillReceiveProps != "function" && typeof m.componentWillReceiveProps != "function" || (E !== o || w !== U) && zv(r, m, o, U), bl = !1;
      var I = r.memoizedState;
      m.state = I, kl(r, o, m, c), w = r.memoizedState, E !== o || I !== w || Tn.current || bl ? (typeof Q == "function" && (Cd(r, l, Q, o), w = r.memoizedState), (E = bl || Mv(r, l, E, o, I, w, U)) ? (W || typeof m.UNSAFE_componentWillMount != "function" && typeof m.componentWillMount != "function" || (typeof m.componentWillMount == "function" && m.componentWillMount(), typeof m.UNSAFE_componentWillMount == "function" && m.UNSAFE_componentWillMount()), typeof m.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof m.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = o, r.memoizedState = w), m.props = o, m.state = w, m.context = U, o = E) : (typeof m.componentDidMount == "function" && (r.flags |= 4194308), o = !1);
    } else {
      m = r.stateNode, jn(n, r), E = r.memoizedProps, U = r.type === r.elementType ? E : ga(r.type, E), m.props = U, W = r.pendingProps, I = m.context, w = l.contextType, typeof w == "object" && w !== null ? w = kn(w) : (w = sn(l) ? Kr : Ve.current, w = La(r, w));
      var oe = l.getDerivedStateFromProps;
      (Q = typeof oe == "function" || typeof m.getSnapshotBeforeUpdate == "function") || typeof m.UNSAFE_componentWillReceiveProps != "function" && typeof m.componentWillReceiveProps != "function" || (E !== W || I !== w) && zv(r, m, o, w), bl = !1, I = r.memoizedState, m.state = I, kl(r, o, m, c);
      var ge = r.memoizedState;
      E !== W || I !== ge || Tn.current || bl ? (typeof oe == "function" && (Cd(r, l, oe, o), ge = r.memoizedState), (U = bl || Mv(r, l, U, o, I, ge, w) || !1) ? (Q || typeof m.UNSAFE_componentWillUpdate != "function" && typeof m.componentWillUpdate != "function" || (typeof m.componentWillUpdate == "function" && m.componentWillUpdate(o, ge, w), typeof m.UNSAFE_componentWillUpdate == "function" && m.UNSAFE_componentWillUpdate(o, ge, w)), typeof m.componentDidUpdate == "function" && (r.flags |= 4), typeof m.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof m.componentDidUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 4), typeof m.getSnapshotBeforeUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 1024), r.memoizedProps = o, r.memoizedState = ge), m.props = o, m.state = ge, m.context = w, o = U) : (typeof m.componentDidUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 4), typeof m.getSnapshotBeforeUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 1024), o = !1);
    }
    return Vv(n, r, l, o, d, c);
  }
  function Vv(n, r, l, o, c, d) {
    Ze(n, r);
    var m = (r.flags & 128) !== 0;
    if (!o && !m)
      return c && _v(r, l, !1), ir(n, r, d);
    o = r.stateNode, ay.current = r;
    var E = m && typeof l.getDerivedStateFromError != "function" ? null : o.render();
    return r.flags |= 1, n !== null && m ? (r.child = uo(r, n.child, null, d), r.child = uo(r, null, E, d)) : Pn(n, r, E, d), r.memoizedState = o.state, c && _v(r, l, !0), r.child;
  }
  function Bv(n) {
    var r = n.stateNode;
    r.pendingContext ? Tl(n, r.pendingContext, r.pendingContext !== r.context) : r.context && Tl(n, r.context, !1), Rd(n, r.containerInfo);
  }
  function $c(n, r, l, o, c) {
    return yn(), hd(c), r.flags |= 256, Pn(n, r, l, o), r.child;
  }
  var yu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function kd(n) {
    return { baseLanes: n, cachePool: null, transitions: null };
  }
  function Od(n, r, l) {
    var o = r.pendingProps, c = ze.current, d = !1, m = (r.flags & 128) !== 0, E;
    if ((E = m) || (E = n !== null && n.memoizedState === null ? !1 : (c & 2) !== 0), E ? (d = !0, r.flags &= -129) : (n === null || n.memoizedState !== null) && (c |= 1), jt(ze, c & 1), n === null)
      return hc(r), n = r.memoizedState, n !== null && (n = n.dehydrated, n !== null) ? ((r.mode & 1) === 0 ? r.lanes = 1 : n.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824, null) : (m = o.children, n = o.fallback, d ? (o = r.mode, d = r.child, m = { mode: "hidden", children: m }, (o & 1) === 0 && d !== null ? (d.childLanes = 0, d.pendingProps = m) : d = ks(m, o, 0, null), n = xu(n, o, l, null), d.return = r, n.return = r, d.sibling = n, r.child = d, r.child.memoizedState = kd(l), r.memoizedState = yu, n) : Ld(r, m));
    if (c = n.memoizedState, c !== null && (E = c.dehydrated, E !== null))
      return iy(n, r, m, o, E, c, l);
    if (d) {
      d = o.fallback, m = r.mode, c = n.child, E = c.sibling;
      var w = { mode: "hidden", children: o.children };
      return (m & 1) === 0 && r.child !== c ? (o = r.child, o.childLanes = 0, o.pendingProps = w, r.deletions = null) : (o = Fl(c, w), o.subtreeFlags = c.subtreeFlags & 14680064), E !== null ? d = Fl(E, d) : (d = xu(d, m, l, null), d.flags |= 2), d.return = r, o.return = r, o.sibling = d, r.child = o, o = d, d = r.child, m = n.child.memoizedState, m = m === null ? kd(l) : { baseLanes: m.baseLanes | l, cachePool: null, transitions: m.transitions }, d.memoizedState = m, d.childLanes = n.childLanes & ~l, r.memoizedState = yu, o;
    }
    return d = n.child, n = d.sibling, o = Fl(d, { mode: "visible", children: o.children }), (r.mode & 1) === 0 && (o.lanes = l), o.return = r, o.sibling = null, n !== null && (l = r.deletions, l === null ? (r.deletions = [n], r.flags |= 16) : l.push(n)), r.child = o, r.memoizedState = null, o;
  }
  function Ld(n, r) {
    return r = ks({ mode: "visible", children: r }, n.mode, 0, null), r.return = n, n.child = r;
  }
  function ho(n, r, l, o) {
    return o !== null && hd(o), uo(r, n.child, null, l), n = Ld(r, r.pendingProps.children), n.flags |= 2, r.memoizedState = null, n;
  }
  function iy(n, r, l, o, c, d, m) {
    if (l)
      return r.flags & 256 ? (r.flags &= -257, o = gs(Error(A(422))), ho(n, r, m, o)) : r.memoizedState !== null ? (r.child = n.child, r.flags |= 128, null) : (d = o.fallback, c = r.mode, o = ks({ mode: "visible", children: o.children }, c, 0, null), d = xu(d, c, m, null), d.flags |= 2, o.return = r, d.return = r, o.sibling = d, r.child = o, (r.mode & 1) !== 0 && uo(r, n.child, null, m), r.child.memoizedState = kd(m), r.memoizedState = yu, d);
    if ((r.mode & 1) === 0)
      return ho(n, r, m, null);
    if (c.data === "$!") {
      if (o = c.nextSibling && c.nextSibling.dataset, o)
        var E = o.dgst;
      return o = E, d = Error(A(419)), o = gs(d, o, void 0), ho(n, r, m, o);
    }
    if (E = (m & n.childLanes) !== 0, zn || E) {
      if (o = Sn, o !== null) {
        switch (m & -m) {
          case 4:
            c = 2;
            break;
          case 16:
            c = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            c = 32;
            break;
          case 536870912:
            c = 268435456;
            break;
          default:
            c = 0;
        }
        c = (c & (o.suspendedLanes | m)) !== 0 ? 0 : c, c !== 0 && c !== d.retryLane && (d.retryLane = c, Pi(n, c), Tr(o, n, c, -1));
      }
      return $d(), o = gs(Error(A(421))), ho(n, r, m, o);
    }
    return c.data === "$?" ? (r.flags |= 128, r.child = n.child, r = fy.bind(null, n), c._reactRetry = r, null) : (n = d.treeContext, ta = ti(c.nextSibling), ya = r, an = !0, za = null, n !== null && (ea[gr++] = rr, ea[gr++] = ji, ea[gr++] = Na, rr = n.id, ji = n.overflow, Na = r), r = Ld(r, o.children), r.flags |= 4096, r);
  }
  function Md(n, r, l) {
    n.lanes |= r;
    var o = n.alternate;
    o !== null && (o.lanes |= r), Xn(n.return, r, l);
  }
  function Yc(n, r, l, o, c) {
    var d = n.memoizedState;
    d === null ? n.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: o, tail: l, tailMode: c } : (d.isBackwards = r, d.rendering = null, d.renderingStartTime = 0, d.last = o, d.tail = l, d.tailMode = c);
  }
  function Nd(n, r, l) {
    var o = r.pendingProps, c = o.revealOrder, d = o.tail;
    if (Pn(n, r, o.children, l), o = ze.current, (o & 2) !== 0)
      o = o & 1 | 2, r.flags |= 128;
    else {
      if (n !== null && (n.flags & 128) !== 0)
        e:
          for (n = r.child; n !== null; ) {
            if (n.tag === 13)
              n.memoizedState !== null && Md(n, l, r);
            else if (n.tag === 19)
              Md(n, l, r);
            else if (n.child !== null) {
              n.child.return = n, n = n.child;
              continue;
            }
            if (n === r)
              break e;
            for (; n.sibling === null; ) {
              if (n.return === null || n.return === r)
                break e;
              n = n.return;
            }
            n.sibling.return = n.return, n = n.sibling;
          }
      o &= 1;
    }
    if (jt(ze, o), (r.mode & 1) === 0)
      r.memoizedState = null;
    else
      switch (c) {
        case "forwards":
          for (l = r.child, c = null; l !== null; )
            n = l.alternate, n !== null && gn(n) === null && (c = l), l = l.sibling;
          l = c, l === null ? (c = r.child, r.child = null) : (c = l.sibling, l.sibling = null), Yc(r, !1, c, l, d);
          break;
        case "backwards":
          for (l = null, c = r.child, r.child = null; c !== null; ) {
            if (n = c.alternate, n !== null && gn(n) === null) {
              r.child = c;
              break;
            }
            n = c.sibling, c.sibling = l, l = c, c = n;
          }
          Yc(r, !0, l, null, d);
          break;
        case "together":
          Yc(r, !1, null, null, void 0);
          break;
        default:
          r.memoizedState = null;
      }
    return r.child;
  }
  function Sr(n, r) {
    (r.mode & 1) === 0 && n !== null && (n.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function ir(n, r, l) {
    if (n !== null && (r.dependencies = n.dependencies), Ii |= r.lanes, (l & r.childLanes) === 0)
      return null;
    if (n !== null && r.child !== n.child)
      throw Error(A(153));
    if (r.child !== null) {
      for (n = r.child, l = Fl(n, n.pendingProps), r.child = l, l.return = r; n.sibling !== null; )
        n = n.sibling, l = l.sibling = Fl(n, n.pendingProps), l.return = r;
      l.sibling = null;
    }
    return r.child;
  }
  function $i(n, r, l) {
    switch (r.tag) {
      case 3:
        Bv(r), yn();
        break;
      case 5:
        Me(r);
        break;
      case 1:
        sn(r.type) && dc(r);
        break;
      case 4:
        Rd(r, r.stateNode.containerInfo);
        break;
      case 10:
        var o = r.type._context, c = r.memoizedProps.value;
        jt(yi, o._currentValue), o._currentValue = c;
        break;
      case 13:
        if (o = r.memoizedState, o !== null)
          return o.dehydrated !== null ? (jt(ze, ze.current & 1), r.flags |= 128, null) : (l & r.child.childLanes) !== 0 ? Od(n, r, l) : (jt(ze, ze.current & 1), n = ir(n, r, l), n !== null ? n.sibling : null);
        jt(ze, ze.current & 1);
        break;
      case 19:
        if (o = (l & r.childLanes) !== 0, (n.flags & 128) !== 0) {
          if (o)
            return Nd(n, r, l);
          r.flags |= 128;
        }
        if (c = r.memoizedState, c !== null && (c.rendering = null, c.tail = null, c.lastEffect = null), jt(ze, ze.current), o)
          break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, mu(n, r, l);
    }
    return ir(n, r, l);
  }
  var Es, gu, Fa, Vn;
  Es = function(n, r) {
    for (var l = r.child; l !== null; ) {
      if (l.tag === 5 || l.tag === 6)
        n.appendChild(l.stateNode);
      else if (l.tag !== 4 && l.child !== null) {
        l.child.return = l, l = l.child;
        continue;
      }
      if (l === r)
        break;
      for (; l.sibling === null; ) {
        if (l.return === null || l.return === r)
          return;
        l = l.return;
      }
      l.sibling.return = l.return, l = l.sibling;
    }
  }, gu = function() {
  }, Fa = function(n, r, l, o) {
    var c = n.memoizedProps;
    if (c !== o) {
      n = r.stateNode, ou(ni.current);
      var d = null;
      switch (l) {
        case "input":
          c = In(n, c), o = In(n, o), d = [];
          break;
        case "select":
          c = T({}, c, { value: void 0 }), o = T({}, o, { value: void 0 }), d = [];
          break;
        case "textarea":
          c = Ir(n, c), o = Ir(n, o), d = [];
          break;
        default:
          typeof c.onClick != "function" && typeof o.onClick == "function" && (n.onclick = fc);
      }
      Dn(l, o);
      var m;
      l = null;
      for (U in c)
        if (!o.hasOwnProperty(U) && c.hasOwnProperty(U) && c[U] != null)
          if (U === "style") {
            var E = c[U];
            for (m in E)
              E.hasOwnProperty(m) && (l || (l = {}), l[m] = "");
          } else
            U !== "dangerouslySetInnerHTML" && U !== "children" && U !== "suppressContentEditableWarning" && U !== "suppressHydrationWarning" && U !== "autoFocus" && (Yt.hasOwnProperty(U) ? d || (d = []) : (d = d || []).push(U, null));
      for (U in o) {
        var w = o[U];
        if (E = c != null ? c[U] : void 0, o.hasOwnProperty(U) && w !== E && (w != null || E != null))
          if (U === "style")
            if (E) {
              for (m in E)
                !E.hasOwnProperty(m) || w && w.hasOwnProperty(m) || (l || (l = {}), l[m] = "");
              for (m in w)
                w.hasOwnProperty(m) && E[m] !== w[m] && (l || (l = {}), l[m] = w[m]);
            } else
              l || (d || (d = []), d.push(
                U,
                l
              )), l = w;
          else
            U === "dangerouslySetInnerHTML" ? (w = w ? w.__html : void 0, E = E ? E.__html : void 0, w != null && E !== w && (d = d || []).push(U, w)) : U === "children" ? typeof w != "string" && typeof w != "number" || (d = d || []).push(U, "" + w) : U !== "suppressContentEditableWarning" && U !== "suppressHydrationWarning" && (Yt.hasOwnProperty(U) ? (w != null && U === "onScroll" && Kt("scroll", n), d || E === w || (d = [])) : (d = d || []).push(U, w));
      }
      l && (d = d || []).push("style", l);
      var U = d;
      (r.updateQueue = U) && (r.flags |= 4);
    }
  }, Vn = function(n, r, l, o) {
    l !== o && (r.flags |= 4);
  };
  function Cs(n, r) {
    if (!an)
      switch (n.tailMode) {
        case "hidden":
          r = n.tail;
          for (var l = null; r !== null; )
            r.alternate !== null && (l = r), r = r.sibling;
          l === null ? n.tail = null : l.sibling = null;
          break;
        case "collapsed":
          l = n.tail;
          for (var o = null; l !== null; )
            l.alternate !== null && (o = l), l = l.sibling;
          o === null ? r || n.tail === null ? n.tail = null : n.tail.sibling = null : o.sibling = null;
      }
  }
  function Er(n) {
    var r = n.alternate !== null && n.alternate.child === n.child, l = 0, o = 0;
    if (r)
      for (var c = n.child; c !== null; )
        l |= c.lanes | c.childLanes, o |= c.subtreeFlags & 14680064, o |= c.flags & 14680064, c.return = n, c = c.sibling;
    else
      for (c = n.child; c !== null; )
        l |= c.lanes | c.childLanes, o |= c.subtreeFlags, o |= c.flags, c.return = n, c = c.sibling;
    return n.subtreeFlags |= o, n.childLanes = l, r;
  }
  function ly(n, r, l) {
    var o = r.pendingProps;
    switch (pd(r), r.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Er(r), null;
      case 1:
        return sn(r.type) && Ma(), Er(r), null;
      case 3:
        return o = r.stateNode, Ol(), Mt(Tn), Mt(Ve), Tc(), o.pendingContext && (o.context = o.pendingContext, o.pendingContext = null), (n === null || n.child === null) && (mc(r) ? r.flags |= 4 : n === null || n.memoizedState.isDehydrated && (r.flags & 256) === 0 || (r.flags |= 1024, za !== null && (Ds(za), za = null))), gu(n, r), Er(r), null;
      case 5:
        ot(r);
        var c = ou(oo.current);
        if (l = r.type, n !== null && r.stateNode != null)
          Fa(n, r, l, o, c), n.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!o) {
            if (r.stateNode === null)
              throw Error(A(166));
            return Er(r), null;
          }
          if (n = ou(ni.current), mc(r)) {
            o = r.stateNode, l = r.type;
            var d = r.memoizedProps;
            switch (o[hi] = r, o[iu] = d, n = (r.mode & 1) !== 0, l) {
              case "dialog":
                Kt("cancel", o), Kt("close", o);
                break;
              case "iframe":
              case "object":
              case "embed":
                Kt("load", o);
                break;
              case "video":
              case "audio":
                for (c = 0; c < as.length; c++)
                  Kt(as[c], o);
                break;
              case "source":
                Kt("error", o);
                break;
              case "img":
              case "image":
              case "link":
                Kt(
                  "error",
                  o
                ), Kt("load", o);
                break;
              case "details":
                Kt("toggle", o);
                break;
              case "input":
                Fn(o, d), Kt("invalid", o);
                break;
              case "select":
                o._wrapperState = { wasMultiple: !!d.multiple }, Kt("invalid", o);
                break;
              case "textarea":
                mr(o, d), Kt("invalid", o);
            }
            Dn(l, d), c = null;
            for (var m in d)
              if (d.hasOwnProperty(m)) {
                var E = d[m];
                m === "children" ? typeof E == "string" ? o.textContent !== E && (d.suppressHydrationWarning !== !0 && cc(o.textContent, E, n), c = ["children", E]) : typeof E == "number" && o.textContent !== "" + E && (d.suppressHydrationWarning !== !0 && cc(
                  o.textContent,
                  E,
                  n
                ), c = ["children", "" + E]) : Yt.hasOwnProperty(m) && E != null && m === "onScroll" && Kt("scroll", o);
              }
            switch (l) {
              case "input":
                vr(o), $r(o, d, !0);
                break;
              case "textarea":
                vr(o), tr(o);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof d.onClick == "function" && (o.onclick = fc);
            }
            o = c, r.updateQueue = o, o !== null && (r.flags |= 4);
          } else {
            m = c.nodeType === 9 ? c : c.ownerDocument, n === "http://www.w3.org/1999/xhtml" && (n = Qr(l)), n === "http://www.w3.org/1999/xhtml" ? l === "script" ? (n = m.createElement("div"), n.innerHTML = "<script><\/script>", n = n.removeChild(n.firstChild)) : typeof o.is == "string" ? n = m.createElement(l, { is: o.is }) : (n = m.createElement(l), l === "select" && (m = n, o.multiple ? m.multiple = !0 : o.size && (m.size = o.size))) : n = m.createElementNS(n, l), n[hi] = r, n[iu] = o, Es(n, r, !1, !1), r.stateNode = n;
            e: {
              switch (m = hn(l, o), l) {
                case "dialog":
                  Kt("cancel", n), Kt("close", n), c = o;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Kt("load", n), c = o;
                  break;
                case "video":
                case "audio":
                  for (c = 0; c < as.length; c++)
                    Kt(as[c], n);
                  c = o;
                  break;
                case "source":
                  Kt("error", n), c = o;
                  break;
                case "img":
                case "image":
                case "link":
                  Kt(
                    "error",
                    n
                  ), Kt("load", n), c = o;
                  break;
                case "details":
                  Kt("toggle", n), c = o;
                  break;
                case "input":
                  Fn(n, o), c = In(n, o), Kt("invalid", n);
                  break;
                case "option":
                  c = o;
                  break;
                case "select":
                  n._wrapperState = { wasMultiple: !!o.multiple }, c = T({}, o, { value: void 0 }), Kt("invalid", n);
                  break;
                case "textarea":
                  mr(n, o), c = Ir(n, o), Kt("invalid", n);
                  break;
                default:
                  c = o;
              }
              Dn(l, c), E = c;
              for (d in E)
                if (E.hasOwnProperty(d)) {
                  var w = E[d];
                  d === "style" ? Lt(n, w) : d === "dangerouslySetInnerHTML" ? (w = w ? w.__html : void 0, w != null && ui(n, w)) : d === "children" ? typeof w == "string" ? (l !== "textarea" || w !== "") && fa(n, w) : typeof w == "number" && fa(n, "" + w) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (Yt.hasOwnProperty(d) ? w != null && d === "onScroll" && Kt("scroll", n) : w != null && Qe(n, d, w, m));
                }
              switch (l) {
                case "input":
                  vr(n), $r(n, o, !1);
                  break;
                case "textarea":
                  vr(n), tr(n);
                  break;
                case "option":
                  o.value != null && n.setAttribute("value", "" + tt(o.value));
                  break;
                case "select":
                  n.multiple = !!o.multiple, d = o.value, d != null ? hr(n, !!o.multiple, d, !1) : o.defaultValue != null && hr(
                    n,
                    !!o.multiple,
                    o.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof c.onClick == "function" && (n.onclick = fc);
              }
              switch (l) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  o = !!o.autoFocus;
                  break e;
                case "img":
                  o = !0;
                  break e;
                default:
                  o = !1;
              }
            }
            o && (r.flags |= 4);
          }
          r.ref !== null && (r.flags |= 512, r.flags |= 2097152);
        }
        return Er(r), null;
      case 6:
        if (n && r.stateNode != null)
          Vn(n, r, n.memoizedProps, o);
        else {
          if (typeof o != "string" && r.stateNode === null)
            throw Error(A(166));
          if (l = ou(oo.current), ou(ni.current), mc(r)) {
            if (o = r.stateNode, l = r.memoizedProps, o[hi] = r, (d = o.nodeValue !== l) && (n = ya, n !== null))
              switch (n.tag) {
                case 3:
                  cc(o.nodeValue, l, (n.mode & 1) !== 0);
                  break;
                case 5:
                  n.memoizedProps.suppressHydrationWarning !== !0 && cc(o.nodeValue, l, (n.mode & 1) !== 0);
              }
            d && (r.flags |= 4);
          } else
            o = (l.nodeType === 9 ? l : l.ownerDocument).createTextNode(o), o[hi] = r, r.stateNode = o;
        }
        return Er(r), null;
      case 13:
        if (Mt(ze), o = r.memoizedState, n === null || n.memoizedState !== null && n.memoizedState.dehydrated !== null) {
          if (an && ta !== null && (r.mode & 1) !== 0 && (r.flags & 128) === 0)
            kv(), yn(), r.flags |= 98560, d = !1;
          else if (d = mc(r), o !== null && o.dehydrated !== null) {
            if (n === null) {
              if (!d)
                throw Error(A(318));
              if (d = r.memoizedState, d = d !== null ? d.dehydrated : null, !d)
                throw Error(A(317));
              d[hi] = r;
            } else
              yn(), (r.flags & 128) === 0 && (r.memoizedState = null), r.flags |= 4;
            Er(r), d = !1;
          } else
            za !== null && (Ds(za), za = null), d = !0;
          if (!d)
            return r.flags & 65536 ? r : null;
        }
        return (r.flags & 128) !== 0 ? (r.lanes = l, r) : (o = o !== null, o !== (n !== null && n.memoizedState !== null) && o && (r.child.flags |= 8192, (r.mode & 1) !== 0 && (n === null || (ze.current & 1) !== 0 ? $n === 0 && ($n = 3) : $d())), r.updateQueue !== null && (r.flags |= 4), Er(r), null);
      case 4:
        return Ol(), gu(n, r), n === null && ro(r.stateNode.containerInfo), Er(r), null;
      case 10:
        return _l(r.type._context), Er(r), null;
      case 17:
        return sn(r.type) && Ma(), Er(r), null;
      case 19:
        if (Mt(ze), d = r.memoizedState, d === null)
          return Er(r), null;
        if (o = (r.flags & 128) !== 0, m = d.rendering, m === null)
          if (o)
            Cs(d, !1);
          else {
            if ($n !== 0 || n !== null && (n.flags & 128) !== 0)
              for (n = r.child; n !== null; ) {
                if (m = gn(n), m !== null) {
                  for (r.flags |= 128, Cs(d, !1), o = m.updateQueue, o !== null && (r.updateQueue = o, r.flags |= 4), r.subtreeFlags = 0, o = l, l = r.child; l !== null; )
                    d = l, n = o, d.flags &= 14680066, m = d.alternate, m === null ? (d.childLanes = 0, d.lanes = n, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = m.childLanes, d.lanes = m.lanes, d.child = m.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = m.memoizedProps, d.memoizedState = m.memoizedState, d.updateQueue = m.updateQueue, d.type = m.type, n = m.dependencies, d.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }), l = l.sibling;
                  return jt(ze, ze.current & 1 | 2), r.child;
                }
                n = n.sibling;
              }
            d.tail !== null && Tt() > Ro && (r.flags |= 128, o = !0, Cs(d, !1), r.lanes = 4194304);
          }
        else {
          if (!o)
            if (n = gn(m), n !== null) {
              if (r.flags |= 128, o = !0, l = n.updateQueue, l !== null && (r.updateQueue = l, r.flags |= 4), Cs(d, !0), d.tail === null && d.tailMode === "hidden" && !m.alternate && !an)
                return Er(r), null;
            } else
              2 * Tt() - d.renderingStartTime > Ro && l !== 1073741824 && (r.flags |= 128, o = !0, Cs(d, !1), r.lanes = 4194304);
          d.isBackwards ? (m.sibling = r.child, r.child = m) : (l = d.last, l !== null ? l.sibling = m : r.child = m, d.last = m);
        }
        return d.tail !== null ? (r = d.tail, d.rendering = r, d.tail = r.sibling, d.renderingStartTime = Tt(), r.sibling = null, l = ze.current, jt(ze, o ? l & 1 | 2 : l & 1), r) : (Er(r), null);
      case 22:
      case 23:
        return Bd(), o = r.memoizedState !== null, n !== null && n.memoizedState !== null !== o && (r.flags |= 8192), o && (r.mode & 1) !== 0 ? (Ea & 1073741824) !== 0 && (Er(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : Er(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(A(156, r.tag));
  }
  function zd(n, r) {
    switch (pd(r), r.tag) {
      case 1:
        return sn(r.type) && Ma(), n = r.flags, n & 65536 ? (r.flags = n & -65537 | 128, r) : null;
      case 3:
        return Ol(), Mt(Tn), Mt(Ve), Tc(), n = r.flags, (n & 65536) !== 0 && (n & 128) === 0 ? (r.flags = n & -65537 | 128, r) : null;
      case 5:
        return ot(r), null;
      case 13:
        if (Mt(ze), n = r.memoizedState, n !== null && n.dehydrated !== null) {
          if (r.alternate === null)
            throw Error(A(340));
          yn();
        }
        return n = r.flags, n & 65536 ? (r.flags = n & -65537 | 128, r) : null;
      case 19:
        return Mt(ze), null;
      case 4:
        return Ol(), null;
      case 10:
        return _l(r.type._context), null;
      case 22:
      case 23:
        return Bd(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Rs = !1, Bn = !1, $v = typeof WeakSet == "function" ? WeakSet : Set, ve = null;
  function mo(n, r) {
    var l = n.ref;
    if (l !== null)
      if (typeof l == "function")
        try {
          l(null);
        } catch (o) {
          xn(n, r, o);
        }
      else
        l.current = null;
  }
  function Ts(n, r, l) {
    try {
      l();
    } catch (o) {
      xn(n, r, o);
    }
  }
  var Yv = !1;
  function Iv(n, r) {
    if (id = Da, n = ic(), Ui(n)) {
      if ("selectionStart" in n)
        var l = { start: n.selectionStart, end: n.selectionEnd };
      else
        e: {
          l = (l = n.ownerDocument) && l.defaultView || window;
          var o = l.getSelection && l.getSelection();
          if (o && o.rangeCount !== 0) {
            l = o.anchorNode;
            var c = o.anchorOffset, d = o.focusNode;
            o = o.focusOffset;
            try {
              l.nodeType, d.nodeType;
            } catch {
              l = null;
              break e;
            }
            var m = 0, E = -1, w = -1, U = 0, Q = 0, W = n, I = null;
            t:
              for (; ; ) {
                for (var oe; W !== l || c !== 0 && W.nodeType !== 3 || (E = m + c), W !== d || o !== 0 && W.nodeType !== 3 || (w = m + o), W.nodeType === 3 && (m += W.nodeValue.length), (oe = W.firstChild) !== null; )
                  I = W, W = oe;
                for (; ; ) {
                  if (W === n)
                    break t;
                  if (I === l && ++U === c && (E = m), I === d && ++Q === o && (w = m), (oe = W.nextSibling) !== null)
                    break;
                  W = I, I = W.parentNode;
                }
                W = oe;
              }
            l = E === -1 || w === -1 ? null : { start: E, end: w };
          } else
            l = null;
        }
      l = l || { start: 0, end: 0 };
    } else
      l = null;
    for (ru = { focusedElem: n, selectionRange: l }, Da = !1, ve = r; ve !== null; )
      if (r = ve, n = r.child, (r.subtreeFlags & 1028) !== 0 && n !== null)
        n.return = r, ve = n;
      else
        for (; ve !== null; ) {
          r = ve;
          try {
            var ge = r.alternate;
            if ((r.flags & 1024) !== 0)
              switch (r.tag) {
                case 0:
                case 11:
                case 15:
                  break;
                case 1:
                  if (ge !== null) {
                    var Ce = ge.memoizedProps, On = ge.memoizedState, D = r.stateNode, _ = D.getSnapshotBeforeUpdate(r.elementType === r.type ? Ce : ga(r.type, Ce), On);
                    D.__reactInternalSnapshotBeforeUpdate = _;
                  }
                  break;
                case 3:
                  var L = r.stateNode.containerInfo;
                  L.nodeType === 1 ? L.textContent = "" : L.nodeType === 9 && L.documentElement && L.removeChild(L.documentElement);
                  break;
                case 5:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  throw Error(A(163));
              }
          } catch (K) {
            xn(r, r.return, K);
          }
          if (n = r.sibling, n !== null) {
            n.return = r.return, ve = n;
            break;
          }
          ve = r.return;
        }
    return ge = Yv, Yv = !1, ge;
  }
  function ws(n, r, l) {
    var o = r.updateQueue;
    if (o = o !== null ? o.lastEffect : null, o !== null) {
      var c = o = o.next;
      do {
        if ((c.tag & n) === n) {
          var d = c.destroy;
          c.destroy = void 0, d !== void 0 && Ts(r, l, d);
        }
        c = c.next;
      } while (c !== o);
    }
  }
  function xs(n, r) {
    if (r = r.updateQueue, r = r !== null ? r.lastEffect : null, r !== null) {
      var l = r = r.next;
      do {
        if ((l.tag & n) === n) {
          var o = l.create;
          l.destroy = o();
        }
        l = l.next;
      } while (l !== r);
    }
  }
  function Ud(n) {
    var r = n.ref;
    if (r !== null) {
      var l = n.stateNode;
      switch (n.tag) {
        case 5:
          n = l;
          break;
        default:
          n = l;
      }
      typeof r == "function" ? r(n) : r.current = n;
    }
  }
  function Ad(n) {
    var r = n.alternate;
    r !== null && (n.alternate = null, Ad(r)), n.child = null, n.deletions = null, n.sibling = null, n.tag === 5 && (r = n.stateNode, r !== null && (delete r[hi], delete r[iu], delete r[od], delete r[Jm], delete r[sd])), n.stateNode = null, n.return = null, n.dependencies = null, n.memoizedProps = null, n.memoizedState = null, n.pendingProps = null, n.stateNode = null, n.updateQueue = null;
  }
  function Qv(n) {
    return n.tag === 5 || n.tag === 3 || n.tag === 4;
  }
  function Ic(n) {
    e:
      for (; ; ) {
        for (; n.sibling === null; ) {
          if (n.return === null || Qv(n.return))
            return null;
          n = n.return;
        }
        for (n.sibling.return = n.return, n = n.sibling; n.tag !== 5 && n.tag !== 6 && n.tag !== 18; ) {
          if (n.flags & 2 || n.child === null || n.tag === 4)
            continue e;
          n.child.return = n, n = n.child;
        }
        if (!(n.flags & 2))
          return n.stateNode;
      }
  }
  function yo(n, r, l) {
    var o = n.tag;
    if (o === 5 || o === 6)
      n = n.stateNode, r ? l.nodeType === 8 ? l.parentNode.insertBefore(n, r) : l.insertBefore(n, r) : (l.nodeType === 8 ? (r = l.parentNode, r.insertBefore(n, l)) : (r = l, r.appendChild(n)), l = l._reactRootContainer, l != null || r.onclick !== null || (r.onclick = fc));
    else if (o !== 4 && (n = n.child, n !== null))
      for (yo(n, r, l), n = n.sibling; n !== null; )
        yo(n, r, l), n = n.sibling;
  }
  function Si(n, r, l) {
    var o = n.tag;
    if (o === 5 || o === 6)
      n = n.stateNode, r ? l.insertBefore(n, r) : l.appendChild(n);
    else if (o !== 4 && (n = n.child, n !== null))
      for (Si(n, r, l), n = n.sibling; n !== null; )
        Si(n, r, l), n = n.sibling;
  }
  var cn = null, Kn = !1;
  function Ha(n, r, l) {
    for (l = l.child; l !== null; )
      go(n, r, l), l = l.sibling;
  }
  function go(n, r, l) {
    if (Wr && typeof Wr.onCommitFiberUnmount == "function")
      try {
        Wr.onCommitFiberUnmount(ol, l);
      } catch {
      }
    switch (l.tag) {
      case 5:
        Bn || mo(l, r);
      case 6:
        var o = cn, c = Kn;
        cn = null, Ha(n, r, l), cn = o, Kn = c, cn !== null && (Kn ? (n = cn, l = l.stateNode, n.nodeType === 8 ? n.parentNode.removeChild(l) : n.removeChild(l)) : cn.removeChild(l.stateNode));
        break;
      case 18:
        cn !== null && (Kn ? (n = cn, l = l.stateNode, n.nodeType === 8 ? El(n.parentNode, l) : n.nodeType === 1 && El(n, l), hl(n)) : El(cn, l.stateNode));
        break;
      case 4:
        o = cn, c = Kn, cn = l.stateNode.containerInfo, Kn = !0, Ha(n, r, l), cn = o, Kn = c;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!Bn && (o = l.updateQueue, o !== null && (o = o.lastEffect, o !== null))) {
          c = o = o.next;
          do {
            var d = c, m = d.destroy;
            d = d.tag, m !== void 0 && ((d & 2) !== 0 || (d & 4) !== 0) && Ts(l, r, m), c = c.next;
          } while (c !== o);
        }
        Ha(n, r, l);
        break;
      case 1:
        if (!Bn && (mo(l, r), o = l.stateNode, typeof o.componentWillUnmount == "function"))
          try {
            o.props = l.memoizedProps, o.state = l.memoizedState, o.componentWillUnmount();
          } catch (E) {
            xn(l, r, E);
          }
        Ha(n, r, l);
        break;
      case 21:
        Ha(n, r, l);
        break;
      case 22:
        l.mode & 1 ? (Bn = (o = Bn) || l.memoizedState !== null, Ha(n, r, l), Bn = o) : Ha(n, r, l);
        break;
      default:
        Ha(n, r, l);
    }
  }
  function Yi(n) {
    var r = n.updateQueue;
    if (r !== null) {
      n.updateQueue = null;
      var l = n.stateNode;
      l === null && (l = n.stateNode = new $v()), r.forEach(function(o) {
        var c = dy.bind(null, n, o);
        l.has(o) || (l.add(o), o.then(c, c));
      });
    }
  }
  function ri(n, r) {
    var l = r.deletions;
    if (l !== null)
      for (var o = 0; o < l.length; o++) {
        var c = l[o];
        try {
          var d = n, m = r, E = m;
          e:
            for (; E !== null; ) {
              switch (E.tag) {
                case 5:
                  cn = E.stateNode, Kn = !1;
                  break e;
                case 3:
                  cn = E.stateNode.containerInfo, Kn = !0;
                  break e;
                case 4:
                  cn = E.stateNode.containerInfo, Kn = !0;
                  break e;
              }
              E = E.return;
            }
          if (cn === null)
            throw Error(A(160));
          go(d, m, c), cn = null, Kn = !1;
          var w = c.alternate;
          w !== null && (w.return = null), c.return = null;
        } catch (U) {
          xn(c, r, U);
        }
      }
    if (r.subtreeFlags & 12854)
      for (r = r.child; r !== null; )
        Wv(r, n), r = r.sibling;
  }
  function Wv(n, r) {
    var l = n.alternate, o = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (ri(r, n), Ei(n), o & 4) {
          try {
            ws(3, n, n.return), xs(3, n);
          } catch (Ce) {
            xn(n, n.return, Ce);
          }
          try {
            ws(5, n, n.return);
          } catch (Ce) {
            xn(n, n.return, Ce);
          }
        }
        break;
      case 1:
        ri(r, n), Ei(n), o & 512 && l !== null && mo(l, l.return);
        break;
      case 5:
        if (ri(r, n), Ei(n), o & 512 && l !== null && mo(l, l.return), n.flags & 32) {
          var c = n.stateNode;
          try {
            fa(c, "");
          } catch (Ce) {
            xn(n, n.return, Ce);
          }
        }
        if (o & 4 && (c = n.stateNode, c != null)) {
          var d = n.memoizedProps, m = l !== null ? l.memoizedProps : d, E = n.type, w = n.updateQueue;
          if (n.updateQueue = null, w !== null)
            try {
              E === "input" && d.type === "radio" && d.name != null && Hn(c, d), hn(E, m);
              var U = hn(E, d);
              for (m = 0; m < w.length; m += 2) {
                var Q = w[m], W = w[m + 1];
                Q === "style" ? Lt(c, W) : Q === "dangerouslySetInnerHTML" ? ui(c, W) : Q === "children" ? fa(c, W) : Qe(c, Q, W, U);
              }
              switch (E) {
                case "input":
                  bn(c, d);
                  break;
                case "textarea":
                  ca(c, d);
                  break;
                case "select":
                  var I = c._wrapperState.wasMultiple;
                  c._wrapperState.wasMultiple = !!d.multiple;
                  var oe = d.value;
                  oe != null ? hr(c, !!d.multiple, oe, !1) : I !== !!d.multiple && (d.defaultValue != null ? hr(
                    c,
                    !!d.multiple,
                    d.defaultValue,
                    !0
                  ) : hr(c, !!d.multiple, d.multiple ? [] : "", !1));
              }
              c[iu] = d;
            } catch (Ce) {
              xn(n, n.return, Ce);
            }
        }
        break;
      case 6:
        if (ri(r, n), Ei(n), o & 4) {
          if (n.stateNode === null)
            throw Error(A(162));
          c = n.stateNode, d = n.memoizedProps;
          try {
            c.nodeValue = d;
          } catch (Ce) {
            xn(n, n.return, Ce);
          }
        }
        break;
      case 3:
        if (ri(r, n), Ei(n), o & 4 && l !== null && l.memoizedState.isDehydrated)
          try {
            hl(r.containerInfo);
          } catch (Ce) {
            xn(n, n.return, Ce);
          }
        break;
      case 4:
        ri(r, n), Ei(n);
        break;
      case 13:
        ri(r, n), Ei(n), c = n.child, c.flags & 8192 && (d = c.memoizedState !== null, c.stateNode.isHidden = d, !d || c.alternate !== null && c.alternate.memoizedState !== null || (jd = Tt())), o & 4 && Yi(n);
        break;
      case 22:
        if (Q = l !== null && l.memoizedState !== null, n.mode & 1 ? (Bn = (U = Bn) || Q, ri(r, n), Bn = U) : ri(r, n), Ei(n), o & 8192) {
          if (U = n.memoizedState !== null, (n.stateNode.isHidden = U) && !Q && (n.mode & 1) !== 0)
            for (ve = n, Q = n.child; Q !== null; ) {
              for (W = ve = Q; ve !== null; ) {
                switch (I = ve, oe = I.child, I.tag) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    ws(4, I, I.return);
                    break;
                  case 1:
                    mo(I, I.return);
                    var ge = I.stateNode;
                    if (typeof ge.componentWillUnmount == "function") {
                      o = I, l = I.return;
                      try {
                        r = o, ge.props = r.memoizedProps, ge.state = r.memoizedState, ge.componentWillUnmount();
                      } catch (Ce) {
                        xn(o, l, Ce);
                      }
                    }
                    break;
                  case 5:
                    mo(I, I.return);
                    break;
                  case 22:
                    if (I.memoizedState !== null) {
                      Fd(W);
                      continue;
                    }
                }
                oe !== null ? (oe.return = I, ve = oe) : Fd(W);
              }
              Q = Q.sibling;
            }
          e:
            for (Q = null, W = n; ; ) {
              if (W.tag === 5) {
                if (Q === null) {
                  Q = W;
                  try {
                    c = W.stateNode, U ? (d = c.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none") : (E = W.stateNode, w = W.memoizedProps.style, m = w != null && w.hasOwnProperty("display") ? w.display : null, E.style.display = nt("display", m));
                  } catch (Ce) {
                    xn(n, n.return, Ce);
                  }
                }
              } else if (W.tag === 6) {
                if (Q === null)
                  try {
                    W.stateNode.nodeValue = U ? "" : W.memoizedProps;
                  } catch (Ce) {
                    xn(n, n.return, Ce);
                  }
              } else if ((W.tag !== 22 && W.tag !== 23 || W.memoizedState === null || W === n) && W.child !== null) {
                W.child.return = W, W = W.child;
                continue;
              }
              if (W === n)
                break e;
              for (; W.sibling === null; ) {
                if (W.return === null || W.return === n)
                  break e;
                Q === W && (Q = null), W = W.return;
              }
              Q === W && (Q = null), W.sibling.return = W.return, W = W.sibling;
            }
        }
        break;
      case 19:
        ri(r, n), Ei(n), o & 4 && Yi(n);
        break;
      case 21:
        break;
      default:
        ri(
          r,
          n
        ), Ei(n);
    }
  }
  function Ei(n) {
    var r = n.flags;
    if (r & 2) {
      try {
        e: {
          for (var l = n.return; l !== null; ) {
            if (Qv(l)) {
              var o = l;
              break e;
            }
            l = l.return;
          }
          throw Error(A(160));
        }
        switch (o.tag) {
          case 5:
            var c = o.stateNode;
            o.flags & 32 && (fa(c, ""), o.flags &= -33);
            var d = Ic(n);
            Si(n, d, c);
            break;
          case 3:
          case 4:
            var m = o.stateNode.containerInfo, E = Ic(n);
            yo(n, E, m);
            break;
          default:
            throw Error(A(161));
        }
      } catch (w) {
        xn(n, n.return, w);
      }
      n.flags &= -3;
    }
    r & 4096 && (n.flags &= -4097);
  }
  function Gv(n, r, l) {
    ve = n, So(n);
  }
  function So(n, r, l) {
    for (var o = (n.mode & 1) !== 0; ve !== null; ) {
      var c = ve, d = c.child;
      if (c.tag === 22 && o) {
        var m = c.memoizedState !== null || Rs;
        if (!m) {
          var E = c.alternate, w = E !== null && E.memoizedState !== null || Bn;
          E = Rs;
          var U = Bn;
          if (Rs = m, (Bn = w) && !U)
            for (ve = c; ve !== null; )
              m = ve, w = m.child, m.tag === 22 && m.memoizedState !== null ? Xv(c) : w !== null ? (w.return = m, ve = w) : Xv(c);
          for (; d !== null; )
            ve = d, So(d), d = d.sibling;
          ve = c, Rs = E, Bn = U;
        }
        qv(n);
      } else
        (c.subtreeFlags & 8772) !== 0 && d !== null ? (d.return = c, ve = d) : qv(n);
    }
  }
  function qv(n) {
    for (; ve !== null; ) {
      var r = ve;
      if ((r.flags & 8772) !== 0) {
        var l = r.alternate;
        try {
          if ((r.flags & 8772) !== 0)
            switch (r.tag) {
              case 0:
              case 11:
              case 15:
                Bn || xs(5, r);
                break;
              case 1:
                var o = r.stateNode;
                if (r.flags & 4 && !Bn)
                  if (l === null)
                    o.componentDidMount();
                  else {
                    var c = r.elementType === r.type ? l.memoizedProps : ga(r.type, l.memoizedProps);
                    o.componentDidUpdate(c, l.memoizedState, o.__reactInternalSnapshotBeforeUpdate);
                  }
                var d = r.updateQueue;
                d !== null && uu(r, d, o);
                break;
              case 3:
                var m = r.updateQueue;
                if (m !== null) {
                  if (l = null, r.child !== null)
                    switch (r.child.tag) {
                      case 5:
                        l = r.child.stateNode;
                        break;
                      case 1:
                        l = r.child.stateNode;
                    }
                  uu(r, m, l);
                }
                break;
              case 5:
                var E = r.stateNode;
                if (l === null && r.flags & 4) {
                  l = E;
                  var w = r.memoizedProps;
                  switch (r.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      w.autoFocus && l.focus();
                      break;
                    case "img":
                      w.src && (l.src = w.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (r.memoizedState === null) {
                  var U = r.alternate;
                  if (U !== null) {
                    var Q = U.memoizedState;
                    if (Q !== null) {
                      var W = Q.dehydrated;
                      W !== null && hl(W);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(A(163));
            }
          Bn || r.flags & 512 && Ud(r);
        } catch (I) {
          xn(r, r.return, I);
        }
      }
      if (r === n) {
        ve = null;
        break;
      }
      if (l = r.sibling, l !== null) {
        l.return = r.return, ve = l;
        break;
      }
      ve = r.return;
    }
  }
  function Fd(n) {
    for (; ve !== null; ) {
      var r = ve;
      if (r === n) {
        ve = null;
        break;
      }
      var l = r.sibling;
      if (l !== null) {
        l.return = r.return, ve = l;
        break;
      }
      ve = r.return;
    }
  }
  function Xv(n) {
    for (; ve !== null; ) {
      var r = ve;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var l = r.return;
            try {
              xs(4, r);
            } catch (w) {
              xn(r, l, w);
            }
            break;
          case 1:
            var o = r.stateNode;
            if (typeof o.componentDidMount == "function") {
              var c = r.return;
              try {
                o.componentDidMount();
              } catch (w) {
                xn(r, c, w);
              }
            }
            var d = r.return;
            try {
              Ud(r);
            } catch (w) {
              xn(r, d, w);
            }
            break;
          case 5:
            var m = r.return;
            try {
              Ud(r);
            } catch (w) {
              xn(r, m, w);
            }
        }
      } catch (w) {
        xn(r, r.return, w);
      }
      if (r === n) {
        ve = null;
        break;
      }
      var E = r.sibling;
      if (E !== null) {
        E.return = r.return, ve = E;
        break;
      }
      ve = r.return;
    }
  }
  var Qc = Math.ceil, _s = ct.ReactCurrentDispatcher, Hd = ct.ReactCurrentOwner, Cr = ct.ReactCurrentBatchConfig, dt = 0, Sn = null, wn = null, Zn = 0, Ea = 0, Eo = Ke(0), $n = 0, bs = null, Ii = 0, Wc = 0, Co = 0, Su = null, Lr = null, jd = 0, Ro = 1 / 0, Qi = null, Gc = !1, Eu = null, Ci = null, zl = !1, Ul = null, qc = 0, To = 0, Xc = null, Cu = -1, Ru = 0;
  function Rr() {
    return (dt & 6) !== 0 ? Tt() : Cu !== -1 ? Cu : Cu = Tt();
  }
  function Un(n) {
    return (n.mode & 1) === 0 ? 1 : (dt & 2) !== 0 && Zn !== 0 ? Zn & -Zn : yc.transition !== null ? (Ru === 0 && (Ru = $u()), Ru) : (n = Dt, n !== 0 || (n = window.event, n = n === void 0 ? 16 : qo(n.type)), n);
  }
  function Tr(n, r, l, o) {
    if (50 < To)
      throw To = 0, Xc = null, Error(A(185));
    Oi(n, l, o), ((dt & 2) === 0 || n !== Sn) && (n === Sn && ((dt & 2) === 0 && (Wc |= l), $n === 4 && ja(n, Zn)), wr(n, o), l === 1 && dt === 0 && (r.mode & 1) === 0 && (Ro = Tt() + 500, qn && Zr()));
  }
  function wr(n, r) {
    var l = n.callbackNode;
    fl(n, r);
    var o = kr(n, n === Sn ? Zn : 0);
    if (o === 0)
      l !== null && nr(l), n.callbackNode = null, n.callbackPriority = 0;
    else if (r = o & -o, n.callbackPriority !== r) {
      if (l != null && nr(l), r === 1)
        n.tag === 0 ? fd(Kv.bind(null, n)) : cd(Kv.bind(null, n)), ud(function() {
          (dt & 6) === 0 && Zr();
        }), l = null;
      else {
        switch (Iu(o)) {
          case 1:
            l = qa;
            break;
          case 4:
            l = lt;
            break;
          case 16:
            l = di;
            break;
          case 536870912:
            l = Vu;
            break;
          default:
            l = di;
        }
        l = Id(l, wo.bind(null, n));
      }
      n.callbackPriority = r, n.callbackNode = l;
    }
  }
  function wo(n, r) {
    if (Cu = -1, Ru = 0, (dt & 6) !== 0)
      throw Error(A(327));
    var l = n.callbackNode;
    if (_o() && n.callbackNode !== l)
      return null;
    var o = kr(n, n === Sn ? Zn : 0);
    if (o === 0)
      return null;
    if ((o & 30) !== 0 || (o & n.expiredLanes) !== 0 || r)
      r = Zc(n, o);
    else {
      r = o;
      var c = dt;
      dt |= 2;
      var d = Kc();
      (Sn !== n || Zn !== r) && (Qi = null, Ro = Tt() + 500, Tu(n, r));
      do
        try {
          oy();
          break;
        } catch (E) {
          Zv(n, E);
        }
      while (1);
      yd(), _s.current = d, dt = c, wn !== null ? r = 0 : (Sn = null, Zn = 0, r = $n);
    }
    if (r !== 0) {
      if (r === 2 && (c = dl(n), c !== 0 && (o = c, r = Pd(n, c))), r === 1)
        throw l = bs, Tu(n, 0), ja(n, o), wr(n, Tt()), l;
      if (r === 6)
        ja(n, o);
      else {
        if (c = n.current.alternate, (o & 30) === 0 && !Vd(c) && (r = Zc(n, o), r === 2 && (d = dl(n), d !== 0 && (o = d, r = Pd(n, d))), r === 1))
          throw l = bs, Tu(n, 0), ja(n, o), wr(n, Tt()), l;
        switch (n.finishedWork = c, n.finishedLanes = o, r) {
          case 0:
          case 1:
            throw Error(A(345));
          case 2:
            wu(n, Lr, Qi);
            break;
          case 3:
            if (ja(n, o), (o & 130023424) === o && (r = jd + 500 - Tt(), 10 < r)) {
              if (kr(n, 0) !== 0)
                break;
              if (c = n.suspendedLanes, (c & o) !== o) {
                Rr(), n.pingedLanes |= n.suspendedLanes & c;
                break;
              }
              n.timeoutHandle = au(wu.bind(null, n, Lr, Qi), r);
              break;
            }
            wu(n, Lr, Qi);
            break;
          case 4:
            if (ja(n, o), (o & 4194240) === o)
              break;
            for (r = n.eventTimes, c = -1; 0 < o; ) {
              var m = 31 - Dr(o);
              d = 1 << m, m = r[m], m > c && (c = m), o &= ~d;
            }
            if (o = c, o = Tt() - o, o = (120 > o ? 120 : 480 > o ? 480 : 1080 > o ? 1080 : 1920 > o ? 1920 : 3e3 > o ? 3e3 : 4320 > o ? 4320 : 1960 * Qc(o / 1960)) - o, 10 < o) {
              n.timeoutHandle = au(wu.bind(null, n, Lr, Qi), o);
              break;
            }
            wu(n, Lr, Qi);
            break;
          case 5:
            wu(n, Lr, Qi);
            break;
          default:
            throw Error(A(329));
        }
      }
    }
    return wr(n, Tt()), n.callbackNode === l ? wo.bind(null, n) : null;
  }
  function Pd(n, r) {
    var l = Su;
    return n.current.memoizedState.isDehydrated && (Tu(n, r).flags |= 256), n = Zc(n, r), n !== 2 && (r = Lr, Lr = l, r !== null && Ds(r)), n;
  }
  function Ds(n) {
    Lr === null ? Lr = n : Lr.push.apply(Lr, n);
  }
  function Vd(n) {
    for (var r = n; ; ) {
      if (r.flags & 16384) {
        var l = r.updateQueue;
        if (l !== null && (l = l.stores, l !== null))
          for (var o = 0; o < l.length; o++) {
            var c = l[o], d = c.getSnapshot;
            c = c.value;
            try {
              if (!ka(d(), c))
                return !1;
            } catch {
              return !1;
            }
          }
      }
      if (l = r.child, r.subtreeFlags & 16384 && l !== null)
        l.return = r, r = l;
      else {
        if (r === n)
          break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === n)
            return !0;
          r = r.return;
        }
        r.sibling.return = r.return, r = r.sibling;
      }
    }
    return !0;
  }
  function ja(n, r) {
    for (r &= ~Co, r &= ~Wc, n.suspendedLanes |= r, n.pingedLanes &= ~r, n = n.expirationTimes; 0 < r; ) {
      var l = 31 - Dr(r), o = 1 << l;
      n[l] = -1, r &= ~o;
    }
  }
  function Kv(n) {
    if ((dt & 6) !== 0)
      throw Error(A(327));
    _o();
    var r = kr(n, 0);
    if ((r & 1) === 0)
      return wr(n, Tt()), null;
    var l = Zc(n, r);
    if (n.tag !== 0 && l === 2) {
      var o = dl(n);
      o !== 0 && (r = o, l = Pd(n, o));
    }
    if (l === 1)
      throw l = bs, Tu(n, 0), ja(n, r), wr(n, Tt()), l;
    if (l === 6)
      throw Error(A(345));
    return n.finishedWork = n.current.alternate, n.finishedLanes = r, wu(n, Lr, Qi), wr(n, Tt()), null;
  }
  function xo(n, r) {
    var l = dt;
    dt |= 1;
    try {
      return n(r);
    } finally {
      dt = l, dt === 0 && (Ro = Tt() + 500, qn && Zr());
    }
  }
  function Al(n) {
    Ul !== null && Ul.tag === 0 && (dt & 6) === 0 && _o();
    var r = dt;
    dt |= 1;
    var l = Cr.transition, o = Dt;
    try {
      if (Cr.transition = null, Dt = 1, n)
        return n();
    } finally {
      Dt = o, Cr.transition = l, dt = r, (dt & 6) === 0 && Zr();
    }
  }
  function Bd() {
    Ea = Eo.current, Mt(Eo);
  }
  function Tu(n, r) {
    n.finishedWork = null, n.finishedLanes = 0;
    var l = n.timeoutHandle;
    if (l !== -1 && (n.timeoutHandle = -1, xv(l)), wn !== null)
      for (l = wn.return; l !== null; ) {
        var o = l;
        switch (pd(o), o.tag) {
          case 1:
            o = o.type.childContextTypes, o != null && Ma();
            break;
          case 3:
            Ol(), Mt(Tn), Mt(Ve), Tc();
            break;
          case 5:
            ot(o);
            break;
          case 4:
            Ol();
            break;
          case 13:
            Mt(ze);
            break;
          case 19:
            Mt(ze);
            break;
          case 10:
            _l(o.type._context);
            break;
          case 22:
          case 23:
            Bd();
        }
        l = l.return;
      }
    if (Sn = n, wn = n = Fl(n.current, null), Zn = Ea = r, $n = 0, bs = null, Co = Wc = Ii = 0, Lr = Su = null, ar !== null) {
      for (r = 0; r < ar.length; r++)
        if (l = ar[r], o = l.interleaved, o !== null) {
          l.interleaved = null;
          var c = o.next, d = l.pending;
          if (d !== null) {
            var m = d.next;
            d.next = c, o.next = m;
          }
          l.pending = o;
        }
      ar = null;
    }
    return n;
  }
  function Zv(n, r) {
    do {
      var l = wn;
      try {
        if (yd(), wc.current = Pc, Ae) {
          for (var o = ln.memoizedState; o !== null; ) {
            var c = o.queue;
            c !== null && (c.pending = null), o = o.next;
          }
          Ae = !1;
        }
        if (su = 0, yt = P = ln = null, gi = !1, Sa = 0, Hd.current = null, l === null || l.return === null) {
          $n = 1, bs = r, wn = null;
          break;
        }
        e: {
          var d = n, m = l.return, E = l, w = r;
          if (r = Zn, E.flags |= 32768, w !== null && typeof w == "object" && typeof w.then == "function") {
            var U = w, Q = E, W = Q.tag;
            if ((Q.mode & 1) === 0 && (W === 0 || W === 11 || W === 15)) {
              var I = Q.alternate;
              I ? (Q.updateQueue = I.updateQueue, Q.memoizedState = I.memoizedState, Q.lanes = I.lanes) : (Q.updateQueue = null, Q.memoizedState = null);
            }
            var oe = _d(m);
            if (oe !== null) {
              oe.flags &= -257, bd(oe, m, E, d, r), oe.mode & 1 && Pv(d, U, r), r = oe, w = U;
              var ge = r.updateQueue;
              if (ge === null) {
                var Ce = /* @__PURE__ */ new Set();
                Ce.add(w), r.updateQueue = Ce;
              } else
                ge.add(w);
              break e;
            } else {
              if ((r & 1) === 0) {
                Pv(d, U, r), $d();
                break e;
              }
              w = Error(A(426));
            }
          } else if (an && E.mode & 1) {
            var On = _d(m);
            if (On !== null) {
              (On.flags & 65536) === 0 && (On.flags |= 256), bd(On, m, E, d, r), hd(po(w, E));
              break e;
            }
          }
          d = w = po(w, E), $n !== 4 && ($n = 2), Su === null ? Su = [d] : Su.push(d), d = m;
          do {
            switch (d.tag) {
              case 3:
                d.flags |= 65536, r &= -r, d.lanes |= r;
                var D = jv(d, w, r);
                Ed(d, D);
                break e;
              case 1:
                E = w;
                var _ = d.type, L = d.stateNode;
                if ((d.flags & 128) === 0 && (typeof _.getDerivedStateFromError == "function" || L !== null && typeof L.componentDidCatch == "function" && (Ci === null || !Ci.has(L)))) {
                  d.flags |= 65536, r &= -r, d.lanes |= r;
                  var K = Ss(d, E, r);
                  Ed(d, K);
                  break e;
                }
            }
            d = d.return;
          } while (d !== null);
        }
        Yd(l);
      } catch (Re) {
        r = Re, wn === l && l !== null && (wn = l = l.return);
        continue;
      }
      break;
    } while (1);
  }
  function Kc() {
    var n = _s.current;
    return _s.current = Pc, n === null ? Pc : n;
  }
  function $d() {
    ($n === 0 || $n === 3 || $n === 2) && ($n = 4), Sn === null || (Ii & 268435455) === 0 && (Wc & 268435455) === 0 || ja(Sn, Zn);
  }
  function Zc(n, r) {
    var l = dt;
    dt |= 2;
    var o = Kc();
    (Sn !== n || Zn !== r) && (Qi = null, Tu(n, r));
    do
      try {
        uy();
        break;
      } catch (c) {
        Zv(n, c);
      }
    while (1);
    if (yd(), dt = l, _s.current = o, wn !== null)
      throw Error(A(261));
    return Sn = null, Zn = 0, $n;
  }
  function uy() {
    for (; wn !== null; )
      Jv(wn);
  }
  function oy() {
    for (; wn !== null && !fi(); )
      Jv(wn);
  }
  function Jv(n) {
    var r = th(n.alternate, n, Ea);
    n.memoizedProps = n.pendingProps, r === null ? Yd(n) : wn = r, Hd.current = null;
  }
  function Yd(n) {
    var r = n;
    do {
      var l = r.alternate;
      if (n = r.return, (r.flags & 32768) === 0) {
        if (l = ly(l, r, Ea), l !== null) {
          wn = l;
          return;
        }
      } else {
        if (l = zd(l, r), l !== null) {
          l.flags &= 32767, wn = l;
          return;
        }
        if (n !== null)
          n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null;
        else {
          $n = 6, wn = null;
          return;
        }
      }
      if (r = r.sibling, r !== null) {
        wn = r;
        return;
      }
      wn = r = n;
    } while (r !== null);
    $n === 0 && ($n = 5);
  }
  function wu(n, r, l) {
    var o = Dt, c = Cr.transition;
    try {
      Cr.transition = null, Dt = 1, sy(n, r, l, o);
    } finally {
      Cr.transition = c, Dt = o;
    }
    return null;
  }
  function sy(n, r, l, o) {
    do
      _o();
    while (Ul !== null);
    if ((dt & 6) !== 0)
      throw Error(A(327));
    l = n.finishedWork;
    var c = n.finishedLanes;
    if (l === null)
      return null;
    if (n.finishedWork = null, n.finishedLanes = 0, l === n.current)
      throw Error(A(177));
    n.callbackNode = null, n.callbackPriority = 0;
    var d = l.lanes | l.childLanes;
    if (Pf(n, d), n === Sn && (wn = Sn = null, Zn = 0), (l.subtreeFlags & 2064) === 0 && (l.flags & 2064) === 0 || zl || (zl = !0, Id(di, function() {
      return _o(), null;
    })), d = (l.flags & 15990) !== 0, (l.subtreeFlags & 15990) !== 0 || d) {
      d = Cr.transition, Cr.transition = null;
      var m = Dt;
      Dt = 1;
      var E = dt;
      dt |= 4, Hd.current = null, Iv(n, l), Wv(l, n), lc(ru), Da = !!id, ru = id = null, n.current = l, Gv(l), Pu(), dt = E, Dt = m, Cr.transition = d;
    } else
      n.current = l;
    if (zl && (zl = !1, Ul = n, qc = c), d = n.pendingLanes, d === 0 && (Ci = null), Qo(l.stateNode), wr(n, Tt()), r !== null)
      for (o = n.onRecoverableError, l = 0; l < r.length; l++)
        c = r[l], o(c.value, { componentStack: c.stack, digest: c.digest });
    if (Gc)
      throw Gc = !1, n = Eu, Eu = null, n;
    return (qc & 1) !== 0 && n.tag !== 0 && _o(), d = n.pendingLanes, (d & 1) !== 0 ? n === Xc ? To++ : (To = 0, Xc = n) : To = 0, Zr(), null;
  }
  function _o() {
    if (Ul !== null) {
      var n = Iu(qc), r = Cr.transition, l = Dt;
      try {
        if (Cr.transition = null, Dt = 16 > n ? 16 : n, Ul === null)
          var o = !1;
        else {
          if (n = Ul, Ul = null, qc = 0, (dt & 6) !== 0)
            throw Error(A(331));
          var c = dt;
          for (dt |= 4, ve = n.current; ve !== null; ) {
            var d = ve, m = d.child;
            if ((ve.flags & 16) !== 0) {
              var E = d.deletions;
              if (E !== null) {
                for (var w = 0; w < E.length; w++) {
                  var U = E[w];
                  for (ve = U; ve !== null; ) {
                    var Q = ve;
                    switch (Q.tag) {
                      case 0:
                      case 11:
                      case 15:
                        ws(8, Q, d);
                    }
                    var W = Q.child;
                    if (W !== null)
                      W.return = Q, ve = W;
                    else
                      for (; ve !== null; ) {
                        Q = ve;
                        var I = Q.sibling, oe = Q.return;
                        if (Ad(Q), Q === U) {
                          ve = null;
                          break;
                        }
                        if (I !== null) {
                          I.return = oe, ve = I;
                          break;
                        }
                        ve = oe;
                      }
                  }
                }
                var ge = d.alternate;
                if (ge !== null) {
                  var Ce = ge.child;
                  if (Ce !== null) {
                    ge.child = null;
                    do {
                      var On = Ce.sibling;
                      Ce.sibling = null, Ce = On;
                    } while (Ce !== null);
                  }
                }
                ve = d;
              }
            }
            if ((d.subtreeFlags & 2064) !== 0 && m !== null)
              m.return = d, ve = m;
            else
              e:
                for (; ve !== null; ) {
                  if (d = ve, (d.flags & 2048) !== 0)
                    switch (d.tag) {
                      case 0:
                      case 11:
                      case 15:
                        ws(9, d, d.return);
                    }
                  var D = d.sibling;
                  if (D !== null) {
                    D.return = d.return, ve = D;
                    break e;
                  }
                  ve = d.return;
                }
          }
          var _ = n.current;
          for (ve = _; ve !== null; ) {
            m = ve;
            var L = m.child;
            if ((m.subtreeFlags & 2064) !== 0 && L !== null)
              L.return = m, ve = L;
            else
              e:
                for (m = _; ve !== null; ) {
                  if (E = ve, (E.flags & 2048) !== 0)
                    try {
                      switch (E.tag) {
                        case 0:
                        case 11:
                        case 15:
                          xs(9, E);
                      }
                    } catch (Re) {
                      xn(E, E.return, Re);
                    }
                  if (E === m) {
                    ve = null;
                    break e;
                  }
                  var K = E.sibling;
                  if (K !== null) {
                    K.return = E.return, ve = K;
                    break e;
                  }
                  ve = E.return;
                }
          }
          if (dt = c, Zr(), Wr && typeof Wr.onPostCommitFiberRoot == "function")
            try {
              Wr.onPostCommitFiberRoot(ol, n);
            } catch {
            }
          o = !0;
        }
        return o;
      } finally {
        Dt = l, Cr.transition = r;
      }
    }
    return !1;
  }
  function eh(n, r, l) {
    r = po(l, r), r = jv(n, r, 1), n = Dl(n, r, 1), r = Rr(), n !== null && (Oi(n, 1, r), wr(n, r));
  }
  function xn(n, r, l) {
    if (n.tag === 3)
      eh(n, n, l);
    else
      for (; r !== null; ) {
        if (r.tag === 3) {
          eh(r, n, l);
          break;
        } else if (r.tag === 1) {
          var o = r.stateNode;
          if (typeof r.type.getDerivedStateFromError == "function" || typeof o.componentDidCatch == "function" && (Ci === null || !Ci.has(o))) {
            n = po(l, n), n = Ss(r, n, 1), r = Dl(r, n, 1), n = Rr(), r !== null && (Oi(r, 1, n), wr(r, n));
            break;
          }
        }
        r = r.return;
      }
  }
  function cy(n, r, l) {
    var o = n.pingCache;
    o !== null && o.delete(r), r = Rr(), n.pingedLanes |= n.suspendedLanes & l, Sn === n && (Zn & l) === l && ($n === 4 || $n === 3 && (Zn & 130023424) === Zn && 500 > Tt() - jd ? Tu(n, 0) : Co |= l), wr(n, r);
  }
  function Jc(n, r) {
    r === 0 && ((n.mode & 1) === 0 ? r = 1 : (r = sl, sl <<= 1, (sl & 130023424) === 0 && (sl = 4194304)));
    var l = Rr();
    n = Pi(n, r), n !== null && (Oi(n, r, l), wr(n, l));
  }
  function fy(n) {
    var r = n.memoizedState, l = 0;
    r !== null && (l = r.retryLane), Jc(n, l);
  }
  function dy(n, r) {
    var l = 0;
    switch (n.tag) {
      case 13:
        var o = n.stateNode, c = n.memoizedState;
        c !== null && (l = c.retryLane);
        break;
      case 19:
        o = n.stateNode;
        break;
      default:
        throw Error(A(314));
    }
    o !== null && o.delete(r), Jc(n, l);
  }
  var th;
  th = function(n, r, l) {
    if (n !== null)
      if (n.memoizedProps !== r.pendingProps || Tn.current)
        zn = !0;
      else {
        if ((n.lanes & l) === 0 && (r.flags & 128) === 0)
          return zn = !1, $i(n, r, l);
        zn = (n.flags & 131072) !== 0;
      }
    else
      zn = !1, an && (r.flags & 1048576) !== 0 && dd(r, io, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var o = r.type;
        Sr(n, r), n = r.pendingProps;
        var c = La(r, Ve.current);
        te(r, l), c = Ll(null, r, o, n, c, l);
        var d = du();
        return r.flags |= 1, typeof c == "object" && c !== null && typeof c.render == "function" && c.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, sn(o) ? (d = !0, dc(r)) : d = !1, r.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, Sd(r), c.updater = Ec, r.stateNode = c, c._reactInternals = r, Cc(r, o, n, l), r = Vv(null, r, o, !0, d, l)) : (r.tag = 0, an && d && pc(r), Pn(null, r, c, l), r = r.child), r;
      case 16:
        o = r.elementType;
        e: {
          switch (Sr(n, r), n = r.pendingProps, c = o._init, o = c(o._payload), r.type = o, c = r.tag = vy(o), n = ga(o, n), c) {
            case 0:
              r = vo(null, r, o, n, l);
              break e;
            case 1:
              r = Dd(null, r, o, n, l);
              break e;
            case 11:
              r = Nl(null, r, o, n, l);
              break e;
            case 14:
              r = Bc(null, r, o, ga(o.type, n), l);
              break e;
          }
          throw Error(A(
            306,
            o,
            ""
          ));
        }
        return r;
      case 0:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ga(o, c), vo(n, r, o, c, l);
      case 1:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ga(o, c), Dd(n, r, o, c, l);
      case 3:
        e: {
          if (Bv(r), n === null)
            throw Error(A(387));
          o = r.pendingProps, d = r.memoizedState, c = d.element, jn(n, r), kl(r, o, null, l);
          var m = r.memoizedState;
          if (o = m.element, d.isDehydrated)
            if (d = { element: o, isDehydrated: !1, cache: m.cache, pendingSuspenseBoundaries: m.pendingSuspenseBoundaries, transitions: m.transitions }, r.updateQueue.baseState = d, r.memoizedState = d, r.flags & 256) {
              c = po(Error(A(423)), r), r = $c(n, r, o, l, c);
              break e;
            } else if (o !== c) {
              c = po(Error(A(424)), r), r = $c(n, r, o, l, c);
              break e;
            } else
              for (ta = ti(r.stateNode.containerInfo.firstChild), ya = r, an = !0, za = null, l = Fv(r, null, o, l), r.child = l; l; )
                l.flags = l.flags & -3 | 4096, l = l.sibling;
          else {
            if (yn(), o === c) {
              r = ir(n, r, l);
              break e;
            }
            Pn(n, r, o, l);
          }
          r = r.child;
        }
        return r;
      case 5:
        return Me(r), n === null && hc(r), o = r.type, c = r.pendingProps, d = n !== null ? n.memoizedProps : null, m = c.children, us(o, c) ? m = null : d !== null && us(o, d) && (r.flags |= 32), Ze(n, r), Pn(n, r, m, l), r.child;
      case 6:
        return n === null && hc(r), null;
      case 13:
        return Od(n, r, l);
      case 4:
        return Rd(r, r.stateNode.containerInfo), o = r.pendingProps, n === null ? r.child = uo(r, null, o, l) : Pn(n, r, o, l), r.child;
      case 11:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ga(o, c), Nl(n, r, o, c, l);
      case 7:
        return Pn(n, r, r.pendingProps, l), r.child;
      case 8:
        return Pn(n, r, r.pendingProps.children, l), r.child;
      case 12:
        return Pn(n, r, r.pendingProps.children, l), r.child;
      case 10:
        e: {
          if (o = r.type._context, c = r.pendingProps, d = r.memoizedProps, m = c.value, jt(yi, o._currentValue), o._currentValue = m, d !== null)
            if (ka(d.value, m)) {
              if (d.children === c.children && !Tn.current) {
                r = ir(n, r, l);
                break e;
              }
            } else
              for (d = r.child, d !== null && (d.return = r); d !== null; ) {
                var E = d.dependencies;
                if (E !== null) {
                  m = d.child;
                  for (var w = E.firstContext; w !== null; ) {
                    if (w.context === o) {
                      if (d.tag === 1) {
                        w = Vi(-1, l & -l), w.tag = 2;
                        var U = d.updateQueue;
                        if (U !== null) {
                          U = U.shared;
                          var Q = U.pending;
                          Q === null ? w.next = w : (w.next = Q.next, Q.next = w), U.pending = w;
                        }
                      }
                      d.lanes |= l, w = d.alternate, w !== null && (w.lanes |= l), Xn(
                        d.return,
                        l,
                        r
                      ), E.lanes |= l;
                      break;
                    }
                    w = w.next;
                  }
                } else if (d.tag === 10)
                  m = d.type === r.type ? null : d.child;
                else if (d.tag === 18) {
                  if (m = d.return, m === null)
                    throw Error(A(341));
                  m.lanes |= l, E = m.alternate, E !== null && (E.lanes |= l), Xn(m, l, r), m = d.sibling;
                } else
                  m = d.child;
                if (m !== null)
                  m.return = d;
                else
                  for (m = d; m !== null; ) {
                    if (m === r) {
                      m = null;
                      break;
                    }
                    if (d = m.sibling, d !== null) {
                      d.return = m.return, m = d;
                      break;
                    }
                    m = m.return;
                  }
                d = m;
              }
          Pn(n, r, c.children, l), r = r.child;
        }
        return r;
      case 9:
        return c = r.type, o = r.pendingProps.children, te(r, l), c = kn(c), o = o(c), r.flags |= 1, Pn(n, r, o, l), r.child;
      case 14:
        return o = r.type, c = ga(o, r.pendingProps), c = ga(o.type, c), Bc(n, r, o, c, l);
      case 15:
        return aa(n, r, r.type, r.pendingProps, l);
      case 17:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ga(o, c), Sr(n, r), r.tag = 1, sn(o) ? (n = !0, dc(r)) : n = !1, te(r, l), Nv(r, o, c), Cc(r, o, c, l), Vv(null, r, o, !0, n, l);
      case 19:
        return Nd(n, r, l);
      case 22:
        return mu(n, r, l);
    }
    throw Error(A(156, r.tag));
  };
  function Id(n, r) {
    return en(n, r);
  }
  function py(n, r, l, o) {
    this.tag = n, this.key = l, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = o, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Pa(n, r, l, o) {
    return new py(n, r, l, o);
  }
  function Qd(n) {
    return n = n.prototype, !(!n || !n.isReactComponent);
  }
  function vy(n) {
    if (typeof n == "function")
      return Qd(n) ? 1 : 0;
    if (n != null) {
      if (n = n.$$typeof, n === Cn)
        return 11;
      if (n === Nt)
        return 14;
    }
    return 2;
  }
  function Fl(n, r) {
    var l = n.alternate;
    return l === null ? (l = Pa(n.tag, r, n.key, n.mode), l.elementType = n.elementType, l.type = n.type, l.stateNode = n.stateNode, l.alternate = n, n.alternate = l) : (l.pendingProps = r, l.type = n.type, l.flags = 0, l.subtreeFlags = 0, l.deletions = null), l.flags = n.flags & 14680064, l.childLanes = n.childLanes, l.lanes = n.lanes, l.child = n.child, l.memoizedProps = n.memoizedProps, l.memoizedState = n.memoizedState, l.updateQueue = n.updateQueue, r = n.dependencies, l.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, l.sibling = n.sibling, l.index = n.index, l.ref = n.ref, l;
  }
  function ef(n, r, l, o, c, d) {
    var m = 2;
    if (o = n, typeof n == "function")
      Qd(n) && (m = 1);
    else if (typeof n == "string")
      m = 5;
    else
      e:
        switch (n) {
          case He:
            return xu(l.children, c, d, r);
          case nn:
            m = 8, c |= 8;
            break;
          case _n:
            return n = Pa(12, l, r, c | 2), n.elementType = _n, n.lanes = d, n;
          case Ue:
            return n = Pa(13, l, r, c), n.elementType = Ue, n.lanes = d, n;
          case qe:
            return n = Pa(19, l, r, c), n.elementType = qe, n.lanes = d, n;
          case ye:
            return ks(l, c, d, r);
          default:
            if (typeof n == "object" && n !== null)
              switch (n.$$typeof) {
                case Qt:
                  m = 10;
                  break e;
                case bt:
                  m = 9;
                  break e;
                case Cn:
                  m = 11;
                  break e;
                case Nt:
                  m = 14;
                  break e;
                case Rt:
                  m = 16, o = null;
                  break e;
              }
            throw Error(A(130, n == null ? n : typeof n, ""));
        }
    return r = Pa(m, l, r, c), r.elementType = n, r.type = o, r.lanes = d, r;
  }
  function xu(n, r, l, o) {
    return n = Pa(7, n, o, r), n.lanes = l, n;
  }
  function ks(n, r, l, o) {
    return n = Pa(22, n, o, r), n.elementType = ye, n.lanes = l, n.stateNode = { isHidden: !1 }, n;
  }
  function Os(n, r, l) {
    return n = Pa(6, n, null, r), n.lanes = l, n;
  }
  function _u(n, r, l) {
    return r = Pa(4, n.children !== null ? n.children : [], n.key, r), r.lanes = l, r.stateNode = { containerInfo: n.containerInfo, pendingChildren: null, implementation: n.implementation }, r;
  }
  function hy(n, r, l, o, c) {
    this.tag = r, this.containerInfo = n, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Yu(0), this.expirationTimes = Yu(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Yu(0), this.identifierPrefix = o, this.onRecoverableError = c, this.mutableSourceEagerHydrationData = null;
  }
  function tf(n, r, l, o, c, d, m, E, w) {
    return n = new hy(n, r, l, E, w), r === 1 ? (r = 1, d === !0 && (r |= 8)) : r = 0, d = Pa(3, null, null, r), n.current = d, d.stateNode = n, d.memoizedState = { element: o, isDehydrated: l, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Sd(d), n;
  }
  function nh(n, r, l) {
    var o = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: it, key: o == null ? null : "" + o, children: n, containerInfo: r, implementation: l };
  }
  function Wd(n) {
    if (!n)
      return mi;
    n = n._reactInternals;
    e: {
      if (Ge(n) !== n || n.tag !== 1)
        throw Error(A(170));
      var r = n;
      do {
        switch (r.tag) {
          case 3:
            r = r.stateNode.context;
            break e;
          case 1:
            if (sn(r.type)) {
              r = r.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        r = r.return;
      } while (r !== null);
      throw Error(A(171));
    }
    if (n.tag === 1) {
      var l = n.type;
      if (sn(l))
        return cs(n, l, r);
    }
    return r;
  }
  function rh(n, r, l, o, c, d, m, E, w) {
    return n = tf(l, o, !0, n, c, d, m, E, w), n.context = Wd(null), l = n.current, o = Rr(), c = Un(l), d = Vi(o, c), d.callback = r != null ? r : null, Dl(l, d, c), n.current.lanes = c, Oi(n, c, o), wr(n, o), n;
  }
  function Ls(n, r, l, o) {
    var c = r.current, d = Rr(), m = Un(c);
    return l = Wd(l), r.context === null ? r.context = l : r.pendingContext = l, r = Vi(d, m), r.payload = { element: n }, o = o === void 0 ? null : o, o !== null && (r.callback = o), n = Dl(c, r, m), n !== null && (Tr(n, c, m, d), Sc(n, c, m)), m;
  }
  function nf(n) {
    if (n = n.current, !n.child)
      return null;
    switch (n.child.tag) {
      case 5:
        return n.child.stateNode;
      default:
        return n.child.stateNode;
    }
  }
  function ah(n, r) {
    if (n = n.memoizedState, n !== null && n.dehydrated !== null) {
      var l = n.retryLane;
      n.retryLane = l !== 0 && l < r ? l : r;
    }
  }
  function Gd(n, r) {
    ah(n, r), (n = n.alternate) && ah(n, r);
  }
  function ih() {
    return null;
  }
  var qd = typeof reportError == "function" ? reportError : function(n) {
    console.error(n);
  };
  function rf(n) {
    this._internalRoot = n;
  }
  Wi.prototype.render = rf.prototype.render = function(n) {
    var r = this._internalRoot;
    if (r === null)
      throw Error(A(409));
    Ls(n, r, null, null);
  }, Wi.prototype.unmount = rf.prototype.unmount = function() {
    var n = this._internalRoot;
    if (n !== null) {
      this._internalRoot = null;
      var r = n.containerInfo;
      Al(function() {
        Ls(null, n, null, null);
      }), r[Hi] = null;
    }
  };
  function Wi(n) {
    this._internalRoot = n;
  }
  Wi.prototype.unstable_scheduleHydration = function(n) {
    if (n) {
      var r = Wu();
      n = { blockedOn: null, target: n, priority: r };
      for (var l = 0; l < Ht.length && r !== 0 && r < Ht[l].priority; l++)
        ;
      Ht.splice(l, 0, n), l === 0 && Js(n);
    }
  };
  function Xd(n) {
    return !(!n || n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11);
  }
  function af(n) {
    return !(!n || n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11 && (n.nodeType !== 8 || n.nodeValue !== " react-mount-point-unstable "));
  }
  function lh() {
  }
  function my(n, r, l, o, c) {
    if (c) {
      if (typeof o == "function") {
        var d = o;
        o = function() {
          var U = nf(m);
          d.call(U);
        };
      }
      var m = rh(r, o, n, 0, null, !1, !1, "", lh);
      return n._reactRootContainer = m, n[Hi] = m.current, ro(n.nodeType === 8 ? n.parentNode : n), Al(), m;
    }
    for (; c = n.lastChild; )
      n.removeChild(c);
    if (typeof o == "function") {
      var E = o;
      o = function() {
        var U = nf(w);
        E.call(U);
      };
    }
    var w = tf(n, 0, !1, null, null, !1, !1, "", lh);
    return n._reactRootContainer = w, n[Hi] = w.current, ro(n.nodeType === 8 ? n.parentNode : n), Al(function() {
      Ls(r, w, l, o);
    }), w;
  }
  function lf(n, r, l, o, c) {
    var d = l._reactRootContainer;
    if (d) {
      var m = d;
      if (typeof c == "function") {
        var E = c;
        c = function() {
          var w = nf(m);
          E.call(w);
        };
      }
      Ls(r, m, n, c);
    } else
      m = my(l, r, n, c, o);
    return nf(m);
  }
  Xl = function(n) {
    switch (n.tag) {
      case 3:
        var r = n.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var l = Xa(r.pendingLanes);
          l !== 0 && (pi(r, l | 1), wr(r, Tt()), (dt & 6) === 0 && (Ro = Tt() + 500, Zr()));
        }
        break;
      case 13:
        Al(function() {
          var o = Pi(n, 1);
          if (o !== null) {
            var c = Rr();
            Tr(o, n, 1, c);
          }
        }), Gd(n, 1);
    }
  }, Qu = function(n) {
    if (n.tag === 13) {
      var r = Pi(n, 134217728);
      if (r !== null) {
        var l = Rr();
        Tr(r, n, 134217728, l);
      }
      Gd(n, 134217728);
    }
  }, wt = function(n) {
    if (n.tag === 13) {
      var r = Un(n), l = Pi(n, r);
      if (l !== null) {
        var o = Rr();
        Tr(l, n, r, o);
      }
      Gd(n, r);
    }
  }, Wu = function() {
    return Dt;
  }, Gu = function(n, r) {
    var l = Dt;
    try {
      return Dt = n, r();
    } finally {
      Dt = l;
    }
  }, _r = function(n, r, l) {
    switch (r) {
      case "input":
        if (bn(n, l), r = l.name, l.type === "radio" && r != null) {
          for (l = n; l.parentNode; )
            l = l.parentNode;
          for (l = l.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < l.length; r++) {
            var o = l[r];
            if (o !== n && o.form === n.form) {
              var c = De(o);
              if (!c)
                throw Error(A(90));
              Br(o), bn(o, c);
            }
          }
        }
        break;
      case "textarea":
        ca(n, l);
        break;
      case "select":
        r = l.value, r != null && hr(n, !!l.multiple, r, !1);
    }
  }, ql = xo, ju = Al;
  var yy = { usingClientEntryPoint: !1, Events: [ss, ao, De, _a, il, xo] }, bo = { findFiberByHostInstance: Oa, bundleType: 0, version: "18.2.0", rendererPackageName: "react-dom" }, gy = { bundleType: bo.bundleType, version: bo.version, rendererPackageName: bo.rendererPackageName, rendererConfig: bo.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ct.ReactCurrentDispatcher, findHostInstanceByFiber: function(n) {
    return n = Mn(n), n === null ? null : n.stateNode;
  }, findFiberByHostInstance: bo.findFiberByHostInstance || ih, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.2.0-next-9e3b772b8-20220608" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var uf = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!uf.isDisabled && uf.supportsFiber)
      try {
        ol = uf.inject(gy), Wr = uf;
      } catch {
      }
  }
  return Qa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yy, Qa.createPortal = function(n, r) {
    var l = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Xd(r))
      throw Error(A(200));
    return nh(n, r, null, l);
  }, Qa.createRoot = function(n, r) {
    if (!Xd(n))
      throw Error(A(299));
    var l = !1, o = "", c = qd;
    return r != null && (r.unstable_strictMode === !0 && (l = !0), r.identifierPrefix !== void 0 && (o = r.identifierPrefix), r.onRecoverableError !== void 0 && (c = r.onRecoverableError)), r = tf(n, 1, !1, null, null, l, !1, o, c), n[Hi] = r.current, ro(n.nodeType === 8 ? n.parentNode : n), new rf(r);
  }, Qa.findDOMNode = function(n) {
    if (n == null)
      return null;
    if (n.nodeType === 1)
      return n;
    var r = n._reactInternals;
    if (r === void 0)
      throw typeof n.render == "function" ? Error(A(188)) : (n = Object.keys(n).join(","), Error(A(268, n)));
    return n = Mn(r), n = n === null ? null : n.stateNode, n;
  }, Qa.flushSync = function(n) {
    return Al(n);
  }, Qa.hydrate = function(n, r, l) {
    if (!af(r))
      throw Error(A(200));
    return lf(null, n, r, !0, l);
  }, Qa.hydrateRoot = function(n, r, l) {
    if (!Xd(n))
      throw Error(A(405));
    var o = l != null && l.hydratedSources || null, c = !1, d = "", m = qd;
    if (l != null && (l.unstable_strictMode === !0 && (c = !0), l.identifierPrefix !== void 0 && (d = l.identifierPrefix), l.onRecoverableError !== void 0 && (m = l.onRecoverableError)), r = rh(r, null, n, 1, l != null ? l : null, c, !1, d, m), n[Hi] = r.current, ro(n), o)
      for (n = 0; n < o.length; n++)
        l = o[n], c = l._getVersion, c = c(l._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [l, c] : r.mutableSourceEagerHydrationData.push(
          l,
          c
        );
    return new Wi(r);
  }, Qa.render = function(n, r, l) {
    if (!af(r))
      throw Error(A(200));
    return lf(null, n, r, !1, l);
  }, Qa.unmountComponentAtNode = function(n) {
    if (!af(n))
      throw Error(A(40));
    return n._reactRootContainer ? (Al(function() {
      lf(null, null, n, !1, function() {
        n._reactRootContainer = null, n[Hi] = null;
      });
    }), !0) : !1;
  }, Qa.unstable_batchedUpdates = xo, Qa.unstable_renderSubtreeIntoContainer = function(n, r, l, o) {
    if (!af(l))
      throw Error(A(200));
    if (n == null || n._reactInternals === void 0)
      throw Error(A(38));
    return lf(n, r, l, !1, o);
  }, Qa.version = "18.2.0-next-9e3b772b8-20220608", Qa;
}
var Wa = {};
/**
 * @license React
 * react-dom.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var tR;
function iD() {
  return tR || (tR = 1, process.env.NODE_ENV !== "production" && function() {
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
    var B = Xs.exports, q = uR(), A = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, $t = !1;
    function Yt(e) {
      $t = e;
    }
    function Je(e) {
      if (!$t) {
        for (var t = arguments.length, a = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++)
          a[i - 1] = arguments[i];
        It("warn", e, a);
      }
    }
    function S(e) {
      if (!$t) {
        for (var t = arguments.length, a = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++)
          a[i - 1] = arguments[i];
        It("error", e, a);
      }
    }
    function It(e, t, a) {
      {
        var i = A.ReactDebugCurrentFrame, u = i.getStackAddendum();
        u !== "" && (t += "%s", a = a.concat([u]));
        var s = a.map(function(f) {
          return String(f);
        });
        s.unshift("Warning: " + t), Function.prototype.apply.call(console[e], console, s);
      }
    }
    var he = 0, pe = 1, rt = 2, re = 3, me = 4, ie = 5, Pe = 6, Ct = 7, st = 8, dn = 9, at = 10, Qe = 11, ct = 12, _e = 13, it = 14, He = 15, nn = 16, _n = 17, Qt = 18, bt = 19, Cn = 21, Ue = 22, qe = 23, Nt = 24, Rt = 25, ye = !0, Z = !1, we = !1, T = !1, $ = !1, le = !0, $e = !1, Fe = !1, ht = !0, et = !0, ft = !0, tt = /* @__PURE__ */ new Set(), zt = {}, Vr = {};
    function vr(e, t) {
      Br(e, t), Br(e + "Capture", t);
    }
    function Br(e, t) {
      zt[e] && S("EventRegistry: More than one plugin attempted to publish the same registration name, `%s`.", e), zt[e] = t;
      {
        var a = e.toLowerCase();
        Vr[a] = e, e === "onDoubleClick" && (Vr.ondblclick = e);
      }
      for (var i = 0; i < t.length; i++)
        tt.add(t[i]);
    }
    var pn = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", In = Object.prototype.hasOwnProperty;
    function Fn(e) {
      {
        var t = typeof Symbol == "function" && Symbol.toStringTag, a = t && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return a;
      }
    }
    function Hn(e) {
      try {
        return bn(e), !1;
      } catch {
        return !0;
      }
    }
    function bn(e) {
      return "" + e;
    }
    function $r(e, t) {
      if (Hn(e))
        return S("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", t, Fn(e)), bn(e);
    }
    function Yr(e) {
      if (Hn(e))
        return S("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Fn(e)), bn(e);
    }
    function Qn(e, t) {
      if (Hn(e))
        return S("The provided `%s` prop is an unsupported type %s. This value must be coerced to a string before before using it here.", t, Fn(e)), bn(e);
    }
    function hr(e, t) {
      if (Hn(e))
        return S("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", t, Fn(e)), bn(e);
    }
    function Ir(e) {
      if (Hn(e))
        return S("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", Fn(e)), bn(e);
    }
    function mr(e) {
      if (Hn(e))
        return S("Form field values (value, checked, defaultValue, or defaultChecked props) must be strings, not %s. This value must be coerced to a string before before using it here.", Fn(e)), bn(e);
    }
    var ca = 0, tr = 1, Qr = 2, vn = 3, xr = 4, ui = 5, fa = 6, J = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", xe = J + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040", nt = new RegExp("^[" + J + "][" + xe + "]*$"), Lt = {}, Ut = {};
    function Dn(e) {
      return In.call(Ut, e) ? !0 : In.call(Lt, e) ? !1 : nt.test(e) ? (Ut[e] = !0, !0) : (Lt[e] = !0, S("Invalid attribute name: `%s`", e), !1);
    }
    function hn(e, t, a) {
      return t !== null ? t.type === ca : a ? !1 : e.length > 2 && (e[0] === "o" || e[0] === "O") && (e[1] === "n" || e[1] === "N");
    }
    function yr(e, t, a, i) {
      if (a !== null && a.type === ca)
        return !1;
      switch (typeof t) {
        case "function":
        case "symbol":
          return !0;
        case "boolean": {
          if (i)
            return !1;
          if (a !== null)
            return !a.acceptsBooleans;
          var u = e.toLowerCase().slice(0, 5);
          return u !== "data-" && u !== "aria-";
        }
        default:
          return !1;
      }
    }
    function Vt(e, t, a, i) {
      if (t === null || typeof t > "u" || yr(e, t, a, i))
        return !0;
      if (i)
        return !1;
      if (a !== null)
        switch (a.type) {
          case vn:
            return !t;
          case xr:
            return t === !1;
          case ui:
            return isNaN(t);
          case fa:
            return isNaN(t) || t < 1;
        }
      return !1;
    }
    function _r(e) {
      return Ft.hasOwnProperty(e) ? Ft[e] : null;
    }
    function At(e, t, a, i, u, s, f) {
      this.acceptsBooleans = t === Qr || t === vn || t === xr, this.attributeName = i, this.attributeNamespace = u, this.mustUseProperty = a, this.propertyName = e, this.type = t, this.sanitizeURL = s, this.removeEmptyString = f;
    }
    var Ft = {}, Ga = [
      "children",
      "dangerouslySetInnerHTML",
      "defaultValue",
      "defaultChecked",
      "innerHTML",
      "suppressContentEditableWarning",
      "suppressHydrationWarning",
      "style"
    ];
    Ga.forEach(function(e) {
      Ft[e] = new At(
        e,
        ca,
        !1,
        e,
        null,
        !1,
        !1
      );
    }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
      var t = e[0], a = e[1];
      Ft[t] = new At(
        t,
        tr,
        !1,
        a,
        null,
        !1,
        !1
      );
    }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
      Ft[e] = new At(
        e,
        Qr,
        !1,
        e.toLowerCase(),
        null,
        !1,
        !1
      );
    }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
      Ft[e] = new At(
        e,
        Qr,
        !1,
        e,
        null,
        !1,
        !1
      );
    }), [
      "allowFullScreen",
      "async",
      "autoFocus",
      "autoPlay",
      "controls",
      "default",
      "defer",
      "disabled",
      "disablePictureInPicture",
      "disableRemotePlayback",
      "formNoValidate",
      "hidden",
      "loop",
      "noModule",
      "noValidate",
      "open",
      "playsInline",
      "readOnly",
      "required",
      "reversed",
      "scoped",
      "seamless",
      "itemScope"
    ].forEach(function(e) {
      Ft[e] = new At(
        e,
        vn,
        !1,
        e.toLowerCase(),
        null,
        !1,
        !1
      );
    }), [
      "checked",
      "multiple",
      "muted",
      "selected"
    ].forEach(function(e) {
      Ft[e] = new At(
        e,
        vn,
        !0,
        e,
        null,
        !1,
        !1
      );
    }), [
      "capture",
      "download"
    ].forEach(function(e) {
      Ft[e] = new At(
        e,
        xr,
        !1,
        e,
        null,
        !1,
        !1
      );
    }), [
      "cols",
      "rows",
      "size",
      "span"
    ].forEach(function(e) {
      Ft[e] = new At(
        e,
        fa,
        !1,
        e,
        null,
        !1,
        !1
      );
    }), ["rowSpan", "start"].forEach(function(e) {
      Ft[e] = new At(
        e,
        ui,
        !1,
        e.toLowerCase(),
        null,
        !1,
        !1
      );
    });
    var _a = /[\-\:]([a-z])/g, il = function(e) {
      return e[1].toUpperCase();
    };
    [
      "accent-height",
      "alignment-baseline",
      "arabic-form",
      "baseline-shift",
      "cap-height",
      "clip-path",
      "clip-rule",
      "color-interpolation",
      "color-interpolation-filters",
      "color-profile",
      "color-rendering",
      "dominant-baseline",
      "enable-background",
      "fill-opacity",
      "fill-rule",
      "flood-color",
      "flood-opacity",
      "font-family",
      "font-size",
      "font-size-adjust",
      "font-stretch",
      "font-style",
      "font-variant",
      "font-weight",
      "glyph-name",
      "glyph-orientation-horizontal",
      "glyph-orientation-vertical",
      "horiz-adv-x",
      "horiz-origin-x",
      "image-rendering",
      "letter-spacing",
      "lighting-color",
      "marker-end",
      "marker-mid",
      "marker-start",
      "overline-position",
      "overline-thickness",
      "paint-order",
      "panose-1",
      "pointer-events",
      "rendering-intent",
      "shape-rendering",
      "stop-color",
      "stop-opacity",
      "strikethrough-position",
      "strikethrough-thickness",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-miterlimit",
      "stroke-opacity",
      "stroke-width",
      "text-anchor",
      "text-decoration",
      "text-rendering",
      "underline-position",
      "underline-thickness",
      "unicode-bidi",
      "unicode-range",
      "units-per-em",
      "v-alphabetic",
      "v-hanging",
      "v-ideographic",
      "v-mathematical",
      "vector-effect",
      "vert-adv-y",
      "vert-origin-x",
      "vert-origin-y",
      "word-spacing",
      "writing-mode",
      "xmlns:xlink",
      "x-height"
    ].forEach(function(e) {
      var t = e.replace(_a, il);
      Ft[t] = new At(
        t,
        tr,
        !1,
        e,
        null,
        !1,
        !1
      );
    }), [
      "xlink:actuate",
      "xlink:arcrole",
      "xlink:role",
      "xlink:show",
      "xlink:title",
      "xlink:type"
    ].forEach(function(e) {
      var t = e.replace(_a, il);
      Ft[t] = new At(
        t,
        tr,
        !1,
        e,
        "http://www.w3.org/1999/xlink",
        !1,
        !1
      );
    }), [
      "xml:base",
      "xml:lang",
      "xml:space"
    ].forEach(function(e) {
      var t = e.replace(_a, il);
      Ft[t] = new At(
        t,
        tr,
        !1,
        e,
        "http://www.w3.org/XML/1998/namespace",
        !1,
        !1
      );
    }), ["tabIndex", "crossOrigin"].forEach(function(e) {
      Ft[e] = new At(
        e,
        tr,
        !1,
        e.toLowerCase(),
        null,
        !1,
        !1
      );
    });
    var ql = "xlinkHref";
    Ft[ql] = new At(
      "xlinkHref",
      tr,
      !1,
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      !1
    ), ["src", "href", "action", "formAction"].forEach(function(e) {
      Ft[e] = new At(
        e,
        tr,
        !1,
        e.toLowerCase(),
        null,
        !0,
        !0
      );
    });
    var ju = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i, ki = !1;
    function ll(e) {
      !ki && ju.test(e) && (ki = !0, S("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(e)));
    }
    function da(e, t, a, i) {
      if (i.mustUseProperty) {
        var u = i.propertyName;
        return e[u];
      } else {
        $r(a, t), i.sanitizeURL && ll("" + a);
        var s = i.attributeName, f = null;
        if (i.type === xr) {
          if (e.hasAttribute(s)) {
            var p = e.getAttribute(s);
            return p === "" ? !0 : Vt(t, a, i, !1) ? p : p === "" + a ? a : p;
          }
        } else if (e.hasAttribute(s)) {
          if (Vt(t, a, i, !1))
            return e.getAttribute(s);
          if (i.type === vn)
            return a;
          f = e.getAttribute(s);
        }
        return Vt(t, a, i, !1) ? f === null ? a : f : f === "" + a ? a : f;
      }
    }
    function oi(e, t, a, i) {
      {
        if (!Dn(t))
          return;
        if (!e.hasAttribute(t))
          return a === void 0 ? void 0 : null;
        var u = e.getAttribute(t);
        return $r(a, t), u === "" + a ? a : u;
      }
    }
    function pa(e, t, a, i) {
      var u = _r(t);
      if (!hn(t, u, i)) {
        if (Vt(t, a, u, i) && (a = null), i || u === null) {
          if (Dn(t)) {
            var s = t;
            a === null ? e.removeAttribute(s) : ($r(a, t), e.setAttribute(s, "" + a));
          }
          return;
        }
        var f = u.mustUseProperty;
        if (f) {
          var p = u.propertyName;
          if (a === null) {
            var v = u.type;
            e[p] = v === vn ? !1 : "";
          } else
            e[p] = a;
          return;
        }
        var y = u.attributeName, g = u.attributeNamespace;
        if (a === null)
          e.removeAttribute(y);
        else {
          var b = u.type, x;
          b === vn || b === xr && a === !0 ? x = "" : ($r(a, y), x = "" + a, u.sanitizeURL && ll(x.toString())), g ? e.setAttributeNS(g, y, x) : e.setAttribute(y, x);
        }
      }
    }
    var si = Symbol.for("react.element"), br = Symbol.for("react.portal"), va = Symbol.for("react.fragment"), ci = Symbol.for("react.strict_mode"), R = Symbol.for("react.profiler"), Y = Symbol.for("react.provider"), ee = Symbol.for("react.context"), ce = Symbol.for("react.forward_ref"), Ge = Symbol.for("react.suspense"), mt = Symbol.for("react.suspense_list"), Xe = Symbol.for("react.memo"), ke = Symbol.for("react.lazy"), Mn = Symbol.for("react.scope"), Jt = Symbol.for("react.debug_trace_mode"), en = Symbol.for("react.offscreen"), nr = Symbol.for("react.legacy_hidden"), fi = Symbol.for("react.cache"), Pu = Symbol.for("react.tracing_marker"), Tt = Symbol.iterator, jf = "@@iterator";
    function qa(e) {
      if (e === null || typeof e != "object")
        return null;
      var t = Tt && e[Tt] || e[jf];
      return typeof t == "function" ? t : null;
    }
    var lt = Object.assign, di = 0, ul, Vu, ol, Wr, Qo, Dr, Wo;
    function Go() {
    }
    Go.__reactDisabledLog = !0;
    function Ks() {
      {
        if (di === 0) {
          ul = console.log, Vu = console.info, ol = console.warn, Wr = console.error, Qo = console.group, Dr = console.groupCollapsed, Wo = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: Go,
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
        di++;
      }
    }
    function Bu() {
      {
        if (di--, di === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: lt({}, e, {
              value: ul
            }),
            info: lt({}, e, {
              value: Vu
            }),
            warn: lt({}, e, {
              value: ol
            }),
            error: lt({}, e, {
              value: Wr
            }),
            group: lt({}, e, {
              value: Qo
            }),
            groupCollapsed: lt({}, e, {
              value: Dr
            }),
            groupEnd: lt({}, e, {
              value: Wo
            })
          });
        }
        di < 0 && S("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var sl = A.ReactCurrentDispatcher, Xa;
    function kr(e, t, a) {
      {
        if (Xa === void 0)
          try {
            throw Error();
          } catch (u) {
            var i = u.stack.trim().match(/\n( *(at )?)/);
            Xa = i && i[1] || "";
          }
        return `
` + Xa + e;
      }
    }
    var cl = !1, fl;
    {
      var dl = typeof WeakMap == "function" ? WeakMap : Map;
      fl = new dl();
    }
    function $u(e, t) {
      if (!e || cl)
        return "";
      {
        var a = fl.get(e);
        if (a !== void 0)
          return a;
      }
      var i;
      cl = !0;
      var u = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var s;
      s = sl.current, sl.current = null, Ks();
      try {
        if (t) {
          var f = function() {
            throw Error();
          };
          if (Object.defineProperty(f.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(f, []);
            } catch (z) {
              i = z;
            }
            Reflect.construct(e, [], f);
          } else {
            try {
              f.call();
            } catch (z) {
              i = z;
            }
            e.call(f.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (z) {
            i = z;
          }
          e();
        }
      } catch (z) {
        if (z && i && typeof z.stack == "string") {
          for (var p = z.stack.split(`
`), v = i.stack.split(`
`), y = p.length - 1, g = v.length - 1; y >= 1 && g >= 0 && p[y] !== v[g]; )
            g--;
          for (; y >= 1 && g >= 0; y--, g--)
            if (p[y] !== v[g]) {
              if (y !== 1 || g !== 1)
                do
                  if (y--, g--, g < 0 || p[y] !== v[g]) {
                    var b = `
` + p[y].replace(" at new ", " at ");
                    return e.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", e.displayName)), typeof e == "function" && fl.set(e, b), b;
                  }
                while (y >= 1 && g >= 0);
              break;
            }
        }
      } finally {
        cl = !1, sl.current = s, Bu(), Error.prepareStackTrace = u;
      }
      var x = e ? e.displayName || e.name : "", M = x ? kr(x) : "";
      return typeof e == "function" && fl.set(e, M), M;
    }
    function Yu(e, t, a) {
      return $u(e, !0);
    }
    function Oi(e, t, a) {
      return $u(e, !1);
    }
    function Pf(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    function pi(e, t, a) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return $u(e, Pf(e));
      if (typeof e == "string")
        return kr(e);
      switch (e) {
        case Ge:
          return kr("Suspense");
        case mt:
          return kr("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case ce:
            return Oi(e.render);
          case Xe:
            return pi(e.type, t, a);
          case ke: {
            var i = e, u = i._payload, s = i._init;
            try {
              return pi(s(u), t, a);
            } catch {
            }
          }
        }
      return "";
    }
    function Dt(e) {
      switch (e._debugOwner && e._debugOwner.type, e._debugSource, e.tag) {
        case ie:
          return kr(e.type);
        case nn:
          return kr("Lazy");
        case _e:
          return kr("Suspense");
        case bt:
          return kr("SuspenseList");
        case he:
        case rt:
        case He:
          return Oi(e.type);
        case Qe:
          return Oi(e.type.render);
        case pe:
          return Yu(e.type);
        default:
          return "";
      }
    }
    function Iu(e) {
      try {
        var t = "", a = e;
        do
          t += Dt(a), a = a.return;
        while (a);
        return t;
      } catch (i) {
        return `
Error generating stack: ` + i.message + `
` + i.stack;
      }
    }
    function Xl(e, t, a) {
      var i = e.displayName;
      if (i)
        return i;
      var u = t.displayName || t.name || "";
      return u !== "" ? a + "(" + u + ")" : a;
    }
    function Qu(e) {
      return e.displayName || "Context";
    }
    function wt(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && S("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case va:
          return "Fragment";
        case br:
          return "Portal";
        case R:
          return "Profiler";
        case ci:
          return "StrictMode";
        case Ge:
          return "Suspense";
        case mt:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case ee:
            var t = e;
            return Qu(t) + ".Consumer";
          case Y:
            var a = e;
            return Qu(a._context) + ".Provider";
          case ce:
            return Xl(e, e.render, "ForwardRef");
          case Xe:
            var i = e.displayName || null;
            return i !== null ? i : wt(e.type) || "Memo";
          case ke: {
            var u = e, s = u._payload, f = u._init;
            try {
              return wt(f(s));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    function Wu(e, t, a) {
      var i = t.displayName || t.name || "";
      return e.displayName || (i !== "" ? a + "(" + i + ")" : a);
    }
    function Gu(e) {
      return e.displayName || "Context";
    }
    function Ye(e) {
      var t = e.tag, a = e.type;
      switch (t) {
        case Nt:
          return "Cache";
        case dn:
          var i = a;
          return Gu(i) + ".Consumer";
        case at:
          var u = a;
          return Gu(u._context) + ".Provider";
        case Qt:
          return "DehydratedFragment";
        case Qe:
          return Wu(a, a.render, "ForwardRef");
        case Ct:
          return "Fragment";
        case ie:
          return a;
        case me:
          return "Portal";
        case re:
          return "Root";
        case Pe:
          return "Text";
        case nn:
          return wt(a);
        case st:
          return a === ci ? "StrictMode" : "Mode";
        case Ue:
          return "Offscreen";
        case ct:
          return "Profiler";
        case Cn:
          return "Scope";
        case _e:
          return "Suspense";
        case bt:
          return "SuspenseList";
        case Rt:
          return "TracingMarker";
        case pe:
        case he:
        case _n:
        case rt:
        case it:
        case He:
          if (typeof a == "function")
            return a.displayName || a.name || null;
          if (typeof a == "string")
            return a;
          break;
      }
      return null;
    }
    var Kl = A.ReactDebugCurrentFrame, mn = null, Gr = !1;
    function Or() {
      {
        if (mn === null)
          return null;
        var e = mn._debugOwner;
        if (e !== null && typeof e < "u")
          return Ye(e);
      }
      return null;
    }
    function pl() {
      return mn === null ? "" : Iu(mn);
    }
    function Rn() {
      Kl.getCurrentStack = null, mn = null, Gr = !1;
    }
    function Ht(e) {
      Kl.getCurrentStack = e === null ? null : pl, mn = e, Gr = !1;
    }
    function Zs() {
      return mn;
    }
    function qr(e) {
      Gr = e;
    }
    function Wn(e) {
      return "" + e;
    }
    function vi(e) {
      switch (typeof e) {
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return e;
        case "object":
          return mr(e), e;
        default:
          return "";
      }
    }
    var Js = {
      button: !0,
      checkbox: !0,
      image: !0,
      hidden: !0,
      radio: !0,
      reset: !0,
      submit: !0
    };
    function Li(e, t) {
      Js[t.type] || t.onChange || t.onInput || t.readOnly || t.disabled || t.value == null || S("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."), t.onChange || t.readOnly || t.disabled || t.checked == null || S("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
    }
    function vl(e) {
      var t = e.type, a = e.nodeName;
      return a && a.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
    }
    function ec(e) {
      return e._valueTracker;
    }
    function ba(e) {
      e._valueTracker = null;
    }
    function hl(e) {
      var t = "";
      return e && (vl(e) ? t = e.checked ? "true" : "false" : t = e.value), t;
    }
    function ml(e) {
      var t = vl(e) ? "checked" : "value", a = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
      mr(e[t]);
      var i = "" + e[t];
      if (!(e.hasOwnProperty(t) || typeof a > "u" || typeof a.get != "function" || typeof a.set != "function")) {
        var u = a.get, s = a.set;
        Object.defineProperty(e, t, {
          configurable: !0,
          get: function() {
            return u.call(this);
          },
          set: function(p) {
            mr(p), i = "" + p, s.call(this, p);
          }
        }), Object.defineProperty(e, t, {
          enumerable: a.enumerable
        });
        var f = {
          getValue: function() {
            return i;
          },
          setValue: function(p) {
            mr(p), i = "" + p;
          },
          stopTracking: function() {
            ba(e), delete e[t];
          }
        };
        return f;
      }
    }
    function Da(e) {
      ec(e) || (e._valueTracker = ml(e));
    }
    function qu(e) {
      if (!e)
        return !1;
      var t = ec(e);
      if (!t)
        return !0;
      var a = t.getValue(), i = hl(e);
      return i !== a ? (t.setValue(i), !0) : !1;
    }
    function yl(e) {
      if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u")
        return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    var gl = !1, Zl = !1, Xu = !1, qo = !1;
    function Ka(e) {
      var t = e.type === "checkbox" || e.type === "radio";
      return t ? e.checked != null : e.value != null;
    }
    function h(e, t) {
      var a = e, i = t.checked, u = lt({}, t, {
        defaultChecked: void 0,
        defaultValue: void 0,
        value: void 0,
        checked: i != null ? i : a._wrapperState.initialChecked
      });
      return u;
    }
    function C(e, t) {
      Li("input", t), t.checked !== void 0 && t.defaultChecked !== void 0 && !Zl && (S("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", Or() || "A component", t.type), Zl = !0), t.value !== void 0 && t.defaultValue !== void 0 && !gl && (S("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", Or() || "A component", t.type), gl = !0);
      var a = e, i = t.defaultValue == null ? "" : t.defaultValue;
      a._wrapperState = {
        initialChecked: t.checked != null ? t.checked : t.defaultChecked,
        initialValue: vi(t.value != null ? t.value : i),
        controlled: Ka(t)
      };
    }
    function N(e, t) {
      var a = e, i = t.checked;
      i != null && pa(a, "checked", i, !1);
    }
    function F(e, t) {
      var a = e;
      {
        var i = Ka(t);
        !a._wrapperState.controlled && i && !qo && (S("A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"), qo = !0), a._wrapperState.controlled && !i && !Xu && (S("A component is changing a controlled input to be uncontrolled. This is likely caused by the value changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"), Xu = !0);
      }
      N(e, t);
      var u = vi(t.value), s = t.type;
      if (u != null)
        s === "number" ? (u === 0 && a.value === "" || a.value != u) && (a.value = Wn(u)) : a.value !== Wn(u) && (a.value = Wn(u));
      else if (s === "submit" || s === "reset") {
        a.removeAttribute("value");
        return;
      }
      t.hasOwnProperty("value") ? Le(a, t.type, u) : t.hasOwnProperty("defaultValue") && Le(a, t.type, vi(t.defaultValue)), t.checked == null && t.defaultChecked != null && (a.defaultChecked = !!t.defaultChecked);
    }
    function X(e, t, a) {
      var i = e;
      if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
        var u = t.type, s = u === "submit" || u === "reset";
        if (s && (t.value === void 0 || t.value === null))
          return;
        var f = Wn(i._wrapperState.initialValue);
        a || f !== i.value && (i.value = f), i.defaultValue = f;
      }
      var p = i.name;
      p !== "" && (i.name = ""), i.defaultChecked = !i.defaultChecked, i.defaultChecked = !!i._wrapperState.initialChecked, p !== "" && (i.name = p);
    }
    function Ne(e, t) {
      var a = e;
      F(a, t), ae(a, t);
    }
    function ae(e, t) {
      var a = t.name;
      if (t.type === "radio" && a != null) {
        for (var i = e; i.parentNode; )
          i = i.parentNode;
        $r(a, "name");
        for (var u = i.querySelectorAll("input[name=" + JSON.stringify("" + a) + '][type="radio"]'), s = 0; s < u.length; s++) {
          var f = u[s];
          if (!(f === e || f.form !== e.form)) {
            var p = Th(f);
            if (!p)
              throw new Error("ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.");
            qu(f), F(f, p);
          }
        }
      }
    }
    function Le(e, t, a) {
      (t !== "number" || yl(e.ownerDocument) !== e) && (a == null ? e.defaultValue = Wn(e._wrapperState.initialValue) : e.defaultValue !== Wn(a) && (e.defaultValue = Wn(a)));
    }
    var ut = !1, xt = !1, qt = !1;
    function Bt(e, t) {
      t.value == null && (typeof t.children == "object" && t.children !== null ? B.Children.forEach(t.children, function(a) {
        a != null && (typeof a == "string" || typeof a == "number" || xt || (xt = !0, S("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.")));
      }) : t.dangerouslySetInnerHTML != null && (qt || (qt = !0, S("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected.")))), t.selected != null && !ut && (S("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>."), ut = !0);
    }
    function Xt(e, t) {
      t.value != null && e.setAttribute("value", Wn(vi(t.value)));
    }
    var tn = Array.isArray;
    function vt(e) {
      return tn(e);
    }
    var Mi;
    Mi = !1;
    function Ku() {
      var e = Or();
      return e ? `

Check the render method of \`` + e + "`." : "";
    }
    var Xo = ["value", "defaultValue"];
    function Vf(e) {
      {
        Li("select", e);
        for (var t = 0; t < Xo.length; t++) {
          var a = Xo[t];
          if (e[a] != null) {
            var i = vt(e[a]);
            e.multiple && !i ? S("The `%s` prop supplied to <select> must be an array if `multiple` is true.%s", a, Ku()) : !e.multiple && i && S("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.%s", a, Ku());
          }
        }
      }
    }
    function Za(e, t, a, i) {
      var u = e.options;
      if (t) {
        for (var s = a, f = {}, p = 0; p < s.length; p++)
          f["$" + s[p]] = !0;
        for (var v = 0; v < u.length; v++) {
          var y = f.hasOwnProperty("$" + u[v].value);
          u[v].selected !== y && (u[v].selected = y), y && i && (u[v].defaultSelected = !0);
        }
      } else {
        for (var g = Wn(vi(a)), b = null, x = 0; x < u.length; x++) {
          if (u[x].value === g) {
            u[x].selected = !0, i && (u[x].defaultSelected = !0);
            return;
          }
          b === null && !u[x].disabled && (b = u[x]);
        }
        b !== null && (b.selected = !0);
      }
    }
    function Ko(e, t) {
      return lt({}, t, {
        value: void 0
      });
    }
    function Zo(e, t) {
      var a = e;
      Vf(t), a._wrapperState = {
        wasMultiple: !!t.multiple
      }, t.value !== void 0 && t.defaultValue !== void 0 && !Mi && (S("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components"), Mi = !0);
    }
    function Bf(e, t) {
      var a = e;
      a.multiple = !!t.multiple;
      var i = t.value;
      i != null ? Za(a, !!t.multiple, i, !1) : t.defaultValue != null && Za(a, !!t.multiple, t.defaultValue, !0);
    }
    function jm(e, t) {
      var a = e, i = a._wrapperState.wasMultiple;
      a._wrapperState.wasMultiple = !!t.multiple;
      var u = t.value;
      u != null ? Za(a, !!t.multiple, u, !1) : i !== !!t.multiple && (t.defaultValue != null ? Za(a, !!t.multiple, t.defaultValue, !0) : Za(a, !!t.multiple, t.multiple ? [] : "", !1));
    }
    function Pm(e, t) {
      var a = e, i = t.value;
      i != null && Za(a, !!t.multiple, i, !1);
    }
    var $f = !1;
    function Yf(e, t) {
      var a = e;
      if (t.dangerouslySetInnerHTML != null)
        throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
      var i = lt({}, t, {
        value: void 0,
        defaultValue: void 0,
        children: Wn(a._wrapperState.initialValue)
      });
      return i;
    }
    function Zp(e, t) {
      var a = e;
      Li("textarea", t), t.value !== void 0 && t.defaultValue !== void 0 && !$f && (S("%s contains a textarea with both value and defaultValue props. Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components", Or() || "A component"), $f = !0);
      var i = t.value;
      if (i == null) {
        var u = t.children, s = t.defaultValue;
        if (u != null) {
          S("Use the `defaultValue` or `value` props instead of setting children on <textarea>.");
          {
            if (s != null)
              throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
            if (vt(u)) {
              if (u.length > 1)
                throw new Error("<textarea> can only have at most one child.");
              u = u[0];
            }
            s = u;
          }
        }
        s == null && (s = ""), i = s;
      }
      a._wrapperState = {
        initialValue: vi(i)
      };
    }
    function Jp(e, t) {
      var a = e, i = vi(t.value), u = vi(t.defaultValue);
      if (i != null) {
        var s = Wn(i);
        s !== a.value && (a.value = s), t.defaultValue == null && a.defaultValue !== s && (a.defaultValue = s);
      }
      u != null && (a.defaultValue = Wn(u));
    }
    function ev(e, t) {
      var a = e, i = a.textContent;
      i === a._wrapperState.initialValue && i !== "" && i !== null && (a.value = i);
    }
    function If(e, t) {
      Jp(e, t);
    }
    var Ni = "http://www.w3.org/1999/xhtml", Vm = "http://www.w3.org/1998/Math/MathML", Qf = "http://www.w3.org/2000/svg";
    function tc(e) {
      switch (e) {
        case "svg":
          return Qf;
        case "math":
          return Vm;
        default:
          return Ni;
      }
    }
    function Wf(e, t) {
      return e == null || e === Ni ? tc(t) : e === Qf && t === "foreignObject" ? Ni : e;
    }
    var Bm = function(e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, a, i, u) {
        MSApp.execUnsafeLocalFunction(function() {
          return e(t, a, i, u);
        });
      } : e;
    }, nc, tv = Bm(function(e, t) {
      if (e.namespaceURI === Qf && !("innerHTML" in e)) {
        nc = nc || document.createElement("div"), nc.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>";
        for (var a = nc.firstChild; e.firstChild; )
          e.removeChild(e.firstChild);
        for (; a.firstChild; )
          e.appendChild(a.firstChild);
        return;
      }
      e.innerHTML = t;
    }), Xr = 1, zi = 3, Nn = 8, Ja = 9, Jl = 11, rc = function(e, t) {
      if (t) {
        var a = e.firstChild;
        if (a && a === e.lastChild && a.nodeType === zi) {
          a.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }, nv = {
      animation: ["animationDelay", "animationDirection", "animationDuration", "animationFillMode", "animationIterationCount", "animationName", "animationPlayState", "animationTimingFunction"],
      background: ["backgroundAttachment", "backgroundClip", "backgroundColor", "backgroundImage", "backgroundOrigin", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundSize"],
      backgroundPosition: ["backgroundPositionX", "backgroundPositionY"],
      border: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderTopColor", "borderTopStyle", "borderTopWidth"],
      borderBlockEnd: ["borderBlockEndColor", "borderBlockEndStyle", "borderBlockEndWidth"],
      borderBlockStart: ["borderBlockStartColor", "borderBlockStartStyle", "borderBlockStartWidth"],
      borderBottom: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth"],
      borderColor: ["borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor"],
      borderImage: ["borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth"],
      borderInlineEnd: ["borderInlineEndColor", "borderInlineEndStyle", "borderInlineEndWidth"],
      borderInlineStart: ["borderInlineStartColor", "borderInlineStartStyle", "borderInlineStartWidth"],
      borderLeft: ["borderLeftColor", "borderLeftStyle", "borderLeftWidth"],
      borderRadius: ["borderBottomLeftRadius", "borderBottomRightRadius", "borderTopLeftRadius", "borderTopRightRadius"],
      borderRight: ["borderRightColor", "borderRightStyle", "borderRightWidth"],
      borderStyle: ["borderBottomStyle", "borderLeftStyle", "borderRightStyle", "borderTopStyle"],
      borderTop: ["borderTopColor", "borderTopStyle", "borderTopWidth"],
      borderWidth: ["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth"],
      columnRule: ["columnRuleColor", "columnRuleStyle", "columnRuleWidth"],
      columns: ["columnCount", "columnWidth"],
      flex: ["flexBasis", "flexGrow", "flexShrink"],
      flexFlow: ["flexDirection", "flexWrap"],
      font: ["fontFamily", "fontFeatureSettings", "fontKerning", "fontLanguageOverride", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition", "fontWeight", "lineHeight"],
      fontVariant: ["fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition"],
      gap: ["columnGap", "rowGap"],
      grid: ["gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
      gridArea: ["gridColumnEnd", "gridColumnStart", "gridRowEnd", "gridRowStart"],
      gridColumn: ["gridColumnEnd", "gridColumnStart"],
      gridColumnGap: ["columnGap"],
      gridGap: ["columnGap", "rowGap"],
      gridRow: ["gridRowEnd", "gridRowStart"],
      gridRowGap: ["rowGap"],
      gridTemplate: ["gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
      listStyle: ["listStyleImage", "listStylePosition", "listStyleType"],
      margin: ["marginBottom", "marginLeft", "marginRight", "marginTop"],
      marker: ["markerEnd", "markerMid", "markerStart"],
      mask: ["maskClip", "maskComposite", "maskImage", "maskMode", "maskOrigin", "maskPositionX", "maskPositionY", "maskRepeat", "maskSize"],
      maskPosition: ["maskPositionX", "maskPositionY"],
      outline: ["outlineColor", "outlineStyle", "outlineWidth"],
      overflow: ["overflowX", "overflowY"],
      padding: ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop"],
      placeContent: ["alignContent", "justifyContent"],
      placeItems: ["alignItems", "justifyItems"],
      placeSelf: ["alignSelf", "justifySelf"],
      textDecoration: ["textDecorationColor", "textDecorationLine", "textDecorationStyle"],
      textEmphasis: ["textEmphasisColor", "textEmphasisStyle"],
      transition: ["transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction"],
      wordWrap: ["overflowWrap"]
    }, Zu = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0
    };
    function rv(e, t) {
      return e + t.charAt(0).toUpperCase() + t.substring(1);
    }
    var av = ["Webkit", "ms", "Moz", "O"];
    Object.keys(Zu).forEach(function(e) {
      av.forEach(function(t) {
        Zu[rv(t, e)] = Zu[e];
      });
    });
    function ac(e, t, a) {
      var i = t == null || typeof t == "boolean" || t === "";
      return i ? "" : !a && typeof t == "number" && t !== 0 && !(Zu.hasOwnProperty(e) && Zu[e]) ? t + "px" : (hr(t, e), ("" + t).trim());
    }
    var Ju = /([A-Z])/g, $m = /^ms-/;
    function Ym(e) {
      return e.replace(Ju, "-$1").toLowerCase().replace($m, "-ms-");
    }
    var iv = function() {
    };
    {
      var lv = /^(?:webkit|moz|o)[A-Z]/, uv = /^-ms-/, Jo = /-(.)/g, eo = /;\s*$/, to = {}, no = {}, ov = !1, Gf = !1, qf = function(e) {
        return e.replace(Jo, function(t, a) {
          return a.toUpperCase();
        });
      }, Xf = function(e) {
        to.hasOwnProperty(e) && to[e] || (to[e] = !0, S(
          "Unsupported style property %s. Did you mean %s?",
          e,
          qf(e.replace(uv, "ms-"))
        ));
      }, sv = function(e) {
        to.hasOwnProperty(e) && to[e] || (to[e] = !0, S("Unsupported vendor-prefixed style property %s. Did you mean %s?", e, e.charAt(0).toUpperCase() + e.slice(1)));
      }, cv = function(e, t) {
        no.hasOwnProperty(t) && no[t] || (no[t] = !0, S(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, e, t.replace(eo, "")));
      }, fv = function(e, t) {
        ov || (ov = !0, S("`NaN` is an invalid value for the `%s` css style property.", e));
      }, Im = function(e, t) {
        Gf || (Gf = !0, S("`Infinity` is an invalid value for the `%s` css style property.", e));
      };
      iv = function(e, t) {
        e.indexOf("-") > -1 ? Xf(e) : lv.test(e) ? sv(e) : eo.test(t) && cv(e, t), typeof t == "number" && (isNaN(t) ? fv(e, t) : isFinite(t) || Im(e, t));
      };
    }
    var Qm = iv;
    function Wm(e) {
      {
        var t = "", a = "";
        for (var i in e)
          if (!!e.hasOwnProperty(i)) {
            var u = e[i];
            if (u != null) {
              var s = i.indexOf("--") === 0;
              t += a + (s ? i : Ym(i)) + ":", t += ac(i, u, s), a = ";";
            }
          }
        return t || null;
      }
    }
    function dv(e, t) {
      var a = e.style;
      for (var i in t)
        if (!!t.hasOwnProperty(i)) {
          var u = i.indexOf("--") === 0;
          u || Qm(i, t[i]);
          var s = ac(i, t[i], u);
          i === "float" && (i = "cssFloat"), u ? a.setProperty(i, s) : a[i] = s;
        }
    }
    function Gm(e) {
      return e == null || typeof e == "boolean" || e === "";
    }
    function ka(e) {
      var t = {};
      for (var a in e)
        for (var i = nv[a] || [a], u = 0; u < i.length; u++)
          t[i[u]] = a;
      return t;
    }
    function es(e, t) {
      {
        if (!t)
          return;
        var a = ka(e), i = ka(t), u = {};
        for (var s in a) {
          var f = a[s], p = i[s];
          if (p && f !== p) {
            var v = f + "," + p;
            if (u[v])
              continue;
            u[v] = !0, S("%s a style property during rerender (%s) when a conflicting property is set (%s) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, replace the shorthand with separate values.", Gm(e[f]) ? "Removing" : "Updating", f, p);
          }
        }
      }
    }
    var pv = {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0
    }, vv = lt({
      menuitem: !0
    }, pv), hv = "__html";
    function ic(e, t) {
      if (!!t) {
        if (vv[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
          throw new Error(e + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
        if (t.dangerouslySetInnerHTML != null) {
          if (t.children != null)
            throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
          if (typeof t.dangerouslySetInnerHTML != "object" || !(hv in t.dangerouslySetInnerHTML))
            throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        }
        if (!t.suppressContentEditableWarning && t.contentEditable && t.children != null && S("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional."), t.style != null && typeof t.style != "object")
          throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
      }
    }
    function Ui(e, t) {
      if (e.indexOf("-") === -1)
        return typeof t.is == "string";
      switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return !1;
        default:
          return !0;
      }
    }
    var lc = {
      accept: "accept",
      acceptcharset: "acceptCharset",
      "accept-charset": "acceptCharset",
      accesskey: "accessKey",
      action: "action",
      allowfullscreen: "allowFullScreen",
      alt: "alt",
      as: "as",
      async: "async",
      autocapitalize: "autoCapitalize",
      autocomplete: "autoComplete",
      autocorrect: "autoCorrect",
      autofocus: "autoFocus",
      autoplay: "autoPlay",
      autosave: "autoSave",
      capture: "capture",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing",
      challenge: "challenge",
      charset: "charSet",
      checked: "checked",
      children: "children",
      cite: "cite",
      class: "className",
      classid: "classID",
      classname: "className",
      cols: "cols",
      colspan: "colSpan",
      content: "content",
      contenteditable: "contentEditable",
      contextmenu: "contextMenu",
      controls: "controls",
      controlslist: "controlsList",
      coords: "coords",
      crossorigin: "crossOrigin",
      dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
      data: "data",
      datetime: "dateTime",
      default: "default",
      defaultchecked: "defaultChecked",
      defaultvalue: "defaultValue",
      defer: "defer",
      dir: "dir",
      disabled: "disabled",
      disablepictureinpicture: "disablePictureInPicture",
      disableremoteplayback: "disableRemotePlayback",
      download: "download",
      draggable: "draggable",
      enctype: "encType",
      enterkeyhint: "enterKeyHint",
      for: "htmlFor",
      form: "form",
      formmethod: "formMethod",
      formaction: "formAction",
      formenctype: "formEncType",
      formnovalidate: "formNoValidate",
      formtarget: "formTarget",
      frameborder: "frameBorder",
      headers: "headers",
      height: "height",
      hidden: "hidden",
      high: "high",
      href: "href",
      hreflang: "hrefLang",
      htmlfor: "htmlFor",
      httpequiv: "httpEquiv",
      "http-equiv": "httpEquiv",
      icon: "icon",
      id: "id",
      imagesizes: "imageSizes",
      imagesrcset: "imageSrcSet",
      innerhtml: "innerHTML",
      inputmode: "inputMode",
      integrity: "integrity",
      is: "is",
      itemid: "itemID",
      itemprop: "itemProp",
      itemref: "itemRef",
      itemscope: "itemScope",
      itemtype: "itemType",
      keyparams: "keyParams",
      keytype: "keyType",
      kind: "kind",
      label: "label",
      lang: "lang",
      list: "list",
      loop: "loop",
      low: "low",
      manifest: "manifest",
      marginwidth: "marginWidth",
      marginheight: "marginHeight",
      max: "max",
      maxlength: "maxLength",
      media: "media",
      mediagroup: "mediaGroup",
      method: "method",
      min: "min",
      minlength: "minLength",
      multiple: "multiple",
      muted: "muted",
      name: "name",
      nomodule: "noModule",
      nonce: "nonce",
      novalidate: "noValidate",
      open: "open",
      optimum: "optimum",
      pattern: "pattern",
      placeholder: "placeholder",
      playsinline: "playsInline",
      poster: "poster",
      preload: "preload",
      profile: "profile",
      radiogroup: "radioGroup",
      readonly: "readOnly",
      referrerpolicy: "referrerPolicy",
      rel: "rel",
      required: "required",
      reversed: "reversed",
      role: "role",
      rows: "rows",
      rowspan: "rowSpan",
      sandbox: "sandbox",
      scope: "scope",
      scoped: "scoped",
      scrolling: "scrolling",
      seamless: "seamless",
      selected: "selected",
      shape: "shape",
      size: "size",
      sizes: "sizes",
      span: "span",
      spellcheck: "spellCheck",
      src: "src",
      srcdoc: "srcDoc",
      srclang: "srcLang",
      srcset: "srcSet",
      start: "start",
      step: "step",
      style: "style",
      summary: "summary",
      tabindex: "tabIndex",
      target: "target",
      title: "title",
      type: "type",
      usemap: "useMap",
      value: "value",
      width: "width",
      wmode: "wmode",
      wrap: "wrap",
      about: "about",
      accentheight: "accentHeight",
      "accent-height": "accentHeight",
      accumulate: "accumulate",
      additive: "additive",
      alignmentbaseline: "alignmentBaseline",
      "alignment-baseline": "alignmentBaseline",
      allowreorder: "allowReorder",
      alphabetic: "alphabetic",
      amplitude: "amplitude",
      arabicform: "arabicForm",
      "arabic-form": "arabicForm",
      ascent: "ascent",
      attributename: "attributeName",
      attributetype: "attributeType",
      autoreverse: "autoReverse",
      azimuth: "azimuth",
      basefrequency: "baseFrequency",
      baselineshift: "baselineShift",
      "baseline-shift": "baselineShift",
      baseprofile: "baseProfile",
      bbox: "bbox",
      begin: "begin",
      bias: "bias",
      by: "by",
      calcmode: "calcMode",
      capheight: "capHeight",
      "cap-height": "capHeight",
      clip: "clip",
      clippath: "clipPath",
      "clip-path": "clipPath",
      clippathunits: "clipPathUnits",
      cliprule: "clipRule",
      "clip-rule": "clipRule",
      color: "color",
      colorinterpolation: "colorInterpolation",
      "color-interpolation": "colorInterpolation",
      colorinterpolationfilters: "colorInterpolationFilters",
      "color-interpolation-filters": "colorInterpolationFilters",
      colorprofile: "colorProfile",
      "color-profile": "colorProfile",
      colorrendering: "colorRendering",
      "color-rendering": "colorRendering",
      contentscripttype: "contentScriptType",
      contentstyletype: "contentStyleType",
      cursor: "cursor",
      cx: "cx",
      cy: "cy",
      d: "d",
      datatype: "datatype",
      decelerate: "decelerate",
      descent: "descent",
      diffuseconstant: "diffuseConstant",
      direction: "direction",
      display: "display",
      divisor: "divisor",
      dominantbaseline: "dominantBaseline",
      "dominant-baseline": "dominantBaseline",
      dur: "dur",
      dx: "dx",
      dy: "dy",
      edgemode: "edgeMode",
      elevation: "elevation",
      enablebackground: "enableBackground",
      "enable-background": "enableBackground",
      end: "end",
      exponent: "exponent",
      externalresourcesrequired: "externalResourcesRequired",
      fill: "fill",
      fillopacity: "fillOpacity",
      "fill-opacity": "fillOpacity",
      fillrule: "fillRule",
      "fill-rule": "fillRule",
      filter: "filter",
      filterres: "filterRes",
      filterunits: "filterUnits",
      floodopacity: "floodOpacity",
      "flood-opacity": "floodOpacity",
      floodcolor: "floodColor",
      "flood-color": "floodColor",
      focusable: "focusable",
      fontfamily: "fontFamily",
      "font-family": "fontFamily",
      fontsize: "fontSize",
      "font-size": "fontSize",
      fontsizeadjust: "fontSizeAdjust",
      "font-size-adjust": "fontSizeAdjust",
      fontstretch: "fontStretch",
      "font-stretch": "fontStretch",
      fontstyle: "fontStyle",
      "font-style": "fontStyle",
      fontvariant: "fontVariant",
      "font-variant": "fontVariant",
      fontweight: "fontWeight",
      "font-weight": "fontWeight",
      format: "format",
      from: "from",
      fx: "fx",
      fy: "fy",
      g1: "g1",
      g2: "g2",
      glyphname: "glyphName",
      "glyph-name": "glyphName",
      glyphorientationhorizontal: "glyphOrientationHorizontal",
      "glyph-orientation-horizontal": "glyphOrientationHorizontal",
      glyphorientationvertical: "glyphOrientationVertical",
      "glyph-orientation-vertical": "glyphOrientationVertical",
      glyphref: "glyphRef",
      gradienttransform: "gradientTransform",
      gradientunits: "gradientUnits",
      hanging: "hanging",
      horizadvx: "horizAdvX",
      "horiz-adv-x": "horizAdvX",
      horizoriginx: "horizOriginX",
      "horiz-origin-x": "horizOriginX",
      ideographic: "ideographic",
      imagerendering: "imageRendering",
      "image-rendering": "imageRendering",
      in2: "in2",
      in: "in",
      inlist: "inlist",
      intercept: "intercept",
      k1: "k1",
      k2: "k2",
      k3: "k3",
      k4: "k4",
      k: "k",
      kernelmatrix: "kernelMatrix",
      kernelunitlength: "kernelUnitLength",
      kerning: "kerning",
      keypoints: "keyPoints",
      keysplines: "keySplines",
      keytimes: "keyTimes",
      lengthadjust: "lengthAdjust",
      letterspacing: "letterSpacing",
      "letter-spacing": "letterSpacing",
      lightingcolor: "lightingColor",
      "lighting-color": "lightingColor",
      limitingconeangle: "limitingConeAngle",
      local: "local",
      markerend: "markerEnd",
      "marker-end": "markerEnd",
      markerheight: "markerHeight",
      markermid: "markerMid",
      "marker-mid": "markerMid",
      markerstart: "markerStart",
      "marker-start": "markerStart",
      markerunits: "markerUnits",
      markerwidth: "markerWidth",
      mask: "mask",
      maskcontentunits: "maskContentUnits",
      maskunits: "maskUnits",
      mathematical: "mathematical",
      mode: "mode",
      numoctaves: "numOctaves",
      offset: "offset",
      opacity: "opacity",
      operator: "operator",
      order: "order",
      orient: "orient",
      orientation: "orientation",
      origin: "origin",
      overflow: "overflow",
      overlineposition: "overlinePosition",
      "overline-position": "overlinePosition",
      overlinethickness: "overlineThickness",
      "overline-thickness": "overlineThickness",
      paintorder: "paintOrder",
      "paint-order": "paintOrder",
      panose1: "panose1",
      "panose-1": "panose1",
      pathlength: "pathLength",
      patterncontentunits: "patternContentUnits",
      patterntransform: "patternTransform",
      patternunits: "patternUnits",
      pointerevents: "pointerEvents",
      "pointer-events": "pointerEvents",
      points: "points",
      pointsatx: "pointsAtX",
      pointsaty: "pointsAtY",
      pointsatz: "pointsAtZ",
      prefix: "prefix",
      preservealpha: "preserveAlpha",
      preserveaspectratio: "preserveAspectRatio",
      primitiveunits: "primitiveUnits",
      property: "property",
      r: "r",
      radius: "radius",
      refx: "refX",
      refy: "refY",
      renderingintent: "renderingIntent",
      "rendering-intent": "renderingIntent",
      repeatcount: "repeatCount",
      repeatdur: "repeatDur",
      requiredextensions: "requiredExtensions",
      requiredfeatures: "requiredFeatures",
      resource: "resource",
      restart: "restart",
      result: "result",
      results: "results",
      rotate: "rotate",
      rx: "rx",
      ry: "ry",
      scale: "scale",
      security: "security",
      seed: "seed",
      shaperendering: "shapeRendering",
      "shape-rendering": "shapeRendering",
      slope: "slope",
      spacing: "spacing",
      specularconstant: "specularConstant",
      specularexponent: "specularExponent",
      speed: "speed",
      spreadmethod: "spreadMethod",
      startoffset: "startOffset",
      stddeviation: "stdDeviation",
      stemh: "stemh",
      stemv: "stemv",
      stitchtiles: "stitchTiles",
      stopcolor: "stopColor",
      "stop-color": "stopColor",
      stopopacity: "stopOpacity",
      "stop-opacity": "stopOpacity",
      strikethroughposition: "strikethroughPosition",
      "strikethrough-position": "strikethroughPosition",
      strikethroughthickness: "strikethroughThickness",
      "strikethrough-thickness": "strikethroughThickness",
      string: "string",
      stroke: "stroke",
      strokedasharray: "strokeDasharray",
      "stroke-dasharray": "strokeDasharray",
      strokedashoffset: "strokeDashoffset",
      "stroke-dashoffset": "strokeDashoffset",
      strokelinecap: "strokeLinecap",
      "stroke-linecap": "strokeLinecap",
      strokelinejoin: "strokeLinejoin",
      "stroke-linejoin": "strokeLinejoin",
      strokemiterlimit: "strokeMiterlimit",
      "stroke-miterlimit": "strokeMiterlimit",
      strokewidth: "strokeWidth",
      "stroke-width": "strokeWidth",
      strokeopacity: "strokeOpacity",
      "stroke-opacity": "strokeOpacity",
      suppresscontenteditablewarning: "suppressContentEditableWarning",
      suppresshydrationwarning: "suppressHydrationWarning",
      surfacescale: "surfaceScale",
      systemlanguage: "systemLanguage",
      tablevalues: "tableValues",
      targetx: "targetX",
      targety: "targetY",
      textanchor: "textAnchor",
      "text-anchor": "textAnchor",
      textdecoration: "textDecoration",
      "text-decoration": "textDecoration",
      textlength: "textLength",
      textrendering: "textRendering",
      "text-rendering": "textRendering",
      to: "to",
      transform: "transform",
      typeof: "typeof",
      u1: "u1",
      u2: "u2",
      underlineposition: "underlinePosition",
      "underline-position": "underlinePosition",
      underlinethickness: "underlineThickness",
      "underline-thickness": "underlineThickness",
      unicode: "unicode",
      unicodebidi: "unicodeBidi",
      "unicode-bidi": "unicodeBidi",
      unicoderange: "unicodeRange",
      "unicode-range": "unicodeRange",
      unitsperem: "unitsPerEm",
      "units-per-em": "unitsPerEm",
      unselectable: "unselectable",
      valphabetic: "vAlphabetic",
      "v-alphabetic": "vAlphabetic",
      values: "values",
      vectoreffect: "vectorEffect",
      "vector-effect": "vectorEffect",
      version: "version",
      vertadvy: "vertAdvY",
      "vert-adv-y": "vertAdvY",
      vertoriginx: "vertOriginX",
      "vert-origin-x": "vertOriginX",
      vertoriginy: "vertOriginY",
      "vert-origin-y": "vertOriginY",
      vhanging: "vHanging",
      "v-hanging": "vHanging",
      videographic: "vIdeographic",
      "v-ideographic": "vIdeographic",
      viewbox: "viewBox",
      viewtarget: "viewTarget",
      visibility: "visibility",
      vmathematical: "vMathematical",
      "v-mathematical": "vMathematical",
      vocab: "vocab",
      widths: "widths",
      wordspacing: "wordSpacing",
      "word-spacing": "wordSpacing",
      writingmode: "writingMode",
      "writing-mode": "writingMode",
      x1: "x1",
      x2: "x2",
      x: "x",
      xchannelselector: "xChannelSelector",
      xheight: "xHeight",
      "x-height": "xHeight",
      xlinkactuate: "xlinkActuate",
      "xlink:actuate": "xlinkActuate",
      xlinkarcrole: "xlinkArcrole",
      "xlink:arcrole": "xlinkArcrole",
      xlinkhref: "xlinkHref",
      "xlink:href": "xlinkHref",
      xlinkrole: "xlinkRole",
      "xlink:role": "xlinkRole",
      xlinkshow: "xlinkShow",
      "xlink:show": "xlinkShow",
      xlinktitle: "xlinkTitle",
      "xlink:title": "xlinkTitle",
      xlinktype: "xlinkType",
      "xlink:type": "xlinkType",
      xmlbase: "xmlBase",
      "xml:base": "xmlBase",
      xmllang: "xmlLang",
      "xml:lang": "xmlLang",
      xmlns: "xmlns",
      "xml:space": "xmlSpace",
      xmlnsxlink: "xmlnsXlink",
      "xmlns:xlink": "xmlnsXlink",
      xmlspace: "xmlSpace",
      y1: "y1",
      y2: "y2",
      y: "y",
      ychannelselector: "yChannelSelector",
      z: "z",
      zoomandpan: "zoomAndPan"
    }, mv = {
      "aria-current": 0,
      "aria-description": 0,
      "aria-details": 0,
      "aria-disabled": 0,
      "aria-hidden": 0,
      "aria-invalid": 0,
      "aria-keyshortcuts": 0,
      "aria-label": 0,
      "aria-roledescription": 0,
      "aria-autocomplete": 0,
      "aria-checked": 0,
      "aria-expanded": 0,
      "aria-haspopup": 0,
      "aria-level": 0,
      "aria-modal": 0,
      "aria-multiline": 0,
      "aria-multiselectable": 0,
      "aria-orientation": 0,
      "aria-placeholder": 0,
      "aria-pressed": 0,
      "aria-readonly": 0,
      "aria-required": 0,
      "aria-selected": 0,
      "aria-sort": 0,
      "aria-valuemax": 0,
      "aria-valuemin": 0,
      "aria-valuenow": 0,
      "aria-valuetext": 0,
      "aria-atomic": 0,
      "aria-busy": 0,
      "aria-live": 0,
      "aria-relevant": 0,
      "aria-dropeffect": 0,
      "aria-grabbed": 0,
      "aria-activedescendant": 0,
      "aria-colcount": 0,
      "aria-colindex": 0,
      "aria-colspan": 0,
      "aria-controls": 0,
      "aria-describedby": 0,
      "aria-errormessage": 0,
      "aria-flowto": 0,
      "aria-labelledby": 0,
      "aria-owns": 0,
      "aria-posinset": 0,
      "aria-rowcount": 0,
      "aria-rowindex": 0,
      "aria-rowspan": 0,
      "aria-setsize": 0
    }, ei = {}, Kf = new RegExp("^(aria)-[" + xe + "]*$"), ts = new RegExp("^(aria)[A-Z][" + xe + "]*$");
    function Zf(e, t) {
      {
        if (In.call(ei, t) && ei[t])
          return !0;
        if (ts.test(t)) {
          var a = "aria-" + t.slice(4).toLowerCase(), i = mv.hasOwnProperty(a) ? a : null;
          if (i == null)
            return S("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", t), ei[t] = !0, !0;
          if (t !== i)
            return S("Invalid ARIA attribute `%s`. Did you mean `%s`?", t, i), ei[t] = !0, !0;
        }
        if (Kf.test(t)) {
          var u = t.toLowerCase(), s = mv.hasOwnProperty(u) ? u : null;
          if (s == null)
            return ei[t] = !0, !1;
          if (t !== s)
            return S("Unknown ARIA attribute `%s`. Did you mean `%s`?", t, s), ei[t] = !0, !0;
        }
      }
      return !0;
    }
    function yv(e, t) {
      {
        var a = [];
        for (var i in t) {
          var u = Zf(e, i);
          u || a.push(i);
        }
        var s = a.map(function(f) {
          return "`" + f + "`";
        }).join(", ");
        a.length === 1 ? S("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", s, e) : a.length > 1 && S("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", s, e);
      }
    }
    function uc(e, t) {
      Ui(e, t) || yv(e, t);
    }
    var eu = !1;
    function Jf(e, t) {
      {
        if (e !== "input" && e !== "textarea" && e !== "select")
          return;
        t != null && t.value === null && !eu && (eu = !0, e === "select" && t.multiple ? S("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", e) : S("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", e));
      }
    }
    var ed = function() {
    };
    {
      var Gn = {}, td = /^on./, gv = /^on[^A-Z]/, Sv = new RegExp("^(aria)-[" + xe + "]*$"), Ev = new RegExp("^(aria)[A-Z][" + xe + "]*$");
      ed = function(e, t, a, i) {
        if (In.call(Gn, t) && Gn[t])
          return !0;
        var u = t.toLowerCase();
        if (u === "onfocusin" || u === "onfocusout")
          return S("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React."), Gn[t] = !0, !0;
        if (i != null) {
          var s = i.registrationNameDependencies, f = i.possibleRegistrationNames;
          if (s.hasOwnProperty(t))
            return !0;
          var p = f.hasOwnProperty(u) ? f[u] : null;
          if (p != null)
            return S("Invalid event handler property `%s`. Did you mean `%s`?", t, p), Gn[t] = !0, !0;
          if (td.test(t))
            return S("Unknown event handler property `%s`. It will be ignored.", t), Gn[t] = !0, !0;
        } else if (td.test(t))
          return gv.test(t) && S("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", t), Gn[t] = !0, !0;
        if (Sv.test(t) || Ev.test(t))
          return !0;
        if (u === "innerhtml")
          return S("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`."), Gn[t] = !0, !0;
        if (u === "aria")
          return S("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead."), Gn[t] = !0, !0;
        if (u === "is" && a !== null && a !== void 0 && typeof a != "string")
          return S("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof a), Gn[t] = !0, !0;
        if (typeof a == "number" && isNaN(a))
          return S("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", t), Gn[t] = !0, !0;
        var v = _r(t), y = v !== null && v.type === ca;
        if (lc.hasOwnProperty(u)) {
          var g = lc[u];
          if (g !== t)
            return S("Invalid DOM property `%s`. Did you mean `%s`?", t, g), Gn[t] = !0, !0;
        } else if (!y && t !== u)
          return S("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", t, u), Gn[t] = !0, !0;
        return typeof a == "boolean" && yr(t, a, v, !1) ? (a ? S('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', a, t, t, a, t) : S('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', a, t, t, a, t, t, t), Gn[t] = !0, !0) : y ? !0 : yr(t, a, v, !1) ? (Gn[t] = !0, !1) : ((a === "false" || a === "true") && v !== null && v.type === vn && (S("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", a, t, a === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', t, a), Gn[t] = !0), !0);
      };
    }
    var Cv = function(e, t, a) {
      {
        var i = [];
        for (var u in t) {
          var s = ed(e, u, t[u], a);
          s || i.push(u);
        }
        var f = i.map(function(p) {
          return "`" + p + "`";
        }).join(", ");
        i.length === 1 ? S("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", f, e) : i.length > 1 && S("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", f, e);
      }
    };
    function Rv(e, t, a) {
      Ui(e, t) || Cv(e, t, a);
    }
    var Ai = 1, ns = 1 << 1, tu = 1 << 2, qm = Ai | ns | tu, rs = null;
    function as(e) {
      rs !== null && S("Expected currently replaying event to be null. This error is likely caused by a bug in React. Please file an issue."), rs = e;
    }
    function Xm() {
      rs === null && S("Expected currently replaying event to not be null. This error is likely caused by a bug in React. Please file an issue."), rs = null;
    }
    function Tv(e) {
      return e === rs;
    }
    function oc(e) {
      var t = e.target || e.srcElement || window;
      return t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === zi ? t.parentNode : t;
    }
    var Kt = null, Sl = null, Fi = null;
    function ro(e) {
      var t = Oo(e);
      if (!!t) {
        if (typeof Kt != "function")
          throw new Error("setRestoreImplementation() needs to be called to handle a target for controlled events. This error is likely caused by a bug in React. Please file an issue.");
        var a = t.stateNode;
        if (a) {
          var i = Th(a);
          Kt(t.stateNode, t.type, i);
        }
      }
    }
    function wv(e) {
      Kt = e;
    }
    function sc(e) {
      Sl ? Fi ? Fi.push(e) : Fi = [e] : Sl = e;
    }
    function is() {
      return Sl !== null || Fi !== null;
    }
    function ls() {
      if (!!Sl) {
        var e = Sl, t = Fi;
        if (Sl = null, Fi = null, ro(e), t)
          for (var a = 0; a < t.length; a++)
            ro(t[a]);
      }
    }
    var nu = function(e, t) {
      return e(t);
    }, nd = function() {
    }, rd = !1;
    function Km() {
      var e = is();
      e && (nd(), ls());
    }
    function ad(e, t, a) {
      if (rd)
        return e(t, a);
      rd = !0;
      try {
        return nu(e, t, a);
      } finally {
        rd = !1, Km();
      }
    }
    function cc(e, t, a) {
      nu = e, nd = a;
    }
    function fc(e) {
      return e === "button" || e === "input" || e === "select" || e === "textarea";
    }
    function id(e, t, a) {
      switch (e) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          return !!(a.disabled && fc(t));
        default:
          return !1;
      }
    }
    function ru(e, t) {
      var a = e.stateNode;
      if (a === null)
        return null;
      var i = Th(a);
      if (i === null)
        return null;
      var u = i[t];
      if (id(t, e.type, i))
        return null;
      if (u && typeof u != "function")
        throw new Error("Expected `" + t + "` listener to be a function, instead got a value of `" + typeof u + "` type.");
      return u;
    }
    var us = !1;
    if (pn)
      try {
        var au = {};
        Object.defineProperty(au, "passive", {
          get: function() {
            us = !0;
          }
        }), window.addEventListener("test", au, au), window.removeEventListener("test", au, au);
      } catch {
        us = !1;
      }
    function xv(e, t, a, i, u, s, f, p, v) {
      var y = Array.prototype.slice.call(arguments, 3);
      try {
        t.apply(a, y);
      } catch (g) {
        this.onError(g);
      }
    }
    var ld = xv;
    if (typeof window < "u" && typeof window.dispatchEvent == "function" && typeof document < "u" && typeof document.createEvent == "function") {
      var ud = document.createElement("react");
      ld = function(t, a, i, u, s, f, p, v, y) {
        if (typeof document > "u" || document === null)
          throw new Error("The `document` global was defined when React was initialized, but is not defined anymore. This can happen in a test environment if a component schedules an update from an asynchronous callback, but the test has already finished running. To solve this, you can either unmount the component at the end of your test (and ensure that any asynchronous operations get canceled in `componentWillUnmount`), or you can change the test itself to be asynchronous.");
        var g = document.createEvent("Event"), b = !1, x = !0, M = window.event, z = Object.getOwnPropertyDescriptor(window, "event");
        function H() {
          ud.removeEventListener(j, Oe, !1), typeof window.event < "u" && window.hasOwnProperty("event") && (window.event = M);
        }
        var fe = Array.prototype.slice.call(arguments, 3);
        function Oe() {
          b = !0, H(), a.apply(i, fe), x = !1;
        }
        var Te, St = !1, pt = !1;
        function k(O) {
          if (Te = O.error, St = !0, Te === null && O.colno === 0 && O.lineno === 0 && (pt = !0), O.defaultPrevented && Te != null && typeof Te == "object")
            try {
              Te._suppressLogging = !0;
            } catch {
            }
        }
        var j = "react-" + (t || "invokeguardedcallback");
        if (window.addEventListener("error", k), ud.addEventListener(j, Oe, !1), g.initEvent(j, !1, !1), ud.dispatchEvent(g), z && Object.defineProperty(window, "event", z), b && x && (St ? pt && (Te = new Error("A cross-origin error was thrown. React doesn't have access to the actual error object in development. See https://reactjs.org/link/crossorigin-error for more information.")) : Te = new Error(`An error was thrown inside one of your components, but React doesn't know what it was. This is likely due to browser flakiness. React does its best to preserve the "Pause on exceptions" behavior of the DevTools, which requires some DEV-mode only tricks. It's possible that these don't work in your browser. Try triggering the error in production mode, or switching to a modern browser. If you suspect that this is actually an issue with React, please file an issue.`), this.onError(Te)), window.removeEventListener("error", k), !b)
          return H(), xv.apply(this, arguments);
      };
    }
    var Zm = ld, El = !1, ti = null, os = !1, Cl = null, hi = {
      onError: function(e) {
        El = !0, ti = e;
      }
    };
    function iu(e, t, a, i, u, s, f, p, v) {
      El = !1, ti = null, Zm.apply(hi, arguments);
    }
    function Hi(e, t, a, i, u, s, f, p, v) {
      if (iu.apply(this, arguments), El) {
        var y = sd();
        os || (os = !0, Cl = y);
      }
    }
    function od() {
      if (os) {
        var e = Cl;
        throw os = !1, Cl = null, e;
      }
    }
    function Jm() {
      return El;
    }
    function sd() {
      if (El) {
        var e = ti;
        return El = !1, ti = null, e;
      } else
        throw new Error("clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.");
    }
    function Oa(e) {
      return e._reactInternals;
    }
    function ss(e) {
      return e._reactInternals !== void 0;
    }
    function ao(e, t) {
      e._reactInternals = t;
    }
    var De = 0, Rl = 1, rn = 2, Ke = 4, Mt = 16, jt = 32, mi = 64, Ve = 128, Tn = 256, Kr = 512, La = 1024, sn = 2048, Ma = 4096, Tl = 8192, cs = 16384, dc = sn | Ke | mi | Kr | La | cs, _v = 32767, ha = 32768, qn = 65536, fs = 131072, cd = 1048576, fd = 2097152, Zr = 4194304, wl = 8388608, Jr = 16777216, lu = 33554432, io = Ke | La | 0, ea = rn | Ke | Mt | jt | Kr | Ma | Tl, gr = Ke | mi | Kr | Tl, Na = sn | Mt, rr = Zr | wl | fd, ji = A.ReactCurrentOwner;
    function ma(e) {
      var t = e, a = e;
      if (e.alternate)
        for (; t.return; )
          t = t.return;
      else {
        var i = t;
        do
          t = i, (t.flags & (rn | Ma)) !== De && (a = t.return), i = t.return;
        while (i);
      }
      return t.tag === re ? a : null;
    }
    function dd(e) {
      if (e.tag === _e) {
        var t = e.memoizedState;
        if (t === null) {
          var a = e.alternate;
          a !== null && (t = a.memoizedState);
        }
        if (t !== null)
          return t.dehydrated;
      }
      return null;
    }
    function pc(e) {
      return e.tag === re ? e.stateNode.containerInfo : null;
    }
    function pd(e) {
      return ma(e) === e;
    }
    function ya(e) {
      {
        var t = ji.current;
        if (t !== null && t.tag === pe) {
          var a = t, i = a.stateNode;
          i._warnedAboutRefsInRender || S("%s is accessing isMounted inside its render() function. render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", Ye(a) || "A component"), i._warnedAboutRefsInRender = !0;
        }
      }
      var u = Oa(e);
      return u ? ma(u) === u : !1;
    }
    function ta(e) {
      if (ma(e) !== e)
        throw new Error("Unable to find node on an unmounted component.");
    }
    function an(e) {
      var t = e.alternate;
      if (!t) {
        var a = ma(e);
        if (a === null)
          throw new Error("Unable to find node on an unmounted component.");
        return a !== e ? null : e;
      }
      for (var i = e, u = t; ; ) {
        var s = i.return;
        if (s === null)
          break;
        var f = s.alternate;
        if (f === null) {
          var p = s.return;
          if (p !== null) {
            i = u = p;
            continue;
          }
          break;
        }
        if (s.child === f.child) {
          for (var v = s.child; v; ) {
            if (v === i)
              return ta(s), e;
            if (v === u)
              return ta(s), t;
            v = v.sibling;
          }
          throw new Error("Unable to find node on an unmounted component.");
        }
        if (i.return !== u.return)
          i = s, u = f;
        else {
          for (var y = !1, g = s.child; g; ) {
            if (g === i) {
              y = !0, i = s, u = f;
              break;
            }
            if (g === u) {
              y = !0, u = s, i = f;
              break;
            }
            g = g.sibling;
          }
          if (!y) {
            for (g = f.child; g; ) {
              if (g === i) {
                y = !0, i = f, u = s;
                break;
              }
              if (g === u) {
                y = !0, u = f, i = s;
                break;
              }
              g = g.sibling;
            }
            if (!y)
              throw new Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
          }
        }
        if (i.alternate !== u)
          throw new Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
      }
      if (i.tag !== re)
        throw new Error("Unable to find node on an unmounted component.");
      return i.stateNode.current === i ? e : t;
    }
    function za(e) {
      var t = an(e);
      return t !== null ? vd(t) : null;
    }
    function vd(e) {
      if (e.tag === ie || e.tag === Pe)
        return e;
      for (var t = e.child; t !== null; ) {
        var a = vd(t);
        if (a !== null)
          return a;
        t = t.sibling;
      }
      return null;
    }
    function bv(e) {
      var t = an(e);
      return t !== null ? vc(t) : null;
    }
    function vc(e) {
      if (e.tag === ie || e.tag === Pe)
        return e;
      for (var t = e.child; t !== null; ) {
        if (t.tag !== me) {
          var a = vc(t);
          if (a !== null)
            return a;
        }
        t = t.sibling;
      }
      return null;
    }
    var hc = q.unstable_scheduleCallback, Dv = q.unstable_cancelCallback, mc = q.unstable_shouldYield, kv = q.unstable_requestPaint, yn = q.unstable_now, hd = q.unstable_getCurrentPriorityLevel, yc = q.unstable_ImmediatePriority, ga = q.unstable_UserBlockingPriority, yi = q.unstable_NormalPriority, gc = q.unstable_LowPriority, xl = q.unstable_IdlePriority, md = q.unstable_yieldValue, yd = q.unstable_setDisableYieldValue, _l = null, Xn = null, te = null, kn = !1, ar = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u";
    function gd(e) {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u")
        return !1;
      var t = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (t.isDisabled)
        return !0;
      if (!t.supportsFiber)
        return S("The installed version of React DevTools is too old and will not work with the current version of React. Please update React DevTools. https://reactjs.org/link/react-devtools"), !0;
      try {
        ht && (e = lt({}, e, {
          getLaneLabelMap: Dl,
          injectProfilingHooks: Vi
        })), _l = t.inject(e), Xn = t;
      } catch (a) {
        S("React instrumentation encountered an error: %s.", a);
      }
      return !!t.checkDCE;
    }
    function Ov(e, t) {
      if (Xn && typeof Xn.onScheduleFiberRoot == "function")
        try {
          Xn.onScheduleFiberRoot(_l, e, t);
        } catch (a) {
          kn || (kn = !0, S("React instrumentation encountered an error: %s", a));
        }
    }
    function Pi(e, t) {
      if (Xn && typeof Xn.onCommitFiberRoot == "function")
        try {
          var a = (e.current.flags & Ve) === Ve;
          if (et) {
            var i;
            switch (t) {
              case Sr:
                i = yc;
                break;
              case ir:
                i = ga;
                break;
              case $i:
                i = yi;
                break;
              case Es:
                i = xl;
                break;
              default:
                i = yi;
                break;
            }
            Xn.onCommitFiberRoot(_l, e, i, a);
          }
        } catch (u) {
          kn || (kn = !0, S("React instrumentation encountered an error: %s", u));
        }
    }
    function bl(e) {
      if (Xn && typeof Xn.onPostCommitFiberRoot == "function")
        try {
          Xn.onPostCommitFiberRoot(_l, e);
        } catch (t) {
          kn || (kn = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function Sd(e) {
      if (Xn && typeof Xn.onCommitFiberUnmount == "function")
        try {
          Xn.onCommitFiberUnmount(_l, e);
        } catch (t) {
          kn || (kn = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function jn(e) {
      if (typeof md == "function" && (yd(e), Yt(e)), Xn && typeof Xn.setStrictMode == "function")
        try {
          Xn.setStrictMode(_l, e);
        } catch (t) {
          kn || (kn = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function Vi(e) {
      te = e;
    }
    function Dl() {
      {
        for (var e = /* @__PURE__ */ new Map(), t = 1, a = 0; a < ln; a++) {
          var i = ey(t);
          e.set(t, i), t *= 2;
        }
        return e;
      }
    }
    function Sc(e) {
      te !== null && typeof te.markCommitStarted == "function" && te.markCommitStarted(e);
    }
    function Ed() {
      te !== null && typeof te.markCommitStopped == "function" && te.markCommitStopped();
    }
    function kl(e) {
      te !== null && typeof te.markComponentRenderStarted == "function" && te.markComponentRenderStarted(e);
    }
    function uu() {
      te !== null && typeof te.markComponentRenderStopped == "function" && te.markComponentRenderStopped();
    }
    function Lv(e) {
      te !== null && typeof te.markComponentPassiveEffectMountStarted == "function" && te.markComponentPassiveEffectMountStarted(e);
    }
    function Cd() {
      te !== null && typeof te.markComponentPassiveEffectMountStopped == "function" && te.markComponentPassiveEffectMountStopped();
    }
    function Ec(e) {
      te !== null && typeof te.markComponentPassiveEffectUnmountStarted == "function" && te.markComponentPassiveEffectUnmountStarted(e);
    }
    function Mv() {
      te !== null && typeof te.markComponentPassiveEffectUnmountStopped == "function" && te.markComponentPassiveEffectUnmountStopped();
    }
    function Nv(e) {
      te !== null && typeof te.markComponentLayoutEffectMountStarted == "function" && te.markComponentLayoutEffectMountStarted(e);
    }
    function zv() {
      te !== null && typeof te.markComponentLayoutEffectMountStopped == "function" && te.markComponentLayoutEffectMountStopped();
    }
    function Cc(e) {
      te !== null && typeof te.markComponentLayoutEffectUnmountStarted == "function" && te.markComponentLayoutEffectUnmountStarted(e);
    }
    function lo() {
      te !== null && typeof te.markComponentLayoutEffectUnmountStopped == "function" && te.markComponentLayoutEffectUnmountStopped();
    }
    function Rc(e, t, a) {
      te !== null && typeof te.markComponentErrored == "function" && te.markComponentErrored(e, t, a);
    }
    function Uv(e, t, a) {
      te !== null && typeof te.markComponentSuspended == "function" && te.markComponentSuspended(e, t, a);
    }
    function Av(e) {
      te !== null && typeof te.markLayoutEffectsStarted == "function" && te.markLayoutEffectsStarted(e);
    }
    function uo() {
      te !== null && typeof te.markLayoutEffectsStopped == "function" && te.markLayoutEffectsStopped();
    }
    function Fv(e) {
      te !== null && typeof te.markPassiveEffectsStarted == "function" && te.markPassiveEffectsStarted(e);
    }
    function ds() {
      te !== null && typeof te.markPassiveEffectsStopped == "function" && te.markPassiveEffectsStopped();
    }
    function ni(e) {
      te !== null && typeof te.markRenderStarted == "function" && te.markRenderStarted(e);
    }
    function ps() {
      te !== null && typeof te.markRenderYielded == "function" && te.markRenderYielded();
    }
    function oo() {
      te !== null && typeof te.markRenderStopped == "function" && te.markRenderStopped();
    }
    function ou(e) {
      te !== null && typeof te.markRenderScheduled == "function" && te.markRenderScheduled(e);
    }
    function Rd(e, t) {
      te !== null && typeof te.markForceUpdateScheduled == "function" && te.markForceUpdateScheduled(e, t);
    }
    function Ol(e, t) {
      te !== null && typeof te.markStateUpdateScheduled == "function" && te.markStateUpdateScheduled(e, t);
    }
    var Me = 0, ot = 1, ze = 2, gn = 8, Ua = 16, Tc = Math.clz32 ? Math.clz32 : su, wc = Math.log, Td = Math.LN2;
    function su(e) {
      var t = e >>> 0;
      return t === 0 ? 32 : 31 - (wc(t) / Td | 0) | 0;
    }
    var ln = 31, P = 0, yt = 0, Ae = 1, gi = 2, Sa = 4, cu = 8, un = 16, fu = 32, Ll = 4194240, du = 64, Aa = 128, na = 256, pu = 512, vs = 1024, hs = 2048, xc = 4096, _c = 8192, bc = 16384, Dc = 32768, kc = 65536, Oc = 131072, Lc = 262144, Mc = 524288, vu = 1048576, Nc = 2097152, hu = 130023424, Bi = 4194304, zc = 8388608, ms = 16777216, Uc = 33554432, Ac = 67108864, wd = Bi, so = 134217728, Fc = 268435455, co = 268435456, Ml = 536870912, ra = 1073741824;
    function ey(e) {
      {
        if (e & Ae)
          return "Sync";
        if (e & gi)
          return "InputContinuousHydration";
        if (e & Sa)
          return "InputContinuous";
        if (e & cu)
          return "DefaultHydration";
        if (e & un)
          return "Default";
        if (e & fu)
          return "TransitionHydration";
        if (e & Ll)
          return "Transition";
        if (e & hu)
          return "Retry";
        if (e & so)
          return "SelectiveHydration";
        if (e & co)
          return "IdleHydration";
        if (e & Ml)
          return "Idle";
        if (e & ra)
          return "Offscreen";
      }
    }
    var Zt = -1, Hc = du, jc = Bi;
    function fo(e) {
      switch (zn(e)) {
        case Ae:
          return Ae;
        case gi:
          return gi;
        case Sa:
          return Sa;
        case cu:
          return cu;
        case un:
          return un;
        case fu:
          return fu;
        case du:
        case Aa:
        case na:
        case pu:
        case vs:
        case hs:
        case xc:
        case _c:
        case bc:
        case Dc:
        case kc:
        case Oc:
        case Lc:
        case Mc:
        case vu:
        case Nc:
          return e & Ll;
        case Bi:
        case zc:
        case ms:
        case Uc:
        case Ac:
          return e & hu;
        case so:
          return so;
        case co:
          return co;
        case Ml:
          return Ml;
        case ra:
          return ra;
        default:
          return S("Should have found matching lanes. This is a bug in React."), e;
      }
    }
    function ys(e, t) {
      var a = e.pendingLanes;
      if (a === P)
        return P;
      var i = P, u = e.suspendedLanes, s = e.pingedLanes, f = a & Fc;
      if (f !== P) {
        var p = f & ~u;
        if (p !== P)
          i = fo(p);
        else {
          var v = f & s;
          v !== P && (i = fo(v));
        }
      } else {
        var y = a & ~u;
        y !== P ? i = fo(y) : s !== P && (i = fo(s));
      }
      if (i === P)
        return P;
      if (t !== P && t !== i && (t & u) === P) {
        var g = zn(i), b = zn(t);
        if (g >= b || g === un && (b & Ll) !== P)
          return t;
      }
      (i & Sa) !== P && (i |= a & un);
      var x = e.entangledLanes;
      if (x !== P)
        for (var M = e.entanglements, z = i & x; z > 0; ) {
          var H = Nl(z), fe = 1 << H;
          i |= M[H], z &= ~fe;
        }
      return i;
    }
    function Hv(e, t) {
      for (var a = e.eventTimes, i = Zt; t > 0; ) {
        var u = Nl(t), s = 1 << u, f = a[u];
        f > i && (i = f), t &= ~s;
      }
      return i;
    }
    function Pc(e, t) {
      switch (e) {
        case Ae:
        case gi:
        case Sa:
          return t + 250;
        case cu:
        case un:
        case fu:
        case du:
        case Aa:
        case na:
        case pu:
        case vs:
        case hs:
        case xc:
        case _c:
        case bc:
        case Dc:
        case kc:
        case Oc:
        case Lc:
        case Mc:
        case vu:
        case Nc:
          return t + 5e3;
        case Bi:
        case zc:
        case ms:
        case Uc:
        case Ac:
          return Zt;
        case so:
        case co:
        case Ml:
        case ra:
          return Zt;
        default:
          return S("Should have found matching lanes. This is a bug in React."), Zt;
      }
    }
    function ty(e, t) {
      for (var a = e.pendingLanes, i = e.suspendedLanes, u = e.pingedLanes, s = e.expirationTimes, f = a; f > 0; ) {
        var p = Nl(f), v = 1 << p, y = s[p];
        y === Zt ? ((v & i) === P || (v & u) !== P) && (s[p] = Pc(v, t)) : y <= t && (e.expiredLanes |= v), f &= ~v;
      }
    }
    function ny(e) {
      return fo(e.pendingLanes);
    }
    function xd(e) {
      var t = e.pendingLanes & ~ra;
      return t !== P ? t : t & ra ? ra : P;
    }
    function po(e) {
      return (e & Ae) !== P;
    }
    function gs(e) {
      return (e & Fc) !== P;
    }
    function Vc(e) {
      return (e & hu) === e;
    }
    function ry(e) {
      var t = Ae | Sa | un;
      return (e & t) === P;
    }
    function jv(e) {
      return (e & Ll) === e;
    }
    function Ss(e, t) {
      var a = gi | Sa | cu | un;
      return (t & a) !== P;
    }
    function Pv(e, t) {
      return (t & e.expiredLanes) !== P;
    }
    function _d(e) {
      return (e & Ll) !== P;
    }
    function bd() {
      var e = Hc;
      return Hc <<= 1, (Hc & Ll) === P && (Hc = du), e;
    }
    function ay() {
      var e = jc;
      return jc <<= 1, (jc & hu) === P && (jc = Bi), e;
    }
    function zn(e) {
      return e & -e;
    }
    function Pn(e) {
      return zn(e);
    }
    function Nl(e) {
      return 31 - Tc(e);
    }
    function Bc(e) {
      return Nl(e);
    }
    function aa(e, t) {
      return (e & t) !== P;
    }
    function mu(e, t) {
      return (e & t) === t;
    }
    function Ze(e, t) {
      return e | t;
    }
    function vo(e, t) {
      return e & ~t;
    }
    function Dd(e, t) {
      return e & t;
    }
    function Vv(e) {
      return e;
    }
    function Bv(e, t) {
      return e !== yt && e < t ? e : t;
    }
    function $c(e) {
      for (var t = [], a = 0; a < ln; a++)
        t.push(e);
      return t;
    }
    function yu(e, t, a) {
      e.pendingLanes |= t, t !== Ml && (e.suspendedLanes = P, e.pingedLanes = P);
      var i = e.eventTimes, u = Bc(t);
      i[u] = a;
    }
    function kd(e, t) {
      e.suspendedLanes |= t, e.pingedLanes &= ~t;
      for (var a = e.expirationTimes, i = t; i > 0; ) {
        var u = Nl(i), s = 1 << u;
        a[u] = Zt, i &= ~s;
      }
    }
    function Od(e, t, a) {
      e.pingedLanes |= e.suspendedLanes & t;
    }
    function Ld(e, t) {
      var a = e.pendingLanes & ~t;
      e.pendingLanes = t, e.suspendedLanes = P, e.pingedLanes = P, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t;
      for (var i = e.entanglements, u = e.eventTimes, s = e.expirationTimes, f = a; f > 0; ) {
        var p = Nl(f), v = 1 << p;
        i[p] = P, u[p] = Zt, s[p] = Zt, f &= ~v;
      }
    }
    function ho(e, t) {
      for (var a = e.entangledLanes |= t, i = e.entanglements, u = a; u; ) {
        var s = Nl(u), f = 1 << s;
        f & t | i[s] & t && (i[s] |= t), u &= ~f;
      }
    }
    function iy(e, t) {
      var a = zn(t), i;
      switch (a) {
        case Sa:
          i = gi;
          break;
        case un:
          i = cu;
          break;
        case du:
        case Aa:
        case na:
        case pu:
        case vs:
        case hs:
        case xc:
        case _c:
        case bc:
        case Dc:
        case kc:
        case Oc:
        case Lc:
        case Mc:
        case vu:
        case Nc:
        case Bi:
        case zc:
        case ms:
        case Uc:
        case Ac:
          i = fu;
          break;
        case Ml:
          i = co;
          break;
        default:
          i = yt;
          break;
      }
      return (i & (e.suspendedLanes | t)) !== yt ? yt : i;
    }
    function Md(e, t, a) {
      if (!!ar)
        for (var i = e.pendingUpdatersLaneMap; a > 0; ) {
          var u = Bc(a), s = 1 << u, f = i[u];
          f.add(t), a &= ~s;
        }
    }
    function Yc(e, t) {
      if (!!ar)
        for (var a = e.pendingUpdatersLaneMap, i = e.memoizedUpdaters; t > 0; ) {
          var u = Bc(t), s = 1 << u, f = a[u];
          f.size > 0 && (f.forEach(function(p) {
            var v = p.alternate;
            (v === null || !i.has(v)) && i.add(p);
          }), f.clear()), t &= ~s;
        }
    }
    function Nd(e, t) {
      return null;
    }
    var Sr = Ae, ir = Sa, $i = un, Es = Ml, gu = yt;
    function Fa() {
      return gu;
    }
    function Vn(e) {
      gu = e;
    }
    function Cs(e, t) {
      var a = gu;
      try {
        return gu = e, t();
      } finally {
        gu = a;
      }
    }
    function Er(e, t) {
      return e !== 0 && e < t ? e : t;
    }
    function ly(e, t) {
      return e === 0 || e > t ? e : t;
    }
    function zd(e, t) {
      return e !== 0 && e < t;
    }
    function Rs(e) {
      var t = zn(e);
      return zd(Sr, t) ? zd(ir, t) ? gs(t) ? $i : Es : ir : Sr;
    }
    function Bn(e) {
      var t = e.current.memoizedState;
      return t.isDehydrated;
    }
    var $v;
    function ve(e) {
      $v = e;
    }
    function mo(e) {
      $v(e);
    }
    var Ts;
    function Yv(e) {
      Ts = e;
    }
    var Iv;
    function ws(e) {
      Iv = e;
    }
    var xs;
    function Ud(e) {
      xs = e;
    }
    var Ad;
    function Qv(e) {
      Ad = e;
    }
    var Ic = !1, yo = [], Si = null, cn = null, Kn = null, Ha = /* @__PURE__ */ new Map(), go = /* @__PURE__ */ new Map(), Yi = [], ri = [
      "mousedown",
      "mouseup",
      "touchcancel",
      "touchend",
      "touchstart",
      "auxclick",
      "dblclick",
      "pointercancel",
      "pointerdown",
      "pointerup",
      "dragend",
      "dragstart",
      "drop",
      "compositionend",
      "compositionstart",
      "keydown",
      "keypress",
      "keyup",
      "input",
      "textInput",
      "copy",
      "cut",
      "paste",
      "click",
      "change",
      "contextmenu",
      "reset",
      "submit"
    ];
    function Wv(e) {
      return ri.indexOf(e) > -1;
    }
    function Ei(e, t, a, i, u) {
      return {
        blockedOn: e,
        domEventName: t,
        eventSystemFlags: a,
        nativeEvent: u,
        targetContainers: [i]
      };
    }
    function Gv(e, t) {
      switch (e) {
        case "focusin":
        case "focusout":
          Si = null;
          break;
        case "dragenter":
        case "dragleave":
          cn = null;
          break;
        case "mouseover":
        case "mouseout":
          Kn = null;
          break;
        case "pointerover":
        case "pointerout": {
          var a = t.pointerId;
          Ha.delete(a);
          break;
        }
        case "gotpointercapture":
        case "lostpointercapture": {
          var i = t.pointerId;
          go.delete(i);
          break;
        }
      }
    }
    function So(e, t, a, i, u, s) {
      if (e === null || e.nativeEvent !== s) {
        var f = Ei(t, a, i, u, s);
        if (t !== null) {
          var p = Oo(t);
          p !== null && Ts(p);
        }
        return f;
      }
      e.eventSystemFlags |= i;
      var v = e.targetContainers;
      return u !== null && v.indexOf(u) === -1 && v.push(u), e;
    }
    function qv(e, t, a, i, u) {
      switch (t) {
        case "focusin": {
          var s = u;
          return Si = So(Si, e, t, a, i, s), !0;
        }
        case "dragenter": {
          var f = u;
          return cn = So(cn, e, t, a, i, f), !0;
        }
        case "mouseover": {
          var p = u;
          return Kn = So(Kn, e, t, a, i, p), !0;
        }
        case "pointerover": {
          var v = u, y = v.pointerId;
          return Ha.set(y, So(Ha.get(y) || null, e, t, a, i, v)), !0;
        }
        case "gotpointercapture": {
          var g = u, b = g.pointerId;
          return go.set(b, So(go.get(b) || null, e, t, a, i, g)), !0;
        }
      }
      return !1;
    }
    function Fd(e) {
      var t = zs(e.target);
      if (t !== null) {
        var a = ma(t);
        if (a !== null) {
          var i = a.tag;
          if (i === _e) {
            var u = dd(a);
            if (u !== null) {
              e.blockedOn = u, Ad(e.priority, function() {
                Iv(a);
              });
              return;
            }
          } else if (i === re) {
            var s = a.stateNode;
            if (Bn(s)) {
              e.blockedOn = pc(a);
              return;
            }
          }
        }
      }
      e.blockedOn = null;
    }
    function Xv(e) {
      for (var t = xs(), a = {
        blockedOn: null,
        target: e,
        priority: t
      }, i = 0; i < Yi.length && zd(t, Yi[i].priority); i++)
        ;
      Yi.splice(i, 0, a), i === 0 && Fd(a);
    }
    function Qc(e) {
      if (e.blockedOn !== null)
        return !1;
      for (var t = e.targetContainers; t.length > 0; ) {
        var a = t[0], i = Su(e.domEventName, e.eventSystemFlags, a, e.nativeEvent);
        if (i === null) {
          var u = e.nativeEvent, s = new u.constructor(u.type, u);
          as(s), u.target.dispatchEvent(s), Xm();
        } else {
          var f = Oo(i);
          return f !== null && Ts(f), e.blockedOn = i, !1;
        }
        t.shift();
      }
      return !0;
    }
    function _s(e, t, a) {
      Qc(e) && a.delete(t);
    }
    function Hd() {
      Ic = !1, Si !== null && Qc(Si) && (Si = null), cn !== null && Qc(cn) && (cn = null), Kn !== null && Qc(Kn) && (Kn = null), Ha.forEach(_s), go.forEach(_s);
    }
    function Cr(e, t) {
      e.blockedOn === t && (e.blockedOn = null, Ic || (Ic = !0, q.unstable_scheduleCallback(q.unstable_NormalPriority, Hd)));
    }
    function dt(e) {
      if (yo.length > 0) {
        Cr(yo[0], e);
        for (var t = 1; t < yo.length; t++) {
          var a = yo[t];
          a.blockedOn === e && (a.blockedOn = null);
        }
      }
      Si !== null && Cr(Si, e), cn !== null && Cr(cn, e), Kn !== null && Cr(Kn, e);
      var i = function(p) {
        return Cr(p, e);
      };
      Ha.forEach(i), go.forEach(i);
      for (var u = 0; u < Yi.length; u++) {
        var s = Yi[u];
        s.blockedOn === e && (s.blockedOn = null);
      }
      for (; Yi.length > 0; ) {
        var f = Yi[0];
        if (f.blockedOn !== null)
          break;
        Fd(f), f.blockedOn === null && Yi.shift();
      }
    }
    var Sn = A.ReactCurrentBatchConfig, wn = !0;
    function Zn(e) {
      wn = !!e;
    }
    function Ea() {
      return wn;
    }
    function Eo(e, t, a) {
      var i = Lr(t), u;
      switch (i) {
        case Sr:
          u = $n;
          break;
        case ir:
          u = bs;
          break;
        case $i:
        default:
          u = Ii;
          break;
      }
      return u.bind(null, t, a, e);
    }
    function $n(e, t, a, i) {
      var u = Fa(), s = Sn.transition;
      Sn.transition = null;
      try {
        Vn(Sr), Ii(e, t, a, i);
      } finally {
        Vn(u), Sn.transition = s;
      }
    }
    function bs(e, t, a, i) {
      var u = Fa(), s = Sn.transition;
      Sn.transition = null;
      try {
        Vn(ir), Ii(e, t, a, i);
      } finally {
        Vn(u), Sn.transition = s;
      }
    }
    function Ii(e, t, a, i) {
      !wn || Wc(e, t, a, i);
    }
    function Wc(e, t, a, i) {
      var u = Su(e, t, a, i);
      if (u === null) {
        _y(e, t, i, Co, a), Gv(e, i);
        return;
      }
      if (qv(u, e, t, a, i)) {
        i.stopPropagation();
        return;
      }
      if (Gv(e, i), t & tu && Wv(e)) {
        for (; u !== null; ) {
          var s = Oo(u);
          s !== null && mo(s);
          var f = Su(e, t, a, i);
          if (f === null && _y(e, t, i, Co, a), f === u)
            break;
          u = f;
        }
        u !== null && i.stopPropagation();
        return;
      }
      _y(e, t, i, null, a);
    }
    var Co = null;
    function Su(e, t, a, i) {
      Co = null;
      var u = oc(i), s = zs(u);
      if (s !== null) {
        var f = ma(s);
        if (f === null)
          s = null;
        else {
          var p = f.tag;
          if (p === _e) {
            var v = dd(f);
            if (v !== null)
              return v;
            s = null;
          } else if (p === re) {
            var y = f.stateNode;
            if (Bn(y))
              return pc(f);
            s = null;
          } else
            f !== s && (s = null);
        }
      }
      return Co = s, null;
    }
    function Lr(e) {
      switch (e) {
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return Sr;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "toggle":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return ir;
        case "message": {
          var t = hd();
          switch (t) {
            case yc:
              return Sr;
            case ga:
              return ir;
            case yi:
            case gc:
              return $i;
            case xl:
              return Es;
            default:
              return $i;
          }
        }
        default:
          return $i;
      }
    }
    function jd(e, t, a) {
      return e.addEventListener(t, a, !1), a;
    }
    function Ro(e, t, a) {
      return e.addEventListener(t, a, !0), a;
    }
    function Qi(e, t, a, i) {
      return e.addEventListener(t, a, {
        capture: !0,
        passive: i
      }), a;
    }
    function Gc(e, t, a, i) {
      return e.addEventListener(t, a, {
        passive: i
      }), a;
    }
    var Eu = null, Ci = null, zl = null;
    function Ul(e) {
      return Eu = e, Ci = Xc(), !0;
    }
    function qc() {
      Eu = null, Ci = null, zl = null;
    }
    function To() {
      if (zl)
        return zl;
      var e, t = Ci, a = t.length, i, u = Xc(), s = u.length;
      for (e = 0; e < a && t[e] === u[e]; e++)
        ;
      var f = a - e;
      for (i = 1; i <= f && t[a - i] === u[s - i]; i++)
        ;
      var p = i > 1 ? 1 - i : void 0;
      return zl = u.slice(e, p), zl;
    }
    function Xc() {
      return "value" in Eu ? Eu.value : Eu.textContent;
    }
    function Cu(e) {
      var t, a = e.keyCode;
      return "charCode" in e ? (t = e.charCode, t === 0 && a === 13 && (t = 13)) : t = a, t === 10 && (t = 13), t >= 32 || t === 13 ? t : 0;
    }
    function Ru() {
      return !0;
    }
    function Rr() {
      return !1;
    }
    function Un(e) {
      function t(a, i, u, s, f) {
        this._reactName = a, this._targetInst = u, this.type = i, this.nativeEvent = s, this.target = f, this.currentTarget = null;
        for (var p in e)
          if (!!e.hasOwnProperty(p)) {
            var v = e[p];
            v ? this[p] = v(s) : this[p] = s[p];
          }
        var y = s.defaultPrevented != null ? s.defaultPrevented : s.returnValue === !1;
        return y ? this.isDefaultPrevented = Ru : this.isDefaultPrevented = Rr, this.isPropagationStopped = Rr, this;
      }
      return lt(t.prototype, {
        preventDefault: function() {
          this.defaultPrevented = !0;
          var a = this.nativeEvent;
          !a || (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = Ru);
        },
        stopPropagation: function() {
          var a = this.nativeEvent;
          !a || (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = Ru);
        },
        persist: function() {
        },
        isPersistent: Ru
      }), t;
    }
    var Tr = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function(e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0
    }, wr = Un(Tr), wo = lt({}, Tr, {
      view: 0,
      detail: 0
    }), Pd = Un(wo), Ds, Vd, ja;
    function Kv(e) {
      e !== ja && (ja && e.type === "mousemove" ? (Ds = e.screenX - ja.screenX, Vd = e.screenY - ja.screenY) : (Ds = 0, Vd = 0), ja = e);
    }
    var xo = lt({}, wo, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: Jc,
      button: 0,
      buttons: 0,
      relatedTarget: function(e) {
        return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
      },
      movementX: function(e) {
        return "movementX" in e ? e.movementX : (Kv(e), Ds);
      },
      movementY: function(e) {
        return "movementY" in e ? e.movementY : Vd;
      }
    }), Al = Un(xo), Bd = lt({}, xo, {
      dataTransfer: 0
    }), Tu = Un(Bd), Zv = lt({}, wo, {
      relatedTarget: 0
    }), Kc = Un(Zv), $d = lt({}, Tr, {
      animationName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), Zc = Un($d), uy = lt({}, Tr, {
      clipboardData: function(e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      }
    }), oy = Un(uy), Jv = lt({}, Tr, {
      data: 0
    }), Yd = Un(Jv), wu = Yd, sy = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    }, _o = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    };
    function eh(e) {
      if (e.key) {
        var t = sy[e.key] || e.key;
        if (t !== "Unidentified")
          return t;
      }
      if (e.type === "keypress") {
        var a = Cu(e);
        return a === 13 ? "Enter" : String.fromCharCode(a);
      }
      return e.type === "keydown" || e.type === "keyup" ? _o[e.keyCode] || "Unidentified" : "";
    }
    var xn = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey"
    };
    function cy(e) {
      var t = this, a = t.nativeEvent;
      if (a.getModifierState)
        return a.getModifierState(e);
      var i = xn[e];
      return i ? !!a[i] : !1;
    }
    function Jc(e) {
      return cy;
    }
    var fy = lt({}, wo, {
      key: eh,
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: Jc,
      charCode: function(e) {
        return e.type === "keypress" ? Cu(e) : 0;
      },
      keyCode: function(e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function(e) {
        return e.type === "keypress" ? Cu(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      }
    }), dy = Un(fy), th = lt({}, xo, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0
    }), Id = Un(th), py = lt({}, wo, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: Jc
    }), Pa = Un(py), Qd = lt({}, Tr, {
      propertyName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), vy = Un(Qd), Fl = lt({}, xo, {
      deltaX: function(e) {
        return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
      },
      deltaY: function(e) {
        return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
      },
      deltaZ: 0,
      deltaMode: 0
    }), ef = Un(Fl), xu = [9, 13, 27, 32], ks = 229, Os = pn && "CompositionEvent" in window, _u = null;
    pn && "documentMode" in document && (_u = document.documentMode);
    var hy = pn && "TextEvent" in window && !_u, tf = pn && (!Os || _u && _u > 8 && _u <= 11), nh = 32, Wd = String.fromCharCode(nh);
    function rh() {
      vr("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), vr("onCompositionEnd", ["compositionend", "focusout", "keydown", "keypress", "keyup", "mousedown"]), vr("onCompositionStart", ["compositionstart", "focusout", "keydown", "keypress", "keyup", "mousedown"]), vr("onCompositionUpdate", ["compositionupdate", "focusout", "keydown", "keypress", "keyup", "mousedown"]);
    }
    var Ls = !1;
    function nf(e) {
      return (e.ctrlKey || e.altKey || e.metaKey) && !(e.ctrlKey && e.altKey);
    }
    function ah(e) {
      switch (e) {
        case "compositionstart":
          return "onCompositionStart";
        case "compositionend":
          return "onCompositionEnd";
        case "compositionupdate":
          return "onCompositionUpdate";
      }
    }
    function Gd(e, t) {
      return e === "keydown" && t.keyCode === ks;
    }
    function ih(e, t) {
      switch (e) {
        case "keyup":
          return xu.indexOf(t.keyCode) !== -1;
        case "keydown":
          return t.keyCode !== ks;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function qd(e) {
      var t = e.detail;
      return typeof t == "object" && "data" in t ? t.data : null;
    }
    function rf(e) {
      return e.locale === "ko";
    }
    var Wi = !1;
    function Xd(e, t, a, i, u) {
      var s, f;
      if (Os ? s = ah(t) : Wi ? ih(t, i) && (s = "onCompositionEnd") : Gd(t, i) && (s = "onCompositionStart"), !s)
        return null;
      tf && !rf(i) && (!Wi && s === "onCompositionStart" ? Wi = Ul(u) : s === "onCompositionEnd" && Wi && (f = To()));
      var p = ch(a, s);
      if (p.length > 0) {
        var v = new Yd(s, t, null, i, u);
        if (e.push({
          event: v,
          listeners: p
        }), f)
          v.data = f;
        else {
          var y = qd(i);
          y !== null && (v.data = y);
        }
      }
    }
    function af(e, t) {
      switch (e) {
        case "compositionend":
          return qd(t);
        case "keypress":
          var a = t.which;
          return a !== nh ? null : (Ls = !0, Wd);
        case "textInput":
          var i = t.data;
          return i === Wd && Ls ? null : i;
        default:
          return null;
      }
    }
    function lh(e, t) {
      if (Wi) {
        if (e === "compositionend" || !Os && ih(e, t)) {
          var a = To();
          return qc(), Wi = !1, a;
        }
        return null;
      }
      switch (e) {
        case "paste":
          return null;
        case "keypress":
          if (!nf(t)) {
            if (t.char && t.char.length > 1)
              return t.char;
            if (t.which)
              return String.fromCharCode(t.which);
          }
          return null;
        case "compositionend":
          return tf && !rf(t) ? null : t.data;
        default:
          return null;
      }
    }
    function my(e, t, a, i, u) {
      var s;
      if (hy ? s = af(t, i) : s = lh(t, i), !s)
        return null;
      var f = ch(a, "onBeforeInput");
      if (f.length > 0) {
        var p = new wu("onBeforeInput", "beforeinput", null, i, u);
        e.push({
          event: p,
          listeners: f
        }), p.data = s;
      }
    }
    function lf(e, t, a, i, u, s, f) {
      Xd(e, t, a, i, u), my(e, t, a, i, u);
    }
    var yy = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0
    };
    function bo(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === "input" ? !!yy[e.type] : t === "textarea";
    }
    /**
     * Checks if an event is supported in the current execution environment.
     *
     * NOTE: This will not work correctly for non-generic events such as `change`,
     * `reset`, `load`, `error`, and `select`.
     *
     * Borrows from Modernizr.
     *
     * @param {string} eventNameSuffix Event name, e.g. "click".
     * @return {boolean} True if the event is supported.
     * @internal
     * @license Modernizr 3.0.0pre (Custom Build) | MIT
     */
    function gy(e) {
      if (!pn)
        return !1;
      var t = "on" + e, a = t in document;
      if (!a) {
        var i = document.createElement("div");
        i.setAttribute(t, "return;"), a = typeof i[t] == "function";
      }
      return a;
    }
    function uf() {
      vr("onChange", ["change", "click", "focusin", "focusout", "input", "keydown", "keyup", "selectionchange"]);
    }
    function n(e, t, a, i) {
      sc(i);
      var u = ch(t, "onChange");
      if (u.length > 0) {
        var s = new wr("onChange", "change", null, a, i);
        e.push({
          event: s,
          listeners: u
        });
      }
    }
    var r = null, l = null;
    function o(e) {
      var t = e.nodeName && e.nodeName.toLowerCase();
      return t === "select" || t === "input" && e.type === "file";
    }
    function c(e) {
      var t = [];
      n(t, l, e, oc(e)), ad(d, t);
    }
    function d(e) {
      b0(e, 0);
    }
    function m(e) {
      var t = pf(e);
      if (qu(t))
        return e;
    }
    function E(e, t) {
      if (e === "change")
        return t;
    }
    var w = !1;
    pn && (w = gy("input") && (!document.documentMode || document.documentMode > 9));
    function U(e, t) {
      r = e, l = t, r.attachEvent("onpropertychange", W);
    }
    function Q() {
      !r || (r.detachEvent("onpropertychange", W), r = null, l = null);
    }
    function W(e) {
      e.propertyName === "value" && m(l) && c(e);
    }
    function I(e, t, a) {
      e === "focusin" ? (Q(), U(t, a)) : e === "focusout" && Q();
    }
    function oe(e, t) {
      if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return m(l);
    }
    function ge(e) {
      var t = e.nodeName;
      return t && t.toLowerCase() === "input" && (e.type === "checkbox" || e.type === "radio");
    }
    function Ce(e, t) {
      if (e === "click")
        return m(t);
    }
    function On(e, t) {
      if (e === "input" || e === "change")
        return m(t);
    }
    function D(e) {
      var t = e._wrapperState;
      !t || !t.controlled || e.type !== "number" || Le(e, "number", e.value);
    }
    function _(e, t, a, i, u, s, f) {
      var p = a ? pf(a) : window, v, y;
      if (o(p) ? v = E : bo(p) ? w ? v = On : (v = oe, y = I) : ge(p) && (v = Ce), v) {
        var g = v(t, a);
        if (g) {
          n(e, g, i, u);
          return;
        }
      }
      y && y(t, p, a), t === "focusout" && D(p);
    }
    function L() {
      Br("onMouseEnter", ["mouseout", "mouseover"]), Br("onMouseLeave", ["mouseout", "mouseover"]), Br("onPointerEnter", ["pointerout", "pointerover"]), Br("onPointerLeave", ["pointerout", "pointerover"]);
    }
    function K(e, t, a, i, u, s, f) {
      var p = t === "mouseover" || t === "pointerover", v = t === "mouseout" || t === "pointerout";
      if (p && !Tv(i)) {
        var y = i.relatedTarget || i.fromElement;
        if (y && (zs(y) || cp(y)))
          return;
      }
      if (!(!v && !p)) {
        var g;
        if (u.window === u)
          g = u;
        else {
          var b = u.ownerDocument;
          b ? g = b.defaultView || b.parentWindow : g = window;
        }
        var x, M;
        if (v) {
          var z = i.relatedTarget || i.toElement;
          if (x = a, M = z ? zs(z) : null, M !== null) {
            var H = ma(M);
            (M !== H || M.tag !== ie && M.tag !== Pe) && (M = null);
          }
        } else
          x = null, M = a;
        if (x !== M) {
          var fe = Al, Oe = "onMouseLeave", Te = "onMouseEnter", St = "mouse";
          (t === "pointerout" || t === "pointerover") && (fe = Id, Oe = "onPointerLeave", Te = "onPointerEnter", St = "pointer");
          var pt = x == null ? g : pf(x), k = M == null ? g : pf(M), j = new fe(Oe, St + "leave", x, i, u);
          j.target = pt, j.relatedTarget = k;
          var O = null, G = zs(u);
          if (G === a) {
            var de = new fe(Te, St + "enter", M, i, u);
            de.target = k, de.relatedTarget = pt, O = de;
          }
          OR(e, j, O, x, M);
        }
      }
    }
    function Re(e, t) {
      return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
    }
    var Se = typeof Object.is == "function" ? Object.is : Re;
    function be(e, t) {
      if (Se(e, t))
        return !0;
      if (typeof e != "object" || e === null || typeof t != "object" || t === null)
        return !1;
      var a = Object.keys(e), i = Object.keys(t);
      if (a.length !== i.length)
        return !1;
      for (var u = 0; u < a.length; u++) {
        var s = a[u];
        if (!In.call(t, s) || !Se(e[s], t[s]))
          return !1;
      }
      return !0;
    }
    function Be(e) {
      for (; e && e.firstChild; )
        e = e.firstChild;
      return e;
    }
    function Jn(e) {
      for (; e; ) {
        if (e.nextSibling)
          return e.nextSibling;
        e = e.parentNode;
      }
    }
    function _t(e, t) {
      for (var a = Be(e), i = 0, u = 0; a; ) {
        if (a.nodeType === zi) {
          if (u = i + a.textContent.length, i <= t && u >= t)
            return {
              node: a,
              offset: t - i
            };
          i = u;
        }
        a = Be(Jn(a));
      }
    }
    function Hl(e) {
      var t = e.ownerDocument, a = t && t.defaultView || window, i = a.getSelection && a.getSelection();
      if (!i || i.rangeCount === 0)
        return null;
      var u = i.anchorNode, s = i.anchorOffset, f = i.focusNode, p = i.focusOffset;
      try {
        u.nodeType, f.nodeType;
      } catch {
        return null;
      }
      return Sy(e, u, s, f, p);
    }
    function Sy(e, t, a, i, u) {
      var s = 0, f = -1, p = -1, v = 0, y = 0, g = e, b = null;
      e:
        for (; ; ) {
          for (var x = null; g === t && (a === 0 || g.nodeType === zi) && (f = s + a), g === i && (u === 0 || g.nodeType === zi) && (p = s + u), g.nodeType === zi && (s += g.nodeValue.length), (x = g.firstChild) !== null; )
            b = g, g = x;
          for (; ; ) {
            if (g === e)
              break e;
            if (b === t && ++v === a && (f = s), b === i && ++y === u && (p = s), (x = g.nextSibling) !== null)
              break;
            g = b, b = g.parentNode;
          }
          g = x;
        }
      return f === -1 || p === -1 ? null : {
        start: f,
        end: p
      };
    }
    function fR(e, t) {
      var a = e.ownerDocument || document, i = a && a.defaultView || window;
      if (!!i.getSelection) {
        var u = i.getSelection(), s = e.textContent.length, f = Math.min(t.start, s), p = t.end === void 0 ? f : Math.min(t.end, s);
        if (!u.extend && f > p) {
          var v = p;
          p = f, f = v;
        }
        var y = _t(e, f), g = _t(e, p);
        if (y && g) {
          if (u.rangeCount === 1 && u.anchorNode === y.node && u.anchorOffset === y.offset && u.focusNode === g.node && u.focusOffset === g.offset)
            return;
          var b = a.createRange();
          b.setStart(y.node, y.offset), u.removeAllRanges(), f > p ? (u.addRange(b), u.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), u.addRange(b));
        }
      }
    }
    function h0(e) {
      return e && e.nodeType === zi;
    }
    function m0(e, t) {
      return !e || !t ? !1 : e === t ? !0 : h0(e) ? !1 : h0(t) ? m0(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1;
    }
    function dR(e) {
      return e && e.ownerDocument && m0(e.ownerDocument.documentElement, e);
    }
    function pR(e) {
      try {
        return typeof e.contentWindow.location.href == "string";
      } catch {
        return !1;
      }
    }
    function y0() {
      for (var e = window, t = yl(); t instanceof e.HTMLIFrameElement; ) {
        if (pR(t))
          e = t.contentWindow;
        else
          return t;
        t = yl(e.document);
      }
      return t;
    }
    function Ey(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
    }
    function vR() {
      var e = y0();
      return {
        focusedElem: e,
        selectionRange: Ey(e) ? mR(e) : null
      };
    }
    function hR(e) {
      var t = y0(), a = e.focusedElem, i = e.selectionRange;
      if (t !== a && dR(a)) {
        i !== null && Ey(a) && yR(a, i);
        for (var u = [], s = a; s = s.parentNode; )
          s.nodeType === Xr && u.push({
            element: s,
            left: s.scrollLeft,
            top: s.scrollTop
          });
        typeof a.focus == "function" && a.focus();
        for (var f = 0; f < u.length; f++) {
          var p = u[f];
          p.element.scrollLeft = p.left, p.element.scrollTop = p.top;
        }
      }
    }
    function mR(e) {
      var t;
      return "selectionStart" in e ? t = {
        start: e.selectionStart,
        end: e.selectionEnd
      } : t = Hl(e), t || {
        start: 0,
        end: 0
      };
    }
    function yR(e, t) {
      var a = t.start, i = t.end;
      i === void 0 && (i = a), "selectionStart" in e ? (e.selectionStart = a, e.selectionEnd = Math.min(i, e.value.length)) : fR(e, t);
    }
    var gR = pn && "documentMode" in document && document.documentMode <= 11;
    function SR() {
      vr("onSelect", ["focusout", "contextmenu", "dragend", "focusin", "keydown", "keyup", "mousedown", "mouseup", "selectionchange"]);
    }
    var of = null, Cy = null, Kd = null, Ry = !1;
    function ER(e) {
      if ("selectionStart" in e && Ey(e))
        return {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      var t = e.ownerDocument && e.ownerDocument.defaultView || window, a = t.getSelection();
      return {
        anchorNode: a.anchorNode,
        anchorOffset: a.anchorOffset,
        focusNode: a.focusNode,
        focusOffset: a.focusOffset
      };
    }
    function CR(e) {
      return e.window === e ? e.document : e.nodeType === Ja ? e : e.ownerDocument;
    }
    function g0(e, t, a) {
      var i = CR(a);
      if (!(Ry || of == null || of !== yl(i))) {
        var u = ER(of);
        if (!Kd || !be(Kd, u)) {
          Kd = u;
          var s = ch(Cy, "onSelect");
          if (s.length > 0) {
            var f = new wr("onSelect", "select", null, t, a);
            e.push({
              event: f,
              listeners: s
            }), f.target = of;
          }
        }
      }
    }
    function RR(e, t, a, i, u, s, f) {
      var p = a ? pf(a) : window;
      switch (t) {
        case "focusin":
          (bo(p) || p.contentEditable === "true") && (of = p, Cy = a, Kd = null);
          break;
        case "focusout":
          of = null, Cy = null, Kd = null;
          break;
        case "mousedown":
          Ry = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Ry = !1, g0(e, i, u);
          break;
        case "selectionchange":
          if (gR)
            break;
        case "keydown":
        case "keyup":
          g0(e, i, u);
      }
    }
    function uh(e, t) {
      var a = {};
      return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
    }
    var sf = {
      animationend: uh("Animation", "AnimationEnd"),
      animationiteration: uh("Animation", "AnimationIteration"),
      animationstart: uh("Animation", "AnimationStart"),
      transitionend: uh("Transition", "TransitionEnd")
    }, Ty = {}, S0 = {};
    pn && (S0 = document.createElement("div").style, "AnimationEvent" in window || (delete sf.animationend.animation, delete sf.animationiteration.animation, delete sf.animationstart.animation), "TransitionEvent" in window || delete sf.transitionend.transition);
    function oh(e) {
      if (Ty[e])
        return Ty[e];
      if (!sf[e])
        return e;
      var t = sf[e];
      for (var a in t)
        if (t.hasOwnProperty(a) && a in S0)
          return Ty[e] = t[a];
      return e;
    }
    var E0 = oh("animationend"), C0 = oh("animationiteration"), R0 = oh("animationstart"), T0 = oh("transitionend"), w0 = /* @__PURE__ */ new Map(), x0 = ["abort", "auxClick", "cancel", "canPlay", "canPlayThrough", "click", "close", "contextMenu", "copy", "cut", "drag", "dragEnd", "dragEnter", "dragExit", "dragLeave", "dragOver", "dragStart", "drop", "durationChange", "emptied", "encrypted", "ended", "error", "gotPointerCapture", "input", "invalid", "keyDown", "keyPress", "keyUp", "load", "loadedData", "loadedMetadata", "loadStart", "lostPointerCapture", "mouseDown", "mouseMove", "mouseOut", "mouseOver", "mouseUp", "paste", "pause", "play", "playing", "pointerCancel", "pointerDown", "pointerMove", "pointerOut", "pointerOver", "pointerUp", "progress", "rateChange", "reset", "resize", "seeked", "seeking", "stalled", "submit", "suspend", "timeUpdate", "touchCancel", "touchEnd", "touchStart", "volumeChange", "scroll", "toggle", "touchMove", "waiting", "wheel"];
    function Do(e, t) {
      w0.set(e, t), vr(t, [e]);
    }
    function TR() {
      for (var e = 0; e < x0.length; e++) {
        var t = x0[e], a = t.toLowerCase(), i = t[0].toUpperCase() + t.slice(1);
        Do(a, "on" + i);
      }
      Do(E0, "onAnimationEnd"), Do(C0, "onAnimationIteration"), Do(R0, "onAnimationStart"), Do("dblclick", "onDoubleClick"), Do("focusin", "onFocus"), Do("focusout", "onBlur"), Do(T0, "onTransitionEnd");
    }
    function wR(e, t, a, i, u, s, f) {
      var p = w0.get(t);
      if (p !== void 0) {
        var v = wr, y = t;
        switch (t) {
          case "keypress":
            if (Cu(i) === 0)
              return;
          case "keydown":
          case "keyup":
            v = dy;
            break;
          case "focusin":
            y = "focus", v = Kc;
            break;
          case "focusout":
            y = "blur", v = Kc;
            break;
          case "beforeblur":
          case "afterblur":
            v = Kc;
            break;
          case "click":
            if (i.button === 2)
              return;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = Al;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Tu;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = Pa;
            break;
          case E0:
          case C0:
          case R0:
            v = Zc;
            break;
          case T0:
            v = vy;
            break;
          case "scroll":
            v = Pd;
            break;
          case "wheel":
            v = ef;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = oy;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = Id;
            break;
        }
        var g = (s & tu) !== 0;
        {
          var b = !g && t === "scroll", x = DR(a, p, i.type, g, b);
          if (x.length > 0) {
            var M = new v(p, y, null, i, u);
            e.push({
              event: M,
              listeners: x
            });
          }
        }
      }
    }
    TR(), L(), uf(), SR(), rh();
    function xR(e, t, a, i, u, s, f) {
      wR(e, t, a, i, u, s);
      var p = (s & qm) === 0;
      p && (K(e, t, a, i, u), _(e, t, a, i, u), RR(e, t, a, i, u), lf(e, t, a, i, u));
    }
    var Zd = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "encrypted", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "resize", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"], wy = new Set(["cancel", "close", "invalid", "load", "scroll", "toggle"].concat(Zd));
    function _0(e, t, a) {
      var i = e.type || "unknown-event";
      e.currentTarget = a, Hi(i, t, void 0, e), e.currentTarget = null;
    }
    function _R(e, t, a) {
      var i;
      if (a)
        for (var u = t.length - 1; u >= 0; u--) {
          var s = t[u], f = s.instance, p = s.currentTarget, v = s.listener;
          if (f !== i && e.isPropagationStopped())
            return;
          _0(e, v, p), i = f;
        }
      else
        for (var y = 0; y < t.length; y++) {
          var g = t[y], b = g.instance, x = g.currentTarget, M = g.listener;
          if (b !== i && e.isPropagationStopped())
            return;
          _0(e, M, x), i = b;
        }
    }
    function b0(e, t) {
      for (var a = (t & tu) !== 0, i = 0; i < e.length; i++) {
        var u = e[i], s = u.event, f = u.listeners;
        _R(s, f, a);
      }
      od();
    }
    function bR(e, t, a, i, u) {
      var s = oc(a), f = [];
      xR(f, e, i, a, s, t), b0(f, t);
    }
    function En(e, t) {
      wy.has(e) || S('Did not expect a listenToNonDelegatedEvent() call for "%s". This is a bug in React. Please file an issue.', e);
      var a = !1, i = rw(t), u = LR(e, a);
      i.has(u) || (D0(t, e, ns, a), i.add(u));
    }
    function xy(e, t, a) {
      wy.has(e) && !t && S('Did not expect a listenToNativeEvent() call for "%s" in the bubble phase. This is a bug in React. Please file an issue.', e);
      var i = 0;
      t && (i |= tu), D0(a, e, i, t);
    }
    var sh = "_reactListening" + Math.random().toString(36).slice(2);
    function Jd(e) {
      if (!e[sh]) {
        e[sh] = !0, tt.forEach(function(a) {
          a !== "selectionchange" && (wy.has(a) || xy(a, !1, e), xy(a, !0, e));
        });
        var t = e.nodeType === Ja ? e : e.ownerDocument;
        t !== null && (t[sh] || (t[sh] = !0, xy("selectionchange", !1, t)));
      }
    }
    function D0(e, t, a, i, u) {
      var s = Eo(e, t, a), f = void 0;
      us && (t === "touchstart" || t === "touchmove" || t === "wheel") && (f = !0), e = e, i ? f !== void 0 ? Qi(e, t, s, f) : Ro(e, t, s) : f !== void 0 ? Gc(e, t, s, f) : jd(e, t, s);
    }
    function k0(e, t) {
      return e === t || e.nodeType === Nn && e.parentNode === t;
    }
    function _y(e, t, a, i, u) {
      var s = i;
      if ((t & Ai) === 0 && (t & ns) === 0) {
        var f = u;
        if (i !== null) {
          var p = i;
          e:
            for (; ; ) {
              if (p === null)
                return;
              var v = p.tag;
              if (v === re || v === me) {
                var y = p.stateNode.containerInfo;
                if (k0(y, f))
                  break;
                if (v === me)
                  for (var g = p.return; g !== null; ) {
                    var b = g.tag;
                    if (b === re || b === me) {
                      var x = g.stateNode.containerInfo;
                      if (k0(x, f))
                        return;
                    }
                    g = g.return;
                  }
                for (; y !== null; ) {
                  var M = zs(y);
                  if (M === null)
                    return;
                  var z = M.tag;
                  if (z === ie || z === Pe) {
                    p = s = M;
                    continue e;
                  }
                  y = y.parentNode;
                }
              }
              p = p.return;
            }
        }
      }
      ad(function() {
        return bR(e, t, a, s);
      });
    }
    function ep(e, t, a) {
      return {
        instance: e,
        listener: t,
        currentTarget: a
      };
    }
    function DR(e, t, a, i, u, s) {
      for (var f = t !== null ? t + "Capture" : null, p = i ? f : t, v = [], y = e, g = null; y !== null; ) {
        var b = y, x = b.stateNode, M = b.tag;
        if (M === ie && x !== null && (g = x, p !== null)) {
          var z = ru(y, p);
          z != null && v.push(ep(y, z, g));
        }
        if (u)
          break;
        y = y.return;
      }
      return v;
    }
    function ch(e, t) {
      for (var a = t + "Capture", i = [], u = e; u !== null; ) {
        var s = u, f = s.stateNode, p = s.tag;
        if (p === ie && f !== null) {
          var v = f, y = ru(u, a);
          y != null && i.unshift(ep(u, y, v));
          var g = ru(u, t);
          g != null && i.push(ep(u, g, v));
        }
        u = u.return;
      }
      return i;
    }
    function cf(e) {
      if (e === null)
        return null;
      do
        e = e.return;
      while (e && e.tag !== ie);
      return e || null;
    }
    function kR(e, t) {
      for (var a = e, i = t, u = 0, s = a; s; s = cf(s))
        u++;
      for (var f = 0, p = i; p; p = cf(p))
        f++;
      for (; u - f > 0; )
        a = cf(a), u--;
      for (; f - u > 0; )
        i = cf(i), f--;
      for (var v = u; v--; ) {
        if (a === i || i !== null && a === i.alternate)
          return a;
        a = cf(a), i = cf(i);
      }
      return null;
    }
    function O0(e, t, a, i, u) {
      for (var s = t._reactName, f = [], p = a; p !== null && p !== i; ) {
        var v = p, y = v.alternate, g = v.stateNode, b = v.tag;
        if (y !== null && y === i)
          break;
        if (b === ie && g !== null) {
          var x = g;
          if (u) {
            var M = ru(p, s);
            M != null && f.unshift(ep(p, M, x));
          } else if (!u) {
            var z = ru(p, s);
            z != null && f.push(ep(p, z, x));
          }
        }
        p = p.return;
      }
      f.length !== 0 && e.push({
        event: t,
        listeners: f
      });
    }
    function OR(e, t, a, i, u) {
      var s = i && u ? kR(i, u) : null;
      i !== null && O0(e, t, i, s, !1), u !== null && a !== null && O0(e, a, u, s, !0);
    }
    function LR(e, t) {
      return e + "__" + (t ? "capture" : "bubble");
    }
    var Va = !1, tp = "dangerouslySetInnerHTML", fh = "suppressContentEditableWarning", ko = "suppressHydrationWarning", L0 = "autoFocus", Ms = "children", Ns = "style", dh = "__html", by, ph, np, M0, vh, N0, z0;
    by = {
      dialog: !0,
      webview: !0
    }, ph = function(e, t) {
      uc(e, t), Jf(e, t), Rv(e, t, {
        registrationNameDependencies: zt,
        possibleRegistrationNames: Vr
      });
    }, N0 = pn && !document.documentMode, np = function(e, t, a) {
      if (!Va) {
        var i = hh(a), u = hh(t);
        u !== i && (Va = !0, S("Prop `%s` did not match. Server: %s Client: %s", e, JSON.stringify(u), JSON.stringify(i)));
      }
    }, M0 = function(e) {
      if (!Va) {
        Va = !0;
        var t = [];
        e.forEach(function(a) {
          t.push(a);
        }), S("Extra attributes from the server: %s", t);
      }
    }, vh = function(e, t) {
      t === !1 ? S("Expected `%s` listener to be a function, instead got `false`.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.", e, e, e) : S("Expected `%s` listener to be a function, instead got a value of `%s` type.", e, typeof t);
    }, z0 = function(e, t) {
      var a = e.namespaceURI === Ni ? e.ownerDocument.createElement(e.tagName) : e.ownerDocument.createElementNS(e.namespaceURI, e.tagName);
      return a.innerHTML = t, a.innerHTML;
    };
    var MR = /\r\n?/g, NR = /\u0000|\uFFFD/g;
    function hh(e) {
      Ir(e);
      var t = typeof e == "string" ? e : "" + e;
      return t.replace(MR, `
`).replace(NR, "");
    }
    function mh(e, t, a, i) {
      var u = hh(t), s = hh(e);
      if (s !== u && (i && (Va || (Va = !0, S('Text content did not match. Server: "%s" Client: "%s"', s, u))), a && ye))
        throw new Error("Text content does not match server-rendered HTML.");
    }
    function U0(e) {
      return e.nodeType === Ja ? e : e.ownerDocument;
    }
    function zR() {
    }
    function yh(e) {
      e.onclick = zR;
    }
    function UR(e, t, a, i, u) {
      for (var s in i)
        if (!!i.hasOwnProperty(s)) {
          var f = i[s];
          if (s === Ns)
            f && Object.freeze(f), dv(t, f);
          else if (s === tp) {
            var p = f ? f[dh] : void 0;
            p != null && tv(t, p);
          } else if (s === Ms)
            if (typeof f == "string") {
              var v = e !== "textarea" || f !== "";
              v && rc(t, f);
            } else
              typeof f == "number" && rc(t, "" + f);
          else
            s === fh || s === ko || s === L0 || (zt.hasOwnProperty(s) ? f != null && (typeof f != "function" && vh(s, f), s === "onScroll" && En("scroll", t)) : f != null && pa(t, s, f, u));
        }
    }
    function AR(e, t, a, i) {
      for (var u = 0; u < t.length; u += 2) {
        var s = t[u], f = t[u + 1];
        s === Ns ? dv(e, f) : s === tp ? tv(e, f) : s === Ms ? rc(e, f) : pa(e, s, f, i);
      }
    }
    function FR(e, t, a, i) {
      var u, s = U0(a), f, p = i;
      if (p === Ni && (p = tc(e)), p === Ni) {
        if (u = Ui(e, t), !u && e !== e.toLowerCase() && S("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", e), e === "script") {
          var v = s.createElement("div");
          v.innerHTML = "<script><\/script>";
          var y = v.firstChild;
          f = v.removeChild(y);
        } else if (typeof t.is == "string")
          f = s.createElement(e, {
            is: t.is
          });
        else if (f = s.createElement(e), e === "select") {
          var g = f;
          t.multiple ? g.multiple = !0 : t.size && (g.size = t.size);
        }
      } else
        f = s.createElementNS(p, e);
      return p === Ni && !u && Object.prototype.toString.call(f) === "[object HTMLUnknownElement]" && !In.call(by, e) && (by[e] = !0, S("The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.", e)), f;
    }
    function HR(e, t) {
      return U0(t).createTextNode(e);
    }
    function jR(e, t, a, i) {
      var u = Ui(t, a);
      ph(t, a);
      var s;
      switch (t) {
        case "dialog":
          En("cancel", e), En("close", e), s = a;
          break;
        case "iframe":
        case "object":
        case "embed":
          En("load", e), s = a;
          break;
        case "video":
        case "audio":
          for (var f = 0; f < Zd.length; f++)
            En(Zd[f], e);
          s = a;
          break;
        case "source":
          En("error", e), s = a;
          break;
        case "img":
        case "image":
        case "link":
          En("error", e), En("load", e), s = a;
          break;
        case "details":
          En("toggle", e), s = a;
          break;
        case "input":
          C(e, a), s = h(e, a), En("invalid", e);
          break;
        case "option":
          Bt(e, a), s = a;
          break;
        case "select":
          Zo(e, a), s = Ko(e, a), En("invalid", e);
          break;
        case "textarea":
          Zp(e, a), s = Yf(e, a), En("invalid", e);
          break;
        default:
          s = a;
      }
      switch (ic(t, s), UR(t, e, i, s, u), t) {
        case "input":
          Da(e), X(e, a, !1);
          break;
        case "textarea":
          Da(e), ev(e);
          break;
        case "option":
          Xt(e, a);
          break;
        case "select":
          Bf(e, a);
          break;
        default:
          typeof s.onClick == "function" && yh(e);
          break;
      }
    }
    function PR(e, t, a, i, u) {
      ph(t, i);
      var s = null, f, p;
      switch (t) {
        case "input":
          f = h(e, a), p = h(e, i), s = [];
          break;
        case "select":
          f = Ko(e, a), p = Ko(e, i), s = [];
          break;
        case "textarea":
          f = Yf(e, a), p = Yf(e, i), s = [];
          break;
        default:
          f = a, p = i, typeof f.onClick != "function" && typeof p.onClick == "function" && yh(e);
          break;
      }
      ic(t, p);
      var v, y, g = null;
      for (v in f)
        if (!(p.hasOwnProperty(v) || !f.hasOwnProperty(v) || f[v] == null))
          if (v === Ns) {
            var b = f[v];
            for (y in b)
              b.hasOwnProperty(y) && (g || (g = {}), g[y] = "");
          } else
            v === tp || v === Ms || v === fh || v === ko || v === L0 || (zt.hasOwnProperty(v) ? s || (s = []) : (s = s || []).push(v, null));
      for (v in p) {
        var x = p[v], M = f != null ? f[v] : void 0;
        if (!(!p.hasOwnProperty(v) || x === M || x == null && M == null))
          if (v === Ns)
            if (x && Object.freeze(x), M) {
              for (y in M)
                M.hasOwnProperty(y) && (!x || !x.hasOwnProperty(y)) && (g || (g = {}), g[y] = "");
              for (y in x)
                x.hasOwnProperty(y) && M[y] !== x[y] && (g || (g = {}), g[y] = x[y]);
            } else
              g || (s || (s = []), s.push(v, g)), g = x;
          else if (v === tp) {
            var z = x ? x[dh] : void 0, H = M ? M[dh] : void 0;
            z != null && H !== z && (s = s || []).push(v, z);
          } else
            v === Ms ? (typeof x == "string" || typeof x == "number") && (s = s || []).push(v, "" + x) : v === fh || v === ko || (zt.hasOwnProperty(v) ? (x != null && (typeof x != "function" && vh(v, x), v === "onScroll" && En("scroll", e)), !s && M !== x && (s = [])) : (s = s || []).push(v, x));
      }
      return g && (es(g, p[Ns]), (s = s || []).push(Ns, g)), s;
    }
    function VR(e, t, a, i, u) {
      a === "input" && u.type === "radio" && u.name != null && N(e, u);
      var s = Ui(a, i), f = Ui(a, u);
      switch (AR(e, t, s, f), a) {
        case "input":
          F(e, u);
          break;
        case "textarea":
          Jp(e, u);
          break;
        case "select":
          jm(e, u);
          break;
      }
    }
    function BR(e) {
      {
        var t = e.toLowerCase();
        return lc.hasOwnProperty(t) && lc[t] || null;
      }
    }
    function $R(e, t, a, i, u, s, f) {
      var p, v;
      switch (p = Ui(t, a), ph(t, a), t) {
        case "dialog":
          En("cancel", e), En("close", e);
          break;
        case "iframe":
        case "object":
        case "embed":
          En("load", e);
          break;
        case "video":
        case "audio":
          for (var y = 0; y < Zd.length; y++)
            En(Zd[y], e);
          break;
        case "source":
          En("error", e);
          break;
        case "img":
        case "image":
        case "link":
          En("error", e), En("load", e);
          break;
        case "details":
          En("toggle", e);
          break;
        case "input":
          C(e, a), En("invalid", e);
          break;
        case "option":
          Bt(e, a);
          break;
        case "select":
          Zo(e, a), En("invalid", e);
          break;
        case "textarea":
          Zp(e, a), En("invalid", e);
          break;
      }
      ic(t, a);
      {
        v = /* @__PURE__ */ new Set();
        for (var g = e.attributes, b = 0; b < g.length; b++) {
          var x = g[b].name.toLowerCase();
          switch (x) {
            case "value":
              break;
            case "checked":
              break;
            case "selected":
              break;
            default:
              v.add(g[b].name);
          }
        }
      }
      var M = null;
      for (var z in a)
        if (!!a.hasOwnProperty(z)) {
          var H = a[z];
          if (z === Ms)
            typeof H == "string" ? e.textContent !== H && (a[ko] !== !0 && mh(e.textContent, H, s, f), M = [Ms, H]) : typeof H == "number" && e.textContent !== "" + H && (a[ko] !== !0 && mh(e.textContent, H, s, f), M = [Ms, "" + H]);
          else if (zt.hasOwnProperty(z))
            H != null && (typeof H != "function" && vh(z, H), z === "onScroll" && En("scroll", e));
          else if (f && !0 && typeof p == "boolean") {
            var fe = void 0, Oe = p && $e ? null : _r(z);
            if (a[ko] !== !0) {
              if (!(z === fh || z === ko || z === "value" || z === "checked" || z === "selected")) {
                if (z === tp) {
                  var Te = e.innerHTML, St = H ? H[dh] : void 0;
                  if (St != null) {
                    var pt = z0(e, St);
                    pt !== Te && np(z, Te, pt);
                  }
                } else if (z === Ns) {
                  if (v.delete(z), N0) {
                    var k = Wm(H);
                    fe = e.getAttribute("style"), k !== fe && np(z, fe, k);
                  }
                } else if (p && !$e)
                  v.delete(z.toLowerCase()), fe = oi(e, z, H), H !== fe && np(z, fe, H);
                else if (!hn(z, Oe, p) && !Vt(z, H, Oe, p)) {
                  var j = !1;
                  if (Oe !== null)
                    v.delete(Oe.attributeName), fe = da(e, z, H, Oe);
                  else {
                    var O = i;
                    if (O === Ni && (O = tc(t)), O === Ni)
                      v.delete(z.toLowerCase());
                    else {
                      var G = BR(z);
                      G !== null && G !== z && (j = !0, v.delete(G)), v.delete(z);
                    }
                    fe = oi(e, z, H);
                  }
                  var de = $e;
                  !de && H !== fe && !j && np(z, fe, H);
                }
              }
            }
          }
        }
      switch (f && v.size > 0 && a[ko] !== !0 && M0(v), t) {
        case "input":
          Da(e), X(e, a, !0);
          break;
        case "textarea":
          Da(e), ev(e);
          break;
        case "select":
        case "option":
          break;
        default:
          typeof a.onClick == "function" && yh(e);
          break;
      }
      return M;
    }
    function YR(e, t, a) {
      var i = e.nodeValue !== t;
      return i;
    }
    function Dy(e, t) {
      {
        if (Va)
          return;
        Va = !0, S("Did not expect server HTML to contain a <%s> in <%s>.", t.nodeName.toLowerCase(), e.nodeName.toLowerCase());
      }
    }
    function ky(e, t) {
      {
        if (Va)
          return;
        Va = !0, S('Did not expect server HTML to contain the text node "%s" in <%s>.', t.nodeValue, e.nodeName.toLowerCase());
      }
    }
    function Oy(e, t, a) {
      {
        if (Va)
          return;
        Va = !0, S("Expected server HTML to contain a matching <%s> in <%s>.", t, e.nodeName.toLowerCase());
      }
    }
    function Ly(e, t) {
      {
        if (t === "" || Va)
          return;
        Va = !0, S('Expected server HTML to contain a matching text node for "%s" in <%s>.', t, e.nodeName.toLowerCase());
      }
    }
    function IR(e, t, a) {
      switch (t) {
        case "input":
          Ne(e, a);
          return;
        case "textarea":
          If(e, a);
          return;
        case "select":
          Pm(e, a);
          return;
      }
    }
    var rp = function() {
    }, ap = function() {
    };
    {
      var QR = ["address", "applet", "area", "article", "aside", "base", "basefont", "bgsound", "blockquote", "body", "br", "button", "caption", "center", "col", "colgroup", "dd", "details", "dir", "div", "dl", "dt", "embed", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "iframe", "img", "input", "isindex", "li", "link", "listing", "main", "marquee", "menu", "menuitem", "meta", "nav", "noembed", "noframes", "noscript", "object", "ol", "p", "param", "plaintext", "pre", "script", "section", "select", "source", "style", "summary", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "title", "tr", "track", "ul", "wbr", "xmp"], A0 = [
        "applet",
        "caption",
        "html",
        "table",
        "td",
        "th",
        "marquee",
        "object",
        "template",
        "foreignObject",
        "desc",
        "title"
      ], WR = A0.concat(["button"]), GR = ["dd", "dt", "li", "option", "optgroup", "p", "rp", "rt"], F0 = {
        current: null,
        formTag: null,
        aTagInScope: null,
        buttonTagInScope: null,
        nobrTagInScope: null,
        pTagInButtonScope: null,
        listItemTagAutoclosing: null,
        dlItemTagAutoclosing: null
      };
      ap = function(e, t) {
        var a = lt({}, e || F0), i = {
          tag: t
        };
        return A0.indexOf(t) !== -1 && (a.aTagInScope = null, a.buttonTagInScope = null, a.nobrTagInScope = null), WR.indexOf(t) !== -1 && (a.pTagInButtonScope = null), QR.indexOf(t) !== -1 && t !== "address" && t !== "div" && t !== "p" && (a.listItemTagAutoclosing = null, a.dlItemTagAutoclosing = null), a.current = i, t === "form" && (a.formTag = i), t === "a" && (a.aTagInScope = i), t === "button" && (a.buttonTagInScope = i), t === "nobr" && (a.nobrTagInScope = i), t === "p" && (a.pTagInButtonScope = i), t === "li" && (a.listItemTagAutoclosing = i), (t === "dd" || t === "dt") && (a.dlItemTagAutoclosing = i), a;
      };
      var qR = function(e, t) {
        switch (t) {
          case "select":
            return e === "option" || e === "optgroup" || e === "#text";
          case "optgroup":
            return e === "option" || e === "#text";
          case "option":
            return e === "#text";
          case "tr":
            return e === "th" || e === "td" || e === "style" || e === "script" || e === "template";
          case "tbody":
          case "thead":
          case "tfoot":
            return e === "tr" || e === "style" || e === "script" || e === "template";
          case "colgroup":
            return e === "col" || e === "template";
          case "table":
            return e === "caption" || e === "colgroup" || e === "tbody" || e === "tfoot" || e === "thead" || e === "style" || e === "script" || e === "template";
          case "head":
            return e === "base" || e === "basefont" || e === "bgsound" || e === "link" || e === "meta" || e === "title" || e === "noscript" || e === "noframes" || e === "style" || e === "script" || e === "template";
          case "html":
            return e === "head" || e === "body" || e === "frameset";
          case "frameset":
            return e === "frame";
          case "#document":
            return e === "html";
        }
        switch (e) {
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            return t !== "h1" && t !== "h2" && t !== "h3" && t !== "h4" && t !== "h5" && t !== "h6";
          case "rp":
          case "rt":
            return GR.indexOf(t) === -1;
          case "body":
          case "caption":
          case "col":
          case "colgroup":
          case "frameset":
          case "frame":
          case "head":
          case "html":
          case "tbody":
          case "td":
          case "tfoot":
          case "th":
          case "thead":
          case "tr":
            return t == null;
        }
        return !0;
      }, XR = function(e, t) {
        switch (e) {
          case "address":
          case "article":
          case "aside":
          case "blockquote":
          case "center":
          case "details":
          case "dialog":
          case "dir":
          case "div":
          case "dl":
          case "fieldset":
          case "figcaption":
          case "figure":
          case "footer":
          case "header":
          case "hgroup":
          case "main":
          case "menu":
          case "nav":
          case "ol":
          case "p":
          case "section":
          case "summary":
          case "ul":
          case "pre":
          case "listing":
          case "table":
          case "hr":
          case "xmp":
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            return t.pTagInButtonScope;
          case "form":
            return t.formTag || t.pTagInButtonScope;
          case "li":
            return t.listItemTagAutoclosing;
          case "dd":
          case "dt":
            return t.dlItemTagAutoclosing;
          case "button":
            return t.buttonTagInScope;
          case "a":
            return t.aTagInScope;
          case "nobr":
            return t.nobrTagInScope;
        }
        return null;
      }, H0 = {};
      rp = function(e, t, a) {
        a = a || F0;
        var i = a.current, u = i && i.tag;
        t != null && (e != null && S("validateDOMNesting: when childText is passed, childTag should be null"), e = "#text");
        var s = qR(e, u) ? null : i, f = s ? null : XR(e, a), p = s || f;
        if (!!p) {
          var v = p.tag, y = !!s + "|" + e + "|" + v;
          if (!H0[y]) {
            H0[y] = !0;
            var g = e, b = "";
            if (e === "#text" ? /\S/.test(t) ? g = "Text nodes" : (g = "Whitespace text nodes", b = " Make sure you don't have any extra whitespace between tags on each line of your source code.") : g = "<" + e + ">", s) {
              var x = "";
              v === "table" && e === "tr" && (x += " Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by the browser."), S("validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s", g, v, b, x);
            } else
              S("validateDOMNesting(...): %s cannot appear as a descendant of <%s>.", g, v);
          }
        }
      };
    }
    var gh = "suppressHydrationWarning", Sh = "$", Eh = "/$", ip = "$?", lp = "$!", KR = "style", My = null, Ny = null;
    function ZR(e) {
      var t, a, i = e.nodeType;
      switch (i) {
        case Ja:
        case Jl: {
          t = i === Ja ? "#document" : "#fragment";
          var u = e.documentElement;
          a = u ? u.namespaceURI : Wf(null, "");
          break;
        }
        default: {
          var s = i === Nn ? e.parentNode : e, f = s.namespaceURI || null;
          t = s.tagName, a = Wf(f, t);
          break;
        }
      }
      {
        var p = t.toLowerCase(), v = ap(null, p);
        return {
          namespace: a,
          ancestorInfo: v
        };
      }
    }
    function JR(e, t, a) {
      {
        var i = e, u = Wf(i.namespace, t), s = ap(i.ancestorInfo, t);
        return {
          namespace: u,
          ancestorInfo: s
        };
      }
    }
    function yD(e) {
      return e;
    }
    function eT(e) {
      My = Ea(), Ny = vR();
      var t = null;
      return Zn(!1), t;
    }
    function tT(e) {
      hR(Ny), Zn(My), My = null, Ny = null;
    }
    function nT(e, t, a, i, u) {
      var s;
      {
        var f = i;
        if (rp(e, null, f.ancestorInfo), typeof t.children == "string" || typeof t.children == "number") {
          var p = "" + t.children, v = ap(f.ancestorInfo, e);
          rp(null, p, v);
        }
        s = f.namespace;
      }
      var y = FR(e, t, a, s);
      return sp(u, y), Vy(y, t), y;
    }
    function rT(e, t) {
      e.appendChild(t);
    }
    function aT(e, t, a, i, u) {
      switch (jR(e, t, a, i), t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          return !!a.autoFocus;
        case "img":
          return !0;
        default:
          return !1;
      }
    }
    function iT(e, t, a, i, u, s) {
      {
        var f = s;
        if (typeof i.children != typeof a.children && (typeof i.children == "string" || typeof i.children == "number")) {
          var p = "" + i.children, v = ap(f.ancestorInfo, t);
          rp(null, p, v);
        }
      }
      return PR(e, t, a, i);
    }
    function zy(e, t) {
      return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
    }
    function lT(e, t, a, i) {
      {
        var u = a;
        rp(null, e, u.ancestorInfo);
      }
      var s = HR(e, t);
      return sp(i, s), s;
    }
    function uT() {
      var e = window.event;
      return e === void 0 ? $i : Lr(e.type);
    }
    var Uy = typeof setTimeout == "function" ? setTimeout : void 0, oT = typeof clearTimeout == "function" ? clearTimeout : void 0, Ay = -1, j0 = typeof Promise == "function" ? Promise : void 0, sT = typeof queueMicrotask == "function" ? queueMicrotask : typeof j0 < "u" ? function(e) {
      return j0.resolve(null).then(e).catch(cT);
    } : Uy;
    function cT(e) {
      setTimeout(function() {
        throw e;
      });
    }
    function fT(e, t, a, i) {
      switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          a.autoFocus && e.focus();
          return;
        case "img": {
          a.src && (e.src = a.src);
          return;
        }
      }
    }
    function dT(e, t, a, i, u, s) {
      VR(e, t, a, i, u), Vy(e, u);
    }
    function P0(e) {
      rc(e, "");
    }
    function pT(e, t, a) {
      e.nodeValue = a;
    }
    function vT(e, t) {
      e.appendChild(t);
    }
    function hT(e, t) {
      var a;
      e.nodeType === Nn ? (a = e.parentNode, a.insertBefore(t, e)) : (a = e, a.appendChild(t));
      var i = e._reactRootContainer;
      i == null && a.onclick === null && yh(a);
    }
    function mT(e, t, a) {
      e.insertBefore(t, a);
    }
    function yT(e, t, a) {
      e.nodeType === Nn ? e.parentNode.insertBefore(t, a) : e.insertBefore(t, a);
    }
    function gT(e, t) {
      e.removeChild(t);
    }
    function ST(e, t) {
      e.nodeType === Nn ? e.parentNode.removeChild(t) : e.removeChild(t);
    }
    function Fy(e, t) {
      var a = t, i = 0;
      do {
        var u = a.nextSibling;
        if (e.removeChild(a), u && u.nodeType === Nn) {
          var s = u.data;
          if (s === Eh)
            if (i === 0) {
              e.removeChild(u), dt(t);
              return;
            } else
              i--;
          else
            (s === Sh || s === ip || s === lp) && i++;
        }
        a = u;
      } while (a);
      dt(t);
    }
    function ET(e, t) {
      e.nodeType === Nn ? Fy(e.parentNode, t) : e.nodeType === Xr && Fy(e, t), dt(e);
    }
    function CT(e) {
      e = e;
      var t = e.style;
      typeof t.setProperty == "function" ? t.setProperty("display", "none", "important") : t.display = "none";
    }
    function RT(e) {
      e.nodeValue = "";
    }
    function TT(e, t) {
      e = e;
      var a = t[KR], i = a != null && a.hasOwnProperty("display") ? a.display : null;
      e.style.display = ac("display", i);
    }
    function wT(e, t) {
      e.nodeValue = t;
    }
    function xT(e) {
      e.nodeType === Xr ? e.textContent = "" : e.nodeType === Ja && e.documentElement && e.removeChild(e.documentElement);
    }
    function _T(e, t, a) {
      return e.nodeType !== Xr || t.toLowerCase() !== e.nodeName.toLowerCase() ? null : e;
    }
    function bT(e, t) {
      return t === "" || e.nodeType !== zi ? null : e;
    }
    function DT(e) {
      return e.nodeType !== Nn ? null : e;
    }
    function V0(e) {
      return e.data === ip;
    }
    function Hy(e) {
      return e.data === lp;
    }
    function kT(e) {
      var t = e.nextSibling && e.nextSibling.dataset, a, i, u;
      return t && (a = t.dgst, i = t.msg, u = t.stck), {
        message: i,
        digest: a,
        stack: u
      };
    }
    function OT(e, t) {
      e._reactRetry = t;
    }
    function Ch(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === Xr || t === zi)
          break;
        if (t === Nn) {
          var a = e.data;
          if (a === Sh || a === lp || a === ip)
            break;
          if (a === Eh)
            return null;
        }
      }
      return e;
    }
    function up(e) {
      return Ch(e.nextSibling);
    }
    function LT(e) {
      return Ch(e.firstChild);
    }
    function MT(e) {
      return Ch(e.firstChild);
    }
    function NT(e) {
      return Ch(e.nextSibling);
    }
    function zT(e, t, a, i, u, s, f) {
      sp(s, e), Vy(e, a);
      var p;
      {
        var v = u;
        p = v.namespace;
      }
      var y = (s.mode & ot) !== Me;
      return $R(e, t, a, p, i, y, f);
    }
    function UT(e, t, a, i) {
      return sp(a, e), a.mode & ot, YR(e, t);
    }
    function AT(e, t) {
      sp(t, e);
    }
    function FT(e) {
      for (var t = e.nextSibling, a = 0; t; ) {
        if (t.nodeType === Nn) {
          var i = t.data;
          if (i === Eh) {
            if (a === 0)
              return up(t);
            a--;
          } else
            (i === Sh || i === lp || i === ip) && a++;
        }
        t = t.nextSibling;
      }
      return null;
    }
    function B0(e) {
      for (var t = e.previousSibling, a = 0; t; ) {
        if (t.nodeType === Nn) {
          var i = t.data;
          if (i === Sh || i === lp || i === ip) {
            if (a === 0)
              return t;
            a--;
          } else
            i === Eh && a++;
        }
        t = t.previousSibling;
      }
      return null;
    }
    function HT(e) {
      dt(e);
    }
    function jT(e) {
      dt(e);
    }
    function PT(e) {
      return e !== "head" && e !== "body";
    }
    function VT(e, t, a, i) {
      var u = !0;
      mh(t.nodeValue, a, i, u);
    }
    function BT(e, t, a, i, u, s) {
      if (t[gh] !== !0) {
        var f = !0;
        mh(i.nodeValue, u, s, f);
      }
    }
    function $T(e, t) {
      t.nodeType === Xr ? Dy(e, t) : t.nodeType === Nn || ky(e, t);
    }
    function YT(e, t) {
      {
        var a = e.parentNode;
        a !== null && (t.nodeType === Xr ? Dy(a, t) : t.nodeType === Nn || ky(a, t));
      }
    }
    function IT(e, t, a, i, u) {
      (u || t[gh] !== !0) && (i.nodeType === Xr ? Dy(a, i) : i.nodeType === Nn || ky(a, i));
    }
    function QT(e, t, a) {
      Oy(e, t);
    }
    function WT(e, t) {
      Ly(e, t);
    }
    function GT(e, t, a) {
      {
        var i = e.parentNode;
        i !== null && Oy(i, t);
      }
    }
    function qT(e, t) {
      {
        var a = e.parentNode;
        a !== null && Ly(a, t);
      }
    }
    function XT(e, t, a, i, u, s) {
      (s || t[gh] !== !0) && Oy(a, i);
    }
    function KT(e, t, a, i, u) {
      (u || t[gh] !== !0) && Ly(a, i);
    }
    function ZT(e) {
      S("An error occurred during hydration. The server HTML was replaced with client content in <%s>.", e.nodeName.toLowerCase());
    }
    function JT(e) {
      Jd(e);
    }
    var ff = Math.random().toString(36).slice(2), df = "__reactFiber$" + ff, jy = "__reactProps$" + ff, op = "__reactContainer$" + ff, Py = "__reactEvents$" + ff, ew = "__reactListeners$" + ff, tw = "__reactHandles$" + ff;
    function nw(e) {
      delete e[df], delete e[jy], delete e[Py], delete e[ew], delete e[tw];
    }
    function sp(e, t) {
      t[df] = e;
    }
    function Rh(e, t) {
      t[op] = e;
    }
    function $0(e) {
      e[op] = null;
    }
    function cp(e) {
      return !!e[op];
    }
    function zs(e) {
      var t = e[df];
      if (t)
        return t;
      for (var a = e.parentNode; a; ) {
        if (t = a[op] || a[df], t) {
          var i = t.alternate;
          if (t.child !== null || i !== null && i.child !== null)
            for (var u = B0(e); u !== null; ) {
              var s = u[df];
              if (s)
                return s;
              u = B0(u);
            }
          return t;
        }
        e = a, a = e.parentNode;
      }
      return null;
    }
    function Oo(e) {
      var t = e[df] || e[op];
      return t && (t.tag === ie || t.tag === Pe || t.tag === _e || t.tag === re) ? t : null;
    }
    function pf(e) {
      if (e.tag === ie || e.tag === Pe)
        return e.stateNode;
      throw new Error("getNodeFromInstance: Invalid argument.");
    }
    function Th(e) {
      return e[jy] || null;
    }
    function Vy(e, t) {
      e[jy] = t;
    }
    function rw(e) {
      var t = e[Py];
      return t === void 0 && (t = e[Py] = /* @__PURE__ */ new Set()), t;
    }
    var Y0 = {}, I0 = A.ReactDebugCurrentFrame;
    function wh(e) {
      if (e) {
        var t = e._owner, a = pi(e.type, e._source, t ? t.type : null);
        I0.setExtraStackFrame(a);
      } else
        I0.setExtraStackFrame(null);
    }
    function Gi(e, t, a, i, u) {
      {
        var s = Function.call.bind(In);
        for (var f in e)
          if (s(e, f)) {
            var p = void 0;
            try {
              if (typeof e[f] != "function") {
                var v = Error((i || "React class") + ": " + a + " type `" + f + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[f] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw v.name = "Invariant Violation", v;
              }
              p = e[f](t, f, i, a, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (y) {
              p = y;
            }
            p && !(p instanceof Error) && (wh(u), S("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", a, f, typeof p), wh(null)), p instanceof Error && !(p.message in Y0) && (Y0[p.message] = !0, wh(u), S("Failed %s type: %s", a, p.message), wh(null));
          }
      }
    }
    var By = [], xh;
    xh = [];
    var bu = -1;
    function Lo(e) {
      return {
        current: e
      };
    }
    function ia(e, t) {
      if (bu < 0) {
        S("Unexpected pop.");
        return;
      }
      t !== xh[bu] && S("Unexpected Fiber popped."), e.current = By[bu], By[bu] = null, xh[bu] = null, bu--;
    }
    function la(e, t, a) {
      bu++, By[bu] = e.current, xh[bu] = a, e.current = t;
    }
    var $y;
    $y = {};
    var ai = {};
    Object.freeze(ai);
    var Du = Lo(ai), jl = Lo(!1), Yy = ai;
    function vf(e, t, a) {
      return a && Pl(t) ? Yy : Du.current;
    }
    function Q0(e, t, a) {
      {
        var i = e.stateNode;
        i.__reactInternalMemoizedUnmaskedChildContext = t, i.__reactInternalMemoizedMaskedChildContext = a;
      }
    }
    function hf(e, t) {
      {
        var a = e.type, i = a.contextTypes;
        if (!i)
          return ai;
        var u = e.stateNode;
        if (u && u.__reactInternalMemoizedUnmaskedChildContext === t)
          return u.__reactInternalMemoizedMaskedChildContext;
        var s = {};
        for (var f in i)
          s[f] = t[f];
        {
          var p = Ye(e) || "Unknown";
          Gi(i, s, "context", p);
        }
        return u && Q0(e, t, s), s;
      }
    }
    function _h() {
      return jl.current;
    }
    function Pl(e) {
      {
        var t = e.childContextTypes;
        return t != null;
      }
    }
    function bh(e) {
      ia(jl, e), ia(Du, e);
    }
    function Iy(e) {
      ia(jl, e), ia(Du, e);
    }
    function W0(e, t, a) {
      {
        if (Du.current !== ai)
          throw new Error("Unexpected context found on stack. This error is likely caused by a bug in React. Please file an issue.");
        la(Du, t, e), la(jl, a, e);
      }
    }
    function G0(e, t, a) {
      {
        var i = e.stateNode, u = t.childContextTypes;
        if (typeof i.getChildContext != "function") {
          {
            var s = Ye(e) || "Unknown";
            $y[s] || ($y[s] = !0, S("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", s, s));
          }
          return a;
        }
        var f = i.getChildContext();
        for (var p in f)
          if (!(p in u))
            throw new Error((Ye(e) || "Unknown") + '.getChildContext(): key "' + p + '" is not defined in childContextTypes.');
        {
          var v = Ye(e) || "Unknown";
          Gi(u, f, "child context", v);
        }
        return lt({}, a, f);
      }
    }
    function Dh(e) {
      {
        var t = e.stateNode, a = t && t.__reactInternalMemoizedMergedChildContext || ai;
        return Yy = Du.current, la(Du, a, e), la(jl, jl.current, e), !0;
      }
    }
    function q0(e, t, a) {
      {
        var i = e.stateNode;
        if (!i)
          throw new Error("Expected to have an instance by this point. This error is likely caused by a bug in React. Please file an issue.");
        if (a) {
          var u = G0(e, t, Yy);
          i.__reactInternalMemoizedMergedChildContext = u, ia(jl, e), ia(Du, e), la(Du, u, e), la(jl, a, e);
        } else
          ia(jl, e), la(jl, a, e);
      }
    }
    function aw(e) {
      {
        if (!pd(e) || e.tag !== pe)
          throw new Error("Expected subtree parent to be a mounted class component. This error is likely caused by a bug in React. Please file an issue.");
        var t = e;
        do {
          switch (t.tag) {
            case re:
              return t.stateNode.context;
            case pe: {
              var a = t.type;
              if (Pl(a))
                return t.stateNode.__reactInternalMemoizedMergedChildContext;
              break;
            }
          }
          t = t.return;
        } while (t !== null);
        throw new Error("Found unexpected detached subtree parent. This error is likely caused by a bug in React. Please file an issue.");
      }
    }
    var Mo = 0, kh = 1, ku = null, Qy = !1, Wy = !1;
    function X0(e) {
      ku === null ? ku = [e] : ku.push(e);
    }
    function iw(e) {
      Qy = !0, X0(e);
    }
    function K0() {
      Qy && No();
    }
    function No() {
      if (!Wy && ku !== null) {
        Wy = !0;
        var e = 0, t = Fa();
        try {
          var a = !0, i = ku;
          for (Vn(Sr); e < i.length; e++) {
            var u = i[e];
            do
              u = u(a);
            while (u !== null);
          }
          ku = null, Qy = !1;
        } catch (s) {
          throw ku !== null && (ku = ku.slice(e + 1)), hc(yc, No), s;
        } finally {
          Vn(t), Wy = !1;
        }
      }
      return null;
    }
    var mf = [], yf = 0, Oh = null, Lh = 0, Ri = [], Ti = 0, Us = null, Ou = 1, Lu = "";
    function lw(e) {
      return Fs(), (e.flags & cd) !== De;
    }
    function uw(e) {
      return Fs(), Lh;
    }
    function ow() {
      var e = Lu, t = Ou, a = t & ~sw(t);
      return a.toString(32) + e;
    }
    function As(e, t) {
      Fs(), mf[yf++] = Lh, mf[yf++] = Oh, Oh = e, Lh = t;
    }
    function Z0(e, t, a) {
      Fs(), Ri[Ti++] = Ou, Ri[Ti++] = Lu, Ri[Ti++] = Us, Us = e;
      var i = Ou, u = Lu, s = Mh(i) - 1, f = i & ~(1 << s), p = a + 1, v = Mh(t) + s;
      if (v > 30) {
        var y = s - s % 5, g = (1 << y) - 1, b = (f & g).toString(32), x = f >> y, M = s - y, z = Mh(t) + M, H = p << M, fe = H | x, Oe = b + u;
        Ou = 1 << z | fe, Lu = Oe;
      } else {
        var Te = p << s, St = Te | f, pt = u;
        Ou = 1 << v | St, Lu = pt;
      }
    }
    function Gy(e) {
      Fs();
      var t = e.return;
      if (t !== null) {
        var a = 1, i = 0;
        As(e, a), Z0(e, a, i);
      }
    }
    function Mh(e) {
      return 32 - Tc(e);
    }
    function sw(e) {
      return 1 << Mh(e) - 1;
    }
    function qy(e) {
      for (; e === Oh; )
        Oh = mf[--yf], mf[yf] = null, Lh = mf[--yf], mf[yf] = null;
      for (; e === Us; )
        Us = Ri[--Ti], Ri[Ti] = null, Lu = Ri[--Ti], Ri[Ti] = null, Ou = Ri[--Ti], Ri[Ti] = null;
    }
    function cw() {
      return Fs(), Us !== null ? {
        id: Ou,
        overflow: Lu
      } : null;
    }
    function fw(e, t) {
      Fs(), Ri[Ti++] = Ou, Ri[Ti++] = Lu, Ri[Ti++] = Us, Ou = t.id, Lu = t.overflow, Us = e;
    }
    function Fs() {
      Nr() || S("Expected to be hydrating. This is a bug in React. Please file an issue.");
    }
    var Mr = null, wi = null, qi = !1, Hs = !1, zo = null;
    function dw() {
      qi && S("We should not be hydrating here. This is a bug in React. Please file a bug.");
    }
    function J0() {
      Hs = !0;
    }
    function pw() {
      return Hs;
    }
    function vw(e) {
      var t = e.stateNode.containerInfo;
      return wi = MT(t), Mr = e, qi = !0, zo = null, Hs = !1, !0;
    }
    function hw(e, t, a) {
      return wi = NT(t), Mr = e, qi = !0, zo = null, Hs = !1, a !== null && fw(e, a), !0;
    }
    function eE(e, t) {
      switch (e.tag) {
        case re: {
          $T(e.stateNode.containerInfo, t);
          break;
        }
        case ie: {
          var a = (e.mode & ot) !== Me;
          IT(
            e.type,
            e.memoizedProps,
            e.stateNode,
            t,
            a
          );
          break;
        }
        case _e: {
          var i = e.memoizedState;
          i.dehydrated !== null && YT(i.dehydrated, t);
          break;
        }
      }
    }
    function tE(e, t) {
      eE(e, t);
      var a = Sb();
      a.stateNode = t, a.return = e;
      var i = e.deletions;
      i === null ? (e.deletions = [a], e.flags |= Mt) : i.push(a);
    }
    function Xy(e, t) {
      {
        if (Hs)
          return;
        switch (e.tag) {
          case re: {
            var a = e.stateNode.containerInfo;
            switch (t.tag) {
              case ie:
                var i = t.type;
                t.pendingProps, QT(a, i);
                break;
              case Pe:
                var u = t.pendingProps;
                WT(a, u);
                break;
            }
            break;
          }
          case ie: {
            var s = e.type, f = e.memoizedProps, p = e.stateNode;
            switch (t.tag) {
              case ie: {
                var v = t.type, y = t.pendingProps, g = (e.mode & ot) !== Me;
                XT(
                  s,
                  f,
                  p,
                  v,
                  y,
                  g
                );
                break;
              }
              case Pe: {
                var b = t.pendingProps, x = (e.mode & ot) !== Me;
                KT(
                  s,
                  f,
                  p,
                  b,
                  x
                );
                break;
              }
            }
            break;
          }
          case _e: {
            var M = e.memoizedState, z = M.dehydrated;
            if (z !== null)
              switch (t.tag) {
                case ie:
                  var H = t.type;
                  t.pendingProps, GT(z, H);
                  break;
                case Pe:
                  var fe = t.pendingProps;
                  qT(z, fe);
                  break;
              }
            break;
          }
          default:
            return;
        }
      }
    }
    function nE(e, t) {
      t.flags = t.flags & ~Ma | rn, Xy(e, t);
    }
    function rE(e, t) {
      switch (e.tag) {
        case ie: {
          var a = e.type;
          e.pendingProps;
          var i = _T(t, a);
          return i !== null ? (e.stateNode = i, Mr = e, wi = LT(i), !0) : !1;
        }
        case Pe: {
          var u = e.pendingProps, s = bT(t, u);
          return s !== null ? (e.stateNode = s, Mr = e, wi = null, !0) : !1;
        }
        case _e: {
          var f = DT(t);
          if (f !== null) {
            var p = {
              dehydrated: f,
              treeContext: cw(),
              retryLane: ra
            };
            e.memoizedState = p;
            var v = Eb(f);
            return v.return = e, e.child = v, Mr = e, wi = null, !0;
          }
          return !1;
        }
        default:
          return !1;
      }
    }
    function Ky(e) {
      return (e.mode & ot) !== Me && (e.flags & Ve) === De;
    }
    function Zy(e) {
      throw new Error("Hydration failed because the initial UI does not match what was rendered on the server.");
    }
    function Jy(e) {
      if (!!qi) {
        var t = wi;
        if (!t) {
          Ky(e) && (Xy(Mr, e), Zy()), nE(Mr, e), qi = !1, Mr = e;
          return;
        }
        var a = t;
        if (!rE(e, t)) {
          Ky(e) && (Xy(Mr, e), Zy()), t = up(a);
          var i = Mr;
          if (!t || !rE(e, t)) {
            nE(Mr, e), qi = !1, Mr = e;
            return;
          }
          tE(i, a);
        }
      }
    }
    function mw(e, t, a) {
      var i = e.stateNode, u = !Hs, s = zT(i, e.type, e.memoizedProps, t, a, e, u);
      return e.updateQueue = s, s !== null;
    }
    function yw(e) {
      var t = e.stateNode, a = e.memoizedProps, i = UT(t, a, e);
      if (i) {
        var u = Mr;
        if (u !== null)
          switch (u.tag) {
            case re: {
              var s = u.stateNode.containerInfo, f = (u.mode & ot) !== Me;
              VT(
                s,
                t,
                a,
                f
              );
              break;
            }
            case ie: {
              var p = u.type, v = u.memoizedProps, y = u.stateNode, g = (u.mode & ot) !== Me;
              BT(
                p,
                v,
                y,
                t,
                a,
                g
              );
              break;
            }
          }
      }
      return i;
    }
    function gw(e) {
      var t = e.memoizedState, a = t !== null ? t.dehydrated : null;
      if (!a)
        throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
      AT(a, e);
    }
    function Sw(e) {
      var t = e.memoizedState, a = t !== null ? t.dehydrated : null;
      if (!a)
        throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
      return FT(a);
    }
    function aE(e) {
      for (var t = e.return; t !== null && t.tag !== ie && t.tag !== re && t.tag !== _e; )
        t = t.return;
      Mr = t;
    }
    function Nh(e) {
      if (e !== Mr)
        return !1;
      if (!qi)
        return aE(e), qi = !0, !1;
      if (e.tag !== re && (e.tag !== ie || PT(e.type) && !zy(e.type, e.memoizedProps))) {
        var t = wi;
        if (t)
          if (Ky(e))
            iE(e), Zy();
          else
            for (; t; )
              tE(e, t), t = up(t);
      }
      return aE(e), e.tag === _e ? wi = Sw(e) : wi = Mr ? up(e.stateNode) : null, !0;
    }
    function Ew() {
      return qi && wi !== null;
    }
    function iE(e) {
      for (var t = wi; t; )
        eE(e, t), t = up(t);
    }
    function gf() {
      Mr = null, wi = null, qi = !1, Hs = !1;
    }
    function lE() {
      zo !== null && (e1(zo), zo = null);
    }
    function Nr() {
      return qi;
    }
    function eg(e) {
      zo === null ? zo = [e] : zo.push(e);
    }
    var Cw = A.ReactCurrentBatchConfig, Rw = null;
    function Tw() {
      return Cw.transition;
    }
    var Xi = {
      recordUnsafeLifecycleWarnings: function(e, t) {
      },
      flushPendingUnsafeLifecycleWarnings: function() {
      },
      recordLegacyContextWarning: function(e, t) {
      },
      flushLegacyContextWarning: function() {
      },
      discardPendingWarnings: function() {
      }
    };
    {
      var ww = function(e) {
        for (var t = null, a = e; a !== null; )
          a.mode & gn && (t = a), a = a.return;
        return t;
      }, js = function(e) {
        var t = [];
        return e.forEach(function(a) {
          t.push(a);
        }), t.sort().join(", ");
      }, fp = [], dp = [], pp = [], vp = [], hp = [], mp = [], Ps = /* @__PURE__ */ new Set();
      Xi.recordUnsafeLifecycleWarnings = function(e, t) {
        Ps.has(e.type) || (typeof t.componentWillMount == "function" && t.componentWillMount.__suppressDeprecationWarning !== !0 && fp.push(e), e.mode & gn && typeof t.UNSAFE_componentWillMount == "function" && dp.push(e), typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps.__suppressDeprecationWarning !== !0 && pp.push(e), e.mode & gn && typeof t.UNSAFE_componentWillReceiveProps == "function" && vp.push(e), typeof t.componentWillUpdate == "function" && t.componentWillUpdate.__suppressDeprecationWarning !== !0 && hp.push(e), e.mode & gn && typeof t.UNSAFE_componentWillUpdate == "function" && mp.push(e));
      }, Xi.flushPendingUnsafeLifecycleWarnings = function() {
        var e = /* @__PURE__ */ new Set();
        fp.length > 0 && (fp.forEach(function(x) {
          e.add(Ye(x) || "Component"), Ps.add(x.type);
        }), fp = []);
        var t = /* @__PURE__ */ new Set();
        dp.length > 0 && (dp.forEach(function(x) {
          t.add(Ye(x) || "Component"), Ps.add(x.type);
        }), dp = []);
        var a = /* @__PURE__ */ new Set();
        pp.length > 0 && (pp.forEach(function(x) {
          a.add(Ye(x) || "Component"), Ps.add(x.type);
        }), pp = []);
        var i = /* @__PURE__ */ new Set();
        vp.length > 0 && (vp.forEach(function(x) {
          i.add(Ye(x) || "Component"), Ps.add(x.type);
        }), vp = []);
        var u = /* @__PURE__ */ new Set();
        hp.length > 0 && (hp.forEach(function(x) {
          u.add(Ye(x) || "Component"), Ps.add(x.type);
        }), hp = []);
        var s = /* @__PURE__ */ new Set();
        if (mp.length > 0 && (mp.forEach(function(x) {
          s.add(Ye(x) || "Component"), Ps.add(x.type);
        }), mp = []), t.size > 0) {
          var f = js(t);
          S(`Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.

Please update the following components: %s`, f);
        }
        if (i.size > 0) {
          var p = js(i);
          S(`Using UNSAFE_componentWillReceiveProps in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state

Please update the following components: %s`, p);
        }
        if (s.size > 0) {
          var v = js(s);
          S(`Using UNSAFE_componentWillUpdate in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.

Please update the following components: %s`, v);
        }
        if (e.size > 0) {
          var y = js(e);
          Je(`componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.
* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, y);
        }
        if (a.size > 0) {
          var g = js(a);
          Je(`componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, g);
        }
        if (u.size > 0) {
          var b = js(u);
          Je(`componentWillUpdate has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* Rename componentWillUpdate to UNSAFE_componentWillUpdate to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, b);
        }
      };
      var zh = /* @__PURE__ */ new Map(), uE = /* @__PURE__ */ new Set();
      Xi.recordLegacyContextWarning = function(e, t) {
        var a = ww(e);
        if (a === null) {
          S("Expected to find a StrictMode component in a strict mode tree. This error is likely caused by a bug in React. Please file an issue.");
          return;
        }
        if (!uE.has(e.type)) {
          var i = zh.get(a);
          (e.type.contextTypes != null || e.type.childContextTypes != null || t !== null && typeof t.getChildContext == "function") && (i === void 0 && (i = [], zh.set(a, i)), i.push(e));
        }
      }, Xi.flushLegacyContextWarning = function() {
        zh.forEach(function(e, t) {
          if (e.length !== 0) {
            var a = e[0], i = /* @__PURE__ */ new Set();
            e.forEach(function(s) {
              i.add(Ye(s) || "Component"), uE.add(s.type);
            });
            var u = js(i);
            try {
              Ht(a), S(`Legacy context API has been detected within a strict-mode tree.

The old API will be supported in all 16.x releases, but applications using it should migrate to the new version.

Please update the following components: %s

Learn more about this warning here: https://reactjs.org/link/legacy-context`, u);
            } finally {
              Rn();
            }
          }
        });
      }, Xi.discardPendingWarnings = function() {
        fp = [], dp = [], pp = [], vp = [], hp = [], mp = [], zh = /* @__PURE__ */ new Map();
      };
    }
    function Ki(e, t) {
      if (e && e.defaultProps) {
        var a = lt({}, t), i = e.defaultProps;
        for (var u in i)
          a[u] === void 0 && (a[u] = i[u]);
        return a;
      }
      return t;
    }
    var tg = Lo(null), ng;
    ng = {};
    var Uh = null, Sf = null, rg = null, Ah = !1;
    function Fh() {
      Uh = null, Sf = null, rg = null, Ah = !1;
    }
    function oE() {
      Ah = !0;
    }
    function sE() {
      Ah = !1;
    }
    function cE(e, t, a) {
      la(tg, t._currentValue, e), t._currentValue = a, t._currentRenderer !== void 0 && t._currentRenderer !== null && t._currentRenderer !== ng && S("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), t._currentRenderer = ng;
    }
    function ag(e, t) {
      var a = tg.current;
      ia(tg, t), e._currentValue = a;
    }
    function ig(e, t, a) {
      for (var i = e; i !== null; ) {
        var u = i.alternate;
        if (mu(i.childLanes, t) ? u !== null && !mu(u.childLanes, t) && (u.childLanes = Ze(u.childLanes, t)) : (i.childLanes = Ze(i.childLanes, t), u !== null && (u.childLanes = Ze(u.childLanes, t))), i === a)
          break;
        i = i.return;
      }
      i !== a && S("Expected to find the propagation root when scheduling context work. This error is likely caused by a bug in React. Please file an issue.");
    }
    function xw(e, t, a) {
      _w(e, t, a);
    }
    function _w(e, t, a) {
      var i = e.child;
      for (i !== null && (i.return = e); i !== null; ) {
        var u = void 0, s = i.dependencies;
        if (s !== null) {
          u = i.child;
          for (var f = s.firstContext; f !== null; ) {
            if (f.context === t) {
              if (i.tag === pe) {
                var p = Pn(a), v = Mu(Zt, p);
                v.tag = jh;
                var y = i.updateQueue;
                if (y !== null) {
                  var g = y.shared, b = g.pending;
                  b === null ? v.next = v : (v.next = b.next, b.next = v), g.pending = v;
                }
              }
              i.lanes = Ze(i.lanes, a);
              var x = i.alternate;
              x !== null && (x.lanes = Ze(x.lanes, a)), ig(i.return, a, e), s.lanes = Ze(s.lanes, a);
              break;
            }
            f = f.next;
          }
        } else if (i.tag === at)
          u = i.type === e.type ? null : i.child;
        else if (i.tag === Qt) {
          var M = i.return;
          if (M === null)
            throw new Error("We just came from a parent so we must have had a parent. This is a bug in React.");
          M.lanes = Ze(M.lanes, a);
          var z = M.alternate;
          z !== null && (z.lanes = Ze(z.lanes, a)), ig(M, a, e), u = i.sibling;
        } else
          u = i.child;
        if (u !== null)
          u.return = i;
        else
          for (u = i; u !== null; ) {
            if (u === e) {
              u = null;
              break;
            }
            var H = u.sibling;
            if (H !== null) {
              H.return = u.return, u = H;
              break;
            }
            u = u.return;
          }
        i = u;
      }
    }
    function Ef(e, t) {
      Uh = e, Sf = null, rg = null;
      var a = e.dependencies;
      if (a !== null) {
        var i = a.firstContext;
        i !== null && (aa(a.lanes, t) && Op(), a.firstContext = null);
      }
    }
    function er(e) {
      Ah && S("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
      var t = e._currentValue;
      if (rg !== e) {
        var a = {
          context: e,
          memoizedValue: t,
          next: null
        };
        if (Sf === null) {
          if (Uh === null)
            throw new Error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
          Sf = a, Uh.dependencies = {
            lanes: P,
            firstContext: a
          };
        } else
          Sf = Sf.next = a;
      }
      return t;
    }
    var Vs = null;
    function lg(e) {
      Vs === null ? Vs = [e] : Vs.push(e);
    }
    function bw() {
      if (Vs !== null) {
        for (var e = 0; e < Vs.length; e++) {
          var t = Vs[e], a = t.interleaved;
          if (a !== null) {
            t.interleaved = null;
            var i = a.next, u = t.pending;
            if (u !== null) {
              var s = u.next;
              u.next = i, a.next = s;
            }
            t.pending = a;
          }
        }
        Vs = null;
      }
    }
    function fE(e, t, a, i) {
      var u = t.interleaved;
      return u === null ? (a.next = a, lg(t)) : (a.next = u.next, u.next = a), t.interleaved = a, Hh(e, i);
    }
    function Dw(e, t, a, i) {
      var u = t.interleaved;
      u === null ? (a.next = a, lg(t)) : (a.next = u.next, u.next = a), t.interleaved = a;
    }
    function kw(e, t, a, i) {
      var u = t.interleaved;
      return u === null ? (a.next = a, lg(t)) : (a.next = u.next, u.next = a), t.interleaved = a, Hh(e, i);
    }
    function Ba(e, t) {
      return Hh(e, t);
    }
    var Ow = Hh;
    function Hh(e, t) {
      e.lanes = Ze(e.lanes, t);
      var a = e.alternate;
      a !== null && (a.lanes = Ze(a.lanes, t)), a === null && (e.flags & (rn | Ma)) !== De && d1(e);
      for (var i = e, u = e.return; u !== null; )
        u.childLanes = Ze(u.childLanes, t), a = u.alternate, a !== null ? a.childLanes = Ze(a.childLanes, t) : (u.flags & (rn | Ma)) !== De && d1(e), i = u, u = u.return;
      if (i.tag === re) {
        var s = i.stateNode;
        return s;
      } else
        return null;
    }
    var dE = 0, pE = 1, jh = 2, ug = 3, Ph = !1, og, Vh;
    og = !1, Vh = null;
    function sg(e) {
      var t = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
          pending: null,
          interleaved: null,
          lanes: P
        },
        effects: null
      };
      e.updateQueue = t;
    }
    function vE(e, t) {
      var a = t.updateQueue, i = e.updateQueue;
      if (a === i) {
        var u = {
          baseState: i.baseState,
          firstBaseUpdate: i.firstBaseUpdate,
          lastBaseUpdate: i.lastBaseUpdate,
          shared: i.shared,
          effects: i.effects
        };
        t.updateQueue = u;
      }
    }
    function Mu(e, t) {
      var a = {
        eventTime: e,
        lane: t,
        tag: dE,
        payload: null,
        callback: null,
        next: null
      };
      return a;
    }
    function Uo(e, t, a) {
      var i = e.updateQueue;
      if (i === null)
        return null;
      var u = i.shared;
      if (Vh === u && !og && (S("An update (setState, replaceState, or forceUpdate) was scheduled from inside an update function. Update functions should be pure, with zero side-effects. Consider using componentDidUpdate or a callback."), og = !0), L_()) {
        var s = u.pending;
        return s === null ? t.next = t : (t.next = s.next, s.next = t), u.pending = t, Ow(e, a);
      } else
        return kw(e, u, t, a);
    }
    function Bh(e, t, a) {
      var i = t.updateQueue;
      if (i !== null) {
        var u = i.shared;
        if (_d(a)) {
          var s = u.lanes;
          s = Dd(s, e.pendingLanes);
          var f = Ze(s, a);
          u.lanes = f, ho(e, f);
        }
      }
    }
    function cg(e, t) {
      var a = e.updateQueue, i = e.alternate;
      if (i !== null) {
        var u = i.updateQueue;
        if (a === u) {
          var s = null, f = null, p = a.firstBaseUpdate;
          if (p !== null) {
            var v = p;
            do {
              var y = {
                eventTime: v.eventTime,
                lane: v.lane,
                tag: v.tag,
                payload: v.payload,
                callback: v.callback,
                next: null
              };
              f === null ? s = f = y : (f.next = y, f = y), v = v.next;
            } while (v !== null);
            f === null ? s = f = t : (f.next = t, f = t);
          } else
            s = f = t;
          a = {
            baseState: u.baseState,
            firstBaseUpdate: s,
            lastBaseUpdate: f,
            shared: u.shared,
            effects: u.effects
          }, e.updateQueue = a;
          return;
        }
      }
      var g = a.lastBaseUpdate;
      g === null ? a.firstBaseUpdate = t : g.next = t, a.lastBaseUpdate = t;
    }
    function Lw(e, t, a, i, u, s) {
      switch (a.tag) {
        case pE: {
          var f = a.payload;
          if (typeof f == "function") {
            oE();
            var p = f.call(s, i, u);
            {
              if (e.mode & gn) {
                jn(!0);
                try {
                  f.call(s, i, u);
                } finally {
                  jn(!1);
                }
              }
              sE();
            }
            return p;
          }
          return f;
        }
        case ug:
          e.flags = e.flags & ~qn | Ve;
        case dE: {
          var v = a.payload, y;
          if (typeof v == "function") {
            oE(), y = v.call(s, i, u);
            {
              if (e.mode & gn) {
                jn(!0);
                try {
                  v.call(s, i, u);
                } finally {
                  jn(!1);
                }
              }
              sE();
            }
          } else
            y = v;
          return y == null ? i : lt({}, i, y);
        }
        case jh:
          return Ph = !0, i;
      }
      return i;
    }
    function $h(e, t, a, i) {
      var u = e.updateQueue;
      Ph = !1, Vh = u.shared;
      var s = u.firstBaseUpdate, f = u.lastBaseUpdate, p = u.shared.pending;
      if (p !== null) {
        u.shared.pending = null;
        var v = p, y = v.next;
        v.next = null, f === null ? s = y : f.next = y, f = v;
        var g = e.alternate;
        if (g !== null) {
          var b = g.updateQueue, x = b.lastBaseUpdate;
          x !== f && (x === null ? b.firstBaseUpdate = y : x.next = y, b.lastBaseUpdate = v);
        }
      }
      if (s !== null) {
        var M = u.baseState, z = P, H = null, fe = null, Oe = null, Te = s;
        do {
          var St = Te.lane, pt = Te.eventTime;
          if (mu(i, St)) {
            if (Oe !== null) {
              var j = {
                eventTime: pt,
                lane: yt,
                tag: Te.tag,
                payload: Te.payload,
                callback: Te.callback,
                next: null
              };
              Oe = Oe.next = j;
            }
            M = Lw(e, u, Te, M, t, a);
            var O = Te.callback;
            if (O !== null && Te.lane !== yt) {
              e.flags |= mi;
              var G = u.effects;
              G === null ? u.effects = [Te] : G.push(Te);
            }
          } else {
            var k = {
              eventTime: pt,
              lane: St,
              tag: Te.tag,
              payload: Te.payload,
              callback: Te.callback,
              next: null
            };
            Oe === null ? (fe = Oe = k, H = M) : Oe = Oe.next = k, z = Ze(z, St);
          }
          if (Te = Te.next, Te === null) {
            if (p = u.shared.pending, p === null)
              break;
            var de = p, ue = de.next;
            de.next = null, Te = ue, u.lastBaseUpdate = de, u.shared.pending = null;
          }
        } while (!0);
        Oe === null && (H = M), u.baseState = H, u.firstBaseUpdate = fe, u.lastBaseUpdate = Oe;
        var je = u.shared.interleaved;
        if (je !== null) {
          var We = je;
          do
            z = Ze(z, We.lane), We = We.next;
          while (We !== je);
        } else
          s === null && (u.shared.lanes = P);
        Bp(z), e.lanes = z, e.memoizedState = M;
      }
      Vh = null;
    }
    function Mw(e, t) {
      if (typeof e != "function")
        throw new Error("Invalid argument passed as callback. Expected a function. Instead " + ("received: " + e));
      e.call(t);
    }
    function hE() {
      Ph = !1;
    }
    function Yh() {
      return Ph;
    }
    function mE(e, t, a) {
      var i = t.effects;
      if (t.effects = null, i !== null)
        for (var u = 0; u < i.length; u++) {
          var s = i[u], f = s.callback;
          f !== null && (s.callback = null, Mw(f, a));
        }
    }
    var fg = {}, yE = new B.Component().refs, dg, pg, vg, hg, mg, gE, Ih, yg, gg, Sg;
    {
      dg = /* @__PURE__ */ new Set(), pg = /* @__PURE__ */ new Set(), vg = /* @__PURE__ */ new Set(), hg = /* @__PURE__ */ new Set(), yg = /* @__PURE__ */ new Set(), mg = /* @__PURE__ */ new Set(), gg = /* @__PURE__ */ new Set(), Sg = /* @__PURE__ */ new Set();
      var SE = /* @__PURE__ */ new Set();
      Ih = function(e, t) {
        if (!(e === null || typeof e == "function")) {
          var a = t + "_" + e;
          SE.has(a) || (SE.add(a), S("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", t, e));
        }
      }, gE = function(e, t) {
        if (t === void 0) {
          var a = wt(e) || "Component";
          mg.has(a) || (mg.add(a), S("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", a));
        }
      }, Object.defineProperty(fg, "_processChildContext", {
        enumerable: !1,
        value: function() {
          throw new Error("_processChildContext is not available in React 16+. This likely means you have multiple copies of React and are attempting to nest a React 15 tree inside a React 16 tree using unstable_renderSubtreeIntoContainer, which isn't supported. Try to make sure you have only one copy of React (and ideally, switch to ReactDOM.createPortal).");
        }
      }), Object.freeze(fg);
    }
    function Eg(e, t, a, i) {
      var u = e.memoizedState, s = a(i, u);
      {
        if (e.mode & gn) {
          jn(!0);
          try {
            s = a(i, u);
          } finally {
            jn(!1);
          }
        }
        gE(t, s);
      }
      var f = s == null ? u : lt({}, u, s);
      if (e.memoizedState = f, e.lanes === P) {
        var p = e.updateQueue;
        p.baseState = f;
      }
    }
    var Cg = {
      isMounted: ya,
      enqueueSetState: function(e, t, a) {
        var i = Oa(e), u = Ta(), s = $o(i), f = Mu(u, s);
        f.payload = t, a != null && (Ih(a, "setState"), f.callback = a);
        var p = Uo(i, f, s);
        p !== null && (pr(p, i, s, u), Bh(p, i, s)), Ol(i, s);
      },
      enqueueReplaceState: function(e, t, a) {
        var i = Oa(e), u = Ta(), s = $o(i), f = Mu(u, s);
        f.tag = pE, f.payload = t, a != null && (Ih(a, "replaceState"), f.callback = a);
        var p = Uo(i, f, s);
        p !== null && (pr(p, i, s, u), Bh(p, i, s)), Ol(i, s);
      },
      enqueueForceUpdate: function(e, t) {
        var a = Oa(e), i = Ta(), u = $o(a), s = Mu(i, u);
        s.tag = jh, t != null && (Ih(t, "forceUpdate"), s.callback = t);
        var f = Uo(a, s, u);
        f !== null && (pr(f, a, u, i), Bh(f, a, u)), Rd(a, u);
      }
    };
    function EE(e, t, a, i, u, s, f) {
      var p = e.stateNode;
      if (typeof p.shouldComponentUpdate == "function") {
        var v = p.shouldComponentUpdate(i, s, f);
        {
          if (e.mode & gn) {
            jn(!0);
            try {
              v = p.shouldComponentUpdate(i, s, f);
            } finally {
              jn(!1);
            }
          }
          v === void 0 && S("%s.shouldComponentUpdate(): Returned undefined instead of a boolean value. Make sure to return true or false.", wt(t) || "Component");
        }
        return v;
      }
      return t.prototype && t.prototype.isPureReactComponent ? !be(a, i) || !be(u, s) : !0;
    }
    function Nw(e, t, a) {
      var i = e.stateNode;
      {
        var u = wt(t) || "Component", s = i.render;
        s || (t.prototype && typeof t.prototype.render == "function" ? S("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", u) : S("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", u)), i.getInitialState && !i.getInitialState.isReactClassApproved && !i.state && S("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", u), i.getDefaultProps && !i.getDefaultProps.isReactClassApproved && S("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", u), i.propTypes && S("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", u), i.contextType && S("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", u), i.contextTypes && S("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", u), t.contextType && t.contextTypes && !gg.has(t) && (gg.add(t), S("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", u)), typeof i.componentShouldUpdate == "function" && S("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", u), t.prototype && t.prototype.isPureReactComponent && typeof i.shouldComponentUpdate < "u" && S("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", wt(t) || "A pure component"), typeof i.componentDidUnmount == "function" && S("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", u), typeof i.componentDidReceiveProps == "function" && S("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", u), typeof i.componentWillRecieveProps == "function" && S("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", u), typeof i.UNSAFE_componentWillRecieveProps == "function" && S("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", u);
        var f = i.props !== a;
        i.props !== void 0 && f && S("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", u, u), i.defaultProps && S("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", u, u), typeof i.getSnapshotBeforeUpdate == "function" && typeof i.componentDidUpdate != "function" && !vg.has(t) && (vg.add(t), S("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", wt(t))), typeof i.getDerivedStateFromProps == "function" && S("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", u), typeof i.getDerivedStateFromError == "function" && S("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", u), typeof t.getSnapshotBeforeUpdate == "function" && S("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", u);
        var p = i.state;
        p && (typeof p != "object" || vt(p)) && S("%s.state: must be set to an object or null", u), typeof i.getChildContext == "function" && typeof t.childContextTypes != "object" && S("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", u);
      }
    }
    function CE(e, t) {
      t.updater = Cg, e.stateNode = t, ao(t, e), t._reactInternalInstance = fg;
    }
    function RE(e, t, a) {
      var i = !1, u = ai, s = ai, f = t.contextType;
      if ("contextType" in t) {
        var p = f === null || f !== void 0 && f.$$typeof === ee && f._context === void 0;
        if (!p && !Sg.has(t)) {
          Sg.add(t);
          var v = "";
          f === void 0 ? v = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file." : typeof f != "object" ? v = " However, it is set to a " + typeof f + "." : f.$$typeof === Y ? v = " Did you accidentally pass the Context.Provider instead?" : f._context !== void 0 ? v = " Did you accidentally pass the Context.Consumer instead?" : v = " However, it is set to an object with keys {" + Object.keys(f).join(", ") + "}.", S("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", wt(t) || "Component", v);
        }
      }
      if (typeof f == "object" && f !== null)
        s = er(f);
      else {
        u = vf(e, t, !0);
        var y = t.contextTypes;
        i = y != null, s = i ? hf(e, u) : ai;
      }
      var g = new t(a, s);
      if (e.mode & gn) {
        jn(!0);
        try {
          g = new t(a, s);
        } finally {
          jn(!1);
        }
      }
      var b = e.memoizedState = g.state !== null && g.state !== void 0 ? g.state : null;
      CE(e, g);
      {
        if (typeof t.getDerivedStateFromProps == "function" && b === null) {
          var x = wt(t) || "Component";
          pg.has(x) || (pg.add(x), S("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", x, g.state === null ? "null" : "undefined", x));
        }
        if (typeof t.getDerivedStateFromProps == "function" || typeof g.getSnapshotBeforeUpdate == "function") {
          var M = null, z = null, H = null;
          if (typeof g.componentWillMount == "function" && g.componentWillMount.__suppressDeprecationWarning !== !0 ? M = "componentWillMount" : typeof g.UNSAFE_componentWillMount == "function" && (M = "UNSAFE_componentWillMount"), typeof g.componentWillReceiveProps == "function" && g.componentWillReceiveProps.__suppressDeprecationWarning !== !0 ? z = "componentWillReceiveProps" : typeof g.UNSAFE_componentWillReceiveProps == "function" && (z = "UNSAFE_componentWillReceiveProps"), typeof g.componentWillUpdate == "function" && g.componentWillUpdate.__suppressDeprecationWarning !== !0 ? H = "componentWillUpdate" : typeof g.UNSAFE_componentWillUpdate == "function" && (H = "UNSAFE_componentWillUpdate"), M !== null || z !== null || H !== null) {
            var fe = wt(t) || "Component", Oe = typeof t.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
            hg.has(fe) || (hg.add(fe), S(`Unsafe legacy lifecycles will not be called for components using new component APIs.

%s uses %s but also contains the following legacy lifecycles:%s%s%s

The above lifecycles should be removed. Learn more about this warning here:
https://reactjs.org/link/unsafe-component-lifecycles`, fe, Oe, M !== null ? `
  ` + M : "", z !== null ? `
  ` + z : "", H !== null ? `
  ` + H : ""));
          }
        }
      }
      return i && Q0(e, u, s), g;
    }
    function zw(e, t) {
      var a = t.state;
      typeof t.componentWillMount == "function" && t.componentWillMount(), typeof t.UNSAFE_componentWillMount == "function" && t.UNSAFE_componentWillMount(), a !== t.state && (S("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", Ye(e) || "Component"), Cg.enqueueReplaceState(t, t.state, null));
    }
    function TE(e, t, a, i) {
      var u = t.state;
      if (typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, i), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, i), t.state !== u) {
        {
          var s = Ye(e) || "Component";
          dg.has(s) || (dg.add(s), S("%s.componentWillReceiveProps(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", s));
        }
        Cg.enqueueReplaceState(t, t.state, null);
      }
    }
    function Rg(e, t, a, i) {
      Nw(e, t, a);
      var u = e.stateNode;
      u.props = a, u.state = e.memoizedState, u.refs = yE, sg(e);
      var s = t.contextType;
      if (typeof s == "object" && s !== null)
        u.context = er(s);
      else {
        var f = vf(e, t, !0);
        u.context = hf(e, f);
      }
      {
        if (u.state === a) {
          var p = wt(t) || "Component";
          yg.has(p) || (yg.add(p), S("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", p));
        }
        e.mode & gn && Xi.recordLegacyContextWarning(e, u), Xi.recordUnsafeLifecycleWarnings(e, u);
      }
      u.state = e.memoizedState;
      var v = t.getDerivedStateFromProps;
      if (typeof v == "function" && (Eg(e, t, v, a), u.state = e.memoizedState), typeof t.getDerivedStateFromProps != "function" && typeof u.getSnapshotBeforeUpdate != "function" && (typeof u.UNSAFE_componentWillMount == "function" || typeof u.componentWillMount == "function") && (zw(e, u), $h(e, a, u, i), u.state = e.memoizedState), typeof u.componentDidMount == "function") {
        var y = Ke;
        y |= Zr, (e.mode & Ua) !== Me && (y |= Jr), e.flags |= y;
      }
    }
    function Uw(e, t, a, i) {
      var u = e.stateNode, s = e.memoizedProps;
      u.props = s;
      var f = u.context, p = t.contextType, v = ai;
      if (typeof p == "object" && p !== null)
        v = er(p);
      else {
        var y = vf(e, t, !0);
        v = hf(e, y);
      }
      var g = t.getDerivedStateFromProps, b = typeof g == "function" || typeof u.getSnapshotBeforeUpdate == "function";
      !b && (typeof u.UNSAFE_componentWillReceiveProps == "function" || typeof u.componentWillReceiveProps == "function") && (s !== a || f !== v) && TE(e, u, a, v), hE();
      var x = e.memoizedState, M = u.state = x;
      if ($h(e, a, u, i), M = e.memoizedState, s === a && x === M && !_h() && !Yh()) {
        if (typeof u.componentDidMount == "function") {
          var z = Ke;
          z |= Zr, (e.mode & Ua) !== Me && (z |= Jr), e.flags |= z;
        }
        return !1;
      }
      typeof g == "function" && (Eg(e, t, g, a), M = e.memoizedState);
      var H = Yh() || EE(e, t, s, a, x, M, v);
      if (H) {
        if (!b && (typeof u.UNSAFE_componentWillMount == "function" || typeof u.componentWillMount == "function") && (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function") {
          var fe = Ke;
          fe |= Zr, (e.mode & Ua) !== Me && (fe |= Jr), e.flags |= fe;
        }
      } else {
        if (typeof u.componentDidMount == "function") {
          var Oe = Ke;
          Oe |= Zr, (e.mode & Ua) !== Me && (Oe |= Jr), e.flags |= Oe;
        }
        e.memoizedProps = a, e.memoizedState = M;
      }
      return u.props = a, u.state = M, u.context = v, H;
    }
    function Aw(e, t, a, i, u) {
      var s = t.stateNode;
      vE(e, t);
      var f = t.memoizedProps, p = t.type === t.elementType ? f : Ki(t.type, f);
      s.props = p;
      var v = t.pendingProps, y = s.context, g = a.contextType, b = ai;
      if (typeof g == "object" && g !== null)
        b = er(g);
      else {
        var x = vf(t, a, !0);
        b = hf(t, x);
      }
      var M = a.getDerivedStateFromProps, z = typeof M == "function" || typeof s.getSnapshotBeforeUpdate == "function";
      !z && (typeof s.UNSAFE_componentWillReceiveProps == "function" || typeof s.componentWillReceiveProps == "function") && (f !== v || y !== b) && TE(t, s, i, b), hE();
      var H = t.memoizedState, fe = s.state = H;
      if ($h(t, i, s, u), fe = t.memoizedState, f === v && H === fe && !_h() && !Yh() && !we)
        return typeof s.componentDidUpdate == "function" && (f !== e.memoizedProps || H !== e.memoizedState) && (t.flags |= Ke), typeof s.getSnapshotBeforeUpdate == "function" && (f !== e.memoizedProps || H !== e.memoizedState) && (t.flags |= La), !1;
      typeof M == "function" && (Eg(t, a, M, i), fe = t.memoizedState);
      var Oe = Yh() || EE(t, a, p, i, H, fe, b) || we;
      return Oe ? (!z && (typeof s.UNSAFE_componentWillUpdate == "function" || typeof s.componentWillUpdate == "function") && (typeof s.componentWillUpdate == "function" && s.componentWillUpdate(i, fe, b), typeof s.UNSAFE_componentWillUpdate == "function" && s.UNSAFE_componentWillUpdate(i, fe, b)), typeof s.componentDidUpdate == "function" && (t.flags |= Ke), typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= La)) : (typeof s.componentDidUpdate == "function" && (f !== e.memoizedProps || H !== e.memoizedState) && (t.flags |= Ke), typeof s.getSnapshotBeforeUpdate == "function" && (f !== e.memoizedProps || H !== e.memoizedState) && (t.flags |= La), t.memoizedProps = i, t.memoizedState = fe), s.props = i, s.state = fe, s.context = b, Oe;
    }
    var Tg, wg, xg, _g, bg, wE = function(e, t) {
    };
    Tg = !1, wg = !1, xg = {}, _g = {}, bg = {}, wE = function(e, t) {
      if (!(e === null || typeof e != "object") && !(!e._store || e._store.validated || e.key != null)) {
        if (typeof e._store != "object")
          throw new Error("React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.");
        e._store.validated = !0;
        var a = Ye(t) || "Component";
        _g[a] || (_g[a] = !0, S('Each child in a list should have a unique "key" prop. See https://reactjs.org/link/warning-keys for more information.'));
      }
    };
    function yp(e, t, a) {
      var i = a.ref;
      if (i !== null && typeof i != "function" && typeof i != "object") {
        if ((e.mode & gn || Fe) && !(a._owner && a._self && a._owner.stateNode !== a._self)) {
          var u = Ye(e) || "Component";
          xg[u] || (S('A string ref, "%s", has been found within a strict mode tree. String refs are a source of potential bugs and should be avoided. We recommend using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', i), xg[u] = !0);
        }
        if (a._owner) {
          var s = a._owner, f;
          if (s) {
            var p = s;
            if (p.tag !== pe)
              throw new Error("Function components cannot have string refs. We recommend using useRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref");
            f = p.stateNode;
          }
          if (!f)
            throw new Error("Missing owner for string ref " + i + ". This error is likely caused by a bug in React. Please file an issue.");
          var v = f;
          Qn(i, "ref");
          var y = "" + i;
          if (t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === y)
            return t.ref;
          var g = function(b) {
            var x = v.refs;
            x === yE && (x = v.refs = {}), b === null ? delete x[y] : x[y] = b;
          };
          return g._stringRef = y, g;
        } else {
          if (typeof i != "string")
            throw new Error("Expected ref to be a function, a string, an object returned by React.createRef(), or null.");
          if (!a._owner)
            throw new Error("Element ref was specified as a string (" + i + `) but no owner was set. This could happen for one of the following reasons:
1. You may be adding a ref to a function component
2. You may be adding a ref to a component that was not created inside a component's render method
3. You have multiple copies of React loaded
See https://reactjs.org/link/refs-must-have-owner for more information.`);
        }
      }
      return i;
    }
    function Qh(e, t) {
      var a = Object.prototype.toString.call(t);
      throw new Error("Objects are not valid as a React child (found: " + (a === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
    }
    function Wh(e) {
      {
        var t = Ye(e) || "Component";
        if (bg[t])
          return;
        bg[t] = !0, S("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
      }
    }
    function xE(e) {
      var t = e._payload, a = e._init;
      return a(t);
    }
    function _E(e) {
      function t(k, j) {
        if (!!e) {
          var O = k.deletions;
          O === null ? (k.deletions = [j], k.flags |= Mt) : O.push(j);
        }
      }
      function a(k, j) {
        if (!e)
          return null;
        for (var O = j; O !== null; )
          t(k, O), O = O.sibling;
        return null;
      }
      function i(k, j) {
        for (var O = /* @__PURE__ */ new Map(), G = j; G !== null; )
          G.key !== null ? O.set(G.key, G) : O.set(G.index, G), G = G.sibling;
        return O;
      }
      function u(k, j) {
        var O = qs(k, j);
        return O.index = 0, O.sibling = null, O;
      }
      function s(k, j, O) {
        if (k.index = O, !e)
          return k.flags |= cd, j;
        var G = k.alternate;
        if (G !== null) {
          var de = G.index;
          return de < j ? (k.flags |= rn, j) : de;
        } else
          return k.flags |= rn, j;
      }
      function f(k) {
        return e && k.alternate === null && (k.flags |= rn), k;
      }
      function p(k, j, O, G) {
        if (j === null || j.tag !== Pe) {
          var de = e0(O, k.mode, G);
          return de.return = k, de;
        } else {
          var ue = u(j, O);
          return ue.return = k, ue;
        }
      }
      function v(k, j, O, G) {
        var de = O.type;
        if (de === va)
          return g(k, j, O.props.children, G, O.key);
        if (j !== null && (j.elementType === de || m1(j, O) || typeof de == "object" && de !== null && de.$$typeof === ke && xE(de) === j.type)) {
          var ue = u(j, O.props);
          return ue.ref = yp(k, j, O), ue.return = k, ue._debugSource = O._source, ue._debugOwner = O._owner, ue;
        }
        var je = JS(O, k.mode, G);
        return je.ref = yp(k, j, O), je.return = k, je;
      }
      function y(k, j, O, G) {
        if (j === null || j.tag !== me || j.stateNode.containerInfo !== O.containerInfo || j.stateNode.implementation !== O.implementation) {
          var de = t0(O, k.mode, G);
          return de.return = k, de;
        } else {
          var ue = u(j, O.children || []);
          return ue.return = k, ue;
        }
      }
      function g(k, j, O, G, de) {
        if (j === null || j.tag !== Ct) {
          var ue = Io(O, k.mode, G, de);
          return ue.return = k, ue;
        } else {
          var je = u(j, O);
          return je.return = k, je;
        }
      }
      function b(k, j, O) {
        if (typeof j == "string" && j !== "" || typeof j == "number") {
          var G = e0("" + j, k.mode, O);
          return G.return = k, G;
        }
        if (typeof j == "object" && j !== null) {
          switch (j.$$typeof) {
            case si: {
              var de = JS(j, k.mode, O);
              return de.ref = yp(k, null, j), de.return = k, de;
            }
            case br: {
              var ue = t0(j, k.mode, O);
              return ue.return = k, ue;
            }
            case ke: {
              var je = j._payload, We = j._init;
              return b(k, We(je), O);
            }
          }
          if (vt(j) || qa(j)) {
            var Gt = Io(j, k.mode, O, null);
            return Gt.return = k, Gt;
          }
          Qh(k, j);
        }
        return typeof j == "function" && Wh(k), null;
      }
      function x(k, j, O, G) {
        var de = j !== null ? j.key : null;
        if (typeof O == "string" && O !== "" || typeof O == "number")
          return de !== null ? null : p(k, j, "" + O, G);
        if (typeof O == "object" && O !== null) {
          switch (O.$$typeof) {
            case si:
              return O.key === de ? v(k, j, O, G) : null;
            case br:
              return O.key === de ? y(k, j, O, G) : null;
            case ke: {
              var ue = O._payload, je = O._init;
              return x(k, j, je(ue), G);
            }
          }
          if (vt(O) || qa(O))
            return de !== null ? null : g(k, j, O, G, null);
          Qh(k, O);
        }
        return typeof O == "function" && Wh(k), null;
      }
      function M(k, j, O, G, de) {
        if (typeof G == "string" && G !== "" || typeof G == "number") {
          var ue = k.get(O) || null;
          return p(j, ue, "" + G, de);
        }
        if (typeof G == "object" && G !== null) {
          switch (G.$$typeof) {
            case si: {
              var je = k.get(G.key === null ? O : G.key) || null;
              return v(j, je, G, de);
            }
            case br: {
              var We = k.get(G.key === null ? O : G.key) || null;
              return y(j, We, G, de);
            }
            case ke:
              var Gt = G._payload, kt = G._init;
              return M(k, j, O, kt(Gt), de);
          }
          if (vt(G) || qa(G)) {
            var Yn = k.get(O) || null;
            return g(j, Yn, G, de, null);
          }
          Qh(j, G);
        }
        return typeof G == "function" && Wh(j), null;
      }
      function z(k, j, O) {
        {
          if (typeof k != "object" || k === null)
            return j;
          switch (k.$$typeof) {
            case si:
            case br:
              wE(k, O);
              var G = k.key;
              if (typeof G != "string")
                break;
              if (j === null) {
                j = /* @__PURE__ */ new Set(), j.add(G);
                break;
              }
              if (!j.has(G)) {
                j.add(G);
                break;
              }
              S("Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted \u2014 the behavior is unsupported and could change in a future version.", G);
              break;
            case ke:
              var de = k._payload, ue = k._init;
              z(ue(de), j, O);
              break;
          }
        }
        return j;
      }
      function H(k, j, O, G) {
        for (var de = null, ue = 0; ue < O.length; ue++) {
          var je = O[ue];
          de = z(je, de, k);
        }
        for (var We = null, Gt = null, kt = j, Yn = 0, Ot = 0, An = null; kt !== null && Ot < O.length; Ot++) {
          kt.index > Ot ? (An = kt, kt = null) : An = kt.sibling;
          var oa = x(k, kt, O[Ot], G);
          if (oa === null) {
            kt === null && (kt = An);
            break;
          }
          e && kt && oa.alternate === null && t(k, kt), Yn = s(oa, Yn, Ot), Gt === null ? We = oa : Gt.sibling = oa, Gt = oa, kt = An;
        }
        if (Ot === O.length) {
          if (a(k, kt), Nr()) {
            var Pr = Ot;
            As(k, Pr);
          }
          return We;
        }
        if (kt === null) {
          for (; Ot < O.length; Ot++) {
            var li = b(k, O[Ot], G);
            li !== null && (Yn = s(li, Yn, Ot), Gt === null ? We = li : Gt.sibling = li, Gt = li);
          }
          if (Nr()) {
            var wa = Ot;
            As(k, wa);
          }
          return We;
        }
        for (var xa = i(k, kt); Ot < O.length; Ot++) {
          var sa = M(xa, k, Ot, O[Ot], G);
          sa !== null && (e && sa.alternate !== null && xa.delete(sa.key === null ? Ot : sa.key), Yn = s(sa, Yn, Ot), Gt === null ? We = sa : Gt.sibling = sa, Gt = sa);
        }
        if (e && xa.forEach(function(Ff) {
          return t(k, Ff);
        }), Nr()) {
          var Hu = Ot;
          As(k, Hu);
        }
        return We;
      }
      function fe(k, j, O, G) {
        var de = qa(O);
        if (typeof de != "function")
          throw new Error("An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.");
        {
          typeof Symbol == "function" && O[Symbol.toStringTag] === "Generator" && (wg || S("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers."), wg = !0), O.entries === de && (Tg || S("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Tg = !0);
          var ue = de.call(O);
          if (ue)
            for (var je = null, We = ue.next(); !We.done; We = ue.next()) {
              var Gt = We.value;
              je = z(Gt, je, k);
            }
        }
        var kt = de.call(O);
        if (kt == null)
          throw new Error("An iterable object provided no iterator.");
        for (var Yn = null, Ot = null, An = j, oa = 0, Pr = 0, li = null, wa = kt.next(); An !== null && !wa.done; Pr++, wa = kt.next()) {
          An.index > Pr ? (li = An, An = null) : li = An.sibling;
          var xa = x(k, An, wa.value, G);
          if (xa === null) {
            An === null && (An = li);
            break;
          }
          e && An && xa.alternate === null && t(k, An), oa = s(xa, oa, Pr), Ot === null ? Yn = xa : Ot.sibling = xa, Ot = xa, An = li;
        }
        if (wa.done) {
          if (a(k, An), Nr()) {
            var sa = Pr;
            As(k, sa);
          }
          return Yn;
        }
        if (An === null) {
          for (; !wa.done; Pr++, wa = kt.next()) {
            var Hu = b(k, wa.value, G);
            Hu !== null && (oa = s(Hu, oa, Pr), Ot === null ? Yn = Hu : Ot.sibling = Hu, Ot = Hu);
          }
          if (Nr()) {
            var Ff = Pr;
            As(k, Ff);
          }
          return Yn;
        }
        for (var Wp = i(k, An); !wa.done; Pr++, wa = kt.next()) {
          var Gl = M(Wp, k, Pr, wa.value, G);
          Gl !== null && (e && Gl.alternate !== null && Wp.delete(Gl.key === null ? Pr : Gl.key), oa = s(Gl, oa, Pr), Ot === null ? Yn = Gl : Ot.sibling = Gl, Ot = Gl);
        }
        if (e && Wp.forEach(function(Kb) {
          return t(k, Kb);
        }), Nr()) {
          var Xb = Pr;
          As(k, Xb);
        }
        return Yn;
      }
      function Oe(k, j, O, G) {
        if (j !== null && j.tag === Pe) {
          a(k, j.sibling);
          var de = u(j, O);
          return de.return = k, de;
        }
        a(k, j);
        var ue = e0(O, k.mode, G);
        return ue.return = k, ue;
      }
      function Te(k, j, O, G) {
        for (var de = O.key, ue = j; ue !== null; ) {
          if (ue.key === de) {
            var je = O.type;
            if (je === va) {
              if (ue.tag === Ct) {
                a(k, ue.sibling);
                var We = u(ue, O.props.children);
                return We.return = k, We._debugSource = O._source, We._debugOwner = O._owner, We;
              }
            } else if (ue.elementType === je || m1(ue, O) || typeof je == "object" && je !== null && je.$$typeof === ke && xE(je) === ue.type) {
              a(k, ue.sibling);
              var Gt = u(ue, O.props);
              return Gt.ref = yp(k, ue, O), Gt.return = k, Gt._debugSource = O._source, Gt._debugOwner = O._owner, Gt;
            }
            a(k, ue);
            break;
          } else
            t(k, ue);
          ue = ue.sibling;
        }
        if (O.type === va) {
          var kt = Io(O.props.children, k.mode, G, O.key);
          return kt.return = k, kt;
        } else {
          var Yn = JS(O, k.mode, G);
          return Yn.ref = yp(k, j, O), Yn.return = k, Yn;
        }
      }
      function St(k, j, O, G) {
        for (var de = O.key, ue = j; ue !== null; ) {
          if (ue.key === de)
            if (ue.tag === me && ue.stateNode.containerInfo === O.containerInfo && ue.stateNode.implementation === O.implementation) {
              a(k, ue.sibling);
              var je = u(ue, O.children || []);
              return je.return = k, je;
            } else {
              a(k, ue);
              break;
            }
          else
            t(k, ue);
          ue = ue.sibling;
        }
        var We = t0(O, k.mode, G);
        return We.return = k, We;
      }
      function pt(k, j, O, G) {
        var de = typeof O == "object" && O !== null && O.type === va && O.key === null;
        if (de && (O = O.props.children), typeof O == "object" && O !== null) {
          switch (O.$$typeof) {
            case si:
              return f(Te(k, j, O, G));
            case br:
              return f(St(k, j, O, G));
            case ke:
              var ue = O._payload, je = O._init;
              return pt(k, j, je(ue), G);
          }
          if (vt(O))
            return H(k, j, O, G);
          if (qa(O))
            return fe(k, j, O, G);
          Qh(k, O);
        }
        return typeof O == "string" && O !== "" || typeof O == "number" ? f(Oe(k, j, "" + O, G)) : (typeof O == "function" && Wh(k), a(k, j));
      }
      return pt;
    }
    var Cf = _E(!0), bE = _E(!1);
    function Fw(e, t) {
      if (e !== null && t.child !== e.child)
        throw new Error("Resuming work not yet implemented.");
      if (t.child !== null) {
        var a = t.child, i = qs(a, a.pendingProps);
        for (t.child = i, i.return = t; a.sibling !== null; )
          a = a.sibling, i = i.sibling = qs(a, a.pendingProps), i.return = t;
        i.sibling = null;
      }
    }
    function Hw(e, t) {
      for (var a = e.child; a !== null; )
        vb(a, t), a = a.sibling;
    }
    var gp = {}, Ao = Lo(gp), Sp = Lo(gp), Gh = Lo(gp);
    function qh(e) {
      if (e === gp)
        throw new Error("Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.");
      return e;
    }
    function DE() {
      var e = qh(Gh.current);
      return e;
    }
    function Dg(e, t) {
      la(Gh, t, e), la(Sp, e, e), la(Ao, gp, e);
      var a = ZR(t);
      ia(Ao, e), la(Ao, a, e);
    }
    function Rf(e) {
      ia(Ao, e), ia(Sp, e), ia(Gh, e);
    }
    function kg() {
      var e = qh(Ao.current);
      return e;
    }
    function kE(e) {
      qh(Gh.current);
      var t = qh(Ao.current), a = JR(t, e.type);
      t !== a && (la(Sp, e, e), la(Ao, a, e));
    }
    function Og(e) {
      Sp.current === e && (ia(Ao, e), ia(Sp, e));
    }
    var jw = 0, OE = 1, LE = 1, Ep = 2, Zi = Lo(jw);
    function Lg(e, t) {
      return (e & t) !== 0;
    }
    function Tf(e) {
      return e & OE;
    }
    function Mg(e, t) {
      return e & OE | t;
    }
    function Pw(e, t) {
      return e | t;
    }
    function Fo(e, t) {
      la(Zi, t, e);
    }
    function wf(e) {
      ia(Zi, e);
    }
    function Vw(e, t) {
      var a = e.memoizedState;
      return a !== null ? a.dehydrated !== null : (e.memoizedProps, !0);
    }
    function Xh(e) {
      for (var t = e; t !== null; ) {
        if (t.tag === _e) {
          var a = t.memoizedState;
          if (a !== null) {
            var i = a.dehydrated;
            if (i === null || V0(i) || Hy(i))
              return t;
          }
        } else if (t.tag === bt && t.memoizedProps.revealOrder !== void 0) {
          var u = (t.flags & Ve) !== De;
          if (u)
            return t;
        } else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === e)
          return null;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
            return null;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return null;
    }
    var $a = 0, lr = 1, Vl = 2, ur = 4, zr = 8, Ng = [];
    function zg() {
      for (var e = 0; e < Ng.length; e++) {
        var t = Ng[e];
        t._workInProgressVersionPrimary = null;
      }
      Ng.length = 0;
    }
    function Bw(e, t) {
      var a = t._getVersion, i = a(t._source);
      e.mutableSourceEagerHydrationData == null ? e.mutableSourceEagerHydrationData = [t, i] : e.mutableSourceEagerHydrationData.push(t, i);
    }
    var se = A.ReactCurrentDispatcher, Cp = A.ReactCurrentBatchConfig, Ug, xf;
    Ug = /* @__PURE__ */ new Set();
    var Bs = P, Wt = null, or = null, sr = null, Kh = !1, Rp = !1, Tp = 0, $w = 0, Yw = 25, V = null, xi = null, Ho = -1, Ag = !1;
    function Pt() {
      {
        var e = V;
        xi === null ? xi = [e] : xi.push(e);
      }
    }
    function ne() {
      {
        var e = V;
        xi !== null && (Ho++, xi[Ho] !== e && Iw(e));
      }
    }
    function _f(e) {
      e != null && !vt(e) && S("%s received a final argument that is not an array (instead, received `%s`). When specified, the final argument must be an array.", V, typeof e);
    }
    function Iw(e) {
      {
        var t = Ye(Wt);
        if (!Ug.has(t) && (Ug.add(t), xi !== null)) {
          for (var a = "", i = 30, u = 0; u <= Ho; u++) {
            for (var s = xi[u], f = u === Ho ? e : s, p = u + 1 + ". " + s; p.length < i; )
              p += " ";
            p += f + `
`, a += p;
          }
          S(`React has detected a change in the order of Hooks called by %s. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
%s   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
`, t, a);
        }
      }
    }
    function ua() {
      throw new Error(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`);
    }
    function Fg(e, t) {
      if (Ag)
        return !1;
      if (t === null)
        return S("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", V), !1;
      e.length !== t.length && S(`The final argument passed to %s changed size between renders. The order and size of this array must remain constant.

Previous: %s
Incoming: %s`, V, "[" + t.join(", ") + "]", "[" + e.join(", ") + "]");
      for (var a = 0; a < t.length && a < e.length; a++)
        if (!Se(e[a], t[a]))
          return !1;
      return !0;
    }
    function bf(e, t, a, i, u, s) {
      Bs = s, Wt = t, xi = e !== null ? e._debugHookTypes : null, Ho = -1, Ag = e !== null && e.type !== t.type, t.memoizedState = null, t.updateQueue = null, t.lanes = P, e !== null && e.memoizedState !== null ? se.current = JE : xi !== null ? se.current = ZE : se.current = KE;
      var f = a(i, u);
      if (Rp) {
        var p = 0;
        do {
          if (Rp = !1, Tp = 0, p >= Yw)
            throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
          p += 1, Ag = !1, or = null, sr = null, t.updateQueue = null, Ho = -1, se.current = eC, f = a(i, u);
        } while (Rp);
      }
      se.current = cm, t._debugHookTypes = xi;
      var v = or !== null && or.next !== null;
      if (Bs = P, Wt = null, or = null, sr = null, V = null, xi = null, Ho = -1, e !== null && (e.flags & rr) !== (t.flags & rr) && (e.mode & ot) !== Me && S("Internal React error: Expected static flag was missing. Please notify the React team."), Kh = !1, v)
        throw new Error("Rendered fewer hooks than expected. This may be caused by an accidental early return statement.");
      return f;
    }
    function Df() {
      var e = Tp !== 0;
      return Tp = 0, e;
    }
    function ME(e, t, a) {
      t.updateQueue = e.updateQueue, (t.mode & Ua) !== Me ? t.flags &= ~(lu | Jr | sn | Ke) : t.flags &= ~(sn | Ke), e.lanes = vo(e.lanes, a);
    }
    function NE() {
      if (se.current = cm, Kh) {
        for (var e = Wt.memoizedState; e !== null; ) {
          var t = e.queue;
          t !== null && (t.pending = null), e = e.next;
        }
        Kh = !1;
      }
      Bs = P, Wt = null, or = null, sr = null, xi = null, Ho = -1, V = null, QE = !1, Rp = !1, Tp = 0;
    }
    function Bl() {
      var e = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
      };
      return sr === null ? Wt.memoizedState = sr = e : sr = sr.next = e, sr;
    }
    function _i() {
      var e;
      if (or === null) {
        var t = Wt.alternate;
        t !== null ? e = t.memoizedState : e = null;
      } else
        e = or.next;
      var a;
      if (sr === null ? a = Wt.memoizedState : a = sr.next, a !== null)
        sr = a, a = sr.next, or = e;
      else {
        if (e === null)
          throw new Error("Rendered more hooks than during the previous render.");
        or = e;
        var i = {
          memoizedState: or.memoizedState,
          baseState: or.baseState,
          baseQueue: or.baseQueue,
          queue: or.queue,
          next: null
        };
        sr === null ? Wt.memoizedState = sr = i : sr = sr.next = i;
      }
      return sr;
    }
    function zE() {
      return {
        lastEffect: null,
        stores: null
      };
    }
    function Hg(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    function jg(e, t, a) {
      var i = Bl(), u;
      a !== void 0 ? u = a(t) : u = t, i.memoizedState = i.baseState = u;
      var s = {
        pending: null,
        interleaved: null,
        lanes: P,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: u
      };
      i.queue = s;
      var f = s.dispatch = qw.bind(null, Wt, s);
      return [i.memoizedState, f];
    }
    function Pg(e, t, a) {
      var i = _i(), u = i.queue;
      if (u === null)
        throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
      u.lastRenderedReducer = e;
      var s = or, f = s.baseQueue, p = u.pending;
      if (p !== null) {
        if (f !== null) {
          var v = f.next, y = p.next;
          f.next = y, p.next = v;
        }
        s.baseQueue !== f && S("Internal error: Expected work-in-progress queue to be a clone. This is a bug in React."), s.baseQueue = f = p, u.pending = null;
      }
      if (f !== null) {
        var g = f.next, b = s.baseState, x = null, M = null, z = null, H = g;
        do {
          var fe = H.lane;
          if (mu(Bs, fe)) {
            if (z !== null) {
              var Te = {
                lane: yt,
                action: H.action,
                hasEagerState: H.hasEagerState,
                eagerState: H.eagerState,
                next: null
              };
              z = z.next = Te;
            }
            if (H.hasEagerState)
              b = H.eagerState;
            else {
              var St = H.action;
              b = e(b, St);
            }
          } else {
            var Oe = {
              lane: fe,
              action: H.action,
              hasEagerState: H.hasEagerState,
              eagerState: H.eagerState,
              next: null
            };
            z === null ? (M = z = Oe, x = b) : z = z.next = Oe, Wt.lanes = Ze(Wt.lanes, fe), Bp(fe);
          }
          H = H.next;
        } while (H !== null && H !== g);
        z === null ? x = b : z.next = M, Se(b, i.memoizedState) || Op(), i.memoizedState = b, i.baseState = x, i.baseQueue = z, u.lastRenderedState = b;
      }
      var pt = u.interleaved;
      if (pt !== null) {
        var k = pt;
        do {
          var j = k.lane;
          Wt.lanes = Ze(Wt.lanes, j), Bp(j), k = k.next;
        } while (k !== pt);
      } else
        f === null && (u.lanes = P);
      var O = u.dispatch;
      return [i.memoizedState, O];
    }
    function Vg(e, t, a) {
      var i = _i(), u = i.queue;
      if (u === null)
        throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
      u.lastRenderedReducer = e;
      var s = u.dispatch, f = u.pending, p = i.memoizedState;
      if (f !== null) {
        u.pending = null;
        var v = f.next, y = v;
        do {
          var g = y.action;
          p = e(p, g), y = y.next;
        } while (y !== v);
        Se(p, i.memoizedState) || Op(), i.memoizedState = p, i.baseQueue === null && (i.baseState = p), u.lastRenderedState = p;
      }
      return [p, s];
    }
    function gD(e, t, a) {
    }
    function SD(e, t, a) {
    }
    function Bg(e, t, a) {
      var i = Wt, u = Bl(), s, f = Nr();
      if (f) {
        if (a === void 0)
          throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
        s = a(), xf || s !== a() && (S("The result of getServerSnapshot should be cached to avoid an infinite loop"), xf = !0);
      } else {
        if (s = t(), !xf) {
          var p = t();
          Se(s, p) || (S("The result of getSnapshot should be cached to avoid an infinite loop"), xf = !0);
        }
        var v = Dm();
        if (v === null)
          throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
        Ss(v, Bs) || UE(i, t, s);
      }
      u.memoizedState = s;
      var y = {
        value: s,
        getSnapshot: t
      };
      return u.queue = y, nm(FE.bind(null, i, y, e), [e]), i.flags |= sn, wp(lr | zr, AE.bind(null, i, y, s, t), void 0, null), s;
    }
    function Zh(e, t, a) {
      var i = Wt, u = _i(), s = t();
      if (!xf) {
        var f = t();
        Se(s, f) || (S("The result of getSnapshot should be cached to avoid an infinite loop"), xf = !0);
      }
      var p = u.memoizedState, v = !Se(p, s);
      v && (u.memoizedState = s, Op());
      var y = u.queue;
      if (_p(FE.bind(null, i, y, e), [e]), y.getSnapshot !== t || v || sr !== null && sr.memoizedState.tag & lr) {
        i.flags |= sn, wp(lr | zr, AE.bind(null, i, y, s, t), void 0, null);
        var g = Dm();
        if (g === null)
          throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
        Ss(g, Bs) || UE(i, t, s);
      }
      return s;
    }
    function UE(e, t, a) {
      e.flags |= cs;
      var i = {
        getSnapshot: t,
        value: a
      }, u = Wt.updateQueue;
      if (u === null)
        u = zE(), Wt.updateQueue = u, u.stores = [i];
      else {
        var s = u.stores;
        s === null ? u.stores = [i] : s.push(i);
      }
    }
    function AE(e, t, a, i) {
      t.value = a, t.getSnapshot = i, HE(t) && jE(e);
    }
    function FE(e, t, a) {
      var i = function() {
        HE(t) && jE(e);
      };
      return a(i);
    }
    function HE(e) {
      var t = e.getSnapshot, a = e.value;
      try {
        var i = t();
        return !Se(a, i);
      } catch {
        return !0;
      }
    }
    function jE(e) {
      var t = Ba(e, Ae);
      t !== null && pr(t, e, Ae, Zt);
    }
    function Jh(e) {
      var t = Bl();
      typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e;
      var a = {
        pending: null,
        interleaved: null,
        lanes: P,
        dispatch: null,
        lastRenderedReducer: Hg,
        lastRenderedState: e
      };
      t.queue = a;
      var i = a.dispatch = Xw.bind(null, Wt, a);
      return [t.memoizedState, i];
    }
    function $g(e) {
      return Pg(Hg);
    }
    function Yg(e) {
      return Vg(Hg);
    }
    function wp(e, t, a, i) {
      var u = {
        tag: e,
        create: t,
        destroy: a,
        deps: i,
        next: null
      }, s = Wt.updateQueue;
      if (s === null)
        s = zE(), Wt.updateQueue = s, s.lastEffect = u.next = u;
      else {
        var f = s.lastEffect;
        if (f === null)
          s.lastEffect = u.next = u;
        else {
          var p = f.next;
          f.next = u, u.next = p, s.lastEffect = u;
        }
      }
      return u;
    }
    function Ig(e) {
      var t = Bl();
      {
        var a = {
          current: e
        };
        return t.memoizedState = a, a;
      }
    }
    function em(e) {
      var t = _i();
      return t.memoizedState;
    }
    function xp(e, t, a, i) {
      var u = Bl(), s = i === void 0 ? null : i;
      Wt.flags |= e, u.memoizedState = wp(lr | t, a, void 0, s);
    }
    function tm(e, t, a, i) {
      var u = _i(), s = i === void 0 ? null : i, f = void 0;
      if (or !== null) {
        var p = or.memoizedState;
        if (f = p.destroy, s !== null) {
          var v = p.deps;
          if (Fg(s, v)) {
            u.memoizedState = wp(t, a, f, s);
            return;
          }
        }
      }
      Wt.flags |= e, u.memoizedState = wp(lr | t, a, f, s);
    }
    function nm(e, t) {
      return (Wt.mode & Ua) !== Me ? xp(lu | sn | wl, zr, e, t) : xp(sn | wl, zr, e, t);
    }
    function _p(e, t) {
      return tm(sn, zr, e, t);
    }
    function Qg(e, t) {
      return xp(Ke, Vl, e, t);
    }
    function rm(e, t) {
      return tm(Ke, Vl, e, t);
    }
    function Wg(e, t) {
      var a = Ke;
      return a |= Zr, (Wt.mode & Ua) !== Me && (a |= Jr), xp(a, ur, e, t);
    }
    function am(e, t) {
      return tm(Ke, ur, e, t);
    }
    function PE(e, t) {
      if (typeof t == "function") {
        var a = t, i = e();
        return a(i), function() {
          a(null);
        };
      } else if (t != null) {
        var u = t;
        u.hasOwnProperty("current") || S("Expected useImperativeHandle() first argument to either be a ref callback or React.createRef() object. Instead received: %s.", "an object with keys {" + Object.keys(u).join(", ") + "}");
        var s = e();
        return u.current = s, function() {
          u.current = null;
        };
      }
    }
    function Gg(e, t, a) {
      typeof t != "function" && S("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", t !== null ? typeof t : "null");
      var i = a != null ? a.concat([e]) : null, u = Ke;
      return u |= Zr, (Wt.mode & Ua) !== Me && (u |= Jr), xp(u, ur, PE.bind(null, t, e), i);
    }
    function im(e, t, a) {
      typeof t != "function" && S("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", t !== null ? typeof t : "null");
      var i = a != null ? a.concat([e]) : null;
      return tm(Ke, ur, PE.bind(null, t, e), i);
    }
    function Qw(e, t) {
    }
    var lm = Qw;
    function qg(e, t) {
      var a = Bl(), i = t === void 0 ? null : t;
      return a.memoizedState = [e, i], e;
    }
    function um(e, t) {
      var a = _i(), i = t === void 0 ? null : t, u = a.memoizedState;
      if (u !== null && i !== null) {
        var s = u[1];
        if (Fg(i, s))
          return u[0];
      }
      return a.memoizedState = [e, i], e;
    }
    function Xg(e, t) {
      var a = Bl(), i = t === void 0 ? null : t, u = e();
      return a.memoizedState = [u, i], u;
    }
    function om(e, t) {
      var a = _i(), i = t === void 0 ? null : t, u = a.memoizedState;
      if (u !== null && i !== null) {
        var s = u[1];
        if (Fg(i, s))
          return u[0];
      }
      var f = e();
      return a.memoizedState = [f, i], f;
    }
    function Kg(e) {
      var t = Bl();
      return t.memoizedState = e, e;
    }
    function VE(e) {
      var t = _i(), a = or, i = a.memoizedState;
      return $E(t, i, e);
    }
    function BE(e) {
      var t = _i();
      if (or === null)
        return t.memoizedState = e, e;
      var a = or.memoizedState;
      return $E(t, a, e);
    }
    function $E(e, t, a) {
      var i = !ry(Bs);
      if (i) {
        if (!Se(a, t)) {
          var u = bd();
          Wt.lanes = Ze(Wt.lanes, u), Bp(u), e.baseState = !0;
        }
        return t;
      } else
        return e.baseState && (e.baseState = !1, Op()), e.memoizedState = a, a;
    }
    function Ww(e, t, a) {
      var i = Fa();
      Vn(Er(i, ir)), e(!0);
      var u = Cp.transition;
      Cp.transition = {};
      var s = Cp.transition;
      Cp.transition._updatedFibers = /* @__PURE__ */ new Set();
      try {
        e(!1), t();
      } finally {
        if (Vn(i), Cp.transition = u, u === null && s._updatedFibers) {
          var f = s._updatedFibers.size;
          f > 10 && Je("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), s._updatedFibers.clear();
        }
      }
    }
    function Zg() {
      var e = Jh(!1), t = e[0], a = e[1], i = Ww.bind(null, a), u = Bl();
      return u.memoizedState = i, [t, i];
    }
    function YE() {
      var e = $g(), t = e[0], a = _i(), i = a.memoizedState;
      return [t, i];
    }
    function IE() {
      var e = Yg(), t = e[0], a = _i(), i = a.memoizedState;
      return [t, i];
    }
    var QE = !1;
    function Gw() {
      return QE;
    }
    function Jg() {
      var e = Bl(), t = Dm(), a = t.identifierPrefix, i;
      if (Nr()) {
        var u = ow();
        i = ":" + a + "R" + u;
        var s = Tp++;
        s > 0 && (i += "H" + s.toString(32)), i += ":";
      } else {
        var f = $w++;
        i = ":" + a + "r" + f.toString(32) + ":";
      }
      return e.memoizedState = i, i;
    }
    function sm() {
      var e = _i(), t = e.memoizedState;
      return t;
    }
    function qw(e, t, a) {
      typeof arguments[3] == "function" && S("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
      var i = $o(e), u = {
        lane: i,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      if (WE(e))
        GE(t, u);
      else {
        var s = fE(e, t, u, i);
        if (s !== null) {
          var f = Ta();
          pr(s, e, i, f), qE(s, t, i);
        }
      }
      XE(e, i);
    }
    function Xw(e, t, a) {
      typeof arguments[3] == "function" && S("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
      var i = $o(e), u = {
        lane: i,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      if (WE(e))
        GE(t, u);
      else {
        var s = e.alternate;
        if (e.lanes === P && (s === null || s.lanes === P)) {
          var f = t.lastRenderedReducer;
          if (f !== null) {
            var p;
            p = se.current, se.current = Ji;
            try {
              var v = t.lastRenderedState, y = f(v, a);
              if (u.hasEagerState = !0, u.eagerState = y, Se(y, v)) {
                Dw(e, t, u, i);
                return;
              }
            } catch {
            } finally {
              se.current = p;
            }
          }
        }
        var g = fE(e, t, u, i);
        if (g !== null) {
          var b = Ta();
          pr(g, e, i, b), qE(g, t, i);
        }
      }
      XE(e, i);
    }
    function WE(e) {
      var t = e.alternate;
      return e === Wt || t !== null && t === Wt;
    }
    function GE(e, t) {
      Rp = Kh = !0;
      var a = e.pending;
      a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
    }
    function qE(e, t, a) {
      if (_d(a)) {
        var i = t.lanes;
        i = Dd(i, e.pendingLanes);
        var u = Ze(i, a);
        t.lanes = u, ho(e, u);
      }
    }
    function XE(e, t, a) {
      Ol(e, t);
    }
    var cm = {
      readContext: er,
      useCallback: ua,
      useContext: ua,
      useEffect: ua,
      useImperativeHandle: ua,
      useInsertionEffect: ua,
      useLayoutEffect: ua,
      useMemo: ua,
      useReducer: ua,
      useRef: ua,
      useState: ua,
      useDebugValue: ua,
      useDeferredValue: ua,
      useTransition: ua,
      useMutableSource: ua,
      useSyncExternalStore: ua,
      useId: ua,
      unstable_isNewReconciler: Z
    }, KE = null, ZE = null, JE = null, eC = null, $l = null, Ji = null, fm = null;
    {
      var eS = function() {
        S("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
      }, Ie = function() {
        S("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks");
      };
      KE = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Pt(), _f(t), qg(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Pt(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Pt(), _f(t), nm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Pt(), _f(a), Gg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Pt(), _f(t), Qg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Pt(), _f(t), Wg(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Pt(), _f(t);
          var a = se.current;
          se.current = $l;
          try {
            return Xg(e, t);
          } finally {
            se.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Pt();
          var i = se.current;
          se.current = $l;
          try {
            return jg(e, t, a);
          } finally {
            se.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Pt(), Ig(e);
        },
        useState: function(e) {
          V = "useState", Pt();
          var t = se.current;
          se.current = $l;
          try {
            return Jh(e);
          } finally {
            se.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Pt(), void 0;
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Pt(), Kg(e);
        },
        useTransition: function() {
          return V = "useTransition", Pt(), Zg();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Pt(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Pt(), Bg(e, t, a);
        },
        useId: function() {
          return V = "useId", Pt(), Jg();
        },
        unstable_isNewReconciler: Z
      }, ZE = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", ne(), qg(e, t);
        },
        useContext: function(e) {
          return V = "useContext", ne(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", ne(), nm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", ne(), Gg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", ne(), Qg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", ne(), Wg(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", ne();
          var a = se.current;
          se.current = $l;
          try {
            return Xg(e, t);
          } finally {
            se.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", ne();
          var i = se.current;
          se.current = $l;
          try {
            return jg(e, t, a);
          } finally {
            se.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", ne(), Ig(e);
        },
        useState: function(e) {
          V = "useState", ne();
          var t = se.current;
          se.current = $l;
          try {
            return Jh(e);
          } finally {
            se.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", ne(), void 0;
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", ne(), Kg(e);
        },
        useTransition: function() {
          return V = "useTransition", ne(), Zg();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", ne(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", ne(), Bg(e, t, a);
        },
        useId: function() {
          return V = "useId", ne(), Jg();
        },
        unstable_isNewReconciler: Z
      }, JE = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", ne(), um(e, t);
        },
        useContext: function(e) {
          return V = "useContext", ne(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", ne(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", ne(), im(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", ne(), rm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", ne(), am(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", ne();
          var a = se.current;
          se.current = Ji;
          try {
            return om(e, t);
          } finally {
            se.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", ne();
          var i = se.current;
          se.current = Ji;
          try {
            return Pg(e, t, a);
          } finally {
            se.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", ne(), em();
        },
        useState: function(e) {
          V = "useState", ne();
          var t = se.current;
          se.current = Ji;
          try {
            return $g(e);
          } finally {
            se.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", ne(), lm();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", ne(), VE(e);
        },
        useTransition: function() {
          return V = "useTransition", ne(), YE();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", ne(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", ne(), Zh(e, t);
        },
        useId: function() {
          return V = "useId", ne(), sm();
        },
        unstable_isNewReconciler: Z
      }, eC = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", ne(), um(e, t);
        },
        useContext: function(e) {
          return V = "useContext", ne(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", ne(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", ne(), im(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", ne(), rm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", ne(), am(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", ne();
          var a = se.current;
          se.current = fm;
          try {
            return om(e, t);
          } finally {
            se.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", ne();
          var i = se.current;
          se.current = fm;
          try {
            return Vg(e, t, a);
          } finally {
            se.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", ne(), em();
        },
        useState: function(e) {
          V = "useState", ne();
          var t = se.current;
          se.current = fm;
          try {
            return Yg(e);
          } finally {
            se.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", ne(), lm();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", ne(), BE(e);
        },
        useTransition: function() {
          return V = "useTransition", ne(), IE();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", ne(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", ne(), Zh(e, t);
        },
        useId: function() {
          return V = "useId", ne(), sm();
        },
        unstable_isNewReconciler: Z
      }, $l = {
        readContext: function(e) {
          return eS(), er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Ie(), Pt(), qg(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Ie(), Pt(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Ie(), Pt(), nm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Ie(), Pt(), Gg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Ie(), Pt(), Qg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Ie(), Pt(), Wg(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Ie(), Pt();
          var a = se.current;
          se.current = $l;
          try {
            return Xg(e, t);
          } finally {
            se.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Ie(), Pt();
          var i = se.current;
          se.current = $l;
          try {
            return jg(e, t, a);
          } finally {
            se.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Ie(), Pt(), Ig(e);
        },
        useState: function(e) {
          V = "useState", Ie(), Pt();
          var t = se.current;
          se.current = $l;
          try {
            return Jh(e);
          } finally {
            se.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Ie(), Pt(), void 0;
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Ie(), Pt(), Kg(e);
        },
        useTransition: function() {
          return V = "useTransition", Ie(), Pt(), Zg();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Ie(), Pt(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Ie(), Pt(), Bg(e, t, a);
        },
        useId: function() {
          return V = "useId", Ie(), Pt(), Jg();
        },
        unstable_isNewReconciler: Z
      }, Ji = {
        readContext: function(e) {
          return eS(), er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Ie(), ne(), um(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Ie(), ne(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Ie(), ne(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Ie(), ne(), im(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Ie(), ne(), rm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Ie(), ne(), am(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Ie(), ne();
          var a = se.current;
          se.current = Ji;
          try {
            return om(e, t);
          } finally {
            se.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Ie(), ne();
          var i = se.current;
          se.current = Ji;
          try {
            return Pg(e, t, a);
          } finally {
            se.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Ie(), ne(), em();
        },
        useState: function(e) {
          V = "useState", Ie(), ne();
          var t = se.current;
          se.current = Ji;
          try {
            return $g(e);
          } finally {
            se.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Ie(), ne(), lm();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Ie(), ne(), VE(e);
        },
        useTransition: function() {
          return V = "useTransition", Ie(), ne(), YE();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Ie(), ne(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Ie(), ne(), Zh(e, t);
        },
        useId: function() {
          return V = "useId", Ie(), ne(), sm();
        },
        unstable_isNewReconciler: Z
      }, fm = {
        readContext: function(e) {
          return eS(), er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Ie(), ne(), um(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Ie(), ne(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Ie(), ne(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Ie(), ne(), im(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Ie(), ne(), rm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Ie(), ne(), am(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Ie(), ne();
          var a = se.current;
          se.current = Ji;
          try {
            return om(e, t);
          } finally {
            se.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Ie(), ne();
          var i = se.current;
          se.current = Ji;
          try {
            return Vg(e, t, a);
          } finally {
            se.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Ie(), ne(), em();
        },
        useState: function(e) {
          V = "useState", Ie(), ne();
          var t = se.current;
          se.current = Ji;
          try {
            return Yg(e);
          } finally {
            se.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Ie(), ne(), lm();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Ie(), ne(), BE(e);
        },
        useTransition: function() {
          return V = "useTransition", Ie(), ne(), IE();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Ie(), ne(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Ie(), ne(), Zh(e, t);
        },
        useId: function() {
          return V = "useId", Ie(), ne(), sm();
        },
        unstable_isNewReconciler: Z
      };
    }
    var jo = q.unstable_now, tC = 0, dm = -1, bp = -1, pm = -1, tS = !1, vm = !1;
    function nC() {
      return tS;
    }
    function Kw() {
      vm = !0;
    }
    function Zw() {
      tS = !1, vm = !1;
    }
    function Jw() {
      tS = vm, vm = !1;
    }
    function rC() {
      return tC;
    }
    function aC() {
      tC = jo();
    }
    function nS(e) {
      bp = jo(), e.actualStartTime < 0 && (e.actualStartTime = jo());
    }
    function iC(e) {
      bp = -1;
    }
    function hm(e, t) {
      if (bp >= 0) {
        var a = jo() - bp;
        e.actualDuration += a, t && (e.selfBaseDuration = a), bp = -1;
      }
    }
    function Yl(e) {
      if (dm >= 0) {
        var t = jo() - dm;
        dm = -1;
        for (var a = e.return; a !== null; ) {
          switch (a.tag) {
            case re:
              var i = a.stateNode;
              i.effectDuration += t;
              return;
            case ct:
              var u = a.stateNode;
              u.effectDuration += t;
              return;
          }
          a = a.return;
        }
      }
    }
    function rS(e) {
      if (pm >= 0) {
        var t = jo() - pm;
        pm = -1;
        for (var a = e.return; a !== null; ) {
          switch (a.tag) {
            case re:
              var i = a.stateNode;
              i !== null && (i.passiveEffectDuration += t);
              return;
            case ct:
              var u = a.stateNode;
              u !== null && (u.passiveEffectDuration += t);
              return;
          }
          a = a.return;
        }
      }
    }
    function Il() {
      dm = jo();
    }
    function aS() {
      pm = jo();
    }
    function iS(e) {
      for (var t = e.child; t; )
        e.actualDuration += t.actualDuration, t = t.sibling;
    }
    function $s(e, t) {
      return {
        value: e,
        source: t,
        stack: Iu(t),
        digest: null
      };
    }
    function lS(e, t, a) {
      return {
        value: e,
        source: null,
        stack: a != null ? a : null,
        digest: t != null ? t : null
      };
    }
    function ex(e, t) {
      return !0;
    }
    function uS(e, t) {
      try {
        var a = ex(e, t);
        if (a === !1)
          return;
        var i = t.value, u = t.source, s = t.stack, f = s !== null ? s : "";
        if (i != null && i._suppressLogging) {
          if (e.tag === pe)
            return;
          console.error(i);
        }
        var p = u ? Ye(u) : null, v = p ? "The above error occurred in the <" + p + "> component:" : "The above error occurred in one of your React components:", y;
        if (e.tag === re)
          y = `Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.`;
        else {
          var g = Ye(e) || "Anonymous";
          y = "React will try to recreate this component tree from scratch " + ("using the error boundary you provided, " + g + ".");
        }
        var b = v + `
` + f + `

` + ("" + y);
        console.error(b);
      } catch (x) {
        setTimeout(function() {
          throw x;
        });
      }
    }
    var tx = typeof WeakMap == "function" ? WeakMap : Map;
    function lC(e, t, a) {
      var i = Mu(Zt, a);
      i.tag = ug, i.payload = {
        element: null
      };
      var u = t.value;
      return i.callback = function() {
        G_(u), uS(e, t);
      }, i;
    }
    function oS(e, t, a) {
      var i = Mu(Zt, a);
      i.tag = ug;
      var u = e.type.getDerivedStateFromError;
      if (typeof u == "function") {
        var s = t.value;
        i.payload = function() {
          return u(s);
        }, i.callback = function() {
          y1(e), uS(e, t);
        };
      }
      var f = e.stateNode;
      return f !== null && typeof f.componentDidCatch == "function" && (i.callback = function() {
        y1(e), uS(e, t), typeof u != "function" && Q_(this);
        var v = t.value, y = t.stack;
        this.componentDidCatch(v, {
          componentStack: y !== null ? y : ""
        }), typeof u != "function" && (aa(e.lanes, Ae) || S("%s: Error boundaries should implement getDerivedStateFromError(). In that method, return a state update to display an error message or fallback UI.", Ye(e) || "Unknown"));
      }), i;
    }
    function uC(e, t, a) {
      var i = e.pingCache, u;
      if (i === null ? (i = e.pingCache = new tx(), u = /* @__PURE__ */ new Set(), i.set(t, u)) : (u = i.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), i.set(t, u))), !u.has(a)) {
        u.add(a);
        var s = q_.bind(null, e, t, a);
        ar && $p(e, a), t.then(s, s);
      }
    }
    function nx(e, t, a, i) {
      var u = e.updateQueue;
      if (u === null) {
        var s = /* @__PURE__ */ new Set();
        s.add(a), e.updateQueue = s;
      } else
        u.add(a);
    }
    function rx(e, t) {
      var a = e.tag;
      if ((e.mode & ot) === Me && (a === he || a === Qe || a === He)) {
        var i = e.alternate;
        i ? (e.updateQueue = i.updateQueue, e.memoizedState = i.memoizedState, e.lanes = i.lanes) : (e.updateQueue = null, e.memoizedState = null);
      }
    }
    function oC(e) {
      var t = e;
      do {
        if (t.tag === _e && Vw(t))
          return t;
        t = t.return;
      } while (t !== null);
      return null;
    }
    function sC(e, t, a, i, u) {
      if ((e.mode & ot) === Me) {
        if (e === t)
          e.flags |= qn;
        else {
          if (e.flags |= Ve, a.flags |= fs, a.flags &= ~(dc | ha), a.tag === pe) {
            var s = a.alternate;
            if (s === null)
              a.tag = _n;
            else {
              var f = Mu(Zt, Ae);
              f.tag = jh, Uo(a, f, Ae);
            }
          }
          a.lanes = Ze(a.lanes, Ae);
        }
        return e;
      }
      return e.flags |= qn, e.lanes = u, e;
    }
    function ax(e, t, a, i, u) {
      if (a.flags |= ha, ar && $p(e, u), i !== null && typeof i == "object" && typeof i.then == "function") {
        var s = i;
        rx(a), Nr() && a.mode & ot && J0();
        var f = oC(t);
        if (f !== null) {
          f.flags &= ~Tn, sC(f, t, a, e, u), f.mode & ot && uC(e, s, u), nx(f, e, s);
          return;
        } else {
          if (!po(u)) {
            uC(e, s, u), VS();
            return;
          }
          var p = new Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
          i = p;
        }
      } else if (Nr() && a.mode & ot) {
        J0();
        var v = oC(t);
        if (v !== null) {
          (v.flags & qn) === De && (v.flags |= Tn), sC(v, t, a, e, u), eg($s(i, a));
          return;
        }
      }
      i = $s(i, a), H_(i);
      var y = t;
      do {
        switch (y.tag) {
          case re: {
            var g = i;
            y.flags |= qn;
            var b = Pn(u);
            y.lanes = Ze(y.lanes, b);
            var x = lC(y, g, b);
            cg(y, x);
            return;
          }
          case pe:
            var M = i, z = y.type, H = y.stateNode;
            if ((y.flags & Ve) === De && (typeof z.getDerivedStateFromError == "function" || H !== null && typeof H.componentDidCatch == "function" && !o1(H))) {
              y.flags |= qn;
              var fe = Pn(u);
              y.lanes = Ze(y.lanes, fe);
              var Oe = oS(y, M, fe);
              cg(y, Oe);
              return;
            }
            break;
        }
        y = y.return;
      } while (y !== null);
    }
    function ix() {
      return null;
    }
    var Dp = A.ReactCurrentOwner, el = !1, sS, kp, cS, fS, dS, Ys, pS, mm;
    sS = {}, kp = {}, cS = {}, fS = {}, dS = {}, Ys = !1, pS = {}, mm = {};
    function Ca(e, t, a, i) {
      e === null ? t.child = bE(t, null, a, i) : t.child = Cf(t, e.child, a, i);
    }
    function lx(e, t, a, i) {
      t.child = Cf(t, e.child, null, i), t.child = Cf(t, null, a, i);
    }
    function cC(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = a.propTypes;
        s && Gi(
          s,
          i,
          "prop",
          wt(a)
        );
      }
      var f = a.render, p = t.ref, v, y;
      Ef(t, u), kl(t);
      {
        if (Dp.current = t, qr(!0), v = bf(e, t, f, i, p, u), y = Df(), t.mode & gn) {
          jn(!0);
          try {
            v = bf(e, t, f, i, p, u), y = Df();
          } finally {
            jn(!1);
          }
        }
        qr(!1);
      }
      return uu(), e !== null && !el ? (ME(e, t, u), Nu(e, t, u)) : (Nr() && y && Gy(t), t.flags |= Rl, Ca(e, t, v, u), t.child);
    }
    function fC(e, t, a, i, u) {
      if (e === null) {
        var s = a.type;
        if (db(s) && a.compare === null && a.defaultProps === void 0) {
          var f = s;
          return f = Af(s), t.tag = He, t.type = f, mS(t, s), dC(e, t, f, i, u);
        }
        {
          var p = s.propTypes;
          p && Gi(
            p,
            i,
            "prop",
            wt(s)
          );
        }
        var v = ZS(a.type, null, i, t, t.mode, u);
        return v.ref = t.ref, v.return = t, t.child = v, v;
      }
      {
        var y = a.type, g = y.propTypes;
        g && Gi(
          g,
          i,
          "prop",
          wt(y)
        );
      }
      var b = e.child, x = RS(e, u);
      if (!x) {
        var M = b.memoizedProps, z = a.compare;
        if (z = z !== null ? z : be, z(M, i) && e.ref === t.ref)
          return Nu(e, t, u);
      }
      t.flags |= Rl;
      var H = qs(b, i);
      return H.ref = t.ref, H.return = t, t.child = H, H;
    }
    function dC(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = t.elementType;
        if (s.$$typeof === ke) {
          var f = s, p = f._payload, v = f._init;
          try {
            s = v(p);
          } catch {
            s = null;
          }
          var y = s && s.propTypes;
          y && Gi(
            y,
            i,
            "prop",
            wt(s)
          );
        }
      }
      if (e !== null) {
        var g = e.memoizedProps;
        if (be(g, i) && e.ref === t.ref && t.type === e.type)
          if (el = !1, t.pendingProps = i = g, RS(e, u))
            (e.flags & fs) !== De && (el = !0);
          else
            return t.lanes = e.lanes, Nu(e, t, u);
      }
      return vS(e, t, a, i, u);
    }
    function pC(e, t, a) {
      var i = t.pendingProps, u = i.children, s = e !== null ? e.memoizedState : null;
      if (i.mode === "hidden" || T)
        if ((t.mode & ot) === Me) {
          var f = {
            baseLanes: P,
            cachePool: null,
            transitions: null
          };
          t.memoizedState = f, km(t, a);
        } else if (aa(a, ra)) {
          var b = {
            baseLanes: P,
            cachePool: null,
            transitions: null
          };
          t.memoizedState = b;
          var x = s !== null ? s.baseLanes : a;
          km(t, x);
        } else {
          var p = null, v;
          if (s !== null) {
            var y = s.baseLanes;
            v = Ze(y, a);
          } else
            v = a;
          t.lanes = t.childLanes = ra;
          var g = {
            baseLanes: v,
            cachePool: p,
            transitions: null
          };
          return t.memoizedState = g, t.updateQueue = null, km(t, v), null;
        }
      else {
        var M;
        s !== null ? (M = Ze(s.baseLanes, a), t.memoizedState = null) : M = a, km(t, M);
      }
      return Ca(e, t, u, a), t.child;
    }
    function ux(e, t, a) {
      var i = t.pendingProps;
      return Ca(e, t, i, a), t.child;
    }
    function ox(e, t, a) {
      var i = t.pendingProps.children;
      return Ca(e, t, i, a), t.child;
    }
    function sx(e, t, a) {
      {
        t.flags |= Ke;
        {
          var i = t.stateNode;
          i.effectDuration = 0, i.passiveEffectDuration = 0;
        }
      }
      var u = t.pendingProps, s = u.children;
      return Ca(e, t, s, a), t.child;
    }
    function vC(e, t) {
      var a = t.ref;
      (e === null && a !== null || e !== null && e.ref !== a) && (t.flags |= Kr, t.flags |= fd);
    }
    function vS(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = a.propTypes;
        s && Gi(
          s,
          i,
          "prop",
          wt(a)
        );
      }
      var f;
      {
        var p = vf(t, a, !0);
        f = hf(t, p);
      }
      var v, y;
      Ef(t, u), kl(t);
      {
        if (Dp.current = t, qr(!0), v = bf(e, t, a, i, f, u), y = Df(), t.mode & gn) {
          jn(!0);
          try {
            v = bf(e, t, a, i, f, u), y = Df();
          } finally {
            jn(!1);
          }
        }
        qr(!1);
      }
      return uu(), e !== null && !el ? (ME(e, t, u), Nu(e, t, u)) : (Nr() && y && Gy(t), t.flags |= Rl, Ca(e, t, v, u), t.child);
    }
    function hC(e, t, a, i, u) {
      {
        switch (bb(t)) {
          case !1: {
            var s = t.stateNode, f = t.type, p = new f(t.memoizedProps, s.context), v = p.state;
            s.updater.enqueueSetState(s, v, null);
            break;
          }
          case !0: {
            t.flags |= Ve, t.flags |= qn;
            var y = new Error("Simulated error coming from DevTools"), g = Pn(u);
            t.lanes = Ze(t.lanes, g);
            var b = oS(t, $s(y, t), g);
            cg(t, b);
            break;
          }
        }
        if (t.type !== t.elementType) {
          var x = a.propTypes;
          x && Gi(
            x,
            i,
            "prop",
            wt(a)
          );
        }
      }
      var M;
      Pl(a) ? (M = !0, Dh(t)) : M = !1, Ef(t, u);
      var z = t.stateNode, H;
      z === null ? (gm(e, t), RE(t, a, i), Rg(t, a, i, u), H = !0) : e === null ? H = Uw(t, a, i, u) : H = Aw(e, t, a, i, u);
      var fe = hS(e, t, a, H, M, u);
      {
        var Oe = t.stateNode;
        H && Oe.props !== i && (Ys || S("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", Ye(t) || "a component"), Ys = !0);
      }
      return fe;
    }
    function hS(e, t, a, i, u, s) {
      vC(e, t);
      var f = (t.flags & Ve) !== De;
      if (!i && !f)
        return u && q0(t, a, !1), Nu(e, t, s);
      var p = t.stateNode;
      Dp.current = t;
      var v;
      if (f && typeof a.getDerivedStateFromError != "function")
        v = null, iC();
      else {
        kl(t);
        {
          if (qr(!0), v = p.render(), t.mode & gn) {
            jn(!0);
            try {
              p.render();
            } finally {
              jn(!1);
            }
          }
          qr(!1);
        }
        uu();
      }
      return t.flags |= Rl, e !== null && f ? lx(e, t, v, s) : Ca(e, t, v, s), t.memoizedState = p.state, u && q0(t, a, !0), t.child;
    }
    function mC(e) {
      var t = e.stateNode;
      t.pendingContext ? W0(e, t.pendingContext, t.pendingContext !== t.context) : t.context && W0(e, t.context, !1), Dg(e, t.containerInfo);
    }
    function cx(e, t, a) {
      if (mC(t), e === null)
        throw new Error("Should have a current fiber. This is a bug in React.");
      var i = t.pendingProps, u = t.memoizedState, s = u.element;
      vE(e, t), $h(t, i, null, a);
      var f = t.memoizedState;
      t.stateNode;
      var p = f.element;
      if (u.isDehydrated) {
        var v = {
          element: p,
          isDehydrated: !1,
          cache: f.cache,
          pendingSuspenseBoundaries: f.pendingSuspenseBoundaries,
          transitions: f.transitions
        }, y = t.updateQueue;
        if (y.baseState = v, t.memoizedState = v, t.flags & Tn) {
          var g = $s(new Error("There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering."), t);
          return yC(e, t, p, a, g);
        } else if (p !== s) {
          var b = $s(new Error("This root received an early update, before anything was able hydrate. Switched the entire root to client rendering."), t);
          return yC(e, t, p, a, b);
        } else {
          vw(t);
          var x = bE(t, null, p, a);
          t.child = x;
          for (var M = x; M; )
            M.flags = M.flags & ~rn | Ma, M = M.sibling;
        }
      } else {
        if (gf(), p === s)
          return Nu(e, t, a);
        Ca(e, t, p, a);
      }
      return t.child;
    }
    function yC(e, t, a, i, u) {
      return gf(), eg(u), t.flags |= Tn, Ca(e, t, a, i), t.child;
    }
    function fx(e, t, a) {
      kE(t), e === null && Jy(t);
      var i = t.type, u = t.pendingProps, s = e !== null ? e.memoizedProps : null, f = u.children, p = zy(i, u);
      return p ? f = null : s !== null && zy(i, s) && (t.flags |= jt), vC(e, t), Ca(e, t, f, a), t.child;
    }
    function dx(e, t) {
      return e === null && Jy(t), null;
    }
    function px(e, t, a, i) {
      gm(e, t);
      var u = t.pendingProps, s = a, f = s._payload, p = s._init, v = p(f);
      t.type = v;
      var y = t.tag = pb(v), g = Ki(v, u), b;
      switch (y) {
        case he:
          return mS(t, v), t.type = v = Af(v), b = vS(null, t, v, g, i), b;
        case pe:
          return t.type = v = QS(v), b = hC(null, t, v, g, i), b;
        case Qe:
          return t.type = v = WS(v), b = cC(null, t, v, g, i), b;
        case it: {
          if (t.type !== t.elementType) {
            var x = v.propTypes;
            x && Gi(
              x,
              g,
              "prop",
              wt(v)
            );
          }
          return b = fC(
            null,
            t,
            v,
            Ki(v.type, g),
            i
          ), b;
        }
      }
      var M = "";
      throw v !== null && typeof v == "object" && v.$$typeof === ke && (M = " Did you wrap a component in React.lazy() more than once?"), new Error("Element type is invalid. Received a promise that resolves to: " + v + ". " + ("Lazy element type must resolve to a class or function." + M));
    }
    function vx(e, t, a, i, u) {
      gm(e, t), t.tag = pe;
      var s;
      return Pl(a) ? (s = !0, Dh(t)) : s = !1, Ef(t, u), RE(t, a, i), Rg(t, a, i, u), hS(null, t, a, !0, s, u);
    }
    function hx(e, t, a, i) {
      gm(e, t);
      var u = t.pendingProps, s;
      {
        var f = vf(t, a, !1);
        s = hf(t, f);
      }
      Ef(t, i);
      var p, v;
      kl(t);
      {
        if (a.prototype && typeof a.prototype.render == "function") {
          var y = wt(a) || "Unknown";
          sS[y] || (S("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", y, y), sS[y] = !0);
        }
        t.mode & gn && Xi.recordLegacyContextWarning(t, null), qr(!0), Dp.current = t, p = bf(null, t, a, u, s, i), v = Df(), qr(!1);
      }
      if (uu(), t.flags |= Rl, typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0) {
        var g = wt(a) || "Unknown";
        kp[g] || (S("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", g, g, g), kp[g] = !0);
      }
      if (typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0) {
        {
          var b = wt(a) || "Unknown";
          kp[b] || (S("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", b, b, b), kp[b] = !0);
        }
        t.tag = pe, t.memoizedState = null, t.updateQueue = null;
        var x = !1;
        return Pl(a) ? (x = !0, Dh(t)) : x = !1, t.memoizedState = p.state !== null && p.state !== void 0 ? p.state : null, sg(t), CE(t, p), Rg(t, a, u, i), hS(null, t, a, !0, x, i);
      } else {
        if (t.tag = he, t.mode & gn) {
          jn(!0);
          try {
            p = bf(null, t, a, u, s, i), v = Df();
          } finally {
            jn(!1);
          }
        }
        return Nr() && v && Gy(t), Ca(null, t, p, i), mS(t, a), t.child;
      }
    }
    function mS(e, t) {
      {
        if (t && t.childContextTypes && S("%s(...): childContextTypes cannot be defined on a function component.", t.displayName || t.name || "Component"), e.ref !== null) {
          var a = "", i = Or();
          i && (a += `

Check the render method of \`` + i + "`.");
          var u = i || "", s = e._debugSource;
          s && (u = s.fileName + ":" + s.lineNumber), dS[u] || (dS[u] = !0, S("Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?%s", a));
        }
        if (typeof t.getDerivedStateFromProps == "function") {
          var f = wt(t) || "Unknown";
          fS[f] || (S("%s: Function components do not support getDerivedStateFromProps.", f), fS[f] = !0);
        }
        if (typeof t.contextType == "object" && t.contextType !== null) {
          var p = wt(t) || "Unknown";
          cS[p] || (S("%s: Function components do not support contextType.", p), cS[p] = !0);
        }
      }
    }
    var yS = {
      dehydrated: null,
      treeContext: null,
      retryLane: yt
    };
    function gS(e) {
      return {
        baseLanes: e,
        cachePool: ix(),
        transitions: null
      };
    }
    function mx(e, t) {
      var a = null;
      return {
        baseLanes: Ze(e.baseLanes, t),
        cachePool: a,
        transitions: e.transitions
      };
    }
    function yx(e, t, a, i) {
      if (t !== null) {
        var u = t.memoizedState;
        if (u === null)
          return !1;
      }
      return Lg(e, Ep);
    }
    function gx(e, t) {
      return vo(e.childLanes, t);
    }
    function gC(e, t, a) {
      var i = t.pendingProps;
      Db(t) && (t.flags |= Ve);
      var u = Zi.current, s = !1, f = (t.flags & Ve) !== De;
      if (f || yx(u, e) ? (s = !0, t.flags &= ~Ve) : (e === null || e.memoizedState !== null) && (u = Pw(u, LE)), u = Tf(u), Fo(t, u), e === null) {
        Jy(t);
        var p = t.memoizedState;
        if (p !== null) {
          var v = p.dehydrated;
          if (v !== null)
            return Tx(t, v);
        }
        var y = i.children, g = i.fallback;
        if (s) {
          var b = Sx(t, y, g, a), x = t.child;
          return x.memoizedState = gS(a), t.memoizedState = yS, b;
        } else
          return SS(t, y);
      } else {
        var M = e.memoizedState;
        if (M !== null) {
          var z = M.dehydrated;
          if (z !== null)
            return wx(e, t, f, i, z, M, a);
        }
        if (s) {
          var H = i.fallback, fe = i.children, Oe = Cx(e, t, fe, H, a), Te = t.child, St = e.child.memoizedState;
          return Te.memoizedState = St === null ? gS(a) : mx(St, a), Te.childLanes = gx(e, a), t.memoizedState = yS, Oe;
        } else {
          var pt = i.children, k = Ex(e, t, pt, a);
          return t.memoizedState = null, k;
        }
      }
    }
    function SS(e, t, a) {
      var i = e.mode, u = {
        mode: "visible",
        children: t
      }, s = ES(u, i);
      return s.return = e, e.child = s, s;
    }
    function Sx(e, t, a, i) {
      var u = e.mode, s = e.child, f = {
        mode: "hidden",
        children: t
      }, p, v;
      return (u & ot) === Me && s !== null ? (p = s, p.childLanes = P, p.pendingProps = f, e.mode & ze && (p.actualDuration = 0, p.actualStartTime = -1, p.selfBaseDuration = 0, p.treeBaseDuration = 0), v = Io(a, u, i, null)) : (p = ES(f, u), v = Io(a, u, i, null)), p.return = e, v.return = e, p.sibling = v, e.child = p, v;
    }
    function ES(e, t, a) {
      return S1(e, t, P, null);
    }
    function SC(e, t) {
      return qs(e, t);
    }
    function Ex(e, t, a, i) {
      var u = e.child, s = u.sibling, f = SC(u, {
        mode: "visible",
        children: a
      });
      if ((t.mode & ot) === Me && (f.lanes = i), f.return = t, f.sibling = null, s !== null) {
        var p = t.deletions;
        p === null ? (t.deletions = [s], t.flags |= Mt) : p.push(s);
      }
      return t.child = f, f;
    }
    function Cx(e, t, a, i, u) {
      var s = t.mode, f = e.child, p = f.sibling, v = {
        mode: "hidden",
        children: a
      }, y;
      if ((s & ot) === Me && t.child !== f) {
        var g = t.child;
        y = g, y.childLanes = P, y.pendingProps = v, t.mode & ze && (y.actualDuration = 0, y.actualStartTime = -1, y.selfBaseDuration = f.selfBaseDuration, y.treeBaseDuration = f.treeBaseDuration), t.deletions = null;
      } else
        y = SC(f, v), y.subtreeFlags = f.subtreeFlags & rr;
      var b;
      return p !== null ? b = qs(p, i) : (b = Io(i, s, u, null), b.flags |= rn), b.return = t, y.return = t, y.sibling = b, t.child = y, b;
    }
    function ym(e, t, a, i) {
      i !== null && eg(i), Cf(t, e.child, null, a);
      var u = t.pendingProps, s = u.children, f = SS(t, s);
      return f.flags |= rn, t.memoizedState = null, f;
    }
    function Rx(e, t, a, i, u) {
      var s = t.mode, f = {
        mode: "visible",
        children: a
      }, p = ES(f, s), v = Io(i, s, u, null);
      return v.flags |= rn, p.return = t, v.return = t, p.sibling = v, t.child = p, (t.mode & ot) !== Me && Cf(t, e.child, null, u), v;
    }
    function Tx(e, t, a) {
      return (e.mode & ot) === Me ? (S("Cannot hydrate Suspense in legacy mode. Switch from ReactDOM.hydrate(element, container) to ReactDOMClient.hydrateRoot(container, <App />).render(element) or remove the Suspense components from the server rendered components."), e.lanes = Ae) : Hy(t) ? e.lanes = cu : e.lanes = ra, null;
    }
    function wx(e, t, a, i, u, s, f) {
      if (a)
        if (t.flags & Tn) {
          t.flags &= ~Tn;
          var k = lS(new Error("There was an error while hydrating this Suspense boundary. Switched to client rendering."));
          return ym(e, t, f, k);
        } else {
          if (t.memoizedState !== null)
            return t.child = e.child, t.flags |= Ve, null;
          var j = i.children, O = i.fallback, G = Rx(e, t, j, O, f), de = t.child;
          return de.memoizedState = gS(f), t.memoizedState = yS, G;
        }
      else {
        if (dw(), (t.mode & ot) === Me)
          return ym(
            e,
            t,
            f,
            null
          );
        if (Hy(u)) {
          var p, v, y;
          {
            var g = kT(u);
            p = g.digest, v = g.message, y = g.stack;
          }
          var b;
          v ? b = new Error(v) : b = new Error("The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering.");
          var x = lS(b, p, y);
          return ym(e, t, f, x);
        }
        var M = aa(f, e.childLanes);
        if (el || M) {
          var z = Dm();
          if (z !== null) {
            var H = iy(z, f);
            if (H !== yt && H !== s.retryLane) {
              s.retryLane = H;
              var fe = Zt;
              Ba(e, H), pr(z, e, H, fe);
            }
          }
          VS();
          var Oe = lS(new Error("This Suspense boundary received an update before it finished hydrating. This caused the boundary to switch to client rendering. The usual way to fix this is to wrap the original update in startTransition."));
          return ym(e, t, f, Oe);
        } else if (V0(u)) {
          t.flags |= Ve, t.child = e.child;
          var Te = X_.bind(null, e);
          return OT(u, Te), null;
        } else {
          hw(t, u, s.treeContext);
          var St = i.children, pt = SS(t, St);
          return pt.flags |= Ma, pt;
        }
      }
    }
    function EC(e, t, a) {
      e.lanes = Ze(e.lanes, t);
      var i = e.alternate;
      i !== null && (i.lanes = Ze(i.lanes, t)), ig(e.return, t, a);
    }
    function xx(e, t, a) {
      for (var i = t; i !== null; ) {
        if (i.tag === _e) {
          var u = i.memoizedState;
          u !== null && EC(i, a, e);
        } else if (i.tag === bt)
          EC(i, a, e);
        else if (i.child !== null) {
          i.child.return = i, i = i.child;
          continue;
        }
        if (i === e)
          return;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === e)
            return;
          i = i.return;
        }
        i.sibling.return = i.return, i = i.sibling;
      }
    }
    function _x(e) {
      for (var t = e, a = null; t !== null; ) {
        var i = t.alternate;
        i !== null && Xh(i) === null && (a = t), t = t.sibling;
      }
      return a;
    }
    function bx(e) {
      if (e !== void 0 && e !== "forwards" && e !== "backwards" && e !== "together" && !pS[e])
        if (pS[e] = !0, typeof e == "string")
          switch (e.toLowerCase()) {
            case "together":
            case "forwards":
            case "backwards": {
              S('"%s" is not a valid value for revealOrder on <SuspenseList />. Use lowercase "%s" instead.', e, e.toLowerCase());
              break;
            }
            case "forward":
            case "backward": {
              S('"%s" is not a valid value for revealOrder on <SuspenseList />. React uses the -s suffix in the spelling. Use "%ss" instead.', e, e.toLowerCase());
              break;
            }
            default:
              S('"%s" is not a supported revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', e);
              break;
          }
        else
          S('%s is not a supported value for revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', e);
    }
    function Dx(e, t) {
      e !== void 0 && !mm[e] && (e !== "collapsed" && e !== "hidden" ? (mm[e] = !0, S('"%s" is not a supported value for tail on <SuspenseList />. Did you mean "collapsed" or "hidden"?', e)) : t !== "forwards" && t !== "backwards" && (mm[e] = !0, S('<SuspenseList tail="%s" /> is only valid if revealOrder is "forwards" or "backwards". Did you mean to specify revealOrder="forwards"?', e)));
    }
    function CC(e, t) {
      {
        var a = vt(e), i = !a && typeof qa(e) == "function";
        if (a || i) {
          var u = a ? "array" : "iterable";
          return S("A nested %s was passed to row #%s in <SuspenseList />. Wrap it in an additional SuspenseList to configure its revealOrder: <SuspenseList revealOrder=...> ... <SuspenseList revealOrder=...>{%s}</SuspenseList> ... </SuspenseList>", u, t, u), !1;
        }
      }
      return !0;
    }
    function kx(e, t) {
      if ((t === "forwards" || t === "backwards") && e !== void 0 && e !== null && e !== !1)
        if (vt(e)) {
          for (var a = 0; a < e.length; a++)
            if (!CC(e[a], a))
              return;
        } else {
          var i = qa(e);
          if (typeof i == "function") {
            var u = i.call(e);
            if (u)
              for (var s = u.next(), f = 0; !s.done; s = u.next()) {
                if (!CC(s.value, f))
                  return;
                f++;
              }
          } else
            S('A single row was passed to a <SuspenseList revealOrder="%s" />. This is not useful since it needs multiple rows. Did you mean to pass multiple children or an array?', t);
        }
    }
    function CS(e, t, a, i, u) {
      var s = e.memoizedState;
      s === null ? e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: i,
        tail: a,
        tailMode: u
      } : (s.isBackwards = t, s.rendering = null, s.renderingStartTime = 0, s.last = i, s.tail = a, s.tailMode = u);
    }
    function RC(e, t, a) {
      var i = t.pendingProps, u = i.revealOrder, s = i.tail, f = i.children;
      bx(u), Dx(s, u), kx(f, u), Ca(e, t, f, a);
      var p = Zi.current, v = Lg(p, Ep);
      if (v)
        p = Mg(p, Ep), t.flags |= Ve;
      else {
        var y = e !== null && (e.flags & Ve) !== De;
        y && xx(t, t.child, a), p = Tf(p);
      }
      if (Fo(t, p), (t.mode & ot) === Me)
        t.memoizedState = null;
      else
        switch (u) {
          case "forwards": {
            var g = _x(t.child), b;
            g === null ? (b = t.child, t.child = null) : (b = g.sibling, g.sibling = null), CS(
              t,
              !1,
              b,
              g,
              s
            );
            break;
          }
          case "backwards": {
            var x = null, M = t.child;
            for (t.child = null; M !== null; ) {
              var z = M.alternate;
              if (z !== null && Xh(z) === null) {
                t.child = M;
                break;
              }
              var H = M.sibling;
              M.sibling = x, x = M, M = H;
            }
            CS(
              t,
              !0,
              x,
              null,
              s
            );
            break;
          }
          case "together": {
            CS(
              t,
              !1,
              null,
              null,
              void 0
            );
            break;
          }
          default:
            t.memoizedState = null;
        }
      return t.child;
    }
    function Ox(e, t, a) {
      Dg(t, t.stateNode.containerInfo);
      var i = t.pendingProps;
      return e === null ? t.child = Cf(t, null, i, a) : Ca(e, t, i, a), t.child;
    }
    var TC = !1;
    function Lx(e, t, a) {
      var i = t.type, u = i._context, s = t.pendingProps, f = t.memoizedProps, p = s.value;
      {
        "value" in s || TC || (TC = !0, S("The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?"));
        var v = t.type.propTypes;
        v && Gi(v, s, "prop", "Context.Provider");
      }
      if (cE(t, u, p), f !== null) {
        var y = f.value;
        if (Se(y, p)) {
          if (f.children === s.children && !_h())
            return Nu(e, t, a);
        } else
          xw(t, u, a);
      }
      var g = s.children;
      return Ca(e, t, g, a), t.child;
    }
    var wC = !1;
    function Mx(e, t, a) {
      var i = t.type;
      i._context === void 0 ? i !== i.Consumer && (wC || (wC = !0, S("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?"))) : i = i._context;
      var u = t.pendingProps, s = u.children;
      typeof s != "function" && S("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it."), Ef(t, a);
      var f = er(i);
      kl(t);
      var p;
      return Dp.current = t, qr(!0), p = s(f), qr(!1), uu(), t.flags |= Rl, Ca(e, t, p, a), t.child;
    }
    function Op() {
      el = !0;
    }
    function gm(e, t) {
      (t.mode & ot) === Me && e !== null && (e.alternate = null, t.alternate = null, t.flags |= rn);
    }
    function Nu(e, t, a) {
      return e !== null && (t.dependencies = e.dependencies), iC(), Bp(t.lanes), aa(a, t.childLanes) ? (Fw(e, t), t.child) : null;
    }
    function Nx(e, t, a) {
      {
        var i = t.return;
        if (i === null)
          throw new Error("Cannot swap the root fiber.");
        if (e.alternate = null, t.alternate = null, a.index = t.index, a.sibling = t.sibling, a.return = t.return, a.ref = t.ref, t === i.child)
          i.child = a;
        else {
          var u = i.child;
          if (u === null)
            throw new Error("Expected parent to have a child.");
          for (; u.sibling !== t; )
            if (u = u.sibling, u === null)
              throw new Error("Expected to find the previous sibling.");
          u.sibling = a;
        }
        var s = i.deletions;
        return s === null ? (i.deletions = [e], i.flags |= Mt) : s.push(e), a.flags |= rn, a;
      }
    }
    function RS(e, t) {
      var a = e.lanes;
      return !!aa(a, t);
    }
    function zx(e, t, a) {
      switch (t.tag) {
        case re:
          mC(t), t.stateNode, gf();
          break;
        case ie:
          kE(t);
          break;
        case pe: {
          var i = t.type;
          Pl(i) && Dh(t);
          break;
        }
        case me:
          Dg(t, t.stateNode.containerInfo);
          break;
        case at: {
          var u = t.memoizedProps.value, s = t.type._context;
          cE(t, s, u);
          break;
        }
        case ct:
          {
            var f = aa(a, t.childLanes);
            f && (t.flags |= Ke);
            {
              var p = t.stateNode;
              p.effectDuration = 0, p.passiveEffectDuration = 0;
            }
          }
          break;
        case _e: {
          var v = t.memoizedState;
          if (v !== null) {
            if (v.dehydrated !== null)
              return Fo(t, Tf(Zi.current)), t.flags |= Ve, null;
            var y = t.child, g = y.childLanes;
            if (aa(a, g))
              return gC(e, t, a);
            Fo(t, Tf(Zi.current));
            var b = Nu(e, t, a);
            return b !== null ? b.sibling : null;
          } else
            Fo(t, Tf(Zi.current));
          break;
        }
        case bt: {
          var x = (e.flags & Ve) !== De, M = aa(a, t.childLanes);
          if (x) {
            if (M)
              return RC(e, t, a);
            t.flags |= Ve;
          }
          var z = t.memoizedState;
          if (z !== null && (z.rendering = null, z.tail = null, z.lastEffect = null), Fo(t, Zi.current), M)
            break;
          return null;
        }
        case Ue:
        case qe:
          return t.lanes = P, pC(e, t, a);
      }
      return Nu(e, t, a);
    }
    function xC(e, t, a) {
      if (t._debugNeedsRemount && e !== null)
        return Nx(e, t, ZS(t.type, t.key, t.pendingProps, t._debugOwner || null, t.mode, t.lanes));
      if (e !== null) {
        var i = e.memoizedProps, u = t.pendingProps;
        if (i !== u || _h() || t.type !== e.type)
          el = !0;
        else {
          var s = RS(e, a);
          if (!s && (t.flags & Ve) === De)
            return el = !1, zx(e, t, a);
          (e.flags & fs) !== De ? el = !0 : el = !1;
        }
      } else if (el = !1, Nr() && lw(t)) {
        var f = t.index, p = uw();
        Z0(t, p, f);
      }
      switch (t.lanes = P, t.tag) {
        case rt:
          return hx(e, t, t.type, a);
        case nn: {
          var v = t.elementType;
          return px(e, t, v, a);
        }
        case he: {
          var y = t.type, g = t.pendingProps, b = t.elementType === y ? g : Ki(y, g);
          return vS(e, t, y, b, a);
        }
        case pe: {
          var x = t.type, M = t.pendingProps, z = t.elementType === x ? M : Ki(x, M);
          return hC(e, t, x, z, a);
        }
        case re:
          return cx(e, t, a);
        case ie:
          return fx(e, t, a);
        case Pe:
          return dx(e, t);
        case _e:
          return gC(e, t, a);
        case me:
          return Ox(e, t, a);
        case Qe: {
          var H = t.type, fe = t.pendingProps, Oe = t.elementType === H ? fe : Ki(H, fe);
          return cC(e, t, H, Oe, a);
        }
        case Ct:
          return ux(e, t, a);
        case st:
          return ox(e, t, a);
        case ct:
          return sx(e, t, a);
        case at:
          return Lx(e, t, a);
        case dn:
          return Mx(e, t, a);
        case it: {
          var Te = t.type, St = t.pendingProps, pt = Ki(Te, St);
          if (t.type !== t.elementType) {
            var k = Te.propTypes;
            k && Gi(
              k,
              pt,
              "prop",
              wt(Te)
            );
          }
          return pt = Ki(Te.type, pt), fC(e, t, Te, pt, a);
        }
        case He:
          return dC(e, t, t.type, t.pendingProps, a);
        case _n: {
          var j = t.type, O = t.pendingProps, G = t.elementType === j ? O : Ki(j, O);
          return vx(e, t, j, G, a);
        }
        case bt:
          return RC(e, t, a);
        case Cn:
          break;
        case Ue:
          return pC(e, t, a);
      }
      throw new Error("Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue.");
    }
    function kf(e) {
      e.flags |= Ke;
    }
    function _C(e) {
      e.flags |= Kr, e.flags |= fd;
    }
    var bC, TS, DC, kC;
    bC = function(e, t, a, i) {
      for (var u = t.child; u !== null; ) {
        if (u.tag === ie || u.tag === Pe)
          rT(e, u.stateNode);
        else if (u.tag !== me) {
          if (u.child !== null) {
            u.child.return = u, u = u.child;
            continue;
          }
        }
        if (u === t)
          return;
        for (; u.sibling === null; ) {
          if (u.return === null || u.return === t)
            return;
          u = u.return;
        }
        u.sibling.return = u.return, u = u.sibling;
      }
    }, TS = function(e, t) {
    }, DC = function(e, t, a, i, u) {
      var s = e.memoizedProps;
      if (s !== i) {
        var f = t.stateNode, p = kg(), v = iT(f, a, s, i, u, p);
        t.updateQueue = v, v && kf(t);
      }
    }, kC = function(e, t, a, i) {
      a !== i && kf(t);
    };
    function Lp(e, t) {
      if (!Nr())
        switch (e.tailMode) {
          case "hidden": {
            for (var a = e.tail, i = null; a !== null; )
              a.alternate !== null && (i = a), a = a.sibling;
            i === null ? e.tail = null : i.sibling = null;
            break;
          }
          case "collapsed": {
            for (var u = e.tail, s = null; u !== null; )
              u.alternate !== null && (s = u), u = u.sibling;
            s === null ? !t && e.tail !== null ? e.tail.sibling = null : e.tail = null : s.sibling = null;
            break;
          }
        }
    }
    function Ur(e) {
      var t = e.alternate !== null && e.alternate.child === e.child, a = P, i = De;
      if (t) {
        if ((e.mode & ze) !== Me) {
          for (var v = e.selfBaseDuration, y = e.child; y !== null; )
            a = Ze(a, Ze(y.lanes, y.childLanes)), i |= y.subtreeFlags & rr, i |= y.flags & rr, v += y.treeBaseDuration, y = y.sibling;
          e.treeBaseDuration = v;
        } else
          for (var g = e.child; g !== null; )
            a = Ze(a, Ze(g.lanes, g.childLanes)), i |= g.subtreeFlags & rr, i |= g.flags & rr, g.return = e, g = g.sibling;
        e.subtreeFlags |= i;
      } else {
        if ((e.mode & ze) !== Me) {
          for (var u = e.actualDuration, s = e.selfBaseDuration, f = e.child; f !== null; )
            a = Ze(a, Ze(f.lanes, f.childLanes)), i |= f.subtreeFlags, i |= f.flags, u += f.actualDuration, s += f.treeBaseDuration, f = f.sibling;
          e.actualDuration = u, e.treeBaseDuration = s;
        } else
          for (var p = e.child; p !== null; )
            a = Ze(a, Ze(p.lanes, p.childLanes)), i |= p.subtreeFlags, i |= p.flags, p.return = e, p = p.sibling;
        e.subtreeFlags |= i;
      }
      return e.childLanes = a, t;
    }
    function Ux(e, t, a) {
      if (Ew() && (t.mode & ot) !== Me && (t.flags & Ve) === De)
        return iE(t), gf(), t.flags |= Tn | ha | qn, !1;
      var i = Nh(t);
      if (a !== null && a.dehydrated !== null)
        if (e === null) {
          if (!i)
            throw new Error("A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React.");
          if (gw(t), Ur(t), (t.mode & ze) !== Me) {
            var u = a !== null;
            if (u) {
              var s = t.child;
              s !== null && (t.treeBaseDuration -= s.treeBaseDuration);
            }
          }
          return !1;
        } else {
          if (gf(), (t.flags & Ve) === De && (t.memoizedState = null), t.flags |= Ke, Ur(t), (t.mode & ze) !== Me) {
            var f = a !== null;
            if (f) {
              var p = t.child;
              p !== null && (t.treeBaseDuration -= p.treeBaseDuration);
            }
          }
          return !1;
        }
      else
        return lE(), !0;
    }
    function OC(e, t, a) {
      var i = t.pendingProps;
      switch (qy(t), t.tag) {
        case rt:
        case nn:
        case He:
        case he:
        case Qe:
        case Ct:
        case st:
        case ct:
        case dn:
        case it:
          return Ur(t), null;
        case pe: {
          var u = t.type;
          return Pl(u) && bh(t), Ur(t), null;
        }
        case re: {
          var s = t.stateNode;
          if (Rf(t), Iy(t), zg(), s.pendingContext && (s.context = s.pendingContext, s.pendingContext = null), e === null || e.child === null) {
            var f = Nh(t);
            if (f)
              kf(t);
            else if (e !== null) {
              var p = e.memoizedState;
              (!p.isDehydrated || (t.flags & Tn) !== De) && (t.flags |= La, lE());
            }
          }
          return TS(e, t), Ur(t), null;
        }
        case ie: {
          Og(t);
          var v = DE(), y = t.type;
          if (e !== null && t.stateNode != null)
            DC(e, t, y, i, v), e.ref !== t.ref && _C(t);
          else {
            if (!i) {
              if (t.stateNode === null)
                throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
              return Ur(t), null;
            }
            var g = kg(), b = Nh(t);
            if (b)
              mw(t, v, g) && kf(t);
            else {
              var x = nT(y, i, v, g, t);
              bC(x, t, !1, !1), t.stateNode = x, aT(x, y, i, v) && kf(t);
            }
            t.ref !== null && _C(t);
          }
          return Ur(t), null;
        }
        case Pe: {
          var M = i;
          if (e && t.stateNode != null) {
            var z = e.memoizedProps;
            kC(e, t, z, M);
          } else {
            if (typeof M != "string" && t.stateNode === null)
              throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
            var H = DE(), fe = kg(), Oe = Nh(t);
            Oe ? yw(t) && kf(t) : t.stateNode = lT(M, H, fe, t);
          }
          return Ur(t), null;
        }
        case _e: {
          wf(t);
          var Te = t.memoizedState;
          if (e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
            var St = Ux(e, t, Te);
            if (!St)
              return t.flags & qn ? t : null;
          }
          if ((t.flags & Ve) !== De)
            return t.lanes = a, (t.mode & ze) !== Me && iS(t), t;
          var pt = Te !== null, k = e !== null && e.memoizedState !== null;
          if (pt !== k && pt) {
            var j = t.child;
            if (j.flags |= Tl, (t.mode & ot) !== Me) {
              var O = e === null && (t.memoizedProps.unstable_avoidThisFallback !== !0 || !$);
              O || Lg(Zi.current, LE) ? F_() : VS();
            }
          }
          var G = t.updateQueue;
          if (G !== null && (t.flags |= Ke), Ur(t), (t.mode & ze) !== Me && pt) {
            var de = t.child;
            de !== null && (t.treeBaseDuration -= de.treeBaseDuration);
          }
          return null;
        }
        case me:
          return Rf(t), TS(e, t), e === null && JT(t.stateNode.containerInfo), Ur(t), null;
        case at:
          var ue = t.type._context;
          return ag(ue, t), Ur(t), null;
        case _n: {
          var je = t.type;
          return Pl(je) && bh(t), Ur(t), null;
        }
        case bt: {
          wf(t);
          var We = t.memoizedState;
          if (We === null)
            return Ur(t), null;
          var Gt = (t.flags & Ve) !== De, kt = We.rendering;
          if (kt === null)
            if (Gt)
              Lp(We, !1);
            else {
              var Yn = j_() && (e === null || (e.flags & Ve) === De);
              if (!Yn)
                for (var Ot = t.child; Ot !== null; ) {
                  var An = Xh(Ot);
                  if (An !== null) {
                    Gt = !0, t.flags |= Ve, Lp(We, !1);
                    var oa = An.updateQueue;
                    return oa !== null && (t.updateQueue = oa, t.flags |= Ke), t.subtreeFlags = De, Hw(t, a), Fo(t, Mg(Zi.current, Ep)), t.child;
                  }
                  Ot = Ot.sibling;
                }
              We.tail !== null && yn() > KC() && (t.flags |= Ve, Gt = !0, Lp(We, !1), t.lanes = wd);
            }
          else {
            if (!Gt) {
              var Pr = Xh(kt);
              if (Pr !== null) {
                t.flags |= Ve, Gt = !0;
                var li = Pr.updateQueue;
                if (li !== null && (t.updateQueue = li, t.flags |= Ke), Lp(We, !0), We.tail === null && We.tailMode === "hidden" && !kt.alternate && !Nr())
                  return Ur(t), null;
              } else
                yn() * 2 - We.renderingStartTime > KC() && a !== ra && (t.flags |= Ve, Gt = !0, Lp(We, !1), t.lanes = wd);
            }
            if (We.isBackwards)
              kt.sibling = t.child, t.child = kt;
            else {
              var wa = We.last;
              wa !== null ? wa.sibling = kt : t.child = kt, We.last = kt;
            }
          }
          if (We.tail !== null) {
            var xa = We.tail;
            We.rendering = xa, We.tail = xa.sibling, We.renderingStartTime = yn(), xa.sibling = null;
            var sa = Zi.current;
            return Gt ? sa = Mg(sa, Ep) : sa = Tf(sa), Fo(t, sa), xa;
          }
          return Ur(t), null;
        }
        case Cn:
          break;
        case Ue:
        case qe: {
          PS(t);
          var Hu = t.memoizedState, Ff = Hu !== null;
          if (e !== null) {
            var Wp = e.memoizedState, Gl = Wp !== null;
            Gl !== Ff && !T && (t.flags |= Tl);
          }
          return !Ff || (t.mode & ot) === Me ? Ur(t) : aa(Wl, ra) && (Ur(t), t.subtreeFlags & (rn | Ke) && (t.flags |= Tl)), null;
        }
        case Nt:
          return null;
        case Rt:
          return null;
      }
      throw new Error("Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue.");
    }
    function Ax(e, t, a) {
      switch (qy(t), t.tag) {
        case pe: {
          var i = t.type;
          Pl(i) && bh(t);
          var u = t.flags;
          return u & qn ? (t.flags = u & ~qn | Ve, (t.mode & ze) !== Me && iS(t), t) : null;
        }
        case re: {
          t.stateNode, Rf(t), Iy(t), zg();
          var s = t.flags;
          return (s & qn) !== De && (s & Ve) === De ? (t.flags = s & ~qn | Ve, t) : null;
        }
        case ie:
          return Og(t), null;
        case _e: {
          wf(t);
          var f = t.memoizedState;
          if (f !== null && f.dehydrated !== null) {
            if (t.alternate === null)
              throw new Error("Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue.");
            gf();
          }
          var p = t.flags;
          return p & qn ? (t.flags = p & ~qn | Ve, (t.mode & ze) !== Me && iS(t), t) : null;
        }
        case bt:
          return wf(t), null;
        case me:
          return Rf(t), null;
        case at:
          var v = t.type._context;
          return ag(v, t), null;
        case Ue:
        case qe:
          return PS(t), null;
        case Nt:
          return null;
        default:
          return null;
      }
    }
    function LC(e, t, a) {
      switch (qy(t), t.tag) {
        case pe: {
          var i = t.type.childContextTypes;
          i != null && bh(t);
          break;
        }
        case re: {
          t.stateNode, Rf(t), Iy(t), zg();
          break;
        }
        case ie: {
          Og(t);
          break;
        }
        case me:
          Rf(t);
          break;
        case _e:
          wf(t);
          break;
        case bt:
          wf(t);
          break;
        case at:
          var u = t.type._context;
          ag(u, t);
          break;
        case Ue:
        case qe:
          PS(t);
          break;
      }
    }
    var MC = null;
    MC = /* @__PURE__ */ new Set();
    var Sm = !1, Ar = !1, Fx = typeof WeakSet == "function" ? WeakSet : Set, Ee = null, Of = null, Lf = null;
    function Hx(e) {
      iu(null, function() {
        throw e;
      }), sd();
    }
    var jx = function(e, t) {
      if (t.props = e.memoizedProps, t.state = e.memoizedState, e.mode & ze)
        try {
          Il(), t.componentWillUnmount();
        } finally {
          Yl(e);
        }
      else
        t.componentWillUnmount();
    };
    function NC(e, t) {
      try {
        Po(ur, e);
      } catch (a) {
        on(e, t, a);
      }
    }
    function wS(e, t, a) {
      try {
        jx(e, a);
      } catch (i) {
        on(e, t, i);
      }
    }
    function Px(e, t, a) {
      try {
        a.componentDidMount();
      } catch (i) {
        on(e, t, i);
      }
    }
    function zC(e, t) {
      try {
        AC(e);
      } catch (a) {
        on(e, t, a);
      }
    }
    function Mf(e, t) {
      var a = e.ref;
      if (a !== null)
        if (typeof a == "function") {
          var i;
          try {
            if (et && ft && e.mode & ze)
              try {
                Il(), i = a(null);
              } finally {
                Yl(e);
              }
            else
              i = a(null);
          } catch (u) {
            on(e, t, u);
          }
          typeof i == "function" && S("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", Ye(e));
        } else
          a.current = null;
    }
    function Em(e, t, a) {
      try {
        a();
      } catch (i) {
        on(e, t, i);
      }
    }
    var UC = !1;
    function Vx(e, t) {
      eT(e.containerInfo), Ee = t, Bx();
      var a = UC;
      return UC = !1, a;
    }
    function Bx() {
      for (; Ee !== null; ) {
        var e = Ee, t = e.child;
        (e.subtreeFlags & io) !== De && t !== null ? (t.return = e, Ee = t) : $x();
      }
    }
    function $x() {
      for (; Ee !== null; ) {
        var e = Ee;
        Ht(e);
        try {
          Yx(e);
        } catch (a) {
          on(e, e.return, a);
        }
        Rn();
        var t = e.sibling;
        if (t !== null) {
          t.return = e.return, Ee = t;
          return;
        }
        Ee = e.return;
      }
    }
    function Yx(e) {
      var t = e.alternate, a = e.flags;
      if ((a & La) !== De) {
        switch (Ht(e), e.tag) {
          case he:
          case Qe:
          case He:
            break;
          case pe: {
            if (t !== null) {
              var i = t.memoizedProps, u = t.memoizedState, s = e.stateNode;
              e.type === e.elementType && !Ys && (s.props !== e.memoizedProps && S("Expected %s props to match memoized props before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Ye(e) || "instance"), s.state !== e.memoizedState && S("Expected %s state to match memoized state before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Ye(e) || "instance"));
              var f = s.getSnapshotBeforeUpdate(e.elementType === e.type ? i : Ki(e.type, i), u);
              {
                var p = MC;
                f === void 0 && !p.has(e.type) && (p.add(e.type), S("%s.getSnapshotBeforeUpdate(): A snapshot value (or null) must be returned. You have returned undefined.", Ye(e)));
              }
              s.__reactInternalSnapshotBeforeUpdate = f;
            }
            break;
          }
          case re: {
            {
              var v = e.stateNode;
              xT(v.containerInfo);
            }
            break;
          }
          case ie:
          case Pe:
          case me:
          case _n:
            break;
          default:
            throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
        }
        Rn();
      }
    }
    function tl(e, t, a) {
      var i = t.updateQueue, u = i !== null ? i.lastEffect : null;
      if (u !== null) {
        var s = u.next, f = s;
        do {
          if ((f.tag & e) === e) {
            var p = f.destroy;
            f.destroy = void 0, p !== void 0 && ((e & zr) !== $a ? Ec(t) : (e & ur) !== $a && Cc(t), (e & Vl) !== $a && Yp(!0), Em(t, a, p), (e & Vl) !== $a && Yp(!1), (e & zr) !== $a ? Mv() : (e & ur) !== $a && lo());
          }
          f = f.next;
        } while (f !== s);
      }
    }
    function Po(e, t) {
      var a = t.updateQueue, i = a !== null ? a.lastEffect : null;
      if (i !== null) {
        var u = i.next, s = u;
        do {
          if ((s.tag & e) === e) {
            (e & zr) !== $a ? Lv(t) : (e & ur) !== $a && Nv(t);
            var f = s.create;
            (e & Vl) !== $a && Yp(!0), s.destroy = f(), (e & Vl) !== $a && Yp(!1), (e & zr) !== $a ? Cd() : (e & ur) !== $a && zv();
            {
              var p = s.destroy;
              if (p !== void 0 && typeof p != "function") {
                var v = void 0;
                (s.tag & ur) !== De ? v = "useLayoutEffect" : (s.tag & Vl) !== De ? v = "useInsertionEffect" : v = "useEffect";
                var y = void 0;
                p === null ? y = " You returned null. If your effect does not require clean up, return undefined (or nothing)." : typeof p.then == "function" ? y = `

It looks like you wrote ` + v + `(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:

` + v + `(() => {
  async function fetchData() {
    // You can await here
    const response = await MyAPI.getData(someId);
    // ...
  }
  fetchData();
}, [someId]); // Or [] if effect doesn't need props or state

Learn more about data fetching with Hooks: https://reactjs.org/link/hooks-data-fetching` : y = " You returned: " + p, S("%s must not return anything besides a function, which is used for clean-up.%s", v, y);
              }
            }
          }
          s = s.next;
        } while (s !== u);
      }
    }
    function Ix(e, t) {
      if ((t.flags & Ke) !== De)
        switch (t.tag) {
          case ct: {
            var a = t.stateNode.passiveEffectDuration, i = t.memoizedProps, u = i.id, s = i.onPostCommit, f = rC(), p = t.alternate === null ? "mount" : "update";
            nC() && (p = "nested-update"), typeof s == "function" && s(u, p, a, f);
            var v = t.return;
            e:
              for (; v !== null; ) {
                switch (v.tag) {
                  case re:
                    var y = v.stateNode;
                    y.passiveEffectDuration += a;
                    break e;
                  case ct:
                    var g = v.stateNode;
                    g.passiveEffectDuration += a;
                    break e;
                }
                v = v.return;
              }
            break;
          }
        }
    }
    function Qx(e, t, a, i) {
      if ((a.flags & gr) !== De)
        switch (a.tag) {
          case he:
          case Qe:
          case He: {
            if (!Ar)
              if (a.mode & ze)
                try {
                  Il(), Po(ur | lr, a);
                } finally {
                  Yl(a);
                }
              else
                Po(ur | lr, a);
            break;
          }
          case pe: {
            var u = a.stateNode;
            if (a.flags & Ke && !Ar)
              if (t === null)
                if (a.type === a.elementType && !Ys && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Ye(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Ye(a) || "instance")), a.mode & ze)
                  try {
                    Il(), u.componentDidMount();
                  } finally {
                    Yl(a);
                  }
                else
                  u.componentDidMount();
              else {
                var s = a.elementType === a.type ? t.memoizedProps : Ki(a.type, t.memoizedProps), f = t.memoizedState;
                if (a.type === a.elementType && !Ys && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Ye(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Ye(a) || "instance")), a.mode & ze)
                  try {
                    Il(), u.componentDidUpdate(s, f, u.__reactInternalSnapshotBeforeUpdate);
                  } finally {
                    Yl(a);
                  }
                else
                  u.componentDidUpdate(s, f, u.__reactInternalSnapshotBeforeUpdate);
              }
            var p = a.updateQueue;
            p !== null && (a.type === a.elementType && !Ys && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Ye(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Ye(a) || "instance")), mE(a, p, u));
            break;
          }
          case re: {
            var v = a.updateQueue;
            if (v !== null) {
              var y = null;
              if (a.child !== null)
                switch (a.child.tag) {
                  case ie:
                    y = a.child.stateNode;
                    break;
                  case pe:
                    y = a.child.stateNode;
                    break;
                }
              mE(a, v, y);
            }
            break;
          }
          case ie: {
            var g = a.stateNode;
            if (t === null && a.flags & Ke) {
              var b = a.type, x = a.memoizedProps;
              fT(g, b, x);
            }
            break;
          }
          case Pe:
            break;
          case me:
            break;
          case ct: {
            {
              var M = a.memoizedProps, z = M.onCommit, H = M.onRender, fe = a.stateNode.effectDuration, Oe = rC(), Te = t === null ? "mount" : "update";
              nC() && (Te = "nested-update"), typeof H == "function" && H(a.memoizedProps.id, Te, a.actualDuration, a.treeBaseDuration, a.actualStartTime, Oe);
              {
                typeof z == "function" && z(a.memoizedProps.id, Te, fe, Oe), Y_(a);
                var St = a.return;
                e:
                  for (; St !== null; ) {
                    switch (St.tag) {
                      case re:
                        var pt = St.stateNode;
                        pt.effectDuration += fe;
                        break e;
                      case ct:
                        var k = St.stateNode;
                        k.effectDuration += fe;
                        break e;
                    }
                    St = St.return;
                  }
              }
            }
            break;
          }
          case _e: {
            e_(e, a);
            break;
          }
          case bt:
          case _n:
          case Cn:
          case Ue:
          case qe:
          case Rt:
            break;
          default:
            throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
        }
      Ar || a.flags & Kr && AC(a);
    }
    function Wx(e) {
      switch (e.tag) {
        case he:
        case Qe:
        case He: {
          if (e.mode & ze)
            try {
              Il(), NC(e, e.return);
            } finally {
              Yl(e);
            }
          else
            NC(e, e.return);
          break;
        }
        case pe: {
          var t = e.stateNode;
          typeof t.componentDidMount == "function" && Px(e, e.return, t), zC(e, e.return);
          break;
        }
        case ie: {
          zC(e, e.return);
          break;
        }
      }
    }
    function Gx(e, t) {
      for (var a = null, i = e; ; ) {
        if (i.tag === ie) {
          if (a === null) {
            a = i;
            try {
              var u = i.stateNode;
              t ? CT(u) : TT(i.stateNode, i.memoizedProps);
            } catch (f) {
              on(e, e.return, f);
            }
          }
        } else if (i.tag === Pe) {
          if (a === null)
            try {
              var s = i.stateNode;
              t ? RT(s) : wT(s, i.memoizedProps);
            } catch (f) {
              on(e, e.return, f);
            }
        } else if (!((i.tag === Ue || i.tag === qe) && i.memoizedState !== null && i !== e)) {
          if (i.child !== null) {
            i.child.return = i, i = i.child;
            continue;
          }
        }
        if (i === e)
          return;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === e)
            return;
          a === i && (a = null), i = i.return;
        }
        a === i && (a = null), i.sibling.return = i.return, i = i.sibling;
      }
    }
    function AC(e) {
      var t = e.ref;
      if (t !== null) {
        var a = e.stateNode, i;
        switch (e.tag) {
          case ie:
            i = a;
            break;
          default:
            i = a;
        }
        if (typeof t == "function") {
          var u;
          if (e.mode & ze)
            try {
              Il(), u = t(i);
            } finally {
              Yl(e);
            }
          else
            u = t(i);
          typeof u == "function" && S("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", Ye(e));
        } else
          t.hasOwnProperty("current") || S("Unexpected ref object provided for %s. Use either a ref-setter function or React.createRef().", Ye(e)), t.current = i;
      }
    }
    function qx(e) {
      var t = e.alternate;
      t !== null && (t.return = null), e.return = null;
    }
    function FC(e) {
      var t = e.alternate;
      t !== null && (e.alternate = null, FC(t));
      {
        if (e.child = null, e.deletions = null, e.sibling = null, e.tag === ie) {
          var a = e.stateNode;
          a !== null && nw(a);
        }
        e.stateNode = null, e._debugOwner = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
      }
    }
    function Xx(e) {
      for (var t = e.return; t !== null; ) {
        if (HC(t))
          return t;
        t = t.return;
      }
      throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
    }
    function HC(e) {
      return e.tag === ie || e.tag === re || e.tag === me;
    }
    function jC(e) {
      var t = e;
      e:
        for (; ; ) {
          for (; t.sibling === null; ) {
            if (t.return === null || HC(t.return))
              return null;
            t = t.return;
          }
          for (t.sibling.return = t.return, t = t.sibling; t.tag !== ie && t.tag !== Pe && t.tag !== Qt; ) {
            if (t.flags & rn || t.child === null || t.tag === me)
              continue e;
            t.child.return = t, t = t.child;
          }
          if (!(t.flags & rn))
            return t.stateNode;
        }
    }
    function Kx(e) {
      var t = Xx(e);
      switch (t.tag) {
        case ie: {
          var a = t.stateNode;
          t.flags & jt && (P0(a), t.flags &= ~jt);
          var i = jC(e);
          _S(e, i, a);
          break;
        }
        case re:
        case me: {
          var u = t.stateNode.containerInfo, s = jC(e);
          xS(e, s, u);
          break;
        }
        default:
          throw new Error("Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.");
      }
    }
    function xS(e, t, a) {
      var i = e.tag, u = i === ie || i === Pe;
      if (u) {
        var s = e.stateNode;
        t ? yT(a, s, t) : hT(a, s);
      } else if (i !== me) {
        var f = e.child;
        if (f !== null) {
          xS(f, t, a);
          for (var p = f.sibling; p !== null; )
            xS(p, t, a), p = p.sibling;
        }
      }
    }
    function _S(e, t, a) {
      var i = e.tag, u = i === ie || i === Pe;
      if (u) {
        var s = e.stateNode;
        t ? mT(a, s, t) : vT(a, s);
      } else if (i !== me) {
        var f = e.child;
        if (f !== null) {
          _S(f, t, a);
          for (var p = f.sibling; p !== null; )
            _S(p, t, a), p = p.sibling;
        }
      }
    }
    var Fr = null, nl = !1;
    function Zx(e, t, a) {
      {
        var i = t;
        e:
          for (; i !== null; ) {
            switch (i.tag) {
              case ie: {
                Fr = i.stateNode, nl = !1;
                break e;
              }
              case re: {
                Fr = i.stateNode.containerInfo, nl = !0;
                break e;
              }
              case me: {
                Fr = i.stateNode.containerInfo, nl = !0;
                break e;
              }
            }
            i = i.return;
          }
        if (Fr === null)
          throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
        PC(e, t, a), Fr = null, nl = !1;
      }
      qx(a);
    }
    function Vo(e, t, a) {
      for (var i = a.child; i !== null; )
        PC(e, t, i), i = i.sibling;
    }
    function PC(e, t, a) {
      switch (Sd(a), a.tag) {
        case ie:
          Ar || Mf(a, t);
        case Pe: {
          {
            var i = Fr, u = nl;
            Fr = null, Vo(e, t, a), Fr = i, nl = u, Fr !== null && (nl ? ST(Fr, a.stateNode) : gT(Fr, a.stateNode));
          }
          return;
        }
        case Qt: {
          Fr !== null && (nl ? ET(Fr, a.stateNode) : Fy(Fr, a.stateNode));
          return;
        }
        case me: {
          {
            var s = Fr, f = nl;
            Fr = a.stateNode.containerInfo, nl = !0, Vo(e, t, a), Fr = s, nl = f;
          }
          return;
        }
        case he:
        case Qe:
        case it:
        case He: {
          if (!Ar) {
            var p = a.updateQueue;
            if (p !== null) {
              var v = p.lastEffect;
              if (v !== null) {
                var y = v.next, g = y;
                do {
                  var b = g, x = b.destroy, M = b.tag;
                  x !== void 0 && ((M & Vl) !== $a ? Em(a, t, x) : (M & ur) !== $a && (Cc(a), a.mode & ze ? (Il(), Em(a, t, x), Yl(a)) : Em(a, t, x), lo())), g = g.next;
                } while (g !== y);
              }
            }
          }
          Vo(e, t, a);
          return;
        }
        case pe: {
          if (!Ar) {
            Mf(a, t);
            var z = a.stateNode;
            typeof z.componentWillUnmount == "function" && wS(a, t, z);
          }
          Vo(e, t, a);
          return;
        }
        case Cn: {
          Vo(e, t, a);
          return;
        }
        case Ue: {
          if (a.mode & ot) {
            var H = Ar;
            Ar = H || a.memoizedState !== null, Vo(e, t, a), Ar = H;
          } else
            Vo(e, t, a);
          break;
        }
        default: {
          Vo(e, t, a);
          return;
        }
      }
    }
    function Jx(e) {
      e.memoizedState;
    }
    function e_(e, t) {
      var a = t.memoizedState;
      if (a === null) {
        var i = t.alternate;
        if (i !== null) {
          var u = i.memoizedState;
          if (u !== null) {
            var s = u.dehydrated;
            s !== null && jT(s);
          }
        }
      }
    }
    function VC(e) {
      var t = e.updateQueue;
      if (t !== null) {
        e.updateQueue = null;
        var a = e.stateNode;
        a === null && (a = e.stateNode = new Fx()), t.forEach(function(i) {
          var u = K_.bind(null, e, i);
          if (!a.has(i)) {
            if (a.add(i), ar)
              if (Of !== null && Lf !== null)
                $p(Lf, Of);
              else
                throw Error("Expected finished root and lanes to be set. This is a bug in React.");
            i.then(u, u);
          }
        });
      }
    }
    function t_(e, t, a) {
      Of = a, Lf = e, Ht(t), BC(t, e), Ht(t), Of = null, Lf = null;
    }
    function rl(e, t, a) {
      var i = t.deletions;
      if (i !== null)
        for (var u = 0; u < i.length; u++) {
          var s = i[u];
          try {
            Zx(e, t, s);
          } catch (v) {
            on(s, t, v);
          }
        }
      var f = Zs();
      if (t.subtreeFlags & ea)
        for (var p = t.child; p !== null; )
          Ht(p), BC(p, e), p = p.sibling;
      Ht(f);
    }
    function BC(e, t, a) {
      var i = e.alternate, u = e.flags;
      switch (e.tag) {
        case he:
        case Qe:
        case it:
        case He: {
          if (rl(t, e), Ql(e), u & Ke) {
            try {
              tl(Vl | lr, e, e.return), Po(Vl | lr, e);
            } catch (je) {
              on(e, e.return, je);
            }
            if (e.mode & ze) {
              try {
                Il(), tl(ur | lr, e, e.return);
              } catch (je) {
                on(e, e.return, je);
              }
              Yl(e);
            } else
              try {
                tl(ur | lr, e, e.return);
              } catch (je) {
                on(e, e.return, je);
              }
          }
          return;
        }
        case pe: {
          rl(t, e), Ql(e), u & Kr && i !== null && Mf(i, i.return);
          return;
        }
        case ie: {
          rl(t, e), Ql(e), u & Kr && i !== null && Mf(i, i.return);
          {
            if (e.flags & jt) {
              var s = e.stateNode;
              try {
                P0(s);
              } catch (je) {
                on(e, e.return, je);
              }
            }
            if (u & Ke) {
              var f = e.stateNode;
              if (f != null) {
                var p = e.memoizedProps, v = i !== null ? i.memoizedProps : p, y = e.type, g = e.updateQueue;
                if (e.updateQueue = null, g !== null)
                  try {
                    dT(f, g, y, v, p, e);
                  } catch (je) {
                    on(e, e.return, je);
                  }
              }
            }
          }
          return;
        }
        case Pe: {
          if (rl(t, e), Ql(e), u & Ke) {
            if (e.stateNode === null)
              throw new Error("This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.");
            var b = e.stateNode, x = e.memoizedProps, M = i !== null ? i.memoizedProps : x;
            try {
              pT(b, M, x);
            } catch (je) {
              on(e, e.return, je);
            }
          }
          return;
        }
        case re: {
          if (rl(t, e), Ql(e), u & Ke && i !== null) {
            var z = i.memoizedState;
            if (z.isDehydrated)
              try {
                HT(t.containerInfo);
              } catch (je) {
                on(e, e.return, je);
              }
          }
          return;
        }
        case me: {
          rl(t, e), Ql(e);
          return;
        }
        case _e: {
          rl(t, e), Ql(e);
          var H = e.child;
          if (H.flags & Tl) {
            var fe = H.stateNode, Oe = H.memoizedState, Te = Oe !== null;
            if (fe.isHidden = Te, Te) {
              var St = H.alternate !== null && H.alternate.memoizedState !== null;
              St || A_();
            }
          }
          if (u & Ke) {
            try {
              Jx(e);
            } catch (je) {
              on(e, e.return, je);
            }
            VC(e);
          }
          return;
        }
        case Ue: {
          var pt = i !== null && i.memoizedState !== null;
          if (e.mode & ot) {
            var k = Ar;
            Ar = k || pt, rl(t, e), Ar = k;
          } else
            rl(t, e);
          if (Ql(e), u & Tl) {
            var j = e.stateNode, O = e.memoizedState, G = O !== null, de = e;
            if (j.isHidden = G, G && !pt && (de.mode & ot) !== Me) {
              Ee = de;
              for (var ue = de.child; ue !== null; )
                Ee = ue, r_(ue), ue = ue.sibling;
            }
            Gx(de, G);
          }
          return;
        }
        case bt: {
          rl(t, e), Ql(e), u & Ke && VC(e);
          return;
        }
        case Cn:
          return;
        default: {
          rl(t, e), Ql(e);
          return;
        }
      }
    }
    function Ql(e) {
      var t = e.flags;
      if (t & rn) {
        try {
          Kx(e);
        } catch (a) {
          on(e, e.return, a);
        }
        e.flags &= ~rn;
      }
      t & Ma && (e.flags &= ~Ma);
    }
    function n_(e, t, a) {
      Of = a, Lf = t, Ee = e, $C(e, t, a), Of = null, Lf = null;
    }
    function $C(e, t, a) {
      for (var i = (e.mode & ot) !== Me; Ee !== null; ) {
        var u = Ee, s = u.child;
        if (u.tag === Ue && i) {
          var f = u.memoizedState !== null, p = f || Sm;
          if (p) {
            bS(e, t, a);
            continue;
          } else {
            var v = u.alternate, y = v !== null && v.memoizedState !== null, g = y || Ar, b = Sm, x = Ar;
            Sm = p, Ar = g, Ar && !x && (Ee = u, a_(u));
            for (var M = s; M !== null; )
              Ee = M, $C(
                M,
                t,
                a
              ), M = M.sibling;
            Ee = u, Sm = b, Ar = x, bS(e, t, a);
            continue;
          }
        }
        (u.subtreeFlags & gr) !== De && s !== null ? (s.return = u, Ee = s) : bS(e, t, a);
      }
    }
    function bS(e, t, a) {
      for (; Ee !== null; ) {
        var i = Ee;
        if ((i.flags & gr) !== De) {
          var u = i.alternate;
          Ht(i);
          try {
            Qx(t, u, i, a);
          } catch (f) {
            on(i, i.return, f);
          }
          Rn();
        }
        if (i === e) {
          Ee = null;
          return;
        }
        var s = i.sibling;
        if (s !== null) {
          s.return = i.return, Ee = s;
          return;
        }
        Ee = i.return;
      }
    }
    function r_(e) {
      for (; Ee !== null; ) {
        var t = Ee, a = t.child;
        switch (t.tag) {
          case he:
          case Qe:
          case it:
          case He: {
            if (t.mode & ze)
              try {
                Il(), tl(ur, t, t.return);
              } finally {
                Yl(t);
              }
            else
              tl(ur, t, t.return);
            break;
          }
          case pe: {
            Mf(t, t.return);
            var i = t.stateNode;
            typeof i.componentWillUnmount == "function" && wS(t, t.return, i);
            break;
          }
          case ie: {
            Mf(t, t.return);
            break;
          }
          case Ue: {
            var u = t.memoizedState !== null;
            if (u) {
              YC(e);
              continue;
            }
            break;
          }
        }
        a !== null ? (a.return = t, Ee = a) : YC(e);
      }
    }
    function YC(e) {
      for (; Ee !== null; ) {
        var t = Ee;
        if (t === e) {
          Ee = null;
          return;
        }
        var a = t.sibling;
        if (a !== null) {
          a.return = t.return, Ee = a;
          return;
        }
        Ee = t.return;
      }
    }
    function a_(e) {
      for (; Ee !== null; ) {
        var t = Ee, a = t.child;
        if (t.tag === Ue) {
          var i = t.memoizedState !== null;
          if (i) {
            IC(e);
            continue;
          }
        }
        a !== null ? (a.return = t, Ee = a) : IC(e);
      }
    }
    function IC(e) {
      for (; Ee !== null; ) {
        var t = Ee;
        Ht(t);
        try {
          Wx(t);
        } catch (i) {
          on(t, t.return, i);
        }
        if (Rn(), t === e) {
          Ee = null;
          return;
        }
        var a = t.sibling;
        if (a !== null) {
          a.return = t.return, Ee = a;
          return;
        }
        Ee = t.return;
      }
    }
    function i_(e, t, a, i) {
      Ee = t, l_(t, e, a, i);
    }
    function l_(e, t, a, i) {
      for (; Ee !== null; ) {
        var u = Ee, s = u.child;
        (u.subtreeFlags & Na) !== De && s !== null ? (s.return = u, Ee = s) : u_(e, t, a, i);
      }
    }
    function u_(e, t, a, i) {
      for (; Ee !== null; ) {
        var u = Ee;
        if ((u.flags & sn) !== De) {
          Ht(u);
          try {
            o_(t, u, a, i);
          } catch (f) {
            on(u, u.return, f);
          }
          Rn();
        }
        if (u === e) {
          Ee = null;
          return;
        }
        var s = u.sibling;
        if (s !== null) {
          s.return = u.return, Ee = s;
          return;
        }
        Ee = u.return;
      }
    }
    function o_(e, t, a, i) {
      switch (t.tag) {
        case he:
        case Qe:
        case He: {
          if (t.mode & ze) {
            aS();
            try {
              Po(zr | lr, t);
            } finally {
              rS(t);
            }
          } else
            Po(zr | lr, t);
          break;
        }
      }
    }
    function s_(e) {
      Ee = e, c_();
    }
    function c_() {
      for (; Ee !== null; ) {
        var e = Ee, t = e.child;
        if ((Ee.flags & Mt) !== De) {
          var a = e.deletions;
          if (a !== null) {
            for (var i = 0; i < a.length; i++) {
              var u = a[i];
              Ee = u, p_(u, e);
            }
            {
              var s = e.alternate;
              if (s !== null) {
                var f = s.child;
                if (f !== null) {
                  s.child = null;
                  do {
                    var p = f.sibling;
                    f.sibling = null, f = p;
                  } while (f !== null);
                }
              }
            }
            Ee = e;
          }
        }
        (e.subtreeFlags & Na) !== De && t !== null ? (t.return = e, Ee = t) : f_();
      }
    }
    function f_() {
      for (; Ee !== null; ) {
        var e = Ee;
        (e.flags & sn) !== De && (Ht(e), d_(e), Rn());
        var t = e.sibling;
        if (t !== null) {
          t.return = e.return, Ee = t;
          return;
        }
        Ee = e.return;
      }
    }
    function d_(e) {
      switch (e.tag) {
        case he:
        case Qe:
        case He: {
          e.mode & ze ? (aS(), tl(zr | lr, e, e.return), rS(e)) : tl(zr | lr, e, e.return);
          break;
        }
      }
    }
    function p_(e, t) {
      for (; Ee !== null; ) {
        var a = Ee;
        Ht(a), h_(a, t), Rn();
        var i = a.child;
        i !== null ? (i.return = a, Ee = i) : v_(e);
      }
    }
    function v_(e) {
      for (; Ee !== null; ) {
        var t = Ee, a = t.sibling, i = t.return;
        if (FC(t), t === e) {
          Ee = null;
          return;
        }
        if (a !== null) {
          a.return = i, Ee = a;
          return;
        }
        Ee = i;
      }
    }
    function h_(e, t) {
      switch (e.tag) {
        case he:
        case Qe:
        case He: {
          e.mode & ze ? (aS(), tl(zr, e, t), rS(e)) : tl(zr, e, t);
          break;
        }
      }
    }
    function m_(e) {
      switch (e.tag) {
        case he:
        case Qe:
        case He: {
          try {
            Po(ur | lr, e);
          } catch (a) {
            on(e, e.return, a);
          }
          break;
        }
        case pe: {
          var t = e.stateNode;
          try {
            t.componentDidMount();
          } catch (a) {
            on(e, e.return, a);
          }
          break;
        }
      }
    }
    function y_(e) {
      switch (e.tag) {
        case he:
        case Qe:
        case He: {
          try {
            Po(zr | lr, e);
          } catch (t) {
            on(e, e.return, t);
          }
          break;
        }
      }
    }
    function g_(e) {
      switch (e.tag) {
        case he:
        case Qe:
        case He: {
          try {
            tl(ur | lr, e, e.return);
          } catch (a) {
            on(e, e.return, a);
          }
          break;
        }
        case pe: {
          var t = e.stateNode;
          typeof t.componentWillUnmount == "function" && wS(e, e.return, t);
          break;
        }
      }
    }
    function S_(e) {
      switch (e.tag) {
        case he:
        case Qe:
        case He:
          try {
            tl(zr | lr, e, e.return);
          } catch (t) {
            on(e, e.return, t);
          }
      }
    }
    if (typeof Symbol == "function" && Symbol.for) {
      var Mp = Symbol.for;
      Mp("selector.component"), Mp("selector.has_pseudo_class"), Mp("selector.role"), Mp("selector.test_id"), Mp("selector.text");
    }
    var E_ = [];
    function C_() {
      E_.forEach(function(e) {
        return e();
      });
    }
    var R_ = A.ReactCurrentActQueue;
    function T_(e) {
      {
        var t = typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0, a = typeof jest < "u";
        return a && t !== !1;
      }
    }
    function QC() {
      {
        var e = typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0;
        return !e && R_.current !== null && S("The current testing environment is not configured to support act(...)"), e;
      }
    }
    var w_ = Math.ceil, DS = A.ReactCurrentDispatcher, kS = A.ReactCurrentOwner, Hr = A.ReactCurrentBatchConfig, al = A.ReactCurrentActQueue, cr = 0, WC = 1, jr = 2, bi = 4, zu = 0, Np = 1, Is = 2, Cm = 3, zp = 4, GC = 5, OS = 6, gt = cr, Ra = null, Ln = null, fr = P, Wl = P, LS = Lo(P), dr = zu, Up = null, Rm = P, Ap = P, Tm = P, Fp = null, Ya = null, MS = 0, qC = 500, XC = 1 / 0, x_ = 500, Uu = null;
    function Hp() {
      XC = yn() + x_;
    }
    function KC() {
      return XC;
    }
    var wm = !1, NS = null, Nf = null, Qs = !1, Bo = null, jp = P, zS = [], US = null, b_ = 50, Pp = 0, AS = null, FS = !1, xm = !1, D_ = 50, zf = 0, _m = null, Vp = Zt, bm = P, ZC = !1;
    function Dm() {
      return Ra;
    }
    function Ta() {
      return (gt & (jr | bi)) !== cr ? yn() : (Vp !== Zt || (Vp = yn()), Vp);
    }
    function $o(e) {
      var t = e.mode;
      if ((t & ot) === Me)
        return Ae;
      if ((gt & jr) !== cr && fr !== P)
        return Pn(fr);
      var a = Tw() !== Rw;
      if (a) {
        if (Hr.transition !== null) {
          var i = Hr.transition;
          i._updatedFibers || (i._updatedFibers = /* @__PURE__ */ new Set()), i._updatedFibers.add(e);
        }
        return bm === yt && (bm = bd()), bm;
      }
      var u = Fa();
      if (u !== yt)
        return u;
      var s = uT();
      return s;
    }
    function k_(e) {
      var t = e.mode;
      return (t & ot) === Me ? Ae : ay();
    }
    function pr(e, t, a, i) {
      J_(), ZC && S("useInsertionEffect must not schedule updates."), FS && (xm = !0), yu(e, a, i), (gt & jr) !== P && e === Ra ? nb(t) : (ar && Md(e, t, a), rb(t), e === Ra && ((gt & jr) === cr && (Ap = Ze(Ap, a)), dr === zp && Yo(e, fr)), Ia(e, i), a === Ae && gt === cr && (t.mode & ot) === Me && !al.isBatchingLegacy && (Hp(), K0()));
    }
    function O_(e, t, a) {
      var i = e.current;
      i.lanes = t, yu(e, t, a), Ia(e, a);
    }
    function L_(e) {
      return (gt & jr) !== cr;
    }
    function Ia(e, t) {
      var a = e.callbackNode;
      ty(e, t);
      var i = ys(e, e === Ra ? fr : P);
      if (i === P) {
        a !== null && v1(a), e.callbackNode = null, e.callbackPriority = yt;
        return;
      }
      var u = zn(i), s = e.callbackPriority;
      if (s === u && !(al.current !== null && a !== YS)) {
        a == null && s !== Ae && S("Expected scheduled callback to exist. This error is likely caused by a bug in React. Please file an issue.");
        return;
      }
      a != null && v1(a);
      var f;
      if (u === Ae)
        e.tag === Mo ? (al.isBatchingLegacy !== null && (al.didScheduleLegacyUpdate = !0), iw(t1.bind(null, e))) : X0(t1.bind(null, e)), al.current !== null ? al.current.push(No) : sT(function() {
          (gt & (jr | bi)) === cr && No();
        }), f = null;
      else {
        var p;
        switch (Rs(i)) {
          case Sr:
            p = yc;
            break;
          case ir:
            p = ga;
            break;
          case $i:
            p = yi;
            break;
          case Es:
            p = xl;
            break;
          default:
            p = yi;
            break;
        }
        f = IS(p, JC.bind(null, e));
      }
      e.callbackPriority = u, e.callbackNode = f;
    }
    function JC(e, t) {
      if (Zw(), Vp = Zt, bm = P, (gt & (jr | bi)) !== cr)
        throw new Error("Should not already be working.");
      var a = e.callbackNode, i = Fu();
      if (i && e.callbackNode !== a)
        return null;
      var u = ys(e, e === Ra ? fr : P);
      if (u === P)
        return null;
      var s = !Ss(e, u) && !Pv(e, u) && !t, f = s ? V_(e, u) : Om(e, u);
      if (f !== zu) {
        if (f === Is) {
          var p = xd(e);
          p !== P && (u = p, f = HS(e, p));
        }
        if (f === Np) {
          var v = Up;
          throw Ws(e, P), Yo(e, u), Ia(e, yn()), v;
        }
        if (f === OS)
          Yo(e, u);
        else {
          var y = !Ss(e, u), g = e.current.alternate;
          if (y && !N_(g)) {
            if (f = Om(e, u), f === Is) {
              var b = xd(e);
              b !== P && (u = b, f = HS(e, b));
            }
            if (f === Np) {
              var x = Up;
              throw Ws(e, P), Yo(e, u), Ia(e, yn()), x;
            }
          }
          e.finishedWork = g, e.finishedLanes = u, M_(e, f, u);
        }
      }
      return Ia(e, yn()), e.callbackNode === a ? JC.bind(null, e) : null;
    }
    function HS(e, t) {
      var a = Fp;
      if (Bn(e)) {
        var i = Ws(e, t);
        i.flags |= Tn, ZT(e.containerInfo);
      }
      var u = Om(e, t);
      if (u !== Is) {
        var s = Ya;
        Ya = a, s !== null && e1(s);
      }
      return u;
    }
    function e1(e) {
      Ya === null ? Ya = e : Ya.push.apply(Ya, e);
    }
    function M_(e, t, a) {
      switch (t) {
        case zu:
        case Np:
          throw new Error("Root did not complete. This is a bug in React.");
        case Is: {
          Gs(e, Ya, Uu);
          break;
        }
        case Cm: {
          if (Yo(e, a), Vc(a) && !h1()) {
            var i = MS + qC - yn();
            if (i > 10) {
              var u = ys(e, P);
              if (u !== P)
                break;
              var s = e.suspendedLanes;
              if (!mu(s, a)) {
                Ta(), Od(e, s);
                break;
              }
              e.timeoutHandle = Uy(Gs.bind(null, e, Ya, Uu), i);
              break;
            }
          }
          Gs(e, Ya, Uu);
          break;
        }
        case zp: {
          if (Yo(e, a), jv(a))
            break;
          if (!h1()) {
            var f = Hv(e, a), p = f, v = yn() - p, y = Z_(v) - v;
            if (y > 10) {
              e.timeoutHandle = Uy(Gs.bind(null, e, Ya, Uu), y);
              break;
            }
          }
          Gs(e, Ya, Uu);
          break;
        }
        case GC: {
          Gs(e, Ya, Uu);
          break;
        }
        default:
          throw new Error("Unknown root exit status.");
      }
    }
    function N_(e) {
      for (var t = e; ; ) {
        if (t.flags & cs) {
          var a = t.updateQueue;
          if (a !== null) {
            var i = a.stores;
            if (i !== null)
              for (var u = 0; u < i.length; u++) {
                var s = i[u], f = s.getSnapshot, p = s.value;
                try {
                  if (!Se(f(), p))
                    return !1;
                } catch {
                  return !1;
                }
              }
          }
        }
        var v = t.child;
        if (t.subtreeFlags & cs && v !== null) {
          v.return = t, t = v;
          continue;
        }
        if (t === e)
          return !0;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
            return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return !0;
    }
    function Yo(e, t) {
      t = vo(t, Tm), t = vo(t, Ap), kd(e, t);
    }
    function t1(e) {
      if (Jw(), (gt & (jr | bi)) !== cr)
        throw new Error("Should not already be working.");
      Fu();
      var t = ys(e, P);
      if (!aa(t, Ae))
        return Ia(e, yn()), null;
      var a = Om(e, t);
      if (e.tag !== Mo && a === Is) {
        var i = xd(e);
        i !== P && (t = i, a = HS(e, i));
      }
      if (a === Np) {
        var u = Up;
        throw Ws(e, P), Yo(e, t), Ia(e, yn()), u;
      }
      if (a === OS)
        throw new Error("Root did not complete. This is a bug in React.");
      var s = e.current.alternate;
      return e.finishedWork = s, e.finishedLanes = t, Gs(e, Ya, Uu), Ia(e, yn()), null;
    }
    function z_(e, t) {
      t !== P && (ho(e, Ze(t, Ae)), Ia(e, yn()), (gt & (jr | bi)) === cr && (Hp(), No()));
    }
    function jS(e, t) {
      var a = gt;
      gt |= WC;
      try {
        return e(t);
      } finally {
        gt = a, gt === cr && !al.isBatchingLegacy && (Hp(), K0());
      }
    }
    function U_(e, t, a, i, u) {
      var s = Fa(), f = Hr.transition;
      try {
        return Hr.transition = null, Vn(Sr), e(t, a, i, u);
      } finally {
        Vn(s), Hr.transition = f, gt === cr && Hp();
      }
    }
    function Au(e) {
      Bo !== null && Bo.tag === Mo && (gt & (jr | bi)) === cr && Fu();
      var t = gt;
      gt |= WC;
      var a = Hr.transition, i = Fa();
      try {
        return Hr.transition = null, Vn(Sr), e ? e() : void 0;
      } finally {
        Vn(i), Hr.transition = a, gt = t, (gt & (jr | bi)) === cr && No();
      }
    }
    function n1() {
      return (gt & (jr | bi)) !== cr;
    }
    function km(e, t) {
      la(LS, Wl, e), Wl = Ze(Wl, t);
    }
    function PS(e) {
      Wl = LS.current, ia(LS, e);
    }
    function Ws(e, t) {
      e.finishedWork = null, e.finishedLanes = P;
      var a = e.timeoutHandle;
      if (a !== Ay && (e.timeoutHandle = Ay, oT(a)), Ln !== null)
        for (var i = Ln.return; i !== null; ) {
          var u = i.alternate;
          LC(u, i), i = i.return;
        }
      Ra = e;
      var s = qs(e.current, null);
      return Ln = s, fr = Wl = t, dr = zu, Up = null, Rm = P, Ap = P, Tm = P, Fp = null, Ya = null, bw(), Xi.discardPendingWarnings(), s;
    }
    function r1(e, t) {
      do {
        var a = Ln;
        try {
          if (Fh(), NE(), Rn(), kS.current = null, a === null || a.return === null) {
            dr = Np, Up = t, Ln = null;
            return;
          }
          if (et && a.mode & ze && hm(a, !0), ht)
            if (uu(), t !== null && typeof t == "object" && typeof t.then == "function") {
              var i = t;
              Uv(a, i, fr);
            } else
              Rc(a, t, fr);
          ax(e, a.return, a, t, fr), u1(a);
        } catch (u) {
          t = u, Ln === a && a !== null ? (a = a.return, Ln = a) : a = Ln;
          continue;
        }
        return;
      } while (!0);
    }
    function a1() {
      var e = DS.current;
      return DS.current = cm, e === null ? cm : e;
    }
    function i1(e) {
      DS.current = e;
    }
    function A_() {
      MS = yn();
    }
    function Bp(e) {
      Rm = Ze(e, Rm);
    }
    function F_() {
      dr === zu && (dr = Cm);
    }
    function VS() {
      (dr === zu || dr === Cm || dr === Is) && (dr = zp), Ra !== null && (gs(Rm) || gs(Ap)) && Yo(Ra, fr);
    }
    function H_(e) {
      dr !== zp && (dr = Is), Fp === null ? Fp = [e] : Fp.push(e);
    }
    function j_() {
      return dr === zu;
    }
    function Om(e, t) {
      var a = gt;
      gt |= jr;
      var i = a1();
      if (Ra !== e || fr !== t) {
        if (ar) {
          var u = e.memoizedUpdaters;
          u.size > 0 && ($p(e, fr), u.clear()), Yc(e, t);
        }
        Uu = Nd(), Ws(e, t);
      }
      ni(t);
      do
        try {
          P_();
          break;
        } catch (s) {
          r1(e, s);
        }
      while (!0);
      if (Fh(), gt = a, i1(i), Ln !== null)
        throw new Error("Cannot commit an incomplete root. This error is likely caused by a bug in React. Please file an issue.");
      return oo(), Ra = null, fr = P, dr;
    }
    function P_() {
      for (; Ln !== null; )
        l1(Ln);
    }
    function V_(e, t) {
      var a = gt;
      gt |= jr;
      var i = a1();
      if (Ra !== e || fr !== t) {
        if (ar) {
          var u = e.memoizedUpdaters;
          u.size > 0 && ($p(e, fr), u.clear()), Yc(e, t);
        }
        Uu = Nd(), Hp(), Ws(e, t);
      }
      ni(t);
      do
        try {
          B_();
          break;
        } catch (s) {
          r1(e, s);
        }
      while (!0);
      return Fh(), i1(i), gt = a, Ln !== null ? (ps(), zu) : (oo(), Ra = null, fr = P, dr);
    }
    function B_() {
      for (; Ln !== null && !mc(); )
        l1(Ln);
    }
    function l1(e) {
      var t = e.alternate;
      Ht(e);
      var a;
      (e.mode & ze) !== Me ? (nS(e), a = BS(t, e, Wl), hm(e, !0)) : a = BS(t, e, Wl), Rn(), e.memoizedProps = e.pendingProps, a === null ? u1(e) : Ln = a, kS.current = null;
    }
    function u1(e) {
      var t = e;
      do {
        var a = t.alternate, i = t.return;
        if ((t.flags & ha) === De) {
          Ht(t);
          var u = void 0;
          if ((t.mode & ze) === Me ? u = OC(a, t, Wl) : (nS(t), u = OC(a, t, Wl), hm(t, !1)), Rn(), u !== null) {
            Ln = u;
            return;
          }
        } else {
          var s = Ax(a, t);
          if (s !== null) {
            s.flags &= _v, Ln = s;
            return;
          }
          if ((t.mode & ze) !== Me) {
            hm(t, !1);
            for (var f = t.actualDuration, p = t.child; p !== null; )
              f += p.actualDuration, p = p.sibling;
            t.actualDuration = f;
          }
          if (i !== null)
            i.flags |= ha, i.subtreeFlags = De, i.deletions = null;
          else {
            dr = OS, Ln = null;
            return;
          }
        }
        var v = t.sibling;
        if (v !== null) {
          Ln = v;
          return;
        }
        t = i, Ln = t;
      } while (t !== null);
      dr === zu && (dr = GC);
    }
    function Gs(e, t, a) {
      var i = Fa(), u = Hr.transition;
      try {
        Hr.transition = null, Vn(Sr), $_(e, t, a, i);
      } finally {
        Hr.transition = u, Vn(i);
      }
      return null;
    }
    function $_(e, t, a, i) {
      do
        Fu();
      while (Bo !== null);
      if (eb(), (gt & (jr | bi)) !== cr)
        throw new Error("Should not already be working.");
      var u = e.finishedWork, s = e.finishedLanes;
      if (Sc(s), u === null)
        return Ed(), null;
      if (s === P && S("root.finishedLanes should not be empty during a commit. This is a bug in React."), e.finishedWork = null, e.finishedLanes = P, u === e.current)
        throw new Error("Cannot commit the same tree as before. This error is likely caused by a bug in React. Please file an issue.");
      e.callbackNode = null, e.callbackPriority = yt;
      var f = Ze(u.lanes, u.childLanes);
      Ld(e, f), e === Ra && (Ra = null, Ln = null, fr = P), ((u.subtreeFlags & Na) !== De || (u.flags & Na) !== De) && (Qs || (Qs = !0, US = a, IS(yi, function() {
        return Fu(), null;
      })));
      var p = (u.subtreeFlags & (io | ea | gr | Na)) !== De, v = (u.flags & (io | ea | gr | Na)) !== De;
      if (p || v) {
        var y = Hr.transition;
        Hr.transition = null;
        var g = Fa();
        Vn(Sr);
        var b = gt;
        gt |= bi, kS.current = null, Vx(e, u), aC(), t_(e, u, s), tT(e.containerInfo), e.current = u, Av(s), n_(u, e, s), uo(), kv(), gt = b, Vn(g), Hr.transition = y;
      } else
        e.current = u, aC();
      var x = Qs;
      if (Qs ? (Qs = !1, Bo = e, jp = s) : (zf = 0, _m = null), f = e.pendingLanes, f === P && (Nf = null), x || f1(e.current, !1), Pi(u.stateNode, i), ar && e.memoizedUpdaters.clear(), C_(), Ia(e, yn()), t !== null)
        for (var M = e.onRecoverableError, z = 0; z < t.length; z++) {
          var H = t[z], fe = H.stack, Oe = H.digest;
          M(H.value, {
            componentStack: fe,
            digest: Oe
          });
        }
      if (wm) {
        wm = !1;
        var Te = NS;
        throw NS = null, Te;
      }
      return aa(jp, Ae) && e.tag !== Mo && Fu(), f = e.pendingLanes, aa(f, Ae) ? (Kw(), e === AS ? Pp++ : (Pp = 0, AS = e)) : Pp = 0, No(), Ed(), null;
    }
    function Fu() {
      if (Bo !== null) {
        var e = Rs(jp), t = ly($i, e), a = Hr.transition, i = Fa();
        try {
          return Hr.transition = null, Vn(t), I_();
        } finally {
          Vn(i), Hr.transition = a;
        }
      }
      return !1;
    }
    function Y_(e) {
      zS.push(e), Qs || (Qs = !0, IS(yi, function() {
        return Fu(), null;
      }));
    }
    function I_() {
      if (Bo === null)
        return !1;
      var e = US;
      US = null;
      var t = Bo, a = jp;
      if (Bo = null, jp = P, (gt & (jr | bi)) !== cr)
        throw new Error("Cannot flush passive effects while already rendering.");
      FS = !0, xm = !1, Fv(a);
      var i = gt;
      gt |= bi, s_(t.current), i_(t, t.current, a, e);
      {
        var u = zS;
        zS = [];
        for (var s = 0; s < u.length; s++) {
          var f = u[s];
          Ix(t, f);
        }
      }
      ds(), f1(t.current, !0), gt = i, No(), xm ? t === _m ? zf++ : (zf = 0, _m = t) : zf = 0, FS = !1, xm = !1, bl(t);
      {
        var p = t.current.stateNode;
        p.effectDuration = 0, p.passiveEffectDuration = 0;
      }
      return !0;
    }
    function o1(e) {
      return Nf !== null && Nf.has(e);
    }
    function Q_(e) {
      Nf === null ? Nf = /* @__PURE__ */ new Set([e]) : Nf.add(e);
    }
    function W_(e) {
      wm || (wm = !0, NS = e);
    }
    var G_ = W_;
    function s1(e, t, a) {
      var i = $s(a, t), u = lC(e, i, Ae), s = Uo(e, u, Ae), f = Ta();
      s !== null && (yu(s, Ae, f), Ia(s, f));
    }
    function on(e, t, a) {
      if (Hx(a), Yp(!1), e.tag === re) {
        s1(e, e, a);
        return;
      }
      var i = null;
      for (i = t; i !== null; ) {
        if (i.tag === re) {
          s1(i, e, a);
          return;
        } else if (i.tag === pe) {
          var u = i.type, s = i.stateNode;
          if (typeof u.getDerivedStateFromError == "function" || typeof s.componentDidCatch == "function" && !o1(s)) {
            var f = $s(a, e), p = oS(i, f, Ae), v = Uo(i, p, Ae), y = Ta();
            v !== null && (yu(v, Ae, y), Ia(v, y));
            return;
          }
        }
        i = i.return;
      }
      S(`Internal React error: Attempted to capture a commit phase error inside a detached tree. This indicates a bug in React. Likely causes include deleting the same fiber more than once, committing an already-finished tree, or an inconsistent return pointer.

Error message:

%s`, a);
    }
    function q_(e, t, a) {
      var i = e.pingCache;
      i !== null && i.delete(t);
      var u = Ta();
      Od(e, a), ab(e), Ra === e && mu(fr, a) && (dr === zp || dr === Cm && Vc(fr) && yn() - MS < qC ? Ws(e, P) : Tm = Ze(Tm, a)), Ia(e, u);
    }
    function c1(e, t) {
      t === yt && (t = k_(e));
      var a = Ta(), i = Ba(e, t);
      i !== null && (yu(i, t, a), Ia(i, a));
    }
    function X_(e) {
      var t = e.memoizedState, a = yt;
      t !== null && (a = t.retryLane), c1(e, a);
    }
    function K_(e, t) {
      var a = yt, i;
      switch (e.tag) {
        case _e:
          i = e.stateNode;
          var u = e.memoizedState;
          u !== null && (a = u.retryLane);
          break;
        case bt:
          i = e.stateNode;
          break;
        default:
          throw new Error("Pinged unknown suspense boundary type. This is probably a bug in React.");
      }
      i !== null && i.delete(t), c1(e, a);
    }
    function Z_(e) {
      return e < 120 ? 120 : e < 480 ? 480 : e < 1080 ? 1080 : e < 1920 ? 1920 : e < 3e3 ? 3e3 : e < 4320 ? 4320 : w_(e / 1960) * 1960;
    }
    function J_() {
      if (Pp > b_)
        throw Pp = 0, AS = null, new Error("Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.");
      zf > D_ && (zf = 0, _m = null, S("Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."));
    }
    function eb() {
      Xi.flushLegacyContextWarning(), Xi.flushPendingUnsafeLifecycleWarnings();
    }
    function f1(e, t) {
      Ht(e), Lm(e, Jr, g_), t && Lm(e, lu, S_), Lm(e, Jr, m_), t && Lm(e, lu, y_), Rn();
    }
    function Lm(e, t, a) {
      for (var i = e, u = null; i !== null; ) {
        var s = i.subtreeFlags & t;
        i !== u && i.child !== null && s !== De ? i = i.child : ((i.flags & t) !== De && a(i), i.sibling !== null ? i = i.sibling : i = u = i.return);
      }
    }
    var Mm = null;
    function d1(e) {
      {
        if ((gt & jr) !== cr || !(e.mode & ot))
          return;
        var t = e.tag;
        if (t !== rt && t !== re && t !== pe && t !== he && t !== Qe && t !== it && t !== He)
          return;
        var a = Ye(e) || "ReactComponent";
        if (Mm !== null) {
          if (Mm.has(a))
            return;
          Mm.add(a);
        } else
          Mm = /* @__PURE__ */ new Set([a]);
        var i = mn;
        try {
          Ht(e), S("Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously later calls tries to update the component. Move this work to useEffect instead.");
        } finally {
          i ? Ht(e) : Rn();
        }
      }
    }
    var BS;
    {
      var tb = null;
      BS = function(e, t, a) {
        var i = E1(tb, t);
        try {
          return xC(e, t, a);
        } catch (s) {
          if (pw() || s !== null && typeof s == "object" && typeof s.then == "function")
            throw s;
          if (Fh(), NE(), LC(e, t), E1(t, i), t.mode & ze && nS(t), iu(null, xC, null, e, t, a), Jm()) {
            var u = sd();
            typeof u == "object" && u !== null && u._suppressLogging && typeof s == "object" && s !== null && !s._suppressLogging && (s._suppressLogging = !0);
          }
          throw s;
        }
      };
    }
    var p1 = !1, $S;
    $S = /* @__PURE__ */ new Set();
    function nb(e) {
      if (Gr && !Gw())
        switch (e.tag) {
          case he:
          case Qe:
          case He: {
            var t = Ln && Ye(Ln) || "Unknown", a = t;
            if (!$S.has(a)) {
              $S.add(a);
              var i = Ye(e) || "Unknown";
              S("Cannot update a component (`%s`) while rendering a different component (`%s`). To locate the bad setState() call inside `%s`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render", i, t, t);
            }
            break;
          }
          case pe: {
            p1 || (S("Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state."), p1 = !0);
            break;
          }
        }
    }
    function $p(e, t) {
      if (ar) {
        var a = e.memoizedUpdaters;
        a.forEach(function(i) {
          Md(e, i, t);
        });
      }
    }
    var YS = {};
    function IS(e, t) {
      {
        var a = al.current;
        return a !== null ? (a.push(t), YS) : hc(e, t);
      }
    }
    function v1(e) {
      if (e !== YS)
        return Dv(e);
    }
    function h1() {
      return al.current !== null;
    }
    function rb(e) {
      {
        if (e.mode & ot) {
          if (!QC())
            return;
        } else if (!T_() || gt !== cr || e.tag !== he && e.tag !== Qe && e.tag !== He)
          return;
        if (al.current === null) {
          var t = mn;
          try {
            Ht(e), S(`An update to %s inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act`, Ye(e));
          } finally {
            t ? Ht(e) : Rn();
          }
        }
      }
    }
    function ab(e) {
      e.tag !== Mo && QC() && al.current === null && S(`A suspended resource finished loading inside a test, but the event was not wrapped in act(...).

When testing, code that resolves suspended data should be wrapped into act(...):

act(() => {
  /* finish loading suspended data */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act`);
    }
    function Yp(e) {
      ZC = e;
    }
    var Di = null, Uf = null, ib = function(e) {
      Di = e;
    };
    function Af(e) {
      {
        if (Di === null)
          return e;
        var t = Di(e);
        return t === void 0 ? e : t.current;
      }
    }
    function QS(e) {
      return Af(e);
    }
    function WS(e) {
      {
        if (Di === null)
          return e;
        var t = Di(e);
        if (t === void 0) {
          if (e != null && typeof e.render == "function") {
            var a = Af(e.render);
            if (e.render !== a) {
              var i = {
                $$typeof: ce,
                render: a
              };
              return e.displayName !== void 0 && (i.displayName = e.displayName), i;
            }
          }
          return e;
        }
        return t.current;
      }
    }
    function m1(e, t) {
      {
        if (Di === null)
          return !1;
        var a = e.elementType, i = t.type, u = !1, s = typeof i == "object" && i !== null ? i.$$typeof : null;
        switch (e.tag) {
          case pe: {
            typeof i == "function" && (u = !0);
            break;
          }
          case he: {
            (typeof i == "function" || s === ke) && (u = !0);
            break;
          }
          case Qe: {
            (s === ce || s === ke) && (u = !0);
            break;
          }
          case it:
          case He: {
            (s === Xe || s === ke) && (u = !0);
            break;
          }
          default:
            return !1;
        }
        if (u) {
          var f = Di(a);
          if (f !== void 0 && f === Di(i))
            return !0;
        }
        return !1;
      }
    }
    function y1(e) {
      {
        if (Di === null || typeof WeakSet != "function")
          return;
        Uf === null && (Uf = /* @__PURE__ */ new WeakSet()), Uf.add(e);
      }
    }
    var lb = function(e, t) {
      {
        if (Di === null)
          return;
        var a = t.staleFamilies, i = t.updatedFamilies;
        Fu(), Au(function() {
          GS(e.current, i, a);
        });
      }
    }, ub = function(e, t) {
      {
        if (e.context !== ai)
          return;
        Fu(), Au(function() {
          Ip(t, e, null, null);
        });
      }
    };
    function GS(e, t, a) {
      {
        var i = e.alternate, u = e.child, s = e.sibling, f = e.tag, p = e.type, v = null;
        switch (f) {
          case he:
          case He:
          case pe:
            v = p;
            break;
          case Qe:
            v = p.render;
            break;
        }
        if (Di === null)
          throw new Error("Expected resolveFamily to be set during hot reload.");
        var y = !1, g = !1;
        if (v !== null) {
          var b = Di(v);
          b !== void 0 && (a.has(b) ? g = !0 : t.has(b) && (f === pe ? g = !0 : y = !0));
        }
        if (Uf !== null && (Uf.has(e) || i !== null && Uf.has(i)) && (g = !0), g && (e._debugNeedsRemount = !0), g || y) {
          var x = Ba(e, Ae);
          x !== null && pr(x, e, Ae, Zt);
        }
        u !== null && !g && GS(u, t, a), s !== null && GS(s, t, a);
      }
    }
    var ob = function(e, t) {
      {
        var a = /* @__PURE__ */ new Set(), i = new Set(t.map(function(u) {
          return u.current;
        }));
        return qS(e.current, i, a), a;
      }
    };
    function qS(e, t, a) {
      {
        var i = e.child, u = e.sibling, s = e.tag, f = e.type, p = null;
        switch (s) {
          case he:
          case He:
          case pe:
            p = f;
            break;
          case Qe:
            p = f.render;
            break;
        }
        var v = !1;
        p !== null && t.has(p) && (v = !0), v ? sb(e, a) : i !== null && qS(i, t, a), u !== null && qS(u, t, a);
      }
    }
    function sb(e, t) {
      {
        var a = cb(e, t);
        if (a)
          return;
        for (var i = e; ; ) {
          switch (i.tag) {
            case ie:
              t.add(i.stateNode);
              return;
            case me:
              t.add(i.stateNode.containerInfo);
              return;
            case re:
              t.add(i.stateNode.containerInfo);
              return;
          }
          if (i.return === null)
            throw new Error("Expected to reach root first.");
          i = i.return;
        }
      }
    }
    function cb(e, t) {
      for (var a = e, i = !1; ; ) {
        if (a.tag === ie)
          i = !0, t.add(a.stateNode);
        else if (a.child !== null) {
          a.child.return = a, a = a.child;
          continue;
        }
        if (a === e)
          return i;
        for (; a.sibling === null; ) {
          if (a.return === null || a.return === e)
            return i;
          a = a.return;
        }
        a.sibling.return = a.return, a = a.sibling;
      }
      return !1;
    }
    var XS;
    {
      XS = !1;
      try {
        var g1 = Object.preventExtensions({});
      } catch {
        XS = !0;
      }
    }
    function fb(e, t, a, i) {
      this.tag = e, this.key = a, this.elementType = null, this.type = null, this.stateNode = null, this.return = null, this.child = null, this.sibling = null, this.index = 0, this.ref = null, this.pendingProps = t, this.memoizedProps = null, this.updateQueue = null, this.memoizedState = null, this.dependencies = null, this.mode = i, this.flags = De, this.subtreeFlags = De, this.deletions = null, this.lanes = P, this.childLanes = P, this.alternate = null, this.actualDuration = Number.NaN, this.actualStartTime = Number.NaN, this.selfBaseDuration = Number.NaN, this.treeBaseDuration = Number.NaN, this.actualDuration = 0, this.actualStartTime = -1, this.selfBaseDuration = 0, this.treeBaseDuration = 0, this._debugSource = null, this._debugOwner = null, this._debugNeedsRemount = !1, this._debugHookTypes = null, !XS && typeof Object.preventExtensions == "function" && Object.preventExtensions(this);
    }
    var ii = function(e, t, a, i) {
      return new fb(e, t, a, i);
    };
    function KS(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    function db(e) {
      return typeof e == "function" && !KS(e) && e.defaultProps === void 0;
    }
    function pb(e) {
      if (typeof e == "function")
        return KS(e) ? pe : he;
      if (e != null) {
        var t = e.$$typeof;
        if (t === ce)
          return Qe;
        if (t === Xe)
          return it;
      }
      return rt;
    }
    function qs(e, t) {
      var a = e.alternate;
      a === null ? (a = ii(e.tag, t, e.key, e.mode), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a._debugSource = e._debugSource, a._debugOwner = e._debugOwner, a._debugHookTypes = e._debugHookTypes, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = De, a.subtreeFlags = De, a.deletions = null, a.actualDuration = 0, a.actualStartTime = -1), a.flags = e.flags & rr, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue;
      var i = e.dependencies;
      switch (a.dependencies = i === null ? null : {
        lanes: i.lanes,
        firstContext: i.firstContext
      }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.selfBaseDuration = e.selfBaseDuration, a.treeBaseDuration = e.treeBaseDuration, a._debugNeedsRemount = e._debugNeedsRemount, a.tag) {
        case rt:
        case he:
        case He:
          a.type = Af(e.type);
          break;
        case pe:
          a.type = QS(e.type);
          break;
        case Qe:
          a.type = WS(e.type);
          break;
      }
      return a;
    }
    function vb(e, t) {
      e.flags &= rr | rn;
      var a = e.alternate;
      if (a === null)
        e.childLanes = P, e.lanes = t, e.child = null, e.subtreeFlags = De, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null, e.selfBaseDuration = 0, e.treeBaseDuration = 0;
      else {
        e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = De, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type;
        var i = a.dependencies;
        e.dependencies = i === null ? null : {
          lanes: i.lanes,
          firstContext: i.firstContext
        }, e.selfBaseDuration = a.selfBaseDuration, e.treeBaseDuration = a.treeBaseDuration;
      }
      return e;
    }
    function hb(e, t, a) {
      var i;
      return e === kh ? (i = ot, t === !0 && (i |= gn, i |= Ua)) : i = Me, ar && (i |= ze), ii(re, null, null, i);
    }
    function ZS(e, t, a, i, u, s) {
      var f = rt, p = e;
      if (typeof e == "function")
        KS(e) ? (f = pe, p = QS(p)) : p = Af(p);
      else if (typeof e == "string")
        f = ie;
      else {
        e:
          switch (e) {
            case va:
              return Io(a.children, u, s, t);
            case ci:
              f = st, u |= gn, (u & ot) !== Me && (u |= Ua);
              break;
            case R:
              return mb(a, u, s, t);
            case Ge:
              return yb(a, u, s, t);
            case mt:
              return gb(a, u, s, t);
            case en:
              return S1(a, u, s, t);
            case nr:
            case Mn:
            case fi:
            case Pu:
            case Jt:
            default: {
              if (typeof e == "object" && e !== null)
                switch (e.$$typeof) {
                  case Y:
                    f = at;
                    break e;
                  case ee:
                    f = dn;
                    break e;
                  case ce:
                    f = Qe, p = WS(p);
                    break e;
                  case Xe:
                    f = it;
                    break e;
                  case ke:
                    f = nn, p = null;
                    break e;
                }
              var v = "";
              {
                (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (v += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
                var y = i ? Ye(i) : null;
                y && (v += `

Check the render method of \`` + y + "`.");
              }
              throw new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (e == null ? e : typeof e) + "." + v));
            }
          }
      }
      var g = ii(f, a, t, u);
      return g.elementType = e, g.type = p, g.lanes = s, g._debugOwner = i, g;
    }
    function JS(e, t, a) {
      var i = null;
      i = e._owner;
      var u = e.type, s = e.key, f = e.props, p = ZS(u, s, f, i, t, a);
      return p._debugSource = e._source, p._debugOwner = e._owner, p;
    }
    function Io(e, t, a, i) {
      var u = ii(Ct, e, i, t);
      return u.lanes = a, u;
    }
    function mb(e, t, a, i) {
      typeof e.id != "string" && S('Profiler must specify an "id" of type `string` as a prop. Received the type `%s` instead.', typeof e.id);
      var u = ii(ct, e, i, t | ze);
      return u.elementType = R, u.lanes = a, u.stateNode = {
        effectDuration: 0,
        passiveEffectDuration: 0
      }, u;
    }
    function yb(e, t, a, i) {
      var u = ii(_e, e, i, t);
      return u.elementType = Ge, u.lanes = a, u;
    }
    function gb(e, t, a, i) {
      var u = ii(bt, e, i, t);
      return u.elementType = mt, u.lanes = a, u;
    }
    function S1(e, t, a, i) {
      var u = ii(Ue, e, i, t);
      u.elementType = en, u.lanes = a;
      var s = {
        isHidden: !1
      };
      return u.stateNode = s, u;
    }
    function e0(e, t, a) {
      var i = ii(Pe, e, null, t);
      return i.lanes = a, i;
    }
    function Sb() {
      var e = ii(ie, null, null, Me);
      return e.elementType = "DELETED", e;
    }
    function Eb(e) {
      var t = ii(Qt, null, null, Me);
      return t.stateNode = e, t;
    }
    function t0(e, t, a) {
      var i = e.children !== null ? e.children : [], u = ii(me, i, e.key, t);
      return u.lanes = a, u.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation
      }, u;
    }
    function E1(e, t) {
      return e === null && (e = ii(rt, null, null, Me)), e.tag = t.tag, e.key = t.key, e.elementType = t.elementType, e.type = t.type, e.stateNode = t.stateNode, e.return = t.return, e.child = t.child, e.sibling = t.sibling, e.index = t.index, e.ref = t.ref, e.pendingProps = t.pendingProps, e.memoizedProps = t.memoizedProps, e.updateQueue = t.updateQueue, e.memoizedState = t.memoizedState, e.dependencies = t.dependencies, e.mode = t.mode, e.flags = t.flags, e.subtreeFlags = t.subtreeFlags, e.deletions = t.deletions, e.lanes = t.lanes, e.childLanes = t.childLanes, e.alternate = t.alternate, e.actualDuration = t.actualDuration, e.actualStartTime = t.actualStartTime, e.selfBaseDuration = t.selfBaseDuration, e.treeBaseDuration = t.treeBaseDuration, e._debugSource = t._debugSource, e._debugOwner = t._debugOwner, e._debugNeedsRemount = t._debugNeedsRemount, e._debugHookTypes = t._debugHookTypes, e;
    }
    function Cb(e, t, a, i, u) {
      this.tag = t, this.containerInfo = e, this.pendingChildren = null, this.current = null, this.pingCache = null, this.finishedWork = null, this.timeoutHandle = Ay, this.context = null, this.pendingContext = null, this.callbackNode = null, this.callbackPriority = yt, this.eventTimes = $c(P), this.expirationTimes = $c(Zt), this.pendingLanes = P, this.suspendedLanes = P, this.pingedLanes = P, this.expiredLanes = P, this.mutableReadLanes = P, this.finishedLanes = P, this.entangledLanes = P, this.entanglements = $c(P), this.identifierPrefix = i, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null, this.effectDuration = 0, this.passiveEffectDuration = 0;
      {
        this.memoizedUpdaters = /* @__PURE__ */ new Set();
        for (var s = this.pendingUpdatersLaneMap = [], f = 0; f < ln; f++)
          s.push(/* @__PURE__ */ new Set());
      }
      switch (t) {
        case kh:
          this._debugRootType = a ? "hydrateRoot()" : "createRoot()";
          break;
        case Mo:
          this._debugRootType = a ? "hydrate()" : "render()";
          break;
      }
    }
    function C1(e, t, a, i, u, s, f, p, v, y) {
      var g = new Cb(e, t, a, p, v), b = hb(t, s);
      g.current = b, b.stateNode = g;
      {
        var x = {
          element: i,
          isDehydrated: a,
          cache: null,
          transitions: null,
          pendingSuspenseBoundaries: null
        };
        b.memoizedState = x;
      }
      return sg(b), g;
    }
    var n0 = "18.2.0";
    function Rb(e, t, a) {
      var i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null;
      return Yr(i), {
        $$typeof: br,
        key: i == null ? null : "" + i,
        children: e,
        containerInfo: t,
        implementation: a
      };
    }
    var r0, a0;
    r0 = !1, a0 = {};
    function R1(e) {
      if (!e)
        return ai;
      var t = Oa(e), a = aw(t);
      if (t.tag === pe) {
        var i = t.type;
        if (Pl(i))
          return G0(t, i, a);
      }
      return a;
    }
    function Tb(e, t) {
      {
        var a = Oa(e);
        if (a === void 0) {
          if (typeof e.render == "function")
            throw new Error("Unable to find node on an unmounted component.");
          var i = Object.keys(e).join(",");
          throw new Error("Argument appears to not be a ReactComponent. Keys: " + i);
        }
        var u = za(a);
        if (u === null)
          return null;
        if (u.mode & gn) {
          var s = Ye(a) || "Component";
          if (!a0[s]) {
            a0[s] = !0;
            var f = mn;
            try {
              Ht(u), a.mode & gn ? S("%s is deprecated in StrictMode. %s was passed an instance of %s which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", t, t, s) : S("%s is deprecated in StrictMode. %s was passed an instance of %s which renders StrictMode children. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", t, t, s);
            } finally {
              f ? Ht(f) : Rn();
            }
          }
        }
        return u.stateNode;
      }
    }
    function T1(e, t, a, i, u, s, f, p) {
      var v = !1, y = null;
      return C1(e, t, v, y, a, i, u, s, f);
    }
    function w1(e, t, a, i, u, s, f, p, v, y) {
      var g = !0, b = C1(a, i, g, e, u, s, f, p, v);
      b.context = R1(null);
      var x = b.current, M = Ta(), z = $o(x), H = Mu(M, z);
      return H.callback = t != null ? t : null, Uo(x, H, z), O_(b, z, M), b;
    }
    function Ip(e, t, a, i) {
      Ov(t, e);
      var u = t.current, s = Ta(), f = $o(u);
      ou(f);
      var p = R1(a);
      t.context === null ? t.context = p : t.pendingContext = p, Gr && mn !== null && !r0 && (r0 = !0, S(`Render methods should be a pure function of props and state; triggering nested component updates from render is not allowed. If necessary, trigger nested updates in componentDidUpdate.

Check the render method of %s.`, Ye(mn) || "Unknown"));
      var v = Mu(s, f);
      v.payload = {
        element: e
      }, i = i === void 0 ? null : i, i !== null && (typeof i != "function" && S("render(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", i), v.callback = i);
      var y = Uo(u, v, f);
      return y !== null && (pr(y, u, f, s), Bh(y, u, f)), f;
    }
    function Nm(e) {
      var t = e.current;
      if (!t.child)
        return null;
      switch (t.child.tag) {
        case ie:
          return t.child.stateNode;
        default:
          return t.child.stateNode;
      }
    }
    function wb(e) {
      switch (e.tag) {
        case re: {
          var t = e.stateNode;
          if (Bn(t)) {
            var a = ny(t);
            z_(t, a);
          }
          break;
        }
        case _e: {
          Au(function() {
            var u = Ba(e, Ae);
            if (u !== null) {
              var s = Ta();
              pr(u, e, Ae, s);
            }
          });
          var i = Ae;
          i0(e, i);
          break;
        }
      }
    }
    function x1(e, t) {
      var a = e.memoizedState;
      a !== null && a.dehydrated !== null && (a.retryLane = Bv(a.retryLane, t));
    }
    function i0(e, t) {
      x1(e, t);
      var a = e.alternate;
      a && x1(a, t);
    }
    function xb(e) {
      if (e.tag === _e) {
        var t = so, a = Ba(e, t);
        if (a !== null) {
          var i = Ta();
          pr(a, e, t, i);
        }
        i0(e, t);
      }
    }
    function _b(e) {
      if (e.tag === _e) {
        var t = $o(e), a = Ba(e, t);
        if (a !== null) {
          var i = Ta();
          pr(a, e, t, i);
        }
        i0(e, t);
      }
    }
    function _1(e) {
      var t = bv(e);
      return t === null ? null : t.stateNode;
    }
    var b1 = function(e) {
      return null;
    };
    function bb(e) {
      return b1(e);
    }
    var D1 = function(e) {
      return !1;
    };
    function Db(e) {
      return D1(e);
    }
    var k1 = null, O1 = null, L1 = null, M1 = null, N1 = null, z1 = null, U1 = null, A1 = null, F1 = null;
    {
      var H1 = function(e, t, a) {
        var i = t[a], u = vt(e) ? e.slice() : lt({}, e);
        return a + 1 === t.length ? (vt(u) ? u.splice(i, 1) : delete u[i], u) : (u[i] = H1(e[i], t, a + 1), u);
      }, j1 = function(e, t) {
        return H1(e, t, 0);
      }, P1 = function(e, t, a, i) {
        var u = t[i], s = vt(e) ? e.slice() : lt({}, e);
        if (i + 1 === t.length) {
          var f = a[i];
          s[f] = s[u], vt(s) ? s.splice(u, 1) : delete s[u];
        } else
          s[u] = P1(
            e[u],
            t,
            a,
            i + 1
          );
        return s;
      }, V1 = function(e, t, a) {
        if (t.length !== a.length) {
          Je("copyWithRename() expects paths of the same length");
          return;
        } else
          for (var i = 0; i < a.length - 1; i++)
            if (t[i] !== a[i]) {
              Je("copyWithRename() expects paths to be the same except for the deepest key");
              return;
            }
        return P1(e, t, a, 0);
      }, B1 = function(e, t, a, i) {
        if (a >= t.length)
          return i;
        var u = t[a], s = vt(e) ? e.slice() : lt({}, e);
        return s[u] = B1(e[u], t, a + 1, i), s;
      }, $1 = function(e, t, a) {
        return B1(e, t, 0, a);
      }, l0 = function(e, t) {
        for (var a = e.memoizedState; a !== null && t > 0; )
          a = a.next, t--;
        return a;
      };
      k1 = function(e, t, a, i) {
        var u = l0(e, t);
        if (u !== null) {
          var s = $1(u.memoizedState, a, i);
          u.memoizedState = s, u.baseState = s, e.memoizedProps = lt({}, e.memoizedProps);
          var f = Ba(e, Ae);
          f !== null && pr(f, e, Ae, Zt);
        }
      }, O1 = function(e, t, a) {
        var i = l0(e, t);
        if (i !== null) {
          var u = j1(i.memoizedState, a);
          i.memoizedState = u, i.baseState = u, e.memoizedProps = lt({}, e.memoizedProps);
          var s = Ba(e, Ae);
          s !== null && pr(s, e, Ae, Zt);
        }
      }, L1 = function(e, t, a, i) {
        var u = l0(e, t);
        if (u !== null) {
          var s = V1(u.memoizedState, a, i);
          u.memoizedState = s, u.baseState = s, e.memoizedProps = lt({}, e.memoizedProps);
          var f = Ba(e, Ae);
          f !== null && pr(f, e, Ae, Zt);
        }
      }, M1 = function(e, t, a) {
        e.pendingProps = $1(e.memoizedProps, t, a), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var i = Ba(e, Ae);
        i !== null && pr(i, e, Ae, Zt);
      }, N1 = function(e, t) {
        e.pendingProps = j1(e.memoizedProps, t), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var a = Ba(e, Ae);
        a !== null && pr(a, e, Ae, Zt);
      }, z1 = function(e, t, a) {
        e.pendingProps = V1(e.memoizedProps, t, a), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var i = Ba(e, Ae);
        i !== null && pr(i, e, Ae, Zt);
      }, U1 = function(e) {
        var t = Ba(e, Ae);
        t !== null && pr(t, e, Ae, Zt);
      }, A1 = function(e) {
        b1 = e;
      }, F1 = function(e) {
        D1 = e;
      };
    }
    function kb(e) {
      var t = za(e);
      return t === null ? null : t.stateNode;
    }
    function Ob(e) {
      return null;
    }
    function Lb() {
      return mn;
    }
    function Mb(e) {
      var t = e.findFiberByHostInstance, a = A.ReactCurrentDispatcher;
      return gd({
        bundleType: e.bundleType,
        version: e.version,
        rendererPackageName: e.rendererPackageName,
        rendererConfig: e.rendererConfig,
        overrideHookState: k1,
        overrideHookStateDeletePath: O1,
        overrideHookStateRenamePath: L1,
        overrideProps: M1,
        overridePropsDeletePath: N1,
        overridePropsRenamePath: z1,
        setErrorHandler: A1,
        setSuspenseHandler: F1,
        scheduleUpdate: U1,
        currentDispatcherRef: a,
        findHostInstanceByFiber: kb,
        findFiberByHostInstance: t || Ob,
        findHostInstancesForRefresh: ob,
        scheduleRefresh: lb,
        scheduleRoot: ub,
        setRefreshHandler: ib,
        getCurrentFiber: Lb,
        reconcilerVersion: n0
      });
    }
    var Y1 = typeof reportError == "function" ? reportError : function(e) {
      console.error(e);
    };
    function u0(e) {
      this._internalRoot = e;
    }
    zm.prototype.render = u0.prototype.render = function(e) {
      var t = this._internalRoot;
      if (t === null)
        throw new Error("Cannot update an unmounted root.");
      {
        typeof arguments[1] == "function" ? S("render(...): does not support the second callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().") : Um(arguments[1]) ? S("You passed a container to the second argument of root.render(...). You don't need to pass it again since you already passed it to create the root.") : typeof arguments[1] < "u" && S("You passed a second argument to root.render(...) but it only accepts one argument.");
        var a = t.containerInfo;
        if (a.nodeType !== Nn) {
          var i = _1(t.current);
          i && i.parentNode !== a && S("render(...): It looks like the React-rendered content of the root container was removed without using React. This is not supported and will cause errors. Instead, call root.unmount() to empty a root's container.");
        }
      }
      Ip(e, t, null, null);
    }, zm.prototype.unmount = u0.prototype.unmount = function() {
      typeof arguments[0] == "function" && S("unmount(...): does not support a callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().");
      var e = this._internalRoot;
      if (e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        n1() && S("Attempted to synchronously unmount a root while React was already rendering. React cannot finish unmounting the root until the current render has completed, which may lead to a race condition."), Au(function() {
          Ip(null, e, null, null);
        }), $0(t);
      }
    };
    function Nb(e, t) {
      if (!Um(e))
        throw new Error("createRoot(...): Target container is not a DOM element.");
      I1(e);
      var a = !1, i = !1, u = "", s = Y1;
      t != null && (t.hydrate ? Je("hydrate through createRoot is deprecated. Use ReactDOMClient.hydrateRoot(container, <App />) instead.") : typeof t == "object" && t !== null && t.$$typeof === si && S(`You passed a JSX element to createRoot. You probably meant to call root.render instead. Example usage:

  let root = createRoot(domContainer);
  root.render(<App />);`), t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (u = t.identifierPrefix), t.onRecoverableError !== void 0 && (s = t.onRecoverableError), t.transitionCallbacks !== void 0 && t.transitionCallbacks);
      var f = T1(e, kh, null, a, i, u, s);
      Rh(f.current, e);
      var p = e.nodeType === Nn ? e.parentNode : e;
      return Jd(p), new u0(f);
    }
    function zm(e) {
      this._internalRoot = e;
    }
    function zb(e) {
      e && Xv(e);
    }
    zm.prototype.unstable_scheduleHydration = zb;
    function Ub(e, t, a) {
      if (!Um(e))
        throw new Error("hydrateRoot(...): Target container is not a DOM element.");
      I1(e), t === void 0 && S("Must provide initial children as second argument to hydrateRoot. Example usage: hydrateRoot(domContainer, <App />)");
      var i = a != null ? a : null, u = a != null && a.hydratedSources || null, s = !1, f = !1, p = "", v = Y1;
      a != null && (a.unstable_strictMode === !0 && (s = !0), a.identifierPrefix !== void 0 && (p = a.identifierPrefix), a.onRecoverableError !== void 0 && (v = a.onRecoverableError));
      var y = w1(t, null, e, kh, i, s, f, p, v);
      if (Rh(y.current, e), Jd(e), u)
        for (var g = 0; g < u.length; g++) {
          var b = u[g];
          Bw(y, b);
        }
      return new zm(y);
    }
    function Um(e) {
      return !!(e && (e.nodeType === Xr || e.nodeType === Ja || e.nodeType === Jl || !le));
    }
    function Qp(e) {
      return !!(e && (e.nodeType === Xr || e.nodeType === Ja || e.nodeType === Jl || e.nodeType === Nn && e.nodeValue === " react-mount-point-unstable "));
    }
    function I1(e) {
      e.nodeType === Xr && e.tagName && e.tagName.toUpperCase() === "BODY" && S("createRoot(): Creating roots directly with document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try using a container element created for your app."), cp(e) && (e._reactRootContainer ? S("You are calling ReactDOMClient.createRoot() on a container that was previously passed to ReactDOM.render(). This is not supported.") : S("You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it."));
    }
    var Ab = A.ReactCurrentOwner, Q1;
    Q1 = function(e) {
      if (e._reactRootContainer && e.nodeType !== Nn) {
        var t = _1(e._reactRootContainer.current);
        t && t.parentNode !== e && S("render(...): It looks like the React-rendered content of this container was removed without using React. This is not supported and will cause errors. Instead, call ReactDOM.unmountComponentAtNode to empty a container.");
      }
      var a = !!e._reactRootContainer, i = o0(e), u = !!(i && Oo(i));
      u && !a && S("render(...): Replacing React-rendered children with a new root component. If you intended to update the children of this node, you should instead have the existing children update their state and render the new components instead of calling ReactDOM.render."), e.nodeType === Xr && e.tagName && e.tagName.toUpperCase() === "BODY" && S("render(): Rendering components directly into document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try rendering into a container element created for your app.");
    };
    function o0(e) {
      return e ? e.nodeType === Ja ? e.documentElement : e.firstChild : null;
    }
    function W1() {
    }
    function Fb(e, t, a, i, u) {
      if (u) {
        if (typeof i == "function") {
          var s = i;
          i = function() {
            var x = Nm(f);
            s.call(x);
          };
        }
        var f = w1(
          t,
          i,
          e,
          Mo,
          null,
          !1,
          !1,
          "",
          W1
        );
        e._reactRootContainer = f, Rh(f.current, e);
        var p = e.nodeType === Nn ? e.parentNode : e;
        return Jd(p), Au(), f;
      } else {
        for (var v; v = e.lastChild; )
          e.removeChild(v);
        if (typeof i == "function") {
          var y = i;
          i = function() {
            var x = Nm(g);
            y.call(x);
          };
        }
        var g = T1(
          e,
          Mo,
          null,
          !1,
          !1,
          "",
          W1
        );
        e._reactRootContainer = g, Rh(g.current, e);
        var b = e.nodeType === Nn ? e.parentNode : e;
        return Jd(b), Au(function() {
          Ip(t, g, a, i);
        }), g;
      }
    }
    function Hb(e, t) {
      e !== null && typeof e != "function" && S("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", t, e);
    }
    function Am(e, t, a, i, u) {
      Q1(a), Hb(u === void 0 ? null : u, "render");
      var s = a._reactRootContainer, f;
      if (!s)
        f = Fb(a, t, e, u, i);
      else {
        if (f = s, typeof u == "function") {
          var p = u;
          u = function() {
            var v = Nm(f);
            p.call(v);
          };
        }
        Ip(t, f, e, u);
      }
      return Nm(f);
    }
    function jb(e) {
      {
        var t = Ab.current;
        if (t !== null && t.stateNode !== null) {
          var a = t.stateNode._warnedAboutRefsInRender;
          a || S("%s is accessing findDOMNode inside its render(). render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", wt(t.type) || "A component"), t.stateNode._warnedAboutRefsInRender = !0;
        }
      }
      return e == null ? null : e.nodeType === Xr ? e : Tb(e, "findDOMNode");
    }
    function Pb(e, t, a) {
      if (S("ReactDOM.hydrate is no longer supported in React 18. Use hydrateRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !Qp(t))
        throw new Error("Target container is not a DOM element.");
      {
        var i = cp(t) && t._reactRootContainer === void 0;
        i && S("You are calling ReactDOM.hydrate() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call hydrateRoot(container, element)?");
      }
      return Am(null, e, t, !0, a);
    }
    function Vb(e, t, a) {
      if (S("ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !Qp(t))
        throw new Error("Target container is not a DOM element.");
      {
        var i = cp(t) && t._reactRootContainer === void 0;
        i && S("You are calling ReactDOM.render() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.render(element)?");
      }
      return Am(null, e, t, !1, a);
    }
    function Bb(e, t, a, i) {
      if (S("ReactDOM.unstable_renderSubtreeIntoContainer() is no longer supported in React 18. Consider using a portal instead. Until you switch to the createRoot API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !Qp(a))
        throw new Error("Target container is not a DOM element.");
      if (e == null || !ss(e))
        throw new Error("parentComponent must be a valid React Component");
      return Am(e, t, a, !1, i);
    }
    function $b(e) {
      if (!Qp(e))
        throw new Error("unmountComponentAtNode(...): Target container is not a DOM element.");
      {
        var t = cp(e) && e._reactRootContainer === void 0;
        t && S("You are calling ReactDOM.unmountComponentAtNode() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.unmount()?");
      }
      if (e._reactRootContainer) {
        {
          var a = o0(e), i = a && !Oo(a);
          i && S("unmountComponentAtNode(): The node you're attempting to unmount was rendered by another copy of React.");
        }
        return Au(function() {
          Am(null, null, e, !1, function() {
            e._reactRootContainer = null, $0(e);
          });
        }), !0;
      } else {
        {
          var u = o0(e), s = !!(u && Oo(u)), f = e.nodeType === Xr && Qp(e.parentNode) && !!e.parentNode._reactRootContainer;
          s && S("unmountComponentAtNode(): The node you're attempting to unmount was rendered by React and is not a top-level container. %s", f ? "You may have accidentally passed in a React root node instead of its container." : "Instead, have the parent component update its state and rerender in order to remove this component.");
        }
        return !1;
      }
    }
    ve(wb), Yv(xb), ws(_b), Ud(Fa), Qv(Cs), (typeof Map != "function" || Map.prototype == null || typeof Map.prototype.forEach != "function" || typeof Set != "function" || Set.prototype == null || typeof Set.prototype.clear != "function" || typeof Set.prototype.forEach != "function") && S("React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"), wv(IR), cc(jS, U_, Au);
    function Yb(e, t) {
      var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
      if (!Um(t))
        throw new Error("Target container is not a DOM element.");
      return Rb(e, t, null, a);
    }
    function Ib(e, t, a, i) {
      return Bb(e, t, a, i);
    }
    var s0 = {
      usingClientEntryPoint: !1,
      Events: [Oo, pf, Th, sc, ls, jS]
    };
    function Qb(e, t) {
      return s0.usingClientEntryPoint || S('You are importing createRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'), Nb(e, t);
    }
    function Wb(e, t, a) {
      return s0.usingClientEntryPoint || S('You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'), Ub(e, t, a);
    }
    function Gb(e) {
      return n1() && S("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task."), Au(e);
    }
    var qb = Mb({
      findFiberByHostInstance: zs,
      bundleType: 1,
      version: n0,
      rendererPackageName: "react-dom"
    });
    if (!qb && pn && window.top === window.self && (navigator.userAgent.indexOf("Chrome") > -1 && navigator.userAgent.indexOf("Edge") === -1 || navigator.userAgent.indexOf("Firefox") > -1)) {
      var G1 = window.location.protocol;
      /^(https?|file):$/.test(G1) && console.info("%cDownload the React DevTools for a better development experience: https://reactjs.org/link/react-devtools" + (G1 === "file:" ? `
You might need to use a local HTTP server (instead of file://): https://reactjs.org/link/react-devtools-faq` : ""), "font-weight:bold");
    }
    Wa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = s0, Wa.createPortal = Yb, Wa.createRoot = Qb, Wa.findDOMNode = jb, Wa.flushSync = Gb, Wa.hydrate = Pb, Wa.hydrateRoot = Wb, Wa.render = Vb, Wa.unmountComponentAtNode = $b, Wa.unstable_batchedUpdates = jS, Wa.unstable_renderSubtreeIntoContainer = Ib, Wa.version = n0, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
  }()), Wa;
}
(function(B) {
  function q() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) {
      if (process.env.NODE_ENV !== "production")
        throw new Error("^_^");
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(q);
      } catch (A) {
        console.error(A);
      }
    }
  }
  process.env.NODE_ENV === "production" ? (q(), B.exports = aD()) : B.exports = iD();
})(lR);
var Gp = lR.exports;
if (process.env.NODE_ENV === "production")
  Kp.createRoot = Gp.createRoot, Kp.hydrateRoot = Gp.hydrateRoot;
else {
  var Hm = Gp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  Kp.createRoot = function(B, q) {
    Hm.usingClientEntryPoint = !0;
    try {
      return Gp.createRoot(B, q);
    } finally {
      Hm.usingClientEntryPoint = !1;
    }
  }, Kp.hydrateRoot = function(B, q, A) {
    Hm.usingClientEntryPoint = !0;
    try {
      return Gp.hydrateRoot(B, q, A);
    } finally {
      Hm.usingClientEntryPoint = !1;
    }
  };
}
var v0 = { exports: {} }, qp = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var nR;
function lD() {
  if (nR)
    return qp;
  nR = 1;
  var B = Xs.exports, q = Symbol.for("react.element"), A = Symbol.for("react.fragment"), $t = Object.prototype.hasOwnProperty, Yt = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Je = { key: !0, ref: !0, __self: !0, __source: !0 };
  function S(It, he, pe) {
    var rt, re = {}, me = null, ie = null;
    pe !== void 0 && (me = "" + pe), he.key !== void 0 && (me = "" + he.key), he.ref !== void 0 && (ie = he.ref);
    for (rt in he)
      $t.call(he, rt) && !Je.hasOwnProperty(rt) && (re[rt] = he[rt]);
    if (It && It.defaultProps)
      for (rt in he = It.defaultProps, he)
        re[rt] === void 0 && (re[rt] = he[rt]);
    return { $$typeof: q, type: It, key: me, ref: ie, props: re, _owner: Yt.current };
  }
  return qp.Fragment = A, qp.jsx = S, qp.jsxs = S, qp;
}
var Xp = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var rR;
function uD() {
  return rR || (rR = 1, process.env.NODE_ENV !== "production" && function() {
    var B = Xs.exports, q = Symbol.for("react.element"), A = Symbol.for("react.portal"), $t = Symbol.for("react.fragment"), Yt = Symbol.for("react.strict_mode"), Je = Symbol.for("react.profiler"), S = Symbol.for("react.provider"), It = Symbol.for("react.context"), he = Symbol.for("react.forward_ref"), pe = Symbol.for("react.suspense"), rt = Symbol.for("react.suspense_list"), re = Symbol.for("react.memo"), me = Symbol.for("react.lazy"), ie = Symbol.for("react.offscreen"), Pe = Symbol.iterator, Ct = "@@iterator";
    function st(R) {
      if (R === null || typeof R != "object")
        return null;
      var Y = Pe && R[Pe] || R[Ct];
      return typeof Y == "function" ? Y : null;
    }
    var dn = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function at(R) {
      {
        for (var Y = arguments.length, ee = new Array(Y > 1 ? Y - 1 : 0), ce = 1; ce < Y; ce++)
          ee[ce - 1] = arguments[ce];
        Qe("error", R, ee);
      }
    }
    function Qe(R, Y, ee) {
      {
        var ce = dn.ReactDebugCurrentFrame, Ge = ce.getStackAddendum();
        Ge !== "" && (Y += "%s", ee = ee.concat([Ge]));
        var mt = ee.map(function(Xe) {
          return String(Xe);
        });
        mt.unshift("Warning: " + Y), Function.prototype.apply.call(console[R], console, mt);
      }
    }
    var ct = !1, _e = !1, it = !1, He = !1, nn = !1, _n;
    _n = Symbol.for("react.module.reference");
    function Qt(R) {
      return !!(typeof R == "string" || typeof R == "function" || R === $t || R === Je || nn || R === Yt || R === pe || R === rt || He || R === ie || ct || _e || it || typeof R == "object" && R !== null && (R.$$typeof === me || R.$$typeof === re || R.$$typeof === S || R.$$typeof === It || R.$$typeof === he || R.$$typeof === _n || R.getModuleId !== void 0));
    }
    function bt(R, Y, ee) {
      var ce = R.displayName;
      if (ce)
        return ce;
      var Ge = Y.displayName || Y.name || "";
      return Ge !== "" ? ee + "(" + Ge + ")" : ee;
    }
    function Cn(R) {
      return R.displayName || "Context";
    }
    function Ue(R) {
      if (R == null)
        return null;
      if (typeof R.tag == "number" && at("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof R == "function")
        return R.displayName || R.name || null;
      if (typeof R == "string")
        return R;
      switch (R) {
        case $t:
          return "Fragment";
        case A:
          return "Portal";
        case Je:
          return "Profiler";
        case Yt:
          return "StrictMode";
        case pe:
          return "Suspense";
        case rt:
          return "SuspenseList";
      }
      if (typeof R == "object")
        switch (R.$$typeof) {
          case It:
            var Y = R;
            return Cn(Y) + ".Consumer";
          case S:
            var ee = R;
            return Cn(ee._context) + ".Provider";
          case he:
            return bt(R, R.render, "ForwardRef");
          case re:
            var ce = R.displayName || null;
            return ce !== null ? ce : Ue(R.type) || "Memo";
          case me: {
            var Ge = R, mt = Ge._payload, Xe = Ge._init;
            try {
              return Ue(Xe(mt));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var qe = Object.assign, Nt = 0, Rt, ye, Z, we, T, $, le;
    function $e() {
    }
    $e.__reactDisabledLog = !0;
    function Fe() {
      {
        if (Nt === 0) {
          Rt = console.log, ye = console.info, Z = console.warn, we = console.error, T = console.group, $ = console.groupCollapsed, le = console.groupEnd;
          var R = {
            configurable: !0,
            enumerable: !0,
            value: $e,
            writable: !0
          };
          Object.defineProperties(console, {
            info: R,
            log: R,
            warn: R,
            error: R,
            group: R,
            groupCollapsed: R,
            groupEnd: R
          });
        }
        Nt++;
      }
    }
    function ht() {
      {
        if (Nt--, Nt === 0) {
          var R = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: qe({}, R, {
              value: Rt
            }),
            info: qe({}, R, {
              value: ye
            }),
            warn: qe({}, R, {
              value: Z
            }),
            error: qe({}, R, {
              value: we
            }),
            group: qe({}, R, {
              value: T
            }),
            groupCollapsed: qe({}, R, {
              value: $
            }),
            groupEnd: qe({}, R, {
              value: le
            })
          });
        }
        Nt < 0 && at("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var et = dn.ReactCurrentDispatcher, ft;
    function tt(R, Y, ee) {
      {
        if (ft === void 0)
          try {
            throw Error();
          } catch (Ge) {
            var ce = Ge.stack.trim().match(/\n( *(at )?)/);
            ft = ce && ce[1] || "";
          }
        return `
` + ft + R;
      }
    }
    var zt = !1, Vr;
    {
      var vr = typeof WeakMap == "function" ? WeakMap : Map;
      Vr = new vr();
    }
    function Br(R, Y) {
      if (!R || zt)
        return "";
      {
        var ee = Vr.get(R);
        if (ee !== void 0)
          return ee;
      }
      var ce;
      zt = !0;
      var Ge = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var mt;
      mt = et.current, et.current = null, Fe();
      try {
        if (Y) {
          var Xe = function() {
            throw Error();
          };
          if (Object.defineProperty(Xe.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(Xe, []);
            } catch (Tt) {
              ce = Tt;
            }
            Reflect.construct(R, [], Xe);
          } else {
            try {
              Xe.call();
            } catch (Tt) {
              ce = Tt;
            }
            R.call(Xe.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (Tt) {
            ce = Tt;
          }
          R();
        }
      } catch (Tt) {
        if (Tt && ce && typeof Tt.stack == "string") {
          for (var ke = Tt.stack.split(`
`), Mn = ce.stack.split(`
`), Jt = ke.length - 1, en = Mn.length - 1; Jt >= 1 && en >= 0 && ke[Jt] !== Mn[en]; )
            en--;
          for (; Jt >= 1 && en >= 0; Jt--, en--)
            if (ke[Jt] !== Mn[en]) {
              if (Jt !== 1 || en !== 1)
                do
                  if (Jt--, en--, en < 0 || ke[Jt] !== Mn[en]) {
                    var nr = `
` + ke[Jt].replace(" at new ", " at ");
                    return R.displayName && nr.includes("<anonymous>") && (nr = nr.replace("<anonymous>", R.displayName)), typeof R == "function" && Vr.set(R, nr), nr;
                  }
                while (Jt >= 1 && en >= 0);
              break;
            }
        }
      } finally {
        zt = !1, et.current = mt, ht(), Error.prepareStackTrace = Ge;
      }
      var fi = R ? R.displayName || R.name : "", Pu = fi ? tt(fi) : "";
      return typeof R == "function" && Vr.set(R, Pu), Pu;
    }
    function pn(R, Y, ee) {
      return Br(R, !1);
    }
    function In(R) {
      var Y = R.prototype;
      return !!(Y && Y.isReactComponent);
    }
    function Fn(R, Y, ee) {
      if (R == null)
        return "";
      if (typeof R == "function")
        return Br(R, In(R));
      if (typeof R == "string")
        return tt(R);
      switch (R) {
        case pe:
          return tt("Suspense");
        case rt:
          return tt("SuspenseList");
      }
      if (typeof R == "object")
        switch (R.$$typeof) {
          case he:
            return pn(R.render);
          case re:
            return Fn(R.type, Y, ee);
          case me: {
            var ce = R, Ge = ce._payload, mt = ce._init;
            try {
              return Fn(mt(Ge), Y, ee);
            } catch {
            }
          }
        }
      return "";
    }
    var Hn = Object.prototype.hasOwnProperty, bn = {}, $r = dn.ReactDebugCurrentFrame;
    function Yr(R) {
      if (R) {
        var Y = R._owner, ee = Fn(R.type, R._source, Y ? Y.type : null);
        $r.setExtraStackFrame(ee);
      } else
        $r.setExtraStackFrame(null);
    }
    function Qn(R, Y, ee, ce, Ge) {
      {
        var mt = Function.call.bind(Hn);
        for (var Xe in R)
          if (mt(R, Xe)) {
            var ke = void 0;
            try {
              if (typeof R[Xe] != "function") {
                var Mn = Error((ce || "React class") + ": " + ee + " type `" + Xe + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof R[Xe] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw Mn.name = "Invariant Violation", Mn;
              }
              ke = R[Xe](Y, Xe, ce, ee, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (Jt) {
              ke = Jt;
            }
            ke && !(ke instanceof Error) && (Yr(Ge), at("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", ce || "React class", ee, Xe, typeof ke), Yr(null)), ke instanceof Error && !(ke.message in bn) && (bn[ke.message] = !0, Yr(Ge), at("Failed %s type: %s", ee, ke.message), Yr(null));
          }
      }
    }
    var hr = Array.isArray;
    function Ir(R) {
      return hr(R);
    }
    function mr(R) {
      {
        var Y = typeof Symbol == "function" && Symbol.toStringTag, ee = Y && R[Symbol.toStringTag] || R.constructor.name || "Object";
        return ee;
      }
    }
    function ca(R) {
      try {
        return tr(R), !1;
      } catch {
        return !0;
      }
    }
    function tr(R) {
      return "" + R;
    }
    function Qr(R) {
      if (ca(R))
        return at("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", mr(R)), tr(R);
    }
    var vn = dn.ReactCurrentOwner, xr = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, ui, fa, J;
    J = {};
    function xe(R) {
      if (Hn.call(R, "ref")) {
        var Y = Object.getOwnPropertyDescriptor(R, "ref").get;
        if (Y && Y.isReactWarning)
          return !1;
      }
      return R.ref !== void 0;
    }
    function nt(R) {
      if (Hn.call(R, "key")) {
        var Y = Object.getOwnPropertyDescriptor(R, "key").get;
        if (Y && Y.isReactWarning)
          return !1;
      }
      return R.key !== void 0;
    }
    function Lt(R, Y) {
      if (typeof R.ref == "string" && vn.current && Y && vn.current.stateNode !== Y) {
        var ee = Ue(vn.current.type);
        J[ee] || (at('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', Ue(vn.current.type), R.ref), J[ee] = !0);
      }
    }
    function Ut(R, Y) {
      {
        var ee = function() {
          ui || (ui = !0, at("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", Y));
        };
        ee.isReactWarning = !0, Object.defineProperty(R, "key", {
          get: ee,
          configurable: !0
        });
      }
    }
    function Dn(R, Y) {
      {
        var ee = function() {
          fa || (fa = !0, at("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", Y));
        };
        ee.isReactWarning = !0, Object.defineProperty(R, "ref", {
          get: ee,
          configurable: !0
        });
      }
    }
    var hn = function(R, Y, ee, ce, Ge, mt, Xe) {
      var ke = {
        $$typeof: q,
        type: R,
        key: Y,
        ref: ee,
        props: Xe,
        _owner: mt
      };
      return ke._store = {}, Object.defineProperty(ke._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(ke, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: ce
      }), Object.defineProperty(ke, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: Ge
      }), Object.freeze && (Object.freeze(ke.props), Object.freeze(ke)), ke;
    };
    function yr(R, Y, ee, ce, Ge) {
      {
        var mt, Xe = {}, ke = null, Mn = null;
        ee !== void 0 && (Qr(ee), ke = "" + ee), nt(Y) && (Qr(Y.key), ke = "" + Y.key), xe(Y) && (Mn = Y.ref, Lt(Y, Ge));
        for (mt in Y)
          Hn.call(Y, mt) && !xr.hasOwnProperty(mt) && (Xe[mt] = Y[mt]);
        if (R && R.defaultProps) {
          var Jt = R.defaultProps;
          for (mt in Jt)
            Xe[mt] === void 0 && (Xe[mt] = Jt[mt]);
        }
        if (ke || Mn) {
          var en = typeof R == "function" ? R.displayName || R.name || "Unknown" : R;
          ke && Ut(Xe, en), Mn && Dn(Xe, en);
        }
        return hn(R, ke, Mn, Ge, ce, vn.current, Xe);
      }
    }
    var Vt = dn.ReactCurrentOwner, _r = dn.ReactDebugCurrentFrame;
    function At(R) {
      if (R) {
        var Y = R._owner, ee = Fn(R.type, R._source, Y ? Y.type : null);
        _r.setExtraStackFrame(ee);
      } else
        _r.setExtraStackFrame(null);
    }
    var Ft;
    Ft = !1;
    function Ga(R) {
      return typeof R == "object" && R !== null && R.$$typeof === q;
    }
    function _a() {
      {
        if (Vt.current) {
          var R = Ue(Vt.current.type);
          if (R)
            return `

Check the render method of \`` + R + "`.";
        }
        return "";
      }
    }
    function il(R) {
      {
        if (R !== void 0) {
          var Y = R.fileName.replace(/^.*[\\\/]/, ""), ee = R.lineNumber;
          return `

Check your code at ` + Y + ":" + ee + ".";
        }
        return "";
      }
    }
    var ql = {};
    function ju(R) {
      {
        var Y = _a();
        if (!Y) {
          var ee = typeof R == "string" ? R : R.displayName || R.name;
          ee && (Y = `

Check the top-level render call using <` + ee + ">.");
        }
        return Y;
      }
    }
    function ki(R, Y) {
      {
        if (!R._store || R._store.validated || R.key != null)
          return;
        R._store.validated = !0;
        var ee = ju(Y);
        if (ql[ee])
          return;
        ql[ee] = !0;
        var ce = "";
        R && R._owner && R._owner !== Vt.current && (ce = " It was passed a child from " + Ue(R._owner.type) + "."), At(R), at('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', ee, ce), At(null);
      }
    }
    function ll(R, Y) {
      {
        if (typeof R != "object")
          return;
        if (Ir(R))
          for (var ee = 0; ee < R.length; ee++) {
            var ce = R[ee];
            Ga(ce) && ki(ce, Y);
          }
        else if (Ga(R))
          R._store && (R._store.validated = !0);
        else if (R) {
          var Ge = st(R);
          if (typeof Ge == "function" && Ge !== R.entries)
            for (var mt = Ge.call(R), Xe; !(Xe = mt.next()).done; )
              Ga(Xe.value) && ki(Xe.value, Y);
        }
      }
    }
    function da(R) {
      {
        var Y = R.type;
        if (Y == null || typeof Y == "string")
          return;
        var ee;
        if (typeof Y == "function")
          ee = Y.propTypes;
        else if (typeof Y == "object" && (Y.$$typeof === he || Y.$$typeof === re))
          ee = Y.propTypes;
        else
          return;
        if (ee) {
          var ce = Ue(Y);
          Qn(ee, R.props, "prop", ce, R);
        } else if (Y.PropTypes !== void 0 && !Ft) {
          Ft = !0;
          var Ge = Ue(Y);
          at("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", Ge || "Unknown");
        }
        typeof Y.getDefaultProps == "function" && !Y.getDefaultProps.isReactClassApproved && at("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function oi(R) {
      {
        for (var Y = Object.keys(R.props), ee = 0; ee < Y.length; ee++) {
          var ce = Y[ee];
          if (ce !== "children" && ce !== "key") {
            At(R), at("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", ce), At(null);
            break;
          }
        }
        R.ref !== null && (At(R), at("Invalid attribute `ref` supplied to `React.Fragment`."), At(null));
      }
    }
    function pa(R, Y, ee, ce, Ge, mt) {
      {
        var Xe = Qt(R);
        if (!Xe) {
          var ke = "";
          (R === void 0 || typeof R == "object" && R !== null && Object.keys(R).length === 0) && (ke += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var Mn = il(Ge);
          Mn ? ke += Mn : ke += _a();
          var Jt;
          R === null ? Jt = "null" : Ir(R) ? Jt = "array" : R !== void 0 && R.$$typeof === q ? (Jt = "<" + (Ue(R.type) || "Unknown") + " />", ke = " Did you accidentally export a JSX literal instead of a component?") : Jt = typeof R, at("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", Jt, ke);
        }
        var en = yr(R, Y, ee, Ge, mt);
        if (en == null)
          return en;
        if (Xe) {
          var nr = Y.children;
          if (nr !== void 0)
            if (ce)
              if (Ir(nr)) {
                for (var fi = 0; fi < nr.length; fi++)
                  ll(nr[fi], R);
                Object.freeze && Object.freeze(nr);
              } else
                at("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              ll(nr, R);
        }
        return R === $t ? oi(en) : da(en), en;
      }
    }
    function si(R, Y, ee) {
      return pa(R, Y, ee, !0);
    }
    function br(R, Y, ee) {
      return pa(R, Y, ee, !1);
    }
    var va = br, ci = si;
    Xp.Fragment = $t, Xp.jsx = va, Xp.jsxs = ci;
  }()), Xp;
}
(function(B) {
  process.env.NODE_ENV === "production" ? B.exports = lD() : B.exports = uD();
})(v0);
const fn = v0.exports.jsx, Hf = v0.exports.jsxs, oD = () => /* @__PURE__ */ fn("div", {
  id: "elementor-panel",
  className: "elementor-panel"
}), sD = () => /* @__PURE__ */ fn("div", {
  id: "elementor-responsive-bar"
}), cD = (B) => /* @__PURE__ */ Hf("div", {
  id: "e-notice-bar",
  children: [/* @__PURE__ */ fn("i", {
    className: "eicon-elementor-square"
  }), /* @__PURE__ */ fn("div", {
    id: "e-notice-bar__message",
    children: B.message
  }), /* @__PURE__ */ fn("div", {
    id: "e-notice-bar__action",
    children: /* @__PURE__ */ fn("a", {
      href: B.action_url,
      target: "_blank",
      rel: "noreferrer",
      children: B.action_title
    })
  }), /* @__PURE__ */ fn("i", {
    id: "e-notice-bar__close",
    className: "eicon-close"
  })]
});
const fD = (B) => /* @__PURE__ */ fn("div", {
  id: "elementor-loading",
  children: /* @__PURE__ */ Hf("div", {
    className: "elementor-loader-wrapper",
    children: [/* @__PURE__ */ fn("div", {
      className: "elementor-loader",
      children: /* @__PURE__ */ Hf("div", {
        className: "elementor-loader-boxes",
        children: [/* @__PURE__ */ fn("div", {
          className: "elementor-loader-box"
        }), /* @__PURE__ */ fn("div", {
          className: "elementor-loader-box"
        }), /* @__PURE__ */ fn("div", {
          className: "elementor-loader-box"
        }), /* @__PURE__ */ fn("div", {
          className: "elementor-loader-box"
        })]
      })
    }), /* @__PURE__ */ fn("div", {
      className: "elementor-loading-title",
      children: B.text
    })]
  })
}), dD = (B) => /* @__PURE__ */ Hf("div", {
  id: "elementor-preview",
  style: {
    width: "100%",
    height: "100%"
  },
  children: [/* @__PURE__ */ fn(fD, {
    text: B.loadingText
  }), /* @__PURE__ */ fn(sD, {}), /* @__PURE__ */ Hf("div", {
    id: "elementor-preview-responsive-wrapper",
    className: "elementor-device-desktop elementor-device-rotate-portrait",
    style: {
      width: "100%",
      height: "100%"
    },
    children: [/* @__PURE__ */ fn("iframe", {
      title: "Elementor Preview",
      id: "elementor-preview-iframe",
      src: B.iframePreviewURL,
      allowFullScreen: !0,
      onLoad: B.onPreviewLoaded
    }), B.notice && /* @__PURE__ */ fn(cD, {
      ...B.notice
    })]
  })]
}), pD = () => /* @__PURE__ */ fn("div", {
  id: "elementor-navigator"
}), oR = (...B) => B.map((q) => ElementorConfig[q]), sR = () => {
  var B;
  return (B = elementor == null ? void 0 : elementor.documents) != null && B.getCurrent() ? elementor.documents.getCurrent().config : ElementorConfig.initial_document;
}, vD = () => {
  var A;
  const [B] = oR("notice"), q = sR();
  return /* @__PURE__ */ fn("div", {
    className: "editor-app",
    children: /* @__PURE__ */ Hf("div", {
      id: "elementor-editor-wrapper",
      children: [/* @__PURE__ */ fn(oD, {}), /* @__PURE__ */ fn(dD, {
        iframePreviewURL: (A = q == null ? void 0 : q.urls) == null ? void 0 : A.preview,
        onPreviewLoaded: () => {
          elementor.onPreviewLoaded();
        },
        notice: B || null,
        loadingText: __("Loading", "elementor")
      }), /* @__PURE__ */ fn(pD, {})]
    })
  });
};
let aR = !1;
function hD() {
  const [B, q, A, $t] = oR("platform", "is_rtl", "lang", "editing_mode"), Yt = sR();
  return Xs.exports.useEffect(() => {
    var Je, S;
    if (!aR)
      aR = !0;
    else
      return;
    document.title = __("Elementor", "elementor") + " | " + ((S = (Je = Yt == null ? void 0 : Yt.settings) == null ? void 0 : Je.settings) == null ? void 0 : S.post_title), document.documentElement.setAttribute("lang", A), document.body.classList.add(`${B.name}-version-${B.version.replaceAll(".", "-")}`), q && (document.documentElement.setAttribute("dir", "rtl"), document.body.classList.add("rtl")), $t === "content" && document.body.classList.add("elementor-editor-content-only"), elementor.start();
  }, []), /* @__PURE__ */ fn(vD, {});
}
const mD = 1e4, iR = 1e3;
let p0 = 0;
const cR = () => {
  if (!window.elementor) {
    p0 < mD && (console.log("waiting for elementor", p0), p0 += iR, setTimeout(cR, iR));
    return;
  }
  Kp.createRoot(document.getElementById("root")).render(/* @__PURE__ */ fn(tD.StrictMode, {
    children: /* @__PURE__ */ fn(hD, {})
  }));
};
cR();
