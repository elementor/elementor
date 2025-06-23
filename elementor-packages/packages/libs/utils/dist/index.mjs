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
export {
  ElementorError,
  createError,
  debounce,
  ensureError,
  useDebounceState
};
//# sourceMappingURL=index.mjs.map