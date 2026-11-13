(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Motion = {}));
})(this, (function (exports) { 'use strict';

    function addUniqueItem(arr, item) {
        if (arr.indexOf(item) === -1)
            arr.push(item);
    }
    function removeItem(arr, item) {
        const index = arr.indexOf(item);
        if (index > -1)
            arr.splice(index, 1);
    }
    // Adapted from array-move
    function moveItem([...arr], fromIndex, toIndex) {
        const startIndex = fromIndex < 0 ? arr.length + fromIndex : fromIndex;
        if (startIndex >= 0 && startIndex < arr.length) {
            const endIndex = toIndex < 0 ? arr.length + toIndex : toIndex;
            const [item] = arr.splice(fromIndex, 1);
            arr.splice(endIndex, 0, item);
        }
        return arr;
    }

    const clamp = (min, max, v) => {
        if (v > max)
            return max;
        if (v < min)
            return min;
        return v;
    };

    function formatErrorMessage(message, errorCode) {
        return errorCode
            ? `${message}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${errorCode}`
            : message;
    }

    exports.warning = () => { };
    exports.invariant = () => { };
    if (typeof process !== "undefined" && "development" !== "production") {
        exports.warning = (check, message, errorCode) => {
            if (!check && typeof console !== "undefined") {
                console.warn(formatErrorMessage(message, errorCode));
            }
        };
        exports.invariant = (check, message, errorCode) => {
            if (!check) {
                throw new Error(formatErrorMessage(message, errorCode));
            }
        };
    }

    const MotionGlobalConfig = {};

    /**
     * Check if value is a numerical string, ie a string that is purely a number eg "100" or "-100.1"
     */
    const isNumericalString = (v) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(v);

    const isObject = (value) => typeof value === "object" && value !== null;

    /**
     * Check if the value is a zero value string like "0px" or "0%"
     */
    const isZeroValueString = (v) => /^0[^.\s]+$/u.test(v);

    /*#__NO_SIDE_EFFECTS__*/
    function memo(callback) {
        let result;
        return () => {
            if (result === undefined)
                result = callback();
            return result;
        };
    }

    /*#__NO_SIDE_EFFECTS__*/
    const noop = (any) => any;

    /**
     * Pipe
     * Compose other transformers to run linearily
     * pipe(min(20), max(40))
     * @param  {...functions} transformers
     * @return {function}
     */
    const pipe = (...transformers) => transformers.reduce((a, b) => (v) => b(a(v)));

    /*
      Progress within given range

      Given a lower limit and an upper limit, we return the progress
      (expressed as a number 0-1) represented by the given value, and
      limit that progress to within 0-1.
    */
    /*#__NO_SIDE_EFFECTS__*/
    const progress = (from, to, value) => {
        const range = to - from;
        return range ? (value - from) / range : 1;
    };

    class SubscriptionManager {
        constructor() {
            this.subscriptions = [];
        }
        add(handler) {
            addUniqueItem(this.subscriptions, handler);
            return () => this.remove(handler);
        }
        remove(handler) {
            removeItem(this.subscriptions, handler);
        }
        notify(a, b, c) {
            const numSubscriptions = this.subscriptions.length;
            if (!numSubscriptions)
                return;
            if (numSubscriptions === 1) {
                /**
                 * If there's only a single handler we can just call it without invoking a loop.
                 */
                this.subscriptions[0](a, b, c);
            }
            else {
                for (let i = 0; i < numSubscriptions; i++) {
                    /**
                     * Check whether the handler exists before firing as it's possible
                     * the subscriptions were modified during this loop running.
                     */
                    const handler = this.subscriptions[i];
                    handler && handler(a, b, c);
                }
            }
        }
        getSize() {
            return this.subscriptions.length;
        }
        clear() {
            this.subscriptions.length = 0;
        }
    }

    /**
     * Converts seconds to milliseconds
     *
     * @param seconds - Time in seconds.
     * @return milliseconds - Converted time in milliseconds.
     */
    /*#__NO_SIDE_EFFECTS__*/
    const secondsToMilliseconds = (seconds) => seconds * 1000;
    /*#__NO_SIDE_EFFECTS__*/
    const millisecondsToSeconds = (milliseconds) => milliseconds / 1000;

    /*
      Convert velocity into velocity per second
    */
    /*#__NO_SIDE_EFFECTS__*/
    const velocityPerSecond = (velocity, frameDuration) => frameDuration ? velocity * (1000 / frameDuration) : 0;

    const warned = new Set();
    function hasWarned(message) {
        return warned.has(message);
    }
    function warnOnce(condition, message, errorCode) {
        if (condition || warned.has(message))
            return;
        console.warn(formatErrorMessage(message, errorCode));
        warned.add(message);
    }

    const wrap = (min, max, v) => {
        const rangeSize = max - min;
        return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
    };

    /*
      Bezier function generator
      This has been modified from Gaëtan Renaudeau's BezierEasing
      https://github.com/gre/bezier-easing/blob/master/src/index.js
      https://github.com/gre/bezier-easing/blob/master/LICENSE

      t is found for a given x with Newton-Raphson, safeguarded by a bisection
      bracket: whenever a Newton step would leave the bracket (near flat parts
      of the curve), it bisects instead. This converges to full precision in
      ~5 iterations on typical curves, so output is smooth rather than snapped
      to a fixed bisection grid. The slope is estimated with a forward
      difference, and the lookup table is omitted, to save bytes.

      x = 0 and x = 1 return exactly 0 and 1. x outside [0, 1] starts outside
      the bracket, so it bisects towards the nearer end and saturates to within
      ~1e-12 of 0 or 1.
      Usage
        const easeOut = cubicBezier(.17,.67,.83,.67);
        const x = easeOut(0.5); // returns 0.627...
    */
    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    // Bernstein form, so it is exactly 0 at t = 0 and exactly 1 at t = 1.
    const calcBezier = (t, a1, a2) => t * (3 * (1 - t) * ((1 - t) * a1 + t * a2) + t * t);
    /*#__NO_SIDE_EFFECTS__*/
    function cubicBezier(mX1, mY1, mX2, mY2) {
        // If this is a linear gradient, return linear easing
        if (mX1 === mY1 && mX2 === mY2)
            return noop;
        return (x) => {
            let lowerBound = 0;
            let upperBound = 1;
            let t = x;
            for (let i = 0;; i++) {
                // If t is outside the bracket, because x is out of range or a
                // Newton step overshot where the slope is ~0, bisect instead.
                if (!(t >= lowerBound && t <= upperBound)) {
                    t = (lowerBound + upperBound) / 2;
                }
                const currentX = calcBezier(t, mX1, mX2) - x;
                if (currentX * currentX < 1e-28 || i === 40)
                    break;
                currentX > 0 ? (upperBound = t) : (lowerBound = t);
                // Newton-Raphson step, with dx/dt from a forward difference
                t -=
                    (currentX * 1e-7) /
                        (calcBezier(t + 1e-7, mX1, mX2) - x - currentX);
            }
            return calcBezier(t, mY1, mY2);
        };
    }

    // Accepts an easing function and returns a new one that outputs mirrored values for
    // the second half of the animation. Turns easeIn into easeInOut.
    /*#__NO_SIDE_EFFECTS__*/
    const mirrorEasing = (easing) => (p) => p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;

    // Accepts an easing function and returns a new one that outputs reversed values.
    // Turns easeIn into easeOut.
    /*#__NO_SIDE_EFFECTS__*/
    const reverseEasing = (easing) => (p) => 1 - easing(1 - p);

    const backOut = /*@__PURE__*/ cubicBezier(0.33, 1.53, 0.69, 0.99);
    const backIn = /*@__PURE__*/ reverseEasing(backOut);
    const backInOut = /*@__PURE__*/ mirrorEasing(backIn);

    const anticipate = (p) => p >= 1
        ? 1
        : (p *= 2) < 1
            ? 0.5 * backIn(p)
            : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));

    const circIn = (p) => 1 - Math.sin(Math.acos(p));
    const circOut = /* @__PURE__ */ reverseEasing(circIn);
    const circInOut = /* @__PURE__ */ mirrorEasing(circIn);

    const easeIn = /*@__PURE__*/ cubicBezier(0.42, 0, 1, 1);
    const easeOut = /*@__PURE__*/ cubicBezier(0, 0, 0.58, 1);
    const easeInOut = /*@__PURE__*/ cubicBezier(0.42, 0, 0.58, 1);

    /*#__NO_SIDE_EFFECTS__*/
    function steps(numSteps, direction = "end") {
        return (progress) => {
            progress =
                direction === "end"
                    ? Math.min(progress, 0.999)
                    : Math.max(progress, 0.001);
            const expanded = progress * numSteps;
            const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
            return clamp(0, 1, rounded / numSteps);
        };
    }

    /*#__NO_SIDE_EFFECTS__*/
    const isEasingArray = (ease) => {
        return Array.isArray(ease) && typeof ease[0] !== "number";
    };

    /*#__NO_SIDE_EFFECTS__*/
    function getEasingForSegment(easing, i) {
        return isEasingArray(easing) ? easing[wrap(0, easing.length, i)] : easing;
    }

    /*#__NO_SIDE_EFFECTS__*/
    const isBezierDefinition = (easing) => Array.isArray(easing) && typeof easing[0] === "number";

    const easingLookup = {
        linear: noop,
        easeIn,
        easeInOut,
        easeOut,
        circIn,
        circInOut,
        circOut,
        backIn,
        backInOut,
        backOut,
        anticipate,
    };
    const isValidEasing = (easing) => {
        return typeof easing === "string";
    };
    const easingDefinitionToFunction = (definition) => {
        if (isBezierDefinition(definition)) {
            // If cubic bezier definition, create bezier curve
            typeof process !== "undefined" &&
                "development" !== "production" &&
                exports.invariant(definition.length === 4, `Cubic bezier arrays must contain four numerical values.`, "cubic-bezier-length");
            const [x1, y1, x2, y2] = definition;
            return cubicBezier(x1, y1, x2, y2);
        }
        else if (isValidEasing(definition)) {
            // Else lookup from table
            typeof process !== "undefined" &&
                "development" !== "production" &&
                exports.invariant(easingLookup[definition] !== undefined, `Invalid easing type '${definition}'`, "invalid-easing-type");
            return easingLookup[definition];
        }
        return definition;
    };

    /**
     * The frameloop's state, kept apart from the frameloop itself so that
     * reading it doesn't bundle the scheduler.
     */
    const frameData = {
        delta: 0.0,
        timestamp: 0.0,
        isProcessing: false,
    };

    let now;
    function clearTime() {
        now = undefined;
    }
    /**
     * An eventloop-synchronous alternative to performance.now().
     *
     * Ensures that time measurements remain consistent within a synchronous context.
     * Usually calling performance.now() twice within the same synchronous context
     * will return different values which isn't useful for animations when we're usually
     * trying to sync animations to the same frame.
     */
    const time = {
        now: () => {
            if (now === undefined) {
                time.set(frameData.isProcessing || MotionGlobalConfig.useManualTiming
                    ? frameData.timestamp
                    : performance.now());
            }
            return now;
        },
        set: (newTime) => {
            now = newTime;
            queueMicrotask(clearTime);
        },
    };

    // If this number is a decimal, make it just five decimal places
    // to avoid exponents
    const sanitize = (v) => Math.round(v * 100000) / 100000;

    const checkStringStartsWith = (token) => (key) => typeof key === "string" && key.startsWith(token);
    const isCSSVariableName = 
    /*@__PURE__*/ checkStringStartsWith("--");
    const startsAsVariableToken = 
    /*@__PURE__*/ checkStringStartsWith("var(--");
    const isCSSVariableToken = (value) => {
        const startsWithToken = startsAsVariableToken(value);
        if (!startsWithToken)
            return false;
        // Ensure any comments are stripped from the value as this can harm performance of the regex.
        return singleCssVariableRegex.test(value.split("/*")[0].trim());
    };
    const singleCssVariableRegex = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
    /**
     * Check if a value contains a CSS variable anywhere (e.g. inside calc()).
     * Unlike isCSSVariableToken which checks if the value IS a var() token,
     * this checks if the value CONTAINS var() somewhere in the string.
     */
    function containsCSSVariable(value) {
        if (typeof value !== "string")
            return false;
        // Strip comments to avoid false positives
        return value.split("/*")[0].includes("var(--");
    }

    const number = {
        test: (v) => typeof v === "number",
        parse: parseFloat,
        transform: (v) => v,
    };
    const alpha = {
        ...number,
        transform: (v) => clamp(0, 1, v),
    };
    const scale = {
        ...number,
        default: 1,
    };

    const floatRegex = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;

    function isNullish(v) {
        return v == null;
    }

    const singleColorRegex = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;

    /**
     * Returns true if the provided string is a color, ie rgba(0,0,0,0) or #000,
     * but false if a number or multiple colors
     */
    const isColorString = (type, testProp) => (v) => {
        return Boolean((typeof v === "string" &&
            singleColorRegex.test(v) &&
            v.startsWith(type)) ||
            (testProp &&
                !isNullish(v) &&
                Object.prototype.hasOwnProperty.call(v, testProp)));
    };
    const splitColor = (aName, bName, cName) => (v) => {
        if (typeof v !== "string")
            return v;
        const [a, b, c, alpha] = v.match(floatRegex);
        return {
            [aName]: parseFloat(a),
            [bName]: parseFloat(b),
            [cName]: parseFloat(c),
            alpha: alpha !== undefined ? parseFloat(alpha) : 1,
        };
    };

    const clampRgbUnit = (v) => clamp(0, 255, v);
    const rgbUnit = {
        ...number,
        transform: (v) => Math.round(clampRgbUnit(v)),
    };
    const rgba = {
        test: /*@__PURE__*/ isColorString("rgb", "red"),
        parse: /*@__PURE__*/ splitColor("red", "green", "blue"),
        transform: ({ red, green, blue, alpha: alpha$1 = 1 }) => "rgba(" +
            rgbUnit.transform(red) +
            ", " +
            rgbUnit.transform(green) +
            ", " +
            rgbUnit.transform(blue) +
            ", " +
            sanitize(alpha.transform(alpha$1)) +
            ")",
    };

    /**
     * #FF0000 has two characters per channel, #F00 one, which is doubled.
     */
    const channel = (v, i, size) => {
        const c = v.substring(1 + i * size, 1 + (i + 1) * size);
        return size > 1 ? c : c + c;
    };
    function parseHex(v) {
        const size = v.length > 5 ? 2 : 1;
        const alpha = channel(v, 3, size);
        return {
            red: parseInt(channel(v, 0, size), 16),
            green: parseInt(channel(v, 1, size), 16),
            blue: parseInt(channel(v, 2, size), 16),
            alpha: alpha ? parseInt(alpha, 16) / 255 : 1,
        };
    }
    const hex = {
        test: /*@__PURE__*/ isColorString("#"),
        parse: parseHex,
        transform: rgba.transform,
    };

    /*#__NO_SIDE_EFFECTS__*/
    const createUnitType = (unit) => ({
        test: (v) => typeof v === "string" && v.endsWith(unit) && v.split(" ").length === 1,
        parse: parseFloat,
        transform: (v) => `${v}${unit}`,
    });
    const degrees = /*@__PURE__*/ createUnitType("deg");
    const percent = /*@__PURE__*/ createUnitType("%");
    const px = /*@__PURE__*/ createUnitType("px");
    const vh = /*@__PURE__*/ createUnitType("vh");
    const vw = /*@__PURE__*/ createUnitType("vw");
    const progressPercentage = /*@__PURE__*/ (() => ({
        ...percent,
        parse: (v) => percent.parse(v) / 100,
        transform: (v) => percent.transform(v * 100),
    }))();

    const hsla = {
        test: /*@__PURE__*/ isColorString("hsl", "hue"),
        parse: /*@__PURE__*/ splitColor("hue", "saturation", "lightness"),
        transform: ({ hue, saturation, lightness, alpha: alpha$1 = 1 }) => {
            return ("hsla(" +
                Math.round(hue) +
                ", " +
                percent.transform(sanitize(saturation)) +
                ", " +
                percent.transform(sanitize(lightness)) +
                ", " +
                sanitize(alpha.transform(alpha$1)) +
                ")");
        },
    };

    const color = {
        test: (v) => rgba.test(v) || hex.test(v) || hsla.test(v),
        parse: (v) => {
            if (rgba.test(v)) {
                return rgba.parse(v);
            }
            else if (hsla.test(v)) {
                return hsla.parse(v);
            }
            else {
                return hex.parse(v);
            }
        },
        transform: (v) => {
            return typeof v === "string"
                ? v
                : v.hasOwnProperty("red")
                    ? rgba.transform(v)
                    : hsla.transform(v);
        },
        getAnimatableNone: (v) => {
            const parsed = color.parse(v);
            parsed.alpha = 0;
            return color.transform(parsed);
        },
    };

    const colorRegex = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;

    /**
     * Non-global copies of the token regexes so test() can use .test()
     * (no match array, stops at the first token) without lastIndex state.
     */
    const hasFloat = /*@__PURE__*/ new RegExp(floatRegex.source);
    const hasColor = /*@__PURE__*/ new RegExp(colorRegex.source, "i");
    function test(v) {
        return (isNaN(v) &&
            typeof v === "string" &&
            (hasFloat.test(v) || hasColor.test(v)));
    }
    const NUMBER_TOKEN = "number";
    const COLOR_TOKEN = "color";
    const VAR_TOKEN = "var";
    const VAR_FUNCTION_TOKEN = "var(";
    const SPLIT_TOKEN = "${}";
    // this regex consists of the `singleCssVariableRegex|rgbHSLValueRegex|digitRegex`.
    // The lookahead skips digits in function names, like the 3 in matrix3d(.
    const complexRegex = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)(?![a-z]*\()/giu;
    /**
     * Whether analyseComplexValue(value) would find any values, without
     * tokenising the string. CSS variables are resolved before this is
     * used, so it's enough to look for a number or a color.
     */
    function hasComplexValues(value) {
        const asString = value.toString();
        return hasFloat.test(asString) || hasColor.test(asString);
    }
    function analyseComplexValue(value) {
        const originalValue = value.toString();
        const values = [];
        const indexes = {
            color: [],
            number: [],
            var: [],
        };
        const types = [];
        let i = 0;
        const tokenised = originalValue.replace(complexRegex, (parsedValue) => {
            if (color.test(parsedValue)) {
                indexes.color.push(i);
                types.push(COLOR_TOKEN);
                values.push(color.parse(parsedValue));
            }
            else if (parsedValue.startsWith(VAR_FUNCTION_TOKEN)) {
                indexes.var.push(i);
                types.push(VAR_TOKEN);
                values.push(parsedValue);
            }
            else {
                indexes.number.push(i);
                types.push(NUMBER_TOKEN);
                values.push(parseFloat(parsedValue));
            }
            ++i;
            return SPLIT_TOKEN;
        });
        const split = tokenised.split(SPLIT_TOKEN);
        return { values, split, indexes, types };
    }
    function parseComplexValue(v) {
        return analyseComplexValue(v).values;
    }
    function buildTransformer({ split, types }) {
        const numSections = split.length;
        return (v) => {
            let output = "";
            for (let i = 0; i < numSections; i++) {
                output += split[i];
                if (v[i] !== undefined) {
                    const type = types[i];
                    if (type === NUMBER_TOKEN) {
                        output += sanitize(v[i]);
                    }
                    else if (type === COLOR_TOKEN) {
                        output += color.transform(v[i]);
                    }
                    else {
                        output += v[i];
                    }
                }
            }
            return output;
        };
    }
    function createTransformer(source) {
        return buildTransformer(analyseComplexValue(source));
    }
    const convertNumbersToZero = (v) => typeof v === "number" ? 0 : color.test(v) ? color.getAnimatableNone(v) : v;
    /**
     * Convert a parsed value to its zero equivalent, but preserve numbers
     * that act as divisors in CSS calc() expressions.
     *
     * analyseComplexValue extracts numbers from CSS strings and puts the
     * surrounding text into a `split` template array. For example:
     *   "calc(var(--gap) / 5)"  →  values: [var(--gap), 5]
     *                               split:  ["calc(", " / ", ")"]
     *
     * When building a zero-equivalent for animation, naively zeroing all
     * numbers turns the divisor into 0 → "calc(var(--gap) / 0)" → NaN.
     * We detect this by checking whether the text preceding a number
     * (split[i]) ends with "/" — the CSS calc division operator.
     */
    const convertToZero = (value, splitBefore) => {
        if (typeof value === "number") {
            return splitBefore?.trim().endsWith("/") ? value : 0;
        }
        return convertNumbersToZero(value);
    };
    function getAnimatableNone$1(v) {
        const info = analyseComplexValue(v);
        const transformer = buildTransformer(info);
        return transformer(info.values.map((value, i) => convertToZero(value, info.split[i])));
    }
    const complex = {
        test,
        parse: parseComplexValue,
        createTransformer,
        getAnimatableNone: getAnimatableNone$1,
    };

    // Adapted from https://gist.github.com/mjackson/5311256
    function hueToRgb(p, q, t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    function hslaToRgba({ hue, saturation, lightness, alpha }) {
        hue /= 360;
        saturation /= 100;
        lightness /= 100;
        let red = 0;
        let green = 0;
        let blue = 0;
        if (!saturation) {
            red = green = blue = lightness;
        }
        else {
            const q = lightness < 0.5
                ? lightness * (1 + saturation)
                : lightness + saturation - lightness * saturation;
            const p = 2 * lightness - q;
            red = hueToRgb(p, q, hue + 1 / 3);
            green = hueToRgb(p, q, hue);
            blue = hueToRgb(p, q, hue - 1 / 3);
        }
        return {
            red: Math.round(red * 255),
            green: Math.round(green * 255),
            blue: Math.round(blue * 255),
            alpha,
        };
    }

    function mixImmediate(a, b) {
        return (p) => (p > 0 ? b : a);
    }

    /*
      Value in range from progress

      Given a lower limit and an upper limit, we return the value within
      that range as expressed by progress (usually a number from 0 to 1)

      So progress = 0.5 would change

      from -------- to

      to

      from ---- to

      E.g. from = 10, to = 20, progress = 0.5 => 15

      @param [number]: Lower limit of range
      @param [number]: Upper limit of range
      @param [number]: The progress between lower and upper limits expressed 0-1
      @return [number]: Value as calculated from progress within range (not limited within range)
    */
    const mixNumber$1 = (from, to, progress) => {
        return from + (to - from) * progress;
    };

    // Linear color space blending
    // Explained https://www.youtube.com/watch?v=LKnqECcg6Gw
    // Demonstrated http://codepen.io/osublake/pen/xGVVaN
    const mixLinearColor = (from, to, v) => {
        const fromExpo = from * from;
        const expo = v * (to * to - fromExpo) + fromExpo;
        return expo < 0 ? 0 : Math.sqrt(expo);
    };
    const colorTypes = [hex, rgba, hsla];
    const getColorType = (v) => colorTypes.find((type) => type.test(v));
    function asRGBA(color) {
        const type = getColorType(color);
        if (!type) {
            exports.warning(false, `'${color}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable");
            return false;
        }
        let model = type.parse(color);
        if (type === hsla) {
            // TODO Remove this cast - needed since Motion's stricter typing
            model = hslaToRgba(model);
        }
        return model;
    }
    const mixColor = (from, to) => {
        const fromRGBA = asRGBA(from);
        const toRGBA = asRGBA(to);
        if (!fromRGBA || !toRGBA) {
            return mixImmediate(from, to);
        }
        const blended = { ...fromRGBA };
        return (v) => {
            blended.red = mixLinearColor(fromRGBA.red, toRGBA.red, v);
            blended.green = mixLinearColor(fromRGBA.green, toRGBA.green, v);
            blended.blue = mixLinearColor(fromRGBA.blue, toRGBA.blue, v);
            blended.alpha = mixNumber$1(fromRGBA.alpha, toRGBA.alpha, v);
            return rgba.transform(blended);
        };
    };

    const invisibleValues = new Set(["none", "hidden"]);
    /**
     * Returns a function that, when provided a progress value between 0 and 1,
     * will return the "none" or "hidden" string only when the progress is that of
     * the origin or target.
     */
    function mixVisibility(origin, target) {
        if (invisibleValues.has(origin)) {
            return (p) => (p <= 0 ? origin : target);
        }
        else {
            return (p) => (p >= 1 ? target : origin);
        }
    }

    function mixNumber(a, b) {
        return (p) => mixNumber$1(a, b, p);
    }
    function getMixer(a) {
        if (typeof a === "number") {
            return mixNumber;
        }
        else if (typeof a === "string") {
            return isCSSVariableToken(a)
                ? mixImmediate
                : color.test(a)
                    ? mixColor
                    : mixComplex;
        }
        else if (Array.isArray(a)) {
            return mixArray;
        }
        else if (typeof a === "object") {
            return color.test(a) ? mixColor : mixObject;
        }
        return mixImmediate;
    }
    function mixArray(a, b) {
        const output = [...a];
        const numValues = output.length;
        const blendValue = a.map((v, i) => getMixer(v)(v, b[i]));
        return (p) => {
            for (let i = 0; i < numValues; i++) {
                output[i] = blendValue[i](p);
            }
            return output;
        };
    }
    function mixObject(a, b) {
        const output = { ...a, ...b };
        const blendValue = {};
        for (const key in output) {
            if (a[key] !== undefined && b[key] !== undefined) {
                blendValue[key] = getMixer(a[key])(a[key], b[key]);
            }
        }
        return (v) => {
            for (const key in blendValue) {
                output[key] = blendValue[key](v);
            }
            return output;
        };
    }
    function matchOrder(origin, target) {
        const orderedOrigin = [];
        const pointers = { color: 0, var: 0, number: 0 };
        for (let i = 0; i < target.values.length; i++) {
            const type = target.types[i];
            const originIndex = origin.indexes[type][pointers[type]];
            const originValue = origin.values[originIndex] ?? 0;
            orderedOrigin[i] = originValue;
            pointers[type]++;
        }
        return orderedOrigin;
    }
    const mixComplex = (origin, target) => {
        const originStats = analyseComplexValue(origin);
        const targetStats = analyseComplexValue(target);
        const canInterpolate = originStats.indexes.var.length === targetStats.indexes.var.length &&
            originStats.indexes.color.length === targetStats.indexes.color.length &&
            originStats.indexes.number.length >= targetStats.indexes.number.length;
        if (canInterpolate) {
            if ((invisibleValues.has(origin) &&
                !targetStats.values.length) ||
                (invisibleValues.has(target) &&
                    !originStats.values.length)) {
                return mixVisibility(origin, target);
            }
            return pipe(mixArray(matchOrder(originStats, targetStats), targetStats.values), buildTransformer(targetStats));
        }
        else {
            exports.warning(true, `Complex values '${origin}' and '${target}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different");
            return mixImmediate(origin, target);
        }
    };

    /**
     * A single number with an optional unit, e.g. "50%", "-10px", ".5em".
     * Exponents don't match, so they fall through to the complex mixer.
     */
    const unitValue = /^(-?(?:\d+(?:\.\d*)?|\.\d+))([a-z%]*)$/iu;
    /**
     * Most CSS values Motion mixes are a single number with a unit. Mixing
     * these directly produces the same output as the complex mixer
     * ("25%", "0.33333px") without tokenising both strings.
     */
    function mixUnit(from, to) {
        const a = unitValue.exec(from);
        if (!a)
            return;
        const b = unitValue.exec(to);
        if (!b || a[2] !== b[2])
            return;
        const unit = a[2];
        const origin = parseFloat(a[1]);
        const target = parseFloat(b[1]);
        return (p) => sanitize(mixNumber$1(origin, target, p)) + unit;
    }
    function mix(from, to, p) {
        if (typeof from === "number" &&
            typeof to === "number" &&
            typeof p === "number") {
            return mixNumber$1(from, to, p);
        }
        if (typeof from === "string" && typeof to === "string") {
            const mixer = mixUnit(from, to);
            if (mixer)
                return mixer;
        }
        const mixer = getMixer(from);
        return mixer(from, to);
    }

    const stepsOrder = [
        "setup", // Compute
        "read", // Read
        "resolveKeyframes", // Write/Read/Write/Read
        "preUpdate", // Compute
        "update", // Compute
        "preRender", // Compute
        "render", // Write
        "postRender", // Compute
    ];

    function createRenderStep(runNextFrame) {
        /**
         * We create and reuse two queues, one to queue jobs for the current frame
         * and one for the next. We reuse to avoid triggering GC after x frames.
         */
        let thisFrame = new Set();
        let nextFrame = new Set();
        /**
         * Track whether we're currently processing jobs in this step. This way
         * we can decide whether to schedule new jobs for this frame or next.
         */
        let isProcessing = false;
        let flushNextFrame = false;
        /**
         * The callback currently running. If it schedules itself with `immediate`
         * it's left in place, so as before it doesn't run again this step.
         */
        let running;
        /**
         * A set of processes which were marked keepAlive when scheduled.
         * A keepAlive process is always also held by a frame queue until
         * it's cancelled, so a Set has the same lifetime semantics as a
         * WeakSet here while being considerably faster to query every frame.
         */
        const toKeepAlive = new Set();
        let latestFrameData = {
            delta: 0.0,
            timestamp: 0.0,
            isProcessing: false,
        };
        function triggerCallback(callback) {
            if (toKeepAlive.has(callback)) {
                nextFrame.add(callback);
                runNextFrame();
            }
            (running = callback)(latestFrameData);
        }
        const step = {
            /**
             * Schedule a process to run on the next frame.
             */
            schedule: (callback, keepAlive = false, immediate = false) => {
                const addToCurrentFrame = immediate && isProcessing;
                const queue = addToCurrentFrame ? thisFrame : nextFrame;
                if (keepAlive)
                    toKeepAlive.add(callback);
                /**
                 * A callback scheduled with `immediate` during processing may
                 * already have run this step (for instance, a value it reads was
                 * changed by a later callback). Re-adding moves it to the end of
                 * the queue, so it runs again. The running callback is excluded,
                 * so one that re-schedules itself can't loop forever.
                 */
                addToCurrentFrame && callback !== running && queue.delete(callback);
                queue.add(callback);
                return callback;
            },
            /**
             * Cancel the provided callback from running on the next frame.
             */
            cancel: (callback) => {
                nextFrame.delete(callback);
                toKeepAlive.delete(callback);
            },
            /**
             * Execute all schedule callbacks.
             */
            process: (frameData) => {
                latestFrameData = frameData;
                /**
                 * If we're already processing we've probably been triggered by a flushSync
                 * inside an existing process. Instead of executing, mark flushNextFrame
                 * as true and ensure we flush the following frame at the end of this one.
                 */
                if (isProcessing) {
                    flushNextFrame = true;
                    return;
                }
                isProcessing = true;
                // Swap this frame and the next to avoid GC
                const prevFrame = thisFrame;
                thisFrame = nextFrame;
                nextFrame = prevFrame;
                // Execute this frame
                thisFrame.forEach(triggerCallback);
                // Clear the frame so no callbacks remain. This is to avoid
                // memory leaks should this render step not run for a while.
                thisFrame.clear();
                running = undefined;
                isProcessing = false;
                if (flushNextFrame) {
                    flushNextFrame = false;
                    step.process(frameData);
                }
            },
        };
        return step;
    }

    const maxElapsed$1 = 40;
    function createRenderBatcher(scheduleNextBatch, allowKeepAlive, state = {
        delta: 0.0,
        timestamp: 0.0,
        isProcessing: false,
    }) {
        let runNextFrame = false;
        let useDefaultElapsed = true;
        const flagRunNextFrame = () => (runNextFrame = true);
        const steps = stepsOrder.reduce((acc, key) => {
            acc[key] = createRenderStep(flagRunNextFrame);
            return acc;
        }, {});
        const { setup, read, resolveKeyframes, preUpdate, update, preRender, render, postRender, } = steps;
        const processBatch = () => {
            const useManualTiming = MotionGlobalConfig.useManualTiming;
            const timestamp = useManualTiming
                ? state.timestamp
                : performance.now();
            runNextFrame = false;
            if (!useManualTiming) {
                state.delta = useDefaultElapsed
                    ? 1000 / 60
                    : Math.max(Math.min(timestamp - state.timestamp, maxElapsed$1), 1);
            }
            state.timestamp = timestamp;
            state.isProcessing = true;
            // Unrolled render loop for better per-frame performance
            setup.process(state);
            read.process(state);
            resolveKeyframes.process(state);
            preUpdate.process(state);
            update.process(state);
            preRender.process(state);
            render.process(state);
            postRender.process(state);
            state.isProcessing = false;
            if (runNextFrame && allowKeepAlive) {
                useDefaultElapsed = false;
                scheduleNextBatch(processBatch);
            }
        };
        const wake = () => {
            runNextFrame = true;
            useDefaultElapsed = true;
            if (!state.isProcessing) {
                scheduleNextBatch(processBatch);
            }
        };
        const schedule = stepsOrder.reduce((acc, key) => {
            const step = steps[key];
            acc[key] = (process, keepAlive = false, immediate = false) => {
                if (!runNextFrame)
                    wake();
                return step.schedule(process, keepAlive, immediate);
            };
            return acc;
        }, {});
        const cancel = (process) => {
            for (let i = 0; i < stepsOrder.length; i++) {
                steps[stepsOrder[i]].cancel(process);
            }
        };
        return { schedule, cancel, state, steps };
    }

    const { schedule: frame, cancel: cancelFrame, steps: frameSteps, } = /* @__PURE__ */ createRenderBatcher(typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : noop, true, frameData);

    const frameloopDriver = (update) => {
        const passTimestamp = ({ timestamp }) => update(timestamp);
        return {
            start: (keepAlive = true) => frame.update(passTimestamp, keepAlive),
            stop: () => cancelFrame(passTimestamp),
            /**
             * If we're processing this frame we can use the
             * framelocked timestamp to keep things in sync.
             */
            now: () => (frameData.isProcessing ? frameData.timestamp : time.now()),
        };
    };

    const generateLinearEasing = (easing, duration, // as milliseconds
    resolution = 10 // as milliseconds
    ) => {
        let points = "";
        const numPoints = Math.max(Math.round(duration / resolution), 2);
        for (let i = 0; i < numPoints; i++) {
            points += Math.round(easing(i / (numPoints - 1)) * 10000) / 10000 + ", ";
        }
        return `linear(${points.substring(0, points.length - 2)})`;
    };

    /**
     * Implement a practical max duration for keyframe generation
     * to prevent infinite loops
     */
    const maxGeneratorDuration = 20000;
    function calcGeneratorDuration(generator, timeStep = 50, maxDuration = maxGeneratorDuration, keyframes) {
        let duration = 0;
        let state = generator.next(duration);
        keyframes?.push(state.value);
        while (!state.done && duration < maxDuration) {
            duration += timeStep;
            state = generator.next(duration);
            keyframes?.push(state.value);
        }
        return duration >= maxDuration ? Infinity : duration;
    }

    /**
     * Create a progress => progress easing function from a generator.
     */
    function createGeneratorEasing(options, scale = 100, createGenerator) {
        /**
         * The easing is generated over 0 - scale, but velocity is in the
         * value's own units, so scale it to match. Otherwise an interrupted
         * spring hands off the wrong speed, or direction. Keyframes with
         * units (colours, filters, mixed units) give NaN, which is falsy,
         * so their velocity passes through unscaled.
         */
        const { keyframes: k, velocity: v } = options;
        const delta = k && k[k.length - 1] - k[0];
        const generator = createGenerator({
            ...options,
            velocity: v && delta ? (v * scale) / delta : v,
            keyframes: [0, scale],
        });
        const duration = Math.min(calcGeneratorDuration(generator), maxGeneratorDuration);
        return {
            type: "keyframes",
            ease: (progress) => {
                return generator.next(duration * progress).value / scale;
            },
            duration: millisecondsToSeconds(duration),
        };
    }

    // Default spring physics
    const defaultStiffness = 100;
    const defaultDamping = 10;
    const defaultMass = 1.0;
    // Default duration/bounce-based options
    const defaultDuration = 800; // in ms
    const defaultBounce = 0.3;
    const defaultVisualDuration = 0.3; // in seconds
    // Rest thresholds
    const restSpeedGranular = 0.01;
    const restSpeedDefault = 2;
    const restDeltaGranular = 0.005;
    const restDeltaDefault = 0.5;
    // Limits
    const minDuration = 0.01; // in seconds
    const maxDuration = 10.0; // in seconds
    const minDamping = 0.05;
    /**
     * Maps bounce to a damping ratio as SwiftUI does: 0 is critically damped, and
     * it approaches undamped towards 1 and infinitely overdamped towards -1. Both
     * ends are limited so the spring still moves and settles.
     */
    const bounceToDampingRatio = (bounce) => bounce < 0
        ? 1 / Math.max(1 + bounce, minDamping)
        : Math.max(1 - bounce, minDamping);
    /**
     * Scales an overdamped spring's undamped frequency so that, at its defining
     * time, it has as far left to go as the critically damped spring that's
     * criticalFreqTime radians in by then. A negative bounce then changes the
     * shape of the curve, not when it arrives. 1 at a damping ratio of 1, so
     * there's no jump at a bounce of 0.
     *
     * Solved by Newton on the remaining distance (times fast - slow), which is
     * convex from criticalFreqTime onwards. criticalFreqTime is always below the
     * answer, so it converges from below without overshooting.
     */
    function overdampedFreqScale(dampingRatio, criticalFreqTime) {
        if (!(dampingRatio > 1))
            return 1;
        const root = Math.sqrt(dampingRatio * dampingRatio - 1);
        const slow = dampingRatio - root;
        const fast = dampingRatio + root;
        const target = 2 * root * Math.exp(-criticalFreqTime) * (1 + criticalFreqTime);
        return (approximateRoot((freqTime) => fast * Math.exp(-slow * freqTime) -
            slow * Math.exp(-fast * freqTime) -
            target, (freqTime) => Math.exp(-fast * freqTime) - Math.exp(-slow * freqTime), criticalFreqTime) / criticalFreqTime);
    }
    function calcAngularFreq(undampedFreq, dampingRatio) {
        return undampedFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
    }
    const rootIterations = 12;
    function approximateRoot(envelope, derivative, initialGuess) {
        let result = initialGuess;
        for (let i = 1; i < rootIterations; i++) {
            result = result - envelope(result) / derivative(result);
        }
        return result;
    }
    /**
     * This is ported from the Framer implementation of duration-based spring resolution.
     */
    const safeMin = 0.001;
    /**
     * Assumes zero initial velocity and the default mass: time-defined springs
     * ignore inherited velocity and only resolve without valid physics. Returns
     * NaN physics when the root search doesn't converge.
     */
    function findSpring({ duration = defaultDuration, bounce = defaultBounce, }) {
        let envelope;
        let derivative;
        exports.warning(duration <= secondsToMilliseconds(maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
        const dampingRatio = bounceToDampingRatio(bounce);
        duration = clamp(minDuration, maxDuration, millisecondsToSeconds(duration));
        if (dampingRatio < 1) {
            /**
             * Underdamped spring
             */
            envelope = (undampedFreq) => {
                const exponentialDecay = undampedFreq * dampingRatio;
                const delta = exponentialDecay * duration;
                const b = calcAngularFreq(undampedFreq, dampingRatio);
                const c = Math.exp(-delta);
                return safeMin - (exponentialDecay / b) * c;
            };
            derivative = (undampedFreq) => {
                const exponentialDecay = undampedFreq * dampingRatio;
                const delta = exponentialDecay * duration;
                const e = dampingRatio *
                    dampingRatio *
                    undampedFreq *
                    undampedFreq *
                    duration;
                const f = Math.exp(-delta);
                const g = calcAngularFreq(undampedFreq * undampedFreq, dampingRatio);
                const factor = -envelope(undampedFreq) + safeMin > 0 ? -1 : 1;
                return (factor * -e * f) / g;
            };
        }
        else {
            /**
             * Critically-damped spring. Overdamped springs reuse this root,
             * scaled below.
             */
            envelope = (undampedFreq) => {
                const a = Math.exp(-undampedFreq * duration);
                const b = undampedFreq * duration + 1;
                return -safeMin + a * b;
            };
            derivative = (undampedFreq) => {
                const a = Math.exp(-undampedFreq * duration);
                const b = -undampedFreq * (duration * duration);
                return a * b;
            };
        }
        const initialGuess = 5 / duration;
        const criticalFreq = approximateRoot(envelope, derivative, initialGuess);
        const undampedFreq = criticalFreq *
            overdampedFreqScale(dampingRatio, criticalFreq * duration);
        const stiffness = undampedFreq * undampedFreq;
        return {
            stiffness,
            damping: dampingRatio * 2 * Math.sqrt(stiffness),
            duration: secondsToMilliseconds(duration),
        };
    }
    /**
     * Spring physics must be finite. stiffness and mass are also divisors so must
     * be positive, whereas a damping of 0 is a valid, perpetually oscillating
     * spring. Relational rather than Number.isFinite so numeric strings still
     * coerce.
     */
    const isValidPhysics = (value, canBeZero) => (canBeZero ? value >= 0 : value > 0) && value < Infinity;
    /**
     * Returns value if it's usable spring physics, otherwise undefined so callers
     * fall back to the default. An explicit `undefined`, e.g. from a forwarded
     * optional prop, must fall back too. Invalid physics would otherwise resolve
     * to NaN spring values that never report done.
     */
    function resolvePhysics(value, canBeZero) {
        if (isValidPhysics(value, canBeZero))
            return value;
        {
            exports.warning(value === undefined, "Spring stiffness and mass must be positive, damping 0 or greater", "spring-invalid-physics");
        }
        return undefined;
    }
    function getSpringOptions(options) {
        /**
         * Resolve physics before choosing between physics- and duration-based
         * resolution, so an invalid stiffness doesn't also silently discard a
         * valid duration/bounce.
         */
        const validStiffness = resolvePhysics(options.stiffness);
        const validDamping = resolvePhysics(options.damping, true);
        const validMass = resolvePhysics(options.mass);
        const springOptions = {
            ...options,
            stiffness: validStiffness ?? defaultStiffness,
            damping: validDamping ?? defaultDamping,
            mass: validMass ?? defaultMass,
            isResolvedFromDuration: false,
            // stiffness/damping/mass overrides duration/bounce
            isTimeDefined: (validStiffness ?? validDamping ?? validMass) === undefined &&
                (options.duration !== undefined || options.bounce !== undefined),
        };
        if (springOptions.isTimeDefined) {
            if (options.visualDuration) {
                const dampingRatio = bounceToDampingRatio(options.bounce || 0);
                const root = ((2 * Math.PI) / (options.visualDuration * 1.2)) *
                    overdampedFreqScale(dampingRatio, (2 * Math.PI) / 1.2);
                springOptions.stiffness = root * root;
                springOptions.damping =
                    2 * dampingRatio * Math.sqrt(springOptions.stiffness);
            }
            else {
                Object.assign(springOptions, findSpring(springOptions));
                springOptions.isResolvedFromDuration = true;
            }
            /**
             * Time options can degenerate: a NaN bounce gives a NaN damping, an
             * infinite visualDuration a 0 stiffness, and findSpring NaN for both
             * when it doesn't converge. Replace the two together, so the
             * relationship duration resolution establishes between them is never
             * left half-overwritten.
             */
            if (!isValidPhysics(springOptions.stiffness) ||
                !isValidPhysics(springOptions.damping, true)) {
                springOptions.stiffness = defaultStiffness;
                springOptions.damping = defaultDamping;
            }
        }
        return springOptions;
    }
    function springGenerator(optionsOrVisualDuration = defaultVisualDuration, bounce = defaultBounce) {
        const options = typeof optionsOrVisualDuration !== "object"
            ? {
                visualDuration: optionsOrVisualDuration,
                keyframes: [0, 1],
                bounce,
            }
            : optionsOrVisualDuration;
        const origin = options.keyframes[0];
        const target = options.keyframes[options.keyframes.length - 1];
        /**
         * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
         * to reduce GC during animation.
         */
        const state = { done: false, value: origin };
        const { stiffness, damping, mass, duration, isResolvedFromDuration, isTimeDefined, } = getSpringOptions({ ...options });
        /**
         * Time-defined springs ignore inherited velocity. Velocity from
         * interrupted animations causes massive oscillation on small-range
         * animations.
         */
        const inheritVelocity = (velocity) => isTimeDefined ? 0 : -millisecondsToSeconds(velocity);
        const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
        const undampedAngularFreq = millisecondsToSeconds(Math.sqrt(stiffness / mass));
        const decay = dampingRatio * undampedAngularFreq;
        /**
         * Everything that changes when the spring is retargeted: written by
         * retarget() and update(), read by the resolvers. Grouped on one object,
         * like the coefficients (c) below. Writing doubles to object fields
         * measured marginally faster than to captured let variables in optimised
         * code; neither allocates, so this is a grouping choice, not a GC one.
         */
        const s = {
            target,
            delta: target - origin,
            velocity: inheritVelocity(options.velocity || 0) || 0,
            restSpeed: 0,
            restDelta: 0,
        };
        /**
         * If we're working on a granular scale, use smaller defaults for determining
         * when the spring is finished.
         *
         * These defaults have been selected empirically based on what strikes a good
         * ratio between feeling good and finishing as soon as changes are imperceptible.
         */
        const setRestThresholds = () => {
            const isGranularScale = Math.abs(s.delta) < 5;
            s.restSpeed =
                options.restSpeed ||
                    (isGranularScale ? restSpeedGranular : restSpeedDefault);
            s.restDelta =
                options.restDelta ||
                    (isGranularScale ? restDeltaGranular : restDeltaDefault);
        };
        setRestThresholds();
        let resolveSpring;
        let resolveVelocity;
        /**
         * Derives the coefficients that depend on origin, target and initial
         * velocity. Called once now and again whenever the spring is retargeted.
         */
        let update;
        if (dampingRatio < 1) {
            const angularFreq = calcAngularFreq(undampedAngularFreq, dampingRatio);
            /**
             * A is the position coefficient, sinC/cosC the coefficients of the
             * analytical derivative (px/ms). The exp/sin/cos terms depend only
             * on t, so they're memoized by t independently of the target: a
             * spring retargeted every frame samples the same t each frame and
             * skips the transcendentals entirely.
             */
            const c = { A: 0, sinC: 0, cosC: 0, t: -1, env: 0, sin: 0, cos: 0 };
            update = () => {
                c.A = (s.velocity + decay * s.delta) / angularFreq;
                c.sinC = decay * c.A + s.delta * angularFreq;
                c.cosC = decay * s.delta - c.A * angularFreq;
            };
            const sample = (t) => {
                if (t !== c.t) {
                    c.t = t;
                    c.env = Math.exp(-decay * t);
                    c.sin = Math.sin(angularFreq * t);
                    c.cos = Math.cos(angularFreq * t);
                }
            };
            // Underdamped spring
            resolveSpring = (t) => {
                sample(t);
                return s.target - c.env * (c.A * c.sin + s.delta * c.cos);
            };
            resolveVelocity = (t) => {
                sample(t);
                return c.env * (c.sinC * c.sin + c.cosC * c.cos);
            };
        }
        else if (dampingRatio === 1) {
            // Critically damped spring
            resolveSpring = (t) => s.target -
                Math.exp(-undampedAngularFreq * t) *
                    (s.delta + (s.velocity + undampedAngularFreq * s.delta) * t);
            // Analytical derivative of critically damped spring (px/ms)
            const c = { C: 0 };
            update = () => {
                c.C = s.velocity + undampedAngularFreq * s.delta;
            };
            resolveVelocity = (t) => Math.exp(-undampedAngularFreq * t) *
                (undampedAngularFreq * c.C * t - s.velocity);
        }
        else {
            /**
             * Overdamped spring: the sum of a slow and a fast decaying
             * exponential, so no term can overflow however heavily it's damped.
             */
            const dampedAngularFreq = undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1);
            const slow = decay - dampedAngularFreq;
            const fast = decay + dampedAngularFreq;
            /**
             * Physics-defined springs keep a non-physical limit: once
             * dampedAngularFreq * t passes 300, both terms decay at the damping
             * rate. Heavily overdamped drag springs (dragElastic: 0,
             * dragTransition) rely on this to settle almost at once rather than
             * creep at stiffness / damping. It only applies when reached within
             * 300ms (a dampedAngularFreq of 1 rad/ms), so it reads as a stiff
             * spring snapping into place: any later and it cuts off a slow spring
             * that's visibly still moving (#1207). Negative bounce needs the
             * exact curve, so time-defined springs are exempt.
             */
            const limit = dampedAngularFreq < 1 || isTimeDefined
                ? Infinity
                : 300 / dampedAngularFreq;
            const decayAt = (rate, t) => Math.exp(t > limit ? (decay - rate) * limit - decay * t : -rate * t);
            const c = { S: 0, F: 0 };
            update = () => {
                const P = (s.velocity + decay * s.delta) / dampedAngularFreq;
                c.S = (s.delta + P) / 2;
                c.F = (s.delta - P) / 2;
            };
            resolveSpring = (t) => s.target - c.S * decayAt(slow, t) - c.F * decayAt(fast, t);
            // Analytical derivative of overdamped spring (px/ms)
            resolveVelocity = (t) => slow * c.S * decayAt(slow, t) + fast * c.F * decayAt(fast, t);
        }
        update();
        const calculatedDuration = isResolvedFromDuration ? duration || null : null;
        const generator = {
            calculatedDuration,
            /**
             * Aim the spring at a new target from its current position and
             * velocity, reusing the resolved physics and closures.
             */
            retarget: (keyframes, newVelocity) => {
                s.target = keyframes[keyframes.length - 1];
                s.delta = s.target - keyframes[0];
                s.velocity = inheritVelocity(newVelocity);
                // Default thresholds depend on the scale of the new delta
                if (!(options.restSpeed && options.restDelta))
                    setRestThresholds();
                // Invalidate any duration lazily cached by JSAnimation
                generator.calculatedDuration = calculatedDuration;
                state.done = false;
                update();
            },
            velocity: (t) => secondsToMilliseconds(resolveVelocity(t)),
            next: (t) => {
                const current = resolveSpring(t);
                if (!isResolvedFromDuration) {
                    const currentVelocity = secondsToMilliseconds(resolveVelocity(t));
                    state.done =
                        Math.abs(currentVelocity) <= s.restSpeed &&
                            Math.abs(s.target - current) <= s.restDelta;
                }
                else {
                    state.done = t >= duration;
                }
                state.value = state.done ? s.target : current;
                return state;
            },
            toString: () => {
                const easingDuration = Math.min(calcGeneratorDuration(generator), maxGeneratorDuration);
                const easing = generateLinearEasing((progress) => generator.next(easingDuration * progress).value, easingDuration, 30);
                return easingDuration + "ms " + easing;
            },
            toTransition: () => { },
        };
        return generator;
    }
    const spring = /* @__PURE__ */ Object.assign(springGenerator, {
        applyToOptions: (options) => {
            const generatorOptions = createGeneratorEasing(options, 100, springGenerator);
            options.ease = generatorOptions.ease;
            options.duration = secondsToMilliseconds(generatorOptions.duration);
            options.type = "keyframes";
            return options;
        },
    });

    function inertia({ keyframes, velocity = 0.0, power = 0.8, timeConstant = 325, bounceDamping = 10, bounceStiffness = 500, modifyTarget, min, max, restDelta = 0.5, restSpeed, }) {
        const origin = keyframes[0];
        const state = {
            done: false,
            value: origin,
        };
        const isOutOfBounds = (v) => v < min || v > max;
        const nearestBoundary = (v) => {
            if (min === undefined)
                return max;
            if (max === undefined)
                return min;
            return Math.abs(min - v) < Math.abs(max - v) ? min : max;
        };
        let amplitude = power * velocity;
        const ideal = origin + amplitude;
        const target = modifyTarget ? modifyTarget(ideal) : ideal;
        /**
         * If the target has changed we need to re-calculate the amplitude, otherwise
         * the animation will start from the wrong position.
         */
        if (target !== ideal)
            amplitude = target - origin;
        const calcDelta = (t) => -amplitude * Math.exp(-t / timeConstant);
        const applyFriction = (t) => {
            const delta = calcDelta(t);
            state.done = Math.abs(delta) <= restDelta;
            // target + delta can be off from origin by a float error at t = 0
            state.value = state.done ? target : t ? target + delta : origin;
        };
        /**
         * Ideally this would resolve for t in a stateless way, we could
         * do that by always precalculating the animation but as we know
         * this will be done anyway we can assume that spring will
         * be discovered during that.
         */
        let timeReachedBoundary;
        let spring$1;
        const checkCatchBoundary = (t) => {
            if (!isOutOfBounds(state.value))
                return;
            timeReachedBoundary = t;
            spring$1 = spring({
                keyframes: [state.value, nearestBoundary(state.value)],
                /**
                 * The friction curve is target + calcDelta(t), so its exact
                 * derivative is -calcDelta(t) / timeConstant in units/ms,
                 * converted here to the units/second expected by spring.
                 */
                velocity: (-calcDelta(t) / timeConstant) * 1000,
                damping: bounceDamping,
                stiffness: bounceStiffness,
                restDelta,
                restSpeed,
            });
        };
        checkCatchBoundary(0);
        return {
            calculatedDuration: null,
            next: (t) => {
                /**
                 * We need to resolve the friction to figure out if we need a
                 * spring but we don't want to do this twice per frame. So here
                 * we flag if we updated for this frame and later if we did
                 * we can skip doing it again.
                 */
                let hasUpdatedFrame = false;
                if (!spring$1 && timeReachedBoundary === undefined) {
                    hasUpdatedFrame = true;
                    applyFriction(t);
                    checkCatchBoundary(t);
                }
                /**
                 * If we have a spring and the provided t is beyond the moment the friction
                 * animation crossed the min/max boundary, use the spring.
                 */
                if (timeReachedBoundary !== undefined && t >= timeReachedBoundary) {
                    return spring$1.next(t - timeReachedBoundary);
                }
                else {
                    !hasUpdatedFrame && applyFriction(t);
                    return state;
                }
            },
        };
    }

    function createMixers(output, ease, customMixer) {
        const mixers = [];
        const mixerFactory = MotionGlobalConfig.mix || mix;
        const numMixers = output.length - 1;
        for (let i = 0; i < numMixers; i++) {
            let mixer = customMixer?.(output[i], output[i + 1]) ||
                mixerFactory(output[i], output[i + 1]);
            if (ease) {
                const easingFunction = Array.isArray(ease) ? ease[i] || noop : ease;
                mixer = pipe(easingFunction, mixer);
            }
            mixers.push(mixer);
        }
        return mixers;
    }
    /**
     * Create a function that maps from a numerical input array to a generic output array.
     *
     * Accepts:
     *   - Numbers
     *   - Colors (hex, hsl, hsla, rgb, rgba)
     *   - Complex (combinations of one or more numbers or strings)
     *
     * ```jsx
     * const mixColor = interpolate([0, 1], ['#fff', '#000'])
     *
     * mixColor(0.5) // 'rgba(128, 128, 128, 1)'
     * ```
     *
     * TODO Revisit this approach once we've moved to data models for values,
     * probably not needed to pregenerate mixer functions.
     *
     * @public
     */
    function interpolate(input, output, { clamp: isClamp = true, ease, mixer } = {}) {
        const inputLength = input.length;
        exports.invariant(inputLength === output.length, "Both input and output ranges must be the same length", "range-length");
        /**
         * If we're only provided a single input, we can just make a function
         * that returns the output.
         */
        if (inputLength === 1)
            return () => output[0];
        if (inputLength === 2 && output[0] === output[1])
            return () => output[1];
        const isZeroDeltaRange = input[0] === input[1];
        // If input runs highest -> lowest, reverse both arrays
        if (input[0] > input[inputLength - 1]) {
            input = [...input].reverse();
            output = [...output].reverse();
        }
        const mixers = createMixers(output, ease, mixer);
        const numMixers = mixers.length;
        const interpolator = (v) => {
            if (isZeroDeltaRange && v < input[0])
                return output[0];
            let i = 0;
            if (numMixers > 1) {
                for (; i < input.length - 2; i++) {
                    if (v < input[i + 1])
                        break;
                }
            }
            const progressInRange = progress(input[i], input[i + 1], v);
            return mixers[i](progressInRange);
        };
        return isClamp
            ? (v) => interpolator(clamp(input[0], input[inputLength - 1], v))
            : interpolator;
    }

    function fillOffset(offset, remaining) {
        const min = offset[offset.length - 1];
        for (let i = 1; i <= remaining; i++) {
            const offsetProgress = progress(0, remaining, i);
            offset.push(mixNumber$1(min, 1, offsetProgress));
        }
    }

    function defaultOffset$1(arr) {
        const offset = [0];
        fillOffset(offset, arr.length - 1);
        return offset;
    }

    function convertOffsetToTimes(offset, duration) {
        return offset.map((o) => o * duration);
    }

    function defaultEasing(values, easing) {
        return values.map(() => easing || easeInOut).splice(0, values.length - 1);
    }
    function keyframes({ duration = 300, keyframes: keyframeValues, times, ease = "easeInOut", mixer: transitionMixer, }) {
        /**
         * A mixer only blends values that aren't numbers. Numbers blend as
         * usual, as they do in springs, and so do the progress animations
         * behind layout and path animations, which take the same transition.
         */
        const customMixer = typeof keyframeValues[0] === "number" ? undefined : transitionMixer;
        /**
         * Easing functions can be externally defined as strings. Here we convert them
         * into actual functions.
         */
        const easingFunctions = isEasingArray(ease)
            ? ease.map(easingDefinitionToFunction)
            : easingDefinitionToFunction(ease) || easeInOut;
        /**
         * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
         * to reduce GC during animation.
         */
        const state = {
            done: false,
            value: keyframeValues[0],
        };
        /**
         * Fast setup path for two keyframes one easing. interpolate() handles
         * a custom mixer, and falls back to the usual one where it declines.
         */
        if (!customMixer &&
            keyframeValues.length === 2 &&
            !Array.isArray(easingFunctions) &&
            (!times ||
                times.length !== 2 ||
                (times[0] === 0 && times[1] === 1))) {
            const [origin, target] = keyframeValues;
            const mixer = origin === target
                ? undefined
                : (MotionGlobalConfig.mix || mix)(origin, target);
            return {
                calculatedDuration: duration,
                next: (t) => {
                    state.value = mixer
                        ? mixer(easingFunctions(duration > 0 ? clamp(0, 1, t / duration) : 1))
                        : target;
                    state.done = t >= duration;
                    return state;
                },
            };
        }
        /**
         * Create a times array based on the provided 0-1 offsets
         */
        const absoluteTimes = convertOffsetToTimes(
        // Only use the provided offsets if they're the correct length
        // TODO Maybe we should warn here if there's a length mismatch
        times && times.length === keyframeValues.length
            ? times
            : defaultOffset$1(keyframeValues), duration);
        const mapTimeToKeyframe = interpolate(absoluteTimes, keyframeValues, {
            ease: Array.isArray(easingFunctions)
                ? easingFunctions
                : defaultEasing(keyframeValues, easingFunctions),
            mixer: customMixer,
        });
        return {
            calculatedDuration: duration,
            next: (t) => {
                state.value = mapTimeToKeyframe(t);
                state.done = t >= duration;
                return state;
            },
        };
    }

    const velocitySampleDuration = 5; // ms
    function getGeneratorVelocity(resolveValue, t, current) {
        const prevT = Math.max(t - velocitySampleDuration, 0);
        return velocityPerSecond(current - resolveValue(prevT), t - prevT);
    }
    /**
     * A generator's velocity at time t in units/second: analytical where the
     * generator provides it (springs), otherwise by finite difference. Before
     * the animation has started this is its initial velocity.
     */
    function calcGeneratorVelocity(generator, t, initialVelocity = 0) {
        if (t <= 0)
            return initialVelocity;
        return generator.velocity
            ? generator.velocity(t)
            : getGeneratorVelocity((s) => generator.next(s).value, t, generator.next(t).value);
    }

    const isNotNull = (value) => value !== null;
    function getFinalKeyframe(keyframes, { repeat, repeatType = "loop" }, finalKeyframe, speed = 1) {
        const resolvedKeyframes = keyframes.filter(isNotNull);
        const useFirstKeyframe = speed < 0 || (repeat && repeatType !== "loop" && repeat % 2 === 1);
        const index = useFirstKeyframe ? 0 : resolvedKeyframes.length - 1;
        return !index || finalKeyframe === undefined
            ? resolvedKeyframes[index]
            : finalKeyframe;
    }

    const transitionTypeMap = {
        decay: inertia,
        inertia,
        tween: keyframes,
        keyframes: keyframes,
        spring,
    };
    function replaceTransitionType(transition) {
        if (typeof transition.type === "string") {
            transition.type = transitionTypeMap[transition.type];
        }
    }

    /**
     * If an animation's keyframes resolve, or its first frame renders, more than
     * this long after its start time, it starts from then instead. While we prefer
     * to "start" an animation as soon as it's triggered, this avoids a visual jump
     * into it after main thread work.
     *
     * Manual timing steps frames by however long it likes, so never lags.
     */
    const MAX_START_DELAY = 40;
    const resolveStartTime = (startTime, now) => now - startTime > MAX_START_DELAY && !MotionGlobalConfig.useManualTiming
        ? now
        : startTime;

    function baseRecord(kind, animation) {
        return {
            kind,
            animation,
            timestamp: time.now(),
            frameTimestamp: frameData.timestamp,
            frameIsProcessing: frameData.isProcessing,
        };
    }
    /**
     * Notify an optional inspector without adding a public Motion API.
     *
     * The record is a raw firehose: the live animation handle, the concrete
     * animation's internal options object untouched (timing fields in
     * internal milliseconds, name/keyframes/element/motionValue still
     * attached), a timestamp and the raw frameloop state at notify time.
     * All interpretation belongs to the consumer behind
     * globalThis.__MOTION_INSPECT__.
     */
    function notifyAnimationStart(animation, options, transition) {
        const notify = globalThis.__MOTION_INSPECT__;
        if (!notify)
            return;
        try {
            notify({
                ...baseRecord("animation-start", animation),
                options: transition ? { ...options, ...transition } : options,
            });
        }
        catch { }
    }
    /**
     * Layout animations drive a projection node's progress rather than a
     * property, so the record forwards the live node itself: it carries the
     * DOM instance, the layout options (layoutId) and the progress handle.
     * Fired inside the frame.update that starts the animation, so nodes
     * animating in the same layout commit share frameTimestamp.
     */
    function notifyLayoutAnimationStart(animation, node) {
        const notify = globalThis.__MOTION_INSPECT__;
        if (!notify)
            return;
        try {
            notify({
                ...baseRecord("layout-animation-start", animation),
                node,
            });
        }
        catch { }
    }

    class WithPromise {
        constructor() {
            this.isResolved = false;
        }
        get finished() {
            if (!this._finished) {
                this._finished = this.isResolved
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                        this._resolve = resolve;
                    });
            }
            return this._finished;
        }
        updateFinished() {
            this._finished = this._resolve = undefined;
            this.isResolved = false;
        }
        notifyFinished() {
            this.isResolved = true;
            this._resolve?.();
        }
        /**
         * Allows the animation to be awaited.
         *
         * @deprecated Use `finished` instead.
         */
        then(onResolve, onReject) {
            return this.finished.then(onResolve, onReject);
        }
    }

    const percentToProgress = (percent) => percent / 100;
    const round = (value) => Math.round(value * 10000) / 10000;
    class JSAnimation extends WithPromise {
        constructor(options) {
            super();
            this.state = "idle";
            this.startTime = null;
            this.isStopped = false;
            /**
             * The current time of the animation.
             */
            this.currentTime = 0;
            /**
             * The time at which the animation was paused.
             */
            this.holdTime = null;
            /**
             * Playback speed as a factor. 0 would be stopped, -1 reverse and 2 double speed.
             */
            this.playbackSpeed = 1;
            /**
             * Reusable state object for the delay phase to avoid
             * allocating a new object every frame.
             */
            this.delayState = {
                done: false,
                value: undefined,
            };
            /**
             * This method is bound to the instance to fix a pattern where
             * animation.stop is returned as a reference from a useEffect.
             */
            this.stop = () => {
                const { motionValue } = this.options;
                if (motionValue && motionValue.updatedAt !== time.now()) {
                    this.tick(time.now());
                }
                this.isStopped = true;
                if (this.state === "idle")
                    return;
                this.teardown();
                this.options.onStop?.();
            };
            this.options = options;
            this.initAnimation();
            this.play();
            if (options.autoplay === false)
                this.pause();
            notifyAnimationStart(this, this.options);
        }
        initAnimation() {
            const { options } = this;
            replaceTransitionType(options);
            const { type = keyframes, repeat = 0, repeatDelay = 0, repeatType, velocity = 0, } = options;
            let { keyframes: keyframes$1 } = options;
            const generatorFactory = type || keyframes;
            if (generatorFactory !== keyframes) {
                exports.invariant(keyframes$1.length <= 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${keyframes$1}`, "spring-two-frames");
            }
            /**
             * This runs again when a spring is flattened to attach it to a
             * timeline, and the keyframes generator blends values itself.
             */
            this.mixKeyframes = undefined;
            if (generatorFactory !== keyframes &&
                typeof keyframes$1[0] !== "number") {
                this.mixKeyframes = pipe(percentToProgress, options.mixer?.(keyframes$1[0], keyframes$1[1]) ||
                    mix(keyframes$1[0], keyframes$1[1]));
                keyframes$1 = [0, 100];
            }
            const generator = generatorFactory(keyframes$1 === options.keyframes
                ? options
                : { ...options, keyframes: keyframes$1 });
            /**
             * If we have a mirror repeat type we need to create a second generator that outputs the
             * mirrored (not reversed) animation and later ping pong between the two generators.
             */
            if (repeatType === "mirror") {
                this.mirroredGenerator = generatorFactory({
                    ...options,
                    keyframes: [...keyframes$1].reverse(),
                    velocity: -velocity,
                });
            }
            /**
             * If duration is undefined and we have repeat options,
             * we need to calculate a duration from the generator.
             *
             * We set it to the generator itself to cache the duration.
             * Any timeline resolver will need to have already precalculated
             * the duration by this step.
             */
            if (generator.calculatedDuration === null) {
                generator.calculatedDuration = calcGeneratorDuration(generator);
            }
            const { calculatedDuration } = generator;
            this.calculatedDuration = calculatedDuration;
            this.resolvedDuration = calculatedDuration + repeatDelay;
            this.totalDuration = this.resolvedDuration * (repeat + 1) - repeatDelay;
            this.generator = generator;
        }
        updateTime(timestamp) {
            // Rounding the time because floating point arithmetic is not always accurate, e.g. 3000.367 - 1000.367 =
            // 2000.0000000000002. This is a problem when we are comparing the currentTime with the duration, for
            // example.
            this.currentTime =
                this.holdTime ??
                    Math.round(timestamp - this.startTime) * this.playbackSpeed;
        }
        tick(timestamp, sample = false) {
            const { generator, totalDuration, calculatedDuration } = this;
            if (this.startTime === null)
                return generator.next(0);
            const { delay = 0, keyframes, type, onUpdate, finalKeyframe, } = this.options;
            if (this.startTime === this.pendingStartTime) {
                this.startTime = resolveStartTime(this.startTime, timestamp);
            }
            this.pendingStartTime = undefined;
            /**
             * requestAnimationFrame timestamps can come through as lower than
             * the startTime as set by performance.now(). Here we prevent this,
             * though in the future it could be possible to make setting startTime
             * a pending operation that gets resolved here.
             */
            if (this.speed > 0) {
                this.startTime = Math.min(this.startTime, timestamp);
            }
            else if (this.speed < 0) {
                this.startTime = Math.min(timestamp - totalDuration / this.speed, this.startTime);
            }
            if (sample) {
                this.currentTime = timestamp;
            }
            else {
                this.updateTime(timestamp);
            }
            // Rebase on delay
            const timeWithoutDelay = this.currentTime - delay * (this.playbackSpeed >= 0 ? 1 : -1);
            const isInDelayPhase = this.playbackSpeed >= 0
                ? timeWithoutDelay < 0
                : timeWithoutDelay > totalDuration;
            this.currentTime = Math.max(timeWithoutDelay, 0);
            // If this animation has finished, set the current time  to the total duration.
            if (this.state === "finished" && this.holdTime === null) {
                this.currentTime = totalDuration;
            }
            const state = this.generate(this.currentTime, isInDelayPhase);
            let { done } = state;
            /**
             * A generator that takes longer than maxGeneratorDuration to finish
             * has an Infinity duration, so played forwards it finishes when it
             * says it's done.
             */
            if (!isInDelayPhase) {
                done =
                    this.playbackSpeed >= 0
                        ? calculatedDuration < Infinity
                            ? this.currentTime >= totalDuration
                            : done
                        : this.currentTime <= 0;
            }
            const isAnimationFinished = this.holdTime === null &&
                (this.state === "finished" || (this.state === "running" && done));
            // TODO: The exception for inertia could be cleaner here
            if (isAnimationFinished && type !== inertia) {
                state.value = getFinalKeyframe(keyframes, this.options, finalKeyframe, this.speed);
            }
            if (onUpdate) {
                onUpdate(state.value);
            }
            if (isAnimationFinished) {
                this.finish();
            }
            return state;
        }
        /**
         * This animation's time, including delay, at a timestamp.
         */
        at(timestamp) {
            return (this.holdTime ??
                round((timestamp - this.startTime) * this.playbackSpeed));
        }
        /**
         * The value at a timestamp, without changing this animation's state.
         * If resolved, it ends at the last resolved keyframe, which is in the
         * same unit as the others, rather than at finalKeyframe.
         */
        sampleAt(timestamp, resolved) {
            const { options, totalDuration } = this;
            const t = this.at(timestamp) - (options.delay || 0);
            return t >= totalDuration && options.type !== inertia
                ? getFinalKeyframe(options.keyframes, options, resolved ? undefined : options.finalKeyframe)
                : this.generate(Math.max(t, 0), t < 0).value;
        }
        /**
         * The generator's state `currentTime` ms after the delay, without
         * changing the animation's own state.
         */
        generate(currentTime, isInDelayPhase) {
            const { generator, totalDuration, mixKeyframes, mirroredGenerator, resolvedDuration, } = this;
            const { keyframes, repeat, repeatType, repeatDelay } = this.options;
            let elapsed = currentTime;
            let frameGenerator = generator;
            if (repeat) {
                /**
                 * Get the current progress (0-1) of the animation. If t is >
                 * than duration we'll get values like 2.5 (midway through the
                 * third iteration)
                 */
                const progress = Math.min(currentTime, totalDuration) / resolvedDuration;
                /**
                 * Get the current iteration (0 indexed). For instance the floor of
                 * 2.5 is 2.
                 */
                let currentIteration = Math.floor(progress);
                /**
                 * Get the current progress of the iteration by taking the remainder
                 * so 2.5 is 0.5 through iteration 2
                 */
                let iterationProgress = progress % 1.0;
                /**
                 * If iteration progress is 1 we count that as the end
                 * of the previous iteration.
                 */
                if (!iterationProgress && progress >= 1) {
                    iterationProgress = 1;
                }
                iterationProgress === 1 && currentIteration--;
                currentIteration = Math.min(currentIteration, repeat + 1);
                /**
                 * Reverse progress if we're not running in "normal" direction
                 */
                const isOddIteration = Boolean(currentIteration % 2);
                if (isOddIteration) {
                    if (repeatType === "reverse") {
                        iterationProgress = 1 - iterationProgress;
                        if (repeatDelay) {
                            iterationProgress -= repeatDelay / resolvedDuration;
                        }
                    }
                    else if (repeatType === "mirror") {
                        frameGenerator = mirroredGenerator;
                    }
                }
                elapsed = clamp(0, 1, iterationProgress) * resolvedDuration;
            }
            /**
             * If we're in negative time, set state as the initial keyframe.
             * This prevents delay: x, duration: 0 animations from finishing
             * instantly.
             */
            let state;
            if (isInDelayPhase) {
                this.delayState.value = keyframes[0];
                state = this.delayState;
            }
            else {
                state = frameGenerator.next(elapsed);
            }
            if (mixKeyframes && !isInDelayPhase) {
                state.value = mixKeyframes(state.value);
            }
            return state;
        }
        get duration() {
            return millisecondsToSeconds(this.calculatedDuration);
        }
        get iterationDuration() {
            return this.duration + millisecondsToSeconds(this.options.delay ?? 0);
        }
        get time() {
            return millisecondsToSeconds(this.currentTime);
        }
        set time(newTime) {
            newTime = secondsToMilliseconds(newTime);
            this.currentTime = newTime;
            if (this.startTime === null ||
                this.holdTime !== null ||
                this.playbackSpeed === 0) {
                this.holdTime = newTime;
            }
            else if (this.driver) {
                this.startTime = this.driver.now() - newTime / this.playbackSpeed;
            }
            if (this.driver) {
                this.driver.start(false);
            }
            else {
                this.startTime = 0;
                this.state = "paused";
                this.holdTime = newTime;
                this.tick(newTime);
            }
        }
        /**
         * Returns the generator's velocity at the current time in units/second.
         * Uses the analytical derivative when available (springs), avoiding
         * the MotionValue's frame-dependent velocity estimation.
         */
        getGeneratorVelocity() {
            return calcGeneratorVelocity(this.generator, this.currentTime, this.options.velocity);
        }
        get speed() {
            return this.playbackSpeed;
        }
        set speed(newSpeed) {
            const hasChanged = this.playbackSpeed !== newSpeed;
            if (hasChanged && this.driver) {
                this.updateTime(time.now());
            }
            this.playbackSpeed = newSpeed;
            if (hasChanged && this.driver) {
                this.time = millisecondsToSeconds(this.currentTime);
            }
        }
        play() {
            if (this.isStopped)
                return;
            const { driver = frameloopDriver, startTime } = this.options;
            if (!this.driver) {
                this.driver = driver((timestamp) => this.tick(timestamp));
            }
            this.options.onPlay?.();
            const now = this.driver.now();
            if (this.state === "finished") {
                this.updateFinished();
                this.startTime = now;
            }
            else if (this.holdTime !== null) {
                this.startTime = now - this.holdTime / (this.playbackSpeed || 1);
            }
            else if (!this.startTime) {
                this.startTime = startTime ?? (this.pendingStartTime = now);
            }
            if (this.state === "finished" && this.speed < 0) {
                this.startTime += this.calculatedDuration;
            }
            this.holdTime = null;
            /**
             * Set playState to running only after we've used it in
             * the previous logic.
             */
            this.state = "running";
            this.driver.start();
        }
        pause() {
            this.state = "paused";
            this.updateTime(time.now());
            this.holdTime = this.currentTime;
        }
        complete() {
            if (this.state !== "running") {
                this.play();
            }
            this.state = "finished";
            this.holdTime = null;
        }
        finish() {
            this.notifyFinished();
            this.teardown();
            this.state = "finished";
            this.options.onComplete?.();
        }
        cancel() {
            this.holdTime = null;
            this.startTime = 0;
            this.tick(0);
            this.teardown();
            this.options.onCancel?.();
        }
        teardown() {
            this.state = "idle";
            this.driver?.stop();
            this.driver = undefined;
            this.startTime = this.holdTime = null;
        }
        sample(sampleTime) {
            this.startTime = 0;
            return this.tick(sampleTime, true);
        }
        attachTimeline(timeline) {
            if (this.options.allowFlatten) {
                this.options.type = "keyframes";
                this.options.ease = "linear";
                this.initAnimation();
            }
            this.driver?.stop();
            return timeline.observe(this);
        }
    }
    // Legacy function support
    function animateValue(options) {
        return new JSAnimation(options);
    }

    /**
     * Properties that should default to 1 or 100%
     */
    const maxDefaults = new Set(["brightness", "contrast", "saturate", "opacity"]);
    function applyDefaultFilter(v) {
        const [name, value] = v.slice(0, -1).split("(");
        if (name === "drop-shadow")
            return v;
        const [number] = value.match(floatRegex) || [];
        if (!number)
            return v;
        const unit = value.replace(number, "");
        let defaultValue = maxDefaults.has(name) ? 1 : 0;
        if (number !== value)
            defaultValue *= 100;
        return name + "(" + defaultValue + unit + ")";
    }
    const functionRegex = /\b([a-z-]*)\(.*?\)/gu;
    const filter = {
        ...complex,
        getAnimatableNone: (v) => {
            const functions = v.match(functionRegex);
            return functions ? functions.map(applyDefaultFilter).join(" ") : v;
        },
    };

    const mask = {
        ...complex,
        getAnimatableNone: (v) => {
            const parsed = complex.parse(v);
            const transformer = complex.createTransformer(v);
            return transformer(parsed.map((v) => typeof v === "number" ? 0 : typeof v === "object" ? { ...v, alpha: 1 } : v));
        },
    };

    const int = {
        ...number,
        transform: Math.round,
    };

    const transformValueTypes = {
        rotate: degrees,
        /**
         * Internal channel for `transition.path` orientToPath. Composed onto
         * `rotate` at the transform-build sites so the user's `rotate` is
         * never read or overwritten. Not part of `transformPropOrder`.
         */
        pathRotation: degrees,
        rotateX: degrees,
        rotateY: degrees,
        rotateZ: degrees,
        scale,
        scaleX: scale,
        scaleY: scale,
        scaleZ: scale,
        skew: degrees,
        skewX: degrees,
        skewY: degrees,
        distance: px,
        translateX: px,
        translateY: px,
        translateZ: px,
        x: px,
        y: px,
        z: px,
        perspective: px,
        transformPerspective: px,
        opacity: alpha,
        originX: progressPercentage,
        originY: progressPercentage,
        originZ: px,
    };

    const numberValueTypes = {
        // Border props
        borderWidth: px,
        borderTopWidth: px,
        borderRightWidth: px,
        borderBottomWidth: px,
        borderLeftWidth: px,
        borderRadius: px,
        borderTopLeftRadius: px,
        borderTopRightRadius: px,
        borderBottomRightRadius: px,
        borderBottomLeftRadius: px,
        // Positioning props
        width: px,
        maxWidth: px,
        height: px,
        maxHeight: px,
        top: px,
        right: px,
        bottom: px,
        left: px,
        inset: px,
        insetBlock: px,
        insetBlockStart: px,
        insetBlockEnd: px,
        insetInline: px,
        insetInlineStart: px,
        insetInlineEnd: px,
        // Spacing props
        padding: px,
        paddingTop: px,
        paddingRight: px,
        paddingBottom: px,
        paddingLeft: px,
        paddingBlock: px,
        paddingBlockStart: px,
        paddingBlockEnd: px,
        paddingInline: px,
        paddingInlineStart: px,
        paddingInlineEnd: px,
        margin: px,
        marginTop: px,
        marginRight: px,
        marginBottom: px,
        marginLeft: px,
        marginBlock: px,
        marginBlockStart: px,
        marginBlockEnd: px,
        marginInline: px,
        marginInlineStart: px,
        marginInlineEnd: px,
        // Typography
        fontSize: px,
        // Misc
        backgroundPositionX: px,
        backgroundPositionY: px,
        ...transformValueTypes,
        zIndex: int,
        // SVG
        fillOpacity: alpha,
        strokeOpacity: alpha,
        numOctaves: int,
    };

    /**
     * A map of default value types for common values
     */
    const defaultValueTypes = {
        ...numberValueTypes,
        // Color props
        color,
        backgroundColor: color,
        outlineColor: color,
        fill: color,
        stroke: color,
        // Border props
        borderColor: color,
        borderTopColor: color,
        borderRightColor: color,
        borderBottomColor: color,
        borderLeftColor: color,
        filter,
        WebkitFilter: filter,
        mask,
        WebkitMask: mask,
    };
    /**
     * Gets the default ValueType for the provided value key
     */
    const getDefaultValueType = (key) => defaultValueTypes[key];

    const customTypes = /*@__PURE__*/ new Set([filter, mask]);
    function getAnimatableNone(key, value) {
        let defaultValueType = getDefaultValueType(key);
        if (!customTypes.has(defaultValueType))
            defaultValueType = complex;
        // If value is not recognised as animatable, ie "none", create an animatable version origin based on the target
        return defaultValueType.getAnimatableNone
            ? defaultValueType.getAnimatableNone(value)
            : undefined;
    }

    function fillWildcards(keyframes) {
        for (let i = 1; i < keyframes.length; i++) {
            keyframes[i] ?? (keyframes[i] = keyframes[i - 1]);
        }
    }

    const radToDeg = (rad) => (rad * 180) / Math.PI;
    const rotate = (v) => {
        const angle = radToDeg(Math.atan2(v[1], v[0]));
        return rebaseAngle(angle);
    };
    const matrix2dParsers = {
        x: 4,
        y: 5,
        translateX: 4,
        translateY: 5,
        scaleX: 0,
        scaleY: 3,
        scaleZ: () => 1,
        scale: (v) => (Math.abs(v[0]) + Math.abs(v[3])) / 2,
        rotate,
        rotateZ: rotate,
        skewX: (v) => radToDeg(Math.atan(v[1])),
        skewY: (v) => radToDeg(Math.atan(v[2])),
        skew: (v) => (Math.abs(v[1]) + Math.abs(v[2])) / 2,
    };
    const rebaseAngle = (angle) => {
        angle = angle % 360;
        if (angle < 0)
            angle += 360;
        return angle;
    };
    const rotateZ = rotate;
    const scaleX = (v) => Math.hypot(v[0], v[1]);
    const scaleY = (v) => Math.hypot(v[4], v[5]);
    const matrix3dParsers = {
        x: 12,
        y: 13,
        z: 14,
        translateX: 12,
        translateY: 13,
        translateZ: 14,
        scaleX,
        scaleY,
        scaleZ: (v) => Math.hypot(v[8], v[9], v[10]),
        scale: (v) => (scaleX(v) + scaleY(v)) / 2,
        rotateX: (v) => rebaseAngle(radToDeg(Math.atan2(v[6], v[5]))),
        rotateY: (v) => rebaseAngle(radToDeg(Math.atan2(-v[2], v[0]))),
        rotateZ,
        rotate: rotateZ,
        skewX: (v) => radToDeg(Math.atan(v[4])),
        skewY: (v) => radToDeg(Math.atan(v[1])),
        skew: (v) => (Math.abs(v[1]) + Math.abs(v[4])) / 2,
    };
    function defaultTransformValue(name) {
        return name.includes("scale") ? 1 : 0;
    }
    function parseValueFromTransform(transform, name) {
        if (!transform || transform === "none") {
            return defaultTransformValue(name);
        }
        const match = transform.match(/^matrix(3d)?\(([-\d.e\s,]+)\)$/u);
        if (!match) {
            return defaultTransformValue(name);
        }
        const valueParser = (match[1] ? matrix3dParsers : matrix2dParsers)[name];
        /**
         * parseFloat skips leading whitespace and stops at trailing whitespace.
         */
        const values = match[2].split(",").map((v) => parseFloat(v));
        return typeof valueParser === "function"
            ? valueParser(values)
            : values[valueParser];
    }
    const readTransformValue = (instance, name) => {
        const { transform = "none" } = getComputedStyle(instance);
        return parseValueFromTransform(transform, name);
    };

    /**
     * Generate a list of every possible transform key.
     */
    const transformPropOrder = [
        "transformPerspective",
        "x",
        "y",
        "z",
        "translateX",
        "translateY",
        "translateZ",
        "scale",
        "scaleX",
        "scaleY",
        "scaleZ",
        "rotate",
        "rotateX",
        "rotateY",
        "rotateZ",
        "skew",
        "skewX",
        "skewY",
    ];
    /**
     * A quick lookup for transform props.
     *
     * `pathRotation` is a transform for routing purposes (skipped from raw
     * style application, wired to the transform composite, flags transform
     * dirty) but is intentionally NOT in `transformPropOrder` — it is
     * composed onto `rotate` at the build sites, not serialized in its own
     * slot, and must stay out of the order-array consumers (parse-transform,
     * unit-conversion, keys-position).
     */
    const transformProps = /*@__PURE__*/ (() => new Set([...transformPropOrder, "pathRotation"]))();

    const isNumOrPxType = (v) => v === number || v === px;
    const transformKeys = new Set(["x", "y", "z"]);
    const nonTranslationalTransformKeys = /* @__PURE__ */ transformPropOrder.filter((key) => !transformKeys.has(key));
    /**
     * Reset any bounding box-changing transforms so the element can be
     * measured. Returns the values to restore. Values already at their
     * default don't change the box, so they're left alone: an element with
     * only `rotate: 0` doesn't need to be re-rendered before measuring.
     */
    function removeNonTranslationalTransform(visualElement) {
        const removedTransforms = [];
        nonTranslationalTransformKeys.forEach((key) => {
            const value = visualElement.getValue(key);
            if (value !== undefined) {
                const current = value.get();
                const reset = key.startsWith("scale") ? 1 : 0;
                if (current === reset)
                    return;
                removedTransforms.push([key, current]);
                value.set(reset);
            }
        });
        return removedTransforms;
    }
    /**
     * Values that can only be measured from the bounding box. Elements with
     * these values need bounding box-changing transforms removed first.
     */
    const boxDependentValues = new Set(["bottom", "right"]);
    /**
     * Computed width/height is already in pixels and unaffected by
     * transforms. It's "auto" for elements without a layout box (e.g. inline),
     * in which case we fall back to measuring the bounding box.
     */
    function measureDimension(computed, measureBox, axis, paddingStart, paddingEnd, boxSizing) {
        const px = parseFloat(computed);
        if (!isNaN(px))
            return px;
        const { min, max } = measureBox()[axis];
        const size = max - min;
        return boxSizing === "border-box"
            ? size
            : size - parseFloat(paddingStart) - parseFloat(paddingEnd);
    }
    const transformX = ({ transform }) => parseValueFromTransform(transform, "x");
    const transformY = ({ transform }) => parseValueFromTransform(transform, "y");
    const positionalValues = {
        // Dimensions
        width: ({ width, paddingLeft = "0", paddingRight = "0", boxSizing }, measureBox) => measureDimension(width, measureBox, "x", paddingLeft, paddingRight, boxSizing),
        height: ({ height, paddingTop = "0", paddingBottom = "0", boxSizing }, measureBox) => measureDimension(height, measureBox, "y", paddingTop, paddingBottom, boxSizing),
        top: ({ top }) => parseFloat(top),
        left: ({ left }) => parseFloat(left),
        bottom: ({ top }, measureBox) => {
            const { y } = measureBox();
            return parseFloat(top) + (y.max - y.min);
        },
        right: ({ left }, measureBox) => {
            const { x } = measureBox();
            return parseFloat(left) + (x.max - x.min);
        },
        // Transform, including translate longform names
        x: transformX,
        y: transformY,
        translateX: transformX,
        translateY: transformY,
    };

    const toResolve = new Set();
    let isScheduled = false;
    let anyNeedsMeasurement = false;
    let isForced = false;
    function measureAllKeyframes() {
        if (anyNeedsMeasurement) {
            const resolversToMeasure = [];
            const elementsToMeasure = new Set();
            const elementsToUntransform = new Set();
            toResolve.forEach((resolver) => {
                if (!resolver.needsMeasurement)
                    return;
                resolversToMeasure.push(resolver);
                elementsToMeasure.add(resolver.element);
                if (boxDependentValues.has(resolver.name)) {
                    elementsToUntransform.add(resolver.element);
                }
            });
            const transformsToRestore = new Map();
            /**
             * Write pass
             * Values measured from the bounding box need bounding box-changing
             * transforms removed first. Values read from computed style don't.
             */
            elementsToUntransform.forEach((element) => {
                const removedTransforms = removeNonTranslationalTransform(element);
                if (!removedTransforms.length)
                    return;
                transformsToRestore.set(element, removedTransforms);
                element.render();
            });
            // Read
            resolversToMeasure.forEach((resolver) => resolver.measureInitialState());
            // Write
            elementsToMeasure.forEach((element) => {
                element.render();
                const restore = transformsToRestore.get(element);
                if (restore) {
                    restore.forEach(([key, value]) => {
                        element.getValue(key)?.set(value);
                    });
                }
            });
            // Read
            resolversToMeasure.forEach((resolver) => resolver.measureEndState());
            // Write
            resolversToMeasure.forEach((resolver) => {
                if (resolver.suspendedScrollY !== undefined) {
                    window.scrollTo(0, resolver.suspendedScrollY);
                }
            });
        }
        anyNeedsMeasurement = false;
        isScheduled = false;
        toResolve.forEach((resolver) => resolver.complete(isForced));
        toResolve.clear();
    }
    function readAllKeyframes() {
        toResolve.forEach((resolver) => {
            resolver.readKeyframes();
            if (resolver.needsMeasurement) {
                anyNeedsMeasurement = true;
            }
        });
    }
    function flushKeyframeResolvers() {
        isForced = true;
        readAllKeyframes();
        measureAllKeyframes();
        isForced = false;
    }
    /**
     * Normalise a value read from the subject into an animation origin: a
     * number read as a string ("0", "200") becomes a number, and a value
     * that isn't animatable (e.g. "none") but whose target is becomes an
     * animatable zero in the shape of the target.
     */
    function readOrigin(value, name, target) {
        if (typeof value === "string") {
            if (isNumericalString(value) || isZeroValueString(value)) {
                return parseFloat(value);
            }
            else if (!complex.test(value) && complex.test(target)) {
                return getAnimatableNone(name, target);
            }
        }
        return value ?? undefined;
    }
    class KeyframeResolver {
        constructor(unresolvedKeyframes, onComplete, name, motionValue, element, isAsync = false) {
            this.state = "pending";
            /**
             * Track whether this resolver is async. If it is, it'll be added to the
             * resolver queue and flushed in the next frame. Resolvers that aren't going
             * to trigger read/write thrashing don't need to be async.
             */
            this.isAsync = false;
            /**
             * Track whether this resolver needs to perform a measurement
             * to resolve its keyframes.
             */
            this.needsMeasurement = false;
            this.unresolvedKeyframes = [...unresolvedKeyframes];
            this.onComplete = onComplete;
            this.name = name;
            this.motionValue = motionValue;
            this.element = element;
            this.isAsync = isAsync;
        }
        scheduleResolve() {
            this.state = "scheduled";
            if (this.isAsync) {
                toResolve.add(this);
                if (!isScheduled) {
                    isScheduled = true;
                    frame.read(readAllKeyframes);
                    frame.resolveKeyframes(measureAllKeyframes);
                }
            }
            else {
                this.readKeyframes();
                this.complete();
            }
        }
        readKeyframes() {
            const { unresolvedKeyframes, name, element, motionValue } = this;
            // If initial keyframe is null we need to read it from the DOM
            if (unresolvedKeyframes[0] === null) {
                const currentValue = motionValue?.get();
                // TODO: This doesn't work if the final keyframe is a wildcard
                const finalKeyframe = unresolvedKeyframes[unresolvedKeyframes.length - 1];
                if (currentValue !== undefined) {
                    unresolvedKeyframes[0] = currentValue;
                }
                else if (element && name) {
                    const valueAsRead = readOrigin(element.readValue(name, finalKeyframe), name, finalKeyframe);
                    if (valueAsRead !== undefined) {
                        unresolvedKeyframes[0] = valueAsRead;
                    }
                }
                if (unresolvedKeyframes[0] === undefined) {
                    unresolvedKeyframes[0] = finalKeyframe;
                }
                if (motionValue && currentValue === undefined) {
                    motionValue.set(unresolvedKeyframes[0]);
                }
            }
            fillWildcards(unresolvedKeyframes);
        }
        setFinalKeyframe() { }
        measureInitialState() { }
        renderEndStyles() { }
        measureEndState() { }
        complete(isForcedComplete = false) {
            this.state = "complete";
            this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, isForcedComplete);
            toResolve.delete(this);
        }
        cancel() {
            if (this.state === "scheduled") {
                toResolve.delete(this);
                this.state = "pending";
            }
        }
        resume() {
            if (this.state === "pending")
                this.scheduleResolve();
        }
    }

    const isCSSVar = (name) => name.startsWith("--");

    function setStyle(element, name, value) {
        isCSSVar(name)
            ? element.style.setProperty(name, value)
            : (element.style[name] = value);
    }

    /**
     * Add the ability for test suites to manually set support flags
     * to better test more environments.
     */
    const supportsFlags = {};

    function memoSupports(callback, supportsFlag) {
        const memoized = memo(callback);
        return () => supportsFlags[supportsFlag] ?? memoized();
    }

    const supportsScrollTimeline = /* @__PURE__ */ memoSupports(() => window.ScrollTimeline !== undefined, "scrollTimeline");
    const supportsViewTimeline = /* @__PURE__ */ memoSupports(() => window.ViewTimeline !== undefined, "viewTimeline");

    const supportsLinearEasing = /*@__PURE__*/ memoSupports(() => {
        try {
            document
                .createElement("div")
                .animate({ opacity: 0 }, { easing: "linear(0, 1)" });
        }
        catch (e) {
            return false;
        }
        return true;
    }, "linearEasing");

    const cubicBezierAsString = ([a, b, c, d]) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

    const supportedWaapiEasing = {
        linear: "linear",
        ease: "ease",
        easeIn: "ease-in",
        easeOut: "ease-out",
        easeInOut: "ease-in-out",
        circIn: /*@__PURE__*/ cubicBezierAsString([0, 0.65, 0.55, 1]),
        circOut: /*@__PURE__*/ cubicBezierAsString([0.55, 0, 1, 0.45]),
        backIn: /*@__PURE__*/ cubicBezierAsString([0.31, 0.01, 0.66, -0.59]),
        backOut: /*@__PURE__*/ cubicBezierAsString([0.33, 1.53, 0.69, 0.99]),
    };

    function mapEasingToNativeEasing(easing, duration) {
        if (!easing) {
            return undefined;
        }
        else if (typeof easing === "function") {
            return supportsLinearEasing()
                ? generateLinearEasing(easing, duration)
                : "ease-out";
        }
        else if (isBezierDefinition(easing)) {
            return cubicBezierAsString(easing);
        }
        else if (Array.isArray(easing)) {
            return easing.map((segmentEasing) => mapEasingToNativeEasing(segmentEasing, duration) ||
                supportedWaapiEasing.easeOut);
        }
        else {
            return supportedWaapiEasing[easing];
        }
    }

    function startWaapiAnimation(element, valueName, keyframes, { delay = 0, duration = 300, repeat = 0, repeatType = "loop", ease = "easeOut", times, } = {}, pseudoElement = undefined) {
        const keyframeOptions = {
            [valueName]: keyframes,
        };
        if (times)
            keyframeOptions.offset = times;
        const easing = mapEasingToNativeEasing(ease, duration);
        /**
         * If this is an easing array, apply to keyframes, not animation as a whole
         */
        if (Array.isArray(easing))
            keyframeOptions.easing = easing;
        const options = {
            delay,
            duration,
            easing: !Array.isArray(easing) ? easing : "linear",
            fill: "both",
            iterations: repeat + 1,
            direction: repeatType === "reverse" ? "alternate" : "normal",
        };
        if (pseudoElement)
            options.pseudoElement = pseudoElement;
        return element.animate(keyframeOptions, options);
    }

    function isGenerator(type) {
        return typeof type === "function" && "applyToOptions" in type;
    }

    function applyGeneratorOptions({ type, ...options }) {
        if (isGenerator(type) && supportsLinearEasing()) {
            return type.applyToOptions(options);
        }
        else {
            options.duration ?? (options.duration = 300);
            options.ease ?? (options.ease = "easeOut");
        }
        return options;
    }

    /**
     * NativeAnimation implements AnimationPlaybackControls for the browser's Web Animations API.
     */
    class NativeAnimation extends WithPromise {
        constructor(options) {
            super();
            this.finishedTime = null;
            this.isStopped = false;
            /**
             * Tracks a manually-set start time that takes precedence over WAAPI's
             * dynamic startTime. This is cleared when play() or time setter is called,
             * allowing WAAPI to take over timing.
             */
            this.manualStartTime = null;
            if (!options)
                return;
            const { element, name, keyframes, pseudoElement, allowFlatten = false, finalKeyframe, onComplete, } = options;
            this.isPseudoElement = Boolean(pseudoElement);
            this.allowFlatten = allowFlatten;
            this.options = options;
            typeof process !== "undefined" &&
                "development" !== "production" &&
                exports.invariant(typeof options.type !== "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
            const transition = applyGeneratorOptions(options);
            this.animation = startWaapiAnimation(element, name, keyframes, transition, pseudoElement);
            if (transition.autoplay === false) {
                this.animation.pause();
            }
            this.animation.onfinish = () => {
                this.finishedTime = this.time;
                if (!pseudoElement) {
                    const keyframe = getFinalKeyframe(keyframes, this.options, finalKeyframe, this.speed);
                    this.updateMotionValue?.(keyframe);
                    /**
                     * If we can, we want to commit the final style as set by the user,
                     * rather than the computed keyframe value supplied by the animation.
                     * We always do this, even when a motion value is present, to prevent
                     * a visual flash in Firefox where the WAAPI animation's fill is removed
                     * during cancel() before the scheduled render can apply the correct value.
                     */
                    setStyle(element, name, keyframe);
                    this.animation.cancel();
                }
                onComplete?.();
                this.notifyFinished();
            };
            notifyAnimationStart(this, options, transition);
        }
        play() {
            if (this.isStopped)
                return;
            this.manualStartTime = null;
            this.animation.play();
            if (this.state === "finished") {
                this.updateFinished();
            }
        }
        pause() {
            this.animation.pause();
        }
        complete() {
            this.animation.finish?.();
        }
        cancel() {
            try {
                this.animation.cancel();
            }
            catch (e) { }
        }
        stop() {
            if (this.isStopped)
                return;
            this.isStopped = true;
            /**
             * Before its finish event, a finished animation (an instant one is
             * as soon as it starts) is still showing its end, so it's stopped
             * like a running one. Otherwise that event would apply its end
             * over whatever animates the value next.
             */
            if (this.state === "idle" || this.finishedTime !== null)
                return;
            if (this.updateMotionValue) {
                this.updateMotionValue();
            }
            else {
                this.commitStyles();
            }
            if (!this.isPseudoElement) {
                this.animation.onfinish = null;
                this.cancel();
            }
        }
        /**
         * WAAPI doesn't natively have any interruption capabilities.
         *
         * In this method, we commit styles back to the DOM before cancelling
         * the animation.
         *
         * This is designed to be overridden by NativeAnimationExtended, which
         * will create a renderless JS animation and sample it twice to calculate
         * its current value, "previous" value, and therefore allow
         * Motion to also correctly calculate velocity for any subsequent animation
         * while deferring the commit until the next animation frame.
         */
        commitStyles() {
            const element = this.options?.element;
            if (!this.isPseudoElement && element?.isConnected) {
                this.animation.commitStyles?.();
            }
        }
        get duration() {
            const duration = this.animation.effect?.getComputedTiming?.().duration || 0;
            return millisecondsToSeconds(Number(duration));
        }
        get iterationDuration() {
            const { delay = 0 } = this.options || {};
            return this.duration + millisecondsToSeconds(delay);
        }
        get time() {
            return millisecondsToSeconds(Number(this.animation.currentTime) || 0);
        }
        set time(newTime) {
            const wasFinished = this.finishedTime !== null;
            this.manualStartTime = null;
            this.finishedTime = null;
            this.animation.currentTime = secondsToMilliseconds(newTime);
            if (wasFinished) {
                this.animation.pause();
            }
        }
        /**
         * The playback speed of the animation.
         * 1 = normal speed, 2 = double speed, 0.5 = half speed.
         */
        get speed() {
            return this.animation.playbackRate;
        }
        set speed(newSpeed) {
            // Allow backwards playback after finishing
            if (newSpeed < 0)
                this.finishedTime = null;
            this.animation.playbackRate = newSpeed;
        }
        get state() {
            return this.finishedTime !== null
                ? "finished"
                : this.animation.playState;
        }
        get startTime() {
            return this.manualStartTime ?? Number(this.animation.startTime);
        }
        set startTime(newStartTime) {
            this.manualStartTime = this.animation.startTime = newStartTime;
        }
        /**
         * Attaches a timeline to the animation, for instance the `ScrollTimeline`.
         */
        attachTimeline({ timeline, onAttach, observe, }) {
            if (this.allowFlatten) {
                this.animation.effect?.updateTiming({ easing: "linear" });
            }
            this.animation.onfinish = null;
            if (timeline && supportsScrollTimeline()) {
                this.animation.timeline = timeline;
                onAttach?.(this.animation);
                return noop;
            }
            else {
                return observe(this);
            }
        }
    }

    const unsupportedEasingFunctions = {
        anticipate,
        backInOut,
        circInOut,
    };
    function isUnsupportedEase(key) {
        return key in unsupportedEasingFunctions;
    }
    function replaceStringEasing(transition) {
        if (typeof transition.ease === "string" &&
            isUnsupportedEase(transition.ease)) {
            transition.ease = unsupportedEasingFunctions[transition.ease];
        }
    }

    /**
     * 10ms is chosen here as it strikes a balance between smooth
     * results (more than one keyframe per frame at 60fps) and
     * keyframe quantity.
     */
    const sampleDelta = 10; //ms
    class NativeAnimationExtended extends NativeAnimation {
        constructor(options) {
            /**
             * The base NativeAnimation function only supports a subset
             * of Motion easings, and WAAPI also only supports some
             * easing functions via string/cubic-bezier definitions.
             *
             * This function replaces those unsupported easing functions
             * with a JS easing function. This will later get compiled
             * to a linear() easing function.
             */
            replaceStringEasing(options);
            /**
             * Ensure we replace the transition type with a generator function
             * before passing to WAAPI.
             *
             * TODO: Does this have a better home? It could be shared with
             * JSAnimation.
             */
            replaceTransitionType(options);
            super(options);
            /**
             * Only set startTime when the animation should autoplay.
             * Setting startTime on a paused WAAPI animation unpauses it
             * (per the WAAPI spec), which breaks autoplay: false.
             */
            if (options.startTime !== undefined && options.autoplay !== false) {
                this.startTime = options.startTime;
            }
            this.options = options;
        }
        /**
         * The animation's time now, in ms. Wall-clock rather than WAAPI's
         * currentTime while running, as under CPU load currentTime may not
         * reflect the actual elapsed time, causing incorrect sampling and
         * visual jumps.
         */
        elapsed() {
            return this.state === "running"
                ? (time.now() - this.startTime) * this.speed
                : this.time * 1000;
        }
        /**
         * The value at a time, from a renderless JS animation.
         */
        sample(sampleTime) {
            if (!this.sampler) {
                const { motionValue, onUpdate, onComplete, onPlay, onStop, element, ...options } = this.options;
                /**
                 * Stop it straight away so its driver doesn't run every frame.
                 * It can still be sampled.
                 */
                this.sampler = new JSAnimation({ ...options, autoplay: false });
                this.sampler.stop();
            }
            return this.sampler.sample(Math.max(0, sampleTime)).value;
        }
        /**
         * The value now, as WAAPI doesn't set the motion value while it runs.
         */
        liveValue() {
            const { state } = this;
            if (state === "running" || state === "paused") {
                return this.sample(this.elapsed());
            }
        }
        /**
         * WAAPI doesn't natively have any interruption capabilities.
         *
         * Rather than read committed styles back out of the DOM, we can
         * sample a renderless JS animation twice to calculate its current
         * value, "previous" value, and therefore allow Motion to calculate
         * velocity for any subsequent animation.
         */
        updateMotionValue(value) {
            const { motionValue, element, name } = this.options;
            if (!motionValue)
                return;
            if (value !== undefined) {
                motionValue.set(value);
                return;
            }
            const { speed } = this;
            const sampleTime = this.elapsed();
            const delta = this.state === "running" && speed
                ? clamp(0, sampleDelta, sampleTime)
                : 0;
            const current = this.sample(sampleTime);
            /**
             * Write the estimated value to inline style so it persists
             * after cancel(), covering the async gap before the next
             * animation starts.
             */
            if (element && name)
                setStyle(element, name, current);
            motionValue.setWithVelocity(this.sample(sampleTime - delta * Math.sign(speed)), current, delta / Math.abs(speed || 1));
        }
    }

    /**
     * Check if a value is animatable. Examples:
     *
     * ✅: 100, "100px", "#fff"
     * ❌: "block", "url(2.jpg)"
     * @param value
     *
     * @internal
     */
    const isAnimatable = (value, name) => {
        // If the list of keys that might be non-animatable grows, replace with Set
        if (name === "zIndex")
            return false;
        // If it's a number or a keyframes array, we can animate it. We might at some point
        // need to do a deep isAnimatable check of keyframes, or let Popmotion handle this,
        // but for now lets leave it like this for performance reasons
        if (typeof value === "number" || Array.isArray(value))
            return true;
        if (typeof value === "string" && // It's animatable if we have a string
            (complex.test(value) || value === "0") && // And it contains numbers and/or colors
            !value.startsWith("url(") // Unless it starts with "url("
        ) {
            return true;
        }
        return false;
    };

    function hasKeyframesChanged(keyframes) {
        const current = keyframes[0];
        if (keyframes.length === 1)
            return true;
        for (let i = 0; i < keyframes.length; i++) {
            if (keyframes[i] !== current)
                return true;
        }
    }
    function canAnimate(keyframes, name, type, velocity) {
        /**
         * Check if we're able to animate between the start and end keyframes,
         * and throw a warning if we're attempting to animate between one that's
         * animatable and another that isn't.
         */
        const originKeyframe = keyframes[0];
        if (originKeyframe === null) {
            return false;
        }
        /**
         * These aren't traditionally animatable but we do support them.
         * In future we could look into making this more generic or replacing
         * this function with mix() === mixImmediate
         */
        if (name === "display" || name === "visibility")
            return true;
        const targetKeyframe = keyframes[keyframes.length - 1];
        const isOriginAnimatable = isAnimatable(originKeyframe, name);
        const isTargetAnimatable = isAnimatable(targetKeyframe, name);
        // Always skip if any of these are true
        if (!isOriginAnimatable || !isTargetAnimatable) {
            // Only build the message when we're going to warn
            isOriginAnimatable !== isTargetAnimatable &&
                "development" !== "production" &&
                exports.warning(false, `You are trying to animate ${name} from "${originKeyframe}" to "${targetKeyframe}". "${isOriginAnimatable ? targetKeyframe : originKeyframe}" is not an animatable value.`, "value-not-animatable");
            return false;
        }
        return (hasKeyframesChanged(keyframes) ||
            ((type === "spring" || isGenerator(type)) && velocity));
    }

    function makeAnimationInstant(options) {
        options.duration = 0;
        options.type = "keyframes";
    }

    /**
     * A list of values that can be hardware-accelerated.
     *
     * Colors aren't included: WAAPI mixes them in sRGB, but JS animations
     * (and the sampler that estimates a WAAPI value on interrupt) mix them
     * in linear color space, so interrupting one would visibly jump.
     */
    const acceleratedValues = new Set([
        "opacity",
        "clipPath",
        "filter",
        "transform",
    ]);

    const browserColorFunctions = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
    function hasBrowserOnlyColors(keyframes) {
        for (let i = 0; i < keyframes.length; i++) {
            if (typeof keyframes[i] === "string" &&
                browserColorFunctions.test(keyframes[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Whether an animation needs its mixer, which WAAPI can't call. Numbers
     * blend as usual, and an animation whose mixer declines every pair runs
     * as it would without one.
     */
    const needsMixer = ({ mixer, keyframes }) => mixer &&
        typeof keyframes[0] !== "number" &&
        keyframes.some((keyframe, i) => i && mixer(keyframes[i - 1], keyframe));

    const colorProperties = new Set([
        "color",
        "backgroundColor",
        "outlineColor",
        "fill",
        "stroke",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
    ]);
    /**
     * WAAPI runs on the browser's clock, so on a manual clock every animation
     * runs in JS where processFrame can drive it. Set the flag before starting
     * animations: running WAAPI animations stay on the browser's clock.
     */
    const supportsWaapi = () => !MotionGlobalConfig.useManualTiming &&
        Object.hasOwnProperty.call(Element.prototype, "animate");
    function supportsBrowserAnimation(options) {
        const { motionValue, name, repeatDelay, repeatType, damping, type, keyframes, } = options;
        /**
         * Most values can't be accelerated at all, so check the name before
         * looking at the element or its props.
         */
        if (!name ||
            !(acceleratedValues.has(name) || colorProperties.has(name))) {
            return false;
        }
        const subject = motionValue?.owner?.current;
        /**
         * We use instanceof checks instead of isHTMLElement()/isSVGElement()
         * because we explicitly **don't** want elements in different timing
         * contexts (i.e. popups) to be accelerated, as it's not possible to sync
         * these animations properly with those driven from the main window
         * frameloop.
         */
        if (!(subject instanceof HTMLElement) &&
            !(subject instanceof SVGElement)) {
            return false;
        }
        const { onUpdate, transformTemplate } = motionValue.owner.getProps();
        return (supportsWaapi() &&
            /**
             * Force WAAPI for color properties with browser-only color formats
             * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
             */
            (acceleratedValues.has(name) ||
                (colorProperties.has(name) &&
                    hasBrowserOnlyColors(keyframes))) &&
            (name !== "transform" || !transformTemplate) &&
            /**
             * If we're outputting values to onUpdate then we can't use WAAPI as there's
             * no way to read the value from WAAPI every frame.
             */
            !onUpdate &&
            !repeatDelay &&
            repeatType !== "mirror" &&
            damping !== 0 &&
            type !== "inertia" &&
            !needsMixer(options));
    }

    /**
     * Provided a value and a ValueType, returns the value as that value type.
     */
    const getValueAsType = (value, type) => {
        return type && typeof value === "number"
            ? type.transform(value)
            : value;
    };

    const translateAlias = {
        x: "translateX",
        y: "translateY",
        z: "translateZ",
        transformPerspective: "perspective",
    };
    const numTransforms = transformPropOrder.length;
    /**
     * Cache of `translateX(`-style openers so each transform function is a few
     * string concatenations rather than a template.
     */
    const openers = {};
    /**
     * A transform function, e.g. `translateX(10px)` for `x: 10`.
     */
    const transformFunction = (key, value, valueAsType = getValueAsType(value, transformValueTypes[key])) => (openers[key] || (openers[key] = (translateAlias[key] || key) + "(")) + valueAsType + ")";
    /**
     * Whether a transform value is at its default, so can be left out.
     */
    const isDefaultTransform = (key, value) => (typeof value === "number" ? value : parseFloat(value)) ===
        (key.startsWith("scale") ? 1 : 0);
    /**
     * Build a CSS transform style from individual x/y/scale etc properties.
     *
     * This outputs with a default order of transforms/scales/rotations, this can be customised by
     * providing a transformTemplate function.
     */
    function buildTransform$1(latestValues, transform, transformTemplate) {
        // The transform string we're going to build into.
        let transformString = "";
        /**
         * Loop over all possible transforms in order, adding the ones that
         * are present to the transform string.
         */
        for (let i = 0; i < numTransforms; i++) {
            const key = transformPropOrder[i];
            const value = latestValues[key];
            if (value === undefined)
                continue;
            const valueAsType = transformTemplate &&
                (transform[key] = getValueAsType(value, numberValueTypes[key]));
            if (!isDefaultTransform(key, value)) {
                transformString +=
                    transformFunction(key, value, valueAsType || undefined) + " ";
            }
        }
        // `pathRotation` composes onto `rotate` as a separate additive term so
        // the user's `rotate` is never clobbered. Deliberately not a slot in
        // `transformPropOrder`.
        const pathRotation = latestValues.pathRotation;
        if (pathRotation) {
            transformString += transformFunction("rotate", pathRotation);
        }
        transformString = transformString.trim();
        // If we have a custom `transform` template, pass our transform values and
        // generated transformString to that before returning
        return transformTemplate
            ? transformTemplate(transform, transformString)
            : transformString || "none";
    }

    const transformGroups = new WeakMap();

    /**
     * Sample at the interruption sampling rate, up to a cap for long
     * animations.
     */
    const maxSamples = 200;
    /**
     * How far values may stray from the WAAPI animation: as a fraction of
     * each value's change when they share an easing, otherwise in px or deg,
     * or for scale.
     */
    const easingTolerance = 0.001;
    const sampleTolerance = 0.1;
    const scaleTolerance = 0.001;
    /**
     * If an outside write, or a seek the WAAPI animation can't follow,
     * happens again within this window, the group is being driven every
     * frame (scrubbing, drag), which is cheaper on the main thread than
     * rebuilding the WAAPI animation every frame.
     */
    const churnWindow = 100;
    /**
     * Named easings that are the same cubic-bezier in JS and CSS.
     */
    const isNativeEasing = (ease) => /^(linear|ease(In|Out|InOut))$/.test(ease);
    /**
     * Whether two eased progresses match. False if either is NaN.
     */
    const isNear$1 = (a, b) => Math.abs(a - b) <= easingTolerance;
    const byTime = (a, b) => a - b;
    /**
     * n + 1 evenly spaced timestamps, from one timestamp to another.
     */
    const spread = (from, to, n) => defaultOffset$1(Array(n + 1)).map((p) => mixNumber$1(from, to, p));
    const getOwner = (options) => options.motionValue.owner;
    const getGroup = (element) => transformGroups.get(element);
    /**
     * Whether an animation has ended, so can leave its group.
     */
    const hasEnded = ({ state }) => state === "idle" || state === "finished";
    const read = (owner, key) => owner.latestValues ? owner.latestValues[key] : owner.getValue(key)?.get();
    /**
     * Whether this animation should join its element's transform group.
     * Animations that can't be accelerated still join, so the group knows
     * to stay on the main thread while they run. Browsers without linear()
     * easing stay on the main thread.
     */
    const canGroupTransform = ({ name, motionValue, }) => name &&
        transformPropOrder.includes(name) &&
        motionValue?.owner?.current instanceof HTMLElement &&
        supportsWaapi() &&
        supportsLinearEasing();
    function canAccelerateTransform(options) {
        const owner = getOwner(options);
        const { onUpdate, transformTemplate } = owner.getProps();
        return (
        /**
         * A handoff from an optimised appear animation is already running
         * on its own WAAPI animation. onUpdate needs every value, every
         * frame.
         */
        !options.isHandoff &&
            !onUpdate &&
            !options.hasOnUpdate &&
            /**
             * transformTemplate could output anything.
             */
            !transformTemplate &&
            options.type !== "inertia" &&
            /**
             * A literal transform, or pathRotation, replaces or adds to the
             * transform we'd build. styleEffect builds its own as "none".
             */
            (read(owner, "transform") || "none") === "none" &&
            !read(owner, "pathRotation") &&
            /**
             * Layout animations write transform every frame.
             */
            !owner.projection?.isProjecting() &&
            /**
             * A mixer that blends these values makes them every frame. It's
             * asked last, as it's user code.
             */
            !needsMixer(options));
    }
    class TransformAnimation extends JSAnimation {
        constructor(options) {
            const element = getOwner(options).current;
            const { driver = frameloopDriver } = options;
            let animation;
            /**
             * Before JSAnimation replaces the type with its generator.
             */
            const canAccelerate = canAccelerateTransform(options);
            /**
             * The driver ticks on the main thread only once the group has
             * moved there. Until then, starting or stopping tells the group to
             * update its WAAPI animation.
             */
            options.driver = (update) => {
                const js = driver(update);
                return {
                    js,
                    now: js.now,
                    start: (keepAlive = true) => {
                        const group = getGroup(element);
                        const isJS = !group || group.isJS;
                        /**
                         * keepAlive is false when seeking. Seeking the WAAPI
                         * animation is free, but if a seek needs a rebuild and
                         * keeps happening, the group moves to the main thread.
                         */
                        isJS
                            ? js.start(keepAlive)
                            : group.schedule(false, !keepAlive);
                    },
                    stop: () => {
                        js.stop();
                        const group = getGroup(element);
                        group && !group.isFinishing && group.release(animation);
                    },
                };
            };
            super(options);
            animation = this;
            this.canAccelerate = canAccelerate;
            /**
             * stop is bound in JSAnimation, so wrap it rather than override.
             * Before stopping, set the motion value to where the WAAPI
             * animation is now, with velocity, for the next animation to
             * start from.
             */
            const { stop } = this;
            this.stop = () => {
                this.isAccelerated() && this.sync();
                stop();
            };
        }
        get group() {
            return getGroup(getOwner(this.options).current);
        }
        get js() {
            return this.driver?.js;
        }
        get name() {
            return this.options.name;
        }
        /**
         * When this stops moving, or, if it repeats forever, when it starts
         * repeating, and how long each repeat takes. Held (paused, or at
         * speed 0) animations never stop moving.
         */
        timing() {
            const { startTime, speed, totalDuration } = this;
            const { delay = 0, repeatType } = this.options;
            return this.holdTime !== null
                ? [Infinity, 0]
                : totalDuration === Infinity
                    ? [
                        startTime + delay / speed,
                        (this.resolvedDuration * (repeatType === "loop" ? 1 : 2)) /
                            speed || 1,
                    ]
                    : [startTime + (delay + totalDuration) / speed, 0];
        }
        /**
         * Whether this is running, or paused, on the compositor.
         */
        isAccelerated() {
            const { group, state } = this;
            return (group?.tracks.has(this) &&
                !group.isJS &&
                this.canAccelerate &&
                (state === "running" || state === "paused"));
        }
        /**
         * The value now, while this runs on the compositor and so doesn't
         * set its motion value every frame.
         */
        liveValue() {
            return this.isAccelerated() ? this.sampleAt(time.now()) : undefined;
        }
        /**
         * If this is a two-keyframe tween whose easing WAAPI runs exactly,
         * when it starts and stops moving, and that easing.
         */
        tween() {
            const { keyframes: keyframes$1, type, ease, times, repeat, delay = 0 } = this.options;
            const easing = isBezierDefinition(ease)
                ? cubicBezierAsString(ease)
                : isNativeEasing(ease) && supportedWaapiEasing[ease];
            if (easing &&
                !repeat &&
                !times &&
                keyframes$1.length === 2 &&
                type === keyframes &&
                this.holdTime === null) {
                const start = this.startTime + delay / this.speed;
                return [start, start + this.resolvedDuration / this.speed, easing];
            }
        }
        /**
         * The timestamps between two timestamps where this reaches a
         * keyframe or starts a repeat, where it can turn or jump.
         */
        boundaries(from, to) {
            const { startTime, speed, resolvedDuration, options } = this;
            const { delay = 0, repeat = 0, repeatDelay = 0, repeatType, times, keyframes: keyframes$1, type, } = options;
            const offsets = (type || keyframes) === keyframes
                ? times || defaultOffset$1(keyframes$1)
                : [0, 1];
            const start = startTime + delay / speed;
            const result = [];
            if (this.holdTime !== null || !(resolvedDuration > 0))
                return result;
            for (let i = Math.max(0, Math.floor(((from - start) * speed) / resolvedDuration)); i <= repeat; i++) {
                const iterationStart = start + (i * resolvedDuration) / speed;
                if (iterationStart > to)
                    break;
                for (const offset of offsets) {
                    const t = iterationStart +
                        ((i % 2 && repeatType && repeatType !== "loop"
                            ? 1 - offset
                            : offset) *
                            (resolvedDuration - repeatDelay)) /
                            speed;
                    t > from && t < to && result.push(t);
                }
            }
            return result;
        }
        /**
         * The value at a timestamp, as a number.
         */
        numberAt(timestamp) {
            return parseFloat(this.sampleAt(timestamp, true));
        }
        /**
         * Write the current value, and velocity, to the motion value.
         */
        sync() {
            const now = time.now();
            this.options.motionValue.setWithVelocity(this.sampleAt(now - sampleDelta, true), this.sampleAt(now, true), sampleDelta);
        }
        play() {
            /**
             * A stopped animation (one that was interrupted) can't play again,
             * so it mustn't join the group.
             */
            if (this.isStopped)
                return;
            (this.group || createGroup(getOwner(this.options))).tracks.add(this);
            super.play();
        }
        pause() {
            super.pause();
            if (this.isAccelerated()) {
                this.sync();
                this.group.schedule(false);
            }
        }
        /**
         * JSAnimation finishes on its next tick, which only happens on the
         * main thread, so finish now.
         */
        complete() {
            super.complete();
            const { group } = this;
            group && !group.isJS && this.canAccelerate && this.tick(time.now());
        }
        /**
         * Without a tick to rebase it, a held time still includes the delay,
         * so take it off here, as a JS animation does on its next tick.
         */
        get time() {
            if (this.isAccelerated()) {
                return millisecondsToSeconds(clamp(0, this.totalDuration, this.at(time.now()) - (this.options.delay || 0)));
            }
            return super.time;
        }
        /**
         * A JS animation sets its motion value from a seek on its next tick.
         * This doesn't tick, so set it now, rather than leave it to be set
         * when this next stops.
         */
        set time(newTime) {
            super.time = newTime;
            this.isAccelerated() && this.sync();
        }
        /**
         * Scroll timelines set time every frame, so run these on the main
         * thread.
         */
        attachTimeline(timeline) {
            this.canAccelerate = false;
            this.group?.demote(true);
            return super.attachTimeline(timeline);
        }
    }
    function createGroup(owner) {
        const element = owner.current;
        const tracks = new Set();
        const byKey = new Map();
        /**
         * Transforms that aren't animating, as built into the WAAPI animation.
         */
        let statics = {};
        /**
         * The transforms in the WAAPI animation, in order.
         */
        let keys = [];
        let built = new Map();
        let segments = [];
        let needsBuild = false;
        let isScheduled = false;
        let isEnded = false;
        let hasChurned = false;
        let lastChurn = -Infinity;
        const has = (key) => {
            for (const track of tracks)
                if (track.name === key)
                    return true;
        };
        /**
         * The transform values at a timestamp or, without one, from the
         * motion values. Animations that don't repeat forever are sampled no
         * earlier than settled, so a loop that starts from an earlier cycle
         * boundary holds them at their end.
         */
        const valuesAt = (timestamp, settled) => {
            const values = {};
            for (const key of timestamp === undefined ? transformPropOrder : keys) {
                const track = byKey.get(key);
                const value = timestamp === undefined
                    ? read(owner, key)
                    : track
                        ? track.sampleAt(settled > timestamp && !track.timing()[1]
                            ? settled
                            : timestamp)
                        : statics[key];
                if (value !== undefined)
                    values[key] = value;
            }
            return values;
        };
        /**
         * Build a transform from values in transformPropOrder. For a keyframe,
         * every key is written, even at its default, so each keyframe has the
         * same list of functions and the browser interpolates them one by one.
         * As an inline style, defaults are left out, as buildTransform does.
         */
        const toTransform = (values, isStyle) => {
            let transform = "";
            for (const key in values) {
                const value = values[key];
                if (!isStyle || !isDefaultTransform(key, value)) {
                    transform += transformFunction(key, value) + " ";
                }
            }
            return (isStyle ? transform.trim() : transform) || "none";
        };
        /**
         * Build the transform at a timestamp.
         */
        const compose = (timestamp, settled) => toTransform(valuesAt(timestamp, settled));
        /**
         * Write the transform as an inline style, as the renderer would.
         */
        const commit = (values = valuesAt()) => {
            element.style.transform = toTransform(values, true);
        };
        /**
         * Cancel the WAAPI animations, by default first committing the
         * transform. The renderer writes its own version on its next render.
         */
        const stop = (shouldCommit = true) => {
            shouldCommit && commit();
            segments.forEach(({ animation }) => animation.cancel());
            segments = [];
        };
        /**
         * A WAAPI animation that add() starts by setting its startTime. Playing
         * it first, as element.animate() does, would leave WebKit holding that
         * play's ready time once startTime ends the play, and it uses that for
         * the next updatePlaybackRate(), so the animation would jump.
         */
        const create = (keyframes, options) => new Animation(new KeyframeEffect(element, keyframes, options));
        const add = (animation, offset, end = Infinity) => {
            const segment = { animation, offset, end };
            animation.startTime = time.now() + offset;
            /**
             * Animations finish when the WAAPI animation reaches their end.
             * Once a loop has taken over, the finished animation isn't needed.
             */
            if (end < Infinity) {
                animation.onfinish = () => {
                    segment.isDone = true;
                    if (segments.some((s) => s.end === Infinity)) {
                        animation.cancel();
                        segments = segments.filter((s) => s !== segment);
                    }
                    group.schedule(false);
                };
            }
            /**
             * Something else cancelled it, so carry on on the main thread.
             */
            animation.oncancel = () => segments.includes(segment) && group.demote();
            segments.push(segment);
        };
        /**
         * Where a value jumps between two timestamps, as when a repeat starts
         * again: the timestamps either side of the jump, or none if it moves
         * there continuously.
         */
        const jumpAt = (value, a, b) => {
            const change = (x, y) => Math.abs(value(y) - value(x));
            const size = change(a, b);
            while (b - a > 0.01) {
                const mid = (a + b) / 2;
                change(a, mid) > change(mid, b) ? (b = mid) : (a = mid);
            }
            return change(a, b) > size / 2 ? [a, b] : [];
        };
        /**
         * If every moving animation follows the same eased progress between
         * two timestamps, the easing that describes it.
         */
        const getEasing = (moving, from, to, bounds) => {
            const samples = Math.min(maxSamples, Math.max(2, Math.ceil((to - from) / sampleDelta)));
            /**
             * Too many keyframes or repeats to follow with this many samples.
             */
            if (bounds.length * 4 > samples)
                return;
            const at = spread(from, to, samples).concat(bounds).sort(byTime);
            const position = (t) => progress(from, to, t);
            let shared;
            let progressAt;
            for (const track of moving) {
                const first = track.numberAt(from);
                const changes = at.map((t) => track.numberAt(t) - first);
                const end = changes[changes.length - 1];
                /**
                 * A value that ends only a tiny way from where it started, as
                 * a round trip does if it's built just after it starts, or
                 * from a float residue, ends where it started. Dividing by
                 * that tiny range would stretch the easing to values the
                 * compositor can't render.
                 */
                const range = changes.some((change) => Math.abs(change) * easingTolerance > Math.abs(end))
                    ? 0
                    : end;
                const progress = changes.map((change) => range ? change / range : change);
                /**
                 * The first value that moves sets the easing, and every other
                 * one must follow it. A value that doesn't change, like one
                 * still in its delay, fits any easing. One that changes but
                 * ends where it started fits none.
                 */
                if (range && !shared) {
                    shared = progress;
                    progressAt = (t) => (track.numberAt(t) - first) / range;
                }
                else if (progress.some((p, i) => !isNear$1(p, range && shared[i]))) {
                    return;
                }
            }
            if (!shared || shared.every((p, i) => isNear$1(p, position(at[i])))) {
                return "linear";
            }
            /**
             * A repeat that starts again jumps back, which takes two points at
             * the same position.
             */
            const points = [];
            const point = (t, p = progressAt(t)) => points.push(round(p) + " " + round(position(t) * 100) + "%");
            shared.forEach((p, i) => {
                i &&
                    Math.abs(p - shared[i - 1]) > 0.2 &&
                    jumpAt(progressAt, at[i - 1], at[i]).forEach((t) => point(t));
                point(at[i], p);
            });
            return "linear(" + points + ")";
        };
        /**
         * Sample timestamps between two timestamps, closer together where the
         * moving animations curve.
         */
        const sample = (moving, from, to, bounds) => {
            const times = [from];
            /**
             * Values that aren't numbers, like calc(), are left to the
             * browser to interpolate.
             */
            const isStraight = (a, b) => moving.every((track) => !(Math.abs(track.numberAt((a + b) / 2) -
                (track.numberAt(a) + track.numberAt(b)) / 2) >
                (track.name.startsWith("scale")
                    ? scaleTolerance
                    : sampleTolerance)));
            const split = (a, b, depth) => {
                if (b - a < 1 || isStraight(a, b)) {
                    times.push(b);
                }
                else if (depth < 4) {
                    split(a, (a + b) / 2, depth + 1);
                    split((a + b) / 2, b, depth + 1);
                }
                else {
                    /**
                     * Keyframes either side of a jump, like a repeat starting
                     * again, so it doesn't play as a quick sweep.
                     */
                    for (const track of moving) {
                        times.push(...jumpAt((t) => track.numberAt(t), a, b));
                    }
                    times.push(b);
                }
            };
            /**
             * Split at least every 100ms, and at every keyframe and repeat,
             * either side of where a value can jump.
             */
            const ends = spread(from, to, Math.ceil((to - from) / 100));
            for (const t of bounds)
                ends.push(t, Math.min(t + 0.01, to));
            let start = from;
            for (const end of ends.sort(byTime)) {
                end > start && split(start, end, 0);
                start = end;
            }
            return times.sort(byTime);
        };
        /**
         * If every moving animation is the same tween, started together, as
         * happens for the values of one animate() call or transition, when
         * they move and their native easing.
         */
        const getTween = (moving) => {
            let shared;
            for (const track of moving) {
                const tween = track.tween();
                if (!tween ||
                    shared?.some((v, i) => i < 2
                        ? Math.abs(tween[i] - v) > 1
                        : tween[i] !== v)) {
                    return;
                }
                shared = tween;
            }
            return shared;
        };
        /**
         * A WAAPI animation of the composed transform between two timestamps.
         */
        const run = (moving, from, to, nativeEasing, options = { fill: "both" }, settled) => {
            const bounds = moving.flatMap((track) => track.boundaries(from, to));
            const easing = nativeEasing || getEasing(moving, from, to, bounds);
            const times = easing ? [from, to] : sample(moving, from, to, bounds);
            const transform = times.map((t) => compose(t, settled));
            let keyframes = { transform };
            if (!easing) {
                keyframes.offset = times.map((t) => progress(from, to, t));
            }
            /**
             * If nothing moves, don't hold a transform, which, even at its
             * default, would make the element a containing block. The empty
             * animation still finishes the animations.
             */
            if (transform.every((t) => t === transform[0])) {
                commit(valuesAt(from, settled));
                keyframes = null;
            }
            return create(keyframes, {
                ...options,
                duration: to - from,
                easing: easing || "linear",
            });
        };
        /**
         * Replace the WAAPI animations with ones built from now. Returns
         * undefined if the animations can't be composed.
         */
        const animate = (now) => {
            /**
             * The finite part runs until the last finite animation (or the
             * last delay) ends. Infinitely repeating animations then continue
             * as one looping WAAPI animation, which needs them to share a
             * cycle.
             */
            let end = now;
            let cycle = 0;
            let cycleStart = 0;
            const moving = [];
            const looping = [];
            const ends = new Set();
            byKey.clear();
            built = new Map();
            for (const track of tracks) {
                byKey.set(track.name, track);
                const [trackEnd, trackCycle] = track.timing();
                const isHeld = trackEnd === Infinity;
                built.set(track, [track.at(now), track.speed, isHeld]);
                /**
                 * Held animations don't move, so keep their motion values up
                 * to date, as a JSAnimation would on a seek.
                 */
                if (isHeld) {
                    track.sync();
                    continue;
                }
                if (track.speed < 0)
                    return;
                if (trackCycle) {
                    if (cycle) {
                        const phase = (trackEnd - cycleStart) / trackCycle;
                        if (Math.abs(trackCycle - cycle) > 1 ||
                            Math.abs(phase - Math.round(phase)) * cycle > 1) {
                            return;
                        }
                    }
                    else {
                        cycle = trackCycle;
                        cycleStart = trackEnd;
                    }
                    looping.push(track);
                }
                else {
                    ends.add(trackEnd);
                }
                moving.push(track);
                end = Math.max(end, trackEnd);
            }
            statics = {};
            /**
             * Transforms that aren't animating are left out at their default.
             */
            keys = transformPropOrder.filter((key) => {
                if (byKey.has(key))
                    return true;
                const value = (statics[key] = read(owner, key));
                return value !== undefined && !isDefaultTransform(key, value);
            });
            stop(false);
            /**
             * Values that share one tween are one WAAPI animation of it, with
             * two keyframes and its own easing, from when they started.
             */
            const tween = !cycle && getTween(moving);
            try {
                if (tween && tween[1] > now) {
                    const [from, to, easing] = tween;
                    add(run(moving, from, to, easing), from - now, to - from);
                }
                else if (end > now) {
                    add(run(moving, now, end), 0, end - now);
                    /**
                     * Animations that end sooner finish on the events of
                     * empty animations that end with them.
                     */
                    ends.forEach((trackEnd) => trackEnd < end - 1 &&
                        add(create(null, { duration: trackEnd - now }), 0, trackEnd - now));
                }
                if (cycle) {
                    /**
                     * Build one cycle from a cycle boundary, so it repeats
                     * seamlessly, and start it part way through.
                     */
                    const from = cycleStart + Math.floor((end - cycleStart) / cycle) * cycle;
                    add(run(looping, from, from + cycle, undefined, {
                        iterations: Infinity,
                        iterationStart: (end - from) / cycle,
                        /**
                         * It must not fill backwards over the finite part
                         * that runs before it.
                         */
                        fill: "forwards",
                    }, end), end - now);
                }
            }
            catch {
                return;
            }
            /**
             * Everything is held, so hold it with an inline style instead.
             */
            segments.length || stop();
            return true;
        };
        /**
         * If every animation has been paused, played, seeked or sped up
         * together since the WAAPI animation was built, do the same to it.
         * Returns false if it needs rebuilding instead.
         */
        const retime = (now) => {
            let elapsed;
            let rate = 0;
            for (const track of tracks) {
                const state = built.get(track);
                if (!state)
                    return false;
                const [builtTime, builtSpeed, wasHeld] = state;
                const trackTime = track.at(now);
                const isHeld = track.timing()[0] === Infinity;
                if (wasHeld) {
                    if (isHeld && trackTime === builtTime)
                        continue;
                    return false;
                }
                const trackElapsed = (trackTime - builtTime) / builtSpeed;
                const trackRate = isHeld ? 0 : track.speed / builtSpeed;
                if (elapsed === undefined) {
                    elapsed = trackElapsed;
                    rate = trackRate;
                }
                else if (Math.abs(trackElapsed - elapsed) > 1 ||
                    trackRate !== rate) {
                    return false;
                }
            }
            if (elapsed === undefined)
                return true;
            if (!segments.length)
                return false;
            for (const { offset, end, isDone } of segments) {
                const local = elapsed - offset;
                if (end < Infinity &&
                    (isDone ? local < end - 1 : local < 0 || local >= end)) {
                    return false;
                }
            }
            for (const { animation, offset, isDone } of segments) {
                if (isDone)
                    continue;
                const local = elapsed - offset;
                if (rate &&
                    animation.updatePlaybackRate &&
                    animation.playState === "running" &&
                    Math.abs(Number(animation.currentTime) - local) < 20) {
                    /**
                     * Only the speed changed. Setting playbackRate and
                     * startTime restarts a running compositor animation, which
                     * can render the underlying value for a frame.
                     */
                    animation.playbackRate !== rate &&
                        animation.updatePlaybackRate(rate);
                }
                else if (rate) {
                    animation.playbackRate = rate;
                    animation.startTime = now - local / rate;
                }
                else {
                    /**
                     * Hold it without pause(), whose pending pause setting
                     * currentTime would end at once, leaving WebKit holding its
                     * ready time (see create()).
                     */
                    animation.startTime = null;
                    animation.currentTime = local;
                }
            }
            return true;
        };
        /**
         * If no animations are left, write where they got to and cancel the
         * WAAPI animations. Returns whether the group ended.
         */
        const end = () => {
            if (tracks.size)
                return false;
            isEnded = true;
            /**
             * The element may have a newer group if this one was detached
             * (see handOffElementState).
             */
            getGroup(element) === group && transformGroups.delete(element);
            group.isJS || stop();
            return true;
        };
        const build = () => {
            const now = time.now();
            /**
             * Finish the animations that have reached their end, which the
             * WAAPI animation has already rendered.
             */
            if (!group.isJS) {
                group.isFinishing = true;
                tracks.forEach((track) => {
                    const [trackEnd, trackCycle] = track.timing();
                    if (track.state === "running" &&
                        track.speed > 0 &&
                        !trackCycle &&
                        trackEnd <= now + 1) {
                        track.complete();
                        /**
                         * From now it's checked for outside writes like any
                         * other static transform. If the WAAPI animation never
                         * rendered it (it was instant), rebuild with its value.
                         */
                        statics[track.name] = read(owner, track.name);
                        built.has(track) || (needsBuild = true);
                    }
                });
                group.isFinishing = false;
            }
            isScheduled = false;
            if (isEnded)
                return;
            tracks.forEach((track) => hasEnded(track) && tracks.delete(track));
            if (end())
                return;
            for (const track of tracks) {
                if (!track.canAccelerate)
                    return group.demote(true);
            }
            /**
             * Everything that kept the group on the main thread has finished,
             * so move the remaining animations back to the compositor.
             */
            if (group.isJS) {
                group.isJS = false;
                needsBuild = true;
                tracks.forEach((track) => track.js?.stop());
            }
            const shouldBuild = needsBuild;
            const churned = hasChurned;
            needsBuild = hasChurned = false;
            if (shouldBuild || !retime(now)) {
                if (churned) {
                    if (now - lastChurn < churnWindow)
                        return group.demote();
                    lastChurn = now;
                }
                if (!animate(now))
                    return group.demote();
            }
        };
        const group = {
            tracks,
            isJS: false,
            isFinishing: false,
            schedule(build_, isChurn) {
                if (isEnded)
                    return;
                needsBuild || (needsBuild = build_);
                hasChurned || (hasChurned = !!isChurn);
                /**
                 * Build in this frame's render step, so it's in place before
                 * anything reads the DOM in postRender, or straight after the
                 * current task outside of a frame.
                 */
                if (!isScheduled) {
                    isScheduled = true;
                    frameData.isProcessing
                        ? frame.render(build, false, true)
                        : queueMicrotask(build);
                }
            },
            /**
             * End the group now, rather than when it next builds, so the
             * element's transform is the caller's again as soon as its last
             * animation is stopped.
             */
            release(track) {
                /**
                 * Only drop the stopped animation. Others can be idle because
                 * they're part way through play(), and are about to run.
                 */
                hasEnded(track) && tracks.delete(track);
                end() || group.schedule(true);
            },
            /**
             * An outside write. Rebuild once, but if it keeps happening, move
             * to the main thread.
             */
            check() {
                if (group.isJS)
                    return;
                for (const key in statics) {
                    if (read(owner, key) !== statics[key] && !has(key)) {
                        return group.schedule(true, true);
                    }
                }
            },
            demote(canReturn) {
                if (group.isJS || isEnded)
                    return;
                /**
                 * Unless only another animation is holding the group on the
                 * main thread, these animations stay there until they end.
                 */
                tracks.forEach((track) => {
                    track.isAccelerated() && track.sync();
                    canReturn || (track.canAccelerate = false);
                });
                group.isJS = true;
                built = new Map();
                stop();
                tracks.forEach((track) => track.state === "running" && track.js?.start());
                return true;
            },
        };
        transformGroups.set(element, group);
        return group;
    }

    class AsyncMotionValueAnimation extends WithPromise {
        constructor(options) {
            super();
            /**
             * Bound to support return animation.stop pattern
             */
            this.stop = () => {
                if (this._animation) {
                    this._animation.stop();
                    this.stopTimeline?.();
                }
                this.keyframeResolver?.cancel();
            };
            this.createdAt = time.now();
            const { keyframes, name, motionValue, element } = options;
            /**
             * animateMotionValue builds a fresh options object per value, so
             * it's completed in place as keyframes resolve rather than copied.
             */
            const optionsWithDefaults = options;
            optionsWithDefaults.autoplay ?? (optionsWithDefaults.autoplay = true);
            optionsWithDefaults.delay ?? (optionsWithDefaults.delay = 0);
            optionsWithDefaults.type ?? (optionsWithDefaults.type = "keyframes");
            optionsWithDefaults.repeat ?? (optionsWithDefaults.repeat = 0);
            optionsWithDefaults.repeatDelay ?? (optionsWithDefaults.repeatDelay = 0);
            optionsWithDefaults.repeatType ?? (optionsWithDefaults.repeatType = "loop");
            const KeyframeResolver$1 = element?.KeyframeResolver || KeyframeResolver;
            this.keyframeResolver = new KeyframeResolver$1(keyframes, (resolvedKeyframes, finalKeyframe, forced) => this.onKeyframesResolved(resolvedKeyframes, finalKeyframe, optionsWithDefaults, !forced), name, motionValue, element);
            this.keyframeResolver?.scheduleResolve();
        }
        onKeyframesResolved(keyframes, finalKeyframe, options, sync) {
            this.keyframeResolver = undefined;
            const { name, type, velocity, delay, isHandoff, onUpdate } = options;
            this.resolvedAt = time.now();
            /**
             * If we can't animate this value with the resolved keyframes
             * then we should complete it immediately.
             */
            const canAnimateValue = canAnimate(keyframes, name, type, velocity);
            if (!canAnimateValue) {
                if (MotionGlobalConfig.instantAnimations || !delay) {
                    onUpdate?.(getFinalKeyframe(keyframes, options, finalKeyframe));
                }
                keyframes[0] = keyframes[keyframes.length - 1];
                makeAnimationInstant(options);
                options.repeat = 0;
            }
            const { onComplete } = options;
            options.finalKeyframe = finalKeyframe;
            options.keyframes = keyframes;
            /**
             * JSAnimation and NativeAnimation call onComplete exactly when
             * their own `finished` resolves, so this replaces a promise chain
             * per value with a callback.
             */
            options.onComplete = () => {
                onComplete?.();
                this.notifyFinished();
            };
            /**
             * Animate via WAAPI if possible. If this is a handoff animation, the optimised animation will be running via
             * WAAPI. Therefore, this animation must be JS to ensure it runs "under" the
             * optimised animation.
             *
             * Also skip WAAPI when keyframes aren't animatable, as the resolved
             * values may not be valid CSS and would trigger browser warnings.
             */
            const useWaapi = canAnimateValue && !isHandoff && supportsBrowserAnimation(options);
            /**
             * Independent transforms (x, scale etc) on an HTML element are
             * composed into one WAAPI transform animation per element.
             */
            const isGroupedTransform = !useWaapi && canGroupTransform(options);
            /**
             * Resolve startTime for the animation. A startTime passed in options
             * (an optimised appear handoff syncing to its WAAPI animation) takes
             * precedence.
             *
             * *Ideally*, we would use the createdAt time as t=0 as the following
             * frame would then be the first frame of the animation in progress,
             * which would feel snappier. If keyframes resolved on a later frame,
             * and long after creation, we start from then instead.
             *
             * If they resolved immediately, a JSAnimation picks its own start
             * time and resolves it the same way on its first frame, so every
             * animation started in that moment stays in sync. WAAPI has no frame
             * of ours to do that on.
             */
            if (sync &&
                (useWaapi ||
                    isGroupedTransform ||
                    this.resolvedAt !== this.createdAt)) {
                options.startTime ?? (options.startTime = resolveStartTime(this.createdAt, this.resolvedAt));
            }
            let animation;
            if (useWaapi) {
                /**
                 * The resolver needed the VisualElement, WAAPI needs the DOM
                 * element. JSAnimation reads neither, so this is safe to
                 * leave in place if we fall back to it.
                 */
                options.element = options.motionValue?.owner?.current;
                try {
                    animation = new NativeAnimationExtended(options);
                }
                catch {
                    animation = new JSAnimation(options);
                }
            }
            else if (isGroupedTransform) {
                animation = new TransformAnimation(options);
            }
            else {
                animation = new JSAnimation(options);
            }
            if (this.pendingTimeline) {
                this.stopTimeline = animation.attachTimeline(this.pendingTimeline);
                this.pendingTimeline = undefined;
            }
            this._animation = animation;
        }
        get finished() {
            return this._animation ? this._animation.finished : super.finished;
        }
        then(onResolve, _onReject) {
            return this.finished.finally(onResolve).then(() => { });
        }
        /**
         * The value now, if the animation runs on the compositor.
         */
        liveValue() {
            return this._animation?.liveValue?.();
        }
        get animation() {
            if (!this._animation) {
                this.keyframeResolver?.resume();
                flushKeyframeResolvers();
            }
            return this._animation;
        }
        get duration() {
            return this.animation.duration;
        }
        get iterationDuration() {
            return this.animation.iterationDuration;
        }
        get time() {
            return this.animation.time;
        }
        set time(newTime) {
            this.animation.time = newTime;
        }
        get speed() {
            return this.animation.speed;
        }
        get state() {
            return this.animation.state;
        }
        set speed(newSpeed) {
            this.animation.speed = newSpeed;
        }
        get startTime() {
            return this.animation.startTime;
        }
        attachTimeline(timeline) {
            if (this._animation) {
                this.stopTimeline = this.animation.attachTimeline(timeline);
            }
            else {
                this.pendingTimeline = timeline;
            }
            return () => this.stop();
        }
        play() {
            this.animation.play();
        }
        pause() {
            this.animation.pause();
        }
        complete() {
            this.animation.complete();
        }
        cancel() {
            this._animation?.cancel();
            this.keyframeResolver?.cancel();
        }
    }

    class GroupAnimation {
        constructor(animations) {
            // Bound to accommodate common `return animation.stop` pattern
            this.stop = () => this.runAll("stop");
            this.animations = animations.filter(Boolean);
        }
        get finished() {
            return Promise.all(this.animations.map((animation) => animation.finished));
        }
        /**
         * TODO: Filter out cancelled or stopped animations before returning
         */
        getAll(propName) {
            return this.animations[0][propName];
        }
        setAll(propName, newValue) {
            for (let i = 0; i < this.animations.length; i++) {
                this.animations[i][propName] = newValue;
            }
        }
        attachTimeline(timeline) {
            const subscriptions = this.animations.map((animation) => animation.attachTimeline(timeline));
            return () => {
                subscriptions.forEach((cancel, i) => {
                    cancel && cancel();
                    this.animations[i].stop();
                });
            };
        }
        get time() {
            return this.getAll("time");
        }
        set time(time) {
            this.setAll("time", time);
        }
        get speed() {
            return this.getAll("speed");
        }
        set speed(speed) {
            this.setAll("speed", speed);
        }
        get state() {
            return this.getAll("state");
        }
        get startTime() {
            return this.getAll("startTime");
        }
        get duration() {
            return getMax(this.animations, "duration");
        }
        get iterationDuration() {
            return getMax(this.animations, "iterationDuration");
        }
        runAll(methodName) {
            this.animations.forEach((controls) => controls[methodName]());
        }
        play() {
            this.runAll("play");
        }
        pause() {
            this.runAll("pause");
        }
        cancel() {
            this.runAll("cancel");
        }
        complete() {
            this.runAll("complete");
        }
    }
    function getMax(animations, propName) {
        let max = 0;
        for (let i = 0; i < animations.length; i++) {
            const value = animations[i][propName];
            if (value !== null && value > max) {
                max = value;
            }
        }
        return max;
    }

    class GroupAnimationWithThen extends GroupAnimation {
        then(onResolve, _onReject) {
            return this.finished.finally(onResolve).then(() => { });
        }
    }

    class NativeAnimationWrapper extends NativeAnimation {
        constructor(animation) {
            super();
            this.animation = animation;
            animation.onfinish = () => {
                this.finishedTime = this.time;
                this.notifyFinished();
            };
            /**
             * The optionless super() returns before NativeAnimation's own
             * notify, so wrapped animations (view transition cross-fades)
             * report here, after the wrapped WAAPI animation is attached.
             */
            notifyAnimationStart(this, {});
        }
    }

    const animationMaps = new WeakMap();
    const animationMapKey = (name, pseudoElement = "") => `${name}:${pseudoElement}`;
    function getAnimationMap(element) {
        let map = animationMaps.get(element);
        if (!map) {
            map = new Map();
            animationMaps.set(element, map);
        }
        return map;
    }

    function calcChildStagger(children, child, delayChildren, staggerChildren = 0, staggerDirection = 1) {
        const index = Array.from(children)
            .sort((a, b) => a.sortNodePosition(b))
            .indexOf(child);
        const numChildren = children.size;
        const maxStaggerDuration = (numChildren - 1) * staggerChildren;
        const delayIsFunction = typeof delayChildren === "function";
        return delayIsFunction
            ? delayChildren(index, numChildren)
            : staggerDirection === 1
                ? index * staggerChildren
                : maxStaggerDuration - index * staggerChildren;
    }

    /**
     * Maximum time between the value of two frames, beyond which we
     * assume the velocity has since been 0.
     */
    const MAX_VELOCITY_DELTA = 30;
    const isFloat = (value) => {
        return !isNaN(parseFloat(value));
    };
    const collectMotionValues = {
        current: undefined,
    };
    /**
     * `MotionValue` is used to track the state and velocity of motion values.
     *
     * @public
     */
    class MotionValue {
        /**
         * @param init - The initiating value
         * @param config - Optional configuration options
         *
         * -  `transformer`: A function to transform incoming values with.
         */
        constructor(init, options = {}) {
            /**
             * Tracks whether this value can output a velocity. Currently this is only true
             * if the value is numerical, but we might be able to widen the scope here and support
             * other value types.
             *
             * @internal
             */
            this.canTrackVelocity = null;
            /**
             * An object containing a SubscriptionManager for each active event.
             */
            this.events = {};
            this.updateAndNotify = (v) => {
                const currentTime = time.now();
                /**
                 * If we're updating the value during another frame or eventloop
                 * than the previous frame, then the we set the previous frame value
                 * to current.
                 */
                if (this.updatedAt !== currentTime) {
                    this.setPrevFrameValue();
                }
                this.prev = this.current;
                this.setCurrent(v);
                // Update update subscribers
                if (this.current !== this.prev) {
                    this.dirty();
                    if (this.dependents) {
                        for (const dependent of this.dependents) {
                            dependent.dirty();
                        }
                    }
                }
            };
            this.hasAnimated = false;
            this.setCurrent(init);
            this.owner = options.owner;
        }
        setCurrent(current) {
            this.current = current;
            this.updatedAt = time.now();
            if (this.canTrackVelocity === null && current !== undefined) {
                this.canTrackVelocity = isFloat(this.current);
            }
        }
        setPrevFrameValue(prevFrameValue = this.current) {
            this.prevFrameValue = prevFrameValue;
            this.prevUpdatedAt = this.updatedAt;
        }
        /**
         * Adds a function that will be notified when the `MotionValue` is updated.
         *
         * It returns a function that, when called, will cancel the subscription.
         *
         * When calling `onChange` inside a React component, it should be wrapped with the
         * `useEffect` hook. As it returns an unsubscribe function, this should be returned
         * from the `useEffect` function to ensure you don't add duplicate subscribers..
         *
         * ```jsx
         * export const MyComponent = () => {
         *   const x = useMotionValue(0)
         *   const y = useMotionValue(0)
         *   const opacity = useMotionValue(1)
         *
         *   useEffect(() => {
         *     function updateOpacity() {
         *       const maxXY = Math.max(x.get(), y.get())
         *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
         *       opacity.set(newOpacity)
         *     }
         *
         *     const unsubscribeX = x.on("change", updateOpacity)
         *     const unsubscribeY = y.on("change", updateOpacity)
         *
         *     return () => {
         *       unsubscribeX()
         *       unsubscribeY()
         *     }
         *   }, [])
         *
         *   return <motion.div style={{ x }} />
         * }
         * ```
         *
         * @param subscriber - A function that receives the latest value.
         * @returns A function that, when called, will cancel this subscription.
         *
         * @deprecated
         */
        onChange(subscription) {
            {
                warnOnce(false, `value.onChange(callback) is deprecated. Switch to value.on("change", callback).`);
            }
            return this.on("change", subscription);
        }
        on(eventName, callback) {
            var _a;
            if (eventName === "change")
                return this.onChangeSubscribe(callback);
            return ((_a = this.events)[eventName] || (_a[eventName] = new SubscriptionManager())).add(callback);
        }
        onChangeSubscribe(callback) {
            const { events } = this;
            if (!events.change && !this.changeSubscriber) {
                this.changeSubscriber = callback;
            }
            else {
                if (!events.change) {
                    events.change = new SubscriptionManager();
                    events.change.add(this.changeSubscriber);
                    this.changeSubscriber = undefined;
                }
                events.change.add(callback);
            }
            return () => {
                if (this.changeSubscriber === callback) {
                    this.changeSubscriber = undefined;
                }
                else {
                    events.change?.remove(callback);
                }
                this.stopIfUnobserved();
            };
        }
        /**
         * If we have no more change listeners by the start
         * of the next frame, stop active animations.
         */
        stopIfUnobserved() {
            frame.read(() => {
                if (!this.changeSubscriber && !this.events.change?.getSize()) {
                    this.stop();
                }
            });
        }
        clearListeners() {
            this.changeSubscriber = undefined;
            for (const eventManagers in this.events) {
                this.events[eventManagers].clear();
            }
        }
        /**
         * Attaches a passive effect to the `MotionValue`.
         */
        attach(passiveEffect, stopPassiveEffect) {
            this.passiveEffect = passiveEffect;
            this.stopPassiveEffect = stopPassiveEffect;
        }
        /**
         * Sets the state of the `MotionValue`.
         *
         * @remarks
         *
         * ```jsx
         * const x = useMotionValue(0)
         * x.set(10)
         * ```
         *
         * @param latest - Latest value to set.
         * @param render - Whether to notify render subscribers. Defaults to `true`
         *
         * @public
         */
        set(v) {
            this.passiveEffect
                ? this.passiveEffect(v, this.updateAndNotify)
                : this.updateAndNotify(v);
        }
        setWithVelocity(prev, current, delta) {
            this.set(current);
            this.prev = undefined;
            this.prevFrameValue = prev;
            this.prevUpdatedAt = this.updatedAt - delta;
        }
        /**
         * Set the state of the `MotionValue`, stopping any active animations,
         * effects, and resets velocity to `0`.
         */
        jump(v, endAnimation = true) {
            if (endAnimation) {
                /**
                 * Stop first, as stopping a running animation can set the
                 * value it's showing, which would replace v. Marking the value
                 * as updated now skips a JS animation's catch-up tick on stop,
                 * which could otherwise complete it.
                 */
                this.updatedAt = time.now();
                this.stop();
            }
            this.updateAndNotify(v);
            this.prev = v;
            this.prevUpdatedAt = this.prevFrameValue = undefined;
            this.stopPassiveEffect?.();
        }
        dirty() {
            const { current, changeSubscriber } = this;
            /**
             * One or the other exists. Subscribing during the direct
             * subscriber's call moves it into a new manager, which must not
             * then be notified for the same change.
             */
            if (changeSubscriber) {
                changeSubscriber(current);
            }
            else {
                this.events.change?.notify(current);
            }
        }
        addDependent(dependent) {
            (this.dependents || (this.dependents = new Set())).add(dependent);
        }
        removeDependent(dependent) {
            this.dependents?.delete(dependent);
        }
        /**
         * Returns the latest state of `MotionValue`
         *
         * @returns - The latest state of `MotionValue`
         *
         * @public
         */
        get() {
            collectMotionValues.current?.push(this);
            /**
             * A value animating on the compositor isn't updated every frame,
             * so read it from its animation.
             */
            const sampled = this.animation?.liveValue?.();
            return sampled === undefined ? this.current : sampled;
        }
        /**
         * The value as last set. Unlike get(), this doesn't read an animation
         * running on the compositor, which renders the value itself.
         */
        getCurrent() {
            return this.current;
        }
        /**
         * @public
         */
        getPrevious() {
            return this.prev;
        }
        /**
         * Returns the latest velocity of `MotionValue`
         *
         * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
         *
         * @public
         */
        getVelocity() {
            const currentTime = time.now();
            if (!this.canTrackVelocity ||
                this.prevFrameValue === undefined ||
                currentTime - this.updatedAt > MAX_VELOCITY_DELTA) {
                return 0;
            }
            const delta = Math.min(this.updatedAt - this.prevUpdatedAt, MAX_VELOCITY_DELTA);
            // Casts because of parseFloat's poor typing
            return velocityPerSecond(parseFloat(this.current) -
                parseFloat(this.prevFrameValue), delta);
        }
        /**
         * Registers a new animation to control this `MotionValue`. Only one
         * animation can drive a `MotionValue` at one time.
         *
         * ```jsx
         * value.start()
         * ```
         *
         * @param animation - A function that starts the provided animation
         */
        start(startAnimation) {
            this.stop();
            return new Promise((resolve) => {
                this.hasAnimated = true;
                /**
                 * Complete synchronously via the callback rather than chaining a
                 * second promise per animation. Guard against animations that
                 * complete before startAnimation has returned.
                 */
                let isComplete = false;
                let animation;
                // eslint-disable-next-line prefer-const -- read by the callback before assignment when completing synchronously
                animation = startAnimation(() => {
                    isComplete = true;
                    this.events.animationComplete?.notify();
                    if (this.animation === animation)
                        this.animation = undefined;
                    resolve();
                });
                if (!isComplete)
                    this.animation = animation;
                this.events.animationStart?.notify();
            });
        }
        /**
         * Stop the currently active animation.
         *
         * @public
         */
        stop() {
            if (this.animation) {
                this.animation.stop();
                this.events.animationCancel?.notify();
            }
            // Assign rather than delete to keep the object's shape stable
            this.animation = undefined;
        }
        /**
         * Returns `true` if this value is currently animating.
         *
         * @public
         */
        isAnimating() {
            return !!this.animation;
        }
        /**
         * Destroy and clean up subscribers to this `MotionValue`.
         *
         * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
         * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
         * created a `MotionValue` via the `motionValue` function.
         *
         * @public
         */
        destroy() {
            this.dependents?.clear();
            this.events.destroy?.notify();
            this.clearListeners();
            this.stop();
            this.stopPassiveEffect?.();
        }
    }
    function motionValue(init, options) {
        return new MotionValue(init, options);
    }

    /**
     * If `transition` has `inherit: true`, shallow-merge it with
     * `parentTransition` (child keys win) and strip the `inherit` key.
     * Otherwise return `transition` unchanged.
     */
    function resolveTransition(transition, parentTransition) {
        if (transition?.inherit && parentTransition) {
            const { inherit: _, ...rest } = transition;
            return { ...parentTransition, ...rest };
        }
        return transition;
    }

    function getValueTransition$1(transition, key) {
        const valueTransition = transition?.[key] ??
            transition?.["default"] ??
            transition;
        if (valueTransition !== transition) {
            return resolveTransition(valueTransition, transition);
        }
        return valueTransition;
    }

    const underDampedSpring = {
        type: "spring",
        stiffness: 500,
        damping: 25,
        restSpeed: 10,
    };
    const criticallyDampedSpring = (target) => ({
        type: "spring",
        stiffness: 550,
        damping: target === 0 ? 2 * Math.sqrt(550) : 30,
        restSpeed: 10,
    });
    const keyframesTransition = {
        type: "keyframes",
        duration: 0.8,
    };
    /**
     * Default easing curve is a slightly shallower version of
     * the default browser easing curve.
     */
    const ease = {
        type: "keyframes",
        ease: [0.25, 0.1, 0.35, 1],
        duration: 0.3,
    };
    const getDefaultTransition = (valueKey, { keyframes }) => {
        if (keyframes.length > 2) {
            return keyframesTransition;
        }
        else if (transformProps.has(valueKey)) {
            return valueKey.startsWith("scale")
                ? criticallyDampedSpring(keyframes[1])
                : underDampedSpring;
        }
        return ease;
    };

    const orchestrationKeys = new Set([
        "when",
        "delay",
        "delayChildren",
        "staggerChildren",
        "staggerDirection",
        "repeat",
        "repeatType",
        "repeatDelay",
        "from",
        "elapsed",
        "out",
        "mixer",
    ]);
    /**
     * Decide whether a transition is defined on a given Transition.
     * This filters out orchestration options and returns true
     * if any options are left.
     */
    function isTransitionDefined(transition) {
        for (const key in transition) {
            if (!orchestrationKeys.has(key))
                return true;
        }
        return false;
    }

    const animateMotionValue = (name, value, target, transition = {}, element, isHandoff) => (onComplete) => {
        const valueTransition = getValueTransition$1(transition, name) || {};
        /**
         * Most transition values are currently completely overwritten by value-specific
         * transitions. In the future it'd be nicer to blend these transitions. But for now
         * delay actually does inherit from the root transition if not value-specific.
         */
        const delay = valueTransition.delay || transition.delay || 0;
        /**
         * Elapsed isn't a public transition option but can be passed through from
         * optimized appear effects in milliseconds.
         */
        let { elapsed = 0 } = transition;
        elapsed = elapsed - secondsToMilliseconds(delay);
        const options = {
            keyframes: Array.isArray(target) ? target : [null, target],
            ease: "easeOut",
            velocity: value.getVelocity(),
            ...valueTransition,
            delay: -elapsed,
            onUpdate: (v) => {
                value.set(v);
                valueTransition.onUpdate && valueTransition.onUpdate(v);
            },
            onComplete: () => {
                onComplete();
                valueTransition.onComplete && valueTransition.onComplete();
            },
            name,
            motionValue: value,
            element: isHandoff ? undefined : element,
            hasOnUpdate: !!valueTransition.onUpdate,
        };
        /**
         * If there's no transition defined for this value, we can generate
         * unique transition settings for this value.
         */
        if (!isTransitionDefined(valueTransition)) {
            Object.assign(options, getDefaultTransition(name, options));
        }
        /**
         * Both WAAPI and our internal animation functions use durations
         * as defined by milliseconds, while our external API defines them
         * as seconds.
         */
        options.duration && (options.duration = secondsToMilliseconds(options.duration));
        options.repeatDelay && (options.repeatDelay = secondsToMilliseconds(options.repeatDelay));
        /**
         * Support deprecated way to set initial value. Prefer keyframe syntax.
         */
        if (options.from !== undefined) {
            options.keyframes[0] = options.from;
        }
        let shouldSkip = false;
        if (options.type === false ||
            (options.duration === 0 && !options.repeatDelay)) {
            makeAnimationInstant(options);
            if (options.delay === 0) {
                shouldSkip = true;
            }
        }
        if (MotionGlobalConfig.instantAnimations ||
            MotionGlobalConfig.skipAnimations ||
            element?.shouldSkipAnimations ||
            valueTransition.skipAnimations) {
            shouldSkip = true;
            makeAnimationInstant(options);
            options.delay = 0;
        }
        /**
         * If the transition type or easing has been explicitly set by the user
         * then we don't want to allow flattening the animation.
         */
        options.allowFlatten = !valueTransition.type && !valueTransition.ease;
        /**
         * If we can or must skip creating the animation, and apply only
         * the final keyframe, do so. We also check once keyframes are resolved but
         * this early check prevents the need to create an animation at all.
         */
        if (shouldSkip && !isHandoff && value.get() !== undefined) {
            const finalKeyframe = getFinalKeyframe(options.keyframes, valueTransition);
            if (finalKeyframe !== undefined) {
                frame.update(() => {
                    options.onUpdate(finalKeyframe);
                    options.onComplete();
                });
                return;
            }
        }
        return valueTransition.isSync
            ? new JSAnimation(options)
            : new AsyncMotionValueAnimation(options);
    };

    const MIN_LAYOUT_DISTANCE = 20;
    function bezierPoint(t, origin, control, target) {
        const inv = 1 - t;
        return inv * inv * origin + 2 * inv * t * control + t * t * target;
    }
    function bezierTangentAngle(t, originX, controlX, targetX, originY, controlY, targetY) {
        const dx = 2 * (1 - t) * (controlX - originX) + 2 * t * (targetX - controlX);
        const dy = 2 * (1 - t) * (controlY - originY) + 2 * t * (targetY - controlY);
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }
    function computeArcControlPoint(fromX, fromY, toX, toY, strength, peak) {
        const deltaX = toX - fromX;
        const deltaY = toY - fromY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > 0) {
            const normalPerpX = -deltaY / distance;
            const normalPerpY = deltaX / distance;
            const desiredHeight = strength * distance;
            return {
                x: fromX + deltaX * peak + normalPerpX * desiredHeight,
                y: fromY + deltaY * peak + normalPerpY * desiredHeight,
            };
        }
        return { x: fromX, y: fromY };
    }
    /**
     * The pure sampling factory: `(from, to) => (t) => point`. Internal —
     * used by {@link arc} and the unit tests. Not part of the public surface.
     */
    function createArcPath({ strength = 0.5, peak = 0.5, direction, rotate = false, } = {}) {
        const rotationScale = rotate === true ? 1 : typeof rotate === "number" ? rotate : 0;
        // Auto-direction only: persists across calls to flip the bulge back
        // onto the same screen side when the dominant axis changes between
        // calls. Reuse the factory (module scope / useMemo) to keep this alive.
        let prevBulgeSign;
        const createInterpolator = (from, to) => {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            let signed;
            if (direction === "cw") {
                signed = -strength;
            }
            else if (direction === "ccw") {
                signed = strength;
            }
            else {
                const dom = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
                signed = dom < 0 ? -strength : strength;
            }
            let control = computeArcControlPoint(from.x, from.y, to.x, to.y, signed, peak);
            if (direction === undefined) {
                const isVertical = Math.abs(dx) < Math.abs(dy);
                const midX = from.x + dx * peak;
                const midY = from.y + dy * peak;
                const bulgeSign = isVertical
                    ? Math.sign(control.x - midX)
                    : Math.sign(control.y - midY);
                if (prevBulgeSign !== undefined &&
                    bulgeSign !== 0 &&
                    bulgeSign !== prevBulgeSign) {
                    signed = -signed;
                    control = computeArcControlPoint(from.x, from.y, to.x, to.y, signed, peak);
                }
                else if (bulgeSign !== 0) {
                    prevBulgeSign = bulgeSign;
                }
            }
            const tangent0 = rotationScale
                ? bezierTangentAngle(0, from.x, control.x, to.x, from.y, control.y, to.y)
                : 0;
            const tangent1 = rotationScale
                ? bezierTangentAngle(1, from.x, control.x, to.x, from.y, control.y, to.y)
                : 0;
            const tangentDelta = rotationScale
                ? wrap(-180, 180, tangent1 - tangent0)
                : 0;
            return (t) => {
                const out = {
                    x: bezierPoint(t, from.x, control.x, to.x),
                    y: bezierPoint(t, from.y, control.y, to.y),
                };
                if (rotationScale) {
                    const raw = bezierTangentAngle(t, from.x, control.x, to.x, from.y, control.y, to.y);
                    const baseline = tangent0 + tangentDelta * t;
                    out.rotate = wrap(-180, 180, raw - baseline) * rotationScale;
                }
                return out;
            };
        };
        return createInterpolator;
    }
    /**
     * Creates a curved path for `transition.path`:
     *
     * ```ts
     * <motion.div animate={{ x: 200, y: 100 }} transition={{ path: arc() }} />
     * ```
     *
     * Reuse the returned value (module scope / useMemo / useRef) so its
     * continuity closure survives re-renders — a fresh `arc()` has no memory.
     */
    function arc(options = {}) {
        const sample = createArcPath(options);
        const path = {
            interpolateProjection(delta) {
                // `from` is the current translate offset (carries any in-flight
                // displacement when interrupted); `to` is the new layout origin.
                // The distance floor avoids visible wobble on tiny shifts.
                const tx = delta.x.translate;
                const ty = delta.y.translate;
                if (Math.sqrt(tx * tx + ty * ty) < MIN_LAYOUT_DISTANCE) {
                    return undefined;
                }
                return sample({ x: tx, y: ty }, { x: 0, y: 0 });
            },
            animateValues(getValue, target, transition, delay, animations) {
                if (!("x" in target || "y" in target))
                    return;
                const xValue = getValue("x");
                const yValue = getValue("y");
                const xRaw = target.x;
                const yRaw = target.y;
                const xFrom = (Array.isArray(xRaw) && xRaw[0] != null
                    ? xRaw[0]
                    : xValue?.get()) ?? 0;
                const yFrom = (Array.isArray(yRaw) && yRaw[0] != null
                    ? yRaw[0]
                    : yValue?.get()) ?? 0;
                const xTo = (Array.isArray(xRaw)
                    ? xRaw[xRaw.length - 1]
                    : xRaw ?? xFrom);
                const yTo = (Array.isArray(yRaw)
                    ? yRaw[yRaw.length - 1]
                    : yRaw ?? yFrom);
                // Interruption needs no flag: x/y already hold the displaced
                // mid-arc position, so xFrom/yFrom carry the continuity geometry.
                const interpolate = sample({ x: xFrom, y: yFrom }, { x: xTo, y: yTo });
                // Drive a dedicated `pathRotation` value (composed onto `rotate`
                // at the build sites) rather than `rotate` itself, so a
                // concurrent rotate animation composes and nothing accumulates
                // on interrupt.
                const pathRotationValue = interpolate(0).rotate !== undefined
                    ? getValue("pathRotation")
                    : undefined;
                const pathTransition = {
                    delay,
                    ...getValueTransition$1(transition || {}, "x"),
                };
                delete pathTransition.path;
                const progress = motionValue(0);
                progress.start(animateMotionValue("", progress, [0, 1000], {
                    ...pathTransition,
                    isSync: true,
                    velocity: 0,
                    onUpdate: (latest) => {
                        const point = interpolate(latest / 1000);
                        xValue?.set(point.x);
                        yValue?.set(point.y);
                        if (pathRotationValue && point.rotate !== undefined) {
                            pathRotationValue.set(point.rotate);
                        }
                    },
                    onComplete: () => {
                        xValue?.set(xTo);
                        yValue?.set(yTo);
                        pathRotationValue?.set(0);
                    },
                    // Interrupt/cancel must clear our additive contribution
                    // so it can't linger on top of the user's `rotate`.
                    onStop: () => pathRotationValue?.set(0),
                    onCancel: () => pathRotationValue?.set(0),
                }));
                if (progress.animation) {
                    animations.push(progress.animation);
                }
                delete target.x;
                delete target.y;
            },
        };
        return path;
    }

    /**
     * Parse Framer's special CSS variable format into a CSS token and a fallback.
     *
     * ```
     * `var(--foo, #fff)` => [`--foo`, '#fff']
     * ```
     *
     * @param current
     */
    const splitCSSVariableRegex = 
    // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
    /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
    function parseCSSVariable(current) {
        const match = splitCSSVariableRegex.exec(current);
        if (!match)
            return [,];
        const [, token1, token2, fallback] = match;
        return [`--${token1 ?? token2}`, fallback];
    }
    const maxDepth = 4;
    function getVariableValue(current, element, depth = 1) {
        exports.invariant(depth <= maxDepth, `Max CSS variable fallback depth detected in property "${current}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
        const [token, fallback] = parseCSSVariable(current);
        // No CSS variable detected
        if (!token)
            return;
        // Attempt to read this CSS variable off the element
        const resolved = window.getComputedStyle(element).getPropertyValue(token);
        if (resolved) {
            const trimmed = resolved.trim();
            return isNumericalString(trimmed) ? parseFloat(trimmed) : trimmed;
        }
        return isCSSVariableToken(fallback)
            ? getVariableValue(fallback, element, depth + 1)
            : fallback;
    }

    function getValueState(visualElement) {
        const state = [{}, {}];
        visualElement?.values.forEach((value, key) => {
            state[0][key] = value.get();
            state[1][key] = value.getVelocity();
        });
        return state;
    }
    function resolveVariantFromProps(props, definition, custom, visualElement) {
        const resolveFunction = (def) => typeof def === "function"
            ? def(custom !== undefined ? custom : props.custom, ...getValueState(visualElement))
            : def;
        /**
         * Resolve a function, then a variant label (which the function may have
         * returned), then a function again as the label may point to one. The
         * final function can only return a target object.
         */
        definition = resolveFunction(definition);
        if (typeof definition === "string") {
            definition = props.variants && props.variants[definition];
        }
        return resolveFunction(definition);
    }

    function resolveVariant(visualElement, definition, custom) {
        return resolveVariantFromProps(visualElement.getProps(), definition, custom, visualElement);
    }
    /**
     * Exit variants resolve with AnimatePresence's custom, every other type
     * with the element's own.
     */
    const getTypeCustom = (visualElement, type) => type === "exit" ? visualElement.presenceContext?.custom : undefined;

    const positionalKeys = new Set([
        "width",
        "height",
        "top",
        "left",
        "right",
        "bottom",
        ...transformPropOrder,
    ]);

    const isKeyframesTarget = (v) => {
        return Array.isArray(v);
    };

    /**
     * Set VisualElement's MotionValue, creating a new MotionValue for it if
     * it doesn't exist.
     */
    function setMotionValue(visualElement, key, value) {
        if (visualElement.hasValue(key)) {
            visualElement.getValue(key).set(value);
        }
        else {
            visualElement.addValue(key, motionValue(value));
        }
    }
    function resolveFinalValueInKeyframes(v) {
        // TODO maybe throw if v.length - 1 is placeholder token?
        return isKeyframesTarget(v) ? v[v.length - 1] || 0 : v;
    }
    function setTarget(visualElement, definition) {
        const resolved = resolveVariant(visualElement, definition);
        let { transitionEnd = {}, transition = {}, ...target } = resolved || {};
        target = { ...target, ...transitionEnd };
        for (const key in target) {
            const value = resolveFinalValueInKeyframes(target[key]);
            setMotionValue(visualElement, key, value);
        }
    }

    const isMotionValue = (value) => Boolean(value && value.getVelocity);

    function isWillChangeMotionValue(value) {
        return Boolean(isMotionValue(value) && value.add);
    }

    function addValueToWillChange(visualElement, key) {
        const willChange = visualElement.getValue("willChange");
        /**
         * It could be that a user has set willChange to a regular MotionValue,
         * in which case we can't add the value to it.
         */
        if (isWillChangeMotionValue(willChange)) {
            return willChange.add(key);
        }
        else if (!willChange && MotionGlobalConfig.WillChange) {
            const newWillChange = new MotionGlobalConfig.WillChange("auto");
            visualElement.addValue("willChange", newWillChange);
            newWillChange.add(key);
        }
    }

    const optimizedAppearDataId = "framerAppearId";
    const optimizedAppearDataAttribute = "data-framer-appear-id";

    function getOptimisedAppearId(visualElement) {
        return visualElement.props[optimizedAppearDataAttribute];
    }

    const isBrowser$1 = typeof window !== "undefined";
    /**
     * Decide whether we should block this animation. Previously, we achieved this
     * just by checking whether the key was listed in protectedKeys, but this
     * posed problems if an animation was triggered by afterChildren and protectedKeys
     * had been set to true in the meantime.
     */
    function shouldBlockAnimation({ protectedKeys, needsAnimating }, key) {
        const shouldBlock = key in protectedKeys && !needsAnimating[key];
        needsAnimating[key] = false;
        return shouldBlock;
    }
    function animateTarget(visualElement, targetAndTransition, { delay = 0, transitionOverride, type } = {}) {
        let { transition, transitionEnd, ...target } = targetAndTransition;
        const defaultTransition = visualElement.getDefaultTransition();
        transition = transition
            ? resolveTransition(transition, defaultTransition)
            : defaultTransition;
        const reduceMotion = transition?.reduceMotion;
        const skipAnimations = transition?.skipAnimations;
        if (transitionOverride)
            transition = transitionOverride;
        const animations = [];
        const animationTypeState = type && visualElement.animationState?.getState()[type];
        const path = transition?.path;
        if (path) {
            // path mutates `target` to claim x/y; loop below skips them.
            path.animateValues
                ? path.animateValues((key) => visualElement.getValue(key, visualElement.latestValues[key] ?? 0), target, transition, delay, animations)
                : path.animateVisualElement?.(visualElement, target, transition, delay, animations);
        }
        for (const key in target) {
            const value = visualElement.getValue(key, visualElement.latestValues[key] ?? null);
            const valueTarget = target[key];
            if (valueTarget === undefined ||
                (animationTypeState &&
                    shouldBlockAnimation(animationTypeState, key))) {
                continue;
            }
            const valueTransition = {
                delay,
                ...getValueTransition$1(animationTypeState?.out[key] || transition || {}, key),
            };
            if (skipAnimations)
                valueTransition.skipAnimations = true;
            /**
             * If the value is already at the defined target, skip the animation.
             * We still re-assert the value via frame.update to take precedence
             * over any stale transitionEnd callbacks from previous animations.
             */
            const currentValue = value.get();
            if (currentValue !== undefined &&
                !value.isAnimating() &&
                !Array.isArray(valueTarget) &&
                valueTarget === currentValue &&
                !valueTransition.velocity) {
                frame.update(() => value.set(valueTarget));
                continue;
            }
            /**
             * If this is the first time a value is being animated, check
             * to see if we're handling off from an existing animation.
             */
            let isHandoff = false;
            if (isBrowser$1 && window.MotionHandoffAnimation) {
                const appearId = getOptimisedAppearId(visualElement);
                if (appearId) {
                    const startTime = window.MotionHandoffAnimation(appearId, key, frame);
                    if (startTime !== null) {
                        valueTransition.startTime = startTime;
                        isHandoff = true;
                    }
                }
            }
            addValueToWillChange(visualElement, key);
            const shouldReduceMotion = reduceMotion ?? visualElement.shouldReduceMotion;
            value.start(animateMotionValue(key, value, valueTarget, shouldReduceMotion && positionalKeys.has(key)
                ? { type: false }
                : valueTransition, visualElement, isHandoff));
            const animation = value.animation;
            if (animation) {
                animations.push(animation);
            }
        }
        if (transitionEnd) {
            const applyTransitionEnd = () => frame.update(() => {
                transitionEnd && setTarget(visualElement, transitionEnd);
            });
            if (animations.length) {
                Promise.all(animations).then(applyTransitionEnd);
            }
            else {
                applyTransitionEnd();
            }
        }
        return animations;
    }

    function animateVariant(visualElement, variant, options = {}) {
        const resolved = resolveVariant(visualElement, variant, getTypeCustom(visualElement, options.type));
        const transition = options.transitionOverride ||
            (resolved?.transition ?? (visualElement.getDefaultTransition() || {}));
        const getAnimation = () => Promise.all(resolved ? animateTarget(visualElement, resolved, options) : []);
        const getChildAnimations = (delay = 0) => {
            const { variantChildren } = visualElement;
            const { delayChildren = 0, staggerChildren, staggerDirection, } = transition;
            const animations = [];
            variantChildren?.forEach((child) => {
                child.notify("AnimationStart", variant);
                animations.push(animateVariant(child, variant, {
                    ...options,
                    delay: delay +
                        (typeof delayChildren === "function"
                            ? 0
                            : delayChildren) +
                        calcChildStagger(variantChildren, child, delayChildren, staggerChildren, staggerDirection),
                }).then(() => child.notify("AnimationComplete", variant)));
            });
            return Promise.all(animations);
        };
        /**
         * when: "beforeChildren" | "afterChildren" runs this element's animation
         * and its children's in sequence.
         */
        const { when } = transition;
        return when
            ? when === "beforeChildren"
                ? getAnimation().then(() => getChildAnimations())
                : getChildAnimations().then(getAnimation)
            : Promise.all([getAnimation(), getChildAnimations(options.delay)]);
    }

    function animateVisualElement(visualElement, definition, options = {}) {
        visualElement.notify("AnimationStart", definition);
        const animation = Array.isArray(definition)
            ? Promise.all(definition.map((variant) => animateVariant(visualElement, variant, options)))
            : typeof definition === "string"
                ? animateVariant(visualElement, definition, options)
                : Promise.all(animateTarget(visualElement, resolveVariant(visualElement, definition, options.custom), options));
        return animation.then(() => {
            visualElement.notify("AnimationComplete", definition);
        });
    }

    /**
     * ValueType for "auto"
     */
    const auto = {
        test: (v) => v === "auto",
        parse: (v) => v,
    };

    /**
     * Tests a provided value against a ValueType
     */
    const testValueType = (v) => (type) => type.test(v);

    /**
     * A list of value types commonly used for dimensions
     */
    const dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto];
    /**
     * Tests a dimensional value against the list of dimension ValueTypes
     */
    const findDimensionValueType = (v) => dimensionValueTypes.find(testValueType(v));

    function isNone(value) {
        if (typeof value === "number") {
            return value === 0;
        }
        else if (value !== null) {
            return value === "none" || value === "0" || isZeroValueString(value);
        }
        else {
            return true;
        }
    }

    /**
     * If we encounter keyframes like "none" or "0" and we also have keyframes like
     * "#fff" or "200px 200px" we want to find a keyframe to serve as a template for
     * the "none" keyframes. In this case "#fff" or "200px 200px" - then these get turned into
     * zero equivalents, i.e. "#fff0" or "0px 0px".
     */
    const invalidTemplates = new Set(["auto", "none", "0"]);
    function makeNoneKeyframesAnimatable(unresolvedKeyframes, noneKeyframeIndexes, name) {
        let i = 0;
        let animatableTemplate = undefined;
        while (i < unresolvedKeyframes.length && !animatableTemplate) {
            const keyframe = unresolvedKeyframes[i];
            if (typeof keyframe === "string" &&
                !invalidTemplates.has(keyframe) &&
                hasComplexValues(keyframe)) {
                animatableTemplate = unresolvedKeyframes[i];
            }
            i++;
        }
        if (animatableTemplate && name) {
            for (const noneIndex of noneKeyframeIndexes) {
                /**
                 * A zero-valued template like "0%" is already its own
                 * animatable none, so there's nothing to derive.
                 */
                if (unresolvedKeyframes[noneIndex] === animatableTemplate)
                    continue;
                unresolvedKeyframes[noneIndex] = getAnimatableNone(name, animatableTemplate);
            }
        }
    }

    class DOMKeyframesResolver extends KeyframeResolver {
        constructor() {
            super(...arguments);
            this.isAsync = true;
        }
        /**
         * Keyframes that don't need reading from the DOM, or measuring,
         * resolve straight away rather than in the frame loop's batched read.
         */
        scheduleResolve() {
            if (this.canReadNow()) {
                this.readKeyframes();
                if (!this.needsMeasurement)
                    return this.complete();
            }
            super.scheduleResolve();
        }
        canReadNow() {
            const { unresolvedKeyframes, element, motionValue } = this;
            const origin = unresolvedKeyframes[0] ?? motionValue?.get();
            if (!element?.current || origin === undefined)
                return false;
            for (let i = 0; i < unresolvedKeyframes.length; i++) {
                if (containsCSSVariable(i ? unresolvedKeyframes[i] : origin)) {
                    return false;
                }
            }
            return true;
        }
        readKeyframes() {
            const { unresolvedKeyframes, element, name } = this;
            if (!element?.current)
                return;
            super.readKeyframes();
            /**
             * If any keyframe is a CSS variable, we need to find its value by sampling the element
             */
            for (let i = 0; i < unresolvedKeyframes.length; i++) {
                let keyframe = unresolvedKeyframes[i];
                if (typeof keyframe === "string") {
                    keyframe = keyframe.trim();
                    if (isCSSVariableToken(keyframe)) {
                        const resolved = getVariableValue(keyframe, element.current);
                        if (resolved !== undefined) {
                            unresolvedKeyframes[i] = resolved;
                        }
                        if (i === unresolvedKeyframes.length - 1) {
                            this.finalKeyframe = keyframe;
                        }
                    }
                }
            }
            /**
             * Resolve "none" values. We do this potentially twice - once before and once after measuring keyframes.
             * This could be seen as inefficient but it's a trade-off to avoid measurements in more situations, which
             * have a far bigger performance impact.
             */
            this.resolveNoneKeyframes();
            /**
             * Check to see if unit type has changed. If so schedule jobs that will
             * temporarily set styles to the destination keyframes.
             * Skip if we have more than two keyframes or this isn't a positional value.
             * TODO: We can throw if there are multiple keyframes and the value type changes.
             */
            if (!positionalKeys.has(name) || unresolvedKeyframes.length !== 2) {
                return;
            }
            const [origin, target] = unresolvedKeyframes;
            // Two numbers share a unit, so skip the value type search.
            if (typeof origin === "number" && typeof target === "number")
                return;
            const originType = findDimensionValueType(origin);
            const targetType = findDimensionValueType(target);
            /**
             * If one keyframe contains embedded CSS variables (e.g. in calc()) and the other
             * doesn't, we need to measure to convert to pixels. This handles GitHub issue #3410.
             */
            const originHasVar = containsCSSVariable(origin);
            const targetHasVar = containsCSSVariable(target);
            if (originHasVar !== targetHasVar && positionalValues[name]) {
                this.needsMeasurement = true;
                return;
            }
            /**
             * Either we don't recognise these value types or we can animate between them.
             */
            if (originType === targetType)
                return;
            /**
             * If both values are numbers or pixels, we can animate between them by
             * converting them to numbers.
             */
            if (isNumOrPxType(originType) && isNumOrPxType(targetType)) {
                for (let i = 0; i < unresolvedKeyframes.length; i++) {
                    const value = unresolvedKeyframes[i];
                    if (typeof value === "string") {
                        unresolvedKeyframes[i] = parseFloat(value);
                    }
                }
            }
            else if (positionalValues[name]) {
                /**
                 * Else, the only way to resolve this is by measuring the element.
                 */
                this.needsMeasurement = true;
            }
        }
        resolveNoneKeyframes() {
            const { unresolvedKeyframes, name } = this;
            const noneKeyframeIndexes = [];
            for (let i = 0; i < unresolvedKeyframes.length; i++) {
                if (unresolvedKeyframes[i] === null ||
                    isNone(unresolvedKeyframes[i])) {
                    noneKeyframeIndexes.push(i);
                }
            }
            if (noneKeyframeIndexes.length) {
                makeNoneKeyframesAnimatable(unresolvedKeyframes, noneKeyframeIndexes, name);
            }
        }
        measure() {
            const { element, name } = this;
            return positionalValues[name](window.getComputedStyle(element.current), () => element.measureViewportBox());
        }
        measureInitialState() {
            const { element, unresolvedKeyframes, name } = this;
            if (!element?.current)
                return;
            if (name === "height")
                this.suspendedScrollY = window.pageYOffset;
            this.measuredOrigin = this.measure();
            unresolvedKeyframes[0] = this.measuredOrigin;
            // Set final key frame to measure after next render
            const measureKeyframe = unresolvedKeyframes[unresolvedKeyframes.length - 1];
            if (measureKeyframe !== undefined) {
                this.motionValue?.jump(measureKeyframe, false);
            }
        }
        measureEndState() {
            const { element, unresolvedKeyframes } = this;
            if (!element?.current)
                return;
            this.motionValue?.jump(this.measuredOrigin, false);
            const finalKeyframeIndex = unresolvedKeyframes.length - 1;
            const finalKeyframe = unresolvedKeyframes[finalKeyframeIndex];
            unresolvedKeyframes[finalKeyframeIndex] = this.measure();
            if (finalKeyframe !== null && this.finalKeyframe === undefined) {
                this.finalKeyframe = finalKeyframe;
            }
            this.resolveNoneKeyframes();
        }
    }

    /**
     * The four corner-radius longhands. Shared so the projection mixer, scale
     * corrector, WAAPI px-value set and view-transition crop pass don't each carry
     * their own copy. Order is irrelevant - every consumer mixes/corrects/animates
     * each corner independently.
     */
    const cornerRadiusProps = [
        "borderTopLeftRadius",
        "borderTopRightRadius",
        "borderBottomRightRadius",
        "borderBottomLeftRadius",
    ];

    const pxValues = new Set([
        // Border props
        "borderWidth",
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
        "borderRadius",
        ...cornerRadiusProps,
        // Positioning props
        "width",
        "maxWidth",
        "height",
        "maxHeight",
        "top",
        "right",
        "bottom",
        "left",
        "inset",
        "insetBlock",
        "insetBlockStart",
        "insetBlockEnd",
        "insetInline",
        "insetInlineStart",
        "insetInlineEnd",
        // Spacing props
        "padding",
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "paddingBlock",
        "paddingBlockStart",
        "paddingBlockEnd",
        "paddingInline",
        "paddingInlineStart",
        "paddingInlineEnd",
        "margin",
        "marginTop",
        "marginRight",
        "marginBottom",
        "marginLeft",
        "marginBlock",
        "marginBlockStart",
        "marginBlockEnd",
        "marginInline",
        "marginInlineStart",
        "marginInlineEnd",
        // Typography
        "fontSize",
        // Misc
        "backgroundPositionX",
        "backgroundPositionY",
    ]);

    function applyPxDefaults(keyframes, name) {
        for (let i = 0; i < keyframes.length; i++) {
            if (typeof keyframes[i] === "number" && pxValues.has(name)) {
                keyframes[i] = keyframes[i] + "px";
            }
        }
    }

    function isWaapiSupportedEasing(easing) {
        return Boolean((typeof easing === "function" && supportsLinearEasing()) ||
            !easing ||
            (typeof easing === "string" &&
                (easing in supportedWaapiEasing || supportsLinearEasing())) ||
            isBezierDefinition(easing) ||
            (Array.isArray(easing) && easing.every(isWaapiSupportedEasing)));
    }

    const supportsPartialKeyframes = /*@__PURE__*/ memo(() => {
        try {
            document.createElement("div").animate({ opacity: [1] });
        }
        catch (e) {
            return false;
        }
        return true;
    });

    /**
     * Effects registered via `animate.addEffect()`, most recent first.
     */
    const effects = [];
    function addEffect(effect) {
        exports.invariant(typeof effect.test === "function" &&
                typeof effect.read === "function", "Effects passed to animate.addEffect() need test() and read().", "effect-missing-test");
        removeEffect(effect);
        effects.unshift(effect);
    }
    function removeEffect(effect) {
        removeItem(effects, effect);
    }
    function findEffect(subject) {
        return effects.find((effect) => effect.test(subject));
    }
    /**
     * Animate each key in `keyframes` on the motion value `getValue` returns
     * for it. `element` is what the keyframe resolver uses to read, render
     * and measure the subject when the effect defers resolution to it.
     */
    function animateValues(getValue, keyframes, transition = {}, element) {
        const animations = [];
        const { velocity, path } = transition;
        const reduceMotion = transition.reduceMotion ?? element?.shouldReduceMotion;
        /**
         * Only elements have x/y to move along a path. path claims them by
         * deleting them, so hand it a copy.
         */
        if (path?.animateValues && element) {
            keyframes = { ...keyframes };
            path.animateValues(getValue, keyframes, transition, 0, animations);
        }
        for (const key in keyframes) {
            if (key === "transition" || key === "transitionEnd")
                continue;
            const target = keyframes[key];
            if (target === undefined)
                continue;
            const value = getValue(key);
            /**
             * If the value is already at the defined target, skip the animation.
             * We still re-assert the value via frame.update to take precedence
             * over any stale transitionEnd callbacks from previous animations.
             */
            const current = value.get();
            if (current !== undefined &&
                !value.isAnimating() &&
                !Array.isArray(target) &&
                target === current &&
                !velocity) {
                frame.update(() => value.set(target));
                continue;
            }
            value.start(animateMotionValue(key, value, target, reduceMotion && positionalKeys.has(key)
                ? { type: false }
                : transition, element));
            value.animation &&
                animations.push(value.animation);
        }
        const { transitionEnd } = keyframes;
        if (transitionEnd) {
            const applyTransitionEnd = () => frame.update(() => {
                for (const key in transitionEnd) {
                    getValue(key).set(transitionEnd[key]);
                }
            });
            animations.length
                ? Promise.all(animations).then(applyTransitionEnd)
                : applyTransitionEnd();
        }
        return animations;
    }
    /**
     * Animate the keys of `subject` via `effect`. Motion values are created on
     * first animation and bound to the subject through the effect for the
     * rest of its life.
     *
     * Without `element`, a new value is seeded synchronously from the first
     * keyframe or `effect.read()`. With it, the value starts undefined and the
     * keyframe resolver reads the subject (batched, with unit conversion by
     * measurement) via `element`.
     */
    function animateEffectSubject(effect, subject, keyframes, transition, element) {
        return animateValues((key) => {
            let value = effect.get(subject, key);
            if (!value) {
                let initial;
                if (!element) {
                    const target = keyframes[key];
                    initial =
                        firstKeyframe(target) ??
                            effect.read(subject, key, target);
                    exports.invariant(initial !== undefined, `"${key}" can't be read from the animated subject. Provide [from, to] keyframes.`, "effect-unreadable-value");
                }
                value = motionValue(initial, { owner: element });
                effect(subject, { [key]: value });
            }
            return value;
        }, keyframes, transition, element);
    }
    function firstKeyframe(target) {
        const first = Array.isArray(target) ? target[0] : undefined;
        return first === null ? undefined : first;
    }

    /**
     * Checks if an element is an HTML element in a way
     * that works across iframes
     */
    function isHTMLElement(element) {
        return (isObject(element) &&
            "offsetHeight" in element &&
            !("ownerSVGElement" in element));
    }

    /**
     * Checks if an element is an SVG element in a way
     * that works across iframes
     */
    function isSVGElement(element) {
        return isObject(element) && "ownerSVGElement" in element;
    }

    const activeScope = {};
    /**
     * Register `cleanup` with the active scope, if there is one, so stopping
     * the scope also runs it.
     */
    function addToScope(cleanup) {
        activeScope.current?.add(cleanup);
        return cleanup;
    }
    /**
     * Collect the animation a builder like `animateLayout()` or
     * `animateView()` resolves with. If the scope stops first, the animation
     * is stopped as soon as it starts.
     */
    function addBuilderToScope(builder) {
        const scope = activeScope.current;
        if (!scope)
            return;
        let isStopped = false;
        let stop;
        const remove = scope.add(() => {
            isStopped = true;
            stop?.();
        });
        builder.then((animation) => {
            if (!animation)
                return;
            stop = () => animation.stop();
            isStopped ? stop() : animation.finished.then(remove);
        }, remove);
    }
    /**
     * Bind `callback` to the active scope, so anything it starts later (for
     * instance an animation in an `inView()` callback) is collected too.
     */
    const bindToScope = (callback) => activeScope.current ? activeScope.current.bind(callback) : callback;

    function resolveElements(elementOrSelector, scope, selectorCache) {
        if (elementOrSelector == null) {
            return [];
        }
        if (elementOrSelector instanceof EventTarget) {
            return [elementOrSelector];
        }
        else if (typeof elementOrSelector === "string") {
            const root = scope
                ? scope.current
                : activeScope.current?.root || document;
            const elements = selectorCache?.[elementOrSelector] ??
                root.querySelectorAll(elementOrSelector);
            return elements ? Array.from(elements) : [];
        }
        return Array.from(elementOrSelector).filter((element) => element != null);
    }

    function createSelectorEffect(subjectEffect) {
        const effect = (subject, values) => {
            const elements = resolveElements(subject);
            const subscriptions = [];
            for (const element of elements) {
                const remove = subjectEffect(element, values);
                subscriptions.push(remove);
            }
            return () => {
                for (const remove of subscriptions)
                    remove();
            };
        };
        const { test, read, get, flush, state } = subjectEffect;
        return Object.assign(effect, {
            test,
            read,
            get: get,
            flush,
            state,
        });
    }

    class MotionValueState {
        /**
         * @param step - The frameloop step renders are scheduled in. Defaults
         * to `frame.render`. Effects that feed a render loop running in
         * `frame.render` (GPU scenes) should write in `frame.preRender`.
         */
        constructor(step = frame.render) {
            this.step = step;
            this.values = new Map();
            /**
             * Renders scheduled for the next flush, usually one or two (values
             * bound to the same computed render, e.g. `x` and `y` to `transform`,
             * share an entry). Tracked with a count rather than truncating the
             * array so no backing store is reallocated every frame. Kept per
             * state so pending writes can be flushed synchronously before the
             * subject is measured.
             */
            this.pending = [];
            this.numPending = 0;
            /**
             * Run the pending renders. Resetting the count first means a render
             * scheduled while flushing lands in the next frame, as with the
             * frameloop itself.
             */
            this.flush = () => {
                const { pending, numPending } = this;
                this.numPending = 0;
                for (let i = 0; i < numPending; i++)
                    pending[i]();
            };
        }
        /**
         * @param render - Writes the value to the subject. Renders read the
         * motion value directly rather than a cached copy, so there is one
         * place a value lives.
         * @param computed - A value already in this state (e.g. `transform`)
         * whose render should run whenever `value` changes.
         */
        set(name, value, render, computed) {
            this.values.get(name)?.onRemove();
            if (computed) {
                for (const entry of this.values.values()) {
                    if (entry.value === computed)
                        render = entry.render;
                }
            }
            const onChange = () => render && this.schedule(render);
            /**
             * Values created ahead of a DOM read start out undefined and
             * have nothing to render until they're set.
             */
            value.get() !== undefined && onChange();
            const cancelOnChange = value.on("change", onChange);
            const onRemove = () => {
                cancelOnChange();
                render && !computed && this.cancel(render);
                /**
                 * A later set() of the same name has already removed this
                 * entry, so leave the one that replaced it.
                 */
                this.values.get(name)?.onRemove === onRemove &&
                    this.values.delete(name);
            };
            this.values.set(name, {
                value,
                render: computed ? undefined : render,
                onRemove,
            });
            return onRemove;
        }
        get(name) {
            return this.values.get(name)?.value;
        }
        /**
         * Detach every value from this state and return them, so another
         * renderer can take them over. The state stays cached by its effect,
         * so the bound transforms are reset too rather than leaking into
         * values bound later.
         */
        release() {
            const values = new Map();
            this.values.forEach((entry, name) => {
                values.set(name, entry.value);
                entry.onRemove();
            });
            this.transformKeys = this.transformValues = undefined;
            return values;
        }
        schedule(render) {
            const { pending, numPending } = this;
            for (let i = 0; i < numPending; i++) {
                if (pending[i] === render)
                    return;
            }
            numPending || this.step(this.flush);
            pending[this.numPending++] = render;
        }
        cancel(render) {
            const { pending } = this;
            for (let i = 0; i < this.numPending; i++) {
                if (pending[i] === render) {
                    pending[i] = pending[--this.numPending];
                    return;
                }
            }
        }
    }

    function createEffect(addValue, { step, ...options } = {}) {
        const stateCache = new WeakMap();
        const effect = (subject, values) => {
            const state = stateCache.get(subject) ?? new MotionValueState(step);
            stateCache.set(subject, state);
            const subscriptions = [];
            for (const key in values) {
                const value = values[key];
                const remove = addValue(subject, state, key, value);
                subscriptions.push(remove);
            }
            return () => {
                for (const cancel of subscriptions)
                    cancel();
            };
        };
        return Object.assign(effect, options, {
            get: (subject, key) => stateCache.get(subject)?.get(key),
            flush: (subject) => stateCache.get(subject)?.flush(),
            state: (subject) => stateCache.get(subject),
        });
    }

    function buildTransform(state) {
        let transform = "";
        const { transformKeys: keys = [], transformValues: values = {} } = state;
        /**
         * Loop over the bound transforms in order, adding the ones that
         * aren't at their default value to the transform string.
         */
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = values[key].getCurrent();
            if (value === undefined)
                continue;
            if (!isDefaultTransform(key, value)) {
                transform += (transform && " ") + transformFunction(key, value);
            }
        }
        // See build-transform.ts: additive `rotate()` so user `rotate` isn't
        // clobbered. Not a `transformPropOrder` slot.
        const pathRotation = state.get("pathRotation")?.get();
        if (pathRotation) {
            transform +=
                (transform && " ") + transformFunction("rotate", pathRotation);
        }
        return transform || "none";
    }

    const originProps = new Set(["originX", "originY", "originZ"]);
    /**
     * A bound value in its default unit, e.g. `originX: 50` -> `"50%"`.
     */
    const styleValue = (state, key) => getValueAsType(state.get(key)?.get(), numberValueTypes[key]);
    const addStyleValue = (element, state, key, value) => {
        let render = undefined;
        let computed = undefined;
        if (transformProps.has(key)) {
            if (key !== "pathRotation") {
                const keys = (state.transformKeys ?? (state.transformKeys = []));
                (state.transformValues ?? (state.transformValues = {}))[key] = value;
                if (!keys.includes(key)) {
                    keys.push(key);
                    keys.sort((a, b) => transformPropOrder.indexOf(a) -
                        transformPropOrder.indexOf(b));
                }
            }
            if (!state.get("transform")) {
                // If this is an HTML element, we need to set the transform-box to fill-box
                // to normalise the transform relative to the element's bounding box
                if (!isHTMLElement(element) && !state.get("transformBox")) {
                    addStyleValue(element, state, "transformBox", new MotionValue("fill-box"));
                }
                state.set("transform", new MotionValue("none"), () => {
                    transformGroups.get(element)?.check();
                    element.style.transform = buildTransform(state);
                });
            }
            computed = state.get("transform");
        }
        else if (originProps.has(key)) {
            if (!state.get("transformOrigin")) {
                state.set("transformOrigin", new MotionValue(""), () => {
                    const originX = styleValue(state, "originX") ?? "50%";
                    const originY = styleValue(state, "originY") ?? "50%";
                    const originZ = styleValue(state, "originZ") ?? 0;
                    element.style.transformOrigin = `${originX} ${originY} ${originZ}`;
                });
            }
            computed = state.get("transformOrigin");
        }
        else if (isCSSVar(key)) {
            render = () => {
                element.style.setProperty(key, value.getCurrent());
            };
        }
        else {
            render = () => {
                element.style[key] = getValueAsType(value.getCurrent(), numberValueTypes[key]);
            };
        }
        return state.set(key, value, render, computed);
    };
    const isStyleSubject = (subject) => isHTMLElement(subject) || isSVGElement(subject);
    /**
     * Reads the current value of a style from the element, as the initial
     * keyframe when `animate()` targets an element via this effect. Transforms
     * are parsed out of the computed matrix; everything else is the computed
     * style. Units aren't converted to match the target keyframes. A style
     * the browser can't report is 0, as a VisualElement reports it.
     */
    const readStyleValue = (element, key) => {
        if (transformProps.has(key)) {
            return readTransformValue(element, key);
        }
        const computedStyle = getComputedStyle(element);
        const value = isCSSVar(key)
            ? computedStyle.getPropertyValue(key)
            : computedStyle[key];
        return (typeof value === "string" && value.trim()) || 0;
    };
    /**
     * The per-element effect `animate()` binds through, so HTML values share
     * state with a direct `styleEffect()` call. The exported `styleEffect`
     * is this wrapped to also accept selectors.
     */
    const styleSubjectEffect = /*@__PURE__*/ createEffect(addStyleValue, {
        test: isStyleSubject,
        read: readStyleValue,
    });
    const styleEffect = 
    /*@__PURE__*/ createSelectorEffect(styleSubjectEffect);

    function camelToDash(str) {
        return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
    }

    function buildHTMLStyles(state, latestValues, transformTemplate) {
        const { style, vars, transformOrigin } = state;
        // Track whether we encounter any transform or transformOrigin values.
        let hasTransform = false;
        let hasTransformOrigin = false;
        /**
         * Loop over all our latest animated values and decide whether to handle them
         * as a style or CSS variable.
         *
         * Transforms and transform origins are kept separately for further processing.
         */
        for (const key in latestValues) {
            const value = latestValues[key];
            if (transformProps.has(key)) {
                // If this is a transform, flag to enable further transform processing
                hasTransform = true;
                continue;
            }
            else if (isCSSVariableName(key)) {
                vars[key] = value;
                continue;
            }
            else {
                // Convert the value to its default value type, ie 0 -> "0px"
                const valueAsType = getValueAsType(value, numberValueTypes[key]);
                if (key.startsWith("origin")) {
                    // If this is a transform origin, flag and enable further transform-origin processing
                    hasTransformOrigin = true;
                    transformOrigin[key] =
                        valueAsType;
                }
                else {
                    style[key] = valueAsType;
                }
            }
        }
        if (!latestValues.transform) {
            if (hasTransform || transformTemplate) {
                style.transform = buildTransform$1(latestValues, state.transform, transformTemplate);
            }
            else if (style.transform) {
                /**
                 * If we have previously created a transform but currently don't have any,
                 * reset transform style to none.
                 */
                style.transform = "none";
            }
        }
        /**
         * Build a transformOrigin style. Uses the same defaults as the browser for
         * undefined origins.
         */
        if (hasTransformOrigin) {
            const { originX = "50%", originY = "50%", originZ = 0, } = transformOrigin;
            style.transformOrigin = `${originX} ${originY} ${originZ}`;
        }
    }

    const dashKeys = {
        offset: "stroke-dashoffset",
        array: "stroke-dasharray",
    };
    const camelKeys = {
        offset: "strokeDashoffset",
        array: "strokeDasharray",
    };
    /**
     * Build SVG path properties. Uses the path's measured length to convert
     * our custom pathLength, pathSpacing and pathOffset into stroke-dashoffset
     * and stroke-dasharray attributes.
     *
     * This function is mutative to reduce per-frame GC.
     *
     * Note: We use unitless values for stroke-dasharray and stroke-dashoffset
     * because Safari incorrectly scales px values when the page is zoomed.
     */
    function buildSVGPath(attrs, length, spacing = 1, offset = 0, useDashCase = true) {
        // Normalise path length by setting SVG attribute pathLength to 1
        attrs.pathLength = 1;
        // We use dash case when setting attributes directly to the DOM node and camel case
        // when defining props on a React component.
        const keys = useDashCase ? dashKeys : camelKeys;
        // Build the dash offset (unitless to avoid Safari zoom bug)
        attrs[keys.offset] = `${-offset}`;
        // Build the dash array (unitless to avoid Safari zoom bug)
        attrs[keys.array] = `${length} ${spacing}`;
    }

    /**
     * Values rendered via style rather than as attributes. This must include
     * every value WAAPI can accelerate, as WAAPI writes its final value to
     * style, which would otherwise override later attribute writes.
     */
    const cssStyleProperties = [
        "transform",
        "opacity",
        "clipPath",
        "filter",
        "offsetDistance",
        "offsetPath",
        "offsetRotate",
        "offsetAnchor",
    ];
    /**
     * Build SVG visual attributes, like cx and style.transform
     */
    function buildSVGAttrs(state, { attrX, attrY, attrScale, pathLength, pathSpacing = 1, pathOffset = 0, 
    // This is object creation, which we try to avoid per-frame.
    ...latest }, isSVGTag, transformTemplate, styleProp) {
        buildHTMLStyles(state, latest, transformTemplate);
        /**
         * For svg tags we just want to make sure viewBox is animatable and treat all the styles
         * as normal HTML tags.
         */
        if (isSVGTag) {
            if (state.style.viewBox) {
                state.attrs.viewBox = state.style.viewBox;
            }
            return;
        }
        state.attrs = state.style;
        state.style = {};
        const { attrs, style } = state;
        for (const key of cssStyleProperties) {
            if (attrs[key] !== undefined) {
                style[key] = attrs[key];
                delete attrs[key];
            }
        }
        if (style.transform || attrs.transformOrigin) {
            style.transformOrigin = attrs.transformOrigin ?? "50% 50%";
            delete attrs.transformOrigin;
        }
        if (style.transform) {
            /**
             * SVG's element transform-origin uses its own median as a reference.
             * Therefore, transformBox becomes a fill-box
             */
            style.transformBox = styleProp?.transformBox ?? "fill-box";
            delete attrs.transformBox;
        }
        // Render attrX/attrY/attrScale as attributes
        if (attrX !== undefined)
            attrs.x = attrX;
        if (attrY !== undefined)
            attrs.y = attrY;
        if (attrScale !== undefined)
            attrs.scale = attrScale;
        // Build SVG path if one has been defined
        if (pathLength !== undefined) {
            buildSVGPath(attrs, pathLength, pathSpacing, pathOffset, false);
        }
    }

    function canSetAsProperty(element, name) {
        if (!(name in element))
            return false;
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), name) ||
            Object.getOwnPropertyDescriptor(element, name);
        // Check if it has a setter
        return descriptor && typeof descriptor.set === "function";
    }
    /**
     * `name` is the attribute written when it differs from the key the value
     * is stored under, e.g. `attrX` -> `x`. Numbers take the attribute's
     * default unit (`x: 100` -> `"100px"`), as they do when key and name match.
     */
    const addAttrValue = (element, state, key, value, name = key) => {
        const isProp = canSetAsProperty(element, name);
        if (!isProp && (name.startsWith("data") || name.startsWith("aria"))) {
            name = camelToDash(name);
        }
        const type = numberValueTypes[key] || numberValueTypes[name];
        /**
         * Set attribute directly via property if available
         */
        const render = isProp
            ? () => {
                element[name] = getValueAsType(value.get(), numberValueTypes[key]);
            }
            : () => {
                const v = getValueAsType(value.get(), type);
                if (v === null || v === undefined) {
                    element.removeAttribute(name);
                }
                else {
                    element.setAttribute(name, String(v));
                }
            };
        return state.set(key, value, render);
    };
    const attrEffect = /*@__PURE__*/ createSelectorEffect(
    /*@__PURE__*/ createEffect(addAttrValue));

    function addSVGPathValue(element, state, key, value) {
        frame.render(() => element.setAttribute("pathLength", "1"));
        if (key === "pathOffset") {
            return state.set(key, value, () => {
                // Use unitless value to avoid Safari zoom bug
                const offset = value.get();
                element.setAttribute("stroke-dashoffset", `${-offset}`);
            });
        }
        else {
            if (!state.get("stroke-dasharray")) {
                state.set("stroke-dasharray", new MotionValue("1 1"), () => {
                    const pathLength = state.get("pathLength")?.get() ?? 1;
                    const pathSpacing = state.get("pathSpacing")?.get();
                    // Use unitless values to avoid Safari zoom bug
                    element.setAttribute("stroke-dasharray", `${pathLength} ${pathSpacing ?? 1 - Number(pathLength)}`);
                });
            }
            return state.set(key, value, undefined, state.get("stroke-dasharray"));
        }
    }
    const addSVGValue = (element, state, key, value) => {
        if (key.startsWith("path") && !transformProps.has(key)) {
            return addSVGPathValue(element, state, key, value);
        }
        else if (key.startsWith("attr")) {
            return addAttrValue(element, state, key, value, convertAttrKey(key));
        }
        else if (key === "d") {
            /**
             * `d` is a CSS property in Chrome and Firefox, but only as
             * `path(...)`, so path data goes to the attribute, taken out of
             * `path(...)` if it's written that way. Path data itself has no
             * quotes or brackets.
             */
            return state.set(key, value, () => {
                const d = value.get()?.replace(/path\(|["')]/g, "");
                d === undefined
                    ? element.removeAttribute(key)
                    : element.setAttribute(key, d);
            });
        }
        /**
         * Transforms and origins aren't CSS properties (bar `x`/`y` in some
         * browsers), so check them by name rather than `key in element.style`.
         */
        const handler = transformProps.has(key) ||
            originProps.has(key) ||
            isCSSVar(key) ||
            key in element.style
            ? addStyleValue
            : addAttrValue;
        return handler(element, state, key, value);
    };
    /**
     * Reads the current value of `key` from an SVG element as the origin of
     * an animation, as the SVG VisualElement does: transforms start from
     * their defaults, CSS variables and the few CSS-only properties come from
     * computed style, falling back to the attribute when that's empty (e.g.
     * the element isn't rendered), and everything else is read from the
     * attribute, dash-cased (`strokeWidth` -> `stroke-width`) or, failing
     * that, as written (`baseFrequency`).
     */
    const readSVGValue = (element, key) => {
        if (transformProps.has(key)) {
            return numberValueTypes[key]?.default || 0;
        }
        if (isCSSVar(key) || cssStyleProperties.includes(key)) {
            return (readStyleValue(element, key) ||
                element.getAttribute(camelToDash(key)) ||
                0);
        }
        key = convertAttrKey(key);
        return (element.getAttribute(camelToDash(key)) ??
            element.getAttribute(key) ??
            undefined);
    };
    /**
     * The per-element effect `animate()` binds through, so SVG values share
     * state with a direct `svgEffect()` call.
     */
    const svgSubjectEffect = /*@__PURE__*/ createEffect(addSVGValue, {
        test: isSVGElement,
        read: readSVGValue,
    });
    const svgEffect = /*@__PURE__*/ createSelectorEffect(svgSubjectEffect);
    function convertAttrKey(key) {
        return key.replace(/^attr([A-Z])/, (_, firstChar) => firstChar.toLowerCase());
    }

    /**
     * Bounding boxes tend to be defined as top, left, right, bottom. For various operations
     * it's easier to consider each axis individually. This function returns a bounding box
     * as a map of single-axis min/max values.
     */
    function convertBoundingBoxToBox({ top, left, right, bottom, }) {
        return {
            x: { min: left, max: right },
            y: { min: top, max: bottom },
        };
    }
    function convertBoxToBoundingBox({ x, y }) {
        return { top: y.min, right: x.max, bottom: y.max, left: x.min };
    }
    /**
     * Applies a TransformPoint function to a bounding box. TransformPoint is usually a function
     * provided by Framer to allow measured points to be corrected for device scaling. This is used
     * when measuring DOM elements and DOM event points.
     */
    function transformBoxPoints(point, transformPoint) {
        if (!transformPoint)
            return point;
        const topLeft = transformPoint({ x: point.left, y: point.top });
        const bottomRight = transformPoint({ x: point.right, y: point.bottom });
        return {
            top: topLeft.y,
            left: topLeft.x,
            bottom: bottomRight.y,
            right: bottomRight.x,
        };
    }

    function isIdentityScale(scale) {
        return scale === undefined || scale === 1;
    }
    function hasScale({ scale, scaleX, scaleY }) {
        return (!isIdentityScale(scale) ||
            !isIdentityScale(scaleX) ||
            !isIdentityScale(scaleY));
    }
    /**
     * Rotations and skews, which projection can't correct for.
     */
    const angleTransforms = [
        "rotate",
        "rotateX",
        "rotateY",
        "rotateZ",
        "skewX",
        "skewY",
    ];
    function hasTransform(values) {
        return (hasScale(values) ||
            has2DTranslate(values) ||
            hasDistortingTransform(values));
    }
    function hasDistortingTransform(values) {
        return (values.z ||
            values.rotate ||
            values.rotateX ||
            values.rotateY ||
            values.rotateZ ||
            values.skewX ||
            values.skewY);
    }
    function has2DTranslate(values) {
        return is2DTranslate(values.x) || is2DTranslate(values.y);
    }
    function is2DTranslate(value) {
        return value && value !== "0%";
    }

    /**
     * Scales a point based on a factor and an originPoint
     */
    function scalePoint(point, scale, originPoint) {
        const distanceFromOrigin = point - originPoint;
        const scaled = scale * distanceFromOrigin;
        return originPoint + scaled;
    }
    /**
     * Applies a translate/scale delta to a point
     */
    function applyPointDelta(point, translate, scale, originPoint, boxScale) {
        if (boxScale !== undefined) {
            point = scalePoint(point, boxScale, originPoint);
        }
        return scalePoint(point, scale, originPoint) + translate;
    }
    /**
     * Applies a translate/scale delta to an axis
     */
    function applyAxisDelta(axis, translate = 0, scale = 1, originPoint, boxScale) {
        axis.min = applyPointDelta(axis.min, translate, scale, originPoint, boxScale);
        axis.max = applyPointDelta(axis.max, translate, scale, originPoint, boxScale);
    }
    /**
     * Applies a translate/scale delta to a box
     */
    function applyBoxDelta(box, { x, y }) {
        applyAxisDelta(box.x, x.translate, x.scale, x.originPoint);
        applyAxisDelta(box.y, y.translate, y.scale, y.originPoint);
    }
    const TREE_SCALE_SNAP_MIN = 0.999999999999;
    const TREE_SCALE_SNAP_MAX = 1.0000000000001;
    /**
     * Apply a tree of deltas to a box. We do this to calculate the effect of all the transforms
     * in a tree upon our box before then calculating how to project it into our desired viewport-relative box
     *
     * This is the final nested loop within updateLayoutDelta for future refactoring
     *
     * isSharedTransition is true for a shared layout animation in page space, which
     * also applies ancestor scroll and transforms. Or it's the layoutRoot a shared
     * animation is relative to, so only transforms of ancestors not shared with it
     * (or above it) are applied.
     */
    function applyTreeDeltas(box, treeScale, treePath, isSharedTransition = false) {
        const treeLength = treePath.length;
        if (!treeLength)
            return;
        // Reset the treeScale
        treeScale.x = treeScale.y = 1;
        let node;
        let delta;
        for (let i = 0; i < treeLength; i++) {
            node = treePath[i];
            delta = node.projectionDelta;
            /**
             * TODO: Prefer to remove this, but currently we have motion components with
             * display: contents in Framer.
             */
            if (node.options.visualElement?.props.style?.display === "contents") {
                continue;
            }
            if (isSharedTransition === true &&
                node.options.layoutScroll &&
                node.scroll &&
                node !== node.root) {
                translateAxis(box.x, -node.scroll.offset.x);
                translateAxis(box.y, -node.scroll.offset.y);
            }
            if (delta) {
                // Incorporate each ancestor's scale into a cumulative treeScale for this component
                treeScale.x *= delta.x.scale;
                treeScale.y *= delta.y.scale;
                // Apply each ancestor's calculated delta into this component's recorded layout box
                applyBoxDelta(box, delta);
            }
            if (isSharedTransition &&
                (isSharedTransition.path?.[i] || isSharedTransition) !== node &&
                hasTransform(node.latestValues)) {
                transformBox(box, node.latestValues, node.layout?.layoutBox);
            }
        }
        /**
         * Snap tree scale back to 1 if it's within a non-perceivable threshold.
         * This will help reduce useless scales getting rendered.
         */
        if (treeScale.x < TREE_SCALE_SNAP_MAX &&
            treeScale.x > TREE_SCALE_SNAP_MIN) {
            treeScale.x = 1.0;
        }
        if (treeScale.y < TREE_SCALE_SNAP_MAX &&
            treeScale.y > TREE_SCALE_SNAP_MIN) {
            treeScale.y = 1.0;
        }
    }
    function translateAxis(axis, distance) {
        axis.min += distance;
        axis.max += distance;
    }
    /**
     * Apply a transform to an axis from the latest resolved motion values.
     * This function basically acts as a bridge between a flat motion value map
     * and applyAxisDelta
     */
    function transformAxis(axis, axisTranslate, axisScale, boxScale, axisOrigin = 0.5) {
        const originPoint = mixNumber$1(axis.min, axis.max, axisOrigin);
        // Apply the axis delta to the final axis
        applyAxisDelta(axis, axisTranslate, axisScale, originPoint, boxScale);
    }
    function resolveAxisTranslate(value, axis) {
        if (typeof value === "string") {
            return (parseFloat(value) / 100) * (axis.max - axis.min);
        }
        return value;
    }
    /**
     * Apply a transform to a box from the latest resolved motion values.
     */
    function transformBox(box, transform, sourceBox) {
        const resolveBox = sourceBox ?? box;
        transformAxis(box.x, resolveAxisTranslate(transform.x, resolveBox.x), transform.scaleX, transform.scale, transform.originX);
        transformAxis(box.y, resolveAxisTranslate(transform.y, resolveBox.y), transform.scaleY, transform.scale, transform.originY);
    }

    function measureViewportBox(instance, transformPoint) {
        return convertBoundingBoxToBox(transformBoxPoints(instance.getBoundingClientRect(), transformPoint));
    }
    function measurePageBox(element, rootProjectionNode, transformPagePoint) {
        const viewportBox = measureViewportBox(element, transformPagePoint);
        const { scroll } = rootProjectionNode;
        if (scroll) {
            translateAxis(viewportBox.x, scroll.offset.x);
            translateAxis(viewportBox.y, scroll.offset.y);
        }
        return viewportBox;
    }
    const measureDocumentScroll = () => ({
        x: document.documentElement.scrollLeft || document.body?.scrollLeft || 0,
        y: document.documentElement.scrollTop || document.body?.scrollTop || 0,
    });

    const noProps = {};
    const getElementEffect = (element) => (isSVGElement(element)
        ? svgSubjectEffect
        : styleSubjectEffect);
    /**
     * Presents an effect bound to a DOM element in the shape the DOM keyframe
     * resolver and WAAPI expect, which is that of a VisualElement. Holds no
     * state: everything delegates to the effect. Goes once the resolver takes
     * an effect and subject directly.
     */
    class EffectSubject {
        constructor(effect, current) {
            this.effect = effect;
            this.current = current;
            this.KeyframeResolver = DOMKeyframesResolver;
        }
        getValue(key) {
            return this.effect.get(this.current, key);
        }
        readValue(key, target) {
            return this.effect.read(this.current, key, target);
        }
        render() {
            this.effect.flush(this.current);
        }
        measureViewportBox() {
            return measureViewportBox(this.current);
        }
        getProps() {
            return noProps;
        }
    }
    /**
     * Animate a DOM element's styles. HTML elements are bound through
     * styleEffect, SVG through svgEffect, and both are resolved with the DOM
     * keyframe resolver so reads are batched, units are converted by
     * measurement and eligible values run on WAAPI.
     *
     * Pass the element's VisualElement (a <motion.*> component or an
     * animateLayout() node) to animate its values instead, so the two keep
     * sharing values and a renderer.
     */
    function animateElement(element, keyframes, transition, visualElement) {
        activeScope.current?.track(element);
        if (visualElement) {
            return animateValues((key) => visualElement.getValue(key, null), keyframes, transition, visualElement);
        }
        const effect = getElementEffect(element);
        return animateEffectSubject(effect, element, keyframes, transition, new EffectSubject(effect, element));
    }
    /**
     * Detach the values styleEffect/svgEffect bound to `element`, so the
     * next animation reads its starting values from the DOM again.
     */
    const releaseElement = (element) => getElementEffect(element)
        .state(element)
        ?.release();
    /**
     * Hand the values styleEffect/svgEffect are rendering on `element`,
     * whether bound by animate() or directly, to a VisualElement that now
     * owns the element (e.g. created by animateLayout()), so a single
     * renderer drives them alongside its own values.
     */
    function handOffElementState(element, visualElement) {
        const state = getElementEffect(element).state(element);
        if (!state)
            return;
        /**
         * A transform group reads values through the effect state, which is
         * about to be emptied. Hand its animations to the main thread (writing
         * their current transform) and detach it, so animations the
         * VisualElement starts form a new group that reads from it.
         */
        const group = transformGroups.get(element);
        if (group) {
            group.demote();
            transformGroups.delete(element);
        }
        const { transformKeys } = state;
        state.release().forEach((value, key) => {
            /**
             * The style effect derives transform (from the bound transform
             * keys) and transformBox itself; a VisualElement builds its own.
             */
            const derived = key === "transformBox" ||
                (key === "transform" && transformKeys?.length);
            if (!derived) {
                value.owner = visualElement;
                visualElement.addValue(key, value);
            }
        });
    }

    /**
     * Writes motion values to the properties of any object. This is
     * animate()'s fallback for subjects no registered effect claims.
     */
    const propEffect = /*@__PURE__*/ createEffect((subject, state, key, value) => {
        return state.set(key, value, () => {
            subject[key] = value.get();
        });
    }, {
        test: (subject) => isObject(subject),
        read: (subject, key) => {
            const value = subject[key];
            return typeof value === "string" || typeof value === "number"
                ? value
                : undefined;
        },
    });

    const { schedule: microtask, cancel: cancelMicrotask } = 
    /* @__PURE__ */ createRenderBatcher(queueMicrotask, false);

    /**
     * Process a frame now, for driving Motion from a loop other than
     * window.requestAnimationFrame, like an XRSession's during an immersive
     * WebXR session. Wherever window.requestAnimationFrame does fire, Motion
     * keeps processing frames from it too.
     *
     * `timestamp` defaults to now. For a timeline you control, set
     * `MotionGlobalConfig.useManualTiming = true` and pass each frame's time in
     * milliseconds.
     *
     * Animations Motion hands to the browser (WAAPI), like `opacity` or
     * `transform` on an HTML or SVG element, follow the browser's clock. With
     * `useManualTiming` on, Motion runs those in JS instead, except for
     * `motion/mini`, view transitions and optimized appear animations, and
     * colours only the browser can mix, like `oklch()`, which jump to their end.
     *
     * Ignored when called inside a frame.
     */
    const processFrame = (timestamp = time.now()) => {
        if (frameData.isProcessing)
            return;
        const delta = timestamp - frameData.timestamp;
        // Clamp like the requestAnimationFrame loop, unless the timeline is ours
        frameData.delta = MotionGlobalConfig.useManualTiming
            ? delta
            : Math.max(Math.min(delta, 40), 1);
        time.set((frameData.timestamp = timestamp));
        frameData.isProcessing = true;
        // frameSteps' keys are in stepsOrder
        for (const step in frameSteps) {
            frameSteps[step].process(frameData);
        }
        frameData.isProcessing = false;
    };

    function animateSingleValue(value, keyframes, options) {
        const motionValue$1 = isMotionValue(value) ? value : motionValue(value);
        motionValue$1.start(animateMotionValue("", motionValue$1, keyframes, options));
        return motionValue$1.animation;
    }

    const scaleCorrectors = {};
    function addScaleCorrector(correctors) {
        for (const key in correctors) {
            scaleCorrectors[key] = correctors[key];
            if (isCSSVariableName(key)) {
                scaleCorrectors[key].isCSSVariable = true;
            }
        }
    }

    const statsBuffer = {
        value: null,
        addProjectionMetrics: null,
        countProjection: undefined,
    };

    /**
     * Timeout defined in ms
     */
    function delay(callback, timeout) {
        const start = time.now();
        callback = bindToScope(callback);
        const checkElapsed = ({ timestamp }) => {
            const elapsed = timestamp - start;
            if (elapsed >= timeout) {
                cancelFrame(checkElapsed);
                callback(elapsed - timeout);
            }
        };
        frame.setup(checkElapsed, true);
        return addToScope(() => cancelFrame(checkElapsed));
    }
    function delayInSeconds(callback, timeout) {
        return delay(callback, secondsToMilliseconds(timeout));
    }

    function isRefObject(ref) {
        return (ref &&
            typeof ref === "object" &&
            Object.prototype.hasOwnProperty.call(ref, "current"));
    }

    /**
     * Checks if an element is specifically an SVGSVGElement (the root SVG element)
     * in a way that works across iframes
     */
    function isSVGSVGElement(element) {
        return isSVGElement(element) && element.tagName === "svg";
    }

    /**
     * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
     */
    function resolveMotionValue(value) {
        return isMotionValue(value) ? value.get() : value;
    }

    const asNumber = (v) => typeof v === "number" ? v : parseFloat(v);

    const numBorders = cornerRadiusProps.length;
    const isPx = (value) => typeof value === "number" || px.test(value);
    function mixValues(target, follow, lead, progress, shouldCrossfadeOpacity, isOnlyMember) {
        if (shouldCrossfadeOpacity) {
            target.opacity = mixNumber$1(0, lead.opacity ?? 1, easeCrossfadeIn(progress));
            target.opacityExit = mixNumber$1(follow.opacity ?? 1, 0, easeCrossfadeOut(progress));
        }
        else if (isOnlyMember) {
            target.opacity = mixNumber$1(follow.opacity ?? 1, lead.opacity ?? 1, progress);
        }
        /**
         * Mix border radius
         */
        for (let i = 0; i < numBorders; i++) {
            const borderLabel = cornerRadiusProps[i];
            let followRadius = getRadius(follow, borderLabel);
            let leadRadius = getRadius(lead, borderLabel);
            if (followRadius === undefined && leadRadius === undefined)
                continue;
            followRadius || (followRadius = 0);
            leadRadius || (leadRadius = 0);
            const canMix = followRadius === 0 ||
                leadRadius === 0 ||
                isPx(followRadius) === isPx(leadRadius);
            if (canMix) {
                target[borderLabel] = Math.max(mixNumber$1(asNumber(followRadius), asNumber(leadRadius), progress), 0);
                if (percent.test(leadRadius) || percent.test(followRadius)) {
                    target[borderLabel] += "%";
                }
            }
            else {
                target[borderLabel] = leadRadius;
            }
        }
        /**
         * Mix rotation and skew. These can't be projected, so mix them every
         * frame rather than leaving them frozen at the animation-start snapshot.
         */
        for (let i = 0; i < angleTransforms.length; i++) {
            const key = angleTransforms[i];
            if (follow[key] || lead[key]) {
                target[key] = mixNumber$1(follow[key] || 0, lead[key] || 0, progress);
            }
        }
    }
    function getRadius(values, radiusName) {
        return values[radiusName] !== undefined
            ? values[radiusName]
            : values.borderRadius;
    }
    const easeCrossfadeIn = /*@__PURE__*/ compress(0, 0.5, circOut);
    const easeCrossfadeOut = /*@__PURE__*/ compress(0.5, 0.95, noop);
    function compress(min, max, easing) {
        return (p) => {
            // Could replace ifs with clamp
            if (p < min)
                return 0;
            if (p > max)
                return 1;
            return easing(progress(min, max, p));
        };
    }

    /**
     * Reset an axis to the provided origin box.
     *
     * This is a mutative operation.
     */
    function copyAxisInto(axis, originAxis) {
        axis.min = originAxis.min;
        axis.max = originAxis.max;
    }
    /**
     * Reset a box to the provided origin box.
     *
     * This is a mutative operation.
     */
    function copyBoxInto(box, originBox) {
        copyAxisInto(box.x, originBox.x);
        copyAxisInto(box.y, originBox.y);
    }
    /**
     * Reset a delta to the provided origin box.
     *
     * This is a mutative operation.
     */
    function copyAxisDeltaInto(delta, originDelta) {
        delta.translate = originDelta.translate;
        delta.scale = originDelta.scale;
        delta.originPoint = originDelta.originPoint;
        delta.origin = originDelta.origin;
    }

    const SCALE_PRECISION = 0.0001;
    const SCALE_MIN = 1 - SCALE_PRECISION;
    const SCALE_MAX = 1 + SCALE_PRECISION;
    const TRANSLATE_PRECISION = 0.01;
    const TRANSLATE_MIN = 0 - TRANSLATE_PRECISION;
    const TRANSLATE_MAX = 0 + TRANSLATE_PRECISION;
    function calcLength(axis) {
        return axis.max - axis.min;
    }
    function isNear(value, target, maxDistance) {
        return Math.abs(value - target) <= maxDistance;
    }
    function calcAxisDelta(delta, source, target, origin = 0.5) {
        delta.origin = origin;
        delta.originPoint = mixNumber$1(source.min, source.max, delta.origin);
        delta.scale = calcLength(target) / calcLength(source);
        delta.translate =
            mixNumber$1(target.min, target.max, delta.origin) - delta.originPoint;
        if ((delta.scale >= SCALE_MIN && delta.scale <= SCALE_MAX) ||
            isNaN(delta.scale)) {
            delta.scale = 1.0;
        }
        if ((delta.translate >= TRANSLATE_MIN &&
            delta.translate <= TRANSLATE_MAX) ||
            isNaN(delta.translate)) {
            delta.translate = 0.0;
        }
    }
    function calcBoxDelta(delta, source, target, origin) {
        calcAxisDelta(delta.x, source.x, target.x, origin?.originX);
        calcAxisDelta(delta.y, source.y, target.y, origin?.originY);
    }
    function calcRelativeAxis(target, relative, parent, anchor = 0) {
        const anchorPoint = anchor
            ? mixNumber$1(parent.min, parent.max, anchor)
            : parent.min;
        target.min = anchorPoint + relative.min;
        target.max = target.min + calcLength(relative);
    }
    function calcRelativeBox(target, relative, parent, anchor) {
        calcRelativeAxis(target.x, relative.x, parent.x, anchor?.x);
        calcRelativeAxis(target.y, relative.y, parent.y, anchor?.y);
    }
    function calcRelativeAxisPosition(target, layout, parent, anchor = 0) {
        const anchorPoint = anchor
            ? mixNumber$1(parent.min, parent.max, anchor)
            : parent.min;
        target.min = layout.min - anchorPoint;
        target.max = target.min + calcLength(layout);
    }
    function calcRelativePosition(target, layout, parent, anchor) {
        calcRelativeAxisPosition(target.x, layout.x, parent.x, anchor?.x);
        calcRelativeAxisPosition(target.y, layout.y, parent.y, anchor?.y);
    }

    /**
     * Remove a delta from a point. This is essentially the steps of applyPointDelta in reverse
     */
    function removePointDelta(point, translate, scale, originPoint, boxScale) {
        point -= translate;
        point = scalePoint(point, 1 / scale, originPoint);
        if (boxScale !== undefined) {
            point = scalePoint(point, 1 / boxScale, originPoint);
        }
        return point;
    }
    /**
     * Remove a delta from an axis. This is essentially the steps of applyAxisDelta in reverse
     */
    function removeAxisDelta(axis, translate = 0, scale = 1, origin = 0.5, boxScale, originAxis = axis, sourceAxis = axis) {
        if (percent.test(translate)) {
            translate = parseFloat(translate);
            const relativeProgress = mixNumber$1(sourceAxis.min, sourceAxis.max, translate / 100);
            translate = relativeProgress - sourceAxis.min;
        }
        if (typeof translate !== "number")
            return;
        let originPoint = mixNumber$1(originAxis.min, originAxis.max, origin);
        if (axis === originAxis)
            originPoint -= translate;
        axis.min = removePointDelta(axis.min, translate, scale, originPoint, boxScale);
        axis.max = removePointDelta(axis.max, translate, scale, originPoint, boxScale);
    }
    /**
     * Remove a transforms from an axis. This is essentially the steps of applyAxisTransforms in reverse
     * and acts as a bridge between motion values and removeAxisDelta
     */
    function removeAxisTransforms(axis, transforms, [key, scaleKey, originKey], origin, sourceAxis) {
        removeAxisDelta(axis, transforms[key], transforms[scaleKey], transforms[originKey], transforms.scale, origin, sourceAxis);
    }
    /**
     * The names of the motion values we want to apply as translation, scale and origin.
     */
    const xKeys = ["x", "scaleX", "originX"];
    const yKeys = ["y", "scaleY", "originY"];
    /**
     * Remove a transforms from an box. This is essentially the steps of applyAxisBox in reverse
     * and acts as a bridge between motion values and removeAxisDelta
     */
    function removeBoxTransforms(box, transforms, originBox, sourceBox) {
        removeAxisTransforms(box.x, transforms, xKeys, originBox?.x, sourceBox?.x);
        removeAxisTransforms(box.y, transforms, yKeys, originBox?.y, sourceBox?.y);
    }

    const userAgentContains = (string) => typeof navigator !== "undefined" &&
        navigator.userAgent &&
        navigator.userAgent.toLowerCase().includes(string);
    /**
     * Measured bounding boxes must be rounded in Safari and
     * left untouched in Chrome, otherwise non-integer layouts within scaled-up elements
     * can appear to jump.
     */
    const roundPoint = userAgentContains("applewebkit/") && !userAgentContains("chrome/")
        ? Math.round
        : noop;
    function roundAxis(axis) {
        // Round to the nearest .5 pixels to support subpixel layouts
        axis.min = roundPoint(axis.min);
        axis.max = roundPoint(axis.max);
    }
    function roundBox(box) {
        roundAxis(box.x);
        roundAxis(box.y);
    }

    const createAxisDelta = () => ({
        translate: 0,
        scale: 1,
        origin: 0,
        originPoint: 0,
    });
    const createDelta = () => ({
        x: createAxisDelta(),
        y: createAxisDelta(),
    });
    const createAxis = () => ({ min: 0, max: 0 });
    const createBox = () => ({
        x: createAxis(),
        y: createAxis(),
    });

    function isAxisDeltaZero(delta) {
        return delta.translate === 0 && delta.scale === 1;
    }
    function isDeltaZero(delta) {
        return isAxisDeltaZero(delta.x) && isAxisDeltaZero(delta.y);
    }
    function axisEquals(a, b) {
        return a.min === b.min && a.max === b.max;
    }
    function boxEquals(a, b) {
        return axisEquals(a.x, b.x) && axisEquals(a.y, b.y);
    }
    function axisEqualsRounded(a, b) {
        return (Math.round(a.min) === Math.round(b.min) &&
            Math.round(a.max) === Math.round(b.max));
    }
    function boxEqualsRounded(a, b) {
        return axisEqualsRounded(a.x, b.x) && axisEqualsRounded(a.y, b.y);
    }
    function aspectRatio(box) {
        return calcLength(box.x) / calcLength(box.y);
    }
    function axisDeltaEquals(a, b) {
        return (a.translate === b.translate &&
            a.scale === b.scale &&
            a.originPoint === b.originPoint);
    }

    class NodeStack {
        constructor() {
            this.members = [];
        }
        add(node) {
            addUniqueItem(this.members, node);
            for (let i = this.members.length - 1; i >= 0; i--) {
                const member = this.members[i];
                if (member === node || member === this.lead || member === this.prevLead)
                    continue;
                const inst = member.instance;
                if ((!inst || inst.isConnected === false) && !member.snapshot) {
                    removeItem(this.members, member);
                    member.unmount();
                }
            }
            node.scheduleRender();
        }
        remove(node) {
            removeItem(this.members, node);
            if (node === this.prevLead)
                this.prevLead = undefined;
            if (node === this.lead) {
                const prevLead = this.members[this.members.length - 1];
                if (prevLead)
                    this.promote(prevLead);
            }
        }
        relegate(node) {
            for (let i = this.members.indexOf(node) - 1; i >= 0; i--) {
                const member = this.members[i];
                if (member.isPresent !== false && member.instance?.isConnected !== false) {
                    this.promote(member);
                    return true;
                }
            }
            return false;
        }
        promote(node, preserveFollowOpacity) {
            const prevLead = this.lead;
            if (node === prevLead)
                return;
            this.prevLead = prevLead;
            this.lead = node;
            node.show();
            if (prevLead) {
                prevLead.updateSnapshot();
                node.scheduleRender();
                const { layoutDependency: prevDep } = prevLead.options;
                const { layoutDependency: nextDep } = node.options;
                if (prevDep === undefined || prevDep !== nextDep) {
                    node.resumeFrom = prevLead;
                    if (preserveFollowOpacity)
                        prevLead.preserveOpacity = true;
                    if (prevLead.snapshot) {
                        node.snapshot = prevLead.snapshot;
                        node.snapshot.latestValues =
                            prevLead.animationValues || prevLead.latestValues;
                    }
                    if (node.root?.isUpdating)
                        node.isLayoutDirty = true;
                }
                if (node.options.crossfade === false)
                    prevLead.hide();
            }
        }
        exitAnimationComplete() {
            this.members.forEach((member) => {
                member.options.onExitComplete?.();
                member.resumingFrom?.options.onExitComplete?.();
            });
        }
        scheduleRender() {
            this.members.forEach((member) => member.instance && member.scheduleRender(false));
        }
        removeLeadSnapshot() {
            if (this.lead?.snapshot)
                this.lead.snapshot = undefined;
        }
    }

    function pixelsToPercent(pixels, axis) {
        if (axis.max === axis.min)
            return 0;
        return (pixels / (axis.max - axis.min)) * 100;
    }
    /**
     * We always correct borderRadius as a percentage rather than pixels to reduce paints.
     * For example, if you are projecting a box that is 100px wide with a 10px borderRadius
     * into a box that is 200px wide with a 20px borderRadius, that is actually a 10%
     * borderRadius in both states. If we animate between the two in pixels that will trigger
     * a paint each time. If we animate between the two in percentage we'll avoid a paint.
     */
    const correctBorderRadius = {
        correct: (latest, node) => {
            if (!node.target)
                return latest;
            /**
             * If latest is a string, if it's a percentage we can return immediately as it's
             * going to be stretched appropriately. Otherwise, if it's a pixel, convert it to a number.
             */
            if (typeof latest === "string") {
                if (px.test(latest)) {
                    latest = parseFloat(latest);
                }
                else {
                    return latest;
                }
            }
            /**
             * If latest is a number, it's a pixel value. We use the current viewportBox to calculate that
             * pixel value as a percentage of each axis
             */
            const x = pixelsToPercent(latest, node.target.x);
            const y = pixelsToPercent(latest, node.target.y);
            return `${x}% ${y}%`;
        },
    };

    const correctBoxShadow = {
        correct: (latest, { treeScale, projectionDelta }) => {
            const original = latest;
            const shadow = complex.parse(latest);
            // TODO: Doesn't support multiple shadows
            if (shadow.length > 5)
                return original;
            const template = complex.createTransformer(latest);
            const offset = typeof shadow[0] !== "number" ? 1 : 0;
            // Calculate the overall context scale
            const xScale = projectionDelta.x.scale * treeScale.x;
            const yScale = projectionDelta.y.scale * treeScale.y;
            shadow[0 + offset] /= xScale;
            shadow[1 + offset] /= yScale;
            /**
             * Ideally we'd correct x and y scales individually, but because blur and
             * spread apply to both we have to take a scale average and apply that instead.
             * We could potentially improve the outcome of this by incorporating the ratio between
             * the two scales.
             */
            const averageScale = mixNumber$1(xScale, yScale, 0.5);
            // Blur
            if (typeof shadow[2 + offset] === "number")
                shadow[2 + offset] /= averageScale;
            // Spread
            if (typeof shadow[3 + offset] === "number")
                shadow[3 + offset] /= averageScale;
            return template(shadow);
        },
    };

    const defaultScaleCorrectors = {
        borderRadius: /* @__PURE__ */ Object.assign({}, correctBorderRadius, {
            applyTo: /* @__PURE__ */ cornerRadiusProps.slice(),
        }),
        borderTopLeftRadius: correctBorderRadius,
        borderTopRightRadius: correctBorderRadius,
        borderBottomLeftRadius: correctBorderRadius,
        borderBottomRightRadius: correctBorderRadius,
        boxShadow: correctBoxShadow,
    };

    function buildProjectionTransform(delta, treeScale, latestTransform) {
        let transform = "";
        /**
         * The translations we use to calculate are always relative to the viewport coordinate space.
         * But when we apply scales, we also scale the coordinate space of an element and its children.
         * For instance if we have a treeScale (the culmination of all parent scales) of 0.5 and we need
         * to move an element 100 pixels, we actually need to move it 200 in within that scaled space.
         */
        const xTranslate = delta.x.translate / treeScale.x;
        const yTranslate = delta.y.translate / treeScale.y;
        const zTranslate = latestTransform?.z || 0;
        if (xTranslate || yTranslate || zTranslate) {
            transform = `translate3d(${xTranslate}px, ${yTranslate}px, ${zTranslate}px) `;
        }
        /**
         * Apply scale correction for the tree transform.
         * This will apply scale to the screen-orientated axes.
         */
        if (treeScale.x !== 1 || treeScale.y !== 1) {
            transform += `scale(${1 / treeScale.x}, ${1 / treeScale.y}) `;
        }
        if (latestTransform) {
            const { transformPerspective } = latestTransform;
            if (transformPerspective)
                transform = `perspective(${transformPerspective}px) ${transform}`;
            for (let i = 0; i < angleTransforms.length; i++) {
                const key = angleTransforms[i];
                const value = latestTransform[key];
                if (value)
                    transform += `${key}(${value}deg) `;
                // Additive `rotate()` so user `rotate` isn't clobbered.
                if (!i && latestTransform.pathRotation)
                    transform += `rotate(${latestTransform.pathRotation}deg) `;
            }
        }
        /**
         * Apply scale to match the size of the element to the size we want it.
         * This will apply scale to the element-orientated axes.
         */
        const elementScaleX = delta.x.scale * treeScale.x;
        const elementScaleY = delta.y.scale * treeScale.y;
        if (elementScaleX !== 1 || elementScaleY !== 1) {
            transform += `scale(${elementScaleX}, ${elementScaleY})`;
        }
        return transform || "none";
    }

    function eachAxis(callback) {
        return [callback("x"), callback("y")];
    }

    const compareByDepth = (a, b) => a.depth - b.depth;

    class FlatTree {
        constructor() {
            this.children = [];
            this.isDirty = false;
        }
        add(child) {
            addUniqueItem(this.children, child);
            this.isDirty = true;
        }
        remove(child) {
            removeItem(this.children, child);
            this.isDirty = true;
        }
        forEach(callback) {
            this.isDirty && this.children.sort(compareByDepth);
            this.isDirty = false;
            this.children.forEach(callback);
        }
    }

    /**
     * This should only ever be modified on the client otherwise it'll
     * persist through server requests. If we need instanced states we
     * could lazy-init via root.
     */
    const globalProjectionState = {
        /**
         * Global flag as to whether the tree has animated since the last time
         * we resized the window
         */
        hasAnimatedSinceResize: true,
        /**
         * We set this to true once, on the first update. Any nodes added to the tree beyond that
         * update will be given a `data-projection-id` attribute.
         */
        hasEverUpdated: false,
    };

    /**
     * Transforms that distort an element's layout, so must be reset before measuring.
     */
    const distortingTransforms = ["z", "skew", "skewZ"];
    /**
     * We use 1000 as the animation target as 0-1000 maps better to pixels than 0-1
     * which has a noticeable difference in spring animations
     */
    const animationTarget = 1000;
    let id = 0;
    function resetDistortingTransform(key, visualElement, values, sharedAnimationValues) {
        const { latestValues } = visualElement;
        // Record the distorting transform and then temporarily set it to 0
        if (latestValues[key]) {
            values[key] = latestValues[key];
            visualElement.setStaticValue(key, 0);
            if (sharedAnimationValues) {
                sharedAnimationValues[key] = 0;
            }
        }
    }
    /**
     * Move accelerated transforms back to the main thread. The WAAPI animation
     * hid startUpdate()'s reset of rotations, skews and z, and moving off it
     * writes the whole transform back, so reset them again before this node
     * is measured.
     */
    const demoteTransforms = (node) => node.instance &&
        transformGroups.get(node.instance)?.demote() &&
        node.resetSkewAndRotation();
    function cancelTreeOptimisedTransformAnimations(projectionNode) {
        projectionNode.hasCheckedOptimisedAppear = true;
        if (projectionNode.root === projectionNode)
            return;
        const { visualElement } = projectionNode.options;
        if (!visualElement)
            return;
        const appearId = getOptimisedAppearId(visualElement);
        if (window.MotionHasOptimisedAnimation(appearId, "transform")) {
            const { layout, layoutId } = projectionNode.options;
            window.MotionCancelOptimisedAnimation(appearId, "transform", frame, !(layout || layoutId));
        }
        const { parent } = projectionNode;
        if (parent && !parent.hasCheckedOptimisedAppear) {
            cancelTreeOptimisedTransformAnimations(parent);
        }
    }
    function getClosestProjectingNode(visualElement) {
        if (!visualElement)
            return undefined;
        return visualElement.options.allowProjection !== false
            ? visualElement.projection
            : getClosestProjectingNode(visualElement.parent);
    }
    function createProjectionNode({ attachResizeListener, defaultParent, measureScroll, checkIsScrollRoot, resetTransform, }) {
        /**
         * Correctors registered via addScaleCorrector before projection loaded
         * (e.g. with an async LazyMotion bundle) take precedence over the defaults.
         * Applied here rather than at module scope so bundlers can drop projection
         * when it's unused.
         */
        Object.assign(scaleCorrectors, {
            ...defaultScaleCorrectors,
            ...scaleCorrectors,
        });
        return class ProjectionNode {
            /**
             * Create the projection node of a `motion` component's VisualElement,
             * from its props. This runs while the component renders, before its
             * children. It's here rather than in the component so React
             * bundles only include it with the features that supply a
             * ProjectionNode. Vanilla bundles that use the projection node
             * (drag(), animateLayout()) include it too, as a class static
             * can't be tree-shaken.
             */
            static create(visualElement, props, initialPromotionConfig) {
                const { layoutId, layout, drag, dragConstraints, layoutScroll, layoutRoot, layoutAnchor, layoutCrossfade, } = props;
                const projection = (visualElement.projection = new this(visualElement.latestValues, props["data-framer-portal-id"]
                    ? undefined
                    : getClosestProjectingNode(visualElement.parent)));
                projection.setOptions({
                    layoutId,
                    layout,
                    alwaysMeasureLayout: Boolean(drag) ||
                        (dragConstraints && isRefObject(dragConstraints)),
                    visualElement,
                    /**
                     * TODO: Update options in an effect. This could be tricky as it'll be too late
                     * to update by the time layout animations run.
                     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
                     * ensuring it gets called if there's no potential layout animations.
                     *
                     */
                    animationType: typeof layout === "string" ? layout : "both",
                    initialPromotionConfig,
                    crossfade: layoutCrossfade,
                    layoutScroll,
                    layoutRoot,
                    layoutAnchor,
                });
                /**
                 * This node will take over from its layoutId's current lead, so snapshot
                 * the lead now, while rendering. By the time the lead unmounts (or this
                 * node mounts) React may already have committed DOM changes that come
                 * before it in the tree, like a sibling changing height, and a snapshot
                 * taken then starts the animation from a position never seen on screen.
                 *
                 * If React discards this render (e.g. it suspends), nothing else
                 * completes the update, so check it after the next frame as an
                 * unmounting node does.
                 */
                const lead = projection.getStack()?.lead;
                if (lead && !projection.root.isUpdateBlocked()) {
                    lead.willUpdate();
                    lead.scheduleCheckAfterUnmount();
                }
            }
            constructor(latestValues = {}, parent = defaultParent?.()) {
                /**
                 * A unique ID generated for every projection node.
                 */
                this.id = id++;
                /**
                 * An id that represents a unique session instigated by startUpdate.
                 */
                this.animationId = 0;
                this.animationCommitId = 0;
                /**
                 * A Set containing all this component's children. This is used to iterate
                 * through the children.
                 *
                 * TODO: This could be faster to iterate as a flat array stored on the root node.
                 */
                this.children = new Set();
                /**
                 * Options for the node. We use this to configure what kind of layout animations
                 * we should perform (if any).
                 */
                this.options = {};
                /**
                 * We use this to detect when its safe to shut down part of a projection tree.
                 * We have to keep projecting children for scale correction and relative projection
                 * until all their parents stop performing layout animations.
                 */
                this.isTreeAnimating = false;
                this.isAnimationBlocked = false;
                /**
                 * Flag to true if we think this layout has been changed. We can't always know this,
                 * currently we set it to true every time a component renders, or if it has a layoutDependency
                 * if that has changed between renders. Additionally, components can be grouped by LayoutGroup
                 * and if one node is dirtied, they all are.
                 */
                this.isLayoutDirty = false;
                /**
                 * Flag to true if we think the projection calculations for this node needs
                 * recalculating as a result of an updated transform or layout animation.
                 */
                this.isProjectionDirty = false;
                /**
                 * Flag to true if the layout *or* transform has changed. This then gets propagated
                 * throughout the projection tree, forcing any element below to recalculate on the next frame.
                 */
                this.isSharedProjectionDirty = false;
                /**
                 * Flag transform dirty. This gets propagated throughout the whole tree but is only
                 * respected by shared nodes.
                 */
                this.isTransformDirty = false;
                /**
                 * Block layout updates for instant layout transitions throughout the tree.
                 */
                this.updateManuallyBlocked = false;
                this.updateBlockedByResize = false;
                /**
                 * Set to true between the start of the first `willUpdate` call and the end of the `didUpdate`
                 * call.
                 */
                this.isUpdating = false;
                /**
                 * If this is an SVG element we currently disable projection transforms
                 */
                this.isSVG = false;
                /**
                 * Flag to true (during promotion) if a node doing an instant layout transition needs to reset
                 * its projection styles.
                 */
                this.needsReset = false;
                /**
                 * Flags whether this node should have its transform reset prior to measuring.
                 */
                this.shouldResetTransform = false;
                /**
                 * Store whether this node has been checked for optimised appear animations. As
                 * effects fire bottom-up, and we want to look up the tree for appear animations,
                 * this makes sure we only check each path once, stopping at nodes that
                 * have already been checked.
                 */
                this.hasCheckedOptimisedAppear = false;
                /**
                 * An object representing the calculated contextual/accumulated/tree scale.
                 * This will be used to scale calculated projection transforms, as these are
                 * calculated in screen-space but need to be scaled for elements to visually
                 * make it to their calculated destinations.
                 *
                 * TODO: Lazy-init
                 */
                this.treeScale = { x: 1, y: 1 };
                /**
                 *
                 */
                this.eventHandlers = new Map();
                this.hasTreeAnimated = false;
                // Note: Currently only running on root node
                this.updateScheduled = false;
                this.scheduleUpdate = () => this.update();
                this.projectionUpdateScheduled = false;
                this.checkUpdateFailed = () => {
                    if (this.isUpdating) {
                        this.isUpdating = false;
                        this.clearAllSnapshots();
                    }
                };
                /**
                 * This is a multi-step process as shared nodes might be of different depths. Nodes
                 * are sorted by depth order, so we need to resolve the entire tree before moving to
                 * the next step.
                 */
                this.updateProjection = () => {
                    this.projectionUpdateScheduled = false;
                    this.nodes.forEach(propagateDirtyNodes);
                    this.nodes.forEach(resolveTargetDelta);
                    this.nodes.forEach(calcProjection);
                    this.nodes.forEach(cleanDirtyNodes);
                    /**
                     * Record this frame's debug counts, if recordStats() is running.
                     */
                    statsBuffer.countProjection?.();
                };
                /**
                 * Frame calculations
                 */
                this.resolvedRelativeTargetAt = 0.0;
                this.hasProjected = false;
                this.isVisible = true;
                this.animationProgress = 0;
                /**
                 * Shared layout
                 */
                // TODO Only running on root node
                this.sharedNodes = new Map();
                this.latestValues = latestValues;
                this.root = parent ? parent.root || parent : this;
                this.path = parent ? [...parent.path, parent] : [];
                this.parent = parent;
                this.depth = parent ? parent.depth + 1 : 0;
                for (let i = 0; i < this.path.length; i++) {
                    this.path[i].shouldResetTransform = true;
                }
                if (this.root === this)
                    this.nodes = new FlatTree();
            }
            addEventListener(name, handler) {
                if (!this.eventHandlers.has(name)) {
                    this.eventHandlers.set(name, new SubscriptionManager());
                }
                return this.eventHandlers.get(name).add(handler);
            }
            notifyListeners(name, ...args) {
                this.eventHandlers.get(name)?.notify(...args);
            }
            hasListeners(name) {
                return this.eventHandlers.has(name);
            }
            /**
             * Lifecycles
             */
            mount(instance) {
                if (this.instance)
                    return;
                this.isSVG = isSVGElement(instance) && !isSVGSVGElement(instance);
                this.instance = instance;
                const { layoutId, layout, visualElement } = this.options;
                if (visualElement && !visualElement.current) {
                    visualElement.mount(instance);
                }
                this.root.nodes.add(this);
                this.parent?.children.add(this);
                if (this.root.hasTreeAnimated && (layout || layoutId)) {
                    this.isLayoutDirty = true;
                }
                if (attachResizeListener) {
                    let cancelDelay;
                    let innerWidth = 0;
                    const resizeUnblockUpdate = () => (this.root.updateBlockedByResize = false);
                    // Set initial innerWidth in a frame.read callback to batch the read
                    frame.read(() => {
                        innerWidth = window.innerWidth;
                    });
                    attachResizeListener(instance, () => {
                        const newInnerWidth = window.innerWidth;
                        if (newInnerWidth === innerWidth)
                            return;
                        innerWidth = newInnerWidth;
                        this.root.updateBlockedByResize = true;
                        cancelDelay?.();
                        cancelDelay = delay(resizeUnblockUpdate, 250);
                        if (globalProjectionState.hasAnimatedSinceResize) {
                            globalProjectionState.hasAnimatedSinceResize = false;
                            this.nodes.forEach(finishAnimation);
                        }
                    });
                }
                if (layoutId) {
                    this.root.registerSharedNode(layoutId, this);
                }
                this.addLayoutListener();
            }
            /**
             * Only register the layout animation handler if this node requires
             * layout animation. This is called on mount, and again whenever options
             * change, as `layout` or `layoutId` may be enabled after mount.
             */
            addLayoutListener() {
                const { layoutId, layout, visualElement, animate } = this.options;
                if (!this.instance ||
                    this.hasLayoutListener ||
                    animate === false ||
                    !visualElement ||
                    !(layoutId || layout))
                    return;
                this.hasLayoutListener = true;
                this.addEventListener("didUpdate", ({ delta, hasLayoutChanged, hasRelativeLayoutChanged, layout: newLayout, }) => {
                    if (this.isAnimationBlocked) {
                        this.target = undefined;
                        this.relativeTarget = undefined;
                        return;
                    }
                    // TODO: Check here if an animation exists
                    const layoutTransition = this.options.transition ||
                        visualElement.getDefaultTransition() ||
                        defaultLayoutTransition;
                    const { onLayoutAnimationStart, onLayoutAnimationComplete, } = visualElement.getProps();
                    /**
                     * The target layout of the element might stay the same,
                     * but its position relative to its parent has changed.
                     */
                    const hasTargetChanged = !this.targetLayout ||
                        !boxEqualsRounded(this.targetLayout, newLayout);
                    /*
                     * Note: Disabled to fix relative animations always triggering new
                     * layout animations. If this causes further issues, we can try
                     * a different approach to detecting relative target changes.
                     */
                    // || hasRelativeLayoutChanged
                    /**
                     * If the layout hasn't seemed to have changed, it might be that the
                     * element is visually in the same place in the document but its position
                     * relative to its parent has indeed changed. So here we check for that.
                     */
                    const hasOnlyRelativeTargetChanged = !hasLayoutChanged && hasRelativeLayoutChanged;
                    if (this.options.layoutRoot ||
                        this.resumeFrom ||
                        hasOnlyRelativeTargetChanged ||
                        (hasLayoutChanged &&
                            (hasTargetChanged || !this.currentAnimation))) {
                        if (this.resumeFrom) {
                            this.resumingFrom = this.resumeFrom;
                            this.resumingFrom.resumingFrom = undefined;
                        }
                        const animationOptions = {
                            ...getValueTransition$1(layoutTransition, "layout"),
                            onPlay: onLayoutAnimationStart,
                            onComplete: onLayoutAnimationComplete,
                        };
                        if (visualElement.shouldReduceMotion ||
                            this.options.layoutRoot) {
                            animationOptions.delay = 0;
                            animationOptions.type = false;
                        }
                        this.startAnimation(animationOptions);
                        /**
                         * Set animation origin after starting animation to avoid layout jump
                         * caused by stopping previous layout animation
                         */
                        this.setAnimationOrigin(delta, hasOnlyRelativeTargetChanged, animationOptions.path);
                    }
                    else {
                        /**
                         * If the layout hasn't changed and we have an animation that hasn't started yet,
                         * finish it immediately. Otherwise it will be animating from a location
                         * that was probably never committed to screen and look like a jumpy box.
                         */
                        if (!hasLayoutChanged) {
                            finishAnimation(this);
                        }
                        this.isLead() && this.options.onExitComplete?.();
                    }
                    this.targetLayout = newLayout;
                });
            }
            unmount() {
                this.options.layoutId && this.willUpdate();
                this.root.nodes.remove(this);
                this.getStack()?.remove(this);
                this.parent?.children.delete(this);
                this.instance = undefined;
                this.eventHandlers.clear();
                this.hasLayoutListener = false;
                cancelFrame(this.updateProjection);
            }
            // only on the root
            blockUpdate() {
                this.updateManuallyBlocked = true;
            }
            unblockUpdate() {
                this.updateManuallyBlocked = false;
            }
            isUpdateBlocked() {
                return this.updateManuallyBlocked || this.updateBlockedByResize;
            }
            // Note: currently only running on root node
            startUpdate() {
                if (this.isUpdateBlocked())
                    return;
                this.isUpdating = true;
                this.nodes?.forEach(resetSkewAndRotation);
                this.animationId++;
            }
            getTransformTemplate() {
                const { visualElement } = this.options;
                return visualElement && visualElement.getProps().transformTemplate;
            }
            willUpdate(shouldNotifyListeners = true) {
                this.root.hasTreeAnimated = true;
                if (this.root.isUpdateBlocked()) {
                    this.options.onExitComplete?.();
                    return;
                }
                /**
                 * If we're running optimised appear animations then these must be
                 * cancelled before measuring the DOM. This is so we can measure
                 * the true layout of the element rather than the WAAPI animation
                 * which will be unaffected by the resetSkewAndRotate step.
                 *
                 * Note: This is a DOM write. Worst case scenario is this is sandwiched
                 * between other snapshot reads which will cause unnecessary style recalculations.
                 * This has to happen here though, as we don't yet know which nodes will need
                 * snapshots in startUpdate(), but we only want to cancel optimised animations
                 * if a layout animation measurement is actually going to be affected by them.
                 */
                if (window.MotionCancelOptimisedAnimation &&
                    !this.hasCheckedOptimisedAppear) {
                    cancelTreeOptimisedTransformAnimations(this);
                }
                !this.root.isUpdating && this.root.startUpdate();
                if (this.isLayoutDirty)
                    return;
                /**
                 * Accelerated transforms aren't reflected in latestValues or
                 * removed by resetTransform, so move them back to the main
                 * thread before this node, or its ancestors, are measured.
                 */
                demoteTransforms(this);
                this.isLayoutDirty = true;
                for (let i = 0; i < this.path.length; i++) {
                    const node = this.path[i];
                    node.shouldResetTransform = true;
                    demoteTransforms(node);
                    /**
                     * Percentage translates resolve against layoutBox dimensions,
                     * so ancestors with them must be re-measured after transform reset.
                     */
                    if (typeof node.latestValues.x === "string" ||
                        typeof node.latestValues.y === "string") {
                        node.isLayoutDirty = true;
                    }
                    node.updateScroll("snapshot");
                    if (node.options.layoutRoot) {
                        node.willUpdate(false);
                    }
                    /**
                     * Measure the nearest dragged ancestor before the DOM
                     * changes, so this node can follow its layout change.
                     */
                    if (node.isAnimationBlocked) {
                        node.dragSnapshot || (node.dragSnapshot = node.measure());
                        this.dragAncestor = node;
                    }
                }
                const { layoutId, layout } = this.options;
                if (layoutId === undefined && !layout)
                    return;
                const transformTemplate = this.getTransformTemplate();
                this.prevTransformTemplateValue = transformTemplate
                    ? transformTemplate(this.latestValues, "")
                    : undefined;
                this.updateSnapshot();
                shouldNotifyListeners && this.notifyListeners("willUpdate");
            }
            update() {
                this.updateScheduled = false;
                const updateWasBlocked = this.isUpdateBlocked();
                // When doing an instant transition, we skip the layout update,
                // but should still clean up the measurements so that the next
                // snapshot could be taken correctly.
                if (updateWasBlocked) {
                    const wasBlockedByResize = this.updateBlockedByResize;
                    this.unblockUpdate();
                    this.updateBlockedByResize = false;
                    this.clearAllSnapshots();
                    /**
                     * When blocked by resize, still measure layouts so
                     * callbacks like onLayoutMeasure fire (e.g. Reorder).
                     * Skip notifyLayoutUpdate to prevent animations.
                     */
                    if (wasBlockedByResize) {
                        this.nodes.forEach(forceLayoutMeasure);
                    }
                    this.nodes.forEach(clearMeasurements);
                    return;
                }
                /**
                 * If this is a repeat of didUpdate then ignore the animation.
                 */
                if (this.animationId <= this.animationCommitId) {
                    this.nodes.forEach(clearIsLayoutDirty);
                    return;
                }
                this.animationCommitId = this.animationId;
                if (!this.isUpdating) {
                    this.nodes.forEach(clearIsLayoutDirty);
                }
                else {
                    this.isUpdating = false;
                    /**
                     * Ensure animation-blocked nodes (e.g. during drag)
                     * get measured even when memoized (willUpdate skipped).
                     */
                    this.nodes.forEach(ensureDraggedNodesSnapshotted);
                    this.nodes.forEach(syncRelativeLayout);
                    /**
                     * Write
                     */
                    this.nodes.forEach(resetTransformStyle);
                    /**
                     * Read ==================
                     */
                    // Update layout measurements of updated children
                    this.nodes.forEach(updateLayout);
                    /**
                     * Write
                     */
                    // Notify listeners that the layout is updated
                    this.nodes.forEach(notifyLayoutUpdate);
                }
                this.clearAllSnapshots();
                /**
                 * Manually flush any pending updates. Ideally
                 * we could leave this to the following requestAnimationFrame but this seems
                 * to leave a flash of incorrectly styled content.
                 */
                const now = time.now();
                frameData.delta = clamp(0, 1000 / 60, now - frameData.timestamp);
                frameData.timestamp = now;
                frameData.isProcessing = true;
                frameSteps.update.process(frameData);
                frameSteps.preRender.process(frameData);
                frameSteps.render.process(frameData);
                frameData.isProcessing = false;
            }
            didUpdate() {
                if (!this.updateScheduled) {
                    this.updateScheduled = true;
                    microtask.read(this.scheduleUpdate);
                }
            }
            clearAllSnapshots() {
                this.nodes.forEach(clearSnapshot);
                /**
                 * A stack's last member can unmount while a replacement with the
                 * same layoutId mounts in the same commit, so the stack (and its
                 * lead) must outlive the unmount for the replacement to resume
                 * from it. By now that handoff has happened, so stacks that are
                 * still empty only retain unmounted nodes and can be released.
                 */
                this.sharedNodes.forEach((stack, layoutId) => stack.members.length
                    ? stack.removeLeadSnapshot()
                    : this.sharedNodes.delete(layoutId));
            }
            scheduleUpdateProjection() {
                if (!this.projectionUpdateScheduled) {
                    this.projectionUpdateScheduled = true;
                    frame.preRender(this.updateProjection, false, true);
                }
            }
            scheduleCheckAfterUnmount() {
                /**
                 * If the unmounting node is in a layoutGroup and did trigger a willUpdate,
                 * we manually call didUpdate to give a chance to the siblings to animate.
                 * Otherwise, cleanup all snapshots to prevents future nodes from reusing them.
                 */
                frame.postRender(() => {
                    if (this.isLayoutDirty) {
                        this.root.didUpdate();
                    }
                    else {
                        this.root.checkUpdateFailed();
                    }
                });
            }
            /**
             * Update measurements
             */
            updateSnapshot() {
                if (this.snapshot || !this.instance)
                    return;
                this.snapshot = this.measure();
                if (this.snapshot &&
                    !calcLength(this.snapshot.measuredBox.x) &&
                    !calcLength(this.snapshot.measuredBox.y)) {
                    this.snapshot = undefined;
                }
            }
            updateLayout() {
                if (!this.instance)
                    return;
                this.updateScroll();
                if (!(this.options.alwaysMeasureLayout && this.isLead()) &&
                    !this.isLayoutDirty) {
                    return;
                }
                /**
                 * When a node is mounted, it simply resumes from the prevLead's
                 * snapshot instead of taking a new one, but the ancestors scroll
                 * might have updated while the prevLead is unmounted. We need to
                 * update the scroll again to make sure the layout we measure is
                 * up to date.
                 */
                if (this.resumeFrom && !this.resumeFrom.instance) {
                    for (let i = 0; i < this.path.length; i++) {
                        const node = this.path[i];
                        node.updateScroll();
                    }
                }
                const prevLayout = this.layout;
                this.layout = this.measure(false);
                if (!this.layoutCorrected)
                    this.layoutCorrected = createBox();
                this.isLayoutDirty = false;
                this.projectionDelta = undefined;
                this.notifyListeners("measure", this.layout.layoutBox);
                const { visualElement } = this.options;
                visualElement?.notify("LayoutMeasure", this.layout.layoutBox, prevLayout?.layoutBox);
            }
            updateScroll(phase = "measure") {
                const { scroll, instance } = this;
                const { animationId } = this.root;
                if (this.options.layoutScroll &&
                    instance &&
                    !(scroll &&
                        scroll.animationId === animationId &&
                        scroll.phase === phase)) {
                    const isRoot = checkIsScrollRoot(instance);
                    this.scroll = {
                        animationId,
                        phase,
                        isRoot,
                        offset: measureScroll(instance),
                        wasRoot: scroll ? scroll.isRoot : isRoot,
                    };
                }
            }
            resetTransform() {
                if (!resetTransform)
                    return;
                const isResetRequested = this.isLayoutDirty ||
                    this.shouldResetTransform ||
                    this.options.alwaysMeasureLayout;
                isResetRequested && demoteTransforms(this);
                const hasProjection = this.projectionDelta && !isDeltaZero(this.projectionDelta);
                const transformTemplate = this.getTransformTemplate();
                const transformTemplateValue = transformTemplate
                    ? transformTemplate(this.latestValues, "")
                    : undefined;
                const transformTemplateHasChanged = transformTemplateValue !== this.prevTransformTemplateValue;
                if (isResetRequested &&
                    this.instance &&
                    (hasProjection ||
                        hasTransform(this.latestValues) ||
                        transformTemplateHasChanged)) {
                    resetTransform(this.instance, transformTemplateValue);
                    this.shouldResetTransform = false;
                    this.scheduleRender();
                }
            }
            measure(removeTransform = true) {
                const pageBox = this.measurePageBox();
                let layoutBox = this.removeElementScroll(pageBox);
                /**
                 * Measurements taken during the pre-render stage
                 * still have transforms applied so we remove them
                 * via calculation.
                 */
                if (removeTransform) {
                    layoutBox = this.removeTransform(layoutBox);
                }
                roundBox(layoutBox);
                return {
                    animationId: this.root.animationId,
                    measuredBox: pageBox,
                    layoutBox,
                    latestValues: {},
                    source: this.id,
                };
            }
            measurePageBox() {
                const { visualElement } = this.options;
                if (!visualElement)
                    return createBox();
                const box = visualElement.measureViewportBox();
                const wasInScrollRoot = this.scroll?.wasRoot || this.path.some(checkNodeWasScrollRoot);
                if (!wasInScrollRoot) {
                    // Remove viewport scroll to give page-relative coordinates
                    const { scroll } = this.root;
                    if (scroll) {
                        translateAxis(box.x, scroll.offset.x);
                        translateAxis(box.y, scroll.offset.y);
                    }
                }
                return box;
            }
            removeElementScroll(box) {
                const boxWithoutScroll = createBox();
                copyBoxInto(boxWithoutScroll, box);
                if (this.scroll?.wasRoot) {
                    return boxWithoutScroll;
                }
                /**
                 * Performance TODO: Keep a cumulative scroll offset down the tree
                 * rather than loop back up the path.
                 */
                for (let i = 0; i < this.path.length; i++) {
                    const node = this.path[i];
                    const { scroll, options } = node;
                    if (node !== this.root && scroll && options.layoutScroll) {
                        /**
                         * If this is a new scroll root, we want to remove all previous scrolls
                         * from the viewport box.
                         */
                        if (scroll.wasRoot) {
                            copyBoxInto(boxWithoutScroll, box);
                        }
                        translateAxis(boxWithoutScroll.x, scroll.offset.x);
                        translateAxis(boxWithoutScroll.y, scroll.offset.y);
                    }
                }
                return boxWithoutScroll;
            }
            applyTransform(box, transformOnly = false, output, skipOwnTransform, start = 0) {
                const withTransforms = output || createBox();
                copyBoxInto(withTransforms, box);
                for (let i = start; i < this.path.length; i++) {
                    const node = this.path[i];
                    if (!transformOnly &&
                        node.options.layoutScroll &&
                        node.scroll &&
                        node !== node.root) {
                        translateAxis(withTransforms.x, -node.scroll.offset.x);
                        translateAxis(withTransforms.y, -node.scroll.offset.y);
                    }
                    if (!hasTransform(node.latestValues))
                        continue;
                    transformBox(withTransforms, node.latestValues, node.layout?.layoutBox);
                }
                if (!skipOwnTransform && hasTransform(this.latestValues)) {
                    transformBox(withTransforms, this.latestValues, this.layout?.layoutBox);
                }
                return withTransforms;
            }
            removeTransform(box) {
                const boxWithoutTransform = createBox();
                copyBoxInto(boxWithoutTransform, box);
                for (let i = 0; i < this.path.length; i++) {
                    const node = this.path[i];
                    if (!hasTransform(node.latestValues))
                        continue;
                    let sourceBox;
                    if (node.instance) {
                        hasScale(node.latestValues) && node.updateSnapshot();
                        sourceBox = createBox();
                        copyBoxInto(sourceBox, node.measurePageBox());
                    }
                    removeBoxTransforms(boxWithoutTransform, node.latestValues, node.snapshot?.layoutBox, sourceBox);
                }
                if (hasTransform(this.latestValues)) {
                    removeBoxTransforms(boxWithoutTransform, this.latestValues);
                }
                return boxWithoutTransform;
            }
            setTargetDelta(delta) {
                this.targetDelta = delta;
                this.root.scheduleUpdateProjection();
                this.isProjectionDirty = true;
            }
            setOptions(options) {
                this.options = {
                    ...this.options,
                    ...options,
                    crossfade: options.crossfade !== undefined ? options.crossfade : true,
                };
                this.addLayoutListener();
            }
            clearMeasurements() {
                this.scroll = undefined;
                this.layout = undefined;
                this.snapshot = undefined;
                this.prevTransformTemplateValue = undefined;
                this.targetDelta = undefined;
                this.target = undefined;
                this.isLayoutDirty = false;
            }
            forceRelativeParentToResolveTarget() {
                if (!this.relativeParent)
                    return;
                /**
                 * If the parent target isn't up-to-date, force it to update.
                 * This is an unfortunate de-optimisation as it means any updating relative
                 * projection will cause all the relative parents to recalculate back
                 * up the tree.
                 */
                if (this.relativeParent.resolvedRelativeTargetAt !==
                    frameData.timestamp) {
                    this.relativeParent.resolveTargetDelta(true);
                }
            }
            resolveTargetDelta(forceRecalculation = false) {
                /**
                 * Once the dirty status of nodes has been spread through the tree, we also
                 * need to check if we have a shared node of a different depth that has itself
                 * been dirtied.
                 */
                const lead = this.getLead();
                this.isProjectionDirty || (this.isProjectionDirty = lead.isProjectionDirty);
                this.isTransformDirty || (this.isTransformDirty = lead.isTransformDirty);
                this.isSharedProjectionDirty || (this.isSharedProjectionDirty = lead.isSharedProjectionDirty);
                const isShared = Boolean(this.resumingFrom) || this !== lead;
                /**
                 * We don't use transform for this step of processing so we don't
                 * need to check whether any nodes have changed transform.
                 */
                const canSkip = !(forceRecalculation ||
                    (isShared && this.isSharedProjectionDirty) ||
                    this.isProjectionDirty ||
                    this.parent?.isProjectionDirty ||
                    this.attemptToResolveRelativeTarget ||
                    this.root.updateBlockedByResize);
                if (canSkip)
                    return;
                const { layout, layoutId } = this.options;
                /**
                 * If we have no layout, we can't perform projection, so early return
                 */
                if (!this.layout || !(layout || layoutId))
                    return;
                this.resolvedRelativeTargetAt = frameData.timestamp;
                const relativeParent = this.getClosestProjectingParent();
                /**
                 * If we don't have a targetDelta but do have a layout, we can attempt to resolve
                 * a relativeParent. This will allow a component to perform scale correction
                 * even if no animation has started.
                 */
                if (!this.targetDelta && !this.relativeTarget) {
                    if (this.options.layoutAnchor !== false &&
                        relativeParent &&
                        relativeParent.layout) {
                        this.createRelativeTarget(relativeParent, this.layout.layoutBox, relativeParent.layout.layoutBox);
                    }
                    else {
                        this.removeRelativeTarget();
                    }
                }
                /**
                 * If we have no relative target or no target delta our target isn't valid
                 * for this frame.
                 */
                if (!this.relativeTarget && !this.targetDelta)
                    return;
                /**
                 * Lazy-init target data structure
                 */
                if (!this.target) {
                    this.target = createBox();
                    this.targetWithTransforms = createBox();
                }
                /**
                 * If we've got a relative box for this component, resolve it into a target relative to the parent.
                 */
                if (this.relativeTarget &&
                    this.relativeTargetOrigin &&
                    this.relativeParent &&
                    this.relativeParent.target) {
                    this.forceRelativeParentToResolveTarget();
                    calcRelativeBox(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || undefined);
                    /**
                     * If we've only got a targetDelta, resolve it into a target
                     */
                }
                else if (this.targetDelta) {
                    if (Boolean(this.resumingFrom)) {
                        /**
                         * Own transforms are applied later, in applyTransformsToTarget,
                         * so only apply ancestor transforms here or they'd be doubled.
                         */
                        this.applyTransform(this.layout.layoutBox, false, this.target, true);
                    }
                    else {
                        copyBoxInto(this.target, this.layout.layoutBox);
                    }
                    applyBoxDelta(this.target, this.targetDelta);
                }
                else {
                    /**
                     * If no target, use own layout as target
                     */
                    copyBoxInto(this.target, this.layout.layoutBox);
                }
                /**
                 * If we've been told to attempt to resolve a relative target, do so.
                 */
                if (this.attemptToResolveRelativeTarget) {
                    this.attemptToResolveRelativeTarget = false;
                    if (this.options.layoutAnchor !== false &&
                        relativeParent &&
                        (!relativeParent.resumingFrom === !this.resumingFrom ||
                            /**
                             * Shared layout animations within a layoutRoot
                             * animate relative to it.
                             */
                            (relativeParent.options.layoutRoot &&
                                !relativeParent.resumingFrom)) &&
                        !relativeParent.options.layoutScroll &&
                        relativeParent.target &&
                        this.animationProgress !== 1) {
                        this.createRelativeTarget(relativeParent, this.target, relativeParent.target);
                    }
                    else {
                        this.relativeParent = this.relativeTarget = undefined;
                    }
                }
                /**
                 * Increase debug counter for resolved target deltas
                 */
                statsBuffer.countProjection?.(1); // calculatedTargetDeltas
            }
            getClosestProjectingParent() {
                if (!this.parent ||
                    hasScale(this.parent.latestValues) ||
                    has2DTranslate(this.parent.latestValues)) {
                    return undefined;
                }
                if (this.parent.isProjecting()) {
                    return this.parent;
                }
                else {
                    return this.parent.getClosestProjectingParent();
                }
            }
            isProjecting() {
                return Boolean((this.relativeTarget ||
                    this.targetDelta ||
                    this.options.layoutRoot) &&
                    this.layout);
            }
            createRelativeTarget(relativeParent, layout, parentLayout) {
                this.relativeParent = relativeParent;
                this.forceRelativeParentToResolveTarget();
                this.relativeTarget = createBox();
                this.relativeTargetOrigin = createBox();
                calcRelativePosition(this.relativeTargetOrigin, layout, parentLayout, this.options.layoutAnchor || undefined);
                copyBoxInto(this.relativeTarget, this.relativeTargetOrigin);
            }
            removeRelativeTarget() {
                this.relativeParent = this.relativeTarget = undefined;
            }
            calcProjection() {
                const lead = this.getLead();
                const isShared = Boolean(this.resumingFrom) || this !== lead;
                let canSkip = true;
                /**
                 * If this is a normal layout animation and neither this node nor its nearest projecting
                 * is dirty then we can't skip.
                 */
                if (this.isProjectionDirty || this.parent?.isProjectionDirty) {
                    canSkip = false;
                }
                /**
                 * If this is a shared layout animation and this node's shared projection is dirty then
                 * we can't skip.
                 */
                if (isShared &&
                    (this.isSharedProjectionDirty || this.isTransformDirty)) {
                    canSkip = false;
                }
                /**
                 * If we have resolved the target this frame we must recalculate the
                 * projection to ensure it visually represents the internal calculations.
                 */
                if (this.resolvedRelativeTargetAt === frameData.timestamp) {
                    canSkip = false;
                }
                if (canSkip)
                    return;
                const { layout, layoutId } = this.options;
                /**
                 * If this section of the tree isn't animating we can
                 * delete our target sources for the following frame.
                 */
                this.isTreeAnimating = Boolean(this.parent?.isTreeAnimating ||
                    this.currentAnimation ||
                    this.pendingAnimation);
                if (!this.isTreeAnimating) {
                    this.targetDelta = this.relativeTarget = undefined;
                }
                if (!this.layout || !(layout || layoutId))
                    return;
                /**
                 * Reset the corrected box with the latest values from box, as we're then going
                 * to perform mutative operations on it.
                 */
                copyBoxInto(this.layoutCorrected, this.layout.layoutBox);
                /**
                 * Record previous tree scales before updating.
                 */
                const prevTreeScaleX = this.treeScale.x;
                const prevTreeScaleY = this.treeScale.y;
                /**
                 * Apply all the parent deltas to this box to produce the corrected box. This
                 * is the layout box, as it will appear on screen as a result of the transforms of its parents.
                 *
                 * A shared target is usually in page space, so ancestor transforms are applied
                 * too. But a target relative to a parent that isn't itself shared (like a
                 * layoutRoot) is in that parent's layout space. So the transforms of the
                 * parent and its ancestors, which move both elements alike, are skipped,
                 * but those of other ancestors (between it and either element) apply.
                 */
                applyTreeDeltas(this.layoutCorrected, this.treeScale, this.path, isShared &&
                    (lead.relativeTarget && !lead.relativeParent.resumingFrom
                        ? lead.relativeParent
                        : true));
                /**
                 * If this layer needs to perform scale correction but doesn't have a target,
                 * use the layout as the target.
                 */
                if (lead.layout &&
                    !lead.target &&
                    (this.treeScale.x !== 1 || this.treeScale.y !== 1)) {
                    lead.target = lead.layout.layoutBox;
                    lead.targetWithTransforms = createBox();
                }
                const { target } = lead;
                if (!target) {
                    /**
                     * If we don't have a target to project into, but we were previously
                     * projecting, we want to remove the stored transform and schedule
                     * a render to ensure the elements reflect the removed transform.
                     */
                    if (this.prevProjectionDelta) {
                        this.createProjectionDeltas();
                        this.scheduleRender();
                    }
                    return;
                }
                if (!this.projectionDelta || !this.prevProjectionDelta) {
                    this.createProjectionDeltas();
                }
                else {
                    copyAxisDeltaInto(this.prevProjectionDelta.x, this.projectionDelta.x);
                    copyAxisDeltaInto(this.prevProjectionDelta.y, this.projectionDelta.y);
                }
                /**
                 * Update the delta between the corrected box and the target box before user-set transforms were applied.
                 * This will allow us to calculate the corrected borderRadius and boxShadow to compensate
                 * for our layout reprojection, but still allow them to be scaled correctly by the user.
                 * It might be that to simplify this we may want to accept that user-set scale is also corrected
                 * and we wouldn't have to keep and calc both deltas, OR we could support a user setting
                 * to allow people to choose whether these styles are corrected based on just the
                 * layout reprojection or the final bounding box.
                 */
                calcBoxDelta(this.projectionDelta, this.layoutCorrected, target, this.latestValues);
                if (this.treeScale.x !== prevTreeScaleX ||
                    this.treeScale.y !== prevTreeScaleY ||
                    !axisDeltaEquals(this.projectionDelta.x, this.prevProjectionDelta.x) ||
                    !axisDeltaEquals(this.projectionDelta.y, this.prevProjectionDelta.y)) {
                    this.hasProjected = true;
                    this.scheduleRender();
                    this.notifyListeners("projectionUpdate", target);
                }
                /**
                 * Increase debug counter for recalculated projections
                 */
                statsBuffer.countProjection?.(2); // calculatedProjections
            }
            hide() {
                this.isVisible = false;
                // TODO: Schedule render
            }
            show() {
                this.isVisible = true;
                // TODO: Schedule render
            }
            scheduleRender(notifyAll = true) {
                this.options.visualElement?.scheduleRender();
                if (notifyAll) {
                    this.getStack()?.scheduleRender();
                }
                if (this.resumingFrom && !this.resumingFrom.instance) {
                    this.resumingFrom = undefined;
                }
            }
            createProjectionDeltas() {
                this.prevProjectionDelta = createDelta();
                this.projectionDelta = createDelta();
                this.projectionDeltaWithTransform = createDelta();
            }
            setAnimationOrigin(delta, hasOnlyRelativeTargetChanged = false, pathFn) {
                const snapshot = this.snapshot;
                const snapshotLatestValues = snapshot ? snapshot.latestValues : {};
                const mixedValues = { ...this.latestValues };
                const targetDelta = createDelta();
                if (!this.relativeParent ||
                    !this.relativeParent.options.layoutRoot) {
                    this.relativeTarget = this.relativeTargetOrigin = undefined;
                }
                this.attemptToResolveRelativeTarget = !hasOnlyRelativeTargetChanged;
                const relativeLayout = createBox();
                const isSharedLayoutAnimation = snapshot?.source !== this.layout?.source;
                const stack = this.getStack();
                const isOnlyMember = !stack || stack.members.length <= 1;
                const shouldCrossfadeOpacity = Boolean(isSharedLayoutAnimation &&
                    !isOnlyMember &&
                    this.options.crossfade === true &&
                    !this.path.some(hasOpacityCrossfade));
                this.animationProgress = 0;
                let prevRelativeTarget;
                // The path decides whether the layout shift is worth curving
                // (distance floor) and resolves the interpolator from the delta.
                const interpolate = pathFn?.interpolateProjection(delta);
                this.mixTargetDelta = (latest) => {
                    const progress = latest / 1000;
                    const point = interpolate?.(progress);
                    mixAxisDeltaLinear(targetDelta.x, delta.x, progress);
                    mixAxisDeltaLinear(targetDelta.y, delta.y, progress);
                    if (point) {
                        targetDelta.x.translate = point.x;
                        targetDelta.y.translate = point.y;
                    }
                    this.setTargetDelta(targetDelta);
                    if (this.relativeTarget &&
                        this.relativeTargetOrigin &&
                        this.layout &&
                        this.relativeParent &&
                        this.relativeParent.layout) {
                        calcRelativePosition(relativeLayout, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || undefined);
                        mixBox(this.relativeTarget, this.relativeTargetOrigin, relativeLayout, progress);
                        /**
                         * If this is an unchanged relative target we can consider the
                         * projection not dirty.
                         */
                        if (prevRelativeTarget &&
                            boxEquals(this.relativeTarget, prevRelativeTarget)) {
                            this.isProjectionDirty = false;
                        }
                        if (!prevRelativeTarget)
                            prevRelativeTarget = createBox();
                        copyBoxInto(prevRelativeTarget, this.relativeTarget);
                    }
                    if (isSharedLayoutAnimation) {
                        this.animationValues = mixedValues;
                        mixValues(mixedValues, snapshotLatestValues, this.latestValues, progress, shouldCrossfadeOpacity, isOnlyMember);
                    }
                    if (point?.rotate !== undefined) {
                        // Dedicated `pathRotation` channel, not `rotate`, so an
                        // animating `rotate` is composed with, never clobbered.
                        if (!this.animationValues)
                            this.animationValues = mixedValues;
                        this.animationValues.pathRotation = point.rotate;
                    }
                    this.root.scheduleUpdateProjection();
                    this.scheduleRender();
                    this.animationProgress = progress;
                };
                this.mixTargetDelta(this.options.layoutRoot ? 1000 : 0);
            }
            startAnimation(options) {
                this.notifyListeners("animationStart");
                this.currentAnimation?.stop();
                this.resumingFrom?.currentAnimation?.stop();
                if (this.pendingAnimation) {
                    cancelFrame(this.pendingAnimation);
                    this.pendingAnimation = undefined;
                }
                /**
                 * Start the animation in the next frame to have a frame with progress 0,
                 * where the target is the same as when the animation started, so we can
                 * calculate the relative positions correctly for instant transitions.
                 */
                this.pendingAnimation = frame.update(() => {
                    globalProjectionState.hasAnimatedSinceResize = true;
                    this.motionValue || (this.motionValue = motionValue(0));
                    this.motionValue.jump(0, false);
                    this.currentAnimation = animateSingleValue(this.motionValue, [0, 1000], {
                        ...options,
                        velocity: 0,
                        isSync: true,
                        onUpdate: (latest) => {
                            this.mixTargetDelta(latest);
                            options.onUpdate && options.onUpdate(latest);
                        },
                        onComplete: () => {
                            options.onComplete && options.onComplete();
                            this.completeAnimation();
                        },
                    });
                    notifyLayoutAnimationStart(this.currentAnimation, this);
                    if (this.resumingFrom) {
                        this.resumingFrom.currentAnimation = this.currentAnimation;
                    }
                    this.pendingAnimation = undefined;
                });
            }
            completeAnimation() {
                if (this.resumingFrom) {
                    this.resumingFrom.currentAnimation = undefined;
                    this.resumingFrom.preserveOpacity = undefined;
                }
                const stack = this.getStack();
                stack && stack.exitAnimationComplete();
                this.resumingFrom =
                    this.currentAnimation =
                        this.animationValues =
                            undefined;
                this.notifyListeners("animationComplete");
            }
            finishAnimation() {
                if (this.currentAnimation) {
                    this.mixTargetDelta?.(animationTarget);
                    this.currentAnimation.stop();
                }
                this.completeAnimation();
            }
            applyTransformsToTarget() {
                const lead = this.getLead();
                const { targetWithTransforms, layout, latestValues } = lead;
                let { target } = lead;
                if (!targetWithTransforms || !target || !layout)
                    return;
                /**
                 * If we're only animating position, and this element isn't the lead element,
                 * then instead of projecting into the lead box we instead want to calculate
                 * a new target that aligns the two boxes but maintains the layout shape.
                 */
                if (this !== lead &&
                    this.layout &&
                    layout &&
                    shouldAnimatePositionOnly(this.options.animationType, this.layout.layoutBox, layout.layoutBox)) {
                    const { layoutBox } = this.layout;
                    const leadTarget = target;
                    target = this.target || createBox();
                    alignAxis(target.x, leadTarget.x, layoutBox.x);
                    alignAxis(target.y, leadTarget.y, layoutBox.y);
                }
                copyBoxInto(targetWithTransforms, target);
                /**
                 * Apply the latest user-set transforms to the targetBox to produce the targetBoxFinal.
                 * This is the final box that we will then project into by calculating a transform delta and
                 * applying it to the corrected box.
                 */
                transformBox(targetWithTransforms, latestValues);
                /**
                 * Update the delta between the corrected box and the final target box, after
                 * user-set transforms are applied to it. This will be used by the renderer to
                 * create a transform style that will reproject the element from its layout layout
                 * into the desired bounding box.
                 */
                calcBoxDelta(this.projectionDeltaWithTransform, this.layoutCorrected, targetWithTransforms, latestValues);
            }
            registerSharedNode(layoutId, node) {
                if (!this.sharedNodes.has(layoutId)) {
                    this.sharedNodes.set(layoutId, new NodeStack());
                }
                const stack = this.sharedNodes.get(layoutId);
                stack.add(node);
                const config = node.options.initialPromotionConfig;
                node.promote({
                    transition: config?.transition,
                    preserveFollowOpacity: config?.shouldPreserveFollowOpacity
                        ? config.shouldPreserveFollowOpacity(node)
                        : undefined,
                });
            }
            isLead() {
                const stack = this.getStack();
                return stack ? stack.lead === this : true;
            }
            getLead() {
                const { layoutId } = this.options;
                return layoutId ? this.getStack()?.lead || this : this;
            }
            getPrevLead() {
                const { layoutId } = this.options;
                return layoutId ? this.getStack()?.prevLead : undefined;
            }
            getStack() {
                const { layoutId } = this.options;
                if (layoutId)
                    return this.root.sharedNodes.get(layoutId);
            }
            promote({ needsReset, transition, preserveFollowOpacity, } = {}) {
                this.getStack()?.promote(this, preserveFollowOpacity);
                if (needsReset) {
                    this.projectionDelta = undefined;
                    this.needsReset = true;
                }
                if (transition)
                    this.setOptions({ transition });
            }
            relegate() {
                return this.getStack()?.relegate(this) || false;
            }
            resetSkewAndRotation() {
                const { visualElement } = this.options;
                if (!visualElement)
                    return;
                /**
                 * An unrolled check for rotation values. Most elements don't have any rotation and
                 * skipping the loop and new object creation is 50% faster.
                 * If there's no distorting values, we don't need to do any more.
                 */
                const { latestValues } = visualElement;
                if (!hasDistortingTransform(latestValues))
                    return;
                const resetValues = {};
                // Check the skew and rotate value of all axes and reset to 0
                for (let i = 0; i < distortingTransforms.length; i++) {
                    resetDistortingTransform(distortingTransforms[i], visualElement, resetValues, this.animationValues);
                }
                for (let i = 0; i < angleTransforms.length; i++) {
                    resetDistortingTransform(angleTransforms[i], visualElement, resetValues, this.animationValues);
                }
                // Force a render of this element to apply the transform with all skews and rotations
                // set to 0.
                visualElement.render();
                // Put back all the values we reset
                for (const key in resetValues) {
                    visualElement.setStaticValue(key, resetValues[key]);
                    if (this.animationValues) {
                        this.animationValues[key] = resetValues[key];
                    }
                }
                // Schedule a render for the next frame. This ensures we won't visually
                // see the element with the reset rotate value applied.
                visualElement.scheduleRender();
            }
            applyProjectionStyles(targetStyle, // CSSStyleDeclaration - doesn't allow numbers to be assigned to properties
            styleProp) {
                if (!this.instance || this.isSVG)
                    return;
                const lead = this.getLead();
                /**
                 * Without crossfade, a new lead hides the previous one, as it's
                 * usually unmounting. One that gave its layoutId away keeps
                 * rendering, so only hide nodes that follow another.
                 */
                if (!this.isVisible && lead !== this) {
                    targetStyle.visibility = "hidden";
                    return;
                }
                const transformTemplate = this.getTransformTemplate();
                if (this.needsReset) {
                    this.needsReset = false;
                    targetStyle.visibility = "";
                    targetStyle.opacity = "";
                    targetStyle.pointerEvents =
                        resolveMotionValue(styleProp?.pointerEvents) || "";
                    targetStyle.transform = transformTemplate
                        ? transformTemplate(this.latestValues, "")
                        : "none";
                    return;
                }
                if (!this.projectionDelta || !this.layout || !lead.target) {
                    if (this.options.layoutId || this.needsShow) {
                        this.needsShow = false;
                        targetStyle.visibility = "";
                        targetStyle.opacity =
                            this.latestValues.opacity !== undefined
                                ? this.latestValues.opacity
                                : 1;
                        targetStyle.pointerEvents =
                            resolveMotionValue(styleProp?.pointerEvents) || "";
                    }
                    if (this.hasProjected && !hasTransform(this.latestValues)) {
                        targetStyle.transform = transformTemplate
                            ? transformTemplate({}, "")
                            : "none";
                        this.hasProjected = false;
                    }
                    return;
                }
                targetStyle.visibility = "";
                const valuesToRender = lead.animationValues || lead.latestValues;
                this.applyTransformsToTarget();
                let transform = buildProjectionTransform(this.projectionDeltaWithTransform, this.treeScale, valuesToRender);
                if (transformTemplate) {
                    transform = transformTemplate(valuesToRender, transform);
                }
                targetStyle.transform = transform;
                const { x, y } = this.projectionDelta;
                targetStyle.transformOrigin = `${x.origin * 100}% ${y.origin * 100}% 0`;
                if (lead.animationValues) {
                    /**
                     * If the lead component is animating, assign this either the entering/leaving
                     * opacity
                     */
                    targetStyle.opacity =
                        lead === this
                            ? valuesToRender.opacity ??
                                this.latestValues.opacity ??
                                1
                            : this.preserveOpacity
                                ? this.latestValues.opacity
                                : valuesToRender.opacityExit;
                }
                else {
                    /**
                     * Or we're not animating at all, set the lead component to its layout
                     * opacity and other components to hidden.
                     */
                    targetStyle.opacity =
                        lead === this
                            ? valuesToRender.opacity !== undefined
                                ? valuesToRender.opacity
                                : ""
                            : valuesToRender.opacityExit !== undefined
                                ? valuesToRender.opacityExit
                                : 0;
                }
                /**
                 * Apply scale correction
                 */
                for (const key in scaleCorrectors) {
                    if (valuesToRender[key] === undefined)
                        continue;
                    const { correct, applyTo, isCSSVariable } = scaleCorrectors[key];
                    /**
                     * Only apply scale correction to the value if we have an
                     * active projection transform. Otherwise these values become
                     * vulnerable to distortion if the element changes size without
                     * a corresponding layout animation.
                     */
                    const corrected = transform === "none"
                        ? valuesToRender[key]
                        : correct(valuesToRender[key], lead);
                    if (applyTo) {
                        const num = applyTo.length;
                        for (let i = 0; i < num; i++) {
                            targetStyle[applyTo[i]] = corrected;
                        }
                    }
                    else {
                        // If this is a CSS variable, set it directly on the instance.
                        // Replacing this function from creating styles to setting them
                        // would be a good place to remove per frame object creation
                        if (isCSSVariable) {
                            this.options.visualElement.renderState.vars[key] = corrected;
                        }
                        else {
                            targetStyle[key] = corrected;
                        }
                    }
                }
                /**
                 * Disable pointer events on follow components. This is to ensure
                 * that if a follow component covers a lead component it doesn't block
                 * pointer events on the lead.
                 */
                if (this.options.layoutId) {
                    targetStyle.pointerEvents =
                        lead === this
                            ? resolveMotionValue(styleProp?.pointerEvents) || ""
                            : "none";
                }
            }
            clearSnapshot() {
                this.resumeFrom =
                    this.snapshot =
                        this.dragSnapshot =
                            this.dragAncestor =
                                undefined;
            }
            // Only run on root
            resetTree() {
                this.root.nodes.forEach((node) => node.currentAnimation?.stop());
                this.root.nodes.forEach(clearMeasurements);
                this.root.sharedNodes.clear();
            }
        };
    }
    /**
     * Nodes are depth-ordered, so a dragged ancestor's layout is updated before
     * its descendants'.
     */
    function updateLayout(node) {
        node.updateLayout();
        followDraggedAncestor(node);
    }
    function notifyLayoutUpdate(node) {
        const snapshot = node.resumeFrom?.snapshot || node.snapshot;
        if (node.isLead() &&
            node.layout &&
            snapshot &&
            node.hasListeners("didUpdate")) {
            const { layoutBox: layout, measuredBox: measuredLayout } = node.layout;
            const { animationType } = node.options;
            const isShared = snapshot.source !== node.layout.source;
            // TODO Maybe we want to also resize the layout snapshot so we don't trigger
            // animations for instance if layout="size" and an element has only changed position
            const resizeSnapshot = (box, to) => {
                if (animationType === "size") {
                    eachAxis((axis) => {
                        const length = calcLength(box[axis]);
                        box[axis].min = to[axis].min;
                        box[axis].max = box[axis].min + length;
                    });
                }
                else if (animationType === "x" || animationType === "y") {
                    const snapAxis = animationType === "x" ? "y" : "x";
                    copyAxisInto(box[snapAxis], to[snapAxis]);
                }
                else if (shouldAnimatePositionOnly(animationType, snapshot.layoutBox, layout)) {
                    eachAxis((axis) => {
                        const length = calcLength(to[axis]);
                        box[axis].max = box[axis].min + length;
                        /**
                         * Ensure relative target gets resized and rerendererd
                         */
                        if (node.relativeTarget && !node.currentAnimation) {
                            node.isProjectionDirty = true;
                            node.relativeTarget[axis].max =
                                node.relativeTarget[axis].min + length;
                        }
                    });
                }
            };
            const snapshotBox = isShared ? snapshot.measuredBox : snapshot.layoutBox;
            resizeSnapshot(snapshotBox, layout);
            const layoutDelta = createDelta();
            calcBoxDelta(layoutDelta, layout, snapshot.layoutBox);
            const visualDelta = createDelta();
            calcBoxDelta(visualDelta, isShared ? node.applyTransform(measuredLayout, true) : layout, snapshotBox);
            const hasLayoutChanged = !isDeltaZero(layoutDelta);
            let hasRelativeLayoutChanged = false;
            const relativeParent = node.getClosestProjectingParent();
            /**
             * A snapshot resumed from another element is only relative to this
             * node's relativeParent if it's a layoutRoot that contains both.
             */
            if (!node.resumeFrom ||
                (relativeParent?.options.layoutRoot &&
                    node.resumeFrom.path.includes(relativeParent))) {
                /**
                 * If the relativeParent is itself resuming from a different element then
                 * the relative snapshot is not relavent
                 */
                if (relativeParent && !relativeParent.resumeFrom) {
                    const { snapshot: parentSnapshot, layout: parentLayout } = relativeParent;
                    if (parentSnapshot && parentLayout) {
                        const anchor = node.options.layoutAnchor || undefined;
                        /**
                         * A shared snapshot includes the transforms of the old
                         * element's ancestors below the layoutRoot, as they
                         * aren't shared with the new element.
                         */
                        const relativeSnapshot = createBox();
                        calcRelativePosition(relativeSnapshot, isShared
                            ? node.resumeFrom.applyTransform(snapshot.layoutBox, true, undefined, true, relativeParent.depth + 1)
                            : snapshot.layoutBox, parentSnapshot.layoutBox, anchor);
                        const relativeLayout = createBox();
                        calcRelativePosition(relativeLayout, layout, parentLayout.layoutBox, anchor);
                        /**
                         * A shared snapshot is resized in page space, above, so
                         * resize it relative to the layoutRoot too.
                         */
                        isShared && resizeSnapshot(relativeSnapshot, relativeLayout);
                        if (!boxEqualsRounded(relativeSnapshot, relativeLayout)) {
                            hasRelativeLayoutChanged = true;
                        }
                        if (relativeParent.options.layoutRoot) {
                            node.relativeTarget = relativeLayout;
                            node.relativeTargetOrigin = relativeSnapshot;
                            node.relativeParent = relativeParent;
                        }
                    }
                }
            }
            node.notifyListeners("didUpdate", {
                layout,
                snapshot,
                delta: visualDelta,
                layoutDelta,
                hasLayoutChanged,
                hasRelativeLayoutChanged,
            });
        }
        else if (node.isLead()) {
            node.options.onExitComplete?.();
        }
        /**
         * Clearing transition
         * TODO: Investigate why this transition is being passed in as {type: false } from Framer
         * and why we need it at all
         */
        node.options.transition = undefined;
    }
    function propagateDirtyNodes(node) {
        /**
         * Increase debug counter for nodes encountered this frame
         */
        statsBuffer.countProjection?.(0); // nodes
        if (!node.parent)
            return;
        /**
         * If this node isn't projecting, propagate isProjectionDirty. It will have
         * no performance impact but it will allow the next child that *is* projecting
         * but *isn't* dirty to just check its parent to see if *any* ancestor needs
         * correcting.
         */
        if (!node.isProjecting()) {
            node.isProjectionDirty = node.parent.isProjectionDirty;
        }
        /**
         * Propagate isSharedProjectionDirty and isTransformDirty
         * throughout the whole tree. A future revision can take another look at
         * this but for safety we still recalcualte shared nodes.
         */
        node.isSharedProjectionDirty || (node.isSharedProjectionDirty = Boolean(node.isProjectionDirty ||
            node.parent.isProjectionDirty ||
            node.parent.isSharedProjectionDirty));
        node.isTransformDirty || (node.isTransformDirty = node.parent.isTransformDirty);
    }
    function cleanDirtyNodes(node) {
        node.isProjectionDirty =
            node.isSharedProjectionDirty =
                node.isTransformDirty =
                    false;
    }
    function clearSnapshot(node) {
        node.clearSnapshot();
    }
    function clearMeasurements(node) {
        node.clearMeasurements();
    }
    function forceLayoutMeasure(node) {
        node.isLayoutDirty = true;
        node.updateLayout();
    }
    function clearIsLayoutDirty(node) {
        node.isLayoutDirty = false;
    }
    /**
     * A dragged node doesn't layout animate, so it jumps to its new layout. Shift
     * its descendants' snapshots by the same amount, so they only animate layout
     * changes relative to it, rather than lagging behind.
     *
     * If its drag ended since the snapshot (e.g. drag disabled from onDrag), it
     * layout animates again, so its descendants mustn't follow its jump.
     */
    function followDraggedAncestor(node) {
        const { snapshot, dragAncestor } = node;
        const to = dragAncestor?.isAnimationBlocked && dragAncestor.layout;
        if (!snapshot || !to || node.resumeFrom || node.isAnimationBlocked)
            return;
        const from = dragAncestor.dragSnapshot;
        eachAxis((axis) => translateAxis(snapshot.layoutBox[axis], to.layoutBox[axis].min - from.layoutBox[axis].min));
    }
    /**
     * When a node is animation-blocked (e.g. during drag) and its component
     * didn't re-render (memoized), willUpdate() is never called so there's
     * no snapshot. Use the previous layout as a snapshot and mark dirty so
     * resetTransform/updateLayout/notifyLayoutUpdate process it normally.
     */
    function ensureDraggedNodesSnapshotted(node) {
        if (node.isAnimationBlocked && node.layout && !node.isLayoutDirty) {
            node.snapshot = node.dragSnapshot || node.layout;
            node.isLayoutDirty = true;
        }
    }
    /**
     * If a node's relative parent is about to be re-measured but the node isn't
     * (e.g. it's in another LayoutGroup), its relative target is out of date.
     * If it's layout animating, re-measure it too, so its relative target keeps
     * resolving against current layouts. Otherwise its layout is still valid
     * relative to its parent, so drop the relative target, and any targetDelta
     * left over from a finished animation while an ancestor still animates, to be
     * rebuilt from its layout.
     */
    function syncRelativeLayout(node) {
        if (node.relativeTarget && node.relativeParent?.isLayoutDirty) {
            if (node.currentAnimation) {
                node.isLayoutDirty = true;
            }
            else {
                node.targetDelta = undefined;
                node.removeRelativeTarget();
            }
        }
    }
    function resetTransformStyle(node) {
        const { visualElement } = node.options;
        if (visualElement?.getProps().onBeforeLayoutMeasure) {
            visualElement.notify("BeforeLayoutMeasure");
        }
        node.resetTransform();
    }
    function finishAnimation(node) {
        node.finishAnimation();
        node.targetDelta = node.relativeTarget = node.target = undefined;
        node.isProjectionDirty = true;
    }
    function resolveTargetDelta(node) {
        node.resolveTargetDelta();
    }
    function calcProjection(node) {
        node.calcProjection();
    }
    function resetSkewAndRotation(node) {
        node.resetSkewAndRotation();
    }
    function mixAxisDeltaLinear(output, delta, p) {
        output.translate = mixNumber$1(delta.translate, 0, p);
        output.scale = mixNumber$1(delta.scale, 1, p);
        output.origin = delta.origin;
        output.originPoint = delta.originPoint;
    }
    function mixAxis(output, from, to, p) {
        output.min = mixNumber$1(from.min, to.min, p);
        output.max = mixNumber$1(from.max, to.max, p);
    }
    function mixBox(output, from, to, p) {
        mixAxis(output.x, from.x, to.x, p);
        mixAxis(output.y, from.y, to.y, p);
    }
    function hasOpacityCrossfade(node) {
        return node.animationValues?.opacityExit !== undefined;
    }
    const defaultLayoutTransition = {
        duration: 0.45,
        ease: [0.4, 0, 0.1, 1],
    };
    /**
     * Align an axis to the start of another, keeping the length of a layout axis.
     * The length is read first, as output can be the layout axis itself.
     */
    function alignAxis(output, from, layout) {
        output.max = calcLength(layout) + (output.min = from.min);
    }
    function shouldAnimatePositionOnly(animationType, snapshot, layout) {
        return (animationType === "position" ||
            (animationType === "preserve-aspect" &&
                !isNear(aspectRatio(snapshot), aspectRatio(layout), 0.2)));
    }
    function checkNodeWasScrollRoot(node) {
        return node !== node.root && node.scroll?.wasRoot;
    }

    function addDomEvent(target, eventName, handler, options = { passive: true }) {
        target.addEventListener(eventName, handler, options);
        return () => target.removeEventListener(eventName, handler, options);
    }

    const DocumentProjectionNode = 
    /* @__PURE__ */ createProjectionNode({
        attachResizeListener: (ref, notify) => addDomEvent(ref, "resize", notify),
        measureScroll: measureDocumentScroll,
        checkIsScrollRoot: () => true,
    });

    const rootProjectionNode = {
        current: undefined,
    };

    const HTMLProjectionNode = 
    /* @__PURE__ */ createProjectionNode({
        measureScroll: (instance) => ({
            x: instance.scrollLeft,
            y: instance.scrollTop,
        }),
        defaultParent: () => {
            if (!rootProjectionNode.current) {
                const documentNode = new DocumentProjectionNode({});
                documentNode.mount(window);
                documentNode.setOptions({ layoutScroll: true });
                rootProjectionNode.current = documentNode;
            }
            return rootProjectionNode.current;
        },
        resetTransform: (instance, value) => {
            instance.style.transform = value !== undefined ? value : "none";
        },
        checkIsScrollRoot: (instance) => window.getComputedStyle(instance).position === "fixed",
    });

    const visualElementStore = new WeakMap();

    function isAnimationControls(v) {
        return (v !== null &&
            typeof v === "object" &&
            typeof v.start === "function");
    }

    /**
     * Decides if the supplied variable is variant label
     */
    function isVariantLabel(v) {
        return typeof v === "string" || Array.isArray(v);
    }

    const variantPriorityOrder = [
        "animate",
        "whileInView",
        "whileFocus",
        "whileHover",
        "whileTap",
        "whileDrag",
        "exit",
    ];
    const variantProps = /* @__PURE__ */ ["initial"].concat(variantPriorityOrder);

    function isControllingVariants(props) {
        if (isAnimationControls(props.animate))
            return true;
        for (let i = 0; i < variantProps.length; i++) {
            if (isVariantLabel(props[variantProps[i]])) {
                return true;
            }
        }
        return false;
    }
    function isVariantNode(props) {
        return Boolean(isControllingVariants(props) || props.variants);
    }

    /**
     * Updates motion values from props changes.
     * Uses `any` type for element to avoid circular dependencies with VisualElement.
     */
    function updateMotionValuesFromProps(element, next, prev) {
        for (const key in next) {
            const nextValue = next[key];
            const prevValue = prev[key];
            if (isMotionValue(nextValue)) {
                /**
                 * If this is a motion value found in props or style, we want to add it
                 * to our visual element's motion value map.
                 */
                element.addValue(key, nextValue);
            }
            else if (isMotionValue(prevValue)) {
                /**
                 * If we're swapping from a motion value to a static value,
                 * create a new motion value from that
                 */
                element.addValue(key, motionValue(nextValue, { owner: element }));
            }
            else if (prevValue !== nextValue) {
                /**
                 * If this is a flat value that has changed, update the motion value
                 * or create one if it doesn't exist. We only want to do this if we're
                 * not handling the value with our animation state.
                 */
                if (element.hasValue(key)) {
                    const existingValue = element.getValue(key);
                    if (existingValue.liveStyle === true) {
                        existingValue.jump(nextValue);
                    }
                    else if (!existingValue.hasAnimated) {
                        existingValue.set(nextValue);
                    }
                }
                else {
                    const latestValue = element.getStaticValue(key);
                    element.addValue(key, motionValue(latestValue !== undefined ? latestValue : nextValue, { owner: element }));
                }
            }
        }
        // Handle removed values
        for (const key in prev) {
            if (next[key] === undefined)
                element.removeValue(key);
        }
        return next;
    }

    // Does this device prefer reduced motion? Returns `null` server-side.
    const prefersReducedMotion = { current: null };
    const hasReducedMotionListener = { current: false };

    const isBrowser = typeof window !== "undefined";
    function initPrefersReducedMotion() {
        hasReducedMotionListener.current = true;
        if (!isBrowser)
            return;
        if (window.matchMedia) {
            const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)");
            const setReducedMotionPreferences = () => (prefersReducedMotion.current = motionMediaQuery.matches);
            motionMediaQuery.addEventListener("change", setReducedMotionPreferences);
            setReducedMotionPreferences();
        }
        else {
            prefersReducedMotion.current = false;
        }
    }

    const propEventHandlers = [
        "AnimationStart",
        "AnimationComplete",
        "Update",
        "BeforeLayoutMeasure",
        "LayoutMeasure",
        "LayoutAnimationStart",
        "LayoutAnimationComplete",
    ];
    /**
     * Static feature definitions - can be injected by framework layer
     */
    let featureDefinitions = {};
    /**
     * Set feature definitions for all VisualElements.
     * This should be called by the framework layer (e.g., framer-motion) during initialization.
     */
    function setFeatureDefinitions(definitions) {
        featureDefinitions = definitions;
    }
    /**
     * Get the current feature definitions
     */
    function getFeatureDefinitions() {
        return featureDefinitions;
    }
    /**
     * A VisualElement is an imperative abstraction around UI elements such as
     * HTMLElement, SVGElement, Three.Object3D etc.
     */
    class VisualElement {
        /**
         * This method takes React props and returns found MotionValues. For example, HTML
         * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
         *
         * This isn't an abstract method as it needs calling in the constructor, but it is
         * intended to be one.
         */
        scrapeMotionValuesFromProps(_props, _prevProps, _visualElement) {
            return {};
        }
        constructor({ parent, props, presenceContext, reducedMotionConfig, skipAnimations, blockInitialAnimation, visualState, }, options = {}) {
            /**
             * A reference to the current underlying Instance, e.g. a HTMLElement
             * or Three.Mesh etc.
             */
            this.current = null;
            /**
             * A set containing references to this VisualElement's children.
             */
            this.children = new Set();
            /**
             * Determine what role this visual element should take in the variant tree.
             */
            this.isVariantNode = false;
            this.isControllingVariants = false;
            /**
             * Decides whether this VisualElement should animate in reduced motion
             * mode.
             *
             * TODO: This is currently set on every individual VisualElement but feels
             * like it could be set globally.
             */
            this.shouldReduceMotion = null;
            /**
             * Decides whether animations should be skipped for this VisualElement.
             * Useful for E2E tests and visual regression testing.
             */
            this.shouldSkipAnimations = false;
            /**
             * A map of all motion values attached to this visual element. Motion
             * values are source of truth for any given animated value. A motion
             * value might be provided externally by the component via props.
             */
            this.values = new Map();
            this.KeyframeResolver = KeyframeResolver;
            /**
             * Cleanup functions for active features (hover/tap/exit etc)
             */
            this.features = {};
            /**
             * A map of every subscription that binds the provided or generated
             * motion values onChange listeners to this visual element.
             */
            this.valueSubscriptions = new Map();
            /**
             * A reference to the previously-provided motion values as returned
             * from scrapeMotionValuesFromProps. We use the keys in here to determine
             * if any motion values need to be removed after props are updated.
             */
            this.prevMotionValues = {};
            /**
             * Track whether this element has been mounted before, to detect
             * remounts after Suspense unmount/remount cycles.
             */
            this.hasBeenMounted = false;
            /**
             * An object containing a SubscriptionManager for each active event.
             */
            this.events = {};
            /**
             * An object containing an unsubscribe function for each prop event subscription.
             * For example, every "Update" event can have multiple subscribers via
             * VisualElement.on(), but only one of those can be defined via the onUpdate prop.
             */
            this.propEventSubscriptions = {};
            this.notifyUpdate = () => this.notify("Update", this.latestValues);
            this.render = () => {
                if (!this.current)
                    return;
                this.triggerBuild();
                this.renderInstance(this.current, this.renderState, this.props.style, this.projection);
            };
            this.renderScheduledAt = 0.0;
            this.scheduleRender = () => {
                const now = time.now();
                if (this.renderScheduledAt < now) {
                    this.renderScheduledAt = now;
                    frame.render(this.render, false, true);
                }
            };
            const { latestValues, renderState } = visualState;
            this.latestValues = latestValues;
            this.baseTarget = { ...latestValues };
            this.initialValues = props.initial ? { ...latestValues } : {};
            this.renderState = renderState;
            this.parent = parent;
            this.props = props;
            this.presenceContext = presenceContext;
            this.depth = parent ? parent.depth + 1 : 0;
            this.reducedMotionConfig = reducedMotionConfig;
            this.skipAnimationsConfig = skipAnimations;
            this.options = options;
            this.blockInitialAnimation = Boolean(blockInitialAnimation);
            this.isControllingVariants = isControllingVariants(props);
            this.isVariantNode = isVariantNode(props);
            if (this.isVariantNode) {
                this.variantChildren = new Set();
            }
            this.manuallyAnimateOnMount = Boolean(parent && parent.current);
            /**
             * Any motion values that are provided to the element when created
             * aren't yet bound to the element, as this would technically be impure.
             * However, we iterate through the motion values and set them to the
             * initial values for this component.
             *
             * TODO: This is impure and we should look at changing this to run on mount.
             * Doing so will break some tests but this isn't necessarily a breaking change,
             * more a reflection of the test.
             */
            const { willChange, ...initialMotionValues } = this.scrapeMotionValuesFromProps(props, {}, this);
            for (const key in initialMotionValues) {
                const value = initialMotionValues[key];
                if (latestValues[key] !== undefined && isMotionValue(value)) {
                    value.set(latestValues[key]);
                }
            }
        }
        mount(instance) {
            /**
             * If this element has been mounted before (e.g. after a Suspense
             * unmount/remount), reset motion values to their initial state
             * so animations replay correctly from initial → animate, unless
             * the presence asks to keep them.
             */
            if (this.hasBeenMounted && !this.presenceContext?.keepValuesOnRemount) {
                for (const key in this.initialValues) {
                    this.values.get(key)?.jump(this.initialValues[key]);
                    this.latestValues[key] = this.initialValues[key];
                }
            }
            this.current = instance;
            visualElementStore.set(instance, this);
            this.projection?.instance || this.projection?.mount(instance);
            /**
             * Join the closest variant node above, so its variant changes
             * propagate here, unless inherit={false} cuts the chain.
             */
            if (this.isVariantNode && !this.isControllingVariants) {
                let node = this;
                do
                    node = node.props.inherit !== false && node.parent;
                while (node && !node.isVariantNode);
                if (node) {
                    const { variantChildren } = node;
                    variantChildren.add(this);
                    this.removeFromVariantTree = () => variantChildren.delete(this);
                }
            }
            this.values.forEach((value, key) => this.bindToMotionValue(key, value));
            /**
             * Determine reduced motion preference. Only initialize the matchMedia
             * listener if we actually need the dynamic value (i.e., when config
             * is neither "never" nor "always").
             */
            if (this.reducedMotionConfig === "never") {
                this.shouldReduceMotion = false;
            }
            else if (this.reducedMotionConfig === "always") {
                this.shouldReduceMotion = true;
            }
            else {
                if (!hasReducedMotionListener.current) {
                    initPrefersReducedMotion();
                }
                this.shouldReduceMotion = prefersReducedMotion.current;
            }
            {
                warnOnce(this.shouldReduceMotion !== true, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled");
            }
            /**
             * Set whether animations should be skipped based on the config.
             */
            this.shouldSkipAnimations = this.skipAnimationsConfig ?? false;
            this.parent?.addChild(this);
            this.update(this.props, this.presenceContext);
            this.hasBeenMounted = true;
        }
        unmount() {
            this.projection?.unmount();
            cancelFrame(this.notifyUpdate);
            cancelFrame(this.render);
            this.valueSubscriptions.forEach((remove) => remove());
            this.valueSubscriptions.clear();
            this.removeFromVariantTree?.();
            this.parent?.removeChild(this);
            for (const key in this.events) {
                this.events[key].clear();
            }
            for (const key in this.features) {
                const feature = this.features[key];
                if (feature) {
                    feature.unmount();
                    feature.isMounted = false;
                }
            }
            this.current = null;
        }
        addChild(child) {
            this.children.add(child);
            (this.enteringChildren || (this.enteringChildren = new Set())).add(child);
        }
        removeChild(child) {
            this.children.delete(child);
            this.enteringChildren?.delete(child);
        }
        bindToMotionValue(key, value) {
            this.valueSubscriptions.get(key)?.();
            if (value.accelerate &&
                acceleratedValues.has(key) &&
                this.current instanceof HTMLElement) {
                const { factory, keyframes, times, ease, duration } = value.accelerate;
                const animation = new NativeAnimation({
                    element: this.current,
                    name: key,
                    keyframes,
                    times,
                    ease,
                    duration: secondsToMilliseconds(duration),
                });
                const cleanup = factory(animation);
                this.valueSubscriptions.set(key, () => {
                    cleanup();
                    animation.cancel();
                });
                return;
            }
            const valueIsTransform = transformProps.has(key);
            if (valueIsTransform && this.onBindTransform) {
                this.onBindTransform();
            }
            const removeOnChange = value.on("change", (latestValue) => {
                this.latestValues[key] = latestValue;
                this.props.onUpdate && frame.preRender(this.notifyUpdate);
                if (valueIsTransform) {
                    if (this.projection) {
                        this.projection.isTransformDirty = true;
                    }
                    transformGroups.get(this.current)?.check();
                }
                this.scheduleRender();
            });
            let removeSyncCheck;
            if (typeof window !== "undefined" &&
                window.MotionCheckAppearSync) {
                removeSyncCheck = window.MotionCheckAppearSync(this, key, value);
            }
            this.valueSubscriptions.set(key, () => {
                removeOnChange();
                removeSyncCheck?.();
                // Defer to MotionValue.on("change") auto-stop so React 19 remounts
                // can resubscribe before the animation is cancelled (#3315).
            });
        }
        sortNodePosition(other) {
            /**
             * If either node isn't mounted, or they aren't even of the same type,
             * we can't compare their document order.
             */
            if (!this.current ||
                !other.current ||
                !this.sortInstanceNodePosition ||
                this.type !== other.type) {
                return 0;
            }
            return this.sortInstanceNodePosition(this.current, other.current);
        }
        updateFeatures() {
            let key = "animation";
            for (key in featureDefinitions) {
                const featureDefinition = featureDefinitions[key];
                if (!featureDefinition)
                    continue;
                const { isEnabled, Feature: FeatureConstructor } = featureDefinition;
                /**
                 * If this feature is enabled but not active, make a new instance.
                 */
                if (!this.features[key] &&
                    FeatureConstructor &&
                    isEnabled(this.props)) {
                    this.features[key] = new FeatureConstructor(this);
                }
                /**
                 * If we have a feature, mount or update it.
                 */
                if (this.features[key]) {
                    const feature = this.features[key];
                    if (feature.isMounted) {
                        feature.update();
                    }
                    else {
                        feature.mount();
                        feature.isMounted = true;
                    }
                }
            }
        }
        triggerBuild() {
            this.build(this.renderState, this.latestValues, this.props);
        }
        /**
         * Measure the current viewport box with or without transforms.
         * Only measures axis-aligned boxes, rotate and skew must be manually
         * removed with a re-render to work.
         */
        measureViewportBox() {
            return this.current
                ? this.measureInstanceViewportBox(this.current, this.props)
                : createBox();
        }
        getStaticValue(key) {
            return this.latestValues[key];
        }
        setStaticValue(key, value) {
            this.latestValues[key] = value;
        }
        /**
         * Update the provided props. Ensure any newly-added motion values are
         * added to our map, old ones removed, and listeners updated.
         */
        update(props, presenceContext) {
            const { transformTemplate, onUpdate } = this.props;
            if (props.transformTemplate || transformTemplate) {
                this.scheduleRender();
            }
            /**
             * Transforms on the compositor can't use a new transformTemplate
             * or onUpdate, so move them to the main thread.
             */
            if ((props.transformTemplate && !transformTemplate) ||
                (props.onUpdate && !onUpdate)) {
                transformGroups.get(this.current)?.demote();
            }
            this.prevProps = this.props;
            this.props = props;
            this.prevPresenceContext = this.presenceContext;
            this.presenceContext = presenceContext;
            /**
             * Update prop event handlers ie onAnimationStart, onAnimationComplete
             */
            for (let i = 0; i < propEventHandlers.length; i++) {
                const key = propEventHandlers[i];
                this.propEventSubscriptions[key]?.();
                delete this.propEventSubscriptions[key];
                const listenerName = ("on" + key);
                const listener = props[listenerName];
                if (listener) {
                    this.propEventSubscriptions[key] = this.on(key, listener);
                }
            }
            this.prevMotionValues = updateMotionValuesFromProps(this, this.scrapeMotionValuesFromProps(props, this.prevProps || {}, this), this.prevMotionValues);
            this.handleChildMotionValue?.();
        }
        getProps() {
            return this.props;
        }
        /**
         * Returns the variant definition with a given name.
         */
        getVariant(name) {
            return this.props.variants?.[name];
        }
        /**
         * Returns the defined default transition on this component.
         */
        getDefaultTransition() {
            return this.props.transition;
        }
        getTransformPagePoint() {
            return this.props.transformPagePoint;
        }
        /**
         * Add a motion value and bind it to this visual element.
         */
        addValue(key, value) {
            // Remove existing value if it exists
            const existingValue = this.values.get(key);
            if (value !== existingValue) {
                if (existingValue)
                    this.removeValue(key);
                this.bindToMotionValue(key, value);
                this.values.set(key, value);
                /**
                 * An animated value with no base value is undefined until the
                 * keyframe resolver reads its origin. Rendering it before then
                 * writes an invalid placeholder (e.g. points="undefined") that
                 * the resolver can read back from the DOM as the origin.
                 */
                const latest = value.get();
                if (latest !== undefined)
                    this.latestValues[key] = latest;
            }
        }
        /**
         * Remove a motion value and unbind any active subscriptions.
         */
        removeValue(key) {
            this.values.delete(key);
            this.valueSubscriptions.get(key)?.();
            this.valueSubscriptions.delete(key);
            delete this.latestValues[key];
            this.removeValueFromRenderState(key, this.renderState);
        }
        /**
         * Check whether we have a motion value for this key
         */
        hasValue(key) {
            return this.values.has(key);
        }
        getValue(key, defaultValue) {
            let value = this.props.values?.[key];
            if (value)
                return value;
            value = this.values.get(key);
            if (value === undefined && defaultValue !== undefined) {
                value = motionValue(defaultValue ?? this.getDefaultValue?.(key), {
                    owner: this,
                });
                this.addValue(key, value);
            }
            return value;
        }
        /**
         * If we're trying to animate to a previously unencountered value,
         * we need to check for it in our state and as a last resort read it
         * directly from the instance (which might have performance implications).
         */
        readValue(key, target) {
            let value = this.latestValues[key] !== undefined || !this.current
                ? this.latestValues[key]
                : this.getBaseTargetFromProps(this.props, key) ??
                    this.readValueFromInstance(this.current, key, this.options);
            if (value !== undefined && value !== null) {
                if (typeof value === "string" &&
                    (isNumericalString(value) || isZeroValueString(value))) {
                    // If this is a number read as a string, ie "0" or "200", convert it to a number
                    value = parseFloat(value);
                }
                else if (
                /**
                 * If the value as read isn't animatable (e.g. "none") but
                 * the target is, derive an animatable none from the target.
                 * A value is animatable if it's a number or contains a
                 * number or color, which is cheaper to check than trying
                 * every value type in turn.
                 */
                typeof value !== "number" &&
                    !complex.test(value) &&
                    complex.test(target)) {
                    value = getAnimatableNone(key, target);
                }
                this.setBaseTarget(key, isMotionValue(value) ? value.get() : value);
            }
            return isMotionValue(value) ? value.get() : value;
        }
        /**
         * Set the base target to later animate back to. This is currently
         * only hydrated on creation and when we first read a value.
         */
        setBaseTarget(key, value) {
            this.baseTarget[key] = value;
        }
        on(eventName, callback) {
            return (this.events[eventName] ||
                (this.events[eventName] = new SubscriptionManager())).add(callback);
        }
        notify(eventName, ...args) {
            this.events[eventName]?.notify(...args);
        }
        scheduleRenderMicrotask() {
            microtask.render(this.render);
        }
    }

    class DOMVisualElement extends VisualElement {
        constructor() {
            super(...arguments);
            this.KeyframeResolver = DOMKeyframesResolver;
        }
        sortInstanceNodePosition(a, b) {
            /**
             * compareDocumentPosition returns a bitmask, by using the bitwise &
             * we're returning true if 2 in that bitmask is set to true. 2 is set
             * to true if b precedes a.
             */
            return a.compareDocumentPosition(b) & 2 ? 1 : -1;
        }
        getBaseTargetFromProps(props, key) {
            const style = props.style;
            return style ? style[key] : undefined;
        }
        removeValueFromRenderState(key, { vars, style }) {
            delete vars[key];
            delete style[key];
        }
        handleChildMotionValue() {
            if (this.childSubscription) {
                this.childSubscription();
                delete this.childSubscription;
            }
            const { children } = this.props;
            if (isMotionValue(children)) {
                this.childSubscription = children.on("change", (latest) => {
                    if (this.current) {
                        this.current.textContent = `${latest}`;
                    }
                });
            }
        }
    }

    function renderHTML(element, { style, vars }, styleProp, projection) {
        const elementStyle = element.style;
        let key;
        for (key in style) {
            // CSSStyleDeclaration has [index: number]: string; in the types, so we use that as key type.
            elementStyle[key] = style[key];
        }
        // Write projection styles directly to element style
        projection?.applyProjectionStyles(elementStyle, styleProp);
        for (key in vars) {
            // Loop over any CSS variables and assign those.
            // They can only be assigned using `setProperty`.
            elementStyle.setProperty(key, vars[key]);
        }
    }

    function isForcedMotionValue(key, { layout, layoutId }) {
        return (transformProps.has(key) ||
            key.startsWith("origin") ||
            ((layout || layoutId !== undefined) &&
                (!!scaleCorrectors[key] || key === "opacity")));
    }

    function scrapeMotionValuesFromProps$1(props, prevProps, visualElement) {
        const style = props.style;
        const prevStyle = prevProps?.style;
        const newValues = {};
        if (!style)
            return newValues;
        for (const key in style) {
            if (isMotionValue(style[key]) ||
                (prevStyle && isMotionValue(prevStyle[key])) ||
                isForcedMotionValue(key, props) ||
                visualElement?.getValue(key)?.liveStyle !== undefined) {
                newValues[key] = style[key];
            }
        }
        return newValues;
    }

    function getComputedStyle$2(element) {
        return window.getComputedStyle(element);
    }
    class HTMLVisualElement extends DOMVisualElement {
        constructor() {
            super(...arguments);
            this.type = "html";
            this.renderInstance = renderHTML;
        }
        mount(instance) {
            /**
             * If a custom component forwards its ref to something other than a
             * HTML/SVG element (a class instance, an imperative handle) there's
             * nothing for Motion to style, measure or attach gestures to. #2777
             */
            exports.invariant(Boolean(instance.style), "motion.create() components must forward their ref to a HTML or SVG element", "custom-component-ref");
            super.mount(instance);
        }
        readValueFromInstance(instance, key) {
            if (transformProps.has(key)) {
                return this.projection?.isProjecting
                    ? defaultTransformValue(key)
                    : readTransformValue(instance, key);
            }
            else {
                const computedStyle = getComputedStyle$2(instance);
                const value = (isCSSVariableName(key)
                    ? computedStyle.getPropertyValue(key)
                    : computedStyle[key]) || 0;
                return typeof value === "string" ? value.trim() : value;
            }
        }
        measureInstanceViewportBox(instance, { transformPagePoint }) {
            return measureViewportBox(instance, transformPagePoint);
        }
        build(renderState, latestValues, props) {
            buildHTMLStyles(renderState, latestValues, props.transformTemplate);
        }
        scrapeMotionValuesFromProps(props, prevProps, visualElement) {
            return scrapeMotionValuesFromProps$1(props, prevProps, visualElement);
        }
    }

    /**
     * Get the VisualElement that imperative APIs like animateLayout() and
     * drag() render an element with, creating one if it has none, ready for
     * a projection node to be attached.
     */
    function resolveVisualElement(element) {
        let visualElement = visualElementStore.get(element);
        if (!visualElement) {
            visualElement = new HTMLVisualElement({
                props: {},
                presenceContext: null,
                visualState: {
                    latestValues: {},
                    renderState: {
                        transform: {},
                        transformOrigin: {},
                        style: {},
                        vars: {},
                    },
                },
            }, { allowProjection: true });
            /**
             * Values animate() has been rendering on this element move to
             * the VisualElement, so the layout animation composes with
             * them instead of overwriting them.
             */
            handOffElementState(element, visualElement);
        }
        /**
         * A first-time element may carry a projection transform in its
         * inline style (e.g. it was cloned from an element mid-animation).
         * That transform isn't tracked in latestValues so the engine can't
         * reset it before measuring - clear it now so the first layout
         * measurement isn't inflated.
         */
        if (element.style.transform && !hasTransform(visualElement.latestValues)) {
            element.style.transform = "";
        }
        return visualElement;
    }

    /**
     * animateLayout() registers a function here that creates nodes in the
     * layout projection tree. When it's in the bundle, drag() uses those, so
     * the two work together (e.g. a drag follows a layout change mid-gesture).
     * Otherwise drag() makes do with a node that only measures. Bundles that
     * don't tree-shake (dev pre-bundling, CDN builds) always register it, and
     * a drag() started before animateLayout() is lazy loaded keeps its node.
     */
    const layoutProjection = {};
    /**
     * The document root of measurement-only nodes. Like the projection tree's
     * root, it keeps its scroll until drag controls clear it to re-measure.
     */
    const root = {
        updateScroll: () => {
            root.scroll || (root.scroll = { offset: measureDocumentScroll() });
        },
    };
    /**
     * The part of a projection node that drag controls use: measuring the
     * element's page box, for its layout and constraints. It never projects
     * or joins a layout update.
     */
    const createMeasureNode = (element) => {
        const visualElement = resolveVisualElement(element);
        const measureListeners = new SubscriptionManager();
        const node = {
            instance: element,
            root,
            path: [root],
            setOptions: noop,
            /**
             * Truthy like the full node's method, which HTMLVisualElement reads
             * (rather than calls) to default transform values.
             */
            isProjecting: noop,
            applyProjectionStyles: noop,
            removeElementScroll: (box) => box,
            updateLayout: () => {
                const layoutBox = measurePageBox(element, root, visualElement.getTransformPagePoint());
                roundBox(layoutBox);
                node.layout = { layoutBox };
                measureListeners.notify();
            },
            addEventListener: (name, handler) => name === "measure" ? measureListeners.add(handler) : noop,
            /**
             * Detach from the VisualElement too, so it doesn't later remount
             * (or a `motion` component's layout feature adopt) a node that
             * can't do either.
             */
            unmount: () => {
                node.instance = undefined;
                if (visualElement.projection === node) {
                    visualElement.projection = undefined;
                }
            },
        };
        visualElement.projection = node;
        visualElement.current || visualElement.mount(element);
        return [node, node.unmount];
    };
    /**
     * Get a projection node for drag() to measure an element with, and a
     * function that releases it. Reuses a node a `motion` component or
     * animateLayout() owns.
     */
    const acquireDragNode = (element) => {
        const owned = visualElementStore.get(element)?.projection;
        /**
         * A VisualElement can outlive its node (e.g. an unmounted `motion`
         * component's), so only reuse a node that's still mounted.
         */
        return owned?.instance
            ? [owned, noop]
            : (layoutProjection.create || createMeasureNode)(element);
    };

    const layoutSelector = "[data-layout],[data-layout-id]";
    /**
     * All imperatively-created projection nodes live in one persistent tree,
     * shared across animateLayout() calls (and with any React-created nodes,
     * via the singleton document root). Keyed by element for reuse.
     */
    const layoutNodes = new WeakMap();
    /**
     * Builders created within the same synchronous tick are flushed together
     * as a single "commit": every node is snapshotted before any updateDom
     * runs, mirroring React batching renders from different parts of the tree.
     */
    let pendingBuilders;
    function collectLayoutElements(scope) {
        const elements = [];
        if (scope instanceof HTMLElement && scope.matches(layoutSelector)) {
            elements.push(scope);
        }
        scope.querySelectorAll(layoutSelector).forEach((element) => {
            if (element instanceof HTMLElement)
                elements.push(element);
        });
        return elements;
    }
    /**
     * Process any work scheduled on the frameloop now. A previous animation
     * may have been seeked while paused (controls.time = x) without a frame
     * having rendered it - we must materialise that state into the DOM
     * before taking snapshots.
     */
    function flushPendingFrame() {
        if (frameData.isProcessing)
            return;
        const now = time.now();
        frameData.delta = clamp(0, 1000 / 60, now - frameData.timestamp);
        frameData.timestamp = now;
        frameData.isProcessing = true;
        frameSteps.update.process(frameData);
        frameSteps.preRender.process(frameData);
        frameSteps.render.process(frameData);
        frameData.isProcessing = false;
    }
    function getProjectionParent(element) {
        let ancestor = element.parentElement;
        while (ancestor) {
            const node = layoutNodes.get(ancestor);
            if (node?.instance)
                return node;
            ancestor = ancestor.parentElement;
        }
        return undefined;
    }
    function readNodeOptions(element, transition) {
        const layoutAttr = element.getAttribute("data-layout");
        const layoutId = element.getAttribute("data-layout-id") ?? undefined;
        return {
            layoutId,
            layout: layoutAttr !== null ? true : undefined,
            animationType: (!layoutAttr || layoutAttr === "true"
                ? "both"
                : layoutAttr),
            transition,
        };
    }
    function prepareNode(element, transition) {
        let node = layoutNodes.get(element);
        if (!node) {
            const visualElement = resolveVisualElement(element);
            node = new HTMLProjectionNode(visualElement.latestValues, getProjectionParent(element));
            visualElement.projection = node;
            node.setOptions({
                ...readNodeOptions(element, transition),
                visualElement,
            });
            node.mount(element);
            layoutNodes.set(element, node);
        }
        else {
            node.setOptions(readNodeOptions(element, transition));
        }
        node.isPresent = true;
        if (node.options.onExitComplete) {
            node.setOptions({ onExitComplete: undefined });
        }
        return node;
    }
    /**
     * Create a node for an element in the shared imperative tree. Returns the
     * node and a function that releases it.
     */
    function createLayoutNode(element) {
        const node = prepareNode(element);
        return [
            node,
            () => layoutNodes.get(element) === node && dropNode(element, node),
        ];
    }
    /**
     * Let drag() create its nodes in the shared imperative tree, so drag
     * gestures and layout animations work together.
     */
    layoutProjection.create = createLayoutNode;
    /**
     * Get a projection node for an element, so motion/remix can measure and
     * animate its layout. Reuses a node owned by a `motion` component or
     * animateLayout(), otherwise creates one in the shared imperative tree.
     * Returns the node and a function that releases it.
     */
    function acquireProjectionNode(element) {
        const owned = layoutNodes.get(element) || visualElementStore.get(element)?.projection;
        /**
         * A VisualElement can outlive a node we released (e.g. a stopped
         * drag()), so only reuse a node that's still mounted.
         */
        return owned?.instance ? [owned, () => { }] : createLayoutNode(element);
    }
    function sortDocumentOrder(elements) {
        return [...elements].sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    }
    function dropNode(element, node) {
        node.setOptions({ onExitComplete: undefined });
        /**
         * Stop any lingering animation so it can't leak into future updates.
         * A follow node can share its currentAnimation with a surviving lead
         * (via resumingFrom), in which case it isn't ours to stop.
         */
        const stack = node.getStack();
        if (!stack || node.isLead())
            node.currentAnimation?.stop();
        node.unmount();
        layoutNodes.delete(element);
    }
    function flushPendingBuilders() {
        const builders = pendingBuilders;
        if (!builders)
            return;
        pendingBuilders = undefined;
        flushPendingFrame();
        /**
         * Discover and mount every node across all builders before snapshotting
         * any of them. Mounting during an active update flags isLayoutDirty,
         * which would make that node's own willUpdate skip its snapshot.
         * Document order guarantees ancestors mount before descendants, even
         * when they're discovered by different builders.
         */
        const targets = new Map();
        for (const builder of builders) {
            for (const element of builder.collectTargets()) {
                const owners = targets.get(element);
                owners ? owners.push(builder) : targets.set(element, [builder]);
            }
        }
        const union = new Map();
        for (const element of sortDocumentOrder(targets.keys())) {
            const owners = targets.get(element);
            const node = prepareNode(element, owners[owners.length - 1].transitionFor(element));
            for (const owner of owners)
                owner.adopt(element, node);
            union.set(element, node);
        }
        union.forEach((node) => {
            node.isLayoutDirty = false;
            node.willUpdate();
        });
        const updatePromises = [];
        for (const builder of builders) {
            const result = builder.runUpdate();
            if (result)
                updatePromises.push(result);
        }
        const commit = () => {
            /**
             * Process all additions before any removals so that, even across
             * builders, a removed member knows whether a replacement with the
             * same layoutId was added in this commit.
             */
            const newMemberIds = new Set();
            for (const builder of builders) {
                builder.reconcileAdditions(newMemberIds);
            }
            for (const builder of builders) {
                builder.reconcileRemovals(newMemberIds);
            }
            let root;
            union.forEach((node) => (root || (root = node.root)));
            for (const builder of builders)
                root || (root = builder.getRoot());
            root?.didUpdate();
            /**
             * The root flushes the update on a microtask, synchronously
             * processing the frame that creates the layout animations. Collect
             * them in a later microtask step of the same pass.
             */
            microtask.render(() => {
                for (const builder of builders)
                    builder.finalize();
            });
        };
        updatePromises.length ? Promise.all(updatePromises).then(commit) : commit();
    }
    /**
     * Snapshot every pending animateLayout() now, rather than on the next
     * microtask. For renderers that tell us a DOM update is about to happen
     * and then make it synchronously (e.g. a beforeUpdate/commit pair), with
     * updateDom returning a promise that resolves on commit.
     */
    const flushLayoutSnapshots = flushPendingBuilders;
    class LayoutAnimationBuilder {
        constructor(scope, updateDom, defaultOptions) {
            this.scope = scope;
            this.updateDom = updateDom;
            this.defaultOptions = defaultOptions;
            this.sharedTransitions = new Map();
            this.notifyReady = () => { };
            this.rejectReady = () => { };
            this.tracked = new Map();
            this.restorePoints = new Map();
            this.readyPromise = new Promise((resolve, reject) => {
                this.notifyReady = resolve;
                this.rejectReady = reject;
            });
            if (!pendingBuilders) {
                pendingBuilders = [];
                queueMicrotask(flushPendingBuilders);
            }
            pendingBuilders.push(this);
        }
        shared(id, transition) {
            this.sharedTransitions.set(id, transition);
            return this;
        }
        then(resolve, reject) {
            return this.readyPromise.then(resolve, reject);
        }
        transitionFor(element) {
            const layoutId = element.getAttribute("data-layout-id");
            return ((layoutId && this.sharedTransitions.get(layoutId)) ||
                this.defaultOptions);
        }
        adopt(element, node) {
            this.tracked.set(element, node);
            this.restorePoints.set(element, {
                parent: element.parentElement,
                next: element.nextSibling,
            });
        }
        collectTargets() {
            return collectLayoutElements(this.scope);
        }
        runUpdate() {
            try {
                const result = this.updateDom();
                if (result && typeof result.then === "function") {
                    return result.then(undefined, (error) => {
                        this.updateError = error;
                    });
                }
            }
            catch (error) {
                this.updateError = error;
            }
            return undefined;
        }
        reconcileAdditions(newMemberIds) {
            for (const element of collectLayoutElements(this.scope)) {
                if (this.tracked.has(element))
                    continue;
                const node = prepareNode(element, this.transitionFor(element));
                this.adopt(element, node);
                node.options.layoutId && newMemberIds.add(node.options.layoutId);
            }
        }
        reconcileRemovals(newMemberIds) {
            this.tracked.forEach((node, element) => {
                if (element.isConnected)
                    return;
                const restore = this.restorePoints.get(element);
                this.restorePoints.delete(element);
                const { layoutId } = node.options;
                const stack = node.getStack();
                const hasSurvivor = stack &&
                    stack.members.some((member) => member !== node &&
                        member.instance
                            ?.isConnected);
                /**
                 * A removed lead with a surviving stack member - and no
                 * replacement member added this commit - runs an exit
                 * crossfade: restore the element to its old position in the
                 * DOM, relegate it and let the survivor take over. It's
                 * removed again once the animation completes.
                 */
                if (layoutId &&
                    node.isLead() &&
                    hasSurvivor &&
                    !newMemberIds.has(layoutId)) {
                    if (restore && restore.parent.isConnected) {
                        restore.parent.insertBefore(element, restore.next?.parentNode === restore.parent
                            ? restore.next
                            : null);
                        node.isPresent = false;
                        node.setOptions({
                            onExitComplete: () => {
                                element.remove();
                                dropNode(element, node);
                            },
                        });
                        if (node.relegate())
                            return;
                        element.remove();
                    }
                }
                dropNode(element, node);
                this.tracked.delete(element);
            });
        }
        getRoot() {
            let root;
            this.tracked.forEach((node) => (root || (root = node.root)));
            return root;
        }
        finalize() {
            if (this.updateError) {
                this.rejectReady(this.updateError);
                return;
            }
            const animations = new Set();
            this.tracked.forEach((node) => {
                if (node.instance && node.currentAnimation) {
                    animations.add(node.currentAnimation);
                }
            });
            this.notifyReady(new GroupAnimation([...animations]));
        }
    }
    function parseAnimateLayoutArgs(scopeOrUpdateDom, updateDomOrOptions, options) {
        if (typeof scopeOrUpdateDom === "function") {
            return {
                scope: activeScope.current?.root || document,
                updateDom: scopeOrUpdateDom,
                defaultOptions: updateDomOrOptions,
            };
        }
        const scope = scopeOrUpdateDom instanceof Document
            ? scopeOrUpdateDom
            : resolveElements(scopeOrUpdateDom)[0] ?? document;
        return {
            scope,
            updateDom: updateDomOrOptions,
            defaultOptions: options,
        };
    }

    const isPrimaryPointer = (event) => {
        if (event.pointerType === "mouse") {
            return typeof event.button !== "number" || event.button <= 0;
        }
        else {
            /**
             * isPrimary is true for all mice buttons, whereas every touch point
             * is regarded as its own input. So subsequent concurrent touch points
             * will be false.
             *
             * Specifically match against false here as incomplete versions of
             * PointerEvents in very old browser might have it set as undefined.
             */
            return event.isPrimary !== false;
        }
    };

    function extractEventInfo(event) {
        return {
            point: {
                x: event.pageX,
                y: event.pageY,
            },
        };
    }
    const addPointerInfo = (handler) => (event) => isPrimaryPointer(event) && handler(event, extractEventInfo(event));

    function addPointerEvent(target, eventName, handler, options) {
        return addDomEvent(target, eventName, addPointerInfo(handler), options);
    }

    const resizeHandlers = new WeakMap();
    let observer;
    const getSize = (borderBoxAxis, svgAxis, htmlAxis) => (target, borderBoxSize) => {
        if (borderBoxSize && borderBoxSize[0]) {
            return borderBoxSize[0][(borderBoxAxis + "Size")];
        }
        else if (isSVGElement(target) && "getBBox" in target) {
            return target.getBBox()[svgAxis];
        }
        else {
            return target[htmlAxis];
        }
    };
    const getWidth = /*@__PURE__*/ getSize("inline", "width", "offsetWidth");
    const getHeight = /*@__PURE__*/ getSize("block", "height", "offsetHeight");
    function notifyTarget({ target, borderBoxSize }) {
        resizeHandlers.get(target)?.forEach((handler) => {
            handler(target, {
                get width() {
                    return getWidth(target, borderBoxSize);
                },
                get height() {
                    return getHeight(target, borderBoxSize);
                },
            });
        });
    }
    function notifyAll(entries) {
        entries.forEach(notifyTarget);
    }
    function createResizeObserver() {
        if (typeof ResizeObserver === "undefined")
            return;
        observer = new ResizeObserver(notifyAll);
    }
    function resizeElement(target, handler) {
        if (!observer)
            createResizeObserver();
        const elements = resolveElements(target);
        elements.forEach((element) => {
            let elementHandlers = resizeHandlers.get(element);
            if (!elementHandlers) {
                elementHandlers = new Set();
                resizeHandlers.set(element, elementHandlers);
            }
            elementHandlers.add(handler);
            observer?.observe(element);
        });
        return () => {
            elements.forEach((element) => {
                const elementHandlers = resizeHandlers.get(element);
                elementHandlers?.delete(handler);
                if (!elementHandlers?.size) {
                    observer?.unobserve(element);
                }
            });
        };
    }

    const windowCallbacks = new Set();
    let windowResizeHandler;
    function createWindowResizeHandler() {
        windowResizeHandler = () => {
            const info = {
                get width() {
                    return window.innerWidth;
                },
                get height() {
                    return window.innerHeight;
                },
            };
            windowCallbacks.forEach((callback) => callback(info));
        };
        window.addEventListener("resize", windowResizeHandler);
    }
    function resizeWindow(callback) {
        windowCallbacks.add(callback);
        if (!windowResizeHandler)
            createWindowResizeHandler();
        return () => {
            windowCallbacks.delete(callback);
            if (!windowCallbacks.size &&
                typeof windowResizeHandler === "function") {
                window.removeEventListener("resize", windowResizeHandler);
                windowResizeHandler = undefined;
            }
        };
    }

    function resize(a, b) {
        return addToScope(typeof a === "function" ? resizeWindow(a) : resizeElement(a, b));
    }

    const distance = (a, b) => Math.abs(a - b);
    function distance2D(a, b) {
        // Multi-dimensional
        const xDelta = distance(a.x, b.x);
        const yDelta = distance(a.y, b.y);
        return Math.sqrt(xDelta ** 2 + yDelta ** 2);
    }

    const overflowStyles = /*#__PURE__*/ new Set(["auto", "scroll"]);
    class PanSession {
        constructor(event, handlers, { transformPagePoint, contextWindow = window, dragSnapToOrigin = false, distanceThreshold = 3, element, } = {}) {
            this.startEvent = null;
            this.lastMoveEvent = null;
            this.lastMoveEventInfo = null;
            /**
             * Raw (untransformed) event info, re-transformed each frame
             * so transformPagePoint sees the current parent matrix.
             */
            this.lastRawMoveEventInfo = null;
            this.handlers = {};
            this.contextWindow = window;
            /**
             * Scroll positions of scrollable ancestors and window.
             */
            this.scrollPositions = new Map();
            this.onElementScroll = (event) => {
                this.handleScroll(event.target);
            };
            this.onWindowScroll = () => {
                this.handleScroll(window);
            };
            this.updatePoint = () => {
                if (!(this.lastMoveEvent && this.lastMoveEventInfo))
                    return;
                this.hasPendingMove = false;
                // Re-transform raw point through current transformPagePoint so
                // animated parent transforms (e.g. rotation) are picked up each frame
                if (this.lastRawMoveEventInfo) {
                    this.lastMoveEventInfo = transformPoint(this.lastRawMoveEventInfo, this.transformPagePoint);
                }
                const info = getPanInfo(this.lastMoveEventInfo, this.history);
                const isPanStarted = this.startEvent !== null;
                // Only start panning if the offset is larger than 3 pixels. If we make it
                // any larger than this we'll want to reset the pointer history
                // on the first update to avoid visual snapping to the cursor.
                const isDistancePastThreshold = distance2D(info.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
                if (!isPanStarted && !isDistancePastThreshold)
                    return;
                const { point } = info;
                this.history.push({ ...point, timestamp: time.now() });
                const { onStart, onMove } = this.handlers;
                if (!isPanStarted) {
                    onStart?.(this.lastMoveEvent, info);
                    this.startEvent = this.lastMoveEvent;
                }
                onMove?.(this.lastMoveEvent, info);
            };
            this.handlePointerMove = (event, info) => {
                /**
                 * This event's pageX/pageY already include any window scroll that
                 * hasn't fired its scroll event yet. Settle it now, so that scroll
                 * event doesn't add it to the new point a second time.
                 */
                this.handleScroll(window);
                this.lastMoveEvent = event;
                this.lastRawMoveEventInfo = info;
                this.lastMoveEventInfo = transformPoint(info, this.transformPagePoint);
                this.hasPendingMove = true;
                // Throttle mouse move event to once per frame
                frame.update(this.updatePoint, true);
            };
            this.handlePointerUp = (event, info) => {
                // Browsers flush a coalesced pointermove immediately before
                // pointerup, so the final move can still be waiting for a frame.
                this.hasPendingMove && this.updatePoint();
                this.end();
                const { onEnd, onSessionEnd, resumeAnimation } = this.handlers;
                // Resume animation if dragSnapToOrigin is set OR if no drag started (user just clicked)
                // This ensures constraint animations continue when interrupted by a click
                if (this.dragSnapToOrigin || !this.startEvent) {
                    resumeAnimation?.();
                }
                if (!(this.lastMoveEvent && this.lastMoveEventInfo))
                    return;
                const panInfo = getPanInfo(event.type === "pointercancel"
                    ? this.lastMoveEventInfo
                    : transformPoint(info, this.transformPagePoint), this.history);
                this.startEvent && onEnd?.(event, panInfo);
                onSessionEnd?.(event, panInfo);
            };
            // If we have more than one touch, don't start detecting this gesture
            if (!isPrimaryPointer(event))
                return;
            this.dragSnapToOrigin = dragSnapToOrigin;
            this.handlers = handlers;
            this.transformPagePoint = transformPagePoint;
            this.distanceThreshold = distanceThreshold;
            this.contextWindow = contextWindow || window;
            const info = extractEventInfo(event);
            const initialInfo = transformPoint(info, this.transformPagePoint);
            const { point } = initialInfo;
            /**
             * Stamp the origin with time.now(), not frameData.timestamp: when
             * the frameloop is idle, frameData.timestamp is from the last frame
             * that ran, which can be seconds old, and a fast flick from a
             * standstill would then report near-zero velocity. See #1747.
             */
            this.history = [{ ...point, timestamp: time.now() }];
            const { onSessionStart } = handlers;
            onSessionStart &&
                onSessionStart(event, getPanInfo(initialInfo, this.history));
            // Listen in the capture phase so a descendant calling
            // stopPropagation() (e.g. in its own pointerup handler) can't
            // prevent the gesture from ending. See #2794.
            const eventOptions = { passive: true, capture: true };
            this.removeListeners = pipe(addPointerEvent(this.contextWindow, "pointermove", this.handlePointerMove, eventOptions), addPointerEvent(this.contextWindow, "pointerup", this.handlePointerUp, eventOptions), addPointerEvent(this.contextWindow, "pointercancel", this.handlePointerUp, eventOptions));
            // Start scroll tracking if element provided
            if (element) {
                this.startScrollTracking(element);
            }
        }
        /**
         * Start tracking scroll on ancestors and window.
         */
        startScrollTracking(element) {
            // Store initial scroll positions for scrollable ancestors
            let current = element.parentElement;
            while (current) {
                const style = getComputedStyle(current);
                if (overflowStyles.has(style.overflowX) ||
                    overflowStyles.has(style.overflowY)) {
                    this.scrollPositions.set(current, getScroll(current));
                }
                current = current.parentElement;
            }
            // Track window scroll
            this.scrollPositions.set(window, getScroll(window));
            this.removeScrollListeners = pipe(
            // Capture listener catches element scroll events as they bubble
            addDomEvent(window, "scroll", this.onElementScroll, {
                capture: true,
            }), 
            // Direct window scroll listener (window scroll doesn't bubble)
            addDomEvent(window, "scroll", this.onWindowScroll, {}));
        }
        /**
         * Handle scroll compensation during drag.
         *
         * For element scroll: adjusts history origin since pageX/pageY doesn't change.
         * For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
         */
        handleScroll(target) {
            const initial = this.scrollPositions.get(target);
            if (!initial)
                return;
            const isWindow = target === window;
            const current = getScroll(target);
            const delta = { x: current.x - initial.x, y: current.y - initial.y };
            if (delta.x === 0 && delta.y === 0)
                return;
            if (isWindow) {
                // Window scroll: pageX/pageY changes, so update lastMoveEventInfo
                if (this.lastMoveEventInfo) {
                    this.lastMoveEventInfo.point.x += delta.x;
                    this.lastMoveEventInfo.point.y += delta.y;
                }
            }
            else {
                // Element scroll: pageX/pageY unchanged, so adjust history origin
                if (this.history.length > 0) {
                    this.history[0].x -= delta.x;
                    this.history[0].y -= delta.y;
                }
            }
            this.scrollPositions.set(target, current);
            frame.update(this.updatePoint, true);
        }
        updateHandlers(handlers) {
            this.handlers = handlers;
        }
        end() {
            this.removeListeners?.();
            this.removeScrollListeners?.();
            this.scrollPositions.clear();
            cancelFrame(this.updatePoint);
        }
    }
    const getScroll = (target) => target === window
        ? { x: window.scrollX, y: window.scrollY }
        : {
            x: target.scrollLeft,
            y: target.scrollTop,
        };
    function transformPoint(info, transformPagePoint) {
        return transformPagePoint ? { point: transformPagePoint(info.point) } : info;
    }
    function subtractPoint(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    function getPanInfo({ point }, history) {
        return {
            point,
            delta: subtractPoint(point, lastDevicePoint(history)),
            offset: subtractPoint(point, startDevicePoint(history)),
            velocity: getVelocity(history, 0.1),
        };
    }
    function startDevicePoint(history) {
        return history[0];
    }
    function lastDevicePoint(history) {
        return history[history.length - 1];
    }
    function getVelocity(history, timeDelta) {
        if (history.length < 2) {
            return { x: 0, y: 0 };
        }
        let i = history.length - 1;
        let timestampedPoint = null;
        const lastPoint = lastDevicePoint(history);
        while (i >= 0) {
            timestampedPoint = history[i];
            if (lastPoint.timestamp - timestampedPoint.timestamp >
                secondsToMilliseconds(timeDelta)) {
                break;
            }
            i--;
        }
        if (!timestampedPoint) {
            return { x: 0, y: 0 };
        }
        /**
         * If the selected point is the pointer-down origin (history[0]),
         * there are better movement points available, and the time gap
         * is suspiciously large (>2x timeDelta), use the next point instead.
         * This prevents stale pointer-down points from diluting velocity
         * in hold-then-flick gestures.
         */
        if (timestampedPoint === history[0] &&
            history.length > 2 &&
            lastPoint.timestamp - timestampedPoint.timestamp >
                secondsToMilliseconds(timeDelta) * 2) {
            timestampedPoint = history[1];
        }
        const seconds = millisecondsToSeconds(lastPoint.timestamp - timestampedPoint.timestamp);
        if (seconds === 0) {
            return { x: 0, y: 0 };
        }
        const currentVelocity = {
            x: (lastPoint.x - timestampedPoint.x) / seconds,
            y: (lastPoint.y - timestampedPoint.y) / seconds,
        };
        if (currentVelocity.x === Infinity) {
            currentVelocity.x = 0;
        }
        if (currentVelocity.y === Infinity) {
            currentVelocity.y = 0;
        }
        return currentVelocity;
    }

    const keyboardAccessibleElements = new Set([
        "BUTTON",
        "INPUT",
        "SELECT",
        "TEXTAREA",
        "A",
    ]);
    /**
     * Checks if an element is natively keyboard accessible (focusable).
     * Used by the press gesture to determine if we need to add tabIndex.
     */
    function isElementKeyboardAccessible(element) {
        return (keyboardAccessibleElements.has(element.tagName) ||
            element.isContentEditable === true);
    }
    const textInputElements = new Set(["INPUT", "SELECT", "TEXTAREA"]);
    /**
     * Checks if an element has text selection or direct interaction behavior
     * that should block drag gestures from starting.
     *
     * This specifically targets form controls where the user might want to select
     * text or interact with the control (e.g., sliders, dropdowns).
     *
     * Buttons and links are NOT included because they don't have click-and-move
     * actions of their own - they only respond to click events, so dragging
     * should still work when initiated from these elements.
     */
    function isElementTextInput(element) {
        return (textInputElements.has(element.tagName) ||
            element.isContentEditable === true);
    }

    const isDragging = {
        x: false,
        y: false,
    };
    function isDragActive() {
        return isDragging.x || isDragging.y;
    }

    function setDragLock(axis) {
        if (axis === "x" || axis === "y") {
            if (isDragging[axis]) {
                return null;
            }
            else {
                isDragging[axis] = true;
                return () => {
                    isDragging[axis] = false;
                };
            }
        }
        else {
            if (isDragging.x || isDragging.y) {
                return null;
            }
            else {
                isDragging.x = isDragging.y = true;
                return () => {
                    isDragging.x = isDragging.y = false;
                };
            }
        }
    }

    /**
     * Apply constraints to a point. These constraints are both physical along an
     * axis, and an elastic factor that determines how much to constrain the point
     * by if it does lie outside the defined parameters.
     */
    function applyConstraints(point, { min, max }, elastic) {
        if (min !== undefined && point < min) {
            // If we have a min point defined, and this is outside of that, constrain
            point = elastic
                ? mixNumber$1(min, point, elastic.min)
                : Math.max(point, min);
        }
        else if (max !== undefined && point > max) {
            // If we have a max point defined, and this is outside of that, constrain
            point = elastic
                ? mixNumber$1(max, point, elastic.max)
                : Math.min(point, max);
        }
        return point;
    }
    /**
     * Calculate constraints in terms of the viewport when defined relatively to the
     * measured axis. This is measured from the nearest edge, so a max constraint of 200
     * on an axis with a max value of 300 would return a constraint of 500 - axis length
     */
    function calcRelativeAxisConstraints(axis, min, max) {
        return {
            min: min !== undefined ? axis.min + min : undefined,
            max: max !== undefined
                ? axis.max + max - (axis.max - axis.min)
                : undefined,
        };
    }
    /**
     * Calculate constraints in terms of the viewport when
     * defined relatively to the measured bounding box.
     */
    function calcRelativeConstraints(layoutBox, { top, left, bottom, right }) {
        return {
            x: calcRelativeAxisConstraints(layoutBox.x, left, right),
            y: calcRelativeAxisConstraints(layoutBox.y, top, bottom),
        };
    }
    /**
     * Calculate viewport constraints when defined as another viewport-relative axis
     */
    function calcViewportAxisConstraints(layoutAxis, constraintsAxis) {
        let min = constraintsAxis.min - layoutAxis.min;
        let max = constraintsAxis.max - layoutAxis.max;
        // If the constraints axis is actually smaller than the layout axis then we can
        // flip the constraints
        if (constraintsAxis.max - constraintsAxis.min <
            layoutAxis.max - layoutAxis.min) {
            [min, max] = [max, min];
        }
        return { min, max };
    }
    /**
     * Calculate viewport constraints when defined as another viewport-relative box
     */
    function calcViewportConstraints(layoutBox, constraintsBox) {
        return {
            x: calcViewportAxisConstraints(layoutBox.x, constraintsBox.x),
            y: calcViewportAxisConstraints(layoutBox.y, constraintsBox.y),
        };
    }
    /**
     * Calculate a transform origin relative to the source axis, between 0-1, that results
     * in an aesthetically pleasing scale/transform needed to project from source to target.
     */
    function calcOrigin(source, target) {
        let origin = 0.5;
        const sourceLength = calcLength(source);
        const targetLength = calcLength(target);
        if (targetLength > sourceLength) {
            origin = progress(target.min, target.max - sourceLength, source.min);
        }
        else if (sourceLength > targetLength) {
            origin = progress(source.min, source.max - targetLength, target.min);
        }
        return clamp(0, 1, origin);
    }
    /**
     * Rebase the calculated viewport constraints relative to the layout.min point.
     */
    function rebaseAxisConstraints(layout, constraints) {
        const relativeConstraints = {};
        if (constraints.min !== undefined) {
            relativeConstraints.min = constraints.min - layout.min;
        }
        if (constraints.max !== undefined) {
            relativeConstraints.max = constraints.max - layout.min;
        }
        return relativeConstraints;
    }
    const defaultElastic = 0.35;
    /**
     * Accepts a dragElastic prop and returns resolved elastic values for each axis.
     */
    function resolveDragElastic(dragElastic = defaultElastic) {
        if (dragElastic === false) {
            dragElastic = 0;
        }
        else if (dragElastic === true) {
            dragElastic = defaultElastic;
        }
        return {
            x: resolveAxisElastic(dragElastic, "left", "right"),
            y: resolveAxisElastic(dragElastic, "top", "bottom"),
        };
    }
    function resolveAxisElastic(dragElastic, minLabel, maxLabel) {
        return {
            min: resolvePointElastic(dragElastic, minLabel),
            max: resolvePointElastic(dragElastic, maxLabel),
        };
    }
    function resolvePointElastic(dragElastic, label) {
        return typeof dragElastic === "number"
            ? dragElastic
            : dragElastic[label] || 0;
    }

    /**
     * Re-read the scroll of the projection's ancestors, and return that of the
     * `layoutScroll` ones as a key that changes when any of them scroll.
     *
     * Clear the cached scroll first so `updateScroll` bypasses its
     * per-animationId cache and re-reads the live value.
     */
    function measureScroll(projection) {
        let key = "";
        for (const node of projection.path) {
            node.scroll = undefined;
            node.updateScroll();
            const { scroll } = node;
            if (node !== projection.root && scroll) {
                key += scroll.offset.x + "," + scroll.offset.y + ",";
            }
        }
        return key;
    }
    const elementDragControls = new WeakMap();
    class VisualElementDragControls {
        constructor(visualElement, readProps = () => visualElement.getProps()) {
            this.openDragLock = null;
            this.isDragging = false;
            this.currentDirection = null;
            this.originPoint = { x: 0, y: 0 };
            /**
             * The permitted boundaries of travel, in pixels.
             */
            this.constraints = false;
            this.hasMutatedConstraints = false;
            /**
             * The per-axis resolved elastic values.
             */
            this.elastic = createBox();
            /**
             * The latest pointer event. Used as fallback when the `cancel` and `stop` functions are called without arguments.
             */
            this.latestPointerEvent = null;
            /**
             * The latest pan info. Used as fallback when the `cancel` and `stop` functions are called without arguments.
             */
            this.latestPanInfo = null;
            this.visualElement = visualElement;
            this.readProps = readProps;
        }
        start(originEvent, { snapToCursor = false, distanceThreshold } = {}) {
            /**
             * Don't start dragging if this component is exiting
             */
            if (this.visualElement.presenceContext?.isPresent === false)
                return;
            const onSessionStart = (event) => {
                if (snapToCursor)
                    this.snapToCursor(event);
                this.stopAnimation();
            };
            const onStart = (event, info) => {
                // Attempt to grab the global drag gesture lock - maybe make this part of PanSession
                const { drag, dragConstraints, dragPropagation, onDragStart } = this.getProps();
                if (drag && !dragPropagation) {
                    this.openDragLock?.();
                    this.openDragLock = setDragLock(drag);
                    // If we don 't have the lock, don't start dragging
                    if (!this.openDragLock)
                        return;
                }
                this.latestPointerEvent = event;
                this.latestPanInfo = info;
                this.isDragging = true;
                this.currentDirection = null;
                this.resolveConstraints();
                const { projection } = this.visualElement;
                if (projection) {
                    projection.isAnimationBlocked = true;
                    projection.target = undefined;
                }
                /**
                 * Record gesture origin and pointer offset
                 */
                eachAxis((axis) => {
                    let current = this.getAxisMotionValue(axis).get() || 0;
                    /**
                     * If the MotionValue is a CSS variable, like "var(--y)",
                     * resolve it so it can be converted to px below.
                     */
                    if (isCSSVariableToken(current)) {
                        current =
                            getVariableValue(current, this.visualElement.current) || 0;
                    }
                    /**
                     * If the MotionValue is a px or percentage value convert to px
                     */
                    if (px.test(current)) {
                        current = parseFloat(current);
                    }
                    else if (percent.test(current)) {
                        const measuredAxis = projection?.layout?.layoutBox[axis];
                        if (measuredAxis) {
                            current =
                                calcLength(measuredAxis) *
                                    (parseFloat(current) / 100);
                        }
                    }
                    this.originPoint[axis] = current;
                });
                this.point =
                    typeof dragConstraints === "function" && dragConstraints(this);
                // Fire onDragStart event
                if (onDragStart) {
                    frame.update(() => onDragStart(event, info), false, true);
                }
                addValueToWillChange(this.visualElement, "transform");
                this.visualElement.animationState?.setActive("whileDrag", true);
            };
            const onMove = (event, info) => {
                this.latestPointerEvent = event;
                this.latestPanInfo = info;
                const { dragPropagation, dragDirectionLock, onDirectionLock, onDrag, } = this.getProps();
                // If we didn't successfully receive the gesture lock, early return.
                if (!dragPropagation && !this.openDragLock)
                    return;
                const { offset } = info;
                // Attempt to detect drag direction if directionLock is true
                if (dragDirectionLock && this.currentDirection === null) {
                    this.currentDirection = getCurrentDirection(offset);
                    /**
                     * Wait for more movement until a direction is set. Once
                     * it is, apply this move too: it can be the last before
                     * release when the browser coalesces a fast gesture.
                     */
                    if (this.currentDirection === null)
                        return;
                    onDirectionLock && onDirectionLock(this.currentDirection);
                }
                // Update each point with the latest position
                this.updateAxis("x", offset);
                this.updateAxis("y", offset);
                this.point && this.point.move();
                /**
                 * Ideally we would leave the renderer to fire naturally at the end of
                 * this frame but if the element is about to change layout as the result
                 * of a re-render we want to ensure the browser can read the latest
                 * bounding box to ensure the pointer and element don't fall out of sync.
                 */
                this.visualElement.render();
                /**
                 * This must fire after the render call as it might trigger a state
                 * change which itself might trigger a layout update.
                 */
                if (onDrag) {
                    frame.update(() => onDrag(event, info), false, true);
                }
            };
            const onSessionEnd = (event, info) => {
                this.latestPointerEvent = event;
                this.latestPanInfo = info;
                this.stop(event, info);
                this.latestPointerEvent = null;
                this.latestPanInfo = null;
            };
            const resumeAnimation = () => {
                const { dragSnapToOrigin: snap } = this.getProps();
                if (snap || this.constraints || this.point) {
                    this.startAnimation({ x: 0, y: 0 });
                }
            };
            const { dragSnapToOrigin } = this.getProps();
            this.panSession = new PanSession(originEvent, {
                onSessionStart,
                onStart,
                onMove,
                onSessionEnd,
                resumeAnimation,
            }, {
                transformPagePoint: this.visualElement.getTransformPagePoint(),
                dragSnapToOrigin,
                distanceThreshold,
                contextWindow: this.visualElement.current?.ownerDocument.defaultView,
                element: this.visualElement.current,
            });
        }
        /**
         * @param dragAxes - The axes to animate on release, if not the `drag`
         * prop's, e.g. when drag was disabled mid-gesture.
         */
        stop(event, panInfo, dragAxes) {
            const finalEvent = event || this.latestPointerEvent;
            const finalPanInfo = panInfo || this.latestPanInfo;
            const isDragging = this.isDragging;
            this.cancel();
            if (!isDragging || !finalPanInfo || !finalEvent)
                return;
            const { velocity } = finalPanInfo;
            this.startAnimation(velocity, dragAxes);
            const { onDragEnd } = this.getProps();
            if (onDragEnd) {
                frame.postRender(() => onDragEnd(finalEvent, finalPanInfo));
            }
        }
        cancel() {
            this.isDragging = false;
            const { projection, animationState } = this.visualElement;
            if (projection) {
                projection.isAnimationBlocked = false;
            }
            this.endPanSession();
            if (!this.getProps().dragPropagation && this.openDragLock) {
                this.openDragLock();
                this.openDragLock = null;
            }
            animationState?.setActive("whileDrag", false);
        }
        /**
         * Clean up the pan session without modifying other drag state.
         * This is used during unmount to ensure event listeners are removed
         * without affecting projection animations or drag locks.
         */
        endPanSession() {
            this.panSession?.end();
            this.panSession = undefined;
        }
        updateAxis(axis, offset) {
            /**
             * Read drag per axis: a callback fired while updating the x axis
             * can synchronously re-render with new props.
             */
            const { drag } = this.readProps();
            // If we're not dragging this axis, do an early return.
            if (!offset || !shouldDrag(axis, drag, this.currentDirection))
                return;
            const axisValue = this.getAxisMotionValue(axis);
            let next = this.originPoint[axis] + offset[axis];
            // Apply constraints
            const constraints = this.constraints && this.constraints[axis];
            if (constraints) {
                next = applyConstraints(next, constraints, this.elastic[axis]);
            }
            this.point ? (this.point[axis] = next) : axisValue.set(next);
        }
        resolveConstraints() {
            const { dragConstraints, dragElastic } = this.getProps();
            const { projection } = this.visualElement;
            const layout = projection && (projection.layout || projection.measure(false));
            const prevConstraints = this.constraints;
            if (isElementConstraints(dragConstraints)) {
                /**
                 * Ref constraints are measured with the layout. Scrolling a
                 * `layoutScroll` ancestor since can move the element relative
                 * to them without a layout measurement, so measure them again
                 * (#2024). Otherwise keep them: they and the layout can both
                 * have moved on the page since, e.g. when content above grows.
                 */
                if (!this.constraints ||
                    this.scroll !== measureScroll(projection)) {
                    this.constraints = this.resolveRefConstraints();
                }
            }
            else {
                if (dragConstraints &&
                    layout &&
                    typeof dragConstraints === "object") {
                    this.constraints = calcRelativeConstraints(layout.layoutBox, dragConstraints);
                }
                else {
                    this.constraints = false;
                }
            }
            this.elastic = resolveDragElastic(dragElastic);
            /**
             * If we're outputting to external MotionValues, we want to rebase the measured constraints
             * from viewport-relative to component-relative. This only applies to relative (non-ref)
             * constraints, as ref-based constraints from calcViewportConstraints are already in the
             * correct coordinate space for the motion value transform offset.
             */
            if (prevConstraints !== this.constraints &&
                !isElementConstraints(dragConstraints) &&
                layout &&
                this.constraints &&
                !this.hasMutatedConstraints) {
                eachAxis((axis) => {
                    if (this.constraints !== false &&
                        this.getAxisMotionValue(axis)) {
                        this.constraints[axis] = rebaseAxisConstraints(layout.layoutBox[axis], this.constraints[axis]);
                    }
                });
            }
        }
        resolveRefConstraints() {
            const { dragConstraints: constraints, onMeasureDragConstraints } = this.getProps();
            if (!isElementConstraints(constraints))
                return false;
            const constraintsElement = resolveConstraintsElement(constraints);
            exports.invariant(!!constraintsElement, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
            const { projection } = this.visualElement;
            // TODO
            if (!projection || !projection.layout)
                return false;
            /**
             * Refresh the scroll offsets of the root and `layoutScroll`
             * ancestors so the constraint's viewport box translates to the
             * layout's coordinates. The scroll captured when the layout was
             * measured can be stale if they've scrolled since — e.g. via the
             * browser restoring scroll on refresh, or an ancestor layout effect
             * running after this element's mount (#2829).
             */
            this.scroll = measureScroll(projection);
            const constraintsBox = measurePageBox(constraintsElement, projection.root, this.visualElement.getTransformPagePoint());
            /**
             * layoutBox removes the scroll of `layoutScroll` ancestors, so
             * remove it from the constraints box too.
             */
            let measuredConstraints = calcViewportConstraints(projection.layout.layoutBox, projection.removeElementScroll(constraintsBox));
            /**
             * If there's an onMeasureDragConstraints listener we call it and
             * if different constraints are returned, set constraints to that
             */
            if (onMeasureDragConstraints) {
                const userConstraints = onMeasureDragConstraints(convertBoxToBoundingBox(measuredConstraints));
                this.hasMutatedConstraints = !!userConstraints;
                if (userConstraints) {
                    measuredConstraints = convertBoundingBoxToBox(userConstraints);
                }
            }
            return measuredConstraints;
        }
        startAnimation(velocity, dragAxes) {
            const { drag, dragMomentum, dragElastic, dragTransition, dragSnapToOrigin, onDragTransitionEnd, } = this.getProps();
            /**
             * Overdamp the boundary spring if `dragElastic` is disabled. There's still a frame
             * of spring animations so we should look into adding a disable spring option to `inertia`.
             * We could do something here where we affect the `bounceStiffness` and `bounceDamping`
             * using the value of `dragElastic`.
             */
            const options = {
                bounceStiffness: dragElastic ? 200 : 1000000,
                bounceDamping: dragElastic ? 40 : 10000000,
                timeConstant: 750,
                restDelta: 1,
                restSpeed: 10,
                ...dragTransition,
            };
            const axisVelocity = (axis) => dragMomentum &&
                !(this.point && dragSnapToOrigin) &&
                shouldDrag(axis, dragAxes || drag, this.currentDirection)
                ? velocity[axis]
                : 0;
            if (this.point && !dragSnapToOrigin) {
                return this.point
                    .release({ x: axisVelocity("x"), y: axisVelocity("y") }, options)
                    .then(onDragTransitionEnd);
            }
            const constraints = this.constraints || {};
            const momentumAnimations = eachAxis((axis) => {
                if (!shouldDrag(axis, dragAxes || drag, this.currentDirection)) {
                    return;
                }
                let transition = constraints[axis] || {};
                if (dragSnapToOrigin === true ||
                    dragSnapToOrigin === axis)
                    transition = { min: 0, max: 0 };
                const inertia = {
                    type: "inertia",
                    velocity: axisVelocity(axis),
                    ...options,
                    ...transition,
                };
                // If we're not animating on an externally-provided `MotionValue` we can use the
                // component's animation controls which will handle interactions with whileHover (etc),
                // otherwise we just have to animate the `MotionValue` itself.
                return this.startAxisValueAnimation(axis, inertia);
            });
            // Run all animations and then resolve the new drag constraints.
            return Promise.all(momentumAnimations).then(onDragTransitionEnd);
        }
        startAxisValueAnimation(axis, transition) {
            const axisValue = this.getAxisMotionValue(axis);
            addValueToWillChange(this.visualElement, axis);
            return axisValue.start(animateMotionValue(axis, axisValue, 0, transition, this.visualElement, false));
        }
        stopAnimation() {
            eachAxis((axis) => this.getAxisMotionValue(axis).stop());
        }
        /**
         * Drag works differently depending on which props are provided.
         *
         * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
         * - Otherwise, we apply the delta to the x/y motion values.
         */
        getAxisMotionValue(axis) {
            const dragKey = `_drag${axis.toUpperCase()}`;
            const props = this.readProps();
            const externalMotionValue = props[dragKey];
            return externalMotionValue
                ? externalMotionValue
                : this.visualElement.getValue(axis, this.visualElement.latestValues[axis] ?? 0);
        }
        /**
         * Measure the live box - projection.layout may or may not include the
         * drag transform, depending on when it was measured.
         */
        snapToCursor({ clientX, clientY }) {
            const { drag } = this.getProps();
            const point = { x: clientX, y: clientY };
            const cursor = this.visualElement.getTransformPagePoint()?.(point) || point;
            const box = this.visualElement.measureViewportBox();
            eachAxis((axis) => {
                if (!shouldDrag(axis, drag, this.currentDirection))
                    return;
                const axisValue = this.getAxisMotionValue(axis);
                const { min, max } = box[axis];
                axisValue.set((axisValue.get() || 0) + cursor[axis] - mixNumber$1(min, max, 0.5));
            });
        }
        /**
         * When the viewport resizes we want to check if the measured constraints
         * have changed and, if so, reposition the element within those new constraints
         * relative to where it was before the resize.
         */
        scalePositionWithinConstraints() {
            if (!this.visualElement.current)
                return;
            const { drag, dragConstraints } = this.getProps();
            const { projection } = this.visualElement;
            if (!isElementConstraints(dragConstraints) ||
                !projection ||
                !this.constraints)
                return;
            /**
             * Stop current animations as there can be visual glitching if we try to do
             * this mid-animation
             */
            this.stopAnimation();
            /**
             * Record the relative position of the dragged element relative to the
             * constraints box and save as a progress value.
             */
            const constraints = this.constraints;
            const boxProgress = { x: 0, y: 0 };
            eachAxis((axis) => {
                const latest = this.getAxisMotionValue(axis).get();
                boxProgress[axis] = calcOrigin({ min: latest, max: latest }, constraints[axis]);
            });
            /**
             * Update the layout of this element and resolve the latest drag constraints
             */
            const { transformTemplate } = this.visualElement.getProps();
            this.visualElement.current.style.transform = transformTemplate
                ? transformTemplate({}, "")
                : "none";
            projection.root?.updateScroll();
            projection.updateLayout();
            /**
             * Reset constraints so resolveConstraints() will recalculate them
             * with the freshly measured layout rather than returning the cached value.
             */
            this.constraints = false;
            this.resolveConstraints();
            /**
             * For each axis, calculate the current progress of the layout axis
             * within the new constraints.
             */
            eachAxis((axis) => {
                const axisValue = this.getAxisMotionValue(axis);
                /**
                 * An element resting at its origin has no offset to preserve,
                 * and re-projecting 0 into the new constraints would move it.
                 */
                if (!shouldDrag(axis, drag, null) || !axisValue.get())
                    return;
                /**
                 * Calculate a new transform based on the previous box progress
                 */
                const { min, max } = this.constraints[axis];
                axisValue.set(mixNumber$1(min, max, boxProgress[axis]));
            });
            /**
             * Flush the updated transform to the DOM synchronously to prevent
             * a visual flash at the element's CSS layout position (0,0) when
             * the transform was stripped for measurement.
             */
            this.visualElement.render();
        }
        addListeners() {
            if (!this.visualElement.current)
                return;
            elementDragControls.set(this.visualElement, this);
            const element = this.visualElement.current;
            /**
             * Attach a pointerdown event listener on this DOM element to initiate drag tracking.
             */
            const stopPointerListener = addPointerEvent(element, "pointerdown", (event) => {
                const { drag, dragListener = true } = this.getProps();
                const target = event.target;
                /**
                 * Only block drag if clicking on a text input child element
                 * (input, textarea, select, contenteditable) where users might
                 * want to select text or interact with the control.
                 *
                 * Buttons and links don't block drag since they don't have
                 * click-and-move actions of their own.
                 */
                const isClickingTextInputChild = target !== element && isElementTextInput(target);
                if (drag && dragListener && !isClickingTextInputChild) {
                    this.start(event);
                }
            });
            /**
             * If using ref-based constraints, observe both the draggable element
             * and the constraint container for size changes via ResizeObserver.
             * Setup is deferred because dragConstraints.current is null when
             * addListeners first runs (React hasn't committed the ref yet).
             */
            let stopResizeObservers;
            const measureDragConstraints = () => {
                const { dragConstraints } = this.getProps();
                const constraintsElement = isElementConstraints(dragConstraints) &&
                    resolveConstraintsElement(dragConstraints);
                if (constraintsElement) {
                    this.constraints = this.resolveRefConstraints();
                    if (!stopResizeObservers) {
                        stopResizeObservers = startResizeObservers(element, constraintsElement, () => this.scalePositionWithinConstraints());
                    }
                }
            };
            const { projection } = this.visualElement;
            const stopMeasureLayoutListener = projection.addEventListener("measure", measureDragConstraints);
            if (!projection.layout) {
                projection.root?.updateScroll();
                projection.updateLayout();
            }
            frame.read(measureDragConstraints);
            /**
             * Attach a window resize listener to scale the draggable target within its defined
             * constraints as the window resizes.
             */
            const stopResizeListener = addDomEvent(window, "resize", () => this.scalePositionWithinConstraints());
            /**
             * If the element's layout changes, calculate the delta and apply that to
             * the drag gesture's origin point.
             */
            const stopLayoutUpdateListener = projection.addEventListener("didUpdate", (({ delta, hasLayoutChanged }) => {
                if (this.isDragging && hasLayoutChanged) {
                    eachAxis((axis) => {
                        /**
                         * Only compensate axes this gesture drags. A
                         * non-drag axis follows its layout instead, as
                         * nothing would ever move it back (e.g. snapping
                         * to origin only animates drag axes).
                         */
                        if (!shouldDrag(axis, this.getProps().drag, this.currentDirection))
                            return;
                        const motionValue = this.getAxisMotionValue(axis);
                        this.originPoint[axis] += delta[axis].translate;
                        motionValue.set(motionValue.get() + delta[axis].translate);
                    });
                    this.visualElement.render();
                }
            }));
            return () => {
                stopResizeListener();
                stopPointerListener();
                stopMeasureLayoutListener();
                stopLayoutUpdateListener();
                stopResizeObservers?.();
            };
        }
        getProps() {
            const props = this.readProps();
            const { dragElastic = defaultElastic, dragMomentum = true } = props;
            return { ...props, dragElastic, dragMomentum };
        }
    }
    /**
     * `dragConstraints` can be an element, or a ref (`{ current }`) to one.
     */
    function isElementConstraints(constraints) {
        return (!!constraints &&
            typeof constraints === "object" &&
            ("current" in constraints || "nodeType" in constraints));
    }
    const resolveConstraintsElement = (constraints) => "current" in constraints ? constraints.current : constraints;
    function skipFirstCall(callback) {
        let isFirst = true;
        return () => {
            if (isFirst) {
                isFirst = false;
                return;
            }
            callback();
        };
    }
    function startResizeObservers(element, constraintsElement, onResize) {
        const stopElement = resize(element, skipFirstCall(onResize));
        const stopContainer = resize(constraintsElement, skipFirstCall(onResize));
        return () => {
            stopElement();
            stopContainer();
        };
    }
    function shouldDrag(direction, drag, currentDirection) {
        return ((drag === true || drag === direction) &&
            (currentDirection === null || currentDirection === direction));
    }
    /**
     * Based on an x/y offset determine the current drag direction. If both axis' offsets are lower
     * than the provided threshold, return `null`.
     *
     * @param offset - The x/y offset from origin.
     * @param lockThreshold - (Optional) - the minimum absolute offset before we can determine a drag direction.
     */
    function getCurrentDirection(offset, lockThreshold = 10) {
        let direction = null;
        if (Math.abs(offset.y) > lockThreshold) {
            direction = "y";
        }
        else if (Math.abs(offset.x) > lockThreshold) {
            direction = "x";
        }
        return direction;
    }
    function expectsResolvedDragConstraints({ dragConstraints, onMeasureDragConstraints, }) {
        return isElementConstraints(dragConstraints) && !!onMeasureDragConstraints;
    }

    const toProps = ({ axis, constraints, elastic, momentum, transition, snapToOrigin, directionLock, propagation, onStart, onMove, onEnd, onDirectionLock, onTransitionEnd, onMeasureConstraints, }) => ({
        drag: axis || true,
        dragConstraints: constraints,
        dragElastic: elastic,
        dragMomentum: momentum,
        dragTransition: transition,
        dragSnapToOrigin: snapToOrigin,
        dragDirectionLock: directionLock,
        dragPropagation: propagation,
        onDragStart: onStart,
        onDrag: onMove,
        onDragEnd: onEnd,
        onDirectionLock,
        onDragTransitionEnd: onTransitionEnd,
        onMeasureDragConstraints: onMeasureConstraints,
    });
    const dragStyles = [
        "user-select",
        "-webkit-user-select",
        "-webkit-touch-callout",
        "touch-action",
    ];
    /**
     * Apply the styles React's drag prop applies, so touch input drags
     * instead of panning the page, and text selection and native drag (ghost
     * image) don't interrupt the gesture. Returns a function that restores
     * the element's previous values.
     */
    function applyDragStyles(element, axis) {
        const { style } = element;
        const draggable = element.getAttribute("draggable");
        const prev = dragStyles.map((key) => style.getPropertyValue(key));
        const touchAction = axis ? "pan-" + (axis === "x" ? "y" : "x") : "none";
        dragStyles.forEach((key, i) => style.setProperty(key, i < 3 ? "none" : touchAction));
        element.setAttribute("draggable", "false");
        return () => {
            dragStyles.forEach((key, i) => style.setProperty(key, prev[i]));
            draggable === null
                ? element.removeAttribute("draggable")
                : element.setAttribute("draggable", draggable);
        };
    }
    /**
     * Make elements draggable. Returns a function that removes the gesture.
     *
     * ```javascript
     * const stop = drag("#box", { axis: "x", constraints: { left: 0, right: 300 } })
     * ```
     *
     * The element's `x` and `y` are motion values shared with `animate()`
     * and `animateLayout()`, so these can animate the element after a drag.
     *
     * @public
     */
    function drag(elementOrSelector, options = {}) {
        const props = toProps(options);
        const scope = activeScope.current;
        /**
         * Run callbacks in the active scope, so work they start is collected.
         */
        if (scope) {
            for (const key in props) {
                const value = props[key];
                if (typeof value === "function") {
                    props[key] = scope.bind(value);
                }
            }
        }
        const cleanups = resolveElements(elementOrSelector).map((element) => {
            scope?.track(element);
            const [node, release] = acquireDragNode(element);
            /**
             * Measure layout even when not animating it, as constraints and
             * layout-shift correction are computed from it.
             */
            node.setOptions({ alwaysMeasureLayout: true });
            const controls = new VisualElementDragControls(visualElementStore.get(element), () => props);
            const removeListeners = controls.addListeners();
            const removeStyles = applyDragStyles(element, options.axis);
            return () => {
                removeStyles();
                removeListeners?.();
                controls.cancel();
                controls.stopAnimation();
                release();
            };
        });
        return addToScope(() => cleanups.forEach((cleanup) => cleanup()));
    }

    function setupGesture(elementOrSelector, options) {
        const elements = resolveElements(elementOrSelector);
        const gestureAbortController = new AbortController();
        const eventOptions = {
            passive: true,
            ...options,
            signal: gestureAbortController.signal,
        };
        const cancel = addToScope(() => gestureAbortController.abort());
        return [elements, eventOptions, cancel];
    }

    function isValidHover(event) {
        return !(event.pointerType === "touch" || isDragActive());
    }
    /**
     * Create a hover gesture. hover() is different to .addEventListener("pointerenter")
     * in that it has an easier syntax, filters out polyfilled touch events, interoperates
     * with drag gestures, and automatically removes the "pointerleave" event listener when the hover ends.
     *
     * @public
     */
    function hover(elementOrSelector, onHoverStart, options = {}) {
        onHoverStart = bindToScope(onHoverStart);
        const [elements, eventOptions, cancel] = setupGesture(elementOrSelector, options);
        elements.forEach((element) => {
            let isPressed = false;
            let deferredHoverEnd = false;
            let hoverEndCallback;
            const removePointerLeave = () => {
                element.removeEventListener("pointerleave", onPointerLeave);
            };
            const endHover = (event) => {
                if (hoverEndCallback) {
                    hoverEndCallback(event);
                    hoverEndCallback = undefined;
                }
                removePointerLeave();
            };
            const onPointerUp = (event) => {
                isPressed = false;
                window.removeEventListener("pointerup", onPointerUp);
                window.removeEventListener("pointercancel", onPointerUp);
                if (deferredHoverEnd) {
                    deferredHoverEnd = false;
                    endHover(event);
                }
            };
            const onPointerDown = () => {
                isPressed = true;
                window.addEventListener("pointerup", onPointerUp, eventOptions);
                window.addEventListener("pointercancel", onPointerUp, eventOptions);
            };
            const onPointerLeave = (leaveEvent) => {
                if (leaveEvent.pointerType === "touch")
                    return;
                if (isPressed) {
                    deferredHoverEnd = true;
                    return;
                }
                endHover(leaveEvent);
            };
            const onPointerEnter = (enterEvent) => {
                if (!isValidHover(enterEvent))
                    return;
                deferredHoverEnd = false;
                const onHoverEnd = onHoverStart(element, enterEvent);
                if (typeof onHoverEnd !== "function")
                    return;
                hoverEndCallback = onHoverEnd;
                element.addEventListener("pointerleave", onPointerLeave, eventOptions);
            };
            element.addEventListener("pointerenter", onPointerEnter, eventOptions);
            element.addEventListener("pointerdown", onPointerDown, eventOptions);
        });
        return cancel;
    }

    /**
     * Recursively traverse up the tree to check whether the provided child node
     * is the parent or a descendant of it.
     *
     * @param parent - Element to find
     * @param child - Element to test against parent
     */
    const isNodeOrChild = (parent, child) => {
        if (!child) {
            return false;
        }
        else if (parent === child) {
            return true;
        }
        else {
            return isNodeOrChild(parent, child.parentElement);
        }
    };

    const isPressing = new WeakSet();

    /**
     * Filter out events that are not "Enter" keys.
     */
    function filterEvents(callback) {
        return (event) => {
            if (event.key !== "Enter")
                return;
            callback(event);
        };
    }
    function firePointerEvent(target, type) {
        target.dispatchEvent(new PointerEvent("pointer" + type, { isPrimary: true, bubbles: true }));
    }
    const enableKeyboardPress = (element, eventOptions) => {
        /**
         * Listeners are scoped to this focus and all released on blur, rather
         * than added per Enter press, so they can't accumulate and fire
         * duplicate pointerup/pointercancel events. See #3935.
         */
        let isKeyPressing = false;
        const handleKeydown = filterEvents(() => {
            if (isPressing.has(element))
                return;
            isKeyPressing = true;
            firePointerEvent(element, "down");
        });
        const handleKeyup = filterEvents(() => {
            if (!isKeyPressing)
                return;
            isKeyPressing = false;
            firePointerEvent(element, "up");
        });
        element.addEventListener("keydown", handleKeydown, eventOptions);
        element.addEventListener("keyup", handleKeyup, eventOptions);
        /**
         * On blur, remove the key listeners and cancel any keyboard press.
         */
        element.addEventListener("blur", () => {
            element.removeEventListener("keydown", handleKeydown);
            element.removeEventListener("keyup", handleKeyup);
            if (isKeyPressing)
                firePointerEvent(element, "cancel");
        }, { ...eventOptions, once: true });
    };

    /**
     * Filter out events that are not primary pointer events, or are triggering
     * while a Motion gesture is active.
     */
    function isValidPressEvent(event) {
        return isPrimaryPointer(event) && !isDragActive();
    }
    const claimedPointerDownEvents = new WeakSet();
    /**
     * Create a press gesture.
     *
     * Press is different to `"pointerdown"`, `"pointerup"` in that it
     * automatically filters out secondary pointer events like right
     * click and multitouch.
     *
     * It also adds accessibility support for keyboards, where
     * an element with a press gesture will receive focus and
     *  trigger on Enter `"keydown"` and `"keyup"` events.
     *
     * This is different to a browser's `"click"` event, which does
     * respond to keyboards but only for the `"click"` itself, rather
     * than the press start and end/cancel. The element also needs
     * to be focusable for this to work, whereas a press gesture will
     * make an element focusable by default.
     *
     * @public
     */
    function press(targetOrSelector, onPressStart, options = {}) {
        onPressStart = bindToScope(onPressStart);
        const [targets, eventOptions, cancelEvents] = setupGesture(targetOrSelector, options);
        const startPress = (startEvent) => {
            const target = startEvent.currentTarget;
            if (!isValidPressEvent(startEvent))
                return;
            if (claimedPointerDownEvents.has(startEvent))
                return;
            isPressing.add(target);
            if (options.stopPropagation) {
                claimedPointerDownEvents.add(startEvent);
            }
            const onPressEnd = onPressStart(target, startEvent);
            /**
             * End listeners run in the capture phase so a descendant calling
             * stopPropagation() in its own pointerup handler can't prevent the
             * press gesture from ending. This also keeps the gesture-end
             * ordering consistent with the drag gesture. See #2794.
             */
            const endEventOptions = { ...eventOptions, capture: true };
            const onPointerEnd = (endEvent, success) => {
                window.removeEventListener("pointerup", onPointerUp, endEventOptions);
                window.removeEventListener("pointercancel", onPointerCancel, endEventOptions);
                if (isPressing.has(target)) {
                    isPressing.delete(target);
                }
                if (!isValidPressEvent(endEvent)) {
                    return;
                }
                if (typeof onPressEnd === "function") {
                    onPressEnd(endEvent, { success });
                }
            };
            const onPointerUp = (upEvent) => {
                onPointerEnd(upEvent, target === window ||
                    target === document ||
                    options.useGlobalTarget ||
                    isNodeOrChild(target, upEvent.target));
            };
            const onPointerCancel = (cancelEvent) => {
                onPointerEnd(cancelEvent, false);
            };
            window.addEventListener("pointerup", onPointerUp, endEventOptions);
            window.addEventListener("pointercancel", onPointerCancel, endEventOptions);
        };
        targets.forEach((target) => {
            const pointerDownTarget = options.useGlobalTarget ? window : target;
            pointerDownTarget.addEventListener("pointerdown", startPress, eventOptions);
            if (isHTMLElement(target)) {
                target.addEventListener("focus", () => enableKeyboardPress(target, eventOptions), eventOptions);
                if (!isElementKeyboardAccessible(target) &&
                    !target.hasAttribute("tabindex")) {
                    target.tabIndex = 0;
                }
            }
        });
        return cancelEvents;
    }

    function getComputedStyle$1(element, name) {
        const computedStyle = window.getComputedStyle(element);
        return isCSSVar(name)
            ? computedStyle.getPropertyValue(name)
            : computedStyle[name];
    }

    const keywords = {
        reducedMotion: "(prefers-reduced-motion: reduce)",
        motion: "(prefers-reduced-motion: no-preference)",
        dark: "(prefers-color-scheme: dark)",
        light: "(prefers-color-scheme: light)",
        hover: "(hover: hover) and (pointer: fine)",
        touch: "(pointer: coarse)",
        portrait: "(orientation: portrait)",
        landscape: "(orientation: landscape)",
    };
    /**
     * Turn a condition into a media query. Full media queries pass through
     * unchanged. Otherwise each space-separated token must match:
     *
     * - A width comparison: `">=800"`, `"<1200px"`, `"> 40em"`
     * - A keyword: `reducedMotion`, `motion`, `dark`, `light`, `hover`,
     *   `touch`, `portrait`, `landscape`
     *
     * Prefix a token with `!` to negate it, for instance `">=800 !touch"`.
     */
    function toMediaQuery(condition) {
        if (condition.includes("("))
            return condition;
        return condition
            .replace(/([<>!]=?)\s+/g, "$1")
            .trim()
            .split(/\s+/)
            .map((token) => {
            const isNot = token[0] === "!";
            if (isNot)
                token = token.slice(1);
            const width = /^([<>]=?)([\d.]+)([a-z]*)$/.exec(token);
            const query = width
                ? `(width ${width[1]} ${width[2]}${width[3] || "px"})`
                : keywords[token] || token;
            return isNot ? `(not (${query}))` : query;
        })
            .join(" and ");
    }

    function scopeMotion(...args) {
        const root = typeof args[0] === "function" ? undefined : args.shift();
        const [setup, options = {}] = args;
        const { transition, matchMedia } = options;
        const queries = [];
        const styles = new Map();
        let cleanups = [];
        let isPending = false;
        const active = {
            root: resolveElements(root)[0],
            transition,
            add(cleanup) {
                cleanups.push(cleanup);
                return () => removeItem(cleanups, cleanup);
            },
            bind: (callback) => ((...args) => {
                const result = scope.run(() => callback(...args));
                return typeof result === "function"
                    ? active.bind(result)
                    : result;
            }),
            track(element) {
                styles.has(element) ||
                    styles.set(element, element.getAttribute("style"));
            },
        };
        const clear = (restore) => {
            const current = cleanups;
            cleanups = [];
            for (let i = current.length - 1; i >= 0; i--)
                current[i]();
            restore &&
                styles.forEach((style, element) => {
                    releaseElement(element);
                    style === null
                        ? element.removeAttribute("style")
                        : element.setAttribute("style", style);
                });
            styles.clear();
        };
        const start = () => {
            scope.state = "active";
            let matches = !queries.length;
            scope.media = {};
            for (const [name, query] of queries) {
                matches = (scope.media[name] = query.matches) || matches;
            }
            if (matches && setup) {
                const cleanup = scope.run(() => setup(scope));
                typeof cleanup === "function" && active.add(cleanup);
            }
        };
        const onChange = () => {
            if (isPending)
                return;
            isPending = true;
            /**
             * Several conditions can change together, for instance two
             * breakpoints crossed by one resize. Refresh once.
             */
            queueMicrotask(() => {
                isPending = false;
                queries.length && scope.refresh();
            });
        };
        const kill = (restore) => {
            scope.state = restore ? "cancelled" : "stopped";
            for (const [, query] of queries) {
                query.removeEventListener("change", onChange);
            }
            queries.length = 0;
            clear(restore);
        };
        const runIn = (target, callback) => {
            const prev = activeScope.current;
            activeScope.current = target;
            try {
                return callback();
            }
            finally {
                activeScope.current = prev;
            }
        };
        const scope = {
            state: "active",
            media: {},
            run: (callback) => runIn(active, callback),
            ignore: (callback) => runIn(undefined, callback),
            bind: active.bind,
            stop: () => kill(),
            cancel: () => kill(true),
            refresh() {
                clear(true);
                start();
            },
        };
        if (matchMedia && typeof window !== "undefined") {
            const conditions = typeof matchMedia === "string"
                ? { matches: matchMedia }
                : matchMedia;
            for (const name in conditions) {
                const query = window.matchMedia(toMediaQuery(conditions[name]));
                query.addEventListener("change", onChange);
                queries.push([name, query]);
            }
        }
        /**
         * A scope created inside another is cancelled with it.
         */
        addToScope(scope.cancel);
        start();
        return scope;
    }

    /**
     * The metrics projection counts, in the order of the index it passes to
     * statsBuffer.countProjection.
     */
    const projectionMetrics = [
        "nodes",
        "calculatedTargetDeltas",
        "calculatedProjections",
    ];
    function clearStatsBuffer() {
        statsBuffer.value = null;
        statsBuffer.addProjectionMetrics = null;
        statsBuffer.countProjection = undefined;
    }
    function recordStats() {
        if (statsBuffer.value) {
            clearStatsBuffer();
            throw new Error("Stats are already being measured");
        }
        const buffer = statsBuffer;
        buffer.value = {
            layoutProjection: {
                nodes: [],
                calculatedTargetDeltas: [],
                calculatedProjections: [],
            },
        };
        buffer.addProjectionMetrics = (metrics) => {
            const { layoutProjection } = buffer.value;
            layoutProjection.nodes.push(metrics.nodes);
            layoutProjection.calculatedTargetDeltas.push(metrics.calculatedTargetDeltas);
            layoutProjection.calculatedProjections.push(metrics.calculatedProjections);
        };
        /**
         * Counting lives here rather than in projection, so bundles that never
         * call recordStats() don't ship it.
         */
        const metrics = {
            nodes: 0,
            calculatedTargetDeltas: 0,
            calculatedProjections: 0,
        };
        buffer.countProjection = (metric) => {
            if (metric !== undefined) {
                metrics[projectionMetrics[metric]]++;
            }
            else {
                buffer.addProjectionMetrics(metrics);
                metrics.nodes =
                    metrics.calculatedTargetDeltas =
                        metrics.calculatedProjections =
                            0;
            }
        };
    }

    function getOriginIndex(from, total) {
        if (from === "first") {
            return 0;
        }
        else {
            const lastIndex = total - 1;
            return from === "last" ? lastIndex : lastIndex / 2;
        }
    }
    function stagger(duration = 0.1, { startDelay = 0, from = 0, ease, grid } = {}) {
        /**
         * Distances from the origin for each element count. The final entry
         * holds the distance used to normalise easing.
         */
        const cache = {};
        return (i, total) => {
            let distances = cache[total];
            if (!distances) {
                const [columns, rows] = grid || [Infinity, 1];
                const lastX = Math.min(columns, total) - 1;
                const lastY = Math.max(rows, Math.ceil(total / columns)) - 1;
                const isIndex = typeof from === "number";
                const scale = from === "first" ? 0 : from === "last" ? 1 : 0.5;
                const originX = isIndex ? from % columns : lastX * scale;
                const originY = isIndex ? Math.floor(from / columns) : lastY * scale;
                distances = cache[total] = [];
                for (let j = 0; j < total; j++) {
                    const x = j % columns;
                    const y = Math.floor(j / columns);
                    const edgeX = Math.min(x, lastX - x);
                    const edgeY = Math.min(y, lastY - y);
                    if (from === "random") {
                        // Inside-out shuffle, so each element gets a distinct step
                        const k = (Math.random() * (j + 1)) | 0;
                        distances[j] = distances[k];
                        distances[k] = j;
                    }
                    else {
                        distances[j] =
                            from === "edges"
                                ? Math.min(lastX ? edgeX : edgeY, lastY ? edgeY : edgeX)
                                : Math.hypot(x - originX, y - originY);
                    }
                }
                distances.push(grid ? Math.max(...distances) : total);
            }
            let delay = duration * distances[i];
            const maxDelay = duration * distances[total];
            if (ease && maxDelay) {
                const easingFunction = easingDefinitionToFunction(ease);
                delay = easingFunction(delay / maxDelay) * maxDelay;
            }
            return startDelay + delay;
        };
    }

    function transform(...args) {
        const useImmediate = !Array.isArray(args[0]);
        const argOffset = useImmediate ? 0 : -1;
        const inputValue = args[0 + argOffset];
        const inputRange = args[1 + argOffset];
        const outputRange = args[2 + argOffset];
        const options = args[3 + argOffset];
        const interpolator = interpolate(inputRange, outputRange, options);
        return useImmediate ? interpolator(inputValue) : interpolator;
    }

    /**
     * Every running follower ticks from this one frame callback.
     */
    const active = new Set();
    const tickAll = ({ timestamp }) => {
        active.forEach((animation) => animation.tick(timestamp));
    };
    /**
     * A lean animation for values that follow a target (`followValue`,
     * `springValue`): a single numeric generator, retargeted in place as
     * the target moves and ticked from a frame callback shared by every
     * follower. Only implements the controls `MotionValue.animation`
     * exposes. Repeat options are ignored: a follower only ever heads for
     * its latest target.
     */
    class FollowAnimation extends WithPromise {
        constructor(options) {
            super();
            this.state = "idle";
            this.startTime = 0;
            this.currentTime = 0;
            /**
             * Whether the first tick has fired `onPlay`.
             */
            this.started = false;
            /**
             * A target set since the last tick, applied at the next one so any
             * number of sets per frame cost one retarget.
             */
            this.hasNextTarget = false;
            this.nextTarget = 0;
            /**
             * Bound to the instance so `animation.stop` can be passed around.
             */
            this.stop = () => {
                if (this.state === "idle")
                    return;
                this.teardown();
                this.options.onStop?.();
            };
            this.options = options;
            this.factory = options.type;
            this.generator = this.factory(options);
            const { driver } = options;
            if (driver)
                this.driver = driver((timestamp) => this.tick(timestamp));
            this.startTime = this.now();
            this.state = "running";
            if (this.driver) {
                this.driver.start();
            }
            else {
                active.size || frame.update(tickAll, true);
                active.add(this);
            }
        }
        /**
         * Aim at a new target from wherever the animation has reached by the
         * next tick. `velocity` fixes the velocity to steer with, otherwise
         * the generator's is used.
         */
        setTarget(target, velocity) {
            this.nextTarget = target;
            this.nextVelocity = velocity;
            this.hasNextTarget = true;
        }
        /**
         * Steer towards new keyframes from the current position and velocity.
         * Springs are updated in place; other generators are recreated.
         */
        retarget(keyframes, velocity) {
            const { options, generator } = this;
            options.keyframes = keyframes;
            options.velocity = velocity;
            this.startTime = this.now();
            this.currentTime = 0;
            if (generator.retarget) {
                generator.retarget(keyframes, velocity);
            }
            else {
                this.generator = this.factory(options);
            }
        }
        tick(timestamp) {
            const { options, hasNextTarget: retargeted } = this;
            const { delay = 0, onUpdate, onPlay } = options;
            // Retargets happen on a tick, so only the first start can lag
            if (!this.started) {
                this.startTime = resolveStartTime(this.startTime, timestamp);
            }
            const elapsed = Math.round(timestamp - this.startTime) - delay;
            const t = (this.currentTime = Math.max(0, elapsed));
            const state = this.generator.next(t);
            // Hold the origin through the delay, even if the generator is already at rest
            const value = elapsed < 0 ? options.keyframes[0] : state.value;
            if (retargeted) {
                /**
                 * Steer from where the current trajectory has reached this
                 * frame, then render that position as the new origin.
                 */
                this.hasNextTarget = false;
                const { keyframes } = options;
                keyframes[0] = value;
                keyframes[1] = this.nextTarget;
                this.retarget(keyframes, this.nextVelocity ?? this.getGeneratorVelocity());
            }
            if (retargeted || !this.started) {
                this.started = true;
                onPlay?.();
            }
            /**
             * Callbacks may stop this animation or set a new target, so check
             * the live state rather than what was read at the top of the tick.
             */
            if (this.state !== "running")
                return;
            onUpdate?.(value);
            if (state.done &&
                elapsed >= 0 &&
                !retargeted &&
                !this.hasNextTarget &&
                this.state === "running") {
                this.notifyFinished();
                this.teardown();
                this.state = "finished";
                options.onComplete?.();
            }
        }
        getGeneratorVelocity() {
            return calcGeneratorVelocity(this.generator, this.currentTime, this.options.velocity);
        }
        now() {
            return this.driver ? this.driver.now() : time.now();
        }
        teardown() {
            this.state = "idle";
            if (this.driver) {
                this.driver.stop();
            }
            else {
                active.delete(this);
                active.size || cancelFrame(tickAll);
            }
        }
    }

    /**
     * Animate `value` to its latest value with the generator in
     * `options.type`, tracking `source` if it's a `MotionValue`. Takes a
     * generator rather than a type name, so spring-only callers don't
     * bundle every generator.
     */
    function follow(value, source, options) {
        const initialValue = value.get();
        let activeAnimation = null;
        let set;
        const unit = typeof initialValue === "string"
            ? initialValue.replace(/[\d.-]/g, "")
            : undefined;
        const onUpdate = (v) => set((unit ? v + unit : v));
        const onPlay = () => value["events"].animationStart?.notify();
        const stopAnimation = () => {
            if (activeAnimation) {
                activeAnimation.stop();
                activeAnimation = null;
            }
            value.animation = undefined;
        };
        value.attach((v, safeSet) => {
            set = safeSet;
            const target = asNumber(v);
            if (activeAnimation?.state === "running") {
                /**
                 * Steer the running animation rather than replacing it. This
                 * keeps its completion promise and uses its analytical velocity
                 * for accuracy, preventing systematic velocity loss at high
                 * frame rates (240hz+).
                 */
                activeAnimation.setTarget(target, options.velocity);
                return;
            }
            const current = asNumber(value.get());
            const velocity = activeAnimation
                ? activeAnimation.getGeneratorVelocity()
                : value.getVelocity();
            stopAnimation();
            // Don't animate if we're already at the target
            if (current === target)
                return;
            const animationOptions = {
                keyframes: [current, target],
                velocity,
                restDelta: 0.001,
                restSpeed: 0.01,
                ...options,
                onUpdate,
            };
            const animation = (activeAnimation = new FollowAnimation({
                ...animationOptions,
                onPlay,
            }));
            value.animation = animation;
            animation.then(() => {
                // Ignore if this animation has since been replaced
                if (activeAnimation !== animation)
                    return;
                activeAnimation = null;
                value.animation = undefined;
                value["events"].animationComplete?.notify();
            });
        }, stopAnimation);
        if (isMotionValue(source)) {
            let skipNextAnimation = options.skipInitialAnimation === true;
            const onSourceChange = (v) => {
                if (skipNextAnimation) {
                    skipNextAnimation = false;
                    value.jump(parseValue(v, unit), false);
                }
                else {
                    value.set(parseValue(v, unit));
                }
            };
            const removeSourceOnChange = source.on("change", onSourceChange);
            /**
             * Catch up on a change made before we subscribed, for instance
             * between a React render reading the source and the effect
             * attaching to it. Subtracting is falsy for equal or non-numeric
             * (NaN) values.
             */
            const latest = source.get();
            if (asNumber(latest) - asNumber(value.get()))
                onSourceChange(latest);
            const removeValueOnDestroy = value.on("destroy", removeSourceOnChange);
            /**
             * Stop our animation on detach, otherwise a re-attach (new
             * options, Strict Mode) starts a second animation that fights
             * this orphaned one. The catch-up above resumes from the
             * current value and velocity.
             */
            return () => {
                removeSourceOnChange();
                removeValueOnDestroy();
                stopAnimation();
            };
        }
        return stopAnimation;
    }
    function parseValue(v, unit) {
        return unit ? v + unit : v;
    }

    /**
     * Create a `MotionValue` that animates to its latest value using any transition type.
     * Can either be a value or track another `MotionValue`.
     *
     * ```jsx
     * const x = motionValue(0)
     * const y = followValue(x, { type: "spring", stiffness: 300 })
     * // or with tween
     * const z = followValue(x, { type: "tween", duration: 0.5, ease: "easeOut" })
     * ```
     *
     * @param source - Initial value or MotionValue to track
     * @param options - Animation transition options
     * @returns `MotionValue`
     *
     * @public
     */
    function followValue(source, options) {
        const initialValue = isMotionValue(source) ? source.get() : source;
        const value = motionValue(initialValue);
        attachFollow(value, source, options);
        return value;
    }
    /**
     * Attach an animation to a MotionValue that will animate whenever the value changes.
     * Similar to attachSpring but supports any transition type (spring, tween, inertia, etc.)
     *
     * @param value - The MotionValue to animate
     * @param source - Initial value or MotionValue to track
     * @param options - Animation transition options
     * @returns Cleanup function
     *
     * @public
     */
    function attachFollow(value, source, options = {}) {
        // Default to spring if no type specified (matches useSpring behavior)
        const transition = { type: "spring", ...options };
        replaceTransitionType(transition);
        transition.type = transition.type || keyframes;
        return follow(value, source, transition);
    }

    function subscribeValue(inputValues, outputValue, getLatest) {
        const update = () => outputValue.set(getLatest());
        const scheduleUpdate = () => frame.preRender(update, false, true);
        const subscriptions = inputValues.map((v) => v.on("change", scheduleUpdate));
        outputValue.on("destroy", () => {
            subscriptions.forEach((unsubscribe) => unsubscribe());
            cancelFrame(update);
        });
    }

    /**
     * Create a `MotionValue` that transforms the output of other `MotionValue`s by
     * passing their latest values through a transform function.
     *
     * Whenever a `MotionValue` referred to in the provided function is updated,
     * it will be re-evaluated.
     *
     * ```jsx
     * const x = motionValue(0)
     * const y = transformValue(() => x.get() * 2) // double x
     * ```
     *
     * @param transformer - A transform function. This function must be pure with no side-effects or conditional statements.
     * @returns `MotionValue`
     *
     * @public
     */
    function transformValue(transform) {
        const collectedValues = [];
        /**
         * Open session of collectMotionValues. Any MotionValue that calls get()
         * inside transform will be saved into this array.
         */
        collectMotionValues.current = collectedValues;
        const initialValue = transform();
        collectMotionValues.current = undefined;
        const value = motionValue(initialValue);
        subscribeValue(collectedValues, value, transform);
        return value;
    }

    /**
     * Create a `MotionValue` that maps the output of another `MotionValue` by
     * mapping it from one range of values into another.
     *
     * @remarks
     *
     * Given an input range of `[-200, -100, 100, 200]` and an output range of
     * `[0, 1, 1, 0]`, the returned `MotionValue` will:
     *
     * - When provided a value between `-200` and `-100`, will return a value between `0` and  `1`.
     * - When provided a value between `-100` and `100`, will return `1`.
     * - When provided a value between `100` and `200`, will return a value between `1` and  `0`
     *
     * The input range must be a linear series of numbers. The output range
     * can be any value type supported by Motion: numbers, colors, shadows, etc.
     *
     * Every value in the output range must be of the same type and in the same format.
     *
     * ```jsx
     * const x = motionValue(0)
     * const xRange = [-200, -100, 100, 200]
     * const opacityRange = [0, 1, 1, 0]
     * const opacity = mapValue(x, xRange, opacityRange)
     * ```
     *
     * @param inputValue - `MotionValue`
     * @param inputRange - A linear series of numbers (either all increasing or decreasing)
     * @param outputRange - A series of numbers, colors or strings. Must be the same length as `inputRange`.
     * @param options -
     *
     *  - clamp: boolean. Clamp values to within the given range. Defaults to `true`
     *  - ease: EasingFunction[]. Easing functions to use on the interpolations between each value in the input and output ranges. If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition between each.
     *
     * @returns `MotionValue`
     *
     * @public
     */
    function mapValue(inputValue, inputRange, outputRange, options) {
        const map = transform(inputRange, outputRange, options);
        return transformValue(() => map(inputValue.get()));
    }

    /**
     * Create a `MotionValue` that animates to its latest value using a spring.
     * Can either be a value or track another `MotionValue`.
     *
     * ```jsx
     * const x = motionValue(0)
     * const y = springValue(x, { stiffness: 300 })
     * ```
     *
     * @param source - Initial value or MotionValue to track
     * @param options - Spring configuration options
     * @returns `MotionValue`
     *
     * @public
     */
    function springValue(source, options) {
        const value = motionValue(isMotionValue(source) ? source.get() : source);
        attachSpring(value, source, options);
        return value;
    }
    /**
     * Attach a spring animation to a MotionValue that will animate whenever the value changes.
     *
     * @param value - The MotionValue to animate
     * @param source - Initial value or MotionValue to track
     * @param options - Spring configuration options
     * @returns Cleanup function
     *
     * @public
     */
    function attachSpring(value, source, options) {
        return follow(value, source, { ...options, type: spring });
    }

    /**
     * A list of all ValueTypes
     */
    const valueTypes = [...dimensionValueTypes, color, complex];
    /**
     * Tests a value against the list of ValueTypes
     */
    const findValueType = (v) => valueTypes.find(testValueType(v));

    let nameCount = 0;
    /**
     * Generated names live in their own namespace so we can tell a name we own
     * (and must clean up) from an author-defined one - and so a stale generated
     * name left behind by an interrupted transition is re-owned, not mistaken for
     * the author's and leaked.
     */
    const generatedName = () => `motion-view-${nameCount++}`;
    const isGeneratedName = (name) => name.startsWith("motion-view-");
    /**
     * Tag a captured element with a `view-transition-class` so authors can target
     * its generated layer from CSS (e.g. `::view-transition-group(.hero)`) without
     * the opaque generated name. Tracked in `classed` - separate from the generated
     * names in `assigned` - so cleanup removes the class without ever stripping an
     * author's own inline `view-transition-name`.
     */
    function tagClass(element, className, classed) {
        if (!className)
            return;
        element.style?.setProperty("view-transition-class", className);
        classed.push(element);
    }
    /**
     * Set the element's `view-transition-group` so its layer reconstructs the DOM
     * hierarchy in the pseudo-tree (`contain`) - or stays flat (`none`). Tracked in
     * `grouped` for cleanup. When the element clips (any non-`visible` overflow) its
     * name is recorded in `clipChildren` so the caller can clip the nested children
     * (`::view-transition-group-children(name)`), mirroring the live clip through
     * the whole transition rather than only at the live-DOM handoff.
     *
     * Ignored by browsers without nested view-transition groups, where it harmlessly
     * degrades to the flat default.
     */
    function applyGroup(element, name, group, grouped, clipChildren) {
        if (!group)
            return;
        element.style?.setProperty("view-transition-group", group);
        grouped.push(element);
        if (group !== "none" && clipChildren) {
            const style = getComputedStyle(element);
            if (style.overflowX !== "visible" || style.overflowY !== "visible") {
                clipChildren.add(name);
            }
        }
    }
    /**
     * Resolve a selector/Element to elements and ensure each one carries a
     * `view-transition-name` we can target from script.
     *
     * Author-defined names are reused as-is. Elements that are unnamed (or use
     * the browser's `auto`/`match-element`, whose generated name is not exposed
     * to script) are given a unique generated name, set inline so it's captured,
     * and tracked in `assigned` for later cleanup.
     *
     * `registry` maps each Element to its name so the same element keeps its name
     * across both captures (before and after the update), which is what allows a
     * persistent element to animate as a single `group` layer.
     */
    function assignViewTransitionNames(definition, registry, assigned, forcedNames, className, classed = [], group, grouped = [], clipChildren) {
        const elements = resolveElements(definition);
        /**
         * The new end of a paired morph: give each element the matching name from
         * the old end (by index) so the two share one layer and morph. If the new
         * end resolves to *more* elements than the old end named, the extras have no
         * counterpart - give them a fresh name so they animate as newcomers rather
         * than being silently left unnamed. We return the names actually assigned
         * (sized to the resolved elements), not the raw `forcedNames`, so stagger
         * totals and the layer set stay in step with what's on the page.
         */
        if (forcedNames) {
            return elements.map((element, i) => {
                const existing = registry.get(element);
                if (existing)
                    return existing;
                const name = forcedNames[i] ?? generatedName();
                element.style?.setProperty("view-transition-name", name);
                assigned.push(element);
                registry.set(element, name);
                tagClass(element, className, classed);
                applyGroup(element, name, group, grouped, clipChildren);
                return name;
            });
        }
        /**
         * Read every current name up front, before assigning any. Interleaving the
         * reads with the inline `setProperty` writes below would dirty styles
         * between reads and force a style recalc per element; batching the reads
         * keeps it to one. Elements already in the registry keep their name and
         * need no read.
         */
        const currentNames = elements.map((element) => registry.has(element)
            ? undefined
            : getComputedStyle(element).getPropertyValue("view-transition-name"));
        return elements.map((element, i) => {
            const existing = registry.get(element);
            if (existing)
                return existing;
            const current = currentNames[i];
            let name;
            if (current &&
                current !== "none" &&
                current !== "auto" &&
                current !== "match-element" &&
                !isGeneratedName(current)) {
                /**
                 * The author already named this layer - target it as-is and leave
                 * it to them to clean up. `auto`/`match-element` are overridden
                 * because their generated name is not exposed to script, and a
                 * stale `motion-view-*` (e.g. left by an interrupted transition) is
                 * re-owned rather than adopted as an author name and leaked.
                 */
                name = current;
            }
            else {
                name = generatedName();
                element.style?.setProperty("view-transition-name", name);
                assigned.push(element);
            }
            registry.set(element, name);
            tagClass(element, className, classed);
            applyGroup(element, name, group, grouped, clipChildren);
            return name;
        });
    }
    /**
     * Remove the `view-transition-name`s we generated and the
     * `view-transition-class`es we applied. Author-defined names are never touched
     * (they're not in `assigned`). Safe to call more than once (e.g. on both a
     * finished and an interrupted transition).
     */
    function releaseViewTransitionNames(assigned, classed = [], grouped = []) {
        for (const element of assigned) {
            element.style?.removeProperty("view-transition-name");
        }
        for (const element of classed) {
            element.style?.removeProperty("view-transition-class");
        }
        for (const element of grouped) {
            element.style?.removeProperty("view-transition-group");
        }
    }

    function chooseLayerType(valueName) {
        if (valueName === "layout")
            return "group";
        if (valueName === "enter" || valueName === "new")
            return "new";
        return "old";
    }

    let pendingRules = {};
    let style = null;
    const css = {
        set: (selector, values) => {
            pendingRules[selector] = values;
        },
        commit: () => {
            if (!style) {
                style = document.createElement("style");
                style.id = "motion-view";
            }
            let cssText = "";
            for (const selector in pendingRules) {
                const rule = pendingRules[selector];
                cssText += `${selector} {\n`;
                for (const [property, value] of Object.entries(rule)) {
                    cssText += `  ${property}: ${value};\n`;
                }
                cssText += "}\n";
            }
            style.textContent = cssText;
            document.head.appendChild(style);
            pendingRules = {};
        },
        remove: () => {
            if (style && style.parentElement) {
                style.parentElement.removeChild(style);
            }
        },
    };

    function getViewAnimationLayerInfo(pseudoElement) {
        const match = pseudoElement.match(
        // `group-children` (nested transitions) before `group` so it wins.
        /::view-transition-(old|new|group-children|group|image-pair)\((.*?)\)/);
        if (!match)
            return null;
        return { layer: match[2], type: match[1] };
    }

    function getViewAnimations() {
        return document.getAnimations().filter((animation) => {
            const { effect } = animation;
            return (!!effect &&
                effect.target === document.documentElement &&
                effect.pseudoElement?.startsWith("::view-transition"));
        });
    }

    function hasTarget(target, targets) {
        return targets.has(target) && Object.keys(targets.get(target)).length > 0;
    }

    const definitionNames = ["layout", "enter", "exit", "new", "old"];
    /**
     * Whether a computed border-radius is square (every component zero). Splitting
     * on whitespace handles two-value/elliptical radii like "0px 20px" - a leading
     * `parseFloat` alone would misread the non-zero vertical radius as square.
     */
    const isSquareRadius = (radius) => radius.split(" ").every((value) => parseFloat(value) === 0);
    /**
     * The `ViewTransitionTarget` buckets driving each generated layer type, in
     * priority order - the inverse of `chooseLayerType`. The new view is driven by
     * `new`/`enter`, the old by `old`/`exit`. `group-children`/`image-pair` have no
     * bucket; they follow the default layout timing.
     */
    const typeBuckets = {
        group: ["layout"],
        new: ["new", "enter"],
        old: ["old", "exit"],
    };
    /**
     * Default "absent" origin for a single-value keyframe, by pseudo type, so e.g.
     * `enter({ scale: 1 })` grows in from 0.85 and `exit({ opacity: 0 })` fades
     * from 1. `enter` prefers the matching `exit` value over these (see below).
     */
    const ORIGIN_DEFAULTS = {
        new: { opacity: 0, scale: 0.85 },
        old: { opacity: 1, scale: 1 },
    };
    /**
     * How much two box aspect ratios must differ before a morph is treated as
     * aspect-changing (and so worth cropping). Matches the projection engine's
     * `preserve-aspect` threshold, so small layout jitter doesn't trigger a crop.
     */
    const ASPECT_TOLERANCE = 0.2;
    function startViewAnimation(builder) {
        const { update, targets, resolveDefs, cropOverride, pairs, classNames, flatGroups, options: defaultOptions, } = builder;
        if (!document.startViewTransition) {
            // An async IIFE (not `new Promise(async …)`) so a throwing/rejecting
            // update rejects this promise rather than leaving it unsettled.
            return (async () => {
                await update();
                return new GroupAnimation([]);
            })();
        }
        /**
         * Resolve any selector/Element targets to layer names, assigning a
         * `view-transition-name` to each element as we go. We run this before the
         * update (so the elements are captured in the old snapshot) and again
         * after it (for the new snapshot). An element present in both keeps the
         * same name and animates as a single `group` layer.
         */
        const nameRegistry = new Map();
        const assigned = [];
        /**
         * Elements we tagged with a `view-transition-class` (via `.class()`),
         * tracked separately from `assigned` so cleanup removes the class without
         * ever stripping an author's own inline `view-transition-name`.
         */
        const classed = [];
        /**
         * Elements we set a `view-transition-group` on (for nesting), tracked for
         * cleanup. `clipChildren` collects the names of nested parents that clip in
         * the live layout, so their `::view-transition-group-children` is clipped
         * through the transition - not just once the live DOM takes back over.
         */
        const grouped = [];
        const clipChildren = new Set();
        const layerTargets = new Map();
        const croppedNames = new Set();
        /**
         * Each layer's explicit `.crop(true | false)` override (by resolved name),
         * so `finalizeCrop` can let an author's choice win over the morph default.
         */
        const cropForName = new Map();
        /**
         * Each layer's stagger position (index + total) within its subject, per
         * snapshot. Resolving against the snapshot the layer belongs to keeps
         * stagger correct when `update()` replaces the matched elements, and lets
         * us skip a layer that's absent from a snapshot (e.g. an exited element
         * has no `new` pseudo-element).
         */
        const layerStagger = new Map();
        /**
         * Names allocated for a paired subject in the old snapshot, replayed onto
         * its new-snapshot target so both ends share a layer and morph.
         */
        const pairNames = new Map();
        /**
         * The old (`from`) elements of each paired subject, so their names can be
         * transferred off before the new (`to`) elements inherit them.
         */
        const pairFrom = new Map();
        const resolveLayers = (phase) => {
            targets.forEach((target, definition) => {
                const className = classNames.get(definition);
                /**
                 * Nest each resolved layer under its DOM-ancestor layer by default
                 * (`contain`), so an ancestor's clip/transform/opacity reach it
                 * through the transition; `.group(false)` opts a subject out (`none`)
                 * to stay flat and escape. Skipped for root / pre-named layers, which
                 * aren't elements we resolve and style.
                 */
                const group = definition === "root" || !resolveDefs.has(definition)
                    ? undefined
                    : flatGroups.has(definition)
                        ? "none"
                        : "contain";
                let names;
                if (definition === "root" || !resolveDefs.has(definition)) {
                    names = [definition];
                }
                else if (pairs.has(definition)) {
                    /**
                     * Paired morph: name the old target in the old snapshot, then
                     * force the same name(s) onto the new target in the new one, so
                     * two different elements morph as a single layer.
                     */
                    if (phase === "old") {
                        pairFrom.set(definition, resolveElements(definition));
                        names = assignViewTransitionNames(definition, nameRegistry, assigned, undefined, className, classed, group, grouped, clipChildren);
                        pairNames.set(definition, names);
                    }
                    else {
                        /**
                         * Transfer the name(s) off the `from` elements before the
                         * `to` elements inherit them. A `from` that survives into
                         * the new snapshot (e.g. hidden with `visibility: hidden`
                         * rather than removed) would otherwise keep the name and
                         * collide - "duplicate view-transition-name".
                         */
                        for (const el of pairFrom.get(definition) ?? []) {
                            el.style?.removeProperty("view-transition-name");
                            /**
                             * Drop the old end from the registry too, so the new
                             * end alone supplies this name's `new` crop radii - we
                             * neither re-measure nor get ordered by a stale element.
                             */
                            nameRegistry.delete(el);
                        }
                        names = assignViewTransitionNames(pairs.get(definition), nameRegistry, assigned, pairNames.get(definition), className, classed, group, grouped, clipChildren);
                    }
                }
                else {
                    names = assignViewTransitionNames(definition, nameRegistry, assigned, undefined, className, classed, group, grouped, clipChildren);
                }
                // Record any explicit `.crop(true | false)` per resolved name; the
                // crop set itself is computed later by `finalizeCrop` (it needs both
                // snapshots to know which morphs change aspect ratio).
                const override = cropOverride.get(definition);
                names.forEach((name, index) => {
                    /**
                     * If two subjects resolve to the same element, merge their
                     * definitions so neither subject's animations are dropped.
                     */
                    const existing = layerTargets.get(name);
                    layerTargets.set(name, existing && existing !== target
                        ? { ...existing, ...target }
                        : target);
                    if (override !== undefined)
                        cropForName.set(name, override);
                    const stagger = layerStagger.get(name) ?? {};
                    stagger[phase] = [index, names.length];
                    layerStagger.set(name, stagger);
                });
            });
        };
        /**
         * The stagger index/total for a layer, resolved against the snapshot it
         * belongs to. Returns index -1 when the layer is absent from that snapshot
         * so the caller can skip a pseudo-element that doesn't exist.
         */
        const staggerPosition = (name, type) => {
            const stagger = layerStagger.get(name);
            const position = type === "old"
                ? stagger?.old
                : type === "new"
                    ? stagger?.new
                    : // group / group-children / image-pair persist across both.
                        stagger?.new ?? stagger?.old;
            return position ?? [-1, 1];
        };
        /**
         * Merge default + per-layer transition options for a generated layer and
         * resolve any stagger/delay function against this element's position. Used
         * by both the morph-retiming and crop corner-radius passes.
         */
        const resolveLayerTransition = (target, type, transitionName, index, total) => {
            const transition = mergeTransition(getValueTransition$1(defaultOptions, transitionName), getValueTransition$1((layerOptions(target, type) ?? {}), transitionName));
            if (typeof transition.delay === "function") {
                transition.delay = transition.delay(index, total);
            }
            return transition;
        };
        /**
         * Resolve a layer's group (`layout`) timing to plain WAAPI values: native
         * ms `delay`/`duration` and a baked `ease`. The single source of group
         * timing, shared by the generated-group retiming and the crop corner-radius
         * pass so the rounded clip animates on exactly the box's timing. It returns
         * no generator `type` (the WAAPI-only `NativeAnimation` rejects a string
         * type) nor `repeat`/`times` (which the group's `updateTiming` ignores), so
         * none of them can leak into the radius animation and desync it.
         */
        const resolveGroupTiming = (name) => {
            const [index, total] = staggerPosition(name, "group");
            const transition = resolveLayerTransition(layerTargets.get(name), "group", "layout", index === -1 ? 0 : index, total);
            transition.duration && (transition.duration = secondsToMilliseconds(transition.duration));
            const { delay = 0, duration, ease } = applyGeneratorOptions(transition);
            return { delay: secondsToMilliseconds(delay), duration, ease };
        };
        /**
         * Each layer's measured box + corner radii per snapshot. The box lets
         * `finalizeCrop` tell whether a morph's aspect ratio changed (the only case
         * worth cropping); the radii let a cropped morph's group clip animate each
         * corner from the old element's radius to the new element's, keeping it
         * rounded where `overflow: clip` would otherwise square the corners.
         *
         * We never flatten the source for capture (a snapshot is a paint of the live
         * DOM, so squaring an element just for its capture would flash one real
         * square frame). For an aspect-changing morph `object-fit: cover` crops each
         * snapshot's own baked corners off-screen mid-morph, so the animated clip is
         * the only visible corner; a near-same-aspect forced crop (`.crop(true)`)
         * can't hide the outgoing snapshot's silhouette, but the endpoints coincide.
         */
        const cropMeasurements = new Map();
        const measureLayers = (phase) => nameRegistry.forEach((name, element) => {
            const el = element;
            const rect = el.getBoundingClientRect?.();
            if (rect && rect.height) {
                const style = getComputedStyle(el);
                const radii = {};
                for (const corner of cornerRadiusProps) {
                    radii[corner] = style[corner];
                }
                const entry = cropMeasurements.get(name) ?? {};
                entry[phase] = { width: rect.width, height: rect.height, radii };
                cropMeasurements.set(name, entry);
            }
        });
        /**
         * With both snapshots measured, settle which layers crop. The default crops
         * only a morph whose aspect ratio *changes* between snapshots - the one case
         * where `object-fit: cover` does real work. A same-aspect morph or a
         * fade-only layer is left uncropped: its corners scale naturally (no flash
         * from squaring, no `overflow: clip` eating its shadow) and a backdrop can't
         * be clipped to nothing. An explicit `.crop(true | false)` overrides either
         * way. Runs after both snapshots are measured, since aspect needs both.
         */
        const finalizeCrop = () => {
            croppedNames.clear();
            for (const name of layerStagger.keys()) {
                if (name === "root")
                    continue;
                // An explicit `.crop(true | false)` wins; otherwise crop a morph
                // whose aspect ratio changed.
                if (cropForName.get(name) ?? aspectChanged(name)) {
                    croppedNames.add(name);
                }
            }
        };
        /**
         * Whether a layer is a morph whose box aspect ratio changed between
         * snapshots (beyond a small tolerance). Fade-only layers (one snapshot) are
         * never "changed".
         */
        const aspectChanged = (name) => {
            const box = cropMeasurements.get(name);
            if (!box?.old || !box?.new || !box.old.height || !box.new.height) {
                return false;
            }
            return (Math.abs(box.old.width / box.old.height -
                box.new.width / box.new.height) > ASPECT_TOLERANCE);
        };
        /**
         * Write the persistent view-transition CSS: suppress root capture when the
         * root has no animations of its own; force linear timing (baked into the
         * keyframes, so we can retime later via updateTiming); and clip +
         * object-fit: cover every cropped morph (the UA default overflows on
         * aspect-ratio change).
         *
         * `css.commit` replaces rather than appends, so we re-set the full rule set
         * each call - the crop rules are only known after `finalizeCrop` runs in the
         * update callback, so the second call writes them.
         */
        const commitViewCSS = () => {
            if (!hasTarget("root", targets)) {
                css.set(":root", { "view-transition-name": "none" });
            }
            css.set("::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*)", { "animation-timing-function": "linear !important" });
            croppedNames.forEach((name) => {
                css.set(`::view-transition-group(${name})`, { overflow: "clip" });
                css.set(`::view-transition-old(${name}), ::view-transition-new(${name})`, { width: "100%", height: "100%", "object-fit": "cover" });
            });
            /**
             * Clip the nested children of any layer that clips in the live layout,
             * so a wrapper crops its child for the whole morph (mirroring the DOM)
             * rather than only at the live-DOM handoff. No-op on browsers without
             * nested view-transition groups.
             */
            clipChildren.forEach((name) => {
                css.set(`::view-transition-group-children(${name})`, {
                    overflow: "clip",
                });
            });
            css.commit(); // Write
        };
        const cleanup = () => {
            releaseViewTransitionNames(assigned, classed, grouped);
            css.remove(); // Write
        };
        const callback = async () => {
            await update();
            /**
             * Re-resolve so elements created by the update are named for the new
             * snapshot, then measure them. With both snapshots measured we can
             * settle the crop set (aspect-changing morphs + forced).
             */
            resolveLayers("new");
            measureLayers("new");
            finalizeCrop();
            /**
             * Re-commit the crop CSS unconditionally: `finalizeCrop` is computed
             * here (after both snapshots are measured), so the clip rules must be
             * (re)written to match the settled set.
             */
            commitViewCSS();
        };
        let transition;
        try {
            resolveLayers("old");
            /**
             * Measure the old snapshot against the optimistic crop set (the new
             * snapshot doesn't exist yet, so aspect change can't be known here;
             * `finalizeCrop` settles it post-update).
             */
            measureLayers("old");
            commitViewCSS();
            transition = document.startViewTransition(callback);
        }
        catch (error) {
            /**
             * The prelude writes inline names before the transition exists. If it
             * throws (e.g. startViewTransition rejects in a bad UA state), release
             * them so we neither leak DOM state nor stall the queue on a promise
             * that never settles - hand back a rejection it can advance past.
             */
            cleanup();
            return Promise.reject(error);
        }
        transition.finished.finally(cleanup);
        return new Promise((resolve, reject) => {
            transition.ready
                .then(() => {
                const generatedViewAnimations = getViewAnimations();
                const animations = [];
                /**
                 * Create animations for each of our explicitly-defined subjects.
                 * `opacityAnimated` additionally tracks which `${name}:${type}`
                 * we faded, so we can keep the UA `plus-lighter` blend only for a
                 * genuine opacity crossfade (both sides fading) and drop it for a
                 * slide/transform, where additive compositing would flash bright.
                 */
                const explicitlyAnimated = new Set();
                const opacityAnimated = new Set();
                layerTargets.forEach((target, name) => {
                    const stagger = layerStagger.get(name);
                    /**
                     * Presence: `enter` only fires for a pure newcomer (a new
                     * view with no old), `exit` only for a pure leaver. A
                     * survivor (both) gets neither - it just morphs.
                     */
                    const enterApplies = !!stagger?.new && !stagger?.old;
                    const exitApplies = !!stagger?.old && !stagger?.new;
                    for (const key of definitionNames) {
                        if (!target[key])
                            continue;
                        if (key === "enter" && !enterApplies)
                            continue;
                        if (key === "exit" && !exitApplies)
                            continue;
                        const type = chooseLayerType(key);
                        const [index, total] = staggerPosition(name, type);
                        // Skip a layer absent from its snapshot.
                        if (index === -1)
                            continue;
                        const { keyframes, options } = target[key];
                        for (let [valueName, valueKeyframes] of Object.entries(keyframes)) {
                            // Skip only missing values - `0` (e.g. opacity: 0)
                            // is valid and must reach the from-value inference.
                            if (valueKeyframes == null)
                                continue;
                            /**
                             * The view path hands keyframes straight to WAAPI,
                             * so Motion's `x`/`y` shorthands (compiled to
                             * `transform` only via the value pipeline) have no
                             * effect. Warn and skip - use `transform`/`translate`.
                             */
                            if (valueName === "x" || valueName === "y") {
                                warnOnce(false, `animateView() animates view-transition layers with CSS properties; the "${valueName}" shorthand has no effect - use transform, e.g. { transform: "translateX(40px)" }.`);
                                continue;
                            }
                            /**
                             * enter/exit win over new/old on a shared property -
                             * skip it here when the gated bucket also defines it.
                             */
                            if (key === "new" &&
                                enterApplies &&
                                target.enter?.keyframes[valueName] != null) {
                                continue;
                            }
                            if (key === "old" &&
                                exitApplies &&
                                target.exit?.keyframes[valueName] != null) {
                                continue;
                            }
                            const valueOptions = mergeTransition(getValueTransition$1(defaultOptions, valueName), getValueTransition$1(options, valueName));
                            /**
                             * Infer an origin for a single-value keyframe. An
                             * `enter` mirrors the matching `exit` value (a
                             * defined exit reverses into the enter for free);
                             * otherwise the per-type default (opacity 0/1, scale
                             * 0.85). No default -> left as-is (animates from the
                             * live value).
                             *
                             * `new`/`old` fire for survivors too, where only the
                             * opacity crossfade default applies - a transform
                             * default like scale 0.85 would pop a persisting
                             * element, so gate it on the layer actually
                             * entering/leaving.
                             */
                            if (!Array.isArray(valueKeyframes)) {
                                const exitValue = key === "enter"
                                    ? target.exit?.keyframes[valueName]
                                    : undefined;
                                const allowDefault = valueName === "opacity" ||
                                    (type === "new" ? enterApplies : exitApplies);
                                const from = exitValue != null
                                    ? Array.isArray(exitValue)
                                        ? exitValue[exitValue.length - 1]
                                        : exitValue
                                    : allowDefault
                                        ? ORIGIN_DEFAULTS[type]?.[valueName]
                                        : undefined;
                                if (from !== undefined) {
                                    valueKeyframes = [from, valueKeyframes];
                                }
                            }
                            /**
                             * Resolve stagger function if provided, per element
                             * across this subject's resolved layers.
                             */
                            if (typeof valueOptions.delay === "function") {
                                valueOptions.delay = valueOptions.delay(index, total);
                            }
                            valueOptions.duration && (valueOptions.duration = secondsToMilliseconds(valueOptions.duration));
                            valueOptions.delay && (valueOptions.delay = secondsToMilliseconds(valueOptions.delay));
                            animations.push(new NativeAnimation({
                                ...valueOptions,
                                element: document.documentElement,
                                name: valueName,
                                pseudoElement: `::view-transition-${type}(${name})`,
                                keyframes: valueKeyframes,
                            }));
                            explicitlyAnimated.add(`${name}:${type}`);
                            if (valueName === "opacity") {
                                opacityAnimated.add(`${name}:${type}`);
                            }
                        }
                    }
                });
                /**
                 * Handle browser generated animations
                 */
                for (const animation of generatedViewAnimations) {
                    if (animation.playState === "finished")
                        continue;
                    const { effect } = animation;
                    if (!effect || !(effect instanceof KeyframeEffect))
                        continue;
                    const { pseudoElement } = effect;
                    if (!pseudoElement)
                        continue;
                    const name = getViewAnimationLayerInfo(pseudoElement);
                    if (!name)
                        continue;
                    const targetDefinition = layerTargets.get(name.layer);
                    /**
                     * We built our own animation for this layer, so drop the
                     * browser-generated fade we're replacing. The UA
                     * `plus-lighter` blend is a *separate* generated animation on
                     * the same pseudo (it sets `mix-blend-mode` in its keyframes):
                     * keep it *only* for a true opacity crossfade - both sides
                     * fading - so a symmetric crossfade composites without
                     * darkening, but a slide/transform (where both layers stay
                     * opaque and overlap) doesn't flash bright from the addition.
                     */
                    if (explicitlyAnimated.has(`${name.layer}:${name.type}`)) {
                        const isCrossfade = opacityAnimated.has(`${name.layer}:new`) &&
                            opacityAnimated.has(`${name.layer}:old`);
                        if (isCrossfade &&
                            effect
                                .getKeyframes()
                                .some((keyframe) => keyframe.mixBlendMode)) {
                            animations.push(new NativeAnimationWrapper(animation));
                        }
                        else {
                            animation.cancel();
                        }
                        continue;
                    }
                    /**
                     * Drop the orphaned half of the default crossfade. The UA
                     * fades old out and new in as a *pair*; if the opposing half
                     * was explicitly overridden with something other than an
                     * opacity fade (a clip or transform reveal), this side's
                     * default opacity fade has no partner - left to run it would
                     * dissolve what should be a static backdrop (e.g.
                     * `.new({ clipPath })` should reveal over a still old view,
                     * not fade the old out around the growing clip). Cancel it -
                     * and its `plus-lighter` sibling on the same pseudo, which
                     * would otherwise flash bright where the two opaque layers
                     * overlap. A genuine crossfade (the opposing side also fading
                     * opacity) keeps both halves and is handled above.
                     */
                    const opposite = name.type === "old"
                        ? "new"
                        : name.type === "new"
                            ? "old"
                            : undefined;
                    if (opposite &&
                        explicitlyAnimated.has(`${name.layer}:${opposite}`) &&
                        !opacityAnimated.has(`${name.layer}:${opposite}`)) {
                        animation.cancel();
                        continue;
                    }
                    /**
                     * Otherwise retime the browser-generated animation to
                     * Motion's timing. This auto-enables the layout (group)
                     * morph for any resolved/named target, and applies the
                     * default timing to old/new layers we haven't explicitly
                     * overridden.
                     *
                     * group + group-children both follow the layout timing so
                     * the nesting container stays in sync with the morph.
                     */
                    /**
                     * A survivor's old + new are the two halves of one
                     * `plus-lighter` crossfade. They must share identical timing
                     * (so their opacities stay mirrored and sum to 1 - else the
                     * additive blend flashes bright wherever both are partly
                     * visible) and fade linearly (the bounce belongs on the
                     * group's geometry, not the opacity). So time them as the
                     * group, rather than via their own - potentially staggered,
                     * or enter/exit-derived - old/new options.
                     */
                    const stagger = layerStagger.get(name.layer);
                    const isMorphCrossfade = (name.type === "old" || name.type === "new") &&
                        !!stagger?.old &&
                        !!stagger?.new;
                    let timing;
                    if (name.type.startsWith("group")) {
                        // group + group-children follow the resolved group
                        // timing - the single source shared with the crop
                        // corner-radius pass below.
                        const { delay, duration, ease } = resolveGroupTiming(name.layer);
                        timing = {
                            delay,
                            duration,
                            easing: mapEasingToNativeEasing(ease, duration),
                        };
                    }
                    else {
                        const timingType = isMorphCrossfade ? "group" : name.type;
                        const [index, total] = staggerPosition(name.layer, timingType);
                        const transitionName = timingType === "group" ? "layout" : "";
                        let animationTransition = resolveLayerTransition(targetDefinition, timingType, transitionName, index === -1 ? 0 : index, total);
                        /**
                         * The crossfade should resolve at the spring's
                         * *perceptual* (visual) duration - the geometry can keep
                         * bouncing, but the opacity shouldn't drag through the
                         * settle. So capture `visualDuration` before
                         * `applyGeneratorOptions` replaces it with the full
                         * overshoot duration, and use it for the fade.
                         */
                        const visualDuration = animationTransition.visualDuration;
                        animationTransition.duration && (animationTransition.duration = secondsToMilliseconds(animationTransition.duration));
                        animationTransition =
                            applyGeneratorOptions(animationTransition);
                        timing = {
                            delay: secondsToMilliseconds(animationTransition.delay ?? 0),
                            duration: isMorphCrossfade && visualDuration !== undefined
                                ? secondsToMilliseconds(visualDuration)
                                : animationTransition.duration,
                            easing: isMorphCrossfade
                                ? "linear"
                                : mapEasingToNativeEasing(animationTransition.ease, animationTransition.duration),
                        };
                    }
                    effect.updateTiming(timing);
                    animations.push(new NativeAnimationWrapper(animation));
                }
                /**
                 * Round each cropped layer's clip. Its `::view-transition-group`
                 * has `overflow: clip`, which would otherwise square the corners
                 * mid-morph; animate each corner from the old element's radius to
                 * the new element's so the crop stays rounded. Timed as the group
                 * (`layout`) so the radius tracks the morphing box.
                 */
                cropMeasurements.forEach((entry, name) => {
                    if (!croppedNames.has(name))
                        return;
                    // Reuse the group's resolved timing - native ms delay/
                    // duration + a baked ease, with no generator `type` or
                    // repeat/times to leak into (or throw inside) NativeAnimation.
                    const { delay, duration, ease } = resolveGroupTiming(name);
                    for (const corner of cornerRadiusProps) {
                        // `||` (not `??`) so an empty measurement falls back to
                        // the other snapshot rather than an invalid keyframe.
                        const from = entry.old?.radii[corner] ||
                            entry.new?.radii[corner] ||
                            "0px";
                        const to = entry.new?.radii[corner] ||
                            entry.old?.radii[corner] ||
                            "0px";
                        // Nothing to round if the corner is square at both ends.
                        if (isSquareRadius(from) && isSquareRadius(to))
                            continue;
                        animations.push(new NativeAnimation({
                            element: document.documentElement,
                            name: corner,
                            pseudoElement: `::view-transition-group(${name})`,
                            keyframes: [from, to],
                            delay,
                            duration,
                            ease,
                        }));
                    }
                });
                resolve(new GroupAnimation(animations));
            })
                .catch(() => 
            /**
             * `ready` rejects when the transition is skipped - no visual
             * change, or superseded by an interrupting transition. The DOM
             * update still applied, so settle with no animations rather than
             * surfacing it as an error to an awaiting caller. A genuine
             * failure in `update()` rejects `updateCallbackDone` (already
             * settled by now), so propagate that instead.
             */
            transition.updateCallbackDone.then(() => resolve(new GroupAnimation([])), reject));
        });
    }
    /**
     * The options that should time a given generated layer type, so a retimed
     * group/old/new picks up any per-target transition the user provided. Checks
     * the type's buckets in priority order (e.g. `new` before `enter`).
     */
    function layerOptions(target, type) {
        for (const bucket of typeBuckets[type] ?? []) {
            const options = target?.[bucket]?.options;
            if (options)
                return options;
        }
    }
    /**
     * Merge a base transition (e.g. the default `options`) with a per-layer/value
     * override. An explicit `duration` on the override must win over an inherited
     * generator's own timing: a spring prefers `visualDuration`, and
     * `spring.applyToOptions` overwrites `duration` with the computed settle time -
     * so without this the override is silently discarded. Dropping the inherited
     * `type`/`visualDuration` makes the layer a plain tween of that duration, unless
     * it asked for its own generator `type`/`visualDuration`.
     */
    function mergeTransition(base, override) {
        const merged = { ...base, ...override };
        if (override.duration !== undefined) {
            if (override.visualDuration === undefined)
                delete merged.visualDuration;
            if (override.type === undefined)
                delete merged.type;
        }
        return merged;
    }

    let builders = [];
    let current = null;
    function next() {
        current = null;
        const [nextBuilder] = builders;
        if (nextBuilder)
            start(nextBuilder);
    }
    function start(builder) {
        removeItem(builders, builder);
        current = builder;
        startViewAnimation(builder)
            .then((animation) => {
            builder.notifyReady(animation);
            return animation.finished;
        })
            // A genuinely failed transition (a throwing update) rejects the
            // builder; a skipped/interrupted one resolves with no animations (see
            // start.ts). Either way, advance the queue - else later transitions hang.
            .catch((error) => builder.notifyReject(error))
            .finally(next);
    }
    function processQueue() {
        /**
         * Iterate backwards over the builders array. We can ignore the
         * "wait" animations. If we have an interrupting animation in the
         * queue then we need to batch all preceding animations into it.
         * Currently this only batches the update functions but will also
         * need to batch the targets.
         */
        for (let i = builders.length - 1; i >= 0; i--) {
            const builder = builders[i];
            const { interrupt } = builder.options;
            if (interrupt === "immediate") {
                const batchedUpdates = builders.slice(0, i + 1).map((b) => b.update);
                const remaining = builders.slice(i + 1);
                builder.update = () => {
                    batchedUpdates.forEach((update) => update());
                };
                // Put the current builder at the front, followed by any "wait" builders
                builders = [builder, ...remaining];
                break;
            }
        }
        if (!current || builders[0]?.options.interrupt === "immediate") {
            next();
        }
    }
    function addToQueue(builder) {
        builders.push(builder);
        microtask.render(processQueue);
    }

    class ViewTransitionBuilder {
        constructor(update, options = {}) {
            this.currentSubject = "root";
            this.targets = new Map();
            /**
             * Definitions that must be resolved to elements (and assigned a
             * `view-transition-name`) rather than treated as pre-named layers.
             */
            this.resolveDefs = new Set();
            /**
             * Per-subject crop override: `true` forces the crop (clip + object-fit:
             * cover + animated corner radii) on, `false` forces it off. A subject with
             * no entry uses the default - crop only a genuine morph (a layer present in
             * both snapshots), so a fade-only enter/exit isn't clipped to nothing.
             */
            this.cropOverride = new Map();
            /**
             * Subjects paired with a different new-snapshot target (the second `.add()`
             * argument), so two distinct elements share one name and morph into each
             * other - a shared-element transition.
             */
            this.pairs = new Map();
            /**
             * A `view-transition-class` to apply to each subject's resolved elements,
             * so authors can target the generated layers from CSS by class rather than
             * the opaque generated name.
             */
            this.classNames = new Map();
            /**
             * Subjects opted out of automatic group nesting via `.group(false)`. Their
             * layer stays a flat top-level group (`view-transition-group: none`) instead
             * of nesting under its DOM-ancestor layer - so it animates independently and
             * escapes an ancestor's clip/transform (e.g. an element that lifts out of a
             * card and flies across, which nesting would clip to the card).
             */
            this.flatGroups = new Set();
            this.notifyReady = noop;
            this.notifyReject = noop;
            this.readyPromise = new Promise((resolve, reject) => {
                this.notifyReady = resolve;
                this.notifyReject = reject;
            });
            this.update = update;
            this.options = {
                interrupt: "wait",
                ...options,
            };
            // Avoid an unhandled rejection when a failed transition has no
            // `.then(_, reject)` handler attached (e.g. fire-and-forget).
            this.readyPromise.catch(noop);
            addToQueue(this);
        }
        /**
         * Target elements resolved from a selector or Element, each assigned a
         * `view-transition-name` automatically.
         *
         * Passing a second target pairs them: the first is resolved in the old
         * snapshot and the second in the new, sharing one name so two *different*
         * elements morph into each other (e.g. `.add(card, ".modal")`). Symmetric -
         * pass them the other way round to morph back.
         */
        add(subject, newSubject) {
            this.currentSubject = subject;
            this.resolveDefs.add(subject);
            if (newSubject !== undefined)
                this.pairs.set(subject, newSubject);
            // Register the subject so it participates (and gets an automatic
            // layout/morph animation) even without an explicit enter/exit/layout.
            if (!this.targets.has(subject))
                this.targets.set(subject, {});
            return this;
        }
        /**
         * Control this subject's crop (clip + `object-fit: cover` + animated
         * corners). By default a subject auto-crops only when it actually morphs -
         * present in both snapshots (a survivor, or an `.add(a, b)` pair). A
         * fade-only enter/exit has no second box to crop against, so it's left to
         * the browser default; in particular the `overflow: clip` a crop adds would
         * otherwise clip a mis-sized enter/exit layer to nothing.
         *
         * `.crop(false)` forces the crop off (e.g. a text morph, where
         * `object-fit: cover` clips glyphs as the box grows); `.crop(true)` forces
         * it on for a non-morph the default wouldn't otherwise crop.
         */
        crop(enabled = true) {
            this.cropOverride.set(this.currentSubject, enabled);
            return this;
        }
        /**
         * By default a subject's layer nests under its nearest DOM-ancestor layer
         * (`view-transition-group: contain`), so the ancestor's clip/transform/opacity
         * apply to it through the transition - mirroring how the DOM actually paints,
         * and letting a wrapper crop its child for the whole morph rather than only
         * once the live DOM takes back over. (Needs a browser that supports nested
         * view-transition groups; elsewhere it degrades to the flat default.)
         *
         * Call `.group(false)` to opt out: the layer stays flat and top-level, so it
         * animates independently and escapes an ancestor's clip - e.g. an element
         * that should lift out of a card and fly across, which nesting would clip.
         */
        group(enabled = true) {
            enabled
                ? this.flatGroups.delete(this.currentSubject)
                : this.flatGroups.add(this.currentSubject);
            return this;
        }
        /**
         * Tag this subject's generated layers with a `view-transition-class`, so
         * they can be targeted from CSS - `::view-transition-group(.name)`,
         * `::view-transition-old/new(.name)`, `::view-transition-image-pair(.name)`
         * - without the opaque generated `view-transition-name`. Because `.add()`
         * can match many elements, a shared class targets them all at once (and,
         * for a pair, both ends). The escape hatch for z-index / custom keyframes
         * on a morph layer.
         */
        class(name) {
            this.classNames.set(this.currentSubject, name);
            return this;
        }
        /**
         * Set the transition for this subject's morph. The morph is enabled
         * automatically by `.add()`; this just customises its timing (duration,
         * easing, a `delay`/`stagger`, …). On the implicit `root` subject it also
         * opts the page into the transition (the root crossfade).
         */
        layout(options = {}) {
            this.updateTarget("layout", {}, options);
            return this;
        }
        enter(keyframes, options) {
            this.updateTarget("enter", keyframes, options);
            return this;
        }
        exit(keyframes, options) {
            this.updateTarget("exit", keyframes, options);
            return this;
        }
        /**
         * Animate the new view directly, whether the element is appearing or
         * persisting (unlike `.enter()`, which only fires for a pure newcomer).
         * Pair with `.old()` for a crossfade or slide-through.
         */
        new(keyframes, options) {
            this.updateTarget("new", keyframes, options);
            return this;
        }
        /**
         * Animate the old view directly, whether the element is leaving or
         * persisting (unlike `.exit()`, which only fires for a pure leaver).
         */
        old(keyframes, options) {
            this.updateTarget("old", keyframes, options);
            return this;
        }
        updateTarget(target, keyframes, options = {}) {
            const { currentSubject, targets } = this;
            if (!targets.has(currentSubject)) {
                targets.set(currentSubject, {});
            }
            const targetData = targets.get(currentSubject);
            targetData[target] = { keyframes, options };
        }
        then(resolve, reject) {
            return this.readyPromise.then(resolve, reject);
        }
    }
    function animateView(update, options = {}) {
        const builder = new ViewTransitionBuilder(update, options);
        addBuilderToScope(builder);
        return builder;
    }

    /**
     * Feature base class for extending VisualElement functionality.
     * Features are plugins that can be mounted/unmounted to add behavior
     * like gestures, animations, or layout tracking.
     */
    class Feature {
        constructor(node) {
            this.isMounted = false;
            this.node = node;
        }
        update() { }
    }

    function isObjectKey(key, object) {
        return key in object;
    }
    class ObjectVisualElement extends VisualElement {
        constructor() {
            super(...arguments);
            this.type = "object";
        }
        readValueFromInstance(instance, key) {
            if (isObjectKey(key, instance)) {
                const value = instance[key];
                if (typeof value === "string" || typeof value === "number") {
                    return value;
                }
            }
            return undefined;
        }
        getBaseTargetFromProps() {
            return undefined;
        }
        removeValueFromRenderState(key, renderState) {
            delete renderState.output[key];
        }
        measureInstanceViewportBox() {
            return createBox();
        }
        build(renderState, latestValues) {
            Object.assign(renderState.output, latestValues);
        }
        renderInstance(instance, { output }) {
            Object.assign(instance, output);
        }
        sortInstanceNodePosition() {
            return 0;
        }
    }

    /**
     * A set of attribute names that are always read/written as camel case.
     */
    const camelCaseAttributes = new Set([
        "baseFrequency",
        "diffuseConstant",
        "kernelMatrix",
        "kernelUnitLength",
        "keySplines",
        "keyTimes",
        "limitingConeAngle",
        "markerHeight",
        "markerWidth",
        "numOctaves",
        "targetX",
        "targetY",
        "surfaceScale",
        "specularConstant",
        "specularExponent",
        "stdDeviation",
        "tableValues",
        "viewBox",
        "gradientTransform",
        "pathLength",
        "startOffset",
        "textLength",
        "lengthAdjust",
    ]);

    const isSVGTag = (tag) => typeof tag === "string" && tag.toLowerCase() === "svg";

    function renderSVG(element, renderState, _styleProp, projection) {
        renderHTML(element, renderState, undefined, projection);
        for (const key in renderState.attrs) {
            element.setAttribute(!camelCaseAttributes.has(key) ? camelToDash(key) : key, renderState.attrs[key]);
        }
    }

    function scrapeMotionValuesFromProps(props, prevProps, visualElement) {
        const newValues = scrapeMotionValuesFromProps$1(props, prevProps, visualElement);
        for (const key in props) {
            /**
             * A MotionValue child is rendered as text content by
             * DOMVisualElement, so it mustn't also be written as an attribute.
             */
            if (key !== "children" &&
                (isMotionValue(props[key]) ||
                    isMotionValue(prevProps[key]))) {
                const targetKey = transformPropOrder.indexOf(key) !== -1
                    ? "attr" + key.charAt(0).toUpperCase() + key.substring(1)
                    : key;
                newValues[targetKey] = props[key];
            }
        }
        return newValues;
    }

    class SVGVisualElement extends DOMVisualElement {
        constructor() {
            super(...arguments);
            this.type = "svg";
            this.isSVGTag = false;
            this.measureInstanceViewportBox = createBox;
        }
        getBaseTargetFromProps(props, key) {
            /**
             * An independent transform's base is never an attribute of the same
             * name, e.g. <rect x> is a position, not a translate. Like HTML it
             * comes from style, falling back to the transform's default.
             */
            return transformProps.has(key)
                ? super.getBaseTargetFromProps(props, key) ??
                    defaultTransformValue(key)
                : props[key];
        }
        /**
         * An independent transform's origin is never read from the DOM, so it
         * starts from its latest or default value and renders on mount.
         */
        getDefaultValue(key) {
            return transformProps.has(key)
                ? this.latestValues[key] ?? defaultTransformValue(key)
                : undefined;
        }
        readValueFromInstance(instance, key) {
            if (transformProps.has(key)) {
                const defaultType = getDefaultValueType(key);
                return defaultType ? defaultType.default || 0 : 0;
            }
            if (cssStyleProperties.includes(key)) {
                const computedStyle = getComputedStyle(instance);
                const value = computedStyle[key];
                if (typeof value === "string" && value)
                    return value.trim();
            }
            key = !camelCaseAttributes.has(key) ? camelToDash(key) : key;
            return instance.getAttribute(key);
        }
        scrapeMotionValuesFromProps(props, prevProps, visualElement) {
            return scrapeMotionValuesFromProps(props, prevProps, visualElement);
        }
        build(renderState, latestValues, props) {
            buildSVGAttrs(renderState, latestValues, this.isSVGTag, props.transformTemplate, props.style);
        }
        renderInstance(instance, renderState, styleProp, projection) {
            renderSVG(instance, renderState, styleProp, projection);
        }
        mount(instance) {
            this.isSVGTag = isSVGTag(instance.tagName);
            super.mount(instance);
        }
    }

    function shallowCompare(next, prev) {
        if (!Array.isArray(prev))
            return false;
        const prevLength = prev.length;
        if (prevLength !== next.length)
            return false;
        for (let i = 0; i < prevLength; i++) {
            if (prev[i] !== next[i])
                return false;
        }
        return true;
    }

    const reversePriorityOrder = [...variantPriorityOrder].reverse();
    /**
     * The transition a value uses when it leaves a state (#1725): the state's
     * own transition when `out: true`, or the `out` transition itself.
     * Value-specific keys are resolved by animateTarget.
     */
    const getOutTransition = (transition) => transition?.out === true ? transition : transition?.out;
    /**
     * Diffs the element's animation props (one layer per AnimationType, highest
     * priority wins each value) against the previous call and starts animations
     * for what changed.
     *
     * Uses `any` type for visualElement to avoid circular dependencies. It reads
     * props, parent, presenceContext, variantChildren, enteringChildren,
     * manuallyAnimateOnMount, blockInitialAnimation, getValue(),
     * getBaseTargetFromProps(), baseTarget and initialValues.
     */
    function createAnimationState(visualElement) {
        let animate = (animations) => Promise.all(animations.map(({ animation, options }) => animateVisualElement(visualElement, animation, options)));
        let state = createState();
        let isInitialRender = true;
        /**
         * After a reset (StrictMode, Suspense, AnimatePresence re-entry) the next
         * animateChanges() mounts again, but initial={false} no longer applies.
         */
        let wasReset = false;
        function animateChanges(changedActiveType) {
            const { props, parent, manuallyAnimateOnMount } = visualElement;
            const { initial } = props;
            const isMounting = isInitialRender || wasReset;
            const animations = [];
            const resolveInitial = (definition = initial) => (typeof definition !== "boolean" &&
                resolveVariant(visualElement, Array.isArray(definition) ? definition[0] : definition, visualElement.presenceContext?.custom)) ||
                undefined;
            /**
             * Values removed from a type, mapped to the out transition of the
             * state they're leaving. A lower-priority type that defines them
             * animates them back, otherwise they fall back to a base target.
             */
            const removedKeys = new Map();
            /**
             * Values claimed by active, higher-priority types.
             */
            let encounteredKeys = {};
            /**
             * Once a type has been deactivated, lower-priority variant labels
             * re-animate so variant children animate back too.
             */
            let removedVariantIndex = Infinity;
            /**
             * Variant labels are inherited from the closest variant-controlling
             * ancestor, unless an element on the way has inherit={false}.
             */
            let source = visualElement;
            do
                source = source.props.inherit !== false && source.parent;
            while (source && !source.isControllingVariants);
            /**
             * Mounting leaves initial, so values use its out transition. Like the
             * other types, variant children inherit initial's label.
             */
            const initialOut = isMounting &&
                getOutTransition(resolveInitial(initial ?? (source && source.props.initial))
                    ?.transition);
            reversePriorityOrder.forEach((type, i) => {
                const typeState = state[type];
                const ownProp = props[type];
                const inheritedProp = source && source.props[type];
                const prop = ownProp !== undefined
                    ? ownProp
                    : isVariantLabel(inheritedProp) || inheritedProp === false
                        ? inheritedProp
                        : undefined;
                const propIsVariant = isVariantLabel(prop);
                const activeDelta = type === changedActiveType ? typeState.isActive : null;
                /**
                 * Inherited labels are animated by the parent through
                 * variantChildren, unless this element mounted after its parent.
                 */
                const isInherited = propIsVariant &&
                    ownProp === undefined &&
                    !(isMounting && manuallyAnimateOnMount);
                typeState.protectedKeys = { ...encounteredKeys };
                if ((!typeState.isActive && activeDelta === null) ||
                    (!prop && !typeState.prevProp) ||
                    isAnimationControls(prop) ||
                    typeof prop === "boolean") {
                    return;
                }
                /**
                 * Set after the skip above, so deactivating a type that has nothing
                 * to animate (e.g. whileTap with no prop) doesn't re-run the variants
                 * below it.
                 */
                if (activeDelta === false)
                    removedVariantIndex = i;
                /**
                 * Don't re-resolve a running exit: a changed custom would start
                 * new value animations that stop the originals, leaving the exit
                 * promise unresolved and the element stuck in the DOM.
                 */
                if (type === "exit" && typeState.isActive && activeDelta !== true) {
                    encounteredKeys = {
                        ...encounteredKeys,
                        ...typeState.prevResolvedValues,
                    };
                    return;
                }
                const variantDidChange = checkVariantsDidChange(typeState.prevProp, prop);
                let shouldAnimateType = variantDidChange ||
                    (propIsVariant &&
                        ((activeDelta && !isInherited) || i > removedVariantIndex));
                let handledRemovedValues = false;
                const definitionList = Array.isArray(prop) ? prop : [prop];
                let resolvedValues = {};
                let out;
                if (activeDelta !== false) {
                    for (const definition of definitionList) {
                        const { transition, transitionEnd, ...target } = resolveVariant(visualElement, definition, getTypeCustom(visualElement, type)) || {};
                        resolvedValues = {
                            ...resolvedValues,
                            ...target,
                            ...transitionEnd,
                        };
                        /**
                         * One out transition per type. With a list of labels,
                         * the last one that sets out applies to all its values.
                         */
                        out = getOutTransition(transition) || out;
                    }
                }
                const { prevResolvedValues } = typeState;
                for (const key in { ...prevResolvedValues, ...resolvedValues }) {
                    if (key in encounteredKeys)
                        continue;
                    const next = resolvedValues[key];
                    const prev = prevResolvedValues[key];
                    /**
                     * Keyframes compare by value, but replay whenever the
                     * variant label changed.
                     */
                    const valueHasChanged = Array.isArray(next) && Array.isArray(prev)
                        ? !shallowCompare(next, prev) || variantDidChange
                        : next !== prev;
                    let outTransition;
                    if (valueHasChanged && (next === undefined || next === null)) {
                        /**
                         * The highest-priority state a value leaves wins.
                         */
                        removedKeys.has(key) ||
                            removedKeys.set(key, typeState.prevOut);
                    }
                    else if (valueHasChanged ||
                        (next !== undefined && removedKeys.has(key))) {
                        shouldAnimateType = true;
                        outTransition = removedKeys.get(key) || initialOut;
                        if (removedKeys.delete(key))
                            handledRemovedValues = true;
                        typeState.needsAnimating[key] = true;
                        const motionValue = visualElement.getValue(key);
                        if (motionValue)
                            motionValue.liveStyle = false;
                    }
                    else {
                        typeState.protectedKeys[key] = true;
                    }
                    typeState.out[key] = outTransition;
                }
                typeState.prevProp = prop;
                typeState.prevResolvedValues = resolvedValues;
                typeState.prevOut = out;
                if (typeState.isActive) {
                    encounteredKeys = { ...encounteredKeys, ...resolvedValues };
                }
                if (shouldAnimateType &&
                    (!(isInherited && variantDidChange) || handledRemovedValues)) {
                    for (const animation of definitionList) {
                        const options = { type };
                        /**
                         * Elements that mount into an already-mounted parent
                         * animate themselves, staggered by the parent variant's
                         * delayChildren.
                         */
                        if (typeof animation === "string" &&
                            isMounting &&
                            manuallyAnimateOnMount &&
                            parent?.enteringChildren) {
                            const delayChildren = resolveVariant(parent, animation)
                                ?.transition?.delayChildren;
                            options.delay = calcChildStagger(parent.enteringChildren, visualElement, delayChildren);
                        }
                        animations.push({ animation, options });
                    }
                }
            });
            /**
             * Removed values that no lower-priority type defines animate back to
             * initial, then style, then the value as first read. If initial no
             * longer defines a value it once did, it stays where it is.
             */
            if (removedKeys.size) {
                const fallbackAnimation = {};
                const resolvedInitial = resolveInitial();
                let fallbackTransition = resolvedInitial?.transition;
                removedKeys.forEach((outTransition, key) => {
                    if (outTransition) {
                        fallbackTransition = {
                            ...(fallbackTransition ||
                                visualElement.getDefaultTransition()),
                            [key]: outTransition,
                        };
                    }
                    const motionValue = visualElement.getValue(key);
                    if (motionValue)
                        motionValue.liveStyle = true;
                    const fromInitial = resolvedInitial && !Array.isArray(initial)
                        ? resolvedInitial[key]
                        : undefined;
                    const fromProps = visualElement.getBaseTargetFromProps(props, key);
                    fallbackAnimation[key] =
                        (fromInitial !== undefined
                            ? fromInitial
                            : fromProps !== undefined && !isMotionValue(fromProps)
                                ? fromProps
                                : visualElement.initialValues[key] === undefined
                                    ? visualElement.baseTarget[key]
                                    : undefined) ?? null;
                    /**
                     * If it stays where it is, that's now its base. Otherwise a
                     * later removal (like a gesture ending) would also stay,
                     * leaving the value stuck. Stop first so accelerated
                     * animations sync the value they reached. In practice initial
                     * only changes like this with Fast Refresh, so this is
                     * dev-only (#3787).
                     */
                    if (fallbackAnimation[key] === null &&
                        visualElement.initialValues[key] !== undefined) {
                        delete visualElement.initialValues[key];
                        motionValue?.stop();
                        visualElement.baseTarget[key] = motionValue?.get();
                    }
                });
                if (fallbackTransition) {
                    fallbackAnimation.transition = fallbackTransition;
                }
                animations.push({ animation: fallbackAnimation });
            }
            const blockAnimation = (isMounting && visualElement.blockInitialAnimation) ||
                (isInitialRender &&
                    !manuallyAnimateOnMount &&
                    (props.initial === false || props.initial === props.animate));
            isInitialRender = wasReset = false;
            return !blockAnimation && animations.length
                ? animate(animations)
                : Promise.resolve();
        }
        /**
         * Change whether a certain animation type is active.
         */
        function setActive(type, isActive) {
            if (state[type].isActive === isActive)
                return Promise.resolve();
            visualElement.variantChildren?.forEach((child) => child.animationState?.setActive(type, isActive));
            state[type].isActive = isActive;
            const animations = animateChanges(type);
            for (const key in state) {
                state[key].protectedKeys = {};
            }
            return animations;
        }
        return {
            animateChanges,
            setActive,
            /**
             * Allows tests to inject a mocked animate function.
             * @internal
             */
            setAnimateFunction: (makeAnimator) => {
                animate = makeAnimator(visualElement);
            },
            getState: () => state,
            reset: () => {
                state = createState();
                wasReset = true;
            },
        };
    }
    function checkVariantsDidChange(prev, next) {
        if (typeof next === "string") {
            return next !== prev;
        }
        else if (Array.isArray(next)) {
            return !shallowCompare(next, prev);
        }
        return false;
    }
    function createState() {
        const state = {};
        for (const type of variantPriorityOrder) {
            state[type] = {
                isActive: type === "animate",
                protectedKeys: {},
                needsAnimating: {},
                prevResolvedValues: {},
                out: {},
            };
        }
        return state;
    }

    const numVariantProps = variantProps.length;
    /**
     * Get variant context from a visual element's parent chain.
     * Uses `any` type for visualElement to avoid circular dependencies.
     */
    function getVariantContext(visualElement) {
        if (!visualElement)
            return undefined;
        if (!visualElement.isControllingVariants) {
            const context = visualElement.parent
                ? getVariantContext(visualElement.parent) || {}
                : {};
            if (visualElement.props.initial !== undefined) {
                context.initial = visualElement.props.initial;
            }
            return context;
        }
        const context = {};
        for (let i = 0; i < numVariantProps; i++) {
            const name = variantProps[i];
            const prop = visualElement.props[name];
            if (isVariantLabel(prop) || prop === false) {
                context[name] = prop;
            }
        }
        return context;
    }

    const notify = (node) => !node.isLayoutDirty && node.willUpdate(false);
    function nodeGroup() {
        const nodes = new Set();
        const subscriptions = new WeakMap();
        const dirtyAll = () => nodes.forEach(notify);
        return {
            add: (node) => {
                nodes.add(node);
                subscriptions.set(node, node.addEventListener("willUpdate", dirtyAll));
            },
            remove: (node) => {
                nodes.delete(node);
                const unsubscribe = subscriptions.get(node);
                if (unsubscribe) {
                    unsubscribe();
                    subscriptions.delete(node);
                }
                dirtyAll();
            },
            dirty: dirtyAll,
        };
    }

    /**
     * Animate layout changes made within `updateDom` on elements tagged
     * with `data-layout` or `data-layout-id`.
     *
     * ```
     * animateLayout(() => {
     *     element.style.justifyContent = "flex-end"
     * })
     * ```
     */
    function animateLayout(scopeOrUpdateDom, updateDomOrOptions, options) {
        const { scope, updateDom, defaultOptions } = parseAnimateLayoutArgs(scopeOrUpdateDom, updateDomOrOptions, options);
        const builder = new LayoutAnimationBuilder(scope, updateDom, {
            ...activeScope.current?.transition,
            ...defaultOptions,
        });
        addBuilderToScope(builder);
        return builder;
    }

    /**
     * @deprecated
     *
     * Import as `frame` instead.
     */
    const sync = frame;
    /**
     * @deprecated
     *
     * Use cancelFrame(callback) instead.
     */
    const cancelSync = stepsOrder.reduce((acc, key) => {
        acc[key] = (process) => cancelFrame(process);
        return acc;
    }, {});

    function isDOMKeyframes(keyframes) {
        return typeof keyframes === "object" && !Array.isArray(keyframes);
    }

    function resolveSubjects(subject, keyframes, scope, selectorCache) {
        if (subject == null) {
            return [];
        }
        if (typeof subject === "string" && isDOMKeyframes(keyframes)) {
            return resolveElements(subject, scope, selectorCache);
        }
        else if (subject instanceof NodeList) {
            return Array.from(subject);
        }
        else if (Array.isArray(subject)) {
            return subject.filter((s) => s != null);
        }
        else {
            return [subject];
        }
    }

    function calculateRepeatDuration(duration, repeat, repeatDelay) {
        return duration * (repeat + 1) + repeatDelay * repeat;
    }

    /**
     * The time of a label, or a label with an offset like "label+1" or
     * "label-0.5". An exact label name wins over an offset.
     */
    function calcLabelTime(position, labels) {
        if (labels.has(position))
            return labels.get(position);
        const [, name, offset] = position.match(/^(.+?)([+-][\d.]+)$/) || [];
        return labels.has(name)
            ? Math.max(0, labels.get(name) + parseFloat(offset))
            : undefined;
    }
    /**
     * Given a absolute or relative time definition and current/prev time state of the sequence,
     * calculate an absolute time for the next keyframes.
     */
    function calcNextTime(current, next, prev, labels) {
        if (typeof next === "number") {
            return next;
        }
        else if (next.startsWith("-") || next.startsWith("+")) {
            return Math.max(0, current + parseFloat(next));
        }
        else if (next === "<") {
            return prev;
        }
        else if (next.startsWith("<")) {
            return Math.max(0, prev + parseFloat(next.slice(1)));
        }
        else {
            return calcLabelTime(next, labels) ?? current;
        }
    }

    function eraseKeyframes(sequence, startTime, endTime) {
        for (let i = 0; i < sequence.length; i++) {
            const keyframe = sequence[i];
            if (keyframe.at > startTime && keyframe.at < endTime) {
                removeItem(sequence, keyframe);
                // If we remove this item we have to push the pointer back one
                i--;
            }
        }
    }
    function addKeyframes(sequence, keyframes, easing, offset, startTime, endTime) {
        /**
         * Erase every existing value between currentTime and targetTime,
         * this will essentially splice this timeline into any currently
         * defined ones.
         */
        eraseKeyframes(sequence, startTime, endTime);
        for (let i = 0; i < keyframes.length; i++) {
            sequence.push({
                value: keyframes[i],
                at: mixNumber$1(startTime, endTime, offset[i]),
                easing: getEasingForSegment(easing, i),
            });
        }
    }

    /**
     * Take an array of times that represent repeated keyframes. For instance
     * if we have original times of [0, 0.5, 1] then our repeated times will
     * be [0, 0.5, 1, 1, 1.5, 2]. Loop over the times and scale them back
     * down to a 0-1 scale.
     *
     * `repeatDelayUnits` is the repeatDelay expressed in units of a single
     * iteration's duration, so the total span equals `(repeat + 1) + repeat * repeatDelayUnits`.
     */
    function normalizeTimes(times, repeat, repeatDelayUnits = 0) {
        const totalUnits = repeat + 1 + repeat * repeatDelayUnits;
        for (let i = 0; i < times.length; i++) {
            times[i] = times[i] / totalUnits;
        }
    }

    function compareByTime(a, b) {
        if (a.at === b.at) {
            if (a.value === null)
                return 1;
            if (b.value === null)
                return -1;
            return 0;
        }
        else {
            return a.at - b.at;
        }
    }

    const defaultSegmentEasing = "easeInOut";
    const MAX_REPEAT = 20;
    function createAnimationsFromSequence(sequence, { defaultTransition = {}, ...sequenceTransition } = {}, scope, generators, info) {
        const defaultDuration = defaultTransition.duration || 0.3;
        const animationDefinitions = new Map();
        const sequences = new Map();
        const elementCache = {};
        const timeLabels = new Map();
        let prevTime = 0;
        let currentTime = 0;
        let totalDuration = 0;
        /**
         * Build the timeline by mapping over the sequence array and converting
         * the definitions into keyframes and offsets with absolute time values.
         * These will later get converted into relative offsets in a second pass.
         *
         * Nested sequences are resolved recursively. `base` is the absolute
         * start of the sequence being resolved, so numeric `at` values inside
         * a nested sequence are relative to where it starts. Returns the time
         * the sequence ends.
         */
        const resolveSequence = (sequence, base) => {
            let sequenceEnd = base;
            const resolveTime = (at) => typeof at === "number"
                ? base + at
                : calcNextTime(currentTime, at, prevTime, timeLabels);
            for (let i = 0; i < sequence.length; i++) {
                const segment = sequence[i];
                /**
                 * If this is a timeline label, mark it and skip the rest of this iteration.
                 */
                if (typeof segment === "string") {
                    timeLabels.set(segment, currentTime);
                    continue;
                }
                else if (!Array.isArray(segment)) {
                    const start = segment.at === undefined
                        ? currentTime
                        : resolveTime(segment.at);
                    if ("sequence" in segment) {
                        /**
                         * Resolve the nested sequence from its start. Afterwards
                         * "<" points at its start and the next segment follows
                         * its end, as if it were a single segment.
                         */
                        prevTime = currentTime = start;
                        currentTime = resolveSequence(segment.sequence, start);
                        prevTime = start;
                        sequenceEnd = Math.max(sequenceEnd, currentTime);
                    }
                    else {
                        timeLabels.set(segment.name, start);
                    }
                    continue;
                }
                let [subject, keyframes, transition = {}] = segment;
                /**
                 * If a relative or absolute time value has been specified we need to resolve
                 * it in relation to the currentTime.
                 */
                if (transition.at !== undefined) {
                    currentTime = resolveTime(transition.at);
                }
                /**
                 * Keep track of the maximum duration in this definition. This will be
                 * applied to currentTime once the definition has been parsed.
                 */
                let maxDuration = 0;
                const resolveValueSequence = (valueKeyframes, valueTransition, valueSequence, elementIndex = 0, numSubjects = 0) => {
                    const valueKeyframesAsList = keyframesAsList(valueKeyframes);
                    const { delay = 0, times = defaultOffset$1(valueKeyframesAsList), type = defaultTransition.type || "keyframes", repeat, repeatType, repeatDelay = 0, ...remainingTransition } = valueTransition;
                    let { ease = defaultTransition.ease || "easeOut", duration } = valueTransition;
                    /**
                     * The value animates as one, so it takes the first mixer
                     * given for it, or else the default transition's.
                     */
                    valueSequence.mixer || (valueSequence.mixer = valueTransition.mixer);
                    /**
                     * Resolve stagger() if defined.
                     */
                    const calculatedDelay = typeof delay === "function"
                        ? delay(elementIndex, numSubjects)
                        : delay;
                    /**
                     * If this animation should and can use a spring, generate a spring easing function.
                     */
                    const numKeyframes = valueKeyframesAsList.length;
                    const createGenerator = isGenerator(type)
                        ? type
                        : generators?.[type || "keyframes"];
                    if (numKeyframes <= 2 && createGenerator) {
                        /**
                         * As we're creating an easing function from a spring,
                         * ideally we want to generate it using the real distance
                         * between the two keyframes. However this isn't always
                         * possible - in these situations we use 0-100.
                         */
                        let absoluteDelta = 100;
                        if (numKeyframes === 2 &&
                            isNumberKeyframesArray(valueKeyframesAsList)) {
                            const delta = valueKeyframesAsList[1] - valueKeyframesAsList[0];
                            absoluteDelta = Math.abs(delta);
                        }
                        const springTransition = {
                            ...defaultTransition,
                            ...remainingTransition,
                        };
                        if (duration !== undefined) {
                            springTransition.duration =
                                secondsToMilliseconds(duration);
                        }
                        const springEasing = createGeneratorEasing(springTransition, absoluteDelta, createGenerator);
                        ease = springEasing.ease;
                        duration = springEasing.duration;
                    }
                    duration ?? (duration = defaultDuration);
                    const startTime = currentTime + calculatedDelay;
                    /**
                     * If there's only one time offset of 0, fill in a second with length 1
                     */
                    if (times.length === 1 && times[0] === 0) {
                        times[1] = 1;
                    }
                    /**
                     * Fill out if offset if fewer offsets than keyframes
                     */
                    const remainder = times.length - valueKeyframesAsList.length;
                    remainder > 0 && fillOffset(times, remainder);
                    /**
                     * If only one value has been set, ie [1], push a null to the start of
                     * the keyframe array. This will let us mark a keyframe at this point
                     * that will later be hydrated with the previous value.
                     */
                    valueKeyframesAsList.length === 1 &&
                        valueKeyframesAsList.unshift(null);
                    /**
                     * Segments can't express `repeat: Infinity` or very large
                     * counts — they'd leave dead time after the segment or
                     * explode the keyframe array. Ignore with a warning.
                     */
                    if (repeat) {
                        typeof process !== "undefined" &&
                            "development" !== "production" &&
                            exports.warning(repeat < MAX_REPEAT, `Sequence segments can't repeat ${repeat} times — ignoring repeat option. Use a value below ${MAX_REPEAT} or apply repeat at the sequence level instead.`);
                    }
                    if (repeat && repeat < MAX_REPEAT) {
                        /**
                         * Express repeatDelay in units of a single iteration's duration
                         * so it can be added to the per-iteration time offsets below
                         * before they're normalized to 0-1.
                         */
                        const repeatDelayUnits = duration > 0 ? repeatDelay / duration : 0;
                        duration = calculateRepeatDuration(duration, repeat, repeatDelay);
                        const originalKeyframes = [...valueKeyframesAsList];
                        const originalTimes = [...times];
                        ease = Array.isArray(ease) ? [...ease] : [ease];
                        const originalEase = [...ease];
                        /**
                         * For reverse/mirror, alternate iterations play the segment
                         * backwards. mirror matches JSAnimation's mirroredGenerator:
                         * reversed keyframes, easings unchanged. reverse matches
                         * JSAnimation's iterationProgress = 1 - p: reversed
                         * keyframes, easing array reversed AND each function easing
                         * mapped through reverseEasing (string easings unchanged —
                         * they're resolved later by the keyframes engine).
                         */
                        const isFlipping = repeatType === "reverse" || repeatType === "mirror";
                        let flippedKeyframes = originalKeyframes;
                        let flippedEases = originalEase;
                        if (isFlipping) {
                            flippedKeyframes = [...originalKeyframes].reverse();
                            if (repeatType === "reverse") {
                                flippedEases = [...originalEase]
                                    .reverse()
                                    .map((e) => typeof e === "function"
                                    ? reverseEasing(e)
                                    : e);
                            }
                        }
                        for (let repeatIndex = 0; repeatIndex < repeat; repeatIndex++) {
                            const isFlipped = isFlipping && repeatIndex % 2 === 0;
                            const iterKeyframes = isFlipped
                                ? flippedKeyframes
                                : originalKeyframes;
                            const iterEase = isFlipped ? flippedEases : originalEase;
                            const iterStartOffset = (repeatIndex + 1) * (1 + repeatDelayUnits);
                            /**
                             * If repeatDelay is set, hold the previous iteration's
                             * final value through the delay by inserting a keyframe
                             * at the moment the next iteration begins.
                             */
                            if (repeatDelayUnits > 0) {
                                valueKeyframesAsList.push(valueKeyframesAsList[valueKeyframesAsList.length - 1]);
                                times.push(iterStartOffset);
                                ease.push("linear");
                            }
                            valueKeyframesAsList.push(...iterKeyframes);
                            for (let keyframeIndex = 0; keyframeIndex < iterKeyframes.length; keyframeIndex++) {
                                times.push(originalTimes[keyframeIndex] + iterStartOffset);
                                ease.push(keyframeIndex === 0
                                    ? "linear"
                                    : getEasingForSegment(iterEase, keyframeIndex - 1));
                            }
                        }
                        normalizeTimes(times, repeat, repeatDelayUnits);
                    }
                    const targetTime = startTime + duration;
                    /**
                     * Add keyframes, mapping offsets to absolute time.
                     */
                    addKeyframes(valueSequence, valueKeyframesAsList, ease, times, startTime, targetTime);
                    maxDuration = Math.max(calculatedDelay + duration, maxDuration);
                    totalDuration = Math.max(targetTime, totalDuration);
                };
                if (isMotionValue(subject)) {
                    const subjectSequence = getSubjectSequence(subject, sequences);
                    resolveValueSequence(keyframes, transition, getValueSequence("default", subjectSequence));
                }
                else {
                    const subjects = resolveSubjects(subject, keyframes, scope, elementCache);
                    const numSubjects = subjects.length;
                    /**
                     * For every element in this segment, process the defined values.
                     */
                    for (let subjectIndex = 0; subjectIndex < numSubjects; subjectIndex++) {
                        /**
                         * Cast necessary, but we know these are of this type
                         */
                        keyframes = keyframes;
                        transition = transition;
                        const thisSubject = subjects[subjectIndex];
                        const subjectSequence = getSubjectSequence(thisSubject, sequences);
                        for (const key in keyframes) {
                            resolveValueSequence(keyframes[key], getValueTransition(transition, key), getValueSequence(key, subjectSequence), subjectIndex, numSubjects);
                        }
                    }
                }
                prevTime = currentTime;
                currentTime += maxDuration;
                sequenceEnd = Math.max(sequenceEnd, currentTime);
            }
            return sequenceEnd;
        };
        resolveSequence(sequence, 0);
        if (info) {
            info.duration = totalDuration;
            info.labels = timeLabels;
        }
        /**
         * For every element and value combination create a new animation.
         */
        sequences.forEach((valueSequences, element) => {
            for (const key in valueSequences) {
                const valueSequence = valueSequences[key];
                /**
                 * Arrange all the keyframes in ascending time order.
                 */
                valueSequence.sort(compareByTime);
                const keyframes = [];
                const valueOffset = [];
                const valueEasing = [];
                /**
                 * For each keyframe, translate absolute times into
                 * relative offsets based on the total duration of the timeline.
                 */
                for (let i = 0; i < valueSequence.length; i++) {
                    const { at, value, easing } = valueSequence[i];
                    keyframes.push(value);
                    valueOffset.push(progress(0, totalDuration, at));
                    valueEasing.push(easing || "easeOut");
                }
                /**
                 * If the first keyframe doesn't land on offset: 0
                 * provide one by duplicating the initial keyframe. This ensures
                 * it snaps to the first keyframe when the animation starts.
                 */
                if (valueOffset[0] !== 0) {
                    valueOffset.unshift(0);
                    keyframes.unshift(keyframes[0]);
                    valueEasing.unshift(defaultSegmentEasing);
                }
                /**
                 * If the last keyframe doesn't land on offset: 1
                 * provide one with a null wildcard value. This will ensure it
                 * stays static until the end of the animation.
                 */
                if (valueOffset[valueOffset.length - 1] !== 1) {
                    valueOffset.push(1);
                    keyframes.push(null);
                }
                if (!animationDefinitions.has(element)) {
                    animationDefinitions.set(element, {
                        keyframes: {},
                        transition: {},
                    });
                }
                const definition = animationDefinitions.get(element);
                definition.keyframes[key] = keyframes;
                /**
                 * Exclude `type` from defaultTransition since springs have been
                 * converted to duration-based easing functions in resolveValueSequence.
                 * Including `type: "spring"` would cause JSAnimation to error when
                 * the merged keyframes array has more than 2 keyframes.
                 */
                const { type: _type, ...remainingDefaultTransition } = defaultTransition;
                definition.transition[key] = {
                    ...remainingDefaultTransition,
                    duration: totalDuration,
                    ease: valueEasing,
                    times: valueOffset,
                    mixer: valueSequence.mixer || defaultTransition.mixer,
                    ...sequenceTransition,
                };
            }
        });
        return animationDefinitions;
    }
    function getSubjectSequence(subject, sequences) {
        !sequences.has(subject) && sequences.set(subject, {});
        return sequences.get(subject);
    }
    function getValueSequence(name, sequences) {
        if (!sequences[name])
            sequences[name] = [];
        return sequences[name];
    }
    function keyframesAsList(keyframes) {
        return Array.isArray(keyframes) ? keyframes : [keyframes];
    }
    function getValueTransition(transition, key) {
        return transition && transition[key]
            ? {
                ...transition,
                ...transition[key],
            }
            : { ...transition };
    }
    const isNumber = (keyframe) => typeof keyframe === "number";
    const isNumberKeyframesArray = (keyframes) => keyframes.every(isNumber);

    function isSingleValue(subject, keyframes) {
        return (isMotionValue(subject) ||
            typeof subject === "number" ||
            (typeof subject === "string" && !isDOMKeyframes(keyframes)));
    }
    /**
     * Implementation
     */
    function animateSubject(subject, keyframes, options, scope) {
        const animations = [];
        if (isSingleValue(subject, keyframes)) {
            animations.push(animateSingleValue(subject, isDOMKeyframes(keyframes)
                ? keyframes.default || keyframes
                : keyframes, options ? options.default || options : options));
        }
        else {
            // Gracefully handle null/undefined subjects (e.g., from querySelector returning null)
            if (subject == null) {
                return animations;
            }
            const subjects = resolveSubjects(subject, keyframes, scope);
            const numSubjects = subjects.length;
            exports.invariant(Boolean(numSubjects), "No valid elements provided.", "no-valid-elements");
            for (let i = 0; i < numSubjects; i++) {
                const thisSubject = subjects[i];
                const transition = { ...options };
                /**
                 * Resolve stagger function if provided.
                 */
                if ("delay" in transition &&
                    typeof transition.delay === "function") {
                    transition.delay = transition.delay(i, numSubjects);
                }
                if (thisSubject instanceof Element) {
                    /**
                     * An element already owned by a VisualElement (a <motion.*>
                     * component or animateLayout()) animates its values so they
                     * share one renderer. Anything else is driven through
                     * styleEffect (or svgEffect) and the DOM keyframe resolver,
                     * without creating a VisualElement.
                     */
                    animations.push(...animateElement(thisSubject, keyframes, transition, visualElementStore.get(thisSubject)));
                }
                else {
                    /**
                     * Registered effects (animate.addEffect) claim non-DOM
                     * subjects before we fall back to writing plain properties.
                     */
                    animations.push(...animateEffectSubject(findEffect(thisSubject) ?? propEffect, thisSubject, keyframes, transition));
                }
            }
        }
        return animations;
    }

    function animateSequence(sequence, options, scope, info) {
        const animations = [];
        /**
         * Pre-process: replace function segments with MotionValue segments,
         * subscribe callbacks immediately
         */
        const processedSequence = sequence.map((segment) => {
            if (Array.isArray(segment) && typeof segment[0] === "function") {
                const callback = segment[0];
                const mv = motionValue(0);
                mv.on("change", callback);
                if (segment.length === 1) {
                    return [mv, [0, 1]];
                }
                else if (segment.length === 2) {
                    return [mv, [0, 1], segment[1]];
                }
                else {
                    return [mv, segment[1], segment[2]];
                }
            }
            return segment;
        });
        const animationDefinitions = createAnimationsFromSequence(processedSequence, options, scope, { spring }, info);
        animationDefinitions.forEach(({ keyframes, transition }, subject) => {
            animations.push(...animateSubject(subject, keyframes, transition));
        });
        return animations;
    }

    let markerId = 0;
    /**
     * Copy a segment with a new `at`, adding a transition if it has none.
     */
    function withAt(segment, at) {
        const copy = [...segment];
        const i = typeof copy[0] === "function" ? Math.max(1, copy.length - 1) : 2;
        copy[i] = { ...copy[i], at };
        return copy;
    }
    const label = (name, at) => at === undefined ? name : { name, at };
    /**
     * Rewind to the start and stop, so every value is back at the value it
     * started from and the next build reads those values as its origin.
     */
    function rewind(animation) {
        animation.pause();
        animation.time = 0;
        animation.stop();
    }
    /**
     * A sequence that can be changed after it's created. Segments, labels,
     * callbacks, pauses and other timelines can be added, moved and removed
     * at any point, including while it plays.
     *
     * Changes are batched and applied once per microtask. Each change
     * rebuilds the underlying animations from the timeline's starting
     * values, then restores the playhead, speed and play state, so changes
     * made while playing take effect without a jump.
     */
    class Timeline {
        /**
         * `animations` are already running animations of `items`, as
         * animate() makes them. The timeline plays these until it's first
         * changed, so it costs nothing over the animations themselves until
         * then.
         */
        constructor(items = [], options = {}, animations) {
            this.options = options;
            this.entries = [];
            /**
             * The repeat the playhead is in, to detect when it starts another.
             */
            this.repeatIndex = 0;
            this.prevTime = 0;
            this.markers = [];
            this.labels = new Map();
            this.totalDuration = 0;
            this.isDirty = false;
            this.isDone = false;
            this.isRebuilding = false;
            this.playbackSpeed = 1;
            /**
             * The scopeMotion() scope this was created in. Rebuilds run in it, so
             * selectors resolve in its root and cancel() restores what they
             * animate.
             */
            this.motionScope = activeScope.current;
            /**
             * Set when the scope stops, so later changes don't restart it.
             */
            this.isKilled = false;
            /**
             * True while this plays the animations it was created with, before
             * any change compiles it as a sequence.
             */
            this.isWrapped = false;
            this.stop = () => {
                this.flush();
                this.group?.stop();
            };
            this.isPaused = options.autoplay === false;
            this.newFinished();
            items.forEach((item) => this.add(item));
            if (animations) {
                this.isDirty = false;
                this.isWrapped = true;
                this.group = new GroupAnimationWithThen(animations);
                this.watch();
            }
            else {
                /**
                 * Build now, like animate(), so selectors resolve while a
                 * scope is attached. Later changes are batched.
                 */
                this.invalidate();
                this.flush();
            }
            /**
             * Register with the scope (for instance from useAnimate()) so it
             * stops when the scope is torn down.
             */
            const { scope } = options;
            if (scope) {
                scope.animations.push(this);
                this.finished.then(() => removeItem(scope.animations, this));
            }
        }
        /**
         * Add a segment, label or timeline. `at` overrides any `at` already
         * on the segment. The item itself is the handle for `move()` and
         * `remove()`.
         */
        add(item, at) {
            if (item instanceof Timeline)
                item.adopt(this);
            return this.push({ item, at });
        }
        /**
         * Fire a callback when the playhead crosses `at`, in either direction.
         * It receives the direction: 1 forwards, -1 backwards.
         */
        call(callback, at) {
            return this.push({
                item: callback,
                at,
                marker: { name: "_m" + markerId++, time: 0, callback },
            });
        }
        /**
         * Pause when the playhead reaches `at`.
         */
        addPause(at, callback) {
            return this.push({
                item: callback || {},
                at,
                marker: { name: "_m" + markerId++, time: 0, callback, pause: true },
            });
        }
        /**
         * Change where an item starts.
         */
        move(item, at) {
            this.entries.forEach((entry) => {
                if (entry.item === item)
                    entry.at = at;
            });
            return this.invalidate();
        }
        /**
         * Remove a segment, label, callback or timeline.
         */
        remove(item) {
            if (item instanceof Timeline)
                item.parent = undefined;
            this.entries = this.entries.filter((entry) => entry.item !== item);
            return this.invalidate();
        }
        clear() {
            this.entries = [];
            return this.invalidate();
        }
        /**
         * The time of a label in seconds, or `undefined` if there's no label
         * with this name.
         */
        getLabelTime(name) {
            this.flush();
            return this.labels.get(name);
        }
        /**
         * Jump to a time in seconds or a label.
         */
        seek(position) {
            this.time = this.resolve(position);
            return this;
        }
        /**
         * Play forwards or backwards to a time or label, then pause there.
         */
        playTo(position) {
            const target = this.resolve(position);
            const speed = Math.abs(this.speed);
            this.speed = target < this.time ? -speed : speed;
            this.stopAt = target;
            this.clock || this.invalidate();
            this.play();
            return this;
        }
        reverse() {
            this.speed = -this.speed;
            this.play();
            return this;
        }
        get progress() {
            return this.duration ? this.time / this.duration : 0;
        }
        set progress(progress) {
            this.time = progress * this.duration;
        }
        get time() {
            return this.active()?.time ?? 0;
        }
        set time(time) {
            this.flush();
            this.prevTime = time;
            this.group && (this.group.time = time);
            this.repeatIndex = this.currentRepeat();
        }
        get speed() {
            return this.playbackSpeed;
        }
        set speed(speed) {
            this.playbackSpeed = speed;
            this.group && (this.group.speed = speed);
        }
        get duration() {
            this.flush();
            return this.isWrapped ? this.group.duration : this.totalDuration;
        }
        get iterationDuration() {
            this.flush();
            return this.isWrapped
                ? this.group.iterationDuration
                : this.totalDuration;
        }
        get state() {
            return this.active()?.state ?? "idle";
        }
        get startTime() {
            return this.active()?.startTime ?? null;
        }
        play() {
            this.flush();
            this.isPaused = false;
            this.group?.play();
            /**
             * Watch after playing, so it waits for the restarted animations
             * rather than the ones that already finished.
             */
            if (this.isDone) {
                this.newFinished();
                this.watch();
            }
        }
        pause() {
            this.flush();
            this.isPaused = true;
            this.group?.pause();
        }
        cancel() {
            this.flush();
            this.group?.cancel();
        }
        complete() {
            this.flush();
            this.group?.complete();
        }
        attachTimeline(timeline) {
            this.flush();
            this.scrollTimeline = timeline;
            this.detachScroll = this.group?.attachTimeline(timeline);
            return () => {
                this.scrollTimeline = undefined;
                this.detachScroll?.();
            };
        }
        then(onResolve, onReject) {
            return this.finished.then(onResolve, onReject);
        }
        /**
         * The current animations, if any are running. Skipped animations
         * (skipAnimations, reduced motion) can leave the group empty.
         */
        active() {
            this.flush();
            return this.group?.animations.length ? this.group : undefined;
        }
        push(entry) {
            this.entries.push(entry);
            return this.invalidate();
        }
        /**
         * Schedule a rebuild. A nested timeline passes changes up, as it's
         * built as part of its parent.
         */
        invalidate() {
            if (this.parent) {
                this.parent.invalidate();
            }
            else if (!this.isDirty) {
                this.isDirty = true;
                queueMicrotask(() => this.flush());
            }
            return this;
        }
        /**
         * Apply pending changes now, so reads straight after a change
         * reflect it.
         */
        flush() {
            this.isDirty && !this.parent && !this.isKilled && this.build();
        }
        adopt(parent) {
            if (this.group) {
                rewind(this.group);
                this.group = undefined;
            }
            this.isDirty = false;
            this.parent = parent;
        }
        build() {
            this.isDirty = false;
            this.isWrapped = false;
            const prev = this.group;
            let time = 0;
            if (prev) {
                this.isRebuilding = true;
                if (this.scrollTimeline) {
                    /**
                     * Scroll-linked animations can't be seeked in seconds.
                     * Cancelling also returns them to their starting values,
                     * and the new build is attached to scroll instead.
                     */
                    this.detachScroll?.();
                    prev.cancel();
                }
                else {
                    time = prev.animations.length ? prev.time : 0;
                    rewind(prev);
                }
                this.isRebuilding = false;
            }
            const { defaultTransition, onComplete, onUpdate, onRepeat, onReverseComplete, autoplay, scope, ...options } = this.options;
            /**
             * Inherit MotionConfig settings from a useAnimate() scope.
             */
            const playback = {};
            if (scope?.reduceMotion !== undefined) {
                playback.reduceMotion = scope.reduceMotion;
            }
            if (scope?.skipAnimations !== undefined) {
                playback.skipAnimations = scope.skipAnimations;
            }
            Object.assign(playback, options);
            const markers = new Map();
            const info = {};
            const prevScope = activeScope.current;
            activeScope.current = this.motionScope;
            let animations;
            try {
                animations = animateSequence(this.toSequence(markers), { defaultTransition, ...playback }, scope, info);
            }
            finally {
                activeScope.current = prevScope;
            }
            const labels = info.labels;
            let duration = playback.duration ?? info.duration;
            /**
             * A `duration` option stretches every animation to fit, so scale
             * label and marker times to match.
             */
            const scale = info.duration ? duration / info.duration : 1;
            labels.forEach((time, name) => labels.set(name, time * scale));
            /**
             * Markers are resolved as labels. Move them out of the label map
             * and extend the duration to reach any marker past the end.
             */
            this.markers = [];
            markers.forEach((marker, name) => {
                marker.time = labels.get(name);
                labels.delete(name);
                duration = Math.max(duration, marker.time);
                this.markers.push(marker);
            });
            this.markers.sort((a, b) => a.time - b.time);
            this.labels = labels;
            this.totalDuration = duration;
            /**
             * Callbacks, pauses and playTo() watch a linear clock. Without
             * them, the timeline is only its animations.
             */
            this.clock = this.clockAnimation = undefined;
            if (this.markers.length ||
                this.stopAt !== undefined ||
                onUpdate ||
                onRepeat) {
                const clock = (this.clock = motionValue(0));
                clock.on("change", (t) => clock === this.clock && this.onClock(t));
                animations.unshift((this.clockAnimation = animateSingleValue(clock, [0, duration], {
                    ...playback,
                    duration,
                    ease: "linear",
                })));
            }
            const group = (this.group = new GroupAnimationWithThen(animations));
            time = Math.min(time, duration);
            if (this.isDone && time < duration)
                this.newFinished();
            if (this.scrollTimeline) {
                this.detachScroll = group.attachTimeline(this.scrollTimeline);
            }
            else {
                group.speed = this.playbackSpeed;
                if (this.isPaused)
                    group.pause();
                if (time)
                    group.time = time;
            }
            this.repeatIndex = this.currentRepeat();
            /**
             * Treat a start from 0 as coming from just before it, so markers
             * at 0 fire.
             */
            this.prevTime = time || -1;
            this.watch();
        }
        toSequence(markers) {
            return this.entries.map(({ item, at, marker }) => {
                if (marker) {
                    markers.set(marker.name, marker);
                    return label(marker.name, at);
                }
                if (item instanceof Timeline) {
                    return { sequence: item.toSequence(markers), at };
                }
                if (typeof item === "string")
                    return label(item, at);
                if (at === undefined)
                    return item;
                return Array.isArray(item)
                    ? withAt(item, at)
                    : { ...item, at };
            });
        }
        resolve(position) {
            this.flush();
            return typeof position === "number"
                ? position
                : calcLabelTime(position, this.labels) ?? this.time;
        }
        /**
         * The repeat the clock is in, from its time across all repeats.
         */
        currentRepeat() {
            const { repeat = 0, repeatDelay = 0, delay = 0 } = this.options;
            const cycle = this.totalDuration + repeatDelay;
            const time = (this.clockAnimation?.time ?? 0) - delay;
            return cycle && time > 0
                ? Math.min(repeat, Math.floor(time / cycle))
                : 0;
        }
        onClock(time) {
            let prevTime = this.prevTime;
            this.prevTime = time;
            if (this.isRebuilding)
                return;
            const { onUpdate, onRepeat, repeatType = "loop" } = this.options;
            onUpdate?.(time);
            const repeatIndex = this.currentRepeat();
            if (repeatIndex !== this.repeatIndex) {
                this.repeatIndex = repeatIndex;
                onRepeat?.();
                /**
                 * A loop jumps the playhead back to the start, or to the
                 * end when playing backwards. Finish crossing the repeat
                 * that ended, then cross the new one from its edge.
                 */
                if (repeatType === "loop") {
                    const isForward = this.speed > 0;
                    if (this.cross(prevTime, isForward ? this.totalDuration : 0)) {
                        return;
                    }
                    prevTime = isForward ? -1 : Infinity;
                }
            }
            this.cross(prevTime, time);
        }
        /**
         * Fire markers between two playhead times. Returns `true` if it
         * paused.
         */
        cross(from, to) {
            if (from === to)
                return;
            const isForward = to > from;
            const crossed = (t) => isForward ? t > from && t <= to : t < from && t >= to;
            const markers = isForward ? this.markers : [...this.markers].reverse();
            for (const marker of markers) {
                if (!crossed(marker.time))
                    continue;
                marker.callback?.(isForward ? 1 : -1);
                if (marker.pause)
                    return this.pauseAt(marker.time);
            }
            if (this.stopAt !== undefined && crossed(this.stopAt)) {
                this.pauseAt(this.stopAt);
                this.stopAt = undefined;
                return true;
            }
        }
        pauseAt(time) {
            this.pause();
            this.time = time;
            return true;
        }
        watch() {
            const group = this.group;
            group.finished.then(() => {
                if (group !== this.group || this.isDone)
                    return;
                this.isDone = true;
                const { onComplete, onReverseComplete } = this.options;
                /**
                 * Without onReverseComplete, onComplete fires in either
                 * direction, as it does for a single animation.
                 */
                const callback = (this.speed < 0 && onReverseComplete) || onComplete;
                callback?.();
                this.resolveFinished();
            });
        }
        newFinished() {
            this.isDone = false;
            this.finished = new Promise((resolve) => {
                this.resolveFinished = resolve;
            });
            /**
             * Stay in the scope while playing, including after a change
             * restarts a finished timeline.
             */
            const remove = this.motionScope?.add(() => {
                this.isKilled = true;
                this.stop();
            });
            remove && this.finished.then(remove);
        }
    }

    function isSequence(value) {
        return Array.isArray(value) && value.some(Array.isArray);
    }
    /**
     * Creates an animation function that is optionally scoped
     * to a specific element.
     */
    function createScopedAnimate(options = {}) {
        const { scope, reduceMotion, skipAnimations } = options;
        /**
         * Implementation
         */
        function scopedAnimate(subjectOrSequence, optionsOrKeyframes, options) {
            const scopeTransition = activeScope.current?.transition;
            const inherited = {};
            if (reduceMotion !== undefined)
                inherited.reduceMotion = reduceMotion;
            if (skipAnimations !== undefined)
                inherited.skipAnimations = skipAnimations;
            let timeline;
            if (isSequence(subjectOrSequence)) {
                const sequenceOptions = {
                    ...inherited,
                    ...optionsOrKeyframes,
                    scope,
                };
                if (scopeTransition) {
                    sequenceOptions.defaultTransition = {
                        ...scopeTransition,
                        ...sequenceOptions.defaultTransition,
                    };
                }
                timeline = new Timeline(subjectOrSequence, sequenceOptions);
            }
            else {
                // Extract top-level onComplete so it doesn't get applied per-value
                const { onComplete, ...rest } = options || {};
                const transition = {
                    ...inherited,
                    ...scopeTransition,
                    ...rest,
                };
                /**
                 * Play the animations directly, and only compile them as a
                 * sequence if the timeline is changed. Values animated from a
                 * number are animated via their onUpdate callback instead.
                 */
                const { onUpdate } = rest;
                const segment = (typeof subjectOrSequence === "number" ||
                    (typeof subjectOrSequence === "string" &&
                        (typeof optionsOrKeyframes === "string" ||
                            Array.isArray(optionsOrKeyframes)))
                    ? [
                        onUpdate || (() => { }),
                        Array.isArray(optionsOrKeyframes)
                            ? optionsOrKeyframes
                            : [subjectOrSequence, optionsOrKeyframes],
                        { ...transition, onUpdate: undefined },
                    ]
                    : [subjectOrSequence, optionsOrKeyframes, transition]);
                timeline = new Timeline([segment], { ...inherited, onComplete, scope }, animateSubject(subjectOrSequence, optionsOrKeyframes, transition, scope));
            }
            return timeline;
        }
        return scopedAnimate;
    }
    const animate = /* @__PURE__ */ Object.assign(
    /* @__PURE__ */ createScopedAnimate(), {
        /**
         * Register an effect so `animate()` can animate the subjects it
         * claims, for instance `animate.addEffect(threeEffect)`. The most
         * recently added effect is tested first. DOM elements are always
         * animated directly.
         */
        addEffect,
        removeEffect,
    });

    function animateElements(elementOrSelector, keyframes, options, scope) {
        // Gracefully handle null/undefined elements (e.g., from querySelector returning null)
        if (elementOrSelector == null) {
            return [];
        }
        const elements = resolveElements(elementOrSelector, scope);
        const numElements = elements.length;
        typeof process !== "undefined" &&
            "development" !== "production" &&
            exports.invariant(Boolean(numElements), "No valid elements provided.", "no-valid-elements");
        /**
         * WAAPI doesn't support interrupting animations.
         *
         * Therefore, starting animations requires a three-step process:
         * 1. Stop existing animations (write styles to DOM)
         * 2. Resolve keyframes (read styles from DOM)
         * 3. Create new animations (write styles to DOM)
         *
         * The hybrid `animate()` function uses AsyncAnimation to resolve
         * keyframes before creating new animations, which removes style
         * thrashing. Here, we have much stricter filesize constraints.
         * Therefore we do this in a synchronous way that ensures that
         * at least within `animate()` calls there is no style thrashing.
         *
         * In the motion-native-animate-mini-interrupt benchmark this
         * was 80% faster than a single loop.
         */
        const animationDefinitions = [];
        /**
         * Step 1: Build options and stop existing animations (write)
         */
        for (let i = 0; i < numElements; i++) {
            const element = elements[i];
            const elementTransition = { ...options };
            /**
             * Resolve stagger function if provided.
             */
            if (typeof elementTransition.delay === "function") {
                elementTransition.delay = elementTransition.delay(i, numElements);
            }
            for (const valueName in keyframes) {
                let valueKeyframes = keyframes[valueName];
                if (!Array.isArray(valueKeyframes)) {
                    valueKeyframes = [valueKeyframes];
                }
                const valueOptions = {
                    ...getValueTransition$1(elementTransition, valueName),
                };
                valueOptions.duration && (valueOptions.duration = secondsToMilliseconds(valueOptions.duration));
                valueOptions.delay && (valueOptions.delay = secondsToMilliseconds(valueOptions.delay));
                /**
                 * If there's an existing animation playing on this element then stop it
                 * before creating a new one.
                 */
                const map = getAnimationMap(element);
                const key = animationMapKey(valueName, valueOptions.pseudoElement || "");
                const currentAnimation = map.get(key);
                currentAnimation && currentAnimation.stop();
                animationDefinitions.push({
                    map,
                    key,
                    unresolvedKeyframes: valueKeyframes,
                    options: {
                        ...valueOptions,
                        element,
                        name: valueName,
                        allowFlatten: !elementTransition.type && !elementTransition.ease,
                    },
                });
            }
        }
        /**
         * Step 2: Resolve keyframes (read)
         */
        for (let i = 0; i < animationDefinitions.length; i++) {
            const { unresolvedKeyframes, options: animationOptions } = animationDefinitions[i];
            const { element, name, pseudoElement } = animationOptions;
            if (!pseudoElement && unresolvedKeyframes[0] === null) {
                unresolvedKeyframes[0] = getComputedStyle$1(element, name);
            }
            fillWildcards(unresolvedKeyframes);
            applyPxDefaults(unresolvedKeyframes, name);
            /**
             * If we only have one keyframe, explicitly read the initial keyframe
             * from the computed style. This is to ensure consistency with WAAPI behaviour
             * for restarting animations, for instance .play() after finish, when it
             * has one vs two keyframes.
             */
            if (!pseudoElement && unresolvedKeyframes.length < 2) {
                unresolvedKeyframes.unshift(getComputedStyle$1(element, name));
            }
            animationOptions.keyframes = unresolvedKeyframes;
        }
        /**
         * Step 3: Create new animations (write)
         */
        const animations = [];
        for (let i = 0; i < animationDefinitions.length; i++) {
            const { map, key, options: animationOptions } = animationDefinitions[i];
            const animation = new NativeAnimation(animationOptions);
            map.set(key, animation);
            animation.finished.finally(() => map.delete(key));
            animations.push(animation);
        }
        return animations;
    }

    const createScopedWaapiAnimate = (scope) => {
        function scopedAnimate(elementOrSelector, keyframes, options) {
            return new GroupAnimationWithThen(animateElements(elementOrSelector, keyframes, options, scope));
        }
        return scopedAnimate;
    };
    const animateMini = /*@__PURE__*/ createScopedWaapiAnimate();

    /**
     * A time in milliseconds, beyond which we consider the scroll velocity to be 0.
     */
    const maxElapsed = 50;
    const createAxisInfo = () => ({
        current: 0,
        offset: [],
        progress: 0,
        scrollLength: 0,
        targetOffset: 0,
        targetLength: 0,
        containerLength: 0,
        velocity: 0,
    });
    const createScrollInfo = () => ({
        time: 0,
        x: createAxisInfo(),
        y: createAxisInfo(),
    });
    /**
     * Also iterated with for...in as the list of axes.
     */
    const axisKeys = {
        x: {
            length: "Width",
            position: "Left",
        },
        y: {
            length: "Height",
            position: "Top",
        },
    };
    const styles = new WeakMap();
    /**
     * Whether an axis scrolls from its end, which browsers report as a scroll
     * position running from 0 to -scrollLength (#3340). This is read from style
     * rather than the sign of the scroll position, as elastic overscroll pushes
     * the position past 0 in either kind of axis (#3791).
     */
    function isReversed(element, axisName) {
        /**
         * The viewport takes its writing mode and direction from <body>, which
         * not every browser reflects in the root element's computed style. It
         * doesn't adopt the root element's flex layout.
         */
        const isRoot = element === document.scrollingElement;
        const source = (isRoot && document.body) || element;
        let style = styles.get(source);
        if (!style)
            styles.set(source, (style = getComputedStyle(source)));
        const { writingMode, flexDirection } = style;
        const isInline = (axisName === "x") !== /^[vs]/.test(writingMode);
        return ((isInline
            ? (style.direction === "rtl") !== (writingMode === "sideways-lr")
            : writingMode.endsWith("rl")) !==
            /**
             * A reversed flex axis flips this. The main axis is the inline axis
             * unless flex-direction is a column.
             */
            (!isRoot &&
                style.display.includes("flex") &&
                (isInline !== (flexDirection[0] === "c")
                    ? flexDirection
                    : style.flexWrap).endsWith("reverse")));
    }
    function updateAxisInfo(element, axisName, info, time) {
        const axis = info[axisName];
        const { length, position } = axisKeys[axisName];
        const prev = axis.current;
        const prevTime = info.time;
        const scrollPosition = element[`scroll${position}`];
        axis.current = isReversed(element, axisName)
            ? -scrollPosition || 0 // Avoid -0
            : scrollPosition;
        axis.containerLength = element[`client${length}`];
        axis.targetLength = element[`scroll${length}`];
        axis.scrollLength = axis.targetLength - axis.containerLength;
        axis.offset.length = 0;
        axis.offset[0] = 0;
        axis.offset[1] = axis.scrollLength;
        axis.progress = clamp(0, 1, progress(0, axis.scrollLength, axis.current));
        const elapsed = time - prevTime;
        axis.velocity =
            elapsed > maxElapsed
                ? 0
                : velocityPerSecond(axis.current - prev, elapsed);
    }
    /**
     * Measures a scroll container. Runs once per container per frame; every
     * handler on that container derives its info from the result.
     */
    function updateScrollInfo(element, info, time) {
        for (const axis in axisKeys) {
            updateAxisInfo(element, axis, info, time);
        }
        info.time = time;
    }

    const namedEdges = {
        start: 0,
        center: 0.5,
        end: 1,
    };
    function resolveEdge(edge, length, inset = 0) {
        let delta = 0;
        /**
         * If we have this edge defined as a preset, replace the definition
         * with the numerical value.
         */
        if (edge in namedEdges) {
            edge = namedEdges[edge];
        }
        /**
         * Handle unit values
         */
        if (typeof edge === "string") {
            const asNumber = parseFloat(edge);
            if (edge.endsWith("px")) {
                delta = asNumber;
            }
            else if (edge.endsWith("%")) {
                edge = asNumber / 100;
            }
            else if (edge.endsWith("vw")) {
                delta = (asNumber / 100) * document.documentElement.clientWidth;
            }
            else if (edge.endsWith("vh")) {
                delta = (asNumber / 100) * document.documentElement.clientHeight;
            }
            else {
                edge = asNumber;
            }
        }
        /**
         * If the edge is defined as a number, handle as a progress value.
         */
        if (typeof edge === "number") {
            delta = length * edge;
        }
        return inset + delta;
    }

    const defaultOffset = [0, 0];
    function resolveOffset(offset, containerLength, targetLength, targetInset) {
        let offsetDefinition = Array.isArray(offset) ? offset : defaultOffset;
        let targetPoint = 0;
        let containerPoint = 0;
        if (typeof offset === "number") {
            /**
             * If we're provided offset: [0, 0.5, 1] then each number x should become
             * [x, x], so we default to the behaviour of mapping 0 => 0 of both target
             * and container etc.
             */
            offsetDefinition = [offset, offset];
        }
        else if (typeof offset === "string") {
            offset = offset.trim();
            if (offset.includes(" ")) {
                offsetDefinition = offset.split(" ");
            }
            else {
                /**
                 * If we're provided a definition like "100px" then we want to apply
                 * that only to the top of the target point, leaving the container at 0.
                 * Whereas a named offset like "end" should be applied to both.
                 */
                offsetDefinition = [offset, namedEdges[offset] ? offset : `0`];
            }
        }
        targetPoint = resolveEdge(offsetDefinition[0], targetLength, targetInset);
        containerPoint = resolveEdge(offsetDefinition[1], containerLength);
        return targetPoint - containerPoint;
    }

    const ScrollOffset = {
        All: [
            [0, 0],
            [1, 1],
        ],
    };

    /**
     * Resolved offsets map to evenly spaced progress values, so progress is
     * derived from the segment index rather than building an interpolator.
     */
    function offsetsToProgress(offsets, v) {
        const n = offsets.length - 1;
        if (n < 1)
            return 0;
        const reverse = offsets[0] > offsets[n];
        const at = (i) => offsets[reverse ? n - i : i];
        /**
         * Matches interpolate(), which checks for a zero-length first range
         * before reversing descending offsets.
         */
        if (offsets[0] === offsets[1] && v < at(0))
            return reverse ? 1 : 0;
        let i = 0;
        while (i < n - 1 && v >= at(i + 1))
            i++;
        const p = (i + progress(at(i), at(i + 1), v)) / n;
        return reverse ? 1 - p : p;
    }
    /**
     * Resolves offsets on both axes, as useScroll reports the target's progress
     * on each (#2546). `axis` only picks which progress scroll() reports.
     */
    function resolveOffsets(info, { offset: offsetDefinition = ScrollOffset.All }) {
        for (const axis in axisKeys) {
            const axisInfo = info[axis];
            /**
             * Reset the length of the resolved offset array rather than creating a new one.
             */
            axisInfo.offset.length = 0;
            /**
             * Populate the offset array by resolving the user's offset definition into
             * a list of pixel scroll offsets.
             */
            for (let i = 0; i < offsetDefinition.length; i++) {
                axisInfo.offset[i] = resolveOffset(offsetDefinition[i], axisInfo.containerLength, axisInfo.targetLength, axisInfo.targetOffset);
            }
            axisInfo.progress = clamp(0, 1, offsetsToProgress(axisInfo.offset, axisInfo.current));
        }
    }

    function calcInset(element, container) {
        const inset = { x: 0, y: 0 };
        let current = element;
        while (current && current !== container) {
            if (isHTMLElement(current)) {
                inset.x += current.offsetLeft;
                inset.y += current.offsetTop;
                current = current.offsetParent;
            }
            else if (current.tagName === "svg") {
                /**
                 * This isn't an ideal approach to measuring the offset of <svg /> tags.
                 * It would be preferable, given they behave like HTMLElements in most ways
                 * to use offsetLeft/Top. But these don't exist on <svg />. Likewise we
                 * can't use .getBBox() like most SVG elements as these provide the offset
                 * relative to the SVG itself, which for <svg /> is usually 0x0.
                 */
                const svgBoundingBox = current.getBoundingClientRect();
                current = current.parentElement;
                const parentBoundingBox = current.getBoundingClientRect();
                inset.x += svgBoundingBox.left - parentBoundingBox.left;
                inset.y += svgBoundingBox.top - parentBoundingBox.top;
            }
            else if (current instanceof SVGGraphicsElement) {
                const { x, y } = current.getBBox();
                inset.x += x;
                inset.y += y;
                let svg = null;
                let parent = current.parentNode;
                while (!svg) {
                    if (parent.tagName === "svg") {
                        svg = parent;
                    }
                    parent = current.parentNode;
                }
                current = svg;
            }
            else {
                break;
            }
        }
        return inset;
    }

    function getTargetSize(target) {
        return "getBBox" in target && target.tagName !== "svg"
            ? target.getBBox()
            : { width: target.clientWidth, height: target.clientHeight };
    }
    function createOnScrollHandler(container, onScroll, info, options = {}) {
        const { target } = options;
        /**
         * In development mode ensure scroll containers aren't position: static as this makes
         * it difficult to measure their relative positions. The document scrolling element
         * is exempt: offsetParent measurements naturally resolve relative to the document.
         */
        {
            if (target &&
                target !== container &&
                container !== document.documentElement &&
                container !== document.scrollingElement &&
                container !== document.body) {
                warnOnce(getComputedStyle(container).position !== "static", "Please ensure that the container has a non-static position, like 'relative', 'fixed', or 'absolute' to ensure scroll offset is calculated correctly.");
            }
        }
        /**
         * Handlers without a target or offset are notified with the container's
         * shared info object, so they measure nothing themselves.
         */
        const needsOwnInfo = target || options.offset;
        return {
            measure: (containerInfo) => {
                if (!needsOwnInfo)
                    return;
                info.time = containerInfo.time;
                for (const key in axisKeys) {
                    const axis = key;
                    const { offset } = info[axis];
                    Object.assign(info[axis], containerInfo[axis]);
                    info[axis].offset = offset;
                }
                if (target && target !== container) {
                    const inset = calcInset(target, container);
                    const size = getTargetSize(target);
                    info.x.targetOffset = inset.x;
                    info.y.targetOffset = inset.y;
                    info.x.targetLength = size.width;
                    info.y.targetLength = size.height;
                }
                resolveOffsets(info, options);
            },
            notify: (containerInfo) => onScroll(needsOwnInfo ? info : containerInfo),
        };
    }

    const scrollListeners = new WeakMap();
    const resizeListeners = new WeakMap();
    const onScrollHandlers = new WeakMap();
    const dimensionCheckProcesses = new WeakMap();
    const getEventTarget = (element) => element === document.scrollingElement ? window : element;
    function scrollInfo(onScroll, { container = document.scrollingElement, trackContentSize = false, ...options } = {}) {
        if (!container)
            return noop;
        let containerHandlers = onScrollHandlers.get(container);
        /**
         * Get the onScroll handlers for this container.
         * If one isn't found, create a new one.
         */
        if (!containerHandlers) {
            containerHandlers = new Set();
            onScrollHandlers.set(container, containerHandlers);
        }
        /**
         * Create a new onScroll handler for the provided callback.
         */
        const info = createScrollInfo();
        const containerHandler = createOnScrollHandler(container, onScroll, info, options);
        containerHandlers.add(containerHandler);
        /**
         * Check if there's a scroll event listener for this container.
         * If not, create one.
         */
        if (!scrollListeners.has(container)) {
            const containerInfo = createScrollInfo();
            const measureAll = () => {
                updateScrollInfo(container, containerInfo, frameData.timestamp);
                for (const handler of containerHandlers) {
                    handler.measure(containerInfo);
                }
                frame.preUpdate(notifyAll);
            };
            const notifyAll = () => {
                for (const handler of containerHandlers) {
                    handler.notify(containerInfo);
                }
            };
            const listener = () => frame.read(measureAll);
            scrollListeners.set(container, listener);
            const target = getEventTarget(container);
            window.addEventListener("resize", listener);
            if (container !== document.documentElement) {
                resizeListeners.set(container, resize(container, listener));
            }
            target.addEventListener("scroll", listener);
            listener();
        }
        /**
         * Enable content size tracking if requested and not already enabled.
         */
        if (trackContentSize && !dimensionCheckProcesses.has(container)) {
            const listener = scrollListeners.get(container);
            // Store initial scroll dimensions (object is reused to avoid allocation)
            const size = {
                width: container.scrollWidth,
                height: container.scrollHeight,
            };
            // Add frame-based scroll dimension checking to detect content changes
            const checkScrollDimensions = () => {
                const newWidth = container.scrollWidth;
                const newHeight = container.scrollHeight;
                if (size.width !== newWidth || size.height !== newHeight) {
                    listener();
                    size.width = newWidth;
                    size.height = newHeight;
                }
            };
            // Schedule with keepAlive=true to run every frame
            const dimensionCheckProcess = frame.read(checkScrollDimensions, true);
            dimensionCheckProcesses.set(container, dimensionCheckProcess);
        }
        const listener = scrollListeners.get(container);
        frame.read(listener, false, true);
        return () => {
            cancelFrame(listener);
            /**
             * Check if we even have any handlers for this container.
             */
            const currentHandlers = onScrollHandlers.get(container);
            if (!currentHandlers)
                return;
            currentHandlers.delete(containerHandler);
            if (currentHandlers.size)
                return;
            /**
             * If no more handlers, remove the scroll listener too. The handler
             * set goes with it, as a measure still queued from this listener
             * would otherwise notify handlers added by a later scrollInfo call.
             */
            onScrollHandlers.delete(container);
            const scrollListener = scrollListeners.get(container);
            scrollListeners.delete(container);
            if (scrollListener) {
                getEventTarget(container).removeEventListener("scroll", scrollListener);
                resizeListeners.get(container)?.();
                window.removeEventListener("resize", scrollListener);
            }
            // Clean up scroll dimension checking
            const dimensionCheckProcess = dimensionCheckProcesses.get(container);
            if (dimensionCheckProcess) {
                cancelFrame(dimensionCheckProcess);
                dimensionCheckProcesses.delete(container);
            }
        };
    }

    function canUseNativeTimeline(target) {
        if (typeof window === "undefined")
            return false;
        return target ? supportsViewTimeline() : supportsScrollTimeline();
    }

    const timelineCache = new Map();
    /**
     * Native timelines are only attached to WAAPI animations. Offsets are
     * applied to each animation as a range, so a timeline is shared by every
     * offset.
     */
    function getTimeline({ container, target, axis, }) {
        let containerCache = timelineCache.get(container);
        if (!containerCache) {
            containerCache = new Map();
            timelineCache.set(container, containerCache);
        }
        const targetKey = target ?? "self";
        let targetCache = containerCache.get(targetKey);
        if (!targetCache) {
            targetCache = {};
            containerCache.set(targetKey, targetCache);
        }
        return (targetCache[axis] || (targetCache[axis] = target
            ? new ViewTimeline({ subject: target, axis })
            : new ScrollTimeline({ source: container, axis })));
    }

    /**
     * Resolved offsets are linear in the target and container lengths, so
     * probing them gives [target progress, container progress, pixels].
     * vw/vh can resolve to 0px, so they're rejected up front.
     */
    const toIntersection = (o) => {
        if (/v/u.test(o))
            return [];
        const px = resolveOffset(o, 0, 0, 0);
        return [resolveOffset(o, 0, 1, 0) - px, px - resolveOffset(o, 1, 0, 0), px];
    };
    const toRange = ([t, c, px]) => !px &&
        (c === 0 || c === 1) &&
        `${c ? "entry" : "exit"}-crossing ${t * 100}%`;
    /**
     * Maps an offset to an equivalent ViewTimeline range. Returns undefined when
     * there isn't one, which signals the caller to fall back to JS-based scroll
     * tracking.
     */
    function offsetToViewTimelineRange(offset = ScrollOffset.All) {
        if (offset.length !== 2)
            return;
        const [start, end] = offset.map(toIntersection);
        const points = [toRange(start), toRange(end)];
        const a = end[0] - start[0];
        const b = start[1] - end[1];
        if (points[0] && points[1] && (a || b)) {
            return {
                points: points,
                a,
                b,
                cover: !start[0] && a === 1 && b === 1,
            };
        }
    }

    function attachToAnimation(animation, options) {
        const { target, container, axis } = options;
        const range = target && offsetToViewTimelineRange(options.offset);
        /**
         * Use native timeline when:
         * - No target and no offset: ScrollTimeline
         * - Target with mappable offset: ViewTimeline with named range
         * - Otherwise: fall back to JS observe. A ScrollTimeline has no offset,
         *   so page offsets are applied by the JS timeline.
         */
        const native = canUseNativeTimeline(target) && (target ? !!range : !options.offset);
        const animations = new Map();
        const observed = new Set();
        let stopObserving;
        let reverse = false;
        /**
         * When an offset's second point comes first, its range is swapped and
         * the animation played backwards. The range is set after the direction,
         * as that's what realigns a running animation with its timeline. Chrome
         * skips that realignment when the range changes in the frame the
         * animation starts, leaving it offset for good, so it's replayed too.
         */
        const apply = (direction, waapi) => {
            const [start, end] = range.points;
            waapi.effect.updateTiming({
                direction: reverse
                    ? direction === "normal"
                        ? "reverse"
                        : "alternate-reverse"
                    : direction,
            });
            Object.assign(waapi, {
                rangeStart: reverse ? end : start,
                rangeEnd: reverse ? start : end,
            });
            waapi.play();
        };
        const stops = [
            animation.attachTimeline({
                /**
                 * Read only by WAAPI animations, so values driven from JS don't
                 * create a native timeline they won't use.
                 */
                get timeline() {
                    return native ? getTimeline(options) : undefined;
                },
                onAttach: range &&
                    ((waapi) => {
                        const direction = waapi.effect.getTiming().direction;
                        animations.set(waapi, direction);
                        apply(direction, waapi);
                    }),
                /**
                 * Values driven from JS all track the offset with scrollInfo,
                 * which measures once per frame for all of them.
                 */
                observe: (valueAnimation) => {
                    valueAnimation.pause();
                    observed.add(valueAnimation);
                    stopObserving || (stopObserving = scrollInfo((info) => {
                        observed.forEach((observedAnimation) => {
                            observedAnimation.time =
                                observedAnimation.iterationDuration *
                                    info[axis].progress;
                        });
                    }, options));
                    return () => observed.delete(valueAnimation);
                },
            }),
        ];
        if (native && range) {
            const { a, b } = range;
            const length = axis === "y" ? "clientHeight" : "clientWidth";
            /**
             * Offsets like All only run forwards when the target is longer than
             * the container, so their direction is remeasured on resize.
             */
            const update = () => {
                if (reverse !==
                    (reverse = a * target[length] + b * container[length] < 0)) {
                    animations.forEach(apply);
                }
            };
            update();
            if (a * b < 0) {
                stops.push(resize(update), resize([target, container], update));
            }
        }
        return () => {
            stops.forEach((stop) => stop());
            stopObserving?.();
        };
    }

    function scroll(onScroll, { axis = "y", source, container = document.scrollingElement, ...options } = {}) {
        if (!container)
            return noop;
        const optionsWithDefaults = {
            axis,
            container: source || container,
            ...options,
        };
        if (typeof onScroll === "function") {
            const callback = bindToScope(onScroll);
            return addToScope(scrollInfo((info) => callback(info[axis].progress, info), optionsWithDefaults));
        }
        return addToScope(attachToAnimation(onScroll, optionsWithDefaults));
    }

    const thresholds = {
        some: 0,
        all: 1,
    };
    function inView(elementOrSelector, onStart, { root, margin: rootMargin, amount = "some" } = {}) {
        const elements = resolveElements(elementOrSelector);
        onStart = bindToScope(onStart);
        const activeIntersections = new WeakMap();
        const onIntersectionChange = (entries) => {
            entries.forEach((entry) => {
                const onEnd = activeIntersections.get(entry.target);
                /**
                 * If there's no change to the intersection, we don't need to
                 * do anything here.
                 */
                if (entry.isIntersecting === Boolean(onEnd))
                    return;
                if (entry.isIntersecting) {
                    const newOnEnd = onStart(entry.target, entry);
                    if (typeof newOnEnd === "function") {
                        activeIntersections.set(entry.target, newOnEnd);
                    }
                    else {
                        observer.unobserve(entry.target);
                    }
                }
                else if (typeof onEnd === "function") {
                    onEnd(entry);
                    activeIntersections.delete(entry.target);
                }
            });
        };
        const observer = new IntersectionObserver(onIntersectionChange, {
            root,
            rootMargin,
            threshold: typeof amount === "number" ? amount : thresholds[amount],
        });
        elements.forEach((element) => observer.observe(element));
        return addToScope(() => observer.disconnect());
    }

    exports.AsyncMotionValueAnimation = AsyncMotionValueAnimation;
    exports.DOMKeyframesResolver = DOMKeyframesResolver;
    exports.DOMVisualElement = DOMVisualElement;
    exports.DocumentProjectionNode = DocumentProjectionNode;
    exports.Feature = Feature;
    exports.FlatTree = FlatTree;
    exports.GroupAnimation = GroupAnimation;
    exports.GroupAnimationWithThen = GroupAnimationWithThen;
    exports.HTMLProjectionNode = HTMLProjectionNode;
    exports.HTMLVisualElement = HTMLVisualElement;
    exports.JSAnimation = JSAnimation;
    exports.KeyframeResolver = KeyframeResolver;
    exports.LayoutAnimationBuilder = LayoutAnimationBuilder;
    exports.MotionGlobalConfig = MotionGlobalConfig;
    exports.MotionValue = MotionValue;
    exports.MotionValueState = MotionValueState;
    exports.NativeAnimation = NativeAnimation;
    exports.NativeAnimationExtended = NativeAnimationExtended;
    exports.NativeAnimationWrapper = NativeAnimationWrapper;
    exports.NodeStack = NodeStack;
    exports.ObjectVisualElement = ObjectVisualElement;
    exports.PanSession = PanSession;
    exports.SVGVisualElement = SVGVisualElement;
    exports.SubscriptionManager = SubscriptionManager;
    exports.ViewTransitionBuilder = ViewTransitionBuilder;
    exports.VisualElement = VisualElement;
    exports.VisualElementDragControls = VisualElementDragControls;
    exports.acceleratedValues = acceleratedValues;
    exports.acquireProjectionNode = acquireProjectionNode;
    exports.activeScope = activeScope;
    exports.addAttrValue = addAttrValue;
    exports.addBuilderToScope = addBuilderToScope;
    exports.addDomEvent = addDomEvent;
    exports.addEffect = addEffect;
    exports.addPointerEvent = addPointerEvent;
    exports.addPointerInfo = addPointerInfo;
    exports.addSVGValue = addSVGValue;
    exports.addScaleCorrector = addScaleCorrector;
    exports.addStyleValue = addStyleValue;
    exports.addToScope = addToScope;
    exports.addUniqueItem = addUniqueItem;
    exports.addValueToWillChange = addValueToWillChange;
    exports.alpha = alpha;
    exports.analyseComplexValue = analyseComplexValue;
    exports.animate = animate;
    exports.animateEffectSubject = animateEffectSubject;
    exports.animateElement = animateElement;
    exports.animateLayout = animateLayout;
    exports.animateMini = animateMini;
    exports.animateMotionValue = animateMotionValue;
    exports.animateSingleValue = animateSingleValue;
    exports.animateTarget = animateTarget;
    exports.animateValue = animateValue;
    exports.animateValues = animateValues;
    exports.animateVariant = animateVariant;
    exports.animateView = animateView;
    exports.animateVisualElement = animateVisualElement;
    exports.animationMapKey = animationMapKey;
    exports.anticipate = anticipate;
    exports.applyAxisDelta = applyAxisDelta;
    exports.applyBoxDelta = applyBoxDelta;
    exports.applyGeneratorOptions = applyGeneratorOptions;
    exports.applyPointDelta = applyPointDelta;
    exports.applyPxDefaults = applyPxDefaults;
    exports.applyTreeDeltas = applyTreeDeltas;
    exports.arc = arc;
    exports.aspectRatio = aspectRatio;
    exports.attachFollow = attachFollow;
    exports.attachSpring = attachSpring;
    exports.attrEffect = attrEffect;
    exports.axisDeltaEquals = axisDeltaEquals;
    exports.axisEquals = axisEquals;
    exports.axisEqualsRounded = axisEqualsRounded;
    exports.backIn = backIn;
    exports.backInOut = backInOut;
    exports.backOut = backOut;
    exports.bindToScope = bindToScope;
    exports.boxEquals = boxEquals;
    exports.boxEqualsRounded = boxEqualsRounded;
    exports.buildHTMLStyles = buildHTMLStyles;
    exports.buildProjectionTransform = buildProjectionTransform;
    exports.buildSVGAttrs = buildSVGAttrs;
    exports.buildSVGPath = buildSVGPath;
    exports.buildTransform = buildTransform$1;
    exports.buildTransformer = buildTransformer;
    exports.calcAxisDelta = calcAxisDelta;
    exports.calcBoxDelta = calcBoxDelta;
    exports.calcChildStagger = calcChildStagger;
    exports.calcGeneratorDuration = calcGeneratorDuration;
    exports.calcLength = calcLength;
    exports.calcRelativeAxis = calcRelativeAxis;
    exports.calcRelativeAxisPosition = calcRelativeAxisPosition;
    exports.calcRelativeBox = calcRelativeBox;
    exports.calcRelativePosition = calcRelativePosition;
    exports.camelCaseAttributes = camelCaseAttributes;
    exports.camelToDash = camelToDash;
    exports.cancelFrame = cancelFrame;
    exports.cancelMicrotask = cancelMicrotask;
    exports.cancelSync = cancelSync;
    exports.checkVariantsDidChange = checkVariantsDidChange;
    exports.circIn = circIn;
    exports.circInOut = circInOut;
    exports.circOut = circOut;
    exports.clamp = clamp;
    exports.cleanDirtyNodes = cleanDirtyNodes;
    exports.collectMotionValues = collectMotionValues;
    exports.color = color;
    exports.compareByDepth = compareByDepth;
    exports.complex = complex;
    exports.containsCSSVariable = containsCSSVariable;
    exports.convertBoundingBoxToBox = convertBoundingBoxToBox;
    exports.convertBoxToBoundingBox = convertBoxToBoundingBox;
    exports.convertOffsetToTimes = convertOffsetToTimes;
    exports.copyAxisDeltaInto = copyAxisDeltaInto;
    exports.copyAxisInto = copyAxisInto;
    exports.copyBoxInto = copyBoxInto;
    exports.correctBorderRadius = correctBorderRadius;
    exports.correctBoxShadow = correctBoxShadow;
    exports.createAnimationState = createAnimationState;
    exports.createAxis = createAxis;
    exports.createAxisDelta = createAxisDelta;
    exports.createBox = createBox;
    exports.createDelta = createDelta;
    exports.createEffect = createEffect;
    exports.createGeneratorEasing = createGeneratorEasing;
    exports.createProjectionNode = createProjectionNode;
    exports.createRenderBatcher = createRenderBatcher;
    exports.createScopedAnimate = createScopedAnimate;
    exports.cubicBezier = cubicBezier;
    exports.cubicBezierAsString = cubicBezierAsString;
    exports.defaultEasing = defaultEasing;
    exports.defaultOffset = defaultOffset$1;
    exports.defaultTransformValue = defaultTransformValue;
    exports.defaultValueTypes = defaultValueTypes;
    exports.degrees = degrees;
    exports.delay = delayInSeconds;
    exports.delayInSeconds = delayInSeconds;
    exports.dimensionValueTypes = dimensionValueTypes;
    exports.distance = distance;
    exports.distance2D = distance2D;
    exports.drag = drag;
    exports.eachAxis = eachAxis;
    exports.easeIn = easeIn;
    exports.easeInOut = easeInOut;
    exports.easeOut = easeOut;
    exports.easingDefinitionToFunction = easingDefinitionToFunction;
    exports.elementDragControls = elementDragControls;
    exports.expectsResolvedDragConstraints = expectsResolvedDragConstraints;
    exports.extractEventInfo = extractEventInfo;
    exports.fillOffset = fillOffset;
    exports.fillWildcards = fillWildcards;
    exports.findDimensionValueType = findDimensionValueType;
    exports.findEffect = findEffect;
    exports.findValueType = findValueType;
    exports.flushKeyframeResolvers = flushKeyframeResolvers;
    exports.flushLayoutSnapshots = flushLayoutSnapshots;
    exports.followValue = followValue;
    exports.frame = frame;
    exports.frameData = frameData;
    exports.frameSteps = frameSteps;
    exports.generateLinearEasing = generateLinearEasing;
    exports.getAnimatableNone = getAnimatableNone;
    exports.getAnimationMap = getAnimationMap;
    exports.getComputedStyle = getComputedStyle$1;
    exports.getDefaultTransition = getDefaultTransition;
    exports.getDefaultValueType = getDefaultValueType;
    exports.getEasingForSegment = getEasingForSegment;
    exports.getFeatureDefinitions = getFeatureDefinitions;
    exports.getFinalKeyframe = getFinalKeyframe;
    exports.getMixer = getMixer;
    exports.getOptimisedAppearId = getOptimisedAppearId;
    exports.getOriginIndex = getOriginIndex;
    exports.getValueAsType = getValueAsType;
    exports.getValueTransition = getValueTransition$1;
    exports.getVariableValue = getVariableValue;
    exports.getVariantContext = getVariantContext;
    exports.getViewAnimationLayerInfo = getViewAnimationLayerInfo;
    exports.getViewAnimations = getViewAnimations;
    exports.globalProjectionState = globalProjectionState;
    exports.handOffElementState = handOffElementState;
    exports.has2DTranslate = has2DTranslate;
    exports.hasComplexValues = hasComplexValues;
    exports.hasReducedMotionListener = hasReducedMotionListener;
    exports.hasScale = hasScale;
    exports.hasTransform = hasTransform;
    exports.hasWarned = hasWarned;
    exports.hex = hex;
    exports.hover = hover;
    exports.hsla = hsla;
    exports.hslaToRgba = hslaToRgba;
    exports.inView = inView;
    exports.inertia = inertia;
    exports.initPrefersReducedMotion = initPrefersReducedMotion;
    exports.interpolate = interpolate;
    exports.invisibleValues = invisibleValues;
    exports.isAnimationControls = isAnimationControls;
    exports.isBezierDefinition = isBezierDefinition;
    exports.isCSSVariableName = isCSSVariableName;
    exports.isCSSVariableToken = isCSSVariableToken;
    exports.isControllingVariants = isControllingVariants;
    exports.isDeltaZero = isDeltaZero;
    exports.isDragActive = isDragActive;
    exports.isDragging = isDragging;
    exports.isEasingArray = isEasingArray;
    exports.isElementKeyboardAccessible = isElementKeyboardAccessible;
    exports.isElementTextInput = isElementTextInput;
    exports.isForcedMotionValue = isForcedMotionValue;
    exports.isGenerator = isGenerator;
    exports.isHTMLElement = isHTMLElement;
    exports.isKeyframesTarget = isKeyframesTarget;
    exports.isMotionValue = isMotionValue;
    exports.isNear = isNear;
    exports.isNodeOrChild = isNodeOrChild;
    exports.isNumericalString = isNumericalString;
    exports.isObject = isObject;
    exports.isPrimaryPointer = isPrimaryPointer;
    exports.isSVGElement = isSVGElement;
    exports.isSVGSVGElement = isSVGSVGElement;
    exports.isSVGTag = isSVGTag;
    exports.isTransitionDefined = isTransitionDefined;
    exports.isVariantLabel = isVariantLabel;
    exports.isVariantNode = isVariantNode;
    exports.isWaapiSupportedEasing = isWaapiSupportedEasing;
    exports.isWillChangeMotionValue = isWillChangeMotionValue;
    exports.isZeroValueString = isZeroValueString;
    exports.keyframes = keyframes;
    exports.makeAnimationInstant = makeAnimationInstant;
    exports.mapEasingToNativeEasing = mapEasingToNativeEasing;
    exports.mapValue = mapValue;
    exports.maxGeneratorDuration = maxGeneratorDuration;
    exports.measurePageBox = measurePageBox;
    exports.measureViewportBox = measureViewportBox;
    exports.memo = memo;
    exports.microtask = microtask;
    exports.millisecondsToSeconds = millisecondsToSeconds;
    exports.mirrorEasing = mirrorEasing;
    exports.mix = mix;
    exports.mixArray = mixArray;
    exports.mixColor = mixColor;
    exports.mixComplex = mixComplex;
    exports.mixImmediate = mixImmediate;
    exports.mixLinearColor = mixLinearColor;
    exports.mixNumber = mixNumber$1;
    exports.mixObject = mixObject;
    exports.mixValues = mixValues;
    exports.mixVisibility = mixVisibility;
    exports.motionValue = motionValue;
    exports.moveItem = moveItem;
    exports.nodeGroup = nodeGroup;
    exports.noop = noop;
    exports.number = number;
    exports.numberValueTypes = numberValueTypes;
    exports.optimizedAppearDataAttribute = optimizedAppearDataAttribute;
    exports.optimizedAppearDataId = optimizedAppearDataId;
    exports.originProps = originProps;
    exports.parseAnimateLayoutArgs = parseAnimateLayoutArgs;
    exports.parseCSSVariable = parseCSSVariable;
    exports.parseValueFromTransform = parseValueFromTransform;
    exports.percent = percent;
    exports.pipe = pipe;
    exports.pixelsToPercent = pixelsToPercent;
    exports.positionalKeys = positionalKeys;
    exports.prefersReducedMotion = prefersReducedMotion;
    exports.press = press;
    exports.processFrame = processFrame;
    exports.progress = progress;
    exports.progressPercentage = progressPercentage;
    exports.propEffect = propEffect;
    exports.propagateDirtyNodes = propagateDirtyNodes;
    exports.px = px;
    exports.readSVGValue = readSVGValue;
    exports.readStyleValue = readStyleValue;
    exports.readTransformValue = readTransformValue;
    exports.recordStats = recordStats;
    exports.releaseElement = releaseElement;
    exports.removeAxisDelta = removeAxisDelta;
    exports.removeAxisTransforms = removeAxisTransforms;
    exports.removeBoxTransforms = removeBoxTransforms;
    exports.removeEffect = removeEffect;
    exports.removeItem = removeItem;
    exports.removePointDelta = removePointDelta;
    exports.renderHTML = renderHTML;
    exports.renderSVG = renderSVG;
    exports.resize = resize;
    exports.resolveElements = resolveElements;
    exports.resolveMotionValue = resolveMotionValue;
    exports.resolveTransition = resolveTransition;
    exports.resolveVariant = resolveVariant;
    exports.resolveVariantFromProps = resolveVariantFromProps;
    exports.reverseEasing = reverseEasing;
    exports.rgbUnit = rgbUnit;
    exports.rgba = rgba;
    exports.rootProjectionNode = rootProjectionNode;
    exports.round = round;
    exports.sampleDelta = sampleDelta;
    exports.scale = scale;
    exports.scaleCorrectors = scaleCorrectors;
    exports.scalePoint = scalePoint;
    exports.scopeMotion = scopeMotion;
    exports.scrapeHTMLMotionValuesFromProps = scrapeMotionValuesFromProps$1;
    exports.scrapeSVGMotionValuesFromProps = scrapeMotionValuesFromProps;
    exports.scroll = scroll;
    exports.scrollInfo = scrollInfo;
    exports.secondsToMilliseconds = secondsToMilliseconds;
    exports.setDragLock = setDragLock;
    exports.setFeatureDefinitions = setFeatureDefinitions;
    exports.setStyle = setStyle;
    exports.setTarget = setTarget;
    exports.spring = spring;
    exports.springValue = springValue;
    exports.stagger = stagger;
    exports.startWaapiAnimation = startWaapiAnimation;
    exports.statsBuffer = statsBuffer;
    exports.steps = steps;
    exports.styleEffect = styleEffect;
    exports.styleSubjectEffect = styleSubjectEffect;
    exports.supportedWaapiEasing = supportedWaapiEasing;
    exports.supportsBrowserAnimation = supportsBrowserAnimation;
    exports.supportsFlags = supportsFlags;
    exports.supportsLinearEasing = supportsLinearEasing;
    exports.supportsPartialKeyframes = supportsPartialKeyframes;
    exports.supportsScrollTimeline = supportsScrollTimeline;
    exports.supportsViewTimeline = supportsViewTimeline;
    exports.supportsWaapi = supportsWaapi;
    exports.svgEffect = svgEffect;
    exports.svgSubjectEffect = svgSubjectEffect;
    exports.sync = sync;
    exports.testValueType = testValueType;
    exports.time = time;
    exports.toMediaQuery = toMediaQuery;
    exports.transform = transform;
    exports.transformAxis = transformAxis;
    exports.transformBox = transformBox;
    exports.transformBoxPoints = transformBoxPoints;
    exports.transformPropOrder = transformPropOrder;
    exports.transformProps = transformProps;
    exports.transformValue = transformValue;
    exports.transformValueTypes = transformValueTypes;
    exports.translateAxis = translateAxis;
    exports.updateMotionValuesFromProps = updateMotionValuesFromProps;
    exports.variantPriorityOrder = variantPriorityOrder;
    exports.variantProps = variantProps;
    exports.velocityPerSecond = velocityPerSecond;
    exports.vh = vh;
    exports.visualElementStore = visualElementStore;
    exports.vw = vw;
    exports.warnOnce = warnOnce;
    exports.wrap = wrap;

}));
