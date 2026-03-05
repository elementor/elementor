// src/errors/elementor-error.ts
var ElementorError = class extends Error {
  context;
  code;
  constructor(message, { code, context = null, cause = null }) {
    super(message, { cause });
    this.context = context;
    this.code = code;
  }
};

// src/errors/create-error.ts
var createError = ({ code, message }) => {
  return class extends ElementorError {
    constructor({ cause, context } = {}) {
      super(message, { cause, code, context });
    }
  };
};

// src/errors/ensure-error.ts
var ensureError = (error) => {
  if (error instanceof Error) {
    return error;
  }
  let message;
  let cause = null;
  try {
    message = JSON.stringify(error);
  } catch (e) {
    cause = e;
    message = "Unable to stringify the thrown value";
  }
  return new Error(`Unexpected non-error thrown: ${message}`, { cause });
};

// src/use-debounce-state.ts
import { useCallback, useEffect, useRef, useState } from "react";

// src/debounce.ts
function debounce(fn, wait) {
  let timer = null;
  const cancel = () => {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = null;
  };
  const flush = (...args) => {
    cancel();
    fn(...args);
  };
  const run = (...args) => {
    cancel();
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, wait);
  };
  const pending = () => !!timer;
  run.flush = flush;
  run.cancel = cancel;
  run.pending = pending;
  return run;
}

// src/use-debounce-state.ts
function useDebounceState(options = {}) {
  const { delay = 300, initialValue = "" } = options;
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(initialValue);
  const runRef = useRef(null);
  useEffect(() => {
    return () => {
      runRef.current?.cancel?.();
    };
  }, []);
  const debouncedSetValue = useCallback(
    (val) => {
      runRef.current?.cancel?.();
      runRef.current = debounce(() => {
        setDebouncedValue(val);
      }, delay);
      runRef.current();
    },
    [delay]
  );
  const handleChange = (val) => {
    setInputValue(val);
    debouncedSetValue(val);
  };
  return {
    debouncedValue,
    inputValue,
    handleChange,
    setInputValue
  };
}

// src/throttle.ts
function throttle(fn, wait, shouldExecuteIgnoredCalls = false) {
  let timer = null;
  let ignoredExecution = false;
  const cancel = () => {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = null;
  };
  const flush = (...args) => {
    cancel();
    fn(...args);
  };
  const run = (...args) => {
    if (timer) {
      ignoredExecution = true;
      return;
    }
    fn(...args);
    timer = setTimeout(() => {
      timer = null;
      if (ignoredExecution && shouldExecuteIgnoredCalls) {
        fn(...args);
      }
      ignoredExecution = false;
    }, wait);
  };
  const pending = () => !!timer;
  run.flush = flush;
  run.cancel = cancel;
  run.pending = pending;
  return run;
}

// src/encoding.ts
var encodeString = (value) => {
  const binary = Array.from(new TextEncoder().encode(value), (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
};
var decodeString = (value, fallback) => {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(Array.from(binary, (char) => char.charCodeAt(0)));
    return new TextDecoder().decode(bytes);
  } catch {
    return fallback !== void 0 ? fallback : "";
  }
};

// src/hash.ts
function hash(obj) {
  return JSON.stringify(
    obj,
    (_, value) => isPlainObject(value) ? Object.keys(value).sort().reduce((result, key) => {
      result[key] = value[key];
      return result;
    }, {}) : value
  );
}
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function hashString(str, length) {
  let hashBasis = 5381;
  let i = str.length;
  while (i) {
    hashBasis = hashBasis * 33 ^ str.charCodeAt(--i);
  }
  const result = (hashBasis >>> 0).toString(36);
  if (length === void 0) {
    return result;
  }
  const sliced = result.slice(-length);
  return sliced.padStart(length, "0");
}

// src/use-search-state.ts
function useSearchState({ localStorageKey }) {
  const getInitialSearchValue = () => {
    if (localStorageKey) {
      const storedValue = localStorage.getItem(localStorageKey);
      if (storedValue) {
        localStorage.removeItem(localStorageKey);
        return storedValue;
      }
    }
    return "";
  };
  const { debouncedValue, inputValue, handleChange } = useDebounceState({
    delay: 300,
    initialValue: getInitialSearchValue()
  });
  return {
    debouncedValue,
    inputValue,
    handleChange
  };
}

// src/generate-unique-id.ts
function generateUniqueId(prefix = "") {
  const prefixStr = prefix ? `${prefix}-` : "";
  return `${prefixStr}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// src/string-helpers.ts
var capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// src/version.ts
var compareVersions = (a, b) => {
  const aParts = String(a || "0.0.0").split(".").map(Number);
  const bParts = String(b || "0.0.0").split(".").map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal !== bVal) {
      return aVal - bVal;
    }
  }
  return 0;
};
var isVersionLessThan = (a, b) => {
  return compareVersions(a, b) < 0;
};
var isVersionGreaterOrEqual = (a, b) => {
  return compareVersions(a, b) >= 0;
};

// src/is-pro.ts
function hasProInstalled() {
  return window.elementor?.helpers?.hasPro?.() ?? false;
}
function isProActive() {
  if (!hasProInstalled()) {
    return false;
  }
  return window.elementorPro?.config?.isActive ?? false;
}

// src/translations.ts
function createTranslate({ configKey, defaultStrings = {} }) {
  return (key, ...args) => {
    const appConfig = window.elementorAppConfig;
    const remoteStrings = appConfig?.[configKey]?.translations;
    const strings = {
      ...defaultStrings,
      ...remoteStrings
    };
    let template = strings[key];
    if (!template) {
      return key;
    }
    for (let i = 0; i < args.length; i++) {
      template = template.replace(`%${i + 1}$s`, args[i]);
      template = template.replace("%s", args[i]);
    }
    return template;
  };
}
export {
  ElementorError,
  capitalize,
  compareVersions,
  createError,
  createTranslate,
  debounce,
  decodeString,
  encodeString,
  ensureError,
  generateUniqueId,
  hasProInstalled,
  hash,
  hashString,
  isProActive,
  isVersionGreaterOrEqual,
  isVersionLessThan,
  throttle,
  useDebounceState,
  useSearchState
};
//# sourceMappingURL=index.mjs.map